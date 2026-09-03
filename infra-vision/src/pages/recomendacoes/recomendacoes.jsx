import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import Navbar from '../../components/navbar';
import './Recomendacoes.css';

const RECOMENDACOES = [
  {
    prioridade: 'ALTA',
    corPrioridade: 'critico',
    icone: AlertTriangle,
    titulo: 'SRV-02 apresenta alta utilização de CPU e RAM.',
    sugestao: 'Redistribuir parte da carga para SRV-04.',
    beneficio: 'R$ 420 /mês',
    impacto: 'Risco de sobrecarga',
    resposta: 'Melhora no tempo de resposta',
  },
  {
    prioridade: 'MÉDIA',
    corPrioridade: 'atencao',
    icone: AlertCircle,
    titulo: 'SRV-07 apresenta utilização média de CPU de 14%.',
    sugestao: 'Reduzir a capacidade do servidor.',
    beneficio: 'R$ 320 /mês',
    impacto: null,
    resposta: null,
  },
  {
    prioridade: 'BAIXA',
    corPrioridade: 'normal',
    icone: CheckCircle2,
    titulo: 'Otimizar políticas de armazenamento em SRV-05.',
    sugestao: null,
    beneficio: 'R$ 180 /mês',
    impacto: null,
    resposta: null,
  },
];

export default function Recomendacoes() {
  return (
    <>
      <Navbar title="Recomendações" searchPlaceholder={null} />

      <div className="page">
        {RECOMENDACOES.map((r) => {
          const Icone = r.icone;
          return (
            <div key={r.titulo} className={`card rec-card rec-card-${r.corPrioridade}`}>
              <div className="rec-header">
                <Icone size={16} className={`icon-${r.corPrioridade}`} />
                <span className={`rec-prioridade rec-prioridade-${r.corPrioridade}`}>
                  Prioridade: {r.prioridade}
                </span>
              </div>

              <p className="rec-titulo">{r.titulo}</p>
              {r.sugestao && (
                <p className="rec-sugestao">
                  <strong>Sugestão:</strong> {r.sugestao}
                </p>
              )}

              {(r.impacto || r.resposta) && (
                <div className="rec-meta">
                  {r.impacto && <span>{r.impacto}</span>}
                  {r.resposta && <span>{r.resposta}</span>}
                </div>
              )}

              <div className="rec-footer">
                <span className="rec-footer-label">Benefício estimado</span>
                <span className="rec-beneficio">
                  <DollarSign size={14} />
                  {r.beneficio}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
