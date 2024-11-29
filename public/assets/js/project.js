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
        const searchContainer = item.querySelector(`#searchContainer-${projectId}`);
        const searchInput = item.querySelector(`#searchUser-${projectId}`);
        
        let originalTitle, originalDescription;


        if (searchContainer) {
            searchContainer.style.display = 'none';
        }

        // Gestion du menu déroulant du projet
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
                menuDropdown.style.display = 'none'; // Fermer le menu déroulant lors de l'édition

                // Afficher la barre de recherche et les boutons de suppression des participants
                searchContainer.style.display = 'block';
                participantButtons.forEach(btn => btn.style.display = 'inline-block');
            });
        }


        // Enregistrer les modifications du projet
        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', async () => {
                const newTitle = editableTitle.textContent;
                const newDescription = editableDescription.textContent;
                try {
                    const response = await fetch(`/project/update/${projectId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newTitle, description: newDescription })
                    });
                    if (response.ok) {
                        editableTitle.contentEditable = false;
                        editableDescription.contentEditable = false;
                        participantButtons.forEach(btn => btn.style.display = 'none');
                        saveChangesBtn.style.display = 'none';
                        cancelChangesBtn.style.display = 'none';
        
                        // Masquer la barre de recherche après sauvegarde (utilisation de projectId pour ID spécifique)
                        const searchInput = item.querySelector(`#searchUser-${projectId}`);
                        if (searchInput) {
                            searchInput.style.display = 'none';
                        }
                        isEditing = false;
                    } else {
                        throw new Error('Erreur lors de la modification du projet');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    editableTitle.textContent = originalTitle;
                    editableDescription.textContent = originalDescription;
                }
            });
        }
        
        // Dans la section 'Annuler les modifications du projet'
        if (cancelChangesBtn) {
            cancelChangesBtn.addEventListener('click', () => {
                editableTitle.textContent = originalTitle;
                editableDescription.textContent = originalDescription;
                editableTitle.contentEditable = false;
                editableDescription.contentEditable = false;
                participantButtons.forEach(btn => btn.style.display = 'none');
                saveChangesBtn.style.display = 'none';
                cancelChangesBtn.style.display = 'none';
        
                // Masquer la barre de recherche après annulation (utilisation de projectId pour ID spécifique)
                const searchInput = item.querySelector(`#searchUser-${projectId}`);
                if (searchInput) {
                    searchInput.style.display = 'none';
                }
                isEditing = false;
            });
        }
        // Gestion de la suppression des participants
        if (participantButtons) {
            participantButtons.forEach(btn => {
                btn.addEventListener('click', async (event) => {
                    const userId = parseInt(btn.dataset.userId); // Récupère l'ID de l'utilisateur depuis l'attribut data

                    if (confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
                        try {
                            const response = await fetch(`/project/${projectId}/removeParticipant`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId }) // Envoie l'ID de l'utilisateur dans le corps de la requête
                            });
                            const data = await response.json();
                            if (response.ok && data.success) {
                                btn.closest('li').remove();
                                alert('Participant supprimé avec succès.');
                            } else {
                                throw new Error(data.message || 'Erreur lors de la suppression.');
                            }
                        } catch (error) {
                            console.error('Erreur:', error);
                            alert('Une erreur est survenue lors de la suppression du participant.');
                        }
                    }
                });
            });
        }

        // Gestion des fichiers attachés au projet
        const fileItems = item.querySelectorAll('.file-item');

        fileItems.forEach(fileItem => {
            const fileId = fileItem.dataset.fileId;
            const toggleBtn = fileItem.querySelector('.menu-btn');
            const menuDropdown = fileItem.querySelector('.menu-dropdown');
            const actionsMenu = fileItem.querySelector('.actions-menu');
            const editBtn = fileItem.querySelector('.edit-file-btn');
            const deleteBtn = fileItem.querySelector('.delete-file-btn');
            const fileName = fileItem.querySelector('.file-name');
            const fileDescription = fileItem.querySelector('.file-description');
            const editActions = fileItem.querySelector('.edit-actions');
            const saveBtn = fileItem.querySelector('.save-edit-btn');
            const cancelBtn = fileItem.querySelector('.cancel-edit-btn');

            let originalName, originalFileDescription;

            fileName.contentEditable = false;
            fileDescription.contentEditable = false;

            // Gestion du menu déroulant des fichiers
            if (toggleBtn && menuDropdown) {
                toggleBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
                });
            }

            // Édition du fichier
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    originalName = fileName.textContent;
                    originalFileDescription = fileDescription.textContent;
                    fileName.contentEditable = true;
                    fileDescription.contentEditable = true;
                    editActions.style.display = 'flex';
                    actionsMenu.style.display = 'none';
                });
            }

            // Enregistrer les modifications du fichier
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    const newName = fileName.textContent;
                    const newFileDescription = fileDescription.textContent;
                    try {
                        const response = await fetch(`/project/${projectId}/file/${fileId}/edit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: newName, description: newFileDescription })
                        });
                        if (response.ok) {
                            fileName.contentEditable = false;
                            fileDescription.contentEditable = false;
                            editActions.style.display = 'none';
                        } else {
                            throw new Error('Erreur lors de la modification du fichier');
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        fileName.textContent = originalName;
                        fileDescription.textContent = originalFileDescription;
                    }
                });
            }

            // Annuler les modifications du fichier
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    fileName.textContent = originalName;
                    fileDescription.textContent = originalFileDescription;
                    fileName.contentEditable = false;
                    fileDescription.contentEditable = false;
                    editActions.style.display = 'none';
                });
            }

            // Supprimer le fichier
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
                        try {
                            const response = await fetch(`/project/${projectId}/file/${fileId}/delete`, {
                                method: 'POST'
                            });
                            const data = await response.json();
                            if (response.ok && data.success) {
                                fileItem.remove();
                            } else {
                                throw new Error(data.error || 'Erreur lors de la suppression');
                            }
                        } catch (error) {
                            console.error('Erreur:', error);
                        }
                    }
                });
            }
        });
    });

    // Code pour la gestion de la recherche de participants
    const searchInput = document.getElementById('searchUser');
    const followerList = document.getElementById('followerList');
    const selectedFollowersInput = document.getElementById('selectedFollowers');
    const selectedFollowers = new Map();

    if (searchInput) {
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
                <button class="remove-follower">&times;</button>
            `;

            div.querySelector('.remove-follower').addEventListener('click', () => {
                selectedFollowers.delete(follower.id_user);
                div.remove();
                updateHiddenInput();
            });

            followerList.appendChild(div);
            updateHiddenInput();
        }

        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();

            if (query.length > 0) {
                try {
                    const response = await fetch(`/searchFollowers?query=${encodeURIComponent(query)}`);
                    const followers = await response.json();

                    followerList.innerHTML = ''; // Clear previous results
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

        document.addEventListener('click', (e) => {
            if (!followerList.contains(e.target) && e.target !== searchInput) {
                toggleFollowerList(false);
            }
        });
    }

    // Fermer les menus déroulants lorsqu'on clique en dehors d'eux
    document.addEventListener('click', () => {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.style.display = 'none';
        });
    });

    // Empêcher le clic de fermer le menu lorsqu'il est cliqué directement
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });
});
