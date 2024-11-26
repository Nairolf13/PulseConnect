document.addEventListener('DOMContentLoaded', function () {
    // Initialisation de la carte
    const map = L.map('map', {
        center: [46.603354, 1.888334],
        zoom: 6,
        maxZoom: 19,
    });
    const markers = L.markerClusterGroup(); // Utiliser le clustering
    map.addLayer(markers);

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    // Ajout des tuiles de carte Mapbox
    L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`, {
        maxZoom: 19,
        id: 'mapbox/streets-v11',
        attribution: '© Mapbox'
    }).addTo(map);

    // Ajout des couches 3D (bâtiments)
    const buildingsLayer = L.geoJSON(null, {
        style: function () {
            return {
                color: "#ff7800",
                weight: 1
            };
        }
    }).addTo(map);

    // Fonction debounce pour la recherche
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Charger les studios depuis l'API
    async function loadStudios() {
        try {
            const response = await fetch('/studio-data');
            const studios = await response.json();
            
            // Vérification que studios est bien un tableau
            if (Array.isArray(studios)) {
                addMarkers(studios); 
            } else {
                console.error("Les données de studios ne sont pas sous forme de tableau.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des studios :", error);
        } finally {
            loadingElement.style.display = 'none'; // Masque le loader après le chargement
        }
    }
    

    // Ajouter les marqueurs des studios sur la carte
    function addMarkers(studios) {
        studios.forEach(studio => {
            const marker = L.marker([studio.latitude, studio.longitude]);
            const phone = studio.phone ? `<a href="tel:${studio.phone}">Appeler ${studio.phone}</a>` : 'Numéro de téléphone non disponible';
            const popupContent = `
                <b>${studio.name}</b><br>
                Adresse: ${studio.address}<br>
                ${phone}
                ${studio.image ? `<br><img src="${studio.image}" alt="${studio.name}" style="max-width:200px; max-height:150px;">` : ''}
                <br><button class="get-directions" data-lat="${studio.latitude}" data-lon="${studio.longitude}">Itinéraire</button>
            `;
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        });
    }

    // Fonction pour obtenir la localisation de l'utilisateur
    async function getUserLocation() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => resolve([position.coords.latitude, position.coords.longitude]),
                    error => reject(error)
                );
            } else {
                reject(new Error("Géolocalisation non supportée"));
            }
        });
    }

    // Fonction pour calculer et afficher l'itinéraire
    async function showDirections(start, end) {
        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&access_token=${MAPBOX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            L.geoJSON(data.routes[0].geometry, {
                style: { color: 'blue', weight: 4, opacity: 0.7 }
            }).addTo(map);

            map.fitBounds(L.geoJSON(data.routes[0].geometry).getBounds());
        } catch (error) {
            console.error("Erreur lors de la récupération des directions :", error);
        }
    }

    // Gestion du bouton d'itinéraire dans le popup
    map.on('popupopen', function (e) {
        const directionButton = e.popup._contentNode.querySelector('.get-directions');
        if (directionButton) {
            directionButton.addEventListener('click', async function () {
                try {
                    const userLocation = await getUserLocation();
                    const studioLocation = [parseFloat(this.dataset.lat), parseFloat(this.dataset.lon)];
                    showDirections(userLocation, studioLocation);
                } catch (error) {
                    console.error("Erreur lors de la géolocalisation :", error);
                }
            });
        }
    });

    // Fonction de réinitialisation de la carte
    function resetMap() {
        map.setView([46.603354, 1.888334], 6); // Par exemple, vue par défaut sur la France
        markers.clearLayers(); // Retirer tous les marqueurs
        loadStudios(); // Recharger les studios
    }

    // Fonction de recherche de ville et studio via géocodage
    async function searchStudio(query) {
        try {
            const results = await geocode(query); // Utiliser le géocodage pour la recherche
            if (results.length) {
                resetMap();  // Réinitialiser la carte avant d'afficher les résultats
                const [firstResult] = results;
                map.setView([firstResult.center[1], firstResult.center[0]], 12);  // Zoomer sur la première ville trouvée
        
                const studios = results.map(place => ({
                    name: place.text,
                    latitude: place.center[1],
                    longitude: place.center[0],
                    address: place.place_name
                }));
                addMarkers(studios); // Appeler addMarkers avec un tableau d'objets
            } else {
                showModal("Aucun résultat trouvé pour cette recherche.");
            }
        } catch (error) {
            console.error("Erreur lors de la recherche du studio ou de la ville :", error);
        }
    }
    

    // Fonction de géocodage (ville ou adresse)
    async function geocode(query) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.features;
    }

    // Fonction de recherche par texte (ville ou studio)
    document.getElementById('search').addEventListener('input', debounce(async () => {
        const query = document.getElementById('search').value.trim();
        if (!query) {
            resetMap();
            return;
        }
        await searchStudio(query);  // Appeler searchStudio avec le query saisi
    }, 300));
    

    // Fonction pour afficher un modal
    function showModal(message) {
        alert(message); // Remplacer par un modal personnalisé si nécessaire
    }

    // Ajouter des isochrones pour les zones accessibles
    async function addIsochrone(center, minutes) {
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${center[1]},${center[0]}?contours_minutes=${minutes}&polygons=true&access_token=${MAPBOX_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        L.geoJSON(data, {
            style: {
                color: 'purple',
                fillOpacity: 0.3
            }
        }).addTo(map);
    }

    // Exemple d'utilisation d'isochrone pour la zone atteignable en 15 minutes
    addIsochrone([46.603354, 1.888334], 15);

    // Ajout de boutons pour changer les styles de carte
    const baseMaps = {
        "Streets": L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`, {
            attribution: '© Mapbox',
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 19
        }),
        "Satellite": L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`, {
            attribution: '© Mapbox',
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 19
        }),
        "Outdoors": L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}`, {
            attribution: '© Mapbox',
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 19
        })
    };

    L.control.layers(baseMaps).addTo(map);

    // Fonctionnalité Snap-to-Road (alignement sur les routes)
    async function snapToRoad(latlng) {
        const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${latlng.lng},${latlng.lat}?access_token=${MAPBOX_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.matchings[0].geometry;
    }

    loadStudios();
});
