(function() {


let refFreq, maxInterval = 2.3;
let freqArray, ampArray;

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


function make2DGraph(code) {

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
  let normalizedyArr = yArr.map(e => e/maxDissonance);


  Plotly.newPlot(document.getElementById('graph-2d'),
    [{
      x: xArr,
      y: normalizedyArr
    }],
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


function make3DGraph(code) {

  let xArr = [];
  let yArr = [];
  let zArr = [];

  eval(code);
  let numPartials = freqArray.length;
  let loudnessArray = ampArray.map(ampToLoudness);

  for (let r = 1; r < 2; r += 0.01) {
    for (let s = 1; s < 2; s += 0.01) {
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
    }
  }


  let maxDissonance = zArr.reduce((a,b) => a > b ? a : b);
  let normalizedzArr = zArr.map(e => e/maxDissonance);


  Plotly.newPlot(document.getElementById('graph-3d-contour'),
    [{
      x: xArr,
      y: yArr,
      z: zArr,
      type: 'contour',
      colorscale: 'Jet',
    }]

  );

  Plotly.newPlot(document.getElementById('graph-3d-hills'),
    [{
      x: xArr,
      y: yArr,
      z: zArr,
      opacity:0.9,
      type: 'mesh3d'
    }]

  );


}



new Vue({

  el: '#dissonance',

  data: {
    arrayCode: `freqArray = [1, 2, 3, 4, 5]; // frequency of partials in multiples of the fundamental
ampArray = [1, 1, 1, 1, 1]; // amplitude of partials (should match length of freqArray)

refFreq = 400; // fundamental frequency, i.e. frequency of lowest partial (in Hz)
maxInterval = 2.3; // rightmost limit of 2d dissonance graph (octave = 2.0)
`
  },

  methods: {

    makeGraphs: function() {
      make2DGraph(this.arrayCode);
      make3DGraph(this.arrayCode);
    }
  },

  mounted: function() {
      this.makeGraphs();
    }
})

})();
