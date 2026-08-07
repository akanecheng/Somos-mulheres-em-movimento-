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


async function carregarBiblioteca() {
    const edicoesContainer = document.getElementById('edicoes-container');
    const heroBookContainer = document.getElementById('hero-book-container');
    
    if (!edicoesContainer || !heroBookContainer) return;

    try {
        const q = query(collection(db, "livros"), orderBy("ordem", "asc"));
        const querySnapshot = await getDocs(q);
        
        let livros = [];
        querySnapshot.forEach((doc) => {
            livros.push({ id: doc.id, ...doc.data() });
        });
        
        console.log("LIVROS CARREGADOS:", livros);

        if (livros.length === 0) {
            livros = obterBibliotecaBackup();
        }

        edicoesContainer.innerHTML = "";
        heroBookContainer.innerHTML = "";

        livros.forEach((livro) => {
            
            if (livro.destaque) {
                heroBookContainer.innerHTML = `
                    <div class="book-cover-mockup">
                        <img src="${livro.capa || 'smm.jpg'}" alt="Capa Atual" />
                        <div class="volume-badge">Vol 1</div>
                    </div>
                `;
                const titleEl = document.getElementById('hero-title');
                const descEl = document.getElementById('hero-desc');
                if (titleEl) titleEl.textContent = livro.titulo;
                if (descEl) descEl.textContent = livro.descricao;
            }

            
            const bookCard = document.createElement('div');
            bookCard.className = `book-card ${livro.emBreve ? 'future' : ''}`;

            bookCard.innerHTML = `
                <div class="book-card-cover">
                    <img src="${livro.capa || 'smm.jpg'}" alt="${livro.titulo}" />
                    <span>${livro.volume || ''}</span>
                </div>
                <div class="book-card-info">
                    <h3>${livro.titulo}</h3>
                    <p>${livro.descricao}</p>
                    ${livro.emBreve 
                        ? `<span class="badge-status">Em Breve</span>` 
                        : `<a href="comunidade.html?id=${livro.id}" class="btn-link">Ver Detalhes e Autoras →</a>`
                    }
                </div>
            `;
            edicoesContainer.appendChild(bookCard);
        });

        // 3. Card de chamada para novas autoras
        const ctaCard = document.createElement('div');
        ctaCard.className = "book-card call-to-action";
        ctaCard.innerHTML = `
            <div class="cta-card-content">
                <h4>Quer ver sua história aqui?</h4>
                <p>As inscrições para a seleção de novos volumes estão abertas.</p>
                <a href="contatos.html" class="btn-primary rose">Quero ser Coautora</a>
            </div>
        `;
        edicoesContainer.appendChild(ctaCard);

    } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
    }
}


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