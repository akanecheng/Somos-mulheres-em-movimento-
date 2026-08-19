import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEggZoP5vk1JENjO8701pAFdBIBPB8gPQ",
  authDomain: "somos-mulheres-em-movimento.firebaseapp.com",
  projectId: "somos-mulheres-em-movimento",
  storageBucket: "somos-mulheres-em-movimento.firebasestorage.app",
  messagingSenderId: "427525655209",
  appId: "1:427525655209:web:cc00a592936dbd3df9f7b8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Monta o HTML do card mapeando os dados do banco
function renderBookCard(livro) {
    return `
        <div class="amazon-card">
            <img class="amazon-card-img" src="${livro.capa || 'https://picsum.photos/200/300'}" alt="${livro.titulo}">
            <div class="amazon-card-title">${livro.titulo || ''}</div>
            <div class="amazon-card-type">${livro.volume || ''}</div>
            <div class="amazon-card-desc">${livro.descricao || ''}</div>
        </div>
    `;
}

// Busca os documentos da coleção "livros" e renderiza na tela
async function carregarLivros() {
    const destaqueContainer = document.getElementById('edicao-destaque');
    
    try {
        const querySnapshot = await getDocs(collection(db, "livros"));
        let livros = [];
        querySnapshot.forEach((docSnap) => {
            livros.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (livros.length === 0) {
            if (destaqueContainer) destaqueContainer.innerHTML = '<p>Nenhuma edição encontrada.</p>';
            return;
        }

        if (destaqueContainer) {
            destaqueContainer.innerHTML = livros.map(renderBookCard).join('');
        }

    } catch (erro) {
        console.error("Erro ao carregar edições:", erro);
    }
}

document.addEventListener("DOMContentLoaded", carregarLivros);