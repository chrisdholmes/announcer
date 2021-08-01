/**
  
*/

const mysql = require("mysql");
const { v4: uuidv4 } = require("uuid");
const viewui = require("./view-ui.js");
const storage = require("node-persist");
const SHARED_MESSAGES = "sharedmessages"

const connection = mysql.createConnection({
  host: process.env.RDS_END_POINT,
  user: process.env.RDS_USERNAME,
  database: "announcer_db",
  password: process.env.RDS_PW,
  port: 3306,
  timeout: 10000
  //port: process.env.RDS_PORT
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

class Announcement {
  constructor(id, shared_msg_id, user_id, text, channel, ts) {
    this.id = id;
    this.shared_msg_id = shared_msg_id;
    this.user_id = user_id;
    this.text = text;
    this.channel = channel;
    this.ts = ts;
  }
}

async function insertAnnouncement(
  shared_msg_id,
  user_id,
  text,
  channel_id,
  message_ts
) {
  var announcement = new Announcement(
    uuidv4(),
    shared_msg_id,
    user_id,
    text,
    channel_id,
    message_ts
  );

  await connection.query(
    "INSERT INTO announcements SET ?",
    announcement,
    function(error, results, fields) {
      if (error) throw error; // TODO notify user the operation failed
    }
  );
}

function editMessageUserCheck(shortcut, client) {
  console.log("edit message user check");

  //promise created to grab an announcement to verify the user has the ability to edit a message
  var promise = () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM `announcements` WHERE (`channel`="' +
          shortcut.channel.id +
          '" AND `ts`="' +
          shortcut.message_ts +
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

  promise()
    .then(data => {
      if (data[0].user_id == shortcut.user.id) {
        //open edit message modal since user has permission to edit
        viewui.openEditMsgModal(shortcut, client);

        var promise = getAnnouncementsSharedMsgId(data[0].shared_msg_id);

        promise()
          .then(data => {
            storage.setItem(shortcut.user.id + SHARED_MESSAGES, data);
            console.log(data);
          })
          .catch(error => console.log(JSON.stringify(error)));
      } else {
        //open no permission message modal
        viewui.openNoPermissionModal(client, shortcut.trigger_id);
      }
    })
    .catch(error => console.log(error));

  return promise;
}

function getAnnouncementPromise(channel, ts) {
  var test = () => {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM `announcements` WHERE (`channel`="' +
          channel +
          '" AND `ts`="' +
          ts +
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

  return test;
}

function getAnnouncementsSharedMsgId(shared_msg_id) {
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

function deleteAnnouncement(data) {}

function updateAnnouncement(data) {}

function resolve(value) {
  console.log("resolve: " + value);
  return value;
}

function reject(value) {
  console.log("reject: " + value);
}

module.exports = {
  insertAnnouncement,
  getAnnouncementPromise,
  getAnnouncementsSharedMsgId,
  editMessageUserCheck,
  SHARED_MESSAGES
};
