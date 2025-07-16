// WebWorker for computing 3D dissonance data
// This runs in a separate thread to avoid blocking the UI

// Import the necessary functions (we'll need to duplicate some helper functions here)
function ampToLoudness(amp) {
  let dB = 20*Math.log(amp)/Math.log(10);
  let loudness = Math.pow(2, dB/10)/16;
  return loudness;
}

function dissonance(f1, f2, l1, l2) {
  let x = 0.24;
  let s1 = 0.0207;
  let s2 = 18.96;
  let fmin = Math.min(f1, f2);
  let fmax = Math.max(f1, f2);
  let s = x / (s1 * fmin + s2);
  let p = s * (fmax - fmin);

  let b1 = 3.51;
  let b2 = 5.75;

  let l12 = Math.min(l1,l2);

  return l12 * (Math.exp(-b1*p) - Math.exp(-b2*p));
}

function getData3d(spectrum, refFreq, maxInterval, stepSize3d) {
  let freqArray = spectrum.freq;
  let ampArray = spectrum.amp;

  let xArr = [];
  let yArr = [];
  let zArr = [];

  let numPartials = freqArray.length;
  let loudnessArray = ampArray.map(ampToLoudness);

  let maxZ = 0;
  let dataArray = [];
  
  let totalSteps = Math.floor((maxInterval - 1) / stepSize3d);
  let currentStep = 0;

  for (let r = 1; r <= maxInterval; r += stepSize3d) {
    let dataArraySlice = [];

    for (let s = 1; s <= maxInterval; s += stepSize3d) {
      let dissonanceScore = 0;

      for (let i = 0; i < numPartials; i++){
        for (let j = 0; j < numPartials; j++) {
            let f1 = refFreq * freqArray[i];
            let f2 = refFreq * freqArray[j];
            let l1 = loudnessArray[i];
            let l2 = loudnessArray[j];
            let d = dissonance(f1,f2,l1,l2) + dissonance(r*f1,r*f2,l1,l2) + dissonance(f1,r*f2,l1,l2)
              + dissonance(s*f1,s*f2,l1,l2) + dissonance(f1,s*f2,l1,l2) + dissonance(r*f1,s*f2,l1,l2)

            dissonanceScore += d;
        }
      }

      dissonanceScore /= 2;
      dataArraySlice.push(dissonanceScore);

      if (dissonanceScore > maxZ) {
        maxZ = dissonanceScore;
      }
    }
    dataArray.push(dataArraySlice);
    
    // Send progress updates every 10 steps
    currentStep++;
    if (currentStep % 10 === 0) {
      let progress = Math.min(currentStep / totalSteps, 1.0);
      self.postMessage({
        type: 'progress',
        progress: progress,
        message: `Computing 3D data... ${Math.round(progress * 100)}%`
      });
    }
  }

  let xData = [];
  let yData = [];

  for (let r = 1; r < maxInterval; r += stepSize3d) {
    xData.push(r);
    yData.push(r);
  }

  let zData = dataArray.map(e => e.map(e => e/maxZ))

  // Send final 100% progress
  self.postMessage({
    type: 'progress',
    progress: 1.0,
    message: 'Computing 3D data... 100%'
  });

  return [xData, yData, zData];
}

// Listen for messages from the main thread
self.onmessage = function(e) {
  const { spectrum, refFreq, maxInterval, stepSize3d } = e.data;
  
  try {
    self.postMessage({
      type: 'progress',
      progress: 0,
      message: 'Starting 3D dissonance calculation...'
    });
    
    const result = getData3d(spectrum, refFreq, maxInterval, stepSize3d);
    
    self.postMessage({
      type: 'complete',
      data: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message
    });
  }
};