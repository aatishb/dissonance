let synthA, synthB, synthC;

function startAudio() {

  let audioCtx = new AudioContext();

  // modified from https://teropa.info/blog/2016/09/20/additive-synthesis.html
  // with ideas from https://www.redblobgames.com/x/1618-webaudio/

  class myOsc {

    constructor() {
      this.osc = audioCtx.createOscillator()
      this.gain = audioCtx.createGain();
      this.osc.connect(this.gain);
      this.gain.gain.value = 0;
    }

    connect(dest) {
      this.gain.connect(dest);
    }

    start(time = 0) {
      this.osc.start(time);
    }

    stop(time = 0) {
      this.osc.stop(time);
    }

    setFrequencyAtTime(frequency, time) {
      this.osc.frequency.setValueAtTime(frequency, time);
    }

    fadeIn(amp, time) {
        this.gain.gain.linearRampToValueAtTime(amp, time);
      }

    fadeOut(time) {
        this.gain.gain.exponentialRampToValueAtTime(0.000001, time);
      }

    mute(time) {
        this.gain.gain.setValueAtTime(0, time);
      }

  }

  class mySynth {

    constructor(partialFrequencies, partialAmplitudes) {

      this.partialFrequencies = partialFrequencies;
      this.partialAmplitudes = partialAmplitudes;

      this.masterGain = audioCtx.createGain();
      this.masterGain.gain.value = Math.max(1 / partialFrequencies.length, 0.5);

      this.oscs = [];

      for (let freq of partialFrequencies) {
        let o = new myOsc();
        o.start();
        o.connect(this.masterGain);
        this.oscs.push(o);
      }

    }

    connect(dest) {
      this.masterGain.connect(dest);
    }

    disconnect() {
      this.masterGain.disconnect();
    }

    setFrequencyAtTime(baseFreq, time) {
      let i = 0;
      for (let o of this.oscs) {
        o.setFrequencyAtTime(baseFreq * this.partialFrequencies[i], time);
        i++;
      }
    }

    fadeIn(time, fadeInTime) {
      let i = 0;
      for (let o of this.oscs) {
        o.fadeIn(this.partialAmplitudes[i], time + fadeInTime);
        i++;
      }
    }

    fadeOut(time, fadeOutTime) {
      let i = 0;
      for (let o of this.oscs) {
        o.fadeOut(Math.max(time, time + fadeOutTime - 6.91*0.05 * i) );
        o.mute(time + fadeOutTime)
        i++;
      }
    }

    play(freq) {
      let time = audioCtx.currentTime
      this.setFrequencyAtTime(freq, time);
      this.fadeIn(time, 0.002);
      this.fadeOut(time, 6.91*0.5);
    }

  }

  synthA = new mySynth([1, 2, 3, 4, 5, 6], [1, 1/2, 1/3, 1/4, 1/5, 1/6]);
  synthA.connect(audioCtx.destination);

  synthB = new mySynth([1, 2, 3, 4, 5, 6], [1, 1/2, 1/3, 1/4, 1/5, 1/6]);
  synthB.connect(audioCtx.destination);

  synthC = new mySynth([1, 2, 3, 4, 5, 6], [1, 1/2, 1/3, 1/4, 1/5, 1/6]);
  synthC.connect(audioCtx.destination);

  //let t = audioCtx.currentTime;
  synthA.play(220);
  synthB.play(220*1.2);
  synthC.play(220*1.5);

  /*
  let t = audioCtx.currentTime;
  synth.start();
  synth.stop(t + 1);
  */

  /*
  const G4 = 440 * Math.pow(2, -2/12);
  const A4 = 440;
  const F4 = 440 * Math.pow(2, -4/12);
  const F3 = 440 * Math.pow(2, -16/12);
  const C4 = 440 * Math.pow(2, -9/12);

  let synth = new HarmonicSynth([1, 2, 3, 4, 5, 6], [1, 1, 1, 1, 1, 1]);

  let t = audioCtx.currentTime;
  synth.setFrequencyAtTime(G4, t);
  synth.setFrequencyAtTime(G4, t + 0.95);
  synth.exponentialRampToFrequencyAtTime(A4, t + 1);
  synth.setFrequencyAtTime(A4, t + 1.95);
  synth.exponentialRampToFrequencyAtTime(F4, t + 2);
  synth.setFrequencyAtTime(F4, t + 2.95);
  synth.exponentialRampToFrequencyAtTime(F3, t + 3);
  synth.setFrequencyAtTime(F3, t + 3.95);
  synth.exponentialRampToFrequencyAtTime(C4, t + 4);

  synth.connect(audioCtx.destination);
  synth.start();
  synth.stop(audioCtx.currentTime + 6);
  */

 }