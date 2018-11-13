/***
 * This page shows Created vs Closed tickets request for each month in the current year. 
 * To get the result for Created tickets, we filter by Created column and current year, then 
 *	count the number of entries for each quarter that are found. 
 * To get the result for Closed tickets, we filter by Close Time column, State column where it
 *	is equal to 'closed successful' and current year, then count the number of entries for each 
 *	month that are found.
 * This will allow us to track how many Created tickets have been opened and Closed tickets have been closed
 *	by monthly. 
 */ 


jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.TicketMonthly", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "ticketMonthly") {
				// Call method
				this.setTicketMonthly();
			}
		},

		setTicketMonthly: function () {
			// Check the data label
			this.onShowData();

			// Get today's year
			var today = new Date();
			var curYear = today.getFullYear();

			// Get vizframe for Tickets
			var idVizFrame = this.getView().byId("idVizFrame");
			// Format the data 		
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			// Create tool tip control
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(idVizFrame.getVizUid());
			oTooltip.setFormatString(formatPattern.STANDARDFLOAT);
			// Get pop over id 
			var oPopover = this.getView().byId("idPopOver");
			oPopover.connect(idVizFrame.getVizUid());
			oPopover.setFormatString(ChartFormatter.DefaultPattern.Integer);
			// Set title to the chart 
			idVizFrame.setVizProperties({
				plotArea: {
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"]
				},
				title: {
					text: curYear
				}
			});

			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData().AllData;
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
					CreatedRequests: countCreated[j] | 0,
					ClosedRequests: countClose[j] | 0
				});
			}

			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = mappedResult;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);
		},

		// Function to show the label
		onShowData: function (oEvent) {
			// Show busy indicator
			sap.ui.core.BusyIndicator.show();
			// Get selected state 
			var selected = this.getView().byId("idShowData").getState();
			// Get vizframe id 
			var oVizframe = this.getView().byId("idVizFrame");

			// Define a variable to store the switch 
			var labelOn = "";
			// Check if selected 
			if (selected === true) {
				// Show the labels
				labelOn = true;
			} else {
				// Hide the labels 
				labelOn = false;
			}

			// Set the visibility 
			oVizframe.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: labelOn
					}
				}
			});

			// Hide busy indicator
			sap.ui.core.BusyIndicator.hide();
		},

		// Back to home page
		onHomePress: function () {
			this.getRouter().navTo("master");
		}
	});
});