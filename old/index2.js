var data = [5, 40, 50, 60];
var width = 500;
var height = 500;


var widthScale = d3.scaleLinear()
    .domain([0, 60])
    .range([0, width]);

var color = d3.scaleLinear().domain([0, 60])
    .range(['red', 'blue']);

var canvas = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    ;

var bars = canvas.selectAll("rect").data(data)
    .enter()
    .append("rect")
    .attr("width", function (d) { return widthScale(d); })
    .attr("height", 50)
    .attr("fill", function (d) { return color(d); })
    .attr("y", function (d, i) { return i * 100; });

var axis = d3.svg.axis().widthScale(widthScale);