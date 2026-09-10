// NotFound.jsx
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <h2>Página não encontrada</h2>
      <p>O endereço acessado não existe ou foi removido.</p>

      <Link to="/login" className="home-link">
        Voltar para o início
      </Link>
    </main>
  );
}
