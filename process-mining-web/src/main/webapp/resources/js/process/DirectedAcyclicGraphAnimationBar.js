DirectedAcyclicGraphAnimationBar = function(graph){
	var _graph = graph;
	var _barSVG;
	var _d3SVG;
	var _data = null;
	var _dimensions;
	
	this.build = function(rootSVG, d3SVG){
		createAnimationBarHidden(rootSVG);
		_d3SVG = d3SVG;
		
	};
	
	this.load = function(url, containerIdForButton){
		if (_data == null){
			if (url.indexOf("/") != (url.length - 1)){
				url = url + "/";
			}
			$.ajax({
				 url: url ,
				 method: "POST",
				 datatype: "json",
				 success: function(data) {
					show();
					
					// Initiate the 
					_d3SVG.select(".graph").append("g").classed("animations", true);
					
					createPlayButton(containerIdForButton);
					_data = adjustData(data);
					drawStartTimes();
				 }
			});
		} else {
			show();
		}
	} 
	
	function show(){
		d3.select("#DAGMinimap").transition().duration(200).attr("opacity","0.0");
		_barSVG.transition().delay(200).attr("opacity", "1").attr("y", "94%");
		
	}
	
	this.hide = function(){
		d3.select("#DAGMinimap").transition().duration(200).attr("opacity","1");
		_barSVG.transition().delay(200).attr("opacity", "0").attr("y", "115%");
		_d3SVG.select(".graph g.animations").transition().duration(200).attr("opactiy", "0").transition().attr("style", "display:none");
	}
	
	function adjustData(data){
		var preData = {
			max : 0,
			min : 0,
			cases : [],
			size : 0, 
			original : data
		}
		var index = 1;
		for ( var key in data.tuples){
			if (data.tuples[key] != null && data.tuples[key].start){
				var caseN = jQuery.extend({}, data.tuples[key]);
				if (preData.min == 0 || caseN.start < preData.min){
					preData.min = caseN.start;
				}
				
				if (preData.max == 0 || caseN.end > preData.max){
					preData.max = caseN.end;
				} 
				preData.cases.push(caseN);
				index ++;
			}
		}
		preData.size = index -1;
		
		// Create a gap, in the start, of 1% of the total
		if (preData.min > 0){
			preData.min -= parseInt(((preData.max - preData.min)*0.01).toFixed(0));
		}
		
		// Create a gap, at the end, of 1% of the total
		if (preData.max > 0){
			preData.max += parseInt(((preData.max - preData.min)*0.01).toFixed(0));
		} 
		
		return preData;
	}
	
	
	function createAnimationBarHidden (rootSVG) {
		
		_barSVG = rootSVG.append("svg")
			.classed("animation-bar", true)
			.attr("x", "0.5%")
			.attr("y", "94%")
			.attr("height", "5%")
			.attr("width", "99%")
			.attr("opacity", "0")
			.on('click', handleClick);
		
		var rect = _barSVG.append("rect")
			.attr("height", "100%")
			.attr("width", "100%")
			.attr("fill", "#CBCBCB")
			.attr("stroke", "#999")
		
		_dimensions = rect[0][0].getBBox()
		
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
	
	function handleClick(o, e, d){
		var start = (new Date()).getTime();
		var left = d3.mouse(this)[0];
		var currentTime = selectTime(left);
//		//console.log(_acontrol.cases);
		drawAreaCompletetion(left);
		drawPointsInTime(currentTime);
		var end = (new Date()).getTime();
		//console.log("Processando os pontos : " + (end - start) + "ms");
	}
	
	function drawAreaCompletetion(left){
		if (_barSVG.selectAll("rect.complete")[0].length == 0){
			_barSVG.append("rect")
				.classed("complete", true)
				.attr("fill", "#333")
				.attr("opacity", 0.7)
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", "100%")
				.attr("width", 0);
		}
		
		_barSVG.select("rect.complete")
			.attr("width", left);
		}
	
	function getHundred(){
		var data = [];
		for (var i = 1; i < 200; i ++){data.push((i/2).toFixed(1) + "%");}
		return data;
	}
	
	var _playButton;
	function createPlayButton(containerIdForButton){
		if (containerIdForButton != null && containerIdForButton != undefined){
			var buttonPlaceholder = document.getElementById(containerIdForButton);
			if (buttonPlaceholder != null && buttonPlaceholder != undefined){
				_playButton = document.createElement("a");
				_playButton.className = "btn btn-default";
				_playButton.setAttribute("href", "javascipt:;");
				_playButton.id = "Replay";
				_playButton.innerHTML = "<span class=\"glyphicon glyphicon-play\" aria-hidden=\"true\"></span> Replay";
				_playButton.onclick = animate;
				buttonPlaceholder.innerHTML = "<br/>";
				buttonPlaceholder.appendChild(_playButton);
			}
		}
	}
	
	//===============================================
	// Animation control 
	//===============================================
	var _acontrol = {
		// Conversion
		xDomainRange : null,
		xRangeDomain : null,
		xTimeDomain : null,
		
		// Stacks control
		cases : {
			actives : [],
			waiting : [],
			completed : []
		},
		time : 0,
		left : 0
	};
	
	function drawStartTimes(){
		
		_acontrol.xDomainRange = d3.scale.linear().domain([_data.min, _data.max]).range([_dimensions.x, _dimensions.width]);
		_barSVG.append("g")
			.selectAll("line")
			.data(d3.merge(_data.cases.map(function (m){return m.arcTimes;})))
			.enter()
			.append("line")
			.attr("x1", function (d){return _acontrol.xDomainRange(d.start);})
			.attr("x2", function (d){return _acontrol.xDomainRange(d.start);})
			.attr("y1", "0%")
			.attr("y2", "100%")
			.attr("stroke-width", "1px")
			.attr("stroke","#255D91");
		
		_acontrol.xRangeDomain = d3.scale.linear().domain([_dimensions.x, _dimensions.width]).range([_data.min, _data.max]);
		_acontrol.xTimeDomain = d3.scale.linear().domain([0, 600]).range([_data.min, _data.max]);
		_acontrol.xDomainTime = d3.scale.linear().domain([_data.min, _data.max]).range([0, 600]);
		_acontrol.time = null;
	}
	
	var animationTimeout = null;
	var stop = true;
	
	function animate(){
		changeButton();
		
		var time = 100;
		if (_acontrol.time == null){
			_acontrol.time = selectTime(_dimensions.x);
		}
		var currentTime = _acontrol.time;
		var elapsedTime = _acontrol.xDomainTime(currentTime);
		stop = false;
		var animation = function () {
			
			updateNewActiveCase(currentTime);
			// Draw dots
			drawPointsInTime(currentTime);
			
			// Compute the next time;
			currentTime = _acontrol.xTimeDomain(elapsedTime);
			drawAreaCompletetion(_acontrol.xDomainRange(currentTime));
			
			if (!stop && currentTime < _data.max){
				elapsedTime += time/100;
				_acontrol.time = currentTime;
				animationTimeout = window.setTimeout(animation, time);
			} else {
				changeButton();
				selectTime(_acontrol.xDomainRange(_data.min));
			}
		};
		animation();
		
	}
	
	function stopAnimate(){
		stop = true;
		if (animationTimeout != null){
			window.clearTimeout(animationTimeout);
		}
		animationTimeout = null;
		changeButton();
	}
	

	function changeButton(){
		if (_playButton.innerHTML == "Replay"){
			_playButton.innerHTML = "Stop";
			_playButton.onclick = stopAnimate;
		} else {
			_playButton.innerHTML = "Replay";
			_playButton.onclick = animate;
		}
	}
	
	
	//===============================================
	// Animation draw 
	//===============================================
	
	function activateEdges(caseN, time){
		caseN.edgesActive = [];
		caseN.edgesRemaining = [];
		for (var i = 0; i < caseN.arcTimes.length; i ++){
			var arc = caseN.arcTimes[i];
			arc.usecase = caseN.name;
			if (time < arc.start){
				caseN.edgesRemaining.push(arc);
			} else if (time > arc.end) {
				// Irrelephant
			} else {
				caseN.edgesActive.push(arc);
			}
		}
	}
	
	// Prepare the cases
	function selectTime(left){
		var time = _acontrol.xRangeDomain(left);
		_acontrol.time = time;
		
		// Reset 
		_acontrol.cases.waiting = [];
		_acontrol.cases.completed = [];
		_acontrol.cases.actives = [];
		
		// Classify the cases in the current time
		for (var i = 0; i < _data.size ; i ++){
			var caseN = _data.cases[i];
			if (time < caseN.start){
				_acontrol.cases.waiting.push(caseN);
			} else if (time > caseN.end) {
				_acontrol.cases.completed.push(caseN);
			} else {
				activateEdges(caseN, time);
				_acontrol.cases.actives.push(caseN);
			}
		}
		
		return time;
	}
	
	// Work only with sorted lists
	function updateNewActiveCase(currentTime){
		var waintingList = _acontrol.cases.waiting;
		var index = 0;
		var encontrou = true;
		while (encontrou && waintingList.length > 0){
			var newCase = waintingList[0];
			if (currentTime > newCase.start){
				var caseN = _acontrol.cases.waiting.shift();
				activateEdges(caseN, currentTime);
				_acontrol.cases.actives.push(caseN);
			} else {
				encontrou = false;
			}
		}
	}
	
	
	function drawPointsInTime(currentTime){
		
		var caseIndexToMove = [];
		var visiblePointsInEdges = [];
		
		for (var i = 0; i < _acontrol.cases.actives.length; i++ ){
			var caseN = _acontrol.cases.actives[i];
			var edges = getCurrentEdges(caseN, currentTime);
			if (edges.length == 0){
				// End of edges
				caseIndexToMove.push(i);
			} else {
				visiblePointsInEdges = visiblePointsInEdges.concat(edges);
			}
		}
		
		// DRAW
		drawD3Points(visiblePointsInEdges);
		
		// Remove cases from Actives and put as completed
		while (caseIndexToMove.length > 0){
			var index = caseIndexToMove.pop();
			_acontrol.cases.completed.push( _acontrol.cases.actives[index]);
			_acontrol.cases.actives.splice(index, 1);
			
			console.log("Casos completos : " + _acontrol.cases.completed.length);
			console.log("Casos ativos : " + _acontrol.cases.actives.length);
		}
		
	}
	
	function drawD3Points(visiblePointsInEdges){
		
		var points = _d3SVG
			.select(".graph g.animations").selectAll("circle")
			.data(visiblePointsInEdges, function (d){return (d.start + d.end);});
		points.enter()
			.append("circle")
			.attr("r", 6)
			.attr("cx", function (d) { return d.point.x;})
			.attr("cy", function (d) {	return d.point.y;})
			.attr("fill", function (d){ return d.colors.fill;})
			.attr("stroke", function (d){ return d.colors.stroke;});
		points.transition().duration(50)
			.attr("cx", function (d) { return d.point.x})
			.attr("cy", function (d) { return d.point.y})
			.attr("fill", function (d){ return d.colors.fill;})
			.attr("stroke", function (d){ return d.colors.stroke;});
		points.exit().remove();
		
	}
	
	
	function getNewEdges(edgesRemaining, currentTime){
		var newEdges = [];
		while (edgesRemaining.length > 0 && edgesRemaining[0].start < currentTime){
			var edge = edgesRemaining.shift();
			// Prevent small activities to exceute
			if (edge.end > currentTime){
				edge.t = (currentTime - edge.start)/ (edge.end - edge.start);
				edge.point = getPointAtPath(_graph.edges[edge.ref], edge.t);
				edge.colors = _graph.getColorByDelay(edge.ref, (edge.end - edge.start));
				newEdges.push(edge);
			}
		}
		return newEdges;
	}
	
	function getCurrentEdges(caseN, currentTime){
		var edgesIndexToRemove = [];
		
		// Check the current edges
		for (var i = 0; i < caseN.edgesActive.length; i ++){
			var edge = caseN.edgesActive[i];
			if (edge.end < currentTime){
				// Remove edge
				edgesIndexToRemove.push(i);
			} else {
				edge.t = (currentTime - edge.start)/ (edge.end - edge.start);
				edge.point = getPointAtPath(_graph.edges[edge.ref], edge.t);
				edge.colors = _graph.getColorByDelay(edge.ref, (edge.end - edge.start));
				if (edge.point == null || isNaN(edge.point.y)){
						debugger;
				}
			}
		}
		
		
		if (edgesIndexToRemove.length > 0){
			// Remove cases from Actives and put as completed
			while (edgesIndexToRemove.length > 0){
				var index = edgesIndexToRemove.pop();
				caseN.edgesActive.splice(index, 1);
			}
			// Get new edges only if an active edge is removed.
			// This was made to prevent unnecessary calls and loops, due the fact
			// that no activity ever start if none has end.
			caseN.edgesActive = caseN.edgesActive.concat(getNewEdges(caseN.edgesRemaining, currentTime));
		}
		
		return caseN.edgesActive;
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
//		console.log("i=" + i  + " deltaAcumulado = " + detalAcumulado + " deltaTotal = " + deltaTotal + " pathDx=" + (edge.paths[i][dAxis] < 0 ? -1 : 1) * edge.paths[i][dAxis]);
		while ((detalAcumulado/deltaTotal) < t){
			i++;
			detalAcumulado +=  edge.paths[i][dAxis];
//			console.log("i=" + i  + " deltaAcumulado = " + detalAcumulado + " deltaTotal = " + deltaTotal + " pathDx=" + (edge.paths[i][dAxis] < 0 ? -1 : 1) * edge.paths[i][dAxis]);
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
		
		var relative, result;
		var dx = line.dx * line.dxSignal;
		var dy = line.dy * line.dySignal;
		// Linear equation
		if (line.dx != 0){
		
			var m = dy/dx;
			relative = line.points.x0 + dx * t;
			result = (relative - line.points.x0)*m + line.points.y0 ;
			
		} else {
			
			relative = line.points.x0;
			result = line.points.y0 + dy * t;
			
		}
		var point = {};
		point.x = relative;
		point.y = result;

		return point;
	}
	
	this.computePointInsideEdge = function(index){
		var edge = null;
		var count = 0;
		var paths = [];
		for (var name in _graph.edges){
			edge = _graph.edges[name];
			for (var i = 0; i < edge.paths.length; i ++){
				var points = edge.paths[i].points;
				paths.push({x : points.x0, y : points.y0, aux : 2});
				paths.push({x : points.x1, y : points.y1, aux : 2});
				if (points.dy0){
					paths.push({x : points.dx0, y : points.dy0, aux : 3});
					paths.push({x : points.dx1, y : points.dy1, aux : 3});
				} else {
					var point = getPointAtLine(edge.paths[i], 0);
					paths.push({x : point.x, y : point.y, aux : 4});
					var point = getPointAtLine(edge.paths[i], 1);
					paths.push({x : point.x, y : point.y, aux : 4});
					
				}
			} 
			count++;
		}
		
		var circle = _d3SVG.select(".graph")
			.selectAll("circle.pontos-magicos")
			.data(paths)
			.enter()
			.append("circle")
			.classed("pontos-magicos", true)
			.attr("r", function (d) { return 6-d.aux;})
			.attr("cx", function (d) { return d.x;})
			.attr("cy", function (d) { return d.y;})
			.attr("fill", function (d) { return (d.aux == 2 ? "red" : (d.aux == 3 ? "yellow" : "blue"));});
		
	};
	
}