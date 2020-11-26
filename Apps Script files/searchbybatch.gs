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
  idcount = stats.idcount;
  bizcountsarray = stats.bizcounts; 
  identifiers = stats.identifiers;
          
          
  //Repeat on loop for each GTIN
  for (var m=0; m<idcount; ++m) {
       // Calculate number of offsets required for each identifier because
       // GraphQL returns only the first 1000. In order to get all the results, we need to keep offsetting our query.   
       // For. e.g. if there are 2157, the number of offsets will be 3 (0-1000, 1000-2000, 2000-2157).
       
       offset = parseInt(bizcountsarray[m]/1000)+1;
       //Logger.log(offset). //Uncomment this line if you want to see the number of offsets for each GTIN 
       
       for (var n=0; n<offset; ++n) {
         var query = createbybatchquery(identifiers[m], 1000*n);
         response = sendpostrequest(query);
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
  response = sendpostrequest(columnvalues);
  idcount = JSON.parse(response.getContentText())["data"]["assets"]["count"];
  bizcounts = []
  identifiers = []
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






