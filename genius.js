const BASE_URL = "https://api.genius.com/";
const AUTH_URL = "https://api.genius.com/oauth/authorize";
const fs = require("fs");
const fetch = require("node-fetch");

const config = {
  client: {
    id: process.env.GENIUS_CLIENT_ID,
    secret: process.env.GENIUS_CLIENT_SECRET
  },
  auth: {
    tokenHost: "https://api.genius.com/oauth/authorize"
  }
};

function genius() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.GENIUS_CLIENT_ACCESS_TOKEN
  };

  fetch(BASE_URL + "search?q=Kendrick%20Lamar", {
    headers: headers
  })
    .then(res => res.json())
    .then(json => console.log(json));
}



module.exports = genius