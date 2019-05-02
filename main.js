let defaultCode = `freqArray = [1, 2, 3, 4, 5, 6]; // frequency of partials (in multiples of fundamental)
ampArray = [1, 1, 1, 1, 1, 1]; // amplitude of partials (should match freqArray's length)

refFreq = 261.6256; // fundamental frequency (in Hz)
maxInterval = 2.05; // dissonance graph ends at this value (octave = 2.0)
`;

let app = new Vue({

  el: '#dissonance',

  data: {
    code: defaultCode
  },

  computed: {
    data2d() {
      return getData2d(this.code);
    },
    peaks2d() {
      return getPeaks(this.data2d);
    },
    consonantIntervals() {
      return getIntervals(this.peaks2d);
    },
    data3d() {
      return getData3d(this.code);
    },
    peaks3d() {
      return getPeaks3d(this.data3d);
    },
    consonantTriads() {
      return getTriads(this.peaks3d);
    }
  }

})

console.log('main script loaded');

