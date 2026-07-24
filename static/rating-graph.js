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

const height = 200;

window.onload = updateGraphs;

window.addEventListener("resize", updateGraphs);

function updateGraphs() {
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
		let firstTime = Date.parse(flag.historicalRatings[0].date);
		let lastTime = new Date().getTime();


		// Add flags
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
