

function home(id) {
  var homeModal = {
    // Use the user ID associated with the event
    user_id: id,
    view: {
      type: "home",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Announcer",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Make an announcement"
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Announce",
              emoji: true
            },
            value: "announce_button",
            action_id: "home_announce_click"
          }
        }
      ]
    }
  };

  return homeModal;
}

var announcementModal = {
  type: "modal",
  callback_id:"announcement_view",
  title: {
    type: "plain_text",
    text: "My App",
    emoji: true
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true
  },
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Announcer",
        emoji: true
      }
    },
    {
      type: "section",
      block_id: "channels_block",
      text: {
        type: "mrkdwn",
        text: "Make an announcement"
      },
      accessory: {
        type: "multi_conversations_select",
        placeholder: {
          type: "plain_text",
          text: "Channels",
          emoji: true
        },
        action_id: "channels_selected"
      }
    },
    {
      type: "input",
      block_id: "announcement_block",
      element: {
        type: "plain_text_input",
        multiline: true,
        action_id: "announcement_text",
        placeholder: {
          type: "plain_text",
          text: "Make an announcement..."
        }
      },
      label: {
        type: "plain_text",
        text: "Announcement",
        emoji: true
      }
    }
  ]
};


function initialValueAnnouncementModal(text)
{
  var modal = {
  type: "modal",
  callback_id:"announcement_view",
  title: {
    type: "plain_text",
    text: "My App",
    emoji: true
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true
  },
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Announcer",
        emoji: true
      }
    },
    {
      type: "section",
      block_id: "channels_block",
      text: {
        type: "mrkdwn",
        text: "Make an announcement"
      },
      accessory: {
        type: "multi_conversations_select",
        placeholder: {
          type: "plain_text",
          text: "Channels",
          emoji: true
        },
        action_id: "channels_selected"
      }
    },
    {
      type: "input",
      block_id: "announcement_block",
      element: {
        type: "plain_text_input",
        multiline: true,
        initial_value: text,
        action_id: "announcement_text",
        placeholder: {
          type: "plain_text",
          text: "Make an announcement..."
        }
      },
      label: {
        type: "plain_text",
        text: "Announcement",
        emoji: true
      }
    }
  ]
}
  
  return modal
}

function editModal(trigger_id, text)
{
  var modal = {
      trigger_id: trigger_id,
      view: {
        callback_id: "edit_msg_submission",
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App",
          emoji: true
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        blocks: [
          {
            type: "input",
            block_id: "update_text",
            label: {
              type: "plain_text",
              text: "Edit"
            },
            element: {
              type: "plain_text_input",
              action_id: "update_value",
              multiline: true,
              initial_value: text
            }
          }
        ]
      }
    }
  
  return modal
}


var noPermissionModal = {
	"title": {
		"type": "plain_text",
		"text": "Announcer",
		"emoji": true
	},
	"type": "modal",
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": ":rotating_light: You don't have permission to edit that ! :rotating_light: ",
				"emoji": true
			}
		}
	]
}
module.exports = { home, announcementModal, editModal, initialValueAnnouncementModal, noPermissionModal};