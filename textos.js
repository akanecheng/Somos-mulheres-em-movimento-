const firebaseConfig = {
    apiKey: "AIzaSyDOOPrODo46x_VqXNUdvwq38wYK1TCkJXA",
    authDomain: "mariana-jamilly.firebaseapp.com",
    projectId: "mariana-jamilly",
    storageBucket: "mariana-jamilly.firebasestorage.app",
    messagingSenderId: "983935199953",
    appId: "1:983935199953:web:7b83c279b809056218b3f0"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Função para redimensionar e comprimir imagens antes de enviar
function comprimirImagem(file, maxWidth = 800, maxHeight = 800, qualidade = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', qualidade));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

// Ouvintes dos inputs de arquivo com compressão
['heroImagemFile', 'perfilSecundarioImagemFile', 'livroImagemFile'].forEach(fileInputId => {
    const hiddenInputId = fileInputId.replace('File', '');
    const element = document.getElementById(fileInputId);
    if (element) {
        element.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const base64Comprimida = await comprimirImagem(file);
                    document.getElementById(hiddenInputId).value = base64Comprimida;
                } catch (err) {
                    console.error("Erro ao processar imagem:", err);
                    alert("Erro ao carregar a imagem. Tente outra foto.");
                }
            }
        });
    }
});

function adicionarParagrafo(containerId, valor = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <textarea class="form-control" placeholder="Escreva o parágrafo...">${valor}</textarea>
        <button type="button" class="btn-remove" onclick="removerItem(this)">×</button>
    `;
    container.appendChild(newItem);
}

function removerItem(button) {
    button.parentElement.remove();
}

function extrairParagrafos(containerId) {
    const list = [];
    const textareas = document.querySelectorAll(`#${containerId} textarea`);
    textareas.forEach(ta => {
        if (ta.value.trim() !== '') list.push(ta.value.trim());
    });
    return list;
}

async function carregarDados() {
    try {
        const colecoes = ['hero', 'perfilSecundario', 'bio', 'livro', 'devocional'];
        for (const col of colecoes) {
            const snapshot = await db.collection(col).get();
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                preencherFormulario(col, data);
            }
        }
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
}

function preencherFormulario(secao, data) {
    if (secao === 'hero') {
        if (data.subtitulo) document.getElementById('heroSubtitulo').value = data.subtitulo;
        if (data.titulo) document.getElementById('heroTitulo').value = data.titulo;
        if (data.autora) document.getElementById('heroAutora').value = data.autora;
        if (data.imagem) document.getElementById('heroImagem').value = data.imagem;
    }
    if (secao === 'perfilSecundario') {
        if (data.titulo) document.getElementById('perfilSecundarioTitulo').value = data.titulo;
        if (data.imagem) document.getElementById('perfilSecundarioImagem').value = data.imagem;
        if (data.paragrafos) data.paragrafos.forEach(p => adicionarParagrafo('containerPerfilSecundario', p));
    }
    if (secao === 'bio') {
        if (data.titulo) document.getElementById('bioTitulo').value = data.titulo;
        if (data.paragrafos) data.paragrafos.forEach(p => adicionarParagrafo('containerBio', p));
    }
    if (secao === 'livro') {
        if (data.titulo) document.getElementById('livroTitulo').value = data.titulo;
        if (data.descricao) document.getElementById('livroDescricao').value = data.descricao;
        if (data.link) document.getElementById('livroLink').value = data.link;
        if (data.imagem) document.getElementById('livroImagem').value = data.imagem;
    }
    if (secao === 'devocional') {
        if (data.titulo) document.getElementById('devocionalTitulo').value = data.titulo;
        if (data.link) document.getElementById('devocionalLink').value = data.link;
        if (data.paragrafos) data.paragrafos.forEach(p => adicionarParagrafo('containerDevocional', p));
    }
}

async function salvarFirebase() {
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.innerText = "Salvando alterações...";

    try {
        const bioDocs = await db.collection('bio').get();
        const bioRef = bioDocs.empty ? db.collection('bio').doc() : bioDocs.docs[0].ref;
        await bioRef.set({
            titulo: document.getElementById('bioTitulo').value,
            paragrafos: extrairParagrafos('containerBio')
        });

        const heroDocs = await db.collection('hero').get();
        const heroRef = heroDocs.empty ? db.collection('hero').doc() : heroDocs.docs[0].ref;
        await heroRef.set({
            subtitulo: document.getElementById('heroSubtitulo').value,
            titulo: document.getElementById('heroTitulo').value,
            autora: document.getElementById('heroAutora').value,
            imagem: document.getElementById('heroImagem').value
        });

        const perfilDocs = await db.collection('perfilSecundario').get();
        const perfilRef = perfilDocs.empty ? db.collection('perfilSecundario').doc() : perfilDocs.docs[0].ref;
        await perfilRef.set({
            titulo: document.getElementById('perfilSecundarioTitulo').value,
            imagem: document.getElementById('perfilSecundarioImagem').value,
            paragrafos: extrairParagrafos('containerPerfilSecundario')
        });

        const livroDocs = await db.collection('livro').get();
        const livroRef = livroDocs.empty ? db.collection('livro').doc() : livroDocs.docs[0].ref;
        await livroRef.set({
            titulo: document.getElementById('livroTitulo').value,
            descricao: document.getElementById('livroDescricao').value,
            link: document.getElementById('livroLink').value,
            imagem: document.getElementById('livroImagem').value
        });

        const devDocs = await db.collection('devocional').get();
        const devRef = devDocs.empty ? db.collection('devocional').doc() : devDocs.docs[0].ref;
        await devRef.set({
            titulo: document.getElementById('devocionalTitulo').value,
            link: document.getElementById('devocionalLink').value,
            paragrafos: extrairParagrafos('containerDevocional')
        });

        statusMsg.innerText = "Salvo com sucesso!";
        setTimeout(() => statusMsg.innerText = "Pronto para atualizar", 3000);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        statusMsg.innerText = "Erro ao salvar!";
    }
}

carregarDados();