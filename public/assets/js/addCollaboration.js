document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchUser');
    const followerList = document.createElement('div');
    followerList.id = 'followerList';
    searchInput.parentNode.insertBefore(followerList, searchInput.nextSibling);

    const selectedFollowersContainer = document.createElement('div');
    selectedFollowersContainer.classList.add('selected-followers');
    searchInput.parentNode.appendChild(selectedFollowersContainer);

    const selectedFollowersInput = document.getElementById('selectedFollowers');
    const selectedFollowers = new Map(); 

    function FollowerList(visible) {
        followerList.style.display = visible ? 'block' : 'none';
    }

    function updateHiddenInput() {
        selectedFollowersInput.value = JSON.stringify([...selectedFollowers.keys()]);
    }

    function addFollower(follower) {
        if (selectedFollowers.has(follower.id_user)) return; 

        selectedFollowers.set(follower.id_user, follower);

        const div = document.createElement('div');
        div.classList.add('selected-follower');
        div.dataset.id = follower.id_user;
        div.innerHTML = `
            <img src="${follower.picture}" alt="${follower.userName}" class="selected-picture">
            <span class="selected-name">${follower.userName}</span>
            <button class="remove-follower">&times;</button>
        `;

        div.querySelector('.remove-follower').addEventListener('click', () => {
            selectedFollowers.delete(follower.id_user);
            div.remove();
            updateHiddenInput();
        });

        selectedFollowersContainer.appendChild(div);
        updateHiddenInput();
    }

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();

        if (query.length > 0) {
            try {
                const response = await fetch(`/searchFollowers?query=${encodeURIComponent(query)}`);
                const followers = await response.json();

                followerList.innerHTML = '';
                if (followers.length > 0) {
                    FollowerList(true);
                    followers.forEach(follower => {
                        const div = document.createElement('div');
                        div.classList.add('follower-item');
                        div.innerHTML = `
                            <img src="${follower.picture}" alt="${follower.userName}" class="follower-picture">
                            <span class="follower-name">${follower.userName}</span>
                        `;
                        div.addEventListener('click', () => {
                            addFollower(follower);
                            FollowerList(false);
                        });
                        followerList.appendChild(div);
                    });
                } else {
                    FollowerList(false);
                }
            } catch (error) {
                console.error('Erreur lors de la recherche des followers :', error);
                FollowerList(false);
            }
        } else {
            FollowerList(false);
        }
    });

    document.addEventListener('click', (e) => {
        if (!followerList.contains(e.target) && e.target !== searchInput) {
            FollowerList(false);
        }
    });
});
