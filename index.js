class D3Draw {
    getData(data, chartType, labels = []) {
        let x, y;
        let xlabel, ylabel;

        if (!chartType) {
            console.error('chartType is required');
            return;
        }

        switch (chartType) {
            case 'stackedArea':
                x = labels;
                if (typeof data === 'object') {
                    const sumstat = d3.group(data, d => d[xlabel]);
                    const mygroup = range(1, Object.keys(sumstat).length + 1);
                    y = d3.stack()
                        .keys(mygroup)
                        .value((d, key) => d[1][key].n)
                        (sumstat);
                } else if (Array.isArray(data)) {
                    if (data.length !== labels.length) {
                        throw new Error('labels and data must have the same length');
                    }
                    y = data.map((d, i) => {
                        return {
                            "key": labels[i],
                            "values": d.map(d => d.n)
                        }
                    });
                } else {
                    throw new Error('data is not an object or array');
                }
                break;

            case 'bar':
            case 'scatter':
                if (labels.length === 2) {
                    xlabel = labels[0];
                    ylabel = labels[1];
                } else if (labels.length === 1) {
                    ylabel = labels[0];
                } else {
                    xlabel = "x";
                    ylabel = "y";
                }
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
                if (labels.length === 2) {
                    xlabel = labels[0];
                    ylabel = labels[1];
                } else if (labels.length === 1) {
                    ylabel = labels[0];
                } else {
                    xlabel = "x";
                    ylabel = "y";
                }
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

        const { x: xx, y: yy } = this.getData(data, xlabel, ylabel, type)
        // console.log(xx, yy)

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        let data_to_plot = [];

        for (let i = 0; i < xx.length; i++) {
            data_to_plot.push({
                x: xx[i],
                y: yy[i]
            });
        }

        console.log(data_to_plot);

        let x, y;
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
                y = d3.scaleLinear()
                    .domain([0, d3.max(data, function (d) { return +d[ylabel]; }) * 1.2])
                    .range([height, 0]);
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
                    .domain(xx)
                    .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])
                svg.selectAll("mylayers")
                    .data(yy)
                    .join("path")
                    .style("fill", function (d) { name = xx[d.key - 1]; return color(name); })
                    .attr("d", d3.area()
                        .x(function (d, i) { return x(d.data[0]); })
                        .y0(function (d) { return y(d[0]); })
                        .y1(function (d) { return y(d[1]); })
                    )
        }

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

    }

}
