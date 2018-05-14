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

		setTicketMonthly: function(arr) {
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
			// Array of month names
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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
					//	console.log(dateCreated);
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

			var mappedResult = [];
			// Create object properties  
			for (var j = 0; j < countCreated.length; j++) {
				mappedResult.push({
					Month: monthName[j],
					CreatedRequests: countCreated[j],
					ClosedRequests: countClosed[j]
				});
			}
			
			// Get the current month
			var curMonth = today.getMonth();
			// check if current month exists 
			if (mappedResult[mappedResult.length - 1].Month !== monthName[curMonth]) {
				// Set to current month and created and closed tickets are 0
				mappedResult.push({
					Month: monthName[curMonth],
					CreatedRequests: 0,
					ClosedRequests: 0
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

		orisetTicketMonthly: function(arr) {
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
					console.log(dateCreated);

					// Get month
					var monthCreated = dateCreated.getMonth();
					if (monthCreated !== today.getMonth()) {
						countCreated[today.getMonth()] = 0;
					} else {
						// Count number of each month
						countCreated[monthCreated] = (countCreated[monthCreated] || 0) + 1;
					}
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
					if (monthClosed !== today.getMonth()) {
						countClosed[today.getMonth()] = 0;
					} else {
						// Count number of each month
						countClosed[monthClosed] = (countClosed[monthClosed] || 0) + 1;
					}
				}
			}
			console.log(countCreated);
			// Create a new array to store the collection
			var mappedResult = [];
			// Array of month names
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			var curMonth = today.getMonth();
			var test = [];
			for (var m = 0; m < monthName.length; m++) {
				if (m === 4) {
					test.push(monthName[m]);
				}

			}

			console.log(test);
			//	console.log(countCreated);	
			/*for (var created in countCreated) {
				// Convert to int
				var createdMonth = parseInt(created, 10);
				// Check the month 
				if (createdMonth !== curMonth) {
					/*countCreated.forEach(function (obj) {
						mappedResult.push({
							CreatedRequests: obj
						});
					});
					mappedResult.push({
						Month: monthName[curMonth],
						CreatedRequests: 0,
						ClosedRequests: 0
					});
				}
			}
		console.log(mappedResult);	
			for (var closed in countClosed) {
				// Convert to int
				var closedMonth = parseInt(closed, 10);
				// Check the month 
				if (closedMonth !== curMonth) {
					mappedResult.push({
						CreatedRequests: 0	
					});
				}
			}
	console.log(mappedResult);	 */

			// Create object properties  
			for (var j = 0; j < countCreated.length; j++) {
				//	console.log()
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