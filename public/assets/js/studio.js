document.getElementById('search').addEventListener('input', debounce(() => {
    if (studios.length > 0) {
      searchStudio();
    } else {
      console.log("Les studios sont en cours de chargement...");
    }
  }, 300));

  function searchStudio() {
    const query = document.getElementById('search').value.toLowerCase().trim();

    if (!query) {
        resetMap();
        return;
    }

    const matchingStudios = studios.filter(studio =>
        studio.name.toLowerCase().includes(query) || 
        (studio.address && studio.address.toLowerCase().includes(query)) ||
        (studio.city && studio.city.toLowerCase().includes(query))
    );

    if (matchingStudios.length > 0) {
        resetMap();
        const cityCenter = getCityCenter(matchingStudios);
        map.setView(cityCenter, 12);

        const nearbyStudios = filterStudiosByDistance(matchingStudios, cityCenter, 20); // 20 km radius

        nearbyStudios.forEach(studio => {
            addMarker(studio);
        });
    } else {
        showModal("Aucun studio trouvé.");
    }
}

function getCityCenter(studios) {
    const lat = studios.reduce((sum, studio) => sum + studio.latitude, 0) / studios.length;
    const lon = studios.reduce((sum, studio) => sum + studio.longitude, 0) / studios.length;
    return [lat, lon];
}

function filterStudiosByDistance(studios, center, maxDistance) {
    // Tracer un cercle autour de la position actuelle
    L.circle(center, { radius: maxDistance * 1000, color: 'red', fillOpacity: 0.1 }).addTo(map);

    return studios.filter(studio => {
        const distance = L.latLng(center).distanceTo([studio.latitude, studio.longitude]) / 1000; // en km
        return distance <= maxDistance;
    });
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function extractCityFromAddress(address) {
    const parts = address.split(',');
    return parts.length > 1 ? parts[1].trim() : '';
}

function resetMap() {
    map.setView([46.603354, 1.888334], 6);
    markers.clearLayers();

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

function showModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    modal.style.display = "flex";
}

document.getElementById('closeModal').onclick = () => {
    document.getElementById('errorModal').style.display = "none";
};
window.onclick = event => {
    if (event.target === document.getElementById('errorModal')) {
        document.getElementById('errorModal').style.display = "none";
    }
};

const map = L.map('map').setView([46.603354, 1.888334], 6); 

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = L.markerClusterGroup();
map.addLayer(markers); // Ajoutez les marqueurs à la carte
studios = []

async function loadStudios() {
    document.getElementById('loading').style.display = 'block';

    try {
        const userLocation = await getUserLocation();
        map.setView(userLocation, 12);

        // Charger et afficher les studios proches (20 km)
        const responseClose = await fetch(`/studio-data?lat=${userLocation[0]}&lon=${userLocation[1]}&radius=20`);
        const studiosClose = await responseClose.json();
        addMarkers(studiosClose, studiosClose.length);

        // Charger tous les studios du monde
        const responseAll = await fetch('/studio-data');
        const studiosAll = await responseAll.json();

        // Filtrer pour exclure les studios déjà affichés
        const studiosRemaining = studiosAll.filter(studio => 
            !studiosClose.some(s => s.latitude === studio.latitude && s.longitude === studio.longitude)
        );

        // Afficher progressivement le reste des studios
        setTimeout(() => {
            addMarkersProgressively(studiosRemaining, 50);
        }, 1000);

        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error("Erreur lors du chargement des studios :", error);
        showModal("Erreur lors de la récupération des studios ou de la géolocalisation.");
        document.getElementById('loading').style.display = 'none';
    }
}

function addMarkersProgressively(studios, batchSize) {
    let index = 0;
    function addBatch() {
        const batch = studios.slice(index, index + batchSize);
        addMarkers(batch, batch.length);
        index += batchSize;
        if (index < studios.length) {
            setTimeout(addBatch, 100);
        }
    }
    addBatch();
}

function addMarker(studio) {
    const marker = L.marker([studio.latitude, studio.longitude]);
    const phone = studio.phone ? `<a href="tel:${studio.phone}">Appeler ${studio.phone}</a>` : 'Numéro de téléphone non disponible';
    
    const popupContent = `
        <b>${studio.name}</b><br>
        <a href="#" class="get-directions" data-lat="${studio.latitude}" data-lon="${studio.longitude}">
            Adresse: ${studio.address}
        </a><br>
        Ville: ${studio.city}<br>
        ${phone}
        ${studio.image ? `<br><img src="${studio.image}" alt="${studio.name}" style="max-width:200px; max-height:150px;">` : ''}
    `;

    marker.bindPopup(popupContent);
    markers.addLayer(marker);
}

function addMarkers(studios, limit) {
    studios.slice(0, limit).forEach((studio, index) => {
        setTimeout(() => addMarker(studio), index * 5);
    });
}

function addMarkers(newStudios, limit) {
    newStudios.slice(0, limit).forEach((studio, index) => {
      setTimeout(() => {
        if (!studios.some(s => s.latitude === studio.latitude && s.longitude === studio.longitude)) {
          addMarker(studio);
          studios.push(studio);
        }
      }, index * 5);
    });
  }

  async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    // Ajouter un ping rouge sur la carte
                    const userMarker = L.marker([userLat, userLon], {
                        icon: L.icon({
                            iconUrl: '/../../assets/imgs/pieton.png', // Remplacez par le chemin de votre image
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })
                    }).addTo(map);

                    userMarker.bindPopup("Vous êtes ici").openPopup();
                    resolve([userLat, userLon]);
                },
                error => {
                    console.error("Erreur de géolocalisation:", error);
                    resolve([46.603354, 1.888334]); // Coordonnées par défaut
                },
                {
                    enableHighAccuracy: true, // Haute précision activée
                    timeout: 10000,          // Timeout augmenté (10 secondes)
                    maximumAge: 0            // Pas de cache pour la position
                }
            );
        } else {
            resolve([46.603354, 1.888334]); // Coordonnées par défaut si la géolocalisation est indisponible
        }
    });
}

  async function getDirections(start, end) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    return await response.json();
}

map.on('popupopen', function(e) {
    const directionLink = e.popup._contentNode.querySelector('.get-directions');
    if (directionLink) {
        directionLink.addEventListener('click', async function(event) {
            event.preventDefault();
            const userLocation = await getUserLocation();
            const studioLocation = [this.dataset.lat, this.dataset.lon];
            showDirections(userLocation, studioLocation);
        });
    }
});

async function showDirections(start, end) {
    try {
        const directions = await getDirections(start, end);
        const route = L.geoJSON(directions.routes[0].geometry).addTo(map);
        const duration = Math.round(directions.routes[0].duration / 60);
        
        map.fitBounds(route.getBounds());
        
        L.popup()
            .setLatLng(end)
            .setContent(`Temps estimé : ${duration} minutes`)
            .openOn(map);
    } catch (error) {
        console.error("Erreur lors de l'obtention des directions :", error);
        showModal("Impossible d'obtenir les directions.");
    }
}

loadStudios();
