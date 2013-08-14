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

package de.hpi.ingest.migration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import org.json.JSONException;
import org.oryxeditor.server.diagram.Diagram;
import org.oryxeditor.server.diagram.DiagramBuilder;
import org.oryxeditor.server.diagram.JSONBuilder;
import org.oryxeditor.server.diagram.Shape;
import org.oryxeditor.server.diagram.StencilSet;

import de.hpi.ingest.exceptions.IngestMigrationException;
import de.hpi.ingest.exceptions.MigrationHelperException;

/**
 * @author Philipp Giese
 *
 */
public class IngestMigrator {

	private Diagram diagram;
	private String path;
	private MigrationHelper helper;
	
	private HashSet<Shape> activityShapes 					= new HashSet<Shape>();
	private HashSet<Shape> gatewayShapes  					= new HashSet<Shape>();
	private HashSet<Shape> swimlaneShapes 					= new HashSet<Shape>();
	private HashSet<Shape> artifactShapes					= new HashSet<Shape>();
	private HashSet<Shape> startEventShapes 				= new HashSet<Shape>();
	private HashSet<Shape> endEventShapes 				   	= new HashSet<Shape>();
	private HashSet<Shape> connectorShapes					= new HashSet<Shape>();
	
	private ArrayList<String> stencilSetExtensions;
	
	public IngestMigrator(String json) throws IngestMigrationException {
		try {
			
			diagram = DiagramBuilder.parseJson(json, true);
			stencilSetExtensions = diagram.getSsextensions();
			
			initializeShapes(diagram.getChildShapes());
			
		} catch (JSONException e) {
			throw new IngestMigrationException("Error while Transforming the Diagram to JSON!");
		} 
	}
	
	/**
	 * Splits up all child shapes of a given shape to their 
	 * belonging category
	 * 
	 * @param shapes
	 */
	private void initializeShapes(ArrayList<Shape> shapes) {
		for(Shape shape : shapes) {
		
			if(shape.getChildShapes().size() > 0)
				this.initializeShapes(shape.getChildShapes());
			
			String stencilId = shape.getStencilId();
			
			/*
			 * Activities:
			 * 	- Task
			 * 	- Subprocess
			 * 	- Collapsed Subprocess
			 */
			if(MigrationHelper.acitivityIds.contains(stencilId)) 
				activityShapes.add(shape);
						
			/*
			 * Gateways:
			 * 	- Exclusive Databased 
			
			 * 	- Parallel 
		
			 */
			if(MigrationHelper.gatewayIds.contains(stencilId))
				gatewayShapes.add(shape);
			
			/*
			 * Swimlanes:
			 * 	- Pool
			 * 	- Collapsed Pool
			 * 	- Lane
			 */
			if(MigrationHelper.swimlaneIds.contains(stencilId))
				swimlaneShapes.add(shape);
			
			/*
			 * Artifacts:
			 * 	- Group
			 * 	- Text Annotation
			 * 	- DataObject 
			 */
			if(MigrationHelper.artifactIds.contains(stencilId))
				artifactShapes.add(shape);
			
			/*
			 * StartEvents:
			 * 	- None
			
			 */
			if(MigrationHelper.startEventIds.contains(stencilId))
				startEventShapes.add(shape);
		
			/*
			 * EndEvents:
			 *  - None
			 *  - Terminate
			 */
			if(MigrationHelper.endEventIds.contains(stencilId))
				endEventShapes.add(shape);
			
			/*
			 * Connectors:
			 *  - Sequence Flow
			 *  - Message Flow
			 *  - Undirected Association
			 *  - Unidirectional Association
			 *  - Bidirectional Association
			 */
			if(MigrationHelper.connectorIds.contains(stencilId))
				connectorShapes.add(shape);
			
		}
	}

	/**
	 * Migrates the given Document into its representation in
	 * 
	 * 
	 * @return 
	 * @throws IngestMigrationException
	 */
	public String migrate(String stencilsetPath) throws IngestMigrationException {

		try {
		
			path = stencilsetPath;
			
			if(diagram.getStencilset().equals("http://b3mn.org/stencilset/ingest#"))
				return JSONBuilder.parseModeltoString(diagram);
			
			/* Convert the Namespace and URL */
			StencilSet ss = new StencilSet(org.oryxeditor.server.EditorHandler.oryx_path + "/stencilsets/ingest/ingest.json", "http://b3mn.org/stencilset/ingest#");
			diagram.setStencilset(ss);		
			migrateActivities();
			migrateGateways();
			migrateSwimlanes();
			migrateArtifacts();
			migrateStartEvents();
			migrateEndEvents();
			migrateConnectors();		
			activateStencilSetExtensions();
			
			return JSONBuilder.parseModeltoString(diagram);		
			
		} catch(JSONException e) {
			throw new IngestMigrationException("Error while converting the Diagram to JSON!");
		}
	}

	/**
	 * Adds the correct Stencilset Extensions
	 */
	private void activateStencilSetExtensions() {
		
		ArrayList<String> extensions = new ArrayList<String>();
		
		for(String ssextension : stencilSetExtensions) {			
			
			if(ssextension.equals("http://oryx-editor.org/stencilsets/extensions/migration#")) {
				extensions.add("http://oryx-editor.org/stencilsets/extensions/access#");
			} 
		}
		
		diagram.setSsextensions(extensions);
		
	}

	/**
	 * Migrates all Connectors
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateConnectors() throws IngestMigrationException {
		
		try {
		
			for(Shape connector : connectorShapes) {
				updateProperties(connector);
			}
			
		} catch(MigrationHelperException e) {
			throw new IngestMigrationException("Error while migrating the Connectors!");
		}
	}
	
	/**
	 * Migrates all End Events
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateEndEvents() throws IngestMigrationException {
		
		try {
		
			for(Shape endEvent : endEventShapes) {
				String stencilId = endEvent.getStencilId();
				
				/* Update obsolete StencilIds */
				if(stencilId.equals("EndEvent"))
					endEvent.getStencil().setId("EndNoneEvent");
				
				updateProperties(endEvent);
			}
			
		} catch(MigrationHelperException e) {
			throw new IngestMigrationException("Error while migrating the End Events!");
		}
	}
	


	
	/**
	 * Migrates all Start Events
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateStartEvents() throws IngestMigrationException {
		
		try {
		
			for(Shape startEvent : startEventShapes) {
				String stencilId = startEvent.getStencilId();
				
				/* Update obsolete StencilIds */
				if(stencilId.equals("StartEvent"))
					startEvent.getStencil().setId("StartNoneEvent");

				updateProperties(startEvent);
			}
		
		} catch(MigrationHelperException e) {
			throw new IngestMigrationException("Error while migrating the Start Events!");
		}
	}
	
	/**
	 * Migrates all Artifacts
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateArtifacts() throws IngestMigrationException {
		
		try {
		
			for(Shape artifact : artifactShapes) {
				updateProperties(artifact);
			}
			
		} catch(MigrationHelperException e) {
			throw new IngestMigrationException("Error while migrating the Artifacts!");
		}
	}
	
	/**
	 * Migrates all Swimlanes
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateSwimlanes() throws IngestMigrationException {
		
		try {
		
			for(Shape swimlane : swimlaneShapes) {
				updateProperties(swimlane);	
			}
		
		} catch(MigrationHelperException e) {			
			throw new IngestMigrationException("Error while migrating the Swimlanes");			
		}
	}
	
	/**
	 * Migrates all Gateways
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateGateways() throws IngestMigrationException {
		
		try {
		
			for(Shape gateway : gatewayShapes) {
	
				String stencilId = gateway.getStencilId();
				
				/* Update obsolete Stencil Ids */
				if(stencilId.equals("AND_Gateway"))
					gateway.getStencil().setId("ParallelGateway");
				else if(stencilId.equals("Exclusive_Eventbased_Gateway"))
					gateway.getStencil().setId("EventbasedGateway");
				
				updateProperties(gateway);
			}
			
		} catch (MigrationHelperException e) {
			throw new IngestMigrationException("Error while migrating the Gateways!");
		}			
	}
	
	/**
	 * Migrates all Activities
	 * 
	 * @throws IngestMigrationException 
	 */
	private void migrateActivities() throws IngestMigrationException {
		
		try {
		
			for(Shape activity : activityShapes) {				
				updateProperties(activity);
				
				HashMap<String, String> props = activity.getProperties();			
				String id = activity.getStencilId();			
			
				if(id.equals("Task")) {
					String taskType = activity.getProperty("tasktype");
					
					if(taskType.equals("Reference"))
						props.put("tasktype", "None");
					else
						props.put("tasktype", activity.getProperty("tasktype"));
					
				}
				
				/* Remove depreciated Attrs */
				props.remove("mi_ordering");
			}
		
		} catch (MigrationHelperException e) {			
			throw new IngestMigrationException("Error while migrating the Activities!");			
		}
	}	
	
	/**
	 * Adds all properties that are new in 
	 * 
	 * @param shape
	 * @return 
	 * @throws MigrationHelperException 
	 */
	private void updateProperties(Shape shape) throws MigrationHelperException {
		if (this.helper == null)
			this.helper = new MigrationHelper(path);
		
		HashMap<String, String> properties = this.helper.getProperties(shape.getStencilId());
		
		/* find the properties and add them */
		for(String property : properties.keySet()) {
			if(shape.getProperty(property.toLowerCase()) == null) {
				shape.getProperties().put(property.toLowerCase(), properties.get(property));
			}
		}
	}
}