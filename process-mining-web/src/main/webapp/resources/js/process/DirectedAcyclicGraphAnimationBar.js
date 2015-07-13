DirectedAcyclicGraphAnimationBar = function(_DAGMinimap){
	
	this.build = function(rootSVG){
		createAnimationBarHidden(rootSVG);
	};
	
	this.load = function(url, containerIdForButton){
		if (_tuples == null){
			if (url.indexOf("/") != (url.length - 1)){
				url = url + "/";
			}
			$.ajax({
				 url: url ,
				 method: "POST",
				 datatype: "json",
				 success: function(data) {
					show();
					createPlayButton(containerIdForButton);
					_data = adjustData(data);
				 }
			});
		} else {
			show();
		}
	} 
	
	var _tuples = null;
	var _barSVG;
	var _data;
	
	function createAnimationBarHidden (rootSVG) {
		
		_barSVG = rootSVG.append("svg")
			.classed("animation-bar", true)
			.attr("x", "0.5%")
			.attr("y", "94%")
			.attr("height", "5%")
			.attr("width", "99%")
			.attr("opacity", "0");
		_barSVG.append("rect")
			.attr("height", "100%")
			.attr("width", "100%")
			.attr("fill", "#BBA484")
			.attr("stroke", "#999");
		
		var data = getHundred();
		_barSVG.append("g")
			.selectAll("line")
			.data(data)
			.enter()
			.append("line")
			.attr("x1", function (d){return d;})
			.attr("x2", function (d){return d;})
			.attr("y1", "75%")
			.attr("y2", "100%")
			.attr("stroke-width", "1px")
			.attr("stroke","#555");
					
	}
	
	function getHundred(){
		var data = [];
		for (var i = 1; i < 200; i ++){data.push((i/2).toFixed(1) + "%");}
		return data;
	}
	
	
	function show(){
		d3.select("#DAGMinimap").transition().delay(200).attr("y", "0.5%").attr("opacity","0.5");
		_barSVG.transition().delay(200).attr("opacity", "1");
		
	}
	
	function hide(){
		d3.select("#DAGMinimap").transition().delay(200).attr("y", "95.5%").attr("opacity","1");
		_barSVG.transition().delay(200).attr("opacity", "0");
	}
	
	function createPlayButton(containerIdForButton){
		if (containerIdForButton != null && containerIdForButton != undefined){
			var buttonPlaceholder = document.getElementById(containerIdForButton);
			if (buttonPlaceholder != null && buttonPlaceholder != undefined){
				var playButton = document.createElement("a");
				playButton.className = "btn btn-default";
				playButton.setAttribute("href", "javascipt:;");
				playButton.id = "Replay";
				playButton.innerHTML = "Replay";
				playButton.onClick = animate;
			}
		}
	}
	
	function adjustData(data){
		var preData = {
			max : 0,
			min : 0,
		}
		var index = 1;
		while (data["case " + index] != null && index < 100){
			var caseN = data["case " + index];
			if (preData.min == 0 || caseN.start < preData.min){
				preData.min = caseN.start;
			}
			
			if (preData.max == 0 || caseN.end < preData.max){
				preData.max = caseN.end;
			} 
			preData.cases.push(caseN);
			index ++;
		}
		preData.size = index -1;
		console.log(preData);
		return;
	}
	
	function animate(){
		
	}
	
	//===============================================
	// Animation equations
	//===============================================
 	
	function bezierInterpolation( t, a, b, c, d) {
		var mT = 1 - t;
		var mT2 = mT * mT;
		var mT3 = mT2 * mT;
	    var t2 = t * t;
	    var t3 = t2 * t;
	    return mT3*(a) + 3*mT2*t*(b) + 3*mT*t2*(c) + t3*d; 
	}
	
	function getPathFromEdge(edge, t){
		var axis = edge.dx > edge.dy ? 'x' : 'y';
		var dAxis = 'd' + axis;
		var deltaTotal = edge[dAxis]; 
		var sinal = (edge.paths.length > 1 && edge.paths[0].points[axis+"0"] > edge.paths[1].points[axis+"0"]) ? -1 : 1;
		var i = 0;
		var detalAcumulado = edge.paths[i][dAxis];
//		console.log("deltaAcumulado/deltaTotal = " + (detalAcumulado/deltaTotal) + " t = " + t);
		while ((detalAcumulado/deltaTotal) < t){
			i++;
			detalAcumulado += edge.paths[i][dAxis];
//			console.log("deltaAcumulado/deltaTotal = " + (detalAcumulado/deltaTotal) + " t = " + t);
		};
		
		var path = edge.paths[i];
//		console.log("Computed t :" + t);
		var nt = (deltaTotal*t - sinal *( path.points[axis+"0"] - edge.paths[0].points[axis+"0"])) / path[dAxis];
//		console.log( "(Delta * t - (path.points[x0] - edge.paths[0].points[x0]) ) / path.dx");
//		console.log( "( "+ deltaTotal + " * " + t + " - " + sinal + "*(" + path.points[axis+"0"] + " - " + edge.paths[0].points[axis+"0"] +") ) / " + path[dAxis] +"");
//		console.log( "( "+ deltaTotal * t + " - (" + sinal *(path.points[axis+"0"] - edge.paths[0].points[axis+"0"]) +") ) / " + path[dAxis] +"");
//		console.log( "( "+ (deltaTotal*t - ( path.points[axis+"0"] - edge.paths[0].points[axis+"0"])) +" ) / " + path[dAxis] +"");
//		console.log("Computed nt :" + nt);
		var result = {
			path : path,
			t : nt
		};
		
		return result;
	}
	
	function getPointAtPath(edge, t){
		if (t < 0 || t > 1){
			return null;
		}
		var result = getPathFromEdge(edge, t);
		if (result.path.type == 'bezier'){
			return getPointAtBezierCurve(result.path, result.t);
		} else {
			return getPointAtLine(result.path, result.t);
		}
	}
	
	function getPointAtBezierCurve(bezierCurve, t){
		var point = {
			x : bezierInterpolation(t, bezierCurve.points.x0, bezierCurve.points.dx0, bezierCurve.points.dx1, bezierCurve.points.x1),
			y : bezierInterpolation(t, bezierCurve.points.y0, bezierCurve.points.dy0, bezierCurve.points.dy1, bezierCurve.points.y1)
		};
		return point;
	}
	
	function getPointAtLine(line, t){
		var xBigger = line.dx > line.dy;
		var axis = xBigger ? 'x' : 'y';
		var inverse = xBigger ? 'y' : 'x';
		
		// Linear equation
		var m = line["d" +inverse]/line["d" + axis];
		var relative = line.points[axis+"0"] + line['d' + axis] * t;
		var result = (relative - line.points[axis+"0"])*m + line.points[inverse+"0"];
		var point = {};
		
		point[axis] = relative;
		point[inverse] = result;

		return point;
	}
	
	this.computePointInsideEdge = function(index){
		var edge = null;
		var count = 0;
		for (var name in _graph.edges){
			if (count == index){
				edge = _graph.edges[name];
				break;
			}
			count++;
		}
		var _variance = 0.00;
		var point = getPointAtPath(edge, _variance);
		
		var circle = _d3SVG.select(".graph").append("circle")
			.attr("r", 5)
			.attr("cx", point.x)
			.attr("cy", point.y)
			.attr("fill", "#A16D00");
		
		animateTo100(_variance);
		
	};
	
	function animateTo100(variance){
		point = getPointAtPath(edge, variance);
		circle
		 	.interrupt() // cancel the current transition
		 	.transition()
		 	.delay(310)
			.attr("cx", point.x)
			.attr("cy", point.y);
			
		if (variance < 1){
			setTimeout(function (){
				variance += 0.05;
				animateTo100(parseFloat(variance.toFixed(2)));
				
			}, 300);
		}
	}
	
	
}