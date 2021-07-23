/**

 Announcer App is a Slack app that uses the Bolt framework. The object is for a user
 to be able to send a message to multiple changes from one place. The user can also
 update that message from any message in any channel that message was placed.
 
 Possible Future Features
  - Delete The Messages and all accompanying messages
  

*/

//uuid is used to generate unique ids for each announcement sent
const { v4: uuidv4 } = require("uuid");

//storage is used to store each announcement
const storage = require("node-persist");
const fetch = require("node-fetch");
const modals = require("./modals.js");
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

// App begins here 
(async () => {
  await storage.init();
  
  // app is the Slack App and it starts up here
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
  
})();



//initialize the Slack App
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_SOCKET_TOKEN
});


// HOME 
app.event("app_home_opened", async ({ event, client }) => {
  try {
    // get homeModal from method in modals module
    var homeModal = modals.home(event.user);

    const result = await client.views.publish(homeModal);
  } catch (error) {
    console.error(error);
  }
});

// When channels are selected in the announcement modal
app.action("channels_selected", async ({ body, ack, say }) => {
  await ack();
  var channels =
    body.view.state.values["channels_block"]["channels_selected"][
      "selected_conversations"
    ];
  
  
  // store the channels selected in storage so that they can be accessed and sent out
  await storage.setItem("channels", channels);
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
  var channels = await storage.getItem("channels");
  
  //retrieve announcement text from the announcement view modal
  var announcement =
    body.view.state.values["announcement_block"]["announcement_text"].value;

  try {
    await ack();
    
    //create unique id for eacha nnouncement
    var shared_msg_id = uuidv4();

    channels.forEach(channel => {
      client.chat
        .postMessage({
          channel: channel,
          text: announcement
        })
        .then(data => {
        //initialize a new announcement 
          var message = new Announcement(
            shared_msg_id,
            body.user.id,
            announcement,
            data.channel,
            data.ts
          );
          
         //store announcement so user can update 
          storage.setItem(data.ts, message);
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



app.shortcut("edit_msg", async ({ shortcut, ack, client }) => {
  try {
    await ack();
  
    //retrieve message from storage based on ts
    var msg = await storage.getItem(shortcut.message_ts);
    
   // if msg not found in storage, undefined, or msg is found but does not long to user
    
  // open no permission modal 
    
  // else open edit modal

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
  console.log("body: " + body);
  await ack();

  var text = view.state.values["update_text"]["update_value"].value;
  
  //retreive message from storage- message that the user chose to edit
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
  

  // get all the messages with this message id

  await storage.forEach(o => {
    if (o.value.shared_msg_id != undefined) {
      if (
        o.value.shared_msg_id == message.shared_msg_id &&
        o.value.user_id == message.user_id
      ) {

        try {
          client.chat.update({
            token: process.env.SLACK_BOT_TOKEN,
            channel: o.value.channel,
            ts: o.value.ts,
            text: text
          });
       
        } catch (error) {
          console.log(error);
        }
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
