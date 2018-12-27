/****
 * This page shows the number of Open vs Closed tickets for each month in the current year. We count how many Open vs
 *  Closed tickets request have been created or closed for each month. 
 *	The data report in the table shows the Open ticket requests during the first five days.
 *  The SLA Tracker shows three Severities except Innovation from Priority column. This will track how well we meet our
 *		SLA's to the clients by percentage. The SLA calculation will calculate the SoD Teams First Response rate. 
 *		First response rate is how quickly are we responding to client's tickets per the SLA. Below is the calculation:
 *			SEV 1 = 1 hour = 60 mins
 *			SEV 2 = 2 hours = 120 mins 
 *			SEV 3 = 1 day = 1440 mins
 *		We filter by each SEV and count the number of entries then filter by FirstResponseInMin column that meet each condition 
 *		above. See the calculation below:
 *			(Total Entries of ResponseTime * 100) / (ResponseInMin	< each SEV) 
 *		In the Excel file, we'll see the FirstResponseInMin column. This value will give the time in minutes when the
 *			ticket was first responded to. This will need to be compared to the SEV x time above. 
 *  The current points consumption for the current month. This will have three parts to it, it will combine innovation
 *		ticket points, SDM points, and ticket points. The SDM points store in the global file. Each client will have a
 *		different monthly point bucket. 
 *		One bucket for INNOVATION points 
 *		One bucket for SDM points (from global file)
 *		One bucket for all closed tickets that are not INNOVATION or SDM 
 */

jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/ui/commons/Carousel",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, Carousel, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.Detail", {

		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "master") {
				// Get data model
				var dataModel = this.getOwnerComponent().getModel("Data");
				// Get all data array
				var allData = dataModel.getData();
				// Monthly method
				this.setTicketMonthly(allData);
				// Oldest Closed Requests
				this.getOldestRequests(allData);
				// SLA Tracker chart
				this.SLATracker(allData);
				// Point consumption
				this.pointConsump(allData);
			}
		},

		setTicketMonthly: function (arr) {
			// Check the data label
			this.onShowData();
			// Get all data 
			var allRecords = arr.AllData;
			var resultCreated = {};
			// Filter the current year 
			allRecords.filter(function (obj) {
				// Return the array objects of current year
				return (new Date(obj.Created).getFullYear() === new Date().getFullYear());
			}).forEach(function (elem) {
				// Get Created date 
				var createdMonth = new Date(elem.Created).getMonth();
				// Create each month 
				if (resultCreated[createdMonth] === undefined) {
					resultCreated[createdMonth] = [elem];
				} else {
					resultCreated[createdMonth].push(elem);
				}
			});

			// Create a new array to store the result 
			var outputCreated = [];
			//	var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			for (var key in resultCreated) {
				outputCreated.push({
					"Month": parseInt(key, 10),
					"CreatedRequests": resultCreated[key].length
				});
			}

			// Create a new object 
			var resultClosed = {};
			// Filter the Close Time and State 
			allRecords.filter(function (obj) {
				// Get State field 
				var state = obj.State;
				// Check the current year
				return (new Date(obj["Close Time"]).getFullYear() === new Date().getFullYear() && state === "closed successful");
			}).forEach(function (elem) {
				// Get Close Time date 
				var closedMonth = new Date(elem["Close Time"]).getMonth();

				// Create each month 
				if (resultClosed[closedMonth] === undefined) {
					resultClosed[closedMonth] = [elem];
				} else {
					resultClosed[closedMonth].push(elem);
				}
			});

			
			// Create a new array to store the result 
			var outputClosed = [];
			for (var key in resultClosed) {
				outputClosed.push({
					"Month": parseInt(key, 10),
					"ClosedRequests": resultClosed[key].length
				});
			}

			/***
			 * Merge two arrays with the same values ***
			 */
			// Copy array 1 
			var output = outputCreated.slice();
			// Loop through array 2 
			outputClosed.forEach(function (elem) {
				// find month and return the object that is found 
				var found = output.find(function (i) {
					return elem.Month === i.Month;
				});

				// Check if found
				if (found) {
					// add a new property to the current object 
					found.ClosedRequests = elem.ClosedRequests;
				} else {
					// add it if not found 
					output.push(elem);
				}
			});

			// Get vizframe id 
			var oVizframe = this.getView().byId("ticketFrame");
			// Set the visibility 
			oVizframe.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"]
				},
				title: {
					text: new Date().getFullYear()
				}
			});

			// Create an object 
			var obj = {};
			// Store data collection 
			obj.Collection = output;
			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel(obj);
			// Set model to the view
			this.getView().setModel(oModel);
		},

		asdsetTicketMonthly: function (arr) {
			// Check the data label
			this.onShowData();
			// Get all data 
			var allRecords = arr.AllData;
			// Filter the current year 
			var createdRecords = allRecords.filter(function (obj) {
				// Check the current year
				return (new Date(obj.Created).getFullYear() === new Date().getFullYear());
			});

			var resultCreated = {};
			// Loop through each month 
			createdRecords.forEach(function (elem) {
				// Get Created date 
				var createdMonth = new Date(elem.Created).getMonth();
				// Create each month 
				if (resultCreated[createdMonth] === undefined) {
					resultCreated[createdMonth] = [elem];
				} else {
					resultCreated[createdMonth].push(elem);
				}

			});

			// Create a new array to store the result 
			var outputCreated = [];
			//	var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			for (var key in resultCreated) {
				outputCreated.push({
					"Month": parseInt(key, 10),
					"CreatedRequests": resultCreated[key].length
				});
			}

			// Filter the Close Time and State 
			var closeRecords = allRecords.filter(function (obj) {
				// Get State field 
				var state = obj.State;
				// Check the current year
				return (new Date(obj["Close Time"]).getFullYear() === new Date().getFullYear() && state === "closed successful");
			});

			var resultClosed = {};
			// Loop through each month 
			closeRecords.forEach(function (elem) {
				// Get Close Time date 
				var closedMonth = new Date(elem["Close Time"]).getMonth();

				// Create each month 
				if (resultClosed[closedMonth] === undefined) {
					resultClosed[closedMonth] = [elem];
				} else {
					resultClosed[closedMonth].push(elem);
				}
			});

			// Create a new array to store the result 
			var outputClosed = [];
			for (var key in resultClosed) {
				outputClosed.push({
					"Month": parseInt(key, 10),
					"ClosedRequests": resultClosed[key].length
				});
			}

			/***
			 * Merge two arrays with the same values ***
			 */
			// Copy array 1 
			var output = outputCreated.slice();
			// Loop through array 2 
			outputClosed.forEach(function (elem) {
				// find month and return the object that is found 
				var found = output.find(function (i) {
					return elem.Month === i.Month;
				});

				// Check if found
				if (found) {
					// add a new property to the current object 
					found.ClosedRequests = elem.ClosedRequests;
				} else {
					// add it if not found 
					output.push(elem);
				}
			});

			// Get vizframe id 
			var oVizframe = this.getView().byId("ticketFrame");
			// Set the visibility 
			oVizframe.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"]
				},
				title: {
					text: new Date().getFullYear()
				}
			});

			// Create an object 
			var obj = {};
			// Store data collection 
			obj.Collection = output;
			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel(obj);
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
			var oVizframe = this.getView().byId("ticketFrame");
			// Format the data 		
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			// Create tool tip control
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(oVizframe.getVizUid());
			oTooltip.setFormatString(formatPattern.STANDARDFLOAT);
			// Get pop over id for Essential 1 
			var oPopover = this.getView().byId("idPopOver");
			oPopover.connect(oVizframe.getVizUid());
			oPopover.setFormatString(ChartFormatter.DefaultPattern.Integer);
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

		getOldestRequests: function (arr) {
			// Get All Data array
			var allRecords = arr.AllData;
			// Define new variable for years
			var result = [];
			// Iterate through All Data array
			allRecords.forEach(function (obj) {
				// Get State 
				var state = obj.State;
				// Get all except closed successful 
				if (state !== "closed successful") {
					// Store all objects to new array
					result.push(obj);
				}
			});

			// Sort by Created dates 
			var sortedRecords = result.sort(function (a, b) {
				return (new Date(a.Created) - new Date(b.Created));
			});
			// Get first five objects
			var mappedResult = sortedRecords.slice(0, 5);
			// Create an object
			var obj = {};
			obj.DataCollection = mappedResult;

			// Create json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data 
			oModel.setData(obj);
			// Set object to the view
			this.getView().setModel(oModel, "OldData");
		},

		// SLA Tracker 
		SLATracker: function (arr) {
			// Get all the data 
			var dataArr = arr.AllData;
			var allDataArr = dataArr.slice();
			// Today's month 
			var currentMonth = new Date().getMonth();
			// Add 1 to the month 
			if (currentMonth < 12) {
				currentMonth += 1;
			}
			
			// Variable to store each Serverity 
			var result = {};
			// Filter by Created in the current year and Priority (not including Innovation)
			allDataArr.filter(function (obj) {
				// Get Priority 
				var priority = obj.Priority;
				// Created 
				var createdMonth = new Date(obj.Created).getMonth();
				// Add 1 to the month 
				if (createdMonth < 12) {
					createdMonth += 1;
				}

				return (new Date(obj.Created).getFullYear() === new Date().getFullYear() &&
					currentMonth === createdMonth && priority !== "4. Innovation (Enhancement)");
			}).forEach(function (elem) {
				// Get Priority
				var priority = elem.Priority;
				if (result[priority] === undefined) {
					result[priority] = [elem];
				} else {
					result[priority].push(elem);
				}
			});
			
			// Loop through each Serverity and check the First Response Time 	
			var output = {};
			for (var key in result) {

				result[key].forEach(function (elem) {

					if (elem.Priority === "1. Severity-1 (High)") {
						// Get response time 
						var sev1ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 60 minutes 
						if (sev1ResponseTime < 60) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					} else if (elem.Priority === "2. Severity-2 (Medium)") {
						// Get response time 
						var sev2ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 120 minutes 
						if (sev2ResponseTime < 120) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					} else if (elem.Priority === "3. Severity-3 (Normal)") {
						// Get response time 
						var sev3ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 1440 minutes 
						if (sev3ResponseTime < 1440) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					}
				});
			}

			var totalServLength = [];
			// Get the total length of each Severity
			for (var key in result) {
				totalServLength.push({
					"Severity": key,
					"TotalLength": result[key].length
				});
			}

			// Create an array for count 
			var countServLength = [];
			for (var key in output) {
				countServLength.push({
					"Severity": key,
					"Length": output[key].length
				});
			}

			/**** 
			 * Merge two arrays with the same Serverity
			 */
			// Copy array 1
			var mappedResult = totalServLength.slice();
			// Loop through array 2
			countServLength.forEach(function (item) {
				// Match the Serverity and return that object
				var found = mappedResult.find(function (i) {
					return item.Severity === i.Severity;
				});

				// Check if found
				if (found) {
					// update the object 
					found.Length = item.Length;
				} else {
					// if not, add it 
					mappedResult.push(item);
				}
			});

			// Calculate each Serverity 
			var outputResult = {};
			mappedResult.forEach(function (obj) {
				// Get Serverity
				var serv = obj.Severity;
				var sevTotal = (obj.Length * 100) / obj.TotalLength;
				// If the value 0, it won't show so treat it as 100%
				if (isNaN(sevTotal) || sevTotal === 0) {
					sevTotal = 100;
				}
				// Create each Serverity in a new object 
				if (outputResult[serv] === undefined) {
					// Get two decimal places 
					outputResult[serv] = Number(sevTotal.toFixed(0));
				} else {
					outputResult[serv] = Number(sevTotal.toFixed(0));
				}
			});

			// Array of months 
			// Define month names 
			var monthNames = ["JANUARY", "FEBRURAY", "MARCH", "APRIL", "MAY", "JUNE",
				"JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
			];

			// Check each Serverity if it is not found in an object, set it to 100%  
			if (outputResult["1. Severity-1 (High)"] === undefined) {
				outputResult["1. Severity-1 (High)"] = 100;
			}

			if (outputResult["2. Severity-2 (Medium)"] === undefined) {
				outputResult["2. Severity-2 (Medium)"] = 100;
			}

			if (outputResult["3. Severity-3 (Normal)"] === undefined) {
				outputResult["3. Severity-3 (Normal)"] = 100;
			}

			// Add current month 
			outputResult.Month = monthNames[new Date().getMonth()] + "-" + new Date().getFullYear();
			// Create json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data 
			oModel.setData(outputResult);
			// Set object to the view
			this.getView().setModel(oModel, "SLA");
		},
		
		// SLA Tracker 
		sdSLATracker: function (arr) {
			// Get all the data 
			var dataArr = arr.AllData;
			var allDataArr = dataArr.slice();
			// Today's month 
			var currentMonth = new Date().getMonth();
			// Add 1 to the month 
			if (currentMonth < 12) {
				currentMonth += 1;
			}

			// Filter by Created in the current year and Priority (not including Innovation)
			allDataArr = allDataArr.filter(function (obj) {
				// Get Priority 
				var priority = obj.Priority;
				// Created 
				var createdMonth = new Date(obj.Created).getMonth();
				// Add 1 to the month 
				if (createdMonth < 12) {
					createdMonth += 1;
				}

				return (new Date(obj.Created).getFullYear() === new Date().getFullYear() &&
					currentMonth === createdMonth && priority !== "4. Innovation (Enhancement)");
			});

			// Store each Serverity 
			var result = {};
			allDataArr.forEach(function (elem) {
				// Get Priority
				var priority = elem.Priority;
				if (result[priority] === undefined) {
					result[priority] = [elem];
				} else {
					result[priority].push(elem);
				}
			});

			// Loop through each Serverity and check the First Response Time 	
			var output = {};
			for (var key in result) {

				result[key].forEach(function (elem) {

					if (elem.Priority === "1. Severity-1 (High)") {
						// Get response time 
						var sev1ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 60 minutes 
						if (sev1ResponseTime < 60) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					} else if (elem.Priority === "2. Severity-2 (Medium)") {
						// Get response time 
						var sev2ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 120 minutes 
						if (sev2ResponseTime < 120) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					} else if (elem.Priority === "3. Severity-3 (Normal)") {
						// Get response time 
						var sev3ResponseTime = elem.FirstResponseInMin;
						// Get tickets less than 1440 minutes 
						if (sev3ResponseTime < 1440) {
							if (output[elem.Priority] === undefined) {
								output[elem.Priority] = [elem];
							} else {
								output[elem.Priority].push(elem);
							}
						}
					}
				});
			}

			var totalServLength = [];
			// Get the total length of each Severity
			for (var key in result) {
				totalServLength.push({
					"Severity": key,
					"TotalLength": result[key].length
				});
			}

			// Create an array for count 
			var countServLength = [];
			for (var key in output) {
				countServLength.push({
					"Severity": key,
					"Length": output[key].length
				});
			}

			/**** 
			 * Merge two arrays with the same Serverity
			 */
			// Copy array 1
			var mappedResult = totalServLength.slice();
			// Loop through array 2
			countServLength.forEach(function (item) {
				// Match the Serverity and return that object
				var found = mappedResult.find(function (i) {
					return item.Severity === i.Severity;
				});

				// Check if found
				if (found) {
					// update the object 
					found.Length = item.Length;
				} else {
					// if not, add it 
					mappedResult.push(item);
				}
			});

			// Calculate each Serverity 
			var outputResult = {};
			mappedResult.forEach(function (obj) {
				// Get Serverity
				var serv = obj.Severity;
				var sevTotal = (obj.Length * 100) / obj.TotalLength;
				// If the value 0, it won't show so treat it as 100%
				if (isNaN(sevTotal) || sevTotal === 0) {
					sevTotal = 100;
				}
				// Create each Serverity in a new object 
				if (outputResult[serv] === undefined) {
					// Get two decimal places 
					outputResult[serv] = Number(sevTotal.toFixed(0));
				} else {
					outputResult[serv] = Number(sevTotal.toFixed(0));
				}
			});

			// Array of months 
			// Define month names 
			var monthNames = ["JANUARY", "FEBRURAY", "MARCH", "APRIL", "MAY", "JUNE",
				"JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
			];

			// Check each Serverity if it is not found in an object, set it to 100%  
			if (outputResult["1. Severity-1 (High)"] === undefined) {
				outputResult["1. Severity-1 (High)"] = 100;
			}

			if (outputResult["2. Severity-2 (Medium)"] === undefined) {
				outputResult["2. Severity-2 (Medium)"] = 100;
			}

			if (outputResult["3. Severity-3 (Normal)"] === undefined) {
				outputResult["3. Severity-3 (Normal)"] = 100;
			}

			// Add current month 
			outputResult.Month = monthNames[new Date().getMonth()] + "-" + new Date().getFullYear();
			// Create json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data 
			oModel.setData(outputResult);
			// Set object to the view
			this.getView().setModel(oModel, "SLA");
		},

		// Point Consumption
		pointConsump: function (arr) {
			// Get all the data
			var data = arr.AllData;
			// Get current month 
			var currentMonth = new Date().getMonth();
			// Add 1 to the month 
			if (currentMonth < 12) {
				currentMonth += 1;
			}

			// Filter on 'closed successful', current month and Current Year dates 
			var newData = data.filter(function (obj) {
				// Convert to month
				var closeTimeMonth = new Date(obj["Close Time"]).getMonth();
				//	console.log(closeTimeMonth);
				// Add 1 to the month from 1 - 12
				if (closeTimeMonth < 12) {
					closeTimeMonth += 1;
				}

				// Convert to year
				var closeTimeYear = new Date(obj["Close Time"]).getFullYear();
				// Get State 
				var state = obj.State;
				// Return new array 
				return (closeTimeYear === new Date().getFullYear() && state === "closed successful" && closeTimeMonth === currentMonth);
			});

			// Create a new object to store both pair values 
			var result = {};
			// Array of months
			var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			// Get the SDM Points  			
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Check if the lenth if not found based on the filter criteria above 
			if (newData.length === 0) {
				// Set default objects 
				result["Innovation"] = 0;
				result["ClosedRequests"] = 0;
			} else {

				// Total innovation variable 
				var totalInno = 0;
				var totalNonInno = 0;
				// Loop through array 
				newData.forEach(function (obj) {
					// Get Priority
					var priority = obj.Priority;
					if (priority === "4. Innovation (Enhancement)") {
						if (result["Innovation"] === undefined) {
							totalInno += obj.Points;
							result["Innovation"] = totalInno;
						} else {
							totalInno += obj.Points;
							result["Innovation"] = totalInno;
						}
					} else {
						if (result["ClosedRequests"] === undefined) {
							totalNonInno += obj.Points;
							result["ClosedRequests"] = totalNonInno;
						} else {
							totalNonInno += obj.Points;
							result["ClosedRequests"] = totalNonInno;
						}
					}
				});
			}

			// Add Month to the object 
			result["Month"] = monthNames[new Date().getMonth()];
			// Add SDM to the object 
			result["BMAPoints"] = sdmPoints;

			// Get vizframe for Tickets
			var pointFrame = this.getView().byId("pointFrame");
			// Get pop over id for Essential 1 
			var oPopover = this.getView().byId("idPopOverPoint");
			oPopover.connect(pointFrame.getVizUid());
			oPopover.setFormatString(ChartFormatter.DefaultPattern.Integer);
			// Set title to the chart 
			pointFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)", "rgb(0, 153, 76)"]
				},
				title: {
					text: new Date().getFullYear()
				}
			});

			// Create a new object 
			var obj = {};
			obj.Collection = [result];

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel(obj);
			// Set model to the view
			this.getView().setModel(oModel, "PointModel");
		},

		getEventBus: function () {
			return sap.ui.getCore().getEventBus();
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});