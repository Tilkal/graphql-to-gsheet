function awscognito(){
  
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
