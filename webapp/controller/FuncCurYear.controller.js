sap.ui.define([
	"lhsusext/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("lhsusext.controller.FuncCurYear", {
		onInit: function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("funcCurYear").attachPatternMatched(this._onDetailMatched, this);

			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();
		},

		_onDetailMatched: function(oEvent) {
			// Call method
			this.setAreaMonthly();
		},

		setAreaMonthly: function() {
			var that = this;
			// Get current year
			var curYear = new Date().getFullYear();
			// Set the chart title 
			var idVizFrame = this.getView().byId("idVizFrame");
			// Set title to the chart 
			idVizFrame.setVizProperties({
				title: {
					text: curYear
				}
			});

			// Get the Data model 
			var mainModel = this.getOwnerComponent().getModel("Data");
			// Get the ClientName name
			var name = mainModel.getData().ClientName; 
			// Set the title to the page 
			this.getView().byId("idPage").setTitle(name + " oVo Sustainment");
			// Get data 
			var allData = mainModel.getData().AllData;

			// Create new arrays
			var arrCreated = [];

			// Iterate through array
			for (var i = 0; i < allData.length; i++) {
				// Select Created dates
				var created = allData[i].Created;
				// Convert to Date object
				var createdDate = new Date(created);
				// Get year
				var yearCreated = createdDate.getFullYear();
				// Format date
				var date = createdDate.toLocaleDateString();
				// Get Queue column 
				var queue = allData[i].Queue;
				// Check the current year
				if (yearCreated === curYear) {
					// Create each element
					arrCreated.push({
						FullDate: date,
						Queue: queue
					});
				}
			}
			
			// Get the global model 			
			var globalModel = this.getView().getModel("Global");
			// Get data 
			var global = globalModel.getData();
			
			// Create a new object 
			var inputQueues = {};
			// Iterate through names
			global["Queue"].forEach(function(data) {
				inputQueues[data["queue"]] = data["name"];
			});

			var result = {};

			// Collect queue name for each month
			arrCreated.forEach(function(data) {
				if (inputQueues[data["Queue"]] === undefined) return;

				// Get date 
				var dateObj = new Date(data["FullDate"]);
				// Get month 
				var fullDate = dateObj.getMonth();

				if (result[fullDate] === undefined) {
					result[fullDate] = [inputQueues[data["Queue"]]];
				} else {
					result[fullDate].push(inputQueues[data["Queue"]]);
				}
			});

			// Create an array to store each month
			var mappedResult = [];
			// Array of months 
			var monthName = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
			for (var key in result) {
				var groups = that.groupBy(result[key]);
				groups["Month"] = monthName[key];

				mappedResult.push(groups);
			}

			var obj = {};
			obj.Collection = mappedResult;
			// Create a new json model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set binding mode to One Way
		//	oModel.setDefaultBindingMode("OneWay");
			// Set data to the model
			oModel.setData(obj);
			// Set the model to the view 
			that.getView().setModel(oModel);

			// Get viz frame id 
			var oVizFrame = that.getView().byId("idVizFrame");
			// Get array from Measures 
			var measureArr = global.Queue;
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

			// Create a new array
			var nameArr = [];
			// Add name to a new array
			global.Queue.forEach(function (obj) {
				var name = obj.name;
				nameArr.push(name);
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": nameArr
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

		groupBy: function(list) {
			return list.reduce(function(groups, item) {
				if (groups[item] === undefined) {
					groups[item] = 1;
				} else {
					groups[item] = groups[item] + 1;
				}

				return groups;
			}, {}); // Start with an empty object
		},

		// Back to home page
		onHomePress: function() {
			this.getRouter().navTo("master");
		}
	});
});