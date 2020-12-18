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
  // This function clears cells in the spreadsheet, on sheet specified by the passed value 'sheetname'
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (sheetname == "WeeklyReport"){
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('B13:J1000').clearContent();
  }
  else if (sheetname == "Customerreviews"){
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('B9:D1000').clearContent();
  }
  else if (sheetname == "Searchbybatch"){
    var sheet = ss.getSheetByName(sheetname);
    sheet.getRange('C9').clearContent();
    sheet.getRange('B12:G12').clearContent();
    sheet.getRange('B14:G5000').clearContent();
  }
}


function PromptUserCredentials() {

  // Ask the client for credentials. Set these as script properties that can be accessed by other functions in this app.  
  // These will be deleted and repopulated (by the user) every time this function is run, including every time this Spreadsheet is opened or refreshed.
  var scriptProperties = PropertiesService.getScriptProperties();

  var clientsecret = scriptProperties.getProperty('CLIENTSECRET');
  if (clientsecret) { return }
  // Prompt the user to enter client id and client secret. These are stored as CLIENTID, CLIENTSECRET in File > Project Properties > Script Properties.
  var ui = SpreadsheetApp.getUi();
  var clientname = ui.prompt("Please Enter the actor name").getResponseText();
  var networkname = ui.prompt("Please Enter the network name").getResponseText();
  var clientid = ui.prompt("Please Enter your client id").getResponseText();
  var clientsecret = ui.prompt("Please Enter your client secret").getResponseText();
  
  scriptProperties.setProperty('CLIENTNAME', clientname);
  scriptProperties.setProperty('NETWORKNAME', networkname)
  scriptProperties.setProperty('CLIENTID', clientid);
  scriptProperties.setProperty('CLIENTSECRET', clientsecret);
}


function bybatch() {
  // This function calls the awsserachbybatch function
  PromptUserCredentials()
  awssearchbybatch();
}


function weeklyreport() {
 // This function calls the generateweeklyreport function
  PromptUserCredentials()
  getreport();
}  

function reviews() {
 // This function calls the awssearchreviews function
  PromptUserCredentials()
  awssearchreviews();
}

function cleardata() {
 // This function calls the ClearCells function
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  ClearCells("Searchbybatch");
  ClearCells("Customerreviews");
  ClearCells("WeeklyReport");
}
