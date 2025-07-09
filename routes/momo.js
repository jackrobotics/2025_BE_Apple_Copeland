const axios = require('axios');
const cheerio = require('cheerio');

let cookie = null;

async function get_cookie() {
    // if (cookie == null) {
    const _c_data = await axios({
        url: "https://space-ui.momohub.net/index.php"
    })
    const _cookie = _c_data.headers['set-cookie'][0];
    cookie = _cookie.substring(0, _cookie.indexOf(';'));
    // }
    // console.log(cookie)
    return cookie;
}

async function login(email = process.env.EMAIL, password = process.env.PASSWORD) {
    if (cookie == null)
        await get_cookie();
    const data = await axios({
        url: "https://space-ui.momohub.net/ui-signin.php",
        method: "POST",
        headers: {
            "cookie": cookie,
            "content-type": "application/x-www-form-urlencoded"
        },
        data: {
            email: email,
            password: password,
            signin: ""
        }
    });
    // console.log(data.data)
};

async function get() {
    // console.log(cookie);
    const data = await axios({
        url: "https://space-ui.momohub.net/data-setting.php",
        headers: {
            "cookie": cookie,
        },
    })

    let list = [];

    if (data.data.indexOf("ui-signin.php") == -1) {
        const $ = cheerio.load(data.data);
        $('#DevicesTable tbody tr').each((i, el) => {
            const tds = $(el).find('td');
            const tagId = $(tds[0]).text().trim();        // ข้าม <td> แรกเพราะ display:none
            const tagNo = $(tds[1]).text().trim();        // ข้าม <td> แรกเพราะ display:none
            const macID = $(tds[2]).text().trim();
            const dataName = $(tds[3]).text().trim();
            // const dashboard = $(tds[4]).text().trim();
            // const groupName = $(tds[5]).text().trim();
            const lastUpdate = $(tds[6]).text().trim();
            const value = $(tds[7]).text().trim();
            // const enableIcon = $(tds[8]).find('i').attr('class'); // ถ้ามี icon

            list.push({
                tagId,
                tagNo,
                macID,
                dataName,
                // dashboard,
                // groupName,
                lastUpdate,
                value,
                // enableIcon
            });
        });

        const grouped = list.reduce((acc, item) => {
            if (!acc[item.macID]) {
                acc[item.macID] = [];
            }
            acc[item.macID].push(item);
            return acc;
        }, {});

        return grouped;
    } else {
        console.log("pls login");
        cookie = null;
        await login();
        return await get();
    }
}
async function get_energy_month(mac_id) {

    const d = await axios({
        url: "https://space-ui.momohub.net/sql_energy_month.php?mac_id=" + mac_id,
        headers: {
            "cookie": cookie,
        },
    })

    const energy = d.data.split('||');

    return {
        kwh_usage_today: energy[0],
        co2_emission_today: energy[1],
        kwh_usage_this_month: energy[2],
        co2_emission_this_month: energy[3],
    };
}


module.exports = { get, get_energy_month };