import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

console.log("livro-home.js carregou");

const heroBookContainer =
    document.getElementById("hero-book-container");

async function carregarLivroDestaque() {

    if (!heroBookContainer) {
        console.log("Container do livro não encontrado.");
        return;
    }

    try {

        const ref = doc(
    db,
    "livroDestaque",
    "thdJNPxtPDmigMSEklTS"
);

        const snap = await getDoc(ref);

        console.log("Documento do livro existe?", snap.exists());

        if (!snap.exists()) {
            console.log("Livro destaque não encontrado.");
            return;
        }

        const dados = snap.data();

        console.log("Dados do livro:", dados);

        if (!dados.capa) {
            console.log("O documento não possui uma capa.");
            return;
        }

        heroBookContainer.innerHTML = `
            <div class="book-cover-mockup">

                <span class="volume-badge">
                    Livro em Destaque
                </span>

                <img
                    src="${dados.capa}"
                    alt="Livro em destaque">

            </div>
        `;

        console.log("Capa do livro colocada no Index.");

    } catch (erro) {

        console.error(
            "Erro ao carregar capa no Index:",
            erro
        );

    }
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        carregarLivroDestaque
    );

} else {

    carregarLivroDestaque();

}