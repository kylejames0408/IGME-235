// Hook up the event to searching on window load
window.onload = (e) => {
    document.querySelector("#search").onclick = searchButtonClicked
    document.querySelector("#prev").onclick = previousPage
    document.querySelector("#next").onclick = nextPage
    document.querySelector("#characterStatusUnfiltered").checked = true

    // Stores user's search information
    const searchField = document.querySelector("#searchterm");
    const prefix = "kcj7751-"; // change 'abc1234' to your banjo id
    const searchKey = prefix + "searchterm"

    // grab the stored data, will return `null` if the user has never been to this page
    const storedSearch = localStorage.getItem(searchKey);

    // if we find a previously set search value, display it
    if (storedSearch){
        searchField.value = storedSearch;
    }else{
        searchField.value = "Rick"; // a default value if `searchField` is not found
    }

    // load up previous result
    searchButtonClicked();

    /* This stuff happens later when the user does something */
    // when the user changes their favorites, update localStorage
    searchField.onchange = e=>{ localStorage.setItem(searchKey, e.target.value); };
};

// Reset the search term
let displayTerm = "";

// Reset page information
let totalPages = 1;
let currentPage = 1;
let previousStatus = "";

// Clicking the Search Button
function searchButtonClicked(){
    // Reset results
    document.querySelector("#content").innerHTML = "<p>No data yet!</p>";

    // Log Action
    // console.log("Called the search function.");

    // Grab the API
    const RAM_URL = "https://rickandmortyapi.com/api/character/?"

    // Build up our URL string
    let url = RAM_URL;

    // Parse the user entered term we wish to search
    let term = document.querySelector("#searchterm").value;

    if(term == ""){
        document.querySelector("#status").innerHTML = "Please type a name in the search field above.";
        return;
    }
    
    // Check if the new term is equivalent to the old term, if not, reset the page number
    if(term != displayTerm){
        // Reset Current Page for new search
        currentPage = 1;
    }

    // Check if the filter is equivalent to the old filter, if not, reset the page number
    let characterStatus = document.querySelectorAll("input[name='characterStatus']");
    for (let i = 0; i < characterStatus.length; i++) {
        if (characterStatus[i].checked) {
            if (characterStatus[i].value != previousStatus){
                currentPage = 1;
            }
        }
    }
    
    // Set the display term
    displayTerm = term;

    // Get rid of any leading and trailing spaces
    term = term.trim();

    // Encode spaces and special characters
    term = encodeURIComponent(term);

    // If there's no term to search then bail out of the function (return does this)
    if (term.length < 1) return;

    // Append the page to the URL
    url += "page=" + currentPage;

    // Append the search term to the URL
    url += "&name=" + term;

    // Check filter status
    for (let i = 0; i < characterStatus.length; i++) {
        if (characterStatus[i].checked) {
            url += characterStatus[i].value;
            previousStatus = characterStatus[i].value;
        }
    }

    // Update the UI
    document.querySelector("#status").innerHTML = "<img src='images/portal.gif' alt='Loading' title='loading'>";

    // Log URL
    // console.log(url);

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
    // console.log(xhr.responseText);

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    if(!obj.results || obj.results.length == 0){
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out
    }

    // Get the total pages
    totalPages = obj.info.pages;

    // Start building an HTML string we will display to the user
    let results = obj.results;
    // console.log("results.length = " + results.length);

    // Prepare a string
    let bigString = "";

    // Loop through the array of results
    for (let i=0;i<results.length;i++){
        let result = results[i];

        // Get the URL to the image
        let smallURL = result.image;
        if (!smallURL) smallURL = "images/missingimage.jpg";

        // Build a <div> to hold each result
        // ES6 String Templating
        let line = `<div class='result'><img src='${smallURL}' title='${result.name}' /><div class='overlay'><div class='text'>`;
        line += `<h3>${result.name}</h3>Status: ${result.status}<br>Species: ${result.species}<br>Gender: ${result.gender}<br>Location: ${result.location.name}`;
        line += `</div></div></div>`;
        
        // Add the <div> to the `bigString` and loop
        bigString += line;

        // Add a blank result to help with sizing if there is only one result
        if(results.length == 1){
            line = `<div class='result'></div>`;
            bigString += line;
        }
    }

    // All done building the HTML - show it to the user!
    setTimeout(function(){
        document.querySelector("#content").innerHTML = bigString;
    },50);

    // Update the status
    setTimeout(function(){
        document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + obj.info.count + " results for '" + displayTerm + "'</i></p>";
    },50);

    // Update the page info
    document.querySelector("#pageInfo").innerHTML = `PAGE INFO: ${currentPage}/${totalPages}`

    // Update the buttons
    if(currentPage == 1){
        document.querySelector("#prev").style.background = "grey";
    }
    if(currentPage < totalPages){
        document.querySelector("#next").style.background = "#333";
    }
    if(currentPage>1){
        document.querySelector("#prev").style.background = "#333";
    }
    if(currentPage == totalPages){
        document.querySelector("#next").style.background = "grey";
    }
}

// Reports an error while getting data.
function dataError(e){
    // Log the error
    console.log("An error occurred while getting the data.");
}

// Moves to the previous page of searched character
function previousPage(){
    // If there is a previous page, get it
    if(currentPage-1 >= 1){
        currentPage--;
        searchButtonClicked();
    }

    // If it's the first page, make the previous button appear disabled
    if(currentPage == 1){
        document.querySelector("#prev").style.background = "grey";
    }

    // If the current page is less than the total pages, make the next button appear enabled
    if(currentPage < totalPages){
        document.querySelector("#next").style.background = "#333";
    }

    // Update the page information
    document.querySelector("#pageInfo").innerHTML = `PAGE INFO: ${currentPage}/${totalPages}`
}

// Moves to the next page of searched character
function nextPage(){
    // If there is a next page, get it
    if(currentPage+1 <= totalPages){
        currentPage++;
        searchButtonClicked();
    }

    // If it's after the first page, make the previous button appear enabled
    if(currentPage>1){
        document.querySelector("#prev").style.background = "#333";
    }

    // If it's the last page, make the next button appear disabled
    if(currentPage == totalPages){
        document.querySelector("#next").style.background = "grey";
    }

    // Update the page information
    document.querySelector("#pageInfo").innerHTML = `PAGE INFO: ${currentPage}/${totalPages}`
}