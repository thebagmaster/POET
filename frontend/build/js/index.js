//var svg = d3.select('svg');

var liquids = [];
var historians = [];
var stacks = [];
var numbers = [];
var horizs = [];

var numLabels = ["Availability","Yield","Efficiency","OEE"];
var histLabels = ["Parts","Avg Temp","OEE"];


var Widget = {
    type: {
	fluid:0,
	zoom:1,
	stack:2,
	gauge:3,
	number:4,
	horiz:5
    }
};

var chosen_size_w;
var chosen_size_h;
var onClose = function(){};

function addWidget(config){
    if(config === undefined)
	config = getWidgetConfig();

    var item = "";
    
    //pre grid load
    if(config.type == Widget.type.fluid){
	var i = liquids.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    '" style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">';
	item += '<svg height="100%" width="100%" id="liquid' + i +
	    '" onclick="liquids[' + i +
	    '].update(NewValue());">'+
	    '</svg></div>';
    }
    else if(config.type == Widget.type.zoom){
	var i = historians.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    '" id=historian' + i +
	    ' style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">'+
	    '</div>';
    }
    else if(config.type == Widget.type.stack){
	var i = stacks.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    '" id=stack' + i +
	    ' style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">'+
	    '</div>';
    }else if(config.type == Widget.type.gauge){
	var i = gauges.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    '" id=gauge' + i +
	    ' style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">'+
	    '</div>';
    }else if(config.type == Widget.type.number){
	var i = numbers.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    '" style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">';
	item += '<svg height="100%" width="100%" id="number' + i +
	    '" onclick="numbers[' + i +
	    '].update(NewValue());">'+
	    '</svg></div>';
    }else if(config.type == Widget.type.horiz){
	var i = horizs.length;
	item += '<div class="grid-item p' + config.width + config.height +
	    ' style="width:' + config.width*100 + 'px;'+
	    'height:' + config.height*100 + 'px;">';
	item += '<svg height="100%" width="100%" id="horiz' + i +
	    '"></svg></div>';
    }
    item += "";
    
    var $item = $(item);    
    $grid.append( $item )
        .packery( 'appended', $item )
    $item.each( makeEachDraggable );

    //post grid load
    if(config.type == Widget.type.fluid){
	var i = liquids.length;
	var liquid = loadLiquidFillGauge("liquid"+i, 28, config1);
	liquid.update(NewValue());
	liquids.push(liquid);
    }
    else if(config.type == Widget.type.zoom){
	var i = historians.length;
	var hist = new historian(i,
				 true,
				 config.width*100,
				 config.height*100,
				 false,
				 histLabels[i%histLabels.length]);
	hist.read();
	historians.push(hist);
    }
    else if(config.type == Widget.type.stack){
	var i = stacks.length;
	var stack = new stacked(i,
				true,
				config.width*100,
				config.height*100,
				false,
				false);
	stack.read();
	stacks.push(stack);
    }
    else if(config.type == Widget.type.gauge){
	var i = gauges.length;
	var size = Math.min(config.width,config.height);
	var config_g =
	    {
		size: size*100,
		label: "Gauge",
		min: config.min,
		max: config.max,
		minorTicks: 5
	    }
	
	config_g.label=gaugeLabels[i%gaugeLabels.length];
	
	var range = config_g.max - config_g.min;
	config.yellowZones = [{ from: config_g.min + range*0.75, to: config_g.min + range*0.9 }];
	config.redZones = [{ from: config_g.min + range*0.9, to: config_g.max }];
	
	gauges.push(new Gauge("gauge"+i, config_g));
	gauges[i].render();
    }else if(config.type == Widget.type.number){
	var i = numbers.length;
	numconfig = numberDefaultSettings();
	numconfig.textVertPosition = 0.5;
	numconfig.waveHeight = 0;
	numconfig.valueCountUp = false;
	numconfig.displayPercent = true;
	numconfig.waveAnimate = false;
	numconfig.label = numLabels[i%numLabels.length];
	var number = loadNumber("number"+i, 28, numconfig);
	number.update(NewValue());
	numbers.push(number);
    }else if(config.type == Widget.type.horiz){
	var i = horizs.length;
	var tmp = new horiz("horiz"+i,config.width*100,config.height*100);
	horizs.push(tmp);
    }
}

function getWidgetConfig(){
    return {
	width:1,
	height:1,
	type:Widget.type.fluid,
	min:0,
	max:100
    };
}

function makeEachDraggable( i, itemElem ) {
    var draggie = new Draggabilly( itemElem );
    $grid.packery( 'bindDraggabillyEvents', draggie );
}

var $grid = $('.grid').packery({
    // options
    itemSelector: '.grid-item',
    columnWidth: 100
});

$grid.find('.grid-item').each( makeEachDraggable );

var editing=false;
function toggleEdits(){
    editing = !editing;
    if(editing){
	$(".oeemenu").css("display","block");
	$("#edit-button").switchClass( "glyphicon-edit", "glyphicon-check", 1000, "easeInOutQuad" );
    }else{
	$(".oeemenu").css("display","none");
	$("#edit-button").switchClass( "glyphicon-check", "glyphicon-edit", 1000, "easeInOutQuad" );
    }
}

function addLiquid(){
    var config = getWidgetConfig();
    config.type = Widget.type.fluid;
    config.width = 2;
    config.height = 2;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function addHistorian(){
    var config = getWidgetConfig();
    config.type = Widget.type.zoom;
    config.width = 4;
    config.height = 2;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function addStack(){
    var config = getWidgetConfig();
    config.type = Widget.type.stack;
    config.width = 3;
    config.height = 2;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function addGauge(){
    var config = getWidgetConfig();
    config.type = Widget.type.gauge;
    config.width = 1;
    config.height = 1;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function addNumber(){
    var config = getWidgetConfig();
    config.type = Widget.type.number;
    config.width = 1;
    config.height = 1;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function addHoriz(){
    var config = getWidgetConfig();
    config.type = Widget.type.horiz;
    config.width = 3;
    config.height = 2;
    onClose = function(){
	if(chosen_size_w != undefined)
	    config.width = chosen_size_w;
	if(chosen_size_h != undefined)
	    config.height = chosen_size_h;
	addWidget(config);
    };
    $.prompt(widgetOption);
}

function getSizeHtml(){
    var rtn = "";
    var maxw = 5;
    var maxh = 5;
    var i,j;

    rtn += '<div style="padding-left:110px;">';
    for(i=0;i<maxh;i++){
	rtn += '<div class="row">';
	for(j=0;j<maxw;j++){
	    rtn += '<div class="col-md-1 sizetile" id=pos' + i + j +
		' onclick="choseSize(this);" onmouseover="mouseSize(this)"></div>';
	}
	rtn += '</div>';
    }
    rtn += '</div>';
    return rtn;
}

function choseSize(sender){
    chosen_size_w = parseInt(sender.id.substr(-1))+1;
    chosen_size_h = parseInt(sender.id.substr(-2,1))+1;
    $.prompt.close();
    onClose();
}

function mouseSize(sender){
    var $parent = $(sender).parent().parent();
    var col = parseInt(sender.id.substr(-1));
    var row = parseInt(sender.id.substr(-2,1));
    var maxw = 5;
    var maxh = 5;
    var i,j;
    for(i=0;i<maxh;i++){
    	for(j=0;j<maxw;j++){
	    if(j<=col && i<=row)
		$parent.find('#pos' + i + j).css("backgroundColor","#95c938");
	    else
		$parent.find('#pos' + i + j).css("backgroundColor","#FFF");
	}
    }
}

var widgetOption = {
    state0: {
	title: 'Size',
	html:getSizeHtml(),
	buttons: { Next: 1 },
	//focus: "input[name='fname']",
	submit:function(e,v,m,f){
	    console.log(f);
	    e.preventDefault();
	    chosen_size_w = undefined;
	    chosen_size_h = undefined;
	    $.prompt.close();
	}
    }
}
