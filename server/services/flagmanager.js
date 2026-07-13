/*
Flagrank: Flag evaluation website.
Copyright (C) 2026 mOctave

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
const { getMatch, deleteMatch } = require("./matchmanager");

function totalGames(flag) {
	return flag.wins + flag.losses + flag.draws;
}

function ratingDeviation(flag) {
	return 500 / (totalGames(flag) + 2);
}

function getWinrate(flag) {
	return (flag.wins + flag.draws / 2 + 1) / (flag.wins + flag.draws + flag.losses + 2);
}

function qScore(flag) {
	return Math.pow(10, flag.rating / 500);
}

function formatRating(flag) {
	return Math.round(flag.rating);
}

async function adjustForVictory(victor, loser) {
	let victorDifference = 1 - qScore(victor) / (qScore(victor) + qScore(loser));
	let victorChange = victorDifference * ratingDeviation(victor) / Math.max(Math.min(ratingDeviation(loser) / 50, 2), 1);

	let loserDifference = - qScore(loser) / (qScore(victor) + qScore(loser));
	let loserChange = loserDifference * ratingDeviation(loser) / Math.max(Math.min(ratingDeviation(victor) / 50, 2), 1);

	console.log(`${victor.name} (${formatRating(victor)} + ${Math.round(victorChange)}) beat ${victor.name} (${formatRating(loser)} + ${Math.round(loserChange)}).`)

	victor.wins++;
	loser.losses++;
	victor.rating += victorChange;
	loser.rating += loserChange;
	await victor.save();
	await loser.save();
}

async function adjustForDraw(a, b) {
	let aDifference = 0.5 - qScore(a) / (qScore(a) + qScore(b));
	let aChange = aDifference * ratingDeviation(a) / Math.max(Math.min(ratingDeviation(b) / 50, 2), 1);

	let bDifference = 0.5 - qScore(b) / (qScore(a) + qScore(b));
	let bChange = bDifference * ratingDeviation(b) / Math.max(Math.min(ratingDeviation(a) / 50, 2), 1);

	console.log(`Draw between ${a.name} (${formatRating(a)} + ${Math.round(aChange)}) and ${b.name} (${formatRating(b)} + ${Math.round(bChange)}).`)

	a.draws++;
	b.draws++;
	a.rating += aChange;
	b.rating += bChange;
	await a.save();
	await b.save();
}

async function respondToChoice(req, res) {
	let id = req.get("Match-ID");
	const match = (getMatch(id));

	if (!match) {
		res.status(400);
		res.send("Invalid or expired match ID");
		return;
	}

	const flagA = await Flag.findOne(match.a);
	const flagB = await Flag.findOne(match.b);

	let outcome = req.get("Outcome");
	switch (outcome) {
		case "A":
			adjustForVictory(flagA, flagB)
			break;
		case "B":
			adjustForVictory(flagB, flagA)
			break;
		case "D":
			adjustForDraw(flagA, flagB)
			break;
		default:
			res.status(400);
			res.send("Invalid match outcome");
			return;
	}
	
	deleteMatch(id);
	res.status(200);
	res.send("Successfully updated ratings");
}

module.exports = { respondToChoice, getWinrate };
