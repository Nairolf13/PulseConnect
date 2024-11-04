document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchUser');
    searchInput.addEventListener('input', function() {
        console.log("Input actif:", this.value);
    });
    const userCards = document.querySelectorAll('.user-card');

    // Fonction de recherche
    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        
        userCards.forEach(function(card) {
            const username = card.getAttribute('data-search');
            // Affiche ou masque l'utilisateur selon le terme recherché
            if (username.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Fonction de "debounce" pour limiter les appels de recherche
    function debounce(func, delay) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, delay);
        };
    }

    // Ajoute un délai pour optimiser la recherche
    searchInput.addEventListener('input', debounce(filterUsers, 300));
});
