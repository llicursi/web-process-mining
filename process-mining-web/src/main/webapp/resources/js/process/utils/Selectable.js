var Selectable = function() {
    
    var select = function(selection) {
        var lastSelected = null;
        selection.on("click", function(d) {
            var node = d3.select(this);
            var selected = !node.classed("selected");
            
            if (d3.event.ctrlKey && d3.event.shiftKey) {
                if (selected) {
                    lastSelected = lastSelected || d;
                    getrange.call(this, d, lastSelected).classed("selected", true);
                } else {
                    node.classed("selected", selected);
                    lastSelected = lastSelected==d ? null : lastSelected;
                }
            } else if (d3.event.ctrlKey) {
                node.classed("selected", selected);
                if (selected) {
                    lastSelected = d;
                } else if (lastSelected==d) {
                    lastSelected = null;
                }
            } else if (d3.event.shiftKey) {
                selection.classed("selected", false);
                lastSelected = lastSelected || d;
                getrange.call(this, d, lastSelected).classed("selected", true);
            } else {
            	selection.each(function (d) {
            		d.binded.selected = false;
            		d.binded.className = d.binded.className.replace("act-selected");
            	});
                if (selection.filter(".selected")[0].length==1) {
                    selection.classed("selected", false);
                    node.classed("selected", selected);
                    lastSelected = selected ? d : null;
                } else {
                    selection.classed("selected", false);
                    node.classed("selected", true);
                    lastSelected = d;
                }
                
            }
            d.binded.selected = selected;
            d3.select(d.binded).classed("act-selected", selected);
            onSelect();
        });
        
        // Add the Ctrl-A behavior
        var attach = this;
        d3.select("body").on("keyup", function(d) {
            if (d3.event.ctrlKey && d3.event.keyCode==65) {
                var allSelected = selection.filter(function(d) {
                    return !d3.select(this).classed("selected");
                }).empty();
                selection.classed("selected", !allSelected);
                onSelect();
            }
        });
    };
    
    select.fireOnSelect = function (){
    	onSelect();
    };

    var getrange = function(a, b) { return [a, b]; };
    var onSelect = function() {};
    
    select.getrange = function(_) { if (arguments.length==0) return getrange; getrange = _; return select; };
    select.on = function(event, _) { 
        if (event!="select") return;
        if (_==null) return onSelect;
        onSelect = _;
        return select;
    };
    
    return select;
};