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
