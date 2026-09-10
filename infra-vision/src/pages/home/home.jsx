import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import Navbar from '../../components/navbar';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { useFetch } from '../../hooks/useFetch';
import { dashboardService } from '../../services/dashboardService';
import './Home.css';

export default function Home() {
  const resumo = useFetch(() => dashboardService.getResumo(), []);
  const utilizacao = useFetch(() => dashboardService.getUtilizacao('24h'), []);
  const statusServidores = useFetch(() => dashboardService.getStatusServidores(), []);
  const alertas = useFetch(() => dashboardService.getAlertas(), []);
  const economia = useFetch(() => dashboardService.getEconomiaPotencial(), []);
  const previsao = useFetch(() => dashboardService.getPrevisaoImportante(), []);

  const statusTotal =
    statusServidores.data?.total ??
    (statusServidores.data
      ? statusServidores.data.normal + statusServidores.data.atencao + statusServidores.data.critico
      : 0);

  const segmentos = statusServidores.data
    ? [
        { chave: 'normal', rotulo: 'operando normal', valor: statusServidores.data.normal },
        { chave: 'atencao', rotulo: 'em atenção', valor: statusServidores.data.atencao },
        { chave: 'critico', rotulo: 'em estado crítico', valor: statusServidores.data.critico },
      ]
    : [];

  return (
    <>
      <Navbar title="Dashboard" />

      <div className="page home">
        {/* Faixa de status — sem cards, sem ícones em caixinha, números em mono */}
        {resumo.loading && <LoadingState label="Carregando resumo..." />}
        {resumo.error && <ErrorState error={resumo.error} onRetry={resumo.refetch} />}
        {resumo.data && (
          <section className="home-strip">
            <div className="home-metric">
              <span className="home-metric-value">{resumo.data.servidores}</span>
              <span className="home-metric-label">servidores sob monitoramento</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-value">
                {resumo.data.cpuMedia}
                <small>%</small>
              </span>
              <span className="home-metric-label">cpu média da frota</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-value">
                {resumo.data.ramMedia}
                <small>%</small>
              </span>
              <span className="home-metric-label">ram média da frota</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-value home-metric-money">
                R$ {resumo.data.custoMensal}
              </span>
              <span className="home-metric-label">custo do mês corrente</span>
            </div>
            <div className="home-live">
              <span className="home-live-dot" />
              atualizado agora
            </div>
          </section>
        )}

        {/* Gráfico de utilização + saúde da frota */}
        <section className="home-main-grid">
          <div className="home-panel home-panel-chart">
            <div className="home-panel-head">
              <h2>Utilização nas últimas 24 horas</h2>

              {utilizacao.data && (
                <div className="home-readout">
                  <span className="home-readout-item home-readout-cpu">
                    cpu <strong>{utilizacao.data[utilizacao.data.length - 1]?.cpu}%</strong>
                  </span>
                  <span className="home-readout-item home-readout-ram">
                    ram <strong>{utilizacao.data[utilizacao.data.length - 1]?.ram}%</strong>
                  </span>
                </div>
              )}
            </div>

            {utilizacao.loading && <LoadingState />}
            {utilizacao.error && <ErrorState error={utilizacao.error} onRetry={utilizacao.refetch} />}
            {utilizacao.data && (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={utilizacao.data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="preenchimentoCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-cpu)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--chart-cpu)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="preenchimentoRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-ram)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--chart-ram)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-color-soft)" vertical={false} strokeDasharray="2 4" />
                  <XAxis
                    dataKey="hora"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    width={34}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="var(--chart-cpu)"
                    strokeWidth={1.75}
                    fill="url(#preenchimentoCpu)"
                    dot={false}
                    activeDot={{ r: 3.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    stroke="var(--chart-ram)"
                    strokeWidth={1.75}
                    fill="url(#preenchimentoRam)"
                    dot={false}
                    activeDot={{ r: 3.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="home-panel home-panel-health">
            <div className="home-panel-head">
              <h2>Saúde da frota</h2>
            </div>

            {statusServidores.loading && <LoadingState />}
            {statusServidores.error && (
              <ErrorState error={statusServidores.error} onRetry={statusServidores.refetch} />
            )}
            {statusServidores.data && (
              <>
                <div className="home-health-total">
                  <span>{statusTotal}</span>
                  <p>servidores no total</p>
                </div>

                <div className="home-health-bar" role="img" aria-label="Distribuição de status da frota">
                  {segmentos.map((s) => (
                    <span
                      key={s.chave}
                      className={`home-health-segmento home-health-${s.chave}`}
                      style={{ flexGrow: s.valor || 0.0001 }}
                    />
                  ))}
                </div>

                <ul className="home-health-legend">
                  {segmentos.map((s) => (
                    <li key={s.chave}>
                      <span className={`home-health-dot home-health-${s.chave}`} />
                      {s.valor} {s.rotulo}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Alertas em formato de log + economia + previsão */}
        <section className="home-lower-grid">
          <div className="home-panel home-panel-log">
            <div className="home-panel-head">
              <h2>Alertas recentes</h2>
            </div>

            {alertas.loading && <LoadingState />}
            {alertas.error && <ErrorState error={alertas.error} onRetry={alertas.refetch} />}
            {alertas.data && (
              <>
                <ul className="home-log">
                  {alertas.data.map((a) => (
                    <li key={a.servidor + a.descricao}>
                      <span className="home-log-time">{a.data}</span>
                      <span className={`home-log-dot home-log-dot-${a.nivel}`} />
                      <span className="home-log-text">
                        <strong>{a.servidor}</strong> {a.descricao}
                      </span>
                    </li>
                  ))}
                  {alertas.data.length === 0 && (
                    <li className="home-log-vazio">Nenhum alerta nas últimas 24 horas.</li>
                  )}
                </ul>
                {alertas.data.length > 0 && (
                  <a className="home-panel-link" href="#/servidores">
                    Ver todos os servidores
                  </a>
                )}
              </>
            )}
          </div>

          <div className="home-side-col">
            <div className="home-panel home-panel-economia">
              {economia.loading && <LoadingState />}
              {economia.error && <ErrorState error={economia.error} onRetry={economia.refetch} />}
              {economia.data && (
                <>
                  <p className="home-economia-label">Economia possível este mês</p>
                  <p className="home-economia-valor">R$ {economia.data.valor}</p>
                  <p className="home-economia-nota">
                    Aplicando as otimizações recomendadas para os servidores acima da capacidade ideal.
                  </p>
                </>
              )}
            </div>

            <div className="home-panel home-panel-previsao">
              {previsao.loading && <LoadingState />}
              {previsao.error && <ErrorState error={previsao.error} onRetry={previsao.refetch} />}
              {previsao.data && (
                <>
                  <div className="home-previsao-head">
                    <ArrowUpRight size={14} className="icon-critico" />
                    <span>previsão de saturação</span>
                  </div>
                  <p className="home-previsao-texto">
                    <strong>{previsao.data.servidor}</strong> deve atingir o limite de disco em{' '}
                    <strong>{previsao.data.tempoEstimado}</strong>.
                  </p>
                  <p className="home-previsao-prob">{previsao.data.probabilidade}% de probabilidade</p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}