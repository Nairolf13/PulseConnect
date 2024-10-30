document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const cards = carousel.querySelectorAll('.user-card');
    const cardWidth = cards[0].offsetWidth;
    let currentIndex = 0;
    let autoScroll;
    let startX, startScrollLeft, isDragging = false;
    let animationFrameId = null;

    function duplicateCards() {
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            carousel.appendChild(clone);
        });
    }

    function initCarousel() {
        duplicateCards();
        updateCarouselPosition();
        startAutoScroll();
    }

    function startAutoScroll() {
        stopAutoScroll();
        autoScroll = setInterval(() => {
            currentIndex++;
            updateCarouselPosition(true);
        }, 3000);
    }

    function stopAutoScroll() {
        if (autoScroll) {
            clearInterval(autoScroll);
        }
    }

    function updateCarouselPosition(smooth = false) {
        if (smooth) {
            carousel.style.transition = 'transform 0.5s ease';
        } else {
            carousel.style.transition = 'none';
        }
        carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        if (currentIndex >= cards.length) {
            setTimeout(() => {
                carousel.style.transition = 'none';
                currentIndex = 0;
                carousel.style.transform = `translateX(0)`;
            }, smooth ? 500 : 0);
        }
    }

    function startDragging(e) {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startScrollLeft = currentIndex * cardWidth;
        stopAutoScroll();
        cancelAnimationFrame(animationFrameId);
    }

    function stopDragging() {
        isDragging = false;
        const movedBy = (currentIndex * cardWidth) - startScrollLeft;
        
        if (Math.abs(movedBy) > cardWidth / 4) {
            currentIndex += movedBy > 0 ? 1 : -1;
        }
        
        updateCarouselPosition(true);
        startAutoScroll();
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const walk = startX - x;
        
        currentIndex = Math.round((startScrollLeft + walk) / cardWidth);
        
        animationFrameId = requestAnimationFrame(() => {
            updateCarouselPosition();
        });
    }
    carousel.addEventListener('touchstart', (e) => {
  
        stopAutoScroll();
    });
    
    carousel.addEventListener('touchend', () => {
    
        startAutoScroll();
    });
    carousel.addEventListener('touchstart', startDragging, { passive: true });
    carousel.addEventListener('touchmove', drag, { passive: false });
    carousel.addEventListener('touchend', stopDragging);

    carousel.addEventListener('mousedown', startDragging);
    carousel.addEventListener('touchstart', startDragging);

    carousel.addEventListener('mousemove', drag);
    carousel.addEventListener('touchmove', drag);

    carousel.addEventListener('mouseup', stopDragging);
    carousel.addEventListener('mouseleave', stopDragging);
    carousel.addEventListener('touchend', stopDragging);

    initCarousel();
});

function toggleMenu() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
}

let currentIndex = 0; // Index de l'élément actuellement affiché
const itemsToShow = 1; // Nombre d'éléments visibles à la fois
const slider = document.querySelector('.slider');

function moveSlider(direction) {
    const totalItems = document.querySelectorAll('.slider li').length;
    const maxIndex = totalItems - itemsToShow;

    // Met à jour l'index actuel
    currentIndex += direction;

    // S'assure que l'index reste dans les limites
    if (currentIndex < 0) {
        currentIndex = 0;
    } else if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
    }

    // Applique le décalage
    slider.style.transform = `translateX(-${currentIndex * (100 / itemsToShow)}%)`;
}
