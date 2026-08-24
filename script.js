async function carregarBiblioteca() {
    const edicoesContainer = document.getElementById('edicoes-container');
    const heroBookContainer = document.getElementById('hero-book-container');
    
    if (!edicoesContainer && !heroBookContainer) return;

    try {
        // Busca apenas as edições reais de livros
        const querySnapshot = await getDocs(collection(db, "livros"));
        let livros = [];

        querySnapshot.forEach((docSnap) => {
            livros.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // Ordena pela ordem definida no painel
        livros.sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

        if (livros.length === 0) {
            if (edicoesContainer) {
                edicoesContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nenhuma edição disponível no momento.</p>';
            }
            return;
        }


    // Trecho do script.js dentro de carregarBiblioteca():
if (heroBookContainer && livros.length > 0) {
    const livroDestaque = livros[0]; // Pega o livro com menor ordem (1º da lista)
    heroBookContainer.innerHTML = `
        <div class="book-cover-mockup">
            <span class="volume-badge">Livro Atual</span>
            <img src="${livroDestaque.capa || 'smm.jpg'}" alt="${livroDestaque.titulo}">
        </div>
    `;
}

        // Renderiza os cards das edições
        if (edicoesContainer) {
            edicoesContainer.innerHTML = livros.map(livro => `
                <div class="edicao-card">
                    <div class="edicao-thumb">
                        <img src="${livro.capa || 'https://picsum.photos/300/450'}" alt="${livro.titulo}">
                    </div>
                    <div class="edicao-info">
                        <p class="edicao-volume">${livro.volume || ''}</p>
                        <h3 class="edicao-title">${livro.titulo || ''}</h3>
                        <p class="edicao-descricao">${livro.descricao || ''}</p>
                    </div>
                </div>
            `).join('');
        }

    } catch (erro) {
        console.error("Erro ao carregar biblioteca no Index:", erro);
    }
}