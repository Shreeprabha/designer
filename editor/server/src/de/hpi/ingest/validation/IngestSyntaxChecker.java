package de.hpi.ingest.validation;

import java.util.HashMap;
import java.util.List;

import de.hpi.ingest.model.Definitions;
import de.hpi.ingest.model.FlowElement;
import de.hpi.ingest.model.FlowNode;
import de.hpi.ingest.model.Process;
import de.hpi.ingest.model.RootElement;
import de.hpi.ingest.model.activity.Activity;
import de.hpi.ingest.model.activity.SubProcess;

import de.hpi.ingest.model.connector.DataInputAssociation;
import de.hpi.ingest.model.connector.DataOutputAssociation;
import de.hpi.ingest.model.connector.Edge;
import de.hpi.ingest.model.connector.MessageFlow;
import de.hpi.ingest.model.connector.SequenceFlow;

import de.hpi.ingest.model.data_object.DataInput;
import de.hpi.ingest.model.data_object.DataOutput;
import de.hpi.ingest.model.data_object.Message;

import de.hpi.ingest.model.event.EndEvent;
import de.hpi.ingest.model.event.Event;

import de.hpi.ingest.model.event.StartEvent;

import de.hpi.ingest.model.gateway.Gateway;
import de.hpi.ingest.model.gateway.GatewayDirection;
import de.hpi.ingest.model.participant.Lane;
import de.hpi.ingest.model.participant.Participant;
import de.hpi.diagram.verification.AbstractSyntaxChecker;

/**
 * Copyright (c) 2009 Philipp Giese
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

public class IngestSyntaxChecker extends AbstractSyntaxChecker {

	protected static final String NO_SOURCE = "INGEST_NO_SOURCE";
	protected static final String NO_TARGET = "INGEST_NO_TARGET";
	protected static final String MESSAGE_FLOW_NOT_CONNECTED = "INGEST_MESSAGE_FLOW_NOT_CONNECTED";
	protected static final String DIFFERENT_PROCESS = "INGEST_DIFFERENT_PROCESS";
	protected static final String SAME_PROCESS = "INGEST_SAME_PROCESS";
	protected static final String FLOWOBJECT_NOT_CONTAINED_IN_PROCESS = "INGEST_FLOWOBJECT_NOT_CONTAINED_IN_PROCESS";
	protected static final String ENDEVENT_WITHOUT_INCOMING_CONTROL_FLOW = "INGEST_ENDEVENT_WITHOUT_INCOMING_CONTROL_FLOW";
	protected static final String STARTEVENT_WITHOUT_OUTGOING_CONTROL_FLOW = "INGEST_STARTEVENT_WITHOUT_OUTGOING_CONTROL_FLOW";

	protected static final String STARTEVENT_WITH_INCOMING_CONTROL_FLOW = "INGEST_STARTEVENT_WITH_INCOMING_CONTROL_FLOW";
	protected static final String ENDEVENT_WITH_OUTGOING_CONTROL_FLOW = "INGEST_ENDEVENT_WITH_OUTGOING_CONTROL_FLOW";
	protected static final String EVENTBASEDGATEWAY_BADCONTINUATION = "INGEST_EVENTBASEDGATEWAY_BADCONTINUATION";
	protected static final String NODE_NOT_ALLOWED = "INGEST_NODE_NOT_ALLOWED";
	protected static final String MESSAGE_FLOW_NOT_ALLOWED = "INGEST_MESSAGE_FLOW_NOT_ALLOWED";	
	
	protected static final String DATA_INPUT_WITH_INCOMING_DATA_ASSOCIATION = "INGEST_DATA_INPUT_WITH_INCOMING_DATA_ASSOCIATION";
	protected static final String DATA_OUTPUT_WITH_OUTGOING_DATA_ASSOCIATION = "INGEST_DATA_OUTPUT_WITH_OUTGOING_DATA_ASSOCIATION";
	protected static final String EVENT_BASED_WITH_TOO_LESS_OUTGOING_SEQUENCE_FLOWS = "INGEST_EVENT_BASED_WITH_TOO_LESS_OUTGOING_SEQUENCE_FLOWS";
	protected static final String EVENT_BASED_TARGET_WITH_TOO_MANY_INCOMING_SEQUENCE_FLOWS = "INGEST_EVENT_BASED_TARGET_WITH_TOO_MANY_INCOMING_SEQUENCE_FLOWS";
	protected static final String EVENT_BASED_EVENT_TARGET_CONTRADICTION = "INGEST_EVENT_BASED_EVENT_TARGET_CONTRADICTION";

	protected static final String EVENT_BASED_WRONG_CONDITION_EXPRESSION = "INGEST_EVENT_BASED_WRONG_CONDITION_EXPRESSION";
	protected static final String EVENT_BASED_NOT_INSTANTIATING = "INGEST_EVENT_BASED_NOT_INSTANTIATING";
	protected static final String EVENT_BASED_WITH_TOO_LESS_INCOMING_SEQUENCE_FLOWS = "INGEST_EVENT_BASED_WITH_TOO_LESS_INCOMING_SEQUENCE_FLOWS";

	
	protected static final String GATEWAYDIRECTION_MIXED_FAILURE = "INGEST_GATEWAYDIRECTION_MIXED_FAILURE";
	protected static final String GATEWAYDIRECTION_CONVERGING_FAILURE = "INGEST_GATEWAYDIRECTION_CONVERGING_FAILURE";
	protected static final String GATEWAYDIRECTION_DIVERGING_FAILURE = "INGEST_GATEWAYDIRECTION_DIVERGING_FAILURE";
	protected static final String GATEWAY_WITH_NO_OUTGOING_SEQUENCE_FLOW = "INGEST_GATEWAY_WITH_NO_OUTGOING_SEQUENCE_FLOW";
	
	private Definitions defs;
		
	
	public IngestSyntaxChecker(Definitions defs) {
		this.defs = defs;
		this.errors = new HashMap<String, String>();
	}

	@Override
	public boolean checkSyntax() {
		
		errors.clear();
		
		this.checkEdges();
		this.checkNodes();
		
		return errors.size() == 0;
	}
	
	private void checkEdges() {	
		for(Edge edge : this.defs.getEdges()) {	
			
			if(edge.getSourceRef() == null) {
				this.addError(edge, NO_SOURCE);
				
			} else if(edge.getTargetRef() == null) {
				this.addError(edge, NO_TARGET);
			
			} else {
			
				if(edge instanceof MessageFlow) {			
													
					if(edge.getSourceRef().getProcess() == edge.getTargetRef().getProcess())	
						this.addError(edge, SAME_PROCESS);
										
					
					if(edge.getSourceRef() instanceof Lane || edge.getTargetRef() instanceof Lane)
						this.addError(edge, MESSAGE_FLOW_NOT_ALLOWED);					
					
				} else if(edge instanceof SequenceFlow) {
						
					if(edge.getSourceRef().getProcess() != edge.getTargetRef().getProcess()) 
						this.addError(edge, DIFFERENT_PROCESS);						
					
				}
			}
		}
	}
	
	private void checkNodes() {		
	
		for(RootElement rootElement : this.defs.getRootElement()) {
			
			/*
			 * Checking of Regular INGEST.0 Diagrams
			 */
			if(rootElement instanceof Process) {
				
				for(FlowElement flowElement : ((Process) rootElement).getFlowElement()) {			
					
					if(!(flowElement instanceof Edge)) {
					
						this.checkNode(flowElement);	
					}
				}
			
			} 
		}
	}



	private Integer checkForInitiatingMessages(FlowElement flowElement) {
		Integer initiatingCounter = 0;
		
		// Check outgoing edges
		for(Edge outgoing : flowElement.getOutgoing())			
			if(outgoing.getTargetRef() instanceof Message) 				
				if(((Message) outgoing.getTargetRef()).isInitiating()) 
					initiatingCounter++;				
		
		// Check incoming edges
		for(Edge incoming : flowElement.getIncoming()) 			
			if(incoming.getSourceRef() instanceof Message) 				
				if(((Message) incoming.getSourceRef()).isInitiating())
					initiatingCounter++;
							
		return initiatingCounter;
		
	}

	private void checkNode(FlowElement node) {

		
		if((node instanceof Activity || node instanceof Event || node instanceof Gateway) && node.getProcess() == null) {			
			this.addError(node, FLOWOBJECT_NOT_CONTAINED_IN_PROCESS);			
		}
		
		// Events
		if(node instanceof EndEvent && !this.hasIncomingControlFlow((FlowNode) node))
			this.addError(node, ENDEVENT_WITHOUT_INCOMING_CONTROL_FLOW);
		
		if(node instanceof EndEvent && this.hasOutgoingControlFlow((FlowNode) node))
			this.addError(node, ENDEVENT_WITH_OUTGOING_CONTROL_FLOW);
		
		if(node instanceof StartEvent && this.hasIncomingControlFlow((FlowNode) node))
			this.addError(node, STARTEVENT_WITH_INCOMING_CONTROL_FLOW);
		
		if(node instanceof StartEvent && !this.hasOutgoingControlFlow((FlowNode) node))
			this.addError(node, STARTEVENT_WITHOUT_OUTGOING_CONTROL_FLOW);
				
		// Gateways
		if(node instanceof Gateway) {
			this.checkGateway((Gateway) node);
		}
				
		//Data Objects
		if(node instanceof DataInput)
			for(Edge edge : ((DataInput) node).getIncoming()) 
				if(edge instanceof DataInputAssociation || edge instanceof DataOutputAssociation)
					this.addError(node, DATA_INPUT_WITH_INCOMING_DATA_ASSOCIATION);
		
		if(node instanceof DataOutput)
			for(Edge edge : ((DataOutput) node).getOutgoing())
				if(edge instanceof DataInputAssociation || edge instanceof DataOutputAssociation)
					this.addError(node, DATA_OUTPUT_WITH_OUTGOING_DATA_ASSOCIATION);
		
		// Subprocesses
		if(node instanceof SubProcess) 
			this.checkSubProcess((SubProcess) node);
		
	}
	
	private void checkSubProcess(SubProcess node) {
		
		
	}

	private void checkGateway(Gateway node) {
		/* 
		 * Eventbased Gateways can instantiate processes, thus 
		 * we have to handle them differently 
		 */
			this.checkCommomGateway(node);
		
	}

	private void checkCommomGateway(Gateway node) {
		GatewayDirection direction = node.getGatewayDirection();
		
		/*
		 * must have both multiple incoming and 
		 * outgoing sequence flows
		 */
		if(direction.equals(GatewayDirection.MIXED)) {
			
			if(node.getIncomingSequenceFlows().size() < 2
					|| node.getOutgoingSequenceFlows().size() < 2) {
				
				this.addError(node, GATEWAYDIRECTION_MIXED_FAILURE);
			}
		
		/* 
		 * must have multiple incoming sequence flows and must NOT have
		 * multiple outgoing sequence flows
		 */
		} else if (direction.equals(GatewayDirection.CONVERGING)) {
			
			if(!(node.getIncomingSequenceFlows().size() > 1 
					&& node.getOutgoingSequenceFlows().size() == 1)) {
				
				this.addError(node, GATEWAYDIRECTION_CONVERGING_FAILURE);
			}
		
		/*
		 * must have multiple outgoing sequence flows and must NOT have
		 * multiple incoming sequence flows
		 */
		} else if(direction.equals(GatewayDirection.DIVERGING)) {
			
			if(!(node.getIncomingSequenceFlows().size() == 1
					&& node.getOutgoingSequenceFlows().size() > 1)) {
				
				this.addError(node, GATEWAYDIRECTION_DIVERGING_FAILURE);
			}
		
		/*
		 * gateways must have a minimum of one outgoing sequence flow
		 */
		} else if(node.getOutgoingSequenceFlows().size() == 0) {
			
			this.addError(node, GATEWAY_WITH_NO_OUTGOING_SEQUENCE_FLOW);
			
		}
	}		
	

	private boolean hasIncomingControlFlow(FlowNode node) {
		return node.getIncomingSequenceFlows().size() > 0;
	}
	
	private boolean hasOutgoingControlFlow(FlowNode node) {
		return node.getOutgoingSequenceFlows().size() > 0;
	}
		
	protected void addError(FlowElement elem, String errorText) {
		this.errors.put(elem.getId(), errorText);
	}	
}