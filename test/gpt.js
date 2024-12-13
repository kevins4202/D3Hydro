class D3Draw{
    draw(){
        const data = [
            { GrLivArea: 1000, SalePrice: 200000 },
            { GrLivArea: 1500, SalePrice: 250000 },
            { GrLivArea: 2000, SalePrice: 300000 },
            // Add more data points as needed
        ];
        
        // Set the dimensions and margins of the graph
        const margin = {top: 10, right: 30, bottom: 30, left: 60},
                width = 460 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;
        
        // Append the svg object to the body of the page
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.GrLivArea)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
        
        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.SalePrice)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));
        
        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.GrLivArea))
            .attr("cy", d => y(d.SalePrice))
            .attr("r", 1.5)
            .style("fill", "#69b3a2");
    }
}