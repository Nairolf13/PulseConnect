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

    // Fonction pour calculer la distance entre deux points géographiques (en kilomètres)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Rayon de la Terre en kilomètres
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance en kilomètres
    }



    // Charger les studios depuis l'API
    let isLoadingStudios = false; // Ajouter un indicateur global

    async function loadStudios() {
        if (isLoadingStudios) return; // Sortir si une requête est déjà en cours
        isLoadingStudios = true;
    
        document.getElementById('loading').style.display = 'block';
        try {
            const userLocation = await getUserLocation();
            showUserLocation(userLocation);
    
            const responseClose = await fetch(`/studio-data?lat=${userLocation[0]}&lon=${userLocation[1]}&radius=50`);
            const studiosClose = await responseClose.json();
    
            if (Array.isArray(studiosClose)) {
                addMarkers(studiosClose);
    
                map.setView(userLocation, 12);
    
                const responseAll = await fetch('/studio-data');
                const studiosAll = await responseAll.json();
    
                const farStudios = studiosAll.filter(studio =>
                    !studiosClose.some(s => s.latitude === studio.latitude && s.longitude === studio.longitude)
                );
    
                setTimeout(() => {
                    addMarkersProgressively(farStudios, 50);
                }, 3000);
            } else {
                console.error("Les données de studios ne sont pas sous forme de tableau.");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des studios :", error);
            showModal("Erreur lors de la récupération des studios ou de la géolocalisation.");
        } finally {
            isLoadingStudios = false; // Libérer le verrou
            document.getElementById('loading').style.display = 'none';
        }
    }

    function addMarkersProgressively(studios, batchSize) {
        let index = 0;
        function addBatch() {
            const batch = studios
                .slice(index, index + batchSize)
                .filter(studio => !addedStudios.has(`${studio.latitude},${studio.longitude}`)); // Ne garder que les studios non ajoutés
            addMarkers(batch);
            index += batchSize;
            if (index < studios.length) {
                setTimeout(addBatch, 100);
            }
        }
        addBatch();
    }

    // Ajouter les marqueurs des studios sur la carte
    const addedStudios = new Set(); // Conserver les studios déjà ajoutés

    function addMarkers(studios) {
        studios.forEach(studio => {
            const studioKey = `${studio.latitude},${studio.longitude}`; // Utiliser une clé unique basée sur les coordonnées
            if (!addedStudios.has(studioKey)) { // Ajouter uniquement si le studio n'existe pas encore
                addedStudios.add(studioKey);
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
            }
        });
    }
    

    async function getUserLocation() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        resolve([position.coords.latitude, position.coords.longitude]);
                    },
                    error => reject(error),
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                reject(new Error("Géolocalisation non supportée"));
            }
        });
    }

    async function showUserLocation() {
        try {
            const userLocation = await getUserLocation();
            const userMarker = L.marker(userLocation, {
                icon: L.icon({
                    iconUrl: '/../../assets/imgs/pieton.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                })
            }).addTo(map);

            userMarker.bindPopup("<b>Votre Position</b>").openPopup();
            map.setView(userLocation, 14);

            // Charger et afficher les studios proches
            const response = await fetch('/studio-data');
            const studios = await response.json();

            if (Array.isArray(studios)) {
                const nearbyStudios = studios.filter(studio => {
                    const distance = calculateDistance(userLocation[0], userLocation[1], studio.latitude, studio.longitude);
                    return distance <= 50;
                });
                addMarkers(nearbyStudios);

                // Afficher le reste des studios progressivement
                setTimeout(() => {
                    const farStudios = studios.filter(studio => !nearbyStudios.includes(studio));
                    addMarkersProgressively(farStudios, 50);
                }, 3000);
            }
        } catch (error) {
            console.error("Erreur lors de la géolocalisation ou du chargement des studios :", error);
        } finally {
            loadingElement.style.display = 'none';
        }
    }




    let currentRouteLayer = null; // Variable globale pour stocker l'itinéraire actuel

    async function showDirections(start, end) {
        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&steps=true&language=fr&access_token=${MAPBOX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            const route = data.routes[0];

            // Supprimer l'ancien itinéraire s'il existe
            if (currentRouteLayer) {
                map.removeLayer(currentRouteLayer);
            }

            // Ajouter le nouvel itinéraire
            currentRouteLayer = L.geoJSON(route.geometry, {
                style: { color: 'blue', weight: 4, opacity: 0.7 }
            }).addTo(map);

            map.fitBounds(currentRouteLayer.getBounds());

        } catch (error) {
            console.error("Erreur lors de la récupération des directions :", error);
        }
    }

    // Gestion du bouton d'itinéraire dans le popup
    map.on('popupopen', function (e) {
        const directionButton = e.popup._contentNode.querySelector('.get-directions');
        if (directionButton) {
            const lat = parseFloat(directionButton.dataset.lat);
            const lon = parseFloat(directionButton.dataset.lon);

            calculateRouteEstimation(lat, lon, directionButton);

            // Ajouter l'événement au bouton pour afficher l'itinéraire
            directionButton.addEventListener('click', async function () {
                try {
                    const userLocation = await getUserLocation();
                    const studioLocation = [lat, lon];
                    showDirections(userLocation, studioLocation);
                } catch (error) {
                    console.error("Erreur lors de la géolocalisation :", error);
                }
            });
        }
    });

    // Fonction pour calculer et afficher la distance et le temps estimés
    async function calculateRouteEstimation(lat, lon, buttonElement) {
        try {
            const userLocation = await getUserLocation();
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[1]},${userLocation[0]};${lon},${lat}?geometries=geojson&access_token=${MAPBOX_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const distanceKm = (route.distance / 1000).toFixed(2); // Distance en km
                const durationMinutes = Math.ceil(route.duration / 60); // Durée en minutes

                // Ajouter l'estimation à côté du bouton
                const estimationElement = document.createElement('div');
                estimationElement.innerHTML = `
                <p><b>Distance :</b> ${distanceKm} km<br>
                <b>Durée :</b> ${durationMinutes} min</p>
            `;
                estimationElement.style.marginTop = "10px";
                buttonElement.parentNode.appendChild(estimationElement);
            } else {
                console.error("Aucune route trouvée.");
            }
        } catch (error) {
            console.error("Erreur lors du calcul de l'estimation :", error);
        }
    }


    // Fonction de réinitialisation de la carte
    function resetMap() {
        map.setView([46.603354, 1.888334], 6); // Par exemple, vue par défaut sur la France
        markers.clearLayers(); // Retirer tous les marqueurs
        loadStudios(); // Recharger les studios
    }

    // Fonction de recherche de ville et studio via géocodage
    document.getElementById('search').addEventListener('input', debounce(async () => {
        const query = document.getElementById('search').value.trim();
        if (!query) {
            return;
        }
        await searchStudio(query);  // Appeler searchStudio avec le query saisi
    }, 300));

    // Fonction pour afficher un modal
    function showModal(message) {
        alert(message); // Remplacer par un modal personnalisé si nécessaire
    }

    // Fonction de recherche de ville et studio via géocodage
    async function searchStudio(query) {
        try {
            const results = await geocode(query); // Utiliser le géocodage pour la recherche
            if (results.length) {
                // resetMap();  // Réinitialiser la carte avant d'afficher les résultats
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

    showUserLocation();
    loadStudios();
});






