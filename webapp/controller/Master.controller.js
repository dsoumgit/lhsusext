/***
 * This page shows the list of navigation items under Created vs Closed Tickets, Point Consumption, and Functional
 *	Area Analysis for the current year. User can see the information about Open vs Closed tickets by Quarterly,
 *	Monthly, and Weekly. It also provides the Total Points Consumption by quarterly and monthly analysis.  
 *	Additionally, user can reach us via Contact Us section and find out Information description about the application   
 *		name. 
 */ 


sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("lhsusext.controller.Master", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "master") {

			//	this.setFunctionalItems();
				this.setCurrentYear();
			}
		},
			
		setCurrentYear: function () {
			// Get current year 
			var currentYear = new Date().getFullYear();
		//	var obj = {};
		//	obj.Year = currentYear;
			// Create an object 
			var obj = {};
			obj.AreaFunctional = [{
				"Year": currentYear,
				"key": "funcCurYear"
			}];
			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(obj);
			this.getView().setModel(oModel, "Functional");
		},
			
		sdssetFunctionalItems: function () {
			// Get all data 
			var data = this.getView().getModel("Data").getData().AllData;

			var allYears = [];
			// Iterate through array
			for (var i = 0; i < data.length; i++) {
				// Get Created
				var created = data[i].Created;
				// Convert to date object 
				var createdYear = new Date(created).getFullYear();
				// Push to new array
				allYears.push(createdYear);
			}
			
			// Remove duplicates 
			var uniqueYears = [];
			$.each(allYears, function (ind, elem) {
				if ($.inArray(elem, uniqueYears) === -1) {
					uniqueYears.push(elem);
				}
			});

			// Sort array
			var sortYear = uniqueYears.sort();
			// Get the last object 
			var lastObj = sortYear[sortYear.length - 1];

			// Create an object 
			var obj = {};
			obj.AreaFunctional = [{
				"Year": lastObj,
				"key": "funcCurYear"
			}];

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(obj);
			this.getView().setModel(oModel, "Functional");
		},

		onItemPress: function (oEvent) {
			// Get object 
			var obj = oEvent.getSource().getBindingContext("Global").getObject();

			// Navigate to the view 			
			this.oRouter.navTo(obj.key);
		},

		onAreaPress: function (oEvent) {
			// Get object 
			var obj = oEvent.getSource().getBindingContext("Functional").getObject();

			// Navigate to the view 			
			this.oRouter.navTo(obj.key);
		},

		onContactPress: function () {
			var contDialog = new sap.m.Dialog({
				title: "Contact Us",
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
					press: function () {
						contDialog.close();
					}
				})
			});

			contDialog.open();
		},

		onInfoPress: function () {
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
				title: "Information",
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
					text: "Close",
					press: function () {
						infoDialog.close();
					}
				})
			});

			infoDialog.open();
		},
		
		onLinkPress: function () {
			
		//	window.open("https://flpnwc-bb8bd811a.dispatcher.us1.hana.ondemand.com/sites?siteId=0fad276b-74be-4bd9-bd04-877e81a76ffa#lhsusint-Display&/", "_self");
			
			// get a handle on the global XAppNav service
			/*var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); 
			oCrossAppNavigator.isIntentSupported(["lhsusint-display"])
				.done(function(aResponses) {

				})
				.fail(function() {
					new sap.m.MessageToast("Provide corresponding intent to navigate");
				});
			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "lhsusint",
					action: "display"
				}
			})) || ""; 
			//Generate a  URL for the second application
			var url = window.location.href.split('#')[0] + hash; 
			//Navigate to second app
			sap.m.URLHelper.redirect(url, true); 	*/
		},
		
		getEventBus: function () {
			return sap.ui.getCore().getEventBus();
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});