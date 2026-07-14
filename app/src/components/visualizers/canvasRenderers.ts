
// Helper to get color from intensity for Waterfall Spectrogram
const getSpectrogramColor = (val: number, isMono: boolean): string => {
  const norm = val / 255;
  if (isMono) {
    // Monochromatic Cyan gradient
    return `rgba(6, ${Math.floor(182 * norm)}, ${Math.floor(212 * norm)}, 1)`;
  }
  
  // High-craft DAW spectrum color mapping: Blue (silence) -> Cyan -> Green -> Orange -> Red (peaks)
  if (norm < 0.25) {
    const r = Math.floor((norm / 0.25) * 6);
    const g = Math.floor((norm / 0.25) * 182);
    const b = Math.floor((norm / 0.25) * 212);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  } else if (norm < 0.5) {
    const pct = (norm - 0.25) / 0.25;
    const r = Math.floor(6 + pct * (34 - 6));
    const g = Math.floor(182 + pct * (197 - 182));
    const b = Math.floor(212 - pct * 212);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  } else if (norm < 0.75) {
    const pct = (norm - 0.5) / 0.25;
    const r = Math.floor(34 + pct * (249 - 34));
    const g = Math.floor(197 - pct * (115 - 197));
    return `rgba(${r}, ${g}, 0, 1)`;
  } else {
    const pct = (norm - 0.75) / 0.25;
    const r = Math.floor(249 + pct * (239 - 249));
    const g = Math.floor(115 - pct * 115);
    return `rgba(${r}, ${g}, 0, 1)`;
  }
};

// 1. 2D Oscilloscope Waveform Renderer
export const drawOscilloscope = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  isWireframe: boolean
) => {
  ctx.clearRect(0, 0, width, height);

  // Background Grid Bezel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSpacing = 20;
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  if (data.length === 0) return;

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#06b6d4';
  ctx.shadowColor = '#0891b2';
  ctx.shadowBlur = 6;

  ctx.beginPath();
  
  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0; // Normalized 0.0 to 2.0
    // Center at height/2, scale by height/2 and sensitivity
    const y = (height / 2) + (v - 1.0) * (height / 2) * sensitivity * 0.95;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  // Draw final connecting line to edge
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // If filled/solid mode (not wireframe), draw gradient fill to center line
  if (!isWireframe) {
    ctx.shadowBlur = 0; // Clear shadow for fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const fillGlow = ctx.createLinearGradient(0, height / 2, 0, height);
    fillGlow.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    fillGlow.addColorStop(1, 'rgba(6, 182, 212, 0.01)');
    ctx.fillStyle = fillGlow;
    ctx.fill();
  }
  
  ctx.shadowBlur = 0; // Reset shadow
};

// 2. 2D Frequency Equalizer Bars Renderer
export const drawFrequencyBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  density: number,
  isWireframe: boolean,
  peakArrayRef: React.MutableRefObject<number[]>
) => {
  ctx.clearRect(0, 0, width, height);

  if (data.length === 0) return;

  const barCount = Math.max(12, Math.min(64, Math.floor(density * 1.5)));
  const gap = 3;
  const barWidth = (width - (barCount - 1) * gap) / barCount;

  // Sync peaks array size
  if (peakArrayRef.current.length !== barCount) {
    peakArrayRef.current = new Array(barCount).fill(0);
  }

  for (let i = 0; i < barCount; i++) {
    // Map logarithmic-like bin frequency selection (more detail in bass/mids)
    const binIdx = Math.floor((i / barCount) * (data.length * 0.75));
    const val = data[binIdx] ?? 0;
    
    const targetHeight = (val / 255) * height * sensitivity * 0.95;
    
    // Slow decay peak hold
    if (targetHeight >= peakArrayRef.current[i]) {
      peakArrayRef.current[i] = targetHeight;
    } else {
      peakArrayRef.current[i] = Math.max(0, peakArrayRef.current[i] - 1.5);
    }

    const x = i * (barWidth + gap);
    const y = height - targetHeight;

    // Draw Bar
    if (isWireframe) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, targetHeight);
    } else {
      // Hardware LED color gradient
      const grad = ctx.createLinearGradient(0, height, 0, height - targetHeight);
      grad.addColorStop(0, '#22c55e'); // Green base
      grad.addColorStop(0.65, '#f97316'); // Orange middle
      grad.addColorStop(0.95, '#ef4444'); // Red peak
      
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, targetHeight);
    }

    // Draw Peak-decay tick line
    const peakY = height - peakArrayRef.current[i];
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(x, Math.max(0, peakY - 2), barWidth, 1.5);
  }
};

// 3. 2D Circular Radial Waveform Renderer
export const drawCircularWave = (
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  timeData: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  density: number,
  isWireframe: boolean
) => {
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.22;

  // Calculate Bass average to expand base circle
  let bassSum = 0;
  const bassBins = 8;
  for (let i = 0; i < bassBins; i++) {
    bassSum += freqData[i] || 0;
  }
  const avgBass = bassSum / bassBins;
  const pulsedRadius = baseRadius + (avgBass / 255) * 35 * sensitivity;

  const points = Math.max(36, Math.min(180, Math.floor(density * 4.5)));

  ctx.beginPath();
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    
    // Mirror frequency mapping
    const mirrorIdx = i < points / 2 ? i : points - i;
    const freqBin = Math.floor((mirrorIdx / (points / 2)) * (freqData.length * 0.7));
    
    const freqVal = freqData[freqBin] ?? 0;
    const timeVal = timeData[freqBin] ?? 128;

    // Amplitude displacement
    const displacement = (freqVal / 255) * 60 * sensitivity + ((timeVal - 128) / 128) * 15 * sensitivity;
    const r = pulsedRadius + displacement;

    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#06b6d4';
  ctx.shadowColor = '#0891b2';
  ctx.shadowBlur = 8;
  ctx.stroke();

  // If filled/solid mode, draw inner glowing center
  if (!isWireframe) {
    ctx.shadowBlur = 0;
    const innerGlow = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.3, centerX, centerY, pulsedRadius + 40);
    innerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.02)');
    innerGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
    innerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = innerGlow;
    ctx.fill();
  }

  ctx.shadowBlur = 0;
};

// 4. 2D Waterfall Spectrogram Renderer
// Shifting via canvas buffers
export const drawWaterfallSpectrogram = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  data: Uint8Array,
  width: number,
  height: number,
  sensitivity: number,
  speed: number,
  isWireframe: boolean
) => {
  if (data.length === 0) return;

  const shiftY = Math.max(1, Math.min(4, Math.round(speed)));

  // Shift current canvas image downwards on the GPU to make space at the top
  ctx.drawImage(
    canvas, 
    0, 0, width, height - shiftY, // Source rectangle (all except bottom shiftY pixels)
    0, shiftY, width, height - shiftY // Destination rectangle (shifted down by shiftY)
  );

  // Clear the top row we just vacated
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, width, shiftY);

  // Render the newest frequency row at y=0 (mirrored layout: bass in center, treble on edges)
  const drawWidth = width;
  const center = drawWidth / 2;
  const dataLen = data.length;

  for (let x = 0; x < drawWidth; x++) {
    // Calculate distance from center (0 to 1)
    const distRatio = Math.abs(x - center) / center;
    const binIdx = Math.floor(distRatio * (dataLen * 0.75));
    const val = data[binIdx] ?? 0;

    // Boost/scale value by sensitivity
    const scaledVal = Math.max(0, Math.min(255, val * sensitivity));

    // Draw pixel line block
    ctx.fillStyle = getSpectrogramColor(scaledVal, isWireframe);
    ctx.fillRect(x, 0, 1, shiftY);
  }
};
