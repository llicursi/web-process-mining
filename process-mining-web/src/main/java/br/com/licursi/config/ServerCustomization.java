package br.com.licursi.config;

import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
import org.springframework.boot.context.embedded.ErrorPage;
import org.springframework.boot.orm.jpa.EntityScan;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

public class ServerCustomization extends ServerProperties {

	@Override
	public void customize(ConfigurableEmbeddedServletContainer container) {

		super.customize(container);
		container.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND,"/errors/welcome"));
		container.addErrorPages(new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR,"/errors/welcome.html"));
		container.addErrorPages(new ErrorPage("/errors/welcome.html"));

	}

}