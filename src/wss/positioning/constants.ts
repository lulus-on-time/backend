const threshold = 0.90;
const baseRssi = 0.05; // mwatts tried values: 20, 0.1, 0.01
const trilaterationScaleFactor = 1e12;
const speedOfLight = 3e8;
const pathLossExponent = 1.5;
const freq = 2.4e9;
const fourPi = 4 * Math.PI;

export {
  threshold,
  baseRssi,
  trilaterationScaleFactor,
  speedOfLight,
  pathLossExponent,
  freq,
  fourPi,
};
