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
			// Get today's year
			var today = new Date();
			var curYear = today.getFullYear();

			// Get vizframe for Tickets
			var idVizFrame = this.getView().byId("idVizFrame");
			// Set title to the chart 
			idVizFrame.setVizProperties({
				title: {
					text: curYear
				}
			});

			// Get Main model 
			var mainModel = this.getOwnerComponent().getModel("Global");
			// Get the ClientName name
			var name = mainModel.getData().ClientName;
			// Set the title to the page 
			this.getView().byId("idPage").setTitle(name + " oVo Sustainment");

			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData().AllData;

			// Create new arrays
			var countClosed = [];
			// Today's date 
			var date = new Date();
			// Get month 
			var month = date.getMonth();
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
				if (closeYear === curYear && state === "closed successful") {
					// Get month 
					var monthClosed = closeDate.getMonth();
					// Add 1 to start from 1 - 12 
					if (monthClosed < 12) {
						monthClosed += 1;
					}
					// Check the start date 
					if (monthClosed >= startMonth && startYear === 2018) {
						// Store each element to Close Time array
						countClosed.push({
							date: monthClosed,
							points: allData[i].Points + smdPoints
						});	
					} else {
						// Store each element to Close Time array
						countClosed.push({
							date: monthClosed,
							points: allData[i].Points
						});
					}
				}
			}

			// Create a new object to store each month and sum 
			var newArr = [];
			// Sum points and group by monthly 
			$.each(countClosed, function(index, element) {
			//	console.log(element.points);
				if (newArr[element.date] === undefined) {
					newArr[element.date] = 0;
				}

				// Check if there is any empty or no value 
				if (element.points === "" || element.points === null) {
					element.points = 0;
				}

				newArr[element.date] += element.points;
			});

			// Create an object 
			var obj = {};
			obj.Collection = this.getEachQuarter(newArr);

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(obj);
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