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

async function get_lastupdate(mac_id) {
    // const list = [
    //     { id: 1, mac_id: "C4:D8:D5:29:50:28", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 2, mac_id: "3C:61:05:DB:AD:B8", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 3, mac_id: "EC:64:C9:F1:26:7D", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 4, mac_id: "40:91:51:56:60:96", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 5, mac_id: "40:91:51:56:60:71", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 6, mac_id: "40:91:51:56:60:CD", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 7, mac_id: "40:91:51:57:57:0D", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    //     { id: 8, mac_id: "40:91:51:56:89:59", api_key: "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H" },
    // ];
    const api_key = process.env.API_KEY || "BrKXa2GrEAvQA8FGxpf1eXulC4ptLOmgRFSoe0nShBDJcdH67H";
    const response = await axios({
        url: `https://space-ui.momospace.net/device_api/device_data/get_lastupdate.php?api_key=${api_key}&mac_id=${mac_id}`,
    });
    console.log(response.data);
    return response.data;
}

module.exports = { get, get_energy_month, get_lastupdate };