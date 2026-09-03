import React, { useMemo, useState } from 'react';
import { Plus, Eye, MoreVertical } from 'lucide-react';
import Navbar from '../../components/navbar';
import MiniProgress from '../../components/miniProgress';
import StatusBadge from '../../components/statusBadge';
import './Servidores.css';

// ---- dados de exemplo — troque pela sua API ----
const SERVIDORES = [
  { id: 'SRV-01', ip: '192.168.1.10', cpu: 42, ram: 58, disco: 61, status: 'Normal' },
  { id: 'SRV-02', ip: '192.168.1.11', cpu: 91, ram: 87, disco: 74, status: 'Crítico' },
  { id: 'SRV-03', ip: '192.168.1.12', cpu: 18, ram: 25, disco: 40, status: 'Normal' },
  { id: 'SRV-04', ip: '192.168.1.13', cpu: 67, ram: 71, disco: 82, status: 'Atenção' },
  { id: 'SRV-05', ip: '192.168.1.14', cpu: 32, ram: 44, disco: 55, status: 'Normal' },
  { id: 'SRV-06', ip: '192.168.1.15', cpu: 89, ram: 91, disco: 93, status: 'Crítico' },
  { id: 'SRV-07', ip: '192.168.1.16', cpu: 14, ram: 18, disco: 30, status: 'Normal' },
  { id: 'SRV-08', ip: '192.168.1.17', cpu: 55, ram: 62, disco: 66, status: 'Atenção' },
];

const STATUS_OPTIONS = ['Todos os status', 'Normal', 'Atenção', 'Crítico'];

export default function Servidores() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('Todos os status');
  const [pagina, setPagina] = useState(1);

  const servidoresFiltrados = useMemo(() => {
    return SERVIDORES.filter((s) => {
      const combinaBusca =
        s.id.toLowerCase().includes(busca.toLowerCase()) || s.ip.includes(busca);
      const combinaStatus = statusFiltro === 'Todos os status' || s.status === statusFiltro;
      return combinaBusca && combinaStatus;
    });
  }, [busca, statusFiltro]);

  return (
    <>
      <Navbar
        title="Servidores"
        searchPlaceholder="Buscar servidor..."
        onSearchChange={setBusca}
        rightSlot={
          <>
            <select
              className="filter-select"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button type="button" className="btn-primary">
              <Plus size={16} />
              Adicionar servidor
            </button>
          </>
        }
      />

      <div className="page">
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>IP</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Disco</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servidoresFiltrados.map((s) => (
                <tr key={s.id}>
                  <td className="cell-nome">{s.id}</td>
                  <td className="cell-muted">{s.ip}</td>
                  <td>
                    <MiniProgress value={s.cpu} />
                  </td>
                  <td>
                    <MiniProgress value={s.ram} />
                  </td>
                  <td>
                    <MiniProgress value={s.disco} />
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" aria-label="Ver detalhes">
                        <Eye size={16} />
                      </button>
                      <button type="button" aria-label="Mais opções">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {servidoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="cell-empty">
                    Nenhum servidor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button type="button" onClick={() => setPagina((p) => Math.max(1, p - 1))}>
              ‹
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={pagina === n ? 'active' : ''}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" onClick={() => setPagina((p) => Math.min(3, p + 1))}>
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
