const photos = document.querySelectorAll('.pic');

photos.forEach(photo => {
  photo.addEventListener('click', () => {
    // code pour afficher la photo en plein écran
  });
});

function displayFullscreen(photo) {
    // créer une balise "div" pour contenir la photo en plein écran
    const fullscreenDiv = document.createElement('div');
    fullscreenDiv.classList.add('fullscreen');
  
    // créer une balise "img" et lui attribuer l'URL de la photo
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = photo.src;
  
    // ajouter la balise "img" à la balise "div"
    fullscreenDiv.appendChild(fullscreenImg);
  
    // ajouter la balise "div" à la page web
    document.body.appendChild(fullscreenDiv);
  }

  photos.forEach(photo => {
    photo.addEventListener('click', () => {
      displayFullscreen(photo);
    });
  });
  

const radioButtons = document.querySelectorAll('input[type="radio"]');
const galleryContainer = document.querySelector('.gallery-container');

radioButtons.forEach(button => {
  button.addEventListener('change', event => {
    const value = event.target.value;
    galleryContainer.style.gridTemplateColumns = `repeat(${value}, 1fr)`;
  });
});