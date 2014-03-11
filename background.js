chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {            
    if (request.method == "getLocalCurrency") {              
      sendResponse({localCurrency: localStorage.getItem('envatoLocalCurrency')});
    } else {
      sendResponse({});
    }            
});