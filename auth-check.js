// Configuração central do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCEggZoP5vk1JENjO8701pAFdBIBPB8gPQ",
  authDomain: "somos-mulheres-em-movimento.firebaseapp.com",
  projectId: "somos-mulheres-em-movimento",
  storageBucket: "somos-mulheres-em-movimento.firebasestorage.app",
  messagingSenderId: "427525655209",
  appId: "1:427525655209:web:cc00a592936dbd3df9f7b8"
};

// Inicializa o Firebase apenas se ainda não foi inicializado na página
if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Monitora o estado de login
document.addEventListener("DOMContentLoaded", () => {
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      const adminLinks = document.querySelectorAll(".admin-only");

      if (user) {
        // Usuário logado: exibe os links no menu
        adminLinks.forEach(el => {
          el.style.setProperty("display", "inline-block", "important");
        });
      } else {
        // Usuário deslogado: esconde
        adminLinks.forEach(el => {
          el.style.setProperty("display", "none", "important");
        });
      }
    });
  }
});