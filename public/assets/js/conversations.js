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

    // Appeler scrollToBottom pour faire défiler vers le bas dès que la page est prête
    scrollToBottom();

    // Ouvrir la modale pour éditer ou supprimer le message
    function showModal(message) {
        currentMessage = message;
        document.getElementById('confirmationModal').style.display = 'block';
    }

    // Fonction de fermeture de la modale
    $('#closeModal, #cancelDelete').on('click', function () {
        $('#confirmationModal').hide();
    });

    // Gérer la suppression du message
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

    // Gérer la modification du message
    $('#editMessage').on('click', function () {

        if (currentMessage.querySelector('.save-message-btn')) return;

        $('#confirmationModal').hide();

        const messageContent = currentMessage.querySelector('#texte'); // Récupérer le texte à modifier
        const originalText = messageContent.textContent; // Texte original

        // Rendre l'élément directement éditable
        messageContent.setAttribute('contenteditable', 'true');
        messageContent.classList.add('editable'); // Ajouter une classe pour styliser l'élément édité

        // Créer un bouton "Enregistrer"
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Enregistrer';
        saveButton.className = 'save-message-btn';

        // Créer un bouton "Annuler"
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Annuler';
        cancelButton.className = 'cancel-message-btn';

        // Ajouter les boutons sous le message
        currentMessage.appendChild(saveButton);
        currentMessage.appendChild(cancelButton);

        // Appliquer des styles CSS au bouton
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

// Quand l'utilisateur clique sur "Enregistrer"
saveButton.addEventListener('click', async () => {
    let newText = messageContent.textContent; // Récupérer le texte modifié

    // Vérifier si "(modifié)" n'est pas déjà à la fin du message
    const modifiedLabel = " (modifié)"; // Notez l'espace avant "(modifié)" pour l'espacer

    // Vérifier si "(modifié)" est déjà présent à la fin du message
    if (!newText.endsWith(modifiedLabel)) {
        // Si "(modifié)" n'est pas à la fin, l'ajouter avec un espace supplémentaire avant
        newText = newText + modifiedLabel;
    }

    messageContent.textContent = newText; // Mettre à jour le texte du message

    // Mise à jour dans la base de données
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
            messageContent.removeAttribute('contenteditable'); // Désactiver l'édition
            saveButton.remove(); // Supprimer le bouton "Enregistrer"
            cancelButton.remove(); // Supprimer le bouton "Annuler"
            console.log('Message mis à jour avec succès');
        } else {
            console.error('Erreur lors de la mise à jour du message');
            alert('Une erreur est survenue lors de la mise à jour.');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});




        // Quand l'utilisateur clique sur "Annuler"
        cancelButton.addEventListener('click', () => {
            messageContent.textContent = originalText; // Rétablir le texte original
            messageContent.removeAttribute('contenteditable'); // Désactiver l'édition
            saveButton.remove(); // Supprimer le bouton "Enregistrer"
            cancelButton.remove(); // Supprimer le bouton "Annuler"
        });
    });

    // Gestion des actions de clic sur les points de menu
    document.querySelectorAll('#messages > div .options-dots').forEach(dot => {
        dot.addEventListener('click', function (e) {
            e.stopPropagation();
            if (document.getElementById('confirmationModal').style.display !== 'block') {
                showModal(dot.closest('div')); // Passer le div du message
            }
        });
    });

    // Gestion des actions tactiles (pour mobile)
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
