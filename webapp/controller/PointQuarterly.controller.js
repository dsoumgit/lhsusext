/* global moment:true */

sap.ui.define([
	"lhsusext/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("lhsusext.controller.PointQuarterly", {
		onInit: function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("pointQuarterly").attachPatternMatched(this._onDetailMatched, this);

			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
		},

		_onDetailMatched: function(oEvent) {
			// Call method
			this.setPointQuarterly();
		},

		setPointQuarterly: function() {
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

			var i = 1;

			// Check the current year 
			if (currentYear === endYearInt) {
				
				var curQuarter = moment().quarter();

			 	for (var j = 1; j <= curQuarter; j++) {
			 		if (j == curQuarter) {
			 			if (currentMonth % 3 == 0) {
			 				arrClosed.push({Quarter: j, TotalPoints: smdPoints });	
			 			} else {
			 				arrClosed.push({Quarter: j, TotalPoints: smdPoints * (currentMonth % 3) });
			 			}
			 		} else {
			 			arrClosed.push({Quarter: j, TotalPoints: smdPoints * 3});
			 		}
			 	}

			}

			i = 0;
			// Iterate through array
			for (var i = 0; i < allData.length; i++) {

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
					var closeQuarter = moment(closeDate).quarter();

					arrClosed.forEach(function(obj) {
						// Get Quarter
						var quarter = obj.Quarter;
						if (quarter === closeQuarter) {
							// add points 
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

		getEachQuarter: function(arr) {
			// Define each quarter
			var quarters = {
				'Q1': {
					start: 0,
					end: 3
				},
				'Q2': {
					start: 3,
					end: 6
				},
				'Q3': {
					start: 6,
					end: 9
				},
				'Q4': {
					start: 9,
					end: 12
				}
			};

			// Create a new object
			var result = {};

			// Get SDM Points from global file 
			var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get Sustain Start Date 
			var startDate = this.getView().getModel("Global").getData().SustainStartDate;

			for (var key in quarters) {
				var start = quarters[key]['start'],
					end = quarters[key]['end'],
					numbers = arr.slice(start, end);

				// Check if there is no value for the future months	
				if (numbers.length !== 0) {
					// Getting elements from array using start and end values using slice function.
					// Use reduce to calculate the sum of numbers returned by slice call.
					// storing the result using quarter name as a key.
					result[key] = arr.slice(start, end).reduce(function(sum, number) {
						//	console.log(sum);
						//	console.log(number);
						// Check the start date 
						//	if (start < startDate) {
						return sum + number;
						//	} else {
						//		return sum + number + smdPoints;
						//	}
					}, 0);
				}
			}

			var output = [];
			//	console.log(result);	
			for (var key in result) {
				output.push({
					"Quarter": key,
					"TotalPoints": result[key]
				});
			}

			return output;
		},

		// Back to home page
		onHomePress: function() {
			this.getRouter().navTo("master");
		}
	});
});