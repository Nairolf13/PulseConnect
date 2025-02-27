function toggleMenu() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.style.display = navMenu.style.display === "flex" ? "none" : "flex";
}

(() => {
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

    window.moveSlider = moveSlider; 
})();

document.addEventListener("DOMContentLoaded", function () {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {
        question.addEventListener("click", function () {
            this.classList.toggle("active");
            const answer = this.nextElementSibling;
            
            if (answer.style.display === "block") {
                answer.style.display = "none";
            } else {
                answer.style.display = "block";
            }
        });
    });
});

