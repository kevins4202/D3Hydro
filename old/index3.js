var cities = [
	{ name: 'London', population: 8674000},
	{ name: 'New York', population: 8406000},
	{ name: 'Sydney', population: 4293000},
	{ name: 'Paris', population: 2244000},
	{ name: 'Beijing', population: 11510000}
];

d3.select('.bars')
    .selectAll('rect')
    .data(cities)
    .join('rect')
    .attr('height', 19)
    .attr('width', function(d){
        return d.population * .00004;
    })
    .attr('y', function(d,i){
        return i * 20;
    });

d3.select('.labels')
    .selectAll('text')
    .data(cities)
    .join('text')
    .attr('y', function(d,i){
        return i * 20 + 13;
    })
    .text(function(d){
        return d.name;
    });