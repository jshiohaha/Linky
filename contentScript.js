'use strict';

var port = chrome.runtime.connect({name: 'mes918x83x2!'});

var blockFromPreviousScriptLoad = false;
const GOOGLE_BASE_URL = "google.com";

const getBaseURL = (url) => {
    var urlSplitByPeriod = url.split(".");
    if (urlSplitByPeriod[0] == "www") {
        return urlSplitByPeriod.splice(1).join();
    }
    return url;
};

chrome.storage.sync.get(['disabledSites', 'maxLinks'], function(items) {
    const currentBaseUrl = getBaseURL(window.location.host);
    const documentLinks = document.querySelectorAll('a');

    var maxLinks = items['maxLinks'] != undefined ? parseInt(items['maxLinks']) : 0;
    var disabledSitesArr = items['disabledSites'] != undefined ? items['disabledSites'] : [];

    alert("current equla google: " + (currentBaseUrl == GOOGLE_BASE_URL));
    alert(blockFromPreviousScriptLoad);

    if (blockFromPreviousScriptLoad || maxLinks != 0 || currentBaseUrl == GOOGLE_BASE_URL || disabledSitesArr.includes(currentBaseUrl)) {
        alert("penetrated");
        blockFromPreviousScriptLoad = true;
        if (documentLinks.length > maxLinks) {
            // clean-up resources by closing the open port instance
            port.disconnect();
            return;
        }
    }

    setTimeout(function(){ 
        for( var i = 0; i < documentLinks.length; i++ ) {
            if (!documentLinks[i].href[documentLinks[i].href.length-1] !== '#') {
                $( documentLinks[i] ).attr('name', documentLinks[i].href);
    
                documentLinks[i].removeAttribute('href');
                documentLinks[i].onmouseover = function () {
                    this.style.cursor = 'pointer';
                }
    
                documentLinks[i].addEventListener("click", function(self) {
                    port.postMessage({content: 'urlToOpen', url: self.path[0].name });
                });
            }
        }
    },2000);
});