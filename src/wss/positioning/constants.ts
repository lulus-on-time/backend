// const threshold = 0.7;
// const baseRssi = 0.05; // mwatts tried values: 20, 0.1, 0.01
// // const trilaterationScaleFactor = 1e12;
// const speedOfLight = 3e8;
// const pathLossExponent = 3;
// const freq = 2.4e9;
// const fourPi = 4 * Math.PI;

// export {
//   threshold,
//   baseRssi,
//   // trilaterationScaleFactor,
//   speedOfLight,
//   pathLossExponent,
//   freq,
//   fourPi,
// };

// path loss model
const threshold = 1;
const baseRssi = 0.001;
const baseDistance = (157.557013389 * 2) / 13.7;
const pathLossExponent = 3.5;
const K = 0.015625;

export { threshold, baseRssi, baseDistance, pathLossExponent, K };
