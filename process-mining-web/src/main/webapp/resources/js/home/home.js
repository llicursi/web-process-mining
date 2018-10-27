var CONSTRAINTS = { 
	RESPONSE_SUCCESS : "sucess",
	RESPONSE_ERROR_NONUNIQUE : "nonunique",
	RESPONSE_ERROR_INVALIDEXTENSION : "invalidextension",
	RESPONSE_ERROR_AT_EVENTO_LOG : "eventlogerror"
};


Dropzone.options.processDropzone = { 
	 url: "/upload"
	, method: "POST"
	, parallelUploads: 1
	, paramName: "rawdata"
	, maxFiles : 1
	, maxFilesize : 1048576
	, acceptedFiles : ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
	//, autoProcessQueue : false
	, dictDefaultMessage: "Drop your csv file here. <span class='dz-sub-message'>( ... or click and select )</span>"
	, init: function () {
		var _percent = null;
		var get = function (element){
			if (_percent == null){
				var div = document.createElement("div");
				div.className = "dz-percent";
				div.innerHTML = "0%";
				div.setAttribute("style", "text-align: left;");
				element.lastChild.appendChild(div);
				_percent = div;
			}
			
			var retorno = function (perc){
				_self = perc;
				return this;
			};
			retorno.prototype.value = function (val ){
				if (val == undefined || val == null){
					return ;
				}
				_self.innerHTML = Math.floor(100*val)/100 + "%";
			}
			
			retorno.prototype.hide = function (){
				_self.parentNode.removeChild(_self);
			}
			return new retorno(_percent);
		};
		
		this.on("uploadprogress", function(file,e, a , m) {
			if (e >= 100){
				$('#myModal').modal({backdrop:'static', keyboard: false});
				get(this.element).hide();
			} else {
				get(this.element).value(e);
			}
		});
		
		this.on("succes", function(file, xhr, formData){
			alert("succes");
		});

		this.on("complete", function(file, xhr, formData){
			var response = file.xhr.response;
			$('#myModal').modal('hide');
			if (response == CONSTRAINTS.RESPONSE_ERROR_NONUNIQUE){
				
			} else if (response == CONSTRAINTS.RESPONSE_ERROR_AT_EVENTO_LOG) {
				
			} else if (response == CONSTRAINTS.RESPONSE_ERROR_INVALIDEXTENSION) {
				
			} else if (response != '' && response != ' '){
				window.location.href = "adjust/" + response + "/";
			} else {
				
			}
				
		});
	}
};

function formatDate(date){
	var oDate = new Date(date);
	
	return "<span>" + (oDate.getMonth() < 10 ? "0": "") + oDate.getMonth()+ "-"  
		+ (oDate.getDay() < 10 ? "0": "") + oDate.getDay() + "-" +oDate.getFullYear() + "   " 
		+ (oDate.getHours() < 10 ? "0": "") + oDate.getHours() + ":" 
		+ (oDate.getMinutes() < 10 ? "0": "") +oDate.getMinutes() + ":" 
		+ (oDate.getSeconds() < 10 ? "0": "") +oDate.getSeconds() + "</span>"; 
}

function createListItem(item){
	if (item.date){
		var a = document.createElement("a");
		a.className = "analysis-list";
		a.href = "/" + ((item.isProcessed != null && item.isProcessed) ? "process" : "adjust" ) + "/" + item._id + "/";
		a.title = item.name;
		a.innerHTML = formatDate(item.date.$date) + ' "' + item.name + '"';
		return a;
	}
	return null;
}

function createListOfLastAnalysis(list){
	
	var div = document.createElement("div");
	div.className = "jumbotron";
	div.innerHTML = '<h3 style="text-align: left; margin-top: -20px; text-shadow: 1px 1px 1px white;"><span class="glyphicon glyphicon-time" aria-hidden="true" style="margin: 8px;"></span>Recent analysis</h3>';
	var created = 0;
	for (var i = 0; i < list.length; i++){
		var link = createListItem(list[i]);
		if (link != null){
			div.appendChild(link);
			created++;
		}
	}
	
	if (created > 0){
		var container = document.getElementById("container-main");
		container.appendChild(div);
	}
	
}

(function loadLastAnalysis(){
	$.ajax({
		 url:"/list/" ,
		 method: "POST",
		 datatype: "json",
		 success: function(data) {
			 if (data != null && data.list){
				 createListOfLastAnalysis(data.list);
			 }
		 }
	});
})();

