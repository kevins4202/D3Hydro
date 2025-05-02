class D3Draw {
  getData(data, chartType, labels = [], classes = [], statistic = "") {
    let x, y;
    let xlabel = labels[0]
      ? labels[0]
      : labels["xlabel"]
      ? labels["xlabel"]
      : "x";
    let ylabel = labels[1]
      ? labels[1]
      : labels["ylabel"]
      ? labels["ylabel"]
      : "y";

    switch (chartType) {
      case "boxplot":
        // array of objects, object with arrays, array of arrays
        let cleanedData = [];

        if (Array.isArray(data)) {
          if (Array.isArray(data[0])) {
            //array of arrays
            for (let j = 0; j < classes.length; j++) {
              for (let i = 0; i < data[j].length; i++) {
                cleanedData.push({
                  statistic: data[j][i],
                  [xlabel]: classes[j],
                });
              }
            }
          } else if (typeof data[0] === "object") {
            return data;
          }
        } else if (typeof data === "object") {
          // object
          for (let i = 0; i < classes.length; i++) {
            for (let j = 0; j < data[classes[i]].length; j++) {
              cleanedData.push({
                statistic: data[classes[i]][j],
                [xlabel]: classes[i],
              });
            }
          }
        }

        return d3
          .nest()
          .key(function (d) {
            return d[xlabel];
          })
          .rollup(function (d) {
            q1 = d3.quantile(
              d
                .map(function (g) {
                  return g.statistic;
                })
                .sort(d3.ascending),
              0.25
            );
            median = d3.quantile(
              d
                .map(function (g) {
                  return g.statistic;
                })
                .sort(d3.ascending),
              0.5
            );
            q3 = d3.quantile(
              d
                .map(function (g) {
                  return g.statistic;
                })
                .sort(d3.ascending),
              0.75
            );
            interQuantileRange = q3 - q1;
            min = q1 - 1.5 * interQuantileRange;
            max = q3 + 1.5 * interQuantileRange;
            return {
              q1: q1,
              median: median,
              q3: q3,
              interQuantileRange: interQuantileRange,
              min: min,
              max: max,
            };
          })
          .entries(cleanedData);
      case "stackedArea":
        let stackedRet = data;
        let noClasses = classes.length === 0;
        if (typeof data === "object" && !Array.isArray(data)) {
          stackedRet = [];
          for (const [key, value] of Object.entries(data)) {
            if (noClasses) classes.push(key);
            for (let i = 0; i < value.length; i++) {
              stackedRet.push({ name: key, ...value[i] });
            }
          }
        }

        const sumstat = d3.group(stackedRet, (d) => d[xlabel]);

        const mygroup = d3.range(classes.length);

        const stackedData = d3
          .stack()
          .keys(mygroup)
          .value((d, key) => d[1][key][ylabel])(sumstat);

        return [stackedData, stackedRet];
      case "bar":
      case "scatter":
      case "line":
      case "area":
        if (Array.isArray(data)) {
          if (Array.isArray(data[0])) {
            // [x, y]
            [x, y] = data;
          } else if (typeof data[0] === "object") {
            // array of objects (points)
            x = data.map((d) => d[xlabel]);
            y = data.map((d) => d[ylabel]);
          } else {
            x = [...Array(data.length).keys()];
            y = data;
          }
        } else {
          if (ylabel in data) {
            x = data[xlabel] || [...Array(data[ylabel].length).keys()];
            y = data[ylabel];
          } else {
            throw new Error("labels not found");
          }
        }

        const len = Math.min(x.length, y.length);
        let ret = [];
        for (let i = 0; i < len; i++) {
          ret.push({
            [xlabel]: x[i],
            [ylabel]: y[i],
          });
        }
        return ret;
      default:
        console.error("chart type not supported");
        break;
    }
  }

  draw(data, config = {}) {
    const margin = config["margins"]
      ? config["margins"]
      : { top: 10, right: 30, bottom: 30, left: 60 };
    const width =
      (config["width"] ? config["width"] : 600) - margin.left - margin.right;
    const height =
      (config["height"] ? config["height"] : 600) - margin.top - margin.bottom;
    const type = config["type"] ? config["type"] : "scatter";
    const labels = config["labels"]
      ? config["labels"]
      : { xlabel: "x", ylabel: "y" };
    const line_color = config["line-color"]
      ? config["line-color"]
      : "steelblue";
    const draw_points = config["draw-points"] ? config["draw-points"] : false;
    const point_color = config["point-color"]
      ? config["point-color"]
      : line_color;
    const line_width = config["line-width"] ? config["line-width"] : 3;
    const point_radius = config["point-radius"]
      ? config["point-radius"]
      : Math.min(5, line_width);
    const fill_color = config["fill-color"]
      ? config["fill-color"]
      : "steelblue";

    const grid = config["grid"] ? config["grid"] : false;
    const classes = config["classes"] ? config["classes"] : [];
    const boxWidth = config["box-width"] ? config["box-width"] : 100;

    let data_to_plot, stackedData;
    if (type === "stackedArea") {
      [data_to_plot, stackedData] = this.getData(data, type, labels, classes);
    } else {
      data_to_plot = this.getData(data, type, labels, classes);
    }

    const xlabel = labels["xlabel"];
    const ylabel = labels["ylabel"];
    console.log("data to plot", data_to_plot);

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let x, y;
    let xs = type === "stackedArea" ? null : data_to_plot.map((d) => d[xlabel]);
    let ys = type === "stackedArea" ? null : data_to_plot.map((d) => d[ylabel]);
    console.log(xs, ys);
    //x axis
    switch (type) {
      case "bar":
        x = d3
          .scaleBand()
          .domain(d3.range(ys.length))
          .range([0, width])
          .padding(0.1);
        break;
      case "scatter":
      case "line":
      case "area":
        let right = d3.max(xs, (d) => d);
        console.log(right);

        x = d3.scaleLinear().domain([0, right]).range([0, width]);
        break;
      case "stackedArea":
        x = d3
          .scaleLinear()
          .domain(
            d3.extent(stackedData, function (d) {
              return d[xlabel];
            })
          )
          .range([0, width]);
        break;
      case "boxplot":
        x = d3
          .scaleBand()
          .range([0, width])
          .domain(classes)
          .paddingInner(1)
          .paddingOuter(0.5);
        break;
    }

    //y axis
    switch (type) {
      case "bar":
      case "scatter":
      case "line":
      case "area":
        y = d3
          .scaleLinear()
          .domain([0, d3.max(ys, (d) => d)])
          .range([height, 0]);
        break;
      case "stackedArea":
        let maxHeight = 0;
        for (const arr of data_to_plot) {
          console.log(arr);
          for (const d of arr) {
            if (d[1] > maxHeight) {
              maxHeight = d[1];
            }
          }
        }

        y = d3
          .scaleLinear()
          .domain([0, maxHeight * 1.2])
          .range([height, 0]);
        break;
      case "boxplot":
        y = d3
          .scaleLinear()
          .domain([0, d3.max(ys, (d) => d)])
          .range([height, 0]);
        break;
    }

    if (grid) {
      svg
        .append("g")
        .attr("class", "xAxis")
        .call(xGenerator)
        .attr("transform", "translate(0," + height + ")");

      //for y axis
      svg
        .append("g")
        .attr("class", "yAxis")
        .call(yGenerator)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

      d3.selectAll("g.yAxis g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf") // line color
        .attr("stroke-dasharray", "4"); // make it dashed;;

      d3.selectAll("g.xAxis g.tick")
        .append("line")
        .attr("class", "gridline")
        .attr("x1", 0)
        .attr("y1", -height)
        .attr("x2", 0)
        .attr("y2", 0)
        .attr("stroke", "#9ca5aecf") // line color
        .attr("stroke-dasharray", "4"); // make it dashed;
    }

    // draw area
    switch (type) {
      case "area":
        svg
          .append("path")
          .datum(data_to_plot)
          .attr("fill", fill_color)
          .attr("stroke", "none")
          .attr(
            "d",
            d3
              .area()
              .x(function (d) {
                return x(d[xlabel]);
              })
              .y0(height)
              .y1(function (d) {
                return y(d[ylabel]);
              })
          );
        break;
      case "stackedArea":
        const color = d3
          .scaleOrdinal()
          .domain(classes)
          .range([
            "#e41a1c",
            "#377eb8",
            "#4daf4a",
            "#984ea3",
            "#ff7f00",
            "#ffff33",
            "#a65628",
            "#f781bf",
            "#999999",
          ]);

        svg
          .selectAll("mylayers")
          .data(data_to_plot)
          .join("path")
          .style("fill", function (d) {
            name = classes[d.key - 1];
            return color(name);
          })
          .attr(
            "d",
            d3
              .area()
              .x(function (d, i) {
                return x(d.data[0]);
              })
              .y0(function (d) {
                return y(d[0]);
              })
              .y1(function (d) {
                return y(d[1]);
              })
          );
    }

    //draw points/lines
    switch (type) {
      case "bar":
        svg
          .selectAll("chart")
          .data(ys)
          .enter()
          .append("rect")
          .attr("x", function (d, i) {
            return x(i);
          })
          .attr("y", function (d) {
            return y(d);
          })
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d))
          .attr("fill", fill_color);
        break;
      case "scatter":
        console.log("scatter", data_to_plot);
        svg
          .append("g")
          .selectAll("dot")
          .data(data_to_plot)
          .join("circle")
          .attr("cx", function (d) {
            return x(d[xlabel]);
          })
          .attr("cy", function (d) {
            return y(d[ylabel]);
          })
          .attr("r", point_radius)
          .attr("fill", point_color);
        break;
      case "line":
      case "area":
        svg
          .append("path")
          .datum(data_to_plot)
          .attr("fill", "none")
          .attr("stroke", line_color)
          .attr("stroke-width", line_width)
          .attr(
            "d",
            d3
              .line()
              .x((d) => x(d[xlabel]))
              .y((d) => y(d[ylabel]))
          );

        if (draw_points) {
          svg
            .append("g")
            .selectAll("dot")
            .data(data_to_plot)
            .join("circle")
            .attr("cx", function (d) {
              return x(d[xlabel]);
            })
            .attr("cy", function (d) {
              return y(d[ylabel]);
            })
            .attr("r", point_radius)
            .attr("fill", point_color);
        }
        break;
      case "boxplot":
        svg
          .selectAll("vertLines")
          .data(data_to_plot)
          .enter()
          .append("line")
          .attr("x1", function (d) {
            return x(d.key);
          })
          .attr("y1", function (d) {
            return y(d.q1);
          })
          .attr("x2", function (d) {
            return x(d.value.min);
          })
          .attr("y2", function (d) {
            return y(d.value.max);
          })
          .attr("stroke", "black")
          .style("width", 40);
        svg
          .selectAll("boxes")
          .data(data_to_plot)
          .enter()
          .append("rect")
          .attr("x", function (d) {
            return x(d.key) - boxWidth / 2;
          })
          .attr("y", function (d) {
            return y(d.value.q3);
          })
          .attr("height", function (d) {
            return y(d.value.q1) - y(d.value.q3);
          })
          .attr("width", boxWidth)
          .attr("stroke", "black")
          .style("fill", color);

        svg
          .selectAll("medianLines")
          .data(data_to_plot)
          .enter()
          .append("line")
          .attr("x1", function (d) {
            return x(d.key) - boxWidth / 2;
          })
          .attr("x2", function (d) {
            return x(d.key) + boxWidth / 2;
          })
          .attr("y1", function (d) {
            return y(d.value.median);
          })
          .attr("y2", function (d) {
            return y(d.value.median);
          })
          .attr("stroke", "black")
          .style("width", 80);

        break;
    }

    const xGenerator = d3.axisBottom(x);
    const yGenerator = d3.axisLeft(y);

    // xGenerator.ticks(2);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xGenerator);

    svg.append("g").call(yGenerator);
  }
}
