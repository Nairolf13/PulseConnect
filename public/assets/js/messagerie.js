
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchUser');
    const userList = document.createElement('div');
    userList.id = 'userList';
    searchInput.parentNode.insertBefore(userList, searchInput.nextSibling);

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length > 0) {
            fetch(`/searchUsers?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(users => {
                    userList.innerHTML = '';
                    users.forEach(user => {
                        const userItem = document.createElement('div');
                        userItem.className = 'user-item';
                        userItem.innerHTML = `
                            <img src="${user.picture}" alt="${user.userName}">
                            <span>${user.userName}</span>
                        `;
                        userItem.addEventListener('click', () => {
                            window.location.href = `/conversation/${user.id_user}`;
                        });
                        userList.appendChild(userItem);
                    });
                    userList.style.display = users.length > 0 ? 'block' : 'none';
                })
                .catch(error => console.error('Erreur:', error));
        } else {
            userList.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && !userList.contains(e.target)) {
            userList.style.display = 'none';
        }
    });
});

async function openDeleteModal(userId) {
    const modal = document.getElementById('deleteConversationModal');
    modal.style.display = 'block';

    document.getElementById('confirmDeleteButton').onclick = async function () {
        try {
            const response = await fetch(`/deleteConversation/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const conversationItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (conversationItem) {
                conversationItem.remove();
            }
    
            modal.style.display = 'none'; 
    
            const successModal = document.getElementById('successModal');
            successModal.style.display = 'block';
    
            const closeSuccessModalButton = document.getElementById('closeSuccessModal');
            const closeModalButton = document.getElementById('closeModalButton');
            closeSuccessModalButton.onclick = closeModalButton.onclick = function () {
                successModal.style.display = 'none';
            };
    
        } catch (error) {
            console.error('Erreur lors de la suppression de la conversation:', error);
    
            const successModal = document.getElementById('successModal');
            const successMessage = document.getElementById('successMessage');
            successMessage.textContent = `Erreur lors de la suppression : ${error.message}`;
            successModal.style.display = 'block';

            const closeSuccessModalButton = document.getElementById('closeSuccessModal');
            const closeModalButton = document.getElementById('closeModalButton');
            closeSuccessModalButton.onclick = closeModalButton.onclick = function () {
                successModal.style.display = 'none';
            };
        }
    };

}


const closeButton = document.querySelector('#closeModal');
const cancelButton = document.getElementById('cancelDeleteButton');

function closeModal() {
    
  
    document.getElementById('deleteConversationModal').style.display = 'none';
}
cancelButton.addEventListener('click', function() {
    
    document.getElementById('deleteConversationModal').style.display = 'none';
});
window.onclick = function (event) {
    const modal = document.getElementById('deleteConversationModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};






