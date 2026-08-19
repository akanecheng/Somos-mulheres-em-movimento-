const firebaseConfig = {
    apiKey: "AIzaSyDOOPrODo46x_VqXNUdvwq38wYK1TCkJXA",
    authDomain: "mariana-jamilly.firebaseapp.com",
    projectId: "mariana-jamilly",
    storageBucket: "mariana-jamilly.firebasestorage.app",
    messagingSenderId: "983935199953",
    appId: "1:983935199953:web:7b83c279b809056218b3f0"
};

// Inicializa Firebase e Firestore
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Função para buscar dados em tempo real e atualizar a tela do index
function carregarEAtualizarIndex() {
    const colecoes = ['hero', 'perfilSecundario', 'bio', 'livro', 'devocional'];

    colecoes.forEach(col => {
        // onSnapshot escuta alterações em tempo real do Firestore
        db.collection(col).onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                atualizarDOM(col, data);
            }
        }, err => console.error(`Erro ao carregar ${col}:`, err));
    });
}

// Atualiza os elementos HTML da index com os dados salvos no Firestore
function atualizarDOM(secao, data) {
    if (secao === 'hero') {
        if (data.subtitulo) document.getElementById('viewHeroSubtitulo').innerText = data.subtitulo;
        if (data.titulo) document.getElementById('viewHeroTitulo').innerText = data.titulo;
        if (data.autora) document.getElementById('viewHeroAutora').innerText = data.autora;
        if (data.imagem) document.getElementById('viewHeroImg').src = data.imagem;
    }

    if (secao === 'perfilSecundario') {
        if (data.titulo) document.getElementById('viewPerfilSecundarioTitulo').innerText = data.titulo;
        if (data.imagem) document.getElementById('viewPerfilSecundarioImg').src = data.imagem;
        if (data.paragrafos) {
            const container = document.getElementById('viewPerfilSecundarioParagrafos');
            container.innerHTML = data.paragrafos.map(p => `<p>${p}</p>`).join('');
        }
    }

    if (secao === 'bio') {
        if (data.titulo) document.getElementById('viewBioTitulo').innerText = data.titulo;
        if (data.paragrafos) {
            const container = document.getElementById('viewBioParagrafos');
            container.innerHTML = data.paragrafos.map(p => `<p>${p}</p>`).join('');
        }
    }

    if (secao === 'livro') {
        if (data.titulo) document.getElementById('viewLivroTitulo').innerText = data.titulo;
        if (data.descricao) document.getElementById('viewLivroDescricao').innerText = data.descricao;
        if (data.link) document.getElementById('viewLivroBtn').href = data.link;
        if (data.imagem) document.getElementById('viewLivroImg').src = data.imagem;
    }

    if (secao === 'devocional') {
        if (data.titulo) document.getElementById('viewDevocionalTitulo').innerText = data.titulo;
        if (data.link) document.getElementById('viewDevocionalBtn').href = data.link;
        if (data.paragrafos) {
            const container = document.getElementById('viewDevocionalParagrafos');
            container.innerHTML = data.paragrafos.map(p => `<p>${p}</p>`).join('');
        }
    }
}

// Menu Hambúrguer para Dispositivos Móveis
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navList = document.getElementById('nav-list');

    if (mobileMenu && navList) {
        mobileMenu.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // Inicia a escuta dos dados
    carregarEAtualizarIndex();
});