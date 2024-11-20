document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchUser');
    const followerList = document.createElement('div');
    followerList.id = 'followerList';
    searchInput.parentNode.insertBefore(followerList, searchInput.nextSibling);

    const selectedFollowersContainer = document.createElement('div');
    selectedFollowersContainer.classList.add('selected-followers');
    searchInput.parentNode.appendChild(selectedFollowersContainer);

    const selectedFollowersInput = document.getElementById('selectedFollowers');
    const selectedFollowers = new Map(); // Pour stocker les followers sélectionnés

    // Fonction pour afficher/masquer la liste
    function toggleFollowerList(visible) {
        followerList.style.display = visible ? 'block' : 'none';
    }

    // Fonction pour mettre à jour l'input caché
    function updateHiddenInput() {
        selectedFollowersInput.value = JSON.stringify([...selectedFollowers.keys()]);
    }

    // Fonction pour ajouter un follower
    function addFollower(follower) {
        if (selectedFollowers.has(follower.id_user)) return; // Ne pas ajouter deux fois

        selectedFollowers.set(follower.id_user, follower);

        // Créer l'élément visuel
        const div = document.createElement('div');
        div.classList.add('selected-follower');
        div.dataset.id = follower.id_user;
        div.innerHTML = `
            <img src="${follower.picture}" alt="${follower.userName}" class="selected-picture">
            <span class="selected-name">${follower.userName}</span>
            <button class="remove-follower">&times;</button>
        `;

        // Gérer la suppression
        div.querySelector('.remove-follower').addEventListener('click', () => {
            selectedFollowers.delete(follower.id_user);
            div.remove();
            updateHiddenInput();
        });

        selectedFollowersContainer.appendChild(div);
        updateHiddenInput();
    }

    // Écouteur pour la recherche
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();

        if (query.length > 0) {
            try {
                const response = await fetch(`/searchFollowers?query=${encodeURIComponent(query)}`);
                const followers = await response.json();

                // Réinitialiser la liste
                followerList.innerHTML = '';
                if (followers.length > 0) {
                    toggleFollowerList(true);
                    followers.forEach(follower => {
                        const div = document.createElement('div');
                        div.classList.add('follower-item');
                        div.innerHTML = `
                            <img src="${follower.picture}" alt="${follower.userName}" class="follower-picture">
                            <span class="follower-name">${follower.userName}</span>
                        `;
                        div.addEventListener('click', () => {
                            addFollower(follower);
                            toggleFollowerList(false); // Cacher la liste après sélection
                        });
                        followerList.appendChild(div);
                    });
                } else {
                    toggleFollowerList(false);
                }
            } catch (error) {
                console.error('Erreur lors de la recherche des followers :', error);
                toggleFollowerList(false);
            }
        } else {
            toggleFollowerList(false);
        }
    });

    // Cacher la liste si on clique en dehors
    document.addEventListener('click', (e) => {
        if (!followerList.contains(e.target) && e.target !== searchInput) {
            toggleFollowerList(false);
        }
    });
});
