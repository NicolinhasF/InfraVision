import React from 'react';
import { Search, Bell } from 'lucide-react';
import './navbar.css';

export default function Navbar({ title, searchPlaceholder = 'Buscar...', onSearchChange, rightSlot }) {
  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-actions">
        {searchPlaceholder && (
          <div className="navbar-search">
            <Search size={16} strokeWidth={1.8} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
        )}

        {rightSlot}

        <button type="button" className="navbar-icon-btn" aria-label="Notificações">
          <Bell size={18} strokeWidth={1.8} />
        </button>

        <div className="navbar-user">
          <div className="navbar-avatar">A</div>
          <span className="navbar-user-name">Administrador</span>
        </div>
      </div>
    </header>
  );
}
