function myRound(n) {
  return Math.round(1000*n)/1000;
}

let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let intervalLabels = [
  'unison',
  'minor second',
  'major second',
  'minor third',
  'major third',
  'perfect fourth',
  'dimished fifth / tritone',
  'perfect fifth',
  'minor sixth',
  'major sixth',
  'minor seventh',
  'major seventh',
  'octave'
];

function getIntervals(peaks) {
  let intervals = [];

  for (let peak of peaks) {
    let x = peak.x;
    let m = intervalToMidi(x);

    intervals.push({
      x: x,
      y: peak.y,
      midi: m,
      note: midiToNote(m),
      interval: intervalLabels[Math.round(m) - 60]
    })
  }

  //intervals.sort((a,b) => a.x < b.x);

  return intervals;
}

function intervalToMidi(i) {
  return 12 * Math.log(i)/Math.log(2) + 60;
}

function midiToNote(m0) {
  let m = Math.round(m0);
  return notes[m % 12] + String(Math.floor(m / 12));
}

function ampToLoudness(amp) {
  // first convert amplitude to dB
  // db = 20*log10(amp)
  let dB = 20*Math.log(amp)/Math.log(10);
  // then convert db to sones
  let loudness = Math.pow(2, dB/10)/16;

  return loudness;
}

function dissonance(f1, f2, l1, l2) {
  let x = 0.24;
  let s1 = 0.0207;
  let s2 = 18.96;
  let fmin = Math.min(f1, f2);
  let fmax = Math.max(f1, f2);
  let s = x / (s1 * fmin + s2);
  let p = s * (fmax - fmin);

  let b1 = 3.51;
  let b2 = 5.75;

  let l12 = Math.min(l1,l2);

  return l12 * (Math.exp(-b1*p) - Math.exp(-b2*p));
}


function getPeaks(data2d)
{

  let [xArr, yArr] = data2d;

  //let slopeCutoff = 0;   // more negative = fewer peaks
  let peaks = [{
    x: xArr[0],
    y: yArr[0]
  }];

  for (i = 1; i<yArr.length; i++)
  {

    // calculate derivative
    let point1 = {
      index: i,
      x: xArr[i],
      y: smoothSlope(yArr, i)
    };

    let point2 = {
      index: i + 1,
      x: xArr[i + 1],
      y: smoothSlope(yArr, i + 1)
    };

    if( point1.y <= 0 && point2.y > 0 )
    {

      let minima = {};

      // linearly interpolate derivative to find frequency where derivative crosses zero
      let secondDerivative = (point2.y - point1.y) / (point2.x - point1.x);
      minima.x = point1.x - point1.y/secondDerivative;

      // filter for peaks with slope steeper than cutoff
      if(secondDerivative > slopeCutoff)
      {
        // linearly interpolate FFT to find energy where derivative crosses zero
        let slope = yArr[point2.index] - yArr[point1.index];
        minima.y = yArr[point1.index] + slope * (minima.x - point1.x);

        peaks.push(minima);
      }
    }
  }

  return peaks;
}

function findSlope(array,index){
  return array[index+2]-array[index-2];
}

function smoothSlope(array,index){
  return findSlope(array,index);
  //return (findSlope(array,index-1)+findSlope(array,index)+findSlope(array,index+1))/3;
  //return (findSlope(array,index-2)+2*findSlope(array,index-1)+3*findSlope(array,index)+2*findSlope(array,index+1)+findSlope(array,index+2))/9;
  //return (findSlope(array,index-3)+3*findSlope(array,index-2)+6*findSlope(array,index-1)+7*findSlope(array,index)+6*findSlope(array,index+1)+3*findSlope(array,index+3)+findSlope(array,index+3))/27;
}

console.log('helper script loaded');

