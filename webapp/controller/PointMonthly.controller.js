/* global moment:true */

jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("lhsusext.controller.PointMonthly", {
		onInit: function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("pointMonthly").attachPatternMatched(this._onDetailMatched, this);

			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
		},

		_onDetailMatched: function(oEvent) {
			// Call method
			this.setPointMonthly();
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
			var startMonth = startDateObj.getMonth();

			if (startMonth < 12) {
				startMonth += 1; 	
			}

			// Get year
			var startYear = startDateObj.getFullYear();
			/** Note: The start date from the Global file is between 0 - 11
			 */
			 
			 var currentMonth = new Date().getMonth();
			 if (currentMonth < 12) {
				currentMonth += 1;	
			 }
			 
			
			var i = 1;
			var sortedRecords = allData.sort(function(a, b) {
				return (a["Close Time"] && moment(a["Close Time"], "M/D/YY H:mm").unix()) - (b["Close Time"] && moment(b["Close Time"],
					"M/D/YY H:mm").unix());
			});
			var endYear = moment(sortedRecords[sortedRecords.length - 1]["Close Time"], "M/D/YY H:mm").format("YYYY");
			
			// Convert start year to integer type
			var endYearInt = parseInt(endYear);
			
			 if (currentYear === endYearInt && startYear <= currentYear) {
				
				if (startMonth <= currentMonth) {
					while (startMonth <= currentMonth) {
						arrClosed.push( {Month: startMonth, TotalPoints: smdPoints} );
						startMonth++;
					}
				} else {
					while (i <= currentMonth) {
				 		arrClosed.push({Month: i, TotalPoints: smdPoints });
				 		i++; 
				 	}
				}
			 } else {
			 	while (i <= 12) {
			 		arrClosed.push({Month: i, TotalPoints: smdPoints});
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
						//	console.log(obj);
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
		
		sdfsetPointMonthly: function() {

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
			var startMonth = startDateObj.getMonth();

			if (startMonth < 12) {
				startMonth += 1;
			}

			/** Note: The start date from the Global file is between 0 - 11
			 */

			var currentMonth = new Date().getMonth();
			if (currentMonth < 12) {
				currentMonth += 1;
			}

			var i = 1;

			// Get the start date from AllData array
			var startDate = moment(startDateObj, "M/D/YYYY");
			var sortedRecords = allData.sort(function(a, b) {
				return (a["Close Time"] && moment(a["Close Time"], "M/D/YY H:mm").unix()) - (b["Close Time"] && moment(b["Close Time"],
					"M/D/YY H:mm").unix());
			});

			var startYear = moment(sortedRecords.find(function(record) {
				return record["Close Time"];
			})["Close Time"], "M/D/YY H:mm").format("YYYY");
			var endYear = moment(sortedRecords[sortedRecords.length - 1]["Close Time"], "M/D/YY H:mm").format("YYYY");

			// Convert start year to integer type
			var endYearInt = parseInt(endYear);

			var currentYear = new Date().getFullYear();
			// Get vizframe for Tickets
			var idVizFrame = this.getView().byId("idVizFrame");
			// Set title to the chart 
			idVizFrame.setVizProperties({
				title: {
					text: endYearInt
				}
			});

			if (currentYear === endYearInt) {
				//	var i = 0;
				while (i <= currentMonth) {
					arrClosed.push({
						Month: i,
						TotalPoints: smdPoints
					});
					i++;
				}
			} else {
				while (i <= 12) {
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

					arrClosed.forEach(function(obj) {
						// Get month
						var month = obj.Month;
						if (month === monthClosed) {
							//	console.log(obj);
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
		onHomePress: function() {
			this.getRouter().navTo("master");
		}
	});
});