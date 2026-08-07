// --- DADOS PADRÃO DA BIBLIOTECA ---
const bibliotecaPadrao = [
    {
        id: "1",
        titulo: "Mulheres em Movimento – Vol. 1",
        subtitulo: "PROPÓSITO · CORAGEM · TRANSFORMAÇÃO",
        descricao: "Um devocional para mulheres que desejam sair do lugar e viver tudo o que Deus sonhou para elas.",
        capa: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400",
        volume: "VOL. 1",
        destaque: true,
        emBreve: false
    },
    {
        id: "2",
        titulo: "Mulheres em Movimento – Vol. 2",
        subtitulo: "FORÇA · RESILIÊNCIA · FÉ",
        descricao: "Em breve mais um volume para fortalecer ainda mais sua jornada.",
        capa: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400",
        volume: "VOL. 2",
        destaque: false,
        emBreve: true
    }
];

// Carrega do LocalStorage ou define o padrão
function carregarDados() {
    const dados = localStorage.getItem('biblioteca_livros');
    if (!dados) {
        localStorage.setItem('biblioteca_livros', JSON.stringify(bibliotecaPadrao));
        return bibliotecaPadrao;
    }
    return JSON.parse(dados);
}

// Salva no LocalStorage e atualiza a tela
function salvarDados(lista) {
    localStorage.setItem('biblioteca_livros', JSON.stringify(lista));
    renderizarPainel();
}

// Redimensiona imagem da galeria do celular para caber na memória sem travar
function redimensionarEConverterImagem(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxLardura = 400;
                const maxAltura = 600;

                if (width > height) {
                    if (width > maxLardura) {
                        height *= maxLardura / width;
                        width = maxLardura;
                    }
                } else {
                    if (height > maxAltura) {
                        width *= maxAltura / height;
                        height = maxAltura;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Renderiza a interface do painel
function renderizarPainel() {
    const livros = carregarDados();

    // 1. RENDERIZA LIVRO EM DESTAQUE (LIVRO ATUAL DA INDEX)
    const destaque = livros.find(l => l.destaque) || livros[0];
    if (destaque) {
        const featTitle = document.getElementById('feat-title');
        const featTags = document.getElementById('feat-tags');
        const featDesc = document.getElementById('feat-desc');
        const featImg = document.querySelector('#featured-display img');

        if (featTitle) featTitle.textContent = destaque.titulo;
        if (featTags) featTags.textContent = destaque.subtitulo;
        if (featDesc) featDesc.textContent = destaque.descricao;
        if (featImg) featImg.src = destaque.capa;
    }

    // 2. RENDERIZA A LISTA DE EDICÕES (CARDS)
    const listDisplay = document.getElementById('list-display');
    if (listDisplay) {
        listDisplay.innerHTML = "";
        livros.forEach((livro) => {
            const row = document.createElement('div');
            row.className = "book-row-item";
            row.innerHTML = `
                <img class="mini-cover" src="${livro.capa}" alt="${livro.titulo}">
                <div class="row-info">
                    <div style="display:flex; gap:8px; align-items:center; margin-bottom: 5px;">
                        <span class="vol-badge" style="${livro.emBreve ? 'background:#888;' : ''}">${livro.volume || 'VOL.'}</span>
                        <span class="vol-badge ${livro.emBreve ? 'soon' : ''}">${livro.emBreve ? 'EM BREVE' : 'DISPONÍVEL'}</span>
                        ${livro.destaque ? '<span style="color:var(--dourado); font-size:0.8rem; font-weight:bold;">★ DESTAQUE INDEX</span>' : ''}
                    </div>
                    <h4>${livro.titulo}</h4>
                    <p>${livro.descricao}</p>
                </div>
                <div class="item-controls">
                    <button class="btn-action-outline" style="padding: 6px 12px;" onclick="window.abrirModalEdicao('${livro.id}')">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    ${!livro.destaque ? `<button class="btn-action-outline" style="padding: 6px 12px; border-color:var(--dourado); color:var(--dourado);" onclick="window.definirComoDestaque('${livro.id}')">
                        <i class="fa-solid fa-star"></i> Destacar
                    </button>` : ''}
                    <button class="btn-icon" onclick="window.excluirLivro('${livro.id}')" title="Excluir">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            listDisplay.appendChild(row);
        });
    }

    // 3. RENDERIZA LISTA DE ORDENAÇÃO
    const orderDisplay = document.getElementById('order-display');
    if (orderDisplay) {
        orderDisplay.innerHTML = "";
        livros.forEach((livro, index) => {
            const item = document.createElement('div');
            item.className = "order-item";
            item.innerHTML = `
                <div class="order-item-left">
                    <div class="order-num">${index + 1}</div>
                    <div class="order-name">${livro.titulo} ${livro.emBreve ? '(Em breve)' : ''}</div>
                </div>
                <div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>
            `;
            orderDisplay.appendChild(item);
        });
    }
}

// --- ESTRUTURA DO MODAL DE EDIÇÃO COM PREVIEW ---
function criarModalEdicao() {
    if (document.getElementById('modal-editor-livro')) return;

    const modalHTML = `
    <div id="modal-editor-livro" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; padding:20px; box-sizing:border-box;">
        <div style="background:#fff; width:100%; max-width:650px; border-radius:12px; padding:25px; max-height:90vh; overflow-y:auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h3 id="modal-titulo-acao" style="margin-top:0; font-family:var(--fonte-titulo); color:var(--texto-escuro);">Editar Livro</h3>
            
            <input type="hidden" id="edit-id">

            <div style="background:var(--bg-creme); border:1px dashed var(--rosa-escuro); padding:15px; border-radius:8px; margin-bottom:20px;">
                <span style="font-size:0.75rem; font-weight:bold; color:var(--rosa-escuro); text-transform:uppercase;">Preview em tempo real</span>
                <div style="display:flex; gap:15px; margin-top:10px; align-items:center;">
                    <img id="prev-capa" src="" style="width:70px; height:95px; object-fit:cover; border-radius:6px; background:#e0e0e0;">
                    <div>
                        <div style="display:flex; gap:6px; margin-bottom:4px;">
                            <span id="prev-vol" class="vol-badge">VOL. 1</span>
                            <span id="prev-status" class="vol-badge">DISPONÍVEL</span>
                        </div>
                        <h4 id="prev-titulo" style="margin:0; font-size:1rem; color:var(--texto-escuro);">Título do Livro</h4>
                        <p id="prev-subtitulo" style="margin:2px 0; font-size:0.75rem; color:var(--dourado); font-weight:bold;">SUBTÍTULO / TAGS</p>
                        <p id="prev-desc" style="margin:0; font-size:0.8rem; color:var(--texto-suave);">Descrição curta...</p>
                    </div>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <label style="font-size:0.85rem; font-weight:bold;">Imagem da Capa (Galeria do Celular):</label>
                    <input type="file" id="edit-file-input" accept="image/*" style="width:100%; margin-top:4px;">
                </div>

                <div style="display:flex; gap:10px;">
                    <div style="flex:1;">
                        <label style="font-size:0.85rem; font-weight:bold;">Volume:</label>
                        <input type="text" id="edit-volume" placeholder="Ex: VOL. 1" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:0.85rem; font-weight:bold;">Status:</label>
                        <select id="edit-status" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
                            <option value="false">Disponível / Atual</option>
                            <option value="true">Em breve</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size:0.85rem; font-weight:bold;">Título:</label>
                    <input type="text" id="edit-titulo" placeholder="Título da obra" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
                </div>

                <div>
                    <label style="font-size:0.85rem; font-weight:bold;">Subtítulo / Tags (Destaque Index):</label>
                    <input type="text" id="edit-subtitulo" placeholder="Ex: PROPÓSITO · CORAGEM" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px;">
                </div>

                <div>
                    <label style="font-size:0.85rem; font-weight:bold;">Descrição:</label>
                    <textarea id="edit-desc" rows="3" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; resize:vertical;"></textarea>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
                    <button type="button" onclick="window.fecharModalEdicao()" style="padding:10px 18px; border:1px solid #ccc; background:transparent; border-radius:6px; cursor:pointer;">Cancelar</button>
                    <button type="button" id="btn-salvar-modal" style="padding:10px 20px; background:var(--rosa-escuro); color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Salvar Alterações</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const atualizarPreview = () => {
        document.getElementById('prev-titulo').textContent = document.getElementById('edit-titulo').value || 'Título do Livro';
        document.getElementById('prev-subtitulo').textContent = document.getElementById('edit-subtitulo').value || 'SUBTÍTULO / TAGS';
        document.getElementById('prev-desc').textContent = document.getElementById('edit-desc').value || 'Descrição curta...';
        document.getElementById('prev-vol').textContent = document.getElementById('edit-volume').value || 'VOL.';
        
        const isSoon = document.getElementById('edit-status').value === 'true';
        const statusEl = document.getElementById('prev-status');
        statusEl.textContent = isSoon ? 'EM BREVE' : 'DISPONÍVEL';
        statusEl.className = isSoon ? 'vol-badge soon' : 'vol-badge';
    };

    ['edit-titulo', 'edit-subtitulo', 'edit-desc', 'edit-volume', 'edit-status'].forEach(id => {
        document.getElementById(id).addEventListener('input', atualizarPreview);
        document.getElementById(id).addEventListener('change', atualizarPreview);
    });

    document.getElementById('edit-file-input').addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const imgRedimensionada = await redimensionarEConverterImagem(e.target.files[0]);
            document.getElementById('prev-capa').src = imgRedimensionada;
        }
    });

    document.getElementById('btn-salvar-modal').addEventListener('click', window.salvarEdicaoModal);
}

// --- FUNÇÕES EXPOSTAS GLOBALMENTE ---

window.abrirModalNovoLivro = function() {
    criarModalEdicao();
    const livros = carregarDados();
    
    document.getElementById('modal-titulo-acao').textContent = "Adicionar Novo Livro";
    document.getElementById('edit-id').value = "";
    document.getElementById('edit-titulo').value = "";
    document.getElementById('edit-subtitulo').value = "PROPÓSITO · INSPIRAÇÃO";
    document.getElementById('edit-desc').value = "";
    document.getElementById('edit-volume').value = "VOL. " + (livros.length + 1);
    document.getElementById('edit-status').value = "false";
    document.getElementById('edit-file-input').value = "";
    document.getElementById('prev-capa').src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400";

    document.getElementById('edit-titulo').dispatchEvent(new Event('input'));
    document.getElementById('modal-editor-livro').style.display = 'flex';
};

window.abrirModalEdicao = function(id) {
    criarModalEdicao();
    const livros = carregarDados();
    let target = id === 'feat' ? (livros.find(l => l.destaque) || livros[0]) : livros.find(l => l.id === id);

    if (!target) return;

    document.getElementById('modal-titulo-acao').textContent = "Editar Livro";
    document.getElementById('edit-id').value = target.id;
    document.getElementById('edit-titulo').value = target.titulo || "";
    document.getElementById('edit-subtitulo').value = target.subtitulo || "";
    document.getElementById('edit-desc').value = target.descricao || "";
    document.getElementById('edit-volume').value = target.volume || "";
    document.getElementById('edit-status').value = target.emBreve ? "true" : "false";
    document.getElementById('edit-file-input').value = "";
    document.getElementById('prev-capa').src = target.capa || "";

    document.getElementById('edit-titulo').dispatchEvent(new Event('input'));
    document.getElementById('modal-editor-livro').style.display = 'flex';
};

window.fecharModalEdicao = function() {
    const modal = document.getElementById('modal-editor-livro');
    if (modal) modal.style.display = 'none';
};

window.salvarEdicaoModal = async function() {
    const id = document.getElementById('edit-id').value;
    const titulo = document.getElementById('edit-titulo').value.trim();
    const subtitulo = document.getElementById('edit-subtitulo').value.trim();
    const descricao = document.getElementById('edit-desc').value.trim();
    const volume = document.getElementById('edit-volume').value.trim();
    const emBreve = document.getElementById('edit-status').value === "true";
    const fileInput = document.getElementById('edit-file-input');

    if (!titulo) {
        alert("Por favor, preencha o título do livro.");
        return;
    }

    let livros = carregarDados();
    let capaFinal = document.getElementById('prev-capa').src;

    if (fileInput.files && fileInput.files[0]) {
        capaFinal = await redimensionarEConverterImagem(fileInput.files[0]);
    }

    if (id) {
        const index = livros.findIndex(l => l.id === id);
        if (index !== -1) {
            livros[index] = { ...livros[index], titulo, subtitulo, descricao, volume, emBreve, capa: capaFinal };
        }
    } else {
        const novoLivro = {
            id: Date.now().toString(),
            titulo,
            subtitulo,
            descricao,
            volume,
            emBreve,
            capa: capaFinal,
            destaque: livros.length === 0
        };
        livros.push(novoLivro);
    }

    salvarDados(livros);
    window.fecharModalEdicao();
    alert("Livro salvo com sucesso!");
};

window.definirComoDestaque = function(id) {
    let livros = carregarDados();
    livros.forEach(l => {
        l.destaque = (l.id === id);
    });
    salvarDados(livros);
};

window.excluirLivro = function(id) {
    let livros = carregarDados();
    if (livros.length <= 1) {
        alert("É necessário manter pelo menos 1 livro cadastrado.");
        return;
    }

    if (confirm("Tem certeza que deseja excluir este livro?")) {
        livros = livros.filter(l => l.id !== id);
        if (!livros.some(l => l.destaque)) {
            livros[0].destaque = true;
        }
        salvarDados(livros);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const btnAlterarDestaque = document.querySelector(".manager-section .btn-panel");
    if (btnAlterarDestaque) {
        btnAlterarDestaque.onclick = () => window.abrirModalEdicao('feat');
    }

    const btnAddNovo = document.querySelector(".section-header .btn-panel");
    if (btnAddNovo) {
        btnAddNovo.onclick = () => window.abrirModalNovoLivro();
    }

    renderizarPainel();
});


// --- LÓGICA PARA A INDEX.HTML ---
function atualizarLivroNaIndex() {
    // 1. Busca os livros salvos no LocalStorage
    const dados = localStorage.getItem('biblioteca_livros');
    if (!dados) return; // Se não houver dados, mantém o HTML padrão

    const livros = JSON.parse(dados);
    
    // 2. Encontra o livro marcado como Destaque (ou o primeiro da lista)
    const livroDestaque = livros.find(l => l.destaque) || livros[0];

    if (livroDestaque) {
        // Atualiza a Capa do Livro na Index
        const capaimg = document.querySelector('.book-cover-mockup img, .hero-book-cover img');
        if (capaimg) capaimg.src = livroDestaque.capa;

        // Atualiza o Título do Livro na Index
        const tituloEl = document.querySelector('.book-title-mock, .hero-content h1');
        if (tituloEl) tituloEl.textContent = livroDestaque.titulo;

        // Atualiza o Subtítulo / Tag
        const tagEl = document.querySelector('.book-tag, .hero-subtitle');
        if (tagEl) tagEl.textContent = livroDestaque.subtitulo;

        // Atualiza a Descrição
        const descEl = document.querySelector('.hero-description, .book-desc');
        if (descEl) descEl.textContent = livroDestaque.descricao;
    }
}

// Executa a atualização assim que a página carregar
document.addEventListener("DOMContentLoaded", atualizarLivroNaIndex);
