/* global moment:true */

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function(BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.PointQuarterly", {
		onInit: function() {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
			
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},
		
		onRouteMatched: function(oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "pointQuarterly") {
				// Call method
				this.setPointQuarterly();
			}
		},

		setPointQuarterly: function() {
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
		//	var startDate = moment(startDateObj, "M/D/YYYY");
			var sortedRecords = allData.sort(function(a, b) {
				return (a["Close Time"] && moment(a["Close Time"], "M/D/YY H:mm").unix()) - (b["Close Time"] && moment(b["Close Time"],
					"M/D/YY H:mm").unix());
			});

			var startYear = moment(sortedRecords.find(function(record) {
				return record["Close Time"];
			})["Close Time"], "M/D/YY H:mm").format("YYYY");
			var endYear = moment(sortedRecords[sortedRecords.length - 1]["Close Time"], "M/D/YY H:mm").format("YYYY");
			
			// Convert start year to integer type
			var startYearInt = parseInt(startYear);
			// Convert start year to integer type
			var endYearInt = parseInt(endYear);

			var i = 1;

			/** First condition: 
			/  External app only shows current data 
			*/
			
			var startQuarter = moment(startDateObj).quarter();
			
			// Define current quarter
			var curQuarter = moment().quarter();
				
			// If current year is the start year 
			if (currentYear === startYearInt) {
		//	if (currentYear === endYearInt && startYearInt <= currentYear) {
				// Check the quarter 
				if (startQuarter <= curQuarter ) {
				 	for (var s = startQuarter; s <= curQuarter; s++) {
				 		if (s === curQuarter) {
				 			if (currentMonth % 3 === 0) {
				 				arrClosed.push({Quarter: s, TotalPoints: smdPoints });	
				 			} else {
				 				arrClosed.push({Quarter: s, TotalPoints: smdPoints * (currentMonth % 3) });
				 			}
				 		} else {
				 			arrClosed.push({Quarter: s, TotalPoints: smdPoints * 3});
				 		}
				 	}
				} else {
					for (var j = 1; j <= curQuarter; j++) {
				 		if (j === curQuarter) {
				 			if (currentMonth % 3 === 0) {
				 				arrClosed.push({Quarter: j, TotalPoints: smdPoints });	
				 			} else {
				 				arrClosed.push({Quarter: j, TotalPoints: smdPoints * (currentMonth % 3) });
				 			}
				 		} else {
				 			arrClosed.push({Quarter: j, TotalPoints: smdPoints * 3});
				 		}
				 	}
				}
			} else {
				for (var j = 1; j <= curQuarter; j++) {
			 		if (j === curQuarter) {
			 			if (currentMonth % 3 === 0) {
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
		onHomePress: function() {
			this.getRouter().navTo("master");
		}
	});
});