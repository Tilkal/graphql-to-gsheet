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
