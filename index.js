const express = require("express");
const fs = require("fs");
const iso3166 = require("iso-3166-2");

let flags = {};
const MATCHES = {};
let connections = [];

// MARK: START
const app = express();
const config = JSON.parse(fs.readFileSync("./data/config.json"));
const PORT = config.port ? config.port : 8080;

app.set("view engine", "ejs");
app.use(express.static("static"));

if (!loadData())
	init();

app.get("/", (req, res) => {
	displayChoice(req, res);
});

app.get("/leaders", (req, res) => {
	displayLeaderboard(req, res);
});

app.post("/response", (req, res) => {
	respondToChoice(req, res);
});

const server = app.listen(PORT, () => {
	console.log(`Express server running at http://localhost:${PORT}`)
});

server.on("connection", connection => {
	connections.push(connection);
	connection.on("close", () => connections = connections.filter(curr => curr !== connection));
})

// Backup the data to a file every 8 hours, and as part of a graceful shutdown.
setInterval(saveData, 1000 * 60 * 60 * 8);
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);


// MARK: END




function initFlag(code, name, url) {
	flags[code] = {
		code: code,
		name: name,
		url: url,
		rating: 1500,
		wins: 0,
		losses: 0,
		draws: 0
	};
}

function totalGames(code) {
	return flags[code].wins + flags[code].losses + flags[code].draws;
}

function ratingDeviation(code) {
	return 500 / (totalGames(code) + 2);
}

function getWinrate(obj) {
	return (obj.wins + obj.draws / 2 + 1) / (obj.wins + obj.draws + obj.losses + 2);
}

function qScore(code) {
	return Math.pow(10, flags[code].rating / 500);
}

function formatRating(code) {
	return Math.round(flags[code].rating);
}

function adjustForVictory(victor, loser) {
	console.log("---");
	let victorDifference = 1 - qScore(victor) / (qScore(victor) + qScore(loser));
	let victorChange = victorDifference * ratingDeviation(victor) / Math.max(Math.min(ratingDeviation(loser) / 50, 2), 1);
	console.log(`Victor ${victor} was rated at ${formatRating(victor)}, earned ${victorDifference} more points than expected, changing rating by ${Math.round(victorChange)}.`);

	let loserDifference = - qScore(loser) / (qScore(victor) + qScore(loser));
	let loserChange = loserDifference * ratingDeviation(loser) / Math.max(Math.min(ratingDeviation(victor) / 50, 2), 1);
	console.log(`Loser ${loser} was rated at ${formatRating(loser)}, earned ${-loserDifference} less points than expected, changing rating by ${Math.round(loserChange)}.`);

	flags[victor].wins++;
	flags[loser].losses++;
	flags[victor].rating += victorChange;
	flags[loser].rating += loserChange;
	console.log("---");
}

function adjustForDraw(a, b) {
	console.log("---");
	let aDifference = 0.5 - qScore(a) / (qScore(a) + qScore(b));
	let aChange = aDifference * ratingDeviation(a) / Math.max(Math.min(ratingDeviation(b) / 50, 2), 1);
	console.log(`${a} was rated at ${formatRating(a)}, earned ${aDifference} more points than expected, changing rating by ${Math.round(aChange)}.`);

	let bDifference = 0.5 - qScore(b) / (qScore(a) + qScore(b));
	let bChange = bDifference * ratingDeviation(b) / Math.max(Math.min(ratingDeviation(a) / 50, 2), 1);
	console.log(`${b} was rated at ${formatRating(b)}, earned ${-bDifference} more points than expected, changing rating by ${Math.round(bChange)}.`);

	flags[a].draws++;
	flags[b].draws++;
	flags[a].rating += aChange;
	flags[b].rating += bChange;
	console.log("---");
}

function displayChoice(req, res) {
	let keys = Object.keys(flags);
	let first = keys[keys.length * Math.random() << 0];
	let second = keys[keys.length * Math.random() << 0];
	while (first === second) {
		// There's definitely a better way to do this, but this is good enough.
		second = keys[keys.length * Math.random() << 0];
	}

	let matchID = getMatchID();
	MATCHES[matchID] = {
		a: flags[first],
		b: flags[second],
		id: matchID
	}

	res.render("pages/index", MATCHES[matchID]);
}

function getMatchID() {
	return 0xffffffffffff * Math.random() << 0;
}

function respondToChoice(req, res) {
	let id = req.get("Match-ID");
	if (!MATCHES[id]) {
		res.status(400);
		res.send("Invalid or expired match ID");
		return;
	}

	let outcome = req.get("Outcome");
	switch (outcome) {
		case "A":
			adjustForVictory(MATCHES[id].a.code, MATCHES[id].b.code)
			break;
		case "B":
			adjustForVictory(MATCHES[id].b.code, MATCHES[id].a.code)
			break;
		case "D":
			adjustForDraw(MATCHES[id].a.code, MATCHES[id].b.code)
			break;
		default:
			res.status(400);
			res.send("Invalid or expired match ID");
			return;
	}
	
	delete MATCHES[id];
	res.status(200);
	res.send("Successfully updated ratings");
}

function init() {
	const data = JSON.parse(fs.readFileSync("./flags.json"));
	const category = config.category ? config.category : "";
	const flagdir = config.flagdir ? config.flagdir : "img/flag/";
	const noteparent = config.noteparent ? config.noteparent : true;

	for (let code in data) {
		try {
			if (data[code].disabled) continue;
			if (category && data[code].flagsets.indexOf(category) === -1) continue;

			let name = data[code].name;
			if (noteparent && data[code].parent) {
				name += ` (${data[data[code].parent].name})`;
			}

			initFlag(code, name, flagdir + code.toLowerCase() + ".svg");
		} catch (err) {
			console.error(err.message);
			console.trace();
		}
	}
}

function displayLeaderboard(req, res) {
	let array = Object.values(flags);

	// Rating
	array.sort((a, b) => b.rating - a.rating);

	let ratingLeaders = ``;
	let rank = 0;
	let lastScore = Infinity;
	let backloggedRanks = 1;


	for (entry of array) {
		if (entry.rating < lastScore) {
			rank += backloggedRanks;
			lastScore = entry.rating;
			backloggedRanks = 1;
		} else {
			backloggedRanks++;
		}

		ratingLeaders += `
<div class="leaderboard-entry">${rank}<img class="flag-icon" src="${entry.url}"/>${entry.name} ❖ ${Math.round(entry.rating)}</div>
		`;
	}

	// Winrate
	array.sort((a, b) => getWinrate(b) - getWinrate(a));

	let winrateLeaders = ``;
	rank = 0;
	lastScore = Infinity;
	backloggedRanks = 1;


	for (entry of array) {
		if (getWinrate(entry) < lastScore) {
			rank += backloggedRanks;
			lastScore = getWinrate(entry);
			backloggedRanks = 1;
		} else {
			backloggedRanks++;
		}

		winrateLeaders += `
<div class="leaderboard-entry">${rank}<img class="flag-icon" src="${entry.url}"/>${entry.name} ❖ ${Math.round(getWinrate(entry) * 1000) / 10}%</div>
		`;
	}

	// Total Wins
	array.sort((a, b) => b.wins - a.wins);

	let winLeaders = ``;
	rank = 0;
	lastScore = Infinity;
	backloggedRanks = 1;


	for (entry of array) {
		if (entry.wins < lastScore) {
			rank += backloggedRanks;
			lastScore = entry.wins;
			backloggedRanks = 1;
		} else {
			backloggedRanks++;
		}

		winLeaders += `
<div class="leaderboard-entry">${rank}<img class="flag-icon" src="${entry.url}"/>${entry.name} ❖ ${entry.wins}&nbsp;wins</div>
		`;
	}

	// Total Losses
	array.sort((a, b) => b.losses - a.losses);

	let lossLeaders = ``;
	rank = 0;
	lastScore = Infinity;
	backloggedRanks = 1;


	for (entry of array) {
		if (entry.losses < lastScore) {
			rank += backloggedRanks;
			lastScore = entry.losses;
			backloggedRanks = 1;
		} else {
			backloggedRanks++;
		}

		lossLeaders += `
<div class="leaderboard-entry">${rank}<img class="flag-icon" src="${entry.url}"/>${entry.name} ❖ ${entry.losses}&nbsp;losses</div>
		`;
	}

	res.render("pages/leaders", {ratings: ratingLeaders, winrate: winrateLeaders, wins: winLeaders, losses: lossLeaders});
}

function saveData() {
	console.log("Saving data...");
	if (fs.existsSync("./data/save~2.json"))
		fs.renameSync("./data/save~2.json", "./data/save~3.json");
	if (fs.existsSync("./data/save~1.json"))
		fs.renameSync("./data/save~1.json", "./data/save~2.json");
	if (fs.existsSync("./data/save.json"))
		fs.renameSync("./data/save.json", "./data/save~1.json");

	fs.writeFileSync("./data/save.json", JSON.stringify(flags));
	console.log("Saved!");
}

function loadData() {
	console.log("Loading data...");
	try {
		flags = JSON.parse(fs.readFileSync("./data/save.json"));
		console.log("Loaded!");
		return true;
	} catch {
		console.warn(`Could not load saved data. If there is no file at "./data/save.json", you can ignore this warning.`);
		return false;
	}
}

function gracefulShutdown() {
	console.log(`Attempting a graceful shutdown...`);
	saveData();

	server.close(() => {
		console.log(`Flagrank performed a graceful shutdown at ${new Date()}.`);
		process.exit(0);
	})

	connections.forEach(curr => curr.end());
	setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);

	setTimeout(() => {
		console.error(`Graceful shutdown attempted timed out at ${new Date()}. Some data may have been lost.`);
		process.exit(1);
	}, 10000);
}
