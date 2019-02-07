chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == 'mes918x83x2!');

    port.onMessage.addListener(function(msg) {
        // make sure message is from content script
        if (msg.url != null && msg.content == 'urlToOpen') {
        const urlAsStr = msg.url.toString();

            // if the link is a self reference, don't open it
            if (urlAsStr[urlAsStr.length-1] == '#') {
                return;
            }
            
            chrome.storage.sync.get(['disabledSites'], function(items) {
                const currentBaseUrl = window.location.host;
                const disabledSitesArr = items['disabledSites'] != undefined ? items['disabledSites'] : [];

                if(disabledSitesArr.includes(currentBaseUrl)) {
                    return;
                }

                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    window.open(msg.url);
                    chrome.tabs.update(tabs[0].id, {selected: true});
                });
            });
        }
    });
});