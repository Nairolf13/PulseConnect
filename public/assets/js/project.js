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

        let originalTitle, originalDescription;

        // Gestion du menu déroulant du projet
        if (menuBtn && menuDropdown) {
            menuBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
            });
        }

        // Gestion de l'édition du projet
        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => {
                originalTitle = editableTitle.textContent;
                originalDescription = editableDescription.textContent;
                editableTitle.contentEditable = true;
                editableDescription.contentEditable = true;
                participantButtons.forEach(btn => btn.style.display = 'inline-block');
                saveChangesBtn.style.display = 'inline-block';
                cancelChangesBtn.style.display = 'inline-block';
                menuDropdown.style.display = 'none'; // Fermer le menu déroulant lors de l'édition
            });
        }

        // Enregistrer les modifications du projet
        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', async () => {
                const newTitle = editableTitle.textContent;
                const newDescription = editableDescription.textContent;
                try {
                    const response = await fetch(`/project/${projectId}/edit`, {
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

        // Annuler les modifications du projet
        if (cancelChangesBtn) {
            cancelChangesBtn.addEventListener('click', () => {
                editableTitle.textContent = originalTitle;
                editableDescription.textContent = originalDescription;
                editableTitle.contentEditable = false;
                editableDescription.contentEditable = false;
                participantButtons.forEach(btn => btn.style.display = 'none');
                saveChangesBtn.style.display = 'none';
                cancelChangesBtn.style.display = 'none';
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

            const closeActionsBtn = fileItem.querySelector('.close-actions-btn');
            if (closeActionsBtn && actionsMenu) {
                closeActionsBtn.addEventListener('click', () => {
                    actionsMenu.style.display = 'none';
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
