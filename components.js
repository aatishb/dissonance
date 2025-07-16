Vue.component('code-editor', {

  props: ['code'],

  data: function() {
    return {
      localCode: this.code
    };
  },

  template:`
  <div class="code-editor">
    <textarea v-model="localCode" ref="input" class="codeInput">
    </textarea>
    <button @click="$emit('update:code', localCode)">Update Graphs</button>
  </div>`

})

Vue.component('interval-table', {

  props: ['intervals'],

  methods: {
    myRound: myRound
  },

  template:`
<table>

<tr>
  <th>Sound</th>
  <th>Interval Ratio</th>
  <th>Interval Name</th>
  <th>Midi Note</th>
  <!--<th>Closest Piano Note</th>-->
</tr>

<tr v-for="interval in intervals">
  <td><button @click="$emit('play', [1, interval.x])">Play</button></td>
  <td>{{myRound(interval.x)}}</td>
  <td>{{interval.interval}}</td>
  <td>{{myRound(interval.midi)}}</td>
  <!--<td>{{interval.note}}</td>-->
</tr>
</table>`

})


Vue.component('triad-table', {

  props: ['triads'],

  methods: {
    myRound: myRound
  },

  template:`
<table>

  <tr>
    <th>Sound</th>
    <th>Interval Ratios</th>
    <th>Interval Names</th>
    <th>Closest Piano Notes</th>
    <th>Midi Notes</th>
    <!--
    <th>Dissonance</th>
    <th>Curvature</th>
    -->
  </tr>

  <tr v-for="triad in triads">
    <td><button @click="$emit('play', [1, triad.x, triad.y])">Play</button></td>
    <td>{{myRound(triad.y)}}, {{myRound(triad.x)}}</td>
    <td>{{triad.interval2}}, {{triad.interval1}}</td>
    <td>C, {{triad.note2}}, {{triad.note1}}</td>
    <td>{{Math.round(100*triad.midi2)/100}}, {{Math.round(100*triad.midi1)/100}}</td>
    <!--
    <td>{{myRound(triad.dissonance)}}</td>
    <td>{{myRound(triad.curvature)}}</td>
    -->
  </tr>
</table>`

})

Vue.component('graph-intervals', {
  props: ['data', 'intervals'],

  template: `
    <div class="graph-container">
      <div ref="graph2d" class="graph2d"></div>
      <button class="fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
        <svg v-if="!isFullscreen" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
        </svg>
      </button>
    </div>
  `,

  data() {
    return {
      isFullscreen: false
    };
  },

  methods: {
    toggleFullscreen() {
      if (!this.isFullscreen) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    },

    enterFullscreen() {
      const container = this.$el;
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      this.isFullscreen = true;
      this.$nextTick(() => {
        Plotly.Plots.resize(this.$refs.graph2d);
      });
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.isFullscreen = false;
      this.$nextTick(() => {
        Plotly.Plots.resize(this.$refs.graph2d);
      });
    },

    handleFullscreenChange() {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                             document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFullscreen && this.isFullscreen) {
        this.isFullscreen = false;
        this.$nextTick(() => {
          Plotly.Plots.resize(this.$refs.graph2d);
        });
      }
    },

    handleResize() {
      // Debounce resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.$refs.graph2d) {
          Plotly.Plots.resize(this.$refs.graph2d);
        }
      }, 100);
    },

    make2DGraph: function () {

      let component = this;

      Plotly.newPlot(component.$refs.graph2d,
        [component.trace1, component.trace2],

        {
          margin: { t: 0, r: 20, l: 45 },
          xaxis: {
            title: {
              text: 'Interval (frequency ratio)'
            },
          },
          yaxis: {
            title: {
              text: 'Normalized Spectral Dissonance'
            }
          },
          legend: {
            x: 1,
            y: 1,
            xanchor: 'right',
            yanchor: 'top',
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: 'rgba(0,0,0,0.1)',
            borderwidth: 1
          }
        }
      );

      component.$refs.graph2d.on('plotly_click', function(data) {
        let pts = data.points;
        let xVal = pts[0].x;
        component.$emit('plotclicked', [1, xVal])
      });


    }
  },

  mounted() {
    this.make2DGraph();
    
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    // Listen for window resize events
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    // Clean up event listeners
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    window.removeEventListener('resize', this.handleResize);
  },

  watch: {

    data() {
      this.make2DGraph();
    },

    intervals() {
      this.make2DGraph();
    }

  },

  computed: {
    trace1() {
      return {
          x: this.data[0],
          y: this.data[1],
          name: 'dissonance',
          line: { width: 1.5, shape: 'spline', smoothing: 1.3 }
        };
    },

    trace2() {
      return {
        x: this.intervals.map(e => e.x),
        y: this.intervals.map(e => e.y),
        name: 'minima',
        mode: 'markers',
        marker: { size: 6, opacity: 0.5 }
      };
    }
  }

})

Vue.component('graph-triads', {
  props: ['data', 'triads'],

  template: `
<div>
<div class="graph-container">
  <div ref="graph3dhills" class="graph3d"></div>
  <button class="fullscreen-btn" @click="toggleFullscreen('hills')" :title="isFullscreenHills ? 'Exit Fullscreen' : 'Fullscreen'">
    <svg v-if="!isFullscreenHills" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
    <svg v-else width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
    </svg>
  </button>
</div>
<slot></slot>
<div class="graph-container">
  <div ref="graph3dheatmap" class="graph3d"></div>
  <button class="fullscreen-btn" @click="toggleFullscreen('heatmap')" :title="isFullscreenHeatmap ? 'Exit Fullscreen' : 'Fullscreen'">
    <svg v-if="!isFullscreenHeatmap" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
    </svg>
    <svg v-else width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
    </svg>
  </button>
</div>
</div>
`,

  data() {
    return {
      isFullscreenHills: false,
      isFullscreenHeatmap: false
    };
  },

  methods: {
    toggleFullscreen(type) {
      if (type === 'hills') {
        if (!this.isFullscreenHills) {
          this.enterFullscreen('hills');
        } else {
          this.exitFullscreen();
        }
      } else if (type === 'heatmap') {
        if (!this.isFullscreenHeatmap) {
          this.enterFullscreen('heatmap');
        } else {
          this.exitFullscreen();
        }
      }
    },

    enterFullscreen(type) {
      const container = type === 'hills' ? this.$refs.graph3dhills.parentElement : this.$refs.graph3dheatmap.parentElement;
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
      
      if (type === 'hills') {
        this.isFullscreenHills = true;
      } else {
        this.isFullscreenHeatmap = true;
      }
      
      this.$nextTick(() => {
        const graphRef = type === 'hills' ? this.$refs.graph3dhills : this.$refs.graph3dheatmap;
        Plotly.Plots.resize(graphRef);
      });
    },

    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      this.isFullscreenHills = false;
      this.isFullscreenHeatmap = false;
      
      this.$nextTick(() => {
        Plotly.Plots.resize(this.$refs.graph3dhills);
        Plotly.Plots.resize(this.$refs.graph3dheatmap);
      });
    },

    handleFullscreenChange() {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                             document.mozFullScreenElement || document.msFullscreenElement);
      if (!isFullscreen && (this.isFullscreenHills || this.isFullscreenHeatmap)) {
        this.isFullscreenHills = false;
        this.isFullscreenHeatmap = false;
        this.$nextTick(() => {
          Plotly.Plots.resize(this.$refs.graph3dhills);
          Plotly.Plots.resize(this.$refs.graph3dheatmap);
        });
      }
    },

    handleResize() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.$refs.graph3dhills) {
          Plotly.Plots.resize(this.$refs.graph3dhills);
        }
        if (this.$refs.graph3dheatmap) {
          Plotly.Plots.resize(this.$refs.graph3dheatmap);
        }
      }, 100);
    },

    make3DGraph: function () {

      let component = this;

      Plotly.newPlot(component.$refs.graph3dheatmap,
         [component.trace1, component.trace2],
         {
           margin: { t: 0, r: 20, l: 20, b: 40 },
           showlegend: false
         }
      );

      Plotly.newPlot(component.$refs.graph3dhills,
        [component.trace3, component.trace4],
        {
          margin: { t: 0, r: 20, l: 20, b: 40 },
          showlegend: false
        },
        {
          displayModeBar: false,
          plotGlPixelRatio: 2
        }
      );

      component.$refs.graph3dheatmap.on('plotly_click', function(data) {
        let pts = data.points;
        let xVal = pts[pts.length - 1].x;
        let yVal = pts[pts.length - 1].y;
        component.$emit('plotclicked', [1, xVal, yVal])
      });


      component.$refs.graph3dhills.on('plotly_click', function(data) {
        let pts = data.points;
        let xVal = pts[pts.length - 1].x;
        let yVal = pts[pts.length - 1].y;
        component.$emit('plotclicked', [1, xVal, yVal])
      });


    }
  },

  mounted() {
    this.make3DGraph();
    
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    // Listen for window resize events
    window.addEventListener('resize', this.handleResize);
  },

  beforeDestroy() {
    // Clean up event listeners
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    window.removeEventListener('resize', this.handleResize);
  },

  watch: {

    data() {
      this.make3DGraph();
    },

    triads() {
      this.make3DGraph();
    }

  },

  computed: {
    trace1() {
      return {
          x: this.data[0],
          y: this.data[1],
          z: this.data[2],
          type: 'heatmap',
          colorscale: 'Viridis'
        };
    },

    trace2() {
      return {
        x: this.triads.map(e => e.x),
        y: this.triads.map(e => e.y),
        name: 'minima',
        mode: 'markers',
        marker: { size: 8, opacity: 0.5 }
      };
    },

    trace3() {
      return {
        x: this.data[0],
        y: this.data[1],
        z: this.data[2],
        type: 'surface',
        contours: {
          z: {
            show:true,
            usecolormap: true,
            highlightcolor:"#42f462",
            project:{z: true}
          }
        }
      };
    },

    trace4() {
      return {
        x: this.triads.map(e => e.x),
        y: this.triads.map(e => e.y),
        y: this.triads.map(e => e.z),
        name: 'minima',
        mode: 'markers',
        marker: { size: 50, opacity: 0.5 }
      };
    }
  }

})