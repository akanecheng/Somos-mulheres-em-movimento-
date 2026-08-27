console.log("livro.js carregou");

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const COLECAO = "livroDestaque";
const DOCUMENTO = "thdJNPxtPDmigMSEklTS";

const inputFile = document.getElementById("file-imagem");
const formLivro = document.getElementById("form-livro");
const containerPreview = document.getElementById("container-preview");
const btnSubmit = document.getElementById("btn-submit");

let imagemBase64 = "";

/* ===========================
   CARREGAR CAPA
=========================== */

async function carregarCapa() {
    try {
        const ref = doc(db, COLECAO, DOCUMENTO);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            console.log("Documento não encontrado");
            return;
        }

        const dados = snap.data();

        if (!dados.capa) return;

        if (containerPreview) {
            containerPreview.innerHTML =
                `<img src="${dados.capa}" alt="Capa">`;
        }

        if (heroBookContainer) {
            heroBookContainer.innerHTML = `
                <div class="book-cover-mockup">
                    <span class="volume-badge">
                        Volume atual
                    </span>

                    <img
                        src="${dados.capa}"
                        alt="Volume atual">
                </div>
            `;
        }

    } catch (erro) {
        console.error("Erro ao carregar:", erro);
    }
}

/* ===========================
   COMPRIMIR IMAGEM
=========================== */

function comprimirImagem(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function(e) {

            const img = new Image();

            img.onload = function() {

                const canvas =
                    document.createElement("canvas");

                const ctx =
                    canvas.getContext("2d");

                let largura = img.width;
                let altura = img.height;

                const MAX_LARGURA = 500;
                const MAX_ALTURA = 700;

                if (largura > MAX_LARGURA) {
                    altura =
                        altura *
                        (MAX_LARGURA / largura);

                    largura = MAX_LARGURA;
                }

                if (altura > MAX_ALTURA) {
                    largura =
                        largura *
                        (MAX_ALTURA / altura);

                    altura = MAX_ALTURA;
                }

                canvas.width = largura;
                canvas.height = altura;

                ctx.drawImage(
                    img,
                    0,
                    0,
                    largura,
                    altura
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        0.6
                    )
                );
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });
}

/* ===========================
   PRÉVIA
=========================== */

if (inputFile) {

    inputFile.addEventListener(
        "change",
        async (e) => {

            const arquivo =
                e.target.files[0];

            if (!arquivo) return;

            containerPreview.innerHTML =
                "<p>Processando imagem...</p>";

            imagemBase64 =
                await comprimirImagem(arquivo);

            containerPreview.innerHTML =
                `<img src="${imagemBase64}">`;
        }
    );
}

/* ===========================
   SALVAR
=========================== */

if (formLivro) {

    formLivro.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            if (!imagemBase64) {

                alert(
                    "Selecione uma imagem."
                );

                return;
            }

            try {

                btnSubmit.disabled = true;
                btnSubmit.textContent =
                    "Salvando...";

                const ref =
                    doc(
                        db,
                        COLECAO,
                        DOCUMENTO
                    );

                await setDoc(
                    ref,
                    {
                        capa: imagemBase64
                    },
                    {
                        merge: true
                    }
                );

                alert(
                    "Capa salva com sucesso!"
                );

                carregarCapa();

            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao salvar."
                );

            } finally {

                btnSubmit.disabled = false;

                btnSubmit.textContent =
                    "Salvar Nova Capa";
            }
        }
    );
}

carregarCapa();