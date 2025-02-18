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

async function handleFetch(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            showSuccessModal(result.message);
        } else {
            showErrorModal(result.error);
        }
    } catch (error) {
        console.error("Erreur lors de la requête : ", error);
        showErrorModal("Une erreur inattendue est survenue. Veuillez réessayer.");
    }
}

export { showErrorModal, showSuccessModal, handleFetch };

