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
let magicstudios = []

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
        magicstudios = studiosAll.filter(studio =>
            !studiosClose.some(s => s.latitude === studio.latitude && s.longitude === studio.longitude)
        );

        // Afficher progressivement le reste des studios
        setTimeout(() => {
            addMarkersProgressively(magicstudios, 50);
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

async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log("Position obtenue :", position.coords.latitude, position.coords.longitude);
                    resolve([position.coords.latitude, position.coords.longitude]);

                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    const userMarker = L.marker([userLat, userLon], {
                        icon: L.icon({
                            iconUrl: '/../../assets/imgs/pieton.png',
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
                    resolve([46.603354, 1.888334]);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            resolve([46.603354, 1.888334]);
        }
    });
}

async function getDirections(start, end) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[1]},${start[0]};${end[1]},${end[0]}?steps=true&geometries=geojson&access_token=pk.eyJ1IjoibmFpcm9sZiIsImEiOiJjbTNzbG0zYTMwZjQyMmpvbzd4eXdlMDJ3In0.1y-ebbWqr3Hm_5Kwp8FgrA&language=fr`;
    const response = await fetch(url);
    return await response.json();
}


map.on('popupopen', function (e) {
    const directionLink = e.popup._contentNode.querySelector('.get-directions');
    if (directionLink) {
        directionLink.addEventListener('click', async function (event) {
            event.preventDefault();
            const userLocation = await getUserLocation();
            const studioLocation = [this.dataset.lat, this.dataset.lon];
            showDirections(userLocation, studioLocation); // Lancer la navigation
        });
    }
});

let currentRoute = null;
let updateInterval;
let currentStep = 0;

async function showDirections(start, end) {
    currentStep = 0;

    try {
        // Si un itinéraire précédent existe, on le supprime et on annule les synthèses vocales
        if (currentRoute) {
            map.removeLayer(currentRoute);
            window.speechSynthesis.cancel();
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Si une mise à jour des étapes est en cours, on l'arrête
        if (updateInterval) {
            clearInterval(updateInterval);
        }

        // Récupérer les directions via une API ou un service de routage (ici simulé par `getDirections`)
        const directions = await getDirections(start, end);
        const route = L.geoJSON(directions.routes[0].geometry).addTo(map);
        currentRoute = route;
        map.fitBounds(route.getBounds());

        // Marquer la position de l'utilisateur (départ)
        let userMarker = L.marker(start, {
            icon: L.icon({
                iconUrl: '/../../assets/imgs/pieton.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);
        userMarker.bindPopup("Vous êtes ici").openPopup();

        // Marquer la destination (studio)
        let studioMarker = L.marker(end).addTo(map);
        studioMarker.bindPopup("Studio").openPopup();

        // Récupérer les étapes du trajet
        const steps = directions.routes[0].legs[0].steps;

        // Créer l'élément HTML pour afficher les instructions
        const instructionElement = document.getElementById("instruction") || document.createElement("div");
        instructionElement.id = "instruction";
        document.body.appendChild(instructionElement);

        // Fonction pour afficher une étape
        function displayStep(stepIndex) {
            if (stepIndex < steps.length) {
                const step = steps[stepIndex];
                instructionElement.textContent = step.maneuver.instruction;

                // Mettre à jour le message dans la modal
                const modalMessage = document.getElementById("destinationMessage");
                if (modalMessage) {
                    modalMessage.textContent = step.maneuver.instruction;
                }

                // Afficher la flèche de direction (à gauche ou à droite selon l'étape)
                const directionArrow = document.getElementById("directionArrow");
                if (directionArrow) {
                    directionArrow.innerHTML = step.maneuver.type === "turn" ?
                        (step.maneuver.instruction.includes('left') ? "←" : "→") : "";
                }

                // Prononcer l'instruction via la synthèse vocale
                speakDirection(step.maneuver.instruction, stepIndex);
                currentStep++;
            } else {
                // Si toutes les étapes ont été parcourues, on arrête la mise à jour
                clearInterval(updateInterval);
            }
        }

        // Afficher la première étape
        displayStep(currentStep);

        // Mettre à jour les instructions toutes les 10 secondes
        updateInterval = setInterval(() => {
            if (currentStep < steps.length) {
                displayStep(currentStep);
            } else {
                clearInterval(updateInterval);
            }
        }, 10000);

        // Afficher la modal avec les directions
        const destinationModal = document.getElementById("destinationModal");
        if (destinationModal) {
            destinationModal.style.display = "block";
        }

        // Fermer la modal lorsqu'on clique sur le bouton de fermeture
        const closeDestinationModal = document.getElementById('closeDestinationModal');
        if (closeDestinationModal) {
            closeDestinationModal.addEventListener('click', function () {
                destinationModal.style.display = "none";
            });
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des directions", error);
        showModal("Erreur lors de la récupération des directions.");
    }
}

// Fonction pour prononcer une direction spécifique via la synthèse vocale
async function speakDirection(instruction, stepIndex) {
    // Si l'index de l'étape a changé, on ne parle plus de l'ancienne étape
    if (stepIndex !== currentStep) return;

    // Annuler toute synthèse vocale en cours
    window.speechSynthesis.cancel();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Obtenir la meilleure voix française disponible
    const voice = await getBestFrenchVoice();
    const speech = new SpeechSynthesisUtterance(instruction);
    speech.voice = voice;
    speech.lang = 'fr-FR';
    speech.volume = 1;
    speech.rate = 0.8;
    speech.pitch = 1;

    // Prononcer l'instruction
    window.speechSynthesis.speak(speech);
}

// Fonction pour charger les voix disponibles
function loadVoices() {
    return new Promise(resolve => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
            };
        }
    });
}

// Fonction pour obtenir la meilleure voix française (préférablement "Michel")
async function getBestFrenchVoice() {
    const voices = await loadVoices();
    const michelVoice = voices.find(voice => voice.name === 'Michel' && voice.lang === 'fr-FR');

    if (michelVoice) return michelVoice;

    // Si "Michel" n'est pas trouvé, on prend la première voix française disponible
    const frenchVoices = voices.filter(voice => voice.lang === 'fr-FR');
    const localFrenchVoice = frenchVoices.find(voice => voice.localService);

    return localFrenchVoice || frenchVoices[0] || voices[0];
}


function getSelectedVoice() {
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedIndex = voiceSelect.selectedIndex;
    if (selectedIndex !== 0) {
        const selectedVoice = speechSynthesis.getVoices()[selectedIndex - 1]; // Ajuste l'index
        return selectedVoice;
    }
    return null; // Si aucune voix n'est sélectionnée
}


// Fonction pour charger uniquement les voix naturelles
function populateVoiceList() {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '<option value="">Sélectionnez une voix...</option>'; // Réinitialiser la liste

    // Récupérer toutes les voix disponibles
    const voices = speechSynthesis.getVoices();

    // Filtrer les voix naturelles
    const naturalVoices = voices.filter(voice => {
        return voice.localService && voice.lang.startsWith("fr"); // Filtre les voix locales en français
    });

    // Ajouter les voix filtrées à la liste déroulante
    naturalVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index; // Index de la voix pour l'identification
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) {
            option.textContent += ' [Défaut]'; // Ajoute un indicateur pour la voix par défaut
        }
        voiceSelect.appendChild(option);
    });

    // Si aucune voix naturelle n'est trouvée, ajouter les voix par défaut disponibles
    if (naturalVoices.length === 0) {
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' [Défaut]';
            }
            voiceSelect.appendChild(option);
        });
    }
}

// Charger les voix lorsque la page est prête
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}
populateVoiceList();




loadStudios();
