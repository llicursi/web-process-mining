NodeActivity = function (obj){

	this.type = "activity";
	
	var _attr = obj;
	var _self = this;
	this.x = 0;
	this.y = 0;
	this.weight = 0.2;
	this.name = _attr.name;
	
	this.strength = function (d){
		return (_attr.strength || 0.3);
	};
	
	this.computeRect = function(node, bounds){
		var rect = node.select("rect");
		_self.x = bounds.x1;
		_self.y = bounds.y1;
		rect.attr('x', bounds.x1)
	        .attr('y', bounds.y1)
	        .attr('width', bounds.x2 - bounds.x1)
	    	.attr('height', bounds.y2 - bounds.y1);
	};
	
	this.draw = function(node){
		return node.append('rect')
				 .attr('rx', 5)
				 .attr('ry', 5)
				 .attr('width', 120)
				 .attr('height', 30);
	};
	
	//	Controls dependencies
	var _next = _attr.next || [];
	var _prev = _attr.previous || [];
	
	this.addNext = function(next){
		if (_next.indexOf(next) < 0){
			_next.push(next);
		}
	};
	
	this.addPrev = function(prev){
		if (_prev.indexOf(prev) < 0){
			_prev.push(prev);
		}
	};
	
	this.next = _next;
	this.previous = _prev;
	
};