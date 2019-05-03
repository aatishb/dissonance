let app = new Vue({

  el: '#dissonance',

  data: {
    spectrum: {
      freq: [1, 2, 3, 4, 5, 6],
      amp: [1, 1/2, 1/3, 1/4, 1/5, 1/6]
    },
    refFreq: 261.6256,
    maxInterval: 2.05,

    stepSize2d: 0.001,
    curvatureCutoff2d: 0.1,

    stepSize3d: 0.005,
    dissonanceCutoff3d: 1,
    curvatureCutoff3d: 0,
    smoothing: 1.5
  },

  methods: {
    startAudio(tuning) {
      startAudio(this.spectrum, this.refFreq, tuning);
    }
  },

  computed: {
    data2d() {
      return getData2d(this.spectrum, this.refFreq, this.maxInterval, this.stepSize2d);
    },

    peaks2d() {
      return getPeaks(this.data2d)
        .filter(e => e.curvature >= this.curvatureCutoff2d);
    },

    consonantIntervals() {
      return getIntervals(this.peaks2d);
    },

    data3d() {
      return getData3d(this.spectrum, this.refFreq, this.maxInterval, this.stepSize3d);
    },

    peaks3d() {
      return getPeaks3d(this.data3d, this.stepSize3d, this.smoothing)
        .filter(e => e.z <= this.dissonanceCutoff3d)
        .filter(e => e.curvature >= this.curvatureCutoff3d);
    },

    consonantTriads() {
      return getTriads(this.peaks3d);
    }
  }

})