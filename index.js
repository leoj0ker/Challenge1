import express from "express";
import Client from "@replit/database";
import fetch from "node-fetch";

const app = express();

const db = new Client();
const banned = [];

let userscache, pfpcache = {};

// make sure the interval (test end) < (test start)
let timesep = {
    /* user: {
        endDate: new Date(),
        test: {
            wpm: num,
            acc: num
        }
    } */
};

async function setUserInterval() {
    await setUsers();
    // every 2 minutes
    setTimeout(setUserInterval, 1000 * 2 * 60);
}

await setUserInterval();

// console.log(await db.get("users"));

/************************************/
// database saving
/*
import { writeFileSync } from "fs";
writeFileSync("db.json", JSON.stringify(await db.get("users"), null, 2));
*/

// database loading
/*
import { readFileSync } from "fs";
const json = JSON.parse(readFileSync("db.json", "utf-8"));
await db.set("users", json);
*/

/************************************/
// temp reset
// await db.set("users", {});
// await db.set("pfps", {});

/************************************/
// slowly migrate users to the new pfp system
/*
async function backgroundPfp() {
    const users = await db.get("users");
    for (const username in users) {
        if (!pfpcache[username]) {
            console.log("pfpfound", username);
            const pfp = await getPfp(username);
            pfpcache[username] = pfp;
            await new Promise(res => setTimeout(res, 2000));
        }
    }

    await db.set("pfps", pfpcache);
}

backgroundPfp();
*/

/************************************/
// db validator
// wpm,
// score,
// tests: [{ wpm, acc }],
// wins: 0
/*
{
    const users = await db.get("users");
    for (const username in users) {
        const user = users[username];
        const tests = user.tests;
        for (let i = 0; i < tests.length; i++) {
            const test = user.tests[i];
            if (test.wpm > 200 || test.acc > 100 || test.wpm < 0 || test.acc < 0) {
                user.tests.splice(i, 1);
            }
        }

        if (user.wpm > 200) {
            user.wpm = 0;
            user.points = Math.round(user.points / 2);
        }

        if (user.wpm == 0) {
            user.wpm = 110;
        }
    }

    await db.set("users", users);
}
*/


// HELLO WORLD IT IS BOOKIE
app.set("view engine", "ejs");
app.set("views", "views");


app.use(express.static('public'));
app.use(express.static('favicons'));
app.use(express.json());

app.use((req, res, next) => {
    res.locals.username = req.headers["x-replit-user-name"];
    
    next();
});

app.get("/", (req, res) => {
    res.render("index", { nosmooth: req.query.nosmooth });
});

app.post("/", async (req, res) => {
    const username = res.locals.username;
    if (!username) {
        console.log("!username");
        res.end("trolled");
        return;
    }

    if (banned.includes(username.toLowerCase())) {
        console.log("!banned", username);
        res.end("trolled");
        return;
    }
    
    // todo: check if data is valid
    const users = await db.get("users");

    try {
        let pb = false;
        
        const { wrong, typed, wpm: w, start, end } = req.body;
        const wpm = Math.round(w);
        const score = Math.floor((typed - wrong) * wpm / 100);
        const acc = Math.floor((1 - wrong / typed) * 100);
    
        if (wrong == null || typed == null || wpm == null || start == null || end == null || !new Date(start).getTime() || !new Date(end).getTime()) {
            console.log("!wrong", wrong, typed, wpm, start, end, username);
            res.end("trolled");
            return;
        }

        // more than 5 minutes (hopefully no internet connection is that slow)
        if ((new Date() - new Date(end)) > 5 * 60 * 1000) {
            console.log("!toolong", username);
            res.end("trolled");
            return;
        }

        // i don't think anyone can type faster than 200 in a words 25
        if (wpm > 200 || wpm < 0 || score < 0) {
            console.log("!wpmtoohigh", username);
            res.end("trolled");
            return;
        }

        if (start == end) {
            console.log("!start=end", username);
            res.end("trolled");
            return;
        }

        if (wrong > typed) {
            console.log("!toowrong", username);
            res.end("trolled");
            return;
        }

        const timestamp = timesep[username];
        if (timestamp) {
            /* user: {
                endDate: new Date(),
                test: {
                    wpm: num,
                    acc: num
                }
            } */
            const { endDate, test: { wpm: twpm, acc: tacc } } = timestamp;

            // console.log(endDate, twpm, tacc, wpm, acc);
            
            if (endDate >= new Date().getTime()) {
                console.log("!tooearly", username);
                res.end("trolled");
                return;
            }

            if (twpm == wpm && tacc == acc) {
                console.log("!dupetest", username);
                res.end('trolled');
                return;
            }
        }

        const potwpm = calcwpm(start, end, wrong, typed);

        // good for rounding error
        if (Math.abs(potwpm - wpm) > 0.1) {
            console.log("!correctwpm", username, potwpm, wpm);
            res.end("trolled");
            return;
        }
    
        if (!users[username]) {
            pb = true;
            
            users[username] = {
                wpm,
                score,
                tests: [{ wpm, acc }],
                wins: 0
            };

            pfpcache[username] = await getPfp(username);
    
            await db.set("users", users);
            await db.set("pfps", pfpcache);
            await setUsers();
            console.log("newuser", username);
        } else {
            const user = users[username];
            
            if (user.wpm < wpm) {
                pb = true;
                
                user.wpm = wpm;
                
                console.log(`pb ${username}: ${wpm}!`);
            }

            if (!user.score) user.score = 0;
            user.score += score;
            user.tests.push({ wpm, acc });
            
            await db.set("users", users);
        }

        /* user: {
            endDate: new Date(),
            test: {
                wpm: num,
                acc: num
            }
        } */
        
        timesep[username] = {
            endDate: new Date(end),
            test: {
                wpm,
                acc
            }
        };

        if (pb) {
            await setUsers();
            res.end("pb");
        }
        else res.end();
    } catch (e) {
        console.log("error", e);
        res.end("trolled");
    }
});

/*
app.get("/multiplayer", (_, res) => {
    res.render("multiplayer"); 
});
*/

/*
wpm,
score,
tests: [{ wpm, acc }],
wins: 0
*/
app.get("/user/:username", async (req, res) => {
    try {
        let username = req.params.username;
        const mini = req.query.mini || false;
        
        const users = await db.get("users");
        let user = users[username];
    
        // capitalization thing
        if (!user) {
            const keys = Object.keys(users);
            username = keys[keys.findIndex(k => k.toLowerCase() == username.toLowerCase())];
            user = users[username];
        }
    
        if (!user) {
            res.render("noprof", { user: req.params.username });
        } else {
            const tlength = user.tests.length;
            
            const wpm = user.wpm;
            const score = user.score;
            const avgwpm = user.tests.reduce((acc, c) => acc + c.wpm, 0) / tlength;
            const avgacc = user.tests.reduce((acc, c) => acc + c.acc, 0) / tlength;
    
            let rank = userscache.findIndex(user => user.username == username) + 1;
            let pfp = pfpcache[username];

            if (!pfp) {
                const url = await getPfp(username);
                pfp = url;
                pfpcache[username] = url;
                await db.set("pfps", pfpcache);
            }
            
            const tests = user.tests.slice(-5).reverse();
            const home = res.locals.username;
            
            res.render("prof", { home, username, wpm, score, avgwpm, avgacc, mini, pfp, rank, tests });
        }
    } catch (e) {
        console.log("proferror", e);
        res.end("Something bad happened! Try again in 5 minutes!");
    }
});

/*
    [{
        username: "Coder100",
        wpm: "199",
        score: 399
    }]
*/
app.get("/leaders", async (_, res) => {
    res.render("leaders", { users: userscache, pfps: pfpcache });
});

app.get("/about", (_, res) => {
    res.render("about");
});

app.get("/book", (_, res) => {
    res.render("book");
});

async function getPfp(user, capacity = 2, retry = false) {
    try {
        return (await fetch("https://replit.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json",
                "User-Agent": "Mozilla/2.0",
                "Referrer": "https://replit.com",
                "Origin": "https://replit.com",
                "Cookie": "connect.sid="
            },
            body: JSON.stringify({
                "operationName": "profpic",
                "variables": {
                    "username": user
                },
                "query": `query profpic($username: String!) {
                    userByUsername(username: $username) {
                        image
                    }
                }`
            })
        }).then(r => r.json())).data.userByUsername.image;
    } catch (e) {
        // prof error: too many requests
        // mitigate: await 5 seconds
        if (!retry) {
            return await new Promise(res => {
                setTimeout(() => {
                    res(getPfp(user, true));
                }, 1000 * capacity);
            });
        } else {
            // when next user loads, still a chance of revival
            return null;
        }
    }
}

/*
const mins100 = Math.round((end - this.start) / 60);
const mins = mins100 / 1000;

const ind = this.textarea.value;
const words = ind.split(" ").length;

const wmin100 = Math.round((words / mins) * 100);
const wmin = wmin100 / 100;

const accuracy100 = Math.round((this.wrong / this.typed) * 100);
const accuracy = 1 - accuracy100 / 100;

const wpm = accuracy * wmin;
return Math.max(wpm, 0);
*/
function calcwpm(start, end, wrong, typed) {
    const mins100 = Math.round((new Date(end) - new Date(start)) / 60);
    const mins = mins100 / 1000;
    
    const words = 25;
    
    const wmin100 = Math.round((words / mins) * 100);
    const wmin = wmin100 / 100;

    const accuracy100 = Math.round((wrong / typed) * 100);
    const accuracy = 1 - accuracy100 / 100;
    
    const wpm = accuracy * wmin;
    
    return Math.round(Math.max(wpm, 0));
}

async function setUsers() {
    pfpcache = await db.get("pfps");
    const users = await db.get("users");
    
    const array = [];
    let i = 0;
    
    for (const username in users) {
        const user = users[username];
        
        array.push({
            username,
            wpm: Math.floor(user.wpm),
            score: user.score || 0,
        });
    }

    array.sort((a, b) => (b.score + b.wpm) - (a.score + a.wpm));

    userscache = array;
}


app.listen(8080);
console.log("Ready on 8080");