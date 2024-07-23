"use strict";

const colorMapping = {
    Inbound: 'steelblue',
    Outbound: 'green',
    GDP: 'orange',
    USDJPY: 'red'
};

async function init() {
    await loadPage(0);
}

async function loadPage(pageIndex) {
    const data = await d3.csv('JapanTourism.csv', d => ({
        Date: d3.timeParse("%m/%d/%Y")(d.Date),
        Inbound: d.Inbound ? +d.Inbound : null,
        Outbound: d.Outbound ? +d.Outbound : null,
        GDP: d.GDP ? +d.GDP : null,
        USDJPY: d.USDJPY ? +d.USDJPY : null
    }));

    const svg = d3.select('svg');
    svg.html('');

    const margin = {top: 20, right: 60, bottom: 30, left: 150},
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]),
        yLeft = d3.scaleLinear().rangeRound([height, 0]),
        yRight = d3.scaleLinear().rangeRound([height, 0]);

    const linePrimary = d3.line().x(d => x(d.Date)),
        lineSecondary = d3.line().x(d => x(d.Date));

    let filteredDataPrimary, filteredDataSecondary, yLeftLabel, yRightLabel, primaryDataset, secondaryDataset;

    if (pageIndex === 0) {
        filteredDataPrimary = data.filter(d => d.Inbound !== null);
        filteredDataSecondary = data.filter(d => d.GDP !== null);
        yLeft.domain(d3.extent(filteredDataPrimary, d => d.Inbound));
        yRight.domain(d3.extent(filteredDataSecondary, d => d.GDP));
        linePrimary.y(d => yLeft(d.Inbound));
        lineSecondary.y(d => yRight(d.GDP));
        yLeftLabel = 'Inbound Tourism into Japan';
        yRightLabel = 'GDP';
        primaryDataset = 'Inbound';
        secondaryDataset = 'GDP';
        const annotations = [
            {
                note: { label: "TEXT1", wrap: 150, align: "left"},
                x: 500,
                y: 500,
                dy: -50, dx: -50
            },
            {
                note: { label: "TEXT3", wrap: 150, align: "left"},
                connector: {end: "arrow"},
                x: x(new Date(2007, 5, 1)),
                y: yRight(data.find(d => d.Date.getTime() === new Date(2007, 5, 1).getTime()).GDP),
                dy: -400, dx: -400
            }
        ];
        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations);
        g.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    } else if (pageIndex === 1) {
        filteredDataPrimary = data.filter(d => d.Inbound !== null);
        filteredDataSecondary = data.filter(d => d.USDJPY !== null);
        yLeft.domain(d3.extent(filteredDataPrimary, d => d.Inbound));
        yRight.domain(d3.extent(filteredDataSecondary, d => d.USDJPY));
        linePrimary.y(d => yLeft(d.Inbound));
        lineSecondary.y(d => yRight(d.USDJPY));
        yLeftLabel = 'Inbound Tourism into Japan';
        yRightLabel = 'USD/JPY Exchange Rate';
        primaryDataset = 'Inbound';
        secondaryDataset = 'USDJPY';
    } else if (pageIndex === 2) {
        filteredDataPrimary = data.filter(d => d.Outbound !== null);
        filteredDataSecondary = data.filter(d => d.USDJPY !== null);
        yLeft.domain(d3.extent(filteredDataPrimary, d => d.Outbound));
        yRight.domain(d3.extent(filteredDataSecondary, d => d.USDJPY));
        linePrimary.y(d => yLeft(d.Outbound));
        lineSecondary.y(d => yRight(d.USDJPY));
        yLeftLabel = 'Outbound Tourism from Japan';
        yRightLabel = 'USD/JPY Exchange Rate';
        primaryDataset = 'Outbound';
        secondaryDataset = 'USDJPY';
    } else if (pageIndex === 3) {
        filteredDataPrimary = data.filter(d => d.Outbound !== null);
        filteredDataSecondary = data.filter(d => d.Inbound !== null);
        yLeft.domain(d3.extent(filteredDataPrimary, d => d.Outbound));
        yRight.domain(d3.extent(filteredDataSecondary, d => d.Inbound));
        linePrimary.y(d => yLeft(d.Outbound));
        lineSecondary.y(d => yRight(d.Inbound));
        yLeftLabel = 'Outbound Tourism from Japan';
        yRightLabel = 'Inbound Tourism into Japan';
        primaryDataset = 'Outbound';
        secondaryDataset = 'Inbound';
    }

    x.domain(d3.extent(data, d => d.Date));

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append('g')
        .call(d3.axisLeft(yLeft))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .attr('font-size', '24px')
        .text(yLeftLabel);

    g.append('g')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(yRight))
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -12)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .attr('font-size', '24px')
        .text(yRightLabel);

    g.append('path')
        .datum(filteredDataPrimary)
        .attr('class', `line line-${primaryDataset.toLowerCase()}`)
        .attr('d', linePrimary)
        .attr('stroke', colorMapping[primaryDataset]);

    g.append('path')
        .datum(filteredDataSecondary)
        .attr('class', `line line-${secondaryDataset.toLowerCase()}`)
        .attr('d', lineSecondary)
        .attr('stroke', colorMapping[secondaryDataset]);

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Annotations
    function createAnnotations(data, dataset) {
        const labels = data.map(d => ({
            data: { Date: d.Date, value: d[dataset] },
            dy: 37,
            dx: -142,
            note: { title: `Value: ${d[dataset]}`, label: `${d3.timeFormat('%Y-%m-%d')(d.Date)}` },
            subject: { radius: 4 }
        }));

        const makeAnnotations = d3.annotation()
            .type(d3.annotationCalloutCircle)
            .annotations(labels)
            .accessors({
                x: d => x(d.Date),
                y: d => yLeft(d.value)
            });

        return makeAnnotations;
    }

    const annotationsPrimary = createAnnotations(filteredDataPrimary, primaryDataset);
    const annotationsSecondary = createAnnotations(filteredDataSecondary, secondaryDataset);

    g.append('g')
        .attr('class', 'annotation-group-primary')
        .call(annotationsPrimary);

    g.append('g')
        .attr('class', 'annotation-group-secondary')
        .call(annotationsSecondary);

    g.selectAll('.annotation-connector, .annotation-note')
        .classed('hidden', true);

    svg.selectAll('.dot-primary')
        .data(filteredDataPrimary)
        .enter().append('circle')
        .attr('class', 'dot-primary')
        .attr('cx', d => x(d.Date) + margin.left)
        .attr('cy', d => yLeft(d[primaryDataset]))
        .attr('r', 5)
        .attr('fill', colorMapping[primaryDataset])
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.Date)}<br>${primaryDataset}: ${d[primaryDataset]}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            g.selectAll('.annotation-connector, .annotation-note')
                .classed('hidden', false);
        })
        .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            g.selectAll('.annotation-connector, .annotation-note')
                .classed('hidden', true);
        });

    svg.selectAll('.dot-secondary')
        .data(filteredDataSecondary)
        .enter().append('circle')
        .attr('class', 'dot-secondary')
        .attr('cx', d => x(d.Date) + margin.left)
        .attr('cy', d => yRight(d[secondaryDataset]))
        .attr('r', 5)
        .attr('fill', colorMapping[secondaryDataset])
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.Date)}<br>${secondaryDataset}: ${d[secondaryDataset]}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
            g.selectAll('.annotation-connector, .annotation-note')
                .classed('hidden', false);
        })
        .on('mousemove', function(event) {
            tooltip.style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
            g.selectAll('.annotation-connector, .annotation-note')
                .classed('hidden', true);
        });
}

function showPage(pageIndex) {
    currentPage = pageIndex;
    d3.selectAll('.tab').classed('active', false);
    d3.selectAll('.tab').filter((d, i) => i === pageIndex).classed('active', true);
    loadPage(pageIndex);
}

function nextPage() {
    currentPage = (currentPage + 1) % pages.length;
    showPage(currentPage);
}
