jQuery.sap.declare("lhsusext.util.formatter");

jQuery.sap.require("sap.ui.core.format.NumberFormat");

lhsusext.util.formatter = {
	//Skeleton for formatter
	numFormat: function(oNumber) {
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits: 3,
			groupingEnabled: true,
			groupingSeparator: ",",
			decimalSeparator: "."
		}); //Returns a NumberFormat instance for float
		return oNumberFormat.format(oNumber);
	},

	formatNum: function(oNumber) {
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits: 1,
			groupingEnabled: true,
			groupingSeparator: ",",
			decimalSeparator: "."
		}); //Returns a NumberFormat instance for float
		return oNumberFormat.format(oNumber);
	},

	formatValue: function(oValue) {
		if (isNaN(oValue) || oValue < 0) {
			return "Error";
		} else if (oValue > 0 || oValue === 0) {
			return "Good";
		}
	},

	formatIndicator: function(oIndicator) {
		if (isNaN(oIndicator) || oIndicator < 0) {
			return "Down";
		} else if (oIndicator > 0) {
			return "Up";
		}
	},

	formatMonth: function(obj) {
		// Convert string to int 
		var oMonth = parseInt(obj, 10);
		var month;
		if (oMonth === 0) {
			month = "JAN";
		} else if (oMonth === 1) {
			month = "FEB";
		} else if (oMonth === 2) {
			month = "MAR";
		} else if (oMonth === 3) {
			month = "APR";
		} else if (oMonth === 4) {
			month = "MAY";
		} else if (oMonth === 5) {
			month = "JUN";
		} else if (oMonth === 6) {
			month = "JUL";
		} else if (oMonth === 7) {
			month = "AUG";
		} else if (oMonth === 8) {
			month = "SEP";
		} else if (oMonth === 9) {
			month = "OCT";
		} else if (oMonth === 10) {
			month = "NOV";
		} else if (oMonth === 11) {
			month = "DEC";
		}

		return month;
	},

	getSDMPoint: function(oPoint) {
		// Get SDM point 
		var sdmPoint = oPoint[0].SDM;
		return sdmPoint;
	},

	getMonthlyPoint: function(oPoint) {
		// Get monthly point 
		var monthlyPoint = oPoint[0].MonthlyPoints;
		return monthlyPoint;
	},

	getClosedRequest: function(oPoint) {
		// Get Closed Requests 
		var closedRequest = oPoint[0].ClosedRequests;
		return closedRequest;
	},

	getInnovation: function(oPoint) {
		// Get Innovation Points 
		var innoPoints = oPoint[0].Innovation;
		return innoPoints;
	},

	getTotalPoint: function(oPoint) {
		// Get Total Points 
		var totalPoints = oPoint[0].TotalPoints;
		// Get Monthly Points 
		var monthlyPoints = oPoint[0].MonthlyPoints;
		// Create a total point variable 
		var overage, rolloverPoints;
		// Check the value 
		if (totalPoints > monthlyPoints) {
			// Calculate the average by substracting the monthly points with total points
			overage = monthlyPoints - totalPoints;

			return overage;
		}

		if (totalPoints < monthlyPoints) {
			// Calculate the roll over points 
			rolloverPoints = monthlyPoints - totalPoints;
			
			return rolloverPoints; 
		}
	},
	
	getPointColor: function(oPoint) {
		// Get Total Points 
		var totalPoints = oPoint[0].TotalPoints;
		// Get Monthly Points 
		var monthlyPoints = oPoint[0].MonthlyPoints;
		// Create a total point variable 
		var overage, rolloverPoints;
	//	console.log(totalPoints);
		// Check the value 
		if (totalPoints > monthlyPoints) {
			// Calculate the average by substracting the monthly points with total points
			overage = monthlyPoints - totalPoints;

			return "Error";
		}

		if (totalPoints < monthlyPoints) {
			// Calculate the roll over points 
			rolloverPoints = monthlyPoints - totalPoints;

			return "Good"; 
		}
	},
	
	getResult: function (oPoint) {
		// Get Total Points 
		var totalPoints = oPoint[0].TotalPoints;
		// Get Monthly Points 
		var monthlyPoints = oPoint[0].MonthlyPoints;
		
		return Math.abs(totalPoints - monthlyPoints); 
	}
};