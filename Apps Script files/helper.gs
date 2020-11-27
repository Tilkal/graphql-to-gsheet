function awscognito(){
  /* 
   This function requests for the aws cognito token, using client credentials
  */
  // Declare client id and client secret as strings and converting them to Base 64 
  // Get client credentials which are stored as Script properties in Project properties
  var clientname = PropertiesService.getScriptProperties().getProperty('CLIENTNAME');
  var networkname = PropertiesService.getScriptProperties().getProperty('NETWORKNAME');
  var clientid = PropertiesService.getScriptProperties().getProperty('CLIENTID');
  var clientsecret = PropertiesService.getScriptProperties().getProperty('CLIENTSECRET');
  var v = clientid + ':' + clientsecret;
  var encoded = "Basic "+ Utilities.base64Encode(v, Utilities.Charset.UTF_8);
  
  // Declare the specified url to go to
  var url = "https://tilkal-" + clientname + "-" + networkname + ".auth.eu-central-1.amazoncognito.com/oauth2/token";
  
  // Declare the options to be specified in the POST request
  var data = {
    "grant_type": "client_credentials",
    "client_id": clientid, 
    "scope": networkname + "-"+ clientname + "/user"
  };
  var headers = {"Authorization" : encoded};
  var options = { 
    "method" : "POST",
    "contentType" : "application/x-www-form-urlencoded",
    "headers": headers,
    "payload": data,
  };
  var results = UrlFetchApp.fetch(url, options);
  var state = results.getContentText();
  var t = JSON.parse(state)
  //Logger.log(t.access_token); // Uncomment this if you want to see the token in the logs
  return(t.access_token);
}

function sendpostrequest(query) {
  /* This function calls on the GRAPHQL playground with a query (passed as a parameter) and uses the HTTP POST request to make a request.
     Details of the URL is obtained from client credentials which is obtained upon opening sheet and is stored (for the duration of the session) as Script Properties (File > Project properties > Script properties) 
  */
  //Obtain token from aws cognito by calling the awscognito function
  var token = String(awscognito());
  
  //Make a query with the obtained token 
  var clientname = PropertiesService.getScriptProperties().getProperty('CLIENTNAME');
  var networkname = PropertiesService.getScriptProperties().getProperty('NETWORKNAME');
  var url = "https://"+ clientname + "." + networkname + ".tilkal.com/graphql"
      
  //Logger.log(query) //Uncomment this line if you would like to log the query that you send
  var options = { 
    "method" : "POST",
    "headers": {"Content-Type" : "application/json","Authorization" : " Bearer " + token},
    "payload": JSON.stringify({"query":query}),
  };
  response= UrlFetchApp.fetch(url, options); 
  
  return response;
}



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
