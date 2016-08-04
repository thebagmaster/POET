function horiz (divi,w,h,menu) {
    var data = {
	labels: [
	    'paper jam', 'drum empty', 'no glue',
	    'low temp', 'orientation', 'power loss'
	],
	series: [
	    {
		label: '2016',
		values: [31, 28, 14, 8, 15, 21]
	    },]
    };

    var color = d3.scale.category20();
    
    var chartWidth       = w,
	chartHeight      = h,
	barHeight        = 20,
	groupHeight      = barHeight * data.series.length,
	gapBetweenGroups = 10,
	spaceForLabels   = 30;

    var zippedData = [];
    for (var i=0; i<data.labels.length; i++) {
	for (var j=0; j<data.series.length; j++) {
	    zippedData.push(data.series[j].values[i]);
	}
    }
    zippedData = zippedData.sort(d3.ascending).reverse();
    console.log(zippedData);
    
    var x = d3.scale.linear()
        .domain([0, d3.max(zippedData)])
        .range([0, chartWidth]);

    var y = d3.scale.linear()
        .range([chartHeight + gapBetweenGroups, 0]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat('')
        .tickSize(0)
        .orient("left");

    // Specify the chart area and dimensions
    var chart = d3.select("#" + divi)
        .attr("width", spaceForLabels + chartWidth)
        .attr("height", chartHeight);

    // Create bars
    var bar = chart.selectAll("g")
        .data(zippedData)
        .enter().append("g")
        .attr("transform", function(d, i) {
	    return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
	});

    // Create rectangles of the correct width
    bar.append("rect")
        .attr("fill", "#dc3912")
        .attr("class", "bar")
        .attr("width", x)
        .attr("height", barHeight - 1);

    // Add text label in bar
    bar.append("text")
        .attr("x", function(d) { return x(d) - 3; })
        .attr("y", barHeight / 2)
        .attr("fill", "black")
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    // Draw labels
    bar.append("text")
        .attr("class", "label")
        .attr("x", function(d) { return - 10; })
        .attr("y", groupHeight / 2)
        .attr("dy", ".35em")
        .text(function(d,i) {
	    if (i % data.series.length === 0)
		return data.labels[Math.floor(i/data.series.length)];
	    else
		return ""});

    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
        .call(yAxis);
}
				  
var menuHoriz = new horiz("mhoriz",100,100,true);
