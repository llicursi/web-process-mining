var graph       = {},
    selected    = {},
    highlighted = null,
    isIE        = false;
	
$(function() {
    resize();
    
    $( "#accordion" ).accordion({
	    heightStyle: "fill"
	});
    
    isIE = $.browser.msie;
	$.ajax({
		 url: config.jsonUrl,
		 method: "POST",
		 datatype: "json",
		 success: function(data) {
	        if (data.errors && data.errors.length) {
	            alert('Data error(s):\n\n' + data.errors.join('\n'));
	            return;
	        }

	        graph.activities = data.activities;
	        graph.arcs = data.arcs;
	        drawGraph();
		 }
	});
    
    $('#docs-close').on('click', function() {
        deselectObject();
        return false;
    });

    $(document).on('click', '.select-object', function() {
        var obj = graph.activities[$(this).data('name')];
        if (obj) {
            selectObject(obj);
        }
        return false;
    });

    $(window).on('resize', resize);
  

});


function drawGraph() {
    $('#graph').empty();

    graph.margin = {
        top: 20,
        right: 270,
        bottom: 20,
        left: 20
    };

    var display = $('#graph').css('display');
    $('#graph')
        .css('display', 'block')
        .css('height', config.graph.height + 'px');
    graph.width = $('#graph').width() - graph.margin.left - graph.margin.right;
    graph.height = $('#graph').height() - graph.margin.top - graph.margin.bottom;
    $('#graph').css('display', display);

    var starterLinkList = [];
    var endsLinkList = [];
    var startNodeCircle = {
        	x : graph.width/2,
        	y : 30,
        	strength : 1,weight : 0.5,
            name: 'start',
            type: "starter",
            next: starterLinkList,
            previous : [],
        	fixed : true
        };
    
    var endNodeCircle = {
        	x : graph.width/2,
        	y : graph.height - 50,
        	strength : 1,
        	weight : 0.5,
            name: 'end',
            type: "ender",
            next: [],
            previous : endsLinkList,
        	fixed : true
        };
    
    for (var name in graph.activities) {
        var obj = graph.activities[name];
        obj.strength = 1.4;
        obj.weight = 5.2;
        obj.name = name;
        obj.type = "activity";
        
        if (obj.previous && obj.previous.length == 0){
        	starterLinkList.push(name);
        	obj.previous.push('start');
        } else if (obj.next && obj.next.length == 0){
        	endsLinkList.push(name);
        	obj.next.push('end');
        }
    }
    
    // Create start activity
    
    
    graph.activities.start = startNodeCircle;
    graph.activities.end = endNodeCircle;
    
    graph.links = [];
    
    for (var arcName in graph.arcs){
    	var arc = graph.arcs[arcName];
    	arc.target = graph.activities[arc.target];
    	arc.source = graph.activities[arc.source];
    	graph.links.push(arc);
    }
    
    // Add start activity lines
    for (var i = 0; i < starterLinkList.length; i ++){
	    graph.links.push({
	    	target : graph.activities[starterLinkList[i]],
	    	source : graph.activities['start'],
	    	strength : 1,
	    	count : 1
	    });
    }
    
    // Add start activity lines
    for (var i = 0; i < endsLinkList.length; i ++){
	    graph.links.push({
	    	target : graph.activities['end'],
	    	source : graph.activities[endsLinkList[i]],
	    	strength : 1,
	    	count : 1
	    });
    }
    
    graph.activitiesSelector = new ActivitiesSelector(graph);
    
    graph.colors = colorbrewer.Set3[config.graph.numColors];
 
    function getColorScale(darkness) {
        return d3.scale.ordinal()
            .domain(graph.activitiesSelector.keys)
            .range(graph.colors.map(function(c) {
                return d3.hsl(c).darker(darkness).toString();
            }));
    }
    
    graph.strokeColor = getColorScale(0.7);
    graph.fillColor = getColorScale(-0.1);

    graph.nodeValues = d3.values(graph.activities);

    graph.force = d3.layout.force()
        .nodes(graph.nodeValues)
        .links(graph.links)
        .linkStrength(function(d) {
            return d.strength;
        })
        .size([graph.width, graph.height])
        .linkDistance(config.graph.linkDistance)
        .charge(config.graph.charge)
        .on('tick', tick);

    graph.svg = d3.select('#graph').append('svg')
        .attr('width', graph.width + graph.margin.left + graph.margin.right)
        .attr('height', graph.height + graph.margin.top + graph.margin.bottom)
        .call(d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoomHandler))
    	.append("g");

    function zoomHandler() {
    	graph.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    
    graph.svg.append('defs').selectAll('marker')
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

    var glow = graph.svg.append('filter')
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

    graph.activitiesSelector.buildLegend();

    graph.line = graph.svg.append('g').selectAll('.link')
        .data(graph.force.links())
        .enter().append('path')
        .attr('class', 'link');

    graph.draggedThreshold = d3.scale.linear()
        .domain([0, 0.1])
        .range([5, 20])
        .clamp(true);

    function dragged(d) {
        var threshold = graph.draggedThreshold(graph.force.alpha()),
            dx = d.oldX - d.px,
            dy = d.oldY - d.py;
        if (Math.abs(dx) >= threshold || Math.abs(dy) >= threshold) {
            d.dragged = true;
        }
        return d.dragged;
    }

    graph.drag = d3.behavior.drag()
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

    graph.node = graph.svg.selectAll('.node')
        .data(graph.force.nodes())
        .enter().append('g')
        .attr('class', function (d){ return d.type + " node"}) 
        .on('mouseover', function(d) {
            if (!selected.obj && d.type != 'starter') {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                highlightObject(d);
            }
        })
        .on('mouseout', function() {
            if (!selected.obj) {
                if (graph.mouseoutTimeout) {
                    clearTimeout(graph.mouseoutTimeout);
                    graph.mouseoutTimeout = null;
                }
                graph.mouseoutTimeout = setTimeout(function() {
                    highlightObject(null);
                }, 300);
            }
        });
    

    graph.node.each(function(d) {
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
        graph.node.each(function(d) {
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

            var padding = config.graph.labelPadding,
                margin = config.graph.labelMargin,
                oldWidth = bounds.x2 - bounds.x1;

            bounds.x1 -= oldWidth / 2;
            bounds.x2 -= oldWidth / 2;

            bounds.x1 -= padding.left;
            bounds.y1 -= padding.top;
            bounds.x2 += padding.left + padding.right;
            bounds.y2 += padding.top + padding.bottom;

            var rect = node.select('rect');
            
            if (d.type != 'starter'){
            	rect.attr('x', bounds.x1)
	                .attr('y', bounds.y1)
	                .attr('width', bounds.x2 - bounds.x1)
	            	.attr('height', bounds.y2 - bounds.y1);
            } else {
            	rect.attr('x', -20)
                	.attr('y', -23);
            }

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

        graph.numTicks = 0;
        graph.preventCollisions = false;
        
        
        graph.force.start();
        for (var i = 0; i < config.graph.ticksWithoutCollisions; i++) {
            graph.force.tick();
        }
        graph.preventCollisions = true;
        $('#graph-container').css('visibility', 'visible');
    });
}

function drowObjectBackground(node){
	var data = node.data()[0];
	if (data.type == 'starter') {
		node.append('rect')
			.attr('rx', 20)
			.attr('ry', 20)
			.attr('stroke', function(d) {
				return graph.strokeColor(d.type);
			})
			 .attr('fill', function(d) {
			     return graph.fillColor(d.type);
			 })
			.attr('width', 40)
			.attr('height', 40);
	 
	
	} else if (data.type == 'end') {
		node.append('rect')
			.attr('rx', 20)
			.attr('ry', 20)
			.attr('stroke', function(d) {
				return graph.strokeColor(d.type);
			})
			 .attr('fill', function(d) {
			     return graph.fillColor(d.type);
			 })
			.attr('width', 40)
			.attr('height', 40);
	 

	} else {
		
		node.append('rect')
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('stroke', function(d) {
				return graph.strokeColor(d.type);
			})
			 .attr('fill', function(d) {
			     return graph.fillColor(d.type);
			 })
			 .attr('width', 120)
			 .attr('height', 30)
			 .on("click", function (d){
			 	selectObject(d, this);
			 });
		
	
	}
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
    var quadtree = d3.geom.quadtree(graph.nodeValues);

    for (var name in graph.activities) {
        var obj = graph.activities[name],
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
    graph.numTicks++;

    for (var name in graph.activities) {
        var obj = graph.activities[name];
    }

    if (graph.preventCollisions) {
        preventCollisions();
    }

    graph.line
    	.attr('d', function (d){
    		var dx = d.target.x - d.source.x,
    	      dy = d.target.y - d.source.y,
    	      dr = Math.sqrt(dx * dx + dy * dy);
    		var adjustTargetY = ((d.target.y > d.source.y) ? -1 : 1) * (17/2);
    		
    		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,0 " + d.target.x + "," + (d.target.y + adjustTargetY) ;
    	});

    graph.node
        .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
}

function selectObject(obj, el) {
    var node;
    if (el) {
        node = d3.select(el);
    } else {
        graph.node.each(function(d) {
            if (d === obj) {
                node = d3.select(el = this);
            }
        });
    }
    if (!node) return;

    if (node.classed('selected')) {
        deselectObject();
        return;
    }
    deselectObject(false);

    selected = {
        obj: obj,
        el: el
    };

    highlightObject(obj);

    node.classed('selected', true);
    $('#docs').html(obj.docs).prev().click();
    $('#docs-container').scrollTop(0);
    resize(true);

    var $graph = $('#graph-container'),
        nodeRect = {
            left: obj.x + obj.extent.left + graph.margin.left,
            top: obj.y + obj.extent.top + graph.margin.top,
            width: obj.extent.right - obj.extent.left,
            height: obj.extent.bottom - obj.extent.top
        },
        graphRect = {
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
    graph.node.classed('selected', false);
    selected = {};
    highlightObject(null);
}

function highlightObject(obj) {
    if (obj) {
        if (obj !== highlighted) {
            graph.node.classed('inactive', function(d) {
            	return (obj !== d && d.next.indexOf(obj.name) == -1 && d.previous.indexOf(obj.name) == -1);
            });
            graph.line.classed('inactive', function(d) {
                return (obj !== d.source && obj !== d.target);
            });
        }
        highlighted = obj;
    } else {
        if (highlighted) {
            graph.node.classed('inactive', false);
            graph.line.classed('inactive', false);
        }
        highlighted = null;
    }
}

var showingDocs = false,
    docsClosePadding = 8,
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
  //  $graph.css('height', graphHeight + 'px');
}
