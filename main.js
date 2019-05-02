let defaultCode = `freqArray = [1, 2, 3, 4, 5, 6]; // frequency of partials (in multiples of fundamental)
ampArray = [1, 1, 1, 1, 1, 1]; // amplitude of partials (should match freqArray's length)

refFreq = 261.6256; // fundamental frequency (in Hz)
maxInterval = 2.05; // dissonance graph ends at this value (octave = 2.0)
`;

let app = new Vue({

  el: '#dissonance',

  data: {
    code: defaultCode,

    stepSize2d: 0.001,
    curvatureCutoff2d: 0.1,

    stepSize3d: 0.005,
    dissonanceCutoff3d: 1,
    curvatureCutoff3d: 0
  },

  computed: {
    data2d() {
      return getData2d(this.code, this.stepSize2d);
    },
    peaks2d() {
      return getPeaks(this.data2d)
        .filter(e => e.curvature >= this.curvatureCutoff2d);
    },
    consonantIntervals() {
      return getIntervals(this.peaks2d);
    },
    data3d() {
      return getData3d(this.code, this.stepSize3d);
    },
    peaks3d() {
      return getPeaks3d(this.data3d, this.stepSize3d)
        .filter(e => e.z <= this.dissonanceCutoff3d)
        .filter(e => e.curvature >= this.curvatureCutoff3d);
    },
    consonantTriads() {
      return getTriads(this.peaks3d);
    }
  }

})