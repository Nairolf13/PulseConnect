document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.items');
    if (!carousel) {
        console.error('L\'élément .items n\'a pas été trouvé.');
        return;
    }

    let isMouseDown = false;
    let startX;
    let scrollLeft;

    // Écouteur d'événements pour le clic de souris
    carousel.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        startX = e.clientX; // Utilisez clientX pour obtenir la position relative à la fenêtre
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
        e.preventDefault(); // Empêche la sélection de texte
    });

    // Écouteur d'événements pour le mouvement de la souris
    carousel.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault(); // Empêche la sélection de texte
        const x = e.clientX; // Utilisez clientX pour la position de la souris
        const walk = (x - startX) * 2; // Multipliez par 2 pour augmenter la vitesse de défilement
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Écouteur d'événements pour relâcher le clic de souris
    carousel.addEventListener('mouseup', () => {
        isMouseDown = false;
        carousel.style.cursor = 'grab';
    });

    // Écouteur d'événements pour quitter le carrousel (si la souris quitte la zone)
    carousel.addEventListener('mouseleave', () => {
        if (isMouseDown) {
            isMouseDown = false;
            carousel.style.cursor = 'grab';
        }
    });

    // Événements tactiles pour les appareils mobiles
    let isTouchStart = false;
    let touchStartX;
    let touchScrollLeft;

    carousel.addEventListener('touchstart', (e) => {
        isTouchStart = true;
        touchStartX = e.touches[0].clientX; // Utilisez clientX pour la position du toucher
        touchScrollLeft = carousel.scrollLeft;
        e.preventDefault(); // Empêche la sélection de texte
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isTouchStart) return;
        e.preventDefault(); // Empêche la sélection de texte
        const x = e.touches[0].clientX; // Utilisez clientX pour la position du toucher
        const walk = (x - touchStartX) * 2; // Multipliez par 2 pour augmenter la vitesse de défilement
        carousel.scrollLeft = touchScrollLeft - walk;
    });

    carousel.addEventListener('touchend', () => {
        isTouchStart = false;
    });
});


function toggleMenu() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
}

let currentIndex = 0;
const itemsToShow = 1; 
const slider = document.querySelector('.slider');

function moveSlider(direction) {
    const totalItems = document.querySelectorAll('.slider li').length;
    const maxIndex = totalItems - itemsToShow;

    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = 0;
    } else if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
    }

    slider.style.transform = `translateX(-${currentIndex * (100 / itemsToShow)}%)`;
}

