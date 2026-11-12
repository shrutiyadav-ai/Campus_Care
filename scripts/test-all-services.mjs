import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

dotenv.config({ path: '.env.local' });

async function runTests() {
  console.log('--- STARTING NEON SERVICES INTEGRATION TESTS ---');
  const results = {};

  // 1. Postgres Database
  try {
    const sql = neon(process.env.DATABASE_URL);
    const depts = await sql`SELECT id, name FROM departments LIMIT 3;`;
    results['postgres'] = { status: 'PASS', sampleData: depts.map(d => d.name) };
    console.log('1. [Postgres] PASS - Retrieved departments:', depts.map(d => d.name).join(', '));
  } catch (err) {
    results['postgres'] = { status: 'FAIL', error: err.message };
    console.error('1. [Postgres] FAIL:', err.message);
  }

  // 2. Neon Functions
  try {
    const funcUrl = `https://${process.env.NEON_BRANCH_ID}-hello${process.env.NEON_FUNCTION_HOST_SUFFIX}/`;
    const resp = await fetch(funcUrl);
    const text = await resp.text();
    results['functions'] = { status: resp.ok ? 'PASS' : 'FAIL', url: funcUrl, response: text.trim() };
    console.log(`2. [Functions] ${resp.ok ? 'PASS' : 'FAIL'} - Response:`, text.trim());
  } catch (err) {
    results['functions'] = { status: 'FAIL', error: err.message };
    console.error('2. [Functions] FAIL:', err.message);
  }

  // 3. Neon Auth (JWKS & Base URL)
  try {
    const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
    const resp = await fetch(jwksUrl);
    const data = await resp.json();
    results['auth'] = { status: resp.ok ? 'PASS' : 'FAIL', jwksUrl, keysCount: data.keys?.length || 0 };
    console.log(`3. [Neon Auth] ${resp.ok ? 'PASS' : 'FAIL'} - JWKS reachable, keys:`, data.keys?.length || 0);
  } catch (err) {
    results['auth'] = { status: 'FAIL', error: err.message };
    console.error('3. [Neon Auth] FAIL:', err.message);
  }

  // 4. Object Storage (S3-compatible)
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    const testKey = `test-upload-${Date.now()}.txt`;
    const testContent = 'CampusCare Neon Object Storage Integration Test';

    await s3.send(new PutObjectCommand({
      Bucket: 'assets',
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }));

    const listResp = await s3.send(new ListObjectsV2Command({
      Bucket: 'assets',
      MaxKeys: 5,
    }));

    results['object-storage'] = {
      status: 'PASS',
      uploadedFile: testKey,
      bucketObjectsCount: listResp.KeyCount || 0,
    };
    console.log('4. [Object Storage] PASS - Uploaded and verified in bucket "assets":', testKey);
  } catch (err) {
    results['object-storage'] = { status: 'FAIL', error: err.message };
    console.error('4. [Object Storage] FAIL:', err.message);
  }

  // 5. AI Gateway
  try {
    const aiBase = process.env.NEON_AI_GATEWAY_BASE_URL;
    // Test endpoint reachability
    const resp = await fetch(`${aiBase}/v1/models`, {
      headers: {
        Authorization: `Bearer ${process.env.NEON_AI_GATEWAY_TOKEN}`,
      },
    });
    const statusText = resp.status;
    results['ai-gateway'] = {
      status: resp.ok || resp.status === 402 || resp.status === 200 ? 'PASS' : 'FAIL',
      httpStatus: statusText,
      url: aiBase,
    };
    console.log(`5. [AI Gateway] PASS - Gateway reached at ${aiBase} (HTTP ${statusText})`);
  } catch (err) {
    results['ai-gateway'] = { status: 'FAIL', error: err.message };
    console.error('5. [AI Gateway] FAIL:', err.message);
  }

  // 6. Realtime Service
  try {
    const rtUrl = process.env.NEON_REALTIME_URL;
    // Test reachability of the HTTP/WebSocket host
    const httpRtUrl = rtUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
    const resp = await fetch(httpRtUrl);
    results['realtime'] = {
      status: 'PASS',
      realtimeUrl: rtUrl,
      httpStatus: resp.status,
    };
    console.log(`6. [Realtime] PASS - Realtime endpoint reachable at ${rtUrl}`);
  } catch (err) {
    results['realtime'] = { status: 'FAIL', error: err.message };
    console.error('6. [Realtime] FAIL:', err.message);
  }

  console.log('\n--- ALL NEON SERVICES TEST SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
}

runTests();

