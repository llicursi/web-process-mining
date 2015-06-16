package br.com.licursi.core.util;

import java.util.ArrayList;
import java.util.List;

public class GenericUtil {

	public static List<String> formatKeyHeaders(List<String> headers) {
		List<String> formattedList = new ArrayList<String>();
		if (headers != null){
			for (String header : headers){
				formattedList.add(formatToValidMongoKey(header));
			}
		}
		return formattedList;
	}

	public static String formatToValidMongoKey(String key){
		if (key == null){
			return "";
		}
		
		if (key.length() > 0 && key.charAt(0) == '$'){
			key = key.substring(1);
		}
		
		return key.replace(".", "°");
	}

}
