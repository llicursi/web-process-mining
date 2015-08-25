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
	
	this.load = function(_url, page){
		if (_data == null){
			var url = _url;
			if (url.indexOf("/") != (url.length - 1)){ 
				url = url + "/";
			}
			url += page + "/";
			$.ajax({
				 url: url ,
				 method: "POST",
				 datatype: "json",
				 success: function(data) {
					 
					_barSVG.transition().delay(200).attr("opacity", "1").attr("y", "94%");
					// Initiate the 
					_d3SVG.select(".graph").append("g").classed("animations", true);
					
					bindAnimationButtons();
					_data = adjustData(data);
					drawStartTimes();
				 }
			});
		} else {
			show();
		}
	} 
	
	function loadNextPages(url, page){
		
	}
	
	function show(){
		_barSVG.transition().delay(200).attr("opacity", "1").attr("y", "94%");
		_d3SVG.select(".graph g.animations").transition().duration(200).attr("opactiy", "1").transition().attr("style", "display:block");
		
		_acontrol.animation.time = null;
		
		if (_acontrol.animation.stop != true){
			stopAnimate(false);
		}
		
		drawAreaCompletetion(0);
		drawPointsInTime(0);
		
		if (_acontrol.animation.stop != true){
			animate(false);
		}
		
	}
	
	this.hide = function(){
		if (_acontrol.animation.stop != true){
			stopAnimate(true);
		}
		selectTime(0);
		_barSVG.transition().delay(200).attr("opacity", "0").attr("y", "115%");
		_d3SVG.select(".graph g.animations").transition().duration(200).attr("opactiy", "0").transition().attr("style", "display:none");
		_d3SVG.select(".graph g.animations").selectAll("circles").transition().delay(200).remove();
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
		var startTime = (new Date()).getTime();
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
		console.log("Time adjusting the data :" + ((new Date()).getTime() - startTime) + " ms");
		
		var startTime = (new Date()).getTime();
		preData.cases.sort(function(a, b){return a.start-b.start});
		
		console.log("Sorting data ("+ (index-1) +") by startTime :" + ((new Date()).getTime() - startTime)+ " ms");
		
		preData.size = index -1;
		updateTotalNumber(preData.size);
		updateTuplesStatistics(0, preData.size, 0);
		
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
	
	function updateTotalNumber(value){
		document.getElementById("ani-control-total").innerHTML = "" + value;
	}
	
	_cachedDOM = {};
	
	function updateTuplesStatistics(displaying, waiting, done){
		if (!_cachedDOM['ani-control-waiting']){
			_cachedDOM['ani-control-waiting'] = document.getElementById("ani-control-waiting"); 
		}
		_cachedDOM['ani-control-waiting'].innerHTML = waiting;
		
		if (!_cachedDOM['ani-control-done']){
			_cachedDOM['ani-control-done'] = document.getElementById("ani-control-done"); 
		}
		_cachedDOM['ani-control-done'].innerHTML = done;

		if (!_cachedDOM['ani-control-display']){
			_cachedDOM['ani-control-display'] = document.getElementById("ani-control-display"); 
		}
		_cachedDOM['ani-control-display'].innerHTML = displaying;

		
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
		_acontrol.animation.time = selectTime(left);
		
		if (_acontrol.animation.stop != true){
			stopAnimate(false);
		}
		
		drawAreaCompletetion(left);
		drawPointsInTime(_acontrol.animation.time);
		
		if (_acontrol.animation.stop != true){
			animate(false);
		}
		
		var end = (new Date()).getTime();
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
	
	var _buttons = {};
	function bindAnimationButtons(){
		 _buttons.play = document.getElementById("btn-play");
		_buttons.play.onclick = animate;
		_buttons.stop = document.getElementById("btn-stop");
		_buttons.stop.onclick = stopAnimate;

		_buttons.foward = document.getElementById("btn-foward");
		_buttons.foward.onclick = function (event){
			changeSpeed(1, event);
		};
		_buttons.backward = document.getElementById("btn-backward");
		_buttons.backward.onclick = function (event){
			changeSpeed(-1, event);
		};
		_buttons.counter = document.getElementById("btn-counter");
		
		
		$("#btn-play-control").show();
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
		// Animation control
		animation : {
			timeout : null, 
			time : 0,
			stop : true,
			speed: 1,
			speedIndex:0 
		}
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
		_acontrol.animation.time = null;
	}
	
	
	function animate(preventChange){
		
		_acontrol.animation.stop = false;
		
		var time = 100;
		if (_acontrol.animation.time == null){
			_acontrol.animation.time = selectTime(_dimensions.x);
		}
		var elapsedTime = _acontrol.xDomainTime(_acontrol.animation.time);
		
		var animation = function () {
			
			updateNewActiveCase(_acontrol.animation.time);
			// Draw dots
			drawPointsInTime(_acontrol.animation.time);
			
			// Compute the next time;
			_acontrol.animation.time = _acontrol.xTimeDomain(elapsedTime);
			drawAreaCompletetion(_acontrol.xDomainRange(_acontrol.animation.time));
			
			if (!_acontrol.animation.stop && _acontrol.animation.time < _data.max){
				elapsedTime += (time/100) * _acontrol.animation.speed;
				_acontrol.animation.timeout = window.setTimeout(animation, time);
			} else {
				changeButton();
				selectTime(_acontrol.xDomainRange(_data.min));
			}
		};
		animation();
		
		if (preventChange){
			changeButton();
		}
		
	}
	
	var availablesSpeed = [0.25, 0.33, 0.5, 0.75, 1, 2, 3, 4, 5];
	function changeSpeed(value){
		var newValue = _acontrol.animation.speedIndex + value;
		if (newValue > -5 && newValue < 5){
			_acontrol.animation.speedIndex = newValue;
			_acontrol.animation.speed = availablesSpeed[4 + newValue];
			_buttons.counter.innerHTML = _acontrol.animation.speed + "x" 
		}
	}
	
	function stopAnimate(preventChange){
		_acontrol.animation.stop = true;
		if (_acontrol.animation.timeout != null){
			window.clearTimeout(_acontrol.animation.timeout);
		}
		_acontrol.animation.timeout = null;

		if (preventChange){
			changeButton();
		}
	}
	

	function changeButton(){
		if (_buttons.play.hasAttribute("disabled")){
			_buttons.play.removeAttribute("disabled");
			$(_buttons.play).removeClass("disabled")
			_buttons.stop.setAttribute("disabled", "disabled");
			$(_buttons.stop).addClass("disabled")
		} else {
			_buttons.stop.removeAttribute("disabled");
			$(_buttons.stop).removeClass("disabled")
			_buttons.play.setAttribute("disabled", "disabled");
			$(_buttons.play).addClass("disabled")
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
		_acontrol.animation.time = time;
		
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
				updateTuplesStatistics(
						_acontrol.cases.actives.length,
						_acontrol.cases.waiting.length,
						_acontrol.cases.completed.length);
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
			
			//console.log("Casos completos : " + _acontrol.cases.completed.length);
			//console.log("Casos ativos : " + _acontrol.cases.actives.length);
			updateTuplesStatistics(
					_acontrol.cases.actives.length,
					_acontrol.cases.waiting.length,
					_acontrol.cases.completed.length);
			
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
		points.transition().duration(50)
			.attr("cx", function (d) { return d.point.x})
			.attr("cy", function (d) { return d.point.y})
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
				var edge = caseN.edgesActive.splice(index, 1);
				var split = edge[0].ref.split(">");
				fireEdgeCompleted(split[1], edge);
			}
			// Get new edges only if an active edge is removed.
			// This was made to prevent unnecessary calls and loops, due the fact
			// that no activity ever start if none has end.
			caseN.edgesActive = caseN.edgesActive.concat(getNewEdges(caseN.edgesRemaining, currentTime));
		}
		
		return caseN.edgesActive;
	}
	
	var _onEdgeCompleted = null;
	this.setOnEdgeCompleted = function (onEdgeCompleted){
		if (onEdgeCompleted != null && typeof onEdgeCompleted != 'undefined' && typeof onEdgeCompleted == 'function'){
			_onEdgeCompleted = onEdgeCompleted;
		}
	}
	
	function fireEdgeCompleted(uniqueLetter, edge){
		if (_onEdgeCompleted != null){
			_onEdgeCompleted(uniqueLetter, edge);
		}
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
	
	
	this.getPointAtMiddle = function(edge){
		return getPointAtPath(edge, 0.5);
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