class D3Draw {
    getData(data, chartType, labels = [], classes = []) {
        let x, y;
        let xlabel, ylabel;

        if (!chartType) {
            console.error('chartType is required');
            return;
        }

        switch (chartType) {
            case 'stackedArea':
                console.log(typeof data);
                xlabel = labels[0];
                ylabel = labels[1];
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const sumstat = d3.group(data, d => d[xlabel]);
                    const mygroup = classes;

                    console.log(sumstat);
                    console.log(mygroup);

                    y = d3.stack()
                        .keys(mygroup)
                        .value((d, key) => d[1][key][ylabel])
                        (sumstat);
                } else if (Array.isArray(data)) {
                    if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
                        const sumstat = d3.group(data, d => d[xlabel]);

                        console.log("sumstat", sumstat);
                        console.log("classes", classes);
                        console.log("xlabel", xlabel);
                        console.log("ylabel", ylabel);

                        const mygroup = d3.range(classes.length);
                        const stackedData = d3.stack()
                            .keys(mygroup)
                            .value((d, key) => d[1][key][ylabel])
                            (sumstat);

                        console.log("stackedData", stackedData);

                        return stackedData;
                    }
                } else {
                    throw new Error('data is not an object or array');
                }
                break;
            case 'bar':
            case 'scatter':
                xlabel = labels[0];
                ylabel = labels[1];

                if (Array.isArray(data)) {
                    if (Array.isArray(data[0])) {
                        [x, y] = data;
                    } else if (typeof data[0] === 'object') {
                        x = data.map(d => d[xlabel]);
                        y = data.map(d => d[ylabel]);
                    } else {
                        x = [...Array(data.length).keys()];
                        y = data;
                    }
                } else {
                    if (ylabel in data) {
                        x = data[xlabel] || [...Array(data[ylabel].length).keys()];
                        y = data[ylabel];
                    } else {
                        throw new Error('labels not found');
                    }
                }
                break;

            case 'line':
            case 'area':
            default:
                xlabel = labels[0];
                ylabel = labels[1];

                if (Array.isArray(data)) {
                    if (Array.isArray(data[0])) {
                        [x, y] = data;
                    } else if (typeof data[0] === 'object') {
                        x = data.map(d => d[xlabel]);
                        y = data.map(d => d[ylabel]);
                    } else {
                        x = [...Array(data.length).keys()];
                        y = data;
                    }
                } else {
                    if (ylabel in data) {
                        x = data[xlabel] || [...Array(data[ylabel].length).keys()];
                        y = data[ylabel];
                    } else {
                        throw new Error('labels not found');
                    }
                }
                break;
        }

        return { x, y };
    }

    draw(data, config) {
        const margin = config["margins"]
        const width = config["width"] - margin.left - margin.right
        const height = config["height"] - margin.top - margin.bottom
        const type = config["type"]
        const xlabel = config["xlabel"] ? config["xlabel"] : "x"
        const ylabel = config["ylabel"] ? config["ylabel"] : "y"
        const point_color = config["point-color"] ? config["point-color"] : "steelblue"
        const line_color = config["line-color"] ? config["line-color"] : "steelblue"
        const fill_color = config["fill-color"] ? config["fill-color"] : "steelblue"
        const grid = config["grid"] ? config["grid"] : false;
        const classes = config["classes"] ? config["classes"] : [];

        const data_to_plot = this.getData(data, type, [xlabel, ylabel], classes);
        console.log("data", data)
        console.log(data_to_plot);

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        let x, y;
        let xx = data_to_plot[xlabel];
        let yy = data_to_plot[ylabel];
        //x axis
        switch (type) {
            case "bar":
                x = d3.scaleBand()
                    .domain(d3.range(yy.length))
                    .range([0, width])
                    .padding(0.1);
                break;
            case "scatter":
            case "line":
            case "area":
                let right;
                right = d3.max(xx, d => d)
                console.log(right);

                x = d3.scaleLinear()
                    .domain([0, right])
                    .range([0, width]);
                break;
            case "stackedArea":
                x = d3.scaleLinear()
                    .domain(d3.extent(data, function (d) { return d[xlabel]; }))
                    .range([0, width]);
        }

        //y axis
        switch (type) {
            case "bar":
            case "scatter":
            case "line":
            case "area":
                y = d3.scaleLinear()
                    .domain([0, d3.max(yy, d => d)])
                    .range([height, 0]);
                break;
            case "stackedArea":
                const yearSums = d3.rollup(
                    data,
                    group => d3.sum(group, d => +d[ylabel]), // Sum counts for each year group
                    d => d[xlabel] // Group by year
                );

                // Get the maximum total sum across all years
                const maxSum = d3.max(Array.from(yearSums.values()));

                // Create the y-scale
                y = d3.scaleLinear()
                    .domain([0, maxSum * 1.2]) // Add padding by multiplying by 1.5
                    .range([height, 0]);
                break;
        }

        //draw points
        switch (type) {
            case "bar":
                svg.selectAll("chart")
                    .data(yy)
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i) { return x(i); })
                    .attr("y", function (d) { return y(d); })
                    .attr("width", x.bandwidth())
                    .attr("height", (d) => height - y(d))
                    .attr("fill", fill_color)
                break;
            case "scatter":
                // console.log("hello", data_to_plot["x"])
                svg.append('g')
                    .selectAll("dot")
                    .data(data_to_plot)
                    .join("circle")
                    .attr("cx", function (d) { return x(d.x); })
                    .attr("cy", function (d) { return y(d.y); })
                    .attr("r", 1.5)
                    .attr("fill", point_color)
                break;
            case "line":
            case "area":
                svg.append("path")
                    .datum(data_to_plot)
                    .attr("fill", "none")
                    .attr("stroke", line_color)
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(function (d) { return x(d.x) })
                        .y(function (d) { return y(d.y) })
                    );
                break;
        }

        console.log("YY", yy)

        //add area
        switch (type) {
            case "area":
                svg.append("path")
                    .datum(data_to_plot)
                    .attr("fill", fill_color)
                    .attr("stroke", "none")
                    .attr("d", d3.area()
                        .x(function (d) { return x(d.x) })
                        .y0(height)
                        .y1(function (d) { return y(d.y) })
                    );
                break
            case "stackedArea":
                const color = d3.scaleOrdinal()
                    .domain(classes)
                    .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])

                svg.selectAll("mylayers")
                    .data(data_to_plot)
                    .join("path")
                    .style("fill", function (d) { name = classes[d.key - 1]; return color(name); })
                    .attr("d", d3.area()
                        .x(function (d, i) { return x(d.data[0]); })
                        .y0(function (d) { return y(d[0]); })
                        .y1(function (d) { return y(d[1]); })
                    )
        }

        const xGenerator = d3.axisBottom(x);
        const yGenerator = d3.axisLeft(y);

        xGenerator.ticks(2);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xGenerator);

        svg.append("g")
            .call(yGenerator);

        if (grid) {
            svg.append("g")
                .attr("class", "xAxis")
                .call(xGenerator)
                .attr("transform", "translate(0," + height + ")");

            //for y axis 
            svg.append("g")
                .attr("class", "yAxis")
                .call(yGenerator)
                .append("text").attr("transform", "rotate(-90)").attr("text-anchor", "end");

            d3.selectAll("g.yAxis g.tick")
                .append("line")
                .attr("class", "gridline")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", width)
                .attr("y2", 0)
                .attr("stroke", "#9ca5aecf") // line color
                .attr("stroke-dasharray", "4") // make it dashed;;

            d3.selectAll("g.xAxis g.tick")
                .append("line")
                .attr("class", "gridline")
                .attr("x1", 0)
                .attr("y1", -height)
                .attr("x2", 0)
                .attr("y2", 0)
                .attr("stroke", "#9ca5aecf") // line color
                .attr("stroke-dasharray", "4") // make it dashed;
        }


    }

}
