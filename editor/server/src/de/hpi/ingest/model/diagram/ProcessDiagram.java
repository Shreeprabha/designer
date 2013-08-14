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

package de.hpi.ingest.model.diagram;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlIDREF;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;

import org.oryxeditor.server.diagram.Shape;

import de.hpi.ingest.model.Process;


@XmlRootElement(name = "processDiagram")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "processDiagram", namespace = "http://ingest.org", propOrder = {
    "laneCompartment",
    "sequenceFlowConnector",
    "associationConnector",
    "dataAssociationConnector",
    "messageFlowConnector"
})
public class ProcessDiagram
    extends IngestDiagram
{

    @XmlElement(required = true)
    protected List<LaneCompartment> laneCompartment;
    
    @XmlElement
    protected List<SequenceFlowConnector> sequenceFlowConnector;
    
    @XmlElement
    protected List<AssociationConnector> associationConnector;
    
    @XmlElement
    protected List<DataAssociationConnector> dataAssociationConnector;
    
    @XmlElement
    protected List<MessageFlowConnector> messageFlowConnector;
    
    @XmlAttribute
    @XmlIDREF
    @XmlSchemaType(name = "IDREF")
    protected Process processRef;
    
    public List<Shape> getShapes() {
    	ArrayList<Shape> shapes = new ArrayList<Shape>();
    	
    	/* Add sequence flows */
    	for(SequenceFlowConnector seqCon : this.getSequenceFlowConnector()) {
    		shapes.add(seqCon.toShape());
    	}
    	
    	for(LaneCompartment laneComp : this.getLaneCompartment()) {
    		shapes.addAll(laneComp.toShape());
    	}
    	
    	return shapes;
    }
    
    /* Getter & Setter */
    
    public List<MessageFlowConnector> getMessageFlowConnector() {
      if (messageFlowConnector == null) {
          messageFlowConnector = new ArrayList<MessageFlowConnector>();
      }
      return this.messageFlowConnector;
  }

    /**
     * Gets the value of the laneCompartment property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the laneCompartment property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getLaneCompartment().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link LaneCompartmentType1 }
     * 
     * 
     */
    public List<LaneCompartment> getLaneCompartment() {
        if (laneCompartment == null) {
            laneCompartment = new ArrayList<LaneCompartment>();
        }
        return this.laneCompartment;
    }

    /**
     * Gets the value of the sequenceFlowConnector property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the sequenceFlowConnector property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getSequenceFlowConnector().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link SequenceFlowConnector }
     * 
     * 
     */
    public List<SequenceFlowConnector> getSequenceFlowConnector() {
        if (sequenceFlowConnector == null) {
            sequenceFlowConnector = new ArrayList<SequenceFlowConnector>();
        }
        return this.sequenceFlowConnector;
    }

    /**
     * Gets the value of the associationConnector property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the associationConnector property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getAssociationConnector().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link JAXBElement }{@code <}{@link AssociationConnectorType1 }{@code >}
     * {@link JAXBElement }{@code <}{@link AssociationConnectorType1 }{@code >}
     * 
     * 
     */
    public List<AssociationConnector> getAssociationConnector() {
        if (associationConnector == null) {
            associationConnector = new ArrayList<AssociationConnector>();
        }
        return this.associationConnector;
    }

    /**
     * Gets the value of the dataAssociationConnector property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the dataAssociationConnector property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getDataAssociationConnector().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link DataAssociationConnector }
     * 
     * 
     */
    public List<DataAssociationConnector> getDataAssociationConnector() {
        if (dataAssociationConnector == null) {
            dataAssociationConnector = new ArrayList<DataAssociationConnector>();
        }
        return this.dataAssociationConnector;
    }

    /**
     * Gets the value of the processRef property.
     * 
     * @return
     *     possible object is
     *     {@link Process }
     *     
     */
    public Process getProcessRef() {
        return processRef;
    }

    /**
     * Sets the value of the processRef property.
     * 
     * @param value
     *     allowed object is
     *     {@link Process }
     *     
     */
    public void setProcessRef(Process value) {
        this.processRef = value;
    }

}
