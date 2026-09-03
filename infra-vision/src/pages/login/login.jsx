import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: chamar sua API de autenticação aqui
    navigate('/home');
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <h1 className="login-brand-name">InfraVision</h1>
        <p className="login-brand-tagline">Inteligência para sua infraestrutura</p>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <label className="login-label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="login-label" htmlFor="senha">
          Senha
        </label>
        <div className="login-input-wrap">
          <input
            id="senha"
            type={mostrarSenha ? 'text' : 'password'}
            className="login-input"
            placeholder="••••••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            className="login-toggle-senha"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="login-row">
          <label className="login-checkbox">
            <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
            Lembrar de mim
          </label>
          <a className="login-forgot" href="#/esqueci-senha">
            Esqueci minha senha
          </a>
        </div>

        <button type="submit" className="btn-primary login-submit">
          Entrar
        </button>
      </form>

      <p className="login-footer">© 2025 InfraVision - Todos os direitos reservados</p>
    </div>
  );
}
