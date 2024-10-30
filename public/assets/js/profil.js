function openModal(postId) {
    
    const deleteForm = document.getElementById('deleteForm');
    deleteForm.action = '/deleteContent/' + postId;

    const deleteButton = deleteForm.querySelector('.confirm-delete');
    if (deleteButton) {
        deleteButton.classList.add('delete-btn'); 
    }

    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex'; 
}

function closeModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none'; 
}


window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        modal.style.display = 'none'; 
    }
}
