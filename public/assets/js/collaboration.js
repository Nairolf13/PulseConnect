function toggleComments(fileId) {
    const commentsSection = document.getElementById('comments-' + fileId);
    const button = document.getElementById('btn-toggle-' + fileId);

    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        button.textContent = 'Fermer les commentaires';
    } else {
        commentsSection.style.display = 'none';
        button.textContent = 'Afficher les commentaires';
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-container');
    sidebar.classList.toggle('visible');
}

document.addEventListener('DOMContentLoaded', function () {
    const projectContainer = document.getElementById('project-container');
    const projectId = projectContainer.dataset.projectId;
    const fileItems = document.querySelectorAll('.file-item');

    fileItems.forEach(item => {
        const fileId = item.dataset.fileId;
        const toggleBtn = item.querySelector('.toggle-actions-btn');
        const actionsMenu = item.querySelector('.actions-menu');
        const editBtn = item.querySelector('.edit-file-btn');
        const deleteBtn = item.querySelector('.delete-file-btn');
        const fileName = item.querySelector('.file-name');
        const fileDescription = item.querySelector('.file-description');
        const editActions = item.querySelector('.edit-actions');
        const saveBtn = item.querySelector('.save-edit-btn');
        const cancelBtn = item.querySelector('.cancel-edit-btn');

        let originalName, originalDescription;

        toggleBtn.addEventListener('click', () => {
            actionsMenu.style.display = actionsMenu.style.display === 'none' ? 'block' : 'none';
        });

        

        document.addEventListener('click', (event) => {
            if (!actionsMenu.contains(event.target) && !toggleBtn.contains(event.target)) {
                actionsMenu.style.display = 'none';
            }
        });
        

        editBtn.addEventListener('click', () => {
            originalName = fileName.textContent;
            originalDescription = fileDescription.textContent;
            fileName.contentEditable = true;
            fileDescription.contentEditable = true;
            fileName.classList.add('editing');
            fileDescription.classList.add('editing');
            editActions.style.display = 'flex';
            actionsMenu.style.display = 'none';
        });

        saveBtn.addEventListener('click', async () => {
            const newName = fileName.textContent;
            const newDescription = fileDescription.textContent;
            try {
                const response = await fetch(`/project/${projectId}/file/${fileId}/edit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName, description: newDescription })
                });
                if (response.ok) {
                    fileName.contentEditable = false;
                    fileDescription.contentEditable = false;
                    fileName.classList.remove('editing');
                    fileDescription.classList.remove('editing');
                    editActions.style.display = 'none';
                } else {
                    throw new Error('Erreur lors de la modification');
                }
            } catch (error) {
                console.error('Erreur:', error);
                fileName.textContent = originalName;
                fileDescription.textContent = originalDescription;
            }
        });

        cancelBtn.addEventListener('click', () => {
            fileName.textContent = originalName;
            fileDescription.textContent = originalDescription;
            fileName.contentEditable = false;
            fileDescription.contentEditable = false;
            fileName.classList.remove('editing');
            fileDescription.classList.remove('editing');
            editActions.style.display = 'none';
        });

        deleteBtn.addEventListener('click', () => {
            // Référence au modal
            const deleteModal = document.getElementById('deleteModal');
            const deleteForm = document.getElementById('deleteForm');
        
            // Afficher le modal
            deleteModal.style.display = 'block';
            
            if (deleteModal.style.display === 'block'){
                actionsMenu.style.display = 'none';
            }
        
            // Préparer la soumission du formulaire lors de la confirmation
            deleteForm.onsubmit = async function (event) {
                event.preventDefault(); // Empêche le rechargement de la page
        
                try {
                    const response = await fetch(`/project/${projectId}/file/${fileId}/delete`, {
                        method: 'POST'
                    });
                    const data = await response.json();
        
                    if (response.ok && data.success) {
                        item.remove(); // Supprime l'élément de la liste
                    } else {
                        throw new Error(data.error || 'Erreur lors de la suppression');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert(error.message);
                } finally {
                    closeModal(); // Fermer le modal après l'action
                }
            };
        });
        
        // Fonction pour fermer le modal
        function closeModal() {
            const modal = document.getElementById('deleteModal');
            modal.style.display = 'none'; 
        }
        
        // Fermer le modal en cliquant en dehors
        window.onclick = function (event) {
            const modal = document.getElementById('deleteModal');
            if (event.target === modal) {
                closeModal(); // Appelle la fonction de fermeture
            }
        };
        
        // Ajouter un événement au bouton "Annuler"
        document.querySelector('.cancel-delete').addEventListener('click', closeModal);
        
    });
});