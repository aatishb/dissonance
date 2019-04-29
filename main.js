let defaultCode = `freqArray = [1, 2, 3, 4, 5, 6]; // frequency of partials (in multiples of fundamental)
ampArray = [1, 1, 1, 1, 1, 1]; // amplitude of partials (should match freqArray's length)

refFreq = 261.6256; // fundamental frequency (in Hz)
maxInterval = 2.2; // dissonance graph ends at this value (octave = 2.0)
slopeCutoff = 1; // higher = fewer minima, 0 = all minima
`;

let app = new Vue({

  el: '#dissonance',

  data: {
    code: defaultCode,
    consonantIntervals: [],
    consonantTriads: []
  },

  methods: {
    makeGraphs: function() {
      let data2d = getData2d(this.code);
      let peaks = getPeaks(data2d);
      make2DGraph(data2d, peaks);
      this.consonantIntervals = getIntervals(peaks);

      let data3d = getData3d(this.code);
      //peaks = getPeaks3d(data3d);
      make3DGraph(data3d);

    }
  },

  mounted: function() {
    this.makeGraphs();
  }
})

console.log('main script loaded');

