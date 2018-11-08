sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.TicketQuarterly", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "ticketQuarterly") {
				// Call method
				this.setTicketQuarterly();
			}
		},

		setTicketQuarterly: function () {
			// Check the data label
			this.onShowData();
			// Get today's year
			var today = new Date();
			var curYear = today.getFullYear();

			// Get vizframe for Tickets
			var idVizFrame = this.getView().byId("quarterFrame");
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
			var allData = dataModel.getData();
			// Create new arrays
			var countCreated = [];
			var countClosed = [];

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
					countClosed[monthClosed] = (countClosed[monthClosed] || 0) + 1;
				}
			}

			// Get the array from each 
			var arrCreated = this.getEachQuarter(countCreated);
			var arrClosed = this.getEachQuarter(countClosed);
			var output = [];
			for (var key in arrCreated) {
				output.push({
					"Quarter": key,
					"CreatedRequests": arrCreated[key],
					"ClosedRequests": arrClosed[key]
				});
			}

			var obj = {};
			obj.Collection = output;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(obj);
			this.getView().setModel(oModel);
		},

		getEachQuarter: function (arr) {
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

			for (var key in quarters) {
				var start = quarters[key]['start'],
					end = quarters[key]['end'],
					numbers = arr.slice(start, end);

				// Check if there is no value for the future months	
				if (numbers.length !== 0) {
					// Getting elements from array using start and end values using slice function.
					// Use reduce to calculate the sum of numbers returned by slice call.
					// storing the result using quarter name as a key.
					result[key] = arr.slice(start, end).reduce(function (sum, number) {
						return sum + number;
					}, 0);
				}
			}

			var output = [];
			for (var key in result) {
				output.push({
					"Quarter": key,
					"CreatedRequests": result[key]
				});
			}

			return result;
		},

		// Function to show the label
		onShowData: function (oEvent) {
			// Show busy indicator
			sap.ui.core.BusyIndicator.show();
			// Get selected state 
			var selected = this.getView().byId("idShowData").getState();
			// Get vizframe id 
			var oVizframe = this.getView().byId("quarterFrame");

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