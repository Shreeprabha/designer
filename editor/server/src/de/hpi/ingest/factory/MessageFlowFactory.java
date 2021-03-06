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
import de.hpi.ingest.model.connector.MessageFlow;
import de.hpi.ingest.model.diagram.MessageFlowConnector;

/**
 * Factory that creates {@link MessageFlow}
 * 
 * @author Philipp Giese
 * @author Sven Wagner-Boysen
 *
 */
@StencilId("MessageFlow")
public class MessageFlowFactory extends AbstractEdgesFactory {

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor.server.diagram.Shape, de.hpi.ingest.factory.IngestElement)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent)
			throws IngestConverterException {
		MessageFlowConnector msgFlowShape = this.createDiagramElement(shape);
		MessageFlow msgFlow = this.createProcessElement(shape);
		msgFlowShape.setMessageFlowRef(msgFlow);
		
		return new IngestElement(msgFlowShape, msgFlow, shape.getResourceId());
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected MessageFlowConnector createDiagramElement(Shape shape) {
		MessageFlowConnector msgFlowShape = new MessageFlowConnector();
		this.setBendpoints(msgFlowShape, shape);
		msgFlowShape.setId(shape.getResourceId() + "_gui");
		msgFlowShape.setLabel(shape.getProperty("name"));
		 
		return msgFlowShape;
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected MessageFlow createProcessElement(Shape shape)
			throws IngestConverterException {
		MessageFlow msgFlow = new MessageFlow();
		this.setCommonAttributes(msgFlow, shape);
		msgFlow.setId(shape.getResourceId());
		msgFlow.setName(shape.getProperty("name"));
		
		return msgFlow;
	}

}
