window.onload = function () {
	init();
};

var bluePoints = [];
var redPoints = [];
var pointHistory = [];

function init() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	clearBtn = document.getElementById("clearBtn");
	
	clearBtn.addEventListener("click", clear, false);

	window.addEventListener("click", canvasClick, false);
	window.addEventListener('resize', scaleCanvas, false);

	document.addEventListener('keydown', onKeyDown);
	document.addEventListener('keyup', onKeyUp);

	// Example data
	bluePoints = [[0.0001871584699453553, 0.3341683366733466], [0.30327868852459017, 0.3712424849699398], [0.36475409836065587, 0.44038076152304595], [0.3982240437158471, 0.4754509018036072], [0.4105191256830601, 0.5185370741482965], [0.42554644808743175, 0.3662324649298597], [0.4282786885245902, 0.2560120240480962], [0.35450819672131145, 0.25], [0.33948087431693996, 0.32515030060120237], [0.34289617486338797, 0.37625250501002017], [0.369535519125683, 0.42935871743487014], [0.25, 0.5756513026052102], [0.296448087431694, 0.6317635270541075], [0.33948087431693996, 0.6688376753507007], [0.3729508196721313, 0.6648296593186371], [0.4084699453551913, 0.5996993987975956], [0.42759562841530063, 0.5706412825651304], [0.4153005464480875, 0.5035070140280564], [0.40300546448087426, 0.4283567134268537], [0.4282786885245902, 0.3902805611222445], [0.5027322404371585, 0.36222444889779565], [0.5013661202185792, 0.3191382765531062], [0.33811475409836067, 0.5786573146292584], [0.2882513661202187, 0.5215430861723449], [0.269808743169399, 0.4884769539078156]];
	redPoints = [[0.5853825136612022, 0.5455911823647296], [0.6154371584699454, 0.6067134268537073], [0.6352459016393444, 0.6297595190380757], [0.5607923497267759, 0.6337675350701404], [0.4972677595628415, 0.5996993987975956], [0.46311475409836067, 0.4994989979959922], [0.47472677595628404, 0.44438877755511014], [0.5382513661202185, 0.4383767535070143], [0.601775956284153, 0.5075150300601204], [0.6448087431693988, 0.5896793587174352], [0.6782786885245902, 0.6768537074148293], [0.6229508196721312, 0.7409819639278553], [0.5532786885245902, 0.75], [0.5635245901639344, 0.7399799599198391], [0.5881147540983607, 0.6628256513026052], [0.6632513661202185, 0.610721442885771], [0.6871584699453551, 0.5385771543086177], [0.6202185792349727, 0.3271543086172344], [0.6004098360655737, 0.32615230460921857], [0.6598360655737705, 0.5075150300601204], [0.7069672131147542, 0.6187374749498994], [0.75, 0.6768537074148293], [0.6454918032786885, 0.45541082164328683], [0.5416666666666666, 0.7289579158316633], [0.47472677595628404, 0.6838677354709417], [0.4788251366120218, 0.6548096192384764]];

	// Radius of points
	radius = 5;

	scaleCanvas();
	drawCanvas();
}

function scaleCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	drawCanvas();
}

shiftPressed = false;
function onKeyDown(event) {
	if (event.key == "Shift") {
		shiftPressed = true;
	}

	if (event.ctrlKey && event.key == "z") {
		undo();
	}
}


function onKeyUp(event) {
	if (event.key == "Shift") {
		shiftPressed = false;
	}

	if (event.key == "Enter") {
		projectData();
	}

	if (event.key == " ") {
		clear();
	}
}

function canvasClick(event) {

	if (event.target.tagName == "BUTTON") {
		return;
	}

	var x = (event.pageX - canvas.offsetLeft) / canvas.width;
	var y = (event.pageY - canvas.offsetTop) / canvas.height;

	if (shiftPressed) {
		redPoints.push([x, y]);
		pointHistory.push('r');
	} else {
		bluePoints.push([x, y]);
		pointHistory.push('b');
	}

	drawCanvas();
}

function clear() {
	$("#canvas").fadeOut(300, function () {
		redPoints = [];
		bluePoints = [];
		drawCanvas();
		$("#canvas").fadeIn();
	});
}

function undo() {
	if (pointHistory.length == 0) {
		return;
	}

	var lastColor = pointHistory[pointHistory.length - 1];

	if (lastColor == 'b') {
		bluePoints.splice(bluePoints.length - 1, 1);
	} else {
		redPoints.splice(redPoints.length - 1, 1);
	}

	pointHistory.splice(pointHistory.length - 1, 1);

	drawCanvas();
}

function drawCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);

	plotPoints(bluePoints, "#007bFF");
	plotPoints(redPoints, "#FF7b00");

	computeLDA();
}

function plotPoints(points, color) {
	for (var i = 0; i < points.length; i++) {
		var point = points[i];
		var x = Math.round(point[0] * canvas.width);
		var y = Math.round(point[1] * canvas.height);
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.fillStyle = color;
		context.fill();
	}
}

function cov(a) {
	// From https://math.stackexchange.com/questions/561340/how-to-calculate-the-covariance-matrix
	var n = a.size()[0];
	var x = math.subtract(a, math.multiply((1 / n), math.ones(n, 1), math.ones(1, n), a));
	var y = math.multiply(math.transpose(x), x);
	return math.multiply(1 / (n - 1), y);
}

function mean(a) {
	// Compute the mean of each column
	var result = math.zeros(1, a.size()[1]);
	var n = a.size()[0];
	for (var i = 0; i < n; i++) {
		result = math.add(result, math.matrix([a.toArray()[i]]));
	}
	return math.multiply(1 / n, result);
}

function scalePointsToCanvas(points) {
	var scaledPoints = [];
	for (var i = 0; i < points.length; i++) {
		scaledPoints.push([points[i][0] * canvas.width, points[i][1] * canvas.height]);
	}
	return scaledPoints;
}

function computeLDA() {
	// Make sure we have at least 2 points in each set
	if (bluePoints.length < 2 || redPoints.length < 2) {
		return;
	}

	// Scale points (which range from 0 to 1) to canvas coordinates
	var scaledBlue = scalePointsToCanvas(bluePoints);
	var scaledRed = scalePointsToCanvas(redPoints);

	// Compute LDA
	var c1 = math.matrix(scaledBlue);
	var c2 = math.matrix(scaledRed);
	var mu1 = math.transpose(mean(c1));
	var mu2 = math.transpose(mean(c2));
	var pooledCov = math.add(cov(c1), cov(c2));
	theta = math.multiply(math.inv(pooledCov), math.subtract(mu2, mu1));
	b = math.multiply(-1, math.transpose(theta), math.add(mu1, mu2), 1 / 2).get([0, 0]);

	// Draw the result
	drawSeparationLine(theta, b);
}

function drawSeparationLine(theta, b) {
	// By default draw from x = 0 to canvasWidth
	// If these x values cause y values outside the canvas
	// Then change the x values so the line fits within the canvas
	x1 = 0;
	x2 = canvas.width;
	y1 = (theta.get([0, 0]) * x1 + b) / (-1 * theta.get([1, 0]));
	y2 = (theta.get([0, 0]) * x2 + b) / (-1 * theta.get([1, 0]));
	// TODO: Update x values if y values are too large
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.strokeStyle = "#7b7b7b";
	context.stroke();
}