const URL_1 = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const URL_2 = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

document.addEventListener('DOMContentLoaded', function(){
    // Fetch both URLs using Promise.all
    Promise.all([
        fetch(URL_1).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }),
        fetch(URL_2).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
    ])
    .then(([educationData, countyData]) => {
        // Pass both datasets to drawHeatMap function or handle the data
        drawChoroplethMap(educationData, countyData); // Assuming this function is defined elsewhere
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });
});
