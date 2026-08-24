import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function carregarTextosHome() {
    try {
        // Agora busca no novo documento da coleção "conteudo_site"
        const docRef = doc(db, "conteudo_site", "secao_sobre");
        const docSnap = await getDoc(docRef);
        
        console.log("HOME.JS EXECUTOU");
        console.log("NOVO BANCO - CONTEUDO_SITE / SECAO_SOBRE");

        console.log("Documento existe?", docSnap.exists());

        if (docSnap.exists()) {
            const data = docSnap.data();

            console.log("Dados recebidos:", data);

            // 1. Atualiza o Hero (caso você também salve o Hero neste novo documento)
            if (data.hero) {
                const heroTitleEl = document.getElementById("hero-title");
                const heroDescEl = document.getElementById("hero-desc");

                if (heroTitleEl && data.hero.titulo) {
                    heroTitleEl.textContent = data.hero.titulo;
                }
                if (heroDescEl && data.hero.descricao) {
                    heroDescEl.textContent = data.hero.descricao;
                }
            }

            // 2. Atualiza a seção "Sobre Nós" a partir dos novos campos
            const aboutTitleEl = document.getElementById("about-title");
            const aboutP1El = document.getElementById("about-p1");
            const aboutP2El = document.getElementById("about-p2");

            // Atualiza o subtítulo caso exista no HTML/banco
            const aboutSubtitleEl = document.querySelector(".about-text .subtitle");
            if (aboutSubtitleEl && data.subtitulo) {
                aboutSubtitleEl.textContent = data.subtitulo;
            }

            if (aboutTitleEl && data.titulo) {
                aboutTitleEl.textContent = data.titulo;
            }
            if (aboutP1El && (data.paragrafo1 || data.p1)) {
                aboutP1El.textContent = data.paragrafo1 || data.p1;
            }
            if (aboutP2El && (data.paragrafo2 || data.p2)) {
                aboutP2El.textContent = data.paragrafo2 || data.p2;
            }
        } else {
            console.warn("Documento 'secao_sobre' não encontrado na coleção 'conteudo_site'.");
        }
    } catch (erro) {
        console.log("ERRO DETALHADO:");
        console.error(erro);
    }
}

// Executa assim que a página carregar
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", carregarTextosHome);
} else {
    carregarTextosHome();
}