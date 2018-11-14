/***
 * This page shows Closed tickets request for each month in the current year. 
 * To get the result for Closed tickets, see following logic below: 
 *	1. Filter the data in Excel file by Close Time column and State column where it
 *	   is equal to 'closed successful'
 *	2. Check the year from Sustainment date (from global file) with the current year 
 *  3. Check the month and add SDM points to where it begins till the end of the year 
 *	4. Add the SDM points to the total points for each month. 
 *	
 * This will allow us to track how many Closed tickets have been closed by monthly. 
 */ 
 

jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
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
			// Check the data label
			this.onShowData();
			
			var currentYear = new Date().getFullYear();
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
					colorPalette: ["rgb(88, 153, 218)"]	
				},
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

		//	i = 0;
			// Iterate through array
			for (var k = 0; k < allData.length; k++) {

				/********** Close Time *************/
				// Select Close Time dates
				var closeTime = allData[k]["Close Time"];
				// Convert to date 
				var closeDate = new Date(closeTime);
				// Get year 
				var closeYear = closeDate.getFullYear();
				// Get State
				var state = allData[k].State;
				// Check the current year and State 
				if (closeYear === currentYear && state === "closed successful") {
					// Get month 
					var monthClosed = closeDate.getMonth();
					// Add 1 to start from 1 - 12 
					if (monthClosed < 12) {
						monthClosed += 1;
					}

					// Iterate through array
					for (var j = 0; j < arrClosed.length; j++) {
						// Get month
						var month = arrClosed[j].Month;
						if (month === monthClosed) {
							// Get points 
							arrClosed[j].TotalPoints += allData[k].Points;
						}
					}
				}
			}
			
			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = arrClosed;

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
			// simulate delayed end of operation
			jQuery.sap.delayedCall(2000, this, function () {
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
			});
		},
		
		// Back to home page
		onHomePress: function () {
			this.getRouter().navTo("master");
		}
	});
});