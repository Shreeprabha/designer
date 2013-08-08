if (!ORYX.Plugins) 
    ORYX.Plugins = {};

if (!ORYX.Config)
	ORYX.Config = {};

ORYX.Plugins.Simulation = Clazz.extend({
	construct: function(facade){
		this.facade = facade;
		
		this.facade.offer({
			'name': "Run Simulation",
			'functionality': this.runSimulation.bind(this),
			'group': "validationandsimulation",
			'icon': ORYX.PATH + "images/control_play.png",
			'dropDownGroupIcon' : ORYX.PATH + "images/simulation.png",
			'description': "Run Process Simulation",
			'index': 2,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
                return true;

			}.bind(this)
		});
	},
	
	runSimulation : function() {
		var simform = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	150,
	        defaultType: 	'numberfield',
	        items: [{
	        	fieldLabel: 'Number of instances',
	            name: 'instances',
	            allowBlank:false,
	            allowDecimals:false,
	            minValue:1,
	            width: 120
	        },
	        {
	        	fieldLabel: 'Inteval',
	            name: 'interval',
	            allowBlank:false,
	            allowDecimals:false,
	            minValue:1,
	            width: 120
	        },
	        {
                xtype: 'combo',
                name: 'intervalunits',
                store: new Ext.data.SimpleStore({
                    fields: ['units'],
                    data: [['millisecond'], ['seconds'], ['minutes'], ['hours'], ['days']]
                }),
                allowBlank: false,
                displayField: 'units',
                valueField: 'units',
                mode: 'local',
                typeAhead: true,
                value: "minutes",
                triggerAction: 'all',
                fieldLabel: 'Interval units',
                width: 120
            }
	        ]
	    });
		
		
		var dialog = new Ext.Window({ 
			autoCreate: true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		"Run Process Simulation", 
			height: 	300,
			width:		350,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[simform],
			buttons:[
				{
					text:"Run Simulation",
					handler:function(){
						dialog.hide();

                        this.facade.raiseEvent({
                            type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                            ntype		: 'info',
                            msg         : 'Running Process Simulation...',
                            title       : ''

                        });

						var instancesInput = simform.items.items[0].getValue();
						var intervalInput = simform.items.items[1].getValue();
						var intervalUnit = simform.items.items[2].getValue();
						var serial = this.facade.getJSON();					
						console.log(serial);
						if(serial.stencil.id == "BPMNDiagram"){
							console.log("In digaram");
							for (var child in serial.childShapes)
							{
								var c = child.toJSON();
								console.log("here", c);
							}
						}

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
	}
});