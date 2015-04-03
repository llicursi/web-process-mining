
ActivitiesSelector = function (graph){
	
	var _graph = graph;
	var _activities = {};
	var _activitiesKeys = undefined;
	
	function init(){
	    for (var name in _graph.data) {
	        var obj = _graph.data[name],
	            key = obj.type + ':' + (obj.group || ''),
	            cat = _activities[key];

	        obj.activityKey = key;
	        if (!cat) {
	            cat = _activities[key] = {
	                key: key,
	                type: obj.type,
	                typeName: (config.types[obj.type] ? config.types[obj.type].short : obj.type),
	                group: obj.group,
	                count: 0
	            };
	        }
	        cat.count++;
	    }
	    _activitiesKeys = d3.keys(_activities);
	}
	init();
	
	this.buildLegend = function(){
		var activities = d3.select("#list-activities")
	    	.attr("class", "list-activities")
	        .selectAll('.category')
	        .data(d3.values(_activities))
	        .enter().append('li')
	        .on('click', function (d, e, o){
	        	debugger;
	        })
	        .attr('class', 'activity')
		    .text(function(d) {
		        return d.typeName + (d.group ? ': ' + d.group : '');
		    });
		
		activities.append('span')
	        .attr('class', "color-activity")
	        .attr('style', function(d) {
	            return "background-color: " + graph.fillColor(d.key) + " ; border: 1px solid " + graph.strokeColor(d.key);
	        });
	};
	
	this.keys = _activitiesKeys;

};