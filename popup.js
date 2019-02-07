 'use strict';

const errorRed = "#E74C3C";
const successGreen = "#2ECC71";
const normalStateGrey = "#6C757D";

const setElementBackgroundColor = (elementId, color) => {
  document.getElementById(elementId).style.backgroundColor = color;
}

const getBaseURL = (fullURL) => {
  // var urlBeginning = fullURL.match("^https") == undefined ? "http://" : "https://";
  return fullURL.replace(/(http(s)?:\/\/)|(\/.*){1}/g, '');
}

const setFirstRowEmpyTable = (table) => {
  var row = table.insertRow(0);
  var noDisabledSitesCell = row.insertCell(0);
  noDisabledSitesCell.innerHTML = "No disabled sites!";
}

const updateMaxLinkNum = () => {
  const numMaxLinks = document.getElementById("maxLinkInput").value;

  if ( !Number.isInteger(parseInt(numMaxLinks)) ) {
    document.getElementById("maxLinkError").innerHTML = "<i class='fas fa-exclamation-triangle'></i> Oops! Please enter an integer.";
    return;
  } else if (numMaxLinks < 0) {
    document.getElementById("maxLinkError").innerHTML = "<i class='fas fa-exclamation-triangle'></i> Oops! Please enter a positive integer.";
    return;
  }
  document.getElementById("maxLinkError").innerHTML = "";

  // update max link number via chrome storage api
  chrome.storage.sync.set({ "maxLinks" : numMaxLinks }, function() {
    if (chrome.runtime.error) {
      setElementBackgroundColor("maxLinkSave", errorRed);
    } else {
      setElementBackgroundColor("maxLinkSave", successGreen);
    }

    setTimeout(function(){
      setElementBackgroundColor("maxLinkSave", normalStateGrey);
    }, 1000);
  });
}

const addDisabledSite = () => {
  const disabledSitesTable = document.getElementById("disbled-site-table-body");
  var disabledSiteUrl = document.getElementById("disabledSitesInput").value.trim();
  disabledSiteUrl = getBaseURL(disabledSiteUrl);

  alert("base url: " + disabledSiteUrl);

  if(disabledSiteUrl.length == 0 || disabledSiteUrl.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g) == null) {
    document.getElementById("disabledSitesError").innerHTML = "<i class='fas fa-exclamation-triangle'></i> Oops! That isn't a valid URL.";
    return;
  }

  chrome.storage.sync.get(['disabledSites'], function(items) {
    const disabledSitesArr = items['disabledSites'] != undefined ? items['disabledSites'] : [];

    if (disabledSitesArr.includes(disabledSiteUrl)) {
      document.getElementById("disabledSitesError").innerHTML = "<i class='fas fa-exclamation-triangle'></i> Oops! URL already exists.";
      return;
    } else {
      document.getElementById("disabledSitesError").innerHTML = "";
      disabledSitesArr.push(disabledSiteUrl);
    }

    chrome.storage.sync.set({ "disabledSites" : disabledSitesArr }, function() { 
      if (chrome.runtime.error) {
        setElementBackgroundColor("disabledSitesSave", errorRed);
        return;
      }

      var rowIdx = disabledSitesTable.rows.length;
      if ( rowIdx == 1 && disabledSitesTable.rows[0].innerText == "No disabled sites!") {
        disabledSitesTable.deleteRow(0);
        rowIdx--;
      }
      
      // Insert new row into table 
      var row = disabledSitesTable.insertRow(rowIdx);
      row.setAttribute("id", rowIdx);
      // Create two cells for the new row
      var urlCell = row.insertCell(0);
      var deleteCell = row.insertCell(1);
      // Set the two cell values 
      urlCell.innerHTML = disabledSiteUrl;
      deleteCell.innerHTML = '<i class="fas fa-trash-alt">';
      deleteCell.setAttribute("id", "deleteDisabledSite");
      setElementBackgroundColor("disabledSitesSave", successGreen);

      setTimeout(function(){
        setElementBackgroundColor("disabledSitesSave", normalStateGrey);
      }, 1000);
    });
  });
}

const deleteDisabledSite = (element) => {
  var rowToDelete = $(element).parent();
  if (rowToDelete.is("td")) {
    // rowToDelete sometimes references a td element - in that case, get the tr
    rowToDelete = rowToDelete.parent();
  }

  chrome.storage.sync.get(['disabledSites'], function(items) {
    const disabledSitesTable = document.getElementById("disbled-site-table-body");
    rowToDelete.remove();

    if (disabledSitesTable.rows.length < 1) {
      // set empty row for no URLs entered
      setFirstRowEmpyTable(disabledSitesTable);
    }

    var url = rowToDelete.find(">:first-child")[0].innerHTML;
    const disabledSitesArr = items['disabledSites'];
    for (var i = 0; i < disabledSitesArr.length; i++) {
      if (disabledSitesArr[i] == url) {
        // remove url from disabledSitesArr
        disabledSitesArr.splice(i, 1);
        break;
      }
    }

    // update disabledSitesArr in chrome storage
    chrome.storage.sync.set({ "disabledSites" : disabledSitesArr }, function() {
      if (chrome.runtime.error) {
        document.getElementById("disabledSitesError").innerHTML = "<i class='fas fa-exclamation-triangle'></i> Something went wrong. Please try again.";
      } else {
        document.getElementById("disabledSitesError").innerHTML = "";
      }
    });
  });
}

// register 3 click functions for popup
// $(document).on('click', '#maxLinkSave', function () {
//   updateMaxLinkNum();
// });

// $(document).on('click', '#disabledSitesSave', function () {
//   addDisabledSite();
// });

// $(document).on('click', '#deleteDisabledSite', function () {
//   deleteDisabledSite(this);
// });

// $('document').ready(function() {
//   chrome.storage.sync.get(['disabledSites', 'maxLinks'], function(items) {
//     // get and set the max link value in popup window
//     const numMaxLinks = items['maxLinks'] != undefined ? items['maxLinks'] : 0;
//     document.getElementById("maxLinkInput").value = numMaxLinks;

//     // get list of disabled sites and store those in table
//     const nonLinkedSites = items['disabledSites'] != undefined ? items['disabledSites'] : [];
//     var disabledSitesTable = document.getElementById("disbled-site-table-body");

//     if ( nonLinkedSites.length < 1 ) {
//       // set empty row for no URLs entered
//       setFirstRowEmpyTable(disabledSitesTable);
//     } else {
//       for ( var i=0; i < nonLinkedSites.length; i++ ) {
//         // insert new row into table 
//         var row = disabledSitesTable.insertRow(i);
//         // create two cells for the new row
//         var urlCell = row.insertCell(0);
//         var deleteCell = row.insertCell(1);
//         // set the two cell values 
//         urlCell.innerHTML = nonLinkedSites[i];
//         deleteCell.innerHTML = '<i id="deleteDisabledSite" class="fas fa-trash-alt"></i>';
//       }
//     }
//   });

//   // enable tooltips on site
//   $(function () {
//     $( '[data-toggle="tooltip"]' ).tooltip()
//   });
// });