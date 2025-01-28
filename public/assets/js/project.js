document.addEventListener('DOMContentLoaded', function () {
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        const projectId = item.dataset.projectId;
        const menuBtn = item.querySelector('.menu-btn');
        const menuDropdown = item.querySelector('.menu-dropdown');
        const editProjectBtn = item.querySelector('.edit-project');
        const editableTitle = item.querySelector('.editable-title');
        const editableDescription = item.querySelector('.editable-description');
        const participantButtons = item.querySelectorAll('.remove-participant');
        const saveChangesBtn = item.querySelector('.save-changes');
        const cancelChangesBtn = item.querySelector('.cancel-changes');
        const searchContainer = document.querySelector(`#searchContainer-${projectId}`);
        const searchInput = document.querySelector(`#searchUser-${projectId}`);
        const followerList = document.querySelector(`#followerList-${projectId}`);
        const selectedFollowersInput = document.querySelector(`#selectedFollowers-${projectId}`);
        const viewProjectLink = item.querySelector('.view-project-link');

        let originalTitle, originalDescription;
        let selectedFollowers = new Map();

        const selectedFollowersContainer = document.createElement('div');
        selectedFollowersContainer.classList.add('selected-followers-container');
        selectedFollowersContainer.id = `selectedFollowersContainer-${projectId}`; 
        item.appendChild(selectedFollowersContainer); 

        function toggleFollowerList(visible) {
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
                <button class="remove-follower">×</button>
            `;

            const removeBtn = div.querySelector('.remove-follower');
            removeBtn.addEventListener('click', () => {
                selectedFollowers.delete(follower.id_user);
                div.remove();
                updateHiddenInput();
            });

            selectedFollowersContainer.appendChild(div);
            updateHiddenInput();
        }

        if (menuBtn && menuDropdown) {
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => {
                originalTitle = editableTitle.textContent;
                originalDescription = editableDescription.textContent;
                editableTitle.contentEditable = true;
                editableDescription.contentEditable = true;
                saveChangesBtn.style.display = 'inline-block';
                cancelChangesBtn.style.display = 'inline-block';
                menuDropdown.style.display = 'none';

                // Cacher le lien "Voir le projet"
                if (viewProjectLink) {
                    viewProjectLink.style.display = 'none';
                }

                if (searchContainer) {
                    searchContainer.style.display = 'block';
                    searchInput.style.display = 'block';
                }
                participantButtons.forEach(btn => btn.style.display = 'inline-block');
            });
        }

        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', async () => {
                const newTitle = editableTitle.textContent;
                const newDescription = editableDescription.textContent;
                try {
                    const updateResponse = await fetch(`/project/update/${projectId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            name: newTitle, 
                            description: newDescription
                        })
                    });

                    for (let userId of selectedFollowers.keys()) {
                        const addUserResponse = await fetch(`/project/${projectId}/addUser`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: userId })
                        });
                        if (!addUserResponse.ok) {
                            console.error(`Erreur lors de l'ajout de l'utilisateur ${userId}`);
                        }
                    }

                    if (updateResponse.ok) {
                        editableTitle.contentEditable = false;
                        editableDescription.contentEditable = false;
                        participantButtons.forEach(btn => btn.style.display = 'none');
                        saveChangesBtn.style.display = 'none';
                        cancelChangesBtn.style.display = 'none';

                        // Réafficher le lien "Voir le projet"
                        if (viewProjectLink) {
                            viewProjectLink.style.display = 'inline-block';
                        }

                        if (searchInput) searchInput.style.display = 'none';
                        if (searchContainer) searchContainer.style.display = 'none';
                        selectedFollowers.clear();
                        followerList.innerHTML = ''; 
                        window.location.reload();
                    } else {
                        throw new Error('Erreur lors de la modification du projet');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    editableTitle.textContent = originalTitle;
                    editableDescription.textContent = originalDescription;
                    if (searchInput) searchInput.style.display = 'none';
                    if (searchContainer) searchContainer.style.display = 'none';
                }
            });
        }

        if (cancelChangesBtn) {
            cancelChangesBtn.addEventListener('click', () => {
                editableTitle.textContent = originalTitle;
                editableDescription.textContent = originalDescription;
                editableTitle.contentEditable = false;
                editableDescription.contentEditable = false;
                participantButtons.forEach(btn => btn.style.display = 'none');
                saveChangesBtn.style.display = 'none';
                cancelChangesBtn.style.display = 'none';

                // Réafficher le lien "Voir le projet"
                if (viewProjectLink) {
                    viewProjectLink.style.display = 'inline-block';
                }

                if (searchInput) searchInput.style.display = 'none';
                if (searchContainer) searchContainer.style.display = 'none';
                selectedFollowers.clear();
                followerList.innerHTML = '';
            });
        }

        if (participantButtons.length > 0) {
            participantButtons.forEach(btn => {
                btn.addEventListener('click', function(event) {
                    const projectId = btn.closest('.project-item').dataset.projectId;
                    const userId = btn.dataset.userId;
                    showModal('confirmModal', `Voulez-vous vraiment supprimer ce participant ?`, userId, projectId);
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', async (e) => {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    try {
                        const response = await fetch(`/searchFollowers?query=${encodeURIComponent(query)}`);
                        const followers = await response.json();

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
                                    toggleFollowerList(false);
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
                    followerList.innerHTML = ''; 
                    toggleFollowerList(false);
                }
            });
        }
    });

    function showModal(modalId, message, userId, projectId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.querySelector('.modal-body').innerText = message;
        modal.style.display = 'block';

        const confirmBtn = modal.querySelector('#confirmDelete-' + modalId);
        const cancelBtn = modal.querySelector('#confirmCancel-' + modalId);
        const closeBtn = modal.querySelector('#closeSuccess');

        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                modal.style.display = 'none';
                try {
                    const response = await fetch(`/project/${projectId}/removeParticipant`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: userId })
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        document.querySelector(`[data-user-id="${userId}"]`).closest('li').remove();
                        showModal('successModal', 'Participant supprimé avec succès.', null, null);
                    } else {
                        throw new Error(data.message || 'Erreur lors de la suppression.');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de la suppression du participant.');
                }
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        modal.querySelector('.closeModal').onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.project-header')) {
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});