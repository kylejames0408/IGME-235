// Global Variable
let globalBigString = "";

// Hook up the event to searching on window load
window.onload = (e) => {document.querySelector("#search").onclick = searchButtonClicked};

// Reset the search term
let displayTerm = "";

// Clicking the Search Button
function searchButtonClicked(){
    // Log Action
    console.log("Called the search function.");

    // Grab the API
    const RAM_URL = "https://rickandmortyapi.com/api/character/?"

    // Build up our URL string
    let url = RAM_URL;

    // Parse the user entered term we wish to search
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    // Get rid of any leading and trailing spaces
    term = term.trim();

    // Encode spaces and special characters
    term = encodeURIComponent(term);

    // If there's no term to search then bail out of the function (return does this)
    if (term.length < 1) return;

    // Append the search term to the URL
    url += "name=" + term;

    // Check filter status
    let characterStatus = document.querySelectorAll("input[name='characterStatus']");
    for (let i = 0; i < characterStatus.length; i++) {
        if (characterStatus[i].checked) {
            url += characterStatus[i].value;
        }
    }

    // Update the UI
    document.querySelector("#status").innerHTML = "<img src='../images/portal.gif' alt='Loading' title='loading'>";

    // Log URL
    console.log(url);

    globalBigString = "";
    // Request data!
    getData(url);
}

// Gets the data from the API.
function getData(url){
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload handler
    xhr.onload = dataLoaded;

    // Set the onerror handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET",url);
    xhr.send();
}

function dataLoaded(e){
    // event.target is the xhr object
    let xhr = e.target;

    // xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    if(!obj.results || obj.results.length == 0){
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out
    }

    // Start building an HTML string we will display to the user
    let results = obj.results;
    console.log("results.length = " + results.length);

    // Loop through the array of results
    for (let i=0;i<results.length;i++){
        let result = results[i];

        // Get the URL to the image
        let smallURL = result.image;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // Get the URL to the Page
        let url = result.url;

        // Build a <div> to hold each result
        // ES6 String Templating
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}' />`;
        line += `</div>`;
        
        // Add the <div> to the `bigString` and loop
        globalBigString += line;
    }

    console.log("LOOK HERE\n\n\n\n\n\n\n\n\n\nGBS:" + globalBigString);
    if (obj.info.pages > 1)
    {
        for (let i=0; i<obj.info.pages-1; i++){
            getMoreData(obj.info.next);
        }
    }

    // All done building the HTML - show it to the user!
    setTimeout(function(){
        document.querySelector("#content").innerHTML = globalBigString;
    },50);

    // Update the status
    setTimeout(function(){
        document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + obj.info.count + " results for '" + displayTerm + "'</i></p>";
    },50);
}

// Reports an error while getting data.
function dataError(e){
    // Log the error
    console.log("An error occurred while getting the data.");
}

function getMoreData(url){
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the onload handler
    xhr.onload = moreDataLoaded;

    // Set the onerror handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET",url);
    xhr.send();
}

function moreDataLoaded(e){
    // event.target is the xhr object
    let xhr = e.target;

    // xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    if(!obj.results || obj.results.length == 0){
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out
    }

    // Start building an HTML string we will display to the user
    let results = obj.results;
    console.log("results.length = " + results.length);
    let bigString = "";

    // Loop through the array of results
    for (let i=0;i<results.length;i++){
        let result = results[i];

        // Get the URL to the image
        let smallURL = result.image;
        if (!smallURL) smallURL = "images/no-image-found.png";

        // Get the URL to the Page
        let url = result.url;

        // Build a <div> to hold each result
        // ES6 String Templating
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}' />`;
        line += `</div>`;
        
        // Add the <div> to the `bigString` and loop
        bigString += line;
    }

    // All done building the HTML - show it to the user!
    console.log("LOOK HERE\n\n\n\n\n\n\n\n\n\nGBS:" + globalBigString);
    globalBigString += bigString;
}

function test(){
    // All done building the HTML - show it to the user!
    document.querySelector("#content").innerHTML = globalBigString;
}