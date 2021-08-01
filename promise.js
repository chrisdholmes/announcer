const db = require("./db-ops.js");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.RDS_END_POINT,
  user: process.env.RDS_USERNAME,
  database: "announcer_db",
  password: process.env.RDS_PW,
  port: 3306,
  timeout: 10000
  
});

const pool = mysql.createPool({
  host: process.env.RDS_END_POINT,
  user: process.env.RDS_USERNAME,
  database: "announcer_db",
  password: process.env.RDS_PW,
  port: 3306,
  timeout: 10000,
  connectLimit: 10
});

(async () => {
  var shared_msg_id = "248ac039-782b-400c-a36b-9c7d3934e89e";
  var channel = "CS7J6QZ3N";
  var ts = "1627182564.000200";

  var promise = getAnnouncements(channel, ts);

  promise()
    .then(data => {
      var newPromise = getAnnouncement(data[0].shared_msg_id);

      newPromise()
        .then(data => console.log(data))
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));

})();

function getAnnouncement(shared_msg_id) {

  var getAnnouncementsPromise = () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM `announcements` WHERE (`shared_msg_id`="' +
          shared_msg_id +
          '")',
        (error, elements) => {
          if (error) {
            return reject(error);
          }
          return resolve(elements);
        }
      );
    });
  };

  return getAnnouncementsPromise;
}

function getAnnouncements(channel, ts) {
  var test = () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT `shared_msg_id` FROM `announcements` WHERE (`channel`="' +
          channel +
          '" AND `ts`="' +
          ts +
          '")',
        (error, elements) => {
          if (error) {
            return reject(error);
          }
          resolve(elements);
        }
      );
    });
  };

  return test;
}

function resolve(value) {
  console.log("resolve: " + value);
  return value;
}

function reject(value) {
  console.log("reject: " + value);
}
