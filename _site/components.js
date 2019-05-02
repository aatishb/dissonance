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
  <th>Interval Ratio</th>
  <th>Interval Name</th>
  <th>Midi Note</th>
  <!--<th>Closest Piano Note</th>-->
</tr>

<tr v-for="interval in intervals">
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

      Plotly.newPlot(this.$refs.graph2d,
        [this.trace1, this.trace2],

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

      Plotly.newPlot(this.$refs.graph3dheatmap,
         [this.trace1, this.trace2]
      );

      Plotly.newPlot(this.$refs.graph3dhills,
        [this.trace3, this.trace4]
      );

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
        type: 'scatter3d',
        name: 'minima',
        mode: 'markers',
        marker: { size: 50, opacity: 0.5 }
      };
    }
  }

})