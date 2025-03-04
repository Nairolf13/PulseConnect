import { showErrorModal, showSuccessModal,handleFetch } from "./error.js";


document.addEventListener('DOMContentLoaded', function () {
    let lastScrollTop = 0; 
    const header = document.querySelector('.headerRes');
    
    window.addEventListener("scroll", function () {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
        if (scrollTop < lastScrollTop && scrollTop === 0) {
            location.reload();
        }
    
        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden'); 
        } else {
            header.classList.remove('hidden'); 
        }
    
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    });
    

    const observer = new MutationObserver(() => {
        attachEventListeners();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    attachEventListeners();
});

function attachEventListeners() {
    document.querySelectorAll('.comment-toggle-btn').forEach(button => {
        button.removeEventListener('click', toggleComments);
        button.addEventListener('click', toggleComments);
    });

    document.querySelectorAll('.share-button').forEach(button => {
        button.removeEventListener('click', toggleShareModal);
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

    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

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


document.querySelectorAll('.like-button').forEach(button => {

    button.addEventListener('click', async (event) => {
        event.preventDefault();

        if (window.isProcessing) return;
        window.isProcessing = true;

        const assetId = button.dataset.assetId;
        const likeCountElement = button.querySelector('.like-count');

        try {
            const response = await fetch(`/like/${assetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                likeCountElement.textContent = data.likeCount;

                button.classList.toggle('liked', data.likeCount !== 0);
            } else {
                console.error('Erreur serveur:', data.message);
            }
        } catch (error) {
            console.error('Erreur lors du like/délike:', error);
        } finally {
            window.isProcessing = false;
        }
    });
});


document.querySelectorAll('.like-button').forEach(button => {
    let timeoutId;
    const MIN_PRESS_DURATION = 200;
    let isLiked = false;
    let isTouching = false;
    let isPressing = false;
    let modalOpen = false;

    const openModal = async (assetId) => {
        try {
            const response = await fetch(`/likes/users/${assetId}`);
            const data = await response.json();

            const userListElement = document.getElementById('userList');
            userListElement.innerHTML = '';

            if (response.ok && data.users.length > 0) {
                data.users.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.classList.add('like-user');
                    userItem.textContent = `${user.firstName} ${user.lastName} (${user.userName})`;
                    userListElement.appendChild(userItem);
                });
            } else {
                userListElement.innerHTML = "Aucun utilisateur n'a aimé.";
            }

            const modal = document.getElementById('likeModal');
            modal.style.display = 'block';
            modalOpen = true;
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs ayant liké:", error);
        }
    };

    const handleLikeClick = async (event) => {
        const assetId = button.dataset.assetId;

        if (timeoutId || modalOpen) {
            return;
        }

        try {
            const response = await fetch(`/like/${assetId}`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                isLiked = !isLiked;
                button.classList.toggle('liked', isLiked);
            } else {
                console.error('Erreur lors du changement du statut de like');
            }
        } catch (error) {
            console.error('Erreur lors de l\'action de like/dislike:', error);
        }
    };

    button.addEventListener('click', handleLikeClick);

    button.addEventListener('touchstart', (event) => {
        if ('ontouchstart' in window) {
            button.removeEventListener('click', handleLikeClick);
        }

        if (!isTouching) {
            isTouching = true;
            timeoutId = setTimeout(() => {
                isPressing = true;
                openModal(button.dataset.assetId);
            }, MIN_PRESS_DURATION);
        }
    });

    button.addEventListener('touchend', (event) => {
        if (isTouching) {
            isTouching = false;
            clearTimeout(timeoutId);
            if (!isPressing && !modalOpen) {
                if ('ontouchstart' in window) {
                    button.addEventListener('click', handleLikeClick);
                }
                handleLikeClick(event);
            }
            isPressing = false;
        }
    });

    button.addEventListener('mousedown', (event) => {
        const assetId = button.dataset.assetId;
        event.preventDefault();
        timeoutId = setTimeout(() => {
            isPressing = true;
            openModal(assetId);
        }, MIN_PRESS_DURATION);
    });

    button.addEventListener('mouseup', () => {
        clearTimeout(timeoutId);
        if (!isPressing && !modalOpen) {
            handleLikeClick(event);
        }
        isPressing = false;
    });

    button.addEventListener('touchcancel', () => {
        clearTimeout(timeoutId);
        if ('ontouchstart' in window) {
            button.addEventListener('click', handleLikeClick);
        }
    });

    button.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId);
    });
});

document.querySelector('.close').addEventListener('click', () => {
    const modal = document.getElementById('likeModal');
    modal.style.display = 'none';
    modalOpen = false;
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('likeModal');
    if (event.target === modal) {
        modal.style.display = 'none';
        modalOpen = false;
    }
});


const optionsModal = document.getElementById('optionsModal');
const editCommentBtn = document.getElementById('editCommentBtn');
const deleteCommentBtn = document.getElementById('deleteCommentBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let currentCommentId = null;

document.querySelectorAll('.options-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const comment = event.target.closest('.comment');
        currentCommentId = comment.getAttribute('id').replace('comment-', '');

        optionsModal.style.display = 'flex';
    });
});

editCommentBtn.addEventListener('click', () => {
    const commentElement = document.querySelector(`#comment-${currentCommentId} .comment-content`);
    const currentText = commentElement.textContent;

    const editContainer = document.createElement('div');
    editContainer.className = 'edit-container';

    const input = document.createElement('textarea');
    input.value = currentText;
    input.className = 'edit-comment-input';
    input.style.width = '100%';
    input.style.height = 'auto';
    input.style.overflow = 'hidden';
    input.style.resize = 'none';
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Enregistrer';
    saveButton.className = 'save-comment-btn';

    editContainer.appendChild(input);
    editContainer.appendChild(saveButton);

    commentElement.replaceWith(editContainer);
    input.focus();
    input.dispatchEvent(new Event('input'));

    saveButton.addEventListener('click', async () => {
        const updatedText = input.value;

        try {
            const response = await fetch(`/comment/${currentCommentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: updatedText }),
            });

            if (response.ok) {
                const updatedComment = await response.json();
                const newContentElement = document.createElement('p');
                newContentElement.textContent = updatedComment.content;
                newContentElement.className = 'comment-content';
                editContainer.replaceWith(newContentElement);
            } else {
                showErrorModal("Erreur lors de la modification du commentaire.");
                editContainer.replaceWith(commentElement);
            }
        } catch (error) {
            console.error("Erreur :", error);
            editContainer.replaceWith(commentElement);
        }
    });

    optionsModal.style.display = 'none';
});

deleteCommentBtn.addEventListener('click', () => {
    deleteModal.style.display = 'flex';
    optionsModal.style.display = 'none';
});

confirmDeleteBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`/comment/${currentCommentId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const scrollPosition = window.scrollY;

            window.location.reload();
            window.scrollTo(0, scrollPosition);
        } else {
            alert("Erreur lors de la suppression du commentaire.");
        }
    } catch (error) {
        console.error("Erreur :", error);
    }
    deleteModal.style.display = 'none';
});


cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

closeModalBtn.addEventListener('click', () => {
    optionsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === optionsModal) {
        optionsModal.style.display = 'none';
    }
    if (event.target === deleteModal) {
        deleteModal.style.display = 'none';
    }
});