const BTC_URL = "https://api.coindesk.com/v1/bpi/currentprice.json";
const fetch = require("node-fetch");

function print(json) {
  var btc_usd = json.bpi.USD.rate_float;

  console.log(Math.round(btc_usd * 100) / 100);
}

function bitcoinPrice() {
  fetch(BTC_URL)
    .then(res => res.json())
    .then(json => print(json));
}

module.exports = bitcoinPrice

/**
app.shortcut("coin_one", async ({ shortcut, ack, client }) => {
  try {
    await ack();

    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "My App"
        },
        close: {
          type: "plain_text",
          text: "Close"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text:
                  "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

*/