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


package de.hpi.ingest.model.activity;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;

import org.oryxeditor.server.diagram.Shape;
import org.oryxeditor.server.diagram.StencilType;

import de.hpi.ingest.annotations.ChildElements;
import de.hpi.ingest.model.BaseElement;
import de.hpi.ingest.model.FlowElement;
import de.hpi.ingest.model.activity.type.ManualTask;
import de.hpi.ingest.model.activity.type.UserTask;
import de.hpi.ingest.model.artifacts.Artifact;
import de.hpi.ingest.model.artifacts.TextAnnotation;
import de.hpi.ingest.model.connector.Association;
import de.hpi.ingest.model.data_object.DataObject;
import de.hpi.ingest.model.data_object.DataStore;
import de.hpi.ingest.model.gateway.ParallelGateway;



@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tSubProcess", propOrder = {
    "flowElement",
    "artifact"
})
@XmlSeeAlso({
    AdHocSubProcess.class
})
public class SubProcess
    extends Activity
{

    @XmlElementRef(type = FlowElement.class)
    protected List<FlowElement> flowElement;
    
    @XmlElementRef(type = Artifact.class)
    protected List<Artifact> artifact;
    
    @XmlAttribute
    protected Boolean triggeredByEvent;

    /**
     * Adds the child to the list of {@link FlowElement} of the subprocess.
     */
    public void addChild(BaseElement child) {
    	if(child instanceof FlowElement) {
    		this.getFlowElement().add((FlowElement) child);
    	}
    }
    
    /* Getter & Setter */
    
    /**
     * Gets the value of the flowElement property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the flowElement property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getFlowElement().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link JAXBElement }{@code <}{@link ManualTask }{@code >}
 
     * {@link JAXBElement }{@code <}{@link TEndEvent }{@code >}

     * {@link JAXBElement }{@code <}{@link TFlowElement }{@code >}
     * {@link JAXBElement }{@code <}{@link CallActivity }{@code >}

     * {@link JAXBElement }{@code <}{@link TStartEvent }{@code >}
     * {@link JAXBElement }{@code <}{@link TExclusiveGateway }{@code >}
   
    
     * {@link JAXBElement }{@code <}{@link DataObject }{@code >}
     * {@link JAXBElement }{@code <}{@link TEvent }{@code >}

     * {@link JAXBElement }{@code <}{@link DataStore }{@code >}
     * {@link JAXBElement }{@code <}{@link SubProcess }{@code >}

     * {@link JAXBElement }{@code <}{@link UserTask }{@code >}

     * {@link JAXBElement }{@code <}{@link AdHocSubProcess }{@code >}

     * {@link JAXBElement }{@code <}{@link ParallelGateway }{@code >}
     * {@link JAXBElement }{@code <}{@link TTask }{@code >}
     * 
     * 
     */
    @ChildElements
    public List<FlowElement> getFlowElement() {
        if (flowElement == null) {
            flowElement = new ArrayList<FlowElement>();
        }
        return this.flowElement;
    }

    /**
     * Gets the value of the artifact property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the artifact property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getArtifact().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link JAXBElement }{@code <}{@link Artifact }{@code >}
     * {@link JAXBElement }{@code <}{@link Association }{@code >}
     * {@link JAXBElement }{@code <}{@link TGroup }{@code >}
     * {@link JAXBElement }{@code <}{@link TextAnnotation }{@code >}
     * 
     * 
     */
    @ChildElements
    public List<Artifact> getArtifact() {
        if (artifact == null) {
            artifact = new ArrayList<Artifact>();
        }
        return this.artifact;
    }
}
