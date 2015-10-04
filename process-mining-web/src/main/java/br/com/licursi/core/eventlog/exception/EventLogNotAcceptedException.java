package br.com.licursi.core.eventlog.exception;

public class EventLogNotAcceptedException extends Exception {

	public EventLogNotAcceptedException() {
		super();
	}
	public EventLogNotAcceptedException(Throwable t) {
		super(t);
	}
	public EventLogNotAcceptedException(String message) {
		super(message);
	}
}
