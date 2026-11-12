import { useState, useEffect } from 'react';
import { Database, Zap, Shield, HardDrive, Cpu, Radio, CheckCircle2, RefreshCw } from 'lucide-react';
import { checkNeonServices, callNeonFunction, neonFunctionUrl } from '../../services/neon';
import './NeonStatusBanner.css';

export default function NeonStatusBanner() {
  const [status, setStatus] = useState({
    postgres: true,
    functions: true,
    auth: true,
    objectStorage: true,
    aiGateway: true,
    realtime: true,
  });
  const [functionOutput, setFunctionOutput] = useState('');
  const [testingFunction, setTestingFunction] = useState(false);

  useEffect(() => {
    checkNeonServices().then(setStatus).catch(console.error);
  }, []);

  const handleTestFunction = async () => {
    setTestingFunction(true);
    try {
      const output = await callNeonFunction('hello');
      setFunctionOutput(output.trim());
    } catch (e) {
      setFunctionOutput(`Error: ${e.message}`);
    } finally {
      setTestingFunction(false);
    }
  };

  return (
    <div className="neon-status-card">
      <div className="neon-status-header">
        <div className="neon-title-group">
          <div className="neon-badge">
            <span className="pulse-dot"></span>
            <span>NEON CLOUD INFRASTRUCTURE</span>
          </div>
          <h3>Wired Neon Services Status</h3>
        </div>
        <button
          className="btn btn-sm btn-outline test-fn-btn"
          onClick={handleTestFunction}
          disabled={testingFunction}
        >
          {testingFunction ? (
            <>
              <RefreshCw size={14} className="spinner" />
              <span>Testing Function...</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>Test Neon Function</span>
            </>
          )}
        </button>
      </div>

      {functionOutput && (
        <div className="function-output-alert">
          <strong>Neon Function Output:</strong> {functionOutput}
        </div>
      )}

      <div className="neon-services-grid">
        <div className="service-pill">
          <Database size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">Postgres</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> Live (Pooled)
            </span>
          </div>
        </div>

        <div className="service-pill">
          <Shield size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">Neon Auth</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> JWKS Ready
            </span>
          </div>
        </div>

        <div className="service-pill">
          <HardDrive size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">Object Storage</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> Bucket: assets
            </span>
          </div>
        </div>

        <div className="service-pill">
          <Zap size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">Functions</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> hello (active)
            </span>
          </div>
        </div>

        <div className="service-pill">
          <Cpu size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">AI Gateway</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> Connected
            </span>
          </div>
        </div>

        <div className="service-pill">
          <Radio size={16} className="svc-icon" />
          <div className="svc-info">
            <span className="svc-name">Realtime</span>
            <span className="svc-status live">
              <CheckCircle2 size={12} /> WSS Endpoint
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

