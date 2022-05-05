const TelApi = require('node-telegram-bot-api')
const CatApi = require('cat-api')
const axios = require('axios')
const { json } = require('express/lib/response')
const token = '[DELETED]'
const cat_api_key = '[DELETED]'
const bot = new TelApi(token, { polling: true })
const db = require('./database')
const states = require('./states')
const machine = require('./machine')
const { insertInfo } = require('./database')
const Char = require('tedious/lib/data-types/char')
const sessionSize = 6



const start = () => {

    bot.setMyCommands([
        { command: '/start', description: 'Начало начал' },
        { command: '/info', description: 'Возник вопрос' },
        { command: '/go', description: 'Фотки!' },
        { command: '/favs', description: 'Посмотреть любимые фотографии :)' },
        { command: '/clear', description: 'Избавиться от любимых фотографий!' }

    ])


    bot.on('message', async msg => {
        console.log('Получено сообщение:');
        console.log(msg.message_id);
        console.log(msg.from.username);
        console.log(msg.chat.id);
        console.log(msg.text);
        const text = msg.text
        const chatId = msg.chat.id
        if (text === '/start') {
            await bot.sendMessage(chatId, 'Добро пожаловать!')
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/cb8/a14/cb8a144e-592c-4fc7-b84c-f76e93debacc/1.webp')
            return 0;
        }
        if (text === '/info') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/2.webp')
            await bot.sendMessage(chatId, 'Что за бот?')
            await bot.sendMessage(chatId, 'Бот позволяет смотреть случайные фотографии животных\nи сохранять их!')
            return 0;
        }
        if (text === '/go') {
            await bot.sendMessage(chatId, 'Новые фотографии для Вас :)')
            await db.deleteTemp(chatId);
            for (var i = 0; i < sessionSize; i++) {
                await session(chatId, i);
            }
            return 0;
        }
        if (text === '/favs') {
            await bot.sendMessage(chatId, 'Ваши любимые фотографии!!')
            return seeMyFavs(chatId);
        }
        if (text === '/clear') {
            await bot.sendMessage(chatId, 'Освобождено место\nдля новых любимых фотографий!!')
            await truncMyFavs(chatId);
            return 0;
        }
        bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/5.webp')
    })

}

start()

async function session(chatId, photoNum) {

    try {
        axios.defaults.headers.common['x-api-key'] = cat_api_key // Replace this with your API Key

        let response = await axios.get('https://api.thecatapi.com/v1/images/search', { params: { limit: 1, size: "full" } }) // Ask for 1 Image, at full resolution

        this.image = response.data[0] // the response is an Array, so just use the first item as the Image

        console.log("-- Image from TheCatAPI.com")
        console.log("id:", this.image.id)
        console.log("url:", this.image.url)
        await db.insertTemp(chatId, this.image.url, photoNum);

        return bot.sendPhoto(chatId, this.image.url, likeButton = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Like!', callback_data: 'Liked:' + photoNum }]
                ]
            })
        })
    } catch (err) {
        console.log(err)
        return bot.sendPhoto(chatId, 'https://purr.objects-us-east-1.dream.io/i/MAGRx.jpg')
    }

}


bot.on('callback_query', async(msg) => {
    console.log(msg.data)
    console.log(msg.from.id)
    await doTheTrick(msg.from.id, msg.data)
})

async function doTheTrick(id, data) {
    for (var i = 0; i < sessionSize; i++) {
        if (data === 'Liked:' + i) {
            let newurl = await db.getLikedFromTemp(id, i);
            console.log(newurl);
            await insertInfo(id, newurl);
        }
    }
}


async function seeMyFavs(id) {
    let arr = await db.getFavs(id);
    for (var i = 0; i < arr.length; i++) {
        await bot.sendPhoto(id, arr[i]['urlfav'])
    }
}


async function truncMyFavs(id) {
    await db.delFavs(id);
}