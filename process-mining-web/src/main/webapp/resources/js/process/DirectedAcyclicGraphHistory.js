DirectedAcyclicGraphHistory = function(placeholder, nodes) {
	
	var _nodes, _listActivities, _domList, _select;
	
	(function init(nodes, placeholder){
		
//		Set up node selection events
		_select = Selectable();
		
		_domList = getListDom(placeholder);
		_listActivities = {};
		
		for (var i = 0; i < nodes[0].length; i ++){
			var node = nodes[0][i];
			_domList.appendChild(createActivityLi(d3.select(node)));
			_listActivities[node.id] = node;
		}
		
		_nodes = nodes;
			
	})(nodes, placeholder);

	
	function getListDom(placeholder){
		var placeDom = document.getElementById(placeholder);
		var div = null;
		if (placeDom.children.length > 1){
			div = placeDom.children[1];
		} else {
			div = document.createElement("div");
			placeDom.appendChild(div);
			
		}
		div.className = "content";
		div.innerHTML = "<ul class=\"act-list\"></ul>";
		return placeDom.children[placeDom.children.length -1].children[0];
	}
	
	function createActivityLi(d3node){
		var node = d3node.datum();
		var li = document.createElement("li");
		li.className = "act-list-node act-type-" + node.type.toLowerCase();
		li.binded = d3node;
		
		// Create icon
		var icon = document.createElement("div");
		icon.className = "act-icon";
		li.appendChild(icon);
		
		// Create main name
		var name = document.createElement("span");
		name.className = "act-name";
		name.innerHTML = node.id;
		li.appendChild(name);
		
		// Create show/hide button
		var showHideButton = document.createElement("a");
		showHideButton.className = "act-hide";
		showHideButton.href = "javascript:;";
		showHideButton.onclick = showHide;
		showHideButton.innerHTML = "<span title=\"Hide node\" class=\"glyphicon glyphicon-eye-close\"></span><span class=\"glyphicon glyphicon-eye-open\"></span>";
		li.appendChild(showHideButton);
		
		// Circular bind
		node.binded = li;
		li.onclick = clickListItem; 
		
		_listActivities[node.id] = li;
		
		return li;
	}
	
	function clickListItem(){
		if (!this.isHidden){
			if (this.selected && this.selected == true){
				this.binded.classed("selected", false);
				this.selected = false;
				d3.select(this).classed("act-selected", false);
			} else {
				this.binded.classed("selected", true);
				this.selected = true;
				d3.select(this).classed("act-selected", true);
			}
			_select.fireOnSelect();
		}
	}
	
	function showHide(e){
		event.stopPropagation();
		var liAct = d3.select(this.parentNode);
		if (liAct.classed("act-hide")){
			showNode(liAct);
		} else {
			var nodes = [this.parentNode.binded.datum()];
			_hideNodes(nodes);
		}
	}
	
	function showNode(li){
		li.classed("act-hide", false);
		li[0][0].isHidden = false;
		var node = li[0][0].binded;
		node.datum().visible(true);
		var nodes = [node];
		fireEventOnChange(nodes, "show");
	}
	
	this.hideNodes = function (nodes){
		_hideNodes(nodes);
	}
	
	function _hideNodes(nodes){
		if (nodes == null || nodes.length == 0){
			return null;
		}
		
		for (var i = 0; i < nodes.length; i ++){
			nodes[i].visible(false);
			nodes[i].binded.isHidden = true;
			var node = d3.select(nodes[i].binded);
			node.classed("act-selected", false);
			node.classed("act-hide", true);
		}
		fireEventOnChange(nodes, "hide");
	}
	
	var onChangeEvent = null;
	this.onChange = function(callback){
		onChangeEvent = callback;
	};
	
	function fireEventOnChange(nodes){
		if (onChangeEvent != null && onChangeEvent !== undefined && typeof onChangeEvent == "function"){
			onChangeEvent(nodes);
		}
	}
	
	// SELECTION
	this.getRange = function(passed){
		_select.getrange(passed);
	};
	
	this.onSelect = function(event){
		_select.on("select", event);
	};
	
	this.select = function(nodes){
		_select(nodes);
	};
}
