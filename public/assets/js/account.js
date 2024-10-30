const deleteAccountLink = document.getElementById('deleteAccountLink');
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.getElementById('closeModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

deleteAccountLink.addEventListener('click', function(event) {
    event.preventDefault(); 
    deleteModal.style.display = 'block'; 
});

closeModal.addEventListener('click', function() {
    deleteModal.style.display = 'none';
});

cancelDelete.addEventListener('click', function() {
    deleteModal.style.display = 'none';
});

confirmDelete.addEventListener('click', function() {
    window.location.href = '/delete'; 
});

window.addEventListener('click', function(event) {
    if (event.target == deleteModal) {
        deleteModal.style.display = 'none';
    }
});