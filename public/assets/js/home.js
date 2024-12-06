// Gestion du rechargement au défilement vers le haut
window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const lastScrollTop = this.lastScrollTop || 0;

    if (scrollTop < lastScrollTop && scrollTop === 0) {
        location.reload();
    }
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

document.addEventListener('DOMContentLoaded', function () {
    // MutationObserver pour gérer les changements dynamiques du DOM
    const observer = new MutationObserver(() => {
        attachEventListeners();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    attachEventListeners(); // Attacher les événements initiaux
});

function attachEventListeners() {
    // Gestion des commentaires
    document.querySelectorAll('.comment-toggle-btn').forEach(button => {
        button.removeEventListener('click', toggleComments); // Éviter les doublons
        button.addEventListener('click', toggleComments);
    });

    // Gestion des boutons de partage
    document.querySelectorAll('.share-button').forEach(button => {
        button.removeEventListener('click', toggleShareModal); // Éviter les doublons
        button.addEventListener('click', toggleShareModal);
    });
}

function toggleComments() {
    const assetId = this.getAttribute('data-asset-id');
    const commentsContainer = document.getElementById(`comments-${assetId}`);

    if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        this.textContent = `💬 ${this.textContent.match(/\d+/)[0]}`;
    } else {
        commentsContainer.style.display = 'none';
        this.textContent = `💬 ${this.textContent.match(/\d+/)[0]}`;
    }
}

function toggleShareModal(event) {
    event.preventDefault();
    const contentId = this.id.split('-')[1];
    const modal = document.getElementById(`shareModal-${contentId}`);

    // Basculer l'affichage du modal
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }

    // Fermer le modal si on clique en dehors
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Fonctions de partage
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

// Gestion des modaux personnalisés
function showModal(message) {
    const modal = document.getElementById('customModal');
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    const modalContent = modal.querySelector('.modal-content');
    const modalMessage = modal.querySelector('#modalMessage');
    const closeButton = modal.querySelector('#closeModal');

    if (!modalContent || !modalMessage || !closeButton) {
        console.error("One or more modal elements not found");
        return;
    }

    modalMessage.textContent = message;
    modal.style.display = 'block';

    closeButton.onclick = function () {
        modal.style.display = 'none';
    };

    modal.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    modalContent.onclick = function (event) {
        event.stopPropagation();
    };
}

function copyLink(contentId) {
    const link = `${window.location.origin}/content/${contentId}`;

    navigator.clipboard.writeText(link)
        .then(() => {
            showCopyMessage(contentId);
        })
        .catch((err) => {
            alert('La copie n’est pas supportée sur ce navigateur.');
            console.error('Erreur lors de la copie :', err);
        });
}

function showCopyMessage(contentId) {
    const messageId = `copyMessage-${contentId}`;
    let messageElement = document.getElementById(messageId);

    if (!messageElement) {
        messageElement = document.createElement('span');
        messageElement.id = messageId;
        messageElement.className = 'copy-message';
        messageElement.textContent = 'Lien copié !';
        document.body.appendChild(messageElement);
    }

    messageElement.style.display = 'block';

    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 2000);
}



