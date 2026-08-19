import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function carregarTextosHome() {
    try {
        const docRef = doc(db, "livros", "livroPrincipal");
        const docSnap = await getDoc(docRef);
        
        console.log("HOME.JS EXECUTOU");
        console.log("VERSAO HOME 16-08-TESTE");

console.log("Documento existe?", docSnap.exists());


        if (docSnap.exists()) {
    const data = docSnap.data();

    console.log("Dados recebidos:", data);
    console.log("Hero:", data.hero);
    console.log("Sobre:", data.sobre);




            // 1. Atualiza o Hero (Título e Subtítulo)
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

            // 2. Atualiza o Sobre Nós
            if (data.sobre) {
                const aboutTitleEl = document.getElementById("about-title");
                const aboutP1El = document.getElementById("about-p1");
                const aboutP2El = document.getElementById("about-p2");

                if (aboutTitleEl && data.sobre.titulo) aboutTitleEl.textContent = data.sobre.titulo;
                if (aboutP1El && data.sobre.p1) aboutP1El.textContent = data.sobre.p1;
                if (aboutP2El && data.sobre.p2) aboutP2El.textContent = data.sobre.p2;
            }
        }
    } catch (erro) {
    console.log("ERRO DETALHADO");
    console.log(erro);
    console.log(erro.message);
    console.log(erro.stack);
}
}

// Executa assim que a página carregar
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", carregarTextosHome);
} else {
    carregarTextosHome();
}