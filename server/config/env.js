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

const { loadEnvFile } = require("node:process");

loadEnvFile("./.env");

const mainPort = process.env.MAIN_PORT ? process.env.MAIN_PORT : 8080;

const databasePort = process.env.DATABASE_PORT ? process.env.DATABASE_PORT : 27017;
const databaseName = process.env.DATABASE_NAME ? process.env.DATABASE_NAME : "net-moctave-flagrank";
const databaseUser = process.env.DATABASE_USER ? process.env.DATABASE_USER : null;
const databasePassword = process.env.DATABASE_PW ? process.env.DATABASE_PW : null;
const databaseServer = process.env.DATABASE_SERVER ? process.env.DATABASE_SERVER : "127.0.0.1";
const databaseURI = databaseUser ? `mongodb://${databaseUser}:${databasePassword}@${databaseServer}/${databaseName}`
	: `mongodb://${databaseServer}/${databaseName}`;

const flagDirectory = process.env.FLAG_DIRECTORY ? process.env.FLAG_DIRECTORY : "img/flag/";

module.exports = { mainPort, databaseURI, flagDirectory }
