function drawChoroplethMap(educationData, countyData){

    /*
    *   educationData[i].fips = id
    *   educationData[i].state = State' names
    *   educationData[i].area_name = County's names
    *   educationData[i].bachelorsOrHigher = percentage of bachelors and higher
    * /////////////////////////////////////////////////////////////////////////////
    *   countyData.objects.counties.geometries[i].type = shape's type (Polygon, MultiPolygon)
    *   countyData.objects.counties.geometries[i].id = id
    *   countyData.objects.counties.geometries[i].arcs
    * 
    *   countyData.objects.states.geometries[i].type = shape's type (Polygon, MultiPolygon)
    *   countyData.objects.states.geometries[i].id = id
    *   countyData.objects.states.geometries[i].arcs
    *   countyData.bbox
    *   countyData.transform(.scale and .translate)
    */

    // HTML elements
    const body = d3.select("body");
    const container = body.append("div").attr("id", "container");
    container.append("div").attr("id", "title")
                                .text("United States Educational Attainment");
    container.append("div").attr("id", "subtitle")
                            .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");
    const map = container.append("div").attr("id", "map");
    const legend = container.append("div").attr("id", "legend");
    container.append("div").attr("id", "choropleth-map");
    const tooltip = body.append('div').attr('id', 'tooltip');
    container.append("div").attr("id", "source");

    document.getElementById("source").innerHTML =`Source <a
    href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx"
    >USDA Economic Research Service</a>`;

    const margin = { top: 30, right: 20, bottom: 50, left: 200 }; // Reduced left margin
    const width = 1300 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;


    const svg = d3.select("#choropleth-map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

    const path = d3.geoPath();

    const minBachelorPerc = d3.min(educationData, d => d.bachelorsOrHigher);
    const maxBachelorPerc = d3.max(educationData, d => d.bachelorsOrHigher);

    // Color palette
    var color = d3
        .scaleThreshold()
        .domain(d3.range(minBachelorPerc, maxBachelorPerc, (maxBachelorPerc - minBachelorPerc) / 8))
        .range(d3.schemeGreens[9]);
    

    // Draw counties
    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(countyData, countyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .style("fill", d => { 
            // Here we use a regular function to keep the correct context of 'this'
            const dataEntry = educationData.find(entry => entry.fips === d.id);  // Find the matching data entry
            return dataEntry ? color(dataEntry.bachelorsOrHigher) : '#000';  // Apply color or default if no data found
        })
        .attr('data-education', d => { 
            const dataEntry = educationData.find(entry => entry.fips === d.id);  // Find the matching data entry
            return dataEntry.bachelorsOrHigher;
        })
        .style('stroke', 'none') // Default no border
        .style('stroke-width', 0) // Default no border width
        .on('mouseover', (event, d) => {
            const dataEntry = educationData.find(entry => entry.fips === d.id);
            d3.select(event.currentTarget)
                .style('stroke', 'black') // Change border color to black on hover
                .style('stroke-width', 2); // Change border color to black on hover
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`${dataEntry.area_name}, ${dataEntry.state}: <br>${dataEntry.bachelorsOrHigher}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', () => {
            d3.select(event.currentTarget)
                .style('stroke', 'none')
                .style('stroke-width', 0);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });;
    
    // Draw states
    svg.append('path')
        .datum(topojson.mesh(countyData, countyData.objects.states, function (a, b) {return a !== b;}))
        .attr('class', 'states')
        .attr('d', path);


    // Legend 
    var xScale = d3.scaleLinear().domain([minBachelorPerc, maxBachelorPerc]).rangeRound([600, 860]);
    var g = svg
        .append('g')
        .attr('class', 'key')
        .attr('id', 'legend')
        .attr('transform', 'translate(0,40)');

    g.selectAll('rect')
        .data(
            color.range().map(function (d) {
            d = color.invertExtent(d);
            if (d[0] === null) {
                d[0] = xScale.domain()[0];
            }
            if (d[1] === null) {
                d[1] = xScale.domain()[1];
            }
            return d;
            })
        )
        .enter()
        .append('rect')
        .attr('height', 8)
        .attr('x', function (d) {
            return xScale(d[0]);
        })
        .attr('width', function (d) {
            return d[0] && d[1] ? xScale(d[1]) - xScale(d[0]) : xScale(null);
        })
        .attr('fill', function (d) {
            return color(d[0]);
        });

    g.append('text')
        .attr('class', 'caption')
        .attr('x', xScale.range()[0])
        .attr('y', -6)
        .attr('fill', '#000')
        .attr('text-anchor', 'start')
        .attr('font-weight', 'bold');

    g.call(
        d3.axisBottom(xScale)
            .tickSize(13)
            .tickFormat(function (x) {
            return Math.round(x) + '%';
            })
            .tickValues(color.domain())
        )
        .select('.domain')
        .remove();

};