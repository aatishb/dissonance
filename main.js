let defaultCode = `freqArray = [1, 2, 3, 4, 5, 6]; // frequency of partials (in multiples of fundamental)
ampArray = [1, 1, 1, 1, 1, 1]; // amplitude of partials (should match freqArray's length)

refFreq = 261.6256; // fundamental frequency (in Hz)
maxInterval = 2.2; // dissonance graph ends at this value (octave = 2.0)
slopeCutoff = 1; // higher = fewer minima, 0 = all minima
`;

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

  for (let r = 1; r < 2; r += 0.01) {
    for (let s = 1; s <= r; s += 0.01) {
      xArr.push(r);
      yArr.push(s);
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
      zArr.push(dissonanceScore);

      // factor of 2 time savings! we can do this..
      // ..since the function is symmetrical around the main diagonal
      if (s !== r){
        xArr.push(s);
        yArr.push(r);
        zArr.push(dissonanceScore);
      }
    }
  }
  return [xArr, yArr, zArr];
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


function make3DGraph([xArr, yArr, zArr]) {


  let maxDissonance = zArr.reduce((a,b) => a > b ? a : b);
  let normalizedzArr = zArr.map(e => e/maxDissonance);

  Plotly.newPlot(document.getElementById('graph-3d-heatmap'),
    [{
      x: xArr,
      y: yArr,
      z: normalizedzArr,
      type: 'heatmap',
      colorscale: 'Viridis'
    }]

  );


  Plotly.newPlot(document.getElementById('graph-3d-hills'),
    [{
      x: xArr,
      y: yArr,
      z: normalizedzArr,
      type: 'mesh3d'
    }]

  );


}

let app = new Vue({

  el: '#dissonance',

  data: {
    code: defaultCode,
    consonantIntervals: []
  },

  methods: {
    makeGraphs: function() {
      let data2d = getData2d(this.code);
      let peaks = getPeaks(data2d);
      make2DGraph(data2d, peaks);
      this.consonantIntervals = getIntervals(peaks);

      let data3d = getData3d(this.code);
      make3DGraph(data3d);

    }
  },

  mounted: function() {
    this.makeGraphs();
  }
})

console.log('main script loaded');

