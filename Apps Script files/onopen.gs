/**
 * Creates a custom menu in Google Sheets when the spreadsheet opens.
**/  
 

function onOpen() {
  // Clear all sheets of any data if present
  cleardata();

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

function awssearchreviews() {
  /*
  This is the main function to call for the customer reviews sheet. 
  This function calls the reviewsquery function to create the required query and then passes the query to the parsereviewsquery function to parse the response and display on the google sheet.
  */
  query = reviewsquery();
  parsereviewsquery(query);
}


function reviewsquery() {
  var columnvalues= "{answers{edges{node{comment rating createdAt}}}}";
  Logger.log(columnvalues);
  return columnvalues
}


function parsereviewsquery(query){
  /* 
  This function takes in the passed parameter which is the graphql query and sends it to the sendpostrequest function.
  Once the response is obtained, it parses it and then displays it on the google sheet.
  */
  
  response = sendpostrequest(query);  
  //Logger.log(response); //Uncomment this line if you want to log the http response
  
  // Parse the JSON reply
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  // The data is a JSON object of the form {"data"{"answers"{"edges":[{"node}...]}
  var result = data["data"]["answers"]["edges"];
  
  //Get the sheetname
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var reviewssheet = ss.getSheetByName("Customerreviews");
  
  //Set starting row and column
  startingrow = 9
  startingcolumn = 2
  
  for (var i = 0, leni = result.length; i < leni; ++i) {
    var data = result[i].node;
    var headerRow = Object.keys(data);
    Logger.log("header row is" + headerRow);
    // define an array of all the object values
    
    Object.keys(data).forEach(function(key, j) {
      var value = data[key];
      var rng = reviewssheet.getRange(i+startingrow, j+startingcolumn, 1, 1)
      rng.setValue(value);
    })
   }
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
  
  
  // Get user input. Ask the batch number
  var ui = SpreadsheetApp.getUi();
  var batch = ui.prompt("Please Enter batch number").getResponseText();
  var stats = batchdetails(batch);
  var idcount = stats.idcount;
  var bizcountsarray = stats.bizcounts; 
  var identifiers = stats.identifiers;
          
          
  //Repeat on loop for each GTIN
  for (var m=0; m<idcount; ++m) {
       // Calculate number of offsets required for each identifier because
       // GraphQL returns only the first 1000. In order to get all the results, we need to keep offsetting our query.   
       // For. e.g. if there are 2157, the number of offsets will be 3 (0-1000, 1000-2000, 2000-2157).
       
       offset = parseInt(bizcountsarray[m]/1000)+1;
       //Logger.log(offset). //Uncomment this line if you want to see the number of offsets for each GTIN 
       
       for (var n=0; n<offset; ++n) {
         var query = createbybatchquery(identifiers[m], 1000*n);
         var response = sendpostrequest(query);
         var json = response.getContentText();
         var data = JSON.parse(json);
         var result = data["data"]["assets"]["edges"];
         parsebatchquery(result, batch, identifiers[m], m, (n*1000 + 2))
       }
  }
  //Logger.log(idcount); //Uncomment this line if you want to log which GTIN count we are on 1, 2, 3 ...
  //Logger.log(bizcountsarray); //Uncomment this line if you want to log the count of this purchase order or displayidentifiers 
}


function batchdetails(batch){
  /* This function gets all the details realted to a batch id. The batch id is passed as a parameter to this function. 
  We calculate and return:
  idcount: the number of identifier or GTINs related to this batch
  bizcounts: an array of number of purchase orders for each GTIN
  identifiers: an array of GTINs
  */
  batch = '"' + batch + '"';
  var columnvalues = "{assets(search:" + batch + "){count edges{node{identifier biztransactions{count}}}}}";
  Logger.log(columnvalues)
  var response = sendpostrequest(columnvalues);
  var idcount = JSON.parse(response.getContentText())["data"]["assets"]["count"];
  var bizcounts = []
  var identifiers = []
  for (var m=0; m<idcount; ++m) {
    bizcounts[m] = JSON.parse(response.getContentText())["data"]["assets"]["edges"][m].node["biztransactions"]["count"]
    identifiers[m] = JSON.parse(response.getContentText())["data"]["assets"]["edges"][m].node["identifier"]
  }
  return {idcount, bizcounts, identifiers}
}


function parsebatchquery(result, batch, identifier, idnum, startingrow) {  
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
  var biztransactions=result[0].node["biztransactions"]["edges"];
  Logger.log("Number of nodes is" + biztransactions.length);
  //Loop through each purchase order and display the results
  for (var j = 0, lenj = biztransactions.length; j < lenj; ++j) {
    var node = biztransactions[j].node
    var headerRow = Object.keys(node);
    
    // define an array of all the object values
    var row = headerRow.map(function(key){ return node[key]});
        
    // Write all the values in the key:value pairs inside the last "node"
    for (var k=0, lenk=row.length; k<lenk;++k) {
      var rng = Searchbybatch.getRange(startingrow + j+firstrow+1, idnum + 2, 1, 1)
      rng.setValue(row[k])
    }
}
}
          
function createbybatchquery(identifier, offset) {
  // Create the GraphQL query that requests the details of the assets based on identifier (GTIN)
  identifier = '"' + identifier + '"';
  var columnvalues = "{assets(search:" + identifier + "){edges{node{identifier displayIdentifier biztransactions(first:1000, offset:"+offset+"){edges {node {displayIdentifier}}}}}}}";
  Logger.log(columnvalues);
  return columnvalues
}

function getreport() {
  /*
  This is the main function for the weeklyreport sheet. 
  */
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetname = ss.getSheetByName("WeeklyReport");
  
  // Set starting row and columns here
  var startingrow = 13
  var startingcolumn = 2
  
  // Get the Start and End dates and the period/gapchoice (daily, weekly etc) from the sheet
  var dates = sheetname.getRange(9, 4, 1, 3).getValues();
  var FinalEndDate = new Date(dates[0][1]);
  var FinalStartDate = new Date(dates[0][0]);
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
    var EndDate = new Date(FinalStartDate);
    var StartDate = new Date(FinalStartDate);
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
    var query = timeboundtypescountquery(StartDate, EndDate,"shipping");
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

    /*parseweeklyreportsquery(
      averageRepeatedClicksQuery(StartDate, EndDate), 
      'averageRepetedClicks',
      i, 
      startingrow, 
      startingcolumn)*/
  }
}

function timeboundtypescountquery(StartDate, EndDate, type) {
  // This function creates the query to count the number of shipping events and number of receiving events. Type = "shipping"/"receiving" between start and end dates
  var columnvalues=  "{events(query:{STEP:{operator: IN, value: [" + '"' + type + '"' + "]}, RECORDEDAT:{operator: BETWEEN, value: ["+ StartDate+ "," + EndDate + "]}}){count}}";
  return columnvalues
}

function timeboundscanscountquery(StartDate, EndDate) {
  // This function creates the query to count the number of scans between start and end dates
  var columnvalues= "{sessions(query:{CREATEDAT:{operator: BETWEEN, value: ["+ StartDate+ "," + EndDate + "]}}){count}}";
  Logger.log(columnvalues)
  return columnvalues
}

function timeboundreviewscountquery(StartDate, EndDate){
  // This function creates the query to count the number of reviews between start and end dates
  var columnvalues = "{sessions(query:{CREATEDAT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} COMMENT: { operator: IS_NOT_NULL }}){count}}" 
  //Logger.log(columnvalues); // Uncomment this if you want to log the query
  return columnvalues
}

function timeboundratingscountquery(StartDate, EndDate) {
  // This function creates the query to count the number of ratings between start and end dates
  var columnvalues = "{sessions(query:{CREATEDAT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} RATING: { operator: IS_NOT_NULL }}){count}}" 
  return columnvalues
}

function timeboundaverageratingsquery(StartDate, EndDate) {
  // This function creates the query to access the ratings
  var columnvalues = "{sessions(query:{CREATEDAT:{operator: BETWEEN  value:[" + StartDate + "," + EndDate + "]} RATING: { operator: IS_NOT_NULL }}){count edges {node{answers{count edges{node{rating}}}}}}}" 
  return columnvalues
}

const averageRepeatedClicksQuery = (startDate, endDate) => {
  return `
  {
    biztransactions {
      edges {
        node {
          sessions(
            query: {
              CREATEDAT: {
                operator: BETWEEN
                value: [${startDate}, ${endDate}]
              }
            }
          ) { count }
        }
      }
    }
  }`
}

function parseweeklyreportsquery(query, type, row, startingrow, startingcolumn){
  /*
    This function accepts the query (query), column name (type), the serial number of the data (row), the offset for row (startingrow), the offset for column (startingcolumn).
    It passes the query to the postrequest function. The response is then parsed as a JSON object. And it extracts the required value and prints it onto the sheet.
  */
  
  // Send query to postrequest
  Logger.log(query)
  var response = sendpostrequest(query);  
  
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

 if(type === 'averageRepetedClicks') {
  const biztransactions = data["data"]["biztransactions"]["edges"]
  if(!Array.isArray(biztransactions) || biztransactions.length === 0) { return undefined }

  var clickedBiztx = 0
  var total = 0
  biztransactions.forEach(
    (biztransaction) => {
      const count = biztransaction["node"]["sessions"]["count"]
      if(count === 0) { return }
      clickedBiztx ++
      return total += count
   })

  var average = 0  
  if(total !== 0 && clickedBiztx !== 0) { 
    average = total / clickedBiztx
  }

  var rng = sheetname.getRange(startingrow+row, startingcolumn+8, 1, 1)    
  rng.setValue(average)
 }
}
