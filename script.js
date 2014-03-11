var CurrencyTable = {};
var counter = 0;
var userCountry, currencyRate, currencyName, getLocalCurrency, selectedCurrency, localStoredCurrency;

$(document).ready(init);

function init() {    
       
      chrome.runtime.sendMessage({method: "getLocalCurrency"}, function(response) {
      
      getLocalCurrency    = response.localCurrency;
      selectedCurrency    = JSON.parse(localStorage.getItem('SelectedCurrency'));
      localStoredCurrency = JSON.parse(localStorage.getItem('AutoCurrency'));
      
      if(localStoredCurrency === null){
          
            var xhr = new XMLHttpRequest();
            xhr.open("GET", chrome.extension.getURL("/config_resources/countries.json"), true);    
            xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {       
                CurrencyTable = JSON.parse(xhr.responseText);         
              }
            }
            xhr.send(); 
            getEnvatoUser($("#user_username").html().toLowerCase());
          
      } else {
        
         var localStoredRate     = JSON.parse(localStorage.getItem('rate'));
         var curTimestamp        = new Date();            
          
              if(localStoredRate !=null && localStoredRate.expires > curTimestamp.getTime()){
                currencyRate = localStoredRate.value;
                  
                 if(getLocalCurrency !="AUTO" && getLocalCurrency != null){
                     if((getLocalCurrency != selectedCurrency)){
                         getCurrencyRate(getLocalCurrency);
                         localStorage.setItem('SelectedCurrency', JSON.stringify(getLocalCurrency));
                         currencyName = getLocalCurrency;
                     }else{
                         currencyName = getLocalCurrency;
                         appendLocalCurrency();
                     }
                 }else {                        
                        if(selectedCurrency != "AUTO" && getLocalCurrency != null){
                            currencyName = localStoredCurrency;
                            localStorage.setItem('SelectedCurrency', JSON.stringify("AUTO"));
                            getCurrencyRate(localStoredCurrency);
                        }else {                             
                            currencyName = localStoredCurrency;
                            appendLocalCurrency();                     
                        }                        
                 }              
                
             }else {
                 currencyName = localStoredCurrency;
                 getCurrencyRate(localStoredCurrency);
             }
        }
  });
}


/*
 * Use Envato API to retrieve the user's data
 */
function getEnvatoUser(user) {
	if (user) {        
        $.getJSON("http://marketplace.envato.com/api/v3/user:"+user+".json", parseEnvatoUser);
	}
}

/*
 * Parses the retrieved JSON data to get the user's country
 */
function parseEnvatoUser(data) {
	
	userCountry = data.user.country;
	if (userCountry) {
		userCountry = userCountry.toLowerCase();
	}    

	var code         = CurrencyTable[userCountry];
    var autoCurrency = JSON.stringify(code);
    localStorage.setItem('AutoCurrency', autoCurrency);    
	getCurrencyRate(code);
}

/*
 * Get the rate from Yahoo Finance Xchange
 */
function getCurrencyRate(currencyCode) {

	if (!currencyCode) {
		currencyCode = "EUR";
	}
    
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USD"+currencyCode+"%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=", parseCurrencyRate);
   
}

 /*
  * Parses the response from Yahoo
  */
function parseCurrencyRate(data) {
      var results  = data.query.results;
      currencyRate = results.rate.Rate;      
      
      var expire = new Date();
      expire.setMinutes(expire.getMinutes() + (1440 || 0)); // Set the expiration date of the rate to 1 day
      localStorage.setItem(
        "rate", 
        JSON.stringify({
           value: currencyRate,
           expires: expire.getTime()
        })
     );
    
      currencyName = results.rate.Name;
      var arr = currencyName.split(' ');
      currencyName = arr[2];
	  appendLocalCurrency();
}

/**
  * Append the translated local currency values to the tables and current/total earnings.
  * We also add a section in the sidebar with info about the used currency.
  */
function appendLocalCurrency() {
	$(".earningsVal, .earningsTotal, .user_balance, div.general_table_border + h2.underlined, .fancy-label__sub-title").each(function() {
		var $this = $(this);
		var html = $this.html();
		var dollarIndex = html.indexOf("$");
		if(dollarIndex !== -1) {
			var value = parseFloat(html.substring(dollarIndex+1).replace(",",""));

			// We round off the value to two decimals 
			$this.append(" (" + (parseInt(value*currencyRate*100,10)/100).toFixed(2) + ")");
		}
	}); 

	var currencySection = $('<div class="box--topbar"><h2 style="margin-top:82px;">Local Currency : '+currencyName+'</h2></div>' +
								      '<div class="box--hard-top new-typography">' +								      
								      '$1 = ' + (parseInt(currencyRate*100, 10)/100).toFixed(2) +' '+ currencyName.toLowerCase() +'</div>');

	$(".sidebar-right").prepend(currencySection);
}