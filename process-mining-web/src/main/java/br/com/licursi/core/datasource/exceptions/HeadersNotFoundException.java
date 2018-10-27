package br.com.licursi.core.datasource.exceptions;

public class HeadersNotFoundException extends Exception {

	private static final long serialVersionUID = 2542840379273023670L;

	public HeadersNotFoundException() {
		super("The headers of data source was not found");
	}
	
	public HeadersNotFoundException(Throwable e) {
		super("The headers of data source was not found", e);
	}
	
	public HeadersNotFoundException(String message) {
		super(message);
	}
	
	public HeadersNotFoundException(String message, Throwable t) {
		super(message, t);
	}
}
