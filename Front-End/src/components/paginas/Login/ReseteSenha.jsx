import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetSenha = () => {
  const navigate = useNavigate(); 
    
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  const handleResetSenha = async () => {
    if (!email) {
      setError("Por favor, insira seu email.");
      return;
    }

    try {
      setError("");
      const response = await axios.post("http://localhost:3001/atualiza", {email});
      
      if (response.status === 200) {
        setMostrarFormulario(true);
      } else if (response.status === 404) {
        setError("Email não encontrado. Por favor, verifique o email digitado.");
      }
    } catch (error) {
      setError("Erro ao resetar a senha. Tente novamente mais tarde.");
    }
  };
  
  const validarSenhas = () => {
    if (!novaSenha || !confirmarSenha) {
      setError("Todos os campos são obrigatórios");
      return false;
    }
    
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return false;
    }
    
    return true;
  };

  const handleTrocarSenha = async () => {
    if (!validarSenhas()) {
      return;
    }

    try {
      setError("");
      const response = await axios.patch("http://localhost:3001/atualizasenha", {
        email,
        senha: novaSenha,
      });

      if (response.status === 200) {
        alert("Senha trocada com sucesso!");
        navigate("/"); 
      } else {
        setError("Erro ao trocar a senha.");
      }
    } catch (error) {
      setError("Erro ao trocar a senha. Tente novamente mais tarde.");
    }
  };

  return (
    <div style={styles.container}>
     
    
      <div style={styles.formContainer}>
        <div style={styles.formContent}>
          <h1 style={styles.title}>Redefinir Senha</h1>
          <p style={styles.subtitle}>Insira seu email para redefinir sua senha</p>
          
          {error && <div style={styles.errorMessage}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <input
              type="email"
              style={styles.input}
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#5a20c0'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {!mostrarFormulario && (
            <button style={styles.button} onClick={handleResetSenha}>
              Resetar senha
            </button>
          )}

          {mostrarFormulario && (
            <>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="Nova Senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#5a20c0'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  style={styles.input}
                  placeholder="Confirmar Nova Senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#5a20c0'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              
              <button style={styles.button} onClick={handleTrocarSenha}>
                Trocar Senha
              </button>
            </>
          )}
          
          <div style={styles.backLink}>
            <a href="/" style={styles.link}>
              ← Voltar para o login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    fontFamily: "'Poppins', sans-serif",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
  },
  formContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    padding: "2rem",
  },
  formContent: {
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    color: "#5a20c0",
    fontWeight: "600",
  },
  subtitle: {
    color: "#666",
    marginBottom: "2rem",
    fontSize: "0.95rem",
  },
  inputGroup: {
    marginBottom: "1.5rem",
  },
  input: {
    width: "100%",
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#5a20c0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "1rem",
  },
  backLink: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#666",
    fontSize: "0.9rem",
  },
  link: {
    color: "#5a20c0",
    textDecoration: "none",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    transition: "all 0.3s",
  },
  errorMessage: {
    color: "#fff",
    background: "#6e35d1",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
  "@media (max-width: 768px)": {
    container: {
      flexDirection: "column",
    },
    formContainer: {
      width: "100%",
      padding: "1rem",
    },
    formContent: {
      padding: "10px",
    },
    title: {
      fontSize: "1.8rem",
    },
  },
};

export default ResetSenha;