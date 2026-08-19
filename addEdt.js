// ============================================================
// SOMOS MULHERES EM MOVIMENTO
// GERENCIADOR DE PERFIS DA COMUNIDADE
// Firebase v12.16.0
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ============================================================
// 1. FIREBASE
// ============================================================

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

const COLLECTION_NAME = "comunidade";


// ============================================================
// 2. ID DO PERFIL
// ============================================================

const params = new URLSearchParams(window.location.search);

const editId =
    params.get("edit") ||
    params.get("id") ||
    null;


// ============================================================
// 3. ESTADO DO PERFIL
// ============================================================

let profileData = {
    id: editId,

    name: "",
    volume: "Vol. 1",
    title: "",
    bio: "",
    instagram: "",

    photoBase64: "",

    zoom: 1,

    tags: []
};


// ============================================================
// 4. INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    setupEvents();

    if (profileData.id) {
        await loadProfile(profileData.id);
    } else {
        setupCreateMode();
    }

    renderTags();
    updateLiveCard();

});


// ============================================================
// 5. EVENTOS
// ============================================================

function setupEvents() {

    const name = document.getElementById("input-name");
    const volume = document.getElementById("input-volume");
    const title = document.getElementById("input-title");
    const bio = document.getElementById("input-bio");
    const instagram = document.getElementById("input-instagram");

    [name, volume, title, bio, instagram].forEach(input => {

        if (input) {
            input.addEventListener("input", syncFields);
        }

    });


    const uploader = document.getElementById("image-uploader");

    if (uploader) {

        uploader.addEventListener("change", event => {
            previewImage(event);
        });

    }


    const zoomRange = document.getElementById("zoom-range");

    if (zoomRange) {

        zoomRange.addEventListener("input", event => {
            updateZoom(event.target.value);
        });

    }


    const tagField = document.getElementById("tag-field");

    if (tagField) {

        tagField.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addTagFromField();

            }

        });

    }

}


// ============================================================
// 6. MODO CRIAÇÃO
// ============================================================

function setupCreateMode() {

    document.title =
        "Somos Mulheres em Movimento - Adicionar Integrante";


    const title = document.getElementById("page-main-title");

    if (title) {
        title.textContent =
            "Adicionar Mulher da Comunidade";
    }


    const deleteButton =
        document.getElementById("btn-delete-action");

    if (deleteButton) {
        deleteButton.style.display = "none";
    }

}


// ============================================================
// 7. CARREGAR PERFIL PARA EDIÇÃO
// ============================================================

async function loadProfile(id) {

    try {

        document.title =
            "Somos Mulheres em Movimento - Editar Integrante";


        const title =
            document.getElementById("page-main-title");

        if (title) {
            title.textContent =
                "Editar Mulher da Comunidade";
        }


        const deleteButton =
            document.getElementById("btn-delete-action");

        if (deleteButton) {
            deleteButton.style.display = "inline-flex";
        }


        const reference =
            doc(db, COLLECTION_NAME, id);

        const snapshot =
            await getDoc(reference);


        if (!snapshot.exists()) {

            alert("Esse perfil não foi encontrado no banco de dados.");

            window.location.href = "comunidade.html";

            return;
        }


        const data = snapshot.data();


        profileData.id = id;

        profileData.name =
            data.nome || "";

        profileData.volume =
            data.volume || "Vol. 1";

        profileData.title =
            data.subtitulo || "";

        profileData.bio =
            data.descricao || "";

        profileData.instagram =
            data.instagram || "";

        profileData.tags =
            Array.isArray(data.tags)
                ? data.tags
                : [];

        profileData.photoBase64 =
            data.imagemUrl ||
            data.imagemBase64OrUrl ||
            "";

        profileData.zoom =
            Number(
                data.configuracoesRecorte?.zoom || 1
            );


        // -----------------------------
        // Preenche formulário
        // -----------------------------

        setValue("input-name", profileData.name);

        setValue("input-volume", profileData.volume);

        setValue("input-title", profileData.title);

        setValue("input-bio", profileData.bio);

        setValue("input-instagram", profileData.instagram);


        syncFields();

        renderTags();


        // -----------------------------
        // Foto
        // -----------------------------

        if (profileData.photoBase64) {

            showPhotoInCropBox(
                profileData.photoBase64,
                profileData.zoom
            );

        }


    } catch (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        alert(
            "Não foi possível carregar o perfil."
        );

    }

}


function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value;
    }

}


// ============================================================
// 8. SINCRONIZA FORMULÁRIO
// ============================================================

function syncFields() {

    profileData.name =
        document.getElementById("input-name")?.value || "";

    profileData.volume =
        document.getElementById("input-volume")?.value ||
        "Vol. 1";

    profileData.title =
        document.getElementById("input-title")?.value || "";

    profileData.bio =
        document.getElementById("input-bio")?.value || "";

    profileData.instagram =
        document.getElementById("input-instagram")?.value || "";


    const countName =
        document.getElementById("count-name");

    if (countName) {
        countName.textContent =
            profileData.name.length;
    }


    const countTitle =
        document.getElementById("count-title");

    if (countTitle) {
        countTitle.textContent =
            profileData.title.length;
    }


    const countBio =
        document.getElementById("count-bio");

    if (countBio) {
        countBio.textContent =
            profileData.bio.length;
    }


    updateLiveCard();

}


// ============================================================
// 9. IMAGEM
// ============================================================

async function previewImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert("Escolha uma imagem válida.");

        return;
    }


    try {

        const compressed =
            await compressImage(file);


        profileData.photoBase64 =
            compressed;

        profileData.zoom = 1;


        showPhotoInCropBox(
            compressed,
            1
        );


        updateLiveCard();


    } catch (error) {

        console.error(
            "Erro ao processar imagem:",
            error
        );

        alert(
            "Não foi possível processar essa imagem."
        );

    }

}


// ============================================================
// 10. COMPRESSÃO DA FOTO
// ============================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();


        reader.onload = event => {

            const img =
                new Image();


            img.onload = () => {

                const MAX_SIZE = 900;

                let width =
                    img.width;

                let height =
                    img.height;


                if (width > height) {

                    if (width > MAX_SIZE) {

                        height =
                            height *
                            (MAX_SIZE / width);

                        width =
                            MAX_SIZE;

                    }

                } else {

                    if (height > MAX_SIZE) {

                        width =
                            width *
                            (MAX_SIZE / height);

                        height =
                            MAX_SIZE;

                    }

                }


                const canvas =
                    document.createElement("canvas");


                canvas.width =
                    Math.round(width);

                canvas.height =
                    Math.round(height);


                const ctx =
                    canvas.getContext("2d");


                ctx.drawImage(
                    img,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // JPEG 70%:
                // reduz bastante o tamanho
                // sem destruir a qualidade visual.

                const result =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.70
                    );


                // Segurança adicional.
                // Firestore possui limite de aproximadamente
                // 1 MiB por documento.

                if (result.length > 900000) {

                    const smaller =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.55
                        );

                    resolve(smaller);

                } else {

                    resolve(result);

                }

            };


            img.onerror =
                reject;


            img.src =
                event.target.result;

        };


        reader.onerror =
            reject;


        reader.readAsDataURL(file);

    });

}


// ============================================================
// 11. MOSTRAR FOTO NO RECORTE
// ============================================================

function showPhotoInCropBox(src, zoom = 1) {

    const image =
        document.getElementById("crop-preview");

    const placeholder =
        document.getElementById(
            "crop-box-placeholder"
        );

    const cropWindow =
        document.getElementById("crop-window");

    const range =
        document.getElementById("zoom-range");


    if (image) {

        image.src = src;

        image.style.display =
            "block";

        image.style.transform =
            `scale(${zoom})`;

    }


    if (placeholder) {
        placeholder.style.display =
            "none";
    }


    if (cropWindow) {
        cropWindow.style.display =
            "flex";
    }


    if (range) {

        range.disabled = false;

        range.value = zoom;

    }

}


// ============================================================
// 12. ZOOM
// ============================================================

function updateZoom(value) {

    profileData.zoom =
        Number(value);


    const image =
        document.getElementById("crop-preview");


    if (image) {

        image.style.transform =
            `scale(${profileData.zoom})`;

    }


    updateLiveCard();

}


function adjustZoom(amount) {

    const range =
        document.getElementById("zoom-range");

    if (!range || range.disabled) {
        return;
    }


    let value =
        Number(range.value) + amount;


    value =
        Math.max(
            0.5,
            Math.min(2, value)
        );


    range.value =
        value;


    updateZoom(value);

}


// ============================================================
// 13. RESETAR IMAGEM
// ============================================================

function resetImage() {

    const uploader =
        document.getElementById(
            "image-uploader"
        );

    const image =
        document.getElementById(
            "crop-preview"
        );

    const placeholder =
        document.getElementById(
            "crop-box-placeholder"
        );

    const cropWindow =
        document.getElementById(
            "crop-window"
        );

    const range =
        document.getElementById(
            "zoom-range"
        );


    if (uploader) {
        uploader.value = "";
    }


    if (image) {

        image.src = "";

        image.style.display =
            "none";

        image.style.transform =
            "scale(1)";

    }


    if (placeholder) {
        placeholder.style.display =
            "block";
    }


    if (cropWindow) {
        cropWindow.style.display =
            "none";
    }


    if (range) {

        range.value = 1;

        range.disabled = true;

    }


    profileData.photoBase64 = "";

    profileData.zoom = 1;


    updateLiveCard();

}


// ============================================================
// 14. TAGS
// ============================================================

function renderTags() {

    const container =
        document.getElementById(
            "tags-container"
        );

    const input =
        document.getElementById(
            "tag-field"
        );


    if (!container || !input) {
        return;
    }


    container
        .querySelectorAll(".tag-badge")
        .forEach(element => {
            element.remove();
        });


    profileData.tags.forEach(
        (tag, index) => {

            const badge =
                document.createElement(
                    "span"
                );

            badge.className =
                "tag-badge";


            const text =
                document.createElement(
                    "span"
                );

            text.textContent =
                tag;


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.textContent =
                "×";


            button.addEventListener(
                "click",
                () => removeTag(index)
            );


            badge.appendChild(text);

            badge.appendChild(button);


            container.insertBefore(
                badge,
                input
            );

        });


    updateLiveCard();

}


function handleTagKey(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        addTagFromField();

    }

}


function addTagFromField() {

    const input =
        document.getElementById(
            "tag-field"
        );


    if (!input) return;


    const value =
        input.value.trim();


    if (!value) return;


    // Não deixa tags duplicadas.

    const alreadyExists =
        profileData.tags.some(
            tag =>
                tag.toLowerCase() ===
                value.toLowerCase()
        );


    if (!alreadyExists) {

        profileData.tags.push(
            value
        );

    }


    input.value = "";

    renderTags();

    input.focus();

}


function removeTag(index) {

    profileData.tags.splice(
        index,
        1
    );

    renderTags();

}


// ============================================================
// 15. PREVIEW
// ============================================================

function updateLiveCard() {

    const name =
        document.getElementById(
            "preview-card-name"
        );

    const title =
        document.getElementById(
            "preview-card-title"
        );

    const bio =
        document.getElementById(
            "preview-card-bio"
        );

    const volume =
        document.getElementById(
            "preview-card-volume"
        );

    const photo =
        document.getElementById(
            "preview-card-photo"
        );

    const instagram =
        document.getElementById(
            "preview-card-ig"
        );


    if (name) {

        name.textContent =
            profileData.name ||
            "Nome da Participante";

    }


    if (title) {

        title.textContent =
            profileData.title ||
            "Subtítulo / Especialidade";

    }


    if (bio) {

        bio.textContent =
            profileData.bio ||
            "A biografia e descrição detalhada aparecerá dinamicamente nesta área do card...";

    }


    if (volume) {

        volume.textContent =
            profileData.volume ||
            "Vol. 1";

    }


    if (photo) {

        if (profileData.photoBase64) {

            photo.style.backgroundImage =
                `url("${profileData.photoBase64}")`;

            photo.style.backgroundSize =
                `${profileData.zoom * 100}%`;

        } else {

            photo.style.backgroundImage =
                "none";

            photo.style.backgroundSize =
                "cover";

        }

    }


    if (instagram) {

        const link =
            normalizeInstagram(
                profileData.instagram
            );


        if (link) {

            instagram.href =
                link;

            instagram.style.opacity =
                "1";

            instagram.style.pointerEvents =
                "auto";

        } else {

            instagram.href =
                "#";

            instagram.style.opacity =
                "0.3";

            instagram.style.pointerEvents =
                "none";

        }

    }


    renderPreviewTags();

}


// ============================================================
// 16. TAGS DO PREVIEW
// ============================================================

function renderPreviewTags() {

    const container =
        document.getElementById(
            "preview-card-tags"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!profileData.tags.length) {

        const empty =
            document.createElement(
                "span"
            );

        empty.className =
            "tag-span";

        empty.style.opacity =
            "0.5";

        empty.textContent =
            "Sem tags";


        container.appendChild(empty);

        return;
    }


    profileData.tags.forEach(tag => {

        const span =
            document.createElement(
                "span"
            );

        span.className =
            "tag-span";

        span.textContent =
            tag;


        container.appendChild(span);

    });

}


// ============================================================
// 17. INSTAGRAM
// ============================================================

function normalizeInstagram(value) {

    if (!value) {
        return "";
    }


    value =
        value.trim();


    if (!value) {
        return "";
    }


    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {

        return value;

    }


    value =
        value.replace(/^@/, "");


    return `https://www.instagram.com/${value}/`;

}


// ============================================================
// 18. SALVAR
// ============================================================

async function handleSave() {

    const name =
        profileData.name.trim();


    if (!name) {

        alert(
            "Preencha o Nome Completo da participante."
        );

        return;

    }


    const saveButton =
        document.querySelector(
            ".btn-save"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    }


    const payload = {

        nome:
            name,

        volume:
            profileData.volume.trim() ||
            "Vol. 1",

        subtitulo:
            profileData.title.trim(),

        descricao:
            profileData.bio.trim(),

        instagram:
            profileData.instagram.trim(),

        tags:
            profileData.tags,

        imagemUrl:
            profileData.photoBase64 || "",

        configuracoesRecorte: {

            zoom:
                profileData.zoom

        },

        atualizadoEm:
            serverTimestamp()

    };


    try {

        // ----------------------------------------
        // EDIÇÃO
        // ----------------------------------------

        if (profileData.id) {

            const reference =
                doc(
                    db,
                    COLLECTION_NAME,
                    profileData.id
                );


            await updateDoc(
                reference,
                payload
            );


            alert(
                "Perfil atualizado com sucesso!"
            );

        }

        // ----------------------------------------
        // NOVO PERFIL
        // ----------------------------------------

        else {

            payload.criadoEm =
                serverTimestamp();


            const reference =
                await addDoc(
                    collection(
                        db,
                        COLLECTION_NAME
                    ),
                    payload
                );


            profileData.id =
                reference.id;


            alert(
                "Mulher adicionada à comunidade com sucesso!"
            );

        }


        // Vai para comunidade

        window.location.href =
            "comunidade.html";


    } catch (error) {

        console.error(
            "Erro ao salvar:",
            error
        );


        alert(
            "Não foi possível salvar. Veja o Console para descobrir o erro."
        );


        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                '<i class="fa-regular fa-floppy-disk"></i> Salvar Alterações';

        }

    }

}

async function handleDelete() {

    if (!profileData.id) {
        return;
    }


    const confirmed =
        confirm(
            `Tem certeza que deseja excluir "${profileData.name}"?\n\nEssa ação não pode ser desfeita.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                COLLECTION_NAME,
                profileData.id
            )
        );


        alert(
            "Perfil excluído com sucesso!"
        );


        window.location.href =
            "comunidade.html";


    } catch (error) {

        console.error(
            "Erro ao excluir:",
            error
        );


        alert(
            "Não foi possível excluir o perfil."
        );

    }

}
function handleCancel() {

    const confirmed =
        confirm(
            "Deseja cancelar? As alterações não salvas serão perdidas."
        );


    if (confirmed) {

        window.location.href =
            "comunidade.html";

    }

}


// ============================================================
// 21. DISPONIBILIZAR FUNÇÕES PARA O HTML
// ============================================================

window.previewImage =
    previewImage;

window.adjustZoom =
    adjustZoom;

window.updateZoom =
    updateZoom;

window.resetImage =
    resetImage;

window.handleTagKey =
    handleTagKey;

window.addTagFromField =
    addTagFromField;

window.removeTag =
    removeTag;

window.syncFields =
    syncFields;

window.handleSave =
    handleSave;

window.handleDelete =
    handleDelete;

window.handleCancel =
    handleCancel;
