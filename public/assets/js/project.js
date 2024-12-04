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
        const fileItems = item.querySelectorAll('.file-item');

        let originalTitle, originalDescription;
        let selectedFollowers = new Map();

        // Fonction pour basculer l'affichage de la liste des followers
        function toggleFollowerList(visible) {
            followerList.style.display = visible ? 'block' : 'none';
        }

        // Fonction pour mettre à jour l'input caché avec les IDs des followers sélectionnés
        function updateHiddenInput() {
            selectedFollowersInput.value = JSON.stringify([...selectedFollowers.keys()]);
        }

        // Fonction pour ajouter un follower à la liste des sélectionnés
  // Fonction pour ajouter un follower à la liste des sélectionnés
function addFollower(follower) {
    if (selectedFollowers.has(follower.id_user)) return;

    selectedFollowers.set(follower.id_user, follower);

    const selectedFollowersContainer = document.getElementById('selectedFollowersContainer');
    if (!selectedFollowersContainer) {
        console.error('Container for selected followers not found');
        return;
    }

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
        // Gestion du menu déroulant du projet
        if (menuBtn && menuDropdown) {
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
            });
        }

        // Mode édition du projet
        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => {
                originalTitle = editableTitle.textContent;
                originalDescription = editableDescription.textContent;
                editableTitle.contentEditable = true;
                editableDescription.contentEditable = true;
                saveChangesBtn.style.display = 'inline-block';
                cancelChangesBtn.style.display = 'inline-block';
                menuDropdown.style.display = 'none';

                if (searchContainer) {
                    searchContainer.style.display = 'block';
                    searchInput.style.display = 'block';
                }
                participantButtons.forEach(btn => btn.style.display = 'inline-block');
            });
        }

        // Sauvegarde des modifications du projet
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

                    // Add selected followers to the project
                    for (let userId of selectedFollowers.keys()) {
                        const addUserResponse = await fetch(`/project/${projectId}/addUser`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: userId })
                        });
                        if (!addUserResponse.ok) {
                            console.error(`Erreur lors de l'ajout de l'utilisateur ${userId}`);
                            // You might want to show an error to the user here
                        }
                    }

                    if (updateResponse.ok) {
                        editableTitle.contentEditable = false;
                        editableDescription.contentEditable = false;
                        participantButtons.forEach(btn => btn.style.display = 'none');
                        saveChangesBtn.style.display = 'none';
                        cancelChangesBtn.style.display = 'none';
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

        // Annulation des modifications du projet
        if (cancelChangesBtn) {
            cancelChangesBtn.addEventListener('click', () => {
                editableTitle.textContent = originalTitle;
                editableDescription.textContent = originalDescription;
                editableTitle.contentEditable = false;
                editableDescription.contentEditable = false;
                participantButtons.forEach(btn => btn.style.display = 'none');
                saveChangesBtn.style.display = 'none';
                cancelChangesBtn.style.display = 'none';
                if (searchInput) searchInput.style.display = 'none';
                if (searchContainer) searchContainer.style.display = 'none';
                selectedFollowers.clear();
                followerList.innerHTML = '';
            });
        }

        // Suppression des participants
        if (participantButtons) {
            participantButtons.forEach(btn => {
                btn.addEventListener('click', function(event) {
                    const projectId = item.dataset.projectId;
                    const userId = btn.dataset.userId;
                    
                    // Show confirmation modal
                    showModal('confirmModal', `Voulez-vous vraiment supprimer ce participant ?`, userId, projectId);
                });
            });
        }

        // Recherche et ajout de participants
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
                    toggleFollowerList(false);
                }
            });

            // Fermer la liste des followers si un clic se produit en dehors de la liste ou de l'input de recherche
            document.addEventListener('click', (e) => {
                if (!followerList.contains(e.target) && e.target !== searchInput) {
                    toggleFollowerList(false);
                }
            });
        }

        // Gestion des fichiers attachés au projet
        // ... (le code pour la gestion des fichiers reste inchangé)
    });

    // Fonction pour afficher la modale
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
                        // Remove participant from the list
                        document.querySelector(`[data-user-id="${userId}"]`).closest('li').remove();
                        // Show success modal
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

        // Event listener for "Non" button
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // Event listener for "Fermer" button
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // Handle modal closing
        modal.querySelector('.closeModal').onclick = () => {
            modal.style.display = 'none';
        };

        // Close modal if clicked outside
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Fermer les menus déroulants lorsqu'on clique en dehors d'eux
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.project-header')) {
            document.querySelectorAll('.menu-dropdown').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
});

