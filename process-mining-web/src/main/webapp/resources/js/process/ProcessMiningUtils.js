
// Problems with resizing and jquery and chrome and this stuff is so dumb.
window.width = function() {
	return document.body.clientWidth;
};

window.height = function() {
	return document.body.clientHeight;
};

// http://stackoverflow.com/questions/523266/how-can-i-get-a-specific-parameter-from-location-search
var getParameter = function(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return results[1];
};

var getParameters = function() {
    if (window.location.href.indexOf("?")==-1) return {};
    var param_strs = window.location.href.substr(window.location.href.indexOf("?")+1).split("&");
    var params = {};
    param_strs.forEach(function(str) {
        splits = str.split("=");
        if (splits.length==2) {
            params[splits[0]] = splits[1];
        }
    });
    return params;
};

var getNodes = function(ids_str, callback, errback) {
    // Batches report requests
    if (ids_str==null) {
        errback("No IDs specified");
    }

    var i = 0;
    var batch_size = 20;
    ids = ids_str.split(",");
    
    json_ids = [];
    regular_ids = [];
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (id.indexOf(".json")!=-1) {
            json_ids.push(id);
        } else {
            regular_ids.push(id);
        }
    }
    
    var results = [];
    var jsondone = false, batchdone = false;
    var batch_callback = function(json) {
        results = results.concat(json);
        i++;
        if (regular_ids.length == 0) {
            batchdone = true;
            if (jsondone && batchdone) callback(results);
        } else {
            next_request_ids = regular_ids.splice(0, batch_size);
            console.info("Retrieving batch "+i+":", next_request_ids);
            getAllNodes(next_request_ids.join(), batch_callback, errback);
        }
    };
    
    var json_fecthing_id = null;
    var json_batch_callback = function(json) {
        if (json.length==1) json[0].id = json_fecthing_id;
        results = results.concat(json);
        if (json_ids.length == 0) {
            jsondone = true;   
            if (jsondone && batchdone) callback(results);
        } else {
            json_fecthing_id = json_ids.splice(0, 1);
            d3.json(json_fecthing_id, json_batch_callback);
            console.info("Retrieving JSON file " + id);
        }
    };
    
    batch_callback([]);
    json_batch_callback([]);
};

var getAllNodes = function(ids, callback, errback) {
    var report_url = "nodes/" + ids;
    
    var xhr = new XMLHttpRequest();
    
    xhr.open("GET", report_url, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            if (xhr.status = 200) {
                var json = JSON.parse(xhr.responseText);
                json.forEach(function(trace) { sanitizeNodes(trace.activities); });
                callback(json);
            } else {
                errback(xhr.status, xhr);
            }
        }
    };
    
    xhr.send(null);    
};

function getRelated(ids, callback, errback) {
    var overlapping_url = "overlapping/" + ids;
    
    var xhr = new XMLHttpRequest();
    
    xhr.open("GET", overlapping_url, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            if (xhr.status = 200) {
            	try {
	                var json = JSON.parse(xhr.responseText);
	                callback(json);
            	} catch (e) {
            		errback(e);
            	}
            } else {
            	errback(xhr);
            }
        }
    };
    
    xhr.send(null);    
};

function getTags(ids, callback, errback) {
    var tags_url = "tags/" + ids;
    
    var xhr = new XMLHttpRequest();
    
    xhr.open("GET", tags_url, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            if (xhr.status = 200) {
            	try {
	                var json = JSON.parse(xhr.responseText);
	                callback(json);
            	} catch (e) {
            		errback(e);
            	}
            } else {
            	errback(xhr);
            }
        }
    };
    
    xhr.send(null);    
}

function getGCNodes(ids, callback, errback) {
	var gcNodesReceivedCallback = function(data) {
		var GCNodesByProcess = {};
		for (var i = 0; i < data.length; i++) {
			var activities = data[i].activities;
			for (var j = 0; j < activities.length; j++) {
				var report = activities[j];
				if (report["Operation"] && report["Operation"][0]=="GC") {
					var processID = report["ProcessID"][0];
					if (!GCNodesByProcess[processID])
						GCNodesByProcess[processID] = [report];
					else
						GCNodesByProcess[processID].push(report);
				}
			}
		}
		callback(GCNodesByProcess);
	};
	var tagsReceivedCallback = function(tagdata) {
		var GCTasks = [];
		for (var taskid in tagdata) {
			var tags = tagdata[taskid];
			if (tags.indexOf("GC")!=-1) {
				GCTasks.push(taskid);
			}
		}
		if (GCTasks.length > 0) {
			getNodes(GCTasks.join(","), gcNodesReceivedCallback, errback);
		} else {
			callback({});
		}
	};
	var relatedIDsReceivedCallback = function(ids) {
		console.log("Searching for GC data in ids: " + ids.join(','));
		getTags(ids.join(','), tagsReceivedCallback, errback);
	};
	getRelated(ids, relatedIDsReceivedCallback, errback);
}

var sanitizeNodes = function(activities) {
    var i = 0;
    while (i < activities.length) {
        var datum = activities[i];
        if (!datum.hasOwnProperty("name") || !datum.hasOwnProperty("Edge")
                || !datum["name"].length > 0 || !datum["Edge"].hasOwnProperty("length")) {
            activities.splice(i, 1);
            console.warn("Got a bad report:", report);
        } else {
            i++;
        }
    }
    return activities;    
};

var createGraphFromNodes = function(data) {
    // Create nodes
    console.info("Creating graph nodes");
    var nodes = {};
    for (var nodeid in data.activities) {
        var datum = data.activities[nodeid];
        var id = nodeid;
        nodes[id] = new Node(id, Node.types.activity);
        nodes[id].datum = datum;
        nodes[id].freq = datum.count/ data.details.totalCases;
    }
    
    for (var nodeid in data.borderEvents) {
        var datum = data.borderEvents[nodeid];
        // Adjust the borderevents count based on the concurrent activities
        if (datum.type == 'START'){
        	datum.count = nodes[datum.next[0]].datum.count;
        } else if (datum.type == 'END'){
        	datum.count = nodes[datum.previous[0]].datum.count;
        }

        
        var id = nodeid;
        nodes[id] = new Node(id, (datum.type == 'START') ? Node.types.start : Node.types.end);
        nodes[id].datum = datum;
        nodes[id].datum.uniqueLetter = nodes[id].datum.ref;
        
    }
    
    // Second link the nodes together
    console.info("Linking graph nodes");
    for (var nodeid in nodes) {
        var node = nodes[nodeid];
        node.datum["previous"].forEach(function(parentid) {
            if (nodes[parentid]) {
                nodes[parentid].addChild(node);
                node.addParent(nodes[parentid]);
            }
        });
    }
    
    // Create the graph and add the nodes
    var graph = new Graph(data);
    for (var id in nodes) {
        graph.addNode(nodes[id]);
    }
    
    return graph;
};

var createJSONFromVisibleGraph = function(graph) {
    var nodes = graph.getVisibleNodes();
    var activities = [];
    
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var parents = node.getVisibleParents();
        var datum = $.extend({}, node.datum);
        datum["Edge"] = [];
        for (var j = 0; j < parents.length; j++) {
            datum["Edge"].push(parents[j].id);
        }
        activities.push(datum);
    }
    
    return {"activities": activities};
};


//Javascript impl of java's string hashcode:
//http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hashCode = function(){
 var hash = 0, i, char;
 if (this.length == 0) return hash;
 for (i = 0; i < this.length; i++) {
     char = this.charCodeAt(i);
     hash = ((hash<<5)-hash)+char;
     hash = hash & hash; // Convert to 32bit integer
 }
 return hash;
};

function hash_report(report) {
 hash = 0;
 if (report["Agent"]) hash += ("Agent:"+report["Agent"][0]).hashCode();
 if (report["Label"]) hash += ("Label:"+report["Label"][0]).hashCode();
 if (report["Class"]) hash += ("Class:"+report["Class"][0]).hashCode();
 return hash & hash;
}

var filter_yarnchild_nodes = function(activities) {
    // First, get the process IDs for the yarnchild nodes
    var yarnchild_process_ids = {};
    for (var i = 0; i < activities.length; i++) {
        var report = activities[i];
        if (report.hasOwnProperty("Agent") && (report["Agent"][0]=="YarnChild" || report["Agent"][0]=="Hadoop Job")) {
            yarnchild_process_ids[report["ProcessID"][0]] = true;
        }
    }
    
    // A function to decide whether a report stays or goes
    var filter = function(report) {
        return yarnchild_process_ids[report["ProcessID"][0]] ? false : true;
    };
    
    return filter_nodes(activities, filter);
};

var filter_merge_nodes = function(activities) {
    var filter = function(report) {
        return report["Operation"] && report["Operation"][0]=="merge";
    };
    
    return filter_nodes(activities, filter);
};

var filter_agent_nodes = function(activities, agent) {
    var filter = function(datum) {
        return datum["Agent"] && datum["Agent"][0]==agent;
    };
    
    return filter_nodes(activities, filter);
};


var filter_nodes = function(activities, f) {    
    // Figure out which nodes have to be removed
    var retained = {};
    var removed = {};
    var datumMap = {};
    for (var i = 0; i < activities.length; i++) {
        var datum = activities[i];
        var id = datum["name"];
        datumMap[id] = datum;
        if (f(datum)) {
            removed[id]=datum;
        } else {
            retained[id]=datum;
        }
    }

    var remapped = {};
    var num_calculated = 0;
    var remap_parents = function(id) {
        if (remapped[id]) {
            return;
        } else {
            var datum = datumMap[id];
            var parents = datum["Edge"];
            var newparents = {};
            for (var i = 0; i < parents.length; i++) {
                if (removed[parents[i]]) {
                    remap_parents(parents[i]);
                    datumMap[parents[i]]["Edge"].forEach(function(grandparent) {
                        newparents[grandparent] = true;
                    });
                } else {
                    newparents[parents[i]] = true;
                }
            }
            datum["Edge"] = Object.keys(newparents);
            remapped[id] = true;
        }
    };
    
    return Object.keys(retained).map(function(id) {
        remap_parents(id);
        return retained[id];
    });
};


var kernelgraph_for_trace = function(trace) {
    return KernelGraph.fromJSON(trace);
};

var yarnchild_kernelgraph_for_trace = function(trace) {
    trace.activities = filter_yarnchild_nodes(trace.activities);
    trace.activities = filter_merge_nodes(trace.activities);
    return kernelgraph_for_trace(trace);
};

var datum_id = function(datum) {
	return datum.name;
};

var critical_path = function(activities, finalDatum) {
	if (finalDatum==null){
		finalDatum = activities[activities.length-1];
	}
	
	var datumMap = {};
	for (var i = 0; i < activities.length; i++) {
		datumMap[datum_id(activities[i])] = activities[i];
	}
	console.log(datumMap);
	
	var cpath = [];
	var next = finalDatum;
	while (next && next["Edge"]) {
		cpath.push(next);
		var parents = next["Edge"];
		next = datumMap[parents[0]];
		for (var i = 1; next==null && i < parents.length; i++) {
			next = datumMap[parents[i]];
		}
		for (var i = 1; i < parents.length; i++) {
			var candidate = datumMap[parents[i]];
			if (datumMap[parents[i]] && Number(candidate.datum.avgTime) > Number(next.datum.avgTime)){
				next = candidate;
			}
		}
	}
	
	for (var i = 0; i < cpath.length; i++) {
		cpath[i].criticalpath = ["true"];
	}
	
	return cpath;
};