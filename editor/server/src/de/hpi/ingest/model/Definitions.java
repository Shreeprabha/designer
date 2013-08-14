/**
 * Copyright (c) 2009
 * Philipp Giese, Sven Wagner-Boysen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package de.hpi.ingest.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.Marshaller;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAnyAttribute;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlElementRefs;
import javax.xml.bind.annotation.XmlID;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.CollapsedStringAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import javax.xml.namespace.QName;

import de.hpi.ingest.model.connector.Edge;
import de.hpi.ingest.model.connector.MessageFlow;
import de.hpi.ingest.model.data_object.Message;
import de.hpi.ingest.model.diagram.IngestDiagram;
import de.hpi.ingest.model.diagram.CollaborationDiagram;
import de.hpi.ingest.model.diagram.ProcessDiagram;

import de.hpi.ingest.model.event.EventDefinition;
import de.hpi.ingest.validation.IngestSyntaxChecker;

/**
 * <p>
 * Java class for tDefinitions complex type.
 * 
 * <p>
 * The following schema fragment specifies the expected content contained within
 * this class.
 * 
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "definitions")
@XmlType(name = "tDefinitions", propOrder = {
		"targetNamespace",
		"expressionLanguage",
		"typeLanguage",
		"rootElement", 
		"diagram"
})
public class Definitions {
	
	@XmlElementRefs( { @XmlElementRef(type = Process.class),
			@XmlElementRef(type = Collaboration.class)
	})
	protected List<RootElement> rootElement;
	
	@XmlElementRefs( { @XmlElementRef(type = ProcessDiagram.class),
			@XmlElementRef(type = CollaborationDiagram.class)
	 })
	protected List<IngestDiagram> diagram;

	
	@XmlAttribute
	@XmlJavaTypeAdapter(CollapsedStringAdapter.class)
	@XmlID
	@XmlSchemaType(name = "ID")
	protected String id;

	@XmlAttribute(required = true)
	@XmlSchemaType(name = "anyURI")
	protected String targetNamespace;

	@XmlAttribute
	@XmlSchemaType(name = "anyURI")
	protected String expressionLanguage;
	
	@XmlAttribute
	@XmlSchemaType(name = "anyURI")
	protected String typeLanguage;

	@XmlAnyAttribute
	private Map<QName, String> otherAttributes = new HashMap<QName, String>();

	@XmlTransient
	private Map<String, String> namespaces;

	/**
	 * 
	 * @return
	 */

	public CollaborationDiagram getCollaborationDiagram() {
		for (IngestDiagram dia : this.getDiagram()) {
			if (dia instanceof CollaborationDiagram) {
				return (CollaborationDiagram) dia;
			}
		}

		return null;
	}

	public ProcessDiagram getProcessDiagram() {
		for (IngestDiagram dia : this.getDiagram()) {
			if (dia instanceof ProcessDiagram) {
				return (ProcessDiagram) dia;
			}
		}

		return null;
	}
	
	/**
	 * The {@link Marshaller} invokes this method right before marshaling to 
	 * XML. The namespace are added as attributes to the definitions element.
	 * @param marshaller 
	 * 		The marshaling context
	 */
	public void beforeMarshal(Marshaller marshaller) {
		for (String prefix : this.getNamespaces().keySet()) {
			QName namespacePrefix = new QName("xmlns:" + prefix);
			this.getOtherAttributes().put(namespacePrefix,
					this.getNamespaces().get(prefix));
		}
	}

	/* Getter & Setter */


	/**
	 * Gets the value of the rootElement property.
	 * 
	 * <p>
	 * This accessor method returns a reference to the live list, not a
	 * snapshot. Therefore any modification you make to the returned list will
	 * be present inside the JAXB object. This is why there is not a
	 * <CODE>set</CODE> method for the rootElement property.
	 * 
	 * <p>
	 * For example, to add a new item, do as follows:
	 * 
	 * <pre>
	 * getRootElement().add(newItem);
	 * </pre>
	 * 
	 * 
	 * <p>
	 * Objects of the following type(s) are allowed in the list
	 * {@link JAXBElement }{@code <}{@link TMessageEventDefinition }{@code >}
	 * {@link JAXBElement }{@code <}{@link ErrorEventDefinition }{@code >}
	 * {@link JAXBElement }{@code <}{@link Collaboration }{@code >}
	 * {@link JAXBElement }{@code <}{@link ConditionalEventDefinition }{@code >}
	 * {@link JAXBElement }{@code <}{@link Process }{@code >} {@link JAXBElement }
	 * {@code <}{@link Category }{@code >} {@link JAXBElement }{@code <}
	 * {@link TItemDefinition }{@code >} {@link JAXBElement }{@code <}
	 * {@link Message }{@code >} {@link JAXBElement }{@code <}	
	 * {@link TCorrelationProperty }{@code >} {@link JAXBElement }{@code <}	
	 * {@link TInterface }{@code >} {@link JAXBElement }{@code <}
	 * {@link TGlobalUserTask }{@code >} {@link JAXBElement }{@code <}
	 * {@link GlobalCommunication }{@code >} {@link JAXBElement }{@code <}
	 * {@link TResource }{@code >} {@link JAXBElement }{@code <}	
	 * {@link TEndPoint }{@code >} {@link JAXBElement }{@code <}
	 * {@link RootElement }{@code >} {@link JAXBElement }{@code <}
	 * {@link TPartnerEntity }{@code >} {@link JAXBElement }{@code <}
	 * {@link TGlobalManualTask }{@code >} {@link JAXBElement }{@code <}
	 * {@link EventDefinition }{@code >} {@link JAXBElement }{@code <}
	 * {@link TError }{@code >} {@link JAXBElement }{@code <}
	 * {@link TPartnerRole }{@code >} {@link JAXBElement }{@code <}
	 * {@link TGlobalTask }{@code >} {@link JAXBElement }{@code <}{@link TSignal }
	 * {@code >} {@link JAXBElement }{@code <}{@link TTerminateEventDefinition }
	 * {@code >} {@link JAXBElement }{@code <}{@link TGlobalChoreographyTask }
	 * {@code >}
	 * 
	 * 
	 */
	public List<RootElement> getRootElement() {
		if (rootElement == null) {
			rootElement = new ArrayList<RootElement>();
		}
		return this.rootElement;
	}

	/**
	 * This Method return a List containing all edges within the diagram
	 * 
	 * @return List<Edge>
	 */
	public List<Edge> getEdges() {
		if (this.rootElement == null) {
			return new ArrayList<Edge>();
		}

		ArrayList<Edge> edges = new ArrayList<Edge>();

		for (RootElement rootElement : this.rootElement) {

			if (rootElement instanceof Process) {

				for (FlowElement flowElement : ((Process) rootElement)
						.getFlowElement()) {

					if (flowElement instanceof Edge) {
						edges.add((Edge) flowElement);
					}
				}
			} else if (rootElement instanceof Collaboration) {

				for (MessageFlow messageFlow : ((Collaboration) rootElement)
						.getMessageFlow())
					edges.add(messageFlow);

			} 
		}

		return edges;
	}

	/**
	 * Gets the value of the diagram property.
	 * 
	 * <p>
	 * This accessor method returns a reference to the live list, not a
	 * snapshot. Therefore any modification you make to the returned list will
	 * be present inside the JAXB object. This is why there is not a
	 * <CODE>set</CODE> method for the diagram property.
	 * 
	 * <p>
	 * For example, to add a new item, do as follows:
	 * 
	 * <pre>
	 * getDiagram().add(newItem);
	 * </pre>
	 * 
	 * 
	 * <p>
	 * Objects of the following type(s) are allowed in the list
	 * {@link JAXBElement }{@code <}{@link IngestDiagram }{@code >}
	 * {@link JAXBElement }{@code <}{@link CollaborationDiagram }{@code >}
	 * {@link JAXBElement }{@code <}{@link ProcessDiagram }{@code >}
	 * 
	 * 
	 */
	public List<IngestDiagram> getDiagram() {
		if (diagram == null) {
			diagram = new ArrayList<IngestDiagram>();
		}
		return this.diagram;
	}

	public IngestSyntaxChecker getSyntaxChecker() {
		return new IngestSyntaxChecker(this);
	}


	/**
	 * Gets the value of the id property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getId() {
		return id;
	}

	/**
	 * Sets the value of the id property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setId(String value) {
		this.id = value;
	}

	/**
	 * Gets the value of the targetNamespace property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getTargetNamespace() {
		return targetNamespace;
	}

	/**
	 * Sets the value of the targetNamespace property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setTargetNamespace(String value) {
		this.targetNamespace = value;
	}

	/**
	 * Gets the value of the expressionLanguage property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getExpressionLanguage() {
		if (expressionLanguage == null) {
			return "http://www.w3.org/1999/XPath";
		} else {
			return expressionLanguage;
		}
	}

	/**
	 * Sets the value of the expressionLanguage property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setExpressionLanguage(String value) {
		this.expressionLanguage = value;
	}

	/**
	 * Gets the value of the typeLanguage property.
	 * 
	 * @return possible object is {@link String }
	 * 
	 */
	public String getTypeLanguage() {
		if (typeLanguage == null) {
			return "http://www.w3.org/2001/XMLSchema";
		} else {
			return typeLanguage;
		}
	}

	/**
	 * Sets the value of the typeLanguage property.
	 * 
	 * @param value
	 *            allowed object is {@link String }
	 * 
	 */
	public void setTypeLanguage(String value) {
		this.typeLanguage = value;
	}

	/**
	 * Gets a map that contains attributes that aren't bound to any typed
	 * property on this class.
	 * 
	 * <p>
	 * the map is keyed by the name of the attribute and the value is the string
	 * value of the attribute.
	 * 
	 * the map returned by this method is live, and you can add new attribute by
	 * updating the map directly. Because of this design, there's no setter.
	 * 
	 * 
	 * @return always non-null
	 */
	public Map<QName, String> getOtherAttributes() {
		return otherAttributes;
	}

	/**
	 * The namespaces property contains an arbitrary set of namespace prefixes
	 * their related URLs referenced inside the diagram.
	 * 
	 * @return the namespaces property. always non-null
	 */
	public Map<String, String> getNamespaces() {
		if (this.namespaces == null) {
			this.namespaces = new HashMap<String, String>();
		}

		return namespaces;
	}

}
