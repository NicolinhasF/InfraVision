import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import Navbar from '../../components/navbar';
import StatCard from '../../components/statCard';
import './Custos.css';

const CUSTO_POR_SERVIDOR = [
  { nome: 'SRV-02', valor: 580 },
  { nome: 'SRV-04', valor: 470 },
  { nome: 'SRV-01', valor: 350 },
  { nome: 'SRV-03', valor: 240 },
  { nome: 'Outros', valor: 6780 },
];

const DISTRIBUICAO = [
  { name: 'Compute', value: 62, color: 'var(--accent-blue)' },
  { name: 'Armazenamento', value: 21, color: 'var(--status-roxo)' },
  { name: 'Rede', value: 17, color: 'var(--status-atencao)' },
];

export default function Custos() {
  return (
    <>
      <Navbar title="Custos" searchPlaceholder={null} />

      <div className="page">
        <div className="stats-row">
          <StatCard
            label="Custo atual"
            value="R$ 8.420 /mês"
            icon={<Wallet size={18} />}
            iconBg="var(--accent-blue-soft)"
            iconColor="var(--accent-blue)"
          />
          <StatCard
            label="Custo estimado"
            value="R$ 9.150 /mês"
            sublabel="+5.2% vs. mês anterior"
            icon={<TrendingUp size={18} />}
            iconBg="var(--status-atencao-soft)"
            iconColor="var(--status-atencao)"
          />
          <StatCard
            label="Economia potencial"
            value="R$ 1.280 /mês"
            sublabel="Com otimizações"
            icon={<PiggyBank size={18} />}
            iconBg="var(--status-normal-soft)"
            iconColor="var(--status-normal)"
          />
        </div>

        <div className="row-2col">
          <div className="card">
            <h2 className="card-title">Custo por servidor</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={CUSTO_POR_SERVIDOR}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
              >
                <CartesianGrid stroke="var(--border-color-soft)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [`R$ ${v}`, 'Custo']}
                />
                <Bar dataKey="valor" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">Distribuição de custos</h2>
            <div className="custos-donut-wrap">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={DISTRIBUICAO}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={68}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {DISTRIBUICAO.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <ul className="custos-legend-list">
                {DISTRIBUICAO.map((d) => (
                  <li key={d.name}>
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="custos-legend-name">{d.name}</span>
                    <span className="custos-legend-value">{d.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
