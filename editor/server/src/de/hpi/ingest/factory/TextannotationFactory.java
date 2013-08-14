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
import de.hpi.ingest.model.artifacts.TextAnnotation;
import de.hpi.ingest.model.diagram.TextAnnotationShape;

/**
 * Factor to create {@link TextAnnotation}
 * 
 * @author Philipp Giese
 * @author Sven Wagner-Boysen
 *
 */
@StencilId("TextAnnotation")
public class TextannotationFactory extends AbstractIngestFactory {

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor.server.diagram.Shape, de.hpi.ingest.factory.IngestElement)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent)
			throws IngestConverterException {
		TextAnnotationShape textShape = this.createDiagramElement(shape);
		TextAnnotation text = this.createProcessElement(shape);
		textShape.setAnnotationRef(text);
		
		return new IngestElement(textShape, text, shape.getResourceId());
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected TextAnnotationShape createDiagramElement(Shape shape) {
		TextAnnotationShape textShape = new TextAnnotationShape();
		this.setVisualAttributes(textShape, shape);
		
		return textShape;
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected TextAnnotation createProcessElement(Shape shape)
			throws IngestConverterException {
		TextAnnotation text = new TextAnnotation();
		this.setCommonAttributes(text, shape);
		text.setId(shape.getResourceId());
		text.setText(shape.getProperty("text"));
		
		return text;
	}

}
