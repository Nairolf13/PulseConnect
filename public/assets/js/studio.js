document.getElementById('search').addEventListener('input', debounce(searchStudio, 300));

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

// Affichage immédiat de la carte
// Initialisation de la carte (faite une seule fois)
const map = L.map('map').setView([46.603354, 1.888334], 6);  // Vue par défaut

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Cluster pour les marqueurs
const markers = L.markerClusterGroup();
map.addLayer(markers); // Ajoutez les marqueurs à la carte

// Fonction pour ajouter les marqueurs un par un avec un délai
async function loadStudios() {
    document.getElementById('loading').style.display = 'block'; // Afficher le spinner

    try {
        const response = await fetch('/studio-data');
        const studios = await response.json();

        document.getElementById('loading').style.display = 'none'; // Cacher le spinner

        // Fonction pour ajouter les studios un par un avec un délai
        function addMarker(index) {
            if (index >= studios.length) return; // Arrêter si tous les studios ont été ajoutés
            
            const studio = studios[index];
            const marker = L.marker([studio.latitude, studio.longitude]);
            const address = studio.address || 'Adresse non spécifiée';

            marker.bindPopup(`
                <b>${studio.name}</b><br>
                ${address}
            `);
            markers.addLayer(marker);

            // Ajouter un délai pour l'ajout du marqueur suivant
            setTimeout(() => addMarker(index + 1), 5); // Délai de 5ms entre chaque ajout
        }

        // Commencer à ajouter les marqueurs à partir du premier studio
        addMarker(0);

    } catch (error) {
        console.error("Erreur lors du chargement des studios :", error);
        showModal("Erreur lors de la récupération des studios.");
        document.getElementById('loading').style.display = 'none';
    }
}

loadStudios(); // Charger les studios dès le début

