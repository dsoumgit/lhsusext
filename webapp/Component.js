sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"lhsusext/model/models",
	"lhsusext/libs/moment"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("lhsusext.Component", {

		// metadata
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			var that = this;
			// Create a model for global file
			var globalModel = new sap.ui.model.json.JSONModel();
			// Create a model for data file 
			var dataModel = new sap.ui.model.json.JSONModel();

			// Get private key 
			$.ajax({
				url: "/repoid/CMISProxyBridge/cmis/json",
				type: "GET",
				async: false,
				cache: false,
				error: function(error) {
					sap.m.MessageBox.alert("Private key is not found");
				},
				success: function(response) {
					// Get json object 
					var obj = response[Object.keys(response)[0]];
					var repoId = obj.repositoryId;

					// Access global file 
					$.ajax({
						url: "/cmis/" + repoId + "/root/SustainLHGlobalConfig.json",
						type: "GET",
						async: false,
						cache: false,
						success: function(globalResponse) {
							// Set the binding mode
							globalModel.setDefaultBindingMode("OneWay");
							// Set model to data 
							globalModel.setData(globalResponse);
							// Set data to the view 
							that.setModel(globalModel, "Global");

							// Get file name 
							var fileName = globalResponse.DataFileName;

							// Get data file 
							$.ajax({
								url: "/cmis/" + repoId + "/root/" + fileName,
								type: "GET",
								async: false,
								cache: false,
								success: function(dataResponse) {

									// Set the binding mode
									dataModel.setDefaultBindingMode("OneWay");
									// Set model to data 
									dataModel.setData(dataResponse);
									// Set data to the view 
									that.setModel(dataModel, "Data");

									// set the device model
									that.setModel(models.createDeviceModel(), "device");

									// Initialize the router
									that.getRouter().initialize();
								},
								error: function(err) {
									sap.m.MessageToast.show("Data file is not found");

									return false;
								}
							});
						},
						error: function(err) {
							sap.m.MessageBox.alert("Global file is not found.");
							return false;
						}
					});
				}
			});
		},

		createContent: function() {

			// Root view
			var oRootView = sap.ui.view("appview", {
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "lhsusext.view.App"
			});

			return oRootView;
		}
	});
});