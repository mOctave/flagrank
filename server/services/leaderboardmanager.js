/*
Flagrank: Flag evaluation website.
Copyright (C) 2025-2026 mOctave

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Flag = require("../models/Flag.js");
const { getWinrate } = require("./flagmanager.js")
const mongoose = require("mongoose");

let leaderboards = {};
let lastLeaderboardUpdate = 0;
const LEADERBOARD_UPDATE_INTERVAL = 1000 * 60 * 5 // Update every 5 minutes when called

async function update() {
	let array = await Flag.find();

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

		let classes = "leaderboard-entry";
		switch (rank) {
			case 1:
				classes += " leaderboard-first";
				break;
			case 2:
				classes += " leaderboard-second";
				break;
			case 3:
				classes += " leaderboard-third";
				break;
			default: break;
		}

		ratingLeaders += `
<a class="${classes}" href="/flag-${entry.key}">${rank}<img class="flag-icon" src="${entry.image}"/>${entry.name} ❖ ${Math.round(entry.rating)}</a>
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

		let classes = "leaderboard-entry";
		switch (rank) {
			case 1:
				classes += " leaderboard-first";
				break;
			case 2:
				classes += " leaderboard-second";
				break;
			case 3:
				classes += " leaderboard-third";
				break;
			default: break;
		}

		winrateLeaders += `
<a class="${classes}" href="/flag-${entry.key}">${rank}<img class="flag-icon" src="${entry.image}"/>${entry.name} ❖ ${Math.round(getWinrate(entry) * 1000) / 10}%</a>
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

		let classes = "leaderboard-entry";
		switch (rank) {
			case 1:
				classes += " leaderboard-first";
				break;
			case 2:
				classes += " leaderboard-second";
				break;
			case 3:
				classes += " leaderboard-third";
				break;
			default: break;
		}

		winLeaders += `
<a class="${classes}" href="/flag-${entry.key}">${rank}<img class="flag-icon" src="${entry.image}"/>${entry.name} ❖ ${entry.wins}&nbsp;wins</a>
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

		let classes = "leaderboard-entry";
		switch (rank) {
			case 1:
				classes += " leaderboard-first";
				break;
			case 2:
				classes += " leaderboard-second";
				break;
			case 3:
				classes += " leaderboard-third";
				break;
			default: break;
		}

		lossLeaders += `
<a class="${classes}" href="/flag-${entry.key}">${rank}<img class="flag-icon" src="${entry.image}"/>${entry.name} ❖ ${entry.losses}&nbsp;losses</a>
		`;
	}

	// Total Draws
	array.sort((a, b) => b.draws - a.draws);

	let drawLeaders = ``;
	rank = 0;
	lastScore = Infinity;
	backloggedRanks = 1;


	for (entry of array) {
		if (entry.draws < lastScore) {
			rank += backloggedRanks;
			lastScore = entry.draws;
			backloggedRanks = 1;
		} else {
			backloggedRanks++;
		}

		let classes = "leaderboard-entry";
		switch (rank) {
			case 1:
				classes += " leaderboard-first";
				break;
			case 2:
				classes += " leaderboard-second";
				break;
			case 3:
				classes += " leaderboard-third";
				break;
			default: break;
		}

		drawLeaders += `
<a class="${classes} href="/flag-${entry.key}">${rank}<img class="flag-icon" src="${entry.image}"/>${entry.name} ❖ ${entry.draws}&nbsp;draws</a>
		`;
	}

	// Update leaderboard object
	leaderboards = {
		ratings: ratingLeaders,
		winrate: winrateLeaders,
		wins: winLeaders,
		losses: lossLeaders,
		draws: drawLeaders
	};

	console.log("Updated leaderboards!");
}

async function getLeaderboards() {
	if (Date.now() - lastLeaderboardUpdate > LEADERBOARD_UPDATE_INTERVAL) {
		await update();
	}

	return leaderboards;
}

module.exports = { getLeaderboards }
