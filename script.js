lucide.createIcons();


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


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

// carregar biblioteca 

async function carregarBiblioteca() {
    const edicoesContainer = document.getElementById('edicoes-container');
    
    console.log("Edições Container:", edicoesContainer);
    
const heroBookContainer =
document.getElementById('hero-book-container');
console.log("Hero Container:", heroBookContainer);
    
    if (!edicoesContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "livros"));
        let livros = [];

        querySnapshot.forEach((docSnap) => {
console.log("Livro encontrado:", docSnap.data());
            if (docSnap.id === "livroPrincipal") return;

            livros.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // Ordena pela ordem definida no painel
        livros.sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));
        
console.log("Livros finais:", livros);

        if (livros.length === 0) {
            edicoesContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nenhuma edição disponível no momento.</p>';
            return;
        }

        // Se houver pelo menos 1 livro, atualiza a Capa de Destaque no Hero (topo do index)
        if (heroBookContainer && livros.length > 0) {

    const livro = livros[0];

    heroBookContainer.innerHTML = `
    <p>${livro.capa}</p>
`;
}


        edicoesContainer.innerHTML = livros.map(livro => `
    <div class="edicao-card">

        <div class="edicao-thumb">
            <img
                src="${livro.capa || 'https://picsum.photos/300/450'}"
                alt="${livro.titulo}">
        </div>

        <div class="edicao-info">

            <p class="edicao-volume">
                ${livro.volume || ''}
            </p>

            <h3 class="edicao-title">
                ${livro.titulo || ''}
            </h3>

            <p class="edicao-descricao">
                ${livro.descricao || ''}
            </p>

        </div>

    </div>
`).join('');

    } catch (erro) {
        console.error("Erro ao carregar biblioteca no Index:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarBiblioteca();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});


function obterBibliotecaBackup() {
    return [
        {
            titulo: "Somos Mulheres em movimento",
            descricao: "15 mulheres, 15 histórias de superação e o nascimento do nosso movimento.",
            capa: "smm.jpg",
            volume: "Vol. 1",
            destaque: true,
            emBreve: false,
            ordem: 1
        },
        {
            titulo: "Mulheres em Movimento 2ª edição",
            descricao: "Breve lançamento. Novas vozes trazendo relatos potentes sobre coragem.",
            capa: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400",
            volume: "Vol. 2",
            destaque: false,
            emBreve: true,
            ordem: 2
        }
    ];
}


function configurarNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nome = document.getElementById('nlNome').value;
        const email = document.getElementById('nlEmail').value;
        const canal = document.getElementById('nlCanal').value;


        try {
            await addDoc(collection(db, "inscritos_newsletter"), {
                nome: nome,
                email: email,
                canalPreferido: canal,
                data: new Date().toISOString()
            });
        } catch (err) {
            console.warn("Salvando localmente (Firestore não configurado):", err);
        }


        if (canal === 'whatsapp') {
            const numeroWhatsapp = "5500000000000"; 
            
            const textoMsg = `Olá! Meu nome é *${nome}* (${email}). Quero receber o material gratuito da comunidade!`;
            alert("Inscrição realizada! Você será direcionada ao WhatsApp.");
            window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(textoMsg)}`, '_blank');
        } else {
            const emailComunidade = "contato@somosmulheresemmovimento.com.br";
            const assunto = "Solicitação de Material Gratuidade";
            const corpo = `Olá! Meu nome é ${nome} (${email}). Gostaria de receber os materiais gratuitos.`;
            alert("Inscrição realizada! Seu aplicativo de e-mail será aberto.");
            window.location.href = `mailto:${emailComunidade}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
        }

        form.reset();
    });
}


document.addEventListener("DOMContentLoaded", () => {
    carregarBiblioteca();
    configurarNewsletter();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});