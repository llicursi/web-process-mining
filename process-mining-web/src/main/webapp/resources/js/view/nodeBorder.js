NodeBorder = function (obj, count){

	var _attr = obj;
	this.type = obj.type;
	
	this.y = obj.type == 'START' ? 20 : 400;
	this.x = 400;
	this.weight = 1.1;
	this.name = _attr.name;
	this.fixed = true;
	
	this.strength = function (d){
		return (_attr.strength || 0.1);
	};
	
	this.computeRect = function(node, bounds){
		var rect = node.select("rect");
		rect.attr('x', -20)
    		.attr('y', -23);
	};
	
	this.draw = function(node, strokeColor, fillColor){
		return node.append('rect')
					.attr('rx', 20)
					.attr('ry', 20)
					.attr('width', 40)
					.attr('height', 40);
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