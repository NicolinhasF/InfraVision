import React from 'react';
import './footer.css';

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="footer">
      <span>© {ano} InfraVision - Todos os direitos reservados</span>
    </footer>
  );
}
