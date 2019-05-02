let defaultCode = `freqArray = [1, 2, 3, 4, 5, 6]; // frequency of partials (in multiples of fundamental)
ampArray = [1, 1, 1, 1, 1, 1]; // amplitude of partials (should match freqArray's length)

refFreq = 261.6256; // fundamental frequency (in Hz)
minInterval = 0.9; // dissonance graph starts at this value (unison = 1.0)
maxInterval = 2.05; // dissonance graph ends at this value (octave = 2.0)
slopeCutoff = 0; // higher = fewer minima, 0 = all minima
`;

let app = new Vue({

  el: '#dissonance',

  data: {
    code: defaultCode,
    consonantIntervals: [],
    consonantTriads: [],
    dissonanceCutoff: 0.5
  },

  methods: {
    make2DGraphs: function() {
      let data2d = getData2d(this.code);
      let peaks2d = getPeaks(data2d);
      make2DGraph(data2d, peaks2d);
      this.consonantIntervals = getIntervals(peaks2d);
    },

    make3DGraphs: function() {
      let data3d = getData3d(this.code);
      let peaks3d = getPeaks3d(data3d, this.dissonanceCutoff);
      //console.log(peaks3d);
      make3DGraph(data3d, peaks3d);
      this.consonantTriads = getTriads(peaks3d);
    },

    makeGraphs: function() {
      this.make2DGraphs();
      this.make3DGraphs();
    }
  },

  mounted: function() {
    this.makeGraphs();
  }
})

console.log('main script loaded');

