class D3Draw {
    draw(poop, config) {
        const margin = config["margins"]
        const width = config["width"] - margin.left - margin.right
        const height = config["height"] - margin.top - margin.bottom

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Sample data: an array of y values
        const yValues = [30, 50, 20, 60, 40, 70, 45, 55, 25, 65, 35, 75];

        // Process the data
        const data = yValues.map((value, index) => ({
            x: index,
            y: value
        }));

        console.log("Processed data:", data);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(data.length));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add the area
        svg.append("path")
            .datum(data)
            .attr("fill", "#cce5df")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.area()
                .x(d => x(d.x))
                .y0(y(0))
                .y1(d => y(d.y))
            );

        // Add the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );

        //Read the data
        /*
        d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv")
            .then(function (data) {
                console.log("Raw data:", data);

                // When reading the csv, we must format variables:
                data = data.map(d => {
                    return {
                        date: d3.timeParse("%Y-%m-%d")(d.date),
                        value: +d.value
                    };
                }).filter(d => d.date !== null && !isNaN(d.value));

                console.log("Processed data:", data);

                if (data.length === 0) {
                    throw new Error("No valid data after processing");
                }

                // Add X axis --> it is a date format
                const x = d3.scaleTime()
                    .domain(d3.extent(data, d => d.date))
                    .range([0, width]);
                svg.append("g")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x));

                // Add Y axis
                const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.value)])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));

                // Add the area
                svg.append("path")
                    .datum(data)
                    .attr("fill", "#cce5df")
                    .attr("stroke", "#69b3a2")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.area()
                        .x(d => x(d.date))
                        .y0(y(0))
                        .y1(d => y(d.value))
                    );
            })
            .catch(function (error) {
                console.error("Error loading or processing data:", error);
            });
            */
    }
}