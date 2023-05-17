const request = require("request");
let env = require("dotenv");
env.config();

class Manager {
  constructor() {}

  getRandomWord(callback) {
    console.log("Random word called");
    request.get(
      {
        url: "https://api.api-ninjas.com/v1/randomword",
        headers: {
          'X-Api-Key': process.env.API_KEY,
        },
      }, 
      function (err, res, body) {
        let errObj = {
          word: "No word found",
        };

        if (err || res.statusCode != 200) {
          console.log("err:" + body.toString("utf8"));
          callback(errObj);
        } else {
          console.log("Response received");
          let obj = JSON.parse(body);
          if (!obj.word) {
            callback(errObj);
          } else {
           console.log("The word is " + obj.word);
           callback(null, obj.word);
           return obj.word;
         
          }
        }
      }
    );
  }
}

module.exports = Manager;
