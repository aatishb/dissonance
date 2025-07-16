function myRound(n) {
  return Math.round(1000*n)/1000;
}

function getData2d(spectrum, refFreq, maxInterval, stepSize2d) {

  let freqArray = spectrum.freq;
  let ampArray = spectrum.amp;

  let numPartials = freqArray.length;
  let loudnessArray = ampArray.map(ampToLoudness);

  let xArr = [];
  let yArr = [];

  for (let c = 1 - stepSize2d; c < maxInterval; c += stepSize2d) {
    xArr.push(c);
    let dissonanceScore = 0;

    for (let i = 0; i < numPartials; i++){
      for (let j = 0; j < numPartials; j++) {
        let f1 = refFreq * freqArray[i];
        let f2 = refFreq * freqArray[j];
        let l1 = loudnessArray[i];
        let l2 = loudnessArray[j];
        dissonanceScore += 0.5*dissonance(f1,f2,l1,l2) + 0.5*dissonance(c*f1,c*f2,l1,l2) + dissonance(f1,c*f2,l1,l2);
      }
    }
    dissonanceScore /= 2;
    yArr.push(dissonanceScore);
  }

  let maxDissonance = yArr.reduce((a,b) => a > b ? a : b);
  let normalizedyArr = yArr.map(e => e / maxDissonance);

  return [xArr, normalizedyArr];
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
  }

  let xData = [];
  let yData = [];

  for (let r = 1; r < maxInterval; r += stepSize3d) {
    xData.push(r);
    yData.push(r);
  }

  let zData = dataArray.map(e => e.map(e => e/maxZ))

  return [xData, yData, zData];
}

let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let intervalLabels = [
  'unison',
  'minor second',
  'major second',
  'minor third',
  'major third',
  'perfect fourth',
  'tritone',
  'perfect fifth',
  'minor sixth',
  'major sixth',
  'minor seventh',
  'major seventh',
  'octave'
];

function getIntervals(peaks) {
  let intervals = [];

  for (let peak of peaks) {
    let x = peak.x;
    let m = intervalToMidi(x);

    intervals.push({
      x: x,
      y: peak.y,
      midi: m,
      note: midiToNote(m),
      interval: intervalLabels[Math.round(m) - 60]
    })
  }

  return intervals;
}


function getTriads(peaks) {
  let intervals = [];

  for (let peak of peaks) {
    let x = peak.x;
    let m1 = intervalToMidi(x);

    let y = peak.y;
    let m2 = intervalToMidi(y);

    intervals.push({
      x: x,
      y: y,
      dissonance: peak.z,
      curvature: peak.curvature,
      midi1: m1,
      midi2: m2,
      note1: midiToNote(m1),
      note2: midiToNote(m2),
      interval1: intervalLabels[Math.round(m1) - 60],
      interval2: intervalLabels[Math.round(m2) - 60]
    })
  }

  return intervals;
}
function intervalToMidi(i) {
  return 12 * Math.log(i)/Math.log(2) + 60;
}

function midiToNote(m0) {
  let m = Math.round(m0);
  return notes[m % 12];// + String(Math.floor(m / 12));
}

function ampToLoudness(amp) {
  // first convert amplitude to dB
  // db = 20*log10(amp)
  let dB = 20*Math.log(amp)/Math.log(10);
  // then convert db to sones
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


function getPeaks(data2d)
{

  let [xArr, yArr] = data2d;

  let peaks = [{
    x: xArr[0],
    y: yArr[0]
  }];
  let dybydxArray = yArr.map((y,i) => delta(yArr, i) / delta(xArr, i) );

  for (let i = 0; i < yArr.length - 1; i++)
  {

    // calculate derivative
    let prevPoint = {
      index: i - 1,
      x: xArr[i - 1],
      y: yArr[i - 1],
      slope: dybydxArray[i - 1]
    };

    let currentPoint = {
      index: i,
      x: xArr[i],
      y: yArr[i],
      slope: dybydxArray[i],
      curvature: dybydxArray[i] - dybydxArray[i - 1]
    };

    if (prevPoint.slope < 0 && currentPoint.slope > 0 )
    {
      peaks.push(currentPoint);
    }
  }

  return peaks;
}


function lt(a,b) {
  return a < b && Math.abs(a - b) > 0;
}

function getPeaks3d(data3d, stepSize3d, smoothing)
{
  let [xArr, yArr, zArr] = data3d;
  let peaks = [];
  
  // Adaptive radius based on step size for consistent detection
  let baseRadius = Math.max(2, Math.round(0.02 / stepSize3d));
  let prominenceRadius = Math.max(4, Math.round(0.05 / stepSize3d));
  
  // First pass: find all local minima
  let candidates = [];
  
  for (let x = baseRadius; x < xArr.length - baseRadius; x++) {
    for (let y = baseRadius; y < x; y++) { // Lower triangle only
      
      let centerValue = zArr[x][y];
      let isLocalMin = true;
      
      // Check immediate neighborhood for local minimum
      for (let dx = -baseRadius; dx <= baseRadius; dx++) {
        for (let dy = -baseRadius; dy <= baseRadius; dy++) {
          if (dx === 0 && dy === 0) continue;
          
          let nx = x + dx;
          let ny = y + dy;
          
          if (nx >= 0 && nx < zArr.length && ny >= 0 && ny < zArr[0].length) {
            if (centerValue >= zArr[nx][ny]) {
              isLocalMin = false;
              break;
            }
          }
        }
        if (!isLocalMin) break;
      }
      
      if (isLocalMin) {
        candidates.push({
          x: x,
          y: y,
          realX: 1 + x * stepSize3d,
          realY: 1 + y * stepSize3d,
          value: centerValue
        });
      }
    }
  }
  
  // Second pass: calculate prominence for each candidate
  for (let candidate of candidates) {
    let {x, y, value} = candidate;
    
    // Find minimum value within prominence radius
    let minInRadius = value;
    let maxInRadius = value;
    
    for (let dx = -prominenceRadius; dx <= prominenceRadius; dx++) {
      for (let dy = -prominenceRadius; dy <= prominenceRadius; dy++) {
        let nx = x + dx;
        let ny = y + dy;
        
        if (nx >= 0 && nx < zArr.length && ny >= 0 && ny < zArr[0].length) {
          let neighborValue = zArr[nx][ny];
          minInRadius = Math.min(minInRadius, neighborValue);
          maxInRadius = Math.max(maxInRadius, neighborValue);
        }
      }
    }
    
    // Prominence is how much lower this point is than the highest point nearby
    let prominence = maxInRadius - value;
    
    // Additional sharpness measure: average gradient magnitude
    let gradientSum = 0;
    let gradientCount = 0;
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        let nx = x + dx;
        let ny = y + dy;
        
        if (nx >= 0 && nx < zArr.length && ny >= 0 && ny < zArr[0].length) {
          gradientSum += Math.abs(zArr[nx][ny] - value);
          gradientCount++;
        }
      }
    }
    
    let avgGradient = gradientCount > 0 ? gradientSum / gradientCount : 0;
    
    // Combined metric: prominence weighted by sharpness
    let curvature = prominence * (1 + avgGradient * 10);
    
    peaks.push({
      x: candidate.realX,
      y: candidate.realY,
      z: value,
      curvature: curvature
    });
  }
  
  // Sort by curvature (prominence * sharpness) descending
  return peaks.sort((a,b) => b.curvature - a.curvature);
}

function delta(arr, i){
  return arr[i + 1] - arr[i];
}