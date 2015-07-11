package br.com.licursi.core.util.test;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.List;

import org.junit.Test;

import br.com.licursi.core.util.GenericUtil;

public class GenericUtilTest {
	
	@Test
	public void verifyNullValueToValidMongoKey(){
		String formatToValidMongoKey = GenericUtil.formatToValidMongoKey(null);
		assertEquals(formatToValidMongoKey, "");
	}


	@Test
	public void verifyEmptyPassingStringToValidMongoKey(){
		String formatToValidMongoKey = GenericUtil.formatToValidMongoKey("");
		assertEquals(formatToValidMongoKey, "");
	}
	
	@Test
	public void verifyNullValueToListMongoKeys(){
		List<String> formatKeyHeaders = GenericUtil.formatKeyHeaders(null);
		assertEquals(formatKeyHeaders.size(), 0);
	}
	
	@Test
	public void verifyListOfThreesimpleItensAtFormatKeyHeaders(){
		String[] testArray = {"a", "b", "C"};
		List<String> asList = Arrays.asList(testArray);
		
		List<String> formatKeyHeaders = GenericUtil.formatKeyHeaders(asList);
		assertEquals(formatKeyHeaders.size(), 3);
		
		int index = 0;
		for (String item : formatKeyHeaders){
			assertEquals(item, asList.get(index++));
		}
	}
	
	@Test
	public void verifyListOfForbiddenStringsAtFormatKeyHeaders(){
		String[] testArray = {"$a", "$1123123", "C.ccccc"};
		List<String> asList = Arrays.asList(testArray);
		
		List<String> formatKeyHeaders = GenericUtil.formatKeyHeaders(asList);
		assertEquals(formatKeyHeaders.size(), 3);
		
		int index = 0;
		for (String item : formatKeyHeaders){
			assertNotEquals(item, asList.get(index++));
		}

		assertEquals( formatKeyHeaders.get(0), "a");
		assertEquals( formatKeyHeaders.get(1), "1123123");
		assertEquals( formatKeyHeaders.get(2), "Cccccc");
	}
	
	@Test
	public void verifyListOfUnchangedStringsAtFormatKeyHeaders(){
		String[] testArray = {"la-1", "áááççç", "!#$%¨&*()", "end$", "ms,md"};
		List<String> asList = Arrays.asList(testArray);
		
		List<String> formatKeyHeaders = GenericUtil.formatKeyHeaders(asList);
		
		int index = 0;
		for (String item : formatKeyHeaders){
			assertEquals(item, asList.get(index++));
		}
	}
}
