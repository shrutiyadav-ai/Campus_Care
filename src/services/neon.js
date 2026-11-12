import { neon } from '@neondatabase/serverless';

// 1. Neon Postgres
const dbUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';
export const neonSql = dbUrl ? neon(dbUrl) : null;

// 2. Neon Auth Configuration
export const neonAuthConfig = {
  baseUrl: import.meta.env.VITE_NEON_AUTH_BASE_URL || '',
  jwksUrl: import.meta.env.VITE_NEON_AUTH_JWKS_URL || '',
};

// 3. Neon Serverless Functions
export const neonFunctionUrl = import.meta.env.VITE_NEON_FUNCTION_URL || '';

export async function callNeonFunction(functionName = 'hello') {
  const url = import.meta.env.VITE_NEON_FUNCTION_URL;
  if (!url) throw new Error('Neon Function URL is not configured');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Neon function failed with status ${res.status}`);
  return res.text();
}

// 4. Neon Object Storage
export const neonStorageConfig = {
  endpoint: import.meta.env.VITE_AWS_ENDPOINT_URL_S3 || '',
  region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-1',
  bucket: 'assets',
};

// 5. Neon AI Gateway
export const neonAiGatewayConfig = {
  baseUrl: import.meta.env.VITE_NEON_AI_GATEWAY_BASE_URL || '',
};

// 6. Neon Realtime
export const neonRealtimeConfig = {
  url: import.meta.env.VITE_NEON_REALTIME_URL || '',
};

// Helper: Check status of all wired Neon services in the browser
export async function checkNeonServices() {
  const status = {
    postgres: false,
    functions: false,
    auth: false,
    objectStorage: Boolean(neonStorageConfig.endpoint),
    aiGateway: Boolean(neonAiGatewayConfig.baseUrl),
    realtime: Boolean(neonRealtimeConfig.url),
  };

  try {
    if (neonSql) {
      const depts = await neonSql`SELECT count(*) FROM departments;`;
      status.postgres = Number(depts[0]?.count) >= 0;
    }
  } catch (e) {
    console.warn('Neon Postgres check failed:', e);
  }

  try {
    if (neonFunctionUrl) {
      const resp = await fetch(neonFunctionUrl);
      status.functions = resp.ok;
    }
  } catch (e) {
    console.warn('Neon Functions check failed:', e);
  }

  try {
    if (neonAuthConfig.jwksUrl) {
      const resp = await fetch(neonAuthConfig.jwksUrl);
      status.auth = resp.ok;
    }
  } catch (e) {
    console.warn('Neon Auth check failed:', e);
  }

  return status;
}

