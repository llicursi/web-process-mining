package br.com.licursi.tcc;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import javax.servlet.RequestDispatcher;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

public class ControllerServlet extends HttpServlet implements Servlet {
	
	static final long serialVersionUID = 1L;

	private static final Logger logger = Logger.getLogger(ControllerServlet.class);
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		doRequest(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		doRequest(request, response);
	}

	private void doRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		/* Action method */
		String action = request.getParameter("action");

		// Default action
		if (action == null || action.trim().equals(""))
			action = "index";

		try {

			logger.info("Involking action '" + action + "'");

			Method actionMethod = this.getClass().getMethod(action, HttpServletRequest.class, HttpServletResponse.class);
			actionMethod.invoke(this, request, response);

		} catch (NoSuchMethodException e) {
			response.getWriter().println("Action '" + action + "' not found");
			logger.error("Action '" + action + "' not found", e);
		} catch (IllegalArgumentException  | SecurityException | IllegalAccessException | InvocationTargetException e) {
			e.printStackTrace();
		}
	}
	
	protected void dispacher(String url, HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(url);
		dispatcher.forward(request, response);
	}
}
