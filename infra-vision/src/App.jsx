import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Footer from './components/footer';
import Home from './pages/home/Home';
import Servidores from './pages/servidores/Servidores';
import Infraestrutura from './pages/infraestrutura/Infraestrutura';
import Analises from './pages/analises/Analises';
import Previsoes from './pages/previsoes/Previsoes';
import Recomendacoes from './pages/recomendacoes/Recomendacoes';
import Custos from './pages/custos/Custos';
import Configuracoes from './pages/configuracoes/Configuracoes';
import Login from './pages/login/Login';
import NotFound from './pages/404/NotFound';
import './App.css';

function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={handleLogout} />

      <div className="app-layout-content">
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Páginas internas */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/servidores" element={<Servidores />} />
          <Route path="/infraestrutura" element={<Infraestrutura />} />
          <Route path="/analises" element={<Analises />} />
          <Route path="/previsoes" element={<Previsoes />} />
          <Route path="/recomendacoes" element={<Recomendacoes />} />
          <Route path="/custos" element={<Custos />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* Qualquer rota inexistente */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}