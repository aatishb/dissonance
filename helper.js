let refFreq, maxInterval = 2.3;
let slopeCutoff = 0;
let freqArray, ampArray;

function getData2d(code) {
  eval(code);

  let numPartials = freqArray.length;
  let loudnessArray = ampArray.map(ampToLoudness);

  let xArr = [];
  let yArr = [];

  for (let c = 1; c < maxInterval; c += 0.001) {
    xArr.push(c);
    let dissonanceScore = 0;

    for (let i = 0; i < numPartials; i++){
      for (let j = 0; j < numPartials; j++) {
        let f1 = refFreq * freqArray[i];
        let f2 = refFreq * freqArray[j];
        let l1 = loudnessArray[i];
        let l2 = loudnessArray[j];
        dissonanceScore += 0.5*dissonance(f1,f2,l1,l2) + 0.5*dissonance(c*f1,c*f2,l1,l2) + dissonance(f1,c*f2,l1,l2);
      }
    }
    dissonanceScore /= 2;
    yArr.push(dissonanceScore);
  }

  let maxDissonance = yArr.reduce((a,b) => a > b ? a : b);
  let normalizedyArr = yArr.map(e => e / maxDissonance);

  return [xArr, normalizedyArr];
}


function getData3d() {
  let xArr = [];
  let yArr = [];
  let zArr = [];

  eval(this.code);
  let numPartials = freqArray.length;
  let loudnessArray = ampArray.map(ampToLoudness);

  let maxZ = 0;
  let dataArray = [];

  for (let r = 1; r <= 2; r += 0.01) {

    let dataArraySlice = [];

    for (let s = 1; s <= 2; s += 0.01) {

      let dissonanceScore = 0;

      for (let i = 0; i < numPartials; i++){
        for (let j = 0; j < numPartials; j++) {
            let f1 = refFreq * freqArray[i];
            let f2 = refFreq * freqArray[j];
            let l1 = loudnessArray[i];
            let l2 = loudnessArray[j];
            let d = dissonance(f1,f2,l1,l2) + dissonance(r*f1,r*f2,l1,l2) + dissonance(f1,r*f2,l1,l2)
              + dissonance(s*f1,s*f2,l1,l2) + dissonance(f1,s*f2,l1,l2) + dissonance(r*f1,s*f2,l1,l2)

            dissonanceScore += d;
        }
      }

      dissonanceScore /= 2;
      dataArraySlice.push(dissonanceScore);

      if (dissonanceScore > maxZ) {
        maxZ = dissonanceScore;
      }

    }
    dataArray.push(dataArraySlice);
  }

  let xData = [];
  let yData = [];

  for (let r = 1; r < 2; r += 0.01) {
    xData.push(r);
    yData.push(r);
  }

  let zData = dataArray.map(e => e.map(e => e/maxZ))

  return [xData, yData, zData];
}


function make2DGraph([xArr, yArr], intervals) {

  let trace1 = {
      x: xArr,
      y: yArr,
      name: 'dissonance'
    };

  let trace2 = {
    x: intervals.map(e => e.x),
    y: intervals.map(e => e.y),
    name: 'minima',
    mode: 'markers',
    marker: { size: 12, opacity: 0.5 }
  }

  Plotly.newPlot(document.getElementById('graph-2d'),
    [trace1, trace2],
    {

      margin: { t: 0 },
      xaxis: {
        title: {
          text: 'interval (frequency ratio)'
        },
      },
      yaxis: {
        title: {
          text: 'Normalized Spectral Dissonance'
        }
      }

    }
  );

}


function make3DGraph([xData, yData, zData], peaks) {

  let trace1 = {
      x: xData,
      y: yData,
      z: zData,
      type: 'heatmap',
      colorscale: 'Viridis'
    };


  let trace2 = {
    /*
    x: peaks.map(e => e.x),
    y: peaks.map(e => e.y),
    name: 'minima',
    mode: 'markers',
    marker: { size: 12, opacity: 0.5 }
    */
  }


  Plotly.newPlot(document.getElementById('graph-3d-heatmap'),
     [trace1, trace2]
  );


  Plotly.newPlot(document.getElementById('graph-3d-hills'),
    [{
      x: xData,
      y: yData,
      z: zData,
      type: 'surface',
      contours: {
        z: {
          show:true,
          usecolormap: true,
          highlightcolor:"#42f462",
          project:{z: true}
        }
      }
    }],

    {
      scene: {camera:
        {
          // eye: {x: 0, y: 0, z: -2}
        }
      },
    }


  );


}


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


function lt(a,b) {
  return a < b && Math.abs(a - b) > 0.01;
}

function getPeaks3d(data3d)
{
  // eventually i would like a better way of doing this
  // but for now let's do something very simple

  let [xArr, yArr, zArr] = data3d;

  let peaks = [{
    x: 1,
    y: 1,
    z: zArr[0][0]
  }];

  for (let x = 1; x < xArr.length - 1; x++) {
    for (let y = 1; y < x; y++) {
      let [ zUpLeft, zUp, zUpRight,
            zLeft, z, zRight,
            zDownLeft, zDown, zDownRight ] =
          [ zArr[x-1][y+1], zArr[x][y+1], zArr[x+1][y+1],
            zArr[x-1][y], zArr[x][y], zArr[x+1][y],
            zArr[x-1][y-1], zArr[x][y-1], zArr[x+1][y-1] ];

      if (lt(z, zUpLeft) && lt(z, zUp) && lt(z, zUpRight) &&
          lt(z, zLeft) && lt(z, zRight) &&
          lt(z, zDownLeft) && lt(z, zDown) && lt(z, zDownRight))
      {
        peaks.push({
          x: 1 + x*0.01,
          y: 1 + y*0.01,
          z: z
        });
      }
    }
  }

  return peaks.sort((a,b) => a.z > b.z);
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

