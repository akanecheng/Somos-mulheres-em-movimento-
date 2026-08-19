import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

const form = document.getElementById('book-form');
const bookIdInput = document.getElementById('book-id');
const titleInput = document.getElementById('book-title');
const volumeInput = document.getElementById('book-volume');
const descInput = document.getElementById('book-desc');
const coverFileInput = document.getElementById('book-cover-file');
const coverUrlInput = document.getElementById('book-cover-url');
const formTitle = document.getElementById('form-title');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const booksList = document.getElementById('admin-books-list');
const coverPreviewContainer = document.getElementById('cover-preview-container');
const coverPreview = document.getElementById('cover-preview');

// Evento para pré-visualizar a foto assim que for selecionada
if (coverFileInput) {
    coverFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                coverPreview.src = event.target.result;
                coverPreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Converter arquivo da galeria em string Base64
function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Carregar lista de livros
async function carregarListaAdmin() {
    if (!booksList) return;
    booksList.innerHTML = '<p>Carregando livros...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "livros"));
        let livros = [];
        querySnapshot.forEach((docSnap) => {
            livros.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (livros.length === 0) {
            booksList.innerHTML = '<p>Nenhum livro cadastrado ainda.</p>';
            return;
        }

        booksList.innerHTML = livros.map(livro => `
            <div class="book-item-admin">
                <img src="${livro.capa || 'https://picsum.photos/50/75'}" alt="${livro.titulo}">
                <div class="book-item-info">
                    <h4>${livro.titulo}</h4>
                    <p>${livro.volume || ''}</p>
                </div>
                <div class="book-item-actions">
                    <button type="button" class="btn-edit" 
                        data-id="${livro.id}" 
                        data-titulo="${livro.titulo || ''}" 
                        data-volume="${livro.volume || ''}" 
                        data-descricao="${livro.descricao || ''}" 
                        data-capa="${livro.capa || ''}">Editar</button>
                    <button type="button" class="btn-delete" data-id="${livro.id}">Excluir</button>
                </div>
            </div>
        `).join('');

        vincularEventos();
    } catch (err) {
        console.error("Erro ao carregar lista:", err);
        booksList.innerHTML = '<p>Erro ao carregar os livros. Verifique se o Firestore está configurado.</p>';
    }
}

function vincularEventos() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.btn-edit');
            const d = targetBtn.dataset;
            bookIdInput.value = d.id;
            titleInput.value = d.titulo;
            volumeInput.value = d.volume;
            descInput.value = d.descricao;
            coverUrlInput.value = d.capa;

            if (d.capa) {
                coverPreview.src = d.capa;
                coverPreviewContainer.style.display = 'block';
            }

            formTitle.textContent = "Editar Livro";
            btnCancel.style.display = "inline-block";
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const targetBtn = e.target.closest('.btn-delete');
            const id = targetBtn.dataset.id;
            if (confirm("Deseja realmente excluir este livro?")) {
                try {
                    await deleteDoc(doc(db, "livros", id));
                    carregarListaAdmin();
                } catch (err) {
                    alert("Erro ao excluir livro: " + err.message);
                }
            }
        });
    });
}

// Evento de envio do formulário
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btnSave.disabled = true;
        btnSave.textContent = "Salvando...";

        try {
            let capaFinalUrl = coverUrlInput.value;

            // Converte a imagem para Base64 se o usuário selecionou uma nova
            if (coverFileInput.files.length > 0) {
                const file = coverFileInput.files[0];
                if (file.size > 1000000) { // Trava arquivos maiores que 1MB
                    alert("A imagem selecionada é muito grande! Escolha uma de até 1MB.");
                    btnSave.disabled = false;
                    btnSave.textContent = "Salvar Livro";
                    return;
                }
                capaFinalUrl = await converterParaBase64(file);
            }

            const id = bookIdInput.value;
            const data = {
                titulo: titleInput.value,
                volume: volumeInput.value,
                descricao: descInput.value,
                capa: capaFinalUrl
            };

            if (id) {
                await updateDoc(doc(db, "livros", id), data);
            } else {
                await addDoc(collection(db, "livros"), data);
            }

            alert("Livro salvo com sucesso!");
            resetForm();
            carregarListaAdmin();
        } catch (error) {
            console.error("Erro ao salvar livro:", error);
            alert("Erro ao salvar no Firestore: " + error.message);
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = "Salvar Livro";
        }
    });
}

btnCancel.addEventListener('click', resetForm);

function resetForm() {
    bookIdInput.value = '';
    coverUrlInput.value = '';
    form.reset();
    coverPreviewContainer.style.display = 'none';
    formTitle.textContent = "Adicionar Novo Livro";
    btnCancel.style.display = "none";
}

document.addEventListener("DOMContentLoaded", carregarListaAdmin);