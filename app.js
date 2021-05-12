document.addEventListener('DOMContentLoaded', function() {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
        .then(res => res.json())
        .then(data => {
            generateViz(data);
        });
});

function generateViz(data) {
    const width = 800;
    const height = 500;
    let tooltip = d3.select('#viz')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('opacity', 0);
    let svg = d3.select('#viz')
                .append('svg')
                .attr('width', width + 75)
                .attr('height', height + 50);
    const years = data.map(item => item.Year);
    const times = data.map(item => {
        let time = item.Time.split(':');
        return new Date(1970, 0, 1, 0, time[0], time[1]);
    });
    
    const legendText = ['Doping Allegations', 'No Doping Allegations'];
    const legend = d3.select('#viz')
                     .append('div')
                     .attr('id', 'legend')
                     .style('left', width - 170 + 'px')
                     .style('top', 150 + 'px')
                     .append('p').text('Legend');
    function pickColor(text) {
        return text === "Doping Allegations" ? 'orangered' : 'yellowgreen';
    }
    legend.selectAll('div')
          .data(legendText)
          .enter()
          .append('div')
          .attr('class', 'legend-section')
          .html(d => `<p>${d}</p>` + 
                     '<div class="legend-marker" style="background: ' + pickColor(d) + ';"></div>');

    let minYear = d3.min(years) - 1;
    let maxYear = d3.max(years) + 1;
    let minTime = d3.min(times);
    let maxTime = d3.max(times);
    let minTimeExtra = new Date(minTime).setSeconds(minTime.getSeconds() - 10);
    let maxTimeExtra = new Date(maxTime).setSeconds(maxTime.getSeconds() + 10);
  
    let xScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, width]);
    let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    var timeFormat = d3.timeFormat('%M:%S');
    let yScale = d3.scaleTime().domain([minTimeExtra, maxTimeExtra]).range([0, height]);
    let yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

    svg.append('g')
       .call(xAxis)
       .attr('id', 'x-axis')
       .attr('transform', 'translate(50, ' + height + ')');
    svg.append('g')
       .call(yAxis)
       .attr('id', 'y-axis')
       .attr('transform', 'translate(50, 0)');

    svg.selectAll('circle')
       .data(data)
       .enter()
       .append('circle')
       .attr('fill', function(d) {
           return d.Doping ? 'orangered' : 'yellowgreen';
       })
       .attr('class', 'dot')
       .attr('cx', d => xScale(d.Year))
       .attr('cy', (d, i) => yScale(times[i]))
       .attr('r', 5)
       .attr('transform', 'translate(50, 0)')
       .attr('data-xvalue', d => d.Year)
       .attr('data-yvalue', (d, i) => times[i])
       .on('mouseover', function(d, i) {
           let dopingText = d.Doping ? `<br>${d.Doping}` : '';
           tooltip.style('opacity', 0.8)
                  .style('left', xScale(d.Year) + 'px')
                  .style('top', yScale(times[i]) + 50 + 'px')
                  .attr('data-year', d.Year)
                  .html(d.Name + ": " + d.Nationality + '<br>' + "Year: " + d.Year + ", Time: " + d.Time + dopingText);
       })
       .on('mouseout', function() {
           tooltip.style('opacity', 0)
                  .style('left', '0px')
                  .style('top', '0px');
       });
}