import React, { useState } from 'react';
import { Cloud, Server, Database, HardDriveDownload, Plus, Minus } from 'lucide-react';
import Navbar from '../../components/navbar';
import './Infraestrutura.css';

const APPS = ['APP-01', 'APP-02', 'APP-03'];

export default function Infraestrutura() {
  const [zoom, setZoom] = useState(1);

  return (
    <>
      <Navbar title="Infraestrutura" searchPlaceholder={null} />

      <div className="page">
        <div className="card infra-card">
          <div className="page-header">
            <h2>Visão geral</h2>
            <span className="infra-subtitle">Mapa de dependências</span>
          </div>

          <div className="infra-map-wrap">
            <div className="infra-map" style={{ transform: `scale(${zoom})` }}>
              <div className="infra-node infra-node-cloud">
                <Cloud size={18} />
                <span>CLOUD</span>
              </div>

              <div className="infra-connector infra-connector-top" />

              <div className="infra-apps-row">
                {APPS.map((app) => (
                  <div key={app} className="infra-node infra-node-app">
                    <Server size={16} />
                    <span>{app}</span>
                  </div>
                ))}
              </div>

              <div className="infra-connector infra-connector-mid" />

              <div className="infra-node infra-node-db">
                <Database size={18} />
                <span>DATABASE</span>
              </div>

              <div className="infra-connector infra-connector-bottom" />

              <div className="infra-node infra-node-backup">
                <HardDriveDownload size={18} />
                <span>BACKUP</span>
              </div>
            </div>

            <div className="infra-zoom-controls">
              <button type="button" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
                <Plus size={14} />
              </button>
              <button type="button" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
                <Minus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
