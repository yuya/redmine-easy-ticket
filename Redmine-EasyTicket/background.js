var onRequest;onRequest=function(a,b,c){return chrome.pageAction.show(b.tab.id),c({})},chrome.extension.onRequest.addListener(onRequest);
