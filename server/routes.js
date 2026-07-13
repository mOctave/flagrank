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
const router = express.Router();
const { displayPage, displayFlagPage, displayLeaderboard, displayChoice } = require("./services/pagedisplay");
const { respondToChoice } = require("./services/flagmanager");

router.get("/", (req, res) => {
	displayPage("pages/index", req, res);
});

router.use((req, res, next) => {
	if (req.path.slice(-1) === '/' && req.path.length > 1) {
		const query = req.url.slice(req.path.length);
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
		res.redirect(301, safepath + query);
	} else {
		next();
	}
});

router.get("/flag-:code", (req, res) => {
	displayFlagPage(req, res);
});

router.get("/legal", (req, res) => {
	displayPage("pages/legal", req, res);
});

router.get("/match", (req, res) => {
	displayChoice(req, res);
});

router.get("/leaders", (req, res) => {
	displayLeaderboard(req, res);
});

router.post("/response", (req, res) => {
	respondToChoice(req, res);
});

router.get("/*splat", (req, res) => {
	res.status(404);
	displayPage("errors/404", req, res);
});

module.exports = router;
