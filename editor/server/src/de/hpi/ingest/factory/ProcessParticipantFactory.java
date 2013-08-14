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
import de.hpi.ingest.model.BaseElement;
import de.hpi.ingest.model.artifacts.ProcessParticipant;
import de.hpi.ingest.model.diagram.ProcessParticipantShape;

/**
 * @author Philipp Giese
 * @author Sven Wagner-Boysen
 *
 */
@StencilId("processparticipant")
public class ProcessParticipantFactory extends AbstractIngestFactory {

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor.server.diagram.Shape, de.hpi.ingest.factory.IngestElement)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent)
			throws IngestConverterException {
		ProcessParticipantShape processParticipantShape = (ProcessParticipantShape) this.createDiagramElement(shape);
		ProcessParticipant processParticipant = (ProcessParticipant) this.createProcessElement(shape);
		
		processParticipantShape.setProcessParticipantRef(processParticipant);
		
		return new IngestElement(processParticipantShape, processParticipant, shape.getResourceId());
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected Object createDiagramElement(Shape shape) {
		ProcessParticipantShape processParticipantShape = new ProcessParticipantShape();
		
		this.setVisualAttributes(processParticipantShape, shape);
		
		return processParticipantShape;
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected BaseElement createProcessElement(Shape shape)
			throws IngestConverterException {
		ProcessParticipant system = new ProcessParticipant();
		this.setCommonAttributes(system, shape);
		
		system.setName(shape.getProperty("name"));
		system.setId(shape.getResourceId());
		
		return system;
	}

}
