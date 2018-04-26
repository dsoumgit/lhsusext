sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	
	return Controller.extend("lhsusext.controller.Master", {
		
		onInit: function () {
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this); 

			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
		
			// Set menu list 
			this.bus.subscribe("app", "MenuCollection", this.setCollection, this);
		},
		
		onBeforeRendering: function () {
			// Setting up data 
			this.setData(); 	
		},
		
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName !== "master") {
				return; 
			}
			
			//Load the master2 view in desktop
			this.getRouter().myNavToWithoutHash({
				currentView: this.getView(),
				targetViewName: "lhsusext.view.Detail",
				targetViewType: "XML"
			});
			
			//Load the detail view in desktop
			this.loadDetailView();
		},
	
	
		setData: function () {
			// Get today's year
			var year = new Date().getFullYear();
			// Construct data json
			var data = {
				"Tickets": [{
					"title": "Quarterly Analysis",
					"name": "Quarterly Tickets",
					"id": 1
				}, {
					"title": "Monthly Analysis",
					"name": "Monthly Tickets",
					"id": 2
				}, {
					"title": "Weekly Analysis",
					"name": "Weekly Tickets",
					"id": 3
				}],
				"PointConsump": [{
					"title": "Quarterly Analysis",
					"name": "Quarterly Point", 
					"id": 1
				}, {
					"title": "Monthly Analysis",
					"name": "Monthly Point",
					"id": 2
				}],
				"Functional": [{
					"title": year + " Analysis",
					"name": year + " Functional",
					"id": 1
				}]
			};
				
			// Set to the model
			this.bus.publish("app", "MenuCollection", data);
		},
		
		setCollection: function (channelId, eventId, data) {
			var oModel = new sap.ui.model.json.JSONModel();
			// Set default binding to One Way
		//	oModel.setDefaultBindingMode("OneWay");
			// Set data to model
			oModel.setData(data);
			this.getView().setModel(oModel, "MenuList");	
		},
		
		onItemPress: function (oEvent) {
			// Get object 
			var obj = oEvent.getSource().getBindingContext("MenuList").getObject();
			var objId = obj.id; 
			
			// Get today's year 
			var year = new Date().getFullYear();
			
			// Route based on each view condition 
			if (obj.name === "Quarterly Tickets") {
				// Navigate the view
				this.getObj("ticketQuarterly", objId);
			} else if (obj.name === "Monthly Tickets") {
				this.getObj("ticketMonthly", objId);
			} else if (obj.name === "Weekly Tickets") {
				this.getObj("ticketWeekly", objId);
			} else if (obj.name === "Quarterly Point") {
				this.getObj("pointQuarterly", objId);
			} else if (obj.name === "Monthly Point") {	
				this.getObj("pointMonthly", objId);
			} else if (obj.name === year + " Functional") {	
				this.getObj("funcCurYear", objId);
			}
		},
		
		getObj: function (name, id) {
			this.oRouter.navTo(name, {
				entity: id
			});		
		},
		
		onContactPress: function() {
			var contDialog = new sap.m.Dialog({
				title: 'Contact Us',
				icon: "sap-icon://contacts",
				contentWidth: "auto",
				contentHeight: "100px",
				content: new sap.m.FlexBox({
					height: "100px",
					alignItems: "Center",
					justifyContent: "Center",
					items: new sap.ui.layout.VerticalLayout({
						content: [
							new sap.m.Text({
								text: "Please contact us via:",
								textAlign: "Center"
							}),
							new sap.m.Link({
								text: "lighthouse@revealvalue.com",
								href: "mailto:lighthouse@revealvalue.com?Subject=Lighthouse Support Request"
									//	href: "mailto:lighthouse@revealvalue.com?Subject=Contact Us"
							})
						]
					})
				}),
				beginButton: new sap.m.Button({
					text: 'Close',
					press: function() {
						contDialog.close();
					}
				})
			});

			contDialog.open();
		},

		onInfoPress: function() {
			// Access manifest file for sap.app
			var manifest = this.getOwnerComponent().getManifestEntry("sap.app");
			// Get app version 
			var appVersion = manifest.applicationVersion.version;
			// Get Global model
			var globalModel = this.getOwnerComponent().getModel("Global");
			// Get global data 
			var globalData = globalModel.getData();
			// Add trademark symbol
			var tradeMark = "\u2122";
			var space = " ";
			var infoDialog = new sap.m.Dialog({
				title: 'Information',
				icon: "sap-icon://message-information",
				contentWidth: "auto",
				contentHeight: "auto",
				content: new sap.m.FlexBox({
					height: "100px",
					alignItems: "Center",
					justifyContent: "Center",
					items: new sap.ui.layout.VerticalLayout({
						content: [
							new sap.m.Text({
								text: "App Name: " + globalData.ClientName + " oVo Lighthouse" + tradeMark,
								textAlign: "Center"
							}),
							new sap.m.Text({
								text: "App Version: " + appVersion,
								textAlign: "Center"
							}),
							new sap.ui.layout.HorizontalLayout({
								content: [
									new sap.m.Text({
										text: "Contact Info: " + space,
										textAlign: "Center"
									}),
									new sap.m.Link({
										text: " lighthouse@revealvalue.com",
										href: "mailto:lighthouse@revealvalue.com?Subject=Lighthouse Support Request"
									})
								]
							})
						]
					})
				}),
				beginButton: new sap.m.Button({
					text: 'Close',
					press: function() {
						infoDialog.close();
					}
				})
			});

			infoDialog.open();
		},


		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},
	
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});