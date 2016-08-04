function stacked (divi,showAxes,w,h,nomargins,nolegend) {
    this.showAxes = showAxes;
    if(nomargins)
	this.margin = {top: 0, right: 0, bottom: 4, left: 0};
    else
	this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = w - this.margin.left - this.margin.right;
    this.height = h - this.margin.top - this.margin.bottom;
    
    this.parseDate = d3.time.format("%Y-%m-%d").parse;
    this.formatDate = d3.time.format("%Y");

    if(!nolegend)
	this.x = d3.scale.ordinal()
        .rangeRoundBands([0,this.width-20], .1);
    else
	this.x = d3.scale.ordinal()
        .rangeRoundBands([0,this.width], .1);
    
    this.y = d3.scale.linear()
	.range([this.height, 0]);

    this.color = d3.scale.ordinal()
        .range(["#32C232", "#C23232"]);
    
    this.xAxis = d3.svg.axis()
	.scale(this.x)
	.orient("bottom");
    
    this.yAxis = d3.svg.axis()
	.scale(this.y)
	.orient("left")
	.tickFormat(d3.format(".2s"));
    
    this.svg = d3.select("#stack"+divi).append("svg")
	.attr("width", "100%")//this.width + this.margin.left + this.margin.right)
	.attr("height", "100%")//this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    
    this.read = $.proxy(function(){d3.csv("data/data.csv", $.proxy(function(error, data) {
	if (error) throw error;

	this.color.domain(d3.keys(data[0]).filter(function(key) { return key !== "time"; }));

	//this.x.domain([new Date(2008, 1, 0), new Date(2008, 1, 1)]);
	
	data.forEach($.proxy(function(d) {
	    var y0 = 0;
	    d.ages = this.color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
	    d.total = d.ages[d.ages.length - 1].y1;
	},this));

	//data.sort(function(a, b) { return b.total - a.total; });

	this.x.domain(data.map(function(d) { return d.time; }));
	this.y.domain([0, d3.max(data, function(d) { return d.total; })]);
	
	this.svg.append("g")
	    .attr("class", "y axis")
	    .call(this.yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Parts");

	this.state = this.svg.selectAll(".state")
	    .data(data)
	    .enter().append("g")
	    .attr("class", "g")
	    .attr("transform", $.proxy(function(d) { return "translate(" + this.x(d.time) + ",0)"; },this));

	this.state.selectAll("rect")
	    .data(function(d) { return d.ages; })
	    .enter().append("rect")
	    .attr("width", this.x.rangeBand())
	    .attr("y", $.proxy(function(d) { return this.y(d.y1); },this))
	    .attr("height", $.proxy(function(d) { return this.y(d.y0) - this.y(d.y1); },this))
	    .style("fill", $.proxy(function(d) { return this.color(d.name); },this));


	if(!nolegend){
	    var axis = this.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + this.height + ")")
		.call(this.xAxis);
	    
	    axis.selectAll("text")
		.attr("transform",function(d) {
		    return "rotate(-90)translate(" + this.getBBox().width/2 + "," +
						-this.getBBox().height + ")";
		});
	    
	this.legend = this.svg.selectAll(".legend")
	    .data(this.color.domain().slice().reverse())
	    .enter().append("g")
	    .attr("class", "legend")
	    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	this.legend.append("rect")
	    .attr("x", this.width-10)
	    .attr("width", 25)
	    .attr("height", 20)
	    .style("fill", this.color);

	this.legend.append("text")
	    .attr("x", this.width+11)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text(function(d) { return d; });

	}
	var topAnchor=5;
	if(!this.showAxes)
		topAnchor=80
	this.svg.append("text")
	    .attr("x", (this.width / 2)-16)
	    .attr("y", topAnchor - (this.margin.top / 2))
	    .attr("text-anchor", "middle")
	    .style("font-size", "16px")
	    .attr("font-family", "Raleway")
	    .style("text-decoration", "underline")
	    .text("Parts");	    

    },this))},this);
}
				  
var menuStack = new stacked("",false,100,100,true,true);
menuStack.read();


