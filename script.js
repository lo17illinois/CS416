// Sample data
const data = [
    { date: new Date(2023, 0, 1), value: 10 },
    { date: new Date(2023, 1, 1), value: 20 },
    { date: new Date(2023, 2, 1), value: 30 },
    { date: new Date(2023, 3, 1), value: 25 },
    { date: new Date(2023, 4, 1), value: 35 },
    { date: new Date(2023, 5, 1), value: 40 }
];

// Set up the SVG canvas dimensions
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up the scales
const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

// Add the x-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

// Add the y-axis
svg.append("g")
    .call(d3.axisLeft(yScale));

// Add the line path
const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

// Add points and interactivity
svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.value))
    .attr("r", 5)
    .on("mouseover", (event, d) => {
        d3.select("#narrative-text").text(`On ${d.date.toDateString()}, the value was ${d.value}.`);
    })
    .on("mouseout", () => {
        d3.select("#narrative-text").text("Hover over the points to see more details.");
    });
// Function to create the chart using D3.js
function createChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 5)
        .on("mouseover", (event, d) => {
            d3.select("#narrative-text").text(`On ${d3.timeFormat("%B %d, %Y")(d.date)}, the value was ${d.value}.`);
        })
        .on("mouseout", () => {
            d3.select("#narrative-text").text("Hover over the points to see more details.");
        });
}

// Load and process the CSV file
d3.csv("data.csv", d => {
    return {
        date: d3.timeParse("%Y-%m-%d")(d.date), // Assuming the date is in 'YYYY-MM-DD' format
        value: +d.value // Assuming the value is numeric
    };
}).then(data => {
    createChart(data);
});
