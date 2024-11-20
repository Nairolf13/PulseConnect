document.getElementById('search').addEventListener('input', debounce(searchStudio, 300));

// Fonction de recherche
function searchStudio() {
    const query = document.getElementById('search').value.toLowerCase().trim();

    if (!query) {
        resetMap(); // Réinitialiser la carte si aucune recherche
        return;
    }

    const matchingStudios = studios.filter(studio =>
        studio.name.toLowerCase().includes(query) || 
        (studio.address && studio.address.toLowerCase().includes(query)) ||
        (studio.address && extractCityFromAddress(studio.address).toLowerCase().includes(query))
    );

    if (matchingStudios.length > 0) {
        resetMap(); // Supprimer les anciens marqueurs
        matchingStudios.forEach(studio => {
            const lat = studio.latitude;
            const lon = studio.longitude;

            const marker = L.marker([lat, lon]).bindPopup(`
                <b>${studio.name}</b><br>
                ${studio.address || 'Adresse non spécifiée'}
            `);

            markers.addLayer(marker);
        });

        const firstStudio = matchingStudios[0];
        map.setView([firstStudio.latitude, firstStudio.longitude], 12);
    } else {
        showModal("Aucun studio trouvé.");
    }
}

// Définir une fonction debounce pour limiter la fréquence d'exécution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Extraire la ville d'une adresse
function extractCityFromAddress(address) {
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : '';
}

// Réinitialiser la carte
function resetMap() {
    map.setView([46.603354, 1.888334], 6);
    markers.clearLayers();

    // Réafficher tous les studios
    studios.forEach(studio => {
        const marker = L.marker([studio.latitude, studio.longitude]);
        const address = studio.address || 'Adresse non spécifiée';

        marker.bindPopup(`
            <b>${studio.name}</b><br>
            ${address}
        `);
        markers.addLayer(marker);
    });
}

// Afficher une modal avec un message d'erreur
function showModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    modal.style.display = "flex";
}

// Fermer la modal lorsqu'on clique sur la croix ou en dehors
document.getElementById('closeModal').onclick = () => {
    document.getElementById('errorModal').style.display = "none";
};
window.onclick = event => {
    if (event.target === document.getElementById('errorModal')) {
        document.getElementById('errorModal').style.display = "none";
    }
};
