package de.hpi.ingest.model.misc;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;

import de.hpi.ingest.model.BaseElement;


@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "tRisk", propOrder = {
    "description",
    "probability"
})
public class Risk
    extends BaseElement
{

    @XmlElement(required = true)
    protected String description;
    
    @XmlElement(required = true)
    protected int probability;
    
    @XmlAttribute
    @XmlSchemaType(name = "anyURI")
    protected String language;

    /**
     * Gets the value of the description property.
     * 
     * @return
     *     possible object is
     *     {@link TBaseElementWithMixedContent }
     *     
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the value of the description property.
     * 
     * @param value
     *     allowed object is
     *     {@link TBaseElementWithMixedContent }
     *     
     */
    public void setDescription(String value) {
        this.description = value;
    }

    /**
     * Gets the value of the probability property.
     * 
     * @return
     *     possible object is
     *     {@link TBaseElementWithMixedContent }
     *     
     */
    public int getProbability() {
        return probability;
    }

    /**
     * Sets the value of the probability property.
     * 
     * @param value
     *     allowed object is
     *     {@link TBaseElementWithMixedContent }
     *     
     */
    public void setProbability(int value) {
        this.probability = value;
    }

    /**
     * Gets the value of the language property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLanguage() {
        return language;
    }

    /**
     * Sets the value of the language property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLanguage(String value) {
        this.language = value;
    }

}
