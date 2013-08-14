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

import de.hpi.ingest.annotations.Property;
import de.hpi.ingest.annotations.StencilId;
import de.hpi.ingest.exceptions.IngestConverterException;
import de.hpi.ingest.model.AdHocOrdering;
import de.hpi.ingest.model.BaseElement;
import de.hpi.ingest.model.FormalExpression;
import de.hpi.ingest.model.activity.Activity;
import de.hpi.ingest.model.activity.AdHocSubProcess;

import de.hpi.ingest.model.activity.SubProcess;

import de.hpi.ingest.model.diagram.activity.CalledSubprocessShape;
import de.hpi.ingest.model.diagram.activity.EmbeddedSubprocessShape;
import de.hpi.ingest.model.diagram.activity.SubprocessShape;

/**
 * Factory to handle all types subprocesses in a process diagram
 * 
 * @author Sven Wagner-Boysen
 *
 */
@StencilId({
	"CollapsedSubprocess",
	"Subprocess",
	"CollapsedEventSubprocess",
	"EventSubprocess"
})
public class SubprocessFactory extends AbstractActivityFactory {

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor.server.diagram.Shape, de.hpi.ingest.factory.IngestElement)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent)
			throws IngestConverterException {
		
		return this.createSubprocess(shape);
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected Object createDiagramElement(Shape shape) {
		// TODO Auto-generated method stub
		return null;
	}

	/* (non-Javadoc)
	 * @see de.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected BaseElement createProcessElement(Shape shape)
			throws IngestConverterException {

		return null;
	}
	
	
	
	@Property(name = "isadhoc", value = "true")
	protected AdHocSubProcess createAdhocSubprocess(Shape shape) {
		AdHocSubProcess adhocSub = new AdHocSubProcess();
		/* Mapping of properties */
		String condition = shape.getProperty("adhoccompletioncondition");
		if(condition != null && ! condition.isEmpty()) 
			adhocSub.setCompletionCondition(new FormalExpression(condition));
		
		String ordering = shape.getProperty("adhocordering");
		if(ordering != null) {
			adhocSub.setOrdering(AdHocOrdering.fromValue(shape.getProperty("adhocordering")));
		}
		
		String cancelRemIns = shape.getProperty("adhoccancelremaininginstances");
		if(cancelRemIns != null)
			adhocSub.setCancelRemainingInstances(!cancelRemIns.equalsIgnoreCase("false"));
		
		return adhocSub;
	}
	
	protected IngestElement createSubprocess(Shape shape) throws IngestConverterException {
		Activity subprocess = null;
		try {
			subprocess = (Activity) this.invokeCreatorMethodAfterProperty(shape);

		} catch (Exception e) {
//			throw new IngestConverterException("Error creating subprocess elements.", e);
		} 
		
		if(subprocess == null) 
			subprocess = new SubProcess();
		
		this.setStandardAttributes(subprocess, shape);
		
		SubprocessShape subproShape = new EmbeddedSubprocessShape();
		this.setVisualAttributes(subproShape, shape);
		
		subproShape.setDiagramLink(shape.getProperty("entry"));
		
		/* Mark as collapsed or expanded */
		if(shape.getStencilId().matches(".*Collapsed.*")) {
			subproShape.setIsExpanded(false);
		} else {
			subproShape.setIsExpanded(true);
		}
		
		subprocess.setId(shape.getResourceId());
		subprocess.setName(shape.getProperty("name"));
		
		return new IngestElement(subproShape, subprocess, shape.getResourceId());
	}

}
