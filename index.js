/**

 Announcer App is a Slack app that uses the Bolt framework. The object is for a user
 to be able to send a message to multiple changes from one place. The user can also
 update that message from any message in any channel that message was placed.
 
 Possible Future Features
  - Delete The Messages and all accompanying messages?
  
  
  TODO
  
  Determine tests and handling error messages
  send ephemeral messages when the user does not have the authority to edit the message
  explore the as_user option - maybe announcements can come from user if they want it to?
  
  

*/

//uuid is used to generate unique ids for each announcement sent

//storage is used to store each announcement
const storage = require("node-persist");
const fetch = require("node-fetch");
const modals = require("./modals.js");
const { App } = require("@slack/bolt");
const db = require("./db-ops.js");
const { v4: uuidv4 } = require("uuid");
const viewui = require("./view-ui.js");

//initialize the Slack App
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_SOCKET_TOKEN
});

// App begins here
(async () => {
  await storage.init();

  // app is the Slack App and it starts up here
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();

// HOME
app.event("app_home_opened", async ({ event, client }) => {

  viewui.homeView(event.user, client);
});

// When channels are selected in the announcement modal
app.action("channels_selected", async ({ body, ack, say }) => {
  await ack();
  var channels =
    body.view.state.values["channels_block"]["channels_selected"][
      "selected_conversations"
    ];

  var user_id = body.user.id;

  var key = user_id + ".channels";

  // change to user.id + channels for key
  await storage.setItem(key, channels);
});

// Announce button from home event click
app.action("home_announce_click", async ({ body, ack, say, client }) => {
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

// Announcement View submission

/**
  TODO - create async function so that the messages are sent after the 
  or at the same time as the response clear messsage is sent back to Slack.
*/
app.view("announcement_view", async ({ body, ack, say, client }) => {
  // retrieve channels from storage

  var key = body.user.id + ".channels";
  var channels = await storage.getItem(key);
  var shared_msg_id = uuidv4();
  console.log(shared_msg_id);

  //retrieve announcement text from the announcement view modal
  var text =
    body.view.state.values["announcement_block"]["announcement_text"].value;

  try {
    await ack();

    //create unique id for each announcement

    var index = 0;
    var messages = [];

    await channels.forEach(channel => {
      client.chat
        .postMessage({
          channel: channel,
          text: text
        })
        .then(data => {
          //initialize a new announcement
          // and insert data in to MySQL server
          db.insertAnnouncement(
            shared_msg_id,
            body.user.id,
            text,
            channel,
            data.ts
          );
        })
        .catch(err => console.log("error: " + err));
    });

    // Confirm or Deny modals
  } catch (error) {
    console.log(error);
  }

  // once all the messages are sent the modal is closed
  return JSON.stringify({ response_action: "clear" });
});

app.shortcut("edit_all", async ({ shortcut, ack, client }) => {
  try {
    await ack();

    //edit message user check checks database to see if user who posted message is the same as user attempting to edit message
    //if they are same user will be sent to edit screen - other wise user will be sent an error message modal
    db.editMessageUserCheck(shortcut, client);
  } catch (error) {
    console.log(error);
  }
});

app.view("edit_msg_submission", async ({ ack, body, view, client }) => {
  await ack();

  var text = view.state.values["update_text"]["update_value"].value;

  //retreive message from storage- message that the user chose to edit
  viewui.updateSharedMessages(body.user.id, text, client);
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

function resolve(value) {
  console.log("resolve: " + value);
}
