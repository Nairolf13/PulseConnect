// document.addEventListener('DOMContentLoaded', () => {
//     const carousel = document.querySelector('.items');
//     if (!carousel) {
//         console.error('L\'élément .items n\'a pas été trouvé.');
//         return;
//     }

//     let isMouseDown = false;
//     let startX;
//     let scrollLeft;

//     carousel.addEventListener('mousedown', (e) => {
//         isMouseDown = true;
//         startX = e.clientX; 
//         scrollLeft = carousel.scrollLeft;
//         carousel.style.cursor = 'grabbing';
//         e.preventDefault();
//     });

//     carousel.addEventListener('mousemove', (e) => {
//         if (!isMouseDown) return;
//         e.preventDefault(); 
//         const x = e.clientX; 
//         const walk = (x - startX) * 2; 
//         carousel.scrollLeft = scrollLeft - walk;
//     });

//     carousel.addEventListener('mouseup', () => {
//         isMouseDown = false;
//         carousel.style.cursor = 'grab';
//     });

//     carousel.addEventListener('mouseleave', () => {
//         if (isMouseDown) {
//             isMouseDown = false;
//             carousel.style.cursor = 'grab';
//         }
//     });

//     let isTouchStart = false;
//     let touchStartX;
//     let touchScrollLeft;

//     carousel.addEventListener('touchstart', (e) => {
//         isTouchStart = true;
//         touchStartX = e.touches[0].clientX;
//         touchScrollLeft = carousel.scrollLeft;
//         e.preventDefault(); 
//     });

//     carousel.addEventListener('touchmove', (e) => {
//         if (!isTouchStart) return;
//         e.preventDefault(); 
//         const x = e.touches[0].clientX; 
//         const walk = (x - touchStartX) * 2; 
//         carousel.scrollLeft = touchScrollLeft - walk;
//     });

//     carousel.addEventListener('touchend', () => {
//         isTouchStart = false;
//     });
// });

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

