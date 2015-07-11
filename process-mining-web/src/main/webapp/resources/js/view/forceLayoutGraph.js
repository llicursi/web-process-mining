ForceLayoutGraph = function (config){
	
	var _graph       = {},
	    _selected    = {},
	    _highlighted = null,
	    _colors 	 = null,
	    _config 	 = config;
	    //_isIE        = false;

	var _pathSliderHandler = null;
	var _activitySliderHandler = null;
	
	this.start = function() {
	    resize();
	    
	    _colors = colorbrewer.Set3[_config.graph.numColors];
	    
	    if (_config.pathSliderContainer){
	    	_pathSliderHandler = new SliderHandler(_config.pathSliderContainer, "Path");
	    }
	    
	    if (_config.pathSliderContainer){
	    	_activitySliderHandler = new SliderHandler(_config.activitySliderContainer, "Activity");
	    }
	    
	    
	    //_isIE = $.browser.msie;
		$.ajax({
			 url: _config.jsonUrl,
			 method: "POST",
			 datatype: "json",
			 success: function(data) {
		        if (data.errors && data.errors.length) {
		            alert('Data error(s):\n\n' + data.errors.join('\n'));
		            return;
		        }
		        drawGraph(data);
			 }
		});
	    
	    $('#docs-close').on('click', function() {
	        deselectObject();
	        return false;
	    });
	
	    $(document).on('click', '.select-object', function() {
	        var obj = _graph.activities[$(this).data('name')];
	        if (obj) {
	            selectObject(obj);
	        }
	        return false;
	    });
	
	    $(window).on('resize', resize);
	    
	    
	
	};
	
	function graphDimensions(){
		_graph.margin = {
	        top: 20,
	        right: 270,
	        bottom: 20,
	        left: 20
	    };
		var $graphArea = $('#graph');
		$graphArea.empty();

	    var display = $graphArea.css('display');
	    $graphArea
	        .css('display', 'block')
	        .css('height', _config.graph.height + 'px');
	    _graph.width = $graphArea.width() - _graph.margin.left - _graph.margin.right;
	    _graph.height = $graphArea.height() - _graph.margin.top - _graph.margin.bottom;
	    $graphArea.css('display', display);
	}
	
	function graphNodesAndArcs(graph, data){

		// Nodes
		var nodes = {};
		for (var name in data.activities) {
	        var activity = new NodeActivity(data.activities[name]);
	        nodes[name] = (activity);
	        nodes[name].charge = -200;
	    }
		
		var startCount = 0;
		var endCount = 0;
		for (var name in data.borderEvents) {
			if (data.borderEvents[name].type == 'START'){
				startCount++;
			} else {
				endCount ++;
			}
		}
		
//		for (var name in data.borderEvents) {
//			var raw = data.borderEvents[name];
//	        var borderEvent = new NodeBorder(raw, (raw.type == 'START' ? startCount : endCount));
//	        nodes[name] = (borderEvent);
//	        nodes[name].charge = -400;
//	    }
		
		graph.rawNodes = nodes; 
		graph.nodes = d3.values(nodes);
		
		var links = [];
		// Arcs
		for (var arcName in data.arcs){
			var arc = data.arcs[arcName];
			if (nodes[arc.target] != null && nodes[arc.source] != null && nodes[arc.target].type == 'activity' && nodes[arc.source].type == 'activity'){
				arc.strength = 1;
				arc.distance = 0;
				links.push(arc);
			} else {
				arc.strength = 1;
				arc.distance = 10;
			}
		}
		
		graph.links = links;
		
	}


	function drawGraph(data) {
	    
		graphDimensions();
		graphNodesAndArcs(_graph, data);
		
	    _graph.activitiesSelector = new ActivitiesSelector(graph);
	    _graph.activitiesSelector.buildLegend();

	    _graph.strokeColor = getColorScale(1);
	    _graph.fillColor = getColorScale(-0.1);

	    // Create FORCE Layout
	    _graph.force = d3.layout.force()
	        .nodes(_graph.nodes)
	        .links(_graph.links)
	        .linkStrength(function(d) { 
	        	return d.strength; 
	        	})
	        .linkDistance(function(d) { 
	        	return d.distance; 
	        })
	        .size([_graph.width, _graph.height])
	        .charge(function(d) { 
	        	return d.charge; 
	        })
	        .gravity(0.5)
	        .on('end', function (){
	        
	        })
	        .on('tick', tick);

	    _graph.svg = d3.select('#graph').append('svg')
	        .attr('width', _graph.width + _graph.margin.left + _graph.margin.right)
	        .attr('height', _graph.height + _graph.margin.top + _graph.margin.bottom)
	        .call(d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomHandler))
	    	.append("g");
	    
	    _graph.svg.append('defs').selectAll('marker')
	        .data(['end'])
	        .enter().append('marker')
	        .attr('id', String)
	        .attr('viewBox', '0 -5 10 10')
	        .attr('refX', 10)
	        .attr('refY', 0)
	        .attr('markerWidth', 6)
	        .attr('markerHeight', 6)
	        .attr('orient', 'auto')
	        .append('path')
	        .attr('d', 'M0,-5L10,0L0,5');

	    // adapted from http://stackoverflow.com/questions/9630008
	    // and http://stackoverflow.com/questions/17883655

	    graphGlow(_graph.svg);

	   
	    _graph.line = _graph.svg.append('g').selectAll('.link')
	        .data(_graph.force.links())
	        .enter().append('g').append('path')
	        .attr('class', 'link');

	    _graph.draggedThreshold = d3.scale.linear()
	        .domain([0, 0.1])
	        .range([5, 20])
	        .clamp(true);

	    function dragged(d) {
	        var threshold = _graph.draggedThreshold(_graph.force.alpha()),
	            dx = d.oldX - d.px,
	            dy = d.oldY - d.py;
	        if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
	            d.dragged = true;
	        }
	        return d.dragged;
	    }

	    _graph.drag = d3.behavior.drag()
	        .origin(function(d) {
	            return d;
	        })
	        .on('dragstart', function(d) {
	            d.oldX = d.x;
	            d.oldY = d.y;
	            d.dragged = false;
	            d.fixed |= 2;
	        })
	        .on('dragend', function(d) {
	  
	        });

	    $('#graph-container').on('click', function(e) {
	        if (!$(e.target).closest('.node').length) {
	            deselectObject();
	        }
	    });

	    _graph.node = _graph.svg.selectAll('.node')
	        .data(_graph.force.nodes())
	        .enter().append('g')
	        .attr('class', function (d){ return d.type + " node";}) 
	        .on('mouseover', function(d) {
	            if (!_selected.obj && d.type == 'ACTIVITY') {
	                if (_graph.mouseoutTimeout) {
	                    clearTimeout(_graph.mouseoutTimeout);
	                    _graph.mouseoutTimeout = null;
	                }
	                highlightObject(d);
	            }
	        })
	        .on('mouseout', function() {
	            if (!_selected.obj) {
	                if (_graph.mouseoutTimeout) {
	                    clearTimeout(_graph.mouseoutTimeout);
	                    _graph.mouseoutTimeout = null;
	                }
	                _graph.mouseoutTimeout = setTimeout(function() {
	                    highlightObject(null);
	                }, 300);
	            }
	        });
	    

	    _graph.node.each(function(d) {
	        var node = d3.select(this),
	            lines = wrap(d.name),
	            ddy = 1.1,
	            dy = -ddy * lines.length / 2 + .5;
	       
	        node.call(drowObjectBackground);
	       
	        lines.forEach(function(line) {
	            var text = node.append('text')
	                .text(line)
	                .attr('dy', dy + 'em');
	            dy += ddy;
	        });
	    });

	    setTimeout(function() {
	        _graph.node.each(function(d) {
	            var node = d3.select(this),
	                text = node.selectAll('text'),
	                bounds = {},
	                first = true;

	            text.each(function() {
	                var box = this.getBBox();
	                if (first || box.x < bounds.x1) {
	                    bounds.x1 = box.x;
	                }
	                if (first || box.y < bounds.y1) {
	                    bounds.y1 = box.y;
	                }
	                if (first || box.x + box.width > bounds.x2) {
	                    bounds.x2 = box.x + box.width;
	                }
	                if (first || box.y + box.height > bounds.y2) {
	                    bounds.y2 = box.y + box.height;
	                }
	                first = false;
	            }).attr('text-anchor', 'middle');

	            var padding = _config.graph.labelPadding,
	                margin = _config.graph.labelMargin,
	                oldWidth = bounds.x2 - bounds.x1;

	            bounds.x1 -= oldWidth / 2;
	            bounds.x2 -= oldWidth / 2;

	            bounds.x1 -= padding.left;
	            bounds.y1 -= padding.top;
	            bounds.x2 += padding.left + padding.right;
	            bounds.y2 += padding.top + padding.bottom;

	            node.data()[0].computeRect(node, bounds);
	            
	            d.extent = {
	                left: bounds.x1 - margin.left,
	                right: bounds.x2 + margin.left + margin.right,
	                top: bounds.y1 - margin.top,
	                bottom: bounds.y2 + margin.top + margin.bottom
	            };

	            d.edge = {
	                left: new geo.LineSegment(bounds.x1, bounds.y1, bounds.x1, bounds.y2),
	                right: new geo.LineSegment(bounds.x2, bounds.y1, bounds.x2, bounds.y2),
	                top: new geo.LineSegment(bounds.x1, bounds.y1, bounds.x2, bounds.y1),
	                bottom: new geo.LineSegment(bounds.x1, bounds.y2, bounds.x2, bounds.y2)
	            };
	        });

	        _graph.numTicks = 0;
	        _graph.preventCollisions = false;
	        
	        
	        _graph.force.start();
	        for (var i = 0; i < _config.graph.ticksWithoutCollisions; i++) {
	            _graph.force.tick();
	        }
	        _graph.preventCollisions = true;
	    	var newnode = new NodeBorder(data.borderEvents.START0);
   	        newnode.edge = _graph.nodes[0].edge;
   	        newnode.extent = _graph.nodes[0].extent;
   	       	
   	        _graph.nodes.push(newnode);
	        
   	        $('#graph-container').css('visibility', 'visible');
	    });
	}

	function drowObjectBackground(node){
		var data = node.data()[0];
		var rect = data.draw(node);
		rect.attr('stroke', function(d) {
				return _graph.strokeColor(d.type);
			 })
			 .attr('fill', function(d) {
			     return _graph.fillColor(d.type);
			 })
			
			 .on("click", function (d){
			 	selectObject(d, this);
			 });
	}

	var maxLineChars = 26,
	    wrapChars = ' /_-.'.split('');

	function wrap(text) {
	    if (text.length <= maxLineChars) {
	        return [text];
	    } else {
	        for (var k = 0; k < wrapChars.length; k++) {
	            var c = wrapChars[k];
	            for (var i = maxLineChars; i >= 0; i--) {
	                if (text.charAt(i) === c) {
	                    var line = text.substring(0, i + 1);
	                    return [line].concat(wrap(text.substring(i + 1)));
	                }
	            }
	        }
	        return [text.substring(0, maxLineChars)]
	            .concat(wrap(text.substring(maxLineChars)));
	    }
	}

	function preventCollisions() {
	    var quadtree = d3.geom.quadtree(_graph.nodes);

	    for (var i =0; i < _graph.nodes.length; i++) {
	        var obj = _graph.nodes[i],
	            ox1 = obj.x + obj.extent.left,
	            ox2 = obj.x + obj.extent.right,
	            oy1 = obj.y + obj.extent.top,
	            oy2 = obj.y + obj.extent.bottom;

	        quadtree.visit(function(quad, x1, y1, x2, y2) {
	            if (quad.point && quad.point !== obj) {
	                // Check if the rectangles intersect
	                var p = quad.point,
	                    px1 = p.x + p.extent.left,
	                    px2 = p.x + p.extent.right,
	                    py1 = p.y + p.extent.top,
	                    py2 = p.y + p.extent.bottom,
	                    ix = (px1 <= ox2 && ox1 <= px2 && py1 <= oy2 && oy1 <= py2);
	                if (ix) {
	                    var xa1 = ox2 - px1, // shift obj left , p right
	                        xa2 = px2 - ox1, // shift obj right, p left
	                        ya1 = oy2 - py1, // shift obj up   , p down
	                        ya2 = py2 - oy1, // shift obj down , p up
	                        adj = Math.min(xa1, xa2, ya1, ya2);

	                    if (adj == xa1) {
	                        obj.x -= adj / 2;
	                        p.x += adj / 2;
	                    } else if (adj == xa2) {
	                        obj.x += adj / 2;
	                        p.x -= adj / 2;
	                    } else if (adj == ya1) {
	                        obj.y -= adj / 2;
	                        p.y += adj / 2;
	                    } else if (adj == ya2) {
	                        obj.y += adj / 2;
	                        p.y -= adj / 2;
	                    }
	                }
	                return ix;
	            }
	        });
	    }
	}

	function tick(e) {
	    _graph.numTicks++;

	    if (_graph.preventCollisions) {
	        preventCollisions();
	    }

	    _graph.line
	    	.attr('d', function (d){

	    		var target = _graph.rawNodes[d.target];
	    		var source = _graph.rawNodes[d.source];
	    		var dx = target.x - source.x,
	    	      dy = target.y - source.y,
	    	      dr = Math.sqrt(dx * dx + dy * dy);
	    		var adjustTargetY = ((target.y > source.y) ? -1 : 1) * (17/2);
	    		
	    		return "M" + source.x + "," + source.y + "A" + dr + "," + dr + " 0 0,0 " + target.x + "," + (target.y + adjustTargetY) ;
	    	});

	    _graph.node
	        .attr('transform', function(d) {
	            return 'translate(' + d.x + ',' + d.y + ')';
	        });
	}

	function selectObject(obj, el) {
	    var node = null;
	    if (el) {
	        node = d3.select(el);
	    } else {
	        _graph.node.each(function(d) {
	            if (d === obj) {
	                node = d3.select(el = this);
	            }
	        });
	    }
	    if (node == null) return;

	    if (node.classed('selected')) {
	        deselectObject();
	        return;
	    }
	    deselectObject(false);

	    _selected = {
	        obj: obj,
	        el: el
	    };

	    highlightObject(obj);

	    node.classed('selected', true);
	    $('#docs').html(obj.docs).prev().click();
	    $('#docs-container').scrollTop(0);
	    resize(true);

	    var $graph = $('#graph-container');
	    var nodeRect = {
	            left: obj.x + obj.extent.left + _graph.margin.left,
	            top: obj.y + obj.extent.top + _graph.margin.top,
	            width: obj.extent.right - obj.extent.left,
	            height: obj.extent.bottom - obj.extent.top
	        };
	    var graphRect = {
	            left: $graph.scrollLeft(),
	            top: $graph.scrollTop(),
	            width: $graph.width(),
	            height: $graph.height()
	        };
	    if (nodeRect.left < graphRect.left ||
	        nodeRect.top < graphRect.top ||
	        nodeRect.left + nodeRect.width > graphRect.left + graphRect.width ||
	        nodeRect.top + nodeRect.height > graphRect.top + graphRect.height) {

	    	$graph.animate({
	            scrollLeft: nodeRect.left + nodeRect.width / 2 - graphRect.width / 2,
	            scrollTop: nodeRect.top + nodeRect.height / 2 - graphRect.height / 2
	        }, 500);
	    }
	}

	function deselectObject(doResize) {
	    if (doResize || typeof doResize == 'undefined') {
	        resize(false);
	    }
	    _graph.node.classed('selected', false);
	    _selected = {};
	    highlightObject(null);
	}

	function highlightObject(obj) {
	    if (obj) {
	        if (obj !== _highlighted) {
	            _graph.node.classed('inactive', function(d) {
	            	return (obj !== d && d.next.indexOf(obj.name) == -1 && d.previous.indexOf(obj.name) == -1);
	            });
	            _graph.line.classed('inactive', function(d) {
	                return (obj !== d.source && obj !== d.target);
	            });
	        }
	        _highlighted = obj;
	    } else {
	        if (_highlighted) {
	            _graph.node.classed('inactive', false);
	            _graph.line.classed('inactive', false);
	        }
	        _highlighted = null;
	    }
	}

	var showingDocs = false,
	    desiredDocsHeight = 300;

	function resize(showDocs) {
	    var docsHeight = 0,
	        $docs = $('#docs-container');

	    if (typeof showDocs == 'boolean') {
	        showingDocs = showDocs;
	        $docs[showDocs ? 'show' : 'hide']();
	    }

	    if (showingDocs) {
	        docsHeight = desiredDocsHeight;
	        $docs.css('height', docsHeight + 'px');
	    }

	  //graphHeight = window.innerHeight - docsHeight;
	  //  $_graph.css('height', graphHeight + 'px');
	}
	
	function getColorScale(darkness) {
        return d3.scale.ordinal()
            .domain(_graph.activitiesSelector.keys)
            .range(_colors.map(function(c) {
                return d3.hsl(c).darker(darkness).toString();
            }));
    }
	
	 function zoomHandler() {
    	_graph.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
	 
	function graphGlow(svg){
		 var glow = svg.append('filter')
	        .attr('x', '-50%')
	        .attr('y', '-50%')
	        .attr('width', '200%')
	        .attr('height', '200%')
	        .attr('id', 'blue-glow');

	    glow.append('feColorMatrix')
	        .attr('type', 'matrix')
	        .attr('values', '0 0 0 0  0 ' + '0 0 0 0  0 ' + '0 0 0 0  .7 ' + '0 0 0 1  0 ');

	    glow.append('feGaussianBlur')
	        .attr('stdDeviation', 3)
	        .attr('result', 'coloredBlur');

	    glow.append('feMerge').selectAll('feMergeNode')
	        .data(['coloredBlur', 'SourceGraphic'])
	        .enter().append('feMergeNode')
	        .attr('in', String);
	}
	
};




