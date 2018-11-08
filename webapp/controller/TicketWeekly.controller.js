/* global moment:true */

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.TicketWeekly", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "ticketWeekly") {
				// Call method
				this.setTicketWeekly();
			}
		},

		setTicketWeekly: function () {
			// Check the data label
			this.onShowData();
			// Scope variable
			var that = this;
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
			// Get pop over id for Essential 1 
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

			// Create an object
			var obj = {};
			obj.Collection = output;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);
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

		datesOfFirstWeekFromLastYear: function () {
			// Create array of days 
			var DAYS = [0, 1, 2, 3, 4, 5, 6];
			// Set the current year 
			var currentYear = new Date().getFullYear();
			var lastYear = currentYear - 1;
			// Get the first day of current year
			var firstDayOfCurrentYear = Number(moment(new Date(currentYear, 0, 1)).format("d"));

			if (firstDayOfCurrentYear === 0) {
				return [];
			} else {
				return DAYS.slice(0, firstDayOfCurrentYear).map(function (day) {
					return new Date(lastYear, 11, 31 - day);
				});
			}
		},

		isPresent: function (dates, date) {

			return !!dates.find(function (dateElement) {
				return date.isSame(dateElement);
			});
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