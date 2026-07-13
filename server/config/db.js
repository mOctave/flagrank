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

const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async function() {
	try {
		await mongoose.connect(env.databaseURI);
		console.log("MongoDB connected successfully with Mongoose.");
	} catch (e) {
		console.error(`Failed to connect to MongoDB: ${e}`);
		exit(1);
	}
}

module.exports = connectDB;
