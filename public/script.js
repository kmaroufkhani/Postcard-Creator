"strict mode";

/*********************** FILE UPLOAD *************************************** */
/******************************************************************************************* */
function uploadFile() {
  
    // get the file chosen by the file dialog control
    const selectedFile = document.getElementById('fileChooser').files[0];

    // store it in a FormData object
    const formData = new FormData();

    // name of field, the file itself, and its name (optional)
    formData.append('newImage', selectedFile, selectedFile.name);

    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();

    // it will be a POST request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/upload", true);
  
    // callback function executed when the HTTP response comes back
    xhr.onloadend = function(e) {
        // Get the server's response body (for debugging)
        console.log(xhr.responseText);

        // now that the image is on the server, we can display it!
        // First change the display from 'initialImg' to 'finalImg'
        document.getElementById("initialImg").style.display = "none";
        document.getElementById("finalImg").style.display = "flex";
      
        //Note We get the image from ecs162.org
        let newImage = document.getElementById("serverImage");
        newImage.src = "http://ecs162.org:3000/images/kmaroufkhani/"+selectedFile.name;
    }
  
    // actually send the request
    xhr.send(formData);
}
/******************************************************************************************* */
/******************************************************************************************* */

/*********************** PAGE OPTIONS *************************************** */
/******************************************************************************************* */
//Function that changes the font
function changeFont(x) {
  //Grab the Message Box and the list items
  let message = document.getElementById("messageBox");
  let listArray = document.getElementsByClassName("list");
  
  //Set all the fonts to inactive
  for (let i = 0; i < listArray.length; i++) {
    listArray[i].className = listArray[i].className.replace(" activeFont", " inactiveFont");
  }
  
  //Now change the font based on the chosen one
  //And change the symbol before the font to the correct one
  if (x == 0) {
    message.style.fontFamily = "Indie Flower";
    listArray[x].className = listArray[x].className.replace(" inactiveFont", " activeFont");
  }
  else if (x == 1) {
    message.style.fontFamily = "Dancing Script";
    listArray[x].className = listArray[x].className.replace(" inactiveFont", " activeFont");
  }
  else if (x == 2) {
    message.style.fontFamily = "Long Cang";
    listArray[x].className = listArray[x].className.replace(" inactiveFont", " activeFont");
  }
  else if (x == 3) {
    message.style.fontFamily = "Homemade Apple";
    listArray[x].className = listArray[x].className.replace(" inactiveFont", " activeFont");
  }
}


//Function that changes the background color
function changeColor(x) {
  //Grab the postcard and the color options
  let postcard = document.getElementById("postCard");
  let colorArray = document.getElementsByClassName("color");
  
  //Set all the colors to inactive
  for (let i = 0; i < colorArray.length; i++) {
    colorArray[i].className = colorArray[i].className.replace(" activeColor", "");
  }
  
  //Now set the chosen color to active and change the background color of the postcard
  if (x == 0) {
    postcard.style.backgroundColor = "#e6e2cf";
    colorArray[x].className += " activeColor";
  }
  else if (x == 1) {
    postcard.style.backgroundColor = "#dbcaac";
    colorArray[x].className += " activeColor";
  }
  else if (x == 2) {
    postcard.style.backgroundColor = "#c9cbb3";
    colorArray[x].className += " activeColor";
  }
  else if (x == 3) {
    postcard.style.backgroundColor = "#bbc9ca";
    colorArray[x].className += " activeColor";
  }
  else if (x == 4) {
    postcard.style.backgroundColor = "#a6a5b5";
    colorArray[x].className += " activeColor";
  }
  else if (x == 5) {
    postcard.style.backgroundColor = "#b5a6ab";
    colorArray[x].className += " activeColor";
  }
  else if (x == 6) {
    postcard.style.backgroundColor = "#eccfcf";
    colorArray[x].className += " activeColor";
  }
  else if (x == 7) {
    postcard.style.backgroundColor = "#eceeeb";
    colorArray[x].className += " activeColor";
  }
  else if (x == 8) {
    postcard.style.backgroundColor = "#bab9b5";
    colorArray[x].className += " activeColor";
  }
}
/**************************************************************************************/

//Function to generate a random string
function genRandStr() {
  let r = Math.random().toString(36).substring(7);
  return r;
}

//Function that implements the share button
function shareCard() {
  //Grab the photo, message, font, and color of the postcard
  let imgSrc = document.getElementById("serverImage").src;
  
  let myMessage = document.getElementById("messageBox").innerText;
  
  let myFont = document.getElementById("messageBox");
  let fontFam = getComputedStyle(myFont).fontFamily;
  
  let myColor = document.getElementById("postCard");
  let backColor = getComputedStyle(myColor).backgroundColor;
  
  //Generate a raondom string
  let randQuery = genRandStr();
  
  //Create an object
  let myObject = {
    "query": randQuery,
    "photo": imgSrc,
    "message": myMessage,
    "font": fontFam,
    "color": backColor
  };
  
  //Stringify the object
  let stringObj = JSON.stringify(myObject);
  
  //Server Post Request
  const xhr = new XMLHttpRequest();
  
  xhr.open("POST", "/sharePostcard", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  xhr.onloadend = function(e) {
      console.log(xhr.responseText);
  }
  
  xhr.send(stringObj);
  
  //Pop-up:
  document.getElementById("overlay").style.display = "flex";
  
  let shareLink = window.location.href + "display.html?id=" + randQuery;
  document.getElementById("shareURL").innerHTML = shareLink;
}

//Pressing the X button closes the pop-up
function closePopUp() {
  document.getElementById("overlay").style.display = "none";
}

//Clicking on the URL takes you to the page
function goToPage() {
  let shareLink = document.getElementById("shareURL").textContent;
  window.location.href = shareLink;
}
/******************************************************************************************* */

/********************** Handle sending data into display.html ****************************** */
//Function called in grabElems(), to format the html file
function display(responseStr) {
  let myObj = JSON.parse(responseStr);
  
  //Send the data to display.html
  document.getElementById("finalImg").style.display = "flex";
  let newImage = document.getElementById("serverImage");
  newImage.src = myObj.Photo;
  
  let newMessage = document.getElementById("messageBox");
  newMessage.innerHTML = myObj.Message;
  newMessage.style.fontFamily = myObj.Font;
  
  let newColor = document.getElementById("postCard");
  newColor.style.backgroundColor = myObj.Color;
}

//Function that grabs image, font, color, and message from the server
function grabElems() {
  //Grab the data from the server
  let xhr = new XMLHttpRequest;
  
  xhr.open("GET","/showPostcard" + window.location.search);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  xhr.onloadend = function(e) {
    let responseStr = xhr.responseText;
    display(responseStr);
  }
  
  xhr.send();
}

