
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchUser');
    const userList = document.createElement('div');
    userList.id = 'userList';
    searchInput.parentNode.insertBefore(userList, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length > 0) {
            fetch(`/searchUsers?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(users => {
                    userList.innerHTML = '';
                    users.forEach(user => {
                        const userItem = document.createElement('div');
                        userItem.className = 'user-item';
                        userItem.innerHTML = `
                            <img src="${user.picture}" alt="${user.userName}">
                            <span>${user.userName}</span>
                        `;
                        userItem.addEventListener('click', () => {
                            window.location.href = `/conversation/${user.id_user}`;
                        });
                        userList.appendChild(userItem);
                    });
                    userList.style.display = users.length > 0 ? 'block' : 'none';
                })
                .catch(error => console.error('Erreur:', error));
        } else {
            userList.style.display = 'none';
        }
    });

    // Cacher la liste lorsqu'on clique en dehors
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && !userList.contains(e.target)) {
            userList.style.display = 'none';
        }
    });
});