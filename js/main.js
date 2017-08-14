var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var points = [];
var classifications = [];
var current_classification = 'blue';

canvas.addEventListener('click', canvasClick, false);
document.getElementById('toggle_btn').addEventListener('click', toggleColor, false);
document.getElementById('separate_btn').addEventListener('click', computeLDA, false);

updateToggleText();

function canvasClick(event){
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  points.push([x, y]);
  classifications.push(current_classification);
  // Update the canvas
  drawCanvas();
}

function toggleColor(){
  if(current_classification == 'blue'){
    current_classification = 'red';
  }else{
    current_classification = 'blue';
  }
  updateToggleText();
}

function updateToggleText(){
  document.getElementById('toggle_status').innerHTML = '(Current: ' + current_classification + ')';
}

function drawCanvas(){
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw all the points
  var radius = 5;
  for(var i=0; i<points.length; i++){
    var x = Math.round(points[i][0]);
    var y = Math.round(points[i][1]);
    var color = classifications[i];
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
  }
}

function cov(a){
  // Thanks to https://math.stackexchange.com/questions/561340/how-to-calculate-the-covariance-matrix
  var n = a.size()[0];
  var x = math.subtract(a, math.multiply((1 / n), math.ones(n, 1), math.ones(1, n), a));
  var y = math.multiply(math.transpose(x), x);
  return math.multiply(1 / (n-1), y);
}

function mean(a){
  // Compute the mean of each column
  var result = math.zeros(1, a.size()[1]);
  var n = a.size()[0];
  for(var i=0; i<n; i++){
    result = math.add(result, math.matrix([a.toArray()[i]]));
  }
  return math.multiply(1 / n, result);
}

function computeLDA(){
  var set1 = [];
  var set2 = [];
  // Separate the points into each of their respective sets
  for(var i = 0; i<points.length; i++){
    if(classifications[i] == 'blue'){
      set1.push(points[i]);
    }else{
      set2.push(points[i]);
    }
  }
  // Make sure we have at least 2 points in each set
  if(set1.length < 2 || set2.length < 2){
    notify('Please place at least 2 of each type of point');
    return;
  }
  // Compute LDA
  var c1 = math.matrix(set1);
  var c2 = math.matrix(set2);
  var mu1 = math.transpose(mean(c1));
  var mu2 = math.transpose(mean(c2));
  var pooledCov = math.add(cov(c1), cov(c2));
  theta = math.multiply(math.inv(pooledCov), math.subtract(mu2, mu1));
  b = math.multiply(-1, math.transpose(theta), math.add(mu1, mu2), 1/2).get([0, 0]);

  // Draw the result
  drawSeparationLine(theta, b);
}

function drawSeparationLine(theta, b){
  // By default draw from x = 0 to canvasWidth
  // If these x values cause y values outside the canvas
  // Then change the x values so the line fits within the canvas
  x1 = 0;
  x2 = canvas.width;
  y1 = (theta.get([0, 0]) * x1 + b) / (-1 * theta.get([1, 0]));
  y2 = (theta.get([0, 0]) * x2 + b) / (-1 * theta.get([1, 0]));
  // TODO: Update x values if y values are too large
  context.beginPath();
  context.moveTo(x1,y1);
  context.lineTo(x2,y2);
  context.stroke();
}

var notifyTimeout;
function notify(message){
  document.getElementById('notification').innerHTML = message;
  clearTimeout(notifyTimeout);
  notifyTimeout = setTimeout(function(){
    document.getElementById('notification').innerHTML = '';
  }, 5000);
}
