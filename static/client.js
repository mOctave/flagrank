document.addEventListener("keypress", (e) => {
	if (e.key === "n" || e.key === "N" || e.key === " ") {
		location.reload();
	}
});

document.getElementById("option-a").addEventListener("click", async() => {
	console.log("Selected Option A!");
	const res = await fetch("/response", {
		method: "POST",
		headers: {
			"Match-ID": MATCH_ID,
			"Outcome": "A"
		}
	});

	const ratingChanges = adjustForVictory(FLAG_A, FLAG_B);
	document.getElementById("winchange-a").innerHTML = " +1";
	document.getElementById("winchange-a").style.color = "#3d3";
	document.getElementById("losschange-b").innerHTML = " -1";
	document.getElementById("losschange-b").style.color = "#c22";
	document.getElementById("ratingchange-a").innerHTML = ratingChanges.victor;
	document.getElementById("ratingchange-a").style.color = "#3d3";
	document.getElementById("ratingchange-b").innerHTML = ratingChanges.loser;
	document.getElementById("ratingchange-b").style.color = "#c22";
	for (elem of document.getElementsByClassName("details")) {
		elem.style.visibility = "visible";
	}

	transitionToNext();
});

document.getElementById("option-b").addEventListener("click", async() => {
	console.log("Selected Option B!");
	const res = await fetch("/response", {
		method: "POST",
		headers: {
			"Match-ID": MATCH_ID,
			"Outcome": "B"
		}
	});

	const ratingChanges = adjustForVictory(FLAG_B, FLAG_A);
	document.getElementById("winchange-b").innerHTML = " +1";
	document.getElementById("winchange-b").style.color = "#3d3";
	document.getElementById("losschange-a").innerHTML = " -1";
	document.getElementById("losschange-a").style.color = "#c22";
	document.getElementById("ratingchange-b").innerHTML = ratingChanges.victor;
	document.getElementById("ratingchange-b").style.color = "#3d3";
	document.getElementById("ratingchange-a").innerHTML = ratingChanges.loser;
	document.getElementById("ratingchange-a").style.color = "#c22";
	for (elem of document.getElementsByClassName("details")) {
		elem.style.visibility = "visible";
	}
	transitionToNext();
});


function transitionToNext() {
	let width = 0;

	const interval = setInterval(() => {
		width += 0.5;
		document.getElementById("progressbar").style.width = width + "vw";
		if (width >= 100) {
			location.reload();
		}
	}, 20);
}



// Client-side rating calculations
function ratingDeviation(obj) {
	return 500 / (obj.wins + obj.losses + obj.draws + 2);
}

function qScore(obj) {
	return Math.pow(10, obj.rating / 500);
}

function adjustForVictory(victor, loser) {
	let victorDifference = 1 - qScore(victor) / (qScore(victor) + qScore(loser));
	let victorChange = victorDifference * ratingDeviation(victor) / Math.max(Math.min(ratingDeviation(loser) / 50, 2), 1);

	let loserDifference = - qScore(loser) / (qScore(victor) + qScore(loser));
	let loserChange = loserDifference * ratingDeviation(loser) / Math.max(Math.min(ratingDeviation(victor) / 50, 2), 1);

	console.log(JSON.stringify(victor), JSON.stringify(loser));
	console.log(`Qscore: ${qScore(victor)} / ${qScore(loser)}`);
	console.log(`Victor: +${victorChange} from ${victorDifference}, Loser: ${loserChange}`);

	return {
		victor: ` +${Math.round(victorChange)}`,
		loser: ` ${Math.round(loserChange)}`,
	};
}

function adjustForDraw() {
	let aDifference = 0.5 - qScore(FLAG_A) / (qScore(FLAG_A) + qScore(FLAG_B));
	let aChange = aDifference * ratingDeviation(FLAG_A) / Math.max(Math.min(ratingDeviation(FLAG_B) / 50, 2), 1);

	let bDifference = 0.5 - qScore(FLAG_B) / (qScore(FLAG_A) + qScore(FLAG_B));
	let bChange = bDifference * ratingDeviation(FLAG_B) / Math.max(Math.min(ratingDeviation(FLAG_A) / 50, 2), 1);

	return {
		a: ` +${Math.round(aChange)}`,
		b: ` ${Math.round(bChange)}`,
	};
}
