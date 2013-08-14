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

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.oryxeditor.server.diagram.Shape;

import de.hpi.ingest.model.FormalExpression;
import de.hpi.ingest.model.activity.Activity;

import de.hpi.ingest.model.data_object.DataState;
import de.hpi.ingest.model.event.EventDefinition;
import de.hpi.ingest.model.event.ImplicitThrowEvent;
import de.hpi.ingest.model.misc.IoOption;
import de.hpi.ingest.model.misc.ItemKind;
import de.hpi.ingest.model.misc.Property;


public abstract class AbstractActivityFactory extends AbstractIngestFactory {

	/**
	 * Sets common attributes of activity (task, subprocess, event-subprocess)
	 * derived from the source shape.
	 * 
	 * @param activity
	 *            The resulting activity.
	 * @param shape
	 *            The source diagram shape.
	 */
	protected void setStandardAttributes(Activity activity, Shape shape) {
		
		
		
		/* Properties */
		activity.getProperty().addAll(this.createPropertiesList(shape));
		
		/* Start and Completion Quantity */
		this.setStartAndCompletionQuantity(activity, shape);
		
		/* Collect data for IOSpecification */
		this.collectIoSpecificationInfo(activity, shape);
		
	}

	/**
	 * Takes the complex property input set as well as output set and stores 
	 * them in a hash map for further processing.
	 * @param shape 
	 * @param activity 
	 */
	private void collectIoSpecificationInfo(Activity activity, Shape shape) {
		activity.getOutputSetInfo().add(this.collectSetInfoFor(shape, "dataoutputset"));
		activity.getInputSetInfo().add(this.collectSetInfoFor(shape, "datainputset"));
	}
	
	/**
	 * Generic method to parse data input and output set properties.
	 * 
	 * @param property
	 * 		Identifies the shape's property to handle either a output or input set.
	 */
	private HashMap<String, IoOption> collectSetInfoFor(Shape shape, String property) {
		String ioSpecString = shape.getProperty(property);
		
		HashMap<String, IoOption> options = new HashMap<String, IoOption>();
		
		if(ioSpecString != null && !ioSpecString.isEmpty()) {
			try {
				JSONObject ioSpecObject = new JSONObject(ioSpecString);
				JSONArray ioSpecItems = ioSpecObject.getJSONArray("items");

				/* Retrieve io spec option definitions */
				for (int i = 0; i < ioSpecItems.length(); i++) {
					JSONObject propertyItem = ioSpecItems.getJSONObject(i);

					IoOption ioOpt = new IoOption();

					/* Name */
					String name = propertyItem.getString("name");
					if(name == null || name.isEmpty())
						continue;
					
					/* Optional */
					String isOptional = propertyItem.getString("optional");
					if(isOptional != null && isOptional.equalsIgnoreCase("true"))
						ioOpt.setOptional(true);
					
					/* While executing */
					String whileExecuting = propertyItem.getString("whileexecuting");
					if(whileExecuting != null && whileExecuting.equalsIgnoreCase("true"))
						ioOpt.setOptional(true);
					
					options.put(name, ioOpt);
					
				}

			} catch(Exception e) {
				e.printStackTrace();
			}
		}
		
		return options;
	}

	
	

	/**
	 * Sets the start quantity of the activity based on the data of the shape.
	 * 
	 * @param activity
	 * @param shape
	 * 		The resource shape
	 */
	private void setStartAndCompletionQuantity(Activity activity, Shape shape) {
		
		/* Start quantity */
		
		String startQuantity = shape.getProperty("startquantity");
		if(startQuantity != null) {
			try {
				activity.setStartQuantity(BigInteger.valueOf(Integer.valueOf(startQuantity)));
			} catch(Exception e) {
				e.printStackTrace();
				/* Set to default value in case of an exception */
				activity.setStartQuantity(BigInteger.valueOf(1));
			}
			
		}
		
		/* Completion quantity */
		String completionQuantity = shape.getProperty("completionquantity");
		if(completionQuantity != null) {
			try {
				activity.setCompletionQuantity(BigInteger.valueOf(Integer.valueOf(completionQuantity)));
			} catch(Exception e) {
				/* Set to default value in case of an exception */
				e.printStackTrace();
				activity.setCompletionQuantity(BigInteger.valueOf(1));
			}
		}
	}
	
	
	
	/**
	 * 
	 * 
	 * @param shape
	 * @return
	 */
	protected List<Property> createPropertiesList(Shape shape) {
		ArrayList<Property> propertiesList = new ArrayList<Property>();
		
		String propertiesString = shape.getProperty("properties");
		if(propertiesString != null && !propertiesString.isEmpty()) {
			try {
				JSONObject propertyObject = new JSONObject(propertiesString);
				JSONArray propertyItems = propertyObject.getJSONArray("items");

				/*
				 * Retrieve property definitions and process
				 * them.
				 */
				for (int i = 0; i < propertyItems.length(); i++) {
					JSONObject propertyItem = propertyItems.getJSONObject(i);

					Property property = new Property();

					/* Name */
					String name = propertyItem.getString("name");
					if(name != null && !name.isEmpty())
						property.setName(name);
					
					/* Data State */
					String dataState = propertyItem.getString("datastate");
					if(dataState != null && !dataState.isEmpty())
						property.setDataState(new DataState(dataState));
					
					/* ItemKind */
					String itemKind = propertyItem.getString("itemkind");
					if(itemKind != null && !itemKind.isEmpty())
						property.setItemKind(ItemKind.fromValue(itemKind));
					
					/* Structure */
					String structureString = propertyItem.getString("structure");
					if(structureString != null && !structureString.isEmpty())
						property.setStructure(structureString);
					
					/* isCollection */
					String isCollection = propertyItem.getString("iscollection");
					if(isCollection != null && isCollection.equalsIgnoreCase("false"))
						property.setCollection(false);
					else 
						property.setCollection(true);
					
					propertiesList.add(property);
				}

			} catch(Exception e) {
				e.printStackTrace();
			}
		}
		
		return propertiesList;
	}

}
