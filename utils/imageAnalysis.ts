import { SemanticHints, ImageAnalysisStats } from '../types.ts';

// --- COLOR SCIENCE HELPERS ---

const rgbToLab = (r: number, g: number, b: number) => {
  let r_ = r / 255, g_ = g / 255, b_ = b / 255;
  r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
  g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
  b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

  let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) / 0.95047;
  let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) / 1.00000;
  let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
};

const getDeltaE = (rgb1: {r:number, g:number, b:number}, rgb2: {r:number, g:number, b:number}) => {
  const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
  const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);
  const deltaL = lab1[0] - lab2[0];
  const deltaA = lab1[1] - lab2[1];
  const deltaB = lab1[2] - lab2[2];
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Get the minimum distance from a pixel to any color in a palette
const getMinColorDist = (pixel: {r:number, g:number, b:number}, palette: {r:number, g:number, b:number}[]) => {
    let min = 1000;
    for (const color of palette) {
        const d = getDeltaE(pixel, color);
        if (d < min) min = d;
    }
    return min;
};

// --- MAIN ANALYSIS FUNCTION ---

export const analyzeImagePixels = async (base64Image: string, hints?: SemanticHints): Promise<ImageAnalysisStats> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Increase resolution cap for better text/edge detection
        const scale = Math.min(1, 1000 / img.width); 
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { reject(new Error("Could not get canvas context")); return; }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const totalPixels = width * height;

        // --- 1. PALETTE PREPARATION ---
        const bgPalette = hints?.backgroundColors?.map(hexToRgb).filter(Boolean) as {r:number,g:number,b:number}[] || [{r:255,g:255,b:255}];
        const dataPalette = hints?.dataColors?.map(hexToRgb).filter(Boolean) as {r:number,g:number,b:number}[] || [];
        const structuralPalette = hints?.structuralColors?.map(hexToRgb).filter(Boolean) as {r:number,g:number,b:number}[] || [];
        const textPalette = hints?.textColors?.map(hexToRgb).filter(Boolean) as {r:number,g:number,b:number}[] || [];
        const junkPalette = hints?.junkColors?.map(hexToRgb).filter(Boolean) as {r:number,g:number,b:number}[] || [];

        const is3D = hints?.is3D || false;

        // Parse spatial junk boxes
        const junkBoxes = hints?.junkRegions?.map(r => {
             const [ymin, xmin, ymax, xmax] = r.box_2d;
             return {
                 yMin: (ymin / 1000) * height,
                 xMin: (xmin / 1000) * width,
                 yMax: (ymax / 1000) * height,
                 xMax: (xmax / 1000) * width
             };
        }) || [];

        // --- 2. THRESHOLDS ---
        // Increase BG threshold slightly to account for compression noise in white backgrounds
        const BG_THRESHOLD = 12.0; 
        
        const PALETTE_MATCH_THRESHOLD = 25.0;

        // --- 3. PIXEL CLASSIFICATION MATRICES ---
        // 0 = Background, 1 = Ink
        const isInkMatrix = new Uint8Array(totalPixels);
        // 0 = Data, 1 = Structure/Junk
        const isStructureMatrix = new Uint8Array(totalPixels); 

        // --- PASS 1: INITIAL CLASSIFICATION ---
        for (let i = 0; i < totalPixels; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            const pixel = { r, g, b };
            
            const x = i % width;
            const y = Math.floor(i / width);

            // A. Is it Background?
            let isBg = false;
            
            // Check background palette
            const distToBg = getMinColorDist(pixel, bgPalette);
            if (distToBg < BG_THRESHOLD) {
                isBg = true;
            } else {
                // Heuristic: Very high brightness and low saturation often implies background
                const lum = 0.299*r + 0.587*g + 0.114*b;
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const sat = max === 0 ? 0 : (max - min) / max;
                if (lum > 245 && sat < 0.05) isBg = true;
            }

            if (!isBg) {
                isInkMatrix[i] = 1;
                
                // B. Spatial Junk Check (Strong override)
                let insideJunkBox = false;
                for (const box of junkBoxes) {
                    if (x >= box.xMin && x <= box.xMax && y >= box.yMin && y <= box.yMax) {
                        insideJunkBox = true;
                        break;
                    }
                }

                if (insideJunkBox) {
                    const distToData = getMinColorDist(pixel, dataPalette);
                    // Only count as structure if it's not IDENTICAL to a known data color
                    if (distToData > 10.0) {
                        isStructureMatrix[i] = 1;
                        continue;
                    }
                }

                // C. Competition Logic
                const distToData = getMinColorDist(pixel, dataPalette);
                const distToText = getMinColorDist(pixel, textPalette);
                const bestDataDist = Math.min(distToData, distToText);

                const distToStructure = getMinColorDist(pixel, structuralPalette);
                const distToJunk = getMinColorDist(pixel, junkPalette);
                const bestStructureDist = Math.min(distToStructure, distToJunk);

                const isDataMatch = bestDataDist < PALETTE_MATCH_THRESHOLD;
                const isStructureMatch = bestStructureDist < PALETTE_MATCH_THRESHOLD;

                if (isDataMatch || isStructureMatch) {
                    if (isDataMatch && !isStructureMatch) {
                        isStructureMatrix[i] = 0; 
                    } else if (!isDataMatch && isStructureMatch) {
                        isStructureMatrix[i] = 1; 
                    } else {
                        // Conflict
                        if (bestDataDist <= bestStructureDist) {
                            isStructureMatrix[i] = 0; 
                        } else {
                            isStructureMatrix[i] = 1; 
                        }
                    }
                    continue;
                }

                // D. Ambiguous Pixels
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const sat = max === 0 ? 0 : (max - min) / max;
                const lum = 0.299*r + 0.587*g + 0.114*b;

                if (sat > 0.15) {
                    if (is3D) {
                         if (bestDataDist > 15.0) {
                            isStructureMatrix[i] = 1;
                         } else {
                            isStructureMatrix[i] = 0; 
                         }
                    } else {
                         isStructureMatrix[i] = 0; // Vibrant -> Data
                    }
                } else {
                    // Dark -> Data (Text/Axis), Light -> Structure (Grid)
                    // We increase threshold for "Data" darkness because text is usually dark.
                    if (lum < 130) {
                         isStructureMatrix[i] = 0; 
                    } else {
                         isStructureMatrix[i] = 1; 
                    }
                }
            }
        }

        // --- PASS 2: DESPECKLING & ANTI-ALIASING CORRECTION ---
        // This makes results more "realistic" by handling the fuzzy edges of charts
        // which computer vision usually punishes.
        const structureMatrixFixed = new Uint8Array(isStructureMatrix);
        
        for (let i = 0; i < totalPixels; i++) {
            if (isInkMatrix[i] === 1) {
                const x = i % width;
                const y = Math.floor(i / width);
                
                if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                    
                    // 1. Isolate Noise Removal
                    const neighborInk = 
                        isInkMatrix[i-1] + isInkMatrix[i+1] + 
                        isInkMatrix[i-width] + isInkMatrix[i+width];
                    if (neighborInk === 0) {
                        isInkMatrix[i] = 0; // Remove single pixel noise
                        continue;
                    }

                    // 2. Structure correction (Anti-aliasing fix)
                    // If I am Structure (e.g. gray edge), but my neighbors are Data (blue bar),
                    // I am probably just the edge of the bar.
                    if (isStructureMatrix[i] === 1) {
                         // Check 4 neighbors
                         const left = isStructureMatrix[i-1];
                         const right = isStructureMatrix[i+1];
                         const top = isStructureMatrix[i-width];
                         const bottom = isStructureMatrix[i+width];

                         // 0 is Data. If surrounding is mostly data (0), flip me.
                         // Sum of neighbors (where 0 is data)
                         // If neighbor is Ink but NOT structure, it counts as Data.
                         let dataNeighbors = 0;
                         if (isInkMatrix[i-1] && left === 0) dataNeighbors++;
                         if (isInkMatrix[i+1] && right === 0) dataNeighbors++;
                         if (isInkMatrix[i-width] && top === 0) dataNeighbors++;
                         if (isInkMatrix[i+width] && bottom === 0) dataNeighbors++;

                         if (dataNeighbors >= 2) {
                             structureMatrixFixed[i] = 0; // Flip to Data
                         }
                    }
                }
            }
        }

        // --- STATS CALCULATION ---
        let structuralPixelCount = 0;
        let dataPixelCount = 0;
        let inkPixels = 0;
        
        for (let i = 0; i < totalPixels; i++) {
            if (isInkMatrix[i] === 1) {
                inkPixels++;
                if (structureMatrixFixed[i] === 1) {
                    structuralPixelCount++;
                } else {
                    dataPixelCount++;
                }
            }
        }

        // Tufte's Formula: Data Ink / Total Ink
        // We ensure a safe denominator.
        const dataInkRatio = inkPixels > 0 ? dataPixelCount / inkPixels : 0;

        // --- DEBUG MAP GENERATION (Alpha blended for overlay) ---
        const generateMap = (r: number, g: number, b: number, type: 'ink' | 'structure' | 'data') => {
            const mapData = ctx.createImageData(width, height);
            for (let i = 0; i < totalPixels; i++) {
                const idx = i * 4;
                let show = false;
                // Use the FIXED matrix
                if (type === 'ink' && isInkMatrix[i] === 1) show = true;
                if (type === 'structure' && isInkMatrix[i] === 1 && structureMatrixFixed[i] === 1) show = true;
                if (type === 'data' && isInkMatrix[i] === 1 && structureMatrixFixed[i] === 0) show = true;

                if (show) {
                    mapData.data[idx] = r; 
                    mapData.data[idx + 1] = g; 
                    mapData.data[idx + 2] = b; 
                    mapData.data[idx + 3] = 255; // Full opacity, we'll control opacity in CSS
                } else {
                    mapData.data[idx] = 0; 
                    mapData.data[idx + 1] = 0; 
                    mapData.data[idx + 2] = 0; 
                    mapData.data[idx + 3] = 0;
                }
            }
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tCtx = tempCanvas.getContext('2d');
            tCtx?.putImageData(mapData, 0, 0);
            return tempCanvas.toDataURL('image/png');
        };

        const inkMap = generateMap(44, 62, 80, 'ink'); 
        const structureMap = generateMap(239, 68, 68, 'structure'); // Red for Junk
        const dataMap = generateMap(34, 197, 94, 'data'); // Green for Data

        resolve({
          dataInkRatio,
          totalPixels,
          inkPixels,
          dataInkPixels: dataPixelCount,
          structuralPixels: structuralPixelCount,
          backgroundHex: hints?.backgroundColor || "#ffffff",
          detectedJunkAttributes: [],
          debugMaps: { inkMap, structureMap, dataMap },
          width,
          height
        });

      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = base64Image;
  });
};