package org.oryxeditor.server;

/**
 * Shreeprabha
 */

import java.io.File;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.ValidationEvent;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import org.json.JSONObject;
import org.oryxeditor.server.diagram.Diagram;
import org.oryxeditor.server.diagram.DiagramBuilder;
import com.sun.xml.bind.marshaller.NamespacePrefixMapper;
import de.hpi.ingest.ExportValidationEventCollector;
import de.hpi.ingest.factory.AbstractIngestFactory;
import de.hpi.ingest.model.Definitions;
import de.hpi.ingest.transformation.IngestPrefixMapper;
import de.hpi.ingest.transformation.Diagram2IngestConverter;
import de.hpi.util.reflection.ClassFinder;


public class SimulationServlet extends HttpServlet {

    private static final long serialVersionUID = -4308758083419724953L;

    /**
     * The post request
     */
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException {
        String json = req.getParameter("data");
        boolean asXML = req.getParameter("xml") != null;

        /* Transform and return from DI */
        try {
            List<Class<? extends AbstractBpmnFactory>> factoryClasses = ClassFinder.getClassesByPackageName(AbstractIngestFactory.class,
                    "de.hpi.ingest.factory", this.getServletContext());

            StringWriter output = this.performTransformationToDi(json, asXML, factoryClasses);
            res.setContentType("application/xml");
            res.setStatus(200);
            res.getWriter().print(output.toString());
        } catch (Exception e) {
            try {
                e.printStackTrace();
                res.setStatus(500);
                res.setContentType("text/plain");
                res.getWriter().write(e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
            } catch (Exception e1) {
                e1.printStackTrace();
            }
        }

    }


    protected StringWriter performTransformationToDi(String json, boolean asXML, List<Class<? extends AbstractBpmnFactory>> factoryClasses) throws Exception {
        StringWriter writer = new StringWriter();
        JSONObject result = new JSONObject();

        /* Retrieve diagram model from JSON */

        Diagram diagram = DiagramBuilder.parseJson(json);

        /* Build up BPMN 2.0 model */
        Diagram2IngestConverter converter = new Diagram2IngestConverter(diagram, factoryClasses);
        Definitions ingestDefinitions = converter.getDefinitionsFromDiagram();

        /* Perform XML creation */
        JAXBContext context = JAXBContext.newInstance(Definitions.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);

        NamespacePrefixMapper nsp = new IngestPrefixMapper();
        marshaller.setProperty("com.sun.xml.bind.namespacePrefixMapper", nsp);

        /* Set Schema validation properties */
        SchemaFactory sf = SchemaFactory.newInstance(javax.xml.XMLConstants.W3C_XML_SCHEMA_NS_URI);

        String xsdPath = this.getServletContext().getRealPath("/WEB-INF/lib/ingest/Ingest.xsd");

        Schema schema = sf.newSchema(new File(xsdPath));
        marshaller.setSchema(schema);

        ExportValidationEventCollector vec = new ExportValidationEventCollector();
        marshaller.setEventHandler(vec);

        /* Marshal BPMN 2.0 XML */
        marshaller.marshal(bpmnDefinitions, writer);

        if (asXML) {
            return writer;
        }

        result.put("xml", writer.toString());

        /* Append XML Schema validation results */
        if (vec.hasEvents()) {
            ValidationEvent[] events = vec.getEvents();
            StringBuilder builder = new StringBuilder();
            builder.append("Validation Errors: <br /><br />");

            for (ValidationEvent event : Arrays.asList(events)) {

                builder.append("Line: ");
                builder.append(event.getLocator().getLineNumber());
                builder.append(" Column: ");
                builder.append(event.getLocator().getColumnNumber());

                builder.append("<br />Error: ");
                builder.append(event.getMessage());
                builder.append("<br /><br />");
            }
            result.put("validationEvents", builder.toString());
        }

        /* Prepare output */
        writer = new StringWriter();
        writer.write(result.toString());

        return writer;
    }

}
