function toggleMenu() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
}

const carousel = document.querySelector('.carousel');
let isDragging = false;
let startX;
let scrollLeft;

let scrollSpeed = 1; 
let autoScrollInterval;

carousel.addEventListener('mousedown', (e) => {
    clearInterval(autoScrollInterval); 
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('mouseleave', () => {
    if (isDragging) resumeAutoScroll(); 
    isDragging = false;
});

carousel.addEventListener('mouseup', () => {
    isDragging = false;
    resumeAutoScroll(); 
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
});

function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        carousel.scrollLeft += scrollSpeed;

        if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
            carousel.scrollLeft = 0; 
        }
    }, 20); 
}

function resumeAutoScroll() {
    if (!isDragging) {
        startAutoScroll();
    }
}

startAutoScroll();

carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
carousel.addEventListener('mouseleave', resumeAutoScroll);
