import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function testar() {
    try {
        const livro = await getDoc(doc(db, "livros", "livroPrincipal"));

        if (livro.exists()) {
            console.log("Firebase conectado!");
            console.log(livro.data());
        } else {
            console.log("Documento não encontrado.");
        }

    } catch (erro) {
        console.error(erro);
    }
}

testar();