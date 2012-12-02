/*
 * MDN IDCA - a Firefox Extension
 */

if (!mdnidca) {
    var mdnidca = {

        interfacesList : [],

        init : function() {
        },

        fetchFromMXR : function() {
            var fetchSpinner = document.getElementById("fetchStatusImage");
            fetchSpinner.src = "img/loading.gif";

            mdnidca.interfacesList = [];
            var tableBody = document.getElementById("tableBody");
            if (tableBody !== null) {
                tableBody.parentNode.removeChild(tableBody);
            }

            var req = new XMLHttpRequest();
            req.open("GET", "https://mxr.mozilla.org/mozilla-central/find?text=&string=%28\.idl%29|%28\.webidl%29&regexp=1");
            //req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
            req.onreadystatechange = function() {

                if(req.readyState == 4) {
                    if (req.status == 200) {
                        var response = req.responseText;
                        var regex = /\/[\w-/]+((\.idl)|(\.webidl))/g;
                        var result;
                        tableBody = document.createElement("tbody");
                        tableBody.id = "tableBody";
                        var tableElem = document.getElementById("tableList");
                        tableElem.appendChild(tableBody);

                        while ((result = regex.exec(response)) !== null) {
                            var idxStart = result[0].lastIndexOf("/");
                            var idxEnd = result[0].lastIndexOf(".");
                            var interfacee = {
                                name : result[0].substring(idxStart + 1, idxEnd),
                                path : result[0]
                            }

							if (interfacee.path.search(/\/tests{0,1}\//) > -1) {
								continue;
							}

                            mdnidca.interfacesList.push(interfacee);

                            // status column
                            var colStatus = document.createElement("td");
                            colStatus.id = "colStatus_" + interfacee.path;

                            // name column
                            var colName = document.createElement("td");
                            colName.textContent = interfacee.name;

                            // MXR links
                            var linkMXR = document.createElement("a");
                            linkMXR.href = "https://mxr.mozilla.org/mozilla-central" + interfacee.path;
                            linkMXR.textContent = "[MXR]";
                            linkMXR.setAttribute("title", interfacee.path);
                            linkMXR.target = "_blank";
                            linkMXR.classList.add("actionItem");

                            // action column
                            var colAtion = document.createElement("td");
                            colAtion.id = "colAction_" + interfacee.path;
                            colAtion.appendChild(linkMXR);

                            // color even/odd rows
                            var rowInterface = document.createElement("tr");
                            if (mdnidca.interfacesList.length % 2 == 0) {
                                rowInterface.classList.add("even");
                            } else {
                                rowInterface.classList.add("odd");
                            }

                            // append elements to DOM
                            rowInterface.appendChild(colStatus);
                            rowInterface.appendChild(colName);
                            rowInterface.appendChild(colAtion);
                            tableBody.appendChild(rowInterface);
                        }
                        document.getElementById("total").textContent = mdnidca.interfacesList.length;
                        fetchSpinner.src = "img/yes.png";
                    }
                }
            }
            req.send();
        },

        checkOnMDN : function() {
            if (mdnidca.interfacesList.length == 0) {
                alert("Fetch from MXR first!");
                return;
            }

            var checkSpinner = document.getElementById("checkStatusImage");
            checkSpinner.src = "img/loading.gif";

            var one = 0;
            var zero = 0;
            var unknown = 0;

            mdnidca.interfacesList.forEach(function(interfacee) {
                var statusImage = document.getElementById("colStatus_" + interfacee.path);
                statusImage.classList.add("loading");

                var req = new XMLHttpRequest();
                var lookupUrl;
				if (interfacee.name.search(/^nsIDOMSVG.*Element$/i) == 0) {
					lookupUrl = "https://developer.mozilla.org/en-US/docs/SVG/Element/" + interfacee.name.match(/(?:nsIDOM)(.*)(?:Element$)/i,'')[1];
				} else if (interfacee.name.search(/^nsIDOM/i) == 0) {
					lookupUrl = "https://developer.mozilla.org/en-US/docs/DOM/" + interfacee.name.replace(/^nsIDOM/i,'');
				} else if (interfacee.path.search("/dom/") > -1) {
                    lookupUrl = "https://developer.mozilla.org/en-US/docs/DOM/" + interfacee.name;
				} else if (interfacee.name.search(/^extI/i) == 0) {
					lookupUrl = "https://developer.mozilla.org/en-US/docs/Toolkit_API/" + interfacee.name;
				} else if (interfacee.name.search(/^fuelI/i) == 0) {
					lookupUrl = "https://developer.mozilla.org/en-US/docs/Toolkit_API/FUEL/" + interfacee.name;
                } else {
                    lookupUrl = "https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/" + interfacee.name;
                }
                req.open("HEAD", lookupUrl + "$json");
                //req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.onreadystatechange = function() {

                    if(req.readyState == 4) {
                        statusImage.classList.remove("loading");

                        var linkMDN = document.createElement("a");
                        linkMDN.href = lookupUrl;
                        linkMDN.textContent = "[MDN]";
                        linkMDN.setAttribute("title", interfacee.name);
                        linkMDN.target = "_blank";
                        linkMDN.classList.add("actionItem");

                        if (req.status == 404) {
                            zero++;
                            interfacee.status = "0";
                            statusImage.classList.add("missing");
                            document.getElementById("zero").textContent = zero;
                        } else if (req.status == 200) {
                            one++;
                            interfacee.status = "1";
                            statusImage.classList.add("found");
                            document.getElementById("one").textContent = one;
                        } else {
                            unknown++;
                        }
                        document.getElementById("colAction_" + interfacee.path).appendChild(linkMDN);

                        if ((one + zero + unknown) == mdnidca.interfacesList.length) {
                            checkSpinner.src = "img/yes.png";
                        }
                    }
                }
                req.send();
            });
        }

    };
}

window.addEventListener("load", function() { mdnidca.init(); }, false);
