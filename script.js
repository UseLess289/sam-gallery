// Charger les photos depuis le JSON
fetch('photos.json')
  .then(response => response.json())
  .then(data => {
    const galleryContainer = document.querySelector('.gallery-container');

    data.photos.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.classList.add('pic');
      galleryContainer.appendChild(img);

      // ajouter l'event pour plein écran
      img.addEventListener('click', () => {
        displayFullscreen(img);
      });
    });
  })
  .catch(error => console.error('Erreur chargement JSON:', error));


// Fonction pour afficher une photo en plein écran
function displayFullscreen(photo) {
  // créer une balise "div" pour contenir la photo en plein écran
  const fullscreenDiv = document.createElement('div');
  fullscreenDiv.classList.add('fullscreen');

  // créer une balise "img" et lui attribuer l'URL de la photo
  const fullscreenImg = document.createElement('img');
  fullscreenImg.src = photo.src;

  // ajouter la balise "img" à la balise "div"
  fullscreenDiv.appendChild(fullscreenImg);

  // fermer en cliquant sur le fond noir
  fullscreenDiv.addEventListener('click', () => {
    fullscreenDiv.remove();
  });

  // ajouter la balise "div" à la page web
  document.body.appendChild(fullscreenDiv);
}


// Gestion des boutons radio (nombre de colonnes)
const radioButtons = document.querySelectorAll('input[type="radio"]');
const galleryContainer = document.querySelector('.gallery-container');

radioButtons.forEach(button => {
  button.addEventListener('change', event => {
    const value = event.target.value;
    galleryContainer.style.gridTemplateColumns = `repeat(${value}, 1fr)`;
  });
});
