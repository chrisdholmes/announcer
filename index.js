

const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const storage = require("node-persist");
const fetch = require("node-fetch");
const store = require("./store");
const bitcoinPrice = require("./crypto.js");
const modals = require("./modals.js");
const genius = require("./genius.js");
const crypto = require("crypto");
const { App } = require("@slack/bolt");



class Announcement {
  constructor(shared_msg_id, user_id, text, channel, ts) {
    this.shared_msg_id = shared_msg_id;
    this.user_id = user_id;
    this.text = text;
    this.channel = channel;
    this.ts = ts;
  }
}

// Start your app
(async () => {
  await storage.init();

  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
 
  await storage.forEach(function(data) {
    //console.log(data.key + " " + JSON.stringify(data.value));
  });
})();

let messages = {};

const {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode
} = require("simple-oauth2");


//initailize the Slack App
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_SOCKET_TOKEN
});

app.event("app_home_opened", async ({ event, client }) => {
  try {
    // get homeModal from method in modals module
    var homeModal = modals.home(event.user);

    const result = await client.views.publish(homeModal);
  } catch (error) {
    console.error(error);
  }
});

app.action("channels_selected", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  var channels =
    body.view.state.values["channels_block"]["channels_selected"][
      "selected_conversations"
    ];

  await storage.setItem("channels", channels);
});

app.action("home_announce_click", async ({ body, ack, say, client }) => {
  // Acknowledge the action
  try {
    await ack();
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modals.announcementModal
    });
  } catch (error) {
    console.log(error.data.response_metadata);
  }
});

app.view("announcement_view", async ({ body, ack, say, client }) => {
  // Acknowledge the action
  //console.log(body);
  var channels = await storage.getItem("channels");
  var announcement =
    body.view.state.values["announcement_block"]["announcement_text"].value;

  try {
    await ack();

    var index = 0;

    var shared_msg_id = uuidv4();

    channels.forEach(channel => {
      client.chat
        .postMessage({
          channel: channel,
          text: announcement,
          private_metadata: "christopher"
        })
        .then(data => {
          var x = new Announcement(
            shared_msg_id,
            body.user.id,
            announcement,
            data.channel,
            data.ts
          );

          storage.setItem(data.ts, x);
        })
        .catch(err => console.log("error: " + err));
    });

    // Confirm or Deny modals
  } catch (error) {
    console.log(error);
  }

  var x = new Announcement("one", "two", "three");
  return JSON.stringify({ response_action: "clear" });
});

app.shortcut("edit_msg", async ({ shortcut, ack, client }) => {
  try {
    await ack();

    // display to user modal with input text with initial value
    var msg = {
      channel: shortcut.channel.id,
      ts: shortcut.message_ts
    };

    //
    var msg = await storage.getItem(shortcut.message_ts);
    
    console.log(msg)
    console.log("message: " + shortcut.message_ts);

    if (msg == undefined || msg.user_id != shortcut.user.id) {
      await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: modals.noPermissionModal
    });
    } else {
      const result = await client.views.open(
        modals.editModal(shortcut.trigger_id, shortcut.message.text)
      );

      await storage.setItem("message", msg);
    }
  } catch (error) {
    console.log(error);
  }
});

app.view("edit_msg_submission", async ({ ack, body, view, client }) => {
  //console.log(body);
  var text = view.state.values["update_text"]["update_value"].value;
  var message = await storage.getItem("message");

  try {
    await ack();

    const result = await client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel: message.channel,
      ts: message.ts,
      text: text
    });
  } catch (error) {
    console.log(error);
  }

  var check_id = "";
  var msg = await storage.getItem(message.ts);

  check_id = msg.shared_msg_id;

  // get all the messages with this message id

  await storage.forEach(o => {
    if (o.value.shared_msg_id != undefined) {
      if (
        o.value.shared_msg_id == check_id &&
        o.value.user_id == body.user.id
      ) {
        client.chat.update({
          token: process.env.SLACK_BOT_TOKEN,
          channel: o.value.channel,
          ts: o.value.ts,
          text: text
        });
      } 
    }
  });
});

app.shortcut("shortcut_announce", async ({ shortcut, ack, client, body }) => {
  await ack();
  try {
    await ack();
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modals.announcementModal
    });
  } catch (error) {
    console.log(error.data.response_metadata);
  }
});

app.shortcut("announce_msg", async ({ shortcut, ack, client, body }) => {
  await ack();
  try {
    await ack();
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modals.initialValueAnnouncementModal(shortcut.message.text)
    });
  } catch (error) {
    console.log(error.data.response_metadata);
  }
});
