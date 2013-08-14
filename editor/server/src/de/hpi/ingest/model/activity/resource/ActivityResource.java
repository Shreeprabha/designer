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

package de.hpi.ingest.model.activity.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlIDREF;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import javax.xml.namespace.QName;

import de.hpi.ingest.model.BaseElement;



@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tActivityResource", propOrder = {
    "resourceAssignmentExpression",
    "resourceParameterBinding"
})
@XmlSeeAlso({
    Performer.class
})
public class ActivityResource
    extends BaseElement
{
	
    protected ResourceAssignmentExpression resourceAssignmentExpression;
    protected List<ResourceParameterBinding> resourceParameterBinding;
    
    @XmlAttribute(required = true)
    @XmlIDREF
    protected Resource resourceRef;

    /**
     * Gets the value of the resourceAssignmentExpression property.
     * 
     * @return
     *     possible object is
     *     {@link TResourceAssignmentExpression }
     *     
     */
    public ResourceAssignmentExpression getResourceAssignmentExpression() {
        return resourceAssignmentExpression;
    }

    /**
     * Sets the value of the resourceAssignmentExpression property.
     * 
     * @param value
     *     allowed object is
     *     {@link TResourceAssignmentExpression }
     *     
     */
    public void setResourceAssignmentExpression(ResourceAssignmentExpression value) {
        this.resourceAssignmentExpression = value;
    }

    /**
     * Gets the value of the resourceParameterBinding property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the resourceParameterBinding property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getResourceParameterBinding().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link TResourceParameterBinding }
     * 
     * 
     */
    public List<ResourceParameterBinding> getResourceParameterBinding() {
        if (resourceParameterBinding == null) {
            resourceParameterBinding = new ArrayList<ResourceParameterBinding>();
        }
        return this.resourceParameterBinding;
    }

    /**
     * Gets the value of the resourceRef property.
     * 
     * @return
     *     possible object is
     *     {@link QName }
     *     
     */
    public Resource getResourceRef() {
        return resourceRef;
    }

    /**
     * Sets the value of the resourceRef property.
     * 
     * @param value
     *     allowed object is
     *     {@link QName }
     *     
     */
    public void setResourceRef(Resource value) {
        this.resourceRef = value;
    }

}
