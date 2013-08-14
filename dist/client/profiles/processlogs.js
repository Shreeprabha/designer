if(!ORYX.Plugins){ORYX.Plugins={}
}ORYX.Plugins.ProcessLogGenerator=ORYX.Plugins.AbstractPlugin.extend({processLogGeneratorHandleURL:ORYX.PATH+"processloggenerator",construct:function(a){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.ProcessLogGenerator.generate,functionality:this.perform.bind(this),description:ORYX.I18N.ProcessLogGenerator.generateDescription,icon:ORYX.PATH+"images/processLogGeneratorIcon.png",index:0,minShape:0,maxShape:0})
},perform:function(){this.confirmed_petrinettimeandprobability_extension_missing=this.confirmed_petrinettimeandprobability_extension_missing||false;
if(!this.confirmed_petrinettimeandprobability_extension_missing){this.confirmed_petrinettimeandprobability_extension_missing=true;
var a=true;
this.facade.getStencilSets().values().each(function(b){b.extensions().values().each(function(c){if(c.namespace.match(/petrinettimeandpropability/)){a=false
}})
});
if(a){Ext.MessageBox.show({title:"Time and Probability Extension",msg:'<p>An exension for petrinets allows you to configure execution time and probability of transitions and thus further control the generated log for this model.<br/> To use this feature load the <strong>"Time and Probability Extension"</strong> from the stencil set extensions menu.</p><br/>Do you want to proceed anyways?',buttons:Ext.MessageBox.YESNO,fn:function(b){if("yes"==b){this.checkTokens()
}}.bind(this),animEl:"mb4",icon:Ext.MessageBox.QUESTION})
}else{this.checkTokens()
}}else{this.checkTokens()
}},checkTokens:function(){var a=this.getPlaces().any(function(b){var c=parseInt(b.properties["oryx-numberoftokens"]);
return !(isNaN(c)||c==0)
});
if(!a){Ext.MessageBox.show({title:"No Tokens",msg:"The net has no tokens, and thus cannot be executed. Generated logs will be empty.<br/>Do you want to proceed?",buttons:Ext.MessageBox.YESNO,fn:function(b){if("yes"==b){this.showDialog()
}}.bind(this),animEl:"mb4",icon:Ext.MessageBox.QUESTION})
}else{this.showDialog()
}},showDialog:function(){var a=this.createCompletenessSelector(),d=this.createNoiseField(),c=this.createTraceCountField(),b=this.createDialog();
this.addFormPanelToWindow(a,d,c,b);
b.show()
},getPlaces:function(){return this.facade.getCanvas().getChildShapes().select(function(a){return a.getStencil().id().search(/Place/)>-1
})
},createCompletenessSelector:function(){var b=[["None"],["Trace"],["Ordering"]],a=new Ext.data.SimpleStore({fields:["value"],data:b});
return new Ext.form.ComboBox({fieldLabel:ORYX.I18N.ProcessLogGenerator.completenessSelect,store:a,displayField:"value",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,forceSelection:true,value:this.completeness||"Trace",emptyText:ORYX.I18N.ProcessLogGenerator.pleaseSelect})
},createNoiseField:function(){return new Ext.form.NumberField({fieldLabel:ORYX.I18N.ProcessLogGenerator.degreeOfNoise,allowBlank:false,allowDecimals:false,value:this.noise||5,minValue:0,maxValue:100})
},createTraceCountField:function(){return new Ext.form.NumberField({fieldLabel:ORYX.I18N.ProcessLogGenerator.numberOfTraces,allowBlank:false,allowDecimals:false,value:this.tracecount||10,minValue:1,maxValue:10000})
},createDialog:function(){var a=new Ext.Window({autoCreate:true,title:ORYX.I18N.ProcessLogGenerator.preferencesWindowTitle,height:240,width:400,modal:true,collapsible:false,fixedcenter:true,shadow:true,style:"font-size:12px;",proxyDrag:true,resizable:true,items:[new Ext.form.Label({text:ORYX.I18N.ProcessLogGenerator.dialogDescription,style:"font-size:12px;"})]});
a.on("hide",function(){a.destroy(true)
});
return a
},addFormPanelToWindow:function(b,d,c,e){var a=new Ext.form.FormPanel({frame:false,defaultType:"textfield",waitMsgTarget:true,labelAlign:"left",buttonAlign:"right",enctype:"multipart/form-data",style:"font-size:12px;",monitorValid:true,items:[b,d,c],buttons:[{text:"Submit",formBind:true,handler:function(){this.completeness=b.getValue();
this.noise=d.getValue();
this.tracecount=c.getValue();
this.generateLog({completeness:this.completeness,noise:this.noise,traceCount:this.tracecount});
e.hide()
}.bind(this)}]});
e.add(a)
},generateLog:function(a){var c=this.getRDFFromDOM(),b=JSON.stringify(a);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.ProcessLogGenerator.shortWaitText});
new Ajax.Request(this.processLogGeneratorHandleURL,{method:"POST",parameters:{options:b,model:c},onSuccess:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
this.openDownloadWindow("generated_log.mxml",d.responseText)
}.bind(this),onFailure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.ProcessLogGenerator.failed)
}.bind(this)})
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.PetriNet={construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.handlePropertyChanged.bind(this))
},handlePropertyChanged:function(c){var b=c.elements;
var d=c.key;
var a=c.value;
var e=false;
b.each(function(f){if((f.getStencil().id()==="http://b3mn.org/stencilset/petrinet#Place")&&(d==="oryx-numberoftokens")){if(a==0){f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","0")
}else{if(a==1){f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","1")
}else{if(a==2){f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","2")
}else{if(a==3){f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","3")
}else{if(a==4){f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","4")
}else{var g=parseInt(a,10);
if(g&&g>0){f.setProperty("oryx-numberoftokens_text",""+g);
f.setProperty("oryx-numberoftokens_drawing","0")
}else{f.setProperty("oryx-numberoftokens_text","");
f.setProperty("oryx-numberoftokens_drawing","0")
}}}}}}e=true
}});
if(e){this.facade.getCanvas().update()
}}};
ORYX.Plugins.PetriNet=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.PetriNet);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SyntaxChecker=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.active=false;
this.raisedEventIds=[];
this.facade.offer({name:ORYX.I18N.SyntaxChecker.name,functionality:this.perform.bind(this),group:ORYX.I18N.SyntaxChecker.group,icon:ORYX.PATH+"images/checker_syntax.png",description:ORYX.I18N.SyntaxChecker.desc,index:0,toggle:true,minShape:0,maxShape:0});
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,this.checkForErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT,this.resetErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT,this.doShowErrors.bind(this))
},perform:function(a,b){if(!b){this.resetErrors()
}else{this.checkForErrors({onNoErrors:function(){this.setActivated(a,false);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.noErrors,timeout:10000})
}.bind(this),onErrors:function(){this.enableDeactivationHandler(a)
}.bind(this),onFailure:function(){this.setActivated(a,false);
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SyntaxChecker.invalid)
}.bind(this)})
}},enableDeactivationHandler:function(a){var b=function(){this.setActivated(a,false);
this.resetErrors();
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b)
};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b.bind(this))
},setActivated:function(b,a){b.toggle(a);
if(a===undefined){this.active=!this.active
}else{this.active=a
}},checkForErrors:function(a){Ext.applyIf(a||{},{showErrors:true,onErrors:Ext.emptyFn,onNoErrors:Ext.emptyFn,onFailure:Ext.emptyFn});
Ext.Msg.wait(ORYX.I18N.SyntaxChecker.checkingMessage);
var b=this.facade.getStencilSets();
var d=null;
var c=false;
if(b.keys().include("http://b3mn.org/stencilset/bpmn2.0#")||b.keys().include("http://b3mn.org/stencilset/bpmn2.0conversation#")){d=this.facade.getSerializedJSON();
c=true
}else{d=this.getRDFFromDOM()
}new Ajax.Request(ORYX.CONFIG.SYNTAXCHECKER_URL,{method:"POST",asynchronous:false,parameters:{resource:location.href,data:d,context:a.context,isJson:c},onSuccess:function(e){var f=(e&&e.responseText?e.responseText:"{}").evalJSON();
Ext.Msg.hide();
if(f instanceof Object){f=$H(f);
if(f.size()>0){if(a.showErrors){this.showErrors(f)
}a.onErrors()
}else{a.onNoErrors()
}}else{a.onFailure()
}}.bind(this),onFailure:function(){Ext.Msg.hide();
a.onFailure()
}})
},doShowErrors:function(b,a){this.showErrors(b.errors)
},showErrors:function(a){if(!(a instanceof Hash)){a=new Hash(a)
}a.keys().each(function(c){var b=this.facade.getCanvas().getChildShapeByResourceId(c);
if(b){this.raiseOverlay(b,this.parseCodeToMsg(a[c]))
}}.bind(this));
this.active=!this.active;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.notice,timeout:10000})
},parseCodeToMsg:function(e){var f=e.replace(/: /g,"<br />").replace(/, /g,"<br />");
var a=f.split("<br />");
for(var b=0;
b<a.length;
b++){var d=a[b];
var c=this.parseSingleCodeToMsg(d);
if(d!=c){f=f.replace(d,c)
}}return f
},parseSingleCodeToMsg:function(a){return ORYX.I18N.SyntaxChecker[a]||a
},resetErrors:function(){this.raisedEventIds.each(function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:a})
}.bind(this));
this.raisedEventIds=[];
this.active=false
},raiseOverlay:function(a,b){var f="syntaxchecker."+this.raisedEventIds.length;
var d=ORYX.Editor.provideId();
var e=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["path",{id:d,title:"","stroke-width":5,stroke:"red",d:"M20,-5 L5,-20 M5,-5 L20,-20","line-captions":"round"}]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:f,shapes:[a],node:e,nodePosition:a instanceof ORYX.Core.Edge?"START":"NW"});
var c=new Ext.ToolTip({showDelay:50,html:b,target:d});
this.raisedEventIds.push(f);
return e
}});
ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT="checkForErrors";
ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT="resetErrors";
ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT="showErrors";
ORYX.Plugins.PetrinetSyntaxChecker=ORYX.Plugins.SyntaxChecker.extend({getRDFFromDOM:function(){return this.facade.getERDF()
}});
Ext.ns("Oryx.Plugins");
ORYX.Plugins.PetriNetSoundnessChecker=ORYX.Plugins.AbstractPlugin.extend({hideOverlays:function(){if(!this.overlayIds){return
}Ext.each(this.overlayIds,function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:a})
}.bind(this))
},getChildShapesByResourceIds:function(b){var a=[];
Ext.each(b,function(c){a.push(this.facade.getCanvas().getChildShapeByResourceId(c))
}.bind(this));
return a
},showOverlay:function(a,b,e,c){if(!this.overlayIds){this.overlayIds=[]
}if(!(a instanceof Array)){a=[a]
}a=a.map(function(f){var g=f;
if(typeof f=="string"){g=this.facade.getCanvas().getChildShapeByResourceId(f);
g=g||this.facade.getCanvas().getChildById(f,true)
}return g
}.bind(this)).compact();
var d=this.type+ORYX.Editor.provideId();
this.overlayIds.push(d);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:d,shapes:a,attributes:b,node:e,nodePosition:c||"NW"})
},construct:function(a){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:"Check soundness",functionality:this.showCheckerWindow.bind(this),group:"Verification",icon:ORYX.PATH+"images/checker_validation.png",description:"Checks current Petri net for different soundness criteria.",index:3,minShape:0,maxShape:0})
},showCheckerWindow:function(){var d=this;
var b=Ext.extend(Ext.tree.TreeNode,{constructor:function(g){if(!g.icon&&!this.icon){g.icon=b.UNKNOWN_STATUS
}b.superclass.constructor.apply(this,arguments);
Ext.apply(this,g);
if(this.clickHandler){this.on("click",this.clickHandler.bind(this))
}},setIcon:function(g){this.ui.getIconEl().src=g
},getIcon:function(g){return this.ui.getIconEl().src
},reset:function(){d.hideOverlays();
this.hideMarking();
d.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT})
},hideMarking:function(){if(!d.marking){return
}for(place in d.marking){var g=d.facade.getCanvas().getChildShapeByResourceId(place);
if(g){g.setProperty("oryx-numberoftokens",0)
}}d.facade.getCanvas().update();
d.marking=undefined
},showMarking:function(h){d.marking=h;
for(place in h){var g=d.facade.getCanvas().getChildShapeByResourceId(place);
g.setProperty("oryx-numberoftokens",h[place])
}d.facade.getCanvas().update()
},showErrors:function(g){Ext.each(this.childNodes,function(h){if(h&&h.itemCls==="error"){h.remove()
}});
Ext.each(this.childNodes,function(h){if(h.getIcon().search(b.LOADING_STATUS)>-1){h.setIcon(b.UNKNOWN_STATUS)
}});
Ext.each(g,function(h){this.insertBefore(new b({icon:b.ERROR_STATUS,text:h,itemCls:"error"}),this.childNodes[0])
}.bind(this))
},showOverlayWithStep:function(g){Ext.each(g,function(j,h){d.showOverlay(d.facade.getCanvas().getChildShapeByResourceId(j),{fill:"#FB7E02"},ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{style:"font-size: 16px; font-weight: bold;"},(h+1)+"."]),"SE")
})
},showOverlay:function(g){if(g.length===0){return
}if(!g[0] instanceof ORYX.Core.Node){g=d.getChildShapesByResourceIds(g)
}d.showOverlay(g,{fill:"#FB7E02"})
}});
b.UNKNOWN_STATUS=ORYX.PATH+"images/soundness_checker/asterisk_yellow.png";
b.ERROR_STATUS=ORYX.PATH+"images/soundness_checker/exclamation.png";
b.OK_STATUS=ORYX.PATH+"images/soundness_checker/accept.png";
b.LOADING_STATUS=ORYX.PATH+"images/soundness_checker/loading.gif";
var c=Ext.extend(b,{constructor:function(g){g.qtip="<b>Termination Criteria</b>: Makes sure that any process instance that starts in the initial state will eventually reach the final state. If any dead locks are detected, click to show one counter example.";
c.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
if(this.deadLocks.length==0){return
}var g=h.deadLocks[0];
this.showOverlayWithStep(g.path);
this.showMarking(g.marking)
},update:function(g){this.deadLocks=g;
this.setIcon(this.deadLocks.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There is "+(this.deadLocks.length==0?"no":"a")+" path that leads to a deadlock.")
}});
var f=Ext.extend(b,{constructor:function(g){g.qtip="<b>Proper Termination Criteria</b>: The final state is the only state reachable from the initial state in which there is a token in the final place. If any improper terminating states are detected, click to show one counter example.";
f.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
if(h.improperTerminatings.length==0){return
}var g=h.improperTerminatings[0];
this.showOverlayWithStep(g.path);
this.showMarking(g.marking)
},update:function(g){this.improperTerminatings=g;
this.setIcon(this.improperTerminatings.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.improperTerminatings.length+" markings covering the final marking.")
}});
var a=Ext.extend(b,{constructor:function(g){g.qtip="<b>No Dead Transitions Criteria</b>: Each transition can contribute to at least one process instance. Click to see all dead transitions.";
a.superclass.constructor.apply(this,arguments)
},clickHandler:function(g){g.reset();
this.showOverlay(this.deadTransitions)
},update:function(g){this.deadTransitions=g;
this.setIcon(this.deadTransitions.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.deadTransitions.length+" dead transitions.")
}});
var e=Ext.extend(b,{constructor:function(g){g.qtip="<b>Transition Participation Criteria</b>: Each transition participates in at least one process instance that starts in the initial state and reaches the final state. Click to see all transitions not participating in any process instance.";
e.superclass.constructor.apply(this,arguments)
},clickHandler:function(g){g.reset();
this.showOverlay(this.notParticipatingTransitions)
},update:function(g){this.notParticipatingTransitions=g;
this.setIcon(this.notParticipatingTransitions.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.notParticipatingTransitions.length+" transitions that cannot participate in a properly terminating firing sequence.")
}});
this.checkerWindow=new Ext.Window({title:"Soundness Checker",autoScroll:true,width:"500",tbar:[{text:"Check",handler:function(){this.checkerWindow.check()
}.bind(this)},{text:"Hide Errors",handler:function(){this.checkerWindow.getTree().getRootNode().reset()
}.bind(this)},"->",{text:"Close",handler:function(){this.checkerWindow.close()
}.bind(this)}],getTree:function(){return this.items.get(0)
},check:function(g){this.prepareCheck(g);
this.checkSyntax(this.checkSoundness.bind(this))
},prepareCheck:function(h){var g=this.getTree().getRootNode();
g.reset();
Ext.each(g.childNodes,function(j){if(h){j.expand(true)
}j.collapse(true);
j.setIcon(b.LOADING_STATUS)
})
},checkSyntax:function(g){d.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,onErrors:function(){Ext.Msg.alert("Syntax Check","Some syntax errors have been found, please correct them!");
this.turnLoadingIntoUnknownStatus()
}.bind(this),onNoErrors:function(){g()
}})
},turnLoadingIntoUnknownStatus:function(){Ext.each(this.getTree().getRootNode().childNodes,function(g){if(g.getIcon().search(b.LOADING_STATUS)>-1){g.setIcon(b.UNKNOWN_STATUS)
}})
},checkSoundness:function(){var g=this.getTree().getRootNode();
if(!g.findChild("id","structuralSound").check()){this.turnLoadingIntoUnknownStatus();
return
}Ext.Ajax.request({url:ORYX.CONFIG.ROOT_PATH+"checksoundness",method:"POST",success:function(j){var h=Ext.decode(j.responseText);
g.showErrors(h.errors);
if(h.errors.length===0){g.findChild("id","sound").check(h);
g.findChild("id","weakSound").check(h);
g.findChild("id","relaxedSound").check(h)
}},failure:function(){},params:{data:d.getSerializedDOM()}})
},items:[new Ext.tree.TreePanel({useArrows:true,autoScroll:true,rootVisible:false,animate:true,containerScroll:true,root:new b({text:"Checks",id:"source",expanded:true}),listeners:{render:function(k){var h=new b({text:"Structural Sound (Workflow Net)",id:"structuralSound",check:function(){this.checkInitialNode.update();
this.checkFinalNode.update();
this.checkConnectedNode.update(this.checkInitialNode.initialNodes,this.checkFinalNode.finalNodes);
if(this.checkInitialNode.hasErrors()||this.checkFinalNode.hasErrors()||this.checkConnectedNode.hasErrors()){this.setIcon(b.ERROR_STATUS);
this.expand();
return false
}else{this.setIcon(b.OK_STATUS);
return true
}},checkInitialNode:new b({qtip:"There must be exactly one initial place, which is the only place without any incoming edges.",update:function(){this.initialNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(m){if(m.getIncomingShapes().length==0&&m.getStencil().id().search(/Place/)>-1){this.initialNodes.push(m)
}}.bind(this));
this.setText(this.initialNodes.length+" initial places found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(m){m.reset();
this.showOverlay(this.initialNodes)
},hasErrors:function(){return this.initialNodes.length!==1
}}),checkFinalNode:new b({qtip:"There must be exactly one final place, which is the only place without any outgoing edges.",update:function(){this.finalNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(m){if(m.getOutgoingShapes().length==0&&m.getStencil().id().search(/Place/)>-1){this.finalNodes.push(m)
}}.bind(this));
this.setText(this.finalNodes.length+" final places found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(m){m.reset();
this.showOverlay(this.finalNodes)
},hasErrors:function(){return this.finalNodes.length!==1
}}),checkConnectedNode:new b({qtip:"Each node in the process model is on the path from the initial node to the final node.",update:function(n,m){if(n.length!==1||m.length!==1){this.setText("There must be exactly one initial and final place to perform further checks!");
this.setIcon(b.UNKNOWN_STATUS);
return
}this.notParticipatingNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(o){if(o instanceof ORYX.Core.Node){this.notParticipatingNodes.push(o)
}}.bind(this));
this.passedNodes=[];
this.findNotParticipatingNodes(n[0]);
this.setText(this.notParticipatingNodes.length+" nodes that aren't on any path from beginning to end found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(m){m.reset();
this.showOverlay(this.notParticipatingNodes)
},findNotParticipatingNodes:function(m){this.passedNodes.push(m);
this.notParticipatingNodes.remove(m);
Ext.each(m.getOutgoingShapes(),function(n){if(!this.passedNodes.include(n)){this.findNotParticipatingNodes(n)
}}.bind(this))
},hasErrors:function(){return this.notParticipatingNodes.length!==0
}})});
h.appendChild([h.checkInitialNode,h.checkFinalNode,h.checkConnectedNode]);
var g=new b({text:"Sound",id:"sound",check:function(m){if(m.isSound){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.deadTransitionsNode.update(m.deadTransitions);
this.improperTerminatingsNode.update(m.improperTerminatings);
this.deadLocksNode.update(m.deadLocks)
},deadTransitionsNode:new a({}),improperTerminatingsNode:new f({}),deadLocksNode:new c({})});
g.appendChild([g.deadTransitionsNode,g.improperTerminatingsNode,g.deadLocksNode]);
var l=new b({text:"Weak Sound",id:"weakSound",check:function(m){if(m.isWeakSound){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.improperTerminatingsNode.update(m.improperTerminatings);
this.deadLocksNode.update(m.deadLocks)
},deadTransitionsNode:new a({}),improperTerminatingsNode:new f({}),deadLocksNode:new c({})});
l.appendChild([l.improperTerminatingsNode,l.deadLocksNode]);
var j=new b({text:"Relaxed Sound",id:"relaxedSound",check:function(m){if(m.isRelaxedSound){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.notParticipatingTransitionsNode.update(m.notParticipatingTransitions)
},notParticipatingTransitionsNode:new e({})});
j.appendChild([j.notParticipatingTransitionsNode]);
k.getRootNode().appendChild([h,g,l,j])
}}})],listeners:{close:function(g){this.checkerWindow.getTree().getRootNode().reset()
}.bind(this)}});
this.checkerWindow.show();
this.checkerWindow.check(true)
}});
Ext.ns("Oryx.Plugins");
ORYX.Plugins.BPMNImport=Clazz.extend({converterUrl:ORYX.CONFIG.ROOT_PATH+"bpmn2pn",construct:function(a){this.facade=a;
this.importBpmn()
},getParamFromUrl:function(b){b=b.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
var a="[\\?&]"+b+"=([^&#]*)";
var d=new RegExp(a);
var c=d.exec(window.location.href);
if(c==null){return null
}else{return c[1]
}},bpmnToPn:function(a){Ext.Msg.updateProgress(0.66,ORYX.I18N.BPMN2PNConverter.progress.convertingModel);
Ext.Ajax.request({url:this.converterUrl,method:"POST",success:function(b){try{var f=new DOMParser();
Ext.Msg.updateProgress(1,ORYX.I18N.BPMN2PNConverter.progress.renderingModel);
var d=f.parseFromString(b.responseText,"text/xml");
this.facade.importERDF(d)
}catch(c){Ext.Msg.alert("Rendering Failed :\n"+c)
}Ext.Msg.hide()
}.createDelegate(this),failure:function(){Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error,ORYX.I18N.BPMN2PNConverter.errors.server)
},params:{rdf:a}})
},importBpmn:function(){var a=this.getParamFromUrl("importBPMN");
if(!a){return
}Ext.Msg.progress(ORYX.I18N.BPMN2PNConverter.progress.status,ORYX.I18N.BPMN2PNConverter.progress.importingModel);
Ext.Msg.updateProgress(0.33,ORYX.I18N.BPMN2PNConverter.progress.fetchingModel);
Ext.Ajax.request({url:this.getRdfUrl(a),success:function(b){var c=b.responseText;
this.bpmnToPn(c)
}.createDelegate(this),failure:function(b){Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error,ORYX.I18N.BPMN2PNConverter.errors.noRights)
},method:"GET"})
},getRdfUrl:function(a){return a.replace(/\/self(\/)?$/,"/rdf")
}});
ORYX.Plugins.PNExport=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.BPMN2PNConverter.name,functionality:this.exportIt.bind(this),group:ORYX.I18N.BPMN2PNConverter.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_convert.png",description:ORYX.I18N.BPMN2PNConverter.desc,index:3,minShape:0,maxShape:0})
},exportIt:function(){var a="";
if(!location.hash.slice(1)){Ext.Msg.alert(ORYX.I18N.BPMN2PNConverter.error,ORYX.I18N.BPMN2PNConverter.errors.notSaved);
return
}else{a="/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/rdf"
}this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT});
this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,context:"bpmn2pn",onNoErrors:function(){this.openPetriNetEditor(a)
}.bind(this)})
},openPetriNetEditor:function(a){window.open("/backend/poem/new?stencilset=/stencilsets/petrinets/petrinet.json&importBPMN="+a)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SimplePnmlexport=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.SimplePnmlexport.name,functionality:this.exportIt.bind(this),group:ORYX.I18N.SimplePnmlexport.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_gear.png",description:ORYX.I18N.SimplePnmlexport.desc,index:1,minShape:0,maxShape:0});
this.facade.offer({name:"PNML For LOLA",functionality:this.exportIt.bind(this,true),group:ORYX.I18N.SimplePnmlexport.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_gear.png",description:ORYX.I18N.SimplePnmlexport.desc,index:1,minShape:0,maxShape:0})
},exportIt:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE});
window.setTimeout((function(){this.exportSynchronously(a);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}).bind(this),10);
return true
},exportSynchronously:function(e){var d=location.href;
var b="none";
if(e){b="lola"
}try{var c=this.getRDFFromDOM();
if(!c.startsWith("<?xml")){c='<?xml version="1.0" encoding="UTF-8"?>'+c
}new Ajax.Request(ORYX.CONFIG.SIMPLE_PNML_EXPORT_URL,{method:"POST",asynchronous:false,parameters:{resource:d,data:c,tool:b},onSuccess:function(f){this.openDownloadWindow(window.document.title+".xml",f.responseText)
}.bind(this)})
}catch(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,a)
}}});
Ext.namespace("ORYX.Plugins");
ORYX.Plugins.AbstractStepThroughPlugin=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.StepThroughPlugin.stepThrough,functionality:this.load.bind(this),group:ORYX.I18N.StepThroughPlugin.group,icon:ORYX.PATH+"images/control_play.png",description:ORYX.I18N.StepThroughPlugin.stepThroughDesc,index:1,toggle:true,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.StepThroughPlugin.undo,functionality:this.undo.bind(this),group:ORYX.I18N.StepThroughPlugin.group,icon:ORYX.PATH+"images/control_rewind.png",description:ORYX.I18N.StepThroughPlugin.undoDesc,index:2,minShape:0,maxShape:0})
},showEnabled:function(a,b){if(!(a instanceof ORYX.Core.Shape)){return
}else{if(this.isOrSplit(a)){this.showEnabledOrSplit(a);
return
}}this.showPlayOnShape(a)
},showPlayOnShape:function(b){var a;
if(b instanceof ORYX.Core.Edge){a={stroke:"green"}
}else{a={fill:"green"}
}var c=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["path",{title:"Click the element to execute it!","stroke-width":2,stroke:"black",d:"M0,-5 L5,0 L0,5 Z","line-captions":"round"}]);
this.showOverlayOnShape(b,a,c)
},showOverlayOnShape:function(b,a,c){this.hideOverlayOnShape(b);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"st."+b.resourceId,shapes:[b],attributes:a,node:(c?c:null),nodePosition:b instanceof ORYX.Core.Edge?"END":"SE"})
},hideOverlayOnShape:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"st."+a.resourceId})
},hideOverlays:function(a){var b=this.facade.getCanvas().getChildShapes(true);
var c;
for(i=0;
i<b.size();
i++){c=b[i];
if(!(a&&this.isStartNode(c))){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"st."+c.resourceId})
}}},load:function(a,b){this.initializeLoadButton(a,b);
this.togglePlugin(b)
},togglePlugin:function(a){if(a){this.initialMarking=[];
if(this.getDiagramType()==="epc"){this.prepareInitialMarking()
}else{this.startAndCheckSyntax()
}}else{this.executionTrace="";
this.rdf=undefined;
this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT});
this.onDeactivate()
}if(this.active()){this.callback=this.doMouseUp.bind(this);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,this.callback)
}else{this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,this.callback);
this.callback=undefined
}},onDeactivate:function(){this.hideOverlays()
},initializeLoadButton:function(b,c){if(this.loadButton!==b){var a=function(d){if(d){this.facade.disableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN)
}else{this.facade.enableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN)
}}.createDelegate(this);
b.on("toggle",function(d,e){a(e)
});
a(b,c)
}this.loadButton=b
},active:function(){return this.loadButton?this.loadButton.pressed:false
},onSelectionChanged:function(){if(this.active()&&this.facade.getSelection().length>0){this.facade.setSelection([])
}},getDiagramType:function(){switch(this.facade.getCanvas().getStencil().namespace()){case"http://b3mn.org/stencilset/epc#":return"epc";
case"http://b3mn.org/stencilset/bpmn#":return"bpmn";
default:return null
}},showUsed:function(b,c){if(!(b instanceof ORYX.Core.Shape)){return
}var a;
if(b instanceof ORYX.Core.Edge){a={stroke:"mediumslateblue"}
}else{a={fill:"mediumslateblue"}
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"st."+b.resourceId});
if(c!="-1"&&c!="1"){var d=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{style:"font-size: 16px; font-weight: bold;"},c]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"st."+b.resourceId,shapes:[b],attributes:a,node:d,nodePosition:b instanceof ORYX.Core.Edge?"END":"SE"})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"st."+b.resourceId,shapes:[b],attributes:a})
}}});
ORYX.Plugins.PetriNetStepThroughPlugin=ORYX.Plugins.AbstractStepThroughPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments)
},startAndCheckSyntax:function(){this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,onErrors:function(){Ext.Msg.alert("Syntax Check","Some syntax errors have been found, please correct them!")
}.bind(this),onNoErrors:function(){if(this.initializeMarking()){this.firedTransitions=[];
this.showEnabledTransition()
}else{this.togglePlugin(false)
}}.bind(this)})
},initializeMarking:function(){var b=function(d,c){if(c==0){d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","0")
}else{if(c==1){d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","1")
}else{if(c==2){d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","2")
}else{if(c==3){d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","3")
}else{if(c==4){d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","4")
}else{var e=parseInt(c,10);
if(e&&e>0){d.setProperty("oryx-numberoftokens_text",""+e);
d.setProperty("oryx-numberoftokens_drawing","0")
}else{d.setProperty("oryx-numberoftokens_text","");
d.setProperty("oryx-numberoftokens_drawing","0")
}}}}}}};
this.getPlaces().each(function(c){if("undefined"==typeof(c._setProperty_monkey)){c._setProperty_monkey=c.setProperty;
c.setProperty=function(e,d){if("oryx-numberoftokens"==e){b(c,d)
}c._setProperty_monkey.apply(c,arguments)
}}});
var a=0;
this.getPlaces().each(function(c){var d=parseInt(c.properties["oryx-numberoftokens"]);
if(isNaN(d)){c.setProperty("oryx-numberoftokens",0)
}else{if(d>0){a+=d
}}});
if(0==a){this.getPlaces().each(function(c){if(c.getIncomingShapes().length==0){c.setProperty("oryx-numberoftokens",1)
}});
Ext.Msg.show({title:"No Tokens Found",msg:"Current marking of the Petri net doesn't contain any token. Tokens are added to the initial places of the net.",buttons:Ext.Msg.OK,icon:Ext.MessageBox.INFO})
}if(a>3){Ext.Msg.show({title:"Too Many Tokens On Place",msg:"Places with more than 3 tokens aren't supported yet. Please avoid this scenario.",buttons:Ext.Msg.OK,icon:Ext.MessageBox.WARNING})
}return true
},doMouseUp:function(c,a){if(!(this.isTransition(a))){return
}var b=this.getIncomingNodes(a).all(function(d){return parseInt(d.properties["oryx-numberoftokens"])>0
});
if(b){this.fireTransition(a)
}this.showEnabledTransition()
},onDeactivate:function(){this.hideOverlays();
while(this.firedTransitions.length!==0){this.undoLastFiredTransition()
}this.facade.getCanvas().update();
this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT})
},fireTransition:function(a){this.firedTransitions.push(a);
this.getIncomingNodes(a).each(function(b){this.removeToken(b)
}.bind(this));
this.getOutgoingNodes(a).each(function(b){this.addToken(b)
}.bind(this))
},undoLastFiredTransition:function(){var a=this.firedTransitions.pop();
if(!a){return
}this.getIncomingNodes(a).each(function(b){this.addToken(b)
}.bind(this));
this.getOutgoingNodes(a).each(function(b){this.removeToken(b)
}.bind(this))
},removeToken:function(a){a.setProperty("oryx-numberoftokens",parseInt(a.properties["oryx-numberoftokens"])-1)
},addToken:function(a){var b=parseInt(a.properties["oryx-numberoftokens"])+1;
a.setProperty("oryx-numberoftokens",b);
if(b>3){Ext.Msg.show({title:"Too Many Tokens On Place",msg:"Places with more than 3 tokens aren't supported yet. Please avoid this scenario.",buttons:Ext.Msg.OK,icon:Ext.MessageBox.WARNING})
}},showEnabledTransition:function(){this.hideOverlays();
this.firedTransitions.each(function(a){this.showUsed(a,"1")
}.bind(this));
this.getEnabledTransitions().each(function(a){this.showPlayOnShape(a)
}.bind(this));
this.facade.getCanvas().update()
},getTransitions:function(){return this.facade.getCanvas().getChildShapes().select(function(a){return this.isTransition(a)
}.bind(this))
},isTransition:function(a){return a instanceof ORYX.Core.Shape&&a.getStencil().id().search(/Transition/)>-1
},getPlaces:function(){return this.facade.getCanvas().getChildShapes().select(function(a){return a.getStencil().id().search(/Place/)>-1
})
},getIncomingNodes:function(a){return a.getIncomingShapes().collect(function(b){return b.getIncomingShapes()
}).flatten()
},getOutgoingNodes:function(a){return a.getOutgoingShapes().collect(function(b){return b.getOutgoingShapes()
}).flatten()
},getEnabledTransitions:function(){return this.getTransitions().select(function(a){return this.getIncomingNodes(a).all(function(b){return parseInt(b.properties["oryx-numberoftokens"])>0
})
}.bind(this))
},undo:function(){this.undoLastFiredTransition();
this.showEnabledTransition()
}});
ORYX.Plugins.StepThroughPlugin=ORYX.Plugins.AbstractStepThroughPlugin.extend({construct:function(a){this.el=undefined;
this.callback=undefined;
this.executionTrace="";
this.rdf=undefined;
arguments.callee.$.construct.apply(this,arguments)
},prepareInitialMarking:function(){this.startNodes=[];
Ext.each(this.facade.getCanvas().getChildShapes(true),function(a){if(this.isStartNode(a)){this.startNodes.push(a);
a.initialMarkingFired=false;
this.showPlayOnShape(a);
if(a.getOutgoingShapes().size()==1){this.showOverlayOnShape(a.getOutgoingShapes()[0],{stroke:"green"});
a.getOutgoingShapes()[0].initialMarking=true
}}}.createDelegate(this))
},isStartNode:function(a){return(a.getStencil().id().search(/#Event$/)>-1)&&a.getIncomingShapes().length==0&&a.getOutgoingShapes().length==1
},isStartArc:function(a){return this.isStartNode(a.getIncomingShapes()[0])
},isStartArcOrNode:function(a){return this.isStartNode(a)||this.isStartArc(a)
},generateRDF:function(){try{var b=this.getRDFFromDOM();
b=!b.startsWith("<?xml")?'<?xml version="1.0" encoding="UTF-8"?>'+b:b
}catch(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,a)
}this.rdf=b
},getRDF:function(){if(this.rdf==undefined){this.generateRDF()
}return this.rdf
},startAndCheckSyntax:function(){this.postExecutionTrace({checkSyntax:true,onlyChangedObjects:false,onSuccess:function(a){if(a.responseText.startsWith("{")){var b=Ext.decode(a.responseText).syntaxErrors;
this.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT,errors:b})
}else{this.showObjectStates(a.responseText)
}}.bind(this)})
},fireObject:function(a){this.executionTrace+=a+";";
if(this.isOrSplit(this.el)){this.executionTrace=this.executionTrace.substring(0,this.executionTrace.length-1);
this.executionTrace+="#";
var c=new Ext.util.MixedCollection();
c.addAll(this.el.getOutgoingShapes());
var b=[];
c.filter("selectedForOrSplit","true").each(function(d){b.push(d.resourceId)
}.createDelegate(this));
c.each(function(d){d.selectedForOrSplit=false;
this.hideOverlayOnShape(d)
}.createDelegate(this));
this.executionTrace+=b.join(",")+";"
}this.postExecutionTrace({checkSyntax:false,onlyChangedObjects:true,onSuccess:function(d){if(d.responseText!=""){this.showObjectStates(d.responseText)
}else{this.removeLastFiredObject()
}}.bind(this)})
},doMouseUp:function(d,a){if(a instanceof ORYX.Core.Shape){if(a instanceof ORYX.Core.Edge&&this.isOrSplit(a.getIncomingShapes()[0])){this.doMouseUpOnEdgeComingFromOrSplit(a)
}else{if(a instanceof ORYX.Core.Edge&&this.getDiagramType()==="epc"&&this.isStartNode(a.getIncomingShapes()[0])){this.doMouseUpOnEdgeComingFromStartNode(a)
}else{if(this.getDiagramType()==="epc"&&this.isStartNode(a)){a.initialMarkingFired=true;
var c=a.getOutgoingShapes()[0];
this.hideOverlayOnShape(c);
if(c.initialMarking){this.showUsed(a,"1");
this.initialMarking.push(a.resourceId)
}else{this.hideOverlayOnShape(a)
}var b=true;
Ext.each(this.startNodes,function(e){if(!e.initialMarkingFired){b=false
}});
if(b){this.startAndCheckSyntax()
}}else{this.el=a;
this.fireObject(this.el.resourceId)
}}}}},showObjectStates:function(d){var a=d.split(";");
for(i=0;
i<a.size();
i++){var b=a[i].split(",");
if(b.size()<3){continue
}var c=this.facade.getCanvas().getChildShapeByResourceId(b[0]);
if(b[2]=="t"){this.showEnabled(c,b[1])
}else{if(b[1]!="0"){this.showUsed(c,b[1])
}else{this.hideOverlayOnShape(c)
}}}},doMouseUpOnEdgeComingFromOrSplit:function(b){var a=b.getIncomingShapes()[0];
if(b.selectedForOrSplit){this.showOverlayOnShape(b,{stroke:"orange"});
var c=new Ext.util.MixedCollection();
c.addAll(a.getOutgoingShapes());
if(c.filter("selectedForOrSplit","true").length<=1){this.hideOverlayOnShape(a)
}}else{this.showOverlayOnShape(b,{stroke:"green"});
this.showPlayOnShape(a)
}b.selectedForOrSplit=!b.selectedForOrSplit
},doMouseUpOnEdgeComingFromStartNode:function(a){a.initialMarking=!a.initialMarking;
if(a.initialMarking){this.showOverlayOnShape(a,{stroke:"green"})
}else{this.showOverlayOnShape(a,{stroke:"orange"})
}},isOrSplit:function(a){return(a.getStencil().id().search(/#(OR_Gateway|OrConnector)$/)>-1)&&(a.getOutgoingShapes().length>1)
},showEnabledOrSplit:function(a){Ext.each(a.getOutgoingShapes(),function(b){Ext.apply(b,{selectedForOrSplit:false});
this.showOverlayOnShape(b,{stroke:"orange"})
}.createDelegate(this))
},removeLastFiredObject:function(){this.executionTrace=this.executionTrace.replace(/[^;]*;$/,"")
},undo:function(){if(!this.active()){return
}if(this.executionTrace!==""){this.removeLastFiredObject();
this.postExecutionTrace({checkSyntax:false,onlyChangedObjects:false,onSuccess:function(a){this.hideOverlays(true);
this.showObjectStates(a.responseText)
}.bind(this)})
}else{if(this.getDiagramType()==="epc"){this.hideOverlays();
this.prepareInitialMarking()
}}},postExecutionTrace:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.StepThroughPlugin.executing});
new Ajax.Request(ORYX.CONFIG.STEP_THROUGH,{method:"POST",asynchronous:false,parameters:{rdf:this.getRDF(),checkSyntax:a.checkSyntax,fire:this.executionTrace,onlyChangedObjects:a.onlyChangedObjects,initialMarking:this.initialMarking.join(";")},onSuccess:function(b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
a.onSuccess(b)
}.createDelegate(this),onFailure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}.createDelegate(this)})
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SyntaxChecker=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.active=false;
this.raisedEventIds=[];
this.facade.offer({name:ORYX.I18N.SyntaxChecker.name,functionality:this.perform.bind(this),group:ORYX.I18N.SyntaxChecker.group,icon:ORYX.PATH+"images/checker_syntax.png",description:ORYX.I18N.SyntaxChecker.desc,index:0,toggle:true,minShape:0,maxShape:0});
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,this.checkForErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT,this.resetErrors.bind(this));
this.facade.registerOnEvent(ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT,this.doShowErrors.bind(this))
},perform:function(a,b){if(!b){this.resetErrors()
}else{this.checkForErrors({onNoErrors:function(){this.setActivated(a,false);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.noErrors,timeout:10000})
}.bind(this),onErrors:function(){this.enableDeactivationHandler(a)
}.bind(this),onFailure:function(){this.setActivated(a,false);
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SyntaxChecker.invalid)
}.bind(this)})
}},enableDeactivationHandler:function(a){var b=function(){this.setActivated(a,false);
this.resetErrors();
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b)
};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,b.bind(this))
},setActivated:function(b,a){b.toggle(a);
if(a===undefined){this.active=!this.active
}else{this.active=a
}},checkForErrors:function(a){Ext.applyIf(a||{},{showErrors:true,onErrors:Ext.emptyFn,onNoErrors:Ext.emptyFn,onFailure:Ext.emptyFn});
Ext.Msg.wait(ORYX.I18N.SyntaxChecker.checkingMessage);
var b=this.facade.getStencilSets();
var d=null;
var c=false;
if(b.keys().include("http://b3mn.org/stencilset/bpmn2.0#")||b.keys().include("http://b3mn.org/stencilset/bpmn2.0conversation#")){d=this.facade.getSerializedJSON();
c=true
}else{d=this.getRDFFromDOM()
}new Ajax.Request(ORYX.CONFIG.SYNTAXCHECKER_URL,{method:"POST",asynchronous:false,parameters:{resource:location.href,data:d,context:a.context,isJson:c},onSuccess:function(e){var f=(e&&e.responseText?e.responseText:"{}").evalJSON();
Ext.Msg.hide();
if(f instanceof Object){f=$H(f);
if(f.size()>0){if(a.showErrors){this.showErrors(f)
}a.onErrors()
}else{a.onNoErrors()
}}else{a.onFailure()
}}.bind(this),onFailure:function(){Ext.Msg.hide();
a.onFailure()
}})
},doShowErrors:function(b,a){this.showErrors(b.errors)
},showErrors:function(a){if(!(a instanceof Hash)){a=new Hash(a)
}a.keys().each(function(c){var b=this.facade.getCanvas().getChildShapeByResourceId(c);
if(b){this.raiseOverlay(b,this.parseCodeToMsg(a[c]))
}}.bind(this));
this.active=!this.active;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.SyntaxChecker.notice,timeout:10000})
},parseCodeToMsg:function(e){var f=e.replace(/: /g,"<br />").replace(/, /g,"<br />");
var a=f.split("<br />");
for(var b=0;
b<a.length;
b++){var d=a[b];
var c=this.parseSingleCodeToMsg(d);
if(d!=c){f=f.replace(d,c)
}}return f
},parseSingleCodeToMsg:function(a){return ORYX.I18N.SyntaxChecker[a]||a
},resetErrors:function(){this.raisedEventIds.each(function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:a})
}.bind(this));
this.raisedEventIds=[];
this.active=false
},raiseOverlay:function(a,b){var f="syntaxchecker."+this.raisedEventIds.length;
var d=ORYX.Editor.provideId();
var e=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["path",{id:d,title:"","stroke-width":5,stroke:"red",d:"M20,-5 L5,-20 M5,-5 L20,-20","line-captions":"round"}]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:f,shapes:[a],node:e,nodePosition:a instanceof ORYX.Core.Edge?"START":"NW"});
var c=new Ext.ToolTip({showDelay:50,html:b,target:d});
this.raisedEventIds.push(f);
return e
}});
ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT="checkForErrors";
ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT="resetErrors";
ORYX.Plugins.SyntaxChecker.SHOW_ERRORS_EVENT="showErrors";
ORYX.Plugins.PetrinetSyntaxChecker=ORYX.Plugins.SyntaxChecker.extend({getRDFFromDOM:function(){return this.facade.getERDF()
}});
Ext.ns("Oryx.Plugins");
ORYX.Plugins.LolaPetriNetSoundnessChecker=ORYX.Plugins.AbstractPlugin.extend({hideOverlays:function(){if(!this.overlayIds){return
}Ext.each(this.overlayIds,function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:a})
}.bind(this))
},getChildShapesByResourceIds:function(b){var a=[];
Ext.each(b,function(c){a.push(this.facade.getCanvas().getChildShapeByResourceId(c))
}.bind(this));
return a
},showOverlay:function(a,b,e,c){if(!this.overlayIds){this.overlayIds=[]
}if(!(a instanceof Array)){a=[a]
}a=a.map(function(f){var g=f;
if(typeof f=="string"){g=this.facade.getCanvas().getChildShapeByResourceId(f);
g=g||this.facade.getCanvas().getChildById(f,true)
}return g
}.bind(this)).compact();
var d=this.type+ORYX.Editor.provideId();
this.overlayIds.push(d);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:d,shapes:a,attributes:b,node:e,nodePosition:c||"NW"})
},construct:function(a){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:"Check soundness",functionality:this.showCheckerWindow.bind(this),group:"Verification",icon:ORYX.PATH+"images/soundness_checker/accept.png",description:"Checks current Petri net for different soundness criteria with LoLA.",index:3,minShape:0,maxShape:0})
},showCheckerWindow:function(){var d=this;
var b=Ext.extend(Ext.tree.TreeNode,{constructor:function(h){if(!h.icon&&!this.icon){h.icon=b.UNKNOWN_STATUS
}b.superclass.constructor.apply(this,arguments);
Ext.apply(this,h);
if(this.clickHandler){this.on("click",this.clickHandler.bind(this))
}},setIcon:function(h){this.ui.getIconEl().src=h
},getIcon:function(h){return this.ui.getIconEl().src
},reset:function(){d.hideOverlays();
this.hideMarking();
d.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.RESET_ERRORS_EVENT})
},hideMarking:function(){if(!d.marking){return
}for(place in d.marking){var h=d.facade.getCanvas().getChildShapeByResourceId(place);
if(h){h.setProperty("oryx-numberoftokens",0)
}}d.facade.getCanvas().update();
d.marking=undefined
},showMarking:function(j){d.marking=j;
for(place in j){var h=d.facade.getCanvas().getChildShapeByResourceId(place);
h.setProperty("oryx-numberoftokens",j[place])
}d.facade.getCanvas().update()
},showErrors:function(h){Ext.each(this.childNodes,function(j){if(j&&j.itemCls==="error"){j.remove()
}});
Ext.each(this.childNodes,function(j){if(j.getIcon().search(b.LOADING_STATUS)>-1){j.setIcon(b.UNKNOWN_STATUS)
}});
Ext.each(h,function(j){this.insertBefore(new b({icon:b.ERROR_STATUS,text:j,itemCls:"error"}),this.childNodes[0])
}.bind(this))
},showOverlayWithStep:function(h){Ext.each(h,function(k,j){d.showOverlay(d.facade.getCanvas().getChildShapeByResourceId(k),{fill:"#FB7E02"},ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{style:"font-size: 16px; font-weight: bold;"},(j+1)+"."]),"SE")
})
},showOverlayMarking:function(h){Ext.each(h,function(l,j){var k=l.split(":");
d.showOverlay(d.facade.getCanvas().getChildShapeByResourceId(k[0].trim()),{fill:"#FB7E02"},ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{style:"font-size: 16px; font-weight: bold;"},(k[1])]),"SE")
})
},showOverlay:function(h){if(h.length===0){return
}if(!h[0] instanceof ORYX.Core.Node){h=d.getChildShapesByResourceIds(h)
}d.showOverlay(h,{fill:"#FB7E02"})
}});
b.UNKNOWN_STATUS=ORYX.PATH+"images/soundness_checker/asterisk_yellow.png";
b.ERROR_STATUS=ORYX.PATH+"images/soundness_checker/exclamation.png";
b.OK_STATUS=ORYX.PATH+"images/soundness_checker/accept.png";
b.LOADING_STATUS=ORYX.PATH+"images/soundness_checker/loading.gif";
var f=Ext.extend(b,{constructor:function(h){h.qtip="<b>Weak Termination</b>: Makes sure that from any state, reachable from the initial state, the final state well eventually be reached.";
f.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
this.showOverlayMarking(this.marking)
},update:function(h){this.marking=h.counter?h.counter.split(","):[];
this.setIcon(h.liveness?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There is "+(h.liveness?"no":"a")+" marking from which one cannot reach the final state.")
}});
var g=Ext.extend(b,{constructor:function(h){h.qtip="<b>Boundedness Criteria</b>: There are not unbounded places in the net. If any unbounded places are detected, click to show one counter example.";
g.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
this.showOverlay(this.unboundedplaces)
},update:function(h){this.unboundedplaces=h.unboundedplaces;
if(h.boundedness){this.unboundedplaces=[]
}this.setIcon(h.boundedness?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.unboundedplaces.length+" unbounded places.")
}});
var a=Ext.extend(b,{constructor:function(h){h.qtip="<b>No Dead Transitions Criteria</b>: Each transition can contribute to at least one process instance. Click to see all dead transitions.";
a.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
this.showOverlay(this.deadTransitions)
},update:function(h){this.deadTransitions=h.deadtransitions;
if(h.quasiliveness){this.deadTransitions=[]
}this.setIcon(this.deadTransitions.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.deadTransitions.length+" dead transitions.")
}});
var e=Ext.extend(b,{constructor:function(h){h.qtip="<b>Transition Participation Criteria</b>: Each transition participates in at least one process instance that starts in the initial state and reaches the final state. Click to see all transitions not participating in any process instance.";
e.superclass.constructor.apply(this,arguments)
},clickHandler:function(h){h.reset();
this.showOverlay(this.notParticipatingTransitions)
},update:function(h){this.notParticipatingTransitions=h.uncoveredtransitions;
this.setIcon(this.notParticipatingTransitions.length==0?b.OK_STATUS:b.ERROR_STATUS);
this.setText("There are "+this.notParticipatingTransitions.length+" transitions that cannot participate in a properly terminating firing sequence.")
}});
var c=new Object;
c.html='<a href="http://www.service-technology.org/"><img src="images/service_tech_site_banner.png" width="400" style="position: relative; left: 35px;"/></a>';
this.checkerWindow=new Ext.Window({title:"Soundness Checker powered by service-technology.org",autoScroll:true,width:"500",tbar:[{text:"Check",handler:function(){this.checkerWindow.check()
}.bind(this)},{text:"Hide Errors",handler:function(){this.checkerWindow.getTree().getRootNode().reset()
}.bind(this)},"->",{text:"Close",handler:function(){this.checkerWindow.close()
}.bind(this)}],getTree:function(){return this.items.get(0)
},check:function(h){this.prepareCheck(h);
this.checkSyntax(this.checkSoundness.bind(this),this.reRender.bind(this))
},reRender:function(){window.setTimeout(function(){this.getResizeEl().beforeAction();
this.getResizeEl().sync(true)
}.bind(this),70)
},prepareCheck:function(j){var h=this.getTree().getRootNode();
h.reset();
Ext.each(h.childNodes,function(k){if(j){k.expand(true)
}k.collapse(true);
k.setIcon(b.LOADING_STATUS)
})
},checkSyntax:function(j,h){d.facade.raiseEvent({type:ORYX.Plugins.SyntaxChecker.CHECK_FOR_ERRORS_EVENT,onErrors:function(){Ext.Msg.alert("Syntax Check","Some syntax errors have been found, please correct them!");
this.turnLoadingIntoUnknownStatus();
h()
}.bind(this),onNoErrors:function(){j();
h()
}})
},turnLoadingIntoUnknownStatus:function(){Ext.each(this.getTree().getRootNode().childNodes,function(h){if(h.getIcon().search(b.LOADING_STATUS)>-1){h.setIcon(b.UNKNOWN_STATUS)
}})
},checkSoundness:function(){var h=this.getTree().getRootNode();
if(!h.findChild("id","structuralSound").check()){this.turnLoadingIntoUnknownStatus();
return
}var j=d.getRDFFromDOM();
if(!j.startsWith("<?xml")){j='<?xml version="1.0" encoding="UTF-8"?>'+j
}Ext.Ajax.request({url:ORYX.CONFIG.ROOT_PATH+"lola",method:"POST",success:function(l){var k=Ext.decode(l.responseText);
h.showErrors(k.errors);
if(k.errors.length===0){h.findChild("id","sound").check(k);
h.findChild("id","weakSound").check(k);
h.findChild("id","relaxedSound").check(k)
}}.bind(this),failure:function(){}.bind(this),params:{data:j}})
},items:[new Ext.tree.TreePanel({useArrows:true,autoScroll:true,rootVisible:false,animate:true,containerScroll:true,root:new b({text:"Checks",id:"source",expanded:true}),listeners:{render:function(l){var j=new b({text:"Structural Sound (Workflow Net)",id:"structuralSound",check:function(){this.checkInitialNode.update();
this.checkFinalNode.update();
this.checkConnectedNode.update(this.checkInitialNode.initialNodes,this.checkFinalNode.finalNodes);
if(this.checkInitialNode.hasErrors()||this.checkFinalNode.hasErrors()||this.checkConnectedNode.hasErrors()){this.setIcon(b.ERROR_STATUS);
this.expand();
return false
}else{this.setIcon(b.OK_STATUS);
return true
}},checkInitialNode:new b({qtip:"There must be exactly one initial place, which is the only place without any incoming edges.",update:function(){this.initialNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(n){if(n.getIncomingShapes().length==0&&n.getStencil().id().search(/Place/)>-1){this.initialNodes.push(n)
}}.bind(this));
this.setText(this.initialNodes.length+" initial places found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(n){n.reset();
this.showOverlay(this.initialNodes)
},hasErrors:function(){return this.initialNodes.length!==1
}}),checkFinalNode:new b({qtip:"There must be exactly one final place, which is the only place without any outgoing edges.",update:function(){this.finalNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(n){if(n.getOutgoingShapes().length==0&&n.getStencil().id().search(/Place/)>-1){this.finalNodes.push(n)
}}.bind(this));
this.setText(this.finalNodes.length+" final places found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(n){n.reset();
this.showOverlay(this.finalNodes)
},hasErrors:function(){return this.finalNodes.length!==1
}}),checkConnectedNode:new b({qtip:"Each node in the process model is on the path from the initial node to the final node.",update:function(o,n){if(o.length!==1||n.length!==1){this.setText("There must be exactly one initial and final place to perform further checks!");
this.setIcon(b.UNKNOWN_STATUS);
return
}this.notParticipatingNodes=[];
Ext.each(d.facade.getCanvas().getChildShapes(),function(p){if(p instanceof ORYX.Core.Node){this.notParticipatingNodes.push(p)
}}.bind(this));
this.passedNodes=[];
this.findNotParticipatingNodes(o[0]);
this.setText(this.notParticipatingNodes.length+" nodes that aren't on any path from beginning to end found.");
this.setIcon(!this.hasErrors()?b.OK_STATUS:b.ERROR_STATUS)
},clickHandler:function(n){n.reset();
this.showOverlay(this.notParticipatingNodes)
},findNotParticipatingNodes:function(n){this.passedNodes.push(n);
this.notParticipatingNodes.remove(n);
Ext.each(n.getOutgoingShapes(),function(o){if(!this.passedNodes.include(o)){this.findNotParticipatingNodes(o)
}}.bind(this))
},hasErrors:function(){return this.notParticipatingNodes.length!==0
}})});
j.appendChild([j.checkInitialNode,j.checkFinalNode,j.checkConnectedNode]);
var h=new b({text:"Sound",id:"sound",check:function(n){if(n.soundness){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.deadTransitionsNode.update(n);
this.boundednessNode.update(n);
this.livenessNode.update(n)
},deadTransitionsNode:new a({}),boundednessNode:new g({}),livenessNode:new f({}),});
h.appendChild([h.deadTransitionsNode,h.boundednessNode,h.livenessNode]);
var m=new b({text:"Weak Sound",id:"weakSound",check:function(n){if(n.weaksoundness){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.boundednessNode.update(n);
this.livenessNode.update(n)
},boundednessNode:new g({}),livenessNode:new f({}),});
m.appendChild([m.boundednessNode,m.livenessNode]);
var k=new b({text:"Relaxed Sound",id:"relaxedSound",check:function(n){if(n.relaxedsoundness){this.setIcon(b.OK_STATUS)
}else{this.setIcon(b.ERROR_STATUS);
this.expand()
}this.deadTransitionsNode.update(n);
this.notParticipatingTransitionsNode.update(n)
},deadTransitionsNode:new a({}),notParticipatingTransitionsNode:new e({})});
k.appendChild([k.notParticipatingTransitionsNode,k.deadTransitionsNode]);
l.getRootNode().appendChild([j,h,m,k])
}}}),c],listeners:{close:function(h){this.checkerWindow.getTree().getRootNode().reset()
}.bind(this)}});
this.checkerWindow.show();
this.checkerWindow.check(true)
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}ORYX.Plugins.ProcessLogGenerator=ORYX.Plugins.AbstractPlugin.extend({processLogGeneratorHandleURL:ORYX.PATH+"processloggenerator",construct:function(a){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.ProcessLogGenerator.generate,functionality:this.perform.bind(this),description:ORYX.I18N.ProcessLogGenerator.generateDescription,icon:ORYX.PATH+"images/processLogGeneratorIcon.png",index:0,minShape:0,maxShape:0})
},perform:function(){this.confirmed_petrinettimeandprobability_extension_missing=this.confirmed_petrinettimeandprobability_extension_missing||false;
if(!this.confirmed_petrinettimeandprobability_extension_missing){this.confirmed_petrinettimeandprobability_extension_missing=true;
var a=true;
this.facade.getStencilSets().values().each(function(b){b.extensions().values().each(function(c){if(c.namespace.match(/petrinettimeandpropability/)){a=false
}})
});
if(a){Ext.MessageBox.show({title:"Time and Probability Extension",msg:'<p>An exension for petrinets allows you to configure execution time and probability of transitions and thus further control the generated log for this model.<br/> To use this feature load the <strong>"Time and Probability Extension"</strong> from the stencil set extensions menu.</p><br/>Do you want to proceed anyways?',buttons:Ext.MessageBox.YESNO,fn:function(b){if("yes"==b){this.checkTokens()
}}.bind(this),animEl:"mb4",icon:Ext.MessageBox.QUESTION})
}else{this.checkTokens()
}}else{this.checkTokens()
}},checkTokens:function(){var a=this.getPlaces().any(function(b){var c=parseInt(b.properties["oryx-numberoftokens"]);
return !(isNaN(c)||c==0)
});
if(!a){Ext.MessageBox.show({title:"No Tokens",msg:"The net has no tokens, and thus cannot be executed. Generated logs will be empty.<br/>Do you want to proceed?",buttons:Ext.MessageBox.YESNO,fn:function(b){if("yes"==b){this.showDialog()
}}.bind(this),animEl:"mb4",icon:Ext.MessageBox.QUESTION})
}else{this.showDialog()
}},showDialog:function(){var a=this.createCompletenessSelector(),d=this.createNoiseField(),c=this.createTraceCountField(),b=this.createDialog();
this.addFormPanelToWindow(a,d,c,b);
b.show()
},getPlaces:function(){return this.facade.getCanvas().getChildShapes().select(function(a){return a.getStencil().id().search(/Place/)>-1
})
},createCompletenessSelector:function(){var b=[["None"],["Trace"],["Ordering"]],a=new Ext.data.SimpleStore({fields:["value"],data:b});
return new Ext.form.ComboBox({fieldLabel:ORYX.I18N.ProcessLogGenerator.completenessSelect,store:a,displayField:"value",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,forceSelection:true,value:this.completeness||"Trace",emptyText:ORYX.I18N.ProcessLogGenerator.pleaseSelect})
},createNoiseField:function(){return new Ext.form.NumberField({fieldLabel:ORYX.I18N.ProcessLogGenerator.degreeOfNoise,allowBlank:false,allowDecimals:false,value:this.noise||5,minValue:0,maxValue:100})
},createTraceCountField:function(){return new Ext.form.NumberField({fieldLabel:ORYX.I18N.ProcessLogGenerator.numberOfTraces,allowBlank:false,allowDecimals:false,value:this.tracecount||10,minValue:1,maxValue:10000})
},createDialog:function(){var a=new Ext.Window({autoCreate:true,title:ORYX.I18N.ProcessLogGenerator.preferencesWindowTitle,height:240,width:400,modal:true,collapsible:false,fixedcenter:true,shadow:true,style:"font-size:12px;",proxyDrag:true,resizable:true,items:[new Ext.form.Label({text:ORYX.I18N.ProcessLogGenerator.dialogDescription,style:"font-size:12px;"})]});
a.on("hide",function(){a.destroy(true)
});
return a
},addFormPanelToWindow:function(b,d,c,e){var a=new Ext.form.FormPanel({frame:false,defaultType:"textfield",waitMsgTarget:true,labelAlign:"left",buttonAlign:"right",enctype:"multipart/form-data",style:"font-size:12px;",monitorValid:true,items:[b,d,c],buttons:[{text:"Submit",formBind:true,handler:function(){this.completeness=b.getValue();
this.noise=d.getValue();
this.tracecount=c.getValue();
this.generateLog({completeness:this.completeness,noise:this.noise,traceCount:this.tracecount});
e.hide()
}.bind(this)}]});
e.add(a)
},generateLog:function(a){var c=this.getRDFFromDOM(),b=JSON.stringify(a);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.ProcessLogGenerator.shortWaitText});
new Ajax.Request(this.processLogGeneratorHandleURL,{method:"POST",parameters:{options:b,model:c},onSuccess:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
this.openDownloadWindow("generated_log.mxml",d.responseText)
}.bind(this),onFailure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.ProcessLogGenerator.failed)
}.bind(this)})
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeRepository={facade:undefined,construct:function(c){this.facade=c;
this._currentParent;
this._canContain=undefined;
this._canAttach=undefined;
this.shapeList=new Ext.tree.TreeNode({});
var a=new Ext.tree.TreePanel({cls:"shaperepository",loader:new Ext.tree.TreeLoader(),root:this.shapeList,autoScroll:true,rootVisible:false,lines:false,anchors:"0, -30"});
var d=this.facade.addToRegion("west",a,ORYX.I18N.ShapeRepository.title);
var b=new Ext.dd.DragZone(this.shapeList.getUI().getEl(),{shadow:!Ext.isMac});
b.afterDragDrop=this.drop.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
b.beforeDragEnter=function(){this._lastOverElement=false;
return true
}.bind(this);
this.setStencilSets();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.setStencilSets.bind(this))
},setStencilSets:function(){var a=this.shapeList.firstChild;
while(a){this.shapeList.removeChild(a);
a=this.shapeList.firstChild
}this.facade.getStencilSets().values().each((function(d){var b;
var f=d.title();
var c=d.extensions();
if(c&&c.size()>0){f+=" / "+ORYX.Core.StencilSet.getTranslation(c.values()[0],"title")
}this.shapeList.appendChild(b=new Ext.tree.TreeNode({text:f,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRep",singleClickExpand:true}));
b.render();
b.expand();
var e=d.stencils(this.facade.getCanvas().getStencil(),this.facade.getRules());
var g=new Hash();
e=e.sortBy(function(h){return h.position()
});
e.each((function(j){if(e.length<=ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP){this.createStencilTreeNode(b,j);
return
}var h=j.groups();
h.each((function(k){if(!g[k]){g[k]=new Ext.tree.TreeNode({text:k,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRepChild",singleClickExpand:true});
b.appendChild(g[k]);
g[k].render()
}this.createStencilTreeNode(g[k],j)
}).bind(this));
if(h.length==0){this.createStencilTreeNode(b,j)
}}).bind(this))
}).bind(this));
if(this.shapeList.firstChild.firstChild){this.shapeList.firstChild.firstChild.expand(false,true)
}},createStencilTreeNode:function(a,b){var d=new Ext.tree.TreeNode({text:b.title(),icon:b.icon(),allowDrag:false,allowDrop:false,iconCls:"ShapeRepEntreeImg",cls:"ShapeRepEntree"});
a.appendChild(d);
d.render();
var c=d.getUI();
c.elNode.setAttributeNS(null,"title",b.description());
Ext.dd.Registry.register(c.elNode,{node:c.node,handles:[c.elNode,c.textNode].concat($A(c.elNode.childNodes)),isHandle:false,type:b.id(),namespace:b.namespace()})
},drop:function(j,g,b){this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"});
var h=j.getProxy();
if(h.dropStatus==h.dropNotAllowed){return
}if(!this._currentParent){return
}var f=Ext.dd.Registry.getHandle(g.DDM.currentTarget);
var n=b.getXY();
var k={x:n[0],y:n[1]};
var l=this.facade.getCanvas().node.getScreenCTM();
k.x-=l.e;
k.y-=l.f;
k.x/=l.a;
k.y/=l.d;
k.x-=document.documentElement.scrollLeft;
k.y-=document.documentElement.scrollTop;
var m=this._currentParent.absoluteXY();
k.x-=m.x;
k.y-=m.y;
f.position=k;
if(this._canAttach&&this._currentParent instanceof ORYX.Core.Node){f.parent=undefined
}else{f.parent=this._currentParent
}var d=ORYX.Core.Command.extend({construct:function(q,o,r,a,p){this.option=q;
this.currentParent=o;
this.canAttach=r;
this.position=a;
this.facade=p;
this.selection=this.facade.getSelection();
this.shape;
this.parent
},execute:function(){if(!this.shape){this.shape=this.facade.createShape(f);
this.parent=this.shape.parent
}else{this.parent.add(this.shape)
}if(this.canAttach&&this.currentParent instanceof ORYX.Core.Node&&this.shape.dockers.length>0){var a=this.shape.dockers[0];
if(this.currentParent.parent instanceof ORYX.Core.Node){this.currentParent.parent.add(a.parent)
}a.bounds.centerMoveTo(this.position);
a.setDockedShape(this.currentParent)
}this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.facade.deleteShape(this.shape);
this.facade.setSelection(this.selection.without(this.shape));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var e=this.facade.eventCoordinates(b.browserEvent);
var c=new d(f,this._currentParent,this._canAttach,e,this.facade);
this.facade.executeCommands([c]);
this._currentParent=undefined
},beforeDragOver:function(h,f,b){var e=this.facade.eventCoordinates(b.browserEvent);
var l=this.facade.getCanvas().getAbstractShapesAtPosition(e);
if(l.length<=0){var a=h.getProxy();
a.setStatus(a.dropNotAllowed);
a.sync();
return false
}var c=l.last();
if(l.lenght==1&&l[0] instanceof ORYX.Core.Canvas){return false
}else{var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
var j=this.facade.getStencilSets()[d.namespace];
var k=j.stencil(d.type);
if(k.type()==="node"){var g=l.reverse().find(function(m){return(m instanceof ORYX.Core.Canvas||m instanceof ORYX.Core.Node||m instanceof ORYX.Core.Edge)
});
if(g!==this._lastOverElement){this._canAttach=undefined;
this._canContain=undefined
}if(g){if(!(g instanceof ORYX.Core.Canvas)&&g.isPointOverOffset(e.x,e.y)&&this._canAttach==undefined){this._canAttach=this.facade.getRules().canConnect({sourceShape:g,edgeStencil:k,targetStencil:k});
if(this._canAttach){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.attached",elements:[g],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this._canContain=undefined
}}if(!(g instanceof ORYX.Core.Canvas)&&!g.isPointOverOffset(e.x,e.y)){this._canAttach=this._canAttach==false?this._canAttach:undefined
}if(this._canContain==undefined&&!this._canAttach){this._canContain=this.facade.getRules().canContain({containingShape:g,containedStencil:k});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.added",elements:[g],color:this._canContain?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"})
}this._currentParent=this._canContain||this._canAttach?g:undefined;
this._lastOverElement=g;
var a=h.getProxy();
a.setStatus(this._currentParent?a.dropAllowed:a.dropNotAllowed);
a.sync()
}}else{this._currentParent=this.facade.getCanvas();
var a=h.getProxy();
a.setStatus(a.dropAllowed);
a.sync()
}}return false
}};
ORYX.Plugins.ShapeRepository=Clazz.extend(ORYX.Plugins.ShapeRepository);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}if(!ORYX.FieldEditors){ORYX.FieldEditors={}
}if(!ORYX.AssociationEditors){ORYX.AssociationEditors={}
}if(!ORYX.LabelProviders){ORYX.LabelProviders={}
}ORYX.Plugins.PropertyWindow={facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW,this.init.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.onSelectionChanged.bind(this));
this.init()
},init:function(){this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",null,["div"]);
this.currentDateFormat;
this.popularProperties=[];
this.simulationProperties=[];
this.properties=[];
this.shapeSelection=new Hash();
this.shapeSelection.shapes=new Array();
this.shapeSelection.commonProperties=new Array();
this.shapeSelection.commonPropertiesValues=new Hash();
this.updaterFlag=false;
this.columnModel=new Ext.grid.ColumnModel([{header:ORYX.I18N.PropertyWindow.name,dataIndex:"name",width:90,sortable:true,renderer:this.tooltipRenderer.bind(this)},{header:ORYX.I18N.PropertyWindow.value,dataIndex:"value",id:"propertywindow_column_value",width:110,editor:new Ext.form.TextField({allowBlank:true}),renderer:this.renderer.bind(this)},{header:"Desk",dataIndex:"groupname",hidden:true,sortable:true}]);
this.dataSource=new Ext.data.GroupingStore({proxy:new Ext.data.MemoryProxy(this.properties),reader:new Ext.data.ArrayReader({},[{name:"groupname"},{name:"name"},{name:"value"},{name:"icons"},{name:"gridProperties"}]),sortInfo:{field:"name",direction:"ASC"},groupField:"groupname"});
this.dataSource.load();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,clicksToEdit:1,stripeRows:true,autoExpandColumn:"propertywindow_column_value",width:"auto",colModel:this.columnModel,enableHdMenu:false,view:new Ext.grid.GroupingView({forceFit:false,groupTextTpl:"{[values.rs.first().data.groupname]}"}),store:this.dataSource});
region=this.facade.addToRegion("east",new Ext.Panel({width:400,layout:"anchor",autoScroll:true,autoHeight:true,border:false,items:[this.grid],anchors:"0, -30"}),ORYX.I18N.PropertyWindow.title);
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.view.on("refresh",this.hideMoreAttrs,this,true);
this.grid.enableColumnMove=false
},selectDiagram:function(){this.shapeSelection.shapes=[this.facade.getCanvas()];
this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.createProperties()
},specialKeyDown:function(b,a){if(b instanceof Ext.form.TextArea&&a.button==ORYX.CONFIG.KEY_Code_enter){return false
}},tooltipRenderer:function(b,c,a){c.cellAttr='title="'+a.data.gridProperties.tooltip+'"';
return b
},renderer:function(b,c,a){this.tooltipRenderer(b,c,a);
if(a.data.gridProperties.labelProvider){return a.data.gridProperties.labelProvider(b)
}if(b instanceof Date){b=b.dateFormat(ORYX.I18N.PropertyWindow.dateFormat)
}else{if(String(b).search("<a href='")<0){b=String(b).gsub("<","&lt;");
b=String(b).gsub(">","&gt;");
b=String(b).gsub("%","&#37;");
b=String(b).gsub("&","&amp;");
if(a.data.gridProperties.type==ORYX.CONFIG.TYPE_COLOR){b="<div class='prop-background-color' style='background-color:"+b+"' />"
}a.data.icons.each(function(d){if(d.name==b){if(d.icon){b="<img src='"+d.icon+"' /> "+b
}}})
}}return b
},beforeEdit:function(c){var d=this.dataSource.getAt(c.row).data.gridProperties.editor;
var a=this.dataSource.getAt(c.row).data.gridProperties.renderer;
if(d){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
c.grid.getColumnModel().setEditor(1,d);
d.field.row=c.row;
d.render(this.grid);
d.setSize(c.grid.getColumnModel().getColumnWidth(1),d.height)
}else{return false
}var b=this.dataSource.getAt(c.row).data.gridProperties.propId;
this.oldValues=new Hash();
this.shapeSelection.shapes.each(function(e){this.oldValues[e.getId()]=e.properties[b]
}.bind(this))
},afterEdit:function(e){e.grid.getStore().commitChanges();
var c=e.record.data.gridProperties.propId;
var h=this.shapeSelection.shapes;
var b=this.oldValues;
var f=e.value;
var d=this.facade;
var a=ORYX.Core.Command.extend({construct:function(){this.key=c;
this.selectedElements=h;
this.oldValues=b;
this.newValue=f;
this.facade=d
},execute:function(){this.selectedElements.each(function(j){if(!j.getStencil().property(this.key).readonly()){j.setProperty(this.key,this.newValue)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.selectedElements.each(function(j){j.setProperty(this.key,this.oldValues[j.getId()])
}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a();
this.facade.executeCommands([g]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:h,key:c,value:e.value})
},editDirectly:function(a,b){this.shapeSelection.shapes.each(function(d){if(!d.getStencil().property(a).readonly()){d.setProperty(a,b)
}}.bind(this));
var c=this.shapeSelection.shapes;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:c,key:a,value:b});
this.facade.getCanvas().update()
},updateAfterInvalid:function(a){this.shapeSelection.shapes.each(function(b){if(!b.getStencil().property(a).readonly()){b.setProperty(a,this.oldValues[b.getId()]);
b.update()
}}.bind(this));
this.facade.getCanvas().update()
},dialogClosed:function(a){var b=this.field?this.field.row:this.row;
this.scope.afterEdit({grid:this.scope.grid,record:this.scope.grid.getStore().getAt(b),value:a});
this.scope.grid.startEditing(b,this.col)
},setPropertyWindowTitle:function(){if(this.shapeSelection.shapes.length==1){region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.first().getStencil().title()+")")
}else{region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.length+" "+ORYX.I18N.PropertyWindow.selected+")")
}},setCommonPropertiesValues:function(){this.shapeSelection.commonPropertiesValues=new Hash();
this.shapeSelection.commonProperties.each(function(d){var c=d.prefix()+"-"+d.id();
var b=false;
var a=this.shapeSelection.shapes.first();
this.shapeSelection.shapes.each(function(e){if(a.properties[c]!=e.properties[c]){b=true
}}.bind(this));
if(!b){this.shapeSelection.commonPropertiesValues[c]=a.properties[c]
}}.bind(this))
},getStencilSetOfSelection:function(){var a=new Hash();
this.shapeSelection.shapes.each(function(b){a[b.getStencil().id()]=b.getStencil()
});
return a
},identifyCommonProperties:function(){this.shapeSelection.commonProperties.clear();
var d=this.getStencilSetOfSelection();
var c=d.values().first();
var b=d.values().without(c);
if(b.length==0){this.shapeSelection.commonProperties=c.properties()
}else{var a=new Hash();
c.properties().each(function(e){a[e.namespace()+"-"+e.id()+"-"+e.type()]=e
});
b.each(function(e){var f=new Hash();
e.properties().each(function(g){if(a[g.namespace()+"-"+g.id()+"-"+g.type()]){f[g.namespace()+"-"+g.id()+"-"+g.type()]=g
}});
a=f
});
this.shapeSelection.commonProperties=a.values()
}},onSelectionChanged:function(a){this.grid.stopEditing();
this.shapeSelection.shapes=a.elements;
if(a.elements){if(a.elements.length==0){this.shapeSelection.shapes=[this.facade.getCanvas()]
}}else{this.shapeSelection.shapes=[this.facade.getCanvas()]
}if(a.subSelection){this.shapeSelection.shapes=[a.subSelection]
}this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.setCommonPropertiesValues();
this.createProperties()
},createProperties:function(){this.properties=[];
this.popularProperties=[];
this.simulationProperties=[];
if(this.shapeSelection.commonProperties){this.shapeSelection.commonProperties.each((function(p,F){var t=p.prefix()+"-"+p.id();
var q=p.title();
var X=[];
var C=this.shapeSelection.commonPropertiesValues[t];
var N=undefined;
var K=null;
var G=false;
var O=ORYX.FieldEditors[p.type()];
if(O!==undefined){N=O.init.bind(this,t,p,X,F)();
if(N==null){return
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(!p.readonly()){switch(p.type()){case ORYX.CONFIG.TYPE_STRING:if(p.wrapLines()){var f=new Ext.form.TextArea({alignment:"tl-tl",allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
f.on("keyup",function(k,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(f)
}else{var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
D.on("blur",function(j){if(!j.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
D.on("specialkey",function(j,k){if(!j.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
N=new Ext.Editor(D)
}break;
case ORYX.CONFIG.TYPE_BOOLEAN:var n=new Ext.form.Checkbox();
n.on("check",function(k,j){this.editDirectly(t,j)
}.bind(this));
N=new Ext.Editor(n);
break;
case ORYX.CONFIG.TYPE_INTEGER:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:false,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_FLOAT:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:true,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_COLOR:var V=new Ext.ux.ColorField({allowBlank:p.optional(),msgTarget:"title",facade:this.facade});
N=new Ext.Editor(V);
break;
case ORYX.CONFIG.TYPE_CHOICE:var v=p.items();
var y=[];
v.each(function(j){if(j.value()==C){C=j.title()
}if(j.refToView()[0]){G=true
}y.push([j.icon(),j.title(),j.value()]);
X.push({name:j.title(),icon:j.icon()})
});
var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(Y,j,k){this.editDirectly(t,Y.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICCHOICE:var v=p.items();
var y=[];
v.each(function(ac){if(ac.value()==C){C=ac.title()
}if(ac.refToView()[0]){G=true
}y.push(["","",""]);
var aa=ORYX.EDITOR.getSerializedJSON();
var ab=jsonPath(aa.evalJSON(),ac.value());
if(ab){if(ab.toString().length>0){for(var Z=0;
Z<ab.length;
Z++){var ad=ab[Z].split(",");
for(var Y=0;
Y<ad.length;
Y++){if(ad[Y].indexOf(":")>0){var k=ad[Y].split(":");
y.push([ac.icon(),k[0],k[0]])
}else{y.push([ac.icon(),ad[Y],ad[Y]])
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"No data available for property.",title:""})
}X.push({name:ac.title(),icon:ac.icon()})
});
var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(Y,j,k){this.editDirectly(t,Y.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAINPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(W.evalJSON(),"$.childShapes.*");
for(var U=0;
U<P.length;
U++){var h=P[U];
if(h.resourceId==s){var Q=h.properties.datainputset;
var B=Q.split(",");
for(var S=0;
S<B.length;
S++){var m=B[S];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(Y,j,k){this.editDirectly(t,Y.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAOUTPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(W.evalJSON(),"$.childShapes.*");
for(var U=0;
U<P.length;
U++){var h=P[U];
if(h.resourceId==s){var e=h.properties.dataoutputset;
var g=e.split(",");
for(var R=0;
R<g.length;
R++){var m=g[R];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(Y,j,k){this.editDirectly(t,Y.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICGATEWAYCONNECTIONS:var T=ORYX.Config.FACADE.getSelection();
var y=[];
if(T&&T.length==1){var u=T.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
var x=new XMLHttpRequest;
var d=ORYX.PATH+"processinfo";
var c="uuid="+ORYX.UUID+"&ppdata="+ORYX.PREPROCESSING+"&profile="+ORYX.PROFILE+"&gatewayid="+s+"&json="+encodeURIComponent(W);
x.open("POST",d,false);
x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
x.send(c);
if(x.status==200){var J=x.responseText.evalJSON();
for(var U=0;
U<J.length;
U++){var h=J[U];
y.push(["",h.sequenceflowinfo,h.sequenceflowinfo])
}}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error determining outgoing connections.",title:""})
}}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid number of nodes selected.",title:""})
}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(Y,j,k){this.editDirectly(t,Y.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DATE:var I=ORYX.I18N.PropertyWindow.dateFormat;
if(!(C instanceof Date)){C=Date.parseDate(C,I)
}N=new Ext.Editor(new Ext.form.DateField({allowBlank:p.optional(),format:I,msgTarget:"title"}));
break;
case ORYX.CONFIG.TYPE_TEXT:var E=new Ext.form.ComplexTextField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VARDEF:var E=new Ext.form.ComplexVardefField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_EXPRESSION:var E=new Ext.form.ComplexExpressionField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CALLEDELEMENT:var E=new Ext.form.ComplexCalledElementField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CUSTOM:var E=new Ext.form.ComplexCustomField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,title:p.title(),attr:C});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_ACTION:var E=new Ext.form.ComplexActionsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_GLOBAL:var E=new Ext.form.ComplexGlobalsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_IMPORT:var E=new Ext.form.ComplexImportsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_REASSIGNMENT:var E=new Ext.form.ComplexReassignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_NOTIFICATIONS:var E=new Ext.form.ComplexNotificationsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT:var E=new Ext.form.ComplexDataInputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT_SINGLE:var E=new Ext.form.ComplexDataInputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT:var E=new Ext.form.ComplexDataOutputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT_SINGLE:var E=new Ext.form.ComplexDataOutputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAASSIGNMENT:var E=new Ext.form.ComplexDataAssignmenField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VISUALDATAASSIGNMENTS:var E=new Ext.form.ComplexVisualDataAssignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_COMPLEX:var E=new Ext.form.ComplexListField({allowBlank:p.optional()},p.complexItems(),t,this.facade);
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case"CPNString":var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(D);
break;
default:var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(j,k){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(D)
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(p.type()===ORYX.CONFIG.TYPE_URL||p.type()===ORYX.CONFIG.TYPE_DIAGRAM_LINK){C=String(C).search("http")!==0?("http://"+C):C;
C="<a href='"+C+"' target='_blank'>"+C.split("://")[1]+"</a>"
}}}if(p.visible()&&(p.id()!="origbordercolor"&&p.id()!="origbgcolor"&&p.id()!="isselectable")){var H=true;
if(this.shapeSelection.shapes.length==1&&(this.shapeSelection.shapes.first().getStencil().idWithoutNs()=="Task"||this.shapeSelection.shapes.first().getStencil().idWithoutNs()=="IntermediateEscalationEventThrowing"||this.shapeSelection.shapes.first().getStencil().idWithoutNs()=="IntermediateEvent"||this.shapeSelection.shapes.first().getStencil().idWithoutNs()=="IntermediateMessageEventThrowing"||this.shapeSelection.shapes.first().getStencil().idWithoutNs()=="IntermediateSignalEventThrowing")){if(p.fortasktypes()&&p.fortasktypes().length>0){var l=false;
var A=p.fortasktypes().split("|");
for(var U=0;
U<A.size();
U++){if(A[U]==this.shapeSelection.shapes.first().properties["oryx-tasktype"]){l=true
}}if(!l){H=false
}}if(p.ifproptrue()&&p.ifproptrue().length>0){var w=false;
var M=p.ifproptrue();
if(this.shapeSelection.shapes.first().properties["oryx-"+M]&&this.shapeSelection.shapes.first().properties["oryx-"+M]=="true"){w=true
}if(!w){H=false
}}if(p.fordistribution()&&p.fordistribution().length>0){var L=false;
var A=p.fordistribution().split("|");
for(var S=0;
S<A.size();
S++){if(A[S]==this.shapeSelection.shapes.first().properties["oryx-distributiontype"]){L=true
}}if(!L){H=false
}}}if(H){if(p.refToView()[0]||G||p.popular()){p.setPopular()
}if(p.simulation()){p.setSimulation()
}if(p.popular()){this.popularProperties.push([ORYX.I18N.PropertyWindow.oftenUsed,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.simulation()){this.simulationProperties.push([ORYX.I18N.PropertyWindow.simulationProps,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{this.properties.push([ORYX.I18N.PropertyWindow.moreProps,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}}}}}).bind(this))
}this.setProperties()
},getLabelProvider:function(a){lp=ORYX.LabelProviders[a.labelProvider()];
if(lp){return lp(a)
}return null
},hideMoreAttrs:function(a){if(this.properties.length<=0){return
}this.grid.view.un("refresh",this.hideMoreAttrs,this)
},setProperties:function(){var b=this.popularProperties.concat(this.properties);
var a=b.concat(this.simulationProperties);
this.dataSource.loadData(a)
}};
ORYX.Plugins.PropertyWindow=Clazz.extend(ORYX.Plugins.PropertyWindow);
Ext.form.ComplexListField=function(b,a,c,d){Ext.form.ComplexListField.superclass.constructor.call(this,b);
this.items=a;
this.key=c;
this.facade=d
};
Ext.extend(Ext.form.ComplexListField,Ext.form.TriggerField,{triggerClass:"x-form-complex-trigger",readOnly:true,emptyText:ORYX.I18N.PropertyWindow.clickIcon,buildValue:function(){var f=this.grid.getStore();
f.commitChanges();
if(f.getCount()==0){return""
}var d="[";
for(var c=0;
c<f.getCount();
c++){var e=f.getAt(c);
d+="{";
for(var a=0;
a<this.items.length;
a++){var b=this.items[a].id();
d+=b+":"+(""+e.get(b)).toJSON();
if(a<(this.items.length-1)){d+=", "
}}d+="}";
if(c<(f.getCount()-1)){d+=", "
}}d+="]";
d="{'totalCount':"+f.getCount().toJSON()+", 'items':"+d+"}";
return Object.toJSON(d.evalJSON())
},getFieldKey:function(){return this.key
},getValue:function(){if(this.grid){return this.buildValue()
}else{if(this.data==undefined){return""
}else{return this.data
}}},setValue:function(a){if(a.length>0){if(this.data==undefined){this.data=a
}}},keydownHandler:function(a){return false
},dialogListeners:{show:function(){this.onFocus();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
return
},hide:function(){var a=this.dialogListeners;
this.dialog.un("show",a.show,this);
this.dialog.un("hide",a.hide,this);
this.dialog.destroy(true);
this.grid.destroy(true);
delete this.grid;
delete this.dialog;
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
this.fireEvent("dialogClosed",this.data);
Ext.form.ComplexListField.superclass.setValue.call(this,this.data)
}},buildInitial:function(f,a){var b=new Hash();
for(var c=0;
c<a.length;
c++){var e=a[c].id();
b[e]=a[c].value()
}var d=Ext.data.Record.create(f);
return new d(b)
},buildColumnModel:function(l){var h=[];
for(var c=0;
c<this.items.length;
c++){var a=this.items[c].id();
var d=this.items[c].name();
var b=this.items[c].width();
var g=this.items[c].type();
var e;
if(g==ORYX.CONFIG.TYPE_STRING){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}else{if(g==ORYX.CONFIG.TYPE_INTEGER){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}else{if(g==ORYX.CONFIG.TYPE_CHOICE){var f=this.items[c].items();
var k=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",l,["select",{style:"display:none"}]);
var j=new Ext.Template('<option value="{value}">{value}</option>');
f.each(function(m){j.append(k,{value:m.value()})
});
e=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:k,lazyRender:true,msgTarget:"title",width:b})
}else{if(g==ORYX.CONFIG.TYPE_DYNAMICCHOICE){var f=this.items[c].items();
var k=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",l,["select",{style:"display:none"}]);
var j=new Ext.Template('<option value="{value}">{value}</option>');
f.each(function(r){var p=ORYX.EDITOR.getSerializedJSON();
var q=jsonPath(p.evalJSON(),r.value());
if(q){if(q.toString().length>0){for(var o=0;
o<q.length;
o++){var s=q[o].split(",");
for(var n=0;
n<s.length;
n++){if(s[n].indexOf(":")>0){var m=s[n].split(":");
j.append(k,{value:m[0]})
}else{j.append(k,{value:s[n]})
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"No data available for property.",title:""})
}});
e=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:k,lazyRender:true,msgTarget:"title",width:b})
}else{if(g==ORYX.CONFIG.TYPE_BOOLEAN){e=new Ext.form.Checkbox({width:b})
}else{if(g=="xpath"){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}}}}}}h.push({id:a,header:d,dataIndex:a,resizable:true,editor:e,width:b})
}return new Ext.grid.ColumnModel(h)
},afterEdit:function(a){a.grid.getStore().commitChanges()
},beforeEdit:function(h){var a=this.grid.getView().getScrollState();
var b=h.column;
var p=h.row;
var e=this.grid.getColumnModel().config[b].id;
for(var g=0;
g<this.items.length;
g++){var o=this.items[g];
var m=o.disable();
if(m!=undefined){var n=this.grid.getStore().getAt(p).get(o.id());
for(var d=0;
d<m.length;
d++){var f=m[d];
if(f.value==n){for(var c=0;
c<f.items.length;
c++){var l=f.items[c];
if(l==e){this.grid.getColumnModel().getCellEditor(b,p).disable();
return
}}}}}}this.grid.getColumnModel().getCellEditor(b,p).enable()
},onTriggerClick:function(){if(this.disabled){return
}var dialogWidth=0;
var recordType=[];
for(var i=0;
i<this.items.length;
i++){var id=this.items[i].id();
var width=this.items[i].width();
var type=this.items[i].type();
if((type==ORYX.CONFIG.TYPE_CHOICE)||(type==ORYX.CONFIG.TYPE_DYNAMICCHOICE)){type=ORYX.CONFIG.TYPE_STRING
}dialogWidth+=width;
recordType[i]={name:id,type:type}
}if(dialogWidth>800){dialogWidth=800
}dialogWidth+=22;
var data=this.data;
if(data==""){data="{}"
}var ds=new Ext.data.Store({proxy:new Ext.data.MemoryProxy(eval("("+data+")")),reader:new Ext.data.JsonReader({root:"items",totalProperty:"totalCount"},recordType)});
ds.load();
var cm=this.buildColumnModel();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:ds,cm:cm,stripeRows:true,clicksToEdit:1,selModel:new Ext.grid.CellSelectionModel()});
var toolbar=new Ext.Toolbar([{text:ORYX.I18N.PropertyWindow.add,handler:function(){var ds=this.grid.getStore();
var index=ds.getCount();
this.grid.stopEditing();
var p=this.buildInitial(recordType,this.items);
ds.insert(index,p);
ds.commitChanges();
this.grid.startEditing(index,0)
}.bind(this)},{text:ORYX.I18N.PropertyWindow.rem,handler:function(){var ds=this.grid.getStore();
var selection=this.grid.getSelectionModel().getSelectedCell();
if(selection==undefined){return
}this.grid.getSelectionModel().clearSelections();
this.grid.stopEditing();
var record=ds.getAt(selection[0]);
ds.remove(record);
ds.commitChanges()
}.bind(this)}]);
this.dialog=new Ext.Window({autoScroll:true,autoCreate:true,title:ORYX.I18N.PropertyWindow.complex,height:350,width:dialogWidth,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){this.dialog.hide
}.bind(this)}],items:[toolbar,this.grid],bodyStyle:"background-color:#FFFFFF",buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){this.grid.getView().refresh();
this.grid.stopEditing();
this.data=this.buildValue();
this.dialog.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.dialog.hide()
}.bind(this)}]});
this.dialog.on(Ext.apply({},this.dialogListeners,{scope:this}));
this.dialog.show();
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.render()
}});
Ext.form.ComplexTextField=Ext.extend(Ext.form.TriggerField,{defaultAutoCreate:{tag:"textarea",rows:1,style:"height:16px;overflow:hidden;"},onTriggerClick:function(){if(this.disabled){return
}var b=new Ext.form.TextArea({anchor:"100% 100%",value:this.value,listeners:{focus:function(){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}.bind(this)}});
var a=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.text,height:500,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){a.hide()
}.bind(this)}],items:[b],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
a.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var c=b.getValue();
this.setValue(c);
this.dataSource.getAt(this.row).set("value",c);
this.dataSource.commitChanges();
a.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
a.hide()
}.bind(this)}]});
a.show();
b.render();
this.grid.stopEditing();
b.focus(false,100)
}});
Ext.form.ComplexCustomField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}Ext.Ajax.request({url:ORYX.PATH+"customeditors",method:"POST",success:function(a){try{if(a.responseText&&a.responseText.length>0){var d=a.responseText.evalJSON();
var c=d.editors;
if(c[this.title]){var b=new Ext.Window({layout:"anchor",autoCreate:true,title:"Custom Editor for "+this.title,height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[{xtype:"component",id:"customeditorswindow",autoEl:{tag:"iframe",src:c[this.title],width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var e=document.getElementById("customeditorswindow").contentWindow.getEditorValue();
this.setValue(e);
this.dataSource.getAt(this.row).set("value",e);
this.dataSource.commitChanges();
b.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
b.hide()
}.bind(this)}]});
b.show();
this.grid.stopEditing()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find custom editor info for"+this.title,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid Custom Editors data.",title:""})
}}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error applying Custom Editor data:\n"+f,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error applying Custom Editor data.",title:""})
},params:{profile:ORYX.PROFILE}})
}});
Ext.form.ComplexNotificationsField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var q=Ext.data.Record.create([{name:"type"},{name:"expires"},{name:"from"},{name:"tousers"},{name:"togroups"},{name:"replyto"},{name:"subject"},{name:"body"}]);
var b=new Ext.data.MemoryProxy({root:[]});
var A=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},q),proxy:b,sorters:[{property:"subject",direction:"ASC"},{property:"from",direction:"ASC"},{property:"tousers",direction:"ASC"},{property:"togroups",direction:"ASC"}]});
A.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var r=this.value.split("^");
for(var y=0;
y<r.length;
y++){var e=r[y];
if(e.indexOf("@")>0){var u=e.split("@");
var t=u[0];
var l=u[1];
var g=u[2];
var B="";
var m="";
var f="";
var n="";
var k="";
var d="";
if(t.indexOf("|")>0){var C=t.split("|");
for(var w=0;
w<C.length;
w++){var c=C[w].split(/:(.+)?/)[0];
var x=C[w].split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}}else{var c=t.split(/:(.+)?/)[0];
var x=t.split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}A.add(new q({type:g==undefined?"":g,expires:l==undefined?"":l,from:B==undefined?"":B,tousers:m==undefined?"":m,togroups:f==undefined?"":f,replyto:n==undefined?"":n,subject:k==undefined?"":k,body:d==undefined?"":d}))
}}}var o=new Array();
var D=new Array();
D.push("not-started");
D.push("not-started");
o.push(D);
var v=new Array();
v.push("not-completed");
v.push("not-completed");
o.push(v);
var s=Ext.id();
var p=new Extensive.grid.ItemDeleter();
var h=new Ext.form.TextArea({id:"notificationsbodyeditor",width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true});
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:A,id:s,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"type",header:"Type",width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})},{id:"expires",header:"Expires At",width:100,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"from",header:"From",width:100,dataIndex:"from",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"tousers",header:"To Users",width:100,dataIndex:"tousers",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"togroups",header:"To Groups",width:100,dataIndex:"togroups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"replyto",header:"Reply To",width:100,dataIndex:"replyto",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"subject",header:"Subject",width:100,dataIndex:"subject",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"body",header:"Body",width:100,height:650,dataIndex:"body",editor:new Ext.form.TextArea({width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true}),renderer:Ext.util.Format.htmlEncode},p]),selModel:p,autoHeight:true,tbar:[{text:"Add Notification",handler:function(){A.add(new q({expires:"",from:"",tousers:"",type:"not-started",togroups:"",replyto:"",subject:"",body:""}));
a.fireEvent("cellclick",a,A.getCount()-1,1,null)
}}],clicksToEdit:1,listeners:{beforeedit:function(j){if(j.column!=8){return true
}var E=Ext.get("notificationsBodyEditorWindow");
if(!E){var F=new Ext.Window({id:"notificationsBodyEditorWindow",modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,autoScroll:true,autoWidth:true,autoHeight:true,bodyBorder:false,closable:true,resizable:true,items:[{xtype:"panel",html:"<p class='instructions'>Enter Notification body message.</p>"},{xtype:"textarea",id:"notificationbodyinput",width:350,height:300,modal:true,value:j.value}],bbar:[{text:"OK",handler:function(){j.record.set("body",Ext.get("notificationbodyinput").getValue());
F.close()
}}]});
F.show();
return false
}else{return false
}}}});
var z=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Notifications",height:350,width:900,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){z.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
z.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var j="";
a.stopEditing();
a.getView().refresh();
A.data.each(function(){if((this.data.tousers.length>0||this.data.togroups.length>0)&&this.data.subject.length>0&&this.data.body.length>0){j+="[from:"+this.data.from+"|tousers:"+this.data.tousers+"|togroups:"+this.data.togroups+"|replyTo:"+this.data.replyto+"|subject:"+this.data.subject+"|body:"+this.data.body.replace(/\r\n|\r|\n/g,"<br />")+"]";
j+="@["+this.data.expires+"]";
j+="@"+this.data.type;
j+="^"
}});
if(j.length>0){j=j.slice(0,-1)
}this.setValue(j);
this.dataSource.getAt(this.row).set("value",j);
this.dataSource.commitChanges();
z.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
z.hide()
}.bind(this)}]});
z.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexReassignmentField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var c=Ext.data.Record.create([{name:"users"},{name:"groups"},{name:"expires"},{name:"type"}]);
var l=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},c),proxy:l,sorters:[{property:"users",direction:"ASC"},{property:"groups",direction:"ASC"}]});
d.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var n=this.value.split("^");
for(var t=0;
t<n.length;
t++){var e=n[t];
if(e.indexOf("@")>0){var q=e.split("@");
var p=q[0];
var h=q[1];
var f=q[2];
var g="";
var s="";
if(p.indexOf("|")>0){var w=p.split("|");
var x=w[0];
var m=w[1];
var b=x.split(":");
if(b[0]=="users"){g=b[1]
}else{if(b[0]=="groups"){s=b[1]
}}var u=m.split(":");
if(u[0]=="users"){g=u[1]
}else{if(u[0]=="groups"){s=u[1]
}}}else{var z=p.split(":");
if(z[0]=="users"){g=z[1]
}else{if(z[0]=="groups"){s=z[1]
}}}d.add(new c({users:g,groups:s,expires:h,type:f}))
}}}var j=new Array();
var y=new Array();
y.push("not-started");
y.push("not-started");
j.push(y);
var r=new Array();
r.push("not-completed");
r.push("not-completed");
j.push(r);
var o=Ext.id();
var k=new Extensive.grid.ItemDeleter();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:o,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"users",header:"Users",width:150,dataIndex:"users",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"groups",header:"Groups",width:150,dataIndex:"groups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"expires",header:"Expires At",width:150,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"type",header:"Type",width:150,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})},k]),selModel:k,autoHeight:true,tbar:[{text:"Add Reassignment",handler:function(){d.add(new c({users:"",groups:"",expires:"",type:"not-started"}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var v=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Reassignments",height:350,width:700,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){v.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
v.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var A="";
a.stopEditing();
a.getView().refresh();
d.data.each(function(){if((this.data.users.length>0||this.data.groups.length>0)&&this.data.expires.length>0&&this.data.type.length>0){A+="[users:"+this.data.users+"|groups:"+this.data.groups+"]";
A+="@["+this.data.expires+"]";
A+="@"+this.data.type;
A+="^"
}});
if(A.length>0){A=A.slice(0,-1)
}this.setValue(A);
this.dataSource.getAt(this.row).set("value",A);
this.dataSource.commitChanges();
v.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
v.hide()
}.bind(this)}]});
v.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexImportsField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var r=Ext.data.Record.create([{name:"type"},{name:"classname"},{name:"wsdllocation"},{name:"wsdlnamespace"}]);
var e=new Ext.data.MemoryProxy({root:[]});
var q=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},r),proxy:e,sorters:[{property:"type",direction:"ASC"}]});
q.load();
if(this.value.length>0){var j=this.value.split(",");
for(var n=0;
n<j.length;
n++){var d="";
var s,b,h;
var c=j[n];
var m=c.split("|");
if(m[1]=="default"){d="default";
s=m[0];
b="";
h=""
}else{d="wsdl";
s="";
b=m[0];
h=m[1]
}q.add(new r({type:d,classname:s,wsdllocation:b,wsdlnamespace:h}))
}}var g=new Extensive.grid.ItemDeleter();
var l=new Array();
var f=new Array();
f.push("default");
f.push("default");
l.push(f);
var p=new Array();
p.push("wsdl");
p.push("wsdl");
l.push(p);
var k=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:q,id:k,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"imptype",header:"Import Type",width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"importTypeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:l})})},{id:"classname",header:"Class Name",width:200,dataIndex:"classname",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdllocation",header:"WSDL Location",width:200,dataIndex:"wsdllocation",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdlnamespace",header:"WSDL Namespace",width:200,dataIndex:"wsdlnamespace",editor:new Ext.form.TextField({allowBlank:true})},g]),selModel:g,autoHeight:true,tbar:[{text:"Add Import",handler:function(){q.add(new r({type:"default",classname:"",wsdllocation:"",wsdlnamespace:""}));
a.fireEvent("cellclick",a,q.getCount()-1,1,null)
}}],clicksToEdit:1});
var o=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Imports",height:400,width:800,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){o.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
o.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var t="";
a.getView().refresh();
a.stopEditing();
q.data.each(function(){if(this.data.type=="default"){t+=this.data.classname+"|"+this.data.type+","
}if(this.data.type=="wsdl"){t+=this.data.wsdllocation+"|"+this.data.wsdlnamespace+"|"+this.data.type+","
}});
if(t.length>0){t=t.slice(0,-1)
}this.setValue(t);
this.dataSource.getAt(this.row).set("value",t);
this.dataSource.commitChanges();
o.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
o.hide()
}.bind(this)}]});
o.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexActionsField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var f=Ext.data.Record.create([{name:"action"}]);
var j=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},f),proxy:j,sorters:[{property:"action",direction:"ASC"}]});
d.load();
if(this.value.length>0){var h=this.value.split("|");
for(var e=0;
e<h.length;
e++){var b=h[e];
d.add(new f({action:b}))
}}var g=new Extensive.grid.ItemDeleter();
var c=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:c,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"action",header:"Action",width:360,dataIndex:"action",editor:new Ext.form.TextField({allowBlank:true})},g]),selModel:g,autoHeight:true,tbar:[{text:"Add Action",handler:function(){d.add(new f({action:""}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var k=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Actions",height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){k.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
k.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var l="";
a.getView().refresh();
a.stopEditing();
d.data.each(function(){if(this.data.action.length>0){l+=this.data.action+"|"
}});
if(l.length>0){l=l.slice(0,-1)
}this.setValue(l);
this.dataSource.getAt(this.row).set("value",l);
this.dataSource.commitChanges();
k.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
k.hide()
}.bind(this)}]});
k.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexDataAssignmenField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return undefined
}var d=ORYX.EDITOR.getSerializedJSON();
var t=jsonPath(d.evalJSON(),"$.properties.vardefs");
var g=new Array();
var h=new Array();
var b=new Hash();
h.push("");
h.push("** Variable Definitions **");
g.push(h);
if(t){t.forEach(function(z){if(z.length>0){var w=z.split(",");
for(var y=0;
y<w.length;
y++){var x=new Array();
var A=w[y];
if(A.indexOf(":")>0){var v=A.split(":");
x.push(v[0]);
x.push(v[0]);
b[v[0]]=v[1]
}else{x.push(A);
x.push(A);
b[A]="java.lang.String"
}g.push(x)
}}})
}var j=new Array();
j.push("");
j.push("** Data Inputs **");
g.push(j);
Ext.each(this.dataSource.data.items,function(z){if((z.data.gridProperties.propId=="oryx-datainputset")||(z.data.gridProperties.propId=="oryx-datainput")){var w=z.data.value.split(",");
for(var y=0;
y<w.length;
y++){var A=w[y];
var x=new Array();
if(A.indexOf(":")>0){var v=A.split(":");
x.push(v[0]);
x.push(v[0]);
b[v[0]]=v[1]
}else{x.push(A);
x.push(A);
b[A]="java.lang.String"
}g.push(x)
}}});
var k=new Array();
k.push("");
k.push("** Data Outputs **");
g.push(k);
Ext.each(this.dataSource.data.items,function(z){if((z.data.gridProperties.propId=="oryx-dataoutputset")||(z.data.gridProperties.propId=="oryx-dataoutput")){var x=z.data.value.split(",");
for(var v=0;
v<x.length;
v++){var A=x[v];
var y=new Array();
if(A.indexOf(":")>0){var w=A.split(":");
y.push(w[0]);
y.push(w[0]);
b[w[0]]=w[1]
}else{y.push(A);
y.push(A);
b[A]="java.lang.String"
}g.push(y)
}}});
var c=Ext.data.Record.create([{name:"from"},{name:"type"},{name:"to"},{name:"tostr"},{name:"dataType"}]);
var q=new Ext.data.MemoryProxy({root:[]});
var u=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},c),proxy:q,sorters:[{property:"from",direction:"ASC"},{property:"to",direction:"ASC"},{property:"tostr",direction:"ASC"}]});
u.load();
if(this.value.length>0){var m=this.value.split(",");
for(var r=0;
r<m.length;
r++){var e=m[r];
if(e.indexOf("=")>0){var o=e.split("=");
var p=b[o[0]];
if(!p){p="java.lang.String"
}var f=o[1].replace(/\#\#/g,",");
u.add(new c({from:o[0],type:"is equal to",to:"",tostr:f,dataType:p}))
}else{if(e.indexOf("->")>0){var o=e.split("->");
var p=b[o[0]];
if(!p){p="java.lang.String"
}u.add(new c({from:o[0],type:"is mapped to",to:o[1],tostr:"",dataType:p}))
}else{var p=b[e];
if(!p){p="java.lang.String"
}u.add(new c({from:e,type:"is equal to",to:"",tostr:"",dataType:p}))
}}}}u.on("update",function(x,v,w){if(w=="edit"){var y=b[v.get("from")];
if(!y){y="java.lang.String"
}v.set("dataType",y)
}});
var l=new Extensive.grid.ItemDeleter();
var n=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:u,id:n,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"valueType",header:"Data Type",width:180,dataIndex:"dataType",hidden:"true"},{id:"from",header:"From Object",width:180,dataIndex:"from",editor:new Ext.form.ComboBox({id:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:g})})},{id:"type",header:"Assignment Type",width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is mapped to","is mapped to"],["is equal to","is equal to"]]})})},{id:"to",header:"To Object",width:180,dataIndex:"to",editor:new Ext.form.ComboBox({id:"toCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:g})})},{id:"tostr",header:"To Value",width:180,dataIndex:"tostr",editor:new Ext.form.TextField({allowBlank:true}),renderer:Ext.util.Format.htmlEncode},l]),selModel:l,autoHeight:true,tbar:[{text:"Add Assignment",handler:function(){u.add(new c({from:"",type:"",to:"",tostr:""}));
a.fireEvent("cellclick",a,u.getCount()-1,1,null)
}}],clicksToEdit:1});
var s=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Data Assignments",height:350,width:730,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){s.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
s.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var v="";
a.getView().refresh();
a.stopEditing();
u.data.each(function(){if(this.data.from.length>0&&this.data.type.length>0){if(this.data.type=="is mapped to"){v+=this.data.from+"->"+this.data.to+","
}else{if(this.data.type=="is equal to"){var w=this.data.tostr.replace(/,/g,"##");
v+=this.data.from+"="+w+","
}}}});
if(v.length>0){v=v.slice(0,-1)
}this.setValue(v);
this.dataSource.getAt(this.row).set("value",v);
this.dataSource.commitChanges();
s.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
s.hide()
}.bind(this)}]});
s.show();
a.render();
this.grid.stopEditing();
a.focus(false,100);
return a
}});
Ext.form.NameTypeEditor=Ext.extend(Ext.form.TriggerField,{windowTitle:"",addButtonLabel:"",single:false,onTriggerClick:function(){if(this.disabled){return
}var j=Ext.data.Record.create([{name:"name"},{name:"stype"},{name:"ctype"}]);
var d=new Ext.data.MemoryProxy({root:[]});
var g=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},j),proxy:d,sorters:[{property:"name",direction:"ASC"}]});
g.load();
if(this.value.length>0){var l=this.value.split(",");
for(var h=0;
h<l.length;
h++){var e=l[h];
if(e.indexOf(":")>0){var r=e.split(":");
if(r[1]=="String"||r[1]=="Integer"||r[1]=="Boolean"||r[1]=="Float"){g.add(new j({name:r[0],stype:r[1],ctype:""}))
}else{if(r[1]!="Object"){g.add(new j({name:r[0],stype:"Object",ctype:r[1]}))
}else{g.add(new j({name:r[0],stype:r[1],ctype:""}))
}}}else{g.add(new j({name:e,stype:"",ctype:""}))
}}}var k=new Extensive.grid.ItemDeleter();
var c=new Array();
var q=new Array();
q.push("String");
q.push("String");
c.push(q);
var p=new Array();
p.push("Integer");
p.push("Integer");
c.push(p);
var n=new Array();
n.push("Boolean");
n.push("Boolean");
c.push(n);
var o=new Array();
o.push("Float");
o.push("Float");
c.push(o);
var b=new Array();
b.push("Object");
b.push("Object");
c.push(b);
var f=Ext.id();
Ext.form.VTypes.inputNameVal=/^[a-z0-9 \-\.\_]*$/i;
Ext.form.VTypes.inputNameText="Invalid name";
Ext.form.VTypes.inputName=function(s){return Ext.form.VTypes.inputNameVal.test(s)
};
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:g,id:f,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"name",header:"Name",width:100,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"stype",header:"Standard Type",width:100,dataIndex:"stype",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:c})})},{id:"ctype",header:"Custom Type",width:200,dataIndex:"ctype",editor:new Ext.form.TextField({allowBlank:true}),renderer:Ext.util.Format.htmlEncode},k]),selModel:k,autoHeight:true,tbar:[{text:this.addButtonLabel,handler:function(){if(this.single&&g.getCount()>0){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Only single entry allowed.",title:""})
}else{g.add(new j({name:"",stype:"",ctype:""}));
a.fireEvent("cellclick",a,g.getCount()-1,1,null)
}}.bind(this)}],clicksToEdit:1});
var m=new Ext.Window({layout:"anchor",autoCreate:true,title:this.windowTitle,height:300,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){m.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
m.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var s="";
a.stopEditing();
a.getView().refresh();
g.data.each(function(){if(this.data.name.length>0){if(this.data.stype.length>0){if(this.data.stype=="Object"&&this.data.ctype.length>0){s+=this.data.name+":"+this.data.ctype+","
}else{s+=this.data.name+":"+this.data.stype+","
}}else{if(this.data.ctype.length>0){s+=this.data.name+":"+this.data.ctype+","
}else{s+=this.data.name+","
}}}});
if(s.length>0){s=s.slice(0,-1)
}this.setValue(s);
this.dataSource.getAt(this.row).set("value",s);
this.dataSource.commitChanges();
m.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
m.hide()
}.bind(this)}]});
m.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexVardefField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Variable Definitions",addButtonLabel:"Add Variable"});
Ext.form.ComplexDataInputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Data Input",addButtonLabel:"Add Data Input"});
Ext.form.ComplexDataOutputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Data Output",addButtonLabel:"Add Data Output"});
Ext.form.ComplexDataInputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Data Input",addButtonLabel:"Add Data Input",single:true});
Ext.form.ComplexDataOutputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Data Output",addButtonLabel:"Add Data Output",single:true});
Ext.form.ComplexGlobalsField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:"Editor for Globals",addButtonLabel:"Add Global"});
Ext.form.ComplexExpressionField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var d=new Ext.form.TextArea({id:Ext.id(),fieldLabel:"Expression Editor",value:this.value.replace(/\\n/g,"\n"),autoScroll:true});
var a;
var c;
var b=new Ext.Window({layout:"anchor",autoCreate:true,title:"Expression Editor - Press [Ctrl-Z] to activate auto-completion",height:430,width:550,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[d],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){this.setValue(a.getValue().replace(/\r\n|\r|\n/g,"\\n"));
this.dataSource.getAt(this.row).set("value",a.getValue());
this.dataSource.commitChanges();
b.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
b.hide()
}.bind(this)}]});
b.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
a=CodeMirror.fromTextArea(document.getElementById(d.getId()),{mode:"text/x-java",lineNumbers:true,lineWrapping:true,matchBrackets:true,onGutterClick:this.foldFunc,extraKeys:{"Ctrl-Z":function(e){CodeMirror.hint(e,CodeMirror.jbpmHint,b)
}},onCursorActivity:function(){a.setLineClass(c,null,null);
c=a.setLineClass(a.getCursor().line,null,"activeline")
}.bind(this)});
c=a.setLineClass(0,"activeline");
this.grid.stopEditing()
}});
Ext.form.ComplexCalledElementField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}var a=Ext.data.Record.create([{name:"name"},{name:"pkgname"},{name:"imgsrc"}]);
var e=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},a),proxy:e,sorters:[{property:"name",direction:"ASC"}]});
d.load();
var b=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(b.evalJSON(),"$.properties.package");
var f=jsonPath(b.evalJSON(),"$.properties.id");
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:"Loading Process Information.",title:""});
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(j){try{if(j.responseText.length>0&&j.responseText!="false"){var m=Ext.decode(j.responseText);
for(var o in m){var p=o.split("|");
d.add(new a({name:p[0],pkgname:p[1],imgsrc:m[o]}))
}d.commitChanges();
var h=Ext.id();
var g=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:h,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"pid",header:"Process Id",width:200,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pkgn",header:"Package Name",width:200,dataIndex:"pkgname",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pim",header:"Process Image",width:250,dataIndex:"imgsrc",renderer:function(q){if(q&&q.length>0){return'<center><img src="'+ORYX.PATH+"images/page_white_picture.png\" onclick=\"new ImageViewer({title: 'Process Image', width: '650', height: '450', autoScroll: true, fixedcenter: true, src: '"+q+"',hideAction: 'close'}).show();\" alt=\"Click to view Process Image\"/></center>"
}else{return"<center>Process image not available.</center>"
}}}]),autoHeight:true});
g.on("afterrender",function(s){if(this.value.length>0){var q=0;
var t=this.value;
var r=g;
d.data.each(function(){if(this.data.name==t){r.getSelectionModel().select(q,1)
}q++
})
}}.bind(this));
var n=new Ext.Panel({id:"calledElementsPanel",title:'<center>Select Process Id and click "Save" to select.</center>',layout:"column",items:[g],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var l=new Ext.Window({layout:"anchor",autoCreate:true,title:"Editor for Called Elements",height:350,width:680,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){l.hide()
}.bind(this)}],items:[n],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
l.destroy()
}.bind(this)},buttons:[{text:"Save",handler:function(){if(g.getSelectionModel().getSelectedCell()!=null){var q=g.getSelectionModel().getSelectedCell()[0];
var r=d.getAt(q).data.name;
g.stopEditing();
g.getView().refresh();
this.setValue(r);
this.dataSource.getAt(this.row).set("value",r);
this.dataSource.commitChanges();
l.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Please select a process id.",title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
l.hide()
}.bind(this)}]});
l.show();
g.render();
g.fireEvent("afterrender");
this.grid.stopEditing();
g.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find other processes in pacakge.",title:""})
}}catch(k){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error resolving other process info :\n"+k,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Error resolving other process info.",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:c,pid:f}})
}});
Ext.form.ComplexVisualDataAssignmentField=Ext.extend(Ext.form.TriggerField,{onTriggerClick:function(){if(this.disabled){return
}Ext.each(this.dataSource.data.items,function(h){if((h.data.gridProperties.propId=="oryx-assignments")){}});
var f=ORYX.EDITOR.getSerializedJSON();
var a=jsonPath(f.evalJSON(),"$.properties.vardefs");
if(!a){a=""
}var c=jsonPath(f.evalJSON(),"$.properties.globals");
if(!c){c=""
}var g="";
var b=jsonPath(f.evalJSON(),"$.childShapes.*");
for(var e=0;
e<b.length;
e++){if(b[e].stencil.id=="DataObject"){g+=b[e].properties.name;
g+=","
}}if(g.endsWith(",")){g=g.substr(0,g.length-1)
}var d=new Ext.Window({layout:"anchor",autoCreate:true,title:"Visual data associations Editor",height:550,width:850,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){d.hide()
}.bind(this)}],items:[{xtype:"component",id:"visualdataassignmentswindow",autoEl:{tag:"iframe",src:ORYX.BASE_FILE_PATH+"customeditors/visualassignmentseditor.jsp?vars="+a+"&globals="+c+"&dobj="+g,width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
d.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var h=document.getElementById("visualdataassignmentswindow").contentWindow.getEditorValue();
this.setValue(h);
this.dataSource.getAt(this.row).set("value",h);
this.dataSource.commitChanges();
d.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
d.hide()
}.bind(this)}]});
d.show();
this.grid.stopEditing()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.CanvasResize=Clazz.extend({construct:function(a){this.facade=a;
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"N",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"W",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"E",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"S",this.resize.bind(this))
},resize:function(a,c){resizeCanvas=function(k,l,n){var f=n.getCanvas();
var m=f.bounds;
var h=n.getCanvas().getHTMLContainer().parentNode.parentNode;
if(k=="E"||k=="W"){f.setSize({width:(m.width()+l)*f.zoomLevel,height:(m.height())*f.zoomLevel})
}else{if(k=="S"||k=="N"){f.setSize({width:(m.width())*f.zoomLevel,height:(m.height()+l)*f.zoomLevel})
}}if(k=="N"||k=="W"){var g=k=="N"?{x:0,y:l}:{x:l,y:0};
f.getChildNodes(false,function(p){p.bounds.moveBy(g)
});
var j=f.getChildEdges().findAll(function(p){return p.getAllDockedShapes().length>0
});
var o=j.collect(function(p){return p.dockers.findAll(function(q){return !q.getDockedShape()
})
}).flatten();
o.each(function(p){p.bounds.moveBy(g)
})
}else{if(k=="S"){h.scrollTop+=l
}else{if(k=="E"){h.scrollLeft+=l
}}}f.update();
n.updateSelection()
};
var b=ORYX.Core.Command.extend({construct:function(f,h,g){this.position=f;
this.extentionSize=h;
this.facade=g
},execute:function(){resizeCanvas(this.position,this.extentionSize,this.facade)
},rollback:function(){resizeCanvas(this.position,-this.extentionSize,this.facade)
},update:function(){}});
var d=ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
if(c){d=-d
}var e=new b(a,d,this.facade);
this.facade.executeCommands([e])
}});
ORYX.Plugins.CanvasResizeButton=Clazz.extend({construct:function(c,h,m){this.canvas=c;
var j=c.getHTMLContainer().parentNode.parentNode.parentNode;
window.myParent=j;
var d=j.firstChild;
var b=d.firstChild.firstChild;
var a=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",j,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_grow "+h,title:ORYX.I18N.RESIZE.tipGrow+ORYX.I18N.RESIZE[h]}]);
var e=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",j,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_shrink "+h,title:ORYX.I18N.RESIZE.tipShrink+ORYX.I18N.RESIZE[h]}]);
var f=60;
var l=function(o){if(o.target!=j&&o.target!=d&&o.target!=d.firstChild&&o.target!=b&&o.target!=d){return false
}var r=o.layerX;
var q=o.layerY;
if((r-d.scrollLeft)<0||Ext.isSafari){r+=d.scrollLeft
}if((q-d.scrollTop)<0||Ext.isSafari){q+=d.scrollTop
}if(h=="N"){return q<f+d.firstChild.offsetTop
}else{if(h=="W"){return r<f+d.firstChild.offsetLeft
}else{if(h=="E"){var n=(d.offsetWidth-(d.firstChild.offsetLeft+d.firstChild.offsetWidth));
if(n<0){n=0
}return r>d.scrollWidth-n-f
}else{if(h=="S"){var p=(d.offsetHeight-(d.firstChild.offsetTop+d.firstChild.offsetHeight));
if(p<0){p=0
}return q>d.scrollHeight-p-f
}}}}return false
};
var k=(function(){a.show();
var o,u,n,t;
try{var s=this.canvas.getRootNode().childNodes[1].getBBox();
o=s.x;
u=s.y;
n=s.x+s.width;
t=s.y+s.height
}catch(r){this.canvas.getChildShapes(true).each(function(x){var z=x.absoluteBounds();
var y=z.upperLeft();
var w=z.lowerRight();
if(o==undefined){o=y.x;
u=y.y;
n=w.x;
t=w.y
}else{o=Math.min(o,y.x);
u=Math.min(u,y.y);
n=Math.max(n,w.x);
t=Math.max(t,w.y)
}})
}var v=c.bounds.width();
var q=c.bounds.height();
var p=c.getChildNodes().size()==0;
if(h=="N"&&(u>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(p&&q>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{if(h=="E"&&(v-n)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="S"&&(q-t)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="W"&&(o>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(p&&v>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{e.hide()
}}}}}).bind(this);
var g=function(){a.hide();
e.hide()
};
d.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,function(n){if(l(n)){k()
}else{g()
}},false);
a.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(n){k()
},true);
e.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(n){k()
},true);
j.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,function(n){g()
},true);
g();
a.addEventListener("click",function(){m(h);
k()
},true);
e.addEventListener("click",function(){m(h,true);
k()
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.View={facade:undefined,construct:function(b,a){this.facade=b;
this.zoomLevel=1;
this.maxFitToScreenLevel=1.5;
this.minZoomLevel=0.1;
this.maxZoomLevel=2.5;
this.diff=5;
a.properties.each(function(c){if(c.zoomLevel){this.zoomLevel=Number(1)
}if(c.maxFitToScreenLevel){this.maxFitToScreenLevel=Number(c.maxFitToScreenLevel)
}if(c.minZoomLevel){this.minZoomLevel=Number(c.minZoomLevel)
}if(c.maxZoomLevel){this.maxZoomLevel=Number(c.maxZoomLevel)
}}.bind(this));
this.facade.offer({name:ORYX.I18N.View.zoomIn,functionality:this.zoom.bind(this,[1+ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/magnifier_zoom_in.png",description:ORYX.I18N.View.zoomInDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel<this.maxZoomLevel
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomOut,functionality:this.zoom.bind(this,[1-ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/magnifier_zoom_out.png",description:ORYX.I18N.View.zoomOutDesc,index:2,minShape:0,maxShape:0,isEnabled:function(){return this._checkSize()
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomStandard,functionality:this.setAFixZoomLevel.bind(this,1),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/zoom_standard.png",cls:"icon-large",description:ORYX.I18N.View.zoomStandardDesc,index:3,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel!=1
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomFitToModel,functionality:this.zoomFitToModel.bind(this),group:ORYX.I18N.View.group,icon:ORYX.PATH+"images/image.png",description:ORYX.I18N.View.zoomFitToModelDesc,index:4,minShape:0,maxShape:0})
},setAFixZoomLevel:function(a){this.zoomLevel=a;
this._checkZoomLevelRange();
this.zoom(1)
},zoom:function(d){this.zoomLevel*=d;
var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var c=this.facade.getCanvas();
var g=c.bounds.width()*this.zoomLevel;
var a=c.bounds.height()*this.zoomLevel;
var f=(c.node.parentNode.parentNode.parentNode.offsetHeight-a)/2;
f=f>20?f-20:0;
c.node.parentNode.parentNode.style.marginTop=f+"px";
f+=5;
c.getHTMLContainer().style.top=f+"px";
var b=h.scrollTop-Math.round((c.getHTMLContainer().parentNode.getHeight()-a)/2)+this.diff;
var e=h.scrollLeft-Math.round((c.getHTMLContainer().parentNode.getWidth()-g)/2)+this.diff;
c.setSize({width:g,height:a},true);
c.node.setAttributeNS(null,"transform","scale("+this.zoomLevel+")");
this.facade.updateSelection();
h.scrollTop=b;
h.scrollLeft=e;
c.zoomLevel=this.zoomLevel
},zoomFitToModel:function(){var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var b=h.getHeight()-30;
var d=h.getWidth()-30;
var c=this.facade.getCanvas().getChildShapes();
if(!c||c.length<1){return false
}var g=c[0].absoluteBounds().clone();
c.each(function(j){g.include(j.absoluteBounds().clone())
});
var f=d/g.width();
var a=b/g.height();
var e=a<f?a:f;
if(e>this.maxFitToScreenLevel){e=this.maxFitToScreenLevel
}this.setAFixZoomLevel(e);
h.scrollTop=Math.round(g.upperLeft().y*this.zoomLevel)-5;
h.scrollLeft=Math.round(g.upperLeft().x*this.zoomLevel)-5
},_checkSize:function(){var a=this.facade.getCanvas().getHTMLContainer().parentNode;
var b=Math.min((a.parentNode.getWidth()/a.getWidth()),(a.parentNode.getHeight()/a.getHeight()));
return 1.05>b
},_checkZoomLevelRange:function(){if(this.zoomLevel<this.minZoomLevel){this.zoomLevel=this.minZoomLevel
}if(this.zoomLevel>this.maxZoomLevel){this.zoomLevel=this.maxZoomLevel
}}};
ORYX.Plugins.View=Clazz.extend(ORYX.Plugins.View);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDropResize=ORYX.Plugins.AbstractPlugin.extend({construct:function(b){this.facade=b;
this.currentShapes=[];
this.toMoveShapes=[];
this.distPoints=[];
this.isResizing=false;
this.dragEnable=false;
this.dragIntialized=false;
this.edgesMovable=true;
this.offSetPosition={x:0,y:0};
this.faktorXY={x:1,y:1};
this.containmentParentNode;
this.isAddingAllowed=false;
this.isAttachingAllowed=false;
this.callbackMouseMove=this.handleMouseMove.bind(this);
this.callbackMouseUp=this.handleMouseUp.bind(this);
var a=this.facade.getCanvas().getSvgContainer();
this.selectedRect=new ORYX.Plugins.SelectedRect(a);
if(ORYX.CONFIG.SHOW_GRIDLINE){this.vLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_VERTICAL);
this.hLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_HORIZONTAL)
}a=this.facade.getCanvas().getHTMLContainer();
this.scrollNode=this.facade.getCanvas().rootNode.parentNode.parentNode;
this.resizerSE=new ORYX.Plugins.Resizer(a,"southeast",this.facade);
this.resizerSE.registerOnResize(this.onResize.bind(this));
this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this));
this.resizerNW=new ORYX.Plugins.Resizer(a,"northwest",this.facade);
this.resizerNW.registerOnResize(this.onResize.bind(this));
this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},handleMouseDown:function(d,c){if(!this.dragBounds||!this.currentShapes.member(c)||!this.toMoveShapes.length){return
}this.dragEnable=true;
this.dragIntialized=true;
this.edgesMovable=true;
var b=this.facade.getCanvas().node.getScreenCTM();
this.faktorXY.x=b.a;
this.faktorXY.y=b.d;
var e=this.dragBounds.upperLeft();
this.offSetPosition={x:Event.pointerX(d)-(e.x*this.faktorXY.x),y:Event.pointerY(d)-(e.y*this.faktorXY.y)};
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
return
},handleMouseUp:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"});
if(this.dragEnable){if(!this.dragIntialized){this.afterDrag();
if(this.isAttachingAllowed&&this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0){var b=this.facade.eventCoordinates(d);
var e=this.toMoveShapes[0].dockers[0];
var c=ORYX.Core.Command.extend({construct:function(j,f,h,g){this.docker=j;
this.newPosition=f;
this.newDockedShape=h;
this.newParent=h.parent||g.getCanvas();
this.oldPosition=j.parent.bounds.center();
this.oldDockedShape=j.getDockedShape();
this.oldParent=j.parent.parent||g.getCanvas();
this.facade=g;
if(this.oldDockedShape){this.oldPosition=j.parent.absoluteBounds().center()
}},execute:function(){this.dock(this.newDockedShape,this.newParent,this.newPosition);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,excludeCommand:true})
},rollback:function(){this.dock(this.oldDockedShape,this.oldParent,this.oldPosition)
},dock:function(f,g,h){g.add(this.docker.parent);
this.docker.setDockedShape(undefined);
this.docker.bounds.centerMoveTo(h);
this.docker.setDockedShape(f);
this.facade.setSelection([this.docker.parent]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var a=[new c(e,b,this.containmentParentNode,this.facade)];
this.facade.executeCommands(a)
}else{if(this.isAddingAllowed){this.refreshSelectedShapes()
}}this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_END})
}if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}this.dragEnable=false;
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
return
},handleMouseMove:function(g){if(!this.dragEnable){return
}if(this.dragIntialized){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_START});
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
this._onlyEdges=this.currentShapes.all(function(c){return(c instanceof ORYX.Core.Edge)
});
this.beforeDrag();
this._currentUnderlyingNodes=[]
}var a={x:Event.pointerX(g)-this.offSetPosition.x,y:Event.pointerY(g)-this.offSetPosition.y};
a.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
a.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
var b=g.shiftKey||g.ctrlKey;
if(ORYX.CONFIG.GRID_ENABLED&&!b){a=this.snapToGrid(a)
}else{if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}a.x/=this.faktorXY.x;
a.y/=this.faktorXY.y;
a.x=Math.max(0,a.x);
a.y=Math.max(0,a.y);
var h=this.facade.getCanvas();
a.x=Math.min(h.bounds.width()-this.dragBounds.width(),a.x);
a.y=Math.min(h.bounds.height()-this.dragBounds.height(),a.y);
this.dragBounds.moveTo(a);
this.resizeRectangle(this.dragBounds);
this.isAttachingAllowed=false;
var d=$A(this.facade.getCanvas().getAbstractShapesAtPosition(this.facade.eventCoordinates(g)));
var f=this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0;
f=f&&d.length!=1;
if(!f&&d.length===this._currentUnderlyingNodes.length&&d.all(function(j,c){return this._currentUnderlyingNodes[c]===j
}.bind(this))){return
}else{if(this._onlyEdges){this.isAddingAllowed=true;
this.containmentParentNode=this.facade.getCanvas()
}else{var e={event:g,underlyingNodes:d,checkIfAttachable:f};
this.checkRules(e)
}}this._currentUnderlyingNodes=d.reverse();
if(this.isAttachingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.attached",elements:[this.containmentParentNode],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"})
}if(!this.isAttachingAllowed){if(this.isAddingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_INVALID_COLOR})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"})
}return
},checkRules:function(d){var f=d.event;
var c=d.underlyingNodes;
var e=d.checkIfAttachable;
var b=d.noEdges;
this.containmentParentNode=c.reverse().find((function(g){return(g instanceof ORYX.Core.Canvas)||(((g instanceof ORYX.Core.Node)||((g instanceof ORYX.Core.Edge)&&!b))&&(!(this.currentShapes.member(g)||this.currentShapes.any(function(h){return(h.children.length>0&&h.getChildNodes(true).member(g))
}))))
}).bind(this));
if(e&&this.containmentParentNode){this.isAttachingAllowed=this.facade.getRules().canConnect({sourceShape:this.containmentParentNode,edgeShape:this.toMoveShapes[0],targetShape:this.toMoveShapes[0]});
if(this.isAttachingAllowed){var a=this.facade.eventCoordinates(f);
this.isAttachingAllowed=this.containmentParentNode.isPointOverOffset(a.x,a.y)
}}if(!this.isAttachingAllowed){this.isAddingAllowed=this.toMoveShapes.all((function(g){if(g instanceof ORYX.Core.Edge||g instanceof ORYX.Core.Controls.Docker||this.containmentParentNode===g.parent){return true
}else{if(this.containmentParentNode!==g){if(!(this.containmentParentNode instanceof ORYX.Core.Edge)||!b){if(this.facade.getRules().canContain({containingShape:this.containmentParentNode,containedShape:g})){return true
}}}}return false
}).bind(this))
}if(!this.isAttachingAllowed&&!this.isAddingAllowed&&(this.containmentParentNode instanceof ORYX.Core.Edge)){d.noEdges=true;
d.underlyingNodes.reverse();
this.checkRules(d)
}},refreshSelectedShapes:function(){if(!this.dragBounds){return
}var d=this.dragBounds.upperLeft();
var b=this.oldDragBounds.upperLeft();
var c={x:d.x-b.x,y:d.y-b.y};
var a=[new ORYX.Core.Command.Move(this.toMoveShapes,c,this.containmentParentNode,this.currentShapes,this)];
if(this._undockedEdgesCommand instanceof ORYX.Core.Command){a.unshift(this._undockedEdgesCommand)
}this.facade.executeCommands(a);
if(this.dragBounds){this.oldDragBounds=this.dragBounds.clone()
}},onResize:function(a){if(!this.dragBounds){return
}this.dragBounds=a;
this.isResizing=true;
this.resizeRectangle(this.dragBounds)
},onResizeStart:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_START})
},onResizeEnd:function(){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}if(this.isResizing){var a=ORYX.Core.Command.extend({construct:function(f,h,g){this.shape=f;
this.oldBounds=f.bounds.clone();
this.newBounds=h;
this.plugin=g
},execute:function(){this.shape.bounds.set(this.newBounds.a,this.newBounds.b);
this.update(this.getOffset(this.oldBounds,this.newBounds))
},rollback:function(){this.shape.bounds.set(this.oldBounds.a,this.oldBounds.b);
this.update(this.getOffset(this.newBounds,this.oldBounds))
},getOffset:function(g,f){return{x:f.a.x-g.a.x,y:f.a.y-g.a.y,xs:f.width()/g.width(),ys:f.height()/g.height()}
},update:function(g){this.shape.getLabels().each(function(h){h.changed()
});
var f=[].concat(this.shape.getIncomingShapes()).concat(this.shape.getOutgoingShapes()).findAll(function(h){return h instanceof ORYX.Core.Edge
}.bind(this));
this.plugin.layoutEdges(this.shape,f,g);
this.plugin.facade.setSelection([this.shape]);
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
}});
var c=this.dragBounds.clone();
var b=this.currentShapes[0];
if(b.parent){var e=b.parent.absoluteXY();
c.moveBy(-e.x,-e.y)
}var d=new a(b,c,this);
this.facade.executeCommands([d]);
this.isResizing=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_END})
}},beforeDrag:function(){var a=ORYX.Core.Command.extend({construct:function(b){this.dockers=b.collect(function(c){return c instanceof ORYX.Core.Controls.Docker?{docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(b){b.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(b){b.docker.setDockedShape(b.dockedShape);
b.docker.setReferencePoint(b.refPoint)
})
}});
this._undockedEdgesCommand=new a(this.toMoveShapes);
this._undockedEdgesCommand.execute()
},hideAllLabels:function(a){a.getLabels().each(function(b){b.hide()
});
a.getAllDockedShapes().each(function(b){var c=b.getLabels();
if(c.length>0){c.each(function(d){d.hide()
})
}});
a.getChildren().each((function(b){if(b instanceof ORYX.Core.Shape){this.hideAllLabels(b)
}}).bind(this))
},afterDrag:function(){},showAllLabels:function(a){for(var d=0;
d<a.length;
d++){var b=a[d];
b.show()
}var f=a.getAllDockedShapes();
for(var d=0;
d<f.length;
d++){var c=f[d];
var g=c.getLabels();
if(g.length>0){g.each(function(h){h.show()
})
}}for(var d=0;
d<a.children.length;
d++){var e=a.children[d];
if(e instanceof ORYX.Core.Shape){this.showAllLabels(e)
}}},onSelectionChanged:function(b){var d=b.elements;
this.dragEnable=false;
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
if(!d||d.length==0){this.selectedRect.hide();
this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined;
this.oldDragBounds=undefined
}else{this.currentShapes=d;
var e=this.facade.getCanvas().getShapesWithSharedParent(d);
this.toMoveShapes=e;
this.toMoveShapes=this.toMoveShapes.findAll(function(f){return f instanceof ORYX.Core.Node&&(f.dockers.length===0||!d.member(f.dockers.first().getDockedShape()))
});
d.each((function(f){if(!(f instanceof ORYX.Core.Edge)){return
}var h=f.getDockers();
var j=d.member(h.first().getDockedShape());
var g=d.member(h.last().getDockedShape());
if(!j&&!g){var k=!h.first().getDockedShape()&&!h.last().getDockedShape();
if(k){this.toMoveShapes=this.toMoveShapes.concat(h)
}}if(f.dockers.length>2&&j&&g){this.toMoveShapes=this.toMoveShapes.concat(h.findAll(function(m,l){return l>0&&l<h.length-1
}))
}}).bind(this));
var c=undefined;
this.toMoveShapes.each(function(g){var f=g;
if(g instanceof ORYX.Core.Controls.Docker){f=g.parent
}if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}}.bind(this));
if(!c){d.each(function(f){if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}})
}this.dragBounds=c;
this.oldDragBounds=c.clone();
this.resizeRectangle(c);
this.selectedRect.show();
if(d.length==1&&d[0].isResizable){var a=d[0].getStencil().fixedAspectRatio()?d[0].bounds.width()/d[0].bounds.height():undefined;
this.resizerSE.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerSE.show();
this.resizerNW.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerNW.show()
}else{this.resizerSE.setBounds(undefined);
this.resizerNW.setBounds(undefined)
}if(ORYX.CONFIG.GRID_ENABLED){this.distPoints=[];
if(this.distPointTimeout){window.clearTimeout(this.distPointTimeout)
}this.distPointTimeout=window.setTimeout(function(){var f=this.facade.getCanvas().getChildShapes(true).findAll(function(h){var g=h.parent;
while(g){if(d.member(g)){return false
}g=g.parent
}return true
});
f.each((function(k){if(!(k instanceof ORYX.Core.Edge)){var h=k.absoluteXY();
var j=k.bounds.width();
var g=k.bounds.height();
this.distPoints.push({ul:{x:h.x,y:h.y},c:{x:h.x+(j/2),y:h.y+(g/2)},lr:{x:h.x+j,y:h.y+g}})
}}).bind(this))
}.bind(this),10)
}}},snapToGrid:function(h){var a=this.dragBounds;
var o={};
var n=6;
var l=10;
var p=6;
var b=this.vLine?this.vLine.getScale():1;
var k={x:(h.x/b),y:(h.y/b)};
var m={x:(h.x/b)+(a.width()/2),y:(h.y/b)+(a.height()/2)};
var g={x:(h.x/b)+(a.width()),y:(h.y/b)+(a.height())};
var f,d;
var j,e;
this.distPoints.each(function(r){var c,t,s,q;
if(Math.abs(r.c.x-m.x)<l){c=r.c.x-m.x;
s=r.c.x
}if(Math.abs(r.c.y-m.y)<l){t=r.c.y-m.y;
q=r.c.y
}if(c!==undefined){f=f===undefined?c:(Math.abs(c)<Math.abs(f)?c:f);
if(f===c){j=s
}}if(t!==undefined){d=d===undefined?t:(Math.abs(t)<Math.abs(d)?t:d);
if(d===t){e=q
}}});
if(f!==undefined){k.x+=f;
k.x*=b;
if(this.vLine&&j){this.vLine.update(j)
}}else{k.x=(h.x-(h.x%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.vLine){this.vLine.hide()
}}if(d!==undefined){k.y+=d;
k.y*=b;
if(this.hLine&&e){this.hLine.update(e)
}}else{k.y=(h.y-(h.y%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.hLine){this.hLine.hide()
}}return k
},showGridLine:function(){},resizeRectangle:function(a){this.selectedRect.resize(a)
}});
ORYX.Plugins.SelectedRect=Clazz.extend({construct:function(a){this.parentId=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",$(a),["g"]);
this.dashedArea=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["rect",{x:0,y:0,"stroke-width":1,stroke:"#777777",fill:"none","stroke-dasharray":"2,2","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","")
},resize:function(a){var c=a.upperLeft();
var b=ORYX.CONFIG.SELECTED_AREA_PADDING;
this.dashedArea.setAttributeNS(null,"width",a.width()+2*b);
this.dashedArea.setAttributeNS(null,"height",a.height()+2*b);
this.node.setAttributeNS(null,"transform","translate("+(c.x-b)+", "+(c.y-b)+")")
}});
ORYX.Plugins.GridLine=Clazz.extend({construct:function(b,a){if(ORYX.Plugins.GridLine.DIR_HORIZONTAL!==a&&ORYX.Plugins.GridLine.DIR_VERTICAL!==a){a=ORYX.Plugins.GridLine.DIR_HORIZONTAL
}this.parent=$(b);
this.direction=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parent,["g"]);
this.line=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":1,stroke:"silver",fill:"none","stroke-dasharray":"5,5","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","")
},getScale:function(){try{return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a
}catch(a){return 1
}},update:function(e){if(this.direction===ORYX.Plugins.GridLine.DIR_HORIZONTAL){var d=e instanceof Object?e.y:e;
var c=this.parent.parentNode.parentNode.width.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M 0 "+d+" L "+c+" "+d)
}else{var a=e instanceof Object?e.x:e;
var b=this.parent.parentNode.parentNode.height.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M"+a+" 0 L "+a+" "+b)
}this.show()
}});
ORYX.Plugins.GridLine.DIR_HORIZONTAL="hor";
ORYX.Plugins.GridLine.DIR_VERTICAL="ver";
ORYX.Plugins.Resizer=Clazz.extend({construct:function(c,a,b){this.parentId=c;
this.orientation=a;
this.facade=b;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":"resizer_"+this.orientation,style:"left:0px; top:0px;"}]);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this),false);
this.dragEnable=false;
this.offSetPosition={x:0,y:0};
this.bounds=undefined;
this.canvasNode=this.facade.getCanvas().node;
this.minSize=undefined;
this.maxSize=undefined;
this.aspectRatio=undefined;
this.resizeCallbacks=[];
this.resizeStartCallbacks=[];
this.resizeEndCallbacks=[];
this.hide();
this.scrollNode=this.node.parentNode.parentNode.parentNode
},handleMouseDown:function(a){this.dragEnable=true;
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
this.offSetPosition={x:Event.pointerX(a)-this.position.x,y:Event.pointerY(a)-this.position.y};
this.resizeStartCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseUp:function(a){this.dragEnable=false;
this.containmentParentNode=null;
this.resizeEndCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseMove:function(c){if(!this.dragEnable){return
}if(c.shiftKey||c.ctrlKey){this.aspectRatio=this.bounds.width()/this.bounds.height()
}else{this.aspectRatio=undefined
}var b={x:Event.pointerX(c)-this.offSetPosition.x,y:Event.pointerY(c)-this.offSetPosition.y};
b.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
b.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
b.x=Math.min(b.x,this.facade.getCanvas().bounds.width());
b.y=Math.min(b.y,this.facade.getCanvas().bounds.height());
var d={x:b.x-this.position.x,y:b.y-this.position.y};
if(this.aspectRatio){newAspectRatio=(this.bounds.width()+d.x)/(this.bounds.height()+d.y);
if(newAspectRatio>this.aspectRatio){d.x=this.aspectRatio*(this.bounds.height()+d.y)-this.bounds.width()
}else{if(newAspectRatio<this.aspectRatio){d.y=(this.bounds.width()+d.x)/this.aspectRatio-this.bounds.height()
}}}if(this.orientation==="northwest"){if(this.bounds.width()-d.x>this.maxSize.width){d.x=-(this.maxSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()-d.x<this.minSize.width){d.x=-(this.minSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()-d.y>this.maxSize.height){d.y=-(this.maxSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()-d.y<this.minSize.height){d.y=-(this.minSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}else{if(this.bounds.width()+d.x>this.maxSize.width){d.x=this.maxSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()+d.x<this.minSize.width){d.x=this.minSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()+d.y>this.maxSize.height){d.y=this.maxSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()+d.y<this.minSize.height){d.y=this.minSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}if(this.orientation==="northwest"){var a={x:this.bounds.lowerRight().x,y:this.bounds.lowerRight().y};
this.bounds.extend({x:-d.x,y:-d.y});
this.bounds.moveBy(d)
}else{this.bounds.extend(d)
}this.update();
this.resizeCallbacks.each((function(e){e(this.bounds)
}).bind(this));
Event.stop(c)
},registerOnResizeStart:function(a){if(!this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks.push(a)
}},unregisterOnResizeStart:function(a){if(this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks=this.resizeStartCallbacks.without(a)
}},registerOnResizeEnd:function(a){if(!this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks.push(a)
}},unregisterOnResizeEnd:function(a){if(this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks=this.resizeEndCallbacks.without(a)
}},registerOnResize:function(a){if(!this.resizeCallbacks.member(a)){this.resizeCallbacks.push(a)
}},unregisterOnResize:function(a){if(this.resizeCallbacks.member(a)){this.resizeCallbacks=this.resizeCallbacks.without(a)
}},hide:function(){this.node.style.display="none"
},show:function(){if(this.bounds){this.node.style.display=""
}},setBounds:function(d,b,a,c){this.bounds=d;
if(!b){b={width:ORYX.CONFIG.MINIMUM_SIZE,height:ORYX.CONFIG.MINIMUM_SIZE}
}if(!a){a={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}this.minSize=b;
this.maxSize=a;
this.aspectRatio=c;
this.update()
},update:function(){if(!this.bounds){return
}var c=this.bounds.upperLeft();
if(this.bounds.width()<this.minSize.width){this.bounds.set(c.x,c.y,c.x+this.minSize.width,c.y+this.bounds.height())
}if(this.bounds.height()<this.minSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.minSize.height)
}if(this.bounds.width()>this.maxSize.width){this.bounds.set(c.x,c.y,c.x+this.maxSize.width,c.y+this.bounds.height())
}if(this.bounds.height()>this.maxSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.maxSize.height)
}var b=this.canvasNode.getScreenCTM();
c.x*=b.a;
c.y*=b.d;
if(this.orientation==="northwest"){c.x-=13;
c.y-=26
}else{c.x+=(b.a*this.bounds.width())+3;
c.y+=(b.d*this.bounds.height())+3
}this.position=c;
this.node.style.left=this.position.x+"px";
this.node.style.top=this.position.y+"px"
}});
ORYX.Core.Command.Move=ORYX.Core.Command.extend({construct:function(b,e,c,a,d){this.moveShapes=b;
this.selectedShapes=a;
this.offset=e;
this.plugin=d;
this.newParents=b.collect(function(f){return c||f.parent
});
this.oldParents=b.collect(function(f){return f.parent
});
this.dockedNodes=b.findAll(function(f){return f instanceof ORYX.Core.Node&&f.dockers.length==1
}).collect(function(f){return{docker:f.dockers[0],dockedShape:f.dockers[0].getDockedShape(),refPoint:f.dockers[0].referencePoint}
})
},execute:function(){this.dockAllShapes();
this.move(this.offset);
this.addShapeToParent(this.newParents);
this.selectCurrentShapes();
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
},rollback:function(){var a={x:-this.offset.x,y:-this.offset.y};
this.move(a);
this.addShapeToParent(this.oldParents);
this.dockAllShapes(true);
this.selectCurrentShapes();
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
},move:function(d,a){for(var g=0;
g<this.moveShapes.length;
g++){var l=this.moveShapes[g];
l.bounds.moveBy(d);
if(l instanceof ORYX.Core.Node){(l.dockers||[]).each(function(j){j.bounds.moveBy(d)
});
var e=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(j){return j instanceof ORYX.Core.Edge&&!this.moveShapes.any(function(k){return k==j||(k instanceof ORYX.Core.Controls.Docker&&k.parent==j)
})
}.bind(this)).findAll(function(j){return(j.dockers.first().getDockedShape()==l||!this.moveShapes.include(j.dockers.first().getDockedShape()))&&(j.dockers.last().getDockedShape()==l||!this.moveShapes.include(j.dockers.last().getDockedShape()))
}.bind(this));
this.plugin.layoutEdges(l,e,d);
var h=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(j){return j instanceof ORYX.Core.Edge&&j.dockers.first().isDocked()&&j.dockers.last().isDocked()&&!this.moveShapes.include(j)&&!this.moveShapes.any(function(k){return k==j||(k instanceof ORYX.Core.Controls.Docker&&k.parent==j)
})
}.bind(this)).findAll(function(j){return this.moveShapes.indexOf(j.dockers.first().getDockedShape())>g||this.moveShapes.indexOf(j.dockers.last().getDockedShape())>g
}.bind(this));
for(var f=0;
f<h.length;
f++){for(var b=1;
b<h[f].dockers.length-1;
b++){var c=h[f].dockers[b];
if(!c.getDockedShape()&&!this.moveShapes.include(c)){c.bounds.moveBy(d)
}}}}}},dockAllShapes:function(a){for(var b=0;
b<this.dockedNodes.length;
b++){var c=this.dockedNodes[b].docker;
c.setDockedShape(a?this.dockedNodes[b].dockedShape:undefined);
if(c.getDockedShape()){c.setReferencePoint(this.dockedNodes[b].refPoint)
}}},addShapeToParent:function(e){for(var f=0;
f<this.moveShapes.length;
f++){var d=this.moveShapes[f];
if(d instanceof ORYX.Core.Node&&d.parent!==e[f]){var g=e[f].absoluteXY();
var h=d.absoluteXY();
var c=h.x-g.x;
var j=h.y-g.y;
e[f].add(d);
d.getOutgoingShapes((function(b){if(b instanceof ORYX.Core.Node&&!this.moveShapes.member(b)){e[f].add(b)
}}).bind(this));
if(d instanceof ORYX.Core.Node&&d.dockers.length==1){var a=d.bounds;
c+=a.width()/2;
j+=a.height()/2;
d.dockers.first().bounds.centerMoveTo(c,j)
}else{d.bounds.moveTo(c,j)
}}}},selectCurrentShapes:function(){this.plugin.facade.setSelection(this.selectedShapes)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RenameShapes=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,this.actOnDBLClick.bind(this));
this.facade.offer({keyCodes:[{keyCode:113,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.renamePerF2.bind(this)});
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.hide.bind(this),true);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE,this.registerTemplate.bind(this));
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_REGISTER_LABEL_TEMPLATE,empty:true})
},registerTemplate:function(a){this.label_templates=this.label_templates||[];
this.label_templates.push({edit:"function"==typeof(a.edit_template)?a.edit_template:function(b){return b
},render:"function"==typeof(a.render_template)?a.render_template:function(b){return b
}})
},renamePerF2:function renamePerF2(){var a=this.facade.getSelection();
this.actOnDBLClick(undefined,a.first())
},getEditableProperties:function getEditableProperties(a){var b=a.getStencil().properties().findAll(function(c){return(c.refToView()&&c.refToView().length>0&&c.directlyEditable())
});
return b.findAll(function(c){return !c.readonly()&&c.type()==ORYX.CONFIG.TYPE_STRING
})
},getPropertyForLabel:function getPropertyForLabel(c,a,b){return c.find(function(d){return d.refToView().any(function(e){return b.id==a.id+e
})
})
},actOnDBLClick:function actOnDBLClick(h,d){if(!(d instanceof ORYX.Core.Shape)){return
}this.destroy();
var e=this.getEditableProperties(d);
var f=e.collect(function(l){return l.refToView()
}).flatten().compact();
var b=d.getLabels().findAll(function(l){return f.any(function(m){return l.id.endsWith(m)
})
});
if(b.length==0){return
}var c=b.length==1?b[0]:null;
if(!c){c=b.find(function(l){return l.node==h.target||l.node==h.target.parentNode
});
if(!c){var j=this.facade.eventCoordinates(h);
var k=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
j.x*=k.a;
j.y*=k.d;
if(!d instanceof ORYX.Core.Node){var g=b.collect(function(n){var m=this.getCenterPosition(n.node);
var l=Math.sqrt(Math.pow(m.x-j.x,2)+Math.pow(m.y-j.y,2));
return{diff:l,label:n}
}.bind(this));
g.sort(function(m,l){return m.diff>l.diff
});
c=g[0].label
}else{var g=b.collect(function(n){var m=this.getDifferenceCenterForNode(n.node);
var l=Math.sqrt(Math.pow(m.x-j.x,2)+Math.pow(m.y-j.y,2));
return{diff:l,label:n}
}.bind(this));
g.sort(function(m,l){return m.diff>l.diff
});
c=g[0].label
}}}var a=this.getPropertyForLabel(e,d,c);
this.showTextField(d,a,c)
},showTextField:function showTextField(h,c,j){var g=this.facade.getCanvas().getHTMLContainer().id;
var e;
if(!(h instanceof ORYX.Core.Node)){var a=j.node.getBoundingClientRect();
e=Math.max(150,a.width)
}else{e=h.bounds.width()
}if(!h instanceof ORYX.Core.Node){var b=this.getCenterPosition(j.node);
b.x-=(e/2)
}else{var b=h.absoluteBounds().center();
b.x-=(e/2)
}var d=c.prefix()+"-"+c.id();
var f={renderTo:g,value:(function(m,l,k){this.label_templates.forEach(function(n){try{m=n.edit(m,l,k)
}catch(o){ORYX.Log.error("Unable to render label template",o,n.edit)
}});
return m
}.bind(this))(h.properties[d],d,h),x:(b.x<10)?10:b.x,y:b.y,width:Math.max(100,e),style:"position:absolute",allowBlank:c.optional(),maxLength:c.length(),emptyText:c.title(),cls:"x_form_text_set_absolute",listeners:{specialkey:this._specialKeyPressed.bind(this)}};
if(c.wrapLines()){f.y-=30;
f.grow=true;
this.shownTextField=new Ext.form.TextArea(f)
}else{f.y-=16;
this.shownTextField=new Ext.form.TextField(f)
}this.shownTextField.focus();
this.shownTextField.on("blur",this.destroy.bind(this));
this.shownTextField.on("change",function(o,p){var n=h;
var l=n.properties[d];
var q=(function(u,t,s){this.label_templates.forEach(function(v){try{u=v.render(u,t,s)
}catch(w){ORYX.Log.error("Unable to render label template",w,v.render)
}});
return u
}.bind(this))(p,d,h);
var m=this.facade;
if(l!=q){var k=ORYX.Core.Command.extend({construct:function(){this.el=n;
this.propId=d;
this.oldValue=l;
this.newValue=q;
this.facade=m
},execute:function(){this.el.setProperty(this.propId,this.newValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.el.setProperty(this.propId,this.oldValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var r=new k();
this.facade.executeCommands([r])
}}.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
},_specialKeyPressed:function _specialKeyPressed(c,b){var a=b.getKey();
if(a==13&&(b.shiftKey||!c.initialConfig.grow)){c.fireEvent("change",null,c.getValue());
c.fireEvent("blur")
}else{if(a==b.ESC){c.fireEvent("blur")
}}},getCenterPosition:function(f){var a={x:0,y:0};
var c=f.getTransformToElement(this.facade.getCanvas().rootNode.lastChild);
var h=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
var b=f.getTransformToElement(f.parentNode);
var d=undefined;
a.x=c.e-b.e;
a.y=c.f-b.f;
try{d=f.getBBox()
}catch(g){}if(d===null||typeof d==="undefined"||d.width==0||d.height==0){d={x:Number(f.getAttribute("x")),y:Number(f.getAttribute("y")),width:0,height:0}
}a.x+=d.x;
a.y+=d.y;
a.x+=d.width/2;
a.y+=d.height/2;
a.x*=h.a;
a.y*=h.d;
return a
},getDifferenceCenterForNode:function getDifferenceCenterForNode(b){var a=this.getCenterPosition(b);
a.x=0;
a.y=a.y+10;
return a
},hide:function(a){if(this.shownTextField&&(!a||!this.shownTextField.el||a.target!==this.shownTextField.el.dom)){this.shownTextField.onBlur()
}},destroy:function(a){if(this.shownTextField){this.shownTextField.destroy();
delete this.shownTextField;
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ERDFSupport=Clazz.extend({facade:undefined,ERDFServletURL:"/erdfsupport",construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.ERDFSupport.exp,functionality:this.exportERDF.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/erdf_export_icon.png",description:ORYX.I18N.ERDFSupport.expDesc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.ERDFSupport.imp,functionality:this.importERDF.bind(this),group:"Export",dropDownGroupIcon:ORYX.PATH+"images/import.png",icon:ORYX.PATH+"images/erdf_import_icon.png",description:ORYX.I18N.ERDFSupport.impDesc,index:1,minShape:0,maxShape:0})
},importERDF:function(){this._showImportDialog()
},exportERDF:function(){Ext.Msg.show({title:ORYX.I18N.ERDFSupport.deprTitle,msg:ORYX.I18N.ERDFSupport.deprText,buttons:Ext.Msg.YESNO,fn:function(b){if(b==="yes"){var a=this.facade.getERDF();
this.openDownloadWindow(window.document.title+".xml",a)
}}.bind(this),icon:Ext.MessageBox.WARNING})
},sendRequest:function(b,d,e,a){var c=false;
new Ajax.Request(b,{method:"POST",asynchronous:false,parameters:d,onSuccess:function(f){c=true;
if(e){e(f.result)
}}.bind(this),onFailure:function(f){if(a){a()
}else{Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.ERDFSupport.impFailed);
ORYX.log.warn("Import ERDF failed: "+f.responseText)
}}.bind(this)});
return c
},loadERDF:function(b,e,a){var c=b;
c=c.startsWith("<?xml")?c:'<?xml version="1.0" encoding="utf-8"?>'+c+"";
var f=new DOMParser();
var d=f.parseFromString(c,"text/xml");
if(d.firstChild.tagName=="parsererror"){Ext.MessageBox.show({title:ORYX.I18N.ERDFSupport.error,msg:ORYX.I18N.ERDFSupport.impFailed2+d.firstChild.textContent.escapeHTML(),buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.ERROR});
if(a){a()
}}else{if(!this.hasStencilSet(d)){if(a){a()
}}else{this.facade.importERDF(d);
if(e){e()
}}}},hasStencilSet:function(e){var a=function(f,g){return $A(f.getElementsByTagName("div")).findAll(function(h){return $A(h.attributes).any(function(j){return j.nodeName=="class"&&j.nodeValue==g
})
})
};
var b=a(e,"-oryx-canvas")[0];
if(!b){this.throwWarning(ORYX.I18N.ERDFSupport.noCanvas);
return false
}var c=$A(b.getElementsByTagName("a")).find(function(f){return f.getAttribute("rel")=="oryx-stencilset"
});
if(!c){this.throwWarning(ORYX.I18N.ERDFSupport.noSS);
return false
}var d=c.getAttribute("href").split("/");
d=d[d.length-2]+"/"+d[d.length-1];
return true
},throwWarning:function(a){Ext.MessageBox.show({title:ORYX.I18N.Oryx.title,msg:a,buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.WARNING})
},openXMLWindow:function(a){var b=window.open("data:application/xml,"+encodeURIComponent(a),"_blank","resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes")
},openDownloadWindow:function(b,c){var d=window.open("");
if(d!=null){d.document.open();
d.document.write("<html><body>");
var a=d.document.createElement("form");
d.document.body.appendChild(a);
a.appendChild(this.createHiddenElement("download",c));
a.appendChild(this.createHiddenElement("file",b));
a.method="POST";
d.document.write("</body></html>");
d.document.close();
a.action=ORYX.PATH+"/download";
a.submit()
}},createHiddenElement:function(a,b){var c=document.createElement("input");
c.name=a;
c.type="hidden";
c.value=b;
return c
},_showImportDialog:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.ERDFSupport.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.ERDFSupport.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.ERDFSupport.impERDF,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.ERDFSupport.impBtn,handler:function(){var d=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.ERDFSupport.impProgress});
d.show();
window.setTimeout(function(){var e=c.items.items[2].getValue();
this.loadERDF(e,function(){d.hide();
b.hide()
}.bind(this),function(){d.hide()
}.bind(this))
}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.ERDFSupport.close,handler:function(){b.hide()
}.bind(this)}]});
b.on("hide",function(){b.destroy(true);
delete b
});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(d){var e=d.target.files[0].getAsText("UTF-8");
c.items.items[2].setValue(e)
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.JSONSupport=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.JSONSupport.exp.name,functionality:this.exportJSON.bind(this),group:ORYX.I18N.JSONSupport.exp.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_javascript.png",description:ORYX.I18N.JSONSupport.exp.desc,index:0,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.JSONSupport.imp.name,functionality:this.showImportDialog.bind(this),group:ORYX.I18N.JSONSupport.imp.group,dropDownGroupIcon:ORYX.PATH+"images/import.png",icon:ORYX.PATH+"images/page_white_javascript.png",description:ORYX.I18N.JSONSupport.imp.desc,index:1,minShape:0,maxShape:0})
},exportJSON:function(){var a=this.facade.getSerializedJSON();
this.openDownloadWindow(window.document.title+".json",a)
},showImportDialog:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.JSONSupport.imp.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.JSONSupport.imp.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.JSONSupport.imp.name,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.JSONSupport.imp.btnImp,handler:function(){var d=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.JSONSupport.imp.progress});
d.show();
window.setTimeout(function(){var f=c.items.items[2].getValue();
try{this.facade.importJSON(f,true);
b.close()
}catch(e){Ext.Msg.alert(ORYX.I18N.JSONSupport.imp.syntaxError,e.message)
}finally{d.hide()
}}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.JSONSupport.imp.btnClose,handler:function(){b.close()
}.bind(this)}]});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(d){var e=d.target.files[0].getAsText("UTF-8");
c.items.items[2].setValue(e)
},true)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RDFExport=ORYX.Plugins.AbstractPlugin.extend({construct:function(){arguments.callee.$.construct.apply(this,arguments);
this.facade.offer({name:ORYX.I18N.RDFExport.rdfExport,functionality:this.exportRDF.bind(this),group:ORYX.I18N.RDFExport.group,dropDownGroupIcon:ORYX.PATH+"images/export2.png",icon:ORYX.PATH+"images/page_white_code.png",description:ORYX.I18N.RDFExport.rdfExportDescription,index:0,minShape:0,maxShape:0})
},exportRDF:function(){this.openDownloadWindow(window.document.title+".rdf",this.getRDFFromDOM())
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Config.Feedback={VISIBLE_STATE:"visible",HIDDEN_STATE:"hidden",INFO:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, set eiusmod tempor incidunt et labore et dolore magna aliquam. Ut enim ad minim veniam, quis nostrud exerc. Irure dolor in reprehend incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse molestaie cillum. Tia non ob ea soluad incommod quae egen ium improb fugiend. Officia",CSS_FILE:ORYX.PATH+"/css/feedback.css"};
ORYX.Plugins.Feedback=ORYX.Plugins.AbstractPlugin.extend({construct:function(a,b){this.facade=a;
((b&&b.properties)||[]).each(function(d){if(d.cssfile){ORYX.Config.Feedback.CSS_FILE=d.css_file
}}.bind(this));
var c=document.createElement("link");
c.setAttribute("rel","stylesheet");
c.setAttribute("type","text/css");
c.setAttribute("href",ORYX.Config.Feedback.CSS_FILE);
document.getElementsByTagName("head")[0].appendChild(c);
this.elements={container:null,tab:null,dialog:null,form:null,info:null};
this.createFeedbackTab()
},createFeedbackTab:function(){this.elements.tab=document.createElement("div");
this.elements.tab.setAttribute("class","tab");
this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#8226;");
this.elements.container=document.createElement("div");
this.elements.container.setAttribute("id","feedback");
this.elements.container.appendChild(this.elements.tab);
document.body.appendChild(this.elements.container);
Event.observe(this.elements.tab,"click",this.toggleDialog.bindAsEventListener(this))
},toggleDialog:function(b){if(b){Event.stop(b)
}var a=this.elements.dialog||this.createDialog();
if(ORYX.Config.Feedback.VISIBLE_STATE==a.state){this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#8226;");
Element.hide(a);
a.state=ORYX.Config.Feedback.HIDDEN_STATE
}else{this.elements.tab.innerHTML=(ORYX.I18N.Feedback.name+" &#215;");
Element.show(a);
a.state=ORYX.Config.Feedback.VISIBLE_STATE
}},createDialog:function(){if(this.elements.dialog){return this.elements.dialog
}var m=function(){[n,l,d].each(function(p){p.value=p._defaultText||"";
p.className="low"
})
};
var f=function(p){var q=Event.element(p);
if(q._defaultText&&q.value.strip()==q._defaultText.strip()){q.value="";
q.className="high"
}};
var b=function(p){var q=Event.element(p);
if(q._defaultText&&q.value.strip()==""){q.value=q._defaultText;
q.className="low"
}};
this.elements.form=document.createElement("form");
this.elements.form.action=ORYX.CONFIG.ROOT_PATH+"feedback";
this.elements.form.method="POST";
this.elements.form.onsubmit=function(){try{var p=function(){Ext.Msg.alert(ORYX.I18N.Feedback.failure,ORYX.I18N.Feedback.failureMsg);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
this.toggleDialog()
};
var s=function(t){if(t.status<200||t.status>=400){return p(t)
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Feedback.success});
m()
};
this.elements.form.model.value=this.facade.getSerializedJSON();
this.elements.form.environment.value=this.getEnv();
var r={};
$A(this.elements.form.elements).each(function(t){r[t.name]=t.value
});
r.name=ORYX.Editor.Cookie.getParams().identifier;
r.subject=("["+r.subject+"] "+r.title);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Feedback.sending});
new Ajax.Request(ORYX.CONFIG.ROOT_PATH+"feedback",{method:"POST",parameters:r,onSuccess:s.bind(this),onFailure:p.bind(this)});
this.toggleDialog()
}catch(q){p();
ORYX.Log.warn(q)
}return false
}.bind(this);
var o=document.createElement("div");
o.className="fieldset";
var j=document.createElement("input");
j.type="hidden";
j.name="subject";
j.style.display="none";
var n=document.createElement("textarea");
n._defaultText=ORYX.I18N.Feedback.descriptionDesc;
n.name="description";
Event.observe(n,"focus",f.bindAsEventListener());
Event.observe(n,"blur",b.bindAsEventListener());
var l=document.createElement("input");
l._defaultText=ORYX.I18N.Feedback.titleDesc;
l.type="text";
l.name="title";
Event.observe(l,"focus",f.bindAsEventListener());
Event.observe(l,"blur",b.bindAsEventListener());
var d=document.createElement("input");
d._defaultText=ORYX.I18N.Feedback.emailDesc;
d.type="text";
d.name="email";
Event.observe(d,"focus",f.bindAsEventListener());
Event.observe(d,"blur",b.bindAsEventListener());
var h=document.createElement("input");
h.type="button";
h.className="submit";
h.onclick=this.elements.form.onsubmit;
if(ORYX.I18N.Feedback.submit){h.value=ORYX.I18N.Feedback.submit
}var c=document.createElement("input");
c.name="environment";
c.type="hidden";
c.style.display="none";
var e=document.createElement("input");
e.name="model";
e.type="hidden";
e.style.display="none";
o.appendChild(j);
o.appendChild(n);
o.appendChild(l);
o.appendChild(d);
o.appendChild(c);
o.appendChild(e);
o.appendChild(h);
m();
var g=document.createElement("ul");
g.setAttribute("class","subjects");
var a=[];
$A(ORYX.I18N.Feedback.subjects).each(function(q,p){try{var s=document.createElement("li");
s._subject=q.id;
s.className=q.id;
s.innerHTML=q.name;
s.style.width=parseInt(100/$A(ORYX.I18N.Feedback.subjects).length)+"%";
a.push(s);
g.appendChild(s);
var r=function(){a.each(function(u){if(u.className.match(q.id)){u.className=u._subject+" active";
j.value=q.name;
if(n.value==n._defaultText){n.value=q.description
}n._defaultText=q.description;
if(q.info&&(""+q.info).strip().length>0){this.elements.info.innerHTML=q.info
}else{this.elements.info.innerHTML=ORYX.I18N.Feedback.info||""
}}else{u.className=u._subject
}}.bind(this))
}.bind(this);
Event.observe(s,"click",r);
if(p==(ORYX.I18N.Feedback.subjects.length-1)){n.value="";
n._defaultText="";
r()
}}catch(t){ORYX.Log.warn("Incomplete I10N for ORYX.I18N.Feedback.subjects",q,ORYX.I18N.Feedback.subjects)
}}.bind(this));
this.elements.form.appendChild(g);
this.elements.form.appendChild(o);
this.elements.info=document.createElement("div");
this.elements.info.setAttribute("class","info");
this.elements.info.innerHTML=ORYX.I18N.Feedback.info||"";
var k=document.createElement("div");
k.setAttribute("class","head");
this.elements.dialog=document.createElement("div");
this.elements.dialog.setAttribute("class","dialog");
this.elements.dialog.appendChild(k);
this.elements.dialog.appendChild(this.elements.info);
this.elements.dialog.appendChild(this.elements.form);
this.elements.container.appendChild(this.elements.dialog);
return this.elements.dialog
},getEnv:function(){var b="";
b+="Browser: "+navigator.userAgent;
b+="\n\nBrowser Plugins: ";
if(navigator.plugins){for(var a=0;
a<navigator.plugins.length;
a++){var c=navigator.plugins[a];
b+=c.name+", "
}}if((typeof(screen.width)!="undefined")&&(screen.width&&screen.height)){b+="\n\nScreen Resolution: "+screen.width+"x"+screen.height
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Undo=Clazz.extend({facade:undefined,undoStack:[],redoStack:[],construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Undo.undo,description:ORYX.I18N.Undo.undoDesc,icon:ORYX.PATH+"images/arrow_undo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:90,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doUndo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.undoStack.length>0
}.bind(this),index:0});
this.facade.offer({name:ORYX.I18N.Undo.redo,description:ORYX.I18N.Undo.redoDesc,icon:ORYX.PATH+"images/arrow_redo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:89,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doRedo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.redoStack.length>0
}.bind(this),index:1});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,this.handleExecuteCommands.bind(this))
},handleExecuteCommands:function(a){if(!a.commands){return
}this.undoStack.push(a.commands);
this.redoStack=[]
},doUndo:function(){var a=this.undoStack.pop();
if(a){this.redoStack.push(a);
a.each(function(b){b.rollback()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_ROLLBACK,commands:a})
},doRedo:function(){var a=this.redoStack.pop();
if(a){this.undoStack.push(a);
a.each(function(b){b.execute()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_EXECUTE,commands:a})
}});
Array.prototype.insertFrom=function(e,d){d=Math.max(0,d);
e=Math.min(Math.max(0,e),this.length-1);
var b=this[e];
var a=this.without(b);
var c=a.slice(0,d);
c.push(b);
if(a.length>d){c=c.concat(a.slice(d))
}return c
};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Arrangement=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Arrangement.btf,functionality:this.setZLevel.bind(this,this.setToTop),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_front.png",description:ORYX.I18N.Arrangement.btfDesc,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.btb,functionality:this.setZLevel.bind(this,this.setToBack),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_back.png",description:ORYX.I18N.Arrangement.btbDesc,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bf,functionality:this.setZLevel.bind(this,this.setForward),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_forwards.png",description:ORYX.I18N.Arrangement.bfDesc,index:3,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bb,functionality:this.setZLevel.bind(this,this.setBackward),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.PATH+"images/shape_move_backwards.png",description:ORYX.I18N.Arrangement.bbDesc,index:4,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.ab,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_BOTTOM]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_bottom.png",description:ORYX.I18N.Arrangement.abDesc,index:1,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.am,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_middle.png",description:ORYX.I18N.Arrangement.amDesc,index:2,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.at,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_TOP]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_top.png",description:ORYX.I18N.Arrangement.atDesc,index:3,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.al,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_LEFT]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_left.png",description:ORYX.I18N.Arrangement.alDesc,index:4,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ac,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_CENTER]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_center.png",description:ORYX.I18N.Arrangement.acDesc,index:5,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ar,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_RIGHT]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_right.png",description:ORYX.I18N.Arrangement.arDesc,index:6,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.as,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_SIZE]),group:ORYX.I18N.Arrangement.groupA,icon:ORYX.PATH+"images/shape_align_size.png",description:ORYX.I18N.Arrangement.asDesc,index:7,minShape:2});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,this.setZLevel.bind(this,this.setToTop));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACK,this.setZLevel.bind(this,this.setToBack));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD,this.setZLevel.bind(this,this.setForward));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD,this.setZLevel.bind(this,this.setBackward))
},setZLevel:function(d,b){var a=ORYX.Core.Command.extend({construct:function(g,f,e){this.callback=g;
this.elements=f;
this.elAndIndex=f.map(function(h){return{el:h,previous:h.parent.children[h.parent.children.indexOf(h)-1]}
});
this.facade=e
},execute:function(){this.callback(this.elements);
this.facade.setSelection(this.elements)
},rollback:function(){var g=this.elAndIndex.sortBy(function(m){var n=m.el;
var l=$A(n.node.parentNode.childNodes);
return l.indexOf(n.node)
});
for(var f=0;
f<g.length;
f++){var h=g[f].el;
var j=h.parent;
var k=j.children.indexOf(h);
var e=j.children.indexOf(g[f].previous);
e=e||0;
j.children=j.children.insertFrom(k,e);
h.node.parentNode.insertBefore(h.node,h.node.parentNode.childNodes[e+1])
}this.facade.setSelection(this.elements)
}});
var c=new a(d,this.facade.getSelection(),this.facade);
if(b.excludeCommand){c.execute()
}else{this.facade.executeCommands([c])
}},setToTop:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.push(c);
c.node.parentNode.appendChild(c.node)
})
},setToBack:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a=a.reverse();
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.unshift(c);
c.node.parentNode.insertBefore(c.node,c.node.parentNode.firstChild)
})
},setBackward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
b=b.reverse();
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.previousSibling
})
});
a.each(function(e){if(e.node.previousSibling===null){return
}var f=e.parent;
var d=f.children.indexOf(e);
f.children=f.children.insertFrom(d,d-1);
e.node.parentNode.insertBefore(e.node,e.node.previousSibling)
})
},setForward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.nextSibling
})
});
a.each(function(f){var d=f.node.nextSibling;
if(d===null){return
}var e=f.parent.children.indexOf(f);
var g=f.parent;
g.children=g.children.insertFrom(e,e+1);
f.node.parentNode.insertBefore(d,f.node)
})
},alignShapes:function(b){var f=this.facade.getSelection();
f=this.facade.getCanvas().getShapesWithSharedParent(f);
f=f.findAll(function(h){return(h instanceof ORYX.Core.Node)
});
f=f.findAll(function(h){var j=h.getIncomingShapes();
return j.length==0||!f.include(j[0])
});
if(f.length<2){return
}var e=f[0].absoluteBounds().clone();
f.each(function(h){e.include(h.absoluteBounds().clone())
});
var d=0;
var c=0;
f.each(function(h){d=Math.max(h.bounds.width(),d);
c=Math.max(h.bounds.height(),c)
});
var a=ORYX.Core.Command.extend({construct:function(n,m,l,k,h,j){this.elements=n;
this.bounds=m;
this.maxHeight=l;
this.maxWidth=k;
this.way=h;
this.facade=j;
this.orgPos=[]
},setBounds:function(h,k){if(!k){k={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}if(!h.bounds){throw"Bounds not definined."
}var j={a:{x:h.bounds.upperLeft().x-(this.maxWidth-h.bounds.width())/2,y:h.bounds.upperLeft().y-(this.maxHeight-h.bounds.height())/2},b:{x:h.bounds.lowerRight().x+(this.maxWidth-h.bounds.width())/2,y:h.bounds.lowerRight().y+(this.maxHeight-h.bounds.height())/2}};
if(this.maxWidth>k.width){j.a.x=h.bounds.upperLeft().x-(k.width-h.bounds.width())/2;
j.b.x=h.bounds.lowerRight().x+(k.width-h.bounds.width())/2
}if(this.maxHeight>k.height){j.a.y=h.bounds.upperLeft().y-(k.height-h.bounds.height())/2;
j.b.y=h.bounds.lowerRight().y+(k.height-h.bounds.height())/2
}h.bounds.set(j)
},execute:function(){this.elements.each(function(h,j){this.orgPos[j]=h.bounds.upperLeft();
var k=this.bounds.clone();
if(h.parent&&!(h.parent instanceof ORYX.Core.Canvas)){var l=h.parent.absoluteBounds().upperLeft();
k.moveBy(-l.x,-l.y)
}switch(this.way){case ORYX.CONFIG.EDITOR_ALIGN_BOTTOM:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:k.b.y-h.bounds.height()});
break;
case ORYX.CONFIG.EDITOR_ALIGN_MIDDLE:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:(k.a.y+k.b.y-h.bounds.height())/2});
break;
case ORYX.CONFIG.EDITOR_ALIGN_TOP:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:k.a.y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_LEFT:h.bounds.moveTo({x:k.a.x,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_CENTER:h.bounds.moveTo({x:(k.a.x+k.b.x-h.bounds.width())/2,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_RIGHT:h.bounds.moveTo({x:k.b.x-h.bounds.width(),y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_SIZE:if(h.isResizable){this.orgPos[j]={a:h.bounds.upperLeft(),b:h.bounds.lowerRight()};
this.setBounds(h,h.maximumSize)
}break
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.elements.each(function(h,j){if(this.way==ORYX.CONFIG.EDITOR_ALIGN_SIZE){if(h.isResizable){h.bounds.set(this.orgPos[j])
}}else{h.bounds.moveTo(this.orgPos[j])
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a(f,e,c,d,parseInt(b),this.facade);
this.facade.executeCommands([g])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Grouping=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Grouping.group,functionality:this.createGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.PATH+"images/shape_group.png",description:ORYX.I18N.Grouping.groupDesc,index:1,minShape:2,isEnabled:this.isEnabled.bind(this,false)});
this.facade.offer({name:ORYX.I18N.Grouping.ungroup,functionality:this.deleteGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.PATH+"images/shape_ungroup.png",description:ORYX.I18N.Grouping.ungroupDesc,index:2,minShape:2,isEnabled:this.isEnabled.bind(this,true)});
this.selectedElements=[];
this.groups=[]
},isEnabled:function(a){var b=this.selectedElements;
return a===this.groups.any(function(c){return c.length===b.length&&c.all(function(d){return b.member(d)
})
})
},onSelectionChanged:function(b){var a=b.elements;
this.selectedElements=this.groups.findAll(function(c){return c.any(function(d){return a.member(d)
})
});
this.selectedElements.push(a);
this.selectedElements=this.selectedElements.flatten().uniq();
if(this.selectedElements.length!==a.length){this.facade.setSelection(this.selectedElements)
}},createGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.findAll(function(e){return !e.any(function(f){return c.member(f)
})
});
d.push(c);
this.callback(d.clone());
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},deleteGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.partition(function(e){return e.length!==c.length||!e.all(function(f){return c.member(f)
})
});
this.callback(d[0]);
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},setGroups:function(a){this.groups=a
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeHighlighting=Clazz.extend({construct:function(a){this.parentNode=a.getCanvas().getSvgContainer();
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parentNode,["g"]);
this.highlightNodes={};
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,this.setHighlight.bind(this));
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,this.hideHighlight.bind(this))
},setHighlight:function(a){if(a&&a.highlightId){var b=this.highlightNodes[a.highlightId];
if(!b){b=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":2,fill:"none"}]);
this.highlightNodes[a.highlightId]=b
}if(a.elements&&a.elements.length>0){this.setAttributesByStyle(b,a);
this.show(b)
}else{this.hide(b)
}}},hideHighlight:function(a){if(a&&a.highlightId&&this.highlightNodes[a.highlightId]){this.hide(this.highlightNodes[a.highlightId])
}},hide:function(a){a.setAttributeNS(null,"display","none")
},show:function(a){a.setAttributeNS(null,"display","")
},setAttributesByStyle:function(b,a){if(a.style&&a.style==ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE){var d=a.elements[0].absoluteBounds();
var c=a.strokewidth?a.strokewidth:ORYX.CONFIG.BORDER_OFFSET;
b.setAttributeNS(null,"d",this.getPathRectangle(d.a,d.b,c));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",c)
}else{if(a.elements.length==1&&a.elements[0] instanceof ORYX.Core.Edge&&a.highlightId!="selection"){b.setAttributeNS(null,"d",this.getPathEdge(a.elements[0].dockers));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",ORYX.CONFIG.OFFSET_EDGE_BOUNDS)
}else{b.setAttributeNS(null,"d",this.getPathByElements(a.elements));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:1);
b.setAttributeNS(null,"stroke-width",a.strokewidth?a.strokewidth:2)
}}},getPathByElements:function(a){if(!a||a.length<=0){return undefined
}var c=ORYX.CONFIG.SELECTED_AREA_PADDING;
var b="";
a.each((function(f){if(!f){return
}var g=f.absoluteBounds();
g.widen(c);
var e=g.upperLeft();
var d=g.lowerRight();
b=b+this.getPath(e,d)
}).bind(this));
return b
},getPath:function(d,c){return this.getPathCorners(d,c)
},getPathCorners:function(d,c){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
f=f+"M"+d.x+" "+(d.y+e)+" l0 -"+e+" l"+e+" 0 ";
f=f+"M"+d.x+" "+(c.y-e)+" l0 "+e+" l"+e+" 0 ";
f=f+"M"+c.x+" "+(c.y-e)+" l0 "+e+" l-"+e+" 0 ";
f=f+"M"+c.x+" "+(d.y+e)+" l0 -"+e+" l-"+e+" 0 ";
return f
},getPathRectangle:function(d,c,h){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
var g=h/2;
f=f+"M"+(d.x+g)+" "+(d.y);
f=f+" L"+(d.x+g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(d.y+g);
f=f+" L"+(d.x+g)+" "+(d.y+g);
return f
},getPathEdge:function(a){var b=a.length;
var c="M"+a[0].bounds.center().x+" "+a[0].bounds.center().y;
for(i=1;
i<b;
i++){var d=a[i].bounds.center();
c=c+" L"+d.x+" "+d.y
}return c
}});
ORYX.Plugins.HighlightingSelectedShapes=Clazz.extend({construct:function(a){this.facade=a;
this.opacityFull=0.9;
this.opacityLow=0.4
},onSelectionChanged:function(a){if(a.elements&&a.elements.length>1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"selection",elements:a.elements.without(a.subSelection),color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:!a.subSelection?this.opacityFull:this.opacityLow});
if(a.subSelection){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"subselection",elements:[a.subSelection],color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:this.opacityFull})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"selection"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDocker=Clazz.extend({construct:function(a){this.facade=a;
this.VALIDCOLOR=ORYX.CONFIG.SELECTION_VALID_COLOR;
this.INVALIDCOLOR=ORYX.CONFIG.SELECTION_INVALID_COLOR;
this.shapeSelection=undefined;
this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined;
this.isStartDocker=undefined;
this.isEndDocker=undefined;
this.undockTreshold=10;
this.initialDockerPosition=undefined;
this.outerDockerNotMoved=undefined;
this.isValid=false;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG,this.handleDockerDrag.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this))
},handleMouseOut:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.hide()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.hide()
})
}}},handleMouseOver:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.show()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.show()
})
}}},handleDockerDrag:function(b,a){this.handleMouseDown(b.uiEvent,a)
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Controls.Docker&&c.isMovable){this.shapeSelection=this.facade.getSelection();
this.facade.setSelection();
this.docker=c;
this.initialDockerPosition=this.docker.bounds.center();
this.outerDockerNotMoved=false;
this.dockerParent=c.parent;
this._commandArg={docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint||c.bounds.center()};
this.docker.show();
if(c.parent instanceof ORYX.Core.Edge&&(c.parent.dockers.first()==c||c.parent.dockers.last()==c)){if(c.parent.dockers.first()==c&&c.parent.dockers.last().getDockedShape()){this.dockerTarget=c.parent.dockers.last().getDockedShape()
}else{if(c.parent.dockers.last()==c&&c.parent.dockers.first().getDockedShape()){this.dockerSource=c.parent.dockers.first().getDockedShape()
}}}else{this.dockerSource=undefined;
this.dockerTarget=undefined
}this.isStartDocker=this.docker.parent.dockers.first()===this.docker;
this.isEndDocker=this.docker.parent.dockers.last()===this.docker;
this.facade.getCanvas().add(this.docker.parent);
this.docker.parent.getLabels().each(function(e){e.hide()
});
if((!this.isStartDocker&&!this.isEndDocker)||!this.docker.isDocked()){this.docker.setDockedShape(undefined);
var b=this.facade.eventCoordinates(d);
this.docker.bounds.centerMoveTo(b);
this.dockerParent._update()
}else{this.outerDockerNotMoved=true
}var a={movedCallback:this.dockerMoved.bind(this),upCallback:this.dockerMovedFinished.bind(this)};
ORYX.Core.UIEnableDrag(d,c,a)
}},dockerMoved:function(t){this.outerDockerNotMoved=false;
var k=undefined;
if(this.docker.parent){if(this.isStartDocker||this.isEndDocker){var n=this.facade.eventCoordinates(t);
if(this.docker.isDocked()){var b=ORYX.Core.Math.getDistancePointToPoint(n,this.initialDockerPosition);
if(b<this.undockTreshold){this.outerDockerNotMoved=true;
return
}this.docker.setDockedShape(undefined);
this.dockerParent._update()
}var r=this.facade.getCanvas().getAbstractShapesAtPosition(n);
var p=r.pop();
if(this.docker.parent===p){p=r.pop()
}if(this.lastUIObj==p){}else{if(p instanceof ORYX.Core.Shape){var s=this.docker.parent.getStencil().stencilSet();
if(this.docker.parent instanceof ORYX.Core.Edge){var u=this.getHighestParentBeforeCanvas(p);
if(u instanceof ORYX.Core.Edge&&this.docker.parent===u){this.isValid=false;
this.dockerParent._update();
return
}this.isValid=false;
var a=p,c=p;
while(!this.isValid&&a&&!(a instanceof ORYX.Core.Canvas)){p=a;
this.isValid=this.facade.getRules().canConnect({sourceShape:this.dockerSource?this.dockerSource:(this.isStartDocker?p:undefined),edgeShape:this.docker.parent,targetShape:this.dockerTarget?this.dockerTarget:(this.isEndDocker?p:undefined)});
a=a.parent
}if(!this.isValid){p=c
}}else{this.isValid=this.facade.getRules().canConnect({sourceShape:p,edgeShape:this.docker.parent,targetShape:this.docker.parent})
}if(this.lastUIObj){this.hideMagnets(this.lastUIObj)
}if(this.isValid){this.showMagnets(p)
}this.showHighlight(p,this.isValid?this.VALIDCOLOR:this.INVALIDCOLOR);
this.lastUIObj=p
}else{this.hideHighlight();
this.lastUIObj?this.hideMagnets(this.lastUIObj):null;
this.lastUIObj=undefined;
this.isValid=false
}}if(this.lastUIObj&&this.isValid&&!(t.shiftKey||t.ctrlKey)){k=this.lastUIObj.magnets.find(function(x){return x.absoluteBounds().isIncluded(n)
});
if(k){this.docker.bounds.centerMoveTo(k.absoluteCenterXY())
}}}}if(!(t.shiftKey||t.ctrlKey)&&!k){var m=ORYX.CONFIG.DOCKER_SNAP_OFFSET;
var h=m+1;
var f=m+1;
var w=this.docker.bounds.center();
if(this.docker.parent){this.docker.parent.dockers.each((function(y){if(this.docker==y){return
}var x=y.referencePoint?y.getAbsoluteReferencePoint():y.bounds.center();
h=Math.abs(h)>Math.abs(x.x-w.x)?x.x-w.x:h;
f=Math.abs(f)>Math.abs(x.y-w.y)?x.y-w.y:f
}).bind(this));
if(Math.abs(h)<m||Math.abs(f)<m){h=Math.abs(h)<m?h:0;
f=Math.abs(f)<m?f:0;
this.docker.bounds.centerMoveTo(w.x+h,w.y+f)
}else{var d=this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker)-1,0)];
var q=this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker)+1,this.docker.parent.dockers.length-1)];
if(d&&q&&d!==this.docker&&q!==this.docker){var e=d.bounds.center();
var g=q.bounds.center();
var o=this.docker.bounds.center();
if(ORYX.Core.Math.isPointInLine(o.x,o.y,e.x,e.y,g.x,g.y,10)){var v=(Number(g.y)-Number(e.y))/(Number(g.x)-Number(e.x));
var l=((e.y-(e.x*v))-(o.y-(o.x*(-Math.pow(v,-1)))))/((-Math.pow(v,-1))-v);
var j=(e.y-(e.x*v))+(v*l);
if(isNaN(l)||isNaN(j)){return
}this.docker.bounds.centerMoveTo(l,j)
}}}}}this.dockerParent._update()
},dockerMovedFinished:function(e){this.facade.setSelection(this.shapeSelection);
this.hideHighlight();
this.dockerParent.getLabels().each(function(g){g.show()
});
if(this.lastUIObj&&(this.isStartDocker||this.isEndDocker)){if(this.isValid){this.docker.setDockedShape(this.lastUIObj);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED,docker:this.docker,parent:this.docker.parent,target:this.lastUIObj})
}this.hideMagnets(this.lastUIObj)
}this.docker.hide();
if(this.outerDockerNotMoved){var d=this.facade.eventCoordinates(e);
var a=this.facade.getCanvas().getAbstractShapesAtPosition(d);
var b=a.findAll(function(g){return g instanceof ORYX.Core.Node
});
a=b.length?b:a;
this.facade.setSelection(a)
}else{var c=ORYX.Core.Command.extend({construct:function(m,h,g,l,k,j){this.docker=m;
this.index=m.parent.dockers.indexOf(m);
this.newPosition=h;
this.newDockedShape=l;
this.oldPosition=g;
this.oldDockedShape=k;
this.facade=j;
this.index=m.parent.dockers.indexOf(m);
this.shape=m.parent
},execute:function(){if(!this.docker.parent){this.docker=this.shape.dockers[this.index]
}this.dock(this.newDockedShape,this.newPosition);
this.removedDockers=this.shape.removeUnusedDockers();
this.facade.updateSelection()
},rollback:function(){this.dock(this.oldDockedShape,this.oldPosition);
(this.removedDockers||$H({})).each(function(g){this.shape.add(g.value,Number(g.key));
this.shape._update(true)
}.bind(this));
this.facade.updateSelection()
},dock:function(g,h){this.docker.setDockedShape(undefined);
if(g){this.docker.setDockedShape(g);
this.docker.setReferencePoint(h)
}else{this.docker.bounds.centerMoveTo(h)
}this.facade.getCanvas().update()
}});
if(this.docker.parent){var f=new c(this.docker,this.docker.getDockedShape()?this.docker.referencePoint:this.docker.bounds.center(),this._commandArg.refPoint,this.docker.getDockedShape(),this._commandArg.dockedShape,this.facade);
this.facade.executeCommands([f])
}}this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined
},hideHighlight:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"validDockedShape"})
},showHighlight:function(b,a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"validDockedShape",elements:[b],color:a})
},showMagnets:function(a){a.magnets.each(function(b){b.show()
})
},hideMagnets:function(a){a.magnets.each(function(b){b.hide()
})
},getHighestParentBeforeCanvas:function(a){if(!(a instanceof ORYX.Core.Shape)){return undefined
}var b=a.parent;
while(b&&!(b.parent instanceof ORYX.Core.Canvas)){b=b.parent
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.AddDocker=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.AddDocker.add,functionality:this.enableAddDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.PATH+"images/vector_add.png",description:ORYX.I18N.AddDocker.addDesc,index:1,toggle:true,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.AddDocker.del,functionality:this.enableDeleteDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.PATH+"images/vector_delete.png",description:ORYX.I18N.AddDocker.delDesc,index:2,toggle:true,minShape:0,maxShape:0});
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},enableAddDocker:function(a,b){this.addDockerButton=a;
if(b&&this.deleteDockerButton){this.deleteDockerButton.toggle(false)
}},enableDeleteDocker:function(a,b){this.deleteDockerButton=a;
if(b&&this.addDockerButton){this.addDockerButton.toggle(false)
}},enabledAdd:function(){return this.addDockerButton?this.addDockerButton.pressed:false
},enabledDelete:function(){return this.deleteDockerButton?this.deleteDockerButton.pressed:false
},handleMouseDown:function(b,a){if(this.enabledAdd()&&a instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a,position:this.facade.eventCoordinates(b)})
}else{if(this.enabledDelete()&&a instanceof ORYX.Core.Controls.Docker&&a.parent instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a.parent,docker:a})
}else{if(this.enabledAdd()){this.addDockerButton.toggle(false)
}else{if(this.enabledDelete()){this.deleteDockerButton.toggle(false)
}}}}},newDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(h,f,e,g,j,d){this.addEnabled=h;
this.deleteEnabled=f;
this.edge=e;
this.docker=g;
this.pos=j;
this.facade=d
},execute:function(){if(this.addEnabled){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker)
}else{if(this.deleteEnabled){this.index=this.edge.dockers.indexOf(this.docker);
this.pos=this.docker.bounds.center();
this.edge.removeDocker(this.docker)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){if(this.addEnabled){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}}else{if(this.deleteEnabled){this.edge.add(this.docker,this.index)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(this.enabledAdd(),this.enabledDelete(),b.edge,b.docker,b.position,this.facade);
this.facade.executeCommands([c])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DockerCreation=Clazz.extend({construct:function(a){this.facade=a;
this.active=false;
this.circle=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["g",{"pointer-events":"none"},["circle",{cx:"8",cy:"8",r:"3",fill:"yellow"}]]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)
}.bind(this))
},handleMouseOut:function(b,a){if(this.active){this.hideOverlay();
this.active=false
}},handleMouseOver:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){this.showOverlay(a,this.facade.eventCoordinates(b))
}this.active=true
},handleMouseDown:function(b,a){if(b.which==1&&a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.addDockerCommand({edge:a,event:b,position:this.facade.eventCoordinates(b)})
}.bind(this),200);
this.hideOverlay()
}},handleMouseMove:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){if(this.active){this.hideOverlay();
this.showOverlay(a,this.facade.eventCoordinates(b))
}else{this.showOverlay(a,this.facade.eventCoordinates(b))
}}},isEdgeDocked:function(a){return !!(a.incoming.length||a.outgoing.length)
},addDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(f,g,h,e,d){this.edge=f;
this.docker=g;
this.pos=h;
this.facade=e;
this.options=d
},execute:function(){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.options.docker=this.docker
},rollback:function(){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(b.edge,b.docker,b.position,this.facade,b);
this.facade.executeCommands([c]);
this.facade.raiseEvent({uiEvent:b.event,type:ORYX.CONFIG.EVENT_DOCKERDRAG},b.docker)
},showOverlay:function(a,j){var e=j;
var f=[0,1];
var b=Infinity;
for(var g=0,d=a.dockers.length;
g<d-1;
g++){var c=ORYX.Core.Math.getPointOfIntersectionPointLine(a.dockers[g].bounds.center(),a.dockers[g+1].bounds.center(),j,true);
if(!c){continue
}var h=ORYX.Core.Math.getDistancePointToPoint(j,c);
if(b>h){b=h;
e=c
}}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"ghostpoint",shapes:[a],node:this.circle,ghostPoint:e,dontCloneNode:true})
},hideOverlay:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"ghostpoint"})
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SSExtensionLoader={construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.SSExtensionLoader.add,functionality:this.addSSExtension.bind(this),group:ORYX.I18N.SSExtensionLoader.group,icon:ORYX.PATH+"images/add.png",description:ORYX.I18N.SSExtensionLoader.addDesc,index:1,minShape:0,maxShape:0})
},addSSExtension:function(facade){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.SSExtensionLoader.loading});
var url=ORYX.CONFIG.SS_EXTENSIONS_CONFIG;
new Ajax.Request(url,{method:"GET",asynchronous:false,onSuccess:(function(transport){try{eval("var jsonObject = "+transport.responseText);
var stencilsets=this.facade.getStencilSets();
var validExtensions=jsonObject.extensions.findAll(function(extension){var stencilset=stencilsets[extension["extends"]];
if(stencilset){return true
}else{return false
}});
var loadedExtensions=validExtensions.findAll(function(extension){return stencilsets.values().any(function(ss){if(ss.extensions()[extension.namespace]){return true
}else{return false
}})
});
if(validExtensions.size()==0){Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.noExt)
}else{this._showPanel(validExtensions,loadedExtensions,this._loadExtensions.bind(this))
}}catch(e){console.log(e);
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.failed1)
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}).bind(this),onFailure:(function(transport){Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.SSExtensionLoader.failed2);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE})
}).bind(this)})
},_loadExtensions:function(b){var c=this.facade.getStencilSets();
var d=false;
c.values().each(function(e){var f=e.extensions().values().select(function(g){return b[g.namespace]==undefined
});
f.each(function(g){e.removeExtension(g.namespace);
d=true
})
});
b.each(function(f){var e=c[f["extends"]];
if(e){e.addExtension(ORYX.CONFIG.SS_EXTENSIONS_FOLDER+f.definition);
d=true
}}.bind(this));
if(d){c.values().each(function(e){this.facade.getRules().initializeRules(e)
}.bind(this));
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,lazyLoaded:true});
var a=this.facade.getSelection();
this.facade.setSelection();
this.facade.setSelection(a)
}},_showPanel:function(h,j,c){var e=[];
h.each(function(k){e.push([k.title,k.definition,k["extends"]])
});
var d=new Ext.grid.CheckboxSelectionModel();
var a=new Ext.grid.GridPanel({deferRowRender:false,id:"oryx_new_stencilset_extention_grid",store:new Ext.data.SimpleStore({fields:["title","definition","extends"]}),cm:new Ext.grid.ColumnModel([d,{header:ORYX.I18N.SSExtensionLoader.panelTitle,width:200,sortable:true,dataIndex:"title"}]),sm:d,frame:true,width:200,height:200,iconCls:"icon-grid",listeners:{render:function(){this.getStore().loadData(e);
g.defer(1)
}}});
function g(){var k=new Array();
a.store.each(function(l){if(j.any(function(m){return m.definition==l.get("definition")
})){k.push(l)
}});
d.selectRecords(k)
}var b=new Ext.Panel({items:[{xtype:"label",text:ORYX.I18N.SSExtensionLoader.panelText,style:"margin:10px;display:block"},a],frame:true,buttons:[{text:ORYX.I18N.SSExtensionLoader.labelImport,handler:function(){var l=Ext.getCmp("oryx_new_stencilset_extention_grid").getSelectionModel();
var k=l.selections.items.collect(function(m){return m.data
});
Ext.getCmp("oryx_new_stencilset_extention_window").close();
c(k)
}.bind(this)},{text:ORYX.I18N.SSExtensionLoader.labelCancel,handler:function(){Ext.getCmp("oryx_new_stencilset_extention_window").close()
}.bind(this)}]});
var f=new Ext.Window({id:"oryx_new_stencilset_extention_window",width:227,title:ORYX.I18N.Oryx.title,floating:true,shim:true,modal:true,resizable:false,autoHeight:true,items:[b]});
f.show()
}};
ORYX.Plugins.SSExtensionLoader=Clazz.extend(ORYX.Plugins.SSExtensionLoader);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SelectionFrame=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
this.position={x:0,y:0};
this.size={width:0,height:0};
this.offsetPosition={x:0,y:0};
this.moveCallback=undefined;
this.offsetScroll={x:0,y:0};
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.facade.getCanvas().getHTMLContainer(),["div",{"class":"Oryx_SelectionFrame"}]);
this.hide()
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Canvas){var e=c.rootNode.parentNode.parentNode;
var b=this.facade.getCanvas().node.getScreenCTM();
this.offsetPosition={x:b.e,y:b.f};
this.setPos({x:Event.pointerX(d)-this.offsetPosition.x,y:Event.pointerY(d)-this.offsetPosition.y});
this.resize({width:0,height:0});
this.moveCallback=this.handleMouseMove.bind(this);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.offsetScroll={x:e.scrollLeft,y:e.scrollTop};
this.show()
}Event.stop(d)
},handleMouseUp:function(f){if(this.moveCallback){this.hide();
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.moveCallback=undefined;
var e=this.facade.getCanvas().node.getScreenCTM();
var d={x:this.size.width>0?this.position.x:this.position.x+this.size.width,y:this.size.height>0?this.position.y:this.position.y+this.size.height};
var c={x:d.x+Math.abs(this.size.width),y:d.y+Math.abs(this.size.height)};
d.x/=e.a;
d.y/=e.d;
c.x/=e.a;
c.y/=e.d;
var g=this.facade.getCanvas().getChildShapes(true).findAll(function(b){var a=b.absoluteBounds();
var j=a.upperLeft();
var h=a.lowerRight();
if(j.x>d.x&&j.y>d.y&&h.x<c.x&&h.y<c.y){return true
}return false
});
this.facade.setSelection(g)
}},handleMouseMove:function(b){var a={width:Event.pointerX(b)-this.position.x-this.offsetPosition.x,height:Event.pointerY(b)-this.position.y-this.offsetPosition.y,};
var c=this.facade.getCanvas().rootNode.parentNode.parentNode;
a.width-=this.offsetScroll.x-c.scrollLeft;
a.height-=this.offsetScroll.y-c.scrollTop;
this.resize(a);
Event.stop(b)
},hide:function(){this.node.style.display="none"
},show:function(){this.node.style.display=""
},setPos:function(a){this.node.style.top=a.y+"px";
this.node.style.left=a.x+"px";
this.position=a
},resize:function(a){this.setPos(this.position);
this.size=Object.clone(a);
if(a.width<0){this.node.style.left=(this.position.x+a.width)+"px";
a.width=-a.width
}if(a.height<0){this.node.style.top=(this.position.y+a.height)+"px";
a.height=-a.height
}this.node.style.width=a.width+"px";
this.node.style.height=a.height+"px"
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeHighlighting=Clazz.extend({construct:function(a){this.parentNode=a.getCanvas().getSvgContainer();
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parentNode,["g"]);
this.highlightNodes={};
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,this.setHighlight.bind(this));
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,this.hideHighlight.bind(this))
},setHighlight:function(a){if(a&&a.highlightId){var b=this.highlightNodes[a.highlightId];
if(!b){b=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":2,fill:"none"}]);
this.highlightNodes[a.highlightId]=b
}if(a.elements&&a.elements.length>0){this.setAttributesByStyle(b,a);
this.show(b)
}else{this.hide(b)
}}},hideHighlight:function(a){if(a&&a.highlightId&&this.highlightNodes[a.highlightId]){this.hide(this.highlightNodes[a.highlightId])
}},hide:function(a){a.setAttributeNS(null,"display","none")
},show:function(a){a.setAttributeNS(null,"display","")
},setAttributesByStyle:function(b,a){if(a.style&&a.style==ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE){var d=a.elements[0].absoluteBounds();
var c=a.strokewidth?a.strokewidth:ORYX.CONFIG.BORDER_OFFSET;
b.setAttributeNS(null,"d",this.getPathRectangle(d.a,d.b,c));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",c)
}else{if(a.elements.length==1&&a.elements[0] instanceof ORYX.Core.Edge&&a.highlightId!="selection"){b.setAttributeNS(null,"d",this.getPathEdge(a.elements[0].dockers));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",ORYX.CONFIG.OFFSET_EDGE_BOUNDS)
}else{b.setAttributeNS(null,"d",this.getPathByElements(a.elements));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:1);
b.setAttributeNS(null,"stroke-width",a.strokewidth?a.strokewidth:2)
}}},getPathByElements:function(a){if(!a||a.length<=0){return undefined
}var c=ORYX.CONFIG.SELECTED_AREA_PADDING;
var b="";
a.each((function(f){if(!f){return
}var g=f.absoluteBounds();
g.widen(c);
var e=g.upperLeft();
var d=g.lowerRight();
b=b+this.getPath(e,d)
}).bind(this));
return b
},getPath:function(d,c){return this.getPathCorners(d,c)
},getPathCorners:function(d,c){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
f=f+"M"+d.x+" "+(d.y+e)+" l0 -"+e+" l"+e+" 0 ";
f=f+"M"+d.x+" "+(c.y-e)+" l0 "+e+" l"+e+" 0 ";
f=f+"M"+c.x+" "+(c.y-e)+" l0 "+e+" l-"+e+" 0 ";
f=f+"M"+c.x+" "+(d.y+e)+" l0 -"+e+" l-"+e+" 0 ";
return f
},getPathRectangle:function(d,c,h){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
var g=h/2;
f=f+"M"+(d.x+g)+" "+(d.y);
f=f+" L"+(d.x+g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(d.y+g);
f=f+" L"+(d.x+g)+" "+(d.y+g);
return f
},getPathEdge:function(a){var b=a.length;
var c="M"+a[0].bounds.center().x+" "+a[0].bounds.center().y;
for(i=1;
i<b;
i++){var d=a[i].bounds.center();
c=c+" L"+d.x+" "+d.y
}return c
}});
ORYX.Plugins.HighlightingSelectedShapes=Clazz.extend({construct:function(a){this.facade=a;
this.opacityFull=0.9;
this.opacityLow=0.4
},onSelectionChanged:function(a){if(a.elements&&a.elements.length>1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"selection",elements:a.elements.without(a.subSelection),color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:!a.subSelection?this.opacityFull:this.opacityLow});
if(a.subSelection){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"subselection",elements:[a.subSelection],color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:this.opacityFull})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"selection"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Overlay=Clazz.extend({facade:undefined,styleNode:undefined,construct:function(a){this.facade=a;
this.changes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW,this.show.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE,this.hide.bind(this));
this.styleNode=document.createElement("style");
this.styleNode.setAttributeNS(null,"type","text/css");
document.getElementsByTagName("head")[0].appendChild(this.styleNode)
},show:function(a){if(!a||!a.shapes||!a.shapes instanceof Array||!a.id||!a.id instanceof String||a.id.length==0){return
}if(a.attributes){a.shapes.each(function(d){if(!d instanceof ORYX.Core.Shape){return
}this.setAttributes(d.node,a.attributes)
}.bind(this))
}var c=true;
try{c=a.node&&a.node instanceof SVGElement
}catch(b){}if(a.node&&c){a._temps=[];
a.shapes.each(function(h,g){if(!h instanceof ORYX.Core.Shape){return
}var f={};
f.svg=a.dontCloneNode?a.node:a.node.cloneNode(true);
h.node.firstChild.appendChild(f.svg);
if(h instanceof ORYX.Core.Edge&&!a.nodePosition){a.nodePosition="START"
}if(a.nodePosition){var e=h.bounds;
var j=a.nodePosition.toUpperCase();
if(h instanceof ORYX.Core.Node&&j=="START"){j="NW"
}else{if(h instanceof ORYX.Core.Node&&j=="END"){j="SE"
}else{if(h instanceof ORYX.Core.Edge&&j=="START"){e=h.getDockers().first().bounds
}else{if(h instanceof ORYX.Core.Edge&&j=="END"){e=h.getDockers().last().bounds
}}}}f.callback=function(){var k=0;
var l=0;
if(j=="NW"){}else{if(j=="N"){k=e.width()/2
}else{if(j=="NE"){k=e.width()
}else{if(j=="E"){k=e.width();
l=e.height()/2
}else{if(j=="SE"){k=e.width();
l=e.height()
}else{if(j=="S"){k=e.width()/2;
l=e.height()
}else{if(j=="SW"){l=e.height()
}else{if(j=="W"){l=e.height()/2
}else{if(j=="START"||j=="END"){k=e.width()/2;
l=e.height()/2
}else{return
}}}}}}}}}if(h instanceof ORYX.Core.Edge){k+=e.upperLeft().x;
l+=e.upperLeft().y
}f.svg.setAttributeNS(null,"transform","translate("+k+", "+l+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.ghostPoint){var d={x:0,y:0};
d=a.ghostPoint;
f.callback=function(){var k=0;
var l=0;
k=d.x-7;
l=d.y-7;
f.svg.setAttributeNS(null,"transform","translate("+k+", "+l+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.labelPoint){var d={x:0,y:0};
d=a.labelPoint;
f.callback=function(){var k=0;
var l=0;
k=d.x;
l=d.y;
f.svg.setAttributeNS(null,"transform","translate("+k+", "+l+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}a._temps.push(f)
}.bind(this))
}if(!this.changes[a.id]){this.changes[a.id]=[]
}this.changes[a.id].push(a)
},hide:function(a){if(!a||!a.id||!a.id instanceof String||a.id.length==0||!this.changes[a.id]){return
}this.changes[a.id].each(function(b){b.shapes.each(function(d,c){if(!d instanceof ORYX.Core.Shape){return
}this.deleteAttributes(d.node)
}.bind(this));
if(b._temps){b._temps.each(function(c){if(c.svg&&c.svg.parentNode){c.svg.parentNode.removeChild(c.svg)
}if(c.callback&&c.element){c.element.bounds.unregisterCallback(c.callback)
}}.bind(this))
}}.bind(this));
this.changes[a.id]=null
},setAttributes:function(c,d){var h=this.getAllChilds(c.firstChild.firstChild);
var a=[];
h.each(function(l){a.push($A(l.attributes).findAll(function(m){return m.nodeValue.startsWith("url(#")
}))
});
a=a.flatten().compact();
a=a.collect(function(l){return l.nodeValue
}).uniq();
a=a.collect(function(l){return l.slice(5,l.length-1)
});
a.unshift(c.id+" .me");
var g=$H(d);
var e=g.toJSON().gsub(",",";").gsub('"',"");
var j=d.stroke?e.slice(0,e.length-1)+"; fill:"+d.stroke+";}":e;
var f;
if(d.fill){var b=Object.clone(d);
b.fill="black";
f=$H(b).toJSON().gsub(",",";").gsub('"',"")
}csstags=a.collect(function(m,l){return"#"+m+" * "+(!l?e:j)+""+(f?" #"+m+" text * "+f:"")
});
var k=csstags.join(" ")+"\n";
this.styleNode.appendChild(document.createTextNode(k))
},deleteAttributes:function(b){var a=$A(this.styleNode.childNodes).findAll(function(c){return c.textContent.include("#"+b.id)
});
a.each(function(c){c.parentNode.removeChild(c)
})
},getAllChilds:function(a){var b=$A(a.childNodes);
$A(a.childNodes).each(function(c){b.push(this.getAllChilds(c))
}.bind(this));
return b.flatten()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Edit=Clazz.extend({construct:function(a){this.facade=a;
this.clipboard=new ORYX.Plugins.Edit.ClipBoard(a);
this.facade.offer({name:ORYX.I18N.Edit.cut,description:ORYX.I18N.Edit.cutDesc,icon:ORYX.PATH+"images/cut.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:88,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCut),group:ORYX.I18N.Edit.group,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.copy,description:ORYX.I18N.Edit.copyDesc,icon:ORYX.PATH+"images/page_copy.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:67,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCopy,[true,false]),group:ORYX.I18N.Edit.group,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.paste,description:ORYX.I18N.Edit.pasteDesc,icon:ORYX.PATH+"images/page_paste.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:86,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editPaste),isEnabled:this.clipboard.isOccupied.bind(this.clipboard),group:ORYX.I18N.Edit.group,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Edit.del,description:ORYX.I18N.Edit.delDesc,icon:ORYX.PATH+"images/cross.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:8,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN},{keyCode:46,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editDelete),group:ORYX.I18N.Edit.group,index:4,minShape:1})
},callEdit:function(b,a){window.setTimeout(function(){b.apply(this,(a instanceof Array?a:[]))
}.bind(this),1)
},handleMouseDown:function(a){if(this._controlPressed){this._controlPressed=false;
this.editCopy();
this.editPaste();
a.forceExecution=true;
this.facade.raiseEvent(a,this.clipboard.shapesAsJson())
}},getAllShapesToConsider:function(b){var a=[];
var c=[];
b.each(function(e){isChildShapeOfAnother=b.any(function(g){return g.hasChildShape(e)
});
if(isChildShapeOfAnother){return
}a.push(e);
if(e instanceof ORYX.Core.Node){var f=e.getOutgoingNodes();
f=f.findAll(function(g){return !b.include(g)
});
a=a.concat(f)
}c=c.concat(e.getChildShapes(true))
}.bind(this));
var d=this.facade.getCanvas().getChildEdges().select(function(e){if(a.include(e)){return false
}if(e.getAllDockedShapes().size()===0){return false
}return e.getAllDockedShapes().all(function(f){return f instanceof ORYX.Core.Edge||c.include(f)
})
});
a=a.concat(d);
return a
},editCut:function(){try{this.editCopy(false,true);
this.editDelete(true)
}catch(a){ORYX.Log.error(a)
}return false
},editCopy:function(c,a){var b=this.facade.getSelection();
if(b.length==0){return
}this.clipboard.refresh(b,this.getAllShapesToConsider(b),this.facade.getCanvas().getStencil().stencilSet().namespace(),a);
if(c){this.facade.updateSelection()
}},editPaste:function(){var b={childShapes:this.clipboard.shapesAsJson(),stencilset:{namespace:this.clipboard.SSnamespace}};
Ext.apply(b,ORYX.Core.AbstractShape.JSONHelper);
var a=b.getChildShapes(true).pluck("resourceId");
var c={};
b.eachChild(function(d,e){d.outgoing=d.outgoing.select(function(f){return a.include(f.resourceId)
});
d.outgoing.each(function(f){if(!c[f.resourceId]){c[f.resourceId]=[]
}c[f.resourceId].push(d)
});
return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(d.target&&!(a.include(d.target.resourceId))){d.target=undefined;
d.targetRemoved=true
}if(d.dockers&&d.dockers.length>=1&&d.dockers[0].getDocker&&((d.dockers[0].getDocker().getDockedShape()&&!a.include(d.dockers[0].getDocker().getDockedShape().resourceId))||!d.getShape().dockers[0].getDockedShape()&&!c[d.resourceId])){d.sourceRemoved=true
}return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(this.clipboard.useOffset){d.bounds={lowerRight:{x:d.bounds.lowerRight.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.lowerRight.y+ORYX.CONFIG.COPY_MOVE_OFFSET},upperLeft:{x:d.bounds.upperLeft.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.upperLeft.y+ORYX.CONFIG.COPY_MOVE_OFFSET}}
}if(d.dockers){d.dockers=d.dockers.map(function(g,f){if((d.targetRemoved===true&&f==d.dockers.length-1&&g.getDocker)||(d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if((f==0&&g.getDocker instanceof Function&&d.sourceRemoved!==true&&(g.getDocker().getDockedShape()||((c[d.resourceId]||[]).length>0&&(!(d.getShape() instanceof ORYX.Core.Node)||c[d.resourceId][0].getShape() instanceof ORYX.Core.Node))))||(f==d.dockers.length-1&&g.getDocker instanceof Function&&d.targetRemoved!==true&&(g.getDocker().getDockedShape()||d.target))){return{x:g.x,y:g.y,getDocker:g.getDocker}
}else{if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}}.bind(this))
}else{if(d.getShape() instanceof ORYX.Core.Node&&d.dockers&&d.dockers.length>0&&(!d.dockers.first().getDocker||d.sourceRemoved===true||!(d.dockers.first().getDocker().getDockedShape()||c[d.resourceId]))){d.dockers=d.dockers.map(function(g,f){if((d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}.bind(this))
}}return d
}.bind(this),false,true);
this.clipboard.useOffset=true;
this.facade.importJSON(b)
},editDelete:function(){var b=this.facade.getSelection();
var a=this.getAllShapesToConsider(b);
var c=new ORYX.Plugins.Edit.DeleteCommand(a,this.facade);
this.facade.executeCommands([c])
}});
ORYX.Plugins.Edit.ClipBoard=Clazz.extend({construct:function(){this._shapesAsJson=[];
this.selection=[];
this.SSnamespace="";
this.useOffset=true
},isOccupied:function(){return this.shapesAsJson().length>0
},refresh:function(d,b,c,a){this.selection=d;
this.SSnamespace=c;
this.outgoings={};
this.parents={};
this.targets={};
this.useOffset=a!==true;
this._shapesAsJson=b.map(function(e){var f=e.toJSON();
f.parent={resourceId:e.getParentShape().resourceId};
f.parentIndex=e.getParentShape().getChildShapes().indexOf(e);
return f
})
},shapesAsJson:function(){return this._shapesAsJson
}});
ORYX.Plugins.Edit.DeleteCommand=ORYX.Core.Command.extend({construct:function(a,b){try{this.shapesAsJson=a;
this.facade=b;
ORYX.Log.info("this.shapesAsJson",this.shapesAsJson);
this.dockers=this.shapesAsJson.map(function(f){var g=f.getIncomingShapes().map(function(h){return h.getDockers().last()
});
var e=f.getOutgoingShapes().map(function(h){return h.getDockers().first()
});
var d=f.getDockers().concat(g,e).compact().map(function(h){return{object:h,referencePoint:h.referencePoint,dockedShape:h.getDockedShape()}
});
return d
}).flatten()
}catch(c){ORYX.Log.error(c)
}},execute:function(){this.shapesAsJson.each(function(a){this.facade.deleteShape(a)
}.bind(this));
this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.shapesAsJson.each(function(a){var b=("undefined"!=typeof(a.parent)?this.facade.getCanvas().getChildShapeByResourceId(a.parent.resourceId):this.facade.getCanvas());
b.add(a,a.parentIndex);
b.add(a,a.parentIndex)
}.bind(this));
this.dockers.each(function(a){a.object.setDockedShape(a.dockedShape);
a.object.setReferencePoint(a.referencePoint)
}.bind(this));
this.facade.setSelection(this.selectedShapes);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.KeysMove=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.copyElements=[];
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:65,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.selectAll.bind(this)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,true)})
},selectAll:function(a){Event.stop(a.event);
this.facade.setSelection(this.facade.getCanvas().getChildShapes(true))
},move:function(m,j,k){Event.stop(k.event);
var b=j?20:5;
var l=this.facade.getSelection();
var g=this.facade.getSelection();
var c={x:0,y:0};
switch(m){case ORYX.CONFIG.KEY_CODE_LEFT:c.x=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_RIGHT:c.x=b;
break;
case ORYX.CONFIG.KEY_CODE_UP:c.y=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_DOWN:c.y=b;
break
}l=l.findAll(function(e){if(e instanceof ORYX.Core.Node&&e.dockers.length==1&&l.include(e.dockers.first().getDockedShape())){return false
}var n=e.parent;
do{if(l.include(n)){return false
}}while(n=n.parent);
return true
});
var f=true;
var h=l.all(function(e){if(e instanceof ORYX.Core.Edge){if(e.isDocked()){f=false
}return true
}return false
});
if(h&&!f){return
}l=l.map(function(n){if(n instanceof ORYX.Core.Node){return n
}else{if(n instanceof ORYX.Core.Edge){var e=n.dockers;
if(l.include(n.dockers.first().getDockedShape())){e=e.without(n.dockers.first())
}if(l.include(n.dockers.last().getDockedShape())){e=e.without(n.dockers.last())
}return e
}else{return null
}}}).flatten().compact();
if(l.size()>0){var a=[this.facade.getCanvas().bounds.lowerRight().x,this.facade.getCanvas().bounds.lowerRight().y,0,0];
l.each(function(e){a[0]=Math.min(a[0],e.bounds.upperLeft().x);
a[1]=Math.min(a[1],e.bounds.upperLeft().y);
a[2]=Math.max(a[2],e.bounds.lowerRight().x);
a[3]=Math.max(a[3],e.bounds.lowerRight().y)
});
if(a[0]+c.x<0){c.x=-a[0]
}if(a[1]+c.y<0){c.y=-a[1]
}if(a[2]+c.x>this.facade.getCanvas().bounds.lowerRight().x){c.x=this.facade.getCanvas().bounds.lowerRight().x-a[2]
}if(a[3]+c.y>this.facade.getCanvas().bounds.lowerRight().y){c.y=this.facade.getCanvas().bounds.lowerRight().y-a[3]
}if(c.x!=0||c.y!=0){var d=[new ORYX.Core.Command.Move(l,c,null,g,this)];
this.facade.executeCommands(d)
}}},getUndockedCommant:function(b){var a=ORYX.Core.Command.extend({construct:function(c){this.dockers=c.collect(function(d){return d instanceof ORYX.Core.Controls.Docker?{docker:d,dockedShape:d.getDockedShape(),refPoint:d.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(c){c.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(c){c.docker.setDockedShape(c.dockedShape);
c.docker.setReferencePoint(c.refPoint)
})
}});
command=new a(b);
command.execute();
return command
},});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RowLayouting={construct:function(a){this.facade=a;
this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined;
this.offSetPosition={x:0,y:0};
this.evCoord={x:0,y:0};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT_ROWS,this.handleLayoutRows.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},onSelectionChanged:function(a){var c=a.elements;
if(!c||c.length==0){this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined
}else{this.currentShapes=c;
this.toMoveShapes=this.facade.getCanvas().getShapesWithSharedParent(c);
this.toMoveShapes=this.toMoveShapes.findAll(function(d){return d instanceof ORYX.Core.Node&&(d.dockers.length===0||!c.member(d.dockers.first().getDockedShape()))
});
var b=undefined;
c.each(function(d){if(!b){b=d.absoluteBounds()
}else{b.include(d.absoluteBounds())
}});
this.dragBounds=b
}return
},handleMouseDown:function(c,b){if(!this.dragBounds||!this.toMoveShapes.member(b)){return
}var d=this.facade.eventCoordinates(c);
var a=this.dragBounds.upperLeft();
this.offSetPosition={x:d.x-a.x,y:d.y-a.y};
return
},handleLayoutRows:function(o){var b=o.shape;
var j=this.offSetPosition;
var n=o.marginLeft;
var d=o.marginTop;
var q=o.spacingX;
var p=o.spacingY;
var k=o.shape.getChildShapes(false);
var m=this.toMoveShapes;
m.each(function(t){if(k.include(t)){t.bounds.moveBy(j)
}});
if(o.exclude){k=k.filter(function(t){return !o.exclude.some(function(u){return t.getStencil().id()==u
})
})
}var c=d;
var r=d-p;
if(o.horizontalLayout){k.each(function(u){var t=u.bounds.upperLeft();
u.bounds.moveTo(t.x,c)
})
}else{if(o.verticalLayout){k.each(function(u){var t=u.bounds.upperLeft();
u.bounds.moveTo(n,t.y)
})
}}k=k.sortBy(function(t){return t.bounds.upperLeft().y
});
var e=0;
var f=0;
var l=false;
k.each(function(x){var w=x.bounds.upperLeft();
var t=x.bounds.lowerRight();
var v=w.x;
var u=w.y;
var z=t.x;
var y=t.y;
if(m.include(x)){w.y-=f;
if((w.y>r)||((x==k.first())&&w.y<d)){l=false;
c=r+p;
if(w.y<c){l=true
}}}else{w.y+=e;
w.y-=f;
if(w.y>c){l=false;
c=r+p
}}w.y=c;
t.y=w.y+x.bounds.height();
if(t.y>r){if(l){e+=t.y-r
}else{if(m.include(x)){e+=t.y-r
}}r=t.y
}if((w.x!=v)||(w.y!=u)||(t.x!=z)||(t.y!=y)){if(!m.include(x)){if((u-w.y)>f){f=u-w.y
}}x.bounds.set(w.x,w.y,t.x,t.y)
}});
k=k.sortBy(function(t){return t.bounds.upperLeft().y*10000+t.bounds.upperLeft().x
});
c=d;
var a=n-q;
var s=a;
var h=0;
k.each(function(x){var w=x.bounds.upperLeft();
var t=x.bounds.lowerRight();
var v=w.x;
var u=w.y;
var z=t.x;
var y=t.y;
if(w.y>c){c=w.y;
a=n-q
}w.x=a+q;
t.x=w.x+x.bounds.width();
a=t.x;
if(a>s){s=a
}if(t.y>h){h=t.y
}if((w.x!=v)||(w.y!=u)||(t.x!=z)||(t.y!=y)){x.bounds.set(w.x,w.y,t.x,t.y)
}});
if(o.shape!=this.facade.getCanvas()){var g=o.shape.bounds.upperLeft();
if(s>n){o.shape.bounds.set(g.x,g.y,g.x+s+n,g.y+r+d)
}}else{if(s>this.facade.getCanvas().bounds.width()){this.facade.getCanvas().setSize({width:(s+n),height:this.facade.getCanvas().bounds.height()})
}if(h>this.facade.getCanvas().bounds.height()){this.facade.getCanvas().setSize({width:this.facade.getCanvas().bounds.width(),height:(r+d)})
}}return
}};
ORYX.Plugins.RowLayouting=Clazz.extend(ORYX.Plugins.RowLayouting);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.PluginLoader=Clazz.extend({facade:undefined,mask:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.PluginLoad.AddPluginButtonName,functionality:this.showManageDialog.bind(this),group:ORYX.I18N.SSExtensionLoader.group,icon:ORYX.PATH+"images/labs/script_add.png",description:ORYX.I18N.PluginLoad.AddPluginButtonDesc,index:8,minShape:0,maxShape:0})
},showManageDialog:function(){this.mask=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.Oryx.pleaseWait});
this.mask.show();
var f=[];
var c=[];
var e=this.facade.getStencilSets().keys();
this.facade.getAvailablePlugins().each(function(h){if((!h.requires||!h.requires.namespaces||h.requires.namespaces.any(function(j){return e.indexOf(j)>=0
}))&&(!h.notUsesIn||!h.notUsesIn.namespaces||!h.notUsesIn.namespaces.any(function(j){return e.indexOf(j)>=0
}))){c.push(h)
}});
c.each(function(h){f.push([h.name,h.engaged===true])
});
if(f.length==0){return
}var b=new Ext.data.ArrayReader({},[{name:"name"},{name:"engaged"}]);
var g=new Ext.grid.CheckboxSelectionModel({listeners:{beforerowselect:function(l,h,j,k){this.mask=new Ext.LoadMask(Ext.getBody(),{msg:ORYX.I18N.Oryx.pleaseWait});
this.mask.show();
this.facade.activatePluginByName(k.data.name,function(m,n){this.mask.hide();
if(!!m){l.suspendEvents();
l.selectRow(h,true);
l.resumeEvents()
}else{Ext.Msg.show({title:ORYX.I18N.PluginLoad.loadErrorTitle,msg:ORYX.I18N.PluginLoad.loadErrorDesc+ORYX.I18N.PluginLoad[n],buttons:Ext.MessageBox.OK})
}}.bind(this));
return false
}.bind(this),rowdeselect:function(k,h,j){k.suspendEvents();
k.selectRow(h,true);
k.resumeEvents()
}}});
var d=new Ext.grid.GridPanel({store:new Ext.data.Store({reader:b,data:f}),cm:new Ext.grid.ColumnModel([{id:"name",width:390,sortable:true,dataIndex:"name"},g]),sm:g,width:450,height:250,frame:true,hideHeaders:true,iconCls:"icon-grid",listeners:{render:function(){var h=[];
this.grid.getStore().each(function(j){if(j.data.engaged){h.push(j)
}}.bind(this));
this.suspendEvents();
this.selectRecords(h);
this.resumeEvents()
}.bind(g)}});
var a=new Ext.Window({title:ORYX.I18N.PluginLoad.WindowTitle,width:"auto",height:"auto",modal:true});
a.add(d);
a.show();
this.mask.hide()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Save=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Save.save,functionality:this.save.bind(this,false),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk.png",description:ORYX.I18N.Save.saveDesc,index:1,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Save.saveAs,functionality:this.save.bind(this,true),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk_multi.png",description:ORYX.I18N.Save.saveAsDesc,index:2,minShape:0,maxShape:0});
window.onbeforeunload=this.onUnLoad.bind(this);
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this))
},onUnLoad:function(){if(this.changeDifference!==0){return ORYX.I18N.Save.unsavedData
}},saveSynchronously:function(e){this.changeDifference=0;
var d="";
if(this.processURI){d=this.processURI
}else{if(!location.hash.slice(1)){d="/backend/poem/new"
}else{d="/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self"
}}if(e){var c=this.facade.getStencilSets();
var h=c[c.keys()[0]].source().split("stencilsets")[1];
d="/backend/poem"+ORYX.CONFIG.ORYX_NEW_URL+"?stencilset=/stencilsets"+h
}var g=this.facade.getCanvas().getSVGRepresentation(true);
var f=DataManager.serialize(g);
this.serializedDOM=Ext.encode(this.facade.getJSON());
if(d.include(ORYX.CONFIG.ORYX_NEW_URL)){var c=this.facade.getStencilSets().values()[0];
var a={title:ORYX.I18N.Save.newProcess,summary:"",type:c.title(),url:d,namespace:c.namespace()};
var b=new Ext.XTemplate('<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',"<fieldset>",'<p class="description">'+ORYX.I18N.Save.dialogDesciption+"</p>",'<input type="hidden" name="namespace" value="{namespace}" />','<p><label for="edit_model_title">'+ORYX.I18N.Save.dialogLabelTitle+'</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>','<p><label for="edit_model_summary">'+ORYX.I18N.Save.dialogLabelDesc+'</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>','<p><label for="edit_model_type">'+ORYX.I18N.Save.dialogLabelType+'</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',"</fieldset>","</form>");
callback=function(l){var m=l.elements.title.value.strip();
m=m.length==0?a.title:m;
window.document.title=m+" - Oryx";
var j=l.elements.summary.value.strip();
j=j.length==0?a.summary:j;
var k=l.elements.namespace.value.strip();
k=k.length==0?a.namespace:k;
win.destroy();
this.sendSaveRequest(d,{data:this.serializedDOM,svg:f,title:m,summary:j,type:k},e)
}.bind(this);
win=new Ext.Window({id:"Propertie_Window",width:"auto",height:"auto",title:e?ORYX.I18N.Save.saveAsTitle:ORYX.I18N.Save.save,modal:true,bodyStyle:"background:#FFFFFF",html:b.apply(a),buttons:[{text:ORYX.I18N.Save.saveBtn,handler:function(){callback($("edit_model"))
}},{text:ORYX.I18N.Save.close,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
win.destroy()
}.bind(this)}]});
win.show()
}else{this.sendSaveRequest(d,{data:this.serializedDOM,svg:f})
}},sendSaveRequest:function(a,c,b){new Ajax.Request(a,{method:"POST",asynchronous:false,parameters:c,onSuccess:(function(g){var f=g.getResponseHeader("location");
if(f){this.processURI=f
}else{this.processURI=a
}var e="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");
location.hash="#"+e;
if(b){var d=new Ext.Window({title:ORYX.I18N.Save.savedAs,bodyStyle:"background:white;padding:10px",width:"auto",height:"auto",html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='"+f+"' target='_blank'>"+f+"</a></span>",buttons:[{text:"Ok",handler:function(){d.destroy()
}}]});
d.show()
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_MODEL_SAVED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Save.saved})
}).bind(this),onFailure:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.failed);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this),on403:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.noRights);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this)})
},save:function(a,b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.Save.saving});
window.setTimeout((function(){this.saveSynchronously(a)
}).bind(this),10);
return true
}});
ORYX.Plugins.File=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.File.print,functionality:this.print.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/printer.png",description:ORYX.I18N.File.printDesc,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.pdf,functionality:this.exportPDF.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_acrobat.png",description:ORYX.I18N.File.pdfDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.svg,functionality:this.exportSVG.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_code_red.png",description:ORYX.I18N.File.svgDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.info,functionality:this.info.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/information.png",description:ORYX.I18N.File.infoDesc,index:5,minShape:0,maxShape:0})
},info:function(){var a='<iframe src="'+ORYX.CONFIG.LICENSE_URL+'" type="text/plain" style="border:none;display:block;width:575px;height:460px;"/>\n\n<pre style="display:inline;">Version: </pre><iframe src="'+ORYX.CONFIG.VERSION_URL+'" type="text/plain" style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';
this.infoBox=Ext.Msg.show({title:ORYX.I18N.Oryx.title,msg:a,width:640,maxWidth:640,maxHeight:480,buttons:Ext.MessageBox.OK});
return false
},exportSVG:function(){var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
this.openDownloadWindow("oryx.svg",a)
},exportPDF:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.File.genPDF});
var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL,{method:"POST",parameters:{resource:c,data:a,format:"pdf"},onSuccess:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
window.open(d.responseText)
}).bind(this),onFailure:(function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.File.genPDFFailed)
}).bind(this)})
},print:function(){Ext.Msg.show({title:ORYX.I18N.File.printTitle,msg:ORYX.I18N.File.printMsg,buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(c){if(c=="yes"){var e=$H({width:300,height:400,toolbar:"no",status:"no",menubar:"yes",dependent:"yes",resizable:"yes",scrollbars:"yes"});
var f=window.open("","PrintWindow",e.invoke("join","=").join(","));
var b=f.document.getElementsByTagName("head")[0];
var d=document.createElement("style");
d.innerHTML=" body {padding:0px; margin:0px} .svgcontainer { display:none; }";
b.appendChild(d);
f.document.getElementsByTagName("body")[0].appendChild(this.facade.getCanvas().getSVGRepresentation());
var a=f.document.getElementsByTagName("body")[0].getElementsByTagName("svg")[0];
a.setAttributeNS(null,"width",1100);
a.setAttributeNS(null,"height",1400);
a.lastChild.setAttributeNS(null,"transform","scale(0.47, 0.47) rotate(270, 1510, 1470)");
var h=["marker-start","marker-mid","marker-end"];
var g=$A(f.document.getElementsByTagName("path"));
g.each(function(j){h.each(function(k){var l=j.getAttributeNS(null,k);
if(!l){return
}l="url(about:blank#"+l.slice(5);
j.setAttributeNS(null,k,l)
})
});
f.print();
return true
}}.bind(this)})
}});
window.onOryxResourcesLoaded=function(){if(location.hash.slice(1).length==0||location.hash.slice(1).indexOf("new")!=-1){var a=ORYX.Utils.getParamFromUrl("stencilset")||ORYX.CONFIG.SSET;
new ORYX.Editor({id:"oryx-canvas123",stencilset:{url:ORYX.PATH+"/"+a}})
}else{ORYX.Editor.createByUrl("/backend/poem"+location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+"json",{id:"oryx-canvas123",onFailure:function(b){if(403==b.status){Ext.Msg.show({title:"Authentication Failed",msg:'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{if(404==b.status){Ext.Msg.show({title:"Not Found",msg:"The model you requested could not be found.",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{Ext.Msg.show({title:"Internal Error",msg:"We're sorry, the model cannot be loaded due to an internal error",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}}}})
}};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Save=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,processURI:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.Save.save,functionality:this.save.bind(this,false),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk.png",description:ORYX.I18N.Save.saveDesc,index:1,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Save.saveAs,functionality:this.save.bind(this,true),group:ORYX.I18N.Save.group,icon:ORYX.PATH+"images/disk_multi.png",description:ORYX.I18N.Save.saveAsDesc,index:2,minShape:0,maxShape:0});
window.onbeforeunload=this.onUnLoad.bind(this);
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this))
},onUnLoad:function(){if(this.changeDifference!==0){return ORYX.I18N.Save.unsavedData
}},saveSynchronously:function(e){this.changeDifference=0;
var d="";
if(this.processURI){d=this.processURI
}else{if(!location.hash.slice(1)){d="/backend/poem/new"
}else{d="/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/self"
}}if(e){var c=this.facade.getStencilSets();
var h=c[c.keys()[0]].source().split("stencilsets")[1];
d="/backend/poem"+ORYX.CONFIG.ORYX_NEW_URL+"?stencilset=/stencilsets"+h
}var g=this.facade.getCanvas().getSVGRepresentation(true);
var f=DataManager.serialize(g);
this.serializedDOM=Ext.encode(this.facade.getJSON());
if(d.include(ORYX.CONFIG.ORYX_NEW_URL)){var c=this.facade.getStencilSets().values()[0];
var a={title:ORYX.I18N.Save.newProcess,summary:"",type:c.title(),url:d,namespace:c.namespace()};
var b=new Ext.XTemplate('<form class="oryx_repository_edit_model" action="#" id="edit_model" onsubmit="return false;">',"<fieldset>",'<p class="description">'+ORYX.I18N.Save.dialogDesciption+"</p>",'<input type="hidden" name="namespace" value="{namespace}" />','<p><label for="edit_model_title">'+ORYX.I18N.Save.dialogLabelTitle+'</label><input type="text" class="text" name="title" value="{title}" id="edit_model_title" onfocus="this.className = \'text activated\'" onblur="this.className = \'text\'"/></p>','<p><label for="edit_model_summary">'+ORYX.I18N.Save.dialogLabelDesc+'</label><textarea rows="5" name="summary" id="edit_model_summary" onfocus="this.className = \'activated\'" onblur="this.className = \'\'">{summary}</textarea></p>','<p><label for="edit_model_type">'+ORYX.I18N.Save.dialogLabelType+'</label><input type="text" name="type" class="text disabled" value="{type}" disabled="disabled" id="edit_model_type" /></p>',"</fieldset>","</form>");
callback=function(l){var m=l.elements.title.value.strip();
m=m.length==0?a.title:m;
window.document.title=m+" - Oryx";
var j=l.elements.summary.value.strip();
j=j.length==0?a.summary:j;
var k=l.elements.namespace.value.strip();
k=k.length==0?a.namespace:k;
win.destroy();
this.sendSaveRequest(d,{data:this.serializedDOM,svg:f,title:m,summary:j,type:k},e)
}.bind(this);
win=new Ext.Window({id:"Propertie_Window",width:"auto",height:"auto",title:e?ORYX.I18N.Save.saveAsTitle:ORYX.I18N.Save.save,modal:true,bodyStyle:"background:#FFFFFF",html:b.apply(a),buttons:[{text:ORYX.I18N.Save.saveBtn,handler:function(){callback($("edit_model"))
}},{text:ORYX.I18N.Save.close,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
win.destroy()
}.bind(this)}]});
win.show()
}else{this.sendSaveRequest(d,{data:this.serializedDOM,svg:f})
}},sendSaveRequest:function(a,c,b){new Ajax.Request(a,{method:"POST",asynchronous:false,parameters:c,onSuccess:(function(g){var f=g.getResponseHeader("location");
if(f){this.processURI=f
}else{this.processURI=a
}var e="/model"+this.processURI.split("model")[1].replace(/self\/?$/i,"");
location.hash="#"+e;
if(b){var d=new Ext.Window({title:ORYX.I18N.Save.savedAs,bodyStyle:"background:white;padding:10px",width:"auto",height:"auto",html:"<div style='font-weight:bold;margin-bottom:10px'>"+ORYX.I18N.Save.saveAsHint+"</div><span><a href='"+f+"' target='_blank'>"+f+"</a></span>",buttons:[{text:"Ok",handler:function(){d.destroy()
}}]});
d.show()
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_MODEL_SAVED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_STATUS,text:ORYX.I18N.Save.saved})
}).bind(this),onFailure:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.failed);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this),on403:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.Save.noRights);
ORYX.Log.warn("Saving failed: "+d.responseText)
}).bind(this)})
},save:function(a,b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.Save.saving});
window.setTimeout((function(){this.saveSynchronously(a)
}).bind(this),10);
return true
}});
ORYX.Plugins.File=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.File.print,functionality:this.print.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/printer.png",description:ORYX.I18N.File.printDesc,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.pdf,functionality:this.exportPDF.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_acrobat.png",description:ORYX.I18N.File.pdfDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.svg,functionality:this.exportSVG.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/page_white_code_red.png",description:ORYX.I18N.File.svgDesc,index:4,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.File.info,functionality:this.info.bind(this),group:ORYX.I18N.File.group,icon:ORYX.PATH+"images/information.png",description:ORYX.I18N.File.infoDesc,index:5,minShape:0,maxShape:0})
},info:function(){var a='<iframe src="'+ORYX.CONFIG.LICENSE_URL+'" type="text/plain" style="border:none;display:block;width:575px;height:460px;"/>\n\n<pre style="display:inline;">Version: </pre><iframe src="'+ORYX.CONFIG.VERSION_URL+'" type="text/plain" style="border:none;overflow:hidden;display:inline;width:40px;height:20px;"/>';
this.infoBox=Ext.Msg.show({title:ORYX.I18N.Oryx.title,msg:a,width:640,maxWidth:640,maxHeight:480,buttons:Ext.MessageBox.OK});
return false
},exportSVG:function(){var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
this.openDownloadWindow("oryx.svg",a)
},exportPDF:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_ENABLE,text:ORYX.I18N.File.genPDF});
var c=location.href;
var b=this.facade.getCanvas().getSVGRepresentation(true);
var a=DataManager.serialize(b);
new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL,{method:"POST",parameters:{resource:c,data:a,format:"pdf"},onSuccess:(function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
window.open(d.responseText)
}).bind(this),onFailure:(function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADING_DISABLE});
Ext.Msg.alert(ORYX.I18N.Oryx.title,ORYX.I18N.File.genPDFFailed)
}).bind(this)})
},print:function(){Ext.Msg.show({title:ORYX.I18N.File.printTitle,msg:ORYX.I18N.File.printMsg,buttons:Ext.Msg.YESNO,icon:Ext.MessageBox.QUESTION,fn:function(c){if(c=="yes"){var e=$H({width:300,height:400,toolbar:"no",status:"no",menubar:"yes",dependent:"yes",resizable:"yes",scrollbars:"yes"});
var f=window.open("","PrintWindow",e.invoke("join","=").join(","));
var b=f.document.getElementsByTagName("head")[0];
var d=document.createElement("style");
d.innerHTML=" body {padding:0px; margin:0px} .svgcontainer { display:none; }";
b.appendChild(d);
f.document.getElementsByTagName("body")[0].appendChild(this.facade.getCanvas().getSVGRepresentation());
var a=f.document.getElementsByTagName("body")[0].getElementsByTagName("svg")[0];
a.setAttributeNS(null,"width",1100);
a.setAttributeNS(null,"height",1400);
a.lastChild.setAttributeNS(null,"transform","scale(0.47, 0.47) rotate(270, 1510, 1470)");
var h=["marker-start","marker-mid","marker-end"];
var g=$A(f.document.getElementsByTagName("path"));
g.each(function(j){h.each(function(k){var l=j.getAttributeNS(null,k);
if(!l){return
}l="url(about:blank#"+l.slice(5);
j.setAttributeNS(null,k,l)
})
});
f.print();
return true
}}.bind(this)})
}});
window.onOryxResourcesLoaded=function(){if(location.hash.slice(1).length==0||location.hash.slice(1).indexOf("new")!=-1){var a=ORYX.Utils.getParamFromUrl("stencilset")||ORYX.CONFIG.SSET;
new ORYX.Editor({id:"oryx-canvas123",stencilset:{url:ORYX.PATH+"/"+a}})
}else{ORYX.Editor.createByUrl("/backend/poem"+location.hash.slice(1).replace(/\/*$/,"/").replace(/^\/*/,"/")+"json",{id:"oryx-canvas123",onFailure:function(b){if(403==b.status){Ext.Msg.show({title:"Authentication Failed",msg:'You may not have access rights for this model, maybe you forgot to <a href="'+ORYX.CONFIG.WEB_URL+'/backend/poem/repository">log in</a>?',icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{if(404==b.status){Ext.Msg.show({title:"Not Found",msg:"The model you requested could not be found.",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}else{Ext.Msg.show({title:"Internal Error",msg:"We're sorry, the model cannot be loaded due to an internal error",icon:Ext.MessageBox.WARNING,closeable:false,closable:false})
}}}})
}};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ContainerLayouter={construct:function(a){this.facade=a;
this.hashedContainers=new Hash()
},handleLayoutContainerDockers:function(b){var a=b.shape;
if(!this.hashedContainers[a.resourceId]){this.hashedContainers[a.resourceId]=a.bounds.clone();
return
}var c=a.bounds.upperLeft();
c.x-=this.hashedContainers[a.resourceId].upperLeft().x;
c.y-=this.hashedContainers[a.resourceId].upperLeft().y;
this.hashedContainers[a.resourceId]=a.bounds.clone();
this.moveChildDockers(a,c)
},handleLayoutContainerMinBounds:function(c){var h=c.shape;
var g=c.topOffset;
var b=h._oldBounds;
var m=c.options;
var e=(m.ignoreChildsWithId?m.ignoreChildsWithId:new Array());
var n=this.retrieveChildsIncludingBounds(h,e);
if(!n){return
}var l=this.getChildShapesWithout(h,e).find(function(o){return n.upperLeft().y==o.bounds.upperLeft().y
});
if(this.ensureContainersMinimumSize(h,n,l.absoluteBounds(),e,m)){return
}var a=n.upperLeft();
var k=n.lowerRight();
var f=(a.y?a.y:1)/((b.height()-k.y)?(b.height()-k.y):1);
var j=f*(h.bounds.height()-n.height())/(1+f);
this.getChildShapesWithout(h,e).each(function(p){var o=p.bounds.upperLeft().y-a.y;
p.bounds.moveTo({x:p.bounds.upperLeft().x,y:j+o})
});
var d=l.bounds.upperLeft().y-l._oldBounds.upperLeft().y;
this.moveChildDockers(h,{x:0,y:d})
},ensureContainersMinimumSize:function(b,m,u,l,d){var f=b.bounds;
var a=f.upperLeft();
var q=f.lowerRight();
var k=m.upperLeft();
var n=m.lowerRight();
var g=b.absoluteBounds();
if(!d){d=new Object()
}if(!b.isResized){var r=0;
var v=0;
var p=false;
var w=a.x;
var s=a.y;
var y=q.x;
var x=q.y;
if(k.x<0){w+=k.x;
v-=k.x;
p=true
}if(k.y<0){s+=k.y;
r-=k.y;
p=true
}var o=v+k.x+m.width()-f.width();
if(o>0){y+=o;
p=true
}var h=r+k.y+m.height()-f.height();
if(h>0){x+=h;
p=true
}f.set(w,s,y,x);
if(p){this.hashedContainers[b.resourceId]=f.clone()
}this.moveChildsBy(b,{x:v,y:r},l);
return true
}var w=a.x;
var s=a.y;
var y=q.x;
var x=q.y;
p=false;
if(f.height()<m.height()){if(a.y!=b._oldBounds.upperLeft().y&&q.y==b._oldBounds.lowerRight().y){s=x-m.height()-1;
if(d.fixedY){s-=m.upperLeft().y
}p=true
}else{if(a.y==b._oldBounds.upperLeft().y&&q.y!=b._oldBounds.lowerRight().y){x=s+m.height()+1;
if(d.fixedY){x+=m.upperLeft().y
}p=true
}else{if(u){var c=g.upperLeft().y-u.upperLeft().y;
var t=g.lowerRight().y-u.lowerRight().y;
s-=c;
x-=t;
s--;
x++;
p=true
}}}}if(f.width()<m.width()){if(a.x!=b._oldBounds.upperLeft().x&&q.x==b._oldBounds.lowerRight().x){w=y-m.width()-1;
if(d.fixedX){w-=m.upperLeft().x
}p=true
}else{if(a.x==b._oldBounds.upperLeft().x&&q.x!=b._oldBounds.lowerRight().x){y=w+m.width()+1;
if(d.fixedX){y+=m.upperLeft().x
}p=true
}else{if(u){var j=g.upperLeft().x-u.upperLeft().x;
var e=g.lowerRight().x-u.lowerRight().x;
w-=j;
y-=e;
w--;
y++;
p=true
}}}}f.set(w,s,y,x);
if(p){this.handleLayoutContainerDockers({shape:b})
}},moveChildsBy:function(a,c,b){if(!a||!c){return
}this.getChildShapesWithout(a,b).each(function(d){d.bounds.moveBy(c)
})
},getAbsoluteBoundsForChildShapes:function(a){},moveChildDockers:function(a,b){if(!b.x&&!b.y){return
}a.getChildNodes(true).map(function(c){return[].concat(c.getIncomingShapes()).concat(c.getOutgoingShapes())
}).flatten().uniq().map(function(c){return c.dockers.length>2?c.dockers.slice(1,c.dockers.length-1):[]
}).flatten().each(function(c){c.bounds.moveBy(b)
})
},retrieveChildsIncludingBounds:function(b,c){var a=undefined;
this.getChildShapesWithout(b,c).each(function(e,d){if(d==0){a=e.bounds.clone();
return
}a.include(e.bounds)
});
return a
},getChildShapesWithout:function(a,b){var c=a.getChildShapes(false);
return c.findAll(function(d){return !b.member(d.getStencil().id())
})
}};
ORYX.Plugins.ContainerLayouter=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ContainerLayouter);
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Plugins.Layouter){ORYX.Plugins.Layouter={}
}new function(){ORYX.Plugins.Layouter.EdgeLayouter=ORYX.Plugins.AbstractLayouter.extend({layouted:["http://b3mn.org/stencilset/bpmn1.1#SequenceFlow","http://b3mn.org/stencilset/bpmn1.1#MessageFlow","http://b3mn.org/stencilset/bpmn2.0#MessageFlow","http://b3mn.org/stencilset/bpmn2.0#SequenceFlow","http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink","http://b3mn.org/stencilset/epc#ControlFlow","http://www.signavio.com/stencilsets/processmap#ProcessLink","http://www.signavio.com/stencilsets/organigram#connection"],layout:function(a){a.each(function(b){this.doLayout(b)
}.bind(this))
},doLayout:function(b){var d=b.getIncomingNodes()[0];
var c=b.getOutgoingNodes()[0];
if(!d||!c){return
}var a=this.getPositions(d,c,b);
if(a.length>0){this.setDockers(b,a[0].a,a[0].b)
}},getPositions:function(q,r,e){var t=q.absoluteBounds();
var l=r.absoluteBounds();
var p=t.center();
var n=l.center();
var k=t.midPoint();
var d=l.midPoint();
var j=Object.clone(e.dockers.first().referencePoint);
var s=Object.clone(e.dockers.last().referencePoint);
var c=e.dockers.first().getAbsoluteReferencePoint();
var o=e.dockers.last().getAbsoluteReferencePoint();
if(Math.abs(c.x-o.x)<1||Math.abs(c.y-o.y)<1){return[]
}var g={};
g.x=p.x<n.x?(((n.x-l.width()/2)-(p.x+t.width()/2))/2)+(p.x+t.width()/2):(((p.x-t.width()/2)-(n.x+l.width()/2))/2)+(n.x+l.width()/2);
g.y=p.y<n.y?(((n.y-l.height()/2)-(p.y+t.height()/2))/2)+(p.y+t.height()/2):(((p.y-t.height()/2)-(n.y+l.height()/2))/2)+(n.y+l.height()/2);
t.widen(5);
l.widen(20);
var h=[];
var f=this.getOffset.bind(this);
if(!t.isIncluded(n.x,p.y)&&!l.isIncluded(n.x,p.y)){h.push({a:{x:n.x+f(s,d,"x"),y:p.y+f(j,k,"y")},z:this.getWeight(q,p.x<n.x?"r":"l",r,p.y<n.y?"t":"b",e)})
}if(!t.isIncluded(p.x,n.y)&&!l.isIncluded(p.x,n.y)){h.push({a:{x:p.x+f(j,k,"x"),y:n.y+f(s,d,"y")},z:this.getWeight(q,p.y<n.y?"b":"t",r,p.x<n.x?"l":"r",e)})
}if(!t.isIncluded(g.x,p.y)&&!l.isIncluded(g.x,n.y)){h.push({a:{x:g.x,y:p.y+f(j,k,"y")},b:{x:g.x,y:n.y+f(s,d,"y")},z:this.getWeight(q,"r",r,"l",e,p.x>n.x)})
}if(!t.isIncluded(p.x,g.y)&&!l.isIncluded(n.x,g.y)){h.push({a:{x:p.x+f(j,k,"x"),y:g.y},b:{x:n.x+f(s,d,"x"),y:g.y},z:this.getWeight(q,"b",r,"t",e,p.y>n.y)})
}return h.sort(function(u,m){return u.z<m.z?1:(u.z==m.z?-1:-1)
})
},getOffset:function(c,b,a){return c[a]-b[a]
},getWeight:function(l,b,m,a,d,g){b=(b||"").toLowerCase();
a=(a||"").toLowerCase();
if(!["t","r","b","l"].include(b)){b="r"
}if(!["t","r","b","l"].include(a)){b="l"
}if(g){b=b=="t"?"b":(b=="r"?"l":(b=="b"?"t":(b=="l"?"r":"r")));
a=a=="t"?"b":(a=="r"?"l":(a=="b"?"t":(a=="l"?"r":"r")))
}var f=0;
var o=this.facade.getRules().getLayoutingRules(l,d)["out"];
var n=this.facade.getRules().getLayoutingRules(m,d)["in"];
var e=o[b];
var c=n[a];
var k=function(r,q,p){switch(r){case"t":return Math.abs(q.x-p.x)<2&&q.y<p.y;
case"r":return q.x>p.x&&Math.abs(q.y-p.y)<2;
case"b":return Math.abs(q.x-p.x)<2&&q.y>p.y;
case"l":return q.x<p.x&&Math.abs(q.y-p.y)<2;
default:return false
}};
var j=l.getIncomingShapes().findAll(function(p){return p instanceof ORYX.Core.Edge
}).any(function(p){return k(b,p.dockers[p.dockers.length-2].bounds.center(),p.dockers.last().bounds.center())
});
var h=m.getOutgoingShapes().findAll(function(p){return p instanceof ORYX.Core.Edge
}).any(function(p){return k(a,p.dockers[1].bounds.center(),p.dockers.first().bounds.center())
});
return(j||h?0:e+c)
},setDockers:function(e,d,c){if(!e){return
}e.dockers.each(function(a){e.removeDocker(a)
});
[d,c].compact().each(function(b){var a=e.createDocker(undefined,b);
a.bounds.centerMoveTo(b)
});
e.dockers.each(function(a){a.update()
});
e._update(true)
}})
}();
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}if(!ORYX.Config){ORYX.Config=new Object()
}ORYX.Config.WaveThisGadgetUri="http://ddj0ahgq8zch6.cloudfront.net/gadget/oryx_stable.xml";
ORYX.Plugins.WaveThis=Clazz.extend({construct:function(a){this.facade=a;
this.facade.offer({name:ORYX.I18N.WaveThis.name,functionality:this.waveThis.bind(this),group:ORYX.I18N.WaveThis.group,icon:ORYX.PATH+"images/waveThis.png",description:ORYX.I18N.WaveThis.desc,dropDownGroupIcon:ORYX.PATH+"images/export2.png",});
this.changeDifference=0;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,function(){this.changeDifference++
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,function(){this.changeDifference--
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODEL_SAVED,function(){this.changeDifference=0
}.bind(this))
},waveThis:function(){var a;
if(!location.hash.slice(1)){Ext.Msg.alert(ORYX.I18N.WaveThis.name,ORYX.I18N.WaveThis.failUnsaved);
return
}else{a=ORYX.CONFIG.WEB_URL+"/backend/poem/"+(location.hash.slice(1).replace(/^\/?/,"").replace(/\/?$/,""))+"/json"
}if(this.changeDifference!=0){Ext.Msg.confirm(ORYX.I18N.WaveThis.name,"You have unsaved changes in your model. Proceed?",function(b){if(b=="yes"){this._openWave(a)
}},this)
}else{this._openWave(a)
}},_openWave:function(b){var c=window.open("");
if(c!=null){c.document.open();
c.document.write("<html><body>");
var a=c.document.createElement("form");
c.document.body.appendChild(a);
var d=function(e,f){var g=document.createElement("input");
g.name=e;
g.type="hidden";
g.value=f;
return g
};
a.appendChild(d("u",b));
a.appendChild(d("g",ORYX.Config.WaveThisGadgetUri));
a.method="POST";
c.document.write("</body></html>");
c.document.close();
a.action="https://wave.google.com/wave/wavethis?t=Oryx%20Model%20Export";
a.submit()
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Toolbar=Clazz.extend({facade:undefined,plugs:[],construct:function(b,a){this.facade=b;
this.groupIndex=new Hash();
a.properties.each((function(c){if(c.group&&c.index!=undefined){this.groupIndex[c.group]=c.index
}}).bind(this));
Ext.QuickTips.init();
this.buttons=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_BUTTON_UPDATE,this.onButtonUpdate.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.onSelectionChanged.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_WINDOW_FOCUS,this.onSelectionChanged.bind(this));
Event.observe(window,"focus",function(c){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_WINDOW_FOCUS},null)
}.bind(this))
},onButtonUpdate:function(b){var a=this.buttons.find(function(c){return c.id===b.id
});
if(b.pressed!==undefined){a.buttonInstance.toggle(b.pressed)
}},registryChanged:function(c){var b=c.sortBy((function(g){return((this.groupIndex[g.group]!=undefined?this.groupIndex[g.group]:"")+g.group+""+g.index).toLowerCase()
}).bind(this));
var a=$A(b).findAll(function(g){return !this.plugs.include(g)
}.bind(this));
if(a.length<1){return
}this.buttons=[];
ORYX.Log.trace("Creating a toolbar.");
if(!this.toolbar){this.toolbar=new Ext.ux.SlicedToolbar({height:24});
var e=this.facade.addToRegion("north",this.toolbar,"Toolbar")
}var f=this.plugs.last()?this.plugs.last().group:a[0].group;
var d={};
a.each((function(j){if(!j.name){return
}this.plugs.push(j);
if(f!=j.group){this.toolbar.add("-");
f=j.group;
d={}
}var h=j.functionality;
j.functionality=function(){if("undefined"!=typeof(pageTracker)&&"function"==typeof(pageTracker._trackEvent)){pageTracker._trackEvent("ToolbarButton",j.name)
}return h.apply(this,arguments)
};
if(j.dropDownGroupIcon){var l=d[j.dropDownGroupIcon];
if(l===undefined){l=d[j.dropDownGroupIcon]=new Ext.Toolbar.SplitButton({cls:"x-btn-icon",icon:j.dropDownGroupIcon,menu:new Ext.menu.Menu({items:[]}),listeners:{click:function(m,n){if(!m.menu.isVisible()&&!m.ignoreNextClick){m.showMenu()
}else{m.hideMenu()
}}}});
this.toolbar.add(l)
}var k={icon:j.icon,text:j.name,itemId:j.id,handler:j.toggle?undefined:j.functionality,checkHandler:j.toggle?j.functionality:undefined,listeners:{render:function(m){if(j.description){new Ext.ToolTip({target:m.getEl(),title:j.description})
}}}};
if(j.toggle){var g=new Ext.menu.CheckItem(k)
}else{var g=new Ext.menu.Item(k)
}l.menu.add(g)
}else{var g=new Ext.Toolbar.Button({icon:j.icon,cls:"x-btn-icon",itemId:j.id,tooltip:j.description,tooltipType:"title",handler:j.toggle?null:j.functionality,enableToggle:j.toggle,toggleHandler:j.toggle?j.functionality:null});
this.toolbar.add(g);
g.getEl().onclick=function(){this.blur()
}}j.buttonInstance=g;
this.buttons.push(j)
}).bind(this));
this.enableButtons([]);
this.toolbar.calcSlices();
window.addEventListener("resize",function(g){this.toolbar.calcSlices()
}.bind(this),false);
window.addEventListener("onresize",function(g){this.toolbar.calcSlices()
}.bind(this),false)
},onSelectionChanged:function(a){if(!a.elements){this.enableButtons([])
}else{this.enableButtons(a.elements)
}},enableButtons:function(a){this.buttons.each((function(b){b.buttonInstance.enable();
if(b.minShape&&b.minShape>a.length){b.buttonInstance.disable()
}if(b.maxShape&&b.maxShape<a.length){b.buttonInstance.disable()
}if(b.isEnabled&&!b.isEnabled()){b.buttonInstance.disable()
}}).bind(this))
}});
Ext.ns("Ext.ux");
Ext.ux.SlicedToolbar=Ext.extend(Ext.Toolbar,{currentSlice:0,iconStandardWidth:22,seperatorStandardWidth:2,toolbarStandardPadding:2,initComponent:function(){Ext.apply(this,{});
Ext.ux.SlicedToolbar.superclass.initComponent.apply(this,arguments)
},onRender:function(){Ext.ux.SlicedToolbar.superclass.onRender.apply(this,arguments)
},onResize:function(){Ext.ux.SlicedToolbar.superclass.onResize.apply(this,arguments)
},calcSlices:function(){var d=0;
this.sliceMap={};
var c=0;
var a=this.getEl().getWidth();
this.items.getRange().each(function(g,e){if(g.helperItem){g.destroy();
return
}var h=g.getEl().getWidth();
if(c+h+5*this.iconStandardWidth>a){var f=this.items.indexOf(g);
this.insertSlicingButton("next",d,f);
if(d!==0){this.insertSlicingButton("prev",d,f)
}this.insertSlicingSeperator(d,f);
d+=1;
c=0
}this.sliceMap[g.id]=d;
c+=h
}.bind(this));
if(d>0){this.insertSlicingSeperator(d,this.items.getCount()+1);
this.insertSlicingButton("prev",d,this.items.getCount()+1);
var b=new Ext.Toolbar.Spacer();
this.insertSlicedHelperButton(b,d,this.items.getCount()+1);
Ext.get(b.id).setWidth(this.iconStandardWidth)
}this.maxSlice=d;
this.setCurrentSlice(this.currentSlice)
},insertSlicedButton:function(b,c,a){this.insertButton(a,b);
this.sliceMap[b.id]=c
},insertSlicedHelperButton:function(b,c,a){b.helperItem=true;
this.insertSlicedButton(b,c,a)
},insertSlicingSeperator:function(b,a){this.insertSlicedHelperButton(new Ext.Toolbar.Fill(),b,a)
},insertSlicingButton:function(e,f,b){var d=function(){this.setCurrentSlice(this.currentSlice+1)
}.bind(this);
var a=function(){this.setCurrentSlice(this.currentSlice-1)
}.bind(this);
var c=new Ext.Toolbar.Button({cls:"x-btn-icon",icon:ORYX.CONFIG.ROOT_PATH+"images/toolbar_"+e+".png",handler:(e==="next")?d:a});
this.insertSlicedHelperButton(c,f,b)
},setCurrentSlice:function(a){if(a>this.maxSlice||a<0){return
}this.currentSlice=a;
this.items.getRange().each(function(b){b.setVisible(a===this.sliceMap[b.id])
}.bind(this))
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeMenuPlugin={construct:function(c){this.facade=c;
this.alignGroups=new Hash();
var a=this.facade.getCanvas().getHTMLContainer();
this.shapeMenu=new ORYX.Plugins.ShapeMenu(a);
this.currentShapes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START,this.hideShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,this.showShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_START,(function(){this.hideShapeMenu();
this.hideMorphMenu()
}).bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_END,this.showShapeMenu.bind(this));
var b=new Ext.dd.DragZone(a.parentNode,{shadow:!Ext.isMac});
b.afterDragDrop=this.afterDragging.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
this.createdButtons={};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,(function(){this.registryChanged()
}).bind(this));
this.timer=null;
this.resetElements=true
},hideShapeMenu:function(a){window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.hide()
},showShapeMenu:function(a){if(!a||this.resetElements){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.shapeMenu.closeAllButtons();
this.showMorphButton(this.currentShapes);
this.showStencilButtons(this.currentShapes);
this.shapeMenu.show(this.currentShapes);
this.resetElements=false
}.bind(this),300)
}else{window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.show(this.currentShapes)
}},registryChanged:function(a){if(a){a=a.each(function(d){d.group=d.group?d.group:"unknown"
});
this.pluginsData=a.sortBy(function(d){return(d.group+""+d.index)
})
}this.shapeMenu.removeAllButtons();
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_RIGHT,2);
this.createdButtons={};
this.createMorphMenu();
if(!this.pluginsData){this.pluginsData=[]
}this.baseMorphStencils=this.facade.getRules().baseMorphs();
var b=this.facade.getRules().containsMorphingRules();
var c=this.facade.getStencilSets();
c.values().each((function(f){var e=f.nodes();
e.each((function(j){var h={type:j.id(),namespace:j.namespace(),connectingType:true};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:j.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:0,msg:j.title()+" - "+ORYX.I18N.ShapeMenuPlugin.clickDrag});
this.shapeMenu.addButton(g);
this.createdButtons[j.namespace()+j.type()+j.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this));
var d=f.edges();
d.each((function(j){var h={type:j.id(),namespace:j.namespace()};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:j.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:1,msg:(b?ORYX.I18N.Edge:j.title())+" - "+ORYX.I18N.ShapeMenuPlugin.drag});
this.shapeMenu.addButton(g);
this.createdButtons[j.namespace()+j.type()+j.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this))
}).bind(this))
},createMorphMenu:function(){this.morphMenu=new Ext.menu.Menu({id:"Oryx_morph_menu",items:[]});
this.morphMenu.on("mouseover",function(){this.morphMenuHovered=true
},this);
this.morphMenu.on("mouseout",function(){this.morphMenuHovered=false
},this);
var a=new ORYX.Plugins.ShapeMenuButton({hovercallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.showMorphMenu.bind(this):undefined),resetcallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.hideMorphMenu.bind(this):undefined),callback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?undefined:this.toggleMorphMenu.bind(this)),icon:ORYX.PATH+"images/wrench_orange.png",align:ORYX.CONFIG.SHAPEMENU_BOTTOM,group:0,msg:ORYX.I18N.ShapeMenuPlugin.morphMsg});
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_BOTTOM,1);
this.shapeMenu.addButton(a);
this.morphMenu.getEl().appendTo(a.node);
this.morphButton=a
},showMorphMenu:function(){this.morphMenu.show(this.morphButton.node);
this._morphMenuShown=true
},hideMorphMenu:function(){this.morphMenu.hide();
this._morphMenuShown=false
},toggleMorphMenu:function(){if(this._morphMenuShown){this.hideMorphMenu()
}else{this.showMorphMenu()
}},onSelectionChanged:function(a){var b=a.elements;
this.hideShapeMenu();
this.hideMorphMenu();
if(this.currentShapes.inspect()!==b.inspect()){this.currentShapes=b;
this.resetElements=true;
this.showShapeMenu()
}else{this.showShapeMenu(true)
}},showMorphButton:function(b){if(b.length!=1){return
}var a=this.facade.getRules().morphStencils({stencil:b[0].getStencil()});
a=a.select(function(c){if(b[0].getStencil().type()==="node"){return this.facade.getRules().canContain({containingShape:b[0].parent,containedStencil:c})
}else{return this.facade.getRules().canConnect({sourceShape:b[0].dockers.first().getDockedShape(),edgeStencil:c,targetShape:b[0].dockers.last().getDockedShape()})
}}.bind(this));
if(a.size()<=1){return
}this.morphMenu.removeAll();
a=a.sortBy(function(c){return c.position()
});
a.each((function(d){var c=new Ext.menu.Item({text:d.title(),icon:d.icon(),disabled:d.id()==b[0].getStencil().id(),disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.morphShape(b[0],d)
}).bind(this)});
this.morphMenu.add(c)
}).bind(this));
this.morphButton.prepareToShow()
},showStencilButtons:function(g){if(g.length!=1){return
}var f=this.facade.getStencilSets()[g[0].getStencil().namespace()];
var c=this.facade.getRules().outgoingEdgeStencils({canvas:this.facade.getCanvas(),sourceShape:g[0]});
var a=new Array();
var d=new Array();
var e=this.facade.getRules().containsMorphingRules();
c.each((function(j){if(e){if(this.baseMorphStencils.include(j)){var k=true
}else{var h=this.facade.getRules().morphStencils({stencil:j});
var k=!h.any((function(l){if(this.baseMorphStencils.include(l)&&c.include(l)){return true
}return d.include(l)
}).bind(this))
}}if(k||!e){if(this.createdButtons[j.namespace()+j.type()+j.id()]){this.createdButtons[j.namespace()+j.type()+j.id()].prepareToShow()
}d.push(j)
}a=a.concat(this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(),sourceShape:g[0],edgeStencil:j}))
}).bind(this));
a.uniq();
var b=new Array();
a.each((function(k){if(e){if(k.type()==="edge"){return
}if(!this.facade.getRules().showInShapeMenu(k)){return
}if(!this.baseMorphStencils.include(k)){var h=this.facade.getRules().morphStencils({stencil:k});
if(h.size()==0){return
}var j=h.any((function(l){if(this.baseMorphStencils.include(l)&&a.include(l)){return true
}return b.include(l)
}).bind(this));
if(j){return
}}}if(this.createdButtons[k.namespace()+k.type()+k.id()]){this.createdButtons[k.namespace()+k.type()+k.id()].prepareToShow()
}b.push(k)
}).bind(this))
},beforeDragOver:function(m,l,b){if(this.shapeMenu.isVisible){this.hideShapeMenu()
}var k=this.facade.eventCoordinates(b.browserEvent);
var r=this.facade.getCanvas().getAbstractShapesAtPosition(k);
if(r.length<=0){return false
}var d=r.last();
if(this._lastOverElement==d){return false
}else{var h=Ext.dd.Registry.getHandle(l.DDM.currentTarget);
if(h.backupOptions){for(key in h.backupOptions){h[key]=h.backupOptions[key]
}delete h.backupOptions
}var n=this.facade.getStencilSets()[h.namespace];
var p=n.stencil(h.type);
var q=r.last();
if(p.type()==="node"){var c=this.facade.getRules().canContain({containingShape:q,containedStencil:p});
if(!c){var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){c=this.facade.getRules().canContain({containingShape:q,containedStencil:o[g]});
if(c){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}}}this._currentReference=c?q:undefined
}else{var j=q,e=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:p,targetShape:j});
j=j.parent
}if(!f){q=e;
var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){var j=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:o[g],targetShape:j});
j=j.parent
}if(f){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}else{q=e
}}}this._currentReference=f?q:undefined
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeMenu",elements:[q],color:this._currentReference?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
var a=m.getProxy();
a.setStatus(this._currentReference?a.dropAllowed:a.dropNotAllowed);
a.sync()
}this._lastOverElement=d;
return false
},afterDragging:function(j,f,b){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}var e=this.currentShapes;
this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeMenu"});
var h=j.getProxy();
if(h.dropStatus==h.dropNotAllowed){return this.facade.updateSelection()
}if(!this._currentReference){return
}var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
d.parent=this._currentReference;
var q=b.getXY();
var k={x:q[0],y:q[1]};
var m=this.facade.getCanvas().node.getScreenCTM();
k.x-=m.e;
k.y-=m.f;
k.x/=m.a;
k.y/=m.d;
k.x-=document.documentElement.scrollLeft;
k.y-=document.documentElement.scrollTop;
var p=this._currentReference.absoluteXY();
k.x-=p.x;
k.y-=p.y;
if(!b.ctrlKey){var l=this.currentShapes[0].bounds.center();
if(20>Math.abs(l.x-k.x)){k.x=l.x
}if(20>Math.abs(l.y-k.y)){k.y=l.y
}}d.position=k;
d.connectedShape=this.currentShapes[0];
if(d.connectingType){var o=this.facade.getStencilSets()[d.namespace];
var n=o.stencil(d.type);
var g={sourceShape:this.currentShapes[0],targetStencil:n};
d.connectingType=this.facade.getRules().connectMorph(g).id()
}if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete d.connectingType
}var c=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(Object.clone(d),this._currentReference,k,this);
this.facade.executeCommands([c]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE,source:e,destination:this.currentShapes});
if(d.backupOptions){for(key in d.backupOptions){d[key]=d.backupOptions[key]
}delete d.backupOptions
}this._currentReference=undefined
},newShape:function(e,f){var a=this.facade.getStencilSets()[e.namespace];
var d=a.stencil(e.type);
if(this.facade.getRules().canContain({containingShape:this.currentShapes.first().parent,containedStencil:d})){e.connectedShape=this.currentShapes[0];
e.parent=this.currentShapes.first().parent;
e.containedStencil=d;
var b={sourceShape:this.currentShapes[0],targetStencil:d};
var c=this.facade.getRules().connectMorph(b);
if(!c){return
}e.connectingType=c.id();
if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete e.connectingType
}var g=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(e,undefined,undefined,this);
this.facade.executeCommands([g])
}},morphShape:function(a,b){var d=ORYX.Core.Command.extend({construct:function(e,g,f){this.shape=e;
this.stencil=g;
this.facade=f
},execute:function(){var n=this.shape;
var r=this.stencil;
var m=n.resourceId;
var h=n.serialize();
r.properties().each((function(s){if(s.readonly()){h=h.reject(function(t){return t.name==s.id()
})
}}).bind(this));
if(this.newShape){newShape=this.newShape;
this.facade.getCanvas().add(newShape)
}else{newShape=this.facade.createShape({type:r.id(),namespace:r.namespace(),resourceId:m})
}var l=h.find(function(s){return(s.prefix==="oryx"&&s.name==="bounds")
});
var o=null;
if(!this.facade.getRules().preserveBounds(n.getStencil())){var e=l.value.split(",");
if(parseInt(e[0],10)>parseInt(e[2],10)){var j=e[0];
e[0]=e[2];
e[2]=j;
j=e[1];
e[1]=e[3];
e[3]=j
}e[2]=parseInt(e[0],10)+newShape.bounds.width();
e[3]=parseInt(e[1],10)+newShape.bounds.height();
l.value=e.join(",")
}else{var q=n.bounds.height();
var f=n.bounds.width();
if(newShape.minimumSize){if(n.bounds.height()<newShape.minimumSize.height){q=newShape.minimumSize.height
}if(n.bounds.width()<newShape.minimumSize.width){f=newShape.minimumSize.width
}}if(newShape.maximumSize){if(n.bounds.height()>newShape.maximumSize.height){q=newShape.maximumSize.height
}if(n.bounds.width()>newShape.maximumSize.width){f=newShape.maximumSize.width
}}o={a:{x:n.bounds.a.x,y:n.bounds.a.y},b:{x:n.bounds.a.x+f,y:n.bounds.a.y+q}}
}var p=n.bounds.center();
if(o!==null){newShape.bounds.set(o)
}this.setRelatedDockers(n,newShape);
var k=n.node.parentNode;
var g=n.node.nextSibling;
this.facade.deleteShape(n);
newShape.deserialize(h);
if(n.getStencil().property("oryx-bgcolor")&&n.properties["oryx-bgcolor"]&&n.getStencil().property("oryx-bgcolor").value().toUpperCase()==n.properties["oryx-bgcolor"].toUpperCase()){if(newShape.getStencil().property("oryx-bgcolor")){newShape.setProperty("oryx-bgcolor",newShape.getStencil().property("oryx-bgcolor").value())
}}if(o!==null){newShape.bounds.set(o)
}if(newShape.getStencil().type()==="edge"||(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){newShape.bounds.centerMoveTo(p)
}if(newShape.getStencil().type()==="node"&&(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){this.setRelatedDockers(newShape,newShape)
}if(g){k.insertBefore(newShape.node,g)
}else{k.appendChild(newShape.node)
}this.facade.setSelection([newShape]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.newShape=newShape;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SHAPE_MORPHED,shape:newShape})
},rollback:function(){if(!this.shape||!this.newShape||!this.newShape.parent){return
}this.newShape.parent.add(this.shape);
this.setRelatedDockers(this.newShape,this.shape);
this.facade.deleteShape(this.newShape);
this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},setRelatedDockers:function(e,f){if(e.getStencil().type()==="node"){(e.incoming||[]).concat(e.outgoing||[]).each(function(g){g.dockers.each(function(k){if(k.getDockedShape()==e){var j=Object.clone(k.referencePoint);
var l={x:j.x*f.bounds.width()/e.bounds.width(),y:j.y*f.bounds.height()/e.bounds.height()};
k.setDockedShape(f);
k.setReferencePoint(l);
if(g instanceof ORYX.Core.Edge){k.bounds.centerMoveTo(l)
}else{var h=e.absoluteXY();
k.bounds.centerMoveTo({x:l.x+h.x,y:l.y+h.y})
}}})
});
if(e.dockers.length>0&&e.dockers.first().getDockedShape()){f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(Object.clone(e.dockers.first().referencePoint))
}}else{f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(e.dockers.first().referencePoint);
f.dockers.last().setDockedShape(e.dockers.last().getDockedShape());
f.dockers.last().setReferencePoint(e.dockers.last().referencePoint)
}}});
var c=new d(a,b,this.facade);
this.facade.executeCommands([c])
}};
ORYX.Plugins.ShapeMenuPlugin=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ShapeMenuPlugin);
ORYX.Plugins.ShapeMenu={construct:function(a){this.bounds=undefined;
this.shapes=undefined;
this.buttons=[];
this.isVisible=false;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(a),["div",{id:ORYX.Editor.provideId(),"class":"Oryx_ShapeMenu"}]);
this.alignContainers=new Hash();
this.numberOfButtonsPerLevel=new Hash()
},addButton:function(b){this.buttons.push(b);
if(!this.alignContainers[b.align]){this.alignContainers[b.align]=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["div",{"class":b.align}]);
this.node.appendChild(this.alignContainers[b.align]);
var a=false;
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hoverAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.resetAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hoverAlignContainer.bind(this,b.align),a)
}this.alignContainers[b.align].appendChild(b.node)
},deleteButton:function(a){this.buttons=this.buttons.without(a);
this.node.removeChild(a.node)
},removeAllButtons:function(){var a=this;
this.buttons.each(function(b){if(b.node&&b.node.parentNode){b.node.parentNode.removeChild(b.node)
}});
this.buttons=[]
},closeAllButtons:function(){this.buttons.each(function(a){a.prepareToHide()
});
this.isVisible=false
},show:function(e){if(e.length<=0){return
}this.shapes=e;
var f=undefined;
var h=undefined;
this.shapes.each(function(q){var p=q.node.getScreenCTM();
var r=q.absoluteXY();
p.e=p.a*r.x;
p.f=p.d*r.y;
h=new ORYX.Core.Bounds(p.e,p.f,p.e+p.a*q.bounds.width(),p.f+p.d*q.bounds.height());
if(!f){f=h
}else{f.include(h)
}});
this.bounds=f;
var c=this.bounds;
var l=this.bounds.upperLeft();
var g=0,d=0;
var j=0,k=0;
var b=0,m;
var n=0;
rightButtonGroup=0;
var o=22;
this.getWillShowButtons().sortBy(function(a){return a.group
});
this.getWillShowButtons().each(function(p){var q=this.getNumberOfButtonsPerLevel(p.align);
if(p.align==ORYX.CONFIG.SHAPEMENU_LEFT){if(p.group!=d){g=0;
d=p.group
}var a=Math.floor(g/q);
var r=g%q;
p.setLevel(a);
p.setPosition(l.x-5-(a+1)*o,l.y+q*p.group*o+p.group*0.3*o+r*o);
g++
}else{if(p.align==ORYX.CONFIG.SHAPEMENU_TOP){if(p.group!=k){j=0;
k=p.group
}var a=j%q;
var r=Math.floor(j/q);
p.setLevel(r);
p.setPosition(l.x+q*p.group*o+p.group*0.3*o+a*o,l.y-5-(r+1)*o);
j++
}else{if(p.align==ORYX.CONFIG.SHAPEMENU_BOTTOM){if(p.group!=m){b=0;
m=p.group
}var a=b%q;
var r=Math.floor(b/q);
p.setLevel(r);
p.setPosition(l.x+q*p.group*o+p.group*0.3*o+a*o,l.y+c.height()+5+r*o);
b++
}else{if(p.group!=rightButtonGroup){n=0;
rightButtonGroup=p.group
}var a=Math.floor(n/q);
var r=n%q;
p.setLevel(a);
p.setPosition(l.x+c.width()+5+a*o,l.y+q*p.group*o+p.group*0.3*o+r*o-5);
n++
}}}p.show()
}.bind(this));
this.isVisible=true
},hide:function(){this.buttons.each(function(a){a.hide()
});
this.isVisible=false
},hoverAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showOpaque()
}})
},resetAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showTransparent()
}})
},isHover:function(){return this.buttons.any(function(a){return a.isHover()
})
},getWillShowButtons:function(){return this.buttons.findAll(function(a){return a.willShow
})
},getButtons:function(b,a){return this.getWillShowButtons().findAll(function(c){return c.align==b&&(a===undefined||c.group==a)
})
},setNumberOfButtonsPerLevel:function(b,a){this.numberOfButtonsPerLevel[b]=a
},getNumberOfButtonsPerLevel:function(a){if(this.numberOfButtonsPerLevel[a]){return Math.min(this.getButtons(a,0).length,this.numberOfButtonsPerLevel[a])
}else{return 1
}}};
ORYX.Plugins.ShapeMenu=Clazz.extend(ORYX.Plugins.ShapeMenu);
ORYX.Plugins.ShapeMenuButton={construct:function(b){if(b){this.option=b;
if(!this.option.arguments){this.option.arguments=[]
}}else{}this.parentId=this.option.id?this.option.id:null;
var e=this.option.caption?"Oryx_button_with_caption":"Oryx_button";
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":e}]);
var c={src:this.option.icon};
if(this.option.msg){c.title=this.option.msg
}if(this.option.icon){ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["img",c])
}if(this.option.caption){var d=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["span"]);
ORYX.Editor.graft("http://www.w3.org/1999/xhtml",d,this.option.caption)
}var a=false;
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hover.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.reset.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.activate.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hover.bind(this),a);
this.node.addEventListener("click",this.trigger.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.move.bind(this),a);
this.align=this.option.align?this.option.align:ORYX.CONFIG.SHAPEMENU_RIGHT;
this.group=this.option.group?this.option.group:0;
this.hide();
this.dragStart=false;
this.isVisible=false;
this.willShow=false;
this.resetTimer
},hide:function(){this.node.style.display="none";
this.isVisible=false
},show:function(){this.node.style.display="";
this.node.style.opacity=this.opacity;
this.isVisible=true
},showOpaque:function(){this.node.style.opacity=1
},showTransparent:function(){this.node.style.opacity=this.opacity
},prepareToShow:function(){this.willShow=true
},prepareToHide:function(){this.willShow=false;
this.hide()
},setPosition:function(a,b){this.node.style.left=a+"px";
this.node.style.top=b+"px"
},setLevel:function(a){if(a==0){this.opacity=0.5
}else{if(a==1){this.opacity=0.2
}else{this.opacity=0
}}},setChildWidth:function(a){this.childNode.style.width=a+"px"
},reset:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=window.setTimeout(this.doReset.bind(this),100);
if(this.option.resetcallback){this.option.arguments.push(a);
var b=this.option.resetcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},doReset:function(){if(this.node.hasClassName("Oryx_down")){this.node.removeClassName("Oryx_down")
}if(this.node.hasClassName("Oryx_hover")){this.node.removeClassName("Oryx_hover")
}},activate:function(a){this.node.addClassName("Oryx_down");
this.dragStart=true
},isHover:function(){return this.node.hasClassName("Oryx_hover")?true:false
},hover:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=null;
this.node.addClassName("Oryx_hover");
this.dragStart=false;
if(this.option.hovercallback){this.option.arguments.push(a);
var b=this.option.hovercallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},move:function(a){if(this.dragStart&&this.option.dragcallback){this.option.arguments.push(a);
var b=this.option.dragcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},trigger:function(a){if(this.option.callback){this.option.arguments.push(a);
var b=this.option.callback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}this.dragStart=false
},toString:function(){return"HTML-Button "+this.id
}};
ORYX.Plugins.ShapeMenuButton=Clazz.extend(ORYX.Plugins.ShapeMenuButton);
ORYX.Plugins.ShapeMenuPlugin.CreateCommand=ORYX.Core.Command.extend({construct:function(c,b,a,d){this.option=c;
this.currentReference=b;
this.position=a;
this.plugin=d;
this.shape;
this.edge;
this.targetRefPos;
this.sourceRefPos;
this.connectedShape=c.connectedShape;
this.connectingType=c.connectingType;
this.namespace=c.namespace;
this.type=c.type;
this.containedStencil=c.containedStencil;
this.parent=c.parent;
this.currentReference=b;
this.shapeOptions=c.shapeOptions
},execute:function(){var d=false;
if(this.shape){if(this.shape instanceof ORYX.Core.Node){this.parent.add(this.shape);
if(this.edge){this.plugin.facade.getCanvas().add(this.edge);
this.edge.dockers.first().setDockedShape(this.connectedShape);
this.edge.dockers.first().setReferencePoint(this.sourceRefPos);
this.edge.dockers.last().setDockedShape(this.shape);
this.edge.dockers.last().setReferencePoint(this.targetRefPos)
}this.plugin.facade.setSelection([this.shape])
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.facade.getCanvas().add(this.shape);
this.shape.dockers.first().setDockedShape(this.connectedShape);
this.shape.dockers.first().setReferencePoint(this.sourceRefPos)
}}d=true
}else{this.shape=this.plugin.facade.createShape(this.option);
this.edge=(!(this.shape instanceof ORYX.Core.Edge))?this.shape.getIncomingShapes().first():undefined
}if(this.currentReference&&this.position){if(this.shape instanceof ORYX.Core.Edge){if(!(this.currentReference instanceof ORYX.Core.Canvas)){this.shape.dockers.last().setDockedShape(this.currentReference);
var g=this.currentReference.absoluteXY();
var e={x:this.position.x-g.x,y:this.position.y-g.y};
this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint())
}else{this.shape.dockers.last().bounds.centerMoveTo(this.position)
}this.sourceRefPos=this.shape.dockers.first().referencePoint;
this.targetRefPos=this.shape.dockers.last().referencePoint
}else{if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}}else{var c=this.containedStencil;
var a=this.connectedShape;
var f=a.bounds;
var b=this.shape.bounds;
var h=f.center();
if(c.defaultAlign()==="north"){h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="northeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="southeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="south"){h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="southwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="west"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}else{if(c.defaultAlign()==="northwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}}}}}}}this.shape.bounds.centerMoveTo(h);
if(this.shape instanceof ORYX.Core.Node){(this.shape.dockers||[]).each(function(j){j.bounds.centerMoveTo(h)
})
}this.position=h;
if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection();
if(!d){if(this.edge){this.plugin.doLayout(this.edge)
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.doLayout(this.shape)
}}}},rollback:function(){this.plugin.facade.deleteShape(this.shape);
if(this.edge){this.plugin.facade.deleteShape(this.edge)
}this.plugin.facade.setSelection(this.plugin.facade.getSelection().without(this.shape,this.edge))
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Loading={construct:function(a){this.facade=a;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.facade.getCanvas().getHTMLContainer().parentNode,["div",{"class":"LoadingIndicator"},""]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_ENABLE,this.enableLoading.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_DISABLE,this.disableLoading.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_STATUS,this.showStatus.bind(this));
this.disableLoading()
},enableLoading:function(a){if(a.text){this.node.innerHTML=a.text+"..."
}else{this.node.innerHTML=ORYX.I18N.Loading.waiting
}this.node.removeClassName("StatusIndicator");
this.node.addClassName("LoadingIndicator");
this.node.style.display="block";
var b=this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;
this.node.style.top=b.offsetTop+"px";
this.node.style.left=b.offsetLeft+"px"
},disableLoading:function(){this.node.style.display="none"
},showStatus:function(a){if(a.text){this.node.innerHTML=a.text;
this.node.addClassName("StatusIndicator");
this.node.removeClassName("LoadingIndicator");
this.node.style.display="block";
var c=this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;
this.node.style.top=c.offsetTop+"px";
this.node.style.left=c.offsetLeft+"px";
var b=a.timeout?a.timeout:2000;
window.setTimeout((function(){this.disableLoading()
}).bind(this),b)
}}};
ORYX.Plugins.Loading=Clazz.extend(ORYX.Plugins.Loading);