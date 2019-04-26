var tangledsine = function(p) {


let amp = [];
let freq = [];
let vel = [];
let col = [];
let offset = [];
let numWaves = 12;
let width = 700;
let height = 200;

let phase = 0;

p.setup = function() {
  p.createCanvas(width, height);
  p.colorMode(p.HSB);
  p.stroke('white');
  p.strokeWeight(6);
  p.noFill();

  for(var j = 0; j < numWaves; j++){
    amp.push(p.map(j, 0, numWaves, 0.1*height, 0.4*height));
    freq.push(p.map(j,0,numWaves,3,0));
    vel.push(p.map(j,0,numWaves,2,5));
    offset.push(p.map(j, 0, numWaves, -p.PI, p.PI));
    col.push(p.color(p.map(j,0,numWaves,0,360),75,100));
  }

}

p.draw = function() {
  p.background(255);
  drawShape(phase);
  phase += 0.01 % p.PI;
}

function drawShape(){
  for(var j = 0; j < numWaves; j++){
    p.beginShape();
    p.stroke(col[j]);
    for(var i=0; i<1000; i++){
      let x = i * width/1000;
      p.vertex(x,
        amp[j] * p.sin(freq[j] * 2*p.PI*x/width + vel[j]*phase)
              * p.sin(2*p.PI*x/(2*width)  + 4*phase)
              * p.sin(2*p.PI*x/(2*width))
              + height/2
      );
    }
  p.endShape();
  }
}

};