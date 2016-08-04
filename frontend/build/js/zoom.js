function historian (divi,showAxes,w,h,nomargins,label) {
    this.showAxes = showAxes;
    if(nomargins)
	this.margin = {top: 0, right: 0, bottom: 4, left: 0};
    else
	this.margin = {top: 20, right: 60, bottom: 30, left: 20};
    this.width = w - this.margin.left - this.margin.right;
    this.height = h - this.margin.top - this.margin.bottom;
    
    this.parseDate = d3.time.format("%Y-%m-%d").parse;
    this.formatDate = d3.time.format("%Y");
    
    this.x = d3.time.scale()
	.range([0, this.width]);
    
    this.y = d3.scale.linear()
	.range([this.height, 0]);
    
    this.xAxis = d3.svg.axis()
	.scale(this.x)
	.orient("bottom")
	.tickSize(-this.height, 0)
	.tickPadding(6);
    
    this.yAxis = d3.svg.axis()
	.scale(this.y)
	.orient("right")
	.tickSize(-this.width)
	.tickPadding(6);
    
    this.area = d3.svg.area()
	.interpolate("step-after")
	.x($.proxy(function(d) { return this.x(d.date); },this))
	.y0(this.y(0))
	.y1($.proxy(function(d) { return this.y(d.value); },this));
    
    this.line = d3.svg.line()
	.interpolate("step-after")
	.x($.proxy(function(d) { return this.x(d.date); },this))
	.y($.proxy(function(d) { return this.y(d.value); },this));
    
    this.svg = d3.select("#historian"+divi).append("svg")
	.attr("width", this.width + this.margin.left + this.margin.right)
	.attr("height", this.height + this.margin.top + this.margin.bottom)
	.append("g")
	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.zoom = d3.behavior.zoom()
	.on("zoom", $.proxy(function(){this.draw();},this));
    
    this.gradient = this.svg.append("defs").append("linearGradient")
	.attr("id", "gradient"+divi)
	.attr("x2", "0%")
	.attr("y2", "100%");
    
    this.gradient.append("stop")
	.attr("offset", "0%")
	.attr("stop-color", "#fff")
	.attr("stop-opacity", .5);
    
    this.gradient.append("stop")
	.attr("offset", "100%")
	.attr("stop-color", "#999")
	.attr("stop-opacity", 1);
    
    this.svg.append("clipPath")
	.attr("id", "clip"+divi)
	.append("rect")
	.attr("x", this.x(0))
	.attr("y", this.y(1))
	.attr("width", this.x(1) - this.x(0))
	.attr("height", this.y(0) - this.y(1));
    
    this.svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + this.width + ",0)");
    
    this.svg.append("path")
	.attr("class", "area")
	.attr("clip-path", "url(#clip"+divi+")")
	.style("fill", "url(#gradient"+divi+")");
    
    this.axis = this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);
    
    
    this.svg.append("path")
	.attr("class", "line")
	.attr("clip-path", "url(#clip"+divi+")");

    this.svg.append("rect")
	.attr("class", "pane")
	.attr("width", this.width)
	.attr("height", this.height)
	.call(this.zoom);

    var topAnchor=5;
    if(!this.showAxes)
	topAnchor=80
    this.svg.append("text")
        .attr("x", (this.width / 2))
        .attr("y", topAnchor - (this.margin.top / 2))
        .attr("text-anchor", "middle")
        .attr("font-family", "Raleway")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(label);
    
    this.draw=$.proxy(function(){
	if(this.showAxes){
	    this.svg.select("g.x.axis").call(this.xAxis);
	    this.svg.select("g.y.axis").call(this.yAxis);
	    this.axis.selectAll("text")
		.attr("transform",function(d) {
		    return "rotate(-90)translate(" + this.getBBox().width/2 + "," +
			-this.getBBox().height + ")";
		});
	}
	this.svg.select("path.area").attr("d", this.area);
	this.svg.select("path.line").attr("d", this.line);
    },this);
    
    this.read = $.proxy(function(){
	d3.csv("/data/parts-made.csv", $.proxy(function(error, data) {
	    if (error) throw error;
	    
	    data.forEach($.proxy(function(d) {
		d.date = this.parseDate(d.date);
		d.value = +d.value;
	    },this));
	    
	    this.x.domain([new Date(2006, 4, 1), new Date(2006, 5, 0)]);
	    this.y.domain([0, d3.max(data, function(d) { return d.value; })]);
	    this.zoom.x(this.x);
	    
	    this.svg.select("path.area").data([data]);
	    this.svg.select("path.line").data([data]);
	    this.draw();
	},this));
    },this);
}
var menuHist = new historian("",false,100,100,true,"Historian");
menuHist.read();



