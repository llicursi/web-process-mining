package br.com.licursi.tcc;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.Reader;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.json.JSONTokener;

@WebServlet("/main")
public class MainController extends ControllerServlet {

	private static final long serialVersionUID = 1L;
	
	public void index(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		dispacher("/index.jsp", request, response);
	}
	
	public void jsonData(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		InputStream resourceAsStream = this.getClass().getResourceAsStream("/br/com/licursi/mining/resources/jsondata.json");
		
		JSONTokener jsonTokener = new JSONTokener(resourceAsStream);
		
		JSONObject jsonObject = new JSONObject(jsonTokener);
		
		response.setContentType("application/json");
		// Get the printwriter object from response to write the required json object to the output stream      
		PrintWriter out = response.getWriter();
		// Assuming your json object is **jsonObject**, perform the following, it will return your json object  
		out.print(jsonObject.toString());
		out.flush();
		
		resourceAsStream.close();
	}

}
