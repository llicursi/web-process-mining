ADJUST = function (){
	
	var _refId = "table-adjust";
	var _dataTable;

	var _variables = [{
		name:"Case Id",
		optional:false,
		desc:"Este &eacute; um indicador &uacute;nico que representa a instancia do	processo.<br/><br/>"
	},{
		name:"Activity",
		desc:"Selecione a coluna representando as atividades do	processo.",
		optional:false
	},{
		name:"End Time",
		desc:"Selecione a coluna que represente o término da atividade.",
		optional:false
	},{
		name:"Resource",
		desc:"Selecione que represente o executor responsável pela atividade.",
		optional:false
	},{
		name:"Start Time",
		desc:"Selecione que represente o executor responsável pela atividade.",
		optional:true
	},{
		name:"Cost",
		desc:"Selecione que represente o custo do recurso na atividade executada.",
		optional:true
	}];
	
	var _selectedVariable = null;
	
	
	
	(function (){
		construcVariablesList("accordion");
		loadData();

	})();
	
	// Load the table
	function loadData(){
	
		$.ajax({
			dataType:'json',
			url: "data/"
		})
		.done(dataLoaded)
		.fail(invalidProcessId);

	}
	
	// ========================================================================
	
	// Process the loaded data and construct a table
	// to start the DataTable
	function dataLoaded(jsonData, x, h){
		if (jsonData !== undefined && jsonData.length && jsonData.length > 0){
			
			var table = constructTable();
			var columns = [];
			var firstTuple = jsonData[0];
			var headers = [];
			var index = 0;
			for (var title in firstTuple){
				table.children[0].children[0].appendChild(createTH(title, index ++));
				columns.push({"data":title});
			}
			
			var adjustContainer = document.getElementById("adjust-container");
			adjustContainer.innerHTML = "";
			adjustContainer.appendChild(table);
			
			_dataTable = $("#" + _refId).DataTable( {
				searching: false,
				ordering:  false,
				paging: false,
				info 	: false,
			    data:  jsonData ,
			    columns: columns
			});
			
		} else {
			noData();
		}
		
	}
	
	function noData(){
		debugger;
	}
	
	function invalidProcessId(){
		debugger;
	}
	
	// Table construct
	function constructTable(){
		var table = document.createElement("table");
		table.setAttribute("id",_refId );
		table.setAttribute("class", "display table-adjust");
		table.setAttribute("width", "100%");
		table.setAttribute("cellspacing", "0");
		
		var thead = document.createElement("thead");
		table.appendChild(thead);
		
		var tr = document.createElement("tr");
		thead.appendChild(tr);
		
		return table;
	}
	
	// Create the TH for the content header
	function createTH(title, index){
		var th = document.createElement("th");
		th.innerHTML = title;
		th.index = index;
		th.onclick = function (o, e){
			thClickEvent(index, th, o, e);
		}
		
		return th;
	}
	
	function thClickEvent(index, th, o, e){
		if ((th.selected === undefined || !th.selected) && _selectedVariable != null){
			_selectedVariable.thBind = th;
			_selectedVariable.h3Bind.className = _selectedVariable.h3Bind.className.replace("ui-state-default", "ui-state-disabled");
			th.className = "selected";
			
			
			var domI = document.createElement("i");
			domI.innerHTML = "\"" + _selectedVariable.name + "\"";
			th.appendChild(domI);
			th.selected = true;

			
			selectDeselectColumn(index, true);
			
			var nextH3 = getNextSibling(_selectedVariable.h3Bind);
			if (nextH3) 
				nextH3.click();
			else 
				hideH3descrition(_selectedVariable.h3Bind);
			
			_selectedVariable = null;
			
			
		}
	}
	
	function selectDeselectColumn(index, select){
		var trs = _dataTable.context[0].nTable.getElementsByTagName("tr");
		for (var i=1; i < trs.length; i++){
			var cell = trs[i].children[index];
			cell.className = select ? "selected" : "";
		}
	}
	
	// ========================================================================
	
	
	// id = accordion
	function construcVariablesList(accordeonId){
		var domAccordion = document.getElementById(accordeonId);
		domAccordion.innerHtml = "";
		
		for (var i = 0; i < _variables.length; i ++){
			if (i == 0){
				_selectedVariable = _variables[i];
			}
			buildDomAccordeon(domAccordion, _variables[i]);
		}
		
		$(domAccordion).accordion({});
		
	}
	
	function buildDomAccordeon(domAccordion, variable){
		var h3 = document.createElement("h3");
		h3.innerHTML = variable.name + getDomImageCheck();
		h3.appendChild(getCloseLinkToSelected());
		
		domAccordion.appendChild(h3);
		h3.className = variable.optional ? "optional" : "";
		h3.onclick = eventClickH3;
		
		h3.variableBind = variable;
		variable.h3Bind = h3;
		
		var div = document.createElement("div");
		div.innerHTML = variable.desc;
		h3.contentDiv = div;
		domAccordion.appendChild(div);
	}
	
	function getDomImageCheck(){
		return '\n\t\t' +
		'<img src="../../resources/img/check.svg" class="svg check"/>';
	}
	
	function getCloseLinkToSelected(){
		var a = document.createElement("a");
		a.setAttribute("href", "javascript:;");
		a.setAttribute("title", "Unbind");
		a.innerHTML = '\n\t\t<img src="../../resources/img/cross.svg" class="svg close"/>';
		a.onclick = eventCloseUnbind;
		return a;
	}
	
	function eventCloseUnbind(){
		this.parentNode.variableBind.thBind.selected = false;
		this.parentNode.variableBind.thBind.innerHTML = this.parentNode.variableBind.name;
		this.parentNode.variableBind.thBind.className = "";
		var index = this.parentNode.variableBind.thBind.index;
		this.parentNode.variableBind.thBind = null;
		
		selectDeselectColumn(index, false);
		
		this.parentNode.className = this.parentNode.className.replace("ui-state-disabled", "ui-state-default");
		
	}
	
	function eventClickH3(){
		if (!this.variableBind.binded){
			_selectedVariable = this.variableBind;	
		}
	}
	
	function hideH3descrition(h3){
		$(h3.contentDiv).slideUp();
	}
	
		
}

var ajust = new ADJUST();
