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
import de.hpi.ingest.model.diagram.IngestCompartment;
import de.hpi.ingest.model.diagram.LaneCompartment;
import de.hpi.ingest.model.diagram.PoolCompartment;
import de.hpi.ingest.model.participant.Lane;
import de.hpi.ingest.model.participant.LaneSet;
import de.hpi.ingest.model.participant.Participant;
import de.hpi.diagram.OryxUUID;

/**
 * Factory to create lanes and pools
 * 
 * @author Philipp Giese
 * @author Sven Wagner-Boysen
 * 
 */
@StencilId( { "CollapsedPool", "Pool", "Lane" })
public class LaneFactory extends AbstractIngestFactory {

	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent)
			throws IngestConverterException {
		IngestCompartment poolLaneShape = this.createDiagramElement(shape);

		/* Set references */
		if (poolLaneShape instanceof PoolCompartment) {
			BaseElement poolElement = this.createProcessElement(shape);

			if (poolElement instanceof Participant)
				((PoolCompartment) poolLaneShape)
						.setParticipantRef((Participant) poolElement);
			else {
				Participant participant = new Participant();
				participant.setId(OryxUUID.generate());
				participant.setName(poolLaneShape.getName());
				((PoolCompartment) poolLaneShape).setParticipantRef(participant);
			}

			return new IngestElement(poolLaneShape, poolElement, shape
					.getResourceId());
		}

		if (poolLaneShape instanceof LaneCompartment) {
			Lane lane = (Lane) this.createProcessElement(shape);
			((LaneCompartment) poolLaneShape).setLaneRef(lane);
			return new IngestElement(poolLaneShape, lane, shape.getResourceId());
		}
		throw new IngestConverterException(
				"The LaneFactor has to create ether a pool or a lane. But none of those was dected");

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @seede.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.
	 * oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected IngestCompartment createDiagramElement(Shape shape) {
		/* Create a shape for a pool or Lane */
		if (shape.getStencilId().equals("Lane")) {
			LaneCompartment laneShape = new LaneCompartment();
			this.setVisualAttributes(laneShape, shape);
			laneShape.setIsVisible(true);

			return laneShape;
		}

		PoolCompartment pool = new PoolCompartment();
		this.setVisualAttributes(pool, shape);
		pool.setIsVisible(true);

		return pool;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @seede.hpi.ingest.factory.AbstractIngestFactory#createProcessElement(org.
	 * oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected BaseElement createProcessElement(Shape shape)
			throws IngestConverterException {

		if (shape.getStencilId().equals("CollapsedPool")) {
			Participant participant = new Participant();
			
			/* Set name attribute */
			String name = shape.getProperty("name");
			if(name != null && !name.isEmpty())
				participant.setName(name);
			
			participant.setId(shape.getResourceId());
			this.setCommonAttributes(participant, shape);
			return participant;
		}

		if (shape.getStencilId().equals("Pool")) {
			LaneSet poolLaneSet = new LaneSet();
			this.setCommonAttributes(poolLaneSet, shape);
			poolLaneSet.setId(shape.getResourceId());
			
			/* Name */
			String name = shape.getProperty("name");
			if(name != null && !name.isEmpty()) {
				poolLaneSet.setName(name);
			}
			
			/* Process type */
			String processType = shape.getProperty("processtype");
			if(processType != null && !processType.isEmpty()) {
				poolLaneSet._processType = processType;
			}
			
			/* Process isClosed */
			String isClosed = shape.getProperty("isclosed");
			if(isClosed != null && !isClosed.isEmpty())
				poolLaneSet._isClosed = isClosed;
	
			return poolLaneSet;
		}

		Lane lane = new Lane();
		this.setCommonAttributes(lane, shape);
		lane.setId(shape.getResourceId());
		
		/* Set name attribute */
		String name = shape.getProperty("name");
		if(name != null && !name.isEmpty())
			lane.setName(name);
		
		lane.setLane(lane);

		if (this.hasChildLanes(shape)) {
			LaneSet laneSet = new LaneSet();
			laneSet.setParentLane(lane);
			laneSet.setId(OryxUUID.generate());
			lane.setChildLaneSet(laneSet);
		}

		return lane;
	}

	private boolean hasChildLanes(Shape shape) {
		for (Shape childShape : shape.getChildShapes()) {
			if (childShape.getStencilId().equals("Lane")) {
				return true;
			}
		}
		return false;
	}
}
