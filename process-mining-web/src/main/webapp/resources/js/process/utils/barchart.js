BARCHART = function (){
	

	var _tooltipArea = null;
	var margin = {top: 20, right: 10, bottom: 30, left: 30};
	var dimensions = {
	    width : 300 - margin.left - margin.right,
	    height : 100 - margin.top - margin.bottom
	};

	var formatPercent = d3.format(".0%");
	
	var x = d3.scale.ordinal().rangeRoundBands([0, dimensions.width], .1);
	var y = d3.scale.linear().range([dimensions.height, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom");
	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickFormat(formatPercent);
	
	
	
	this.plot = function (dataObject, count){
		var data = [];
		for (var key in dataObject){
			data.push({
				"letter" : key,
				"values": dataObject[key],
				"frequency" : dataObject[key].length/count
			});
		}
		
		data = data.sort(function (a,b) {return b.frequency - a.frequency});
		data = data.slice(0, 5);
		x.domain(data.map(function(d) { return d.letter; }));
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

		var svg = d3.select(getAreaForChart()).append("svg")
			.attr("width", dimensions.width + margin.left + margin.right)
			.attr("height", dimensions.height + margin.top + margin.bottom);
		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		g.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + dimensions.height + ")")
			.call(xAxis)
			.selectAll("text")
		    .attr("y", 0)
		    .attr("x", 9)
		    .attr("dy", ".35em")
		    .attr("transform", "rotate(90)")
		    .style("text-anchor", "start");


		g.append("g")
			.attr("class", "y axis")
			.call(yAxis)

		var gs = g.selectAll(".bar")
			.data(data)
			.enter().append("g")
			.attr("class", "bar")
		gs.append("rect")
			.attr("x", function(d) { return x(d.letter); })
			.attr("width", x.rangeBand())
			.attr("y", function(d) { return y(d.frequency); })
			.attr("height", function(d) { return dimensions.height - y(d.frequency); });
		
		var text = gs.append("text")
		 	.attr("y", function(d) { return y(d.frequency); });
			
		
		text.append("tspan")
			.text(function(d) { return formatPercent(d.frequency);})
			.attr("fill", "steelblue")
			.attr("x",  function (d) {return x(d.letter) +  x.rangeBand() / 2 ; })
			.attr("dy", -2);

		text.append("tspan")
			.text(function(d) { return d.values.length;})
			.attr("x",  function (d) {return x(d.letter) +  x.rangeBand() / 2 ; })
			.attr("dy", "15");
		
		return svg[0][0];
	};
	
	
	function getAreaForChart(){
		if (_tooltipArea == null){
			_tooltipArea = document.getElementById("tooltip-hidden-area");
			if (_tooltipArea == null || _tooltipArea === undefined){
				var div = document.createElement("div");
				div.id = "tooltip-hidden-area";
				div.setAttribute("style", "display:none");
				document.body.append(div);
				_tooltipArea = document.getElementById("tooltip-hidden-area");
			}
		} 
		return "#" + _tooltipArea.id;
			
	}
	
	this.clearArea = function (){
		getAreaForChart().innerHTML = "";
	};
};