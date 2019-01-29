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

/* global moment:true */
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"lhsusext/model/formatter" // include formatter js 
], function (BaseController, ChartFormatter, Format, formatter) {
	"use strict";

	return BaseController.extend("lhsusext.controller.ItemDetail", {
		// formatter js 
		formatter: formatter,

		onInit: function () {

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Set up viz properties 
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"]
				},
				title: {
					text: new Date().getFullYear() // current year 
				}
			});
			// Format the data 		
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern;
			// Create tool tip control
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(oVizFrame.getVizUid());
			oTooltip.setFormatString(formatPattern.STANDARDFLOAT);
			// Get pop over id 
			var oPopover = this.getView().byId("idPopOver");
			oPopover.connect(oVizFrame.getVizUid());
			oPopover.setFormatString(ChartFormatter.DefaultPattern.Integer);

			// Matched route 
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");
			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData().AllData;
			// Display busy indicator 
			this.getView().setBusy(true); 
			// Check the page name 
			if (sName === "itemDetail") {
				// Get entity path 
				var entityName = oEvent.getParameter("arguments").entity;
				// Check each entity name and route to the module 
				switch (entityName) {
				case "ticketQuarterly":
					// Call function with all data array 
					this.setTicketQuarterly(allData);
					break;
				case "ticketMonthly":
					// Call function with all data array 
					this.setTicketMonthly(allData);
					break;
				case "ticketWeekly":
					// Call function with all data array 
					this.setTicketWeekly(allData);
					break;
				case "pointQuarterly":
					// Call function with all data array 
					this.setPointQuarterly(allData);
					break;
				case "pointMonthly":
					// Call function with all data array 
					this.setPointMonthly(allData);
					break;
				default:
					sap.m.MessageBox.alert("Page is not found");
					break;
				}
			}
		},

		// Quarterly tickets
		setTicketQuarterly: function (arr) {
			// Copy an array 
			var allData = arr.slice();
			// Create new arrays
			var countCreated = [];
			var countClosed = [];
			// Today's year 
			var curYear = new Date().getFullYear();
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
			var outputCreated = [];
			for (var key in arrCreated) {
				outputCreated.push({
					"Quarter": key,
					"CreatedRequests": arrCreated[key]
				});
			}

			var arrClosed = this.getEachQuarter(countClosed);
			var outputClosed = [];
			for (var key in arrClosed) {
				outputClosed.push({
					"Quarter": key,
					"ClosedRequests": arrCreated[key]
				});
			}

			// Make a copy of outputCreated 
			var output = outputCreated.slice();

			// Loop through Closed output
			outputClosed.forEach(function (obj) {
				// Find each Quarter
				var found = output.find(function (item) {
					// return the match 
					return obj.Quarter == item.Quarter;
				});

				// if found 
				if (found) {
					// update it 
					found.ClosedRequests = obj.ClosedRequests;
				} else {
					// add it 
					output.push(obj);
				}
			});

			// Create a new object
			var obj = {};
			// Set the title 
			obj.Title = "Overview of Open vs Closed Sustainment Request by Quarter";
			// Store the data collection 
			obj.Collection = output;
			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel(obj);
			// Set model to the view 
			this.getView().setModel(oModel);

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Remove all feeds first 
			oVizFrame.removeAllFeeds();
			// Set viz type
			oVizFrame.setVizType("column");
			// Create dataset 
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Quarter",
					value: "{Quarter}"
				}],
				measures: [{
					name: "CreatedRequests",
					value: "{CreatedRequests}"
				}, {
					name: "ClosedRequests",
					value: "{ClosedRequests}"
				}],
				data: {
					path: "/Collection"
				}
			});

			// Set data to vizframe
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			// Create feeds 
			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["CreatedRequests", "ClosedRequests"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Quarter"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			// Call method to set label visibility 
			this.onShowData();

			// Remove table 
			var oPage = this.getView().byId("idPanel");
			oPage.removeAllContent();
			// Remove footer 
			var footer = this.getView().byId("footer");
			footer.removeAllContent();
			
			// Hide busy indicator 
			this.getView().setBusy(false); 
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

		// Monthly tickets
		setTicketMonthly: function (arr) {
			// Copy the array 
			var allRecords = arr.slice();
			// Define a new object 
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

			// Create a new object
			var obj = {};
			// Update the title 
			obj.Title = "Overview of Open vs Closed Sustainment Request by Month";
			// Store as a collection
			obj.Collection = output;

			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel(obj);
			// Set model to the view
			this.getView().setModel(oModel);

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Remove all feeds first 
			oVizFrame.removeAllFeeds();
			// Set viz type 
			oVizFrame.setVizType("line");

			// Create dataset 
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Month",
					value: "{Month}"
				}],
				measures: [{
					name: "CreatedRequests",
					value: "{CreatedRequests}"
				}, {
					name: "ClosedRequests",
					value: "{ClosedRequests}"
				}],
				data: {
					path: "/Collection"
				}
			});

			// Set data to vizframe
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			// Create feeds 
			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["CreatedRequests", "ClosedRequests"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Month"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			// Call method to set label visibility 
			this.onShowData();

			// Remove table 
			var oPage = this.getView().byId("idPanel");
			oPage.removeAllContent();
			// Remove footer 
			var footer = this.getView().byId("footer");
			footer.removeAllContent();
			
			// Hide busy indicator 
			this.getView().setBusy(false); 
		},

		// Weekly tickets 
		setTicketWeekly: function (arr) {
			// Scope variable 
			var that = this;
			// Get the current year
			var curYear = new Date().getFullYear();
			// Copy an array 
			var allData = arr.slice();
			// Create new arrays
			var arrCreated = [];
			var arrClosed = [];

			for (var i = 0; i < allData.length; i++) {
				/********** Created *************/
				// Select each month
				var created = allData[i].Created;
				// Convert string to date object 
				var createdDate = new Date(created);
				// Get year
				var yearCreated = createdDate.getFullYear();
				// Check the current year
				if (yearCreated === curYear) {
					// Select each month
					var dateCreated = allData[i].Created;
					// Conver to date 
					var dateCreatedObj = new Date(dateCreated);
					// Format the date 
					var monthCreated = dateCreatedObj.toLocaleDateString();
					// Push elements to a new array
					arrCreated.push(monthCreated);
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
					// Format the date 
					var monthClosed = dateClosedObj.toLocaleDateString();
					// Store each element to Close Time array
					arrClosed.push(monthClosed);
				}
			}
		
			// Get weekly data for each date			
			var weeklyCreated = that.getWeeklyDates(arrCreated);
			var weeklyClosed = that.getWeeklyDates(arrClosed);

			// Create a new array 
			var createdResult = [];

			// Created object properties and store their length
			for (var key in weeklyCreated) {
				createdResult.push({
					Week: key,
					CreatedRequests: weeklyCreated[key].length
				});
			}

			// Create a new array 
			var closedResult = [];
			// Created object properties and store their length
			for (var key in weeklyClosed) {
				closedResult.push({
					Week: key,
					ClosedRequests: weeklyClosed[key].length
				});
			}

			// Make a copy of createdResult array
			var output = createdResult.slice();

			// Loop through closedResult array to find the item  
			closedResult.forEach(function (item) {
				// Let's find it in createdResult array 
				var found = output.find(function (i) {
					// Check if the week is equal 
					return item.Week === i.Week;
				});

				// If found 
				if (found) {
					// update it 
					found.ClosedRequests = item.ClosedRequests;
				} else {
					// not found, let's add it
					output.push(item);
				}
			});

			// If we want 0, for CreatedTickets and ClosedTickets if none found
			output.forEach(function (item) {
				item.CreatedRequests = item.CreatedRequests | 0;
				item.ClosedRequests = item.ClosedRequests | 0;
			});

			// Use regex to extract the WK 
			var regexnum = /\d+/;

			var numWk = function (s) {
				return parseInt(regexnum.exec(s.Week)[0], 10);
			};

			// sort 
			output.sort(function (a, b) {
				return numWk(a) - numWk(b);
			});

			// If no data is found 
			if (output.length !== 0) {
				// Get vizframe id 
				var oVizframe = this.getView().byId("idVizFrame");
				// Set viz prop
				oVizframe.setVizProperties({
					plotArea: {
						window: {
							start: output[0].Week, // Get first object
							end: output[output.length - 1] // Get last object	
						}
					}
				});
			}

			// Create an object
			var obj = {};
			// Set the title 
			obj.Title = "Overview of Open vs Closed Sustainment Request by Week";
			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel();
			// Store data collection 
			obj.Collection = output;

			// Create a model and set data 
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Remove all feeds first 
			oVizFrame.removeAllFeeds();
			// Set viz type 
			oVizFrame.setVizType("line");
			// Dataset
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Week",
					value: "{Week}"
				}],
				measures: [{
					name: "CreatedRequests",
					value: "{CreatedRequests}"
				}, {
					name: "ClosedRequests",
					value: "{ClosedRequests}"
				}],
				data: {
					path: "/Collection"
				}
			});

			// Set data to vizframe
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["CreatedRequests", "ClosedRequests"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Week"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			// Call method to set label visibility 
			this.onShowData();

			// Remove table  
			var oPage = this.getView().byId("idPanel");
			oPage.removeAllContent();
			// Remove footer 
			var footer = this.getView().byId("footer");
			footer.removeAllContent();
			
			// Hide busy indicator 
			this.getView().setBusy(false); 
		},

		getWeeklyDates: function (arr) {

			var filtered = arr.filter(function (elem) {

				var year = Number(moment(elem, "M/D/YYYY").format("YYYY"));
				var dayOfWeek = moment(elem, "M/D/YYYY").format("dd");
				var dayOfMonth = Number(moment(elem, "M/D/YYYY").format("D"));
				var month = Number(moment(elem, "M/D/YYYY").format("M"));

				var currentYear = (new Date()).getFullYear();
				var lastYear = currentYear - 1;

				return (
					year === currentYear ||
					(year === lastYear && dayOfWeek === "Su" && dayOfMonth === 31 && month === 12)
				);
			});

			// Create a new array
			var result = {};
			// Create each week and store value in Created property
			filtered.forEach(function (string) {
				// Format the week 
				var week = "WK" + moment(string, "M/D/YYYY").format("w");

				if (!result[week]) {
					result[week] = [string];
				} else {
					result[week].push(string);
				}
			});

			// Return the result
			return result;
		},

		// Quarterly points 
		setPointQuarterly: function (arr) {
			// Copy an array 
			var allData = arr.slice();

			// Create new arrays
			var arrClosed = [];
			// Get SDM Points from global file 
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get Sustain Start Date 
			var startDate = this.getView().getModel("Global").getData().SustainStartDate;
			// Convert to Date object
			var startDateObj = new Date(startDate);
			// Get month
			var startMonth = startDateObj.getMonth();
			if (startMonth < 12) {
				startMonth += 1;
			}

			// Get current year
			var currentYear = new Date().getFullYear();
			// Get current month
			var currentMonth = new Date().getMonth();
			if (currentMonth < 12) {
				currentMonth += 1;
			}

			// Sorting Close Time date
			var sortedRecords = allData.sort(function (a, b) {
				return (new Date(a["Close Time"]) - new Date(b["Close Time"]));
			});

			// Year format 
			var startYear = new Date(sortedRecords[0]["Close Time"]).getFullYear();
			// Intialize i 
			var i = 1;

			/** First condition: 
			/  External app only shows current data 
			*/

			var startQuarter = moment(startDateObj).quarter();

			// Define current quarter
			var curQuarter = moment().quarter();

			// If current year is the start year 
			if (currentYear === startYear) {
				//	if (currentYear === endYearInt && startYearInt <= currentYear) {
				// Check the quarter 
				if (startQuarter <= curQuarter) {
					for (var s = startQuarter; s <= curQuarter; s++) {
						if (s === curQuarter) {
							if (currentMonth % 3 === 0) {
								arrClosed.push({
									Quarter: s,
									Key: "Q" + s,
									BMAPoints: sdmPoints * 3,
									TotalPoints: 0
								});
							} else {
								arrClosed.push({
									Quarter: s,
									Key: "Q" + s,
									BMAPoints: sdmPoints * (currentMonth % 3),
									TotalPoints: 0
								});
							}
						} else {
							arrClosed.push({
								Quarter: s,
								Key: "Q" + s,
								BMAPoints: sdmPoints * 3,
								TotalPoints: 0
							});
						}
					}
				} else {
					for (var j = 1; j <= curQuarter; j++) {
						if (j === curQuarter) {
							if (currentMonth % 3 === 0) {
								arrClosed.push({
									Quarter: j,
									Key: "Q" + j,
									BMAPoints: sdmPoints,
									TotalPoints: 0
								});
							} else {
								arrClosed.push({
									Quarter: j,
									Key: "Q" + j,
									BMAPoints: sdmPoints * (currentMonth % 3),
									TotalPoints: 0
								});
							}
						} else {
							arrClosed.push({
								Quarter: j,
								Key: "Q" + j,
								BMAPoints: sdmPoints * 3,
								TotalPoints: 0
							});
						}
					}
				}
			} else {
				for (var j = 1; j <= curQuarter; j++) {
					if (j === curQuarter) {
						if (currentMonth % 3 === 0) {
							arrClosed.push({
								Quarter: j,
								Key: "Q" + j,
								BMAPoints: sdmPoints * 3,
								TotalPoints: 0
							});
						} else {
							arrClosed.push({
								Quarter: j,
								Key: "Q" + j,
								BMAPoints: sdmPoints * (currentMonth % 3),
								TotalPoints: 0
							});
						}
					} else {
						arrClosed.push({
							Quarter: j,
							Key: "Q" + j,
							BMAPoints: sdmPoints * 3,
							TotalPoints: 0
						});
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

					arrClosed.forEach(function (obj) {
						// Get Quarter
						var quarter = obj.Quarter;
						if (quarter === closeQuarter) {
							// Get BMA Points 
							var bmaPoints = obj.BMAPoints;
							// add points 
							obj.TotalPoints += allData[i].Points;
							// add bma points 
							obj.TotalPoints += bmaPoints;
						}
					});

				}
			}

			// Create a new object
			var obj = {};
			// Set the title 
			obj.Title = "Points Consumption by Quarter";
			// Store as a collection
			obj.Collection = arrClosed;

			// Create a model and set data 
			var oModel = new sap.ui.model.json.JSONModel(obj);
			// Set model to the view
			this.getView().setModel(oModel);

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Get Monthly Points 
			var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Set viz properties 
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"],
					referenceLine: {
						line: {
							valueAxis: [{
								value: (sdmPoints + monthlyPoints) * 3,
								visible: true,
								size: 3,
								type: "solid",
								color: "#FF0000",
								label: {
									text: (sdmPoints + monthlyPoints) * 3,
									visible: true
								}
							}]
						}
					}
				}
			});

			// Remove all feeds first 
			oVizFrame.removeAllFeeds();
			// Set viz type 
			oVizFrame.setVizType("column");
			// Dataset
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
						name: "Quarter",
					//	value: "{path: 'Quarter', formatter: '.formatter.formatQuarter'}"
					value: {
						parts: [{
							path: "Quarter"
						}],
						formatter: function (Quarter) {
							// Define quarter variable 
							var quarter = "";
							if (Quarter === 1) {
								quarter = "Q1";
							} else if (Quarter === 2) {
								quarter = "Q2";
							} else if (Quarter === 3) {
								quarter = "Q3";
							} else if (Quarter === 4) {
								quarter = "Q4";
							}
							
							// Return quarter 
							return quarter; 
						}
					}
				}],
				measures: [{
					name: "TotalPoints",
					value: "{TotalPoints}"
				}],
				data: {
					path: "/Collection"
				}
			});

			// Set data to vizframe
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["TotalPoints"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Quarter"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			// Data table
			// Variable to store the total points 
			var totalPoints = 0;
			// Create a new array 
			var output = [];
			// Get selected keys for quarter
			// var quarterKeys = this.getView().byId("comboQuarter").getSelectedKeys();
			var currentQuarter = moment().utc().quarter();
			// Iterate through array 
			allData.forEach(function (obj) {
				// Close Time column 
				var closeTimeDate = new Date(obj["Close Time"]);
				var q = moment(closeTimeDate).utc().quarter();
				// State column
				var closedState = obj.State;

				if (closedState === "closed successful" && parseInt(currentYear, 10) === closeTimeDate.getFullYear() && currentQuarter === q) {
					// Store each element to a new array 
					totalPoints += obj.Points;
					// Store new data 
					output.push(obj);

				}
			});

			// Sort by Close Time dates 
			output = output.sort(function (a, b) {
				return (new Date(a["Close Time"]) - new Date(b["Close Time"]));
			});

			// Calculate Reveal SDM points multiplying by 3 
			var revealSDMQuarterly = sdmPoints * 3;
			var totalMonthlyPoints = (sdmPoints + monthlyPoints) * 3;
			var grandTotal = (totalPoints + revealSDMQuarterly);
			var rolloverPoints = (totalMonthlyPoints - grandTotal);
			// Create a new object 
			var newObj = {};
			newObj.DataCollection = output;
			newObj.SelectedYear = currentYear;
			newObj.CurrentQuarter = currentQuarter;
			newObj.TotalPoints = totalPoints;
			newObj.RevealSDM = revealSDMQuarterly;
			newObj.GrandTotal = grandTotal;
			newObj.MonthlyPoints = totalMonthlyPoints;
			newObj.RolloverPoints = rolloverPoints;

			// Call method to set label visibility 
			this.onShowData();

			// Display table fragment 
			this._showQuarterFragment("QuarterSummary");
			// Display footer fragment
			this._showFooterFragment("QuarterFooter");

			/**
			 * Default the selected key on Quarter drop down 
			 */
			// Get Combo id 	
			var comboQuarter = this.getView().byId("comboQuarter");
			comboQuarter.setSelectedKey([curQuarter]);

			// Create a model and set data 
			var reportModel = new sap.ui.model.json.JSONModel(newObj);
			// Set size limit
			reportModel.setSizeLimit(9999999999);
			// Set model to the view
			this.getView().setModel(reportModel, "ReportModel");
			
			// Hide busy indicator 
			this.getView().setBusy(false); 
		},

		_showQuarterFragment: function (sFragmentName) {
			var oPage = this.getView().byId("idPanel");

			oPage.removeAllContent();

			oPage.insertContent(this._getQuarterFragment(sFragmentName));
		},

		_getQuarterFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "lhsusext.view." + sFragmentName, this.getView().getController());

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		_formFragments: {},

		_showFooterFragment: function (sFragmentName) {
			var oPage = this.getView().byId("footer");

			oPage.removeAllContent();

			oPage.insertContent(this._getFooterFragment(sFragmentName));
		},

		_getFooterFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "lhsusext.view." + sFragmentName, this.getView().getController());

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		handleQuarterSelectionChange: function (oEvent) {
			// Hide busy indicator
			sap.ui.core.BusyIndicator.show();
			// Get selected quarters
			var selectedKey = oEvent.getSource().getSelectedKey();
			// simulate delayed end of operation
			jQuery.sap.delayedCall(2000, this, function () {
				// Get Data model 
				var dataModel = this.getOwnerComponent().getModel("Data");
				// Get data 
				var allData = dataModel.getData().AllData;
				// Create a new array 
				var output = [];
				// Variable to store the total points 
				var totalPoints = 0;
				// Get id from selected year 
				var selectedYear = this.getView().byId("idYearQuarterly").getText();

				// Iterate through array 
				allData.forEach(function (obj) {
					// Close Time column 
					var closeTimeDate = new Date(obj["Close Time"]);
					// State column
					var closedState = obj.State;
					// Convert to quarter 
					var q = moment(closeTimeDate).utc().quarter();

					if (closedState === "closed successful" && parseInt(selectedKey, 10) === q && parseInt(selectedYear, 10) === closeTimeDate.getFullYear()) {
						// Sum the points 
						totalPoints += obj.Points;
						// Store each element to a new array 
						output.push(obj);
					}
				});

				// Sort by Close Time dates 
				output = output.sort(function (a, b) {
					return (new Date(a["Close Time"]) - new Date(b["Close Time"]));
				});

				// Get SDM Points from global file 
				var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
				// Calculate Reveal SDM points multiplying by 3 
				var revealSDMQuarterly = smdPoints * 3;
				// Get Monthly Points 
				var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
				// Total monthly points 
				var totalMonthlyPoints = (smdPoints + monthlyPoints) * 3;
				// Calculate Monthly Points quarterly multiplying by 3 
				//	var monthlyPointsQuarterly = monthlyPoints * 3;
				var grandTotal = totalPoints + revealSDMQuarterly;
				var rolloverPoints = totalMonthlyPoints - grandTotal;
				// Create a new object
				var obj = {};
				// Store as a collection
				obj.DataCollection = output;
				obj.SelectedYear = selectedYear;
				obj.TotalPoints = totalPoints;
				obj.RevealSDM = revealSDMQuarterly;
				obj.GrandTotal = grandTotal;
				obj.MonthlyPoints = (smdPoints + monthlyPoints) * 3;
				obj.RolloverPoints = rolloverPoints;

				// Create a model
				var oModel = new sap.ui.model.json.JSONModel(obj);
				// Set size limit
				oModel.setSizeLimit(99999999);
				// Set model to the view
				this.getView().setModel(oModel, "ReportModel");

				// Hide busy indicator
				sap.ui.core.BusyIndicator.hide();
			});
		},

		onPDFPressed: function (oEvent) {
			var oTarget = this.getView(),
				sTargetId = oEvent.getSource().data("targetId");

			if (sTargetId) {
				oTarget = oTarget.byId(sTargetId);
			}

			if (oTarget) {
				var $domTarget = oTarget.$()[0],
					sTargetContent = $domTarget.innerHTML,
					sOriginalContent = document.body.innerHTML;

				document.body.innerHTML = sTargetContent;
				window.print();
				document.body.innerHTML = sOriginalContent;
			} else {
				jQuery.sap.log.error("onPrint needs a valid target container [view|data:targetId=\"SID\"]");
			}
		},

		// Monthly points 
		setPointMonthly: function (arr) {
			// Copy an array 
			var allData = arr.slice();
			// Create new arrays
			var arrClosed = [];
			// Get SDM Points from global file 
			var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;
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
			// Get current year 
			var currentYear = new Date().getFullYear();
			// Check the Sustain start year vs end year 
			if (sustainYear === currentYear) {
				for (i = sustainMonth; i <= currentMonth; i++) {
					arrClosed.push({
						Month: this.getMonth(i),
						Key: i,
						BMAPoints: sdmPoints,
						TotalPoints: 0
					});
				}
			} else {
				while (i <= currentMonth) {
					arrClosed.push({
						Month: this.getMonth(i),
						Key: i,
						BMAPoints: sdmPoints,
						TotalPoints: 0
					});
					i++;
				}
			}

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
						var month = arrClosed[j].Key;
						if (month === monthClosed) {
							// Get points 
							arrClosed[j].TotalPoints += allData[k].Points;
							// Get BMAPoints
							var bmaPoints = arrClosed[j].BMAPoints;
							// Add bma points to the total 
							arrClosed[j].TotalPoints += bmaPoints;
						}
					}
				}
			}

			// Create a new object
			var obj = {};
			// Set the title 
			obj.Title = "Points Consumption by Month";
			// Store as a collection
			//obj.Collection = output;
			obj.Collection = arrClosed;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);

			// Get vizframe id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Get Monthly Points from global file 
			var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Add reference line
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					},
					referenceLine: {
						line: {
							valueAxis: [{
								value: sdmPoints + monthlyPoints,
								visible: true,
								size: 3,
								type: "solid",
								color: "#FF0000",
								label: {
									text: sdmPoints + monthlyPoints,
									visible: true
								}
							}]
						}
					}
				}
			});

			// Remove all feeds first 
			oVizFrame.removeAllFeeds();
			// Set viz type
			oVizFrame.setVizType("column");
			// Create dataset 
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Month",
					value: "{Month}"
				}],
				measures: [{
					name: "TotalPoints",
					value: "{TotalPoints}"
				}],
				data: {
					path: "/Collection"
				}
			});

			// Set data to vizframe
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			// Create feeds 
			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["TotalPoints"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Month"]
				});

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);

			// Data table
			// Variable to store the total points 
			var totalPoints = 0;
			// Create a new array 
			var output = [];

			// Iterate through array 
			allData.forEach(function (obj2) {
				// Close Time column 
				var closeTimeDate = new Date(obj2["Close Time"]);
				var m = closeTimeDate.getMonth();
				if (m < 12) {
					m += 1;
				}
				// State column
				var closedState = obj2.State;

				if (closedState === "closed successful" && parseInt(currentYear, 10) === closeTimeDate.getFullYear() && currentMonth === m) {
					// Store each element to a new array 
					totalPoints += obj2.Points;
					// Store new data 
					output.push(obj2);

				}
			});

			// Sort by Close Time dates 
			output = output.sort(function (a, b) {
				return (new Date(a["Close Time"]) - new Date(b["Close Time"]));
			});

			// Calculate Reveal SDM points multiplying by 3 
			var revealSDMMonthly = sdmPoints;
			var totalMonthlyPoints = (sdmPoints + monthlyPoints);
			var grandTotal = (totalPoints + revealSDMMonthly);
			var rolloverPoints = (totalMonthlyPoints - grandTotal);
			// Create a new object 
			var newObj = {};
			newObj.DataCollection = output;
			newObj.SelectedYear = currentYear;
			newObj.CurrentMonth = currentMonth;
			newObj.TotalPoints = totalPoints;
			newObj.RevealSDM = revealSDMMonthly;
			newObj.GrandTotal = grandTotal;
			newObj.MonthlyPoints = totalMonthlyPoints;
			newObj.RolloverPoints = rolloverPoints;

			// Call method to set label visibility 
			this.onShowData();
			// Display table fragment 
			this._showMonthlyFragment("MonthlySummary");
			// Display footer fragment
			this._showFooterFragment("QuarterFooter");

			//* Default the selected key on drop down 

			// Get Combo id 	
			var comboMonth = this.getView().byId("comboMonth");
			comboMonth.setSelectedKey([currentMonth]);

			// Create a model and set data 
			var reportModel = new sap.ui.model.json.JSONModel(newObj);
			// Set size limit
			reportModel.setSizeLimit(9999999999);
			// Set model to the view
			this.getView().setModel(reportModel, "ReportModel");
			
			// Hide busy indicator 
			this.getView().setBusy(false); 
		},

		_showMonthlyFragment: function (sFragmentName) {
			var oPage = this.getView().byId("idPanel");

			oPage.removeAllContent();

			oPage.insertContent(this._getMonthlyFragment(sFragmentName));
		},

		_getMonthlyFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "lhsusext.view." + sFragmentName, this.getView().getController());

			return this._formFragments[sFragmentName] = oFormFragment;
		},

		handleMonthSelectionChange: function (oEvent) {
			// Hide busy indicator
			sap.ui.core.BusyIndicator.show();
			// Get selected quarters
			var selectedKey = oEvent.getSource().getSelectedKey();
			// simulate delayed end of operation
			jQuery.sap.delayedCall(2000, this, function () {
				// Get Data model 
				var dataModel = this.getOwnerComponent().getModel("Data");
				// Get data 
				var allData = dataModel.getData().AllData;
				// Create a new array 
				var output = [];
				// Variable to store the total points 
				var totalPoints = 0;
				// Get id from selected year 
				var selectedYear = this.getView().byId("idYearMonthly").getText();

				// Iterate through array 
				allData.forEach(function (obj) {
					// Close Time column 
					var closeTimeDate = new Date(obj["Close Time"]);
					// State column
					var closedState = obj.State;
					// Convert to quarter 
					var m = closeTimeDate.getMonth();
					if (m < 12) {
						m += 1;
					}
					if (closedState === "closed successful" && parseInt(selectedKey, 10) === m && parseInt(selectedYear, 10) === closeTimeDate.getFullYear()) {
						// Sum the points 
						totalPoints += obj.Points;
						// Store each element to a new array 
						output.push(obj);
					}
				});

				// Sort by Close Time dates 
				output = output.sort(function (a, b) {
					return (new Date(a["Close Time"]) - new Date(b["Close Time"]));
				});

				// Get SDM Points from global file 
				var sdmPoints = this.getView().getModel("Global").getData().SDMPoints;
				// Calculate Reveal SDM points multiplying by 3 
				var revealSDMMonthly = sdmPoints;
				// Get Monthly Points 
				var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
				// Total monthly points 
				var totalMonthlyPoints = (sdmPoints + monthlyPoints);
				var grandTotal = totalPoints + revealSDMMonthly;
				var rolloverPoints = totalMonthlyPoints - grandTotal;
				// Create a new object
				var obj = {};
				// Store as a collection
				obj.DataCollection = output;
				obj.SelectedYear = selectedYear;
				obj.TotalPoints = totalPoints;
				obj.RevealSDM = revealSDMMonthly;
				obj.GrandTotal = grandTotal;
				obj.MonthlyPoints = (sdmPoints + monthlyPoints);
				obj.RolloverPoints = rolloverPoints;

				// Create a model
				var oModel = new sap.ui.model.json.JSONModel(obj);
				// Set size limit
				oModel.setSizeLimit(99999999);
				// Set model to the view
				this.getView().setModel(oModel, "ReportModel");

				// Hide busy indicator
				sap.ui.core.BusyIndicator.hide();
			});
		},

		// Function to show the label
		onShowData: function (oEvent) {
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
		},

		// Back to home page
		onHomePress: function () {
			this.getRouter().navTo("master");
		},

		getMonth: function (oMonth) {
			var month;
			if (oMonth === 1) {
				month = "JAN";
			} else if (oMonth === 2) {
				month = "FEB";
			} else if (oMonth === 3) {
				month = "MAR";
			} else if (oMonth === 4) {
				month = "APR";
			} else if (oMonth === 5) {
				month = "MAY";
			} else if (oMonth === 6) {
				month = "JUN";
			} else if (oMonth === 7) {
				month = "JUL";
			} else if (oMonth === 8) {
				month = "AUG";
			} else if (oMonth === 9) {
				month = "SEP";
			} else if (oMonth === 10) {
				month = "OCT";
			} else if (oMonth === 11) {
				month = "NOV";
			} else if (oMonth === 12) {
				month = "DEC";
			}

			return month;
		}
	});
});