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

const ratingGraphs = document.getElementsByClassName("rating-graph");
const ratingButtons = document.getElementsByClassName("rating-button");

let graphMode = "all";

const height = 200;

window.onload = () => {updateGraphs("all")};

window.addEventListener("resize", () => {updateGraphs(graphMode)});

function changeMode(event, mode) {
	for (let button of ratingButtons) {
		button.classList.remove("active");
	}

	event.currentTarget.classList.add("active");

	graphMode = mode;
	updateGraphs(graphMode);
}

function updateGraphs(mode) {
	console.log("Updating graphs");
	for (let ratingGraph of ratingGraphs) {
		const width = ratingGraph.getBoundingClientRect().width;
		console.log(`This element has width ${width}`);

		ratingGraph.setAttribute("width", `${width}`);
		ratingGraph.setAttribute("height", `${height}`);
		ratingGraph.setAttribute("viewBox", `0 0 ${width} ${height}`);

		ratingGraph.innerHTML = "";


		for (let i = 1; i <= 5; i++) {
			ratingGraph.innerHTML += `
				<path class="rating-gridline" d="M${0} ${i * height / 6.} L${width} ${i * height / 6.}"/>
				<text class="rating-label" x="${5}" y="${(6 - i) * height / 6. - 5}">${500 * i}</text>
			`;
		}


		let started = false;
		let firstTime;
		let lastTime = new Date().getTime();

		// Set the bounds for the graph
		switch (mode) {
			case "day":
				firstTime = lastTime - 1000 * 60 * 60 * 24;
				break;
			case "week":
				firstTime = lastTime - 1000 * 60 * 60 * 24 * 7;
				break;
			case "month":
				firstTime = lastTime - 1000 * 60 * 60 * 24 * 30;
				break;
			case "quarter":
				firstTime = lastTime - 1000 * 60 * 60 * 24 * 90;
				break;
			case "year":
				firstTime = lastTime - 1000 * 60 * 60 * 24 * 365;
				break;
			default:
				firstTime = Date.parse(flag.historicalRatings[0].date);
				break;
		}

		// Figure out where to draw gridlines
		const hour = 1000 * 60 * 60;
		const overflowWidth = 100;

		let roundOptions = [1, 2, 3, 4, 6, 8, 12, 24, 24 * 3, 24 * 7, 24 * 14, 24 * 30, 24 * 90, 24 * 180, 24 * 365, 24 * 365 * 5];
		let maxDivisions = Math.floor(width / overflowWidth);
		let minRound = (lastTime - firstTime) / maxDivisions;
		let round;
		for (let roundMulti of roundOptions) {
			if (hour * roundMulti >= minRound) {
				round = hour * roundMulti;
				break;
			}
		}

		// Figure out how to format gridline labels
		let dateImportant = (lastTime - firstTime) > hour * 24 ? true : false;
		let yearImportant = (lastTime - firstTime) > hour * 24 * 365 ? true : false;
		let timestampMode;

		if (yearImportant) {
			timestampMode = {year: "numeric", month: "short", day: "numeric"};
		} else if (dateImportant && round <= hour * 24) {
			timestampMode = {month: "short", day: "numeric", hour: "numeric", minute: "numeric"};
		} else if (dateImportant) {
			timestampMode = {month: "short", day: "numeric"};
		} else {
			timestampMode = {timeStyle: "short"};
		}

		
		// Finally draw the vertical gridlines
		let importantTimes = [];
		let currentTime = new Date(Math.floor(lastTime / round) * round);
		while (currentTime > firstTime) {
			importantTimes.push(currentTime);
			currentTime -= round;
		}

		for (let time of importantTimes) {
			let x = (time - firstTime) / (lastTime - firstTime) * width;
			let dateText = new Date(time).toLocaleString(undefined, timestampMode);

			ratingGraph.innerHTML += `
				<path class="rating-gridline" d="M${x} ${0} L${x} ${height}"/>
				<text class="rating-label" x="${x+5}" y="${height - 5}">${dateText}</text>
			`;
		}

		// Add rating lines
		for (let i = flag.historicalRatings.length; i > 0; i--) {
			let startTime = Date.parse(flag.historicalRatings[i - 1].date);
			let endTime = started ? Date.parse(flag.historicalRatings[i].date) : lastTime;
			console.log(startTime);
			console.log(endTime);

			let startX = (startTime - firstTime) / (lastTime - firstTime) * width;
			let endX = (endTime - firstTime) / (lastTime - firstTime) * width;
		
			let rating = started ? flag.historicalRatings[i].rating : flag.rating;

			let y = (1 - rating / 3000) * height;
			let oldY = (1 - flag.historicalRatings[i - 1].rating / 3000) * height;

			ratingGraph.innerHTML += `
				<path class="rating-graph-line" d="M${startX} ${y} L${endX} ${y}"/>
				<path class="rating-graph-line" d="M${startX} ${oldY} L${startX} ${y}"/>
			`;

			started = true;
		}
	}
}
