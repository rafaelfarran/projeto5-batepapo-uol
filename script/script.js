let nome = null;
let participantes = [];
let mensagens = [];

let target = "Todos";
let visibilidade = "message";

let loopConexao = null;
let loopMensagens = null;
let loopParticipantes = null;

function entrar(){
    nome = document.querySelector(".input-nome").value;
    
    if(nome){
        const objeto = {name: nome};
        const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants",objeto);

        const input = document.querySelector(".input-nome");
        const entrar = document.querySelector("button");
        const loading = document.querySelector(".loading");
        const mensagemErro = document.querySelector(".mensagem-erro");
        if(!mensagemErro.classList.contains("esconder")){
            mensagemErro.classList.add("esconder");
        }
    
        loading.classList.toggle("esconder");
        input.classList.toggle("esconder")
        entrar.classList.toggle("esconder")

        promise.then(entrarSucesso);
        promise.catch(entrarFalhou);
    }
}

function entrarSucesso(){
    buscaMensagens();
    buscarParticipantes();
    iniciaProcedimento();

    const telaLogin = document.querySelector(".login");
    telaLogin.classList.add("esconder");
}

function entrarFalhou(){
    const mensagemErro = document.querySelector(".mensagem-erro");
    const input = document.querySelector(".input-nome");
    const entrar = document.querySelector("button");
    const loading = document.querySelector(".loading");

    loading.classList.toggle("esconder");
    mensagemErro.classList.toggle("esconder");
    input.classList.toggle("esconder")
    entrar.classList.toggle("esconder")
}

function abreFechaSidebar(){
    const background = document.querySelector(".fundo-escuro");
    const sidebar = document.querySelector(".sidebar");

    background.classList.toggle("esconder");
    sidebar.classList.toggle("esconder");
}

function iniciaProcedimento(){
    loopConexao = setInterval(manterConexao,5000);
    loopMensagens = setInterval(buscaMensagens,3000);
    loopParticipantes = setInterval(buscarParticipantes,10000);
}

function manterConexao(){
    const objeto = {name: nome}
    const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/status",objeto);
    
    promise.catch(function () {
        alert("Conexão não foi mantida!");
        window.location.reload();
    });
}

function buscaMensagens(){
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    promise.then(salvaMensagens);
}

function buscarParticipantes(){
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/uol/participants");
    promise.then(salvarParticipantes);
}

function salvarParticipantes(respota){
    participantes = [];
    participantes.push({name: "Todos"});

    const todosParticipantes = [...respota.data];
    participantes = participantes.concat(todosParticipantes);
    participantes = participantes.filter(retirarNomeProprio);

    atualizarParticipantes();
}

function retirarNomeProprio(item){
    if(item.name === nome){
        return false;
    }
    else{
        return true;
    }
}

function atualizarParticipantes(){
    const lista = document.querySelector(".lista-online");
    lista.innerHTML = "";

    participantes.forEach(montarTelaParticipantes);
}

function montarTelaParticipantes(participante){
    const lista = document.querySelector(".lista-online");
    let imgIcon = "person-circle";
    let imgCheck = "esconder";

    if(target === participante.name){
        imgCheck = "";
    }
    if(participante.name === "Todos"){
        imgIcon = "person";
    }

    div = ` <div class="opcoes" data-identifier="participant" onclick="selecionarTarget(this)">
                <ion-icon name="${imgIcon}" class="icon"></ion-icon>
                <span>${participante.name}</span>
                <ion-icon name="checkmark" class="check ${imgCheck}"></ion-icon>
            </div>`;
        
    lista.innerHTML = lista.innerHTML + div;
}

function salvaMensagens(resposta){
    mensagens = [...resposta.data];
    mensagens = mensagens.filter(filtrarMensagens)

    adicionaMensagensTela();
}

function filtrarMensagens(mensagem){
    if(mensagem.to === "Todos" || mensagem.to === nome || mensagem.from === nome)
        return true;
    else
        return false;
}

function adicionaMensagensTela(){

    const main = document.querySelector("main");
    main.innerHTML = "";

    for(let contador=0; contador<mensagens.length-1; contador++){
        const mensagem = mensagens[contador];
        mostrarMensagem(mensagem,"");
    }
    
    rodarTelaUltimaMensagem();
}

function mostrarMensagem(mensagem,ultima){
    
    let mensagemHTML = null;

    if(mensagem.type === "message"){
        mensagemHTML = `<article class="mensagem-normal ${ultima}" data-identifier="message">
                            <span class="horario">(${mensagem.time})</span>
                            <strong>${mensagem.from}</strong> para <strong>Todos</strong>: 
                            ${mensagem.text}
                        </article>`
    }
    else if(mensagem.type === "status"){
        mensagemHTML = `<article class="mensagem-status ${ultima}" data-identifier="message">
                            <span class="horario">(${mensagem.time})</span>
                            <strong>${mensagem.from}</strong> ${mensagem.text}
                        </article>`
    }
    else {
        mensagemHTML = `<article class="mensagem-reservada ${ultima}" data-identifier="message">
                            <span class="horario">(${mensagem.time})</span>
                            <strong>${mensagem.from}</strong> reservadamente para <strong>${mensagem.to}</strong>: 
                            ${mensagem.text}
                        </article>`
    }

    const main = document.querySelector("main");
    main.innerHTML = main.innerHTML + mensagemHTML;
}

function rodarTelaUltimaMensagem(){
    const mensagem = mensagens[mensagens.length-1];
    mostrarMensagem(mensagem,"ultima");

    const ultimaMensagem = document.querySelector(".ultima");
    ultimaMensagem.scrollIntoView();
}

function enviarMensagem(){

    const texto = document.querySelector(".input-message").value;

    if(texto){
        const objeto = {
            from: nome,
            text: texto,
            to: target,
            type: visibilidade
        };

        const promise = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages",objeto);
        promise.then(enviarMensagemSucesso);
        promise.catch(function() {
            alert("Você não está na sala, a página será atualizada!");
            window.location.reload();
        });

    }
}

function enviarMensagemSucesso(){
    buscaMensagens();
    const input = document.querySelector(".input-message");
    input.value = "";
}

function selecionarTarget(div){
    nomeSelecionado = div.querySelector("span").innerHTML;

    if(nomeSelecionado === "Todos"){
        selecionarVisibilidade("message")
    }
    
    target = nomeSelecionado;
    mudarTextoGuiaInput();
    atualizarParticipantes();
}

function selecionarVisibilidade(selecao){
    const checkGeral = document.querySelector(".check-geral");
    const checkPrivate = document.querySelector(".check-private");

    if(selecao !== visibilidade && target !== "Todos"){
        checkGeral.classList.toggle("esconder");
        checkPrivate.classList.toggle("esconder");
        visibilidade = selecao;

        mudarTextoGuiaInput();
    }
}

function mudarTextoGuiaInput(){
    const textoGuia = document.querySelector(".texto-guia");
    
    if(target !== "Todos"){
        let alvo = " (Público)";

        if(visibilidade === "private_message"){
            alvo = " (Reservadamente)";
        }

        textoGuia.innerHTML = `Enviando para ${target}${alvo}`;
    }
    else{
        textoGuia.innerHTML = "Enviando para Todos";
    }
}

document.querySelector(".input-message").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        enviarMensagem();
    }
});