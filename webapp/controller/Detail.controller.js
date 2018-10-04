/* global moment:true */

jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.m.MessageBox");
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
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "MM/dd/yyyy"
			});
			var today = new Date();
			var currentMonth = today.getMonth();
			// Start month at 1
			if (currentMonth < 10) {
				currentMonth += 1;
			}

			/****** Created *****************/
			var i = 1;
			var resultCreated = [];
			// Create each month for the current year
			while (i <= currentMonth) {
				resultCreated.push({
					Month: i,
					Created: 0
				});
				i++;
			}

			// Get the month from 1 - 12 
			// Iterate through Created column 
			for (var j = 0; j < allRecords.length; j++) {
				// Get Created 
				var created = allRecords[j].Created;
				// Convert to date object 
				var createdDate = new Date(created);
				// Get month 
				var createdMonth = createdDate.getMonth();
				// Add 1 to the month
				if (createdMonth < 12) {
					createdMonth += 1;
				}

				// Get year 
				var createdYear = createdDate.getFullYear();

				/******* Created ********************/
				// Check the year between created and current 
				if (createdYear === today.getFullYear()) {
					// Store the objects and get length 
					var createdMonthNum = [allRecords[j]];

					// Iterate through month array
					/*resultCreated.forEach(function (obj) {
						// Get Month
						var month = obj.Month;
						// Check the match
						if (month === createdMonth) {
							// Store the number of records 
							obj.Created += createdMonthNum.length;
						}
					});*/

					for (var a = 0; a < resultCreated.length; a++) {
						// Get Month
						var month = resultCreated[a].Month;
						// Check the match
						if (month === createdMonth) {
							// Store the number of records 
							resultCreated[a].Created += createdMonthNum.length;
						}
					}
				}
			}

			/**** Close Time *******/
			var k = 1;
			// Create a new array
			var resultClosed = [];
			// Create each month for the current year
			while (k <= currentMonth) {
				resultClosed.push({
					Month: k,
					Closed: 0
				});
				k++;
			}

			// Get the month from 1 - 12 
			// Iterate through Created column 
			for (var b = 0; b < allRecords.length; b++) {
				// Get Created 
				var closeTime = allRecords[b]["Close Time"];
				// Convert to date object 
				var closeTimeDate = new Date(closeTime);
				// Get month 
				var closedMonth = closeTimeDate.getMonth();
				// Add 1 to the month
				if (closedMonth < 12) {
					closedMonth += 1;
				}

				// Get State 
				var state = allRecords[b].State;
				// Get year
				var closedYear = closeTimeDate.getFullYear();
				// Get only "Closed"
				if (state === "closed successful" && closedYear === today.getFullYear()) {
					// Store the objects and get length 
					var closedMonthNum = [allRecords[b]];

					// Iterate through month array
					/*resultClosed.forEach(function (obj) {
						// Get Month
						var month = obj.Month;
						// Check the match
						if (month === closedMonth) {
							// Store the number of records 
							obj.Closed += closedMonthNum.length;
						}
					});*/

					for (var c = 0; c < resultClosed.length; c++) {
						// Get close time month
						var closeTimeMonth = resultClosed[c].Month;
						// Check the match
						if (closeTimeMonth === closedMonth) {
							// Store the number of records 
							resultClosed[c].Closed += closedMonthNum.length;
						}
					}
				}
			}
			
			// Create a new array
			var result = [];
			// Loop through 

			resultCreated.forEach(function (obj) {
				// Month
				var monthCloseTime = obj.Month;
				resultClosed.forEach(function (elem) {
					// Month
					var m = elem.Month;
					if (monthCloseTime === m) {
						result.push({
							Month: monthCloseTime,
							CreatedRequests: obj.Created,
							ClosedRequests: elem.Closed
						});
					}
				});
			});

			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = result;
			
			var oVizframe = this.getView().byId("ticketFrame");
			// Set the visibility 
			oVizframe.setVizProperties({
				plotArea: {
					
					dataLabel: {
						visible: true
					}
				},
				title: {
					text: today.getFullYear()
				}
			});
				
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
			var oVizframe = this.getView().byId("ticketFrame");

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
				return (a["Created"] && moment(a["Created"], "M/D/YY H:mm").unix()) - (b["Created"] && moment(b["Created"],
					"M/D/YY H:mm").unix());
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
			var allDataArr = arr.AllData;
			// Get today's date
			var today = new Date();
			// Get current year
			var curYear = today.getFullYear();
			// Get today's month
			var curMonth = today.getMonth();

			// Filter by Severity 1
			var sev1Arr = [];
			var sev2Arr = [];
			var sev3Arr = [];
			allDataArr.filter(function (obj) {
				// Get Priority column
				var priority = obj.Priority;
				// Get created date
				var createdDate = obj.Created;
				// Convert string to a date
				var date = new Date(createdDate);
				// Get year 
				var yearInt = date.getFullYear();
				// Get month
				var monthInt = date.getMonth();

				/****** Severity 1  *******/
				if (yearInt === curYear && monthInt === curMonth && priority === "1. Severity-1 (High)") {
					sev1Arr.push(obj);
				}

				/****** Severity 2  *******/
				if (yearInt === curYear && monthInt === curMonth && priority === "2. Severity-2 (Medium)") {
					sev2Arr.push(obj);
				}

				/****** Severity 3  *******/
				if (yearInt === curYear && monthInt === curMonth && priority === "3. Severity-3 (Normal)") {
					sev3Arr.push(obj);
				}
			});

			// Check how many tickets have response time
			var sev1TimeArr = [];
			for (var i = 0; i < sev1Arr.length; i++) {
				// Get response time 
				var sev1ResponseTime = sev1Arr[i].FirstResponseInMin;
				// Get tickets less than 60 minutes 
				if (sev1ResponseTime < 60) {
					sev1TimeArr.push(sev1Arr[i]);
				}
			}

			// Check how many tickets have response time
			var sev2TimeArr = [];
			for (var j = 0; j < sev2Arr.length; j++) {
				// Get response time 
				var sev2ResponseTime = sev2Arr[j].FirstResponseInMin;
				// Get tickets less than 60 minutes 
				if (sev2ResponseTime < 120) {
					sev2TimeArr.push(sev2Arr[j]);
				}
			}

			// Check how many tickets have response time
			var sev3TimeArr = [];
			for (var k = 0; k < sev3Arr.length; k++) {
				// Get response time 
				var sev3ResponseTime = sev3Arr[k].FirstResponseInMin;
				// Get tickets less than 60 minutes 
				if (sev3ResponseTime < 1440) {
					sev3TimeArr.push(sev3Arr[k]);
				}
			}

			// Create a new object collection
			var mappedResult = {};
			// Define month names 
			var monthNames = ["JANUARY", "FEBRURAY", "MARCH", "APRIL", "MAY", "JUNE",
				"JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
			];
			// Add Month object to the collection
			mappedResult["Month"] = monthNames[today.getMonth()] + " - " + curYear;
			mappedResult["Sev1Per"] = this.getSevTotal(sev1Arr, sev1TimeArr);
			mappedResult["Sev2Per"] = this.getSevTotal(sev2Arr, sev2TimeArr);
			mappedResult["Sev3Per"] = this.getSevTotal(sev3Arr, sev3TimeArr);

			// Create json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data 
			oModel.setData(mappedResult);
			// Set object to the view
			this.getView().setModel(oModel, "SLA");
		},

		getSevTotal: function (sevArr, sevTimeArr) {
			// Total Severity
			var sevTotal = sevArr.length;
			// Count Sev 
			var sevCount = sevTimeArr.length;
			// Calculate the percentage for SEV 
			var sevNum = (sevCount * 100) / sevTotal;
			// Round it off
			var sevPer = sevNum.toFixed();
			// Convert to int	
			var serPerInt = parseInt(sevPer, 10);
			// If the value 0, it won't show so treat it as 100%
			if (isNaN(serPerInt) || serPerInt === 0) {
				serPerInt = 100;
			}

			return serPerInt;
		},

		// Point Consumption
		sdspointConsump: function (arr) {
			// Get today's year
			var today = new Date();
			// Current year
			var curYear = today.getFullYear();
			// Current month
			var curMonth = today.getMonth();
			// Add 1 to the month
			if (curMonth < 12) {
				curMonth += 1;
			}

			// Get vizframe for Tickets
			var pointFrame = this.getView().byId("pointFrame");
			// Set title to the chart 
			pointFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					}
				},
				title: {
					text: curYear
				}
			});

			// Get the main model 			
			//	var mainModel = this.getView().getModel("Main");
			// Get all the data
			var allData = arr.AllData;
			// Create new arrays
			var monthInno = [];
			var monthNonInno = [];
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
					var month = closeDate.getMonth();
					// Add 1 to the month
					if (month < 12) {
						month += 1;
					}

					// Filter by Innovation from Priority column
					var inno = allData[i].Priority;
					// Get the number of rows for Innovation
					if (month === curMonth && inno === "4. Innovation (Enhancement)") {
						monthInno.push(allData[i]);
					} else if (month === curMonth && inno !== "4. Innovation (Enhancement)") {
						monthNonInno.push(allData[i]);
					}
				}
			}

			var totalPoints = 0;
			// Total innovation points 
			monthInno.forEach(function (obj) {
				// Total Points 
				totalPoints += obj.Points;
			});

			// Create a new object
			var obj = {};
			// Array of months
			var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

			// Get the SDM Points  			
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;

			// Total non innovation points 
			var totalNonInno = 0;
			monthNonInno.forEach(function (obj) {
				// Total Points 
				totalNonInno += obj.Points;
			});

			obj.Collection = [{
				Month: monthNames[today.getMonth()],
				SDM: sdmPoints,
				Innovation: totalPoints,
				ClosedRequests: monthNonInno.length
			}];

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel, "PointModel");
		},

		removeDupicates: function (arrYears) {
			// Remove duplicate 
			var uniqueYear = [];
			$.each(arrYears, function (ind, ele) {
				if ($.inArray(ele, uniqueYear) === -1) {
					uniqueYear.push(ele);
				}
			});

			return uniqueYear;
		},

		pointConsump: function (arr) {
			// Get all the data
			var data = arr.AllData;
			var closedYears = [];
			// Filter on Close Time and State 
			data.filter(function (elem) {
				if (elem["Close Time"] !== "" && elem["State"] === "closed successful") {
					// Get year 
					var closeTime = elem["Close Time"];
					// Convert the year
					var yearClosed = moment(closeTime).format("YYYY");
					// Push to new array
					closedYears.push(yearClosed);
				}
			});

			// Remove duplicate elemements
			var uniqueClosed = this.removeDupicates(closedYears);

			// Get last element 
			var lastObj = uniqueClosed[uniqueClosed.length - 1];
			// Create Closed Tickets array
			var monthInno = [];
			var monthNonInno = [];
			var today = new Date();
			// Get month 
			var todayMonth = today.getMonth();
			if (todayMonth < 12) {
				todayMonth += 1;
			}

			// Iterate through array 
			for (var i = 0; i < data.length; i++) {
				// Get Close Time 
				var closeTime = data[i]["Close Time"];
				// Convert to date object
				var dateObj = new Date(closeTime);
				// Get year
				var closeTimeYear = dateObj.getFullYear();
				// Get state 
				var state = data[i].State;
				// Check the year
				if (closeTimeYear === parseInt(lastObj) && state === "closed successful") {
					// Get month 
					var closeTimeMonth = dateObj.getMonth();
					if (closeTimeMonth < 12) {
						closeTimeMonth += 1;
					}

					// Filter by Innovation from Priority column
					var inno = data[i].Priority;
					// Get the number of rows for Innovation
					if (closeTimeMonth === todayMonth && inno === "4. Innovation (Enhancement)") {
						monthInno.push(data[i]);
					} else if (closeTimeMonth === todayMonth && inno !== "4. Innovation (Enhancement)") {
						monthNonInno.push(data[i]);
					}
				}
			}

			// Sum the total
			var totalInno = 0;
			// Total innovation points 
			monthInno.forEach(function (obj) {
				// Total Points 
				totalInno += obj.Points;
			});

			// Total non innovation points 
			var totalNonInno = 0;
			monthNonInno.forEach(function (obj) {
				// Total Points 
				totalNonInno += obj.Points;
			});

			// Array of months
			var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

			// Get the SDM Points  			
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;

			// Create an object
			var obj = {};
			obj.Collection = [{
				Month: monthNames[today.getMonth()],
				SDM: sdmPoints,
				Innovation: totalInno,
				ClosedRequests: totalNonInno
			}];

			// Get vizframe for Tickets
			var pointFrame = this.getView().byId("pointFrame");
			// Set title to the chart 
			pointFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					}
				},
				title: {
					text: parseInt(lastObj, 10)
				}
			});

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data to the model
			oModel.setData(obj);
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