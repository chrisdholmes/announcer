const { App } = require("@slack/bolt");
const modals = require("./modals.js");
const storage = require("node-persist");
const SHARED_MESSAGES = "sharedmessages";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_SOCKET_TOKEN
});

async function openNoPermissionModal(client, trigger_id) {
  await client.views.open({
    trigger_id: trigger_id,
    view: modals.noPermissionModal
  });
}

async function openEditMsgModal(shortcut, client) {
  try {
    await client.views.open(
      modals.editModal(shortcut.trigger_id, shortcut.message.text)
    );
  } catch (error) {
    console.log(JSON.stringify(error));
  }
}

async function updateSharedMessages(user_id, text, client) {
  var announcements = await storage.getItem(user_id + SHARED_MESSAGES);

  announcements.forEach(o => {
    client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel: o.channel,
      ts: o.ts,
      text: text
    });
  });
}

async function homeView(user_id, client)
{
    try {
    // get homeModal from method in modals module
    var homeModal = modals.home(user_id);
      
    const result = await client.views.publish(homeModal);
      
      
  } catch (error) {
    console.error(JSON.stringify(error));
  }
  
}

module.exports = {
  openNoPermissionModal,
  openEditMsgModal,
  updateSharedMessages,
  homeView
};

