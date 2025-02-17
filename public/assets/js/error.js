function showErrorModal(errorMessage) {
    document.getElementById('errorMessage').textContent = errorMessage;
    document.getElementById('errorModal').style.display = 'block';
    document.getElementById('closeErrorModal').addEventListener('click', () => {
        document.getElementById('errorModal').style.display = 'none';
    });
}

function showSuccessModal(successMessage) {
    document.getElementById('successMessage').textContent = successMessage;
    document.getElementById('successModal').style.display = 'block';

    document.getElementById('closeSuccessModal').addEventListener('click', () => {
        document.getElementById('successModal').style.display = 'none';
        window.location.href = '/login';  
    });
}

async function handleFetch(url, method = 'POST', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            result = { error: "Réponse invalide du serveur." };
        }

        console.log("Réponse du serveur :", result); 

        if (response.ok) {
            showSuccessModal(result.message || "Succès !");
        } else {
            showErrorModal(result.error || "Une erreur est survenue.");
        }
    } catch (error) {
        console.error("Erreur lors de la requête :", error);
        showErrorModal("Impossible de se connecter au serveur.");
    }
}


export { showErrorModal, showSuccessModal, handleFetch };

