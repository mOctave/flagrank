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
const fs = require("fs");
const erl = require("express-rate-limit");
const connectDB = require("./config/db.js")
const env = require("./config/env.js")
const mongoose = require("mongoose");
const Flag = require("./models/Flag.js");
const { displayPage } = require("./services/pagedisplay.js");


// MARK: START
const app = express();

const limiter = erl.rateLimit({
	windowMs: 30 * 1000,
	limit: 60,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	ipv6Subnet: 60,
	handler: (req, res, next, options) => displayPage("errors/429", req, res, false)
});

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(limiter);
app.use("", require("./routes.js"));

const server = app.listen(env.mainPort, () => {
	console.log(`Express server running at http://localhost:${env.mainPort}`);
});

initDatabase();



// MARK: Functions
async function initDatabase() {
	await connectDB();

	const data = JSON.parse(fs.readFileSync("./flags.json"));

	for (let code in data) {
		if (await Flag.countDocuments({key: code}) === 0) {
			// A new flag exists in the JSON that doesn't exist in the database; add it

			try {
				if (data[code].disabled) continue;

				let longName = data[code].name;
				if (data[code].parent) {
					longName += ` (${data[data[code].parent].name})`;
				}

				const params = {
					name: data[code].name,
					longName: longName,
					image: env.flagDirectory + code.toLowerCase() + ".svg",
					key: code,
					parent: data[code].parent,
					flagsets: data[code].flagsets
				}

				await Flag.create(params);
			} catch (err) {
				console.error(`${err.message} (Code: ${code})`);
				console.trace();
			}
		}
	}
}
