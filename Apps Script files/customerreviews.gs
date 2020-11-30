
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


