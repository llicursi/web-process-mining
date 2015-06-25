SliderHandler = function (containerId, name){
	var _id = containerId;
	var $sliderPlaceHolder = $("#" + _id);
	var _CONST_SLIDER_WIDTH = 16;
	
	function draw(){
		$sliderPlaceHolder.noUiSlider({
			start:100,
			orientation: "vertical",
			connect: "lower",
			direction: "rtl",
			range: {
				'min': 0,
				'max': 100
			},
			change: function(e){
				fireChange(e);
			}
		});
		addBottomSpan();
	} 
	draw();
	
	function addBottomSpan(){
		$sliderPlaceHolder.append("<span>" + name + "</span>");
		var span = $sliderPlaceHolder.find("span")[0];
		
		var spanWidth = (span.scrollWidth > span.offsetWidth ) ?  span.scrollWidth :  span.offsetWidth;
		var gap = spanWidth - _CONST_SLIDER_WIDTH;
		if (gap > 0){
			span.setAttribute("style", "margin-left: -" + (gap/2) + "px");
		}
	}
	
	var _onChangeFunction = null;
	this.setOnChange = function (onChangeFunction){
		_onChangeFunction = onChangeFunction;
	};
	
	function fireChange(value){
		if (_onChangeFunction != null && typeof _onChangeFunction == 'function'){
			_onChangeFunction(value);
		}
	}
};