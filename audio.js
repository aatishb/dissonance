let audioCtx;

function startAudio(spectrum, refFreq, tuning) {

  let freqArray = spectrum.freq;
  let ampArray = spectrum.amp;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // modified from https://teropa.info/blog/2016/09/20/additive-synthesis.html
  // with ideas from https://www.redblobgames.com/x/1618-webaudio/

  let t = audioCtx.currentTime;

  for (let multiplier of tuning) {
    let synth = new mySynth(freqArray, ampArray);
    synth.connect(audioCtx.destination);
    synth.play(refFreq * multiplier, t);
  }


 }

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
      o.start();
      o.fadeIn(this.partialAmplitudes[i], time + fadeInTime);
      i++;
    }
  }

  fadeOut(time, fadeOutTime) {
    let i = 0;
    for (let o of this.oscs) {
      o.fadeOut(Math.max(time, time + fadeOutTime - 6.91*0.05 * i) );
      o.stop(time + fadeOutTime)
      i++;
    }
  }

  play(freq, time) {
    this.setFrequencyAtTime(freq, time);
    this.fadeIn(time, 0.002);
    this.fadeOut(time, 6.91*0.5);
  }

}
