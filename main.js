let app = new Vue({

  el: '#dissonance',

  data: {
    spectrum: {
      freq: [1, 2, 3, 4, 5, 6],
      amp: [1, 1/2, 1/3, 1/4, 1/5, 1/6]
    },
    refFreq: 261.6256,
    maxInterval: 2.05,

    stepSize2d: 0.01,
    curvatureCutoff2d: 0.1,

    stepSize3d: 0.002,
    dissonanceCutoff3d: 0.4,
    curvatureCutoff3d: 0.1,
    smoothing: 1.5,
    
    // WebWorker state
    data3dCache: null,
    isComputing3d: false,
    computeProgress: 0,
    worker: null
  },

  methods: {
    myRound(n) {
      return myRound(n);
    },

    startAudio(tuning) {
      startAudio(this.spectrum, this.refFreq, tuning);
    },

    initWorker() {
      if (this.worker) {
        this.worker.terminate();
      }
      
      this.worker = new Worker('./dissonance-worker.js');
      
      this.worker.onmessage = (e) => {
        const { type, data, progress, message, error } = e.data;
        
        if (type === 'progress') {
          this.computeProgress = progress;
        } else if (type === 'complete') {
          this.computeProgress = 1.0;
          this.$nextTick(() => {
            setTimeout(() => {
              this.data3dCache = data;
              this.isComputing3d = false;
            }, 500); // Show 100% for half a second
          });
        } else if (type === 'error') {
          console.error('Worker error:', error);
          this.isComputing3d = false;
        }
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.isComputing3d = false;
      };
    },

    compute3DData() {
      if (this.isComputing3d) return;
      
      this.isComputing3d = true;
      this.computeProgress = 0;
      this.data3dCache = null;
      
      if (!this.worker) {
        this.initWorker();
      }
      
      this.worker.postMessage({
        spectrum: this.spectrum,
        refFreq: this.refFreq,
        maxInterval: this.maxInterval,
        stepSize3d: this.stepSize3d
      });
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
      // Use cached data if available, otherwise trigger computation
      if (this.data3dCache) {
        return this.data3dCache;
      } else if (!this.isComputing3d) {
        // Trigger computation in background
        this.$nextTick(() => {
          this.compute3DData();
        });
      }
      
      // Return empty data while computing
      return [[], [], []];
    },

    peaks3d() {
      return getPeaks3d(this.data3d, this.stepSize3d, this.smoothing)
        .filter(e => e.z <= this.dissonanceCutoff3d)
        .filter(e => e.curvature >= this.curvatureCutoff3d);
    },

    consonantTriads() {
      return getTriads(this.peaks3d);
    }
  },

  mounted() {
    this.initWorker();
  },

  beforeDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  },

  watch: {
    // Invalidate 3D cache when parameters change
    spectrum: {
      handler() {
        this.data3dCache = null;
      },
      deep: true
    },
    refFreq() {
      this.data3dCache = null;
    },
    maxInterval() {
      this.data3dCache = null;
    },
    stepSize3d() {
      this.data3dCache = null;
    }
  }

})