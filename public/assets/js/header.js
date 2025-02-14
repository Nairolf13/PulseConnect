document.addEventListener('DOMContentLoaded', function () {
    const createButton = document.getElementById('createButton');
    const modal = document.getElementById('createModal');
    const closeModal = document.getElementById('closeModal');
    const createSpaceButton = document.getElementById('createSpaceButton');
    const publishPostButton = document.getElementById('publishPostButton');

    createButton.addEventListener('click', function (event) {
        event.preventDefault();  
        modal.style.display = 'block'; 
    });

    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    createSpaceButton.addEventListener('click', function () {
        window.location.href = '/collaboration';
    });

    publishPostButton.addEventListener('click', function () {
        window.location.href = '/addcontent';
    });

window.addEventListener('scroll', function() {
    if (window.innerWidth <= 980) {  
        const header = document.getElementById('containerHeader');
        if (window.scrollY > 50) {  
            header.classList.add('nav-scrolled');
        } else {
            header.classList.remove('nav-scrolled'); 
        }
    }
});

});
