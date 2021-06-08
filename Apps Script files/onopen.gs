/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
**/  
 

function onOpen() {
  // Clear clientsecretid of any data if present
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty ('CLIENTSECRET');
  ClearCells("Searchbybatch");
  ClearCells("Customerreviews");
  ClearCells("WeeklyReport");


  //Create a custom Menu
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Tilkal Menu')
      .addItem('Get data for a specific batch', 'bybatch')
      .addItem('Read customer reviews', 'reviews')
      .addItem('Get Report', 'weeklyreport')
      .addItem('Clear All Data', 'cleardata')
      .addToUi();
}


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
    
  var url = "https://"+ clientname + "." + networkname + ".tilkal.com/v2/graphql"
     
      
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
    sheet.getRange('B13:N1000').clearContent();
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
  
  // If clientsecret is absent, check if clientid is present. If yes, just ask only for clientsecret 
  var clientid =scriptProperties.getProperty('CLIENTID');
  if (clientid) {
    var ui = SpreadsheetApp.getUi();
    var clientsecret = ui.prompt("Please Enter your client secret").getResponseText()
    scriptProperties.setProperty('CLIENTSECRET', clientsecret);
    return }

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

function awssearchbybatch(){
  /*
  This is the main function for the search by batch feature. It:
  1. First clears up the search by batch page of old data
  2. Asks the user for the batch id
  3. Calls on the batchdetails function to get details about batch
  4. Based on the batchdetails (ex: if batch has 3 GTINs of 120, 2157 and 4 purchase orders or displayidentifiers), it displays the purchase orders by each GTIN on a different column  
  */
  
  // Get the 'Searchbybatch' sheet
  var sheetname = 'Searchbybatch'
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetname);
  ClearCells('Searchbybatch')
  
  
  // Get user input. Ask the batch number
  var ui = SpreadsheetApp.getUi();
  var batch = ui.prompt("Please Enter batch number").getResponseText();
  var stats = batchdetails(batch);
  var idcount = stats.idcount;
  var identifiers = stats.identifiers;
        
     
  //Repeat on loop for each GTIN
  for (var m=0; m<idcount; ++m) {
    // Create a query to get all the POs related to this particular identifier
    var query = `
        {
          assets(
            filter: {
              rowId: { equalTo: "${identifiers[m]}"}
              type: { equalTo: "Lot" }
            }
          ) {
            nodes {
              biztransactions {
                nodes {
                  displayId
                }
              }
            }
          }
        }`
       
         response = sendpostrequest(query);
         var json = response.getContentText();
         var data = JSON.parse(json);
         
  parsebatchquery(data, batch, identifiers[m], m)
       }
}
  

function batchdetails(batch){
  /* This function gets all the details realted to a batch id. The batch id is passed as a parameter to this function. 
  We calculate and return:
  idcount: the number of identifier or GTINs related to this batch
  bizcounts: an array of number of purchase orders for each GTIN
  identifiers: an array of GTINs
  */
  
  var query = `
  {
  assets(
    filter: { displayId: { equalTo: "${batch}"  }, type: { equalTo: "Lot" } }
  ) {
    totalCount
    nodes {
      rowId
      biztransactions {
        totalCount
      }
    }
  }
}
`
  
  const response = sendpostrequest(query);
  const data = JSON.parse(response.getContentText());
  const idcount = data["data"]["assets"]["totalCount"]  // Get the total number of GTINs with this batch number
  const identifiers = data["data"]["assets"]["nodes"].map((asset) => asset["rowId"])
  return {idcount, identifiers}
}


function parsebatchquery(result, batch, identifier, idnum) {  
  /* Display the results on the spreadsheet
  result : parsed JSON response
  batch : batch # entered by client
  identifier : the GTIN identifier 
  idnum : the order of the identifier - 1st identifier, 2nd identifier etc
  startingrow : the row at which the display should start
  */
  
  var firstrow = 11
  //Set the title rows as 'BOLD'
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var Searchbybatch = ss.getSheetByName("Searchbybatch");
  var cell = Searchbybatch.getRange(1,1,1,100);
  cell.setFontWeight("bold");
  var cell = Searchbybatch.getRange(2,1,1,1);
  cell.setFontWeight("bold");
  var cell = Searchbybatch.getRange(4,1,1,1);
  cell.setFontWeight("bold");
  
  //Set the Column name(s)
  var rng = Searchbybatch.getRange(8, 3, 1, 1)
  rng.setValue("BatchID")
  var rng = Searchbybatch.getRange(9, 3, 1, 1)
  rng.setValue(batch);
  var rng = Searchbybatch.getRange(firstrow, idnum+2, 1, 1)
  rng.setValue("Identifier");
  var rng = Searchbybatch.getRange(firstrow+1, idnum+2, 1, 1)
  rng.setValue(identifier);
  var rng = Searchbybatch.getRange(firstrow+2, idnum+2, 1, 1)
  rng.setValue("Purchase Order(s)")
  
  //Get each individual purchase order

  var biztxs = result["data"]["assets"]["nodes"][0]["biztransactions"]["nodes"]

  //Loop through each purchase order and display the results
  for (var j = 0, lenj = biztxs.length; j < lenj; ++j) {
    var displayid = biztxs[j]["displayId"]
    var rng = Searchbybatch.getRange(14 + j, idnum + 2, 1, 1)
    rng.setValue(displayid)
}
}
          
// @ts-nocheck
function getreport() {
  /*
  This is the main function for the weeklyreport sheet. 
  */
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheetname = ss.getSheetByName("WeeklyReport")
  ClearCells("WeeklyReport")
  // Set starting row and columns here
  var startingrow = 13
  var startingcolumn = 2

  // Get the Start and End dates and the period/gapchoice (daily, weekly etc) from the sheet
  var dates = sheetname.getRange(9, 4, 1, 3).getValues()
  var FinalEndDate = new Date(dates[0][1])
  var FinalStartDate = new Date(dates[0][0])
  var gapchoice = dates[0][2]
  if (gapchoice == 'Monthly') { var gap = 30 }
  if (gapchoice == 'Weekly') { var gap = 7 }
  if (gapchoice == 'Every 3 days') { var gap = 3 }
  if (gapchoice == 'Every 2 days') { var gap = 2 }
  if (gapchoice == 'Daily') { var gap = 1 }

  // Calculate the number of time periods or number of rows, based on start date, end date and gapchoice
  var numberofloops = Math.floor((FinalEndDate.getTime() - FinalStartDate.getTime()) / (1000 * 60 * 60 * 24 * gap))


  // Calculate the start and end dates for each row, call all the query functions and fill in the respective columns
  for (var i = 0; i < numberofloops + 1; ++i) {
    var EndDate = new Date(FinalStartDate)
    var StartDate = new Date(FinalStartDate)
    if (i == numberofloops) {
      // In case we are on the last row, the end date should match the end date entered by user and not overshoot it
      EndDate = new Date(FinalEndDate)
      StartDate.setDate(StartDate.getDate() + (gap * i))
    }
    else {
      // We calculate the start and end dates for each row (except the last row)
      EndDate.setDate(EndDate.getDate() + (gap * (i + 1)))
      StartDate.setDate(StartDate.getDate() + (gap * i))
    }

    //Set the dates on row i+startingrow on googlesheets
    var rng = sheetname.getRange(i + startingrow, startingcolumn, 1, 1)
    rng.setValue(Utilities.formatDate(StartDate, "GMT+2", "dd/MM/yyyy"))
    var rng = sheetname.getRange(i + startingrow, startingcolumn + 1, 1, 1)
    rng.setValue(Utilities.formatDate(EndDate, "GMT+2", "dd/MM/yyyy"))

    // Convert to UTC format to pass into graphql query
    StartDate = `"${String(Utilities.formatDate(StartDate, "GMT+2", "yyyy-MM-dd'T'HH:mm:ss'+'HH:mm"))}"`
    EndDate = `"${String(Utilities.formatDate(EndDate, "GMT+2", "yyyy-MM-dd'T'HH:mm:ss'+'HH:mm"))}"`

    // Create the query, send a POST request with the query, send the response to parseweeklyreport
    // Send in the parameters to the query function to generate a new query
    var query = MegaQuery(StartDate, EndDate)
    parseweeklyreportsquery(query, i, startingrow, startingcolumn)

  }
}

function MegaQuery(startDate, endDate) {
  var query = `
  {
  ShippingEventsCount: 
  events(
    filter: {
      stepIdentifier: { equalTo: "shipping" }
      eventTime: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
  }){
    totalCount
  }
  ReceivingEventsCount: events(
    filter: {
      stepIdentifier: { equalTo: "receiving" }
      eventTime: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
    }
  ) {
    totalCount
  }
  EcommerceSessionsCount: sessions(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: true
    }
  ) {
    totalCount
  }
    EcommerceSessionsWithComment:sessionsWithComment(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: true
    }
  ) {
    totalCount
  }
  EcommerceSessionsWithRating:sessionsWithRating(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: true
    }
  ) {
    totalCount
  }
  AllEcommerceSessionWithRatings:sessionsWithRating(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: true
    }
  ) {
    nodes {
      answers {
        nodes {
          rating
        }
      }
    }
  }
  BiztxsWithSessions: biztransactions(
    filter: { sessionBiztransactionLinksExist: true }
  ) {
    totalCount
    edges {
      node {
        sessions(
          filter: {
            createdAt: {
              greaterThanOrEqualTo: ${startDate}
              lessThanOrEqualTo: ${endDate}
            }
          }
        ) {
          totalCount
        }
      }
    }
  }
 InStoreSessionsCount: sessions(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: false
    }
  ) {
    totalCount
  }
    InStoreSessionsWithComment:sessionsWithComment(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: false
    }
  ) {
    totalCount
  }
  InStoreSessionsWithRating:sessionsWithRating(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: false
    }
  ) {
    totalCount
  }
  AllInStoreSessionWithRatings:sessionsWithRating(
    filter: {
      createdAt: {
        greaterThanOrEqualTo: ${startDate}
        lessThanOrEqualTo: ${endDate}
      }
      sessionBiztransactionLinksExist: false
    }
  ) {
    nodes {
      answers {
        nodes {
          rating
        }
      }
    }
  }
}  
`
  return query
}

function parseweeklyreportsquery(query, row, startingrow, startingcolumn) {
  /*
    This function accepts the query (query), column name (type), the serial number of the data (row), the offset for row (startingrow), the offset for column (startingcolumn).
    It passes the query to the postrequest function. The response is then parsed as a JSON object. And it extracts the required value and prints it onto the sheet.
  */

  // Send query to postrequest
  var response = sendpostrequest(query)
  //var data = response  //We should remove this line when the mock test is over
  // Parse the JSON response
  var json = response.getContentText()
  var data = JSON.parse(json)

  //Get the spreadsheet Weeklyreport
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheetname = ss.getSheetByName("WeeklyReport")


  var ShippingEventsCount = data["data"]["ShippingEventsCount"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 2, 1, 1)
  rng.setValue(ShippingEventsCount)

  var ReceivingEventsCount = data["data"]["ReceivingEventsCount"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 3, 1, 1)
  rng.setValue(ReceivingEventsCount)

  var EcommerceSessionsCount = data["data"]["EcommerceSessionsCount"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 4, 1, 1)
  rng.setValue(EcommerceSessionsCount)

  var EcommerceSessionsWithComment = data["data"]["EcommerceSessionsWithComment"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 5, 1, 1)
  rng.setValue(EcommerceSessionsWithComment)

  var EcommerceSessionsWithRating = data["data"]["EcommerceSessionsWithRating"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 6, 1, 1)
  rng.setValue(EcommerceSessionsWithRating)

  if (EcommerceSessionsWithRating == 0) {
    var rng = sheetname.getRange(startingrow + row, startingcolumn + 7, 1, 1)
    rng.setValue(0)
  }
  else {
    const reducer = (accumulator, currentValue) => {
      if (currentValue["answers"]["nodes"][0] != null) {
        return accumulator + currentValue["answers"]["nodes"][0]["rating"]
      }
      if (currentValue["answers"]["nodes"][1] != null) {
        return accumulator + currentValue["answers"]["nodes"][1]["rating"]
      }
      return accumulator
    }
    const sumRatings = data["data"]["AllEcommerceSessionWithRatings"]["nodes"].reduce(reducer, 0)
    var rng = sheetname.getRange(startingrow + row, startingcolumn + 7, 1, 1)
    rng.setValue(sumRatings / EcommerceSessionsWithRating)
  }

  var Biztxs = data["data"]["BiztxsWithSessions"]
  if (Biztxs["totalCount"] === 0) {
    var rng = sheetname.getRange(startingrow + row, startingcolumn + 8, 1, 1)
    rng.setValue(0)
  }
  else {
    var total = 0
    var clickedbiztx = 0
    for (var j = 0; j < Biztxs["totalCount"]; ++j) {
      const count = Biztxs["edges"][j]["node"]["sessions"]["totalCount"]
      if (count === 0) { }
      else {
        clickedbiztx++
        total += count
      }
    }
    var average = 0
    if (total !== 0 && clickedbiztx !== 0) {
      average = total / clickedbiztx
      var rng = sheetname.getRange(startingrow + row, startingcolumn + 8, 1, 1)
      rng.setValue(average)
    }
    else {
      var rng = sheetname.getRange(startingrow + row, startingcolumn + 8, 1, 1)
      rng.setValue(0)
    }
  }

  var InStoreSessionsCount = data["data"]["InStoreSessionsCount"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 9, 1, 1)
  rng.setValue(InStoreSessionsCount)

  var InStoreSessionsWithComment = data["data"]["InStoreSessionsWithComment"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 10, 1, 1)
  rng.setValue(InStoreSessionsWithComment)

  var InStoreSessionsWithRating = data["data"]["InStoreSessionsWithRating"]["totalCount"]
  var rng = sheetname.getRange(startingrow + row, startingcolumn + 11, 1, 1)
  rng.setValue(InStoreSessionsWithRating)

  if (InStoreSessionsWithRating == 0) {
    var rng = sheetname.getRange(startingrow + row, startingcolumn + 12, 1, 1)
    rng.setValue(0)
  }
  else {
    const reducer = (accumulator, currentValue) => {
      if (currentValue["answers"]["nodes"][0] != null) {
        return accumulator + currentValue["answers"]["nodes"][0]["rating"]
      }
      if (currentValue["answers"]["nodes"][1] != null) {
        return accumulator + currentValue["answers"]["nodes"][1]["rating"]
      }
      return accumulator
    }
    const sumRatings = data["data"]["AllInStoreSessionWithRatings"]["nodes"].reduce(reducer, 0)
    var rng = sheetname.getRange(startingrow + row, startingcolumn + 12, 1, 1)
    rng.setValue(sumRatings / InStoreSessionsWithRating)
  }
}


function awssearchreviews() {
  /*
  This is the main function to call for the customer reviews sheet. 
  This function calls the reviewsquery function to create the required query and then passes the query to the parsereviewsquery function to parse the response and display on the google sheet.
  */
  var query = `
  {
  answers (orderBy: CREATED_AT_ASC){
    nodes {
      comment
      rating
      createdAt
    }
  }
}
`
parsereviewsquery(query);
}

function parsereviewsquery(query){
  /* 
  This function takes in the passed parameter which is the graphql query and sends it to the sendpostrequest function.
  Once the response is obtained, it parses it and then displays it on the google sheet.
  */
  
  var response = sendpostrequest(query);  
    
  // Parse the JSON reply
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  // The data is a JSON object of the form {"data"{"answers"{"edges":[{"node}...]}
  var result = data["data"]["answers"]["nodes"];
  
  //Get the sheetname
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var reviewssheet = ss.getSheetByName("Customerreviews");
  
  //Set starting row and column
  var startingrow = 9
  var startingcolumn = 2
  
  for (var i = 0, leni = result.length; i < leni; ++i) {
    var comment = result[i]["comment"];
    var rating = result[i]["rating"];
    var date = result[i]["createdAt"];
    
    var rng = reviewssheet.getRange(i+startingrow, startingcolumn, 1, 1)
    rng.setValue(comment);
    var rng = reviewssheet.getRange(i+startingrow, 1+startingcolumn, 1, 1)
    rng.setValue(rating);
    var rng = reviewssheet.getRange(i+startingrow, 2+startingcolumn, 1, 1)
    rng.setValue(date);
    }
   }
