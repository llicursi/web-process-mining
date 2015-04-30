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
	//, acceptedFiles : ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
	//, autoProcessQueue : false
	, dictDefaultMessage: "Arraste arquivos aqui. <span class='dz-sub-message'>( ... ou clique e selecione-o )</span>"
	, init: function () {
		
		this.on("sending", function(file, xhr, formData) {
				// Will send the filesize along with the file as POST data.
//								debugger;
//								formData.append("filesize", file.size);
//								formData.append("name", file.name);
		});

		this.on("succes", function(file, xhr, formData){
			alert("succes");
		});

		this.on("complete", function(file, xhr, formData){
			var response = file.xhr.response;
			if (response == CONSTRAINTS.RESPONSE_ERROR_NONUNIQUE){
				
			} else if (response == CONSTRAINTS.RESPONSE_ERROR_AT_EVENTO_LOG) {
				
			} else if (response == CONSTRAINTS.RESPONSE_ERROR_INVALIDEXTENSION) {
				
			} else {
				window.location.href = response + "/adjust/";
			}
				
			debugger;
		});
	}
};

function createUploadButton(){
	
}