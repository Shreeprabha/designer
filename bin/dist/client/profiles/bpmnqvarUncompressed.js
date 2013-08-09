/**
 * Copyright (c) 2010 Ahmed Awad and Emilian Pascalau
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.QueryVariant = ORYX.Plugins.AbstractPlugin.extend({

    facade: undefined,
    
    construct: function(facade){
		
        this.facade = facade;
        
		this.active 		= false;
		this.raisedEventIds = [];
		
        this.facade.offer({
            'name': ORYX.I18N.QueryVariant.name,
            'functionality': this.showOverlay.bind(this),
            'group': ORYX.I18N.QueryVariant.group,
            'icon': ORYX.PATH + "stencilsets/bpmnqvar/bpmnqvar.png",
            'description': ORYX.I18N.QueryVariant.tooltip,
            'index': 0,
			'toggle': false,
            'minShape': 0,
            'maxShape': 0
        });
		
    },
    
	showOverlay: function(button, pressed){

		if (!pressed) {
			
			this.raisedEventIds = [];
			this.active 		= !this.active;
			
			return;
		} 
		
		var options = {
			command : 'undef'
		}
	
		this.issueQuery(options);
	},
	
	issueQuery : function(options){
		
		try {
			var serialized_rdf = this.getRDFFromDOM();
//			serialized_rdf = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serialized_rdf;

			this.facade.raiseEvent({
	            type: ORYX.CONFIG.EVENT_LOADING_ENABLE,
				text: "Processing partial process model"  //ORYX.I18N.Save.saving
	        });
			// Send the request to the server.
			new Ajax.Request(ORYX.CONFIG.QUERYVARIANTEVAL_URL, {
				method: 'POST',
				asynchronous: true,
				parameters: {
					resource	: location.href,
					command		: options.command,
					modelID		: options.modelID,
					stopAtFirstMatch: options.stopAtFirstMatch,
				//data		: serialized_rdf
				data : location.href
				},
                onSuccess: function(response){
                    this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_DISABLE
					});
					
					var respXML = response.responseXML;

                    var root=respXML.firstChild;
                    var pg=root.getElementsByTagName("ProcessGraph");
					var source = location.href.substring(0,location.href.substring(8).indexOf("/")+8);
					//alert(source);
					var uri = source+"/backend/poem/new?stencilset=/stencilsets/bpmn1.1/bpmn1.1.json";
					editor = window.open( uri );
					editor.oryxCreator1283772618640 = self;
					editor.oryxCreator1283772618640.variant=respXML;
					
					
                }.bind(this),
				
				onFailure: function(response){
					this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_DISABLE
					});
					Ext.Msg.alert(ORYX.I18N.Oryx.title, "Server encountered an error (" + response.statusText + ").\n"
						+ response.responseText);
				}.bind(this)
			});
			
		} catch (error){
			this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
			Ext.Msg.alert(ORYX.I18N.Oryx.title, error);
	 	}

	},
	
    processResultGraph: function(xmlNode){
        var graphElements = new Array();
		
		for (var k = 0; k < xmlNode.childNodes.length; k++) {
            var node = xmlNode.childNodes.item(k);
            if (!(node instanceof Text)) {
                if (node.hasAttribute("id")) { // it is a node
                	Ext.Msg.alert(node.getAttributeNode("id").nodeValue);
					graphElements.push({
						nodeType : node.getAttributeNode("type").nodeValue,
						nodeId : node.getAttributeNode("id").nodeValue,
						nodeLabel : node.getAttributeNode("label").nodeValue,
						nodeType2 : node.getAttributeNode("type2").nodeValue
					});
					
				} else if ((node.hasAttribute("from"))
						&& node.hasAttribute("to")) { // it is an edge
					graphElements.push({
						edgeType : node.getAttributeNode("type").nodeValue,
						from : node.getAttributeNode("from").nodeValue.substring(3),
						to : node.getAttributeNode("to").nodeValue.substring(3)
					});
				}
            }
        }
		return graphElements;
    },
	// Added by Ahmed Awad on 28.07.09 to extract the diagnosis and the match meta data
	processMatchDescription: function(xmlNode){
        var metadata = new Array();
		
		for (var k = 0; k < xmlNode.childNodes.length; k++) {
            var node = xmlNode.childNodes.item(k);
            if ((node.nodeName === "diagnosis")) {
                
					metadata.push({
						diagnosis : node.textContent
					});
					
				} else if ((node.nodeName === "match")) { // it is an edge
					metadata.push({
						match : node.textContent
					});
				}
            
        }
		return metadata;
    },
	/**
	 * 
	 * @param {Array} processList; 
	 * 		elements' fields: id location identifier for process
	 * 						  elements array of graph nodes/edges
	 */
	processProcessList: function(processList){
		if(processList.length == 0) {
			Ext.Msg.alert(ORYX.I18N.Oryx.title, "Found no matching processes!");
			return;
		}
		
		this.isRendering = true;
		
		// load process model meta data
		processList.each(this.getModelMetaData.bind(this));
		
		// transform array of objects into array of arrays
		var data = [];
		processList.each(function( pair ){
/*			var stencilset = pair.value.type;
			// Try to display stencilset title instead of uri
			this.facade.modelCache.getModelTypes().each(function(type){
				if (stencilset == type.namespace) {
					stencilset = type.title;
					return;
				}
			}.bind(this));
*/			
			data.push( [ pair.id, pair.metadata.thumbnailUri + "?" + Math.random(), unescape(pair.metadata.title), pair.metadata.type, pair.metadata.author, pair.elements, pair.description ] )  // Modified by Ahmed
		}.bind(this));

		
		// following is mostly UI logic
		var myProcsPopup = new Ext.Window({
			layout      : 'fit',
            width       : 500,
            height      : 300,
            closable	: true,
            plain       : true,
			modal		: true,
			autoScroll  : true, // Added by Ahmed Awad on 30.07.2009
			title       : 'Query Result',
			id			: 'procResPopup',
			
			buttons: [{
                text     : 'Close',
                handler  : function(){
                    myProcsPopup.close();
                }.bind(this)
            }]

		});
		
		var tableModel = new Ext.data.SimpleStore({
			fields: [
				{name: 'id'}, //, type: 'string', mapping: 'metadata.id'},
				{name: 'icon'}, //, mapping: 'metadata.icon'},
				{name: 'title'}, //, mapping: 'metadata.title'},
				{name: 'type'}, //, mapping: 'metadata.type'},
				{name: 'author'}, //, mapping: 'metadata.author'},
				{name: 'elements'}, //, type: 'array', mapping: 'elements'},
				{name: 'description'}, // Added by Ahmed Awad
			],
			data : data
		});
		
		var iconPanel = new Ext.Panel({
			border	: false,
			autoScroll : true, // Added by Ahmed Awad
	        items	: new this.dataGridPanel({
				store       : tableModel, 
				listeners   :{
					dblclick:this._onDblClick.bind(this)
				}
			})
	    });
		this.setPanelStyle();
		
		myProcsPopup.add(iconPanel);
		
		this.isRendering = false;
		
		myProcsPopup.show();
	},
	
	getModelMetaData : function(processEntry) {
		var metaUri = processEntry.id.replace(/\/rdf$/, '/meta');
		new Ajax.Request(metaUri, 
			 {
				method			: "get",
				asynchronous 	: false,
				onSuccess		: function(transport) {
					processEntry.metadata = transport.responseText.evalJSON();
				}.bind(this),
				onFailure		: function() {
					Ext.MessageBox.alert(ORYX.I18N.Oryx.title, "Error loading model meta data.");
				}.bind(this)
			});
		
	},
	
	_onDblClick: function(dataGrid, index, node, e){
		
		// Select the new range
		dataGrid.selectRange(index, index);

		// Get uri and matched element data from the clicked model
		var modelId 	= dataGrid.getRecord( node ).data.id;
		var matchedElements = dataGrid.getRecord( node ).data.elements;
		var description = dataGrid.getRecord( node ).data.description; // Added by Ahmed Awad on 30.07.09
		// convert object to JSOn representation
		var elementsAsJson = Ext.encode(matchedElements);
		var descriptionAsJson = Ext.encode(description); // Added by Ahmed Awad on 30.07.09
		// escape JSON string to become URI-compliant
		var encodedJson = encodeURIComponent(elementsAsJson);
		var encodedDescription = encodeURIComponent(descriptionAsJson);
		
		// remove the last URI segment, append editor's 'self' and json of model elements
		var slashPos = modelId.lastIndexOf("/");
		//var uri	= modelId.substr(0, slashPos) + "/self" + "?matches=" + encodedJson;
 	    var uri	= modelId.substr(0, slashPos) + "/self" + "?matches=" + encodedJson+"&description="+encodedDescription;
		// Open the model in Editor
		var editor = window.open( uri );
		window.setTimeout(
	        function() {
                if(!editor || !editor.opener || editor.closed) {
                        Ext.MessageBox.alert(ORYX.I18N.Oryx.title, ORYX.I18N.Oryx.editorOpenTimeout).setIcon(Ext.MessageBox.QUESTION);
                }
	        }, 5000);			
		
	},
	
	dataGridPanel : Ext.extend(Ext.DataView, {
		multiSelect		: true,
		//simpleSelect	: true, 
	    cls				: 'iconview',
	    itemSelector	: 'dd',
	    overClass		: 'over',
		selectedClass	: 'selected',
	    tpl : new Ext.XTemplate(
        '<div>',
			'<dl class="repository_iconview">',
	            '<tpl for=".">',
					'<dd >',
					'<div class="image">',
					 '<img src="{icon}" title="{title}" /></div>',
		            '<div><span class="title" title="{[ values.title.length + (values.type.length*0.8) > 30 ? values.title : "" ]}" >{[ values.title.truncate(30 - (values.type.length*0.8)) ]}</span><span class="author" unselectable="on">({type})</span></div>',
		            '<div><span class="type">{author}</span></div>',
					'</dd>',
	            '</tpl>',
			'</dl>',
        '</div>'
	    )
	}), 
	
	setPanelStyle : function() {
		var styleRules = '\
.repository_iconview dd{\
	width		: 200px;\
	height		: 105px;\
	padding		: 10px;\
	border		: 1px solid #EEEEEE;\
	font-family	: tahoma,arial,sans-serif;\
	font-size	: 9px;\
	display		: block;\
	margin		: 5px;\
	text-align	: left;\
	float		: left;\
}\
.repository_iconview dl {\
	width		: 100%;\
	max-width	: 1000px;\
}\
.repository_iconview dd.over{\
	background-color	: #fff5e1;\
}\
.repository_iconview dd.selected{\
	border-color: #FC8B03;\
}\
.repository_iconview dd img{\
	max-width	: 190px;\
	max-height	: 70px;\
}\
.repository_iconview dd .image{\
	width	: 200px;\
	height	: 80px;\
	padding-bottom	: 10px;\
	text-align		: center;\
	vertical-align	: middle;\
	display	:table-cell;\
}\
.repository_iconview dd .title{\
	font-weight	: bold;\
	font-size	: 11px;\
	color		: #555555;\
}\
.repository_iconview dd .author{\
	margin-left	: 5px;\
}';
		Ext.util.CSS.createStyleSheet(styleRules, 'queryResultStyle');
	},
    
});
/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/


if(!ORYX.Plugins) {
	ORYX.Plugins = new Object();
}

if (!ORYX.FieldEditors) {
	ORYX.FieldEditors = {};
}

if (!ORYX.AssociationEditors) {
	ORYX.AssociationEditors = {};
}

if (!ORYX.LabelProviders) {
    ORYX.LabelProviders = {};
}



ORYX.Plugins.PropertyWindow = {

	facade: undefined,

	construct: function(facade) {
		// Reference to the Editor-Interface
		this.facade = facade;

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW, this.init.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.onSelectionChanged.bind(this));
		this.init();
	},
	
	init: function(){
		// The parent div-node of the grid
		this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml",
			null,
			['div']);

		// If the current property in focus is of type 'Date', the date format
		// is stored here.
		this.currentDateFormat;

		// the properties array
		this.popularProperties = [];
		this.simulationProperties = [];
		this.properties = [];
		
		/* The currently selected shapes whos properties will shown */
		this.shapeSelection = new Hash();
		this.shapeSelection.shapes = new Array();
		this.shapeSelection.commonProperties = new Array();
		this.shapeSelection.commonPropertiesValues = new Hash();
		
		this.updaterFlag = false;

		// creating the column model of the grid.
		this.columnModel = new Ext.grid.ColumnModel([
			{
				//id: 'name',
				header: ORYX.I18N.PropertyWindow.name,
				dataIndex: 'name',
				width: 90,
				sortable: true,
				renderer: this.tooltipRenderer.bind(this)
			}, {
				//id: 'value',
				header: ORYX.I18N.PropertyWindow.value,
				dataIndex: 'value',
				id: 'propertywindow_column_value',
				width: 110,
				editor: new Ext.form.TextField({
					allowBlank: true
				}),
				renderer: this.renderer.bind(this)
			},
			{
				header: "Desk",
				dataIndex: 'groupname',
				hidden: true,
				sortable: true
			}
		]);

		// creating the store for the model.
        this.dataSource = new Ext.data.GroupingStore({
			proxy: new Ext.data.MemoryProxy(this.properties),
			reader: new Ext.data.ArrayReader({}, [
				{name: 'groupname'},
				{name: 'name'},
				{name: 'value'},
				{name: 'icons'},
				{name: 'gridProperties'}
			]),
			sortInfo: {field: 'name', direction: "ASC"},
			groupField: 'groupname'
        });
		this.dataSource.load();
		
		this.grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
			clicksToEdit: 1,
			stripeRows: true,
			autoExpandColumn: "propertywindow_column_value",
			width:'auto',
			// the column model
			colModel: this.columnModel,
			enableHdMenu: false,
			view: new Ext.grid.GroupingView({
				forceFit: false,
				groupTextTpl: '{[values.rs.first().data.groupname]}'
			}),
			
			// the data store
			store: this.dataSource
			
		});

		region = this.facade.addToRegion('east', new Ext.Panel({
			width: 400,
			layout: "anchor",
            autoScroll: true,
            autoHeight: true,
			border: false,
			//title: 'Properties',
			items: [
				this.grid 
			],
            anchors: '0, -30'
		}), ORYX.I18N.PropertyWindow.title);


		// Register on Events
		this.grid.on('beforeedit', this.beforeEdit, this, true);
		this.grid.on('afteredit', this.afterEdit, this, true);
		this.grid.view.on('refresh', this.hideMoreAttrs, this, true);
		
		//this.grid.on(ORYX.CONFIG.EVENT_KEYDOWN, this.keyDown, this, true);
		
		// Renderer the Grid
		this.grid.enableColumnMove = false;
		//this.grid.render();

		// Sort as Default the first column
		//this.dataSource.sort('name');

	},
	
	// Select the Canvas when the editor is ready
	selectDiagram: function() {
		this.shapeSelection.shapes = [this.facade.getCanvas()];
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.createProperties();
	},
	
	specialKeyDown: function(field, event) {
		// If there is a TextArea and the Key is an Enter
		if(field instanceof Ext.form.TextArea && event.button == ORYX.CONFIG.KEY_Code_enter) {
			// Abort the Event
			return false
		}
	},
	tooltipRenderer: function(value, p, record) {
		/* Prepare tooltip */
		p.cellAttr = 'title="' + record.data.gridProperties.tooltip + '"';
		return value;
	},
	
	renderer: function(value, p, record) {
		this.tooltipRenderer(value, p, record);
		
		if (record.data.gridProperties.labelProvider) {
		    // there is a label provider to render the value.
		    // we pass it the value
		    return record.data.gridProperties.labelProvider(value);
		}
				
		if(value instanceof Date) {
			// TODO: Date-Schema is not generic
			value = value.dateFormat(ORYX.I18N.PropertyWindow.dateFormat);
		} else if(String(value).search("<a href='") < 0) {
			// Shows the Value in the Grid in each Line
			value = String(value).gsub("<", "&lt;");
			value = String(value).gsub(">", "&gt;");
			value = String(value).gsub("%", "&#37;");
			value = String(value).gsub("&", "&amp;");

			if(record.data.gridProperties.type == ORYX.CONFIG.TYPE_COLOR) {
				value = "<div class='prop-background-color' style='background-color:" + value + "' />";
			}			

			record.data.icons.each(function(each) {
				if(each.name == value) {
					if(each.icon) {
						value = "<img src='" + each.icon + "' /> " + value;
					}
				}
			});
		}

		return value;
	},

	beforeEdit: function(option) {
			var editorGrid 		= this.dataSource.getAt(option.row).data.gridProperties.editor;
			var editorRenderer 	= this.dataSource.getAt(option.row).data.gridProperties.renderer;
	
			if(editorGrid) {
				// Disable KeyDown
				this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
	
				option.grid.getColumnModel().setEditor(1, editorGrid);
				
				editorGrid.field.row = option.row;
				// Render the editor to the grid, therefore the editor is also available 
				// for the first and last row
				editorGrid.render(this.grid);
				
				//option.grid.getColumnModel().setRenderer(1, editorRenderer);
				editorGrid.setSize(option.grid.getColumnModel().getColumnWidth(1), editorGrid.height);
			} else {
				return false;
			}
			
			var key = this.dataSource.getAt(option.row).data.gridProperties.propId;
			
			this.oldValues = new Hash();
			this.shapeSelection.shapes.each(function(shape){
				this.oldValues[shape.getId()] = shape.properties[key];
			}.bind(this)); 
	},

	afterEdit: function(option) {
		//Ext1.0: option.grid.getDataSource().commitChanges();
		option.grid.getStore().commitChanges();

		var key 			 = option.record.data.gridProperties.propId;
		var selectedElements = this.shapeSelection.shapes;
		
		var oldValues 	= this.oldValues;	
		
		var newValue	= option.value;
		var facade		= this.facade;
		

		// Implement the specific command for property change
		var commandClass = ORYX.Core.Command.extend({
			construct: function(){
				this.key 		= key;
				this.selectedElements = selectedElements;
				this.oldValues = oldValues;
				this.newValue 	= newValue;
				this.facade		= facade;
			},			
			execute: function(){
				this.selectedElements.each(function(shape){
					if(!shape.getStencil().property(this.key).readonly()) {
						shape.setProperty(this.key, this.newValue);
					}
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			},
			rollback: function(){
				this.selectedElements.each(function(shape){
					shape.setProperty(this.key, this.oldValues[shape.getId()]);
				}.bind(this));
				this.facade.setSelection(this.selectedElements);
				this.facade.getCanvas().update();
				this.facade.updateSelection();
			}
		})		
		// Instanciated the class
		var command = new commandClass();
		
		// Execute the command
		this.facade.executeCommands([command]);


		// extended by Kerstin (start)
//
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: option.value
		});
		// extended by Kerstin (end)
	},
	
	// Changes made in the property window will be shown directly
	editDirectly:function(key, value){
		this.shapeSelection.shapes.each(function(shape){
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, value);
				//shape.update();
			}
		}.bind(this));
		
		/* Propagate changed properties */
		var selectedElements = this.shapeSelection.shapes;
		
		this.facade.raiseEvent({
			type 		: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, 
			elements	: selectedElements,
			key			: key,
			value		: value
		});

		this.facade.getCanvas().update();
		
	},
	
	// if a field becomes invalid after editing the shape must be restored to the old value
	updateAfterInvalid : function(key) {
		this.shapeSelection.shapes.each(function(shape) {
			if(!shape.getStencil().property(key).readonly()) {
				shape.setProperty(key, this.oldValues[shape.getId()]);
				shape.update();
			}
		}.bind(this));
		
		this.facade.getCanvas().update();
	},

	// extended by Kerstin (start)	
	dialogClosed: function(data) {
		var row = this.field ? this.field.row : this.row 
		this.scope.afterEdit({
			grid:this.scope.grid, 
			record:this.scope.grid.getStore().getAt(row), 
			//value:this.scope.grid.getStore().getAt(this.row).get("value")
			value: data
		})
		// reopen the text field of the complex list field again
		this.scope.grid.startEditing(row, this.col);
	},
	// extended by Kerstin (end)
	
	/**
	 * Changes the title of the property window panel according to the selected shapes.
	 */
	setPropertyWindowTitle: function() {
		if(this.shapeSelection.shapes.length == 1) {
			// add the name of the stencil of the selected shape to the title
				region.setTitle(ORYX.I18N.PropertyWindow.title +' ('+this.shapeSelection.shapes.first().getStencil().title()+')' );
		} else {
			region.setTitle(ORYX.I18N.PropertyWindow.title +' ('
							+ this.shapeSelection.shapes.length
							+ ' '
							+ ORYX.I18N.PropertyWindow.selected 
							+')');
		}
	},
	/**
	 * Sets this.shapeSelection.commonPropertiesValues.
	 * If the value for a common property is not equal for each shape the value
	 * is left empty in the property window.
	 */
	setCommonPropertiesValues: function() {
		this.shapeSelection.commonPropertiesValues = new Hash();
		this.shapeSelection.commonProperties.each(function(property){
			var key = property.prefix() + "-" + property.id();
			var emptyValue = false;
			var firstShape = this.shapeSelection.shapes.first();
			
			this.shapeSelection.shapes.each(function(shape){
				if(firstShape.properties[key] != shape.properties[key]) {
					emptyValue = true;
				}
			}.bind(this));
			
			/* Set property value */
			if(!emptyValue) {
				this.shapeSelection.commonPropertiesValues[key]
					= firstShape.properties[key];
			}
		}.bind(this));
	},
	
	/**
	 * Returns the set of stencils used by the passed shapes.
	 */
	getStencilSetOfSelection: function() {
		var stencils = new Hash();
		
		this.shapeSelection.shapes.each(function(shape) {
			stencils[shape.getStencil().id()] = shape.getStencil();
		})
		return stencils;
	},
	
	/**
	 * Identifies the common Properties of the selected shapes.
	 */
	identifyCommonProperties: function() {
		this.shapeSelection.commonProperties.clear();
		
		/* 
		 * A common property is a property, that is part of 
		 * the stencil definition of the first and all other stencils.
		 */
		var stencils = this.getStencilSetOfSelection();
		var firstStencil = stencils.values().first();
		var comparingStencils = stencils.values().without(firstStencil);
		
		
		if(comparingStencils.length == 0) {
			this.shapeSelection.commonProperties = firstStencil.properties();
		} else {
			var properties = new Hash();
			
			/* put all properties of on stencil in a Hash */
			firstStencil.properties().each(function(property){
				properties[property.namespace() + '-' + property.id() 
							+ '-' + property.type()] = property;
			});
			
			/* Calculate intersection of properties. */
			
			comparingStencils.each(function(stencil){
				var intersection = new Hash();
				stencil.properties().each(function(property){
					if(properties[property.namespace() + '-' + property.id()
									+ '-' + property.type()]){
						intersection[property.namespace() + '-' + property.id()
										+ '-' + property.type()] = property;
					}
				});
				properties = intersection;	
			});
			
			this.shapeSelection.commonProperties = properties.values();
		}
	},
	
	onSelectionChanged: function(event) {
		/* Event to call afterEdit method */
		this.grid.stopEditing();
		
		/* Selected shapes */
		this.shapeSelection.shapes = event.elements;
		
		/* Case: nothing selected */
		if(event.elements) {
			if(event.elements.length == 0) {
				this.shapeSelection.shapes = [this.facade.getCanvas()];
			}
		} else {
			this.shapeSelection.shapes = [this.facade.getCanvas()];
		}
		
		/* subselection available */
		if(event.subSelection){
			this.shapeSelection.shapes = [event.subSelection];
		}
		
		this.setPropertyWindowTitle();
		this.identifyCommonProperties();
		this.setCommonPropertiesValues();
		
		// Create the Properties
		this.createProperties();
	},
	
	/**
	 * Creates the properties for the ExtJS-Grid from the properties of the
	 * selected shapes.
	 */
	createProperties: function() {
		this.properties = [];
		this.popularProperties = [];
		this.simulationProperties = [];
		
		if(this.shapeSelection.commonProperties) {
			
			// add new property lines
			this.shapeSelection.commonProperties.each((function(pair, index) {

				var key = pair.prefix() + "-" + pair.id();
				
				// Get the property pair
				var name		= pair.title();
				var icons		= [];
				var attribute	= this.shapeSelection.commonPropertiesValues[key];
				
				var editorGrid = undefined;
				var editorRenderer = null;
				
				var refToViewFlag = false;

				var editorClass = ORYX.FieldEditors[pair.type()];
				 
				if (editorClass !== undefined) {
					editorGrid = editorClass.init.bind(this, key, pair, icons, index)();
					if (editorGrid == null) {
						return; // don't insist, the editor won't be created this time around.
					}
					// Register Event to enable KeyDown
					editorGrid.on('beforehide', this.facade.enableEvent.bind(this, ORYX.CONFIG.EVENT_KEYDOWN));
					editorGrid.on('specialkey', this.specialKeyDown.bind(this));
				} else {
					if(!pair.readonly()){
						switch(pair.type()) {
						case ORYX.CONFIG.TYPE_STRING:
							// If the Text is MultiLine
							if(pair.wrapLines()) {
								// Set the Editor as TextArea
								var editorTextArea = new Ext.form.TextArea({alignment: "tl-tl", allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorTextArea.on('keyup', function(textArea, event) {
									this.editDirectly(key, textArea.getValue());
								}.bind(this));								

								editorGrid = new Ext.Editor(editorTextArea);
							} else {
								// If not, set the Editor as InputField
								var editorInput = new Ext.form.TextField({allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length()});
								editorInput.on('keyup', function(input, event) {
									this.editDirectly(key, input.getValue());
								}.bind(this));

								// reverts the shape if the editor field is invalid
								editorInput.on('blur', function(input) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));

								editorInput.on("specialkey", function(input, e) {
									if(!input.isValid(false))
										this.updateAfterInvalid(key);
								}.bind(this));

								editorGrid = new Ext.Editor(editorInput);
							}
							break;
						case ORYX.CONFIG.TYPE_BOOLEAN:
							// Set the Editor as a CheckBox
							var editorCheckbox = new Ext.form.Checkbox();
							editorCheckbox.on('check', function(c,checked) {
								this.editDirectly(key, checked);
							}.bind(this));

							editorGrid = new Ext.Editor(editorCheckbox);
							break;
						case ORYX.CONFIG.TYPE_INTEGER:
							// Set as an Editor for Integers
							var numberField = new Ext.form.NumberField({allowBlank: pair.optional(), allowDecimals:false, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));							

							editorGrid = new Ext.Editor(numberField);
							break;
						case ORYX.CONFIG.TYPE_FLOAT:
							// Set as an Editor for Float
							var numberField = new Ext.form.NumberField({ allowBlank: pair.optional(), allowDecimals:true, msgTarget:'title', minValue: pair.min(), maxValue: pair.max()});
							numberField.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));

							editorGrid = new Ext.Editor(numberField);

							break;
						case ORYX.CONFIG.TYPE_COLOR:
							// Set as a ColorPicker
							// Ext1.0 editorGrid = new gEdit(new form.ColorField({ allowBlank: pair.optional(),  msgTarget:'title' }));

							var editorPicker = new Ext.ux.ColorField({ allowBlank: pair.optional(),  msgTarget:'title', facade: this.facade });

							/*this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COLOR_CHANGE, function(option) {
								this.editDirectly(key, option.value);
							}.bind(this));*/

							editorGrid = new Ext.Editor(editorPicker);

							break;
						case ORYX.CONFIG.TYPE_CHOICE:
							var items = pair.items();

							var options = [];
							items.each(function(value) {
								if(value.value() == attribute)
									attribute = value.title();

								if(value.refToView()[0])
									refToViewFlag = true;

								options.push([value.icon(), value.title(), value.value()]);

								icons.push({
									name: value.title(),
									icon: value.icon()
								});
							});

							var store = new Ext.data.SimpleStore({
								fields: [{name: 'icon'},
								         {name: 'title'},
								         {name: 'value'}	],
								         data : options
							});

							// Set the grid Editor

							var editorCombo = new Ext.form.ComboBox({
								editable: false,
								tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
								store: store,
								displayField:'title',
								valueField: 'value',
								typeAhead: true,
								mode: 'local',
								triggerAction: 'all',
								selectOnFocus:true
							});

							editorCombo.on('select', function(combo, record, index) {
								this.editDirectly(key, combo.getValue());
							}.bind(this))

							editorGrid = new Ext.Editor(editorCombo);

							break;

                            case ORYX.CONFIG.TYPE_DYNAMICCHOICE:
                            var items = pair.items();

                            var options = [];
                            items.each(function(value) {
                                if(value.value() == attribute)
                                    attribute = value.title();

                                if(value.refToView()[0])
                                    refToViewFlag = true;

                                // add first blank for reset possiblity
                                options.push(["", "", ""]);
                                // evaluate each value expression
                                var processJSON = ORYX.EDITOR.getSerializedJSON();
                                var expressionresults = jsonPath(processJSON.evalJSON(), value.value());
                                if(expressionresults) {
                                    if(expressionresults.toString().length > 0) {
                                        for(var i=0; i< expressionresults.length; i++) {
                                            var expressionparts = expressionresults[i].split(",");
                                            for (var j = 0; j < expressionparts.length; j++) {
                                                if(expressionparts[j].indexOf(":") > 0) {
                                                    var valueParts = expressionparts[j].split(":");
                                                    options.push([value.icon(), valueParts[0], valueParts[0]]);
                                                } else {
                                                    options.push([value.icon(), expressionparts[j], expressionparts[j]]);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    this.facade.raiseEvent({
                                        type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                        ntype		: 'info',
                                        msg         : 'No data available for property.',
                                        title       : ''

                                    });
                                }

                                icons.push({
                                    name: value.title(),
                                    icon: value.icon()
                                });
                            });

                            var store = new Ext.data.SimpleStore({
                                fields: [{name: 'icon'},
                                    {name: 'title'},
                                    {name: 'value'}	],
                                data : options
                            });

                            // Set the grid Editor

                            var editorCombo = new Ext.form.ComboBox({
                                editable: false,
                                tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
                                store: store,
                                displayField:'title',
                                valueField: 'value',
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                selectOnFocus:true
                            });

                            editorCombo.on('select', function(combo, record, index) {
                                this.editDirectly(key, combo.getValue());
                            }.bind(this))

                            editorGrid = new Ext.Editor(editorCombo);

                            break;

                            case ORYX.CONFIG.TYPE_DYNAMICDATAINPUT:
                            var options = [];
                            var selection = ORYX.EDITOR._pluginFacade.getSelection();
                            if(selection && selection.length == 1) {
                                var shape = selection.first();
                                var shapeid = shape.resourceId;
                                var processJSON = ORYX.EDITOR.getSerializedJSON();

                                // add blank for reset possiblity
                                options.push(["", "", ""]);
                                var childshapes = jsonPath(processJSON.evalJSON(), "$.childShapes.*");
                                for(var i=0;i<childshapes.length;i++){
                                    var csobj = childshapes[i];
                                    if(csobj.resourceId == shapeid) {
                                        var datainputs = csobj.properties.datainputset;
                                        var datainParts = datainputs.split(",");
                                        for(var j=0; j < datainParts.length; j++) {
                                            var nextPart = datainParts[j];
                                            if(nextPart.indexOf(":") > 0) {
                                                var innerParts = nextPart.split(":");
                                                options.push(["", innerParts[0], innerParts[0]]);
                                            } else {
                                                options.push(["", nextPart, nextPart]);
                                            }
                                        }
                                    }
                                }
                            }

                            var store = new Ext.data.SimpleStore({
                                fields: [{name: 'icon'},
                                    {name: 'title'},
                                    {name: 'value'}	],
                                data : options
                            });

                            // Set the grid Editor

                            var editorCombo = new Ext.form.ComboBox({
                                editable: false,
                                tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
                                store: store,
                                displayField:'title',
                                valueField: 'value',
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                selectOnFocus:true
                            });

                            editorCombo.on('select', function(combo, record, index) {
                                this.editDirectly(key, combo.getValue());
                            }.bind(this))

                            editorGrid = new Ext.Editor(editorCombo);

                            break;

                            case ORYX.CONFIG.TYPE_DYNAMICDATAOUTPUT:
                            var options = [];
                            var selection = ORYX.EDITOR._pluginFacade.getSelection();
                            if(selection && selection.length == 1) {
                                var shape = selection.first();
                                var shapeid = shape.resourceId;
                                var processJSON = ORYX.EDITOR.getSerializedJSON();

                                // add blank for reset possiblity
                                options.push(["", "", ""]);
                                var childshapes = jsonPath(processJSON.evalJSON(), "$.childShapes.*");
                                for(var i=0;i<childshapes.length;i++){
                                    var csobj = childshapes[i];
                                    if(csobj.resourceId == shapeid) {
                                        var dataoutputs = csobj.properties.dataoutputset;
                                        var dataoutParts = dataoutputs.split(",");
                                        for(var k=0; k < dataoutParts.length; k++) {
                                            var nextPart = dataoutParts[k];
                                            if(nextPart.indexOf(":") > 0) {
                                                var innerParts = nextPart.split(":");
                                                options.push(["", innerParts[0], innerParts[0]]);
                                            } else {
                                                options.push(["", nextPart, nextPart]);
                                            }
                                        }
                                    }
                                }
                            }

                            var store = new Ext.data.SimpleStore({
                                fields: [{name: 'icon'},
                                    {name: 'title'},
                                    {name: 'value'}	],
                                data : options
                            });

                            // Set the grid Editor

                            var editorCombo = new Ext.form.ComboBox({
                                editable: false,
                                tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
                                store: store,
                                displayField:'title',
                                valueField: 'value',
                                typeAhead: true,
                                mode: 'local',
                                triggerAction: 'all',
                                selectOnFocus:true
                            });

                            editorCombo.on('select', function(combo, record, index) {
                                this.editDirectly(key, combo.getValue());
                            }.bind(this))

                            editorGrid = new Ext.Editor(editorCombo);

                            break;


                            case ORYX.CONFIG.TYPE_DYNAMICGATEWAYCONNECTIONS:
                                var currentShapes = ORYX.Config.FACADE.getSelection();
                                var options = [];
                                if(currentShapes && currentShapes.length == 1) {
                                    var shape = currentShapes.first();
                                    var shapeid = shape.resourceId;

                                    var processJSON = ORYX.EDITOR.getSerializedJSON();
                                    var ajaxObj = new XMLHttpRequest;
                                    var url = ORYX.PATH + "processinfo";
                                    var params  = "uuid=" + ORYX.UUID + "&ppdata=" + ORYX.PREPROCESSING + "&profile=" + ORYX.PROFILE + "&gatewayid=" + shapeid + "&json=" + encodeURIComponent(processJSON);
                                    ajaxObj.open("POST",url,false);
                                    ajaxObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                    ajaxObj.send(params);
                                    if (ajaxObj.status == 200) {
                                        var gatewayconnectionsJson = ajaxObj.responseText.evalJSON();

                                        for(var i=0;i<gatewayconnectionsJson.length;i++){
                                            var csobj = gatewayconnectionsJson[i];
                                            options.push(["", csobj.sequenceflowinfo, csobj.sequenceflowinfo]);
                                        }
                                    } else {
                                        ORYX.EDITOR._pluginFacade.raiseEvent({
                                            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                            ntype		: 'error',
                                            msg         : 'Error determining outgoing connections.',
                                            title       : ''

                                        });
                                    }
                                } else {
                                    ORYX.EDITOR._pluginFacade.raiseEvent({
                                        type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                        ntype		: 'error',
                                        msg         : 'Invalid number of nodes selected.',
                                        title       : ''

                                    });
                                }

                                var store = new Ext.data.SimpleStore({
                                    fields: [{name: 'icon'},
                                        {name: 'title'},
                                        {name: 'value'}	],
                                    data : options
                                });
                                // Set the grid Editor
                                var editorCombo = new Ext.form.ComboBox({
                                    editable: false,
                                    tpl: '<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',
                                    store: store,
                                    displayField:'title',
                                    valueField: 'value',
                                    typeAhead: true,
                                    mode: 'local',
                                    triggerAction: 'all',
                                    selectOnFocus:true
                                });
                                editorCombo.on('select', function(combo, record, index) {
                                    this.editDirectly(key, combo.getValue());
                                }.bind(this))
                                editorGrid = new Ext.Editor(editorCombo);
                            break;

						case ORYX.CONFIG.TYPE_DATE:
							var currFormat = ORYX.I18N.PropertyWindow.dateFormat
							if(!(attribute instanceof Date))
								attribute = Date.parseDate(attribute, currFormat)
								editorGrid = new Ext.Editor(new Ext.form.DateField({ allowBlank: pair.optional(), format:currFormat,  msgTarget:'title'}));
							break;

						case ORYX.CONFIG.TYPE_TEXT:

							var cf = new Ext.form.ComplexTextField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;

						case ORYX.CONFIG.TYPE_VARDEF:
							var cf = new Ext.form.ComplexVardefField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_EXPRESSION:
							var cf = new Ext.form.ComplexExpressionField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_CALLEDELEMENT:
							var cf = new Ext.form.ComplexCalledElementField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_CUSTOM:
							var cf = new Ext.form.ComplexCustomField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade,
								title:pair.title(),
								attr:attribute
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_ACTION:
							var cf = new Ext.form.ComplexActionsField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
						
						case ORYX.CONFIG.TYPE_GLOBAL:
							var cf = new Ext.form.ComplexGlobalsField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_IMPORT:
							var cf = new Ext.form.ComplexImportsField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;


                        case ORYX.CONFIG.TYPE_REASSIGNMENT:
                            var cf = new Ext.form.ComplexReassignmentField({
                                allowBlank: pair.optional(),
                                dataSource:this.dataSource,
                                grid:this.grid,
                                row:index,
                                facade:this.facade
                            });
                            cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});
                            editorGrid = new Ext.Editor(cf);
                            break;


                        case ORYX.CONFIG.TYPE_NOTIFICATIONS:
                            var cf = new Ext.form.ComplexNotificationsField({
                                allowBlank: pair.optional(),
                                dataSource:this.dataSource,
                                grid:this.grid,
                                row:index,
                                facade:this.facade
                            });
                            cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});
                            editorGrid = new Ext.Editor(cf);
                            break;
						
						case ORYX.CONFIG.TYPE_DATAINPUT:
                            var cf = new Ext.form.ComplexDataInputField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_DATAINPUT_SINGLE:
                            var cf = new Ext.form.ComplexDataInputFieldSingle({
                            	allowBlank: pair.optional(),
                            	dataSource:this.dataSource,
                            	grid:this.grid,
                            	row:index,
                            	facade:this.facade
                            });
                            cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
                            editorGrid = new Ext.Editor(cf);
                            break;
							
						case ORYX.CONFIG.TYPE_DATAOUTPUT:
                            var cf = new Ext.form.ComplexDataOutputField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
						case ORYX.CONFIG.TYPE_DATAOUTPUT_SINGLE:
                            var cf = new Ext.form.ComplexDataOutputFieldSingle({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;

                        case ORYX.CONFIG.TYPE_DATAASSIGNMENT:
                                var cf = new Ext.form.ComplexDataAssignmenField({
                                    allowBlank: pair.optional(),
                                    dataSource:this.dataSource,
                                    grid:this.grid,
                                    row:index,
                                    facade:this.facade,
                                    shapes:this.shapeSelection.shapes
                                });
                                cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});
                                editorGrid = new Ext.Editor(cf);
                                break;
							
						case ORYX.CONFIG.TYPE_VISUALDATAASSIGNMENTS:
							var cf = new Ext.form.ComplexVisualDataAssignmentField({
								allowBlank: pair.optional(),
								dataSource:this.dataSource,
								grid:this.grid,
								row:index,
								facade:this.facade,
								shapes:this.shapeSelection.shapes
							});
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							
							// extended by Kerstin (start)
						case ORYX.CONFIG.TYPE_COMPLEX:

							var cf = new Ext.form.ComplexListField({ allowBlank: pair.optional()}, pair.complexItems(), key, this.facade);
							cf.on('dialogClosed', this.dialogClosed, {scope:this, row:index, col:1,field:cf});							
							editorGrid = new Ext.Editor(cf);
							break;
							// extended by Kerstin (end)

							// extended by Gerardo (Start)
						case "CPNString":
							var editorInput = new Ext.form.TextField(
									{
										allowBlank: pair.optional(),
										msgTarget:'title', 
										maxLength:pair.length(), 
										enableKeyEvents: true
									});

							editorInput.on('keyup', function(input, event) {
								this.editDirectly(key, input.getValue());
							}.bind(this));

							editorGrid = new Ext.Editor(editorInput);							
							break;
							// extended by Gerardo (End)

						default:
							var editorInput = new Ext.form.TextField({ allowBlank: pair.optional(),  msgTarget:'title', maxLength:pair.length(), enableKeyEvents: true});
						editorInput.on('keyup', function(input, event) {
							this.editDirectly(key, input.getValue());
						}.bind(this));

						editorGrid = new Ext.Editor(editorInput);
						}


						// Register Event to enable KeyDown
						editorGrid.on('beforehide', this.facade.enableEvent.bind(this, ORYX.CONFIG.EVENT_KEYDOWN));
						editorGrid.on('specialkey', this.specialKeyDown.bind(this));

					} else if(pair.type() === ORYX.CONFIG.TYPE_URL || pair.type() === ORYX.CONFIG.TYPE_DIAGRAM_LINK){
						attribute = String(attribute).search("http") !== 0 ? ("http://" + attribute) : attribute;
						attribute = "<a href='" + attribute + "' target='_blank'>" + attribute.split("://")[1] + "</a>"
					}
				}
				
				// Push to the properties-array
				if(pair.visible() && (pair.id() != "origbordercolor" && pair.id() != "origbgcolor" && pair.id() != "isselectable")) {
					var proceed = true;
					if(this.shapeSelection.shapes.length == 1 && (this.shapeSelection.shapes.first().getStencil().idWithoutNs() == "Task" ||
                           this.shapeSelection.shapes.first().getStencil().idWithoutNs() == "IntermediateEscalationEventThrowing" ||
                           this.shapeSelection.shapes.first().getStencil().idWithoutNs() == "IntermediateEvent" ||
                           this.shapeSelection.shapes.first().getStencil().idWithoutNs() == "IntermediateMessageEventThrowing" ||
                           this.shapeSelection.shapes.first().getStencil().idWithoutNs() == "IntermediateSignalEventThrowing")) {
						if(pair.fortasktypes() && pair.fortasktypes().length > 0) {
							var foundtasktype = false;
							var tts = pair.fortasktypes().split("|");
							for(var i = 0; i < tts.size(); i++) {
								if(tts[i] == this.shapeSelection.shapes.first().properties["oryx-tasktype"]) {
									foundtasktype = true;
								}
							}
							if(!foundtasktype) {
								proceed = false;
							}
						}

                        if(pair.ifproptrue() && pair.ifproptrue().length > 0) {
                            var foundifproptrue = false;
                            var itp = pair.ifproptrue();
                            if(this.shapeSelection.shapes.first().properties["oryx-"+itp] && this.shapeSelection.shapes.first().properties["oryx-"+itp] == "true") {
                                foundifproptrue = true;
                            }

                            if(!foundifproptrue) {
                                proceed = false;
                            }
                        }

						
						if(pair.fordistribution() && pair.fordistribution().length > 0) {
							var founddistribution = false;
							var tts = pair.fordistribution().split("|");
							for(var j = 0; j < tts.size(); j++) {
								if(tts[j] == this.shapeSelection.shapes.first().properties["oryx-distributiontype"]) {
									founddistribution = true;
								}
							}
							if(!founddistribution) {
								proceed = false;
							}
						}
						
					}
					
					if(proceed) {
						// Popular Properties are those with a refToView set or those which are set to be popular
						if (pair.refToView()[0] || refToViewFlag || pair.popular()) {
							pair.setPopular();
						}
						
						if (pair.simulation()) {
							pair.setSimulation();
						}
						
						
						if(pair.popular()) {
							this.popularProperties.push([ORYX.I18N.PropertyWindow.oftenUsed, name, attribute, icons, {
								editor: editorGrid,
								propId: key,
								type: pair.type(),
								tooltip: pair.description(),
								renderer: editorRenderer,
								labelProvider: this.getLabelProvider(pair)
							}]);
						} else if(pair.simulation()) {
							this.simulationProperties.push([ORYX.I18N.PropertyWindow.simulationProps, name, attribute, icons, {
								editor: editorGrid,
								propId: key,
								type: pair.type(),
								tooltip: pair.description(),
								renderer: editorRenderer,
								labelProvider: this.getLabelProvider(pair)
							}]);
						} else {	
							this.properties.push([ORYX.I18N.PropertyWindow.moreProps, name, attribute, icons, {
								editor: editorGrid,
								propId: key,
								type: pair.type(),
								tooltip: pair.description(),
								renderer: editorRenderer,
								labelProvider: this.getLabelProvider(pair)
							}]);
						}
					}
				}

			}).bind(this));
		}

		this.setProperties();
	},
	
	/**
	 * Gets a label provider from the registered label providers
	 * according to the id of the label provider registered on the stencil.
	 */
    getLabelProvider: function(stencil) {
       lp = ORYX.LabelProviders[stencil.labelProvider()];
       if (lp) {
           return lp(stencil);
       }
       return null;
    },
	
	hideMoreAttrs: function(panel) {
		// TODO: Implement the case that the canvas has no attributes
		if (this.properties.length <= 0){ return }
		
		// collapse the "more attr" group
		//this.grid.view.toggleGroup(this.grid.view.getGroupId(this.properties[0][0]), false);
		
		// prevent the more attributes pane from closing after a attribute has been edited
		this.grid.view.un("refresh", this.hideMoreAttrs, this);
	},

	setProperties: function() {
		var partProps = this.popularProperties.concat(this.properties);
		var props = partProps.concat(this.simulationProperties);
		this.dataSource.loadData(props);
	}
}
ORYX.Plugins.PropertyWindow = Clazz.extend(ORYX.Plugins.PropertyWindow);

/**
 * Editor for complex type
 * 
 * When starting to edit the editor, it creates a new dialog where new attributes
 * can be specified which generates json out of this and put this 
 * back to the input field.
 * 
 * This is implemented from Kerstin Pfitzner
 * 
 * @param {Object} config
 * @param {Object} items
 * @param {Object} key
 * @param {Object} facade
 */


Ext.form.ComplexListField = function(config, items, key, facade){
    Ext.form.ComplexListField.superclass.constructor.call(this, config);
	this.items 	= items;
	this.key 	= key;
	this.facade = facade;
};

/**
 * This is a special trigger field used for complex properties.
 * The trigger field opens a dialog that shows a list of properties.
 * The entered values will be stored as trigger field value in the JSON format.
 */
Ext.extend(Ext.form.ComplexListField, Ext.form.TriggerField,  {
	/**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-trigger' and triggerClass will be <b>appended</b> if specified.
     */
    triggerClass:	'x-form-complex-trigger',
	readOnly:		true,
	emptyText: 		ORYX.I18N.PropertyWindow.clickIcon,
		
	/**
	 * Builds the JSON value from the data source of the grid in the dialog.
	 */
	buildValue: function() {
		var ds = this.grid.getStore();
		ds.commitChanges();
		
		if (ds.getCount() == 0) {
			return "";
		}
		
		var jsonString = "[";
		for (var i = 0; i < ds.getCount(); i++) {
			var data = ds.getAt(i);		
			jsonString += "{";	
			for (var j = 0; j < this.items.length; j++) {
				var key = this.items[j].id();
				jsonString += key + ':' + ("" + data.get(key)).toJSON();
				if (j < (this.items.length - 1)) {
					jsonString += ", ";
				}
			}
			jsonString += "}";
			if (i < (ds.getCount() - 1)) {
				jsonString += ", ";
			}
		}
		jsonString += "]";
		
		jsonString = "{'totalCount':" + ds.getCount().toJSON() + 
			", 'items':" + jsonString + "}";
		return Object.toJSON(jsonString.evalJSON());
	},
	
	/**
	 * Returns the field key.
	 */
	getFieldKey: function() {
		return this.key;
	},
	
	/**
	 * Returns the actual value of the trigger field.
	 * If the table does not contain any values the empty
	 * string will be returned.
	 */
    getValue : function(){
		// return actual value if grid is active
		if (this.grid) {
			return this.buildValue();			
		} else if (this.data == undefined) {
			return "";
		} else {
			return this.data;
		}
    },
	
	/**
	 * Sets the value of the trigger field.
	 * In this case this sets the data that will be shown in
	 * the grid of the dialog.
	 * 
	 * @param {Object} value The value to be set (JSON format or empty string)
	 */
	setValue: function(value) {	
		if (value.length > 0) {
			// set only if this.data not set yet
			// only to initialize the grid
			if (this.data == undefined) {
				this.data = value;
			}
		}
	},
	
	/**
	 * Returns false. In this way key events will not be propagated
	 * to other elements.
	 * 
	 * @param {Object} event The keydown event.
	 */
	keydownHandler: function(event) {
		return false;
	},
	
	/**
	 * The listeners of the dialog. 
	 * 
	 * If the dialog is hidded, a dialogClosed event will be fired.
	 * This has to be used by the parent element of the trigger field
	 * to reenable the trigger field (focus gets lost when entering values
	 * in the dialog).
	 */
    dialogListeners : {
        show : function(){ // retain focus styling
            this.onFocus();	
			this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			return;
        },
        hide : function(){

            var dl = this.dialogListeners;
            this.dialog.un("show", dl.show,  this);
            this.dialog.un("hide", dl.hide,  this);
			
			this.dialog.destroy(true);
			this.grid.destroy(true);
			delete this.grid;
			delete this.dialog;
			
			this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keydownHandler.bind(this));
			this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
			
			// store data and notify parent about the closed dialog
			// parent has to handel this event and start editing the text field again
			this.fireEvent('dialogClosed', this.data);
			
			Ext.form.ComplexListField.superclass.setValue.call(this, this.data);
        }
    },	
	
	/**
	 * Builds up the initial values of the grid.
	 * 
	 * @param {Object} recordType The record type of the grid.
	 * @param {Object} items      The initial items of the grid (columns)
	 */
	buildInitial: function(recordType, items) {
		var initial = new Hash();
		
		for (var i = 0; i < items.length; i++) {
			var id = items[i].id();
			initial[id] = items[i].value();
		}
		
		var RecordTemplate = Ext.data.Record.create(recordType);
		return new RecordTemplate(initial);
	},
	
	/**
	 * Builds up the column model of the grid. The parent element of the
	 * grid.
	 * 
	 * Sets up the editors for the grid columns depending on the 
	 * type of the items.
	 * 
	 * @param {Object} parent The 
	 */
	buildColumnModel: function(parent) {
		var cols = [];
		for (var i = 0; i < this.items.length; i++) {
			var id 		= this.items[i].id();
			var header 	= this.items[i].name();
			var width 	= this.items[i].width();
			var type 	= this.items[i].type();
			var editor;
			
			if (type == ORYX.CONFIG.TYPE_STRING) {
				editor = new Ext.form.TextField({ allowBlank : this.items[i].optional(), width : width});
			} 
			else if (type == ORYX.CONFIG.TYPE_INTEGER) {
				editor = new Ext.form.TextField({ allowBlank : this.items[i].optional(), width : width});
			} else if (type == ORYX.CONFIG.TYPE_CHOICE) {				
				var items = this.items[i].items();
				var select = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['select', {style:'display:none'}]);
				var optionTmpl = new Ext.Template('<option value="{value}">{value}</option>');
				items.each(function(value){ 
					optionTmpl.append(select, {value:value.value()}); 
				});				
				
				editor = new Ext.form.ComboBox(
					{ editable: false, typeAhead: true, triggerAction: 'all', transform:select, lazyRender:true,  msgTarget:'title', width : width});
            } else if(type == ORYX.CONFIG.TYPE_DYNAMICCHOICE) {
                var items = this.items[i].items();
                var select = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parent, ['select', {style:'display:none'}]);
                var optionTmpl = new Ext.Template('<option value="{value}">{value}</option>');
                items.each(function(value){
                    // evaluate each value expression
                    var processJSON = ORYX.EDITOR.getSerializedJSON();
                    var expressionresults = jsonPath(processJSON.evalJSON(), value.value());
                    if(expressionresults) {
                        if(expressionresults.toString().length > 0) {
                            for(var i=0; i< expressionresults.length; i++) {
                                var expressionparts = expressionresults[i].split(",");
                                for (var j = 0; j < expressionparts.length; j++) {
                                    if(expressionparts[j].indexOf(":") > 0) {
                                        var valueParts = expressionparts[j].split(":");
                                        optionTmpl.append(select, {value:valueParts[0]});
                                    } else {
                                        optionTmpl.append(select, {value:expressionparts[j]});
                                    }
                                }
                            }
                        }
                    } else {
                        this.facade.raiseEvent({
                            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                            ntype		: 'info',
                            msg         : 'No data available for property.',
                            title       : ''

                        });
                    }
                });

                editor = new Ext.form.ComboBox(
                    { editable: false, typeAhead: true, triggerAction: 'all', transform:select, lazyRender:true,  msgTarget:'title', width : width});
            } else if (type == ORYX.CONFIG.TYPE_BOOLEAN) {
				editor = new Ext.form.Checkbox( { width : width } );
			} else if (type == "xpath") {
				//TODO set the xpath type as string, same editor as string.
				editor = new Ext.form.TextField({ allowBlank : this.items[i].optional(), width : width});
			}
					
			cols.push({
				id: 		id,
				header: 	header,
				dataIndex: 	id,
				resizable: 	true,
				editor: 	editor,
				width:		width
	        });
			
		}
		return new Ext.grid.ColumnModel(cols);
	},
	
	/**
	 * After a cell was edited the changes will be commited.
	 * 
	 * @param {Object} option The option that was edited.
	 */
	afterEdit: function(option) {
		option.grid.getStore().commitChanges();
	},
		
	/**
	 * Before a cell is edited it has to be checked if this 
	 * cell is disabled by another cell value. If so, the cell editor will
	 * be disabled.
	 * 
	 * @param {Object} option The option to be edited.
	 */
	beforeEdit: function(option) {

		var state = this.grid.getView().getScrollState();
		
		var col = option.column;
		var row = option.row;
		var editId = this.grid.getColumnModel().config[col].id;
		// check if there is an item in the row, that disables this cell
		for (var i = 0; i < this.items.length; i++) {
			// check each item that defines a "disable" property
			var item = this.items[i];
			var disables = item.disable();
			if (disables != undefined) {
				
				// check if the value of the column of this item in this row is equal to a disabling value
				var value = this.grid.getStore().getAt(row).get(item.id());
				for (var j = 0; j < disables.length; j++) {
					var disable = disables[j];
					if (disable.value == value) {
						
						for (var k = 0; k < disable.items.length; k++) {
							// check if this value disables the cell to select 
							// (id is equals to the id of the column to edit)
							var disItem = disable.items[k];
							if (disItem == editId) {
								this.grid.getColumnModel().getCellEditor(col, row).disable();
								return;
							}
						}
					}
				}		
			}
		}
		this.grid.getColumnModel().getCellEditor(col, row).enable();
		//this.grid.getView().restoreScroll(state);
	},
	
    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }	
		
		//if(!this.dialog) { 
		
			var dialogWidth = 0;
			var recordType 	= [];
			
			for (var i = 0; i < this.items.length; i++) {
				var id 		= this.items[i].id();
				var width 	= this.items[i].width();
				var type 	= this.items[i].type();	
					
				if ( (type == ORYX.CONFIG.TYPE_CHOICE) || (type == ORYX.CONFIG.TYPE_DYNAMICCHOICE) ) {
					type = ORYX.CONFIG.TYPE_STRING;
				}

				dialogWidth += width;
				recordType[i] = {name:id, type:type};
			}			
			
			if (dialogWidth > 800) {
				dialogWidth = 800;
			}
			dialogWidth += 22;
			
			var data = this.data;
			if (data == "") {
				// empty string can not be parsed
				data = "{}";
			}
			
			
			var ds = new Ext.data.Store({
		        proxy: new Ext.data.MemoryProxy(eval("(" + data + ")")),				
				reader: new Ext.data.JsonReader({
		            root: 'items',
		            totalProperty: 'totalCount'
		        	}, recordType)
	        });
			ds.load();
					
				
			var cm = this.buildColumnModel();
			
			this.grid = new Ext.grid.EditorGridPanel({
                autoScroll: true,
                autoHeight: true,
				store:		ds,
		        cm:			cm,
				stripeRows: true,
				clicksToEdit : 1,
		        selModel: 	new Ext.grid.CellSelectionModel()
		    });	
			
									
			//var gridHead = this.grid.getView().getHeaderPanel(true);
			var toolbar = new Ext.Toolbar(
			[{
				text: ORYX.I18N.PropertyWindow.add,
				handler: function(){
					var ds = this.grid.getStore();
					var index = ds.getCount();
					this.grid.stopEditing();
					var p = this.buildInitial(recordType, this.items);
					ds.insert(index, p);
					ds.commitChanges();
					this.grid.startEditing(index, 0);
				}.bind(this)
			},{
				text: ORYX.I18N.PropertyWindow.rem,
		        handler : function(){
					var ds = this.grid.getStore();
					var selection = this.grid.getSelectionModel().getSelectedCell();
					if (selection == undefined) {
						return;
					}
					this.grid.getSelectionModel().clearSelections();
		            this.grid.stopEditing();					
					var record = ds.getAt(selection[0]);
					ds.remove(record);
					ds.commitChanges();           
				}.bind(this)
			}]);			
		
			// Basic Dialog
			this.dialog = new Ext.Window({ 
				autoScroll: true,
				autoCreate: true, 
				title: ORYX.I18N.PropertyWindow.complex, 
				height: 350, 
				width: dialogWidth, 
				modal:true,
				collapsible:false,
				fixedcenter: true, 
				shadow:true, 
				proxyDrag: true,
				keys:[{
					key: 27,
					fn: function(){
						this.dialog.hide
					}.bind(this)
				}],
				items:[toolbar, this.grid],
				bodyStyle:"background-color:#FFFFFF",
				buttons: [{
	                text: ORYX.I18N.PropertyWindow.ok,
	                handler: function(){
	                	this.grid.getView().refresh();
	                    this.grid.stopEditing();	
						// store dialog input
						this.data = this.buildValue();
						this.dialog.hide()
	                }.bind(this)
	            }, {
	                text: ORYX.I18N.PropertyWindow.cancel,
	                handler: function(){
	                	this.dialog.hide()
	                }.bind(this)
	            }]
			});		
				
			this.dialog.on(Ext.apply({}, this.dialogListeners, {
	       		scope:this
	        }));
		
			this.dialog.show();	
		
	
			this.grid.on('beforeedit', 	this.beforeEdit, 	this, true);
			this.grid.on('afteredit', 	this.afterEdit, 	this, true);
			
			this.grid.render();			
	    
		/*} else {
			this.dialog.show();		
		}*/
		
	}
});


Ext.form.ComplexTextField = Ext.extend(Ext.form.TriggerField,  {

	defaultAutoCreate : {tag: "textarea", rows:1, style:"height:16px;overflow:hidden;" },

    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
		
        if(this.disabled){
            return;
        }	
		        
		var grid = new Ext.form.TextArea({
	        anchor		: '100% 100%',
			value		: this.value,
			listeners	: {
				focus: function(){
					this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
				}.bind(this)
			}
		})
		
		
		// Basic Dialog
		var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: ORYX.I18N.PropertyWindow.text, 
			height		: 500, 
			width		: 500, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			proxyDrag	: true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
                	// store dialog input
					var value = grid.getValue();
					this.setValue(value);
					
					this.dataSource.getAt(this.row).set('value', value)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
		
	}
});

Ext.form.ComplexCustomField = Ext.extend(Ext.form.TriggerField,  {
	onTriggerClick : function() {
    	if(this.disabled){
            return;
        }
    	
    	Ext.Ajax.request({
            url: ORYX.PATH + 'customeditors',
            method: 'POST',
            success: function(response) {
    	   		try {
    	   			if(response.responseText && response.responseText.length > 0) {
    	   				var customEditorsJSON = response.responseText.evalJSON();
    	   				var customEditorsObj = customEditorsJSON["editors"];
    	   				if(customEditorsObj[this.title]) {
    	   					var dialog = new Ext.Window({ 
    	   						layout		: 'anchor',
    	   						autoCreate	: true, 
    	   						title		: 'Custom Editor for ' + this.title, 
    	   						height		: 300, 
    	   						width		: 450, 
    	   						modal		: true,
    	   						collapsible	: false,
    	   						fixedcenter	: true, 
    	   						shadow		: true, 
    	   						resizable   : true,
    	   						proxyDrag	: true,
    	   						autoScroll  : true,
    	   						keys:[{
    	   							key	: 27,
    	   							fn	: function(){
    	   									dialog.hide()
    	   							}.bind(this)
    	   						}],
    	   						items : [{
    	   					        xtype : "component",
    	   					        id    : 'customeditorswindow',
    	   					        autoEl : {
    	   					            tag : "iframe",
    	   					            src : customEditorsObj[this.title],
    	   					            width: "100%",
    	   					            height: "100%"
    	   					        }
    	   					    }],
    	   						listeners : {
    	   							hide: function(){
    	   								this.fireEvent('dialogClosed', this.value);
    	   								dialog.destroy();
    	   							}.bind(this)				
    	   						},
    	   						buttons		: [{
    	   			                text: ORYX.I18N.PropertyWindow.ok,
    	   			                handler: function(){	 
    	   			                	var outValue = document.getElementById('customeditorswindow').contentWindow.getEditorValue();
    	   			                	this.setValue(outValue);
    	   								this.dataSource.getAt(this.row).set('value', outValue)
    	   								this.dataSource.commitChanges()
    	   								dialog.hide();
    	   			                }.bind(this)
    	   			            }, {
    	   			                text: ORYX.I18N.PropertyWindow.cancel,
    	   			                handler: function(){
    	   								this.setValue(this.value);
    	   			                	dialog.hide()
    	   			                }.bind(this)
    	   			            }]
    	   					});		
    	   					dialog.show();		
    	   					this.grid.stopEditing();
    	   				} else {
                               this.facade.raiseEvent({
                                   type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                   ntype		: 'error',
                                   msg         : 'Unable to find custom editor info for' + this.title,
                                   title       : ''

                               });
    	   				}
    	   			} else {
                           this.facade.raiseEvent({
                               type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                               ntype		: 'error',
                               msg         : 'Invalid Custom Editors data.',
                               title       : ''

                           });
    	   			}
    	   		} catch(e) {
                       this.facade.raiseEvent({
                           type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                           ntype		: 'error',
                           msg         : 'Error applying Custom Editor data:\n' + e,
                           title       : ''

                       });
    	   		}
            }.bind(this),
            failure: function(){
                this.facade.raiseEvent({
                    type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                    ntype		: 'error',
                    msg         : 'Error applying Custom Editor data.',
                    title       : ''

                });
            },
            params: {
            	profile: ORYX.PROFILE
            }
        });
	}
});

Ext.form.ComplexNotificationsField = Ext.extend(Ext.form.TriggerField,  {
    onTriggerClick : function() {
        if(this.disabled){
            return;
        }

        var NotificationsDef = Ext.data.Record.create([{
            name: 'type'
        }, {
            name: 'expires'
        }, {
            name: 'from'
        }, {
            name: 'tousers'
        }, {
            name: 'togroups'
        }, {
            name: 'replyto'
        }, {
            name: 'subject'
        }, {
            name: 'body'
        }]);

        var notificationsProxy = new Ext.data.MemoryProxy({
            root: []
        });

        var notifications = new Ext.data.Store({
            autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, NotificationsDef),
            proxy: notificationsProxy,
            sorters: [{
                property: 'subject',
                direction:'ASC'
            }, {
                property: 'from',
                direction:'ASC'
            }, {
                property: 'tousers',
                direction:'ASC'
            }, {
                property: 'togroups',
                direction:'ASC'
            }]
        });
        notifications.load();

        if(this.value.length > 0) {
            //[from:fromStr|tousers:someusers|togroups:groupStr|replyTo:replyStr|subject:subject|body:this <br/>is<br/>test]@[expStr]@not-started^[from:from2|togroups:group2|replyTo:reply2|subject:subject2|body:this is some <br/>other body text]@[ext2]@not-completed
            this.value = this.value.replace(/\[/g , "");
            this.value = this.value.replace(/\]/g , "");

            var valueParts = this.value.split("^");
            for(var i=0; i < valueParts.length; i++) {
                var nextPart = valueParts[i];
                if(nextPart.indexOf("@") > 0) {
                    var innerParts = nextPart.split("@");
                    var usergroupsstr = innerParts[0];
                    var expiresstr = innerParts[1];
                    var typestr = innerParts[2];

                    var fromstr = "";
                    var tousersstr = "";
                    var togroupsstr = "";
                    var replytostr = "";
                    var subjectstr = "";
                    var bodystr = "";

                    if(usergroupsstr.indexOf("|") > 0) {
                        var tparts = usergroupsstr.split("|");
                        for(var j=0; j< tparts.length; j++) {
                            var epartsone = tparts[j].split(/:(.+)?/)[0];
                            var epartstwo = tparts[j].split(/:(.+)?/)[1];

                            if(epartsone == "from") {
                                fromstr = epartstwo;
                            } else if(epartsone == "tousers") {
                                tousersstr = epartstwo;
                            } else if(epartsone == "togroups") {
                                togroupsstr = epartstwo;
                            } else if(epartsone == "replyTo") {
                                replytostr = epartstwo;
                            } else if(epartsone == "subject") {
                                subjectstr = epartstwo;
                            } else if(epartsone == "body") {
                                bodystr = epartstwo.replace(/<br\s?\/?>/g,"\n");
                            }
                        }
                    } else {
                        var epartsone = usergroupsstr.split(/:(.+)?/)[0];
                        var epartstwo = usergroupsstr.split(/:(.+)?/)[1];
                        if(epartsone == "from") {
                            fromstr = epartstwo;
                        } else if(epartsone == "tousers") {
                            tousersstr = epartstwo;
                        } else if(epartsone == "togroups") {
                            togroupsstr = epartstwo;
                        } else if(epartsone == "replyTo") {
                            replytostr = epartstwo;
                        } else if(epartsone == "subject") {
                            subjectstr = epartstwo;
                        } else if(epartsone == "body") {
                            bodystr = epartstwo.replace(/<br\s?\/?>/g,"\n");
                        }
                    }

                    notifications.add(new NotificationsDef({
                        type: typestr == undefined ? "" : typestr,
                        expires: expiresstr == undefined ? "" : expiresstr,
                        from: fromstr == undefined ? "" : fromstr,
                        tousers: tousersstr == undefined ? "" : tousersstr,
                        togroups: togroupsstr == undefined ? "" : togroupsstr,
                        replyto: replytostr == undefined ? "" : replytostr,
                        subject: subjectstr == undefined ? "" : subjectstr,
                        body: bodystr == undefined ? "" : bodystr
                    }));
                }
            }
        }

        var typeData = new Array();
        var notStartedType = new Array();
        notStartedType.push("not-started");
        notStartedType.push("not-started");
        typeData.push(notStartedType);
        var notCompletedTYpe = new Array();
        notCompletedTYpe.push("not-completed");
        notCompletedTYpe.push("not-completed");
        typeData.push(notCompletedTYpe);

        var gridId = Ext.id();
        var itemDeleter = new Extensive.grid.ItemDeleter();
        var bodyEditor = new Ext.form.TextArea({ id: 'notificationsbodyeditor', width: 150, height: 650, allowBlank: true, disableKeyFilter:true, grow: true});
        var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: notifications,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),
            {
                id: 'type',
                header: 'Type',
                width: 100,
                dataIndex: 'type',
                editor: new Ext.form.ComboBox({
                    id: 'typeCombo',
                    valueField:'name',
                    displayField:'value',
                    labelStyle:'display:none',
                    submitValue : true,
                    typeAhead: false,
                    queryMode: 'local',
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus:true,
                    hideTrigger: false,
                    forceSelection: false,
                    selectOnFocus:true,
                    autoSelect:false,
                    store: new Ext.data.SimpleStore({
                        fields: [
                            'name',
                            'value'
                        ],
                        data: typeData
                    })
                })
            },
            {
                id: 'expires',
                header: 'Expires At',
                width: 100,
                dataIndex: 'expires',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'from',
                header: 'From',
                width: 100,
                dataIndex: 'from',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'tousers',
                header: 'To Users',
                width: 100,
                dataIndex: 'tousers',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'togroups',
                header: 'To Groups',
                width: 100,
                dataIndex: 'togroups',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'replyto',
                header: 'Reply To',
                width: 100,
                dataIndex: 'replyto',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'subject',
                header: 'Subject',
                width: 100,
                dataIndex: 'subject',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'body',
                header: 'Body',
                width: 100,
                height: 650,
                dataIndex: 'body',
                //editor: new Ext.grid.GridEditor(new Ext.form.TextArea(), {autoSize: 'full', })},
                editor: new Ext.form.TextArea({ width: 150, height: 650, allowBlank: true, disableKeyFilter:true, grow: true}),
                renderer: Ext.util.Format.htmlEncode
            }, itemDeleter]),
            selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: 'Add Notification',
                handler : function(){
                    notifications.add(new NotificationsDef({
                        expires: '',
                        from: '',
                        tousers: '',
                        type: 'not-started',
                        togroups: '',
                        replyto: '',
                        subject: '',
                        body: ''
                    }));

                    grid.fireEvent('cellclick', grid, notifications.getCount()-1, 1, null);
                }
            }],
            clicksToEdit: 1,
            listeners:
            {
                beforeedit: function(evt)
                {
                    if(evt.column != 8)
                        return true;

                    var existingWindow = Ext.get("notificationsBodyEditorWindow");
                    if(!existingWindow) {
                        var win = new Ext.Window
                            ({
                                id: 'notificationsBodyEditorWindow',
                                modal		: true,
                                collapsible	: false,
                                fixedcenter	: true,
                                shadow		: true,
                                proxyDrag	: true,
                                autoScroll  : true,
                                autoWidth   :  true,
                                autoHeight  : true,
                                bodyBorder  : false,
                                closable    :   true,
                                resizable   :  true,
                                items:
                                    [{
                                        xtype:      'panel',
                                        html:       "<p class='instructions'>Enter Notification body message.</p>"
                                    },
                                        {
                                            xtype:      'textarea',
                                            id:         'notificationbodyinput',
                                            width:      350,
                                            height:     300,
                                            modal:      true,
                                            value:      evt.value
                                        }],
                                bbar:
                                    [{
                                        text: 'OK',
                                        handler: function()
                                        {
                                            evt.record.set('body', Ext.get('notificationbodyinput').getValue());
                                            win.close();
                                        }
                                    }]
                            });
                        win.show();
                        return false;
                    } else {
                        return false;
                    }
                }
            }
        });

        var dialog = new Ext.Window({
            layout		: 'anchor',
            autoCreate	: true,
            title		: 'Editor for Notifications',
            height		: 350,
            width		: 900,
            modal		: true,
            collapsible	: false,
            fixedcenter	: true,
            shadow		: true,
            resizable   : true,
            proxyDrag	: true,
            autoScroll  : true,
            keys:[{
                key	: 27,
                fn	: function(){
                    dialog.hide()
                }.bind(this)
            }],
            items		:[grid],
            listeners	:{
                hide: function(){
                    this.fireEvent('dialogClosed', this.value);
                    //this.focus.defer(10, this);
                    dialog.destroy();
                }.bind(this)
            },
            buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){
                    var outValue = "";
                    grid.stopEditing();
                    grid.getView().refresh();
                    notifications.data.each(function() {
                        // [from:jbpm|tousers:maciej,tihomir|togroups:groups|replyTo:reploTo|subject:test|body:hello]@[6h]^[from:jbpm|tousers:kris,john|togroups:dev|replyTo:reployTo|subject:Next notification|body:again]@[5d]
                        if( (this.data['tousers'].length > 0 || this.data['togroups'].length > 0) && this.data['subject'].length > 0 && this.data['body'].length > 0) {
                            outValue += "[from:" + this.data['from'] + "|tousers:" + this.data['tousers'] + "|togroups:" + this.data['togroups'] + "|replyTo:" + this.data['replyto']  + "|subject:" + this.data['subject'] + "|body:" + this.data['body'].replace(/\r\n|\r|\n/g,"<br />") + "]";
                            outValue += "@[" + this.data['expires'] + "]";
                            outValue += "@" + this.data['type'];
                            outValue += "^";
                        }
                    });
                    if(outValue.length > 0) {
                        outValue = outValue.slice(0, -1)
                    }
                    this.setValue(outValue);
                    this.dataSource.getAt(this.row).set('value', outValue)
                    this.dataSource.commitChanges()

                    dialog.hide();
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
                    this.setValue(this.value);
                    dialog.hide()
                }.bind(this)
            }]
        });

        dialog.show();
        grid.render();

        this.grid.stopEditing();
        grid.focus( false, 100 );
    }
});


Ext.form.ComplexReassignmentField = Ext.extend(Ext.form.TriggerField,  {
    onTriggerClick : function() {
        if(this.disabled){
            return;
        }

        var ReassignmentDef = Ext.data.Record.create([{
            name: 'users'
        }, {
            name: 'groups'
        }, {
            name: 'expires'
        }, {
            name: 'type'
        }]);

        var reassignmentProxy = new Ext.data.MemoryProxy({
            root: []
        });

        var reassignments = new Ext.data.Store({
            autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, ReassignmentDef),
            proxy: reassignmentProxy,
            sorters: [{
                property: 'users',
                direction:'ASC'
            },
            {
                property: 'groups',
                direction:'ASC'
            }]
        });
        reassignments.load();

        if(this.value.length > 0) {
            this.value = this.value.replace(/\[/g , "");
            this.value = this.value.replace(/\]/g , "");

            var valueParts = this.value.split("^");
            for(var i=0; i < valueParts.length; i++) {
                var nextPart = valueParts[i];
                if(nextPart.indexOf("@") > 0) {
                    var innerParts = nextPart.split("@");
                    var usergroupsstr = innerParts[0];
                    var expiresstr = innerParts[1];
                    var typestr = innerParts[2];

                    var userPartValue = "";
                    var groupsPartValue = "";
                    if(usergroupsstr.indexOf("|") > 0) {
                        var tparts = usergroupsstr.split("|");
                        var partone = tparts[0];
                        var parttwo = tparts[1];

                        var epartsone = partone.split(":");
                        if(epartsone[0] == "users") {
                            userPartValue = epartsone[1];
                        } else if(epartsone[0] == "groups") {
                            groupsPartValue = epartsone[1];
                        }

                        var epartstwo = parttwo.split(":");
                        if(epartstwo[0] == "users") {
                            userPartValue = epartstwo[1];
                        } else if(epartstwo[0] == "groups") {
                            groupsPartValue = epartstwo[1];
                        }
                    } else {
                        var eparts = usergroupsstr.split(":");
                        if(eparts[0] == "users") {
                            userPartValue = eparts[1];
                        } else if(eparts[0] == "groups") {
                            groupsPartValue = eparts[1];
                        }
                    }

                    reassignments.add(new ReassignmentDef({
                        users: userPartValue,
                        groups: groupsPartValue,
                        expires: expiresstr,
                        type: typestr
                    }));
                }
            }
        }

        var typeData = new Array();
        var notStartedType = new Array();
        notStartedType.push("not-started");
        notStartedType.push("not-started");
        typeData.push(notStartedType);
        var notCompletedTYpe = new Array();
        notCompletedTYpe.push("not-completed");
        notCompletedTYpe.push("not-completed");
        typeData.push(notCompletedTYpe);

        var gridId = Ext.id();
        var itemDeleter = new Extensive.grid.ItemDeleter();
        var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: reassignments,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(), {
                id: 'users',
                header: 'Users',
                width: 150,
                dataIndex: 'users',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'groups',
                header: 'Groups',
                width: 150,
                dataIndex: 'groups',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_\,]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'expires',
                header: 'Expires At',
                width: 150,
                dataIndex: 'expires',
                editor: new Ext.form.TextField({ allowBlank: true, regex: /^[a-z0-9 \-\.\_]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            },
            {
                id: 'type',
                header: 'Type',
                width: 150,
                dataIndex: 'type',
                editor: new Ext.form.ComboBox({
                    id: 'typeCombo',
                    valueField:'name',
                    displayField:'value',
                    labelStyle:'display:none',
                    submitValue : true,
                    typeAhead: false,
                    queryMode: 'local',
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus:true,
                    hideTrigger: false,
                    forceSelection: false,
                    selectOnFocus:true,
                    autoSelect:false,
                    store: new Ext.data.SimpleStore({
                        fields: [
                            'name',
                            'value'
                        ],
                        data: typeData
                    })
                })
            }, itemDeleter]),
            selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: 'Add Reassignment',
                handler : function(){
                    reassignments.add(new ReassignmentDef({
                        users: '',
                        groups: '',
                        expires: '',
                        type: 'not-started'
                    }));
                    grid.fireEvent('cellclick', grid, reassignments.getCount()-1, 1, null);
                }
            }],
            clicksToEdit: 1
        });

        var dialog = new Ext.Window({
            layout		: 'anchor',
            autoCreate	: true,
            title		: 'Editor for Reassignments',
            height		: 350,
            width		: 700,
            modal		: true,
            collapsible	: false,
            fixedcenter	: true,
            shadow		: true,
            resizable   : true,
            proxyDrag	: true,
            autoScroll  : true,
            keys:[{
                key	: 27,
                fn	: function(){
                    dialog.hide()
                }.bind(this)
            }],
            items		:[grid],
            listeners	:{
                hide: function(){
                    this.fireEvent('dialogClosed', this.value);
                    //this.focus.defer(10, this);
                    dialog.destroy();
                }.bind(this)
            },
            buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){
                    var outValue = "";
                    grid.stopEditing();
                    grid.getView().refresh();
                    reassignments.data.each(function() {
                        if( (this.data['users'].length > 0 || this.data['groups'].length > 0) && this.data['expires'].length > 0 && this.data['type'].length > 0) {
                            // [users:john|groups:sales]@[4h]@not-completed^[users:john|groups:sales]@[4h]@[5h]@not-started
                            // users:john|groups:sales@4h@not-completed
                            // [users:pesa|groups:]@[4d]@not-started^[users:|groups:pederi]@[44y]@not-completed^[users:tosa|groups:macke]@[1s]@not-started^[users:something|groups:somethingelse]@[22d]@not-completed
                            outValue += "[users:" + this.data['users'] + "|groups:" + this.data['groups'] + "]";
                            outValue += "@[" + this.data['expires'] + "]";
                            outValue += "@" + this.data['type'];
                            outValue += "^";
                        }
                    });
                    if(outValue.length > 0) {
                        outValue = outValue.slice(0, -1)
                    }
                    this.setValue(outValue);
                    this.dataSource.getAt(this.row).set('value', outValue)
                    this.dataSource.commitChanges()

                    dialog.hide();
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
                    this.setValue(this.value);
                    dialog.hide()
                }.bind(this)
            }]
        });

        dialog.show();
        grid.render();

        this.grid.stopEditing();
        grid.focus( false, 100 );
    }
});

Ext.form.ComplexImportsField = Ext.extend(Ext.form.TriggerField,  {
	/**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function() {
    	if(this.disabled){
            return;
        }
    	var ImportDef = Ext.data.Record.create([
            {
                name: 'type'
            },
            {
                name: 'classname'
            },
            {
                name: 'wsdllocation'
            },
            {
                name: 'wsdlnamespace'
            }
        ]);
    	
    	var importsProxy = new Ext.data.MemoryProxy({
            root: []
        });
    	
    	var imports = new Ext.data.Store({
    		autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, ImportDef),
            proxy: importsProxy,
            sorters: [{
                property: 'type',
                direction:'ASC'
            }]
        });
    	imports.load();

        // sample 'com.sample.Myclass|default,location|namespace|wsdl
    	if(this.value.length > 0) {
    		var valueParts = this.value.split(",");
            for(var i=0; i < valueParts.length; i++) {
                var type = "";
                var classname, location, namespace;
    			var nextPart = valueParts[i];

                var innerParts = nextPart.split("|");
                if(innerParts[1] == "default") {
                    type = "default";
                    classname = innerParts[0];
                    location = "";
                    namespace = "";
                } else {
                    type = "wsdl";
                    classname = "";
                    location = innerParts[0];
                    namespace = innerParts[1];
                }
    			imports.add(new ImportDef({
                    'type': type,
                    'classname': classname,
                    'wsdllocation': location,
                    'wsdlnamespace': namespace
                }));
    		}
    	}
    	
    	var itemDeleter = new Extensive.grid.ItemDeleter();
        var impordata = new Array();
        var defaultType = new Array();
        defaultType.push("default");
        defaultType.push("default");
        impordata.push(defaultType);

        var wsdlType = new Array();
        wsdlType.push("wsdl");
        wsdlType.push("wsdl");
        impordata.push(wsdlType);

    	var gridId = Ext.id();
    	var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: imports,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),
                {
                    id: 'imptype',
                    header: 'Import Type',
                    width: 100,
                    dataIndex: 'type',
                    editor: new Ext.form.ComboBox({
                        id: 'importTypeCombo',
                        valueField:'name',
                        displayField:'value',
                        labelStyle:'display:none',
                        submitValue : true,
                        typeAhead: false,
                        queryMode: 'local',
                        mode: 'local',
                        triggerAction: 'all',
                        selectOnFocus:true,
                        hideTrigger: false,
                        forceSelection: false,
                        selectOnFocus:true,
                        autoSelect:false,
                        store: new Ext.data.SimpleStore({
                            fields: [
                                'name',
                                'value'
                            ],
                            data: impordata
                        })
                    })
                },
                {
                    id: 'classname',
                    header: 'Class Name',
                    width: 200,
                    dataIndex: 'classname',
                    editor: new Ext.form.TextField({ allowBlank: true })
                },
                {
                    id: 'wsdllocation',
                    header: 'WSDL Location',
                    width: 200,
                    dataIndex: 'wsdllocation',
                    editor: new Ext.form.TextField({ allowBlank: true })
                },
                {
                    id: 'wsdlnamespace',
                    header: 'WSDL Namespace',
                    width: 200,
                    dataIndex: 'wsdlnamespace',
                    editor: new Ext.form.TextField({ allowBlank: true })
                },
                itemDeleter]),
    		selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: 'Add Import',
                handler : function(){
                	imports.add(new ImportDef({
                        'type': 'default',
                        'classname': '',
                        'wsdllocation' : '',
                        'wsdlnamespace' : ''
                    }));
                    grid.fireEvent('cellclick', grid, imports.getCount()-1, 1, null);
                }
            }],
            clicksToEdit: 1
        });
    	
    	var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: 'Editor for Imports', 
			height		: 400,
			width		: 800,
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			resizable   : true,
			proxyDrag	: true,
			autoScroll  : true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
                	var outValue = "";
                	grid.getView().refresh();
                	grid.stopEditing();
                	imports.data.each(function() {
                        // sample 'com.sample.Myclass|default,location|namespace|wsdl
                        if(this.data['type'] == "default") {
                            outValue += this.data['classname'] + "|" + this.data['type'] + ",";
                        }
                        if(this.data['type'] == "wsdl") {
                            outValue += this.data['wsdllocation'] + "|" + this.data['wsdlnamespace'] + "|" + this.data['type'] + ",";
                        }
                    });
                	if(outValue.length > 0) {
                		outValue = outValue.slice(0, -1)
                	}
					this.setValue(outValue);
					this.dataSource.getAt(this.row).set('value', outValue)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
    	
    }
});

Ext.form.ComplexActionsField = Ext.extend(Ext.form.TriggerField,  {
	/**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function() {
    	if(this.disabled){
            return;
        }
    	
    	var ActionDef = Ext.data.Record.create([{
            name: 'action'
        }]);
    	
    	var actionsProxy = new Ext.data.MemoryProxy({
            root: []
        });
    	
    	var actions = new Ext.data.Store({
    		autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, ActionDef),
            proxy: actionsProxy,
            sorters: [{
                property: 'action',
                direction:'ASC'
            }]
        });
    	actions.load();
    	
    	if(this.value.length > 0) {
    		var valueParts = this.value.split("|");
    		for(var i=0; i < valueParts.length; i++) {
    			var nextPart = valueParts[i];
    			actions.add(new ActionDef({
                    action: nextPart
                }));
    		}
    	}
    	
    	var itemDeleter = new Extensive.grid.ItemDeleter();
    	
    	var gridId = Ext.id();
    	var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: actions,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(), {
            	id: 'action',
                header: 'Action',
                width: 360,
                dataIndex: 'action',
                editor: new Ext.form.TextField({ allowBlank: true })
            },itemDeleter]),
    		selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: 'Add Action',
                handler : function(){
                	actions.add(new ActionDef({
                        action: ''
                    }));
                    grid.fireEvent('cellclick', grid, actions.getCount()-1, 1, null);
                }
            }],
            clicksToEdit: 1
        });
    	
    	var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: 'Editor for Actions', 
			height		: 300, 
			width		: 450, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			resizable   : true,
			proxyDrag	: true,
			autoScroll  : true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
                	var outValue = "";
                	grid.getView().refresh();
                	grid.stopEditing();
                	actions.data.each(function() {
                		if(this.data['action'].length > 0) {
                			outValue += this.data['action'] + "|";
                		}
                    });
                	if(outValue.length > 0) {
                		outValue = outValue.slice(0, -1)
                	}
					this.setValue(outValue);
					this.dataSource.getAt(this.row).set('value', outValue)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
    	
    }
});

Ext.form.ComplexDataAssignmenField = Ext.extend(Ext.form.TriggerField,  {
    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){
		
        if(this.disabled){
            return undefined;
        }
        
        var processJSON = ORYX.EDITOR.getSerializedJSON();
        var processVars = jsonPath(processJSON.evalJSON(), "$.properties.vardefs");
        var varData = new Array();
        var varDataTitle = new Array();
        var dataTypeMap = new Hash();

        varDataTitle.push("");
        varDataTitle.push("** Variable Definitions **");
        varData.push(varDataTitle);
        if(processVars) {
        	processVars.forEach(function(item){
            	if(item.length > 0) {
	        		var valueParts = item.split(",");
	        		for(var i=0; i < valueParts.length; i++) {
	        			var innerVal = new Array();
	        			var nextPart = valueParts[i];
	        			if(nextPart.indexOf(":") > 0) {
	        				var innerParts = nextPart.split(":");
	        				innerVal.push(innerParts[0]);
	        				innerVal.push(innerParts[0]);
                                                dataTypeMap[innerParts[0]] = innerParts[1];
	        			} else {
	        				innerVal.push(nextPart);
	        				innerVal.push(nextPart);
                                                dataTypeMap[nextPart] = "java.lang.String";
	        			}
	        			varData.push(innerVal);
	        		}
        	    }
        	});
        }

        var dataInputsTitle = new Array();
        dataInputsTitle.push("");
        dataInputsTitle.push("** Data Inputs **");
        varData.push(dataInputsTitle);
        Ext.each(this.dataSource.data.items, function(item){
        	if((item.data.gridProperties.propId == "oryx-datainputset") || (item.data.gridProperties.propId == "oryx-datainput")) {
        		var valueParts = item.data['value'].split(",");
        		for(var di=0; di < valueParts.length; di++) {
        			var nextPart = valueParts[di];
                                var innerVal = new Array();
                                if(nextPart.indexOf(":") > 0) {
                                        var innerParts = nextPart.split(":");
                                        innerVal.push(innerParts[0]);
                                        innerVal.push(innerParts[0]);
                                        dataTypeMap[innerParts[0]] = innerParts[1];
                                } else {
                                        innerVal.push(nextPart);
                                        innerVal.push(nextPart);
                                        dataTypeMap[nextPart] = "java.lang.String";
                                }
    				varData.push(innerVal);
        		}
        	} 
        });
        
        var dataOutputsTitle = new Array();
        dataOutputsTitle.push("");
        dataOutputsTitle.push("** Data Outputs **");
        varData.push(dataOutputsTitle);
        Ext.each(this.dataSource.data.items, function(item){
        	if((item.data.gridProperties.propId == "oryx-dataoutputset") || (item.data.gridProperties.propId == "oryx-dataoutput")) {
        		var valueParts = item.data['value'].split(",");
        		for(var dou=0; dou < valueParts.length; dou++) {
        			var nextPart = valueParts[dou];
                                var innerVal = new Array();
                                if(nextPart.indexOf(":") > 0) {
                                        var innerParts = nextPart.split(":");
                                        innerVal.push(innerParts[0]);
                                        innerVal.push(innerParts[0]);
                                        dataTypeMap[innerParts[0]] = innerParts[1];
                                } else {
                                        innerVal.push(nextPart);
                                        innerVal.push(nextPart);
                                        dataTypeMap[nextPart] = "java.lang.String";
                                }
    				varData.push(innerVal);
        		}
        	} 
        });
        
    	var DataAssignment = Ext.data.Record.create([{
            name: 'from'
        }, {
            name: 'type'
        }, {
        	name: 'to'
        }, {
        	name: 'tostr'
        }, {
                name: 'dataType'
        }
        ]);
    	
    	var dataassignmentProxy = new Ext.data.MemoryProxy({
            root: []
        });
    	
    	var dataassignments = new Ext.data.Store({
    		autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, DataAssignment),
            proxy: dataassignmentProxy,
            sorters: [{
                property: 'from',
                direction:'ASC'
            }, {
            	property: 'to',
            	direction: 'ASC'
            }, {
            	property: 'tostr',
            	direction: 'ASC'
            }
            ]
        });
    	dataassignments.load();
    	
    	if(this.value.length > 0) {
    		var valueParts = this.value.split(",");
    		for(var i=0; i < valueParts.length; i++) {
    			var nextPart = valueParts[i];
    			if(nextPart.indexOf("=") > 0) {
                            var innerParts = nextPart.split("=");
                            var dataType = dataTypeMap[innerParts[0]];
                            if (!dataType){
                                dataType = "java.lang.String";
                            }
            				var escapedp = innerParts[1].replace(/\#\#/g , ",");
                            dataassignments.add(new DataAssignment({
                                from: innerParts[0],
                                type: "is equal to",
                                to: "",
                                tostr: escapedp,
                                dataType: dataType
                            }));
    			} else if(nextPart.indexOf("->") > 0) {
                            var innerParts = nextPart.split("->");
                            var dataType = dataTypeMap[innerParts[0]];
                            if (!dataType){
                                dataType = "java.lang.String";
                            }
                            dataassignments.add(new DataAssignment({
                                from: innerParts[0],
                                type: "is mapped to",
                                to: innerParts[1],
                                tostr: "",
                                dataType: dataType
                            }));
    			} else {
    				// default to equality
    				var dataType = dataTypeMap[nextPart];
                    if (!dataType){
                        dataType = "java.lang.String";
                    }
                    dataassignments.add(new DataAssignment({
                        from: nextPart,
                        type: "is equal to",
                        to: "",
                        tostr: "",
                        dataType: dataType
                    }));
    			}
    		}
    	}
        
        //keep sync between from and dataType
        dataassignments.on('update', function(store, record, operation){
            if (operation == "edit"){
                var newType = dataTypeMap[record.get("from")];
                if (!newType){
                    newType = "java.lang.String";
                }
                record.set("dataType", newType);
            }
        });
    	
    	var itemDeleter = new Extensive.grid.ItemDeleter();
    	var gridId = Ext.id();
    	var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: dataassignments,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(), {
                    id: 'valueType',
                    header: 'Data Type',
	            width: 180,
                    dataIndex: 'dataType',
                    hidden: 'true'
                },{
            	id: 'from',
	            header: 'From Object',
	            width: 180,
	            dataIndex: 'from',
	            editor: new Ext.form.ComboBox({
	            	id: 'fromCombo',
	            	valueField:'name',
	            	displayField:'value',
	            	typeAhead: true,
                        mode: 'local',
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: new Ext.data.SimpleStore({
                            fields: [
                                        'name',
                                        'value'
                                    ],
                            data: varData
                        })
	            })
            }, {
            	id: 'type',
                header: 'Assignment Type',
                width: 100,
                dataIndex: 'type',
                editor: new Ext.form.ComboBox({
                	id: 'typeCombo',
                	valueField:'name',
                	displayField:'value',
                	typeAhead: true,
					mode: 'local',
					triggerAction: 'all',
					selectOnFocus:true,
					store: new Ext.data.SimpleStore({
				        fields: [
				                  'name',
				                  'value'
				                ],
				        data: [
	                	        ['is mapped to','is mapped to'],
	                	        ['is equal to','is equal to']
	                	       ]
				    })
                })
            }, {
            	id: 'to',
                header: 'To Object',
                width: 180,
                dataIndex: 'to',
                editor: new Ext.form.ComboBox({
                	id: 'toCombo',
                	valueField:'name',
                	displayField:'value',
                	typeAhead: true,
					mode: 'local',
					triggerAction: 'all',
					selectOnFocus:true,
					store: new Ext.data.SimpleStore({
				        fields: [
				                  'name',
				                  'value'
				                ],
				        data: varData
				    })
                })
            }, {
            	id: 'tostr',
                header: 'To Value',
                width: 180,
                dataIndex: 'tostr',
                editor: new Ext.form.TextField({ allowBlank: true }),
                renderer: Ext.util.Format.htmlEncode
    		}, itemDeleter]),
    		selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: 'Add Assignment',
                handler : function(){
                	dataassignments.add(new DataAssignment({
                        from: '',
                        type: '',
                        to: '',
                        tostr: ''
                    }));
                    grid.fireEvent('cellclick', grid, dataassignments.getCount()-1, 1, null);
                }
            }],
            clicksToEdit: 1
        });
    	
		var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: 'Editor for Data Assignments', 
			height		: 350, 
			width		: 730, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			resizable   : true,
			proxyDrag	: true,
			autoScroll  : true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){	 
                	var outValue = "";
                	grid.getView().refresh();
                	grid.stopEditing();
                	dataassignments.data.each(function() {
                		if(this.data['from'].length > 0 && this.data["type"].length > 0) {
                			if(this.data["type"] == "is mapped to") {
                				outValue += this.data['from'] + "->" + this.data['to'] + ",";
                			} else if(this.data["type"] == "is equal to") {
                				var escapedc = this.data['tostr'].replace(/,/g , "##");
                				outValue += this.data['from'] + "=" + escapedc + ",";
                			}
                		}
                    });
                	if(outValue.length > 0) {
                		outValue = outValue.slice(0, -1);
                	}
					this.setValue(outValue);
					this.dataSource.getAt(this.row).set('value', outValue);
					this.dataSource.commitChanges();
					dialog.hide();
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide();
                }.bind(this)
            }]
		});		
				
		dialog.show();		
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
	
                return grid;
	}
});


Ext.form.NameTypeEditor = Ext.extend(Ext.form.TriggerField,  {

    windowTitle : "",
    addButtonLabel : "",
    single : false,
    
    /**
     * If the trigger was clicked a dialog has to be opened
     * to enter the values for the complex property.
     */
    onTriggerClick : function(){

        if(this.disabled){
            return;
        }

    	var VarDef = Ext.data.Record.create([{
            name: 'name'
        }, {
            name: 'stype'
        }, {
            name: 'ctype'
        }]);

    	var vardefsProxy = new Ext.data.MemoryProxy({
            root: []
        });

    	var vardefs = new Ext.data.Store({
    		autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, VarDef),
            proxy: vardefsProxy,
            sorters: [{
                property: 'name',
                direction:'ASC'
            }]
        });
    	vardefs.load();

    	if(this.value.length > 0) {
    		var valueParts = this.value.split(",");
    		for(var i=0; i < valueParts.length; i++) {
    			var nextPart = valueParts[i];
    			if(nextPart.indexOf(":") > 0) {
    				var innerParts = nextPart.split(":");
    				if(innerParts[1] == "String" || innerParts[1] == "Integer" || innerParts[1] == "Boolean" || innerParts[1] == "Float") {
    					vardefs.add(new VarDef({
                            name: innerParts[0],
                            stype: innerParts[1],
                            ctype: ''
                        }));
    				} else {
    					if(innerParts[1] != "Object") {
    						vardefs.add(new VarDef({
                                name: innerParts[0],
                                stype: 'Object',
                                ctype: innerParts[1]
                            }));
    					} else {
    						vardefs.add(new VarDef({
                                name: innerParts[0],
                                stype: innerParts[1],
                                ctype: ''
                            }));
    					}
    				}
    			} else {
    				vardefs.add(new VarDef({
                        name: nextPart,
                        stype: '',
                        ctype: ''
                    }));
    			}
    		}

    	}

    	var itemDeleter = new Extensive.grid.ItemDeleter();

    	var typeData = new Array();
    	var stringType = new Array();
    	stringType.push("String");
    	stringType.push("String");
    	typeData.push(stringType);
    	var integerType = new Array();
    	integerType.push("Integer");
    	integerType.push("Integer");
    	typeData.push(integerType);
    	var booleanType = new Array();
    	booleanType.push("Boolean");
    	booleanType.push("Boolean");
    	typeData.push(booleanType);
    	var floatType = new Array();
    	floatType.push("Float");
    	floatType.push("Float");
    	typeData.push(floatType);
    	var objectType = new Array();
    	objectType.push("Object");
    	objectType.push("Object");
    	typeData.push(objectType);

    	var gridId = Ext.id();
    	Ext.form.VTypes["inputNameVal"] = /^[a-z0-9 \-\.\_]*$/i;
        Ext.form.VTypes["inputNameText"] = 'Invalid name';
        Ext.form.VTypes["inputName"] = function(v){
        	return Ext.form.VTypes["inputNameVal"].test(v);
        };
    	var grid = new Ext.grid.EditorGridPanel({
            autoScroll: true,
            autoHeight: true,
            store: vardefs,
            id: gridId,
            stripeRows: true,
            cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(), {
            	id: 'name',
                header: 'Name',
                width: 100,
                dataIndex: 'name',
                editor: new Ext.form.TextField({ allowBlank: true, vtype: 'inputName', regex: /^[a-z0-9 \-\.\_]*$/i }),
                renderer: Ext.util.Format.htmlEncode
            }, {
            	id: 'stype',
                header: 'Standard Type',
                width: 100,
                dataIndex: 'stype',
                editor: new Ext.form.ComboBox({
                	id: 'typeCombo',
                	valueField:'name',
                	displayField:'value',
                	labelStyle:'display:none',
                	submitValue : true,
                	typeAhead: false,
                	queryMode: 'local',
                	mode: 'local',
					triggerAction: 'all',
					selectOnFocus:true,
					hideTrigger: false,
					forceSelection: false,
					selectOnFocus:true,
					autoSelect:false,
					store: new Ext.data.SimpleStore({
				        fields: [
				                  'name',
				                  'value'
				                ],
				        data: typeData
				    })
                })
            },{
            	id: 'ctype',
                header: 'Custom Type',
                width: 200,
                dataIndex: 'ctype',
                editor: new Ext.form.TextField({ allowBlank: true }),
                renderer: Ext.util.Format.htmlEncode
            }, itemDeleter]),
    		selModel: itemDeleter,
            autoHeight: true,
            tbar: [{
                text: this.addButtonLabel,
                handler : function(){
                	if(this.single && vardefs.getCount() > 0) {
                        this.facade.raiseEvent({
                            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                            ntype		: 'error',
                            msg         : 'Only single entry allowed.',
                            title       : ''

                        });
                	} else {
                		vardefs.add(new VarDef({
                            name: '',
                            stype: '',
                            ctype: ''
                        }));
                        grid.fireEvent('cellclick', grid, vardefs.getCount()-1, 1, null);
                	}
                }.bind(this)
            }],
            clicksToEdit: 1
        });

		var dialog = new Ext.Window({
			layout		: 'anchor',
			autoCreate	: true,
			title		: this.windowTitle,
			height		: 300,
			width		: 500,
			modal		: true,
			collapsible	: false,
			fixedcenter	: true,
			shadow		: true,
			resizable   : true,
			proxyDrag	: true,
			autoScroll  : true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[grid],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					//this.focus.defer(10, this);
					dialog.destroy();
				}.bind(this)
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){
                	var outValue = "";
                	grid.stopEditing();
                	grid.getView().refresh();
                	vardefs.data.each(function() {
                		if(this.data['name'].length > 0) {
                			if(this.data['stype'].length > 0) {
                				if(this.data['stype'] == "Object" && this.data['ctype'].length > 0) {
                					outValue += this.data['name'] + ":" + this.data['ctype'] + ",";
                				} else {
                					outValue += this.data['name'] + ":" + this.data['stype'] + ",";
                				}
                			} else if(this.data['ctype'].length > 0) {
                				outValue += this.data['name'] + ":" + this.data['ctype'] + ",";
                			} else {
                				outValue += this.data['name'] + ",";
                			}
                		}
                    });
                	if(outValue.length > 0) {
                		outValue = outValue.slice(0, -1)
                	}
					this.setValue(outValue);
					this.dataSource.getAt(this.row).set('value', outValue)
					this.dataSource.commitChanges()

					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});

		dialog.show();
		grid.render();

		this.grid.stopEditing();
		grid.focus( false, 100 );
		
	}
});

Ext.form.ComplexVardefField = Ext.extend(Ext.form.NameTypeEditor,  {
     windowTitle : 'Editor for Variable Definitions',
     addButtonLabel : 'Add Variable'
});

Ext.form.ComplexDataInputField = Ext.extend(Ext.form.NameTypeEditor,  {
     windowTitle : 'Editor for Data Input',
     addButtonLabel : 'Add Data Input'
});

Ext.form.ComplexDataOutputField = Ext.extend(Ext.form.NameTypeEditor,  {
     windowTitle : 'Editor for Data Output',
     addButtonLabel : 'Add Data Output'
});

Ext.form.ComplexDataInputFieldSingle = Ext.extend(Ext.form.NameTypeEditor,  {
    windowTitle : 'Editor for Data Input',
    addButtonLabel : 'Add Data Input',
    single : true
});

Ext.form.ComplexDataOutputFieldSingle = Ext.extend(Ext.form.NameTypeEditor,  {
    windowTitle : 'Editor for Data Output',
    addButtonLabel : 'Add Data Output',
    single : true
});

Ext.form.ComplexGlobalsField = Ext.extend(Ext.form.NameTypeEditor,  {
    windowTitle : 'Editor for Globals',
    addButtonLabel : 'Add Global'
});


Ext.form.ComplexExpressionField = Ext.extend(Ext.form.TriggerField,  {
	onTriggerClick : function(){
		if(this.disabled){
            return;
        }
		var ceta = new Ext.form.TextArea({
            id: Ext.id(),
            fieldLabel: "Expression Editor",
            value: this.value.replace(/\\n/g,"\n"),
            autoScroll: true
            });
		
		var sourceEditor;
		var hlLine;
		
		var dialog = new Ext.Window({ 
			layout		: 'anchor',
			autoCreate	: true, 
			title		: 'Expression Editor - Press [Ctrl-Z] to activate auto-completion', 
			height		: 430, 
			width		: 550, 
			modal		: true,
			collapsible	: false,
			fixedcenter	: true, 
			shadow		: true, 
			resizable   : true,
			proxyDrag	: true,
			autoScroll  : true,
			keys:[{
				key	: 27,
				fn	: function(){
						dialog.hide()
				}.bind(this)
			}],
			items		:[ceta],
			listeners	:{
				hide: function(){
					this.fireEvent('dialogClosed', this.value);
					dialog.destroy();
				}.bind(this)				
			},
			buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){
					this.setValue(sourceEditor.getValue().replace(/\r\n|\r|\n/g,"\\n"));
					this.dataSource.getAt(this.row).set('value', sourceEditor.getValue());
					this.dataSource.commitChanges();
					dialog.hide()
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
					this.setValue(this.value);
                	dialog.hide()
                }.bind(this)
            }]
		});	
		dialog.show();		
		this.foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
		sourceEditor = CodeMirror.fromTextArea(document.getElementById(ceta.getId()), {
			  mode: "text/x-java",
			  lineNumbers: true,
			  lineWrapping: true,
			  matchBrackets: true,
			  onGutterClick: this.foldFunc,
			  extraKeys: {"Ctrl-Z": function(cm) {CodeMirror.hint(cm, CodeMirror.jbpmHint, dialog);}},
			  onCursorActivity: function() {
				  sourceEditor.setLineClass(hlLine, null, null);
	 			     hlLine = sourceEditor.setLineClass(sourceEditor.getCursor().line, null, "activeline");
	 		  }.bind(this)
			});
		hlLine = sourceEditor.setLineClass(0, "activeline");
		this.grid.stopEditing();
	}
});
Ext.form.ComplexCalledElementField = Ext.extend(Ext.form.TriggerField,  {
	onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        
        var CallElementDef = Ext.data.Record.create([{
            name: 'name'
        }, {
        	name: 'pkgname'
        }, {
            name: 'imgsrc'
        }]);
    	
    	var calldefsProxy = new Ext.data.MemoryProxy({
            root: []
        });
    	
    	var calldefs = new Ext.data.Store({
    		autoDestroy: true,
            reader: new Ext.data.JsonReader({
                root: "root"
            }, CallElementDef),
            proxy: calldefsProxy,
            sorters: [{
                property: 'name',
                direction:'ASC'
            }]
        });
    	calldefs.load();
        
        var processJSON = ORYX.EDITOR.getSerializedJSON();
        var processPackage = jsonPath(processJSON.evalJSON(), "$.properties.package");
        var processId = jsonPath(processJSON.evalJSON(), "$.properties.id");

        this.facade.raiseEvent({
            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
            ntype		: 'info',
            msg         : 'Loading Process Information.',
            title       : ''

        });
        Ext.Ajax.request({
            url: ORYX.PATH + 'calledelement',
            method: 'POST',
            success: function(response) {
    	   		try {
    	   			if(response.responseText.length > 0 && response.responseText != "false") {
    	   				var responseJson = Ext.decode(response.responseText);
    		            for(var key in responseJson){
    		            	var keyParts = key.split("|");
    		            	calldefs.add(new CallElementDef({
                                name: keyParts[0],
                                pkgname: keyParts[1],
                                imgsrc: responseJson[key]
                            }));
    		            }
    		            calldefs.commitChanges();
    		            
    		            var gridId = Ext.id();
    		        	var grid = new Ext.grid.EditorGridPanel({
                            autoScroll: true,
                            autoHeight: true,
    		                store: calldefs,
    		                id: gridId,
    		                stripeRows: true,
    		                cm: new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(), {
    		                	id: 'pid',
    		                    header: 'Process Id',
    		                    width: 200,
    		                    dataIndex: 'name',
    		                    editor: new Ext.form.TextField({ allowBlank: true, disabled: true })
    		                }, {
    		                	id: 'pkgn',
    		                    header: 'Package Name',
    		                    width: 200,
    		                    dataIndex: 'pkgname',
    		                    editor: new Ext.form.TextField({ allowBlank: true, disabled: true })
    		                },{
    		                	id: 'pim',
    		                    header: 'Process Image',
    		                    width: 250,
    		                    dataIndex: 'imgsrc',
    		                    renderer: function(val) {
    		                    	if(val && val.length > 0) {
    		                    		return '<center><img src="'+ORYX.PATH+'images/page_white_picture.png" onclick="new ImageViewer({title: \'Process Image\', width: \'650\', height: \'450\', autoScroll: true, fixedcenter: true, src: \''+val+'\',hideAction: \'close\'}).show();" alt="Click to view Process Image"/></center>';
    		                    	} else {
    		                    		return "<center>Process image not available.</center>";
    		                    	}
    		                    }
    		                }]),
    		                autoHeight: true
    		            });
    		        	
    		        	grid.on('afterrender', function(e) {
    		        		if(this.value.length > 0) {
	    		        		var index = 0;
	    		        		var val = this.value;
	    		        		var mygrid = grid;
	    		        		calldefs.data.each(function() {
	    	                		if(this.data['name'] == val) {
	    	                			mygrid.getSelectionModel().select(index, 1);
	    	                		}
	    	                		index++;
	    	                    });
	    		        	}
    		        		}.bind(this));
    		        	
    		        	var calledElementsPanel = new Ext.Panel({
    		        		id: 'calledElementsPanel',
    		        		title: '<center>Select Process Id and click "Save" to select.</center>',
    		        		layout:'column',
    		        		items:[
    		        		       grid
    		                      ],
    		        		layoutConfig: {
    		        			columns: 1
    		        		},
    		        		defaults: {
    		        	        columnWidth: 1.0
    		        	    }
    		        	});
    		        	
    		        	var dialog = new Ext.Window({ 
    		    			layout		: 'anchor',
    		    			autoCreate	: true, 
    		    			title		: 'Editor for Called Elements', 
    		    			height		: 350, 
    		    			width		: 680, 
    		    			modal		: true,
    		    			collapsible	: false,
    		    			fixedcenter	: true, 
    		    			shadow		: true, 
    		    			resizable   : true,
    		    			proxyDrag	: true,
    		    			autoScroll  : true,
    		    			keys:[{
    		    				key	: 27,
    		    				fn	: function(){
    		    						dialog.hide()
    		    				}.bind(this)
    		    			}],
    		    			items		:[calledElementsPanel],
    		    			listeners	:{
    		    				hide: function(){
    		    					this.fireEvent('dialogClosed', this.value);
    		    					dialog.destroy();
    		    				}.bind(this)				
    		    			},
    		    			buttons		: [{
    		                    text: 'Save',
    		                    handler: function(){
    		                    	if(grid.getSelectionModel().getSelectedCell() != null) {
    		                    		var selectedIndex = grid.getSelectionModel().getSelectedCell()[0];
    		                    		var outValue = calldefs.getAt(selectedIndex).data['name'];
    		                    		grid.stopEditing();
    		                        	grid.getView().refresh();
    		        					this.setValue(outValue);
    		        					this.dataSource.getAt(this.row).set('value', outValue)
    		        					this.dataSource.commitChanges()
    		        					dialog.hide()
    		                    	} else {
                                        this.facade.raiseEvent({
                                            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                            ntype		: 'error',
                                            msg         : 'Please select a process id.',
                                            title       : ''

                                        });
    		                    	}
    		                    }.bind(this)
    		                }, {
    		                    text: ORYX.I18N.PropertyWindow.cancel,
    		                    handler: function(){
    		    					this.setValue(this.value);
    		                    	dialog.hide()
    		                    }.bind(this)
    		                }]
    		    		});		
    		    				
    		    		dialog.show();		
    		    		grid.render();
    		    		grid.fireEvent('afterrender');
    		    		this.grid.stopEditing();
    		    		grid.focus( false, 100 );
    		        } else {
                           this.facade.raiseEvent({
                               type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                               ntype		: 'error',
                               msg         : 'Unable to find other processes in pacakge.',
                               title       : ''

                           });
    		        }
    	   		} catch(e) {
                       this.facade.raiseEvent({
                           type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                           ntype		: 'error',
                           msg         : 'Error resolving other process info :\n' + e,
                           title       : ''

                       });
    	   		}
            }.bind(this),
            failure: function(){
                this.facade.raiseEvent({
                    type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                    ntype		: 'error',
                    msg         : 'Error resolving other process info.',
                    title       : ''

                });
            },
            params: {
            	profile: ORYX.PROFILE,
            	uuid : ORYX.UUID,
            	ppackage: processPackage,
            	pid: processId
            }
        });
	}
});
Ext.form.ComplexVisualDataAssignmentField = Ext.extend(Ext.form.TriggerField,  {
    onTriggerClick : function() {
        if(this.disabled){
            return;
        }

        Ext.each(this.dataSource.data.items, function(item){
            if((item.data.gridProperties.propId == "oryx-assignments")) {
                //alert("value: " + item.data['value']);
            }
        });

        var processJSON = ORYX.EDITOR.getSerializedJSON();
        var processVars = jsonPath(processJSON.evalJSON(), "$.properties.vardefs");
        if(!processVars) {
                //forEach(processVars.toString().split(","), maybeAdd);
            processVars = "";
        }
        var processGlobals = jsonPath(processJSON.evalJSON(), "$.properties.globals");
        if(!processGlobals) {
                //forEach(processGlobals.toString().split(","), maybeAdd);
            processGlobals = "";
        }
        var processdataobjectstr = "";
        var childShapes = jsonPath(processJSON.evalJSON(), "$.childShapes.*");
        for(var i = 0; i < childShapes.length;i++) {
            if(childShapes[i].stencil.id == 'DataObject') {
                processdataobjectstr += childShapes[i].properties.name;
                processdataobjectstr += ",";
            }
        }
        if (processdataobjectstr.endsWith(",")) {
            processdataobjectstr = processdataobjectstr.substr(0, processdataobjectstr.length - 1);
        }
        // forEach(processdataobjectstr.toString().split(","), maybeAdd);

        var dialog = new Ext.Window({
            layout		: 'anchor',
            autoCreate	: true,
            title		: 'Visual data associations Editor',
            height		: 550,
            width		: 850,
            modal		: true,
            collapsible	: false,
            fixedcenter	: true,
            shadow		: true,
            resizable   : true,
            proxyDrag	: true,
            autoScroll  : true,
            keys:[{
                key	: 27,
                fn	: function(){
                    dialog.hide()
                }.bind(this)
            }],
            items : [{
                xtype : "component",
                id    : 'visualdataassignmentswindow',
                autoEl : {
                    tag : "iframe",
                    src : ORYX.BASE_FILE_PATH + 'customeditors/visualassignmentseditor.jsp?vars='+processVars+'&globals='+processGlobals+'&dobj='+processdataobjectstr,
                    width: "100%",
                    height: "100%"
                }
            }],
            listeners : {
                hide: function(){
                    this.fireEvent('dialogClosed', this.value);
                    dialog.destroy();
                }.bind(this)
            },
            buttons		: [{
                text: ORYX.I18N.PropertyWindow.ok,
                handler: function(){
                    var outValue = document.getElementById('visualdataassignmentswindow').contentWindow.getEditorValue();
                    this.setValue(outValue);
                    this.dataSource.getAt(this.row).set('value', outValue)
                    this.dataSource.commitChanges()
                    dialog.hide();
                }.bind(this)
            }, {
                text: ORYX.I18N.PropertyWindow.cancel,
                handler: function(){
                    this.setValue(this.value);
                    dialog.hide()
                }.bind(this)
            }]
        });
        dialog.show();
        this.grid.stopEditing();

    }
});
/**
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 * 
 * 
 */
ORYX.Plugins.ERDFSupport = Clazz.extend({

	facade: undefined,
	
	ERDFServletURL: '/erdfsupport',

	/**
	 * Offers the plugin functionality:
	 * 
	 */
	construct: function(facade) {
		
		this.facade = facade;
			
			
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.exp,
			'functionality': 	this.exportERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': 			ORYX.PATH + "images/erdf_export_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.expDesc,
			'index': 			0,
			'minShape': 		0,
			'maxShape': 		0
		});
					
		this.facade.offer({
			'name':				ORYX.I18N.ERDFSupport.imp,
			'functionality': 	this.importERDF.bind(this),
			'group': 			'Export',
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': 			ORYX.PATH + "images/erdf_import_icon.png",
			'description': 		ORYX.I18N.ERDFSupport.impDesc,
			'index': 			1,
			'minShape': 		0,
			'maxShape': 		0
		});

	},

	
	/**
	 * Imports an AML description
	 * 
	 */
	importERDF: function(){
		this._showImportDialog();
	},		

	
	/**
	 * Imports an AML description
	 * 
	 */
	exportERDF: function(){
        // Show deprecation message
        Ext.Msg.show({
           title:ORYX.I18N.ERDFSupport.deprTitle,
           msg: ORYX.I18N.ERDFSupport.deprText,
           buttons: Ext.Msg.YESNO,
           fn: function(buttonId){
               if(buttonId === 'yes'){
                    var s   = this.facade.getERDF();
                    
                    //this.openXMLWindow( s );
                    this.openDownloadWindow(window.document.title + ".xml", s);
               }
           }.bind(this),
           icon: Ext.MessageBox.WARNING 
        });
	},
	
	/**
	 * 
	 * 
	 * @param {Object} url
	 * @param {Object} params
	 * @param {Object} successcallback
	 */
	sendRequest: function( url, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
            method			: 'POST',
            asynchronous	: false,
            parameters		: params,
			onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.result )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback();
					
				} else {
					Ext.Msg.alert(ORYX.I18N.Oryx.title, ORYX.I18N.ERDFSupport.impFailed);
					ORYX.log.warn("Import ERDF failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		
		return suc;
							
	},


	loadERDF: function( erdfString, success, failed ){
		
		var s 	= erdfString;
		s 		= s.startsWith('<?xml') ? s : '<?xml version="1.0" encoding="utf-8"?>'+s+'';	
						
		var parser	= new DOMParser();			
		var doc 	=  parser.parseFromString( s ,"text/xml");
							
		if( doc.firstChild.tagName == "parsererror" ){

			Ext.MessageBox.show({
					title: 		ORYX.I18N.ERDFSupport.error,
 					msg: 		ORYX.I18N.ERDFSupport.impFailed2 + doc.firstChild.textContent.escapeHTML(),
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.ERROR
				});
																
			if(failed)
				failed();
				
		} else if( !this.hasStencilSet(doc) ){
			
			if(failed)
				failed();		
		
		} else {
			
			this.facade.importERDF( doc );
			
			if(success)
				success();
		
		}
	},

	hasStencilSet: function( doc ){
		
		var getElementsByClassNameFromDiv 	= function(doc, id){ return $A(doc.getElementsByTagName('div')).findAll(function(el){ return $A(el.attributes).any(function(attr){ return attr.nodeName == 'class' && attr.nodeValue == id }) })	}

		// Get Canvas Node
		var editorNode 		= getElementsByClassNameFromDiv( doc, '-oryx-canvas')[0];
		
		if( !editorNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noCanvas);
			return false
		}
		
		var stencilSetNode 	= $A(editorNode.getElementsByTagName('a')).find(function(node){ return node.getAttribute('rel') == 'oryx-stencilset'});

		if( !stencilSetNode ){
			this.throwWarning(ORYX.I18N.ERDFSupport.noSS);
			return false
		}
		
		var stencilSetUrl	= stencilSetNode.getAttribute('href').split("/")
		stencilSetUrl		= stencilSetUrl[stencilSetUrl.length-2] + "/" + stencilSetUrl[stencilSetUrl.length-1];
		
//		var isLoaded = this.facade.getStencilSets().values().any(function(ss){ return ss.source().endsWith( stencilSetUrl ) })
//		if( !isLoaded ){
//			this.throwWarning(ORYX.I18N.ERDFSupport.wrongSS);
//			return false
//		}
				
		return true;
	},
	
	throwWarning: function( text ){
		Ext.MessageBox.show({
					title: 		ORYX.I18N.Oryx.title,
 					msg: 		text,
					buttons: 	Ext.MessageBox.OK,
					icon: 		Ext.MessageBox.WARNING
				});
	},
	
	/**
	 * Opens a new window that shows the given XML content.
	 * 
	 * @param {Object} content The XML content to be shown.
	 */
	openXMLWindow: function(content) {
		var win = window.open(
		   'data:application/xml,' + encodeURIComponent(
		     content
		   ),
		   '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"
		);
	},
	
	/**
	 * Opens a download window for downloading the given content.
	 * 
	 */
	openDownloadWindow: function(file, content) {
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			submitForm.appendChild( this.createHiddenElement("download", content));
			submitForm.appendChild( this.createHiddenElement("file", file));
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= ORYX.PATH + "/download";
			submitForm.submit();
		}		
	},
	
	/**
	 * Creates a hidden form element to communicate parameter values.
	 * 
	 * @param {Object} name  The name of the hidden field
	 * @param {Object} value The value of the hidden field
	 */
	createHiddenElement: function(name, value) {
		var newElement = document.createElement("input");
		newElement.name=name;
		newElement.type="hidden";
		newElement.value = value;
		return newElement
	},

	/**
	 * Opens a upload dialog.
	 * 
	 */
	_showImportDialog: function( successCallback ){
	
	    var form = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [{
	            text : 		ORYX.I18N.ERDFSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            anchor:		'100%',
				xtype : 	'label' 
	        },{
	            fieldLabel: ORYX.I18N.ERDFSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
	            anchor: '100% -63'  
	        }]
	    });



		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.ERDFSupport.impERDF, 
			height: 	350, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form],
			buttons:[
				{
					text:ORYX.I18N.ERDFSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.ERDFSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							
							var erdfString =  form.items.items[2].getValue();
							this.loadERDF(erdfString, function(){loadMask.hide();dialog.hide()}.bind(this), function(){loadMask.hide();}.bind(this))
														
														
							
						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.ERDFSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});


		// Show the panel
		dialog.show();
		
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsText('UTF-8');
				form.items.items[2].setValue( text );
			}, true)

	}
	
});
/**
 * Copyright (c) 2009
 * Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

/**
 * Enables exporting and importing current model in JSON.
 */
ORYX.Plugins.JSONSupport = ORYX.Plugins.AbstractPlugin.extend({

    construct: function(){
        // Call super class constructor
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.offer({
            'name': ORYX.I18N.JSONSupport.exp.name,
            'functionality': this.exportJSON.bind(this),
            'group': ORYX.I18N.JSONSupport.exp.group,
            dropDownGroupIcon: ORYX.PATH + "images/export2.png",
			'icon': ORYX.PATH + "images/page_white_javascript.png",
            'description': ORYX.I18N.JSONSupport.exp.desc,
            'index': 0,
            'minShape': 0,
            'maxShape': 0
        });
        
        this.facade.offer({
            'name': ORYX.I18N.JSONSupport.imp.name,
            'functionality': this.showImportDialog.bind(this),
            'group': ORYX.I18N.JSONSupport.imp.group,
            dropDownGroupIcon: ORYX.PATH + "images/import.png",
			'icon': ORYX.PATH + "images/page_white_javascript.png",
            'description': ORYX.I18N.JSONSupport.imp.desc,
            'index': 1,
            'minShape': 0,
            'maxShape': 0
        });
    },
    
    exportJSON: function(){
        var json = this.facade.getSerializedJSON();
        this.openDownloadWindow(window.document.title + ".json", json);
    },
    
    /**
     * Opens a upload dialog.
     *
     */
    showImportDialog: function(successCallback){
    
        var form = new Ext.form.FormPanel({
            baseCls: 'x-plain',
            labelWidth: 50,
            defaultType: 'textfield',
            items: [{
                text: ORYX.I18N.JSONSupport.imp.selectFile,
                style: 'font-size:12px;margin-bottom:10px;display:block;',
                anchor: '100%',
                xtype: 'label'
            }, {
                fieldLabel: ORYX.I18N.JSONSupport.imp.file,
                name: 'subject',
                inputType: 'file',
                style: 'margin-bottom:10px;display:block;',
                itemCls: 'ext_specific_window_overflow'
            }, {
                xtype: 'textarea',
                hideLabel: true,
                name: 'msg',
                anchor: '100% -63'
            }]
        });
        
        // Create the panel
        var dialog = new Ext.Window({
            autoCreate: true,
            layout: 'fit',
            plain: true,
            bodyStyle: 'padding:5px;',
            title: ORYX.I18N.JSONSupport.imp.name,
            height: 350,
            width: 500,
            modal: true,
            fixedcenter: true,
            shadow: true,
            proxyDrag: true,
            resizable: true,
            items: [form],
            buttons: [{
                text: ORYX.I18N.JSONSupport.imp.btnImp,
                handler: function(){
                
                    var loadMask = new Ext.LoadMask(Ext.getBody(), {
                        msg: ORYX.I18N.JSONSupport.imp.progress
                    });
                    loadMask.show();
                    
                    window.setTimeout(function(){
                        var json = form.items.items[2].getValue();
                        try {
                            this.facade.importJSON(json, true);
                            dialog.close();
                        } 
                        catch (error) {
                            Ext.Msg.alert(ORYX.I18N.JSONSupport.imp.syntaxError, error.message);
                        }
                        finally {
                            loadMask.hide();
                        }
                    }.bind(this), 100);
                    
                }.bind(this)
            }, {
                text: ORYX.I18N.JSONSupport.imp.btnClose,
                handler: function(){
                    dialog.close();
                }.bind(this)
            }]
        });
        
        // Show the panel
        dialog.show();
        
        // Adds the change event handler to 
        form.items.items[1].getEl().dom.addEventListener('change', function(evt){
            var text = evt.target.files[0].getAsText('UTF-8');
            form.items.items[2].setValue(text);
        }, true)
        
    }
    
});
/**
 * Copyright (c) 2009, Matthias Kunze, Kai Schlichting
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = {};

if (!ORYX.Config)
	ORYX.Config = {};

ORYX.Config.Feedback = {
	VISIBLE_STATE: "visible",
	HIDDEN_STATE: "hidden",
	INFO: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, set eiusmod tempor incidunt et labore et dolore magna aliquam. Ut enim ad minim veniam, quis nostrud exerc. Irure dolor in reprehend incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse molestaie cillum. Tia non ob ea soluad incommod quae egen ium improb fugiend. Officia",
	CSS_FILE: ORYX.PATH + "/css/feedback.css"
}

ORYX.Plugins.Feedback = ORYX.Plugins.AbstractPlugin.extend({
	
    construct: function(facade, data){
		/*
		 * data.name == "ORYX.Plugins.Feedback"
		 * data.source == "feedback.js"
		 * data.properties ... properties defined in plugins.xml/profiles.xml [{key:value}, ...]
		 */
	
		this.facade = facade;
	
		// extract properties, we're interested in
		((data && data.properties) || []).each(function(property){
			if (property.cssfile) {ORYX.Config.Feedback.CSS_FILE = property.css_file}
		}.bind(this));
		
        // load additional css information
        var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", ORYX.Config.Feedback.CSS_FILE);
        document.getElementsByTagName("head")[0].appendChild(fileref);

        // declare HTML references
        this.elements = {
    		container: null,
    		tab: null,
    		dialog: null,
			form: null,
			info: null
    	}
        
        // create feedback tab
        this.createFeedbackTab();
        
    },
    
    /**
     * Creates the feedback tab, which is used to open the feedback dialog.
     */
    createFeedbackTab: function(){
    	this.elements.tab = document.createElement("div");
    	this.elements.tab.setAttribute("class", "tab");
		this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;")
    	
    	this.elements.container = document.createElement("div");
    	this.elements.container.setAttribute("id", "feedback");
    	
    	this.elements.container.appendChild(this.elements.tab);
    	document.body.appendChild(this.elements.container);
          	    	
    	// register events
    	Event.observe(this.elements.tab, "click", this.toggleDialog.bindAsEventListener(this));
    },
    
    /**
     * Hides or shows the feedback dialog
     */
    toggleDialog: function(event) {

		if (event) {
			Event.stop(event);			
		}

    	var dialog = this.elements.dialog || this.createDialog();
    	
    	if (ORYX.Config.Feedback.VISIBLE_STATE == dialog.state) {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#8226;");
    		Element.hide(dialog);
    		dialog.state = ORYX.Config.Feedback.HIDDEN_STATE;
    	} 
    	else {
			this.elements.tab.innerHTML = (ORYX.I18N.Feedback.name + " &#215;");
    		Element.show(dialog);
    		dialog.state = ORYX.Config.Feedback.VISIBLE_STATE;
    	}

    },
    
    /**
     * Creates the feedback dialog
     */
    createDialog: function() {
    	if (this.elements.dialog) {
    		return this.elements.dialog;
    	}

		// reset the input formular
		var resetForm = function() {
			[description, title, mail].each(function(element){
				element.value = element._defaultText || "";
				element.className = "low";
			});
		}

		// wrapper for field focus behavior
		var fieldOnFocus = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == e._defaultText.strip()) {
				e.value = "";
				e.className = "high";
			}
		}		
		var fieldOnBlur = function(event) {
			var e = Event.element(event);
			if (e._defaultText && e.value.strip() == "") {
				e.value = e._defaultText;
				e.className = "low";
			}
		}

    	// create form and submit logic (ajax)
		this.elements.form = document.createElement("form");
		this.elements.form.action = ORYX.CONFIG.ROOT_PATH + "feedback";
		this.elements.form.method = "POST";
		this.elements.form.onsubmit = function(){
			
			try {
				
				var failure = function() {
					Ext.Msg.alert(ORYX.I18N.Feedback.failure, ORYX.I18N.Feedback.failureMsg);
	                this.facade.raiseEvent({
	                    type: ORYX.CONFIG.EVENT_LOADING_DISABLE
	                });
					// show dialog again with old information
					this.toggleDialog();
				}
				
				var success = function(transport) {
					if (transport.status < 200 || transport.status >= 400) {
						return failure(transport);
					}
					this.facade.raiseEvent({
						type:ORYX.CONFIG.EVENT_LOADING_STATUS,
						text:ORYX.I18N.Feedback.success
					});
					resetForm();
				}
				
			
				this.elements.form.model.value = this.facade.getSerializedJSON();
				this.elements.form.environment.value = this.getEnv();
			
				var params = {};
				$A(this.elements.form.elements).each(function(element){
					params[element.name] = element.value;
				});
				params["name"]= ORYX.Editor.Cookie.getParams().identifier;
				params["subject"] = ("[" + params["subject"] + "] " + params["title"]);
				this.facade.raiseEvent({
					type:ORYX.CONFIG.EVENT_LOADING_STATUS,
					text:ORYX.I18N.Feedback.sending
				});
				new Ajax.Request(ORYX.CONFIG.ROOT_PATH + "feedback", {
					method: "POST",
					parameters: params,
					onSuccess: success.bind(this),
					onFailure: failure.bind(this)
				});
			
				// hide dialog immediately 
				this.toggleDialog();
			}
			catch(e) {
				failure();
				ORYX.Log.warn(e);
			}
			// stop form submission through browser
			return false; 
		}.bind(this);
		
		
		// create input fields
		var fieldset = document.createElement("div");
			fieldset.className = "fieldset";
		    
		var f_subject = document.createElement("input");
		    f_subject.type = "hidden";
			f_subject.name = "subject";
			f_subject.style.display = "none";
		
		var description = document.createElement("textarea");
			description._defaultText = ORYX.I18N.Feedback.descriptionDesc;
		    description.name = "description";
		Event.observe(description, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(description, "blur", fieldOnBlur.bindAsEventListener());
		
		var title = document.createElement("input");
			title._defaultText = ORYX.I18N.Feedback.titleDesc;
			title.type = "text";
			title.name = "title";
		Event.observe(title, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(title, "blur", fieldOnBlur.bindAsEventListener());
			
		var mail = document.createElement("input");
			mail._defaultText = ORYX.I18N.Feedback.emailDesc;
			mail.type = "text";
			mail.name = "email";
		Event.observe(mail, "focus", fieldOnFocus.bindAsEventListener());
		Event.observe(mail, "blur", fieldOnBlur.bindAsEventListener());
		
		var submit = document.createElement("input");
			submit.type = "button";
			submit.className = "submit";
			submit.onclick=this.elements.form.onsubmit;
			if (ORYX.I18N.Feedback.submit) {
				submit.value = ORYX.I18N.Feedback.submit;
			}
			
		var environment = document.createElement("input");
			environment.name = "environment";
			environment.type = "hidden";
			environment.style.display = "none";
			
		var model = document.createElement("input");
			model.name = "model"
			model.type = "hidden";
			model.style.display = "none";
			
		fieldset.appendChild(f_subject);
		fieldset.appendChild(description);
		fieldset.appendChild(title);
		fieldset.appendChild(mail);
		fieldset.appendChild(environment);
		fieldset.appendChild(model);
		fieldset.appendChild(submit);
		
		// (p)reset default values of input fields
		resetForm();
			
		// create subjects
		var list = document.createElement("ul");
	    list.setAttribute("class", "subjects");
		
		var l_subjects = [];
		
		$A(ORYX.I18N.Feedback.subjects).each( function(subject, index){
			try {
				
				// create list item
				var item = document.createElement("li");
					item._subject = subject.id;
				    item.className = subject.id;
					item.innerHTML = subject.name;
					item.style.width = parseInt(100/$A(ORYX.I18N.Feedback.subjects).length)+"%"; // set width corresponding to number of subjects
				
				// add subjects to list
				l_subjects.push(item);
				list.appendChild(item);

				var handler = function(){
					l_subjects.each(function(element) {
						if (element.className.match(subject.id)) { // if current element is selected
							element.className = element._subject + " active";
							f_subject.value = subject.name;
							
							// update description, depending on subject if input field is empty
							if (description.value == description._defaultText) {
								description.value = subject.description;
							}
							
							// set _defaultText to newly selected subject
							description._defaultText = subject.description;
							
							// set info pane if appropriate
							if (subject.info && (""+subject.info).strip().length > 0) {
								this.elements.info.innerHTML = subject.info;
							}
							else {
								this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
							}
						}
						else {
							element.className = element._subject;
						}
					}.bind(this));
				}.bind(this);
				
				// choose/unchoose topics
				Event.observe(item, "click", handler);
				
				// select last item
				if (index == (ORYX.I18N.Feedback.subjects.length - 1)) {
					description.value = "";
					description._defaultText = "";
					
					handler();
				}
				
			} // if something goes wrong, we wont give up, just ignore it
			catch (e) {
				ORYX.Log.warn("Incomplete I10N for ORYX.I18N.Feedback.subjects", subject, ORYX.I18N.Feedback.subjects)
			}
		}.bind(this));
	
		this.elements.form.appendChild(list);
		this.elements.form.appendChild(fieldset);
		
		this.elements.info = document.createElement("div");
		this.elements.info.setAttribute("class", "info");
		this.elements.info.innerHTML = ORYX.I18N.Feedback.info || "";
		
		var head = document.createElement("div");
			head.setAttribute("class", "head");

    	this.elements.dialog = document.createElement("div");
		this.elements.dialog.setAttribute("class", "dialog");
		this.elements.dialog.appendChild(head);
		this.elements.dialog.appendChild(this.elements.info);
		this.elements.dialog.appendChild(this.elements.form);

		
		this.elements.container.appendChild(this.elements.dialog);
		
    	return this.elements.dialog;
    },

    getEnv: function(){
        var env = "";
        
        env += "Browser: " + navigator.userAgent;
        
        env += "\n\nBrowser Plugins: ";
        if (navigator.plugins) {
            for (var i = 0; i < navigator.plugins.length; i++) {
                var plugin = navigator.plugins[i];
                env += plugin.name + ", ";
            }
        }
        
        if ((typeof(screen.width) != "undefined") && (screen.width && screen.height)) 
            env += "\n\nScreen Resolution: " + screen.width + 'x' + screen.height;
        
        return env;
    }
});

 * Copyright (c) 2010
 * Robert Böhme, Philipp Berger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.DockerCreation = Clazz.extend({
	
	construct: function( facade ){
		this.facade = facade;		
		this.active = false; //true-> a ghostdocker is shown; false->ghostdocker is hidden

		//visual representation of the Ghostdocker
		this.circle = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,
				['g', {"pointer-events":"none"},
					['circle', {cx: "8", cy: "8", r: "3", fill:"yellow"}]]); 	
		
		//Event registrations
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this));
		/*
		 * Double click is reserved for label access, so abort action
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)}.bind(this));
		/*
		 * click is reserved for selecting, so abort action when mouse goes up
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)}.bind(this));

	},
	
	/**
	 * MouseOut Handler
	 * 
	 *hide the Ghostpoint when Leaving the mouse from an edge
	 */
	handleMouseOut: function(event, uiObj) {
		
		if (this.active) {		
			this.hideOverlay();
			this.active = false;
		}	
	},
	
	/**
	 * MouseOver Handler
	 * 
	 *show the Ghostpoint if the edge is selected
	 */
	handleMouseOver: function(event, uiObj) {
		//show the Ghostdocker on the edge
		if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			this.showOverlay(uiObj, this.facade.eventCoordinates(event));
		}
		//ghostdocker is active
		this.active = true;
		
	},
	
	/**
	 * MouseDown Handler
	 * 
	 *create a Docker when clicking on a selected edge
	 */
	handleMouseDown: function(event, uiObj) {	
		if (event.which==1 && uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
			//Timer for Doubleclick to be able to create a label
			window.clearTimeout(this.timer);
			
			this.timer = window.setTimeout(function () {
				// Give the event to enable one click creation and drag
				this.addDockerCommand({
		            edge: uiObj,
					event: event,
		            position: this.facade.eventCoordinates(event)
		        });
	
			}.bind(this),200);
			this.hideOverlay();
	
		}
	},
	
	/**
	 * MouseMove Handler
	 * 
	 *refresh the ghostpoint when moving the mouse over an edge
	 */
	handleMouseMove: function(event, uiObj) {		
			if (uiObj instanceof ORYX.Core.Edge && this.isEdgeDocked(uiObj)){
				if (this.active) {	
					//refresh Ghostpoint
					this.hideOverlay();			
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));
				}else{
					this.showOverlay( uiObj, this.facade.eventCoordinates(event));	
				}		
			}	
	},
	
	/**
	 * returns true if the edge is docked to at least one node
	 */
	isEdgeDocked: function(edge){
		return !!(edge.incoming.length || edge.outgoing.length);
	},
	
	
	/**
	 * Command for creating a new Docker
	 * 
	 * @param {Object} options
	 */
	addDockerCommand: function(options){
	    if(!options.edge)
	        return;
	    
	    var commandClass = ORYX.Core.Command.extend({
	        construct: function(edge, docker, pos, facade, options){            
	            this.edge = edge;
	            this.docker = docker;
	            this.pos = pos;
	            this.facade = facade;
				this.options= options;
	        },
	        execute: function(){
	            this.docker = this.edge.addDocker(this.pos, this.docker);
				this.index = this.edge.dockers.indexOf(this.docker);                                    
	            this.facade.getCanvas().update();
	            this.facade.updateSelection();
	            this.options.docker=this.docker;
	
	        },
	        rollback: function(){
	          
	             if (this.docker instanceof ORYX.Core.Controls.Docker) {
	                    this.edge.removeDocker(this.docker);
	             }             
	            this.facade.getCanvas().update();
	            this.facade.updateSelection(); 
	        }
	    });
	    var command = new commandClass(options.edge, options.docker, options.position, this.facade, options);    
	    this.facade.executeCommands([command]);
	
	    
		this.facade.raiseEvent({
			uiEvent:	options.event,
			type:		ORYX.CONFIG.EVENT_DOCKERDRAG}, options.docker );
	    
	},
	
	/**
	 *show the ghostpoint overlay
	 *
	 *@param {Shape} edge
	 *@param {Point} point
	 */
	showOverlay: function(edge, point){
		var best = point;
		var pair = [0,1];
		var min_distance = Infinity;
	
		// calculate the optimal point ON THE EDGE to display the docker
		for (var i=0, l=edge.dockers.length; i < l-1; i++) {
			var intersection_point = ORYX.Core.Math.getPointOfIntersectionPointLine(
				edge.dockers[i].bounds.center(),
				edge.dockers[i+1].bounds.center(),
				point,
				true // consider only the current segment instead of the whole line ("Strecke, statt Gerade") for distance calculation
			);
			
			
			if(!intersection_point) {
				continue;
			}
	
			var current_distance = ORYX.Core.Math.getDistancePointToPoint(point, intersection_point);
			if (min_distance > current_distance) {
				min_distance = current_distance;
				best = intersection_point;
			}
		}
	
		this.facade.raiseEvent({
				type: 			ORYX.CONFIG.EVENT_OVERLAY_SHOW,
				id: 			"ghostpoint",
				shapes: 		[edge],
				node:			this.circle,
				ghostPoint:		best,
				dontCloneNode:	true
			});			
	},
	
	/**
	 *hide the ghostpoint overlay
	 */
	hideOverlay: function() {
		
		this.facade.raiseEvent({
			type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
			id: "ghostpoint"
		});	
	}

});
 * Copyright (c) 2008
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
 * HOW to USE the OVERLAY PLUGIN:
 * 	You can use it via the event mechanism from the editor
 * 	by using facade.raiseEvent( <option> )
 * 
 * 	As an example please have a look in the overlayexample.js
 * 
 * 	The option object should/have to have following attributes:
 * 
 * 	Key				Value-Type							Description
 * 	================================================================
 * 
 *	type 			ORYX.CONFIG.EVENT_OVERLAY_SHOW | ORYX.CONFIG.EVENT_OVERLAY_HIDE		This is the type of the event	
 *	id				<String>							You have to use an unified id for later on hiding this overlay
 *	shapes 			<ORYX.Core.Shape[]>					The Shapes where the attributes should be changed
 *	attributes 		<Object>							An object with svg-style attributes as key-value pair
 *	node			<SVGElement>						An SVG-Element could be specified for adding this to the Shape
 *	nodePosition	"N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"START"|"END"	The position for the SVG-Element relative to the 
 *														specified Shape. "START" and "END" are just using for a Edges, then
 *														the relation is the start or ending Docker of this edge.
 *	
 * 
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Overlay = Clazz.extend({

    facade: undefined,
	
	styleNode: undefined,
    
    construct: function(facade){
		
        this.facade = facade;

		this.changes = [];

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW, this.show.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE, this.hide.bind(this));	

		this.styleNode = document.createElement('style')
		this.styleNode.setAttributeNS(null, 'type', 'text/css')
		
		document.getElementsByTagName('head')[0].appendChild( this.styleNode )

    },
	
	/**
	 * Show the overlay for specific nodes
	 * @param {Object} options
	 * 
	 * 	String				options.id		- MUST - Define the id of the overlay (is needed for the hiding of this overlay)		
	 *	ORYX.Core.Shape[] 	options.shapes 	- MUST - Define the Shapes for the changes
	 * 	attr-name:value		options.changes	- Defines all the changes which should be shown
	 * 
	 * 
	 */
	show: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.shapes || !options.shapes instanceof Array ||
				!options.id	|| !options.id instanceof String || options.id.length == 0) { 
				
					return
					
		}
		
		//if( this.changes[options.id]){
		//	this.hide( options )
		//}
			

		// Checked if attributes are setted
		if( options.attributes ){
			
			// FOR EACH - Shape
			options.shapes.each(function(el){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.setAttributes( el.node , options.attributes )
				
			}.bind(this))

		}	
		
		var isSVG = true
		try {
			isSVG = options.node && options.node instanceof SVGElement;
		} catch(e){}
		
		// Checks if node is setted and if this is an SVGElement		
		if ( options.node && isSVG) {
			
			options["_temps"] = []
						
			// FOR EACH - Node
			options.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				var _temp = {}
				_temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode( true );
				
				// Add the svg node to the ORYX-Shape
				el.node.firstChild.appendChild( _temp.svg )		
				
				// If
				if (el instanceof ORYX.Core.Edge && !options.nodePosition) {
					options['nodePosition'] = "START"
				}
						
				// If the node position is setted, it has to be transformed
				if( options.nodePosition ){
					
					var b = el.bounds;
					var p = options.nodePosition.toUpperCase();
										
					// Check the values of START and END
					if( el instanceof ORYX.Core.Node && p == "START"){
						p = "NW";
					} else if(el instanceof ORYX.Core.Node && p == "END"){
						p = "SE";
					} else if(el instanceof ORYX.Core.Edge && p == "START"){
						b = el.getDockers().first().bounds
					} else if(el instanceof ORYX.Core.Edge && p == "END"){
						b = el.getDockers().last().bounds
					}

					// Create a callback for the changing the position 
					// depending on the position string
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						
						if( p == "NW" ){
							// Do Nothing
						} else if( p == "N" ) {
							x = b.width() / 2;
						} else if( p == "NE" ) {
							x = b.width();
						} else if( p == "E" ) {
							x = b.width(); y = b.height() / 2;
						} else if( p == "SE" ) {
							x = b.width(); y = b.height();
						} else if( p == "S" ) {
							x = b.width() / 2; y = b.height();
						} else if( p == "SW" ) {
							y = b.height();
						} else if( p == "W" ) {
							y = b.height() / 2;
						} else if( p == "START" || p == "END") {
							x = b.width() / 2; y = b.height() / 2;
						}						
						else {
							return
						}
						
						if( el instanceof ORYX.Core.Edge){
							x  += b.upperLeft().x ; y  += b.upperLeft().y ;
						}
						
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
					
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
					
				}
				
				// Show the ghostpoint
				if(options.ghostPoint){
					var point={x:0, y:0};
					point=options.ghostPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x -7;
						y = point.y -7;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				if(options.labelPoint){
					var point={x:0, y:0};
					point=options.labelPoint;
					_temp.callback = function(){
						
						var x = 0; var y = 0;
						x = point.x;
						y = point.y;
						_temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
						
					}.bind(this)
					
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
				
				options._temps.push( _temp )	
				
			}.bind(this))
			
			
			
		}		
	

		// Store the changes
		if( !this.changes[options.id] ){
			this.changes[options.id] = [];
		}
		
		this.changes[options.id].push( options );
				
	},
	
	/**
	 * Hide the overlay with the spefic id
	 * @param {Object} options
	 */
	hide: function( options ){
		
		// Checks if all arguments are available
		if( 	!options || 
				!options.id	|| !options.id instanceof String || options.id.length == 0 ||
				!this.changes[options.id]) { 
				
					return
					
		}		
		
		
		// Delete all added attributes
		// FOR EACH - Shape
		this.changes[options.id].each(function(option){
			
			option.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.deleteAttributes( el.node )
							
			}.bind(this));

	
			if( option._temps ){
				
				option._temps.each(function(tmp){
					// Delete the added Node, if there is one
					if( tmp.svg && tmp.svg.parentNode ){
						tmp.svg.parentNode.removeChild( tmp.svg )
					}
		
					// If 
					if( tmp.callback && tmp.element){
						// It has to be unregistered from the edge
						tmp.element.bounds.unregisterCallback( tmp.callback )
					}
							
				}.bind(this))
				
			}
		
			
		}.bind(this));

		
		this.changes[options.id] = null;
		
		
	},
	
	
	/**
	 * Set the given css attributes to that node
	 * @param {HTMLElement} node
	 * @param {Object} attributes
	 */
	setAttributes: function( node, attributes ) {
		
		
		// Get all the childs from ME
		var childs = this.getAllChilds( node.firstChild.firstChild )
		
		var ids = []
		
		// Add all Attributes which have relation to another node in this document and concate the pure id out of it
		// This is for example important for the markers of a edge
		childs.each(function(e){ ids.push( $A(e.attributes).findAll(function(attr){ return attr.nodeValue.startsWith('url(#')}) )})
		ids = ids.flatten().compact();
		ids = ids.collect(function(s){return s.nodeValue}).uniq();
		ids = ids.collect(function(s){return s.slice(5, s.length-1)})
		
		// Add the node ID to the id
		ids.unshift( node.id + ' .me')
		
		var attr				= $H(attributes);
        var attrValue			= attr.toJSON().gsub(',', ';').gsub('"', '');
        var attrMarkerValue		= attributes.stroke ? attrValue.slice(0, attrValue.length-1) + "; fill:" + attributes.stroke + ";}" : attrValue;
        var attrTextValue;
        if( attributes.fill ){
            var copyAttr        = Object.clone(attributes);
        	copyAttr.fill		= "black";
        	attrTextValue		= $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '');
        }
                	
        // Create the CSS-Tags Style out of the ids and the attributes
        csstags = ids.collect(function(s, i){return "#" + s + " * " + (!i? attrValue : attrMarkerValue) + "" + (attrTextValue ? " #" + s + " text * " + attrTextValue : "") })
		
		// Join all the tags
		var s = csstags.join(" ") + "\n" 
		
		// And add to the end of the style tag
		this.styleNode.appendChild(document.createTextNode(s));
		
		
	},
	
	/**
	 * Deletes all attributes which are
	 * added in a special style sheet for that node
	 * @param {HTMLElement} node 
	 */
	deleteAttributes: function( node ) {
				
		// Get all children which contains the node id		
		var delEl = $A(this.styleNode.childNodes)
					 .findAll(function(e){ return e.textContent.include( '#' + node.id ) });
		
		// Remove all of them
		delEl.each(function(el){
			el.parentNode.removeChild(el);
		});		
	},
	
	getAllChilds: function( node ){
		
		var childs = $A(node.childNodes)
		
		$A(node.childNodes).each(function( e ){ 
		        childs.push( this.getAllChilds( e ) )
		}.bind(this))

    	return childs.flatten();
	}

    
});
/**
};
    ORYX.Plugins = new Object();

ORYX.Plugins.PluginLoader = Clazz.extend({
	
    facade: undefined,
	mask: undefined,
	processURI: undefined,
	
    construct: function(facade){
		this.facade = facade;
		
		this.facade.offer({
			'name': ORYX.I18N.PluginLoad.AddPluginButtonName,
			'functionality': this.showManageDialog.bind(this),
			'group': ORYX.I18N.SSExtensionLoader.group,
			'icon': ORYX.PATH + "images/labs/script_add.png",
			'description': ORYX.I18N.PluginLoad.AddPluginButtonDesc,
			'index': 8,
			'minShape': 0,
			'maxShape': 0
		});},
	showManageDialog: function(){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
	var data=[];
	//(var plugins=this.facade.getAvailablePlugins();
	var plugins=[];
	var loadedStencilSetsNamespaces = this.facade.getStencilSets().keys();
	//get all plugins which could be acivated
	this.facade.getAvailablePlugins().each(function(match) {
	if ((!match.requires 	|| !match.requires.namespaces 	
			|| match.requires.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }) )
		&&(!match.notUsesIn 	|| !match.notUsesIn.namespaces 	
				|| !match.notUsesIn.namespaces.any(function(req){ return loadedStencilSetsNamespaces.indexOf(req) >= 0 }))){
		plugins.push( match );

	}});
	
	plugins.each(function(plugin){
			data.push([plugin.name, plugin.engaged===true]);
			})
		if(data.length==0){return};
		var reader = new Ext.data.ArrayReader({}, [
        {name: 'name'},
		{name: 'engaged'} ]);
		
		var sm = new Ext.grid.CheckboxSelectionModel({
			listeners:{
			beforerowselect: function(sm,nbr,exist,rec){
			this.mask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.Oryx.pleaseWait});
			this.mask.show();
				this.facade.activatePluginByName(rec.data.name, 
						function(sucess,err){
						this.mask.hide();

							if(!!sucess){
								sm.suspendEvents();
								sm.selectRow(nbr, true);
								sm.resumeEvents();
							}else{
								Ext.Msg.show({
		   							   title: ORYX.I18N.PluginLoad.loadErrorTitle,
									   msg: ORYX.I18N.PluginLoad.loadErrorDesc + ORYX.I18N.PluginLoad[err],
									   buttons: Ext.MessageBox.OK
									});
							}}.bind(this));
				return false;
				}.bind(this),
			rowdeselect: function(sm,nbr,rec){
						sm.suspendEvents();
						sm.selectRow(nbr, true);
						sm.resumeEvents();
					}
			}});
	    var grid2 = new Ext.grid.GridPanel({
	    		store: new Ext.data.Store({
		            reader: reader,
		            data: data
		        	}),
		        cm: new Ext.grid.ColumnModel([
		            
		            {id:'name',width:390, sortable: true, dataIndex: 'name'},
					sm]),
			sm: sm,
	        width:450,
	        height:250,
	        frame:true,
			hideHeaders:true,
	        iconCls:'icon-grid',
			listeners : {
				render: function() {
					var recs=[];
					this.grid.getStore().each(function(rec){

						if(rec.data.engaged){
							recs.push(rec);
						}
					}.bind(this));
					this.suspendEvents();
					this.selectRecords(recs);
					this.resumeEvents();
				}.bind(sm)
			}
	    });

		var newURLWin = new Ext.Window({
					title:		ORYX.I18N.PluginLoad.WindowTitle, 
					//bodyStyle:	"background:white;padding:0px", 
					width:		'auto', 
					height:		'auto',
					modal:		true
					//html:"<div style='font-weight:bold;margin-bottom:10px'></div><span></span>",
				});
		newURLWin.add(grid2);
		newURLWin.show();
		this.mask.hide();

		}
		})
			/**
 * Copyright (c) 2009
 * Sven Wagner-Boysen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

/**
   @namespace Oryx name space for plugins
   @name ORYX.Plugins
*/
 if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
	

/**
 * This plugin provides methods to layout elements that typically contain 
 * a bunch of child elements, such as subprocesses or lanes.
 * 
 * @class ORYX.Plugins.ContainerLayouter
 * @extends ORYX.Plugins.AbstractPlugin
 * @param {Object} facade
 * 		The facade of the Editor
 */
ORYX.Plugins.ContainerLayouter = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade){
		this.facade = facade;

		// this does NOT work, because lanes and pools are loaded at start and initialized with a default size
		// if the lane was saved and had a bigger size, the dockers/edges will be corrupted, because the first 
		// positioning is handled as a resize event which triggers the layout with incorrect oldBounds!
		
		//this.facade.registerOnEvent('layout.container.minBounds', 
		//							this.handleLayoutContainerMinBounds.bind(this));
		//this.facade.registerOnEvent('layout.container.dockers', 
		//							this.handleLayoutContainerDockers.bind(this));
		
		this.hashedContainers = new Hash();
	},
	
	handleLayoutContainerDockers: function(event) {
		var sh = event.shape;
		
		if (!this.hashedContainers[sh.resourceId]) {
			this.hashedContainers[sh.resourceId] = sh.bounds.clone();
			return;
		}
		
		var offset = sh.bounds.upperLeft();
		offset.x -= this.hashedContainers[sh.resourceId].upperLeft().x;
		offset.y -= this.hashedContainers[sh.resourceId].upperLeft().y;
		
		this.hashedContainers[sh.resourceId] = sh.bounds.clone();
		
		this.moveChildDockers(sh, offset);
	},
	
	/**
	 * 
	 * 
	 * @param {Object} event
	 * 		The layout event object
	 */
	handleLayoutContainerMinBounds: function(event) {
		var shape = event.shape;
		var topOffset = event.topOffset;
		var oldBounds = shape._oldBounds;
		var options = event.options;
		var ignoreList = (options.ignoreChildsWithId ? options.ignoreChildsWithId : new Array());
		
		var childsBounds = this.retrieveChildsIncludingBounds(shape, ignoreList);
		if(!childsBounds) {return;}
		
		/* Get the upper left child shape */
		var ulShape = this.getChildShapesWithout(shape, ignoreList).find(function(node) {
			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
		});
		
		/* Ensure minimum size of the container */
		if(this.ensureContainersMinimumSize(shape, childsBounds, ulShape.absoluteBounds(), ignoreList, options)) {
			return;
		};
		
		
		var childsUl = childsBounds.upperLeft();
		var childsLr = childsBounds.lowerRight();
		var bottomTopSpaceRatio = (childsUl.y ? childsUl.y : 1) / 
				((oldBounds.height() - childsLr.y) ? (oldBounds.height() - childsLr.y) : 1);
		
		var newYValue = bottomTopSpaceRatio * (shape.bounds.height() - childsBounds.height())
						/ (1 + bottomTopSpaceRatio );
		
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape){
			var innerOffset = childShape.bounds.upperLeft().y - childsUl.y;
			childShape.bounds.moveTo({	x: childShape.bounds.upperLeft().x,	
										y: newYValue + innerOffset});
		});
		
		/* Calculate adjustment for dockers */
		var yAdjustment = ulShape.bounds.upperLeft().y - ulShape._oldBounds.upperLeft().y;
		
		/* Move docker by adjustment */
		this.moveChildDockers(shape, {x: 0, y: yAdjustment});
	},
	
	/**
	 * Ensures that the container has a minimum height and width to place all
	 * child elements inside.
	 * 
	 * @param {Object} shape
	 * 		The container.
	 * @param {Object} childsBounds
	 * 		The bounds including all children
	 * @param {Object} ulChildAbsBounds
	 * 		The absolute bounds including all children
	 */
	ensureContainersMinimumSize: function(shape, childsBounds, ulChildAbsBounds, ignoreList, options) {
		var bounds = shape.bounds;
		var ulShape = bounds.upperLeft();
		var lrShape = bounds.lowerRight();
		var ulChilds = childsBounds.upperLeft();
		var lrChilds = childsBounds.lowerRight();
		var absBounds = shape.absoluteBounds();
		if(!options) {
			options = new Object();
		}
		
		if(!shape.isResized) {
			/* Childs movement after widening the conatiner */
			var yMovement = 0;
			var xMovement = 0;
			var changeBounds = false;
			
			/* Widen the shape by the child bounds */
			var ulx = ulShape.x;
			var uly = ulShape.y;
			var lrx = lrShape.x;
			var lry = lrShape.y;
			
			if(ulChilds.x < 0) {
				ulx += ulChilds.x;
				xMovement -= ulChilds.x;
				changeBounds = true;
			}
			
			if(ulChilds.y < 0) {
				uly += ulChilds.y;
				yMovement -= ulChilds.y;
				changeBounds = true;
			}
			
			var xProtrusion = xMovement + ulChilds.x + childsBounds.width()
								- bounds.width();
			if(xProtrusion > 0) {
				lrx += xProtrusion;
				changeBounds = true;
			}
			
			var yProtrusion = yMovement + ulChilds.y + childsBounds.height()
								- bounds.height();
			if(yProtrusion > 0) {
				lry += yProtrusion;
				changeBounds = true;
			}
			
			bounds.set(ulx, uly, lrx, lry);
			
			/* Update hashed bounds for docker positioning */
			if(changeBounds) {
				this.hashedContainers[shape.resourceId] = bounds.clone();
			}
			
			this.moveChildsBy(shape, {x: xMovement, y: yMovement}, ignoreList);
			
			/* Signals that children are already move to correct position */
			return true;
		}
		
		/* Resize container to minimum size */
		
		var ulx = ulShape.x;
		var uly = ulShape.y;
		var lrx = lrShape.x;
		var lry = lrShape.y;
		changeBounds = false;
			
		/* Ensure height */
		if(bounds.height() < childsBounds.height()) {
			/* Shape was resized on upper left in height */
			if(ulShape.y != shape._oldBounds.upperLeft().y &&
				lrShape.y == shape._oldBounds.lowerRight().y) {
				uly = lry - childsBounds.height() - 1;	
				if(options.fixedY) {
					uly -= childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.y == shape._oldBounds.upperLeft().y &&
				lrShape.y != shape._oldBounds.lowerRight().y) {
				lry = uly + childsBounds.height() + 1;	
				if(options.fixedY) {
					lry += childsBounds.upperLeft().y;
				}
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulyDiff = absBounds.upperLeft().y - ulChildAbsBounds.upperLeft().y;
				var lryDiff = absBounds.lowerRight().y - ulChildAbsBounds.lowerRight().y;
				uly -= ulyDiff;
				lry -= lryDiff;
				uly--;
				lry++;
				changeBounds = true;
			}
		}
		
		/* Ensure width */
		if(bounds.width() < childsBounds.width()) {
			/* Shape was resized on upper left in height */
			if(ulShape.x != shape._oldBounds.upperLeft().x &&
				lrShape.x == shape._oldBounds.lowerRight().x) {
				ulx = lrx - childsBounds.width() - 1;
				if(options.fixedX) {
					ulx -= childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Shape was resized on lower right in height */
			else if(ulShape.x == shape._oldBounds.upperLeft().x &&
				lrShape.x != shape._oldBounds.lowerRight().x) {
				lrx = ulx + childsBounds.width() + 1;
				if(options.fixedX) {
					lrx += childsBounds.upperLeft().x;
				}	
				changeBounds = true;
			} 
			/* Both upper left and lower right changed */
			else if(ulChildAbsBounds) {
				var ulxDiff = absBounds.upperLeft().x - ulChildAbsBounds.upperLeft().x;
				var lrxDiff = absBounds.lowerRight().x - ulChildAbsBounds.lowerRight().x;
				ulx -= ulxDiff;
				lrx -= lrxDiff;
				ulx--;
				lrx++;
				changeBounds = true;
			}
		}
		
		/* Set minimum bounds */
		bounds.set(ulx, uly, lrx, lry);
		if(changeBounds) {
			//this.hashedContainers[shape.resourceId] = bounds.clone();
			this.handleLayoutContainerDockers({shape:shape});
		}
	},
	
	/**
	 * Moves all child shapes and related dockers of the container shape by the 
	 * relative move point.
	 * 
	 * @param {Object} shape
	 * 		The container shape
	 * @param {Object} relativeMovePoint
	 * 		The point that defines the movement
	 */
	moveChildsBy: function(shape, relativeMovePoint, ignoreList) {
		if(!shape || !relativeMovePoint) {
			return;
		}
		
		/* Move child shapes */
		this.getChildShapesWithout(shape, ignoreList).each(function(child) {
			child.bounds.moveBy(relativeMovePoint);
		});
		
		/* Move related dockers */
		//this.moveChildDockers(shape, relativeMovePoint);
	},
	
	/**
	 * Retrieves the absolute bounds that include all child shapes.
	 * 
	 * @param {Object} shape
	 */
	getAbsoluteBoundsForChildShapes: function(shape) {
//		var childsBounds = this.retrieveChildsIncludingBounds(shape);
//		if(!childsBounds) {return undefined}
//		
//		var ulShape = shape.getChildShapes(false).find(function(node) {
//			return childsBounds.upperLeft().y == node.bounds.upperLeft().y;
//		});
//		
////		var lrShape = shape.getChildShapes(false).find(function(node) {
////			return childsBounds.lowerRight().y == node.bounds.lowerRight().y;
////		});
//		
//		var absUl = ulShape.absoluteBounds().upperLeft();
//		
//		this.hashedContainers[shape.getId()].childsBounds = 
//						new ORYX.Core.Bounds(absUl.x, 
//											absUl.y,
//											absUl.x + childsBounds.width(),
//											absUl.y + childsBounds.height());
//		
//		return this.hashedContainers[shape.getId()];
	},
	
	/**
	 * Moves the docker when moving shapes.
	 * 
	 * @param {Object} shape
	 * @param {Object} offset
	 */
	moveChildDockers: function(shape, offset){
		
		if (!offset.x && !offset.y) {
			return;
		} 
		
		// Get all nodes
		shape.getChildNodes(true)
			// Get all incoming and outgoing edges
			.map(function(node){
				return [].concat(node.getIncomingShapes())
						.concat(node.getOutgoingShapes())
			})
			// Flatten all including arrays into one
			.flatten()
			// Get every edge only once
			.uniq()
			// Get all dockers
			.map(function(edge){
				return edge.dockers.length > 2 ? 
						edge.dockers.slice(1, edge.dockers.length-1) : 
						[];
			})
			// Flatten the dockers lists
			.flatten()
			.each(function(docker){
				docker.bounds.moveBy(offset);
			})
	},
	
	/**
	 * Calculates the bounds that include all child shapes of the given shape.
	 * 
	 * @param {Object} shape
	 * 		The parent shape.
	 */
	retrieveChildsIncludingBounds: function(shape, ignoreList) {
		var childsBounds = undefined;
		this.getChildShapesWithout(shape, ignoreList).each(function(childShape, i) {
			if(i == 0) {
				/* Initialize bounds that include all direct child shapes of the shape */
				childsBounds = childShape.bounds.clone();
				return;
			}
			
			/* Include other child elements */
			childsBounds.include(childShape.bounds);			
		});
		
		return childsBounds;
	},
	
	/**
	 * Returns the direct child shapes that are not on the ignore list.
	 */
	getChildShapesWithout: function(shape, ignoreList) {
		var childs = shape.getChildShapes(false);
		return childs.findAll(function(child) {
					return !ignoreList.member(child.getStencil().id());				
				});
	}
}

ORYX.Plugins.ContainerLayouter = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ContainerLayouter);
/**
 * Copyright (c) 2009
 * Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

if(!ORYX.Plugins) { ORYX.Plugins = {} }
if(!ORYX.Plugins.Layouter) { ORYX.Plugins.Layouter = {} }

new function(){
	
	/**
	 * Edge layouter is an implementation to layout an edge
	 * @class ORYX.Plugins.Layouter.EdgeLayouter
	 * @author Willi Tscheschner
	 */
	ORYX.Plugins.Layouter.EdgeLayouter = ORYX.Plugins.AbstractLayouter.extend({
		
		/**
		 * Layout only Edges
		 */
		layouted : [	"http://b3mn.org/stencilset/bpmn1.1#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn1.1#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#MessageFlow",
						"http://b3mn.org/stencilset/bpmn2.0#SequenceFlow", 
						"http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink",
						"http://b3mn.org/stencilset/epc#ControlFlow",
						"http://www.signavio.com/stencilsets/processmap#ProcessLink",
						"http://www.signavio.com/stencilsets/organigram#connection"],
		
		/**
		 * Layout a set on edges
		 * @param {Object} edges
		 */
		layout: function(edges){
			edges.each(function(edge){
				this.doLayout(edge)
			}.bind(this))
		},
		
		/**
		 * Layout one edge
		 * @param {Object} edge
		 */
		doLayout: function(edge){
			// Get from and to node
			var from 	= edge.getIncomingNodes()[0]; 
			var to 		= edge.getOutgoingNodes()[0];
			
			// Return if one is null
			if (!from || !to) { return }
			
			var positions = this.getPositions(from, to, edge);
		
			if (positions.length > 0){
				this.setDockers(edge, positions[0].a, positions[0].b);
			}
				
		},
		
		/**
		 * Returns a set on positions which are not containt either 
		 * in the bounds in from or to.
		 * @param {Object} from Shape where the edge is come from
		 * @param {Object} to Shape where the edge is leading to
		 * @param {Object} edge Edge between from and to
		 */
		getPositions : function(from, to, edge){
			
			// Get absolute bounds
			var ab = from.absoluteBounds();
			var bb = to.absoluteBounds();
			
			// Get center from and to
			var a = ab.center();
			var b = bb.center();
			
			var am = ab.midPoint();
			var bm = bb.midPoint();
		
			// Get first and last reference point
			var first = Object.clone(edge.dockers.first().referencePoint);
			var last = Object.clone(edge.dockers.last().referencePoint);
			// Get the absolute one
			var aFirst = edge.dockers.first().getAbsoluteReferencePoint();
			var aLast = edge.dockers.last().getAbsoluteReferencePoint(); 
			
			// IF ------>
			// or  |
			//     V
			// Do nothing
			if (Math.abs(aFirst.x-aLast.x) < 1 || Math.abs(aFirst.y-aLast.y) < 1) {
				return []
			}
			
			// Calc center position, between a and b
			// depending on there weight
			var m = {}
			m.x = a.x < b.x ? 
					(((b.x - bb.width()/2) - (a.x + ab.width()/2))/2) + (a.x + ab.width()/2): 
					(((a.x - ab.width()/2) - (b.x + bb.width()/2))/2) + (b.x + bb.width()/2);

			m.y = a.y < b.y ? 
					(((b.y - bb.height()/2) - (a.y + ab.height()/2))/2) + (a.y + ab.height()/2): 
					(((a.y - ab.height()/2) - (b.y + bb.height()/2))/2) + (b.y + bb.height()/2);
								
								
			// Enlarge both bounds with 10
			ab.widen(5); // Wide the from less than 
			bb.widen(20);// the to because of the arrow from the edge
								
			var positions = [];
			var off = this.getOffset.bind(this);
			
			// Checks ----+
			//            |
			//            V
			if (!ab.isIncluded(b.x, a.y)&&!bb.isIncluded(b.x, a.y)) {
				positions.push({
					a : {x:b.x+off(last,bm,"x"),y:a.y+off(first,am,"y")},
					z : this.getWeight(from, a.x < b.x ? "r" : "l", to, a.y < b.y ? "t" : "b", edge)
				});
			}
						
			// Checks | 
			//        +--->
			if (!ab.isIncluded(a.x, b.y)&&!bb.isIncluded(a.x, b.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, a.y < b.y ? "b" : "t", to, a.x < b.x ? "l" : "r", edge)
				});
			}
						
			// Checks  --+
			//           |
			//           +--->
			if (!ab.isIncluded(m.x, a.y)&&!bb.isIncluded(m.x, b.y)) {
				positions.push({
					a : {x:m.x,y:a.y+off(first,am,"y")},
					b : {x:m.x,y:b.y+off(last,bm,"y")},
					z : this.getWeight(from, "r", to, "l", edge, a.x > b.x)
				});
			}
			
			// Checks | 
			//        +---+
			//            |
			//            V
			if (!ab.isIncluded(a.x, m.y)&&!bb.isIncluded(b.x, m.y)) {
				positions.push({
					a : {x:a.x+off(first,am,"x"),y:m.y},
					b : {x:b.x+off(last,bm,"x"),y:m.y},
					z : this.getWeight(from, "b", to, "t", edge, a.y > b.y)
				});
			}	
			
			// Sort DESC of weights
			return positions.sort(function(a,b){ return a.z < b.z ? 1 : (a.z == b.z ? -1 : -1)});
		},
		
		/**
		 * Returns a offset for the pos to the center of the bounds
		 * 
		 * @param {Object} val
		 * @param {Object} pos2
		 * @param {String} dir Direction x|y
		 */
		getOffset: function(pos, pos2, dir){
			return pos[dir] - pos2[dir];
		},
		
		/**
		 * Returns a value which shows the weight for this configuration
		 * 
		 * @param {Object} from Shape which is coming from
		 * @param {String} d1 Direction where is goes
		 * @param {Object} to Shape which goes to
		 * @param {String} d2 Direction where it comes to
		 * @param {Object} edge Edge between from and to
		 * @param {Boolean} reverse Reverse the direction (e.g. "r" -> "l")
		 */
		getWeight: function(from, d1, to, d2, edge, reverse){
			
			d1 = (d1||"").toLowerCase();
			d2 = (d2||"").toLowerCase();
			
			if (!["t","r","b","l"].include(d1)){ d1 = "r"}
			if (!["t","r","b","l"].include(d2)){ d1 = "l"}
			
			// If reverse is set
			if (reverse) {
				// Reverse d1 and d2
				d1 = d1=="t"?"b":(d1=="r"?"l":(d1=="b"?"t":(d1=="l"?"r":"r")))
				d2 = d2=="t"?"b":(d2=="r"?"l":(d2=="b"?"t":(d2=="l"?"r":"r")))
			}
			
					
			var weight = 0;
			// Get rules for from "out" and to "in"
			var dr1 = this.facade.getRules().getLayoutingRules(from, edge)["out"];
			var dr2 = this.facade.getRules().getLayoutingRules(to, edge)["in"];

			var fromWeight = dr1[d1];
			var toWeight = dr2[d2];


			/**
			 * Return a true if the center 1 is in the same direction than center 2
			 * @param {Object} direction
			 * @param {Object} center1
			 * @param {Object} center2
			 */
			var sameDirection = function(direction, center1, center2){
				switch(direction){
					case "t": return Math.abs(center1.x - center2.x) < 2 && center1.y < center2.y
					case "r": return center1.x > center2.x && Math.abs(center1.y - center2.y) < 2
					case "b": return Math.abs(center1.x - center2.x) < 2 && center1.y > center2.y
					case "l": return center1.x < center2.x && Math.abs(center1.y - center2.y) < 2
					default: return false;
				}
			}

			// Check if there are same incoming edges from 'from'
			var sameIncomingFrom = from
								.getIncomingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d1, e.dockers[e.dockers.length-2].bounds.center(), e.dockers.last().bounds.center());
								});

			// Check if there are same outgoing edges from 'to'
			var sameOutgoingTo = to
								.getOutgoingShapes()
								.findAll(function(a){ return a instanceof ORYX.Core.Edge})
								.any(function(e){ 
									return sameDirection(d2, e.dockers[1].bounds.center(), e.dockers.first().bounds.center());
								});
			
			// If there are equivalent edges, set 0
			//fromWeight = sameIncomingFrom ? 0 : fromWeight;
			//toWeight = sameOutgoingTo ? 0 : toWeight;
			
			// Get the sum of "out" and the direction plus "in" and the direction 						
			return (sameIncomingFrom||sameOutgoingTo?0:fromWeight+toWeight);
		},
		
		/**
		 * Removes all current dockers from the node 
		 * (except the start and end) and adds two new
		 * dockers, on the position a and b.
		 * @param {Object} edge
		 * @param {Object} a
		 * @param {Object} b
		 */
		setDockers: function(edge, a, b){
			if (!edge){ return }
			
			// Remove all dockers (implicit,
			// start and end dockers will not removed)
			edge.dockers.each(function(r){
				edge.removeDocker(r);
			});
			
			// For a and b (if exists), create
			// a new docker and set position
			[a, b].compact().each(function(pos){
				var docker = edge.createDocker(undefined, pos);
				docker.bounds.centerMoveTo(pos);
			});
			
			// Update all dockers from the edge
			edge.dockers.each(function(docker){
				docker.update()
			})
			
			// Update edge
			//edge.refresh();
			edge._update(true);
			
		}
	});
	
	
}()
if(!ORYX.Plugins)
	ORYX.Plugins = new Object();
if (!ORYX.Config) {
	ORYX.Config = new Object();
}
/*
 * http://oryx.processwave.org/gadget/oryx_stable.xml
 */
ORYX.Config.WaveThisGadgetUri = "http://ddj0ahgq8zch6.cloudfront.net/gadget/oryx_stable.xml";
ORYX.Plugins.WaveThis = Clazz.extend({
	
	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		this.facade.offer({
			'name':				ORYX.I18N.WaveThis.name,
			'functionality': 	this.waveThis.bind(this),
			'group': 			ORYX.I18N.WaveThis.group,
			'icon': 			ORYX.PATH + "images/waveThis.png",
			'description': 		ORYX.I18N.WaveThis.desc,
            'dropDownGroupIcon':ORYX.PATH + "images/export2.png",

		});
		
		this.changeDifference = 0;
		
		// Register on events for executing commands and save, to monitor the changed status of the model 
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function(){ this.changeDifference++ }.bind(this) );
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function(){ this.changeDifference-- }.bind(this) );
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODEL_SAVED, function(){ this.changeDifference =0}.bind(this) );

	},
	waveThis: function(){
		var modelUri;
		if(!location.hash.slice(1)){
			Ext.Msg.alert(ORYX.I18N.WaveThis.name, ORYX.I18N.WaveThis.failUnsaved);
			return;
		}
		else{
			modelUri = ORYX.CONFIG.WEB_URL+'/backend/poem/'+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/json";
		}
		if(this.changeDifference!=0){
	        Ext.Msg.confirm(ORYX.I18N.WaveThis.name, "You have unsaved changes in your model. Proceed?", function(id){
	        	if(id=="yes"){
	        		this._openWave(modelUri);
	        	}
	        },this);
		}else{
			this._openWave(modelUri);
		}
		
	},
	_openWave: function(modelUri){
		var win = window.open("");
		if (win != null) {
			win.document.open();
			win.document.write("<html><body>");
			var submitForm = win.document.createElement("form");
			win.document.body.appendChild(submitForm);
			
			var createHiddenElement = function(name, value) {
				var newElement = document.createElement("input");
				newElement.name=name;
				newElement.type="hidden";
				newElement.value = value;
				return newElement
			}
			
			submitForm.appendChild( createHiddenElement("u", modelUri) );
			submitForm.appendChild( createHiddenElement("g", ORYX.Config.WaveThisGadgetUri) );
			
			
			submitForm.method = "POST";
			win.document.write("</body></html>");
			win.document.close();
			submitForm.action= "https://wave.google.com/wave/wavethis?t=Oryx%20Model%20Export";
			submitForm.submit();
		}
	}
})/**
		})) {
	}