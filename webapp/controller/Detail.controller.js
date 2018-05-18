/* global moment:true */

jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/ui/commons/Carousel"
], function(BaseController, Carousel) {
	"use strict";

	return BaseController.extend("lhsusext.controller.Detail", {

		onInit: function() {
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
		},

		onBeforeRendering: function() {
			// Get the Data model 
			var mainModel = this.getOwnerComponent().getModel("Global");
			// Get the ClientName name
			var name = mainModel.getData().ClientName;
			// Set the title to the page 
			this.getView().byId("idPage").setTitle(name + " oVo Sustainment");
			// Get data model
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get all data array
			var allData = dataModel.getData();
			// Monthly method
			this.setTicketMonthly(allData);
			// SLA Tracker chart
			this.SLATracker(allData);
			// Point consumption
			this.pointConsump(allData);
		},

		asdssetTicketMonthly: function(arr) {
			// Get today's year
			var today = new Date();
			var curYear = today.getFullYear();

			// Get vizframe for Tickets
			var ticketFrame = this.getView().byId("ticketFrame");
			// Set title to the chart 
			ticketFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: "####",
						visible: true
					}
				},
				title: {
					text: curYear
				}
			});

			// Get all the data
			var allData = arr.AllData;
			// Create new arrays
			var countCreated = [];
			var countClosed = [];

			// Iterate through array
			for (var i = 0; i < allData.length; i++) {
				// Select Created dates
				var createdObj = allData[i].Created;
				// Convert to Date object
				var createdDateObj = new Date(createdObj);
				// Get year
				var yearCreated = createdDateObj.getFullYear();
				// Get year
				if (yearCreated === curYear) {

					/********** Created *************/
					// Select each month
					var createdDate = allData[i].Created;
					// Convert to date object 
					var dateCreated = new Date(createdDate);
					// Get month
					var monthCreated = dateCreated.getMonth();
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
					var closedDate = allData[i]["Close Time"];
					// Convert to date 
					var dateClosed = new Date(closedDate);
					// Get month
					var monthClosed = dateClosed.getMonth();
					// Count number of each month
					countClosed[monthClosed] = (countClosed[monthClosed] || 0) + 1;

				}
			}

			// Create a new array to store the collection
			var mappedResult = [];
			// Array of month names
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			// Create object properties  
			for (var j = 0; j < countCreated.length; j++) {
				mappedResult.push({
					Month: monthName[j],
					CreatedRequests: countCreated[j],
					ClosedRequests: countClosed[j]
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

		setTicketMonthly: function(arr) {
			// Get today's year
			var today = new Date();
			var currentYear = today.getFullYear();

			// Get vizframe for Tickets
			var ticketFrame = this.getView().byId("ticketFrame");
			// Set title to the chart 
			ticketFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: "####",
						visible: true
					}
				},
				title: {
					text: currentYear
				}
			});

			// All data array
			var allRecords = arr.AllData;
			/**** Created year ************/
			// Get the end year 
			var sortedCreated = allRecords.sort(function(a, b) {
				return (a["Created"] && moment(a["Created"], "M/D/YY H:mm").unix()) - (b["Created"] && moment(b["Created"],
					"M/D/YY H:mm").unix());
			});
			var endYearCreated = moment(sortedCreated[sortedCreated.length - 1]["Created"], "M/D/YY H:mm").format("YYYY");
			// Convert end year to integer 
			var endYearInt = parseInt(endYearCreated);

			// Define the current month
			var currentMonth = today.getMonth();
			// Add 1 to the month 
			if (currentMonth < 12) {
				currentMonth += 1;
			}
			
			// Define variables 
			var resultCreated = [];
			// Check the year 
			if (endYearInt === currentYear) {
				var i = 1;
				// Create each month for the current year
				while (i <= currentMonth) {
					resultCreated.push({
						Month: i,
						Created: 0
					});
					i++;
				}
			}

			/**** Close Time year ************/
			// Get the end year 
			var sortedClosed = allRecords.sort(function(a, b) {
				return (a["Close Time"] && moment(a["Close Time"], "M/D/YY H:mm").unix()) - (b["Close Time"] && moment(b["Close Time"],
					"M/D/YY H:mm").unix());
			});
			var endYearClosed = moment(sortedClosed[sortedClosed.length - 1]["Close Time"], "M/D/YY H:mm").format("YYYY");
			// Convert to int type
			var endYearClosedInt = parseInt(endYearClosed);
			//	console.log(endYearClosed);
			var resultClosed = [];
			// Check the year 
			if (endYearClosedInt === currentYear) {
				var k = 1;
				// Create each month for the current year
				while (k <= currentMonth) {
					resultClosed.push({
						Month: k,
						Closed: 0
					});
					k++;
				}
			}
			//	console.log(resultClosed);
			/****** Created *****************/
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
				if (createdYear === currentYear) {
					// Store the objects and get length 
					var createdMonthNum = [allRecords[j]];

					// Iterate through month array
					resultCreated.forEach(function(obj) {
						// Get Month
						var month = obj.Month;
						// Check the match
						if (month === createdMonth) {
							// Store the number of records 
							obj.Created += createdMonthNum.length;
						}
					});
				}
			}

			/****** Close Time *****************/
			// Get the month from 1 - 12 
			// Iterate through Created column 
			for (var a = 0; a < allRecords.length; a++) {
				// Get Created 
				var closeTime = allRecords[a]["Close Time"];
				// Convert to date object 
				var closeTimeDate = new Date(closeTime);
				// Get month 
				var closedMonth = closeTimeDate.getMonth();
				// Add 1 to the month
				if (closedMonth < 12) {
					closedMonth += 1;
				}

				// Get State 
				var state = allRecords[a].State;
				// Get year
				var closedYear = closeTimeDate.getFullYear();
				// Get only "Closed"
				if (state === "closed successful" && closedYear === currentYear) {
					// Store the objects and get length 
					var closedMonthNum = [allRecords[a]];

					// Iterate through month array
					resultClosed.forEach(function(obj) {
						// Get Month
						var month = obj.Month;
						// Check the match
						if (month === closedMonth) {
							// Store the number of records 
							obj.Closed += closedMonthNum.length;

						}
					});
				}
			}

			// Create a new array
			var result = []; 
			// Loop through 
			resultCreated.forEach(function (obj) {
				// Month
				var month = obj.Month; 
				resultClosed.forEach(function (elem) {
					// Month
					var m = elem.Month; 
					if (month === m) {
						result.push({Month: month, CreatedRequests: obj.Created, ClosedRequests: elem.Closed});
					}
				});
			});
					
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

		// SLA Tracker 
		SLATracker: function(arr) {
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
			allDataArr.filter(function(obj) {
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

		getSevTotal: function(sevArr, sevTimeArr) {
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
		pointConsump: function(arr) {
			// Get today's year
			var today = new Date();
			// Current year
			var curYear = today.getFullYear();
			// Current month
			var curMonth = today.getMonth();

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

					// Filter by Innovation from Priority column
					var inno = allData[i].Priority;
					// Get the number of rows for Innovation
					if (month === curMonth) {
						if (inno === "4. Innovation (Enhancement)") {
							monthInno.push(allData[i].Points);
						} else {
							monthNonInno.push(allData[i].Points);
						}
					}
				}
			}

			// Create a new object
			var obj = {};
			// Array of months
			var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();

			// Get the SDM Points  			
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get the Total Monthly Points from global file 
			var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Create a total point variable 
			var totalPoints, overage, rolloverPoints;
			//	total points = SDM Points + Total Points of closed tickets
			totalPoints = sdmPoints + monthNonInno.length;
			// Check the value 
			if (totalPoints > monthlyPoints) {
				// Calculate the average by substracting the monthly points with total points
				overage = monthlyPoints - totalPoints;
			}

			if (totalPoints < monthlyPoints) {
				// Calculate the roll over points 
				rolloverPoints = monthlyPoints - totalPoints;
			}

			// Check each month 
			if (monthInno.length === 0 || monthNonInno.length === 0) {

				obj.Collection = [{
					Month: monthNames[today.getMonth()],
					SDM: sdmPoints,
					//	MonthlyPoints: monthlyPoints, 
					Innovation: monthInno.length,
					ClosedRequests: monthNonInno.length
						//	TotalPoints: totalPoints, 
						//	Overage: overage,
						//	RolloverPoints: rolloverPoints
				}];

				// Set collection to the model
				oModel.setData(obj);
			} else {
				// Remove any empty string 
				var innoArray = monthInno.filter(function(v) {
					return v !== "";
				});

				// Remove any empty string 
				var nonInnoArray = monthNonInno.filter(function(v) {
					return v !== "";
				});

				// Sum the Innovation points
				var sumInnoPoints = innoArray.reduce(function(sum, num) {
					// Return the total
					return sum + num;
				});

				// Sum the Non Innovation points
				var sumNonInnoPoints = nonInnoArray.reduce(function(sum, num) {
					// Return the total
					return sum + num;
				});

				// Create a collection
				obj.Collection = [{
					Month: monthNames[today.getMonth()],
					SDM: sdmPoints,
					//	MonthlyPoints: monthlyPoints, 
					Innovation: sumInnoPoints,
					ClosedRequests: sumNonInnoPoints
						//	Overage: overage,
						//	RolloverPoints: rolloverPoints
				}];

				// Set collection to the model
				oModel.setData(obj);
			}

			// Set model to the view
			this.getView().setModel(oModel, "PointModel");
		},

		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}
	});
});