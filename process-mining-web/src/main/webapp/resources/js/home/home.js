Dropzone.options.processDropzone = { 
	 url: "/upload"
	, method: "POST"
	, parallelUploads: 1
	, paramName: "rawdata"
	, maxFiles : 1
	, maxFilesize : 1048576
	//, acceptedFiles : ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
	, autoProcessQueue : false
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
			alert("complete");
		});
	}
};

function createUploadButton(){
	
}