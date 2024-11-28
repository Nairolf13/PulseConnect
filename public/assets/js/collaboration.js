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
            actionsMenu.style.display = actionsMenu.style.display === 'none' ? 'flex' : 'none';
        });

        const closeActionsBtn = item.querySelector('.close-actions-btn');
        closeActionsBtn.addEventListener('click', () => {
            actionsMenu.style.display = 'none';
        });

        editBtn.addEventListener('click', () => {
            originalName = fileName.textContent;
            originalDescription = fileDescription.textContent;
            fileName.contentEditable = true;
            fileDescription.contentEditable = true;
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
            editActions.style.display = 'none';
        });

        deleteBtn.addEventListener('click', async () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
                try {
                    const response = await fetch(`/project/${projectId}/file/${fileId}/delete`, {
                        method: 'POST'
                    });
                    const data = await response.json();
                    if (response.ok && data.success) {
                        item.remove();
                    } else {
                        throw new Error(data.error || 'Erreur lors de la suppression');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    (error.message);
                }
            }
        });
    });
});