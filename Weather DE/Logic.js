let cityChart; // Global variable for the chart instance

// Display city details and generate a graph for the selected city
function displayCityDetails(city, data) {
    const cityInfo = data.find(d => d.City === city);
    const infoDiv = document.getElementById('cityInfo');
    const graphCanvas = document.getElementById('cityGraph'); // Ensure this exists in your HTML

    if (cityInfo) {
        // Display city details
        infoDiv.innerHTML = `
            <h3>${cityInfo.City}</h3>
            <p>Country: ${cityInfo.Country || 'N/A'}</p>
            <p>Max Temperature °F: ${cityInfo['Maximum_Temperature_F'] || 'N/A'} °F</p>
            <p>Max Temperature °C: ${cityInfo['Maximum_Temperature'] || 'N/A'} °C</p>
            <p>Humidity: ${cityInfo.Humidity || 'N/A'} %</p>
            <p>Cloudiness: ${cityInfo.Cloudiness || 'N/A'}</p>
            <p>Wind Speed: ${cityInfo.Wind_Speed_kmh || 'N/A'} km/h</p>
            <p>Latitude: ${cityInfo.Lat || 'N/A'}</p>
            <p>Longitude: ${cityInfo.Lng || 'N/A'}</p>
        `;

        // Show the graph canvas
        graphCanvas.style.display = 'block';

        // Data for the graph
        const graphData = {
            labels: ['Temperature (°C)', 'Humidity (%)', 'Wind Speed (km/h)'],
            datasets: [{
                label: `${cityInfo.City} Weather Data`,
                data: [
                    parseFloat(cityInfo['Maximum_Temperature']) || 0,
                    parseFloat(cityInfo.Humidity) || 0,
                    parseFloat(cityInfo.Wind_Speed_kmh) || 0
                ],
                backgroundColor: ['#ffcc00', '#66ccff', '#ff6666'],
                borderColor: ['#ff9900', '#3399ff', '#ff3333'],
                borderWidth: 1
            }]
        };

        // Configuration for Chart.js
        const graphConfig = {
            type: 'bar',
            data: graphData,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`
                        }
                    }
                }
            }
        };

        // Destroy the previous chart instance if it exists
        if (cityChart) {
            cityChart.destroy();
        }

        // Create and render the new chart
        cityChart = new Chart(graphCanvas, graphConfig);

        // Set the map view to the city's location
        const lat = parseFloat(cityInfo.Lat);
        const lng = parseFloat(cityInfo.Lng);

        if (!isNaN(lat) && !isNaN(lng)) {
            if (currentMarker) map.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${cityInfo.City}</b><br>Lat: ${lat}, Lng: ${lng}`);
            map.setView([lat, lng], 10);
        }
    } else {
        infoDiv.innerHTML = '<p>No details available for this city.</p>';
        graphCanvas.style.display = 'none'; // Hide the graph canvas if no data
    }
}

// Load dataset
async function loadData(dataset) {
    try {
        const data = await d3.csv(csvFiles[dataset]);
        currentData = data;
        populateCityDropdown(data);
        plotCitiesOnMap(data);
        updateLastUpdated(); // Call the function to update the timestamp
    } catch (error) {
        console.error('Error loading CSV:', error);
        document.getElementById('cityInfo').innerHTML = `<p>Error loading ${dataset}.csv. Please check the console for details.</p>`;
    }
}

// Function to update last updated time
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('lastUpdate');
    const now = new Date();
    const timestamp = now.toLocaleString();  // Format as local date and time
    lastUpdatedElement.textContent = `Last updated: ${timestamp}`;
}

