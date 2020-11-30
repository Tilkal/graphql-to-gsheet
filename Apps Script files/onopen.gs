/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
**/  
 

function onOpen() {
  // Clear all sheets of any data if present
  cleardata();

  // Ask the client for credentials. Set these as script properties that can be accessed by other functions in this app.  
  // These will be deleted and repopulated (by the user) every time this function is run, including every time this Spreadsheet is opened or refreshed.
  var scriptProperties = PropertiesService.getScriptProperties();
  

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

  //Create a custom Menu
  
  ui.createMenu('Custom Tilkal Menu')
      .addItem('Get data for a specific batch', 'bybatch')
      .addItem('Read customer reviews', 'reviews')
      .addItem('Get Report', 'weeklyreport')
      .addItem('Clear All Data', 'cleardata')
      .addToUi();
}
