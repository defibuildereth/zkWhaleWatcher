import axios from 'axios';
import fetch from 'node-fetch';
import 'dotenv/config'

const webhook = process.env.WEBHOOK

// console.log(webhook)

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
                    console.log('there are ', numNewBlocks - 1, ' new blocks to parse')
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
        // .then(res => console.log(res))

    }
}

const parseBlock = async function (block, tx, index) {
    let blockTxArray = []
    // console.log('calling parseBlock with block: ', block, ' tx: ', tx)
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
                getTotalBlockVolume(block, blockTxArray)
            }
        })
}

const getTotalBlockVolume = async function (block, array) {

    let volPromiseArray = []

    for (let i = 0; i < array.length; i++) {
        volPromiseArray.push(getTransactionVolume(array[i]))
    }

    await Promise.all(volPromiseArray)
        .then((values) => {
            let totalBlockVolume = 0;

            // console.log('values.length: ', values.length)
            for (let i = 0; i < values.length; i++) {
                if (values[i]) {
                    totalBlockVolume = totalBlockVolume + values[i]

                }
            }
            // console.log('block: ', block, 'volume: ', totalBlockVolume);
            parseData(block, totalBlockVolume, array.length)

        })
}

const getTransactionVolume = async function (tx) {
    let txVol = 0;
    if (tx.op.type == 'Swap') {
        // console.log(tx)
        // console.log('amount: ',tx.op.orders[1].amount)
        let token = tx.op.orders[1].tokenSell
        await fetch(`https://api.zksync.io/api/v0.2/tokens/${token}/priceIn/usd`)
            .then((res) => res.json())
            .then(data => {
                // console.log(data)
                let decimal = data.result.decimals;
                let amount = tx.op.orders[1].amount;
                let price = data.result.price;
                txVol = amount * 10 ** (0 - decimal) * price
                // console.log(roughVol)
            })
        return txVol
    }
}

const parseData = async function (block, totalBlockVolume, numTxs) {
    let blockNumber = block
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
                
                "color": 15258703,
                "fields": [
                    {
                        "name": "**Swaps**",
                        "value": `${numTxs}`,
                        "inline": true
                    },
                    {
                        "name": "**Total Volume**",
                        "value": `${totalBlockVolume.toFixed(2)}`,
                        "inline": true
                    }
                    
                ],
                "footer": {
                    "text": "Made by DefiBuilder.eth, powered by ZkSync API",
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
            console.error(error.response.statusText)
        })
}

pollApi()

// getTotalBlockVolume(mostRecentBlock)

// parseData(mostRecentBlock)

// parseBlocksArray([mostRecentBlock+3])

