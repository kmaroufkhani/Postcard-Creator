// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const assets = require("./assets");
const FormData = require("form-data");

app.use(express.json());
const fs = require("fs");
const sql = require("sqlite3").verbose();
const bodyParser = require("body-parser");


// This creates an interface to the file if it already exists, and makes the 
// file if it does not. 
const postcardDB = new sql.Database("postcards.db");

// Actual table creation; only runs if "postcards.db" is not found or empty
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='PostcardTable' ";
postcardDB.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createPostcardDB();
    } else {
        console.log("Database file found");
    }
});

function createPostcardDB() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE PostcardTable ( rowIdNum INTEGER PRIMARY KEY, URL TEXT, Photo TEXT, Message TEXT, Font TEXT, Color TEXT)';
  postcardDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}

/**************************** IMAGE HANDLING *******************************************/
/**************************************************************************************/
// Multer is a module to read and handle FormData objects, on the server side
const multer = require("multer");

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Use that storage object we just made to make a multer object that knows how to
// parse FormData objects and store the files they contain
let uploadMulter = multer({ storage: storage });

// First, server any static file requests
app.use(express.static("public"));

// Next, serve any images out of the /images directory
app.use("/images", express.static("images"));

// Next, serve images out of /assets (we don't need this, but we might in the future)
app.use("/assets", assets);

// Next, if no path is given, assume we will look at the postcard creation page
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public/creator.html");
});


// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
           
          //Now delete from /images folder
          fs.unlink("." + filename, (err) => {
            if (err) throw err;
            console.log('image was deleted');
          });
        });
      } else { // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}

// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post("/upload", uploadMulter.single("newImage"), function(request, response) {
  // file is automatically stored in /images
  
  //Now upload to ecs162.org
  let filename = "/images/" + request.file.originalname;
  sendMediaStore(filename, request, response);
  
  console.log("Recieved", request.file.originalname, request.file.size, "bytes");
});

/**************************** SHARE BUTTON HANDLING ***********************************/
/**************************************************************************************/
// The body-parser is used on requests with application/json in header
// parses the JSON in the HTTP request body, and puts the resulting object 
// into request.body
app.use(bodyParser.json()); 

//Save data in the database
app.post("/sharePostcard", function(request, response) {
  console.log("Answering the query: Share Postcard.");
  
  //Get a random query for this item and grab the values from the JSON object
  let itemQuery = request.body.query;
  let itemPhoto = request.body.photo;
  let itemMessage = request.body.message;
  let itemFont = request.body.font;
  let itemColor = request.body.color;
  
  // put new item into database
  cmd = "INSERT INTO PostcardTable ( URL, Photo, Message, Font, Color) VALUES (?,?,?,?,?) ";
  postcardDB.run(cmd, itemQuery, itemPhoto, itemMessage, itemFont, itemColor, function(err) {
    if (err) {
      console.log("DB insert error",err.message);
    } else {
      response.send("Got new item, query is: "+itemQuery);
    }
  });
});

//Send the json object to display.html function in script.js
app.get("/showPostcard", function(request, response) {
  //Retrieve the query string
  let queryId = request.query.id;
  
  //Get the elements from the table
  let cmd = "SELECT * FROM PostcardTable WHERE URL = ?";
  postcardDB.get(cmd, queryId, function(err, rowData) {
    if (err) { 
      console.log("error: ",err.message); 
    }
     else { 
      // send data to browser in HTTP response body as JSON
      response.json(rowData);
     }
  });
});

// listen for HTTP requests
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

/**************************************************************************************/
/**************************************************************************************/
