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


document.addEventListener('DOMContentLoaded', function() {
    const commentButtons = document.querySelectorAll('.comment-toggle-btn');
    const shareButtons = document.querySelectorAll('.share-button');

    commentButtons.forEach(button => {
        button.addEventListener('click', function () {
            const assetId = this.getAttribute('data-asset-id');
            const commentsContainer = document.getElementById(`comments-${assetId}`);

            if (commentsContainer.style.display === 'none') {
                commentsContainer.style.display = 'block';
                this.textContent = `💬 ${this.textContent.match(/\d+/)[0]}`;
            } else {
                commentsContainer.style.display = 'none';
                this.textContent = `💬 ${this.textContent.match(/\d+/)[0]}`;
            }
        });
    });

    shareButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const contentId = this.id.split('-')[1];
            const modal = document.getElementById(`shareModal-${contentId}`);
            modal.style.display = 'block';

        

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            }
        });
    });
});

function shareOnFacebook(contentId) {
    const postUrl = encodeURIComponent(`${window.location.origin}/uploads/${contentId}`);
    window.open(`https://www.facebook.com/sharer.php?u=${postUrl}`, '_blank');
}

function shareOnTwitter(contentId) {
    const postUrl = encodeURIComponent(`${window.location.origin}/uploads/${contentId}`);
    const postTitle = encodeURIComponent(document.title);
    window.open(`https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`, '_blank');
}

function shareOnLinkedIn(contentId) {
    const postUrl = encodeURIComponent(`${window.location.origin}/uploads/${contentId}`);
    const postTitle = encodeURIComponent(document.title);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}&title=${postTitle}`, '_blank');
}

function shareOnWhatsApp(contentId) {
    const postUrl = encodeURIComponent(`${window.location.origin}/uploads/${contentId}`);
    const postTitle = encodeURIComponent(document.title);
    window.open(`https://api.whatsapp.com/send?text=${postTitle} ${postUrl}`, '_blank');
}

function showModal(message) {
    const modal = document.getElementById('customModal');
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    const modalContent = modal.querySelector('.modal-content');
    const modalMessage = modal.getElementById('modalMessage');
    const closeButton = modal.getElementById('closeModal');

    if (!modalContent || !modalMessage || !closeButton) {
        console.error("One or more modal elements not found");
        return;
    }

    modalMessage.textContent = message;
    modal.style.display = 'block';

    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    modalContent.onclick = function(event) {
        event.stopPropagation();
    }
}

function copyLink(contentId) {
    const postUrl = `${window.location.origin}/post/${contentId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
        showModal("Lien copié dans le presse-papiers !");
    });
}