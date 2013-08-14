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

package de.hpi.ingest.transformation;

import java.util.ArrayList;
import java.util.List;

import org.oryxeditor.server.diagram.Diagram;
import org.oryxeditor.server.diagram.Shape;
import org.oryxeditor.server.diagram.StencilSet;
import org.oryxeditor.server.diagram.StencilType;

import de.hpi.ingest.model.Definitions;
import de.hpi.ingest.model.diagram.CollaborationDiagram;
import de.hpi.ingest.model.diagram.ProcessDiagram;

/**
 * Converter that transforms a {@link Definition} to a {@link Diagram}
 * 
 * @author Sven Wagner-Boysen
 *
 */
public class Ingest2DiagramConverter {
	
	private String rootDir;
	
	public Ingest2DiagramConverter(String rootDir) {
		this.rootDir = rootDir;
	}
	
	public List<Diagram> getDiagramFromIngest(Definitions definitions) {
		List<Diagram> diagrams = new ArrayList<Diagram>();
		
		
		/* Handle collaborations
		 * For each collaboration an own diagram is created. */
		CollaborationDiagram colDia = null;
		while((colDia = definitions.getCollaborationDiagram()) != null) {
			String resourceId = "oryx-canvas123";
			StencilType type = new StencilType("IngestDiagram");
			String stencilSetNs = "http://b3mn.org/stencilset/ingest#";
			String url = rootDir + "stencilsets/ingest/ingest.json";
			StencilSet stencilSet = new StencilSet(url, stencilSetNs);
			Diagram diagram = new Diagram(resourceId, type, stencilSet);
			
			List<Shape> shapes = new ArrayList<Shape>();
			
			shapes.addAll(colDia.getShapes(definitions));
			diagram.getChildShapes().addAll(shapes);
			definitions.getDiagram().remove(colDia);
			
			diagrams.add(diagram);
		}
		
		/* Handle the remaining process diagrams */
		ProcessDiagram processDia = null;
		while((processDia = definitions.getProcessDiagram()) != null) {
			String resourceId = "oryx-canvas123";
			StencilType type = new StencilType("IngestDiagram");
			String stencilSetNs = "http://b3mn.org/stencilset/ingest#";
			String url = rootDir + "stencilsets/ingest/ingest.json";
			StencilSet stencilSet = new StencilSet(url, stencilSetNs);
			Diagram diagram = new Diagram(resourceId, type, stencilSet);
			
			List<Shape> shapes = new ArrayList<Shape>();
			
			shapes.addAll(processDia.getShapes());
			diagram.getChildShapes().addAll(shapes);
			
			definitions.getDiagram().remove(processDia);
			
			diagrams.add(diagram);
		}
		
		return diagrams;
	}
}
