document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://taskflow-api-j3lv.onrender.com";

  const listaTarefas = document.getElementById("lista-tarefas");

  const listaProjetos = document.getElementById("lista-projetos");

  const formTarefa = document.getElementById("form-tarefa");

  const formProjeto = document.getElementById("form-projeto");

  const titulo = document.getElementById("titulo");

  const descricao = document.getElementById("descricao");

  const prioridade = document.getElementById("prioridade");

  const projeto = document.getElementById("projeto");

  const nomeProjeto = document.getElementById("nome-projeto");

  const descricaoProjeto = document.getElementById("descricao-projeto");

  const busca = document.getElementById("busca");

  const filtroProjeto = document.getElementById("filtro-projeto");

  const btnTodosProjetos = document.getElementById("btn-todos-projetos");

  const btnSalvarTarefa = document.getElementById("btn-salvar-tarefa");

  const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

  const tituloFormTarefa = document.getElementById("titulo-form-tarefa");

  const btnCriarProjeto = document.getElementById("btn-criar-projeto");

  const btnAnterior = document.getElementById("btn-anterior");

  const btnProxima = document.getElementById("btn-proxima");

  const paginaAtualElemento = document.getElementById("pagina-atual");

  const paginacao = document.getElementById("paginacao");

  const totalTarefas = document.getElementById("total-tarefas");

  const mensagens = document.getElementById("mensagens");

  const modalConfirmacao = document.getElementById("modal-confirmacao");

  const confirmacaoTitulo = document.getElementById("confirmacao-titulo");

  const confirmacaoTexto = document.getElementById("confirmacao-texto");

  const btnCancelarConfirmacao = document.getElementById(
    "btn-cancelar-confirmacao",
  );

  const btnConfirmar = document.getElementById("btn-confirmar");

  let tarefas = [];
  let projetos = [];

  let tarefaEditando = null;
  let projetoAtivo = null;

  let paginaAtual = 1;
  let totalPaginas = 1;

  const limite = 10;

  let resolverConfirmacao = null;
  let toastStatus = null;

  async function api(caminho, opcoes = {}) {
    try {
      const resposta = await fetch(`${API_URL}${caminho}`, opcoes);

      const texto = await resposta.text();

      let dados = {};

      if (texto) {
        try {
          dados = JSON.parse(texto);
        } catch {
          dados = {};
        }
      }

      if (!resposta.ok) {
        throw new Error(
          dados.mensagem || "Não foi possível concluir a operação.",
        );
      }

      return dados;
    } catch (erro) {
      if (erro instanceof TypeError) {
        throw new Error("Não foi possível conectar à API.");
      }

      throw erro;
    }
  }

  function mostrarMensagem(mensagem, tipo = "sucesso", chave = null) {
    if (chave === "status" && toastStatus) {
      toastStatus.remove();
      toastStatus = null;
    }

    const sucesso = tipo === "sucesso";

    const toast = document.createElement("div");

    toast.className = `
      pointer-events-auto
      relative
      overflow-hidden
      rounded-2xl
      border
      p-4
      shadow-[0_20px_55px_rgba(15,23,42,0.16)]
      ${
        sucesso
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }
    `;

    toast.innerHTML = `
      <div class="flex items-start gap-3">

        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            sucesso
              ? "bg-emerald-100 text-emerald-600"
              : "bg-red-100 text-red-600"
          }"
        >

          ${
            sucesso
              ? `
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              `
              : `
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 8v5"></path>
                  <path d="M12 17h.01"></path>
                </svg>
              `
          }

        </div>

        <div class="min-w-0 flex-1">

          <strong
            class="block text-sm font-bold ${
              sucesso ? "text-emerald-950" : "text-red-950"
            }"
          >
            ${sucesso ? "Sucesso" : "Erro"}
          </strong>

          <p
            data-toast-mensagem
            class="mt-1 text-xs leading-5 ${
              sucesso ? "text-emerald-700" : "text-red-700"
            }"
          ></p>

        </div>

        <button
          data-toast-fechar
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-lg ${
            sucesso
              ? "text-emerald-600 hover:bg-emerald-100"
              : "text-red-600 hover:bg-red-100"
          }"
        >
          ×
        </button>

      </div>
    `;

    toast.querySelector("[data-toast-mensagem]").textContent = mensagem;

    mensagens.prepend(toast);

    if (chave === "status") {
      toastStatus = toast;
    }

    toast.animate(
      [
        {
          opacity: 0,
          transform: "scale(0.96)",
        },
        {
          opacity: 1,
          transform: "scale(1)",
        },
      ],
      {
        duration: 220,
        fill: "forwards",
        easing: "cubic-bezier(0.16,1,0.3,1)",
      },
    );

    let removendo = false;

    const temporizador = setTimeout(remover, 3500);

    function remover() {
      if (removendo) {
        return;
      }

      removendo = true;

      clearTimeout(temporizador);

      const animacao = toast.animate(
        [
          {
            opacity: 1,
            transform: "scale(1)",
          },
          {
            opacity: 0,
            transform: "scale(0.96)",
          },
        ],
        {
          duration: 180,
          fill: "forwards",
        },
      );

      animacao.onfinish = () => {
        toast.remove();

        if (toast === toastStatus) {
          toastStatus = null;
        }
      };
    }

    toast
      .querySelector("[data-toast-fechar]")
      .addEventListener("click", remover);
  }

  function confirmar(titulo, mensagem, textoBotao) {
    confirmacaoTitulo.textContent = titulo;

    confirmacaoTexto.textContent = mensagem;

    btnConfirmar.textContent = textoBotao;

    modalConfirmacao.classList.remove("hidden");

    modalConfirmacao.classList.add("flex");

    document.body.style.overflow = "hidden";

    modalConfirmacao.animate(
      [
        {
          opacity: 0,
        },
        {
          opacity: 1,
        },
      ],
      {
        duration: 180,
      },
    );

    modalConfirmacao.querySelector(".modal-card").animate(
      [
        {
          opacity: 0,
          transform: "scale(0.96)",
        },
        {
          opacity: 1,
          transform: "scale(1)",
        },
      ],
      {
        duration: 220,
        easing: "cubic-bezier(0.16,1,0.3,1)",
      },
    );

    return new Promise((resolve) => {
      resolverConfirmacao = resolve;
    });
  }

  function finalizarConfirmacao(resultado) {
    modalConfirmacao.classList.add("hidden");

    modalConfirmacao.classList.remove("flex");

    document.body.style.overflow = "";

    if (resolverConfirmacao) {
      resolverConfirmacao(resultado);

      resolverConfirmacao = null;
    }
  }

  function escaparHTML(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function classePrioridade(prioridade) {
    if (prioridade === "alta") {
      return "border-red-200 bg-red-50 text-red-600";
    }

    if (prioridade === "media") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  function renderizarTarefas() {
    const textoBusca = busca.value.trim().toLowerCase();

    const filtradas = tarefas.filter((tarefa) => {
      return tarefa.titulo.toLowerCase().includes(textoBusca);
    });

    totalTarefas.textContent = filtradas.length;

    listaTarefas.innerHTML = "";

    if (!filtradas.length) {
      listaTarefas.innerHTML = `
        <div class="px-5 py-16 text-center">

          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600"
          >

            <svg
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 11l3 3L22 4"></path>

              <path
                d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
              ></path>
            </svg>

          </div>

          <h4
            class="mt-4 text-sm font-bold text-slate-800"
          >
            Nenhuma tarefa encontrada
          </h4>

          <p
            class="mt-1 text-xs text-slate-400"
          >
            Crie uma tarefa ou altere sua busca.
          </p>

        </div>
      `;

      return;
    }

    filtradas.forEach((tarefa) => {
      const tituloSeguro = escaparHTML(tarefa.titulo);

      const descricaoSegura = escaparHTML(tarefa.descricao || "Sem descrição");

      const prioridadeSegura = escaparHTML(tarefa.prioridade);

      const projetoSeguro = escaparHTML(tarefa.projetoNome || "Sem projeto");

      const classe = classePrioridade(tarefa.prioridade);

      listaTarefas.insertAdjacentHTML(
        "beforeend",
        `
              <article
                class="group p-4 transition-colors duration-200 hover:bg-purple-50/40 sm:p-5"
              >

                <div
                  class="flex items-start gap-3"
                >

                  <input
                    data-status-id="${tarefa.id}"
                    type="checkbox"
                    ${tarefa.concluida ? "checked" : ""}
                    class="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-purple-600 disabled:opacity-50"
                  >


                  <div
                    class="min-w-0 flex-1"
                  >

                    <div
                      class="flex items-start justify-between gap-3"
                    >

                      <h4
                        class="min-w-0 break-words text-sm font-bold leading-5 sm:text-[15px] ${
                          tarefa.concluida
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }"
                      >
                        ${tituloSeguro}
                      </h4>


                      <div
                        class="flex shrink-0 items-center gap-1"
                      >

                        <button
                          data-editar-id="${tarefa.id}"
                          type="button"
                          title="Editar tarefa"
                          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-purple-100 hover:text-purple-700 active:scale-95"
                        >

                          <svg
                            class="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M12 20h9"></path>

                            <path
                              d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
                            ></path>
                          </svg>

                        </button>


                        <button
                          data-excluir-id="${tarefa.id}"
                          type="button"
                          title="Excluir tarefa"
                          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 active:scale-95"
                        >

                          <svg
                            class="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="M19 6l-1 14H6L5 6"></path>
                          </svg>

                        </button>

                      </div>

                    </div>


                    <p
                      class="mt-1.5 break-words text-xs leading-5 text-slate-500 sm:text-sm"
                    >
                      ${descricaoSegura}
                    </p>


                    <div
                      class="mt-3 flex flex-wrap items-center gap-2"
                    >

                      <span
                        class="rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${classe}"
                      >
                        ${prioridadeSegura}
                      </span>


                      <span
                        class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500"
                      >

                        <svg
                          class="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                          ></path>
                        </svg>

                        ${projetoSeguro}

                      </span>

                    </div>

                  </div>

                </div>

              </article>
            `,
      );
    });
  }

  async function buscarTarefas() {
    const dados = await api(`/tarefas?pagina=${paginaAtual}&limite=${limite}`);

    tarefas = dados.tarefas || [];

    totalPaginas = Math.max(dados.totalPaginas || 1, 1);

    paginaAtualElemento.textContent = `Página ${paginaAtual} de ${totalPaginas}`;

    btnAnterior.disabled = paginaAtual <= 1;

    btnProxima.disabled = paginaAtual >= totalPaginas;

    paginacao.style.display = "flex";

    renderizarTarefas();
  }

  async function buscarTarefasProjeto(projetoId) {
    const dados = await api(`/projetos/${projetoId}/tarefas`);

    tarefas = (dados.tarefas || []).map((tarefa) => {
      return {
        ...tarefa,

        projetoNome: dados.projeto.nome,
      };
    });

    paginacao.style.display = "none";

    renderizarTarefas();
  }

  function marcarProjetoAtivo() {
    document
      .querySelectorAll("[data-projeto-container]")
      .forEach((container) => {
        const ativo = container.dataset.projetoContainer === projetoAtivo;

        container.classList.toggle("border-purple-200", ativo);

        container.classList.toggle("bg-purple-50", ativo);

        const botao = container.querySelector("[data-projeto-id]");

        botao.classList.toggle("text-purple-700", ativo);

        botao.classList.toggle("font-semibold", ativo);
      });

    const todosAtivo = projetoAtivo === null;

    btnTodosProjetos.classList.toggle("border-purple-200", todosAtivo);

    btnTodosProjetos.classList.toggle("bg-purple-50", todosAtivo);

    btnTodosProjetos.classList.toggle("text-purple-700", todosAtivo);

    btnTodosProjetos.classList.toggle("border-transparent", !todosAtivo);

    btnTodosProjetos.classList.toggle("bg-transparent", !todosAtivo);

    btnTodosProjetos.classList.toggle("text-slate-600", !todosAtivo);
  }

  function renderizarProjetos() {
    projeto.innerHTML = `
      <option value="">
        Sem projeto
      </option>
    `;

    filtroProjeto.innerHTML = `
      <option value="">
        Todos os projetos
      </option>
    `;

    listaProjetos.innerHTML = "";

    if (!projetos.length) {
      listaProjetos.innerHTML = `
        <div
          class="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center lg:w-full"
        >

          <p
            class="text-xs font-medium text-slate-400"
          >
            Nenhum projeto
          </p>

        </div>
      `;
    }

    projetos.forEach((item) => {
      const nomeSeguro = escaparHTML(item.nome);

      projeto.insertAdjacentHTML(
        "beforeend",
        `
            <option value="${item.id}">
              ${nomeSeguro}
            </option>
          `,
      );

      filtroProjeto.insertAdjacentHTML(
        "beforeend",
        `
            <option value="${item.id}">
              ${nomeSeguro}
            </option>
          `,
      );

      listaProjetos.insertAdjacentHTML(
        "beforeend",
        `
              <div
                data-projeto-container="${item.id}"
                class="group flex min-w-max items-center rounded-xl border border-transparent transition-all duration-200 hover:border-purple-200 hover:bg-purple-50 lg:w-full"
              >

                <button
                  data-projeto-id="${item.id}"
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors duration-200 group-hover:text-purple-700"
                >

                  <svg
                    class="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                    ></path>
                  </svg>

                  <span class="truncate">
                    ${nomeSeguro}
                  </span>

                </button>


                <button
                  data-excluir-projeto="${item.id}"
                  type="button"
                  title="Excluir projeto"
                  class="mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 active:scale-95"
                >

                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M8 6V4h8v2"></path>
                    <path d="M19 6l-1 14H6L5 6"></path>
                  </svg>

                </button>

              </div>
            `,
      );
    });

    filtroProjeto.value = projetoAtivo || "";

    marcarProjetoAtivo();
  }

  async function buscarProjetos() {
    const dados = await api("/projetos");

    projetos = dados.projetos || [];

    renderizarProjetos();
  }

  async function cadastrarProjeto(evento) {
    evento.preventDefault();

    const dados = {
      nome: nomeProjeto.value.trim(),

      descricao: descricaoProjeto.value.trim(),
    };

    if (!dados.nome) {
      mostrarMensagem("Informe o nome do projeto.", "erro");

      return;
    }

    btnCriarProjeto.disabled = true;

    btnCriarProjeto.textContent = "Criando...";

    try {
      await api("/projetos", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(dados),
      });

      formProjeto.reset();

      await buscarProjetos();

      mostrarMensagem("Projeto criado com sucesso.");
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    } finally {
      btnCriarProjeto.disabled = false;

      btnCriarProjeto.textContent = "Criar projeto";
    }
  }

  function resetarFormularioTarefa() {
    tarefaEditando = null;

    formTarefa.reset();

    btnSalvarTarefa.textContent = "Criar tarefa";

    tituloFormTarefa.textContent = "O que precisa ser feito?";

    btnCancelarEdicao.classList.add("hidden");
  }

  async function salvarTarefa(evento) {
    evento.preventDefault();

    const dados = {
      titulo: titulo.value.trim(),

      descricao: descricao.value.trim(),

      prioridade: prioridade.value,
    };

    if (projeto.value) {
      dados.projetoId = Number(projeto.value);
    }

    if (!dados.titulo || !dados.prioridade) {
      mostrarMensagem("Informe o título e a prioridade.", "erro");

      return;
    }

    const editando = tarefaEditando !== null;

    btnSalvarTarefa.disabled = true;

    btnSalvarTarefa.textContent = editando ? "Salvando..." : "Criando...";

    try {
      if (editando) {
        await api(`/tarefas/${tarefaEditando}`, {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dados),
        });

        mostrarMensagem("Tarefa atualizada com sucesso.");
      } else {
        await api("/tarefas", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dados),
        });

        mostrarMensagem("Tarefa criada com sucesso.");
      }

      resetarFormularioTarefa();

      await atualizarListaAtual();
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    } finally {
      btnSalvarTarefa.disabled = false;

      if (!tarefaEditando) {
        btnSalvarTarefa.textContent = "Criar tarefa";
      }
    }
  }

  function editarTarefa(tarefaId) {
    const tarefa = tarefas.find((item) => item.id === Number(tarefaId));

    if (!tarefa) {
      return;
    }

    tarefaEditando = tarefa.id;

    titulo.value = tarefa.titulo;

    descricao.value = tarefa.descricao || "";

    prioridade.value = tarefa.prioridade;

    projeto.value = tarefa.projetoId || "";

    tituloFormTarefa.textContent = "Editar tarefa";

    btnSalvarTarefa.textContent = "Salvar alterações";

    btnCancelarEdicao.classList.remove("hidden");

    formTarefa.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    titulo.focus();
  }

  async function excluirTarefa(tarefaId) {
    const confirmou = await confirmar(
      "Excluir tarefa",
      "Essa ação é permanente. Deseja excluir esta tarefa?",
      "Excluir tarefa",
    );

    if (!confirmou) {
      return;
    }

    try {
      await api(`/tarefas/${tarefaId}`, {
        method: "DELETE",
      });

      if (!projetoAtivo && tarefas.length === 1 && paginaAtual > 1) {
        paginaAtual--;
      }

      await atualizarListaAtual();

      mostrarMensagem("Tarefa excluída com sucesso.");
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  }

  async function excluirProjeto(projetoId) {
    const projetoEncontrado = projetos.find(
      (item) => item.id === Number(projetoId),
    );

    const nome = projetoEncontrado?.nome || "este projeto";

    const confirmou = await confirmar(
      "Excluir projeto",
      `Deseja realmente excluir "${nome}"?`,
      "Excluir projeto",
    );

    if (!confirmou) {
      return;
    }

    try {
      await api(`/projetos/${projetoId}`, {
        method: "DELETE",
      });

      if (projetoAtivo === String(projetoId)) {
        projetoAtivo = null;
        paginaAtual = 1;
      }

      await buscarProjetos();

      await atualizarListaAtual();

      mostrarMensagem("Projeto excluído com sucesso.");
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  }

  async function alterarStatus(checkbox) {
    const tarefaId = checkbox.dataset.statusId;

    const concluida = checkbox.checked;

    checkbox.disabled = true;

    try {
      await api(`/tarefas/${tarefaId}/${concluida ? "concluir" : "reabrir"}`, {
        method: "PATCH",
      });

      tarefas = tarefas.map((tarefa) => {
        if (tarefa.id === Number(tarefaId)) {
          return {
            ...tarefa,
            concluida,
          };
        }

        return tarefa;
      });

      renderizarTarefas();

      mostrarMensagem(
        concluida ? "Tarefa concluída." : "Tarefa reaberta.",
        "sucesso",
        "status",
      );
    } catch (erro) {
      checkbox.checked = !concluida;

      mostrarMensagem(erro.message, "erro", "status");
    }
  }

  async function atualizarListaAtual() {
    if (projetoAtivo) {
      await buscarTarefasProjeto(projetoAtivo);

      return;
    }

    await buscarTarefas();
  }

  formProjeto.addEventListener("submit", cadastrarProjeto);

  formTarefa.addEventListener("submit", salvarTarefa);

  btnCancelarEdicao.addEventListener("click", resetarFormularioTarefa);

  busca.addEventListener("input", renderizarTarefas);

  btnTodosProjetos.addEventListener("click", async () => {
    projetoAtivo = null;
    paginaAtual = 1;

    filtroProjeto.value = "";

    marcarProjetoAtivo();

    try {
      await buscarTarefas();
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  });

  filtroProjeto.addEventListener("change", async () => {
    projetoAtivo = filtroProjeto.value || null;

    paginaAtual = 1;

    marcarProjetoAtivo();

    try {
      await atualizarListaAtual();
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  });

  listaProjetos.addEventListener("click", async (evento) => {
    const excluir = evento.target.closest("[data-excluir-projeto]");

    if (excluir) {
      await excluirProjeto(excluir.dataset.excluirProjeto);

      return;
    }

    const selecionar = evento.target.closest("[data-projeto-id]");

    if (!selecionar) {
      return;
    }

    projetoAtivo = selecionar.dataset.projetoId;

    paginaAtual = 1;

    filtroProjeto.value = projetoAtivo;

    marcarProjetoAtivo();

    try {
      await buscarTarefasProjeto(projetoAtivo);
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  });

  listaTarefas.addEventListener("click", async (evento) => {
    const editar = evento.target.closest("[data-editar-id]");

    if (editar) {
      editarTarefa(editar.dataset.editarId);

      return;
    }

    const excluir = evento.target.closest("[data-excluir-id]");

    if (excluir) {
      await excluirTarefa(excluir.dataset.excluirId);
    }
  });

  listaTarefas.addEventListener("change", async (evento) => {
    const checkbox = evento.target.closest("[data-status-id]");

    if (checkbox) {
      await alterarStatus(checkbox);
    }
  });

  btnAnterior.addEventListener("click", async () => {
    if (paginaAtual <= 1) {
      return;
    }

    paginaAtual--;

    try {
      await buscarTarefas();
    } catch (erro) {
      paginaAtual++;

      mostrarMensagem(erro.message, "erro");
    }
  });

  btnProxima.addEventListener("click", async () => {
    if (paginaAtual >= totalPaginas) {
      return;
    }

    paginaAtual++;

    try {
      await buscarTarefas();
    } catch (erro) {
      paginaAtual--;

      mostrarMensagem(erro.message, "erro");
    }
  });

  btnCancelarConfirmacao.addEventListener("click", () => {
    finalizarConfirmacao(false);
  });

  btnConfirmar.addEventListener("click", () => {
    finalizarConfirmacao(true);
  });

  modalConfirmacao.addEventListener("click", (evento) => {
    if (evento.target === modalConfirmacao) {
      finalizarConfirmacao(false);
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (
      evento.key === "Escape" &&
      modalConfirmacao.classList.contains("flex")
    ) {
      finalizarConfirmacao(false);
    }
  });

  async function iniciar() {
    try {
      await Promise.all([buscarProjetos(), buscarTarefas()]);
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    }
  }

  iniciar();
});
