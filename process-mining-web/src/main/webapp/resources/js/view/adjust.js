ADJUST = function (){
	
	var _refId = "table-adjust";
	var _dataTable;

	var _variables = [{
		name:"Case Id",
		optional:false,
		desc:"Case unique identifier or process indentifier.<br/><br/>"
	},{
		name:"Activity",
		desc:"Name that represents the process activity, non ambiguous.",
		optional:false
	},{
		name:"End Time",
		desc:"Activity end time.",
		optional:false
	},{
		name:"Resource",
		desc:"Responsable for executing the activity",
		optional:false
	}/*,{
		name:"Start Time",
		desc:"Selecione a coluna que represente o término da atividade.",
		optional:true
	},{
		name:"Cost",
		desc:"Selecione que represente o custo do recurso na atividade executada.",
		optional:true
	}*/];
	
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
			_selectedVariable.value = th.innerHTML;
			_selectedVariable.h3Bind.className = _selectedVariable.h3Bind.className.replace("ui-state-default", "ui-state-disabled");
			th.className = "selected";
			
			
			var domI = document.createElement("i");
			domI.innerHTML = "\"" + _selectedVariable.name + "\"";
			th.appendChild(domI);
			th.selected = true;
			
			updateCounterOfSelectedMandatory();
			
			selectDeselectColumn(index, true);
			
			// Select next H3 and hide description
			var nextH3 = getNextSibling(_selectedVariable.h3Bind);
			if (nextH3){
				_selectedVariable = null;
				nextH3.click();
			} else { 
				hideH3descrition(_selectedVariable.h3Bind);
				_selectedVariable = null;
			}
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
		h3.innerHTML = variable.name + (variable.optional ? " (optional) " : "") + getDomImageCheck();
		h3.appendChild(getCloseLinkToSelected());
		h3.appendChild(createInputHidden(variable.name));
		
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
	
	function createInputHidden(name){
		var input = document.createElement("input");
		input.setAttribute("type", "hidden");
		
		var name_urlified = name.toLowerCase().replace(" ", "_");
		
		input.setAttribute("name", name_urlified);
		return input;
		
	}
	
	function eventCloseUnbind(){
		this.parentNode.variableBind.thBind.selected = false;
		this.parentNode.variableBind.thBind.className = "";
		
		
		var i = this.parentNode.variableBind.thBind.getElementsByTagName("i")[0];
		i.parentNode.removeChild(i);
		
		var index = this.parentNode.variableBind.thBind.index;
		this.parentNode.variableBind.thBind = null;
		
		selectDeselectColumn(index, false);
		
		this.parentNode.className = this.parentNode.className.replace("ui-state-disabled", "ui-state-default");
		updateCounterOfSelectedMandatory();
		
	}
	
	function eventClickH3(){
		if (!this.variableBind.binded){
			_selectedVariable = this.variableBind;	
		}
	}
	
	function hideH3descrition(h3){
		$(h3.contentDiv).slideUp();
	}

	// ========================================================================
	
	// Atualizar o status
	function updateCounterOfSelectedMandatory(){
		var counter = 0;
		var total = 0;
		for (var i = 0; i < _variables.length; i ++){
			var variable = _variables[i];
			if (!variable.optional){
				if (variable.thBind != null){
					counter ++;
				}
				total ++;
			}
		}
		var processDataBtn = document.getElementById("process-data");
		if (counter == total){
			processDataBtn.innerHTML = "<span class=\"glyphicon glyphicon-th\" aria-hidden=\"true\"></span> Process data";
			processDataBtn.onclick = processData;
			remClass(processDataBtn, "disabled");
		} else {
			processDataBtn.innerHTML = counter + "/" + total + " variables selected";
			addClass(processDataBtn, "disabled");
			processDataBtn.onclick = function (){};
		}
		
	}
	
	
	function processData(){
		
		var variablesToProcess = [];
		for (var i = 0; i < _variables.length; i ++){
			var variable = _variables[i];
			if (variable.thBind != null){
				variablesToProcess.push(variable.name + "|||" + variable.value);
			}
		}
		var analysisName = document.getElementById("analysis-name").value;
		$.ajax({
			method: "post", 
			dataType:'json',
			data : {variables : variablesToProcess, "analysisName" : analysisName},
			url: "minner/"
		}).done(function (retorno){
				
			if (retorno.status == true){
				window.location.href = window.location.href.replace("adjust", "process").replace("#", "");
			} else {
				alert("falha : " + retorno);
			}
			
		});
	}
		
		
}

var ajust = new ADJUST();
