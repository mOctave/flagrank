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

const MATCHES = {};

function createMatch(first, second) {
	const id = makeId();
	MATCHES[id] = {
		a: first,
		b: second,
		id: id
	};
	return id;
}

function getMatch(id) {
	return MATCHES[id];
}


function deleteMatch(id) {
	MATCHES[id] = undefined;
}

function makeId() {
	return 0xffffffffffff * Math.random() << 0;
}

module.exports = { createMatch, getMatch, deleteMatch }
