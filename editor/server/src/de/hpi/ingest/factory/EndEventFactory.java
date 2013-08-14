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

package de.hpi.ingest.factory;

import org.oryxeditor.server.diagram.Shape;

import de.hpi.ingest.annotations.StencilId;
import de.hpi.ingest.exceptions.IngestConverterException;
import de.hpi.ingest.model.diagram.EventShape;


import de.hpi.ingest.model.event.EndEvent;
import de.hpi.ingest.model.event.TerminateEventDefinition;

/**
 * Factory to create end events
 * 
 * @author Sven Wagner-Boysen
 *
 */
@StencilId({
	"EndNoneEvent",
	"EndTerminateEvent"
})
public class EndEventFactory extends AbstractIngestFactory {

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent) throws IngestConverterException {
		EventShape eventShape = (EventShape) this.createDiagramElement(shape);
		EndEvent endEvent = this.createProcessElement(shape);
		
		/* Set Reference from shape to process element */
		eventShape.setEventRef(endEvent);
		
		return new IngestElement(eventShape, endEvent, shape.getResourceId());
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected Object createDiagramElement(Shape shape) {
		EventShape eventShape = new EventShape();
		this.setVisualAttributes(eventShape, shape);
		
		return eventShape;
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected EndEvent createProcessElement(Shape shape) throws IngestConverterException {
		try {
			EndEvent endEvent = (EndEvent) this.invokeCreatorMethod(shape);
			endEvent.setId(shape.getResourceId());
			endEvent.setName(shape.getProperty("name"));
			
			return endEvent;
		} catch (Exception e) {
			/* Wrap exceptions into specific IngestConverterException */
			throw new IngestConverterException(
					"Error while creating the process element of "
							+ shape.getStencilId(), e);
		}
	}
	
	/* Methods for different */
	
	@StencilId("EndNoneEvent")
	protected EndEvent createEndNoneEvent(Shape shape) {
		EndEvent endEvent = new EndEvent();
		
		return endEvent;
	}

	@StencilId("EndTerminateEvent")
	protected EndEvent createEndTerminateEvent(Shape shape) {
		EndEvent endEvent = new EndEvent();
		
		TerminateEventDefinition eventDef = new TerminateEventDefinition();
		endEvent.getEventDefinition().add(eventDef);
		
		return endEvent;
	}
}
