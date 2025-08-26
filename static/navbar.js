/*
Flagrank: Flag evaluation website.
Copyright (C) 2025 mOctave

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

const navmenuToggle = document.getElementById("navmenu-toggle");

navmenuToggle.addEventListener("click", () => {
	const navmenu = document.getElementById("navmenu");
	if (navmenuToggle.innerText === "☰") {
		navmenu.style.display = "block";
		navmenuToggle.innerText = "X";
	} else {
		navmenu.style.display = "none";
		navmenuToggle.innerText = "☰";
	}
	console.log("Toggled navbar");
});
