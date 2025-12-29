import { jStat } from "jstat";

/**
 * Shapiro–Wilk normality test (Royston’s approximation).
 * @param {number[]} x – your data
 * @param {number} [alpha=0.05]
 * @returns {{ W: number, pValue: number, normal: boolean }}
 */
export function runShapiroWilk(x, alpha = 0.05) {
  const n = x.length;
  if (n < 3 || n > 5000) {
    throw new Error("Shapiro–Wilk requires 3 ≤ n ≤ 5000");
  }

  const y = [...x].sort((a, b) => a - b);
  const μ = jStat.mean(y);
  const z = y.map((v) => v - μ);

  const m = Array.from({ length: n }, (_, i) => {
    const pi = (i + 1 - 0.375) / (n + 0.25);
    return jStat.normal.inv(pi, 0, 1);
  });

  const half = Math.floor(n / 2);
  const denom = m.slice(n - half).reduce((s, v) => s + v * v, 0);
  const a = m.slice(n - half).map((v) => v / Math.sqrt(denom));

  const num =
    a.map((ai, i) => ai * (y[n - 1 - i] - y[i])).reduce((s, v) => s + v, 0) **
    2;
  const ssd = z.reduce((s, v) => s + v * v, 0);
  const W = num / ssd;

  const lnN = Math.log(n);
  const mu = -1.2725 + 1.0521 * lnN;
  const sigma = 1.0308 - 0.26758 * lnN;
  const zStat = (Math.log(1 - W) - mu) / sigma;
  const pValue = jStat.normal.cdf(zStat, 0, 1);

  return { W, pValue, normal: pValue > alpha };
}

/**
 * Levene’s test (median‐based) for k groups.
 * @param {number[][]} groups – array of samples
 * @param {number} [alpha=0.05]
 * @returns {{ F: number, pValue: number, equalVariance: boolean }}
 */
export function runLevene(groups, alpha = 0.05) {
  const k = groups.length;
  const counts = groups.map((g) => g.length);
  const N = counts.reduce((s, v) => s + v, 0);

  const medians = groups.map((g) => jStat.median(g));
  const deviations = groups.map((g, i) =>
    g.map((v) => Math.abs(v - medians[i]))
  );
  const allDevs = deviations.flat();
  const grandMean = jStat.mean(allDevs);

  const SSB = deviations.reduce(
    (sum, d, i) => sum + counts[i] * Math.pow(jStat.mean(d) - grandMean, 2),
    0
  );

  const SSW = deviations.reduce(
    (sum, d) => sum + d.reduce((s, v) => s + Math.pow(v - jStat.mean(d), 2), 0),
    0
  );

  const dfB = k - 1;
  const dfW = N - k;
  const F = SSB / dfB / (SSW / dfW);
  const pValue = 1 - jStat.centralF.cdf(F, dfB, dfW);

  return { F, pValue, equalVariance: pValue > alpha };
}
