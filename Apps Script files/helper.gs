function ClearCells(sheetname) {
  // This function clears cells in the spreadsheet, on sheet dpecified by the passed value 'sheetname'
  if (sheetname == "WeeklyReport"){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('B13:J1000').clearContent();
  }
  else if (sheetname == "Customerreviews"){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('B9:D1000').clearContent();
  }
  else if (sheetname == "Searchbybatch"){
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('C9').clearContent();
    sheet.getRange('B12:G12').clearContent();
    sheet.getRange('B14:G5000').clearContent();
  }
  
  else {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetname);
  sheet.getRange('A1:H5000').clearContent();
  }
}



function thisweek() {
  // This function calls the awsquery function with zero offset since it's the immediate past week
  awsqueryweek(0);
}

function lastweek() {
  // This function calls the awsquery function with offset=1 since it's the week before the immediate past week
  awsqueryweek(1);
} 

function customdates() {
  // This function calls the awsquerycustomdates function 
  awsquerycustomdates();
}  

function bybatch() {
  // This function calls the awsserachbybatch function
  ClearCells("Searchbybatch")
  awssearchbybatch();
}

function scanssearch() {
 // This function calls the awssearchscans function
  awssearchscans();
}

function weeklyreport() {
 // This function calls the generateweeklyreport function
  ClearCells("WeeklyReport")
  getreport();
}  

function reviews() {
 // This function calls the ClearCells and awssearchreviews function
  ClearCells("Customerreviews") 
  awssearchreviews();
}

function cleardata() {
 // This function deletes all the Script Properties and calls the ClearCells function
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties(); 
  ClearCells("Searchbybatch");
  ClearCells("Customerreviews");
  ClearCells("WeeklyReport");
}
