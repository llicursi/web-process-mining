package br.com.licursi.upload.exception;

public class UniqueFileException extends Exception {

	private static final long serialVersionUID = 1823052274154459742L;

	public UniqueFileException(){
		super();
	}
	
	public UniqueFileException(String message){
		super(message);
	}

	public UniqueFileException(Throwable e, String message){
		super(message, e);
	}

	public UniqueFileException(Throwable e){
		super(e);
	}
}
