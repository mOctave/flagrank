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

const mongoose = require("mongoose");

const FlagSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	longName: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	key: {
		type: String,
		required: true,
		unique: true
	},
	parent: {
		type: String,
		required: false
	},
	flagsets: {
		type: [String],
		required: true,
		default: []
	},
	wins: {
		type: Number,
		required: true,
		default: 0
	},
	draws: {
		type: Number,
		required: true,
		default: 0
	},
	losses: {
		type: Number,
		required: true,
		default: 0
	},
	rating: {
		type: Number,
		required: true,
		default: 1500
	},
	historicalRatings: {
		// TODO: Add support for rating history
		date: {type: Date, required: true, default: new Date()},
		rating: {type: Number, required: true, default: 1500}
	}
});

FlagSchema.statics.random = async function() {
	const count = await this.countDocuments();

	const match = await this.findOne().skip(Math.floor(Math.random() * count));
	return match;
};

module.exports = mongoose.model("Flag", FlagSchema);
