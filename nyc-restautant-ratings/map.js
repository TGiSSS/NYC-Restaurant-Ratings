// 创建一个独立的 SVG 元素用于图例
var legend = d3.select("body")
  .append("svg")
  .attr("class", "legend")
  .attr("width", 200)
  .attr("height", 120);

// 添加矩形表示价格类别，并添加文本标记
legend.selectAll("rect")
  .data(["#0EEDF0", "#0000C9", "#FF1502", "#FFF301"])
  .enter()
  .append("rect")
  .attr("x", 10)
  .attr("y", function(d, i) { return i * 30; })
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", function(d) { return d; });

// 添加文本标记
legend.selectAll("text")
  .data(["Price Category 1", "Price Category 2", "Price Category 3", "Price Category 4"])
  .enter()
  .append("text")
  .attr("x", 40)
  .attr("y", function(d, i) { return i * 30 + 15; })
  .text(function(d) { return d; })
  .attr("text-anchor", "start")
  .style("alignment-baseline", "middle");

// 设置SVG和地图投影
var width = 960;
var height = 600;

var svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height)

var projection = d3.geoMercator()
    .center([-74, 40.7128]) // 纽约市的中心经纬度
    .scale(50000) // 缩放级别
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

// 创建一个div元素用于显示工具提示
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// 创建颜色比例尺
var colorScale = d3.scaleOrdinal()
    .domain(["1", "2", "3", "4"]) // 数据类别范围
    .range(["#0EEDF0", "#0000C9", "#FF1502", "#FFF301"]); // 类别对应的颜色

// 加载GeoJSON数据（纽约州各行政区边界）
d3.json("Borough_Boundaries.geojson").then(function(geojson) {
    console.log("GeoJSON loaded:", geojson);

    svg.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#F7F7F7") // 使用浅灰色填充区域
        .attr("stroke", "#333");

    // 加载CSV数据（餐厅信息）
    d3.csv("google_maps_restaurants(cleaned).csv").then(function(data) {
        console.log("CSV data loaded:", data);

   // 过滤餐厅数据
        var filteredData = data.filter(function(d) {
            return !(+d.Lon < -74.05 && +d.Lat > 40.644)&&!(+d.Lon < -74.016 && +d.Lat > 40.7)&&!(+d.Lon < -73.99 && +d.Lat > 40.78);
        });

        // 在绘制餐厅点时，使用颜色比例尺来设置填充颜色
svg.append("g")
    .selectAll("circle")
    .data(filteredData)
    .enter().append("circle")
    .attr("cx", function(d) { return projection([+d.Lon, +d.Lat])[0]; })
    .attr("cy", function(d) { return projection([+d.Lon, +d.Lat])[1]; })
    .attr("r", 2)
    .attr("fill", function(d) { return colorScale(d["Price Category"]); }) // 根据价格类别设置颜色
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<strong>Name:</strong> " + d.Name + "<br/>" +
                             "<strong>Rating:</strong> " + d.Rating + "<br/>" +
                             "<strong>Rating Count:</strong> " + d["Rating Count"] + "<br/>" +
                             "<strong>Price Category:</strong> " + d["Price Category"] + "<br/>" +
                             "<strong>Address:</strong> " + d.Address + "<br/>" +
                             "<strong>Lat:</strong> " + d.Lat + "<br/>" +
                             "<strong>Lon:</strong> " + d.Lon)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
            // 鼠标点击时的操作
                 if (d.URL) {
                 var url = d.URL; 
                 window.open(url, "_blank"); // 在新标签页中打开 URL
            } else {
          console.log("No URL available for this restaurant.");
    }
});
    }).catch(function(error){
        console.error("Error loading CSV data: ", error);
    });
}).catch(function(error){
    console.error("Error loading GeoJSON data: ", error);
});


