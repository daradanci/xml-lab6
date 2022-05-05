const { get } = require('express/lib/response');
const sql = require('mssql')


const config = {
    user: 'user1',
    password: 'sa',
    database: 'daXMLbotDB',
    server: 'DARADANCIPC',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        //  encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}



async function getInfo() {

    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query('select * from favs');
        // console.log(res['recordset']);
        sql.close();
        return res['recordset'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function getFavs(id) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query('select urlfav from favs where chatid=' + id);
        console.log(res['recordset']);
        sql.close();
        return res['recordset'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function delFavs(id) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query('delete from favs where chatid=' + id);
        console.log(res['recordset']);
        sql.close();
        return res['recordset'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function insertInfo(chatid, urlfav) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('urlfav', sql.NVarChar, urlfav)
            .query('insert into favs (chatid, urlfav) values(' + chatid + ', @urlfav)');
        sql.close();
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}

async function deleteInfo(chatid, urlfav) {
    try {
        console.log(chatid);
        let pool = await sql.connect(config);
        await pool.request()
            .input('chatid', sql.NVarChar, chatid)
            .input('urlfav', sql.NVarChar, urlfav)
            .query('delete from favs where chatid=@chatid and urlfav=@urlfav');
        sql.close();
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function getTemp() {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query('select * from temp');
        console.log(res['recordset']);
        sql.close();
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function getLikedFromTemp(id, num) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query('select urlfav from temp where num=' + num + ' and chatid=' + id);
        console.log(res['recordset'][0]['urlfav']);
        sql.close();
        return res['recordset'][0]['urlfav'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function insertTemp(chatid, urlfav, num) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('urlfav', sql.NVarChar, urlfav)
            .input('num', sql.Int, num)
            .query('insert into temp (chatid, urlfav, num) values(' + chatid + ', @urlfav, @num)');
        sql.close();
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function deleteTemp(chatid) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .query('delete from temp where chatid=' + chatid);
        sql.close();
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}


module.exports = {
    config: config,
    getInfo: getInfo,
    insertInfo: insertInfo,
    deleteInfo: deleteInfo,
    getTemp: getTemp,
    insertTemp: insertTemp,
    deleteTemp: deleteTemp,
    getLikedFromTemp: getLikedFromTemp,
    getFavs: getFavs,
    delFavs: delFavs
}