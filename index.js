import axios from 'axios';
import fetch from 'node-fetch';

const webhook = 'https://discord.com/api/webhooks/941403789611651102/2Wkw4JpmXmxFNWbCBdQfpknSf5-el11yj4Khglthj2RvG8ecDU-r53yIjUHsvjCzq5_9'


const pollApi = async function () {
    await fetch(`https://api.zksync.io/api/v0.2/blocks/lastCommitted`)
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                parseData(data.result)
            }
        })
}

const parseData = async function (data) {
    let blockNumber = data.blockNumber
    let payload = {
        "username": "ZZ Whale Watcher",
        "content": "An Update",
        "embeds": [
            {
                "author": {
                    "name": "ZigZag Exchange",
                    "url": "https://trade.zigzag.exchange/"
                },
                "title": `New Block ${blockNumber}`,
                "url": "https://trade.zigzag.exchange/",
                "description": "**New** __block__ `mined`[hyperlink](https://trade.zigzag.exchange/)",
                "color": 15258703,
                "fields": [
                    {
                        "name": "Can",
                        "value": "Make",
                        "inline": true
                    },
                    {
                        "name": "These",
                        "value": "Sick",
                        "inline": true
                    },
                    {
                        "name": "Use `\"inline\": true` parameter, if you want to display fields in the same line.",
                        "value": "okay..."
                    },
                    {
                        "name": "Thanks!",
                        "value": "You're welcome :wink:"
                    }
                ],
                "thumbnail": {
                    "url": "https://upload.wikimedia.org/wikipedia/commons/3/38/4-Nature-Wallpapers-2014-1_ukaavUI.jpg"
                },
                "image": {
                    "url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/A_picture_from_China_every_day_108.jpg"
                },
                "footer": {
                    "text": "Woah! So cool! :smirk:",
                    "icon_url": "https://i.imgur.com/fKL31aD.jpg"
                }
            }
        ]
    }
    pingWebhook(payload)
}


const pingWebhook = async function (payload) {
    axios
        .post(webhook, payload)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            // console.log(res)
        })
        .catch(error => {
            console.error(error)
        })
}

pollApi()

