import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Network,
  LineChart,
  TrendingUp,
  Lightbulb,
  Wallet,
  Settings,
  User,
  LogOut,
} from 'lucide-react';
import './sidebar.css';

const NAV_ITEMS = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/servidores', label: 'Servidores', icon: Server },
  { to: '/infraestrutura', label: 'Infraestrutura', icon: Network },
  { to: '/analises', label: 'Análises', icon: LineChart },
  { to: '/previsoes', label: 'Previsões', icon: TrendingUp },
  { to: '/recomendacoes', label: 'Recomendações', icon: Lightbulb },
  { to: '/custos', label: 'Custos', icon: Wallet },
];

const BOTTOM_ITEMS = [
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/perfil', label: 'Perfil', icon: User },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-name">InfraVision</span>
        <span className="sidebar-brand-tagline">Inteligência para sua infraestrutura</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link-active' : '')}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link-active' : '')}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button type="button" className="sidebar-link sidebar-logout" onClick={onLogout}>
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
