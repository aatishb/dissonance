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

  template: '<div ref="graph2d" class="graph2d"></div>',

  methods: {
    make2DGraph: function () {

      let component = this;

      Plotly.newPlot(component.$refs.graph2d,
        [component.trace1, component.trace2],

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

      component.$refs.graph2d.on('plotly_click', function(data) {
        let pts = data.points;
        let xVal = pts[0].x;
        component.$emit('plotclicked', [1, xVal])
      });


    }
  },

  mounted() {
    this.make2DGraph();
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
          name: 'dissonance'
        };
    },

    trace2() {
      return {
        x: this.intervals.map(e => e.x),
        y: this.intervals.map(e => e.y),
        name: 'minima',
        mode: 'markers',
        marker: { size: 12, opacity: 0.5 }
      };
    }
  }

})

Vue.component('graph-triads', {
  props: ['data', 'triads'],

  template: `
<div>
<div ref="graph3dhills" class="graph3d"></div>
<slot></slot>
<div ref="graph3dheatmap" class="graph3d"></div>
</div>
`,

  methods: {
    make3DGraph: function () {

      let component = this;

      Plotly.newPlot(component.$refs.graph3dheatmap,
         [component.trace1, component.trace2]
      );

      Plotly.newPlot(component.$refs.graph3dhills,
        [component.trace3, component.trace4]
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
        marker: { size: 12, opacity: 0.5 }
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