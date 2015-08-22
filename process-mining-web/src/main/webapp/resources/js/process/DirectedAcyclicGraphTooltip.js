jQuery.fn.outerHTML = function() {
	return jQuery('<div />').append(this.eq(0).clone()).html();
};

var timestampToTimeString = function(timestamp) {
	timestamp = Math.floor(timestamp);
	var date = new Date(timestamp);
	var hours = date.getHours();
	var minutes = date.getMinutes();
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var seconds = date.getSeconds();
	seconds = seconds < 10 ? '0'+seconds : seconds;
	var milliseconds = date.getMilliseconds();
	milliseconds = milliseconds < 10 ? '00'+milliseconds : milliseconds < 100 ? '0'+milliseconds : milliseconds;
	return ((hours > 0) ? hours + "h ": "") + 
			minutes + "m " + seconds + "s " + 
			((milliseconds > 0) ? milliseconds + "ms" : "");
};

var DirectedAcyclicGraphTooltip = function(gravity, propertiesToRead) {

	var _reserved = propertiesToRead;
	
	var tooltip = Tooltip(gravity).title(function(d) {
		var datum = d.datum;

		function appendRow(key, value, tooltip) {
			var keyrow = $("<div>").attr("class", "key").append(key);
			var valrow = $("<div>").attr("class", "value").append(value);
			var clearrow = $("<div>").attr("class", "clear");
			tooltip.append($("<div>").append(keyrow).append(valrow).append(clearrow));
		}
		
		function appendChart(key, values, count, tooltip){
			var barchart = new BARCHART();
			var svg = barchart.plot(values, count);
			tooltip.append($("<div>").append(svg));
			barchart.clearArea();
		}

		var tooltip = $("<div>").attr("class", "xtrace-tooltip");
		var seen = {"Edge": true, "version": true};

		// Do the reserved first
		for (var i = 0; i < _reserved.length; i++) {
			var key = _reserved[i];
			if (datum.hasOwnProperty(key)) {
				seen[key] = true;
				if (key.toUpperCase()=="AVGTIME") {
					appendRow(key, timestampToTimeString(datum[key]), tooltip);
				} else if (key.toUpperCase()=="RESOURCES"){
					appendChart(key, datum[key], datum['count'], tooltip);
				} else {
					appendRow(key, datum[key], tooltip);
				}

			}
		}

		// Do the label
		//appendRow("(hash)", hash_report(datum), tooltip);

		return tooltip.outerHTML();
	});

	return tooltip;
};

var CompareTooltip = function() {

	var tooltip = Tooltip().title(function(d) {
		function appendRow(key, value, tooltip) {
			var keyrow = $("<div>").attr("class", "key").append(key);
			var valrow = $("<div>").attr("class", "value").append(value);
			var clearrow = $("<div>").attr("class", "clear");
			tooltip.append($("<div>").append(keyrow).append(valrow).append(clearrow));
		}

		var tooltip = $("<div>").attr("class", "xtrace-tooltip");

		appendRow("ID", d.get_id(), tooltip);
		appendRow("NumReports", d.get_node_ids().length, tooltip);
		appendRow("NumLabels", Object.keys(d.get_labels()).length, tooltip);

		return tooltip.outerHTML();
	});

	return tooltip;

}


var Tooltip = function(gravity) {
	if (gravity==null)
		gravity = $.fn.tipsy.autoWE;

	var tooltip = function(selection) {
		selection.each(function(d) {
			$(this).tipsy({
				gravity: gravity,
				html: true,
				title: function() { return title(d); },
				opacity: 1
			});
		});
	}

	var title = function(d) { return ""; };

	tooltip.hide = function() { $(".tipsy").remove(); }
	tooltip.title = function(_) { if (arguments.length==0) return title; title = _; return tooltip; }


	return tooltip;
}