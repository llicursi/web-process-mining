//lightweight is an optional argument that will try to draw the graph as fast as possible
ProcessMiningViewportController = function (attachPoint, data) {
	var _self = this;
	var DAG,DAGMinimap,DAGTooltip, DAGAnimationBar, DAGActivities,DAGContextMenu;
	var _graphDimensions = graphDimensions();
	var _sliderHandlers = {
		path : null, 
		activity : null
	}
	
	// SVG elements
	var _d3SVG = null, 
		minimapSVG = null, 
		rootSVG = null,
		_d3GraphG = null;
	
	var containerDOM = document.getElementById(attachPoint);
	var lightweight = false;
	var _status = "densidade";
	var _graph = null, _data = data, _history = null;

	function init(){
		
		rootSVG = d3.select(containerDOM)
			.append("svg")
			.attr("width", _graphDimensions.width)
			.attr("height", _graphDimensions.height);
		
		_d3SVG = rootSVG
			.append("svg")
			.attr("width", _graphDimensions.width)
			.attr("height", _graphDimensions.height)
			.attr("class", "graph-attach");
		
		_d3SVG.node().oncontextmenu = function(d) { return false; };
			
		minimapSVG = d3.select("#minimap-container").append("svg").attr("class", "minimap-attach");
		
		listSVG = rootSVG.append("svg").attr("class", "history-attach");
	
	//	Create the graph and history representations
		_graph = createGraphFromNodes(_data);
		$(containerDOM.parentNode).css('visibility', 'visible');
	
	//	Create the chart instances
		DAG = DirectedAcyclicGraph().animate(!lightweight);
		DAGMinimap = DirectedAcyclicGraphMinimap(DAG).width("85%").height("87%");
		DAGTooltip = DirectedAcyclicGraphTooltip(undefined, ["name", "count", "avgTime", "resources"]);
		DAGAnimationBar = new DirectedAcyclicGraphAnimationBar(_graph);
		DAGAnimationBar.build(rootSVG, _d3SVG);
		
		DAGContextMenu = DirectedAcyclicGraphContextMenu(_graph, _d3SVG);
		
		_sliderHandlers.path = new SliderHandler("densitySlider", "Paths");
		_sliderHandlers.activity = new SliderHandler("activitySlider", "Activities");
	} init();
	
	
//	Attach the panzoom behavior
	var refreshViewport = function() {
		var t = zoom.translate();
		var scale = zoom.scale();
		$(".context-menu").remove();
		_d3SVG.select(".graph").attr("transform","translate("+t[0]+","+t[1]+") scale("+scale+")");
		minimapSVG.select('.viewfinder').attr("x", -t[0]/scale).attr("y", -t[1]/scale).attr("width", containerDOM.offsetWidth/scale).attr("height", containerDOM.offsetHeight/scale);
		if (!lightweight) _d3SVG.selectAll(".node text").attr("opacity", 3*scale-0.3);
	};
	
	var zoom = MinimapZoom().scaleExtent([0.2, 2.0]).on("zoom", refreshViewport);
	zoom.call(this, rootSVG, minimapSVG);

//	A function that resets the viewport by zooming all the way out
	var resetViewport = function() {
		var margin = {
	        top: -50,
	        right: 80,
	        bottom: 80,
	        left: -50
	    };
		
		var curbbox = _d3SVG.node().getBBox();
		var bbox = { 
			x: curbbox.x + margin.left, 
			y: curbbox.y + margin.top, 
			width: curbbox.width + margin.right, 
			height: curbbox.height + margin.bottom
		};
		scale = Math.min(containerDOM.offsetWidth/bbox.width, containerDOM.offsetHeight/bbox.height);
		w = containerDOM.offsetWidth/scale;
		h = containerDOM.offsetHeight/scale;
		tx = ((w - bbox.width)/2 - bbox.x )*scale;
		ty = ((h - bbox.height)/2 - bbox.y )*scale;
		zoom.translate([tx, ty]).scale(scale);
		refreshViewport();
		
		var start = (new Date()).getTime();
		_graph.updateEdges(d3.select(".graph-attach").selectAll("path"));
		var end = (new Date()).getTime();
		console.log("Computing edges :  " + (end - start) + " ms");
	};
	
	function graphDimensions(){
		var _graphDimensions = {};
		_graphDimensions.margin = {
	        top: 20,
	        right: -20,
	        bottom: -20,
	        left: 20
	    };
		var $graphArea = $('#graph');

	    var display = $graphArea.css('display');
	    $graphArea
	        .css('display', 'block')
	        .css('height', '510px');
	    _graphDimensions.width = $graphArea.width() - _graphDimensions.margin.left - _graphDimensions.margin.right;
	    _graphDimensions.height = $graphArea.height() - _graphDimensions.margin.top - _graphDimensions.margin.bottom ;
	    $graphArea.css('display', display);
	    
	    return _graphDimensions;
	}
	

//	Attaches a context menu to any selected graph nodess
	function attachContextMenus() {
	    DAGContextMenu.call(_d3SVG.node(), _d3SVG.selectAll(".node"));
	    DAGContextMenu.on("open", function() {
	       // DAGTooltip.hide();
	    }).on("close", function() {
	        if (!lightweight) {
	            _d3SVG.selectAll(".node").classed("preview", false);
	            _d3SVG.selectAll(".edge").classed("preview", false);
	        }
	    }).on("hidenodes", function(nodes, selectionname) {
	        if (!lightweight) _d3SVG.classed("hovering", false);
	        DAGActivities.hideNodes(nodes);

	        // REmove the nodes from graph
	        DAG.removenode(function(d) {
	            if (lightweight) {
	                d3.select(this).remove();
	            } else {
	                d3.select(this).classed("visible", false).transition().duration(800).remove();
	            }
	        });

	        //		Refresh selected edges
	        var selected = {};
	        _d3SVG.selectAll(".node.selected").data().forEach(function(d) {
	            selected[d.id] = true;
	        });
	        _d3SVG.selectAll(".edge").classed("selected", function(d) {
	            return selected[d.source.id] && selected[d.target.id];
	        });
	    }).on("hovernodes", function(nodes) {
	        if (!lightweight) {
	            _d3SVG.selectAll(".node").classed("preview", function(d) {
	                return nodes.indexOf(d) != -1;
	            })
	            var previewed = {};
	            _d3SVG.selectAll(".node.preview").data().forEach(function(d) {
	                previewed[d.id] = true;
	            });
	            _d3SVG.selectAll(".edge").classed("preview", function(d) {
	                return previewed[d.source.id] && previewed[d.target.id];
	            });
	        }
	    }).on("selectnodes", function(nodes) {
	        var selected = {};
	        DAGActivities.select(nodes);
	        nodes.forEach(function(d) {
	            selected[d.id] = true;
	        });
	        _d3SVG.selectAll(".node").classed("selected", function(d) {
	            var selectme = selected[d.id];
	            if (d3.event.ctrlKey) selectme = selectme || d3.select(this).classed("selected");
	            return selectme;
	        })
	        _d3SVG.selectAll(".edge").classed("selected", function(d) {
	            var selectme = selected[d.source.id] && selected[d.target.id];
	            if (d3.event.ctrlKey) selectme = selectme || d3.select(this).classed("selected");
	            return selectme;
	        });
	        attachContextMenus();
	        DAGTooltip.hide();
	    });
	}

//	Detaches any bound context menus
	function detachContextMenus() {
		$(".graph .node").unbind("contextmenu");
	}

//	A function that attaches mouse-click events to nodes to enable node selection
	function setupEvents(){
		var nodes = _d3SVG.selectAll(".node");
		var edges = _d3SVG.selectAll(".edge");
		if (DAGActivities == null){
			DAGActivities = new DirectedAcyclicGraphActivities("activitiesControl", nodes);
			DAGActivities.getRange(function(a, b) {
				debugger;
				var path = getNodesBetween(a, b).concat(getNodesBetween(b, a));
				return nodes.data(path, DAG.nodeid());
			});
			
			DAGActivities.onChange(function(insidenodes, e){
				redraw();
			});
			
			DAGActivities.onSelect(function(selected) {
				edges.classed("selected", function(d) {
					/*if (selected[d.source.id] && selected[d.target.id]){
						d.middle = DAGAnimationBar.getPointAtMiddle(d);
						_d3SVG.select(".graph").append("g")
							.classed("edge-info", true)
							.attr("transform", "translate("+d.middle.x+","+d.middle.y+")")
							.append("circle")
							.attr("fill", "red")
							.attr("cx",0)
							.attr("cy",0)
							.attr("r", "6")
							
					}*/
					
					return selected[d.source.id] && selected[d.target.id]; 
				});
				DAGTooltip.hide();
			});
				
		}
		DAGActivities.setup(nodes);
		
		attachContextMenus();
		

		if (!lightweight) {
			nodes.on("mouseover", function(d) {
				if (_status == "densidade"){
					_d3SVG.classed("hovering", true);
					highlightPath(d);
				}
			}).on("mouseout", function(d){
				_d3SVG.classed("hovering", false);
				edges.classed("hovered", false).classed("immediate", false);
				nodes.classed("hovered", false).classed("immediate", false);
			});
		}

//		When a list item is clicked, it will be removed from the history and added to the graph
//		So we override the DAG node transition behaviour so that the new nodes animate from the click position
		
		function highlightPath(center) {
			var path = getEntirePathLinks(center);

			var getRef = function (source, target){
				return source.datum.uniqueLetter + ">" + target.datum.uniqueLetter;
			};
			
			var highlightKeys = {
				"SOURCE" : "SOURCE",
				"TARGET" : "TARGET",
				"NONE" : "NONE"
			};

			var pathnodes = {};
			var pathlinks = {};

			path.forEach(function(p) {
				pathnodes[p.source.id] = true;
				pathnodes[p.target.id] = true;
				pathlinks[p.ref] = true;
			});

			edges.classed("hovered", function(d) {
				return pathlinks[d.ref];
			});
			nodes.classed("hovered", function(d) {
				return pathnodes[d.id];
			});

			var immediatenodes = {};
			var immediatelinks = {};
			immediatenodes[center.id] = highlightKeys["TARGET"];
			
			center.getVisibleParents().forEach(function(p) {
				immediatenodes[p.id] = highlightKeys["SOURCE"];
				immediatelinks[getRef(p, center)] = highlightKeys["SOURCE"];
			});
			center.getVisibleChildren().forEach(function(p) {
				immediatenodes[p.id] = highlightKeys["TARGET"];
				immediatelinks[getRef(center, p )] = highlightKeys["TARGET"];
			});

			edges.classed("immediate", function(d) {
				return (immediatelinks[d.ref] == highlightKeys["TARGET"]);
			});
			nodes.classed("immediate", function(d) {
				return (immediatenodes[d.id] == highlightKeys["TARGET"]);
			});
			
			edges.classed("previous", function(d) {
				return (immediatelinks[d.ref] == highlightKeys["SOURCE"]);
			});
			nodes.classed("previous", function(d) {
				return (immediatenodes[d.id] == highlightKeys["SOURCE"]);
			});
		}
	}

//	The main draw function
	this.draw = function() {
		DAGTooltip.hide();// Hide any tooltips
		
		console.log("draw begin");
		var begin = (new Date()).getTime();
		_d3SVG.datum(_graph).call(DAG);// Draw a DAG at the graph attach
		
		minimapSVG.datum(_d3SVG.node()).call(DAGMinimap);// Draw a Minimap at the minimap attach
		_d3SVG.selectAll(".node").call(DAGTooltip);// Attach tooltips
		start = (new Date()).getTime();
		setupEvents();// Set up the node selection events
		refreshViewport();// Update the viewport settings
		console.log("draw complete, total time=", new Date().getTime() - begin);
		
		resetViewport();
		
		_d3GraphG = _d3SVG.select("g.graph");
	};
	
	function redraw() {
		DAGTooltip.hide();// Hide any tooltips
		
		console.log("draw begin");
		var begin = (new Date()).getTime();
		_d3SVG.datum(_graph).call(DAG);// Draw a DAG at the graph attach
		
		minimapSVG.datum(_d3SVG.node()).call(DAGMinimap);// Draw a Minimap at the minimap attach
		_d3SVG.selectAll(".node").call(DAGTooltip);// Attach tooltips
		start = (new Date()).getTime();
		setupEvents();// Set up the node selection events
		//refreshViewport();// Update the viewport settings
		console.log("rdraw complete, total time=", new Date().getTime() - begin);
		
		var start = (new Date()).getTime();
		_graph.updateEdges(d3.select(".graph-attach").selectAll("path"));
		var end = (new Date()).getTime();
		console.log("Computing edges :  " + (end - start) + " ms");
		
	}
	
	$('#doc-menus .nav-tabs a').on('shown.bs.tab', function (e) {
		var targetElem = e.target;
		var sourceElem = e.relatedTarget;
		
		var target = targetElem.hash.replace("Control", "").replace("#", "");
		_d3GraphG.classed(target, true);
		var source = sourceElem.hash.replace("Control", "").replace("#", "");
		_d3GraphG.classed(source, false);
		if (target == "animation"){
			DAGActivities.showAllNodes();
			_graph.updateEdges(d3.select(".graph-attach").selectAll("path"));
			DAGAnimationBar.load("cases/", 0);
		}
		
		if (source == "animation"){
			DAGAnimationBar.hide();
		}
		
		
	});
};

var procMiningController;
(function (){
	
	$.ajax({
		 url:"data/" ,
		 method: "POST",
		 datatype: "json",
		 success: function(data) {
	        if (data.errors && data.errors.length) {
	            alert('Data error(s):\n\n' + data.errors.join('\n'));
	            return;
	        }
	        procMiningController = new ProcessMiningViewportController("graph", data);
	    	procMiningController.draw();
		 }
	});
	
})();