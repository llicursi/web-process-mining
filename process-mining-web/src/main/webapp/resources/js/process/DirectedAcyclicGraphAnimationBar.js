AnimationBar = function(){
	
	this.build = function(){
		createPlayButton();
	};
	
	function show(){
		
	}
	
	function hide(){
		
	}
	
	function createPlayButton () {
		
		//	Add a play button
		var playbutton = rootSVG.append("svg")
			.attr("x", "0.5%")
			.attr("y", "0.5%")
			.append("text")
			.attr("text-anchor", "left")
			.append("tspan")
			.attr("x", 0)
			.attr("dy", "1em")
			.text("Play")
			.on("click",function(d) {
				animate();
			});
	
		
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