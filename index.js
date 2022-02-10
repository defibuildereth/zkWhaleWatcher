import axios from 'axios';
import fetch from 'node-fetch';

const webhook = 'https://discord.com/api/webhooks/941403789611651102/2Wkw4JpmXmxFNWbCBdQfpknSf5-el11yj4Khglthj2RvG8ecDU-r53yIjUHsvjCzq5_9'

let mostRecentBlock = 54427

const pollApi = async function () {
    let blocksToParse = []
    await fetch(`https://api.zksync.io/api/v0.2/blocks?from=${mostRecentBlock}&limit=100&direction=newer`)
        .then(res => res.json())
        .then(data => {
            if (data.status == "success") {
                // console.log(data)
                let numNewBlocks = data.result.list.length;
                if (numNewBlocks > 1) {
                    for (let i = 1; i < numNewBlocks; i++) {
                        blocksToParse.push(data.result.list[i].blockNumber)
                    }
                    parseBlocksArray(blocksToParse)
                } else {
                    console.log(`no new blocks found, most recent remains ${mostRecentBlock}`)
                }
                //     // parseData(data.result)
            }
        })
}

const parseBlocksArray = async function (array) {
    for (let i = 0; i < array.length; i++) {
        await parseBlock(array[i], 'latest', 0)
            // .then(res => res.json())
            
    }
}

const parseBlock = async function (block, tx, index) {
    let blockTxArray = []
    console.log('calling parseBlock with block: ', block, ' tx: ', tx)
    await fetch(`https://api.zksync.io/api/v0.2/blocks/${block}/transactions?from=${tx}&limit=100&direction=older`)
        .then((res) => res.json())
        .then(data => {
            for (let i = index; i < data.result.list.length; i++) {
                if (data.result.list[i].op.type == "Swap") {
                blockTxArray.push(data.result.list[i])
                }
            }

            if (data.result.list.length > 99) {
                parseBlock(block, data.result.list[99].txHash, 1)
            } else {
                console.log(blockTxArray.length)
            }
        })
}

const parseData = async function (data) {
    let blockNumber = data.blockNumber
    let payload = {
        "username": "ZZ Whale Watcher",
        "content": "",
        "embeds": [
            {
                "author": {
                    "name": "ZigZag Exchange",
                    "url": "https://trade.zigzag.exchange/"
                },
                "title": `New Block ${blockNumber}`,
                "url": `https://api.zksync.io/api/v0.2/blocks/${blockNumber}`,
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

// pollApi()

parseBlocksArray([mostRecentBlock, mostRecentBlock+1])

