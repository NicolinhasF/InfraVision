import React from 'react';
import { Moon, Sun, Check } from 'lucide-react';
import Navbar from '../../components/navbar';
import { useTheme } from '../../context/ThemeContext';
import './Configuracoes.css';

const OPCOES = [
  {
    id: 'dark',
    nome: 'Tradicional',
    descricao: 'Tema escuro — o padrão do InfraVision.',
    icone: Moon,
    preview: 'config-preview-dark',
  },
  {
    id: 'light',
    nome: 'Claro',
    descricao: 'Fundo claro, ideal para ambientes bem iluminados.',
    icone: Sun,
    preview: 'config-preview-light',
  },
];

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Navbar title="Configurações" searchPlaceholder={null} />

      <div className="page">
        <div className="card">
          <h2 className="card-title">Aparência</h2>
          <p className="config-subtitle">Escolha o tema usado em todo o painel.</p>

          <div className="config-theme-grid">
            {OPCOES.map((opt) => {
              const Icone = opt.icone;
              const selecionado = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={'config-theme-card' + (selecionado ? ' config-theme-card-active' : '')}
                  onClick={() => setTheme(opt.id)}
                >
                  <div className={`config-preview ${opt.preview}`}>
                    <span className="config-preview-sidebar" />
                    <span className="config-preview-content">
                      <span className="config-preview-card" />
                      <span className="config-preview-card" />
                    </span>
                  </div>

                  <div className="config-theme-info">
                    <div className="config-theme-name">
                      <Icone size={16} />
                      {opt.nome}
                    </div>
                    <p className="config-theme-desc">{opt.descricao}</p>
                  </div>

                  {selecionado && (
                    <span className="config-theme-check">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
