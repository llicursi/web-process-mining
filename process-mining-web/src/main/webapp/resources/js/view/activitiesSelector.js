
ActivitiesSelector = function (graph){
	
	var _graph = graph;
	var _activities = {};
	var _activitiesKeys = undefined;
	
	function init(){
		_activities = _graph.rawNodes;
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
	        	/*debugger;*/
	        })
	        .attr('class', 'activity')
		    .text(function(d) {
		        return d.name ;
		    });
		
		activities.append('span')
	        .attr('class', "color-activity")
	        .attr('style', function(d) {
	            return "background-color: " + graph.fillColor(d.type) + " ; border: 1px solid " + graph.strokeColor(d.type);
	        });
	};
	
	this.keys = _activitiesKeys;

};