jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("lhsusext.controller.TicketMonthly", {
		onInit: function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("ticketMonthly").attachPatternMatched(this._onDetailMatched, this);
		},

		_onDetailMatched: function(oEvent) {
			// Call method
			this.setTicketMonthly();
		},

		setTicketMonthly: function() {
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

			// Get the Data model 
			var mainModel = this.getOwnerComponent().getModel("Data");
			// Get the ClientName name
			var name = mainModel.getData().ClientName; 
			// Set the title to the page 
			this.getView().byId("idPage").setTitle(name + " oVo Sustainment");
			// Get data 
			var allData = mainModel.getData().AllData;
			// Create new arrays
			var countCreated = [];
			var countClose = [];

			// Iterate through array
			for (var i = 0; i < allData.length; i++) {
				// Select Created dates
				var created = allData[i].Created;
				// Convert to Date object
				var createdDate = new Date(created);
				// Get year
				var yearCreated = createdDate.getFullYear();
				// Get year
				if (yearCreated === curYear) {

					/********** Created *************/
					// Select each month
					var dateCreated = allData[i].Created;
					// Conver to date 
					var dateCreatedObj = new Date(dateCreated);
					// Get month 
					var monthCreated = dateCreatedObj.getMonth();
					// Count number of each month
					countCreated[monthCreated] = (countCreated[monthCreated] || 0) + 1;
				}

				/********** Close Time *************/
				// Select Close Time dates
				var closeTime = allData[i]["Close Time"];
				// Convert to date 
				var closeDate = new Date(closeTime);
				// Get year 
				var closeYear = closeDate.getFullYear();
				// Get State
				var state = allData[i].State;
				if (closeYear === curYear && state === "closed successful") {
					// Select each month
					var dateClosed = allData[i]["Close Time"];
					// Conver to date 
					var dateClosedObj = new Date(dateClosed);
					// Get month
					var monthClosed = dateClosedObj.getMonth();
					// Count number of each month
					countClose[monthClosed] = (countClose[monthClosed] || 0) + 1;
				}
			}

			var mappedResult = [];
			// Array of months
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			// Store a collection 
			for (var j = 0; j < countCreated.length; j++) {
				mappedResult.push({
					Month: monthName[j],
					CreatedTickets: countCreated[j],
					ClosedTickets: countClose[j]
				});
			}

			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = mappedResult;

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