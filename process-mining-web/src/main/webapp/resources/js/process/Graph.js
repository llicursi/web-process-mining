/*
 * This file contains the prototypes for Graph and Node
 */

var Node = function(id, type) {
    // Save the arguments
    this.id = id;
    this.type = type;
    var colors;
    if (type = Node.types.activity){
    	colors = colorbrewer.PuBu[9];
    } else {
    	colors = colorbrewer.PRGn[9];
    }
    
    // Default values for internal variables
    this.never_visible        = false;
    this.hidden               = false;
    this.child_nodes          = {}; // The immediate child nodes in the graph, regardless of visibility
    this.parent_nodes         = {}; // The immediate parent nodes in the graph, regardless of visibility
    this.childCount 		  = 0;
    
    function getColorScale(color, scale){
    	return d3.hsl(color).darker(darkness).toString();
    }
};

Node.prototype.visible = function(_) {
    if (arguments.length==0) return (!this.never_visible && !this.hidden);
    this.hidden = !_;
    return this;
};

Node.prototype.addChild = function(child) {
	this.childCount ++;
    this.child_nodes[child.id] = child;
};

Node.prototype.addParent = function(parent) {
    this.parent_nodes[parent.id] = parent;
};

Node.prototype.removeChild = function(child) {
    if (child.id in this.child_nodes) {
    	delete this.child_nodes[child.id];
    	this.childCount --;
    }
};

Node.prototype.removeParent = function(parent) {
    if (parent.id in this.parent_nodes) delete this.parent_nodes[parent.id];
};


Node.prototype.getParents = function() {
    return values(this.parent_nodes);
};

Node.prototype.getChildren = function() {
    return values(this.child_nodes);
};

Node.prototype.getVisibleParents = function() {   
    var visible_parent_map = {};
   
    var explore_node = function(node) {
        if (visible_parent_map[node.id]) {
            return;
        }
        visible_parent_map[node.id] = {};
        var parents = node.parent_nodes;
        for (var pid in parents) {
            var parent = parents[pid];
            if (parent.visible()) {
                visible_parent_map[node.id][pid] = parent;
            } else {
                explore_node(parent);
                var grandparents = visible_parent_map[pid];
                for (var gpid in grandparents) {
                    visible_parent_map[node.id][gpid] = grandparents[gpid];
                }
            }
        }
    };
    
    explore_node(this);
    
    return values(visible_parent_map[this.id]);
};

Node.prototype.getVisibleChildren = function() {
    var visible_children_map = {};
    
    var explore_node = function(node) {
        if (visible_children_map[node.id]) {
            return;
        }
        visible_children_map[node.id] = {};
        var children = node.child_nodes;
        for (var pid in children) {
            var child = children[pid];
            if (child.visible()) {
                visible_children_map[node.id][pid] = child;
            } else {
                explore_node(child);
                var grandchildren = visible_children_map[pid];
                for (var gcid in grandchildren) {
                    visible_children_map[node.id][gcid] = grandchildren[gcid];
                }
            }
        }
    };
    
    explore_node(this);
    
    return values(visible_children_map[this.id]);
};

Node.prototype.draw = function(d3D){
	if (this.type == Node.types.activity){
		var rect = d3D.select('rect'), 
     	    text = d3D.select('text');
		var node_bbox = {"height": 40, "width": 120};
		var text_bbox = {"height": 30, "width": 120};
        rect.attr("x", -node_bbox.width/2)
        	.attr("y", -node_bbox.height/2)
        	.attr("rx", 4)
        	.attr("ry", 4)
        	.attr("width", node_bbox.width)
        	.attr("height", node_bbox.height);
        text.attr("x", -text_bbox.width/2).attr("y", -text_bbox.height/2);
	} else if (this.type == Node.types.end || this.type == Node.types.start){
		var text = d3D.select('text');
			text.remove();
		var rect = d3D.select('rect');
		var node_bbox = {"height": 40, "width": 40};
        rect.attr("x", -node_bbox.width/2)
        	.attr("y", -node_bbox.height/2)
        	.attr("width", node_bbox.width)
        	.attr("height", node_bbox.height)
        	.attr("rx", 20)
        	.attr("ry", 20)
        	.classed("node-"+ this.type.toLowerCase().replace("_", "-"), true);
	}
};

Node.types = {
	activity : "ACTIVITY",
	end : "END_EVENT",
	start : "START_EVENT",
	
};

var Graph = function(importedData) {
    // Default values for internal variables
    this.nodelist = [];
    this.nodes = {};
    this.edges = [];
    this._importedData = importedData;

};

Graph.prototype.addNode = function(node) {
    this.nodelist.push(node);
    this.nodes[node.id] = node;
};

Graph.prototype.getNode = function(id) {
    return this.nodes[id];
};

Graph.prototype.getNodes = function() {
    return this.nodelist;
};

Graph.prototype.getVisibleNodes = function() {
    return this.nodelist.filter(function(node) { 
    	return node.visible(); 
    });
};

Graph.prototype.getColorByDelay = function (ref, interval){

	var maiores = [1.4, 1.96, 2.744, 3.8416];
	var menores = [0.7, 0.49, 0.343, 0.2401];
	
	var criteria = interval/this.edges[ref].avgTime;
	var index = 4;
	if (criteria <= 1){
		for (var i = menores.length-1, f=8; i >= 0; i--, f--){
			if (criteria < menores[i]){
				index = f;
				break;
			}
		}
	} else {
		for (var i = maiores.length-1, f=3; i >= 0; i--, f--){
			if (criteria > maiores[i]){
				index = f;
				break;
			}
		}
	}
	if (index > 8 || index < 0){
		/*debugger;*/
	}
	var colors = {
		fill : colorbrewer.RdYlGn[9][index]
	};
	
	return colors;
	
}

Graph.prototype.updateEdges = function(d3Paths){
	var edges = {};
	
	d3Paths.each(function (data){
		if (!data){
			return false;
		}
		var path = d3.select(this);
		var d = path.attr("d");
		var dParts = d.split("C");
		var ML = dParts[0];
		// Recover the MOVETO with the lineto
		var MLs = ML.split("L");
		var Ms = MLs[0].split(",");
		var Ls = MLs[1].split(",");
		
		paths = [];
		paths.push({
			type : 'line',
			points : {
				x0 : parseFloat(Ms[0].substr(1)),
				y0 : parseFloat(Ms[1]),
				x1 : parseFloat(Ls[0]),
				y1 : parseFloat(Ls[1])
			}
		});
		
		// Recover the CURVETOS (n - 1)
		for (var i = 1; i < dParts.length -1 ; i++){
			var part = dParts[i].split(",");
			paths.push({
				type : 'bezier',
				points : {
					x0 : paths[i-1].points.x1,
					y0 : paths[i-1].points.y1,
					dx0:parseFloat(part[0]),
					dy0:parseFloat(part[1]),
					dx1:parseFloat(part[2]),
					dy1:parseFloat(part[3]),
					x1:parseFloat(part[4]),
					y1:parseFloat(part[5])
				}
			});
		}
		
		var middlepoint = { 
			x : paths[paths.length -1].points.x0,
			y : paths[paths.length -1].points.y0
		};
		
		var lastPart = dParts[dParts.length -1].split("L");
		
		// Recover the last CURVETOS
		var part = lastPart[0].split(",");
		paths.push({
			type : 'bezier',
			points : {
				x0: paths[paths.length-1].points.x1,
				y0: paths[paths.length-1].points.y1,
				dx0:parseFloat(part[0]),
				dy0:parseFloat(part[1]),
				dx1:parseFloat(part[2]),
				dy1:parseFloat(part[3]),
				x1:parseFloat(part[4]),
				y1:parseFloat(part[5])
			}
		});
		
		// Recover the last LINETO 
		var Ls = lastPart[1].split(",");
		paths.push({
			type : 'line',
			points : {
				x0 : paths[paths.length-1].points.x1,
				y0 : paths[paths.length-1].points.y1,
				x1 : parseFloat(Ls[0]),
				y1 : parseFloat(Ls[1])
			}
		});
		
		data.paths = paths; 
		data.middle = middlepoint;
		computePathIntervals(data);
		edges[data.ref] = data;
		
	});
	
	this.edges = edges;
};

function computePathIntervals(data){
	var dx = data.paths[data.paths.length -1].points.x1 - data.paths[0].points.x0;
	dx = ((dx < 0) ? -1 : 1) * dx;
	
	var dy = data.paths[data.paths.length -1].points.y1 - data.paths[0].points.y0;
	dy = ((dy < 0) ? -1 : 1) * dy;
	
	var propx = 0.0;
	var propy = 0.0;
	
	for (var i = 0; i < data.paths.length; i++){
		var path = data.paths[i];
		var points = path.points;

		path.dxSignal = (points.x1 < points.x0 ? -1 : 1);
		path.dx = (points.x1 - points.x0) * (points.x1 < points.x0 ? -1 : 1);
		propx += (dx == 0 ? dx : path.dx/dx);
		path.deltaX = propx.toFixed(2);
		
		path.dySignal = (points.y1 < points.y0 ? -1 : 1);
		path.dy = (points.y1 - points.y0) * (points.y1 < points.y0 ? -1 : 1);
		propy += (dy == 0 ? dy : path.dy/dy);
		path.deltaY = propy.toFixed(2);
	}
	
	data.dx = dx;
	data.dy = dy;
}

Graph.prototype.getVisibleLinks = function() {
    var visible_parent_map = {};
    var explore_node = function(node) {
        if (visible_parent_map[node.id]) {
            return;
        }
        visible_parent_map[node.id] = {};
        var parents = node.parent_nodes;
        for (var pid in parents) {
            var parent = parents[pid];
            if (parent.visible()) {
                visible_parent_map[node.id][pid] = true;
            } else {
                explore_node(parent);
                var grandparents = visible_parent_map[pid];
                for (var gpid in grandparents) {
                    visible_parent_map[node.id][gpid] = true;
                }
            }
        }
    };
    
    for (var i = 0; i < this.nodelist.length; i++) {
        explore_node(this.nodelist[i]);
    }
    
    
    var nodes = this.nodes;
    var ret = [];
    var arcs = this._importedData.arcs;
    var details = this._importedData.details;
    var visible_nodes = this.getVisibleNodes();
    for (var i = 0; i < visible_nodes.length; i++) {
        var node = visible_nodes[i];
        var parentids = visible_parent_map[node.id];
        // Bind the data to arc and compute Strength
        Object.keys(parentids).forEach(function(pid) {
        	var ref = getRef(nodes[pid],node);
        	var arc = arcs[ref];
            ret.push(constructEdge(ref, nodes[pid], node, arc, details));
        });
    }
    this.edges = ret;
    return ret;
};

/*
 * The functions below are just simple utility functions
 */

function constructEdge(ref, nodeStart, nodeEnd, arc, details){
	var edgeN =	{
		ref: ref ,
		source: nodeStart, 
		target: nodeEnd, 
		label : ref, 
	};
	
	if (arc){
	
		edgeN.count = arc.count;
		edgeN.avgTime = parseInt((arc.sumTime/ arc.count).toFixed(0));
		
		if (nodeStart.type == 'ACTIVITY' && nodeStart.datum.type == 'END'){
			arc.count = nodeStart.datum.count;
		} else if (nodeEnd.type == 'ACTIVITY' && nodeEnd.datum.type == 'START'){
			arc.count = nodeEnd.datum.count;
		}
		
		// Measure strength
		var strength = (nodeStart.datum.count > 0 ) ? arc.count / (nodeStart.datum.count/nodeStart.childCount) : 0;
		edgeN.freq = strength;
		edgeN.frequency = getEdgeStroke(strength);
		edgeN.delay = getEdgeStrokeByTime(edgeN.avgTime, details.averageTime/details.activitiesCount);
	} else {
		
		edgeN.count = nodeStart.datum.count;
		edgeN.frequency = getEdgeStroke(1);
		edgeN.avgTime = 1;
		edgeN.strokeWidth = 3;
	}
	
	return edgeN;
}


function getEdgeStroke(dependencyMeasure){
	var d = parseFloat(dependencyMeasure);
	var index = 5;
	 if (d > 0 && d <= 0.25){
		index = 2;
	} else if (d > 0.25 && d <= 0.45){
		index = 2;
	} else if (d > 0.45 && d <= 0.85){
		index = 4;
	} else if (d >= 1.15 && d < 1.55){
		index = 6;
	} else if (d >= 1.55 && d < 1.75){
		index = 7;
	} else if (d >= 1.75 && d < 1.85){
		index = 8;
	} else if (d >= 1.85){
		index = 9;
	} 
	
	return colorbrewer.PuBu[9][index-1];
}

function getEdgeStrokeByTime(edgeTime, timePerAct){
	var d = (edgeTime/timePerAct)
	var index = 1;
	if (d < 1.1){
		index = 1;
	} else if (d < 1.3){
		index = 2;
	} else if (d < 1.3){
		index = 3;
	} else if (d < 1.7){
		index = 4;
	} else if (d < 2.5){
		index = 5;
	} else if (d < 3){
		index = 6;
	} else if (d < 3.7){
		index = 7;
	}
	return colorbrewer.YlOrRd[9][index];
}

function getNodesBetween(a, b) {
    // Returns a list containing all the nodes between a and b, including a and b
    var between = {};
    var nodesBetween = [a, b];
    var get = function(p) {
        if (between[p.id] == null) {
            if (p==b) {
                nodesBetween.push(p);
                between[p.id] = true;
            } else if (p.getParents().map(get).indexOf(true)!=-1) {
                nodesBetween.push(p);
                between[p.id] = true;
            } else {
                between[p.id] = false;
            }
        }
        return between[p.id];
    };
    get(a);
    return nodesBetween;
}

function getEntirePathNodes(center) {
    // Returns a list containing all edges leading into or from the center node
    var visible_parent_map = {};
    var visible_child_map = {};
    var nodes = {};
    
    var explore_parents = function(node) {
        if (visible_parent_map[node.id]) {
            return;
        }
        visible_parent_map[node.id] = {};
        nodes[node.id] = node;
        var parents = node.parent_nodes;
        for (var pid in parents) {
            var parent = parents[pid];
            if (parent.visible()) {
                visible_parent_map[node.id][pid] = true;
                explore_parents(parent);
            } else {
                explore_parents(parent);
                var grandparents = visible_parent_map[pid];
                for (var gpid in grandparents) {
                    visible_parent_map[node.id][gpid] = true;
                }
            }
        }
    };
    
    var explore_children = function(node) {
        if (visible_child_map[node.id]) {
            return;
        }
        visible_child_map[node.id] = {};
        nodes[node.id] = node;
        var children = node.child_nodes;
        for (var cid in children) {
            var child = children[cid];
            if (child.visible()) {
                visible_child_map[node.id][cid] = true;
                explore_children(child);
            } else {
                explore_children(child);
                var grandchildren = visible_child_map[cid];
                for (var gcid in grandchildren) {
                    visible_child_map[node.id][gcid] = true;
                }
            }
        }
    };
    
    explore_parents(center);
    explore_children(center);
    
    return values(nodes);
}

function getRef(source, target){
	return source.datum.uniqueLetter + ">" + target.datum.uniqueLetter;
}

function getEntirePathLinks(center) {
    // Returns a list containing all edges leading into or from the center node
    var visible_parent_map = {};
    var visible_child_map = {};
    var nodes = {};
    
    var explore_parents = function(node) {
        if (visible_parent_map[node.id]) {
            return;
        }
        visible_parent_map[node.id] = {};
        nodes[node.id] = node;
        var parents = node.parent_nodes;
        for (var pid in parents) {
            var parent = parents[pid];
            if (parent.visible()) {
                visible_parent_map[node.id][pid] = true;
                explore_parents(parent);
            } else {
                explore_parents(parent);
                var grandparents = visible_parent_map[pid];
                for (var gpid in grandparents) {
                    visible_parent_map[node.id][gpid] = true;
                }
            }
        }
    };
    
    var explore_children = function(node) {
        if (visible_child_map[node.id]) {
            return;
        }
        visible_child_map[node.id] = {};
        nodes[node.id] = node;
        var children = node.child_nodes;
        for (var cid in children) {
            var child = children[cid];
            if (child.visible()) {
                visible_child_map[node.id][cid] = true;
                explore_children(child);
            } else {
                explore_children(child);
                var grandchildren = visible_child_map[cid];
                for (var gcid in grandchildren) {
                    visible_child_map[node.id][gcid] = true;
                }
            }
        }
    };
    
    explore_parents(center);
    explore_children(center);
    
    var path = [];

    for (var targetid in visible_parent_map) {
        var target = nodes[targetid];
        var sourceids = visible_parent_map[targetid];
        for (var sourceid in sourceids) {
            var source = nodes[sourceid];
            path.push({ref: getRef(source, target),source: source, target: target});
        }
    }
    
    for (var sourceid in visible_child_map) {
        var source = nodes[sourceid];
        var targetids = visible_child_map[sourceid];
        for (var targetid in targetids) {
            var target = nodes[targetid];
            path.push({ref: getRef(source, target) ,source: source, target: target, label: getRef(source, target)});
        }
    }

    return path;
}

function values(obj) {
    return Object.keys(obj).map(function(key) { return obj[key]; });
}

function flatten(arrays) {
    var flattened = [];
    return flattened.concat.apply(flattened, arrays);
}