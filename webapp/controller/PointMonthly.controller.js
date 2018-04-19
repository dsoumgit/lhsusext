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

		setPointMonthly: function() {
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
			var arrClosed = [];

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
					// Format the month 
					var month = closeDate.getMonth();
					// Store each element to Close Time array
					arrClosed.push({
						date: month,
						points: allData[i].Points
					});
				}
			}

			// Create a new object to store each month and sum 
			var newArr = {};
			// Sum points and group by monthly 
			$.each(arrClosed, function(index, element) {
				if (newArr[element.date] === undefined) {
					newArr[element.date] = 0;
				}
				
				// Check if there is any empty or no value 
				if (element.points === "" || element.points === null) {
					element.points = 0; 	
				}
				
				newArr[element.date] += element.points;
			});

			// Create a new array
			var result = [];
			// Array of months
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			// Get Monthly Points 
			var monthlyPoints = this.getOwnerComponent().getModel("Global").getData().MonthlyPoints;
			// Store a collection of Months and sum  
			for (var key in newArr) {
				result.push({
					"Month": monthName[key],
					"TotalPoints": newArr[key] + monthlyPoints
				});
			}

			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = result;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
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