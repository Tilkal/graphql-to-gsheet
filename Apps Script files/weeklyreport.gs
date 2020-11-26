function getreport() {
  /*
  This is the main function for the weeklyreport sheet. 
  */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetname = ss.getSheetByName("WeeklyReport");
  
  // Set starting row and columns here
  startingrow = 13
  startingcolumn = 2
  
  // Get the Start and End dates and the period/gapchoice (daily, weekly etc) from the sheet
  var dates = sheetname.getRange(9, 4, 1, 3).getValues();
  FinalEndDate = new Date(dates[0][1]);
  FinalStartDate = new Date(dates[0][0]);
  var gapchoice = dates[0][2]
  if (gapchoice == 'Monthly'){var gap = 30}
  if (gapchoice == 'Weekly'){var gap = 7}
  if (gapchoice == 'Every 3 days'){var gap = 3}
  if (gapchoice == 'Every 2 days'){var gap = 2}
  if (gapchoice == 'Daily'){var gap = 1}
  
  // Calculate the number of time periods or number of rows, based on start date, end date and gapchoice
  var numberofloops = Math.floor((FinalEndDate.getTime() - FinalStartDate.getTime())/(1000 * 60 * 60 * 24 * gap))
  
  
  // Calculate the start and end dates for each row, call all the query functions and fill in the respective columns
  for (var i = 0; i < numberofloops+1; ++i) {
    EndDate = new Date(FinalStartDate);
    StartDate = new Date(FinalStartDate);
     if (i== numberofloops){
       // In case we are on the last row, the end date should match the end date entered by user and not overshoot it
       EndDate = new Date(FinalEndDate);
       StartDate.setDate(StartDate.getDate() + (gap*i));
     }
    else {
      // We calculate the start and end dates for each row (except the last row)
      EndDate.setDate(EndDate.getDate() + (gap*(i+1)));
      StartDate.setDate(StartDate.getDate() + (gap*i));
    }
    
    //Set the dates on row i+startingrow on googlesheets
    var rng = sheetname.getRange(i+startingrow, startingcolumn, 1, 1);
    rng.setValue(Utilities.formatDate(StartDate, "GMT+2", "dd/MM/yyyy"))
    var rng = sheetname.getRange(i+startingrow, startingcolumn+1, 1, 1);
    rng.setValue(Utilities.formatDate(EndDate, "GMT+2", "dd/MM/yyyy"))
    
    // Convert to UTC format to pass into graphql query
    StartDate = '"' + String(Utilities.formatDate(StartDate, "GMT+2", "yyyy-MM-dd'T'HH:mm:ss'Z'")) + '"';
    EndDate = '"' + String(Utilities.formatDate(EndDate, "GMT+2", "yyyy-MM-dd'T'HH:mm:ss'Z'")) + '"';
    
    // Send in the parameters to the query function to generate a new query
    query = timeboundtypescountquery(StartDate, EndDate,"shipping");
    parseweeklyreportsquery(query,"shipping", i, startingrow, startingcolumn);
    query = timeboundtypescountquery(StartDate, EndDate,"receiving");
    parseweeklyreportsquery(query, "receiving", i, startingrow, startingcolumn)
    query = timeboundscanscountquery(StartDate, EndDate);
    parseweeklyreportsquery(query, "scan", i, startingrow, startingcolumn)
    query = timeboundreviewscountquery(StartDate, EndDate);
    parseweeklyreportsquery(query, "reviews", i, startingrow, startingcolumn)
    query = timeboundratingscountquery(StartDate, EndDate);
    parseweeklyreportsquery(query, "ratings", i, startingrow, startingcolumn)
    query = timeboundaverageratingsquery(StartDate, EndDate);
    parseweeklyreportsquery(query, "averageratings", i, startingrow, startingcolumn)
    }
}




function timeboundtypescountquery(StartDate, EndDate, type) {
  // This function creates the query to count the number of shipping events and number of receiving events. Type = "shipping"/"receiving" between start and end dates
  var columnvalues=  "{events(query:{STEP:{operator: IN, value: [" + '"' + type + '"' + "]}, RECORDEDAT:{operator: BETWEEN, value: ["+ StartDate+ "," + EndDate + "]}}){count}}";
  return columnvalues
}

function timeboundscanscountquery(StartDate, EndDate) {
  // This function creates the query to count the number of scans between start and end dates
  var columnvalues= "{sessions(query:{CREATED_AT:{operator: BETWEEN, value: ["+ StartDate+ "," + EndDate + "]}}){count}}";
  return columnvalues
}

function timeboundreviewscountquery(StartDate, EndDate){
  // This function creates the query to count the number of reviews between start and end dates
  var columnvalues = "{sessions(query:{CREATED_AT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} COMMENT: { operator: IS_NOT_NULL }}){count}}" 
  //Logger.log(columnvalues); // Uncomment this if you want to log the query
  return columnvalues
}

function timeboundratingscountquery(StartDate, EndDate) {
  // This function creates the query to count the number of ratings between start and end dates
  var columnvalues = "{sessions(query:{CREATED_AT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} RATING: { operator: IS_NOT_NULL }}){count}}" 
  return columnvalues
}

function timeboundaverageratingsquery(StartDate, EndDate) {
  // This function creates the query to access the ratings
  var columnvalues = "{sessions(query:{CREATED_AT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} RATING: { operator: IS_NOT_NULL }}){count edges {node{answers{count edges{node{rating}}}}}}}" 
  return columnvalues
}



function parseweeklyreportsquery(query, type, row, startingrow, startingcolumn){
  /*
    This function accepts the query (query), column name (type), the serial number of the data (row), the offset for row (startingrow), the offset for column (startingcolumn).
    It passes the query to the postrequest function. The response is then parsed as a JSON object. And it extracts the required value and prints it onto the sheet.
  */
  
  // Send query to postrequest
  response = sendpostrequest(query);  
  
  // Parse the JSON response
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  //Get the spreadsheet Weeklyreport
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetname = ss.getSheetByName("WeeklyReport");
  
  
  //Print shipping data
  if (type == "shipping"){
    var result = data["data"]["events"]["count"];
    var rng = sheetname.getRange(startingrow+row, startingcolumn+2, 1, 1);
    rng.setValue(result)
  }
  
  //Print receiving data
  if (type == "receiving"){
    var result = data["data"]["events"]["count"];
    var rng = sheetname.getRange(startingrow+row, startingcolumn+3, 1, 1);
    rng.setValue(result)
  }
  
  //Print scans data  
  if (type == "scan"){
    var result = data["data"]["sessions"]["count"];
    var rng = sheetname.getRange(startingrow+row, startingcolumn+4, 1, 1)
    rng.setValue(result)
  }
  
  
  //Print reviews count data
  if (type == "reviews"){
    var result = data["data"]["sessions"]["count"];
    var rng = sheetname.getRange(startingrow+row, startingcolumn+5, 1, 1)
    rng.setValue(result)
  }
  
  
  //Print ratings data
  if (type=="ratings"){
    var result = data["data"]["sessions"]["count"];
    var rng = sheetname.getRange(startingrow+row, startingcolumn+6, 1, 1)    
    rng.setValue(result)
    Logger.log("ratings" + result)
  }
  
  //Print Average Ratings data
  if (type == "averageratings"){
    var numberofratings = data["data"]["sessions"]["count"];
    if (numberofratings == 0){
      var rng = sheetname.getRange(startingrow+row, startingcolumn+7, 1, 1)    
      rng.setValue(0)
    }
    else {
      var sumratings = 0
      for (var i = 0; i < numberofratings; ++i){
        var rating = data["data"]["sessions"]["edges"][i].node["answers"]["edges"][0].node["rating"]
        if (rating == null){
          var rating = data["data"]["sessions"]["edges"][i].node["answers"]["edges"][1].node["rating"]
          }
        Logger.log(rating);
        sumratings = sumratings + rating;
      }
      var avgrating = sumratings/numberofratings
      var rng = sheetname.getRange(startingrow+row, startingcolumn+7, 1, 1)    
      rng.setValue(avgrating)
  }
 }
}
