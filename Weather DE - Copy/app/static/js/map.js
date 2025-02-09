let currentData = [];
let currentMarker = null;

// Define the map and initial view
const map = L.map('map').setView([51.505, -0.09], 2);

// Define tile layers for Street and Topography
const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '<a href="http://viewfinderpanoramas.org">SRTM</a> | ' +
        'Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> ' +
        '(<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Add the Street layer by default
streetLayer.addTo(map);

// Add layer control
const baseMaps = {
    "Street Map": streetLayer,
    "Topography": topoLayer
};

L.control.layers(baseMaps).addTo(map);

// Create a marker cluster group
const markers = L.markerClusterGroup();

// Load dataset
async function loadData(dataset) {
    try {
        const data = await d3.json(dataset);
        console.log(data)
        currentData = data;
        populateCityDropdown(data);
        plotCitiesOnMap(data);
        updateLastUpdated();  // Update the last updated timestamp
    } catch (error) {
        console.error('Error loading CSV:', error);
        document.getElementById('cityInfo').innerText = 'Error loading city data.';
    }
}

// Function to update last updated time
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdate');
    const now = new Date();
    const timestamp = now.toLocaleString();  // Format as local date and time
    lastUpdatedElement.textContent = `Last update: ${timestamp}`;
}

// Populate city dropdown
function populateCityDropdown(data) {
    const dropdown = document.getElementById('cityDropdown');
    const uniqueCities = [...new Set(data.map(d => d.city))];

    dropdown.innerHTML = uniqueCities.map(city => `<option value="${city}">${city}</option>`).join('');
    dropdown.addEventListener('change', () => {
        const selectedCity = dropdown.value;
        displayCityDetails(selectedCity, data);
    });
    
    if (uniqueCities.length) {
        dropdown.disabled = false;
        displayCityDetails(uniqueCities[0], data);
    }
}

// Plot cities on the map with clustering
function plotCitiesOnMap(data) {
    markers.clearLayers();  // Clear previous markers

    data.forEach(city => {
        console.log('city, ', city);
        
        if (city.lat && city.lng) {
            const temperature = parseFloat(city['maximum_temperature']);
            const temperature_F = parseFloat(city['maximum_temperature_f']);

            const color = temperature > 20 ? 'orange' : 'lightgreen'; // Conditional marker color

            // Create a circle marker and add it to the cluster group
            const marker = L.circleMarker([+city.lat, +city.lng], {
                radius: 10,
                color: color,
                fillColor: color,
                fillOpacity: 0.7
            })
            .bindPopup(`<b>${city.city}</b><br>Lat: ${city.lat}, Lng: ${city.lng}<br>Temp1: ${temperature}°C, <br>Temp2: ${temperature_F}°F`);

            markers.addLayer(marker);  // Add the marker to the cluster group
        }
    });

    // Add the marker cluster group to the map
    map.addLayer(markers);
}

// Display city details in the info section
function displayCityDetails(city, data) {
    const cityInfo = data.find(d => d.city === city);
    const infoDiv = document.getElementById('cityInfo');

    if (cityInfo) {
        infoDiv.innerHTML = ` 
            <h3>${cityInfo.city}</h3>
            <p>Country: ${cityInfo.country || 'N/A'}</p>
            <p>
  Max Temperature: 
  ${cityInfo['maximum_temperature_f'] || 'N/A'} °F / 
  ${cityInfo['maximum_temperature'] || 'N/A'} °C
</p>
            <p>Humidity: ${cityInfo.humidity || 'N/A'} %</p>
            <p>Cloudiness: ${cityInfo.cloudiness || 'N/A'}</p>
            <p>Wind Speed: ${cityInfo.wind_speed_kmh || 'N/A'}</p>
            <p>Latitude: ${cityInfo.lat || 'N/A'}</p>
            <p>Longitude: ${cityInfo.lng || 'N/A'}</p>
        `;

        const lat = +cityInfo.lat;
        const lng = +cityInfo.lng;

        if (!isNaN(lat) && !isNaN(lng)) {
            if (currentMarker) map.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${cityInfo.city}</b><br>Lat: ${lat}, Lng: ${lng}`);
            map.setView([lat, lng], 10);
        }
    } else {
        infoDiv.innerHTML = '<p>No details available for this city.</p>';
    }
}

// Handle dataset dropdown change
document.getElementById('datasetDropdown').addEventListener('change', (e) => {
    loadData(e.target.value);
});

// Add search functionality
document.getElementById('citySearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCities = currentData.filter(city => city.city.toLowerCase().includes(searchTerm));
    populateCityDropdown(filteredCities);
});

// Clear all selections and reset to default state
document.getElementById('clearButton').addEventListener('click', () => {
    document.getElementById('datasetDropdown').selectedIndex = 0;
    document.getElementById('cityDropdown').disabled = true;
    document.getElementById('cityDropdown').innerHTML = '<option value="" disabled selected>Select a city...</option>';
    document.getElementById('citySearch').value = '';
    document.getElementById('cityInfo').innerHTML = '<p>Select a city to see its details here.</p>';
    if (currentMarker) map.removeLayer(currentMarker); // Remove any existing markers
    markers.clearLayers(); // Clear markers on the map
    map.setView([51.505, -0.09], 2); // Reset map view to initial
});

// Load default dataset
// window.onload = () => loadData('/cities');