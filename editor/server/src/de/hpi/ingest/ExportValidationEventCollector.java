package de.hpi.ingest;

import javax.xml.bind.ValidationEvent;
import javax.xml.bind.util.ValidationEventCollector;

public class ExportValidationEventCollector extends ValidationEventCollector{
	@Override
	public boolean handleEvent(ValidationEvent event) {
		super.handleEvent(event);
		return true;
	}
}
