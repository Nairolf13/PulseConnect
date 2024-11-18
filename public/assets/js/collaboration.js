document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchUser');
    const followerList = document.createElement('div');
    const selectedFollowers = [];  
    followerList.id = 'followerList';
    searchInput.parentNode.insertBefore(followerList, searchInput.nextSibling);

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();
    
        if (query.length > 0) {
            fetch(`/searchFollowers?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(followers => {
                    followerList.innerHTML = '';
                    if (followers.length > 0) {
                        followerList.classList.add('visible');
                    } else {
                        followerList.classList.remove('visible');
                    }
                    followers.forEach(follower => {
                        const followerItem = document.createElement('div');
                        followerItem.className = 'follower-item';
                        followerItem.innerHTML = `
                            <img src="${follower.picture}" alt="${follower.userName}">
                            <span>${follower.userName}</span>
                        `;
                        followerItem.addEventListener('click', () => {
                            if (!selectedFollowers.includes(follower.id_user)) {
                                selectedFollowers.push(follower.id_user);
                                updateSelectedFollowers();
                            }
                        });
                        followerList.appendChild(followerItem);
                    });
                })
                .catch(error => console.error('Erreur:', error));
        } else {
            followerList.classList.remove('visible');
        }
    });

    function updateSelectedFollowers() {
        // Met à jour le formulaire avec les followers sélectionnés
        const selectedFollowersInput = document.getElementById('selectedFollowers');
        selectedFollowersInput.value = selectedFollowers.join(',');
    }

    // Cacher la liste lorsqu'on clique en dehors
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && !followerList.contains(e.target)) {
            followerList.style.display = 'none';
        }
    });
});
