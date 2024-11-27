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
