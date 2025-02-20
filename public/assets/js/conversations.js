$(document).ready(function () {
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    let currentMessage;
    let startX;

    function scrollToBottom() {
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }

    scrollToBottom();

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
                } else {
                    console.error('Erreur lors de la suppression du message');
                }
            })
            .catch(error => console.error('Erreur:', error));
    });

    $('#editMessage').on('click', function () {

        if (currentMessage.querySelector('.save-message-btn')) return;

        $('#confirmationModal').hide();

        const messageContent = currentMessage.querySelector('#texte'); 
        const originalText = messageContent.textContent; 

        messageContent.setAttribute('contenteditable', 'true');
        messageContent.classList.add('editable'); 

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Enregistrer';
        saveButton.className = 'save-message-btn';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Annuler';
        cancelButton.className = 'cancel-message-btn';

        currentMessage.appendChild(saveButton);
        currentMessage.appendChild(cancelButton);

        saveButton.style.marginTop = '10px';
        saveButton.style.backgroundColor = '#2bc2d9';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.padding = '5px 10px';
        saveButton.style.cursor = 'pointer';

        cancelButton.style.marginTop = '10px';
        cancelButton.style.backgroundColor = '#f44336';
        cancelButton.style.color = 'white';
        cancelButton.style.border = 'none';
        cancelButton.style.padding = '5px 10px';
        cancelButton.style.cursor = 'pointer';

saveButton.addEventListener('click', async () => {
    let newText = messageContent.textContent;

    const modifiedLabel = " (modifié)"; 

    if (!newText.endsWith(modifiedLabel)) {
        newText = newText + modifiedLabel;
    }

    messageContent.textContent = newText; 

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
            messageContent.removeAttribute('contenteditable'); 
            saveButton.remove(); 
            cancelButton.remove(); 
            console.log('Message mis à jour avec succès');
        } else {
            console.error('Erreur lors de la mise à jour du message');
            alert('Une erreur est survenue lors de la mise à jour.');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});




        cancelButton.addEventListener('click', () => {
            messageContent.textContent = originalText; 
            messageContent.removeAttribute('contenteditable'); 
            saveButton.remove(); 
            cancelButton.remove(); 
        });
    });

    document.querySelectorAll('#messages > div .options-dots').forEach(dot => {
        dot.addEventListener('click', function (e) {
            e.stopPropagation();
            if (document.getElementById('confirmationModal').style.display !== 'block') {
                showModal(dot.closest('div')); 
            }
        });
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

    

});
