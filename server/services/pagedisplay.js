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

const express = require("express");
const Flag = require("../models/Flag")
const mongoose = require("mongoose");
const { createMatch, getMatch } = require("./matchmanager");
const { getLeaderboards } = require("./leaderboardmanager");


async function displayPage(page, req, res) {
	const DATA = {
		flags: await getTopFlags()
	};

	res.render(page, DATA);
}

async function displayFlagPage(req, res) {
	const code = req.params.code.toUpperCase();

	const flag = await Flag.findOne({key: code});

	if (!flag) {
		res.status(404);
		displayPage("errors/404", req, res);
		return;
	}

	const DATA = {
		flag: flag
	};

	res.render("pages/flag", DATA);
}

async function displayLeaderboard(req, res) {
	res.render("pages/leaders", await getLeaderboards());
}

async function displayChoice(req, res) {
	const first = await Flag.random();
	let second = await Flag.random();
	while (first.key === second.key) {
		// There's definitely a better way to do this, but this is good enough.
		second = await Flag.random();
	}
	console.log(`${first.longName} vs ${second.longName}`);

	const matchId = createMatch(first, second);
	res.render("pages/match", getMatch(matchId));
}

async function displayFlagsetPage(req, res) {
	const flagset = req.params.name.replaceAll("_", " ");

	const flags = await Flag.find({flagsets: flagset}).sort({rating: "descending"});

	if (!flags) {
		res.status(404);
		displayPage("errors/404", req, res);
		return;
	}

	const DATA = {
		flagset: flagset,
		flags: flags
	};

	res.render("pages/flagset", DATA);
}

async function getTopFlags() {
	// I may want to restore the randomness here in the future, but for now this works
	return await Flag.find().sort({"rating": "descending"}).limit(50);
}

module.exports = { displayPage, displayFlagPage, displayLeaderboard, displayChoice, displayFlagsetPage };
