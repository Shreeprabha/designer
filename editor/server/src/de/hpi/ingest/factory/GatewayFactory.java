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
import de.hpi.ingest.model.Expression;
import de.hpi.ingest.model.diagram.GatewayShape;

import de.hpi.ingest.model.gateway.ExclusiveGateway;
import de.hpi.ingest.model.gateway.Gateway;
import de.hpi.ingest.model.gateway.GatewayDirection;

import de.hpi.ingest.model.gateway.ParallelGateway;

/**
 * The factory to create {@link Gateway} Archive elements
 * 
 * @author Sven Wagner-Boysen
 * 
 */
@StencilId({ 
	"Exclusive_Databased_Gateway",  
	"ParallelGateway"
 })
public class GatewayFactory extends AbstractIngestFactory {

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * de.hpi.ingest.factory.AbstractIngestFactory#createIngestElement(org.oryxeditor
	 * .server.diagram.Shape)
	 */
	@Override
	public IngestElement createIngestElement(Shape shape, IngestElement parent) throws IngestConverterException {
		GatewayShape gatewayShape = (GatewayShape) this.createDiagramElement(shape);
		Gateway gateway = (Gateway) createProcessElement(shape);
		gatewayShape.setGatewayRef(gateway);
		return new IngestElement(gatewayShape, gateway, shape.getResourceId());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @seede.hpi.ingest.factory.AbstractIngestFactory#createDiagramElement(org.
	 * oryxeditor.server.diagram.Shape)
	 */
	@Override
	protected Object createDiagramElement(Shape shape) {
		GatewayShape gatewayShape = new GatewayShape();
		this.setVisualAttributes(gatewayShape, shape);
		return gatewayShape;
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
		try {
			Gateway gateway = (Gateway) this.invokeCreatorMethod(shape);
			this.identifyGatewayDirection(gateway, shape);
			return gateway;
		} catch (Exception e) {
			/* Wrap exceptions into specific IngestConverterException */
			throw new IngestConverterException(
					"Error while creating the process element of "
							+ shape.getStencilId(), e);
		}
	}

	/**
	 * Creator method for an exclusive databased Gateway.
	 * 
	 * @param shape
	 *            The resource shape
	 * @return The resulting {@link ExclusiveGateway}
	 */
	@StencilId("Exclusive_Databased_Gateway")
	protected ExclusiveGateway createExclusiveGateway(Shape shape) {
		ExclusiveGateway gateway = new ExclusiveGateway();
		gateway.setId(shape.getResourceId());
		gateway.setName(shape.getProperty("name"));
		return gateway;
	}

	@StencilId("ParallelGateway")
	protected ParallelGateway createParallelGateway(Shape shape) {
		ParallelGateway gateway = new ParallelGateway();
		gateway.setId(shape.getResourceId());
		gateway.setName(shape.getProperty("name"));
		return gateway;
	}
	
	
	/**
	 * Determines and sets the {@link GatewayDirection}
	 */
	private void identifyGatewayDirection(Gateway gateway, Shape shape) {

		/* Determine the direction of the Gateway */

		int numIncomming = shape.getIncomings().size();
		int numOutgoing = shape.getOutgoings().size();

		GatewayDirection direction = GatewayDirection.UNSPECIFIED;

		if (numIncomming > 1 && numOutgoing > 1)
			direction = GatewayDirection.MIXED;
		else if (numIncomming <= 1 && numOutgoing > 1)
			direction = GatewayDirection.DIVERGING;
		else if (numIncomming > 1 && numOutgoing <= 1)
			direction = GatewayDirection.CONVERGING;

		/* Set the gateway direction */
		gateway.setGatewayDirection(direction);
	}

}
