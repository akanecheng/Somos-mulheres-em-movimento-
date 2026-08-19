import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const docRef = doc(db, "livros", "livroPrincipal");

// Função auxilar para pegar elemento com segurança
const getEl = (id) => document.getElementById(id);

async function carregarDados() {
  try {
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn("O documento 'livroPrincipal' ainda não foi criado no banco.");
      return;
    }

    const dados = snap.data();

    // Preenche apenas se o elemento existir no HTML
    if (getEl("hero-title-input")) getEl("hero-title-input").value = dados.hero?.titulo || "";
    if (getEl("hero-desc-input"))  getEl("hero-desc-input").value = dados.hero?.descricao || "";
    if (getEl("about-title-input")) getEl("about-title-input").value = dados.sobre?.titulo || "";
    if (getEl("about-p1-input"))    getEl("about-p1-input").value = dados.sobre?.p1 || "";
    if (getEl("about-p2-input"))    getEl("about-p2-input").value = dados.sobre?.p2 || "";

  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
  }
}

async function salvarDados(e) {
  if (e) e.preventDefault(); // Evita recarregar a página se for dentro de um <form>

  // Captura os valores atuais dos campos
  const heroTitle = getEl("hero-title-input")?.value.trim() || "";
  const heroDesc  = getEl("hero-desc-input")?.value.trim() || "";
  const aboutTitle = getEl("about-title-input")?.value.trim() || "";
  const aboutP1   = getEl("about-p1-input")?.value.trim() || "";
  const aboutP2   = getEl("about-p2-input")?.value.trim() || "";

  // TRAVA DE SEGURANÇA: Impede salvar se TODOS os campos estiverem completamente vazios
  if (!heroTitle && !heroDesc && !aboutTitle && !aboutP1 && !aboutP2) {
    alert("Atenção: Os campos estão vazios. Digite algum texto antes de salvar para não apagar o banco.");
    return;
  }

  try {
    await setDoc(docRef, {
      hero: {
        titulo: heroTitle,
        descricao: heroDesc
      },
      sobre: {
        titulo: aboutTitle,
        p1: aboutP1,
        p2: aboutP2
      }
    }, { merge: true });

    alert("Textos salvos com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar no Firestore:", erro);
    alert("Erro ao salvar: " + erro.message);
  }
}

// Aguarda o HTML carregar completamente antes de rodar os scripts
document.addEventListener("DOMContentLoaded", () => {
  const btnSalvar = getEl("btn-salvar");
  
  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarDados);
  }

  carregarDados();
});