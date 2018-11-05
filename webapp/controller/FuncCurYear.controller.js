jQuery.sap.require("lhsusext.util.formatter");

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.FuncCurYear", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "funcCurYear") {
				// Call method
				this.setAreaMonthly();
			}
		},

		setAreaMonthly: function () {
			// Check the data label
			this.onShowData();
			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData();
			// Today's date 
			var today = new Date();
			// Define result object 
			var result = {};
			// Get the global model 			
			var arrayQueue = this.getView().getModel("Global").getData().Queue;
			// Iterate through array
			for (var i = 0; i < allData.length; i++) {
				// Select Created dates
				var created = allData[i].Created;
				// Convert to Date object
				var createdDate = new Date(created);
				// Get year
				var yearCreated = createdDate.getFullYear();

				// Check the current year
				if (yearCreated === today.getFullYear()) {
					// Get Queue column 
					var queue = allData[i].Queue;
					// Get Created month 
					var createdMonth = createdDate.getMonth();
					// Add 1 to the month 
					if (createdMonth < 10) {
						createdMonth += 1;
					}
					// Rename Queue
					arrayQueue.forEach(function (obj) {
						if (queue == obj.queue) {
						//	queue = obj.name;
							// Group queue by monthly 
							for (var m = 1; m <= createdMonth; m++) {
								if (m === createdMonth) {
									if (result[createdMonth] === undefined) {
										result[createdMonth] = [obj.name];
									} else {
										result[createdMonth].push(obj.name);
									}
								}
							}
						}
					});

					

				}
			}

			// Create an array to store each month
			var mappedResult = [];
			var queueArr = [];
			// Array of months 
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

			for (var key in result) {

				var groups = this.groupBy(result[key]);
				// Create Month key and value 
				groups["Month"] = monthName[key];
				// Store groups to new array 
				mappedResult.push(groups);

				// Create dynamic queue 
				result[key].forEach(function (obj) {
					queueArr.push(obj);
				});
			}

			// Create a new object
			var obj = {};
			// Store collection 
			obj.Collection = mappedResult;
			// Create a new json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data to the model
			oModel.setData(obj);
			// Set the model to the view 
			this.getView().setModel(oModel);

			// Get viz frame id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Set the chart title 
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
					colorPalette: ["rgb(88, 153, 218)", "rgb(0, 153, 0)", "rgb(255, 128, 0)",
						"rgb(178, 102, 255)", "rgb(255, 153, 255)", "rgb(0, 255, 255)", "rgb(204, 0, 0)",
						"rgb(255, 255, 0)", "rgb(51, 0, 25)"
					]
				},
				title: {
					text: today.getFullYear()
				}
			});

			// Create unique names
			var uniqueNames = [];
			// Remove duplicate elements 
			$.each(queueArr, function (ind, ele) {
				// Check the element if it is not in array
				if ($.inArray(ele, uniqueNames) === -1 || $.inArray(ele, uniqueNames) === "") {
					// Add to the new array
					uniqueNames.push(ele);
				}
			});
			
			// Create a new array to store data of Measures 
			var measureArr = [];
			// Add name property 
			for (var key in uniqueNames) {
				measureArr.push({
					"name": uniqueNames[key],
					"value": "{" + uniqueNames[key] + "}"
				});
			}
			
			// Create dataset
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Month",
					value: "{Month}"
				}],
				measures: measureArr,
				data: {
					path: "/Collection"
				}
			});

			oVizFrame.setDataset(oDataset);

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": uniqueNames
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Month"]
				});

			// Resolve an issue after second time 	
			oVizFrame.destroyFeeds();

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
		},

		sdfssetAreaMonthly: function () {
			// Check the data label
			this.onShowData();
			// Get Data model 
			var dataModel = this.getOwnerComponent().getModel("Data");
			// Get data 
			var allData = dataModel.getData();
			// Today's date 
			var today = new Date();
			// Define result object 
			var result = {};
			// Get the global model 			
			var arrayQueue = this.getView().getModel("Global").getData().Queue;
			// Iterate through array
			for (var i = 0; i < allData.length; i++) {
				// Select Created dates
				var created = allData[i].Created;
				// Convert to Date object
				var createdDate = new Date(created);
				// Get year
				var yearCreated = createdDate.getFullYear();

				// Check the current year
				if (yearCreated === today.getFullYear()) {
					// Get Queue column 
					var queue = allData[i].Queue;
					// Rename Queue
					arrayQueue.forEach(function (obj) {
						if (queue == obj.queue) {
							queue = obj.name;
						}
					});

					// Get Created month 
					var createdMonth = createdDate.getMonth();
					// Add 1 to the month 
					if (createdMonth < 10) {
						createdMonth += 1;
					}

					// Group queue by monthly 
					for (var m = 1; m <= createdMonth; m++) {
						if (m === createdMonth) {
							if (result[createdMonth] === undefined) {
								result[createdMonth] = [queue];
							} else {
								result[createdMonth].push(queue);
							}
						}
					}
				}
			}

			// Create an array to store each month
			var mappedResult = [];
			var queueArr = [];
			// Array of months 
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

			for (var key in result) {

				var groups = this.groupBy(result[key]);
				// Create Month key and value 
				groups["Month"] = monthName[key];
				// Store groups to new array 
				mappedResult.push(groups);

				// Create dynamic queue 
				result[key].forEach(function (obj) {
					queueArr.push(obj);
				});
			}

			// Create a new object
			var obj = {};
			// Store collection 
			obj.Collection = mappedResult;
			// Create a new json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set data to the model
			oModel.setData(obj);
			// Set the model to the view 
			this.getView().setModel(oModel);

			// Get viz frame id 
			var oVizFrame = this.getView().byId("idVizFrame");
			// Set the chart title 
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
					colorPalette: ["rgb(88, 153, 218)", "rgb(0, 153, 0)", "rgb(255, 128, 0)",
						"rgb(178, 102, 255)", "rgb(255, 153, 255)", "rgb(0, 255, 255)", "rgb(204, 0, 0)",
						"rgb(255, 255, 0)", "rgb(51, 0, 25)"
					]
				},
				title: {
					text: today.getFullYear()
				}
			});

			// Create unique names
			var uniqueNames = [];
			// Remove duplicate elements 
			$.each(queueArr, function (ind, ele) {
				// Check the element if it is not in array
				if ($.inArray(ele, uniqueNames) === -1 || $.inArray(ele, uniqueNames) === "") {
					// Add to the new array
					uniqueNames.push(ele);
				}
			});
			
			// Create a new array to store data of Measures 
			var measureArr = [];
			// Add name property 
			for (var key in uniqueNames) {
				measureArr.push({
					"name": uniqueNames[key],
					"value": "{" + uniqueNames[key] + "}"
				});
			}
			
			// Create dataset
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Month",
					value: "{Month}"
				}],
				measures: measureArr,
				data: {
					path: "/Collection"
				}
			});

			oVizFrame.setDataset(oDataset);

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": uniqueNames
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Month"]
				});

			// Resolve an issue after second time 	
			oVizFrame.destroyFeeds();

			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
		},

		groupBy: function (list) {
			return list.reduce(function (groups, item) {
				if (groups[item] === undefined) {
					groups[item] = 1;
				} else {
					groups[item] = groups[item] + 1;
				}

				return groups;
			}, {}); // Start with an empty object
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