//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, v2.1-b02-fcs 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2009.09.07 at 02:19:19 PM CEST 
//

package de.hpi.ingest.model.event;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import org.oryxeditor.server.diagram.Shape;
import org.oryxeditor.server.diagram.StencilType;


@XmlRootElement(name = "endEvent")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tEndEvent")
public class EndEvent extends ThrowEvent {
	/**
	 * Transforming an end event to its JSON-based shape representation.
	 */
	public void toShape(Shape shape) {
		super.toShape(shape);

		shape.setStencil(new StencilType("EndNoneEvent"));
	}

}
