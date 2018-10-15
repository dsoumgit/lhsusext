/* global moment:true */

sap.ui.define([
	"lhsusext/controller/BaseController",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (BaseController, ChartFormatter, Format) {
	"use strict";

	return BaseController.extend("lhsusext.controller.PointQuarterly", {
		onInit: function () {
			this.bus = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView())).getEventBus();

			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var sName = oEvent.getParameter("name");

			if (sName === "pointQuarterly") {
				// Call method
					this.setPointQuarterly();

			//	this.setPointMonthly();
			}
		},

	
		setPointQuarterly: function () {
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
			// Get Monthly Points 
			var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Calculate Monthly Points quarterly multiplying by 3 
			var monthlyPointsQuarterly = monthlyPoints * 3;
			// Set title to the chart 
			idVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"],
					referenceLine: {
						line: {
							valueAxis: [{
								value: monthlyPointsQuarterly,
								visible: true,
								size: 3,
								type: "solid",
								color: "#FF0000",
								label: {
									text: "Points Allowed: " + monthlyPointsQuarterly,
									visible: false
								}
							}]
						}
					}
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

			// Get year
		//	var sustainStartYear = startDateObj.getFullYear();
			/** Note: The start date from the Global file is between 0 - 11
			 */

			var currentMonth = new Date().getMonth();
			if (currentMonth < 12) {
				currentMonth += 1;
			}

			// Get the start date from AllData array
			//	var startDate = moment(startDateObj, "M/D/YYYY");
		//	var sortedRecords = allData.sort(function (a, b) {
		//		return (a["Close Time"] && moment(a["Close Time"], "M/D/YY H:mm").unix()) - (b["Close Time"] && moment(b["Close Time"],
		//			"M/D/YY H:mm").unix());
		//	});
			
			// Date format 
			var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "MM/dd/yyyy"});
			// Sort Close Time date 
			var sortedRecords = allData.sort(function (a, b) {
				return (oDateFormat.format(new Date(a["Close Time"])) - oDateFormat.format(new Date(b["Close Time"])));
			});	

			var startYear = moment(sortedRecords.find(function (record) {
				return record["Close Time"];
			})["Close Time"], "M/D/YY H:mm").format("YYYY");
			
			// Year format 
			/*var yearFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy"});
			// Get start year
			var startYear = moment(sortedRecords.find(function (record) {
				return yearFormat.format(new Date(record["Close Time"]));		
			}));
			
			console.log(startYear);*/
			
		//	var endYear = moment(sortedRecords[sortedRecords.length - 1]["Close Time"], "M/D/YY H:mm").format("YYYY");
	//		var endYear = yearFormat.format(sortedRecords[sortedRecords.length - 1]["Close Time"]);
	//	console.log(endYear);	
			
			// Convert start year to integer type
			var startYearInt = parseInt(startYear, 10);
			// Convert start year to integer type
		//	var endYearInt = parseInt(endYear, 10);

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
				if (startQuarter <= curQuarter) {
					for (var s = startQuarter; s <= curQuarter; s++) {
						if (s === curQuarter) {
							if (currentMonth % 3 === 0) {
								arrClosed.push({
									Quarter: s,
									Key: "Q" + s,
									SDMPoints: sdmPoints * 3,
									TotalPoints: 0
								});
							} else {
								arrClosed.push({
									Quarter: s,
									Key: "Q" + s,
									SDMPoints: sdmPoints * (currentMonth % 3),
									TotalPoints: 0
								});
							}
						} else {
							arrClosed.push({
								Quarter: s,
								Key: "Q" + s,
								SDMPoints: sdmPoints * 3,
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
									SDMPoints: sdmPoints,
									TotalPoints: 0
								});
							} else {
								arrClosed.push({
									Quarter: j,
									Key: "Q" + j,
									SDMPoints: sdmPoints * (currentMonth % 3),
									TotalPoints: 0
								});
							}
						} else {
							arrClosed.push({
								Quarter: j,
								Key: "Q" + j,
								SDMPoints: sdmPoints * 3,
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
								SDMPoints: sdmPoints * 3,
								TotalPoints: 0
							});
						} else {
							arrClosed.push({
								Quarter: j,
								Key: "Q" + j,
								SDMPoints: sdmPoints * (currentMonth % 3),
								TotalPoints: 0
							});
						}
					} else {
						arrClosed.push({
							Quarter: j,
							Key: "Q" + j,
							SDMPoints: sdmPoints * 3,
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
			// obj.CurrentYear = currentYear;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set binding mode
			oModel.setDefaultBindingMode("OneWay");
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);
			// Variable to store the total points 
			var totalPoints = 0;
			// Create a new array 
			var newArr = [];
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
					newArr.push(obj);

				}
			});

			// Get SDM Points from global file 
			//		var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get Monthly Points 
			//		var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Calculate Monthly Points quarterly multiplying by 3 
			//		var monthlyPointsQuarterly = monthlyPoints * 3;
			// Calculate Reveal SDM points multiplying by 3 
			var revealSDMQuarterly = sdmPoints * 3;
			var grandTotal = totalPoints + revealSDMQuarterly;
			var rolloverPoints = grandTotal - monthlyPointsQuarterly;
			// Create a new object 
			var newObj = {};
			newObj.DataCollection = newArr;
			newObj.SelectedYear = currentYear;
			newObj.CurrentQuarter = currentQuarter;
			newObj.TotalPoints = totalPoints;
			newObj.RevealSDM = revealSDMQuarterly;
			newObj.GrandTotal = grandTotal;
			newObj.MonthlyPoints = monthlyPointsQuarterly;
			newObj.RolloverPoints = Math.abs(rolloverPoints);
			
			/**
			 * Default the selected key on Quarter drop down 
			 */
			// Get id from Quarter drop down 
			var comboQuarter = this.getView().byId("comboQuarter");
			comboQuarter.setSelectedKey([curQuarter]);
			
			// Create a model
			var reportModel = new sap.ui.model.json.JSONModel(newObj);
			// Set size limit
			reportModel.setSizeLimit(9999999999);
			// Set model to the view
			this.getView().setModel(reportModel, "ReportModel");
		},
		
		handleSelectionChange: function (oEvent) {
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
				var selectedYear = this.getView().byId("idSelectedYear").getText();
			
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
				
				// Create a new array 
			//	var output = [];
				// Variable to store the total points 
			//	var totalPoints = 0;
				// Iterate through array and check the matching selected keys 
				/*newArr.filter(function (item) {
					// Close Time column 
					var ct = new Date(item["Close Time"]);
					var q = moment(ct).utc().quarter();
					// Check each quarter from the selected keys 
					selectedKeys.forEach(function (obj) {
						// Convert to int type 
						var quarterInt = parseInt(obj, 10);
						// Check each quarter if exists 
						if (quarterInt === q) {
							// Sum the points 
							totalPoints += item.Points;
							// Store elements to new array 
							output.push(item);
						}
					});
				});*/

				// Get SDM Points from global file 
				var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
				// Calculate Reveal SDM points multiplying by 3 
				var revealSDMQuarterly = smdPoints * 3;
				// Get Monthly Points 
				var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
				// Calculate Monthly Points quarterly multiplying by 3 
				var monthlyPointsQuarterly = monthlyPoints * 3;
				var grandTotal = totalPoints + revealSDMQuarterly;
				var rolloverPoints = grandTotal - monthlyPointsQuarterly;
				// Create a new object
				var obj = {};
				// Store as a collection
				//	obj.Collection = arrClosed;
				obj.DataCollection = output;
				obj.SelectedYear = selectedYear;
				obj.TotalPoints = totalPoints;
				obj.RevealSDM = revealSDMQuarterly;
				obj.GrandTotal = grandTotal;
				obj.MonthlyPoints = monthlyPointsQuarterly;
				obj.RolloverPoints = Math.abs(rolloverPoints);

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
		
		// Function on selected key 
		handleSelectionFinish: function (oEvent) {
			// Hide busy indicator
			sap.ui.core.BusyIndicator.show();
			// Get selected quarters
			var selectedKeys = oEvent.getSource().getSelectedKeys();
			// simulate delayed end of operation
			jQuery.sap.delayedCall(2000, this, function () {
				// Create a new array 
				var newArr = [];
				// Get Data model 
				var dataModel = this.getOwnerComponent().getModel("Data");
				// Get data 
				var allData = dataModel.getData().AllData;

				// Get id from selected year 
				var selectedYear = this.getView().byId("idSelectedYear").getText();
				//	console.log(typeof selectedYear);
				// Iterate through array 
				allData.forEach(function (obj) {
					// Close Time column 
					var closeTimeDate = new Date(obj["Close Time"]);
					// State column
					var closedState = obj.State;

					if (closedState === "closed successful" && parseInt(selectedYear) === closeTimeDate.getFullYear()) {
						// Store each element to a new array 
						newArr.push(obj);
					}
				});

				// Create a new array 
				var output = [];
				// Variable to store the total points 
				var totalPoints = 0;
				// Iterate through array and check the matching selected keys 
				newArr.filter(function (item) {
					// Close Time column 
					var ct = new Date(item["Close Time"]);
					var q = moment(ct).utc().quarter();
					// Check each quarter from the selected keys 
					selectedKeys.forEach(function (obj) {
						// Convert to int type 
						var quarterInt = parseInt(obj, 10);
						// Check each quarter if exists 
						if (quarterInt === q) {
							// Sum the points 
							totalPoints += item.Points;
							// Store elements to new array 
							output.push(item);
						}
					});
				});

				// Get SDM Points from global file 
				var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
				// Calculate Reveal SDM points multiplying by 3 
				var revealSDMQuarterly = smdPoints * 3;
				// Get Monthly Points 
				var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
				// Calculate Monthly Points quarterly multiplying by 3 
				var monthlyPointsQuarterly = monthlyPoints * 3;
				var grandTotal = totalPoints + revealSDMQuarterly;
				var rolloverPoints = grandTotal - monthlyPointsQuarterly;
				// Create a new object
				var obj = {};
				// Store as a collection
				//	obj.Collection = arrClosed;
				obj.DataCollection = output;
				obj.SelectedYear = selectedYear;
				obj.TotalPoints = totalPoints;
				obj.RevealSDM = revealSDMQuarterly;
				obj.GrandTotal = grandTotal;
				obj.MonthlyPoints = monthlyPointsQuarterly;
				obj.RolloverPoints = Math.abs(rolloverPoints);

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
			// Get Monthly Points 
			var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Calculate Monthly Points quarterly multiplying by 3 
			var monthlyPointsQuarterly = monthlyPoints * 3;
			// Set title to the chart 
			idVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						showTotal: true
					},
					colorPalette: ["rgb(88, 153, 218)", "rgb(232, 116, 59)"],
					referenceLine: {
						line: {
							valueAxis: [{
								value: monthlyPointsQuarterly,
								visible: true,
								size: 3,
								type: "solid",
								color: "#FF0000",
								label: {
									text: "Points Allowed: " + monthlyPointsQuarterly,
									visible: false
								}
							}]
						}
					}
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

			i = 0;
			// Iterate through array
			for (i = 0; i < allData.length; i++) {

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
					// Get month 
					var monthClosed = closeDate.getMonth();
					// Add 1 to start from 1 - 12 
					if (monthClosed < 12) {
						monthClosed += 1;
					}

					arrClosed.forEach(function (obj) {
						// Get month
						var month = obj.Month;
						if (month === monthClosed) {
							// Get points 
							obj.TotalPoints += allData[i].Points;
						}
					});
				}
			}

			var x = 0;
			var sum = 0;
			var output = [];
			
			for (var j = 0; j < arrClosed.length; j++) {
				//  console.log(arr[i]);
				if (x === 3) {
					output.push(sum);
					sum = 0;
					x = 0;
				}
				
				sum += arrClosed[j].TotalPoints;
				x++;
			}
			// Store the sum in a new array 
			output.push(sum);
			
			var result = [];
			for (var key in output) {
				result.push({
					"Quarter": key,
					"TotalPoints": output[key]
				});
			}
			
			// Add SDM points object to every element 
			result.forEach(function (obj) {
				obj.SDMPoints = smdPoints * 3;
			});
			
			// Create a new object
			var obj = {};
			// Store as a collection
			obj.Collection = result;

			// Create a model
			var oModel = new sap.ui.model.json.JSONModel();
			// Set binding mode
			oModel.setDefaultBindingMode("OneWay");
			// Set collection to the model
			oModel.setData(obj);
			// Set model to the view
			this.getView().setModel(oModel);
			
			// Variable to store the total points 
			var sumPoints = 0;
			// Create a new array 
			var newArr = [];
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
					sumPoints += obj.Points;
					newArr.push(obj);

				}
			});

			// Get SDM Points from global file 
			//		var smdPoints = this.getView().getModel("Global").getData().SDMPoints;
			// Get Monthly Points 
			//		var monthlyPoints = this.getView().getModel("Global").getData().MonthlyPoints;
			// Calculate Monthly Points quarterly multiplying by 3 
			//		var monthlyPointsQuarterly = monthlyPoints * 3;
			// Calculate Reveal SDM points multiplying by 3 
			var revealSDMQuarterly = smdPoints * 3;
			var newObj = {};
			newObj.DataCollection = newArr;
			newObj.SelectedYear = currentYear;
			newObj.CurrentQuarter = currentQuarter;
			newObj.TotalPoints = sumPoints;
			newObj.RevealSDM = revealSDMQuarterly;
			newObj.GrandTotal = sumPoints + revealSDMQuarterly;
			newObj.MonthlyPoints = monthlyPointsQuarterly;
			newObj.RolloverPoints = Math.abs(sumPoints - monthlyPointsQuarterly);

			// Create a model
			var reportModel = new sap.ui.model.json.JSONModel(newObj);
			// Set size limit
			reportModel.setSizeLimit(9999999999);
			// Set model to the view
			this.getView().setModel(reportModel, "ReportModel");
		},
		
		// Back to home page
		onHomePress: function () {
			this.getRouter().navTo("master");
		}
	});
});