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

import java.security.InvalidKeyException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.oryxeditor.server.diagram.Diagram;
import org.oryxeditor.server.diagram.Shape;

import de.hpi.ingest.annotations.SSetExtension;
import de.hpi.ingest.annotations.StencilId;
import de.hpi.ingest.exceptions.IngestConverterException;
import de.hpi.ingest.factory.AbstractIngestFactory;
import de.hpi.ingest.factory.IngestElement;
import de.hpi.ingest.model.BaseElement;
import de.hpi.ingest.model.Collaboration;
import de.hpi.ingest.model.Definitions;
import de.hpi.ingest.model.FlowElement;
import de.hpi.ingest.model.FlowNode;
import de.hpi.ingest.model.Process;
import de.hpi.ingest.model.activity.Activity;
import de.hpi.ingest.model.activity.SubProcess;
import de.hpi.ingest.model.activity.Task;

import de.hpi.ingest.model.connector.Association;
import de.hpi.ingest.model.connector.DataAssociation;
import de.hpi.ingest.model.connector.DataInputAssociation;
import de.hpi.ingest.model.connector.DataOutputAssociation;
import de.hpi.ingest.model.connector.Edge;
import de.hpi.ingest.model.connector.MessageFlow;
import de.hpi.ingest.model.connector.SequenceFlow;

import de.hpi.ingest.model.data_object.AbstractDataObject;
import de.hpi.ingest.model.data_object.DataStoreReference;
import de.hpi.ingest.model.diagram.AssociationConnector;
import de.hpi.ingest.model.diagram.IngestConnector;
import de.hpi.ingest.model.diagram.IngestDiagram;
import de.hpi.ingest.model.diagram.IngestNode;

import de.hpi.ingest.model.diagram.CollaborationDiagram;

import de.hpi.ingest.model.diagram.LaneCompartment;
import de.hpi.ingest.model.diagram.MessageFlowConnector;
import de.hpi.ingest.model.diagram.PoolCompartment;
import de.hpi.ingest.model.diagram.ProcessDiagram;
import de.hpi.ingest.model.diagram.SequenceFlowConnector;

import de.hpi.ingest.model.event.Event;
import de.hpi.ingest.model.gateway.Gateway;
import de.hpi.ingest.model.gateway.GatewayWithDefaultFlow;
import de.hpi.ingest.model.misc.ProcessType;
import de.hpi.ingest.model.participant.Lane;
import de.hpi.ingest.model.participant.LaneSet;
import de.hpi.ingest.model.participant.Participant;
import de.hpi.diagram.OryxUUID;

/**
 * Converter class for Diagram to  transformation.
 * 
 * @author Philipp Giese
 * @author Sven Wagner-Boysen
 * 
 */
public class Diagram2IngestConverter {
	/* Hash map of factories for element to enable lazy initialization */
	private HashMap<String, AbstractIngestFactory> factories;
	private HashMap<String, IngestElement> IngestElements;
	private Diagram diagram;
	private List<IngestElement> diagramChilds;
	private List<Process> processes;
	private Definitions definitions;
	private LaneCompartment defaultLaneCompartment;

	private Collaboration collaboration;
	private CollaborationDiagram collaborationDiagram;


	private List<Class<? extends AbstractIngestFactory>> factoryClasses;

	/* Define edge ids */
	private final static String[] edgeIdsArray = { "SequenceFlow",
			"Association_Undirected", "Association_Unidirectional",
			"Association_Bidirectional", "MessageFlow", "ConversationLink" };

	public final static HashSet<String> edgeIds = new HashSet<String>(Arrays
			.asList(edgeIdsArray));

	/* Define data related objects ids */
	private final static String[] dataObjectIdsArray = { "DataObject",
			"DataStore", "Message", "ITSystem" };

	public final static HashSet<String> dataObjectIds = new HashSet<String>(
			Arrays.asList(dataObjectIdsArray));

	public Diagram2IngestConverter(Diagram diagram,
			List<Class<? extends AbstractIngestFactory>> factoryClasses) {
		this.factories = new HashMap<String, AbstractIngestFactory>();
		this.IngestElements = new HashMap<String, IngestElement>();
		this.definitions = new Definitions();
		this.definitions.setId(OryxUUID.generate());
		this.diagram = diagram;
		this.factoryClasses = factoryClasses;
	}

	/**
	 * Retrieves the stencil id related hashed factory.
	 * 
	 * @param stencilId
	 *            The stencil id
	 * @return The related factory
	 * @throws ClassNotFoundException
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 */
	private AbstractIngestFactory getFactoryForStencilId(String stencilId)
			throws ClassNotFoundException, InstantiationException,
			IllegalAccessException {
		/* Create a new factory instance if necessary */
		if (!factories.containsKey(stencilId)) {
			this.factories.put(stencilId, createFactoryForStencilId(stencilId));
		}

		return this.factories.get(stencilId);
	}

	/**
	 * Creates a new factory instance for a stencil id.
	 * 
	 * @param stencilId
	 *            The stencil id
	 * @return The created factory
	 * @throws ClassNotFoundException
	 * @throws IllegalAccessException
	 * @throws InstantiationException
	 * 
	 */
	private AbstractIngestFactory createFactoryForStencilId(String stencilId)
			throws ClassNotFoundException, InstantiationException,
			IllegalAccessException {

		/* Find factory for stencil id */
		Class<? extends AbstractIngestFactory> factory = null;
		for (Class<? extends AbstractIngestFactory> factoryClass : factoryClasses) {
			StencilId stencilIdA = (StencilId) factoryClass
					.getAnnotation(StencilId.class);
			if (stencilIdA == null)
				continue;

			/* Check if appropriate stencil id is contained */
			List<String> stencilIds = Arrays.asList(stencilIdA.value());
			if (stencilIds.contains(stencilId)) {
				if (factory == null)
					factory = factoryClass;
				else {
					/* Prefer the general factory class if the necessary stencil
					 * set extension of the specialized factory class is not loaded
					 * in the diagram. */
					SSetExtension oldSSetExtension = factory.getAnnotation(SSetExtension.class);
					if(oldSSetExtension != null) {
						if(!this.diagram.getSsextensions().containsAll(Arrays.asList(oldSSetExtension.value()))) {
							factory = factoryClass;
							continue;
						}
					}
					
					/*
					 * Check if there is a specialized factory for an loaded
					 * extension
					 */
					SSetExtension ssetExtension = factoryClass
					.getAnnotation(SSetExtension.class);
					
					if (ssetExtension == null)
						continue;
					if (this.diagram.getSsextensions().containsAll(
							Arrays.asList(ssetExtension.value())))
						factory = factoryClass;
				}
			}
		}

		if (factory != null)
			return factory.newInstance();

		throw new ClassNotFoundException("Factory for stencil id: '"
				+ stencilId + "' not found!");
	}

	/**
	 * Secures uniqueness of an Element.
	 * 
	 * @param el
	 * @throws InvalidKeyException
	 */
	private void addIngestElement(IngestElement el) throws InvalidKeyException {
		if (this.IngestElements.containsKey(el.getId())) {
			throw new InvalidKeyException(
					"Key already exists for Ingest element!");
		}

		this.IngestElements.put(el.getId(), el);
	}

	/**
	 * Creates the  elements for the parent's child shapes recursively.
	 * 
	 * @param childShapes
	 *            The list of parent's child shapes
	 * @param parent
	 *            The parent {@link IngestElement}
	 * 
	 * @throws ClassNotFoundException
	 * @throws InstantiationException
	 * @throws IllegalAccessException
	 * @throws IngestConverterException
	 * @throws InvalidKeyException
	 */
	private IngestElement createIngestElementsRecursively(Shape shape)
			throws ClassNotFoundException, InstantiationException,
			IllegalAccessException, IngestConverterException, InvalidKeyException {

		/* Build up the Elements of the current shape childs */
		ArrayList<IngestElement> childElements = new ArrayList<IngestElement>();

		/* Create  elements from shapes */
		for (Shape childShape : shape.getChildShapes()) {
			childElements.add(this.createIngestElementsRecursively(childShape));
		}

		if (shape.equals(this.diagram)) {
			this.diagramChilds = childElements;
			return null;
		}

		/* Get the appropriate factory and create the element */
		AbstractIngestFactory factory = this.getFactoryForStencilId(shape
				.getStencilId());

		IngestElement IngestElement = factory.createIngestElement(shape, null);

		/* Add element to flat list of all elements of the diagram */
		this.addIngestElement(IngestElement);

		/* Add childs to current  element */
		for (IngestElement child : childElements) {
			IngestElement.addChild(child);
		}

		return IngestElement;

	}



	/**
	 * Retrieves the edges and updates the source and target references.
	 */
	private void detectConnectors() {
		for (Shape shape : this.diagram.getShapes()) {
			if (!edgeIds.contains(shape.getStencilId())) {
				continue;
			}

			/* Retrieve connector element */
			IngestElement IngestConnector = this.IngestElements.get(shape
					.getResourceId());

			IngestElement source = null;

			/*
			 * Find source of connector. It is assumed that the first none edge
			 * element is the source element.
			 */
			for (Shape incomingShape : shape.getIncomings()) {
				if (edgeIds.contains(incomingShape.getStencilId())) {
					((Edge) IngestConnector.getNode()).getIncoming().add(
							(Edge) this.IngestElements.get(
									incomingShape.getResourceId()).getNode());
					continue;
				}

				source = this.IngestElements.get(incomingShape.getResourceId());
				break;
			}

			/* Update outgoing references */
			for (Shape outgoingShape : shape.getOutgoings()) {
				if (!edgeIds.contains(outgoingShape.getStencilId()))
					continue;
				((Edge) IngestConnector.getNode()).getOutgoing().add(
						(Edge) this.IngestElements.get(
								outgoingShape.getResourceId()).getNode());

			}

			IngestElement target = (shape.getTarget() != null) ? this.IngestElements
					.get(shape.getTarget().getResourceId())
					: null;

			/* Update source references */
			if (source != null) {
				Edge edgeElement = (Edge) IngestConnector.getNode();
				IngestConnector edgeShape = (IngestConnector) IngestConnector
						.getShape();

				/* Correct the source reference if it is an expanded pool */
				if (source.getNode() instanceof LaneSet) {
					PoolCompartment poolShape = (PoolCompartment) source
							.getShape();
					edgeElement.setSourceRef(poolShape.getParticipantRef());
					edgeShape.setSourceRef(poolShape);
				} else {
					FlowElement sourceNode = (FlowElement) source.getNode();
					sourceNode.getOutgoing()
							.add((Edge) IngestConnector.getNode());

					edgeElement.setSourceRef(sourceNode);

					edgeShape.setSourceRef(source.getShape());
				}
			}

			/* Update target references */
			if (target != null) {
				Edge edgeElement = (Edge) IngestConnector.getNode();
				IngestConnector edgeShape = (IngestConnector) IngestConnector
						.getShape();
				/* Correct the target reference if it is an expanded pool. */
				if (target.getNode() instanceof LaneSet) {
					PoolCompartment poolShape = (PoolCompartment) target
							.getShape();
					edgeElement.setTargetRef(poolShape.getParticipantRef());
					edgeShape.setTargetRef(poolShape);
				} else {
					FlowElement targetNode = (FlowElement) target.getNode();
					targetNode.getIncoming()
							.add((Edge) IngestConnector.getNode());

					edgeElement.setTargetRef(targetNode);

					edgeShape.setTargetRef(target.getShape());
				}
			}
		}
	}

	/**
	 * An undirected association that connects a sequence flow and a data object
	 * is split up into a data input and output association.
	 */
	private void updateUndirectedDataAssociationsRefs() {
		for (Shape shape : this.diagram.getShapes()) {
			if (!shape.getStencilId().equalsIgnoreCase("sequenceflow"))
				continue;

			/* Retrieve sequence flow connector element */
			IngestElement seqFlowEle = this.IngestElements.get(shape
					.getResourceId());
			if (seqFlowEle.getNode() instanceof SequenceFlow)
				((SequenceFlow) seqFlowEle.getNode())
						.processUndirectedDataAssociations();
		}
	}

	/**
	 * A {@link DataAssociation} is a child element of an {@link Activity}. This
	 * method updates the references between activities and their data
	 * associations.
	 */
	private void updateDataAssociationsRefs() {
		/* Define edge ids */
		String[] associationIdsArray = { /* "Association_Undirected", */
		"Association_Unidirectional", "Association_Bidirectional" };

		HashSet<String> associationIds = new HashSet<String>(Arrays
				.asList(associationIdsArray));

		for (Shape shape : this.diagram.getShapes()) {
			if (!associationIds.contains(shape.getStencilId())) {
				continue;
			}

			/* Retrieve connector element */
			IngestElement IngestConnector = this.IngestElements.get(shape
					.getResourceId());

			/* Get related activity */
			Edge dataAssociation = (Edge) IngestConnector.getNode();
			Activity relatedActivity = null;
			if (dataAssociation instanceof DataInputAssociation) {
				relatedActivity = (dataAssociation.getTargetRef() instanceof Activity ? (Activity) dataAssociation
						.getTargetRef()
						: null);
				if (relatedActivity != null)
					relatedActivity.getDataInputAssociation().add(
							(DataInputAssociation) dataAssociation);

			} else if (dataAssociation instanceof DataOutputAssociation) {
				relatedActivity = (dataAssociation.getSourceRef() instanceof Activity ? (Activity) dataAssociation
						.getSourceRef()
						: null);
				if (relatedActivity != null)
					relatedActivity.getDataOutputAssociation().add(
							(DataOutputAssociation) dataAssociation);
			}
		}

		/* Update undirected data associations references */
		this.updateUndirectedDataAssociationsRefs();
	}

	/**
	 * Identifies the default sequence flows after all sequence flows are set
	 * correctly.
	 */
	private void setDefaultSequenceFlowOfExclusiveGateway() {
		for (IngestElement element : this.IngestElements.values()) {
			BaseElement base = element.getNode();
			if (base instanceof GatewayWithDefaultFlow) {
				((GatewayWithDefaultFlow) base).findDefaultSequenceFlow();
			}
		}
	}


	/**
	 * Method to handle sub processes
	 * 
	 * @param subProcess
	 */
	private void handleSubProcess(SubProcess subProcess) {
		Process process = new Process();
		process.setId(subProcess.getId());
		process.setSubprocessRef(subProcess);

		List<IngestElement> childs = this.getChildElements(this.IngestElements
				.get(subProcess.getId()));
		for (IngestElement ele : childs) {
			// process.getFlowElement().add((FlowElement) ele.getNode());
			subProcess.getFlowElement().add((FlowElement) ele.getNode());
			if (ele.getNode() instanceof SubProcess)
				this.handleSubProcess((SubProcess) ele.getNode());
		}

		this.processes.add(process);
	}

	/**
	 * Assigns the DataObjectes to the appropriate {@link Process}.
	 */
	private void handleDataObjects() {
		ArrayList<AbstractDataObject> dataObjects = new ArrayList<AbstractDataObject>();
		this.getAllDataObjects(this.diagramChilds, dataObjects);

		for (AbstractDataObject dataObject : dataObjects) {
			if (dataObject.getProcess() != null)
				continue;
			dataObject.findRelatedProcess();

			/* Add a DataStore as a global element */
			if (dataObject instanceof DataStoreReference
					&& ((DataStoreReference) dataObject).getDataStoreRef() != null) {
				this.definitions.getRootElement().add(
						((DataStoreReference) dataObject).getDataStoreRef());
			}

			/*
			 * If no related process was found, add assign to the default
			 * process.
			 */
			if (dataObject.getProcess() == null && this.processes.size() > 0) {
				dataObject.setProcess(this.processes
						.get(this.processes.size() - 1));
				this.processes.get(this.processes.size() - 1).addChild(
						dataObject);
			} else if (dataObject.getProcess() == null) {
				Process process = new Process();
				this.processes.add(process);
				process.setId(OryxUUID.generate());
				process.addChild(dataObject);
				dataObject.setProcess(process);
			}

		}
	}

	/**
	 * Retrieves all data related elements.
	 * 
	 * @param elements
	 *            The list of {@link IngestElement}.
	 * 
	 * @param dataObjects
	 *            The resulting list of {@link AbstractDataObject}
	 */
	private void getAllDataObjects(List<IngestElement> elements,
			List<AbstractDataObject> dataObjects) {
		for (IngestElement element : elements) {
			if (element.getNode() instanceof Lane
					|| element.getNode() instanceof SubProcess) {
				getAllDataObjects(this.getChildElements(element), dataObjects);
				continue;
			}

			if (element.getNode() instanceof AbstractDataObject) {
				dataObjects.add((AbstractDataObject) element.getNode());
			}
		}
	}



	/**
	 * @return All {@link Task} contained in the diagram.
	 */
	private List<Task> getAllTasks() {
		ArrayList<Task> activities = new ArrayList<Task>();
		for (IngestElement element : this.IngestElements.values()) {
			if (element.getNode() instanceof Task)
				activities.add((Task) element.getNode());
		}

		return activities;
	}

	/**
	 * Identifies sets of nodes, connected through SequenceFlows.
	 */
	private void identifyProcesses() {
		this.processes = new ArrayList<Process>();

		List<FlowNode> allNodes = new ArrayList<FlowNode>();
		this.getAllNodesRecursively(this.diagramChilds, allNodes);

		// handle subprocesses => trivial
		for (FlowNode flowNode : allNodes) {
			if (flowNode instanceof SubProcess)
				handleSubProcess((SubProcess) flowNode);
		}

		/* Handle pools, current solution: only one process per pool */
		for (IngestElement element : this.diagramChilds) {
			if (element.getNode() instanceof LaneSet) {
				LaneSet laneSet = (LaneSet) element.getNode();

				Process process = new Process();
				process.setId(OryxUUID.generate());

				/* Process attributes derived from lane set */
				if (laneSet._isClosed != null
						&& laneSet._isClosed.equalsIgnoreCase("true"))
					process.setIsClosed(true);
				else
					process.setIsClosed(false);

				if (laneSet._processType != null) {
					process.setProcessType(ProcessType
							.fromValue(laneSet._processType));
				}

				process.getLaneSet().add(laneSet);
				laneSet.setProcess(process);

				process.getFlowElement().addAll(
						((LaneSet) element.getNode()).getChildFlowElements());

				this.processes.add(process);
			}

		}

		/* Identify components within allNodes */
		while (allNodes.size() > 0) {
			Process currentProcess = new Process();
			currentProcess.setId(OryxUUID.generate());
			this.processes.add(currentProcess);

			addNode(currentProcess,
					this.getIngestElementForNode(allNodes.get(0)), allNodes);
		}

		this.addSequenceFlowsToProcess();

		/* Set processRefs */
		for (Process p : this.processes) {
			for (FlowElement el : p.getFlowElement()) {
				el.setProcess(p);
			}
		}
	}

	/**
	 * Adds {@link Edge} to the related process.
	 */
	private void addSequenceFlowsToProcess() {
		for (IngestElement element : this.diagramChilds) {
			if (!(element.getNode() instanceof SequenceFlow))
				continue;

			Edge edge = (Edge) element.getNode();
			/* Find process for edge */
			for (Process process : this.processes) {
				List<FlowElement> flowElements;
				if (process.isSubprocess())
					flowElements = process.getSubprocessRef().getFlowElement();
				else
					flowElements = process.getFlowElement();

				if (flowElements.contains(edge.getSourceRef())
						|| flowElements.contains(edge.getTargetRef())) {
					flowElements.add(edge);
					break;
				}
			}
		}
	}

	/**
	 * Helper method to get the {@link IngestElement} for the given
	 * {@link FlowNode} from the list of elements.
	 * 
	 * @param node
	 *            The concerning {@link FlowNode}
	 * @return The related {@link IngestElement}
	 */
	private IngestElement getIngestElementForNode(FlowNode node) {
		return this.IngestElements.get(node.getId());
	}

	/**
	 * Adds the node to the connected set of nodes.
	 * 
	 * @param process
	 * @param element
	 * @param allNodes
	 */
	private void addNode(Process process, IngestElement element,
			List<FlowNode> allNodes) {
		if (!(element.getNode() instanceof FlowNode)
				|| !allNodes.contains(element.getNode())) {
			return;
		}
		FlowNode node = (FlowNode) element.getNode();

		allNodes.remove(node);

		node.setProcess(process);
		process.addChild(node);

		/* Handle sequence flows */
		/* Attention: navigate into both directions! */
		for (SequenceFlow seqFlow : node.getIncomingSequenceFlows()) {
			if (seqFlow.sourceAndTargetContainedInSamePool()) {
				addNode(process, this.getIngestElementForNode((FlowNode) seqFlow
						.getSourceRef()), allNodes);
			}
		}

		for (SequenceFlow seqFlow : node.getOutgoingSequenceFlows()) {
			if (seqFlow.sourceAndTargetContainedInSamePool()) {
				addNode(process, this.getIngestElementForNode((FlowNode) seqFlow
						.getTargetRef()), allNodes);
			}
		}
	}

	/**
	 * Retrieves all nodes included into the diagram and stop recursion at
	 * subprocesses.
	 * 
	 * @param elements
	 *            The child elements of a parentelement
	 * @param allNodes
	 *            The list to store every element
	 */
	private void getAllNodesRecursively(List<IngestElement> elements,
			List<FlowNode> allNodes) {
		for (IngestElement element : elements) {
			if (element.getNode() instanceof Lane) {
				getAllNodesRecursively(this.getChildElements(element), allNodes);
				continue;
			}
			if (!(element.getNode() instanceof FlowNode)) {
				continue;
			}

			FlowNode node = (FlowNode) element.getNode();

			if (node instanceof Activity || node instanceof Event
					|| node instanceof Gateway) {
				allNodes.add(node);
			}
		}
	}

	/**
	 * Retrieve the child elements of a  element from within all 
	 * elements in the diagram.
	 * 
	 * @param element
	 *            The parent Element
	 * @return
	 */
	private List<IngestElement> getChildElements(IngestElement element) {
		List<IngestElement> childElements = new ArrayList<IngestElement>();
		for (Shape shape : this.diagram.getShapes()) {
			if (!shape.getResourceId().equals(element.getId())) {
				continue;
			}
			for (Shape child : shape.getChildShapes()) {
				childElements.add(this.IngestElements.get(child.getResourceId()));
			}
		}

		return childElements;
	}

	private void insertSubprocessIntoDefinitions(ProcessDiagram processDia,
			Process process) {
		LaneCompartment lane = new LaneCompartment();
		lane.setId(OryxUUID.generate() + "_gui");
		lane.setIsVisible(false);

		/* Insert elements */
		for (FlowElement flowEle : process.getSubprocessRef().getFlowElement()) {
			if (flowEle instanceof FlowNode) {
				lane.getIngestShape().add(
						(IngestNode) this.IngestElements.get(flowEle.getId())
								.getShape());
			}
			/* Insert sequence flows */
			else if (flowEle instanceof SequenceFlow) {
				processDia.getSequenceFlowConnector().add(
						(SequenceFlowConnector) this.IngestElements.get(
								flowEle.getId()).getShape());
			}
		}

		processDia.getLaneCompartment().add(lane);

		/* Insert process into document */
		this.definitions.getDiagram().add(processDia);
	}

	/**
	 * Creates a process diagram for each identified process.
	 */
	private void insertProcessesIntoDefinitions() {
		for (Process process : this.processes) {

			ProcessDiagram processDia = new ProcessDiagram();
			processDia.setProcessRef(process);
			processDia.setName(process.getName());
			processDia.setId(process.getId() + "_gui");

			/* Handle subprocesses */
			if (process.isSubprocess()) {
				this.insertSubprocessIntoDefinitions(processDia, process);
				continue;
			}

			/* Insert lane compartments */
			for (LaneSet laneSet : process.getLaneSet()) {
				PoolCompartment poolComp = (PoolCompartment) this.IngestElements
						.get(laneSet.getId()).getShape();
				for (LaneCompartment laneComp : poolComp.getLane()) {
					processDia.getLaneCompartment().add(laneComp);
				}
			}

			/* Insert default lane set with one lane */
			if (process.getLaneSet().size() == 0) {

				LaneSet defaultLaneSet = new LaneSet();
				defaultLaneSet.setProcess(process);
				defaultLaneSet.setId(OryxUUID.generate());

				Lane defaultLane = new Lane();
				defaultLaneSet.getLanes().add(defaultLane);
				defaultLane.setId(OryxUUID.generate());
				defaultLane.setName("DefaultLane");
				defaultLane.setLaneSet(defaultLaneSet);

				LaneCompartment defaultLaneComp = new LaneCompartment();
				defaultLaneComp.setId(defaultLane.getId() + "_gui");
				defaultLaneComp.setIsVisible(false);
				defaultLaneComp.setName(defaultLane.getName());

				processDia.getLaneCompartment().add(defaultLaneComp);

				for (FlowElement node : process.getFlowElement()) {
					if (node instanceof FlowNode) {
						defaultLane.getFlowElementRef().add(node);
						defaultLaneComp.getIngestShape().add(
								(IngestNode) this.IngestElements.get(node.getId())
										.getShape());
					}
				}

				process.getLaneSet().add(defaultLaneSet);
				this.defaultLaneCompartment = defaultLaneComp;
			}

			/* Insert Sequence Flow */
			for (FlowElement flowEle : process.getFlowElement()) {
				if (flowEle instanceof SequenceFlow) {
					processDia.getSequenceFlowConnector().add(
							(SequenceFlowConnector) this.IngestElements.get(
									flowEle.getId()).getShape());
				}
			}

			/* Insert process into document */
			this.definitions.getRootElement().add(process);
			this.definitions.getDiagram().add(processDia);
		}
	}

	/**
	 * Searches elements that are only allowed in a collaboration diagram and
	 * creates one if necessary.
	 */
	private void insertCollaborationElements() {
		boolean collaborationIncluded = false;
		for (IngestElement element : this.diagramChilds) {
			if (element.getShape() instanceof PoolCompartment) {
				PoolCompartment pool = (PoolCompartment) element.getShape();
				this.setProcessForPool(pool);
				this.getCollaborationDiagram().getPool().add(pool);
				this.getCollaboration().getParticipant().add(
						pool.getParticipantRef());

				collaborationIncluded = true;
			}
			if (element.getNode() instanceof MessageFlow) {
				this.getCollaborationDiagram().getMessageFlowConnector().add(
						(MessageFlowConnector) element.getShape());
				this.getCollaboration().getMessageFlow().add(
						(MessageFlow) element.getNode());

				collaborationIncluded = true;
			}
		}

		if (collaborationIncluded && this.defaultLaneCompartment != null) {
			PoolCompartment poolComp = new PoolCompartment();
			poolComp.setIsVisible(false);
			poolComp.setId(OryxUUID.generate() + "_gui");
			poolComp.getLane().add(this.defaultLaneCompartment);

			Participant participant = new Participant();
			participant.setId(OryxUUID.generate());
			poolComp.setParticipantRef(participant);
			this.getCollaborationDiagram().getPool().add(poolComp);
			this.getCollaboration().getParticipant().add(participant);
		}

		/*
		 * Assure that the constrained of at least two pools in a collaboration
		 * diagram is fulfilled
		 */
		if (collaborationIncluded
				&& this.getCollaborationDiagram().getPool().size() >= 2) {
			this.definitions.getDiagram().add(this.getCollaborationDiagram());
			this.definitions.getRootElement().add(this.getCollaboration());
		}
	}

	/**
	 * Based on the passed pool, it searches for the appropriate process
	 * diagram, to retrieve the related process object.
	 * 
	 * @param pool
	 *            Resource pool
	 */
	private void setProcessForPool(PoolCompartment pool) {
		for (IngestDiagram dia : this.definitions.getDiagram()) {
			if (!(dia instanceof ProcessDiagram))
				continue;
			for (LaneCompartment lane : ((ProcessDiagram) dia)
					.getLaneCompartment()) {
				for (LaneCompartment poolLane : pool.getLane()) {
					if (lane.equals(poolLane)) {
						pool.getParticipantRef().setProcessRef(
								((ProcessDiagram) dia).getProcessRef());
						return;
					}
				}
			}
		}
	}

	



	/**
	 * Sets attributes of the {@link Definitions} element.
	 */
	private void setDefinitionsAttributes() {
		/* Set targetnamespace */
		String targetnamespace = diagram.getProperty("targetnamespace");
		if (targetnamespace == null)
			targetnamespace = "http://www.omg.org/ingest";
		this.definitions.setTargetNamespace(targetnamespace);

		/* Additional namespace definitions */
		try {
			String namespacesProperty = this.diagram.getProperty("namespaces");
			JSONObject namespaces = new JSONObject(namespacesProperty);
			JSONArray namespaceItems = namespaces.getJSONArray("items");

			/*
			 * Retrieve namespace declarations and put them to namespaces
			 * attribute.
			 */
			for (int i = 0; i < namespaceItems.length(); i++) {
				JSONObject namespace = namespaceItems.getJSONObject(i);
				this.definitions.getNamespaces().put(
						namespace.getString("prefix"),
						namespace.getString("url"));
			}
		} catch (JSONException e) {
			// ignore namespace property
		} catch (NullPointerException np) {

		}

		/* Expression Language */
		String exprLanguage = diagram.getProperty("expressionlanguage");
		if (exprLanguage != null && !exprLanguage.isEmpty())
			this.definitions.setExpressionLanguage(exprLanguage);

		/* Type Language */
		String typeLanguage = diagram.getProperty("typelanguage");
		if (typeLanguage != null && !typeLanguage.isEmpty())
			this.definitions.setTypeLanguage(typeLanguage);
	}

	/**
	 * Method to create input output specification based on data inputs and
	 * outputs.
	 */
	private void setIOSpecification() {
		for (Task t : this.getAllTasks())
			t.determineIoSpecification();
	}


	public Definitions getDefinitionsFromDiagram()
			throws IngestConverterException {

		/* Build-up the definitions as root element of the document */
		this.setDefinitionsAttributes();

		/* Convert shapes toelements */

		try {
			createIngestElementsRecursively(diagram);
		} catch (Exception e) {
			/* Pack exceptions in a  converter exception */
			throw new IngestConverterException(
					"Error while converting to Ingest model", e);
		}

		this.detectConnectors();

		/* Section to handle data concerning aspects */
		this.updateDataAssociationsRefs();
		this.setIOSpecification();

		this.setDefaultSequenceFlowOfExclusiveGateway();
	
		

		this.identifyProcesses();

		this.handleDataObjects();

		this.insertProcessesIntoDefinitions();
		this.insertCollaborationElements();

		return definitions;
	}

	/* Getter & Setter */

	/**
	 * @return The list of  's stencil set edgeIds
	 */
	public static HashSet<String> getEdgeIds() {
		return edgeIds;
	}

	/**
	 * @return the collaborationDiagram
	 */
	private CollaborationDiagram getCollaborationDiagram() {
		if (this.collaborationDiagram == null) {
			this.collaborationDiagram = new CollaborationDiagram();
			this.collaborationDiagram.setId(this.getCollaboration().getId()
					+ "_gui");
			this.collaborationDiagram.setCollaborationRef(this
					.getCollaboration());
		}
		return collaborationDiagram;
	}

	/**
	 * @return the collaboration
	 */
	private Collaboration getCollaboration() {
		if (this.collaboration == null) {
			this.collaboration = new Collaboration();
			this.collaboration.setId(OryxUUID.generate());
		}
		return this.collaboration;
	}
}
