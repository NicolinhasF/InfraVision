import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./paginas/Dashboard/Dashboard.css";
import "./paginas/Perfil/Perfil.css";

function MainPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [foto, setFoto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: "",
    email: "",
    cargo: "",
  });
  const [senhas, setSenhas] = useState({
    senhaAtual: "",
    novaSenha: "",
  });
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const inputFotoRef = useRef(null);

  useEffect(() => {
    const usuarioId = sessionStorage.getItem("usuarioId");

    if (!usuarioId) {
      setErro("Não foi possível identificar o usuário. Faça login novamente.");
      setCarregando(false);
      return;
    }

    let ativo = true;

    const carregarPerfil = async () => {
      try {
        const [respostaPerfil, fotoSalva] = await Promise.all([
          axios.get(`http://localhost:3001/perfil/${usuarioId}`),
          Promise.resolve(
            localStorage.getItem(`infravision:foto-perfil:${usuarioId}`),
          ),
        ]);

        if (!ativo) return;

        setUsuario(respostaPerfil.data);
        setDadosEdicao({
          nome: respostaPerfil.data.nome,
          email: respostaPerfil.data.email,
          cargo: respostaPerfil.data.cargo,
        });
        setFoto(fotoSalva || "");
      } catch (error) {
        if (!ativo) return;

        setErro(
          error.response?.data?.msg ||
            "Não foi possível carregar os dados do perfil. Tente novamente.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  const tratarSelecaoFoto = (evento) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";

    if (!arquivo) return;

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    const tamanhoMaximo = 2 * 1024 * 1024;

    if (!tiposPermitidos.includes(arquivo.type)) {
      setErro("Escolha uma imagem no formato JPG, PNG ou WebP.");
      return;
    }

    if (arquivo.size > tamanhoMaximo) {
      setErro("A imagem deve ter no máximo 2 MB.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      const usuarioId = sessionStorage.getItem("usuarioId");

      if (typeof leitor.result !== "string" || !usuarioId) {
        setErro("Não foi possível carregar a imagem selecionada.");
        return;
      }

      try {
        localStorage.setItem(
          `infravision:foto-perfil:${usuarioId}`,
          leitor.result,
        );
        setFoto(leitor.result);
        setErro("");
      } catch {
        setErro("Não foi possível salvar a foto neste navegador.");
      }
    };

    leitor.onerror = () => {
      setErro("Ocorreu um erro ao ler a imagem. Tente outra foto.");
    };

    leitor.readAsDataURL(arquivo);
  };

  const tratarAlteracaoPerfil = (evento) => {
    const { name, value } = evento.target;
    setDadosEdicao((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));
  };

  const salvarPerfil = async (evento) => {
    evento.preventDefault();
    const usuarioId = sessionStorage.getItem("usuarioId");

    if (!usuarioId) {
      setErro("Não foi possível identificar o usuário. Faça login novamente.");
      return;
    }

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      await axios.put(`http://localhost:3001/perfil/${usuarioId}`, dadosEdicao);
      setUsuario((perfilAtual) => ({ ...perfilAtual, ...dadosEdicao }));
      setEditandoPerfil(false);
      setSucesso("Perfil atualizado com sucesso.");
    } catch (error) {
      setErro(
        error.response?.data?.msg ||
          "Não foi possível atualizar o perfil. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const salvarNovaSenha = async (evento) => {
    evento.preventDefault();
    const usuarioId = sessionStorage.getItem("usuarioId");

    if (!usuarioId) {
      setErro("Não foi possível identificar o usuário. Faça login novamente.");
      return;
    }

    if (!senhas.senhaAtual || senhas.novaSenha.length < 6) {
      setErro(
        "Informe a senha atual e uma nova senha com pelo menos 6 caracteres.",
      );
      return;
    }

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const resposta = await axios.put(
        `http://localhost:3001/perfil/${usuarioId}/senha`,
        senhas,
      );
      setAlterandoSenha(false);
      setSenhas({ senhaAtual: "", novaSenha: "" });
      setSucesso(resposta.data.msg || "Senha atualizada com sucesso.");
    } catch (error) {
      setErro(
        error.response?.data?.msg ||
          "Não foi possível atualizar a senha. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const iniciais = usuario?.nome?.trim().slice(0, 2).toUpperCase() || "US";
  const camposPerfil = usuario
    ? [
        { label: "Nome", valor: usuario.nome },
        { label: "Email", valor: usuario.email },
        { label: "Cargo", valor: usuario.cargo },
      ]
    : [];

  const renderizarAvatar = (classe, descricao) => (
    <div className={classe} role="img" aria-label={descricao}>
      {foto ? <img className="perfil-foto" src={foto} alt="" /> : iniciais}
    </div>
  );

  return (
    <section className="main-dashboard perfil-pagina">
      {/* Cabeçalho da página */}
      <header className="dashboard-header perfil-header">
        <div>
          <h1>Meu perfil</h1>
          <p>Informações da conta e segurança</p>
        </div>

        <div className="dashboard-user">
          <span className="notification-dot" aria-hidden="true"></span>
          {renderizarAvatar(
            "user-avatar perfil-avatar-mini",
            `Foto ou iniciais de ${usuario?.nome || "usuário"}`,
          )}
        </div>
      </header>

      {/* Informações do perfil */}
      {carregando ? (
        <div className="perfil-mensagem" role="status">
          Carregando perfil...
        </div>
      ) : erro && !usuario ? (
        <div className="perfil-mensagem perfil-mensagem-erro" role="alert">
          {erro}
        </div>
      ) : (
        <article className="perfil-card">
          <div className="perfil-identidade">
            {renderizarAvatar(
              "perfil-avatar",
              `Foto ou iniciais de ${usuario.nome}`,
            )}
            <div className="perfil-identidade-texto">
              <h2>{usuario.nome}</h2>
              <p>{usuario.cargo}</p>
              <input
                ref={inputFotoRef}
                className="perfil-input-foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={tratarSelecaoFoto}
                aria-label="Escolher foto de perfil"
              />
              <button
                className="perfil-foto-botao"
                type="button"
                onClick={() => inputFotoRef.current?.click()}
              >
                {foto ? "Alterar foto" : "Adicionar foto"}
              </button>
            </div>
          </div>

          {erro && (
            <div className="perfil-mensagem perfil-mensagem-erro" role="alert">
              {erro}
            </div>
          )}
          {sucesso && (
            <div
              className="perfil-mensagem perfil-mensagem-sucesso"
              role="status"
            >
              {sucesso}
            </div>
          )}

          <div className="perfil-divisor" aria-hidden="true"></div>

          <dl className="perfil-campos">
            {camposPerfil.map((campo) => (
              <div className="perfil-campo" key={campo.label}>
                <dt>{campo.label}</dt>
                <dd>{campo.valor}</dd>
              </div>
            ))}
          </dl>

          {/* Ações do perfil */}
          <div className="perfil-acoes">
            <button
              className="perfil-botao perfil-botao-primario"
              type="button"
              onClick={() => {
                setDadosEdicao({
                  nome: usuario.nome,
                  email: usuario.email,
                  cargo: usuario.cargo,
                });
                setEditandoPerfil(!editandoPerfil);
                setAlterandoSenha(false);
                setErro("");
                setSucesso("");
              }}
            >
              Editar perfil
            </button>
            <button
              className="perfil-botao perfil-botao-secundario"
              type="button"
              onClick={() => {
                setAlterandoSenha(!alterandoSenha);
                setEditandoPerfil(false);
                setErro("");
                setSucesso("");
              }}
            >
              Alterar senha
            </button>
          </div>

          {editandoPerfil && (
            <form className="perfil-formulario" onSubmit={salvarPerfil}>
              <h3>Editar informações</h3>
              <label>
                Nome
                <input
                  name="nome"
                  value={dadosEdicao.nome}
                  onChange={tratarAlteracaoPerfil}
                  required
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={dadosEdicao.email}
                  onChange={tratarAlteracaoPerfil}
                  required
                />
              </label>
              <label>
                Cargo
                <input
                  name="cargo"
                  value={dadosEdicao.cargo}
                  onChange={tratarAlteracaoPerfil}
                  required
                />
              </label>
              <div className="perfil-formulario-acoes">
                <button
                  className="perfil-botao perfil-botao-primario"
                  type="submit"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  className="perfil-botao perfil-botao-secundario"
                  type="button"
                  onClick={() => setEditandoPerfil(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {alterandoSenha && (
            <form className="perfil-formulario" onSubmit={salvarNovaSenha}>
              <h3>Alterar senha</h3>
              <label>
                Senha atual
                <span className="perfil-campo-senha">
                  <input
                    type={mostrarSenhaAtual ? "text" : "password"}
                    autoComplete="current-password"
                    value={senhas.senhaAtual}
                    onChange={(evento) =>
                      setSenhas((atuais) => ({
                        ...atuais,
                        senhaAtual: evento.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    className="perfil-senha-visualizar"
                    type="button"
                    onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                    aria-label={
                      mostrarSenhaAtual
                        ? "Ocultar senha atual"
                        : "Mostrar senha atual"
                    }
                    aria-pressed={mostrarSenhaAtual}
                  >
                    {mostrarSenhaAtual ? "Ocultar" : "Mostrar"}
                  </button>
                </span>
              </label>
              <label>
                Nova senha
                <span className="perfil-campo-senha">
                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={6}
                    value={senhas.novaSenha}
                    onChange={(evento) =>
                      setSenhas((atuais) => ({
                        ...atuais,
                        novaSenha: evento.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    className="perfil-senha-visualizar"
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    aria-label={
                      mostrarNovaSenha
                        ? "Ocultar nova senha"
                        : "Mostrar nova senha"
                    }
                    aria-pressed={mostrarNovaSenha}
                  >
                    {mostrarNovaSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </span>
              </label>
              <div className="perfil-formulario-acoes">
                <button
                  className="perfil-botao perfil-botao-primario"
                  type="submit"
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Atualizar senha"}
                </button>
                <button
                  className="perfil-botao perfil-botao-secundario"
                  type="button"
                  onClick={() => setAlterandoSenha(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </article>
      )}
    </section>
  );
}

export default MainPerfil;
