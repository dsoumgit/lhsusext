/* global moment:true */

jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("lhsusext.controller.PointMonthly", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
			
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},
		
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "pointMonthly") {
				// Call method
				this.setPointMonthly();
			}
		},
		
		setPointMonthly: function () {
			var currentYear = new Date().getFullYear();
			// Get vizframe for Tickets
			var idVizFrame = this.getView().byId("idVizFrame");
			// Set title to the chart 
			idVizFrame.setVizProperties({
				title: {
					text: currentYear
				}
			});

			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData().AllData;
			// Create new arrays
			var arrClosed = [];
			// Get SDM Points from global file 
			var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get Sustain Start Date 
			var startDate = this.getView().getModel("Global").getData().SustainStartDate;
			// Convert to Date object
			var startDateObj = new Date(startDate);
			// Get month
			var sustainMonth = startDateObj.getMonth();
			// Add 1 to start between 1 to 12
			if (sustainMonth < 12) {
				sustainMonth += 1;
			}

			// Get year
			var sustainYear = startDateObj.getFullYear();
			/** Note: The start date from the Global file is between 0 - 11
			 */
			
			// Get current month
			var currentMonth = new Date().getMonth();
			// Add 1 to start between 1 to 12
			if (currentMonth < 12) {
				currentMonth += 1;
			}
			
			// Initialize the variable 
			var i = 1;
			// Check the Sustain start year vs end year 
			if (sustainYear === currentYear) {
				for (i = sustainMonth; i <= currentMonth; i++) {
					arrClosed.push({
						Month: i,
						TotalPoints: smdPoints
					});
				}
			} else {
				while (i <= currentMonth) {
					arrClosed.push({
						Month: i,
						TotalPoints: smdPoints
					});
					i++;
				}
			}

			i = 0;
			// Iterate through array
			for (i = 0; i < allData.length; i++) {

				/********** Close Time *************/
				// Select Close Time dates
				var closeTime = allData[i]["Close Time"];
				// Convert to date 
				var closeDate = new Date(closeTime);
				// Get year 
				var closeYear = closeDate.getFullYear();
				// Get State
				var state = allData[i].State;
				// Check the current year and State 
				if (closeYear === currentYear && state === "closed successful") {
					// Get month 
					var monthClosed = closeDate.getMonth();
					// Add 1 to start from 1 - 12 
					if (monthClosed < 12) {
						monthClosed += 1;
					}

					arrClosed.forEach(function (obj) {
						// Get month
						var month = obj.Month;
						if (month === monthClosed) {
							// Get points 
							obj.TotalPoints += allData[i].Points;
						}
					});
				}
			}

			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = arrClosed;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set binding mode
			oModel.setDefaultBindingMode("OneWay");
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);
		},

		// Back to home page
		onHomePress: function () {
			this.getRouter().navTo("master");
		}
	});
});