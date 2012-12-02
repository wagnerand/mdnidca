/*
 * MDN IDCA - a Firefox Extension
 */

if (!mdnidca) {
    var mdnidca = {

        prefs : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mdnidca."),

        init : function () { 
			var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
            	.getService(Components.interfaces.nsIWindowMediator);
			var doc = mediator.getMostRecentWindow("navigator:browser").document;
  
			var addonBar = doc.getElementById("addon-bar");
 
			var newItem = doc.createElement("toolbaritem");
			var itemLabel = doc.createElement("image");
 
			newItem.appendChild(itemLabel);
			addonBar.appendChild(newItem);
			itemLabel.src = "https://developer.cdn.mozilla.net/media/img/favicon.ico";

			newItem.onclick = function() {
				gBrowser.selectedTab = gBrowser.addTab("chrome://mdnidca/content/mdnidca.html");
			};
        }
    };
}

window.addEventListener("load", function() { mdnidca.init(); }, false);
