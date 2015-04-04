package br.com.licursi.upload.business.test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.web.multipart.MultipartFile;

import br.com.licursi.core.eventlog.business.EventLogBO;
import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

public class EventLogTest {

	
	private EventLogBO eventLogBO;
	private List<MultipartFile> mockListMultiPart;
	
	@Before
	public void SetUp(){
		
		mockListMultiPart = new ArrayList<MultipartFile>();
		
		eventLogBO = new EventLogBO();
		
	
	}
	
	@Test(expected=NullPointerException.class)
	public void validNullPointerExceptionPassingNullToGenerateRawProcess() throws UniqueFileException, InvalidExtensionException{
		eventLogBO.generateEventoLogFromFiles(null);
	}

	@Test(expected=UniqueFileException.class)
	public void validNonUniqueListItens() throws UniqueFileException, InvalidExtensionException{
		MultipartFile mockMultipartFile = mock(MultipartFile.class);
		mockListMultiPart.add(mockMultipartFile);
		mockListMultiPart.add(mockMultipartFile);
		eventLogBO.generateEventoLogFromFiles(mockListMultiPart);
		mockListMultiPart.clear();
		
	}
	
	@Test(expected=InvalidExtensionException.class)
	public void validInvalidExtensionExceptionPassingExtensionText() throws UniqueFileException, InvalidExtensionException{
		MultipartFile mockMultipartFile = mock(MultipartFile.class);
		when(mockMultipartFile.getName()).thenReturn("teste-xls.txt");

		mockListMultiPart.add(mockMultipartFile);
		eventLogBO.generateEventoLogFromFiles(mockListMultiPart);
		
	}
	
	@Test
	public void validRegexNameExtensionXLS() throws UniqueFileException, InvalidExtensionException{
		MultipartFile mockMultipartFile = mock(MultipartFile.class);
		when(mockMultipartFile.getName()).thenReturn("teste-xls.csv");

		mockListMultiPart.add(mockMultipartFile);
		eventLogBO.generateEventoLogFromFiles(mockListMultiPart);
		Assert.assertTrue(true);
	}
}
