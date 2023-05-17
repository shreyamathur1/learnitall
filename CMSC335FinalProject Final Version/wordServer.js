"use strict";
const Manager = require("./Manager.js");
const express = require("express");
const path = require("path");
const app = express();
const request = require('request');
const bodyParser = require("body-parser"); 
require("dotenv").config({ path: path.resolve(__dirname, "credentials/.env") });
const user = process.env.MONGO_DB_USERNAME;
const pass = process.env.MONGO_DB_PASSWORD;
const database = {
  db: process.env.MONGO_DB_NAME,
  collection: process.env.MONGO_COLLECTION,
};
const { MongoClient, ServerApiVersion } = require("mongodb");
let client = null;
let manager = new Manager();
let session = {};

main();

//ROUTES:
app.get("/", (req, res) => {
  res.render("homePage");
});

app.get("/learnPage", (req, res) => {
  res.render("learnPage");
});

app.get("/playPage", (req, res) => {
  res.render("playPage"); // Render the "playPage" template or send the appropriate response
});


app.post("/learnPage", async (req, res) => {
  let variables = {
    name: req.body.name,
    word: "",
  };


  manager.getRandomWord(function (err, word) {
    variables["word"] = err ? "Error getting word" : word;
    variables["name"] = req.body.name; // Assign the name value
    console.log(variables);
    // Render HTML
    res.render("learnPage", variables);
  });


  const collection = client.db(database.db).collection(database.collection);
  const { name } = req.body;
  const result = await collection.findOne({ name: name });

  //Add userName to the Database
  if (result) {
    //have user should update a session user
    session = result;
  } else {
    //user doesn't exist place user
    session = { name: name};
    await collection.insertOne({ name: name});
  }
});



async function main() {
  //1. Setup the express server
  app.set("view engine", "ejs"); //Set app view engine as ejs
  app.set("views", path.resolve(__dirname, "templates")); //Set app setting for views to templates folder
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static("css"));
  const args = process.argv;

  //2. Command Line Parsing
  let portNum = 0;
  if (args.length != 3) {
    console.log("usage: node wordServer.js [portNumber]");
    process.exit(0);
  } else {
    portNum = args[2];
  }
  app.listen(portNum); //Set app to listen for requests
  console.log(`Webserver started and running at http://localhost:${portNum}`);

  //3. Connect to the mongoDB database
  const uri = `mongodb+srv://${user}:${pass}@cluster0.snkpdub.mongodb.net/?retryWrites=true&w=majority`;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();
    console.log("Connected to the database");
  } catch (e) {
    console.error(e);
  }

  //4. Listen for user-shut down command
  console.log("Stop to shutdown the server: ");
  process.stdin.on("data", (dataInput) => {
    if (dataInput !== null) {
      dataInput = dataInput.toString().trim();
      if (dataInput === "stop") {
        console.log("Shutting down the server");
        client.close();
        process.exit(0);
      } else if (dataInput === "word") {
        let word = networkMangager.getRandomWord();
        console.log(word);
      } else {
        console.log(`Invalid command: ${dataInput}`);
      }
      console.log("Stop to shutdown the server: ");
    }
  });
}
