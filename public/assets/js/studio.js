document.getElementById('search').addEventListener('input', searchStudio);

function searchStudio() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    
    if (!query) {
        resetMap();
        return;
    }

    const studio = studios.find(studio => 
        studio.name.toLowerCase().includes(query) || 
        (studio.address && studio.address.toLowerCase().includes(query))
    );

    if (studio) {
        const lat = studio.latitude;
        const lon = studio.longitude;

        map.setView([lat, lon], 15);
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`
                <b>${studio.name}</b><br>
                ${studio.address || 'Adresse non spécifiée'}
            `)
            .openPopup();
    } else {
        showModal("Aucun studio trouvé.");
    }
}


function showModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    modal.style.display = "flex";
}


document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('closeModal').onclick = function() {
        console.log("La croix a été cliquée");
        const modal = document.getElementById('errorModal');
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        const modal = document.getElementById('errorModal');
        if (event.target == modal) {
            modal.style.display = "none"; 
        }
    };
});

function resetMap() {
    map.setView([46.603354, 1.888334], 6); 
}
