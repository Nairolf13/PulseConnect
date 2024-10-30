$(document).ready(function () {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    let lastScrollTop = 0;
    let startX, currentMessage;

    function scrollToBottom() {
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    scrollToBottom();

    messagesContainer.addEventListener("scroll", function () {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;

        if (scrollHeight - scrollTop === clientHeight) {
            location.reload();
        }
    });

    messageInput.addEventListener('focus', function () {
        document.body.classList.add('keyboard-open');
        scrollToBottom(); 
    });

    messageInput.addEventListener('blur', function () {
        document.body.classList.remove('keyboard-open');
    });

    function adjustForKeyboard(isOpen) {
        if (isOpen) {
            messagesContainer.classList.add('keyboard-open');
        } else {
            messagesContainer.classList.remove('keyboard-open');
        }
        setTimeout(scrollToBottom, 300);
    }

    window.addEventListener('resize', function () {
        const keyboardOpen = window.innerHeight < document.documentElement.clientHeight;
        adjustForKeyboard(keyboardOpen);
    });

    document.querySelectorAll('#messages > div').forEach(message => {
        message.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].clientX;
        });

        message.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            if (Math.abs(startX - endX) > 50) {
                showModal(message);
            }
        });
    });

    function showModal(message) {
        currentMessage = message;
        document.getElementById('confirmationModal').style.display = 'block';
    }

    $('#closeModal, #cancelDelete').on('click', function () {
        $('#confirmationModal').hide();
    });

    $('#confirmDelete').on('click', function () {
        const messageId = currentMessage.getAttribute('data-message-id');
        fetch(`/deleteMessage/${messageId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    currentMessage.remove();
                    $('#confirmationModal').hide();
                    scrollToBottom();
                } else {
                    console.error('Erreur lors de la suppression du message');
                }
            })
            .catch(error => console.error('Erreur:', error));
    });

    $('#editMessage').on('click', function () {
        $('#confirmationModal').hide(); 

        const messageContent = currentMessage.querySelector('p');
        const originalText = messageContent.textContent;
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = originalText;
        editInput.className = 'edit-input';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Enregistrer';
        saveButton.className = 'save-button';

        messageContent.replaceWith(editInput);
        currentMessage.appendChild(saveButton);

        saveButton.addEventListener('click', async () => {
            const newText = editInput.value;
            const messageId = currentMessage.getAttribute('data-message-id');

            try {
                const response = await fetch(`/updateMessage/${messageId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: newText }),
                });

                if (response.ok) {
                    const updatedText = document.createElement('p');
                    updatedText.textContent = newText;
                    editInput.replaceWith(updatedText);
                    saveButton.remove(); 
                    console.log('Message mis à jour avec succès');
                } else {
                    console.error('Erreur lors de la mise à jour du message');
                    alert('Une erreur est survenue lors de la mise à jour.');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    });
});
