document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchUser');
    searchInput.addEventListener('input', function() {
        console.log("Input actif:", this.value);
    });
    const userCards = document.querySelectorAll('.user-card');

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        
        userCards.forEach(function(card) {
            const username = card.getAttribute('data-search');
            if (username.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function debounce(func, delay) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(func, delay);
        };
    }

    searchInput.addEventListener('input', debounce(filterUsers, 300));
});
 