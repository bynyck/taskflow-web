const listaTarefas = document.getElementById("lista-tarefas");

const btnNovaTarefa = document.getElementById("btn-nova-tarefa");
const modalNovaTarefa = document.getElementById("modal-nova-tarefa");
const botaoFecharModal = document.getElementById("btn-fechar-modal");

const formulario = document.getElementById("form-nova-tarefa");
const titulo = document.getElementById("titulo");
const descricao = document.getElementById("descricao");
const prioridade = document.getElementById("prioridade");
const botaoCancelarTarefa = document.getElementById("btn-cancelar-tarefa");

const projeto = document.getElementById("projeto");

const btnNovoProjeto = document.getElementById("btn-novo-projeto");
const modalNovoProjeto = document.getElementById("modal-novo-projeto");
const btnFecharModalProjeto = document.getElementById("btn-fechar-modal-projeto");
const btnCancelarProjeto = document.getElementById("btn-cancelar-projeto");
const formularioProjeto = document.getElementById("form-novo-projeto");
const nomeProjeto = document.getElementById("nome-projeto");
const descricaoProjeto = document.getElementById("descricao-projeto");
const listaProjetos = document.getElementById("lista-projetos");

const btnTodosProjetos = document.getElementById("btn-todos-projetos");

const filtroProjeto = document.getElementById("filtro-projeto");

const inputBusca = document.getElementById("input-busca");

let tarefasAtuais = [];

let projetoAtivo = null;

const totalTarefas = document.getElementById("total-tarefas");
const totalConcluidas = document.getElementById("total-concluidas");
const totalPendentes = document.getElementById("total-pendentes");

function atualizarResumo(tarefas) {
    const total = tarefas.length;

    const concluidas = tarefas.filter(tarefa => {
        return tarefa.concluida;
    })

    const pendentes = tarefas.filter(tarefa => {
        return tarefa.concluida === false;
    })

    totalTarefas.innerText = total
    totalConcluidas.innerText = concluidas.length
    totalPendentes.innerText = pendentes.length
}


function renderizarTarefasFiltradas() {
    const valorInput = inputBusca.value.toLowerCase();

    const novoArray = tarefasAtuais.filter(tarefa => {
        return tarefa.titulo.toLowerCase().includes(valorInput);
    })

    renderizarListaDeTarefas(novoArray)
}

inputBusca.addEventListener("input", () => {
    renderizarTarefasFiltradas();
})

filtroProjeto.addEventListener("change", async () => {
    try {
        const valorFiltro = filtroProjeto.value;

        if (!valorFiltro) {
            projetoAtivo = null;

            await buscarTarefas();

            atualizarVisualProjetoSide();

            return;
        }

        const tarefas = await buscarTarefasPorProjetoId(valorFiltro);

        tarefasAtuais = tarefas;

        atualizarResumo(tarefasAtuais);

        projetoAtivo = valorFiltro;

        renderizarTarefasFiltradas();

        atualizarVisualProjetoSide();

    } catch (erro) {
        alert(erro.message);
    }


})

btnTodosProjetos.addEventListener("click", async () => {
    projetoAtivo = null;

    filtroProjeto.value = "";

    await buscarTarefas();

    atualizarVisualProjetoSide();
})

function obterDadosFormularioProjeto() {
    return {
        nome: nomeProjeto.value,
        descricao: descricaoProjeto.value
    }
}

async function cadastrarProjeto(e) {
    e.preventDefault();

    const dados = obterDadosFormularioProjeto();

    const { nome } = dados;

    if (!nome) {
        alert("Preencha o nome do projeto");
        return;
    }

    const resposta = await fetch("https://taskflow-api-j3lv.onrender.com/projetos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    const dadosResposta = await resposta.json();

    if (!resposta.ok) {
        alert(dadosResposta.mensagem);
        return;
    }

    formularioProjeto.reset();

    modalNovoProjeto.classList.add("hidden");
    modalNovoProjeto.classList.remove("flex");

    await buscarProjetos();

}

btnNovoProjeto.addEventListener("click", () => {
    modalNovoProjeto.classList.add("flex");
    modalNovoProjeto.classList.remove("hidden");
})

btnFecharModalProjeto.addEventListener("click", () => {
    modalNovoProjeto.classList.add("hidden");
    modalNovoProjeto.classList.remove("flex");
})

btnCancelarProjeto.addEventListener("click", () => {
    modalNovoProjeto.classList.add("hidden");
    modalNovoProjeto.classList.remove("flex");
})

botaoCancelarTarefa.addEventListener("click", () => {
    modalNovaTarefa.classList.add("hidden");
    modalNovaTarefa.classList.remove("flex");
})

btnNovaTarefa.addEventListener("click", () => {
    modalNovaTarefa.classList.add("flex");
    modalNovaTarefa.classList.remove("hidden");
})

botaoFecharModal.addEventListener("click", () => {
    modalNovaTarefa.classList.add("hidden");
    modalNovaTarefa.classList.remove("flex");
})


function obterDadosFormulario() {
    const dados = {
        titulo: titulo.value,
        descricao: descricao.value,
        prioridade: prioridade.value
    }

    if (projeto.value) {
        return {
            ...dados,
            projetoId: Number(projeto.value)
        }
    }
    return dados;
}

function renderizarTarefas(tarefa) {
    const nomeProjetoExibicao = tarefa.projetoNome
        ? tarefa.projetoNome
        : "Sem projeto";

    listaTarefas.innerHTML += `
        <article class="flex items-center gap-5 px-6 py-5 transition hover:bg-purple-950/40">

            <input
                data-tarefa-id="${tarefa.id}"
                ${tarefa.concluida ? "checked" : ""}
                type="checkbox"
                class="h-5 w-5 cursor-pointer accent-purple-600"
            >

            <div class="min-w-0 flex-1">

                <h3 class="font-semibold ${tarefa.concluida
            ? "line-through text-zinc-600"
            : "text-zinc-100"
        }">
                    ${tarefa.titulo}
                </h3>

            </div>


            <div class="w-40 text-sm text-zinc-500">
                ${tarefa.descricao}
            </div>


            <div class="w-36 text-sm text-zinc-500">
                ${tarefa.prioridade}
            </div>


            <div class="w-36 text-sm text-zinc-500">
                ${nomeProjetoExibicao}
            </div>


            <div class="flex items-center gap-1">

                <!-- EDITAR -->
                <button
                    data-editar-tarefa-id="${tarefa.id}"
                    type="button"
                    title="Editar tarefa"
                    aria-label="Editar tarefa"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-purple-500/10 hover:text-purple-300"
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
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>

                </button>


                <!-- EXCLUIR -->
                <button
                    data-excluir-tarefa-id="${tarefa.id}"
                    type="button"
                    title="Excluir tarefa"
                    aria-label="Excluir tarefa"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
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
                        <path d="M10 11v5"></path>
                        <path d="M14 11v5"></path>
                    </svg>

                </button>

            </div>

        </article>
    `;
}

function renderizarListaDeTarefas(tarefas) {

    listaTarefas.innerHTML = "";

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = "Nenhuma tarefa encontrada";
        return;
    }

    for (const tarefa of tarefas) {
        renderizarTarefas(tarefa);
    }

}

async function buscarTarefas() {
    const resposta = await fetch("https://taskflow-api-j3lv.onrender.com/tarefas");

    const dados = await resposta.json();

    const tarefas = dados.tarefas;

    tarefasAtuais = tarefas;

    atualizarResumo(tarefasAtuais);

    renderizarTarefasFiltradas();

}

async function buscarProjetos() {
    const resposta = await fetch("https://taskflow-api-j3lv.onrender.com/projetos");

    const dados = await resposta.json();

    projeto.innerHTML = `<option value="">Sem projeto</option>`

    listaProjetos.innerHTML = "";

    filtroProjeto.innerHTML = `<option value="">Filtrar por projeto</option>`

    const projetos = dados.projetos;

    for (const projetoAtual of projetos) {
        projeto.innerHTML += `
            <option value="${projetoAtual.id}">
                ${projetoAtual.nome}
            </option>
        `

        listaProjetos.innerHTML += `
            <button data-projeto-id="${projetoAtual.id}" type="button"
                class="flex w-full items-center justify-between rounded-xl border border-transparent bg-transparent px-3.5 py-3 text-left text-sm font-medium text-zinc-400 transition hover:border-purple-500/20 hover:bg-purple-950/40 hover:text-purple-300"
            >

                <span class="flex items-center gap-2.5">
                    <svg
                        class="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path>
                        <path d="M3 7V5a2 2 0 0 1 2-2h3l2 2h4"></path>
                    </svg>

                    ${projetoAtual.nome}

                </span>

            </button>
        `;

        filtroProjeto.innerHTML += `
            <option value="${projetoAtual.id}">${projetoAtual.nome}</option>

        `
    }

    filtroProjeto.value = projetoAtivo ?? "";

    atualizarVisualProjetoSide();

}

buscarProjetos();

async function buscarTarefasPorProjetoId(projetoId) {
    const resultado = await fetch(`https://taskflow-api-j3lv.onrender.com/projetos/${projetoId}/tarefas`)

    const dados = await resultado.json();

    console.log(dados);

    if (!resultado.ok) {
        throw new Error(dados.mensagem);
    }

    const tarefasProjetos = dados.tarefas.map(tarefa => {
        return {
            ...tarefa,
            projetoNome: dados.projeto.nome
        }
    })

    return tarefasProjetos;

}

function atualizarVisualProjetoSide() {

    if (projetoAtivo === null) {

        btnTodosProjetos.classList.remove(
            "border-transparent",
            "bg-transparent",
            "text-zinc-400"
        );

        btnTodosProjetos.classList.add(
            "border-purple-500/30",
            "bg-purple-500/10",
            "text-purple-200"
        );

    } else {

        btnTodosProjetos.classList.remove(
            "border-purple-500/30",
            "bg-purple-500/10",
            "text-purple-200"
        );

        btnTodosProjetos.classList.add(
            "border-transparent",
            "bg-transparent",
            "text-zinc-400"
        );

    }


    const botoesProjetos = listaProjetos.querySelectorAll(
        "[data-projeto-id]"
    );


    for (const botaoProjeto of botoesProjetos) {

        if (botaoProjeto.dataset.projetoId === projetoAtivo) {

            botaoProjeto.classList.remove(
                "border-transparent",
                "bg-transparent",
                "text-zinc-400"
            );

            botaoProjeto.classList.add(
                "border-purple-500/30",
                "bg-purple-500/10",
                "text-purple-200"
            );

        } else {

            botaoProjeto.classList.remove(
                "border-purple-500/30",
                "bg-purple-500/10",
                "text-purple-200"
            );

            botaoProjeto.classList.add(
                "border-transparent",
                "bg-transparent",
                "text-zinc-400"
            );

        }

    }
}

listaProjetos.addEventListener("click", async (e) => {
    try {
        const botao = e.target.closest("[data-projeto-id]");

        if (botao === null) {
            return;
        }

        const projetoId = botao.dataset.projetoId;

        const tarefas = await buscarTarefasPorProjetoId(projetoId);

        tarefasAtuais = tarefas;

        atualizarResumo(tarefasAtuais);

        projetoAtivo = projetoId;

        atualizarVisualProjetoSide();

        filtroProjeto.value = projetoId

        renderizarTarefasFiltradas();

    } catch (erro) {
        alert("Erro: " + erro.message);
    }

})

listaTarefas.addEventListener("change", async (e) => {
    const checkbox = e.target.closest("[data-tarefa-id]");

    if (checkbox === null) {
        return;
    }

    const tarefaId = checkbox.dataset.tarefaId;
    const concluida = checkbox.checked;

    try {
        if (!concluida) {
            const resposta = await fetch(`https://taskflow-api-j3lv.onrender.com/tarefas/${tarefaId}/reabrir`, {
                method: "PATCH"
            });

            if (!resposta.ok) {
                throw new Error("Falha ao reabrir a tarefa");
            }
        } else {
            const resposta = await fetch(`https://taskflow-api-j3lv.onrender.com/tarefas/${tarefaId}/concluir`, {
                method: "PATCH"
            })
            if (!resposta.ok) {
                throw new Error("Falha ao concluir a tarefa");
            }
        }

        tarefasAtuais = tarefasAtuais.map(tarefa => {
            if (tarefa.id === Number(tarefaId)) {
                return {
                    ...tarefa,
                    concluida: concluida
                }
            }

            return tarefa;

        })

        atualizarResumo(tarefasAtuais);
        renderizarTarefasFiltradas();

    } catch (erro) {
        checkbox.checked = !concluida;
        alert(erro.message);
    }
})

async function cadastrarTarefa(e) {
    e.preventDefault();

    const dados = obterDadosFormulario();

    console.log(dados);

    const { titulo, prioridade } = dados;

    if (!titulo || !prioridade) {
        alert("Preencha nome e prioridade");
        return;
    }

    const resultado = await fetch("https://taskflow-api-j3lv.onrender.com/tarefas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    })

    const dadosResposta = await resultado.json();

    if (!resultado.ok) {
        alert(dadosResposta.mensagem);
        return;
    }

    formulario.reset();

    modalNovaTarefa.classList.add("hidden");
    modalNovaTarefa.classList.remove("flex");

    if (projetoAtivo === null) {
        await buscarTarefas();
        return;
    }

    const tarefas = await buscarTarefasPorProjetoId(projetoAtivo);

    tarefasAtuais = tarefas

    atualizarResumo(tarefasAtuais);

    renderizarTarefasFiltradas();
}

formulario.addEventListener("submit", cadastrarTarefa);
formularioProjeto.addEventListener("submit", cadastrarProjeto);

buscarTarefas();
