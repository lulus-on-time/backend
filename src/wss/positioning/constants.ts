const threshold = process.env.THRESHOLD
  ? parseFloat(process.env.THRESHOLD)
  : 0.5;
// path loss model
// baseRssi and baseDistance calculated by observation
const baseRssi = 0.001;
const baseDistance = (157.557013389 * 2) / 13.7;
const pathLossExponent = 3.5;
const K = 0.015625;

export { threshold, baseRssi, baseDistance, pathLossExponent, K };
