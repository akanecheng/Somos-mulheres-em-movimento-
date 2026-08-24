import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// 1. ALTERADO: Nova coleção "conteudo_site" e documento "secao_sobre"
const docRef = doc(db, "conteudo_site", "secao_sobre");

// Função auxiliar para pegar elemento com segurança
const getEl = (id) => document.getElementById(id);

async function carregarDados() {
  try {
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.warn("O documento 'secao_sobre' ainda não foi criado na coleção 'conteudo_site'.");
      return;
    }

    const dados = snap.data();

    // 2. Preenche os inputs com os novos campos do banco
    if (getEl("hero-title-input"))   getEl("hero-title-input").value = dados.hero?.titulo || "";
    if (getEl("hero-desc-input"))    getEl("hero-desc-input").value = dados.hero?.descricao || "";
    
    // Campos do Sobre Nós (com suporte a subtítulo)
    if (getEl("about-subtitle-input")) getEl("about-subtitle-input").value = dados.subtitulo || "";
    if (getEl("about-title-input"))    getEl("about-title-input").value = dados.titulo || "";
    if (getEl("about-p1-input"))       getEl("about-p1-input").value = dados.paragrafo1 || dados.p1 || "";
    if (getEl("about-p2-input"))       getEl("about-p2-input").value = dados.paragrafo2 || dados.p2 || "";

  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
  }
}

async function salvarDados(e) {
  if (e) e.preventDefault(); // Evita recarregar a página se for dentro de um <form>

  // Captura os valores dos campos do formulário
  const heroTitle     = getEl("hero-title-input")?.value.trim() || "";
  const heroDesc      = getEl("hero-desc-input")?.value.trim() || "";
  
  const aboutSubtitle = getEl("about-subtitle-input")?.value.trim() || "";
  const aboutTitle    = getEl("about-title-input")?.value.trim() || "";
  const aboutP1       = getEl("about-p1-input")?.value.trim() || "";
  const aboutP2       = getEl("about-p2-input")?.value.trim() || "";

  // TRAVA DE SEGURANÇA: Impede salvar se TODOS os campos estiverem completamente vazios
  if (!heroTitle && !heroDesc && !aboutSubtitle && !aboutTitle && !aboutP1 && !aboutP2) {
    alert("Atenção: Os campos estão vazios. Digite algum texto antes de salvar para não apagar o banco.");
    return;
  }

  try {
    // 3. ALTERADO: Salva os dados na nova estrutura
    await setDoc(docRef, {
      hero: {
        titulo: heroTitle,
        descricao: heroDesc
      },
      subtitulo: aboutSubtitle,
      titulo: aboutTitle,
      paragrafo1: aboutP1,
      paragrafo2: aboutP2,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });

    alert("Textos salvos com sucesso na nova estrutura!");
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