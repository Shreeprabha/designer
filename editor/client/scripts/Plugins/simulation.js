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
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_BUILD_PATH_SVG, this.autoDisplayPath.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_CLEAR_PATH_SVG, this.resetNodeColors.bind(this));
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
						Ext.Ajax.request({
				            url: ORYX.PATH + 'simulation',
				            method: 'POST',
				            success: function(response) {
				    	   		try {
				    	   			if(response.responseText && response.responseText.length > 0 && response.responseText != "{}") {
				    	   				this.facade.raiseEvent({
				    	   		            type: ORYX.CONFIG.EVENT_SIMULATION_SHOW_RESULTS,
				    	   		            results: response.responseText
				    	   		        });
				    	   			} else {
                                           this.facade.raiseEvent({
                                               type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                               ntype		: 'info',
                                               msg         : 'Simulation engine did not return results.',
                                               title       : ''

                                           });
				    	   			}
				    	   		} catch(e) {
                                       this.facade.raiseEvent({
                                           type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                           ntype		: 'error',
                                           msg         : 'Unable to perform simulation:\n' + e,
                                           title       : ''

                                       });
				    	   		}
				            }.bind(this),
				            failure: function(){
                                this.facade.raiseEvent({
                                    type 		: ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,
                                    ntype		: 'error',
                                    msg         : 'Unable to perform simulation.',
                                    title       : ''

                                });
				            },
				            params: {
				            	action: 'runsimulation',
				             	json: this.facade.getSerializedJSON(),
				            	ppdata: ORYX.PREPROCESSING,
				            	numinstances: instancesInput,
				            	interval: intervalInput,
				            	intervalunit: intervalUnit
				            }
				        });
					}.bind(this)
				},{
					text:ORYX.I18N.FromBPMN2Support.close,
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
	}
});