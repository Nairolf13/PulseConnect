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
    if (sidebar) {
        if (sidebar.style.display === 'none' || sidebar.style.display === '') {
            sidebar.style.display = 'block'; 
        } else {
            sidebar.style.display = 'none'; 
        }
    } else {
        console.error('Element .sidebar-container introuvable');
    }
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
            const deleteModal = document.getElementById('deleteModal');
            const deleteForm = document.getElementById('deleteForm');
        
            deleteModal.style.display = 'block';
            
            if (deleteModal.style.display === 'block'){
                actionsMenu.style.display = 'none';
            }
        
            deleteForm.onsubmit = async function (event) {
                event.preventDefault(); 
        
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
                    alert(error.message);
                } finally {
                    closeModal(); 
                }
            };
        });
        
        function closeModal() {
            const modal = document.getElementById('deleteModal');
            modal.style.display = 'none'; 
            
        }
        
        
        window.onclick = function (event) {
            const modal = document.getElementById('deleteModal');
            if (event.target === modal) {
                closeModal(); 
            }
        };
        
        document.querySelector('.cancel-delete').addEventListener('click', closeModal);
        
    });

    const fileInput = document.getElementById('fileInput');
    const fileLabel = document.getElementById('fileLabel');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const audioPreview = document.getElementById('audioPreview');

    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'none';
            audioPreview.style.display = 'none';

            if (this.files && this.files[0]) {
                const file = this.files[0];
                const fileName = file.name;
                const fileType = file.type;
                const fileURL = URL.createObjectURL(file);

                fileLabel.textContent = fileName;

                if (fileType.startsWith('image/')) {
                    imagePreview.src = fileURL;
                    imagePreview.onload = () => {
                        imagePreview.style.display = 'block';
                    };
                } else if (fileType.startsWith('video/') || fileName.toLowerCase().endsWith('.mp4')) {
                    videoPreview.src = fileURL;
                    videoPreview.onloadedmetadata = () => {
                        videoPreview.style.display = 'block';
                    };
                } else if (fileType.startsWith('audio/') || fileName.toLowerCase().endsWith('.mp3')) {
                    audioPreview.src = fileURL;
                    audioPreview.onloadedmetadata = () => {
                        audioPreview.style.display = 'block';
                    };
                }
            } else {
                fileLabel.textContent = 'Aucun fichier sélectionné';
            }
        });
    }
});