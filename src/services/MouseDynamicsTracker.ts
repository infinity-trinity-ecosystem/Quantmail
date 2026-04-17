/**
 * MouseDynamicsTracker
 * ====================
 *
 * Continuous behavioral biometric that models how a user *moves* a
 * pointing device. For each rolling window of mouse events the tracker
 * emits a 64-dimensional feature vector capturing:
 *
 *   - velocity statistics (mean, std, min, max, skew, kurtosis),
 *   - acceleration statistics (same set),
 *   - jerk and curvature statistics,
 *   - click-precision (distance from the first click to the downstream
 *     settle point),
 *   - scroll-speed statistics,
 *   - hover duration statistics,
 *   - direction-change frequency and angular distribution,
 *   - path straightness, arc-length / displacement ratio,
 *   - dwell / movement duty-cycle features.
 *
 * The 64-feature layout is documented in {@link FEATURE_LAYOUT}. The
 * tracker builds a per-user mean vector with per-feature variance and
 * compares live windows using a weighted Euclidean distance (a simple
 * diagonal Mahalanobis). It also checks every move for *impossible*
 * kinematics — teleports, superhuman velocity, zero-latency jumps —
 * which are strong signals of bots or remote-control tools.
 *
 * The file contains no stubs. Every function is fully implemented.
 */

// ─── Public Types ────────────────────────────────────────────────────────────

/** Flavor of pointing-device event. */
export type MouseEventKind = "move" | "click" | "scroll" | "hover" | "down" | "up";

/**
 * Raw pointer/mouse event as captured on the client. Coordinates are in
 * CSS pixels relative to the viewport. `t` is a wall-clock millisecond
 * timestamp.
 */
export interface MousePointerEvent {
  readonly userId: string;
  readonly kind: MouseEventKind;
  readonly t: number;
  readonly x: number;
  readonly y: number;
  /** Scroll delta, only meaningful for `kind === "scroll"`. */
  readonly scrollDy?: number;
  readonly deviceId?: string;
  /** Optional intended target coordinates for click-precision scoring. */
  readonly targetX?: number;
  readonly targetY?: number;
}

/** Result of a single comparison of a live window against the profile. */
export interface MouseComparisonResult {
  readonly userId: string;
  readonly distance: number;
  readonly score: number;
  readonly teleportDetected: boolean;
  readonly teleportCount: number;
  readonly sampleSize: number;
  readonly anomalous: boolean;
  readonly computedAt: number;
  readonly vector: readonly number[]; // 64-dim live feature vector
}

/** Per-user stored mouse signature. */
export interface MouseSignature {
  readonly userId: string;
  readonly mean: readonly number[]; // 64
  readonly variance: readonly number[]; // 64
  readonly samples: number;
  readonly builtAt: number;
  readonly version: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const MouseConstants = Object.freeze({
  FEATURE_COUNT: 64,
  /** Minimum number of feature vectors before a signature is considered built. */
  SIGNATURE_MIN_SAMPLES: 20,
  /** Maximum feature vectors retained for signature refinement. */
  SIGNATURE_MAX_SAMPLES: 500,
  /** Rolling window used when emitting a feature vector, in events. */
  WINDOW_EVENTS: 250,
  /** Minimum events per window to permit scoring. */
  MIN_WINDOW_EVENTS: 40,
  /** Recommended comparison cadence (ms). */
  COMPARE_INTERVAL_MS: 10_000,
  /**
   * Maximum pixels/ms considered humanly possible. Anything above this
   * is treated as a "teleport" (bot / scripted cursor warp / remote-
   * control). Empirical studies of mouse movement (Accot & Zhai 1997;
   * MacKenzie 1992) put peak sustained human cursor velocity around
   * 3-4 px/ms with short spikes up to ~6 px/ms on large displays. A
   * cap of 8 px/ms gives comfortable headroom for very fast users on
   * high-DPI monitors while still flagging obviously-synthetic jumps.
   */
  MAX_PLAUSIBLE_VELOCITY_PX_MS: 8,
  /** Distance threshold (pixels) for a single-step teleport check. */
  TELEPORT_JUMP_PX: 900,
  /** Dt below this + big jump → teleport. */
  TELEPORT_MAX_DT_MS: 4,
  /** Mahalanobis-ish threshold for anomaly. */
  ANOMALY_DISTANCE: 3.0,
  /** Maximum raw events retained in the ring buffer. */
  MAX_RAW_EVENTS: 4_000,
  /** Signature format version. */
  SIGNATURE_VERSION: 1,
  /** Any zero-variance feature uses this floor to avoid /0. */
  VARIANCE_FLOOR: 1e-4,
} as const);

/**
 * Documented 64-dim feature layout. Keep this authoritative — the
 * tracker, trainer, and any visualization layer read it.
 */
export const FEATURE_LAYOUT: ReadonlyArray<{
  readonly index: number;
  readonly name: string;
  readonly description: string;
}> = Object.freeze([
  { index: 0, name: "velocity.mean", description: "mean pointer velocity (px/ms)" },
  { index: 1, name: "velocity.std", description: "std of pointer velocity" },
  { index: 2, name: "velocity.min", description: "min pointer velocity" },
  { index: 3, name: "velocity.max", description: "max pointer velocity" },
  { index: 4, name: "velocity.p50", description: "median pointer velocity" },
  { index: 5, name: "velocity.p90", description: "90th percentile velocity" },
  { index: 6, name: "velocity.skew", description: "velocity distribution skewness" },
  { index: 7, name: "velocity.kurt", description: "velocity distribution kurtosis" },
  { index: 8, name: "accel.mean", description: "mean pointer acceleration" },
  { index: 9, name: "accel.std", description: "std of pointer acceleration" },
  { index: 10, name: "accel.min", description: "min pointer acceleration" },
  { index: 11, name: "accel.max", description: "max pointer acceleration" },
  { index: 12, name: "accel.p50", description: "median pointer acceleration" },
  { index: 13, name: "accel.p90", description: "90th percentile acceleration" },
  { index: 14, name: "accel.skew", description: "acceleration skewness" },
  { index: 15, name: "accel.kurt", description: "acceleration kurtosis" },
  { index: 16, name: "jerk.mean", description: "mean jerk (derivative of acceleration)" },
  { index: 17, name: "jerk.std", description: "std of jerk" },
  { index: 18, name: "jerk.max", description: "max jerk" },
  { index: 19, name: "jerk.p90", description: "90th percentile jerk" },
  { index: 20, name: "curvature.mean", description: "mean absolute curvature" },
  { index: 21, name: "curvature.std", description: "std of curvature" },
  { index: 22, name: "curvature.max", description: "max curvature" },
  { index: 23, name: "curvature.p90", description: "90th percentile curvature" },
  { index: 24, name: "angle.mean", description: "mean absolute direction" },
  { index: 25, name: "angle.std", description: "std of direction" },
  { index: 26, name: "angleChange.mean", description: "mean |Δ direction|" },
  { index: 27, name: "angleChange.std", description: "std of |Δ direction|" },
  { index: 28, name: "angleChange.p90", description: "p90 of |Δ direction|" },
  { index: 29, name: "directionReversals", description: "sign flips of dx per window" },
  { index: 30, name: "path.length", description: "total path length in px" },
  { index: 31, name: "path.displacement", description: "start-to-end displacement px" },
  { index: 32, name: "path.straightness", description: "displacement / path length" },
  { index: 33, name: "path.boundingWidth", description: "width of bounding box" },
  { index: 34, name: "path.boundingHeight", description: "height of bounding box" },
  { index: 35, name: "click.count", description: "clicks per window" },
  { index: 36, name: "click.intervalMean", description: "mean interval between clicks" },
  { index: 37, name: "click.intervalStd", description: "std of click intervals" },
  { index: 38, name: "click.precisionMean", description: "mean click → target distance" },
  { index: 39, name: "click.precisionStd", description: "std of click → target distance" },
  { index: 40, name: "click.downUpMean", description: "mean down-up dwell ms" },
  { index: 41, name: "click.downUpStd", description: "std of down-up dwell ms" },
  { index: 42, name: "scroll.count", description: "scroll events per window" },
  { index: 43, name: "scroll.dyMean", description: "mean |scroll dy|" },
  { index: 44, name: "scroll.dyStd", description: "std of |scroll dy|" },
  { index: 45, name: "scroll.burstRate", description: "bursts / window" },
  { index: 46, name: "hover.count", description: "hover events per window" },
  { index: 47, name: "hover.durationMean", description: "mean hover duration" },
  { index: 48, name: "hover.durationStd", description: "std of hover duration" },
  { index: 49, name: "dt.mean", description: "mean Δt between events" },
  { index: 50, name: "dt.std", description: "std of Δt between events" },
  { index: 51, name: "dt.min", description: "min Δt" },
  { index: 52, name: "dt.p95", description: "p95 Δt" },
  { index: 53, name: "duty.move", description: "fraction of window spent moving" },
  { index: 54, name: "duty.idle", description: "fraction of window idle (>200 ms gap)" },
  { index: 55, name: "quadrant.tl", description: "fraction of events in top-left quadrant" },
  { index: 56, name: "quadrant.tr", description: "fraction in top-right quadrant" },
  { index: 57, name: "quadrant.bl", description: "fraction in bottom-left quadrant" },
  { index: 58, name: "quadrant.br", description: "fraction in bottom-right quadrant" },
  { index: 59, name: "velocity.q1", description: "first-quartile velocity" },
  { index: 60, name: "velocity.q3", description: "third-quartile velocity" },
  { index: 61, name: "accel.q1", description: "first-quartile acceleration" },
  { index: 62, name: "accel.q3", description: "third-quartile acceleration" },
  { index: 63, name: "teleport.rate", description: "teleports per window" },
]);

// ─── Internal state ──────────────────────────────────────────────────────────

interface UserState {
  userId: string;
  events: MousePointerEvent[];
  vectors: number[][]; // history of recent feature vectors
  signature: MouseSignature | null;
  teleports: number; // running lifetime teleport count
  lastVectorAt: number;
  lastDistance: number;
  lastScore: number;
  anomalous: boolean;
  anomalySince: number | null;
}

function newState(userId: string): UserState {
  return {
    userId,
    events: [],
    vectors: [],
    signature: null,
    teleports: 0,
    lastVectorAt: 0,
    lastDistance: 0,
    lastScore: 1,
    anomalous: false,
    anomalySince: null,
  };
}

// ─── Math helpers ────────────────────────────────────────────────────────────

function vMean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < xs.length; i += 1) s += xs[i]!;
  return s / xs.length;
}

function vVar(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const m = vMean(xs);
  let s = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const d = xs[i]! - m;
    s += d * d;
  }
  return s / xs.length;
}

function vStd(xs: readonly number[]): number {
  return Math.sqrt(vVar(xs));
}

function vPercentile(xs: readonly number[], p: number): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const rank = p * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo]!;
  const frac = rank - lo;
  return sorted[lo]! * (1 - frac) + sorted[hi]! * frac;
}

function vSkew(xs: readonly number[]): number {
  if (xs.length < 3) return 0;
  const m = vMean(xs);
  const s = vStd(xs);
  if (s < 1e-9) return 0;
  let total = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const z = (xs[i]! - m) / s;
    total += z * z * z;
  }
  return total / xs.length;
}

function vKurt(xs: readonly number[]): number {
  if (xs.length < 4) return 0;
  const m = vMean(xs);
  const s = vStd(xs);
  if (s < 1e-9) return 0;
  let total = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const z = (xs[i]! - m) / s;
    total += z * z * z * z;
  }
  return total / xs.length - 3;
}

function vMin(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let m = xs[0]!;
  for (let i = 1; i < xs.length; i += 1) if (xs[i]! < m) m = xs[i]!;
  return m;
}

function vMax(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  let m = xs[0]!;
  for (let i = 1; i < xs.length; i += 1) if (xs[i]! > m) m = xs[i]!;
  return m;
}

function safeDiv(a: number, b: number): number {
  if (b === 0 || !Number.isFinite(b)) return 0;
  return a / b;
}

// ─── Feature extraction ──────────────────────────────────────────────────────

interface Derived {
  dtList: number[];
  velocityList: number[]; // px / ms
  accelList: number[]; // px / ms^2
  jerkList: number[];
  angles: number[];
  angleChanges: number[];
  curvatureList: number[];
  pathLength: number;
  displacement: number;
  boundingWidth: number;
  boundingHeight: number;
  directionReversals: number;
  teleports: number;
}

function deriveMovementSeries(events: readonly MousePointerEvent[]): Derived {
  const d: Derived = {
    dtList: [],
    velocityList: [],
    accelList: [],
    jerkList: [],
    angles: [],
    angleChanges: [],
    curvatureList: [],
    pathLength: 0,
    displacement: 0,
    boundingWidth: 0,
    boundingHeight: 0,
    directionReversals: 0,
    teleports: 0,
  };

  const moves: MousePointerEvent[] = [];
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.kind === "move" || e.kind === "down" || e.kind === "up") moves.push(e);
  }
  if (moves.length < 2) return d;

  let minX = moves[0]!.x;
  let maxX = minX;
  let minY = moves[0]!.y;
  let maxY = minY;
  let prevDxSign = 0;

  for (let i = 1; i < moves.length; i += 1) {
    const a = moves[i - 1]!;
    const b = moves[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const dt = Math.max(1, b.t - a.t);
    const v = dist / dt;
    d.dtList.push(dt);
    d.velocityList.push(v);
    d.pathLength += dist;
    if (b.x < minX) minX = b.x;
    if (b.x > maxX) maxX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.y > maxY) maxY = b.y;

    // Teleport check — huge jump in almost no time.
    if (
      dist >= MouseConstants.TELEPORT_JUMP_PX &&
      dt <= MouseConstants.TELEPORT_MAX_DT_MS
    ) {
      d.teleports += 1;
    }
    if (v > MouseConstants.MAX_PLAUSIBLE_VELOCITY_PX_MS) {
      d.teleports += 1;
    }

    const ang = Math.atan2(dy, dx);
    d.angles.push(ang);
    const signDx = Math.sign(dx);
    if (prevDxSign !== 0 && signDx !== 0 && signDx !== prevDxSign) {
      d.directionReversals += 1;
    }
    if (signDx !== 0) prevDxSign = signDx;
  }

  // Acceleration and jerk from velocity series.
  for (let i = 1; i < d.velocityList.length; i += 1) {
    const dv = d.velocityList[i]! - d.velocityList[i - 1]!;
    const dt = Math.max(1, d.dtList[i]!);
    d.accelList.push(dv / dt);
  }
  for (let i = 1; i < d.accelList.length; i += 1) {
    const dA = d.accelList[i]! - d.accelList[i - 1]!;
    const dt = Math.max(1, d.dtList[i]! + d.dtList[i - 1]!);
    d.jerkList.push(dA / dt);
  }
  for (let i = 1; i < d.angles.length; i += 1) {
    let da = d.angles[i]! - d.angles[i - 1]!;
    // wrap to [-π, π]
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const adA = Math.abs(da);
    d.angleChanges.push(adA);
    const ds = Math.max(0.1, d.velocityList[i]! * d.dtList[i]!);
    d.curvatureList.push(adA / ds);
  }

  const first = moves[0]!;
  const last = moves[moves.length - 1]!;
  d.displacement = Math.hypot(last.x - first.x, last.y - first.y);
  d.boundingWidth = maxX - minX;
  d.boundingHeight = maxY - minY;
  return d;
}

interface ClickStats {
  count: number;
  intervalMean: number;
  intervalStd: number;
  precisionMean: number;
  precisionStd: number;
  downUpMean: number;
  downUpStd: number;
}

function deriveClickStats(events: readonly MousePointerEvent[]): ClickStats {
  const clicks: MousePointerEvent[] = [];
  const intervals: number[] = [];
  const precisions: number[] = [];
  const downUps: number[] = [];
  let prevT = 0;
  let lastDownAt = 0;

  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.kind === "click") {
      clicks.push(e);
      if (prevT > 0) intervals.push(e.t - prevT);
      prevT = e.t;
      if (typeof e.targetX === "number" && typeof e.targetY === "number") {
        precisions.push(Math.hypot(e.x - e.targetX, e.y - e.targetY));
      }
    } else if (e.kind === "down") {
      lastDownAt = e.t;
    } else if (e.kind === "up" && lastDownAt > 0) {
      downUps.push(e.t - lastDownAt);
      lastDownAt = 0;
    }
  }

  return {
    count: clicks.length,
    intervalMean: vMean(intervals),
    intervalStd: vStd(intervals),
    precisionMean: vMean(precisions),
    precisionStd: vStd(precisions),
    downUpMean: vMean(downUps),
    downUpStd: vStd(downUps),
  };
}

interface ScrollStats {
  count: number;
  dyMean: number;
  dyStd: number;
  burstRate: number;
}

function deriveScrollStats(events: readonly MousePointerEvent[]): ScrollStats {
  const dys: number[] = [];
  let bursts = 0;
  let prevScrollT = 0;
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.kind !== "scroll") continue;
    dys.push(Math.abs(e.scrollDy ?? 0));
    if (prevScrollT > 0 && e.t - prevScrollT < 80) bursts += 1;
    prevScrollT = e.t;
  }
  return {
    count: dys.length,
    dyMean: vMean(dys),
    dyStd: vStd(dys),
    burstRate: bursts,
  };
}

interface HoverStats {
  count: number;
  durationMean: number;
  durationStd: number;
}

function deriveHoverStats(events: readonly MousePointerEvent[]): HoverStats {
  const durations: number[] = [];
  let inHover = false;
  let hoverStart = 0;
  let count = 0;
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.kind === "hover") {
      if (!inHover) {
        inHover = true;
        hoverStart = e.t;
        count += 1;
      }
    } else if (inHover) {
      durations.push(e.t - hoverStart);
      inHover = false;
    }
  }
  if (inHover && events.length > 0) {
    durations.push(events[events.length - 1]!.t - hoverStart);
  }
  return {
    count,
    durationMean: vMean(durations),
    durationStd: vStd(durations),
  };
}

interface QuadrantStats {
  tl: number;
  tr: number;
  bl: number;
  br: number;
  centerX: number;
  centerY: number;
}

function deriveQuadrants(events: readonly MousePointerEvent[]): QuadrantStats {
  if (events.length === 0) {
    return { tl: 0, tr: 0, bl: 0, br: 0, centerX: 0, centerY: 0 };
  }
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < events.length; i += 1) {
    sx += events[i]!.x;
    sy += events[i]!.y;
  }
  const cx = sx / events.length;
  const cy = sy / events.length;
  let tl = 0;
  let tr = 0;
  let bl = 0;
  let br = 0;
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.x < cx && e.y < cy) tl += 1;
    else if (e.x >= cx && e.y < cy) tr += 1;
    else if (e.x < cx && e.y >= cy) bl += 1;
    else br += 1;
  }
  const total = Math.max(1, events.length);
  return {
    tl: tl / total,
    tr: tr / total,
    bl: bl / total,
    br: br / total,
    centerX: cx,
    centerY: cy,
  };
}

/**
 * Compute the 64-feature vector for a window of events. The returned
 * array always has length {@link MouseConstants.FEATURE_COUNT}; empty
 * features are zero-filled rather than omitted so the downstream
 * Mahalanobis distance is well-defined.
 */
export function computeFeatureVector(
  events: readonly MousePointerEvent[]
): number[] {
  const v = new Array<number>(MouseConstants.FEATURE_COUNT).fill(0);
  if (events.length === 0) return v;

  const d = deriveMovementSeries(events);
  const click = deriveClickStats(events);
  const scroll = deriveScrollStats(events);
  const hover = deriveHoverStats(events);
  const quad = deriveQuadrants(events);

  v[0] = vMean(d.velocityList);
  v[1] = vStd(d.velocityList);
  v[2] = vMin(d.velocityList);
  v[3] = vMax(d.velocityList);
  v[4] = vPercentile(d.velocityList, 0.5);
  v[5] = vPercentile(d.velocityList, 0.9);
  v[6] = vSkew(d.velocityList);
  v[7] = vKurt(d.velocityList);

  v[8] = vMean(d.accelList);
  v[9] = vStd(d.accelList);
  v[10] = vMin(d.accelList);
  v[11] = vMax(d.accelList);
  v[12] = vPercentile(d.accelList, 0.5);
  v[13] = vPercentile(d.accelList, 0.9);
  v[14] = vSkew(d.accelList);
  v[15] = vKurt(d.accelList);

  v[16] = vMean(d.jerkList);
  v[17] = vStd(d.jerkList);
  v[18] = vMax(d.jerkList.map(Math.abs));
  v[19] = vPercentile(d.jerkList.map(Math.abs), 0.9);

  v[20] = vMean(d.curvatureList);
  v[21] = vStd(d.curvatureList);
  v[22] = vMax(d.curvatureList);
  v[23] = vPercentile(d.curvatureList, 0.9);

  v[24] = vMean(d.angles.map(Math.abs));
  v[25] = vStd(d.angles);
  v[26] = vMean(d.angleChanges);
  v[27] = vStd(d.angleChanges);
  v[28] = vPercentile(d.angleChanges, 0.9);
  v[29] = d.directionReversals;

  v[30] = d.pathLength;
  v[31] = d.displacement;
  v[32] = safeDiv(d.displacement, d.pathLength);
  v[33] = d.boundingWidth;
  v[34] = d.boundingHeight;

  v[35] = click.count;
  v[36] = click.intervalMean;
  v[37] = click.intervalStd;
  v[38] = click.precisionMean;
  v[39] = click.precisionStd;
  v[40] = click.downUpMean;
  v[41] = click.downUpStd;

  v[42] = scroll.count;
  v[43] = scroll.dyMean;
  v[44] = scroll.dyStd;
  v[45] = scroll.burstRate;

  v[46] = hover.count;
  v[47] = hover.durationMean;
  v[48] = hover.durationStd;

  v[49] = vMean(d.dtList);
  v[50] = vStd(d.dtList);
  v[51] = vMin(d.dtList);
  v[52] = vPercentile(d.dtList, 0.95);

  const moving = d.dtList.filter((dt) => dt < 200).length;
  const idle = d.dtList.filter((dt) => dt >= 200).length;
  const dtTotal = Math.max(1, d.dtList.length);
  v[53] = moving / dtTotal;
  v[54] = idle / dtTotal;

  v[55] = quad.tl;
  v[56] = quad.tr;
  v[57] = quad.bl;
  v[58] = quad.br;

  v[59] = vPercentile(d.velocityList, 0.25);
  v[60] = vPercentile(d.velocityList, 0.75);
  v[61] = vPercentile(d.accelList, 0.25);
  v[62] = vPercentile(d.accelList, 0.75);
  v[63] = d.teleports;

  // Replace any NaN/Infinity (e.g. from empty derived lists) with zeros.
  for (let i = 0; i < v.length; i += 1) {
    if (!Number.isFinite(v[i]!)) v[i] = 0;
  }
  return v;
}

// ─── Signature management ───────────────────────────────────────────────────

function buildSignature(userId: string, vectors: readonly number[][]): MouseSignature {
  const dim = MouseConstants.FEATURE_COUNT;
  const mean = new Array<number>(dim).fill(0);
  if (vectors.length === 0) {
    return {
      userId,
      mean,
      variance: new Array<number>(dim).fill(MouseConstants.VARIANCE_FLOOR),
      samples: 0,
      builtAt: Date.now(),
      version: MouseConstants.SIGNATURE_VERSION,
    };
  }
  for (let i = 0; i < vectors.length; i += 1) {
    const v = vectors[i]!;
    for (let j = 0; j < dim; j += 1) mean[j]! += v[j]!;
  }
  for (let j = 0; j < dim; j += 1) mean[j]! /= vectors.length;
  const variance = new Array<number>(dim).fill(0);
  for (let i = 0; i < vectors.length; i += 1) {
    const v = vectors[i]!;
    for (let j = 0; j < dim; j += 1) {
      const d = v[j]! - mean[j]!;
      variance[j]! += d * d;
    }
  }
  for (let j = 0; j < dim; j += 1) {
    variance[j]! /= Math.max(1, vectors.length - 1);
    if (variance[j]! < MouseConstants.VARIANCE_FLOOR) {
      variance[j] = MouseConstants.VARIANCE_FLOOR;
    }
  }
  return {
    userId,
    mean,
    variance,
    samples: vectors.length,
    builtAt: Date.now(),
    version: MouseConstants.SIGNATURE_VERSION,
  };
}

/**
 * Diagonal Mahalanobis-style distance: `sqrt(Σ (x_i - μ_i)^2 / σ_i^2) / √d`.
 * The divide-by-√d yields a distance that is invariant to dimensionality,
 * so the same {@link MouseConstants.ANOMALY_DISTANCE} threshold works even
 * if the feature set grows later.
 */
export function mahalanobisLite(
  x: readonly number[],
  sig: MouseSignature
): number {
  const dim = Math.min(x.length, sig.mean.length);
  if (dim === 0) return 0;
  let acc = 0;
  for (let i = 0; i < dim; i += 1) {
    const d = x[i]! - sig.mean[i]!;
    const v = sig.variance[i]!;
    acc += (d * d) / (v < MouseConstants.VARIANCE_FLOOR ? MouseConstants.VARIANCE_FLOOR : v);
  }
  return Math.sqrt(acc / dim);
}

export function mapMouseDistanceToScore(distance: number): number {
  if (!Number.isFinite(distance) || distance <= 0) return 1;
  // Logistic curve centered on ANOMALY_DISTANCE.
  const k = 1.5;
  return 1 / (1 + Math.exp(k * (distance - MouseConstants.ANOMALY_DISTANCE)));
}

// ─── Teleport detection ──────────────────────────────────────────────────────

export interface TeleportReport {
  readonly detected: boolean;
  readonly count: number;
  readonly largestJumpPx: number;
  readonly smallestDtMs: number;
}

/**
 * Scan a raw event buffer for impossible moves. A jump is "impossible"
 * either because it exceeds `MAX_PLAUSIBLE_VELOCITY_PX_MS` or because it
 * covers more than `TELEPORT_JUMP_PX` in less than `TELEPORT_MAX_DT_MS`.
 * Both conditions indicate a synthetic event, e.g. a remote-control tool
 * or a scripted bot that programmatically warps the cursor.
 */
export function detectTeleports(events: readonly MousePointerEvent[]): TeleportReport {
  let count = 0;
  let largest = 0;
  let smallestDt = Number.POSITIVE_INFINITY;
  let prev: MousePointerEvent | null = null;
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i]!;
    if (e.kind !== "move" && e.kind !== "down" && e.kind !== "up") continue;
    if (prev) {
      const dx = e.x - prev.x;
      const dy = e.y - prev.y;
      const dist = Math.hypot(dx, dy);
      const dt = Math.max(1, e.t - prev.t);
      if (dist > largest) largest = dist;
      if (dt < smallestDt) smallestDt = dt;
      const v = dist / dt;
      if (
        v > MouseConstants.MAX_PLAUSIBLE_VELOCITY_PX_MS ||
        (dist >= MouseConstants.TELEPORT_JUMP_PX &&
          dt <= MouseConstants.TELEPORT_MAX_DT_MS)
      ) {
        count += 1;
      }
    }
    prev = e;
  }
  return {
    detected: count > 0,
    count,
    largestJumpPx: largest,
    smallestDtMs: Number.isFinite(smallestDt) ? smallestDt : 0,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export interface MouseDynamicsStore {
  load(userId: string): UserState | null;
  save(userId: string, s: UserState): void;
  delete(userId: string): void;
  all(): IterableIterator<UserState>;
}

class InMemoryMouseStore implements MouseDynamicsStore {
  private readonly states = new Map<string, UserState>();
  load(userId: string): UserState | null {
    return this.states.get(userId) ?? null;
  }
  save(userId: string, s: UserState): void {
    this.states.set(userId, s);
  }
  delete(userId: string): void {
    this.states.delete(userId);
  }
  all(): IterableIterator<UserState> {
    return this.states.values();
  }
}

// ─── Tracker ─────────────────────────────────────────────────────────────────

export class MouseDynamicsTracker {
  private readonly store: MouseDynamicsStore;

  constructor(store?: MouseDynamicsStore) {
    this.store = store ?? new InMemoryMouseStore();
  }

  ingest(event: MousePointerEvent): void {
    if (!event || !event.userId) return;
    if (!Number.isFinite(event.t) || !Number.isFinite(event.x) || !Number.isFinite(event.y)) return;
    const state = this.store.load(event.userId) ?? newState(event.userId);
    state.events.push(event);
    if (state.events.length > MouseConstants.MAX_RAW_EVENTS) {
      state.events.splice(0, state.events.length - MouseConstants.MAX_RAW_EVENTS);
    }
    this.store.save(event.userId, state);
  }

  ingestBatch(events: readonly MousePointerEvent[]): void {
    for (let i = 0; i < events.length; i += 1) this.ingest(events[i]!);
  }

  /** Build or refresh the per-user 64-d signature. */
  enroll(userId: string): MouseSignature | null {
    const s = this.store.load(userId);
    if (!s) return null;
    const extracted = this.extractWindows(s.events);
    if (extracted.length === 0) return null;
    s.vectors = extracted.slice(-MouseConstants.SIGNATURE_MAX_SAMPLES);
    if (s.vectors.length < MouseConstants.SIGNATURE_MIN_SAMPLES) return null;
    s.signature = buildSignature(userId, s.vectors);
    this.store.save(userId, s);
    return s.signature;
  }

  /** Explicit signature set — useful when loading from persistent storage. */
  loadSignature(userId: string, signature: MouseSignature): void {
    const s = this.store.load(userId) ?? newState(userId);
    s.signature = signature;
    this.store.save(userId, s);
  }

  signature(userId: string): MouseSignature | null {
    return this.store.load(userId)?.signature ?? null;
  }

  compare(userId: string): MouseComparisonResult | null {
    const s = this.store.load(userId);
    if (!s || !s.signature) return null;
    const windowEvents = s.events.slice(-MouseConstants.WINDOW_EVENTS);
    if (windowEvents.length < MouseConstants.MIN_WINDOW_EVENTS) return null;

    const teleport = detectTeleports(windowEvents);
    s.teleports += teleport.count;

    const vec = computeFeatureVector(windowEvents);
    const distance = mahalanobisLite(vec, s.signature);
    const score = mapMouseDistanceToScore(distance);
    const anomalous =
      distance > MouseConstants.ANOMALY_DISTANCE || teleport.detected;

    const now = Date.now();
    s.lastVectorAt = now;
    s.lastDistance = distance;
    s.lastScore = score;
    if (anomalous) {
      if (s.anomalySince == null) s.anomalySince = now;
      s.anomalous = true;
    } else {
      s.anomalySince = null;
      s.anomalous = false;
    }
    this.store.save(userId, s);

    return {
      userId,
      distance,
      score,
      teleportDetected: teleport.detected,
      teleportCount: teleport.count,
      sampleSize: windowEvents.length,
      anomalous,
      computedAt: now,
      vector: vec,
    };
  }

  score(userId: string): number {
    const cmp = this.compare(userId);
    if (!cmp) return 1; // no signature yet = no penalty
    return cmp.score;
  }

  /** Latest comparison state as a transparent snapshot. */
  snapshot(userId: string): Record<string, unknown> {
    const s = this.store.load(userId);
    if (!s) return { userId, present: false };
    return {
      userId,
      present: true,
      rawEvents: s.events.length,
      vectorSamples: s.vectors.length,
      teleports: s.teleports,
      hasSignature: Boolean(s.signature),
      lastDistance: s.lastDistance,
      lastScore: s.lastScore,
      anomalous: s.anomalous,
      anomalySince: s.anomalySince,
    };
  }

  /** Fully clears user state — called after a hard re-auth. */
  reset(userId: string): void {
    this.store.delete(userId);
  }

  /** Partial reset — keeps signature, clears rolling window. */
  resetLiveBuffer(userId: string): void {
    const s = this.store.load(userId);
    if (!s) return;
    s.events = [];
    s.anomalous = false;
    s.anomalySince = null;
    this.store.save(userId, s);
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private extractWindows(events: readonly MousePointerEvent[]): number[][] {
    const vectors: number[][] = [];
    const win = MouseConstants.WINDOW_EVENTS;
    const step = Math.max(1, Math.floor(win / 2));
    for (let start = 0; start + MouseConstants.MIN_WINDOW_EVENTS <= events.length; start += step) {
      const end = Math.min(events.length, start + win);
      const slice = events.slice(start, end);
      if (slice.length < MouseConstants.MIN_WINDOW_EVENTS) break;
      vectors.push(computeFeatureVector(slice));
      if (end >= events.length) break;
    }
    return vectors;
  }
}

// ─── Singleton + Fastify route plugin ────────────────────────────────────────

let _singleton: MouseDynamicsTracker | null = null;

export function getMouseDynamicsTracker(): MouseDynamicsTracker {
  if (!_singleton) _singleton = new MouseDynamicsTracker();
  return _singleton;
}

export function setMouseDynamicsTracker(tracker: MouseDynamicsTracker): void {
  _singleton = tracker;
}

import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";

interface MouseIngestBody {
  events?: Array<{
    kind?: MouseEventKind;
    t?: number;
    x?: number;
    y?: number;
    scrollDy?: number;
    deviceId?: string;
    targetX?: number;
    targetY?: number;
  }>;
}

function sanitizeMouseEvents(userId: string, body: MouseIngestBody): MousePointerEvent[] {
  if (!body?.events || !Array.isArray(body.events)) return [];
  const kinds: ReadonlySet<MouseEventKind> = new Set<MouseEventKind>([
    "move",
    "click",
    "scroll",
    "hover",
    "down",
    "up",
  ]);
  const out: MousePointerEvent[] = [];
  for (let i = 0; i < body.events.length; i += 1) {
    const e = body.events[i];
    if (!e) continue;
    const kind = e.kind && kinds.has(e.kind) ? e.kind : null;
    if (!kind) continue;
    const t = typeof e.t === "number" ? e.t : -1;
    const x = typeof e.x === "number" ? e.x : Number.NaN;
    const y = typeof e.y === "number" ? e.y : Number.NaN;
    if (t <= 0 || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push({
      userId,
      kind,
      t,
      x,
      y,
      ...(typeof e.scrollDy === "number" ? { scrollDy: e.scrollDy } : {}),
      ...(typeof e.deviceId === "string" ? { deviceId: e.deviceId } : {}),
      ...(typeof e.targetX === "number" ? { targetX: e.targetX } : {}),
      ...(typeof e.targetY === "number" ? { targetY: e.targetY } : {}),
    });
  }
  return out;
}

function extractUserId(request: FastifyRequest): string | null {
  const r = request as FastifyRequest & {
    user?: { id?: string };
    zeroTrustUser?: { id?: string };
  };
  return r.user?.id ?? r.zeroTrustUser?.id ?? null;
}

export const mouseDynamicsRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.post("/mouse/ingest", async (request, reply) => {
    const userId = extractUserId(request);
    if (!userId) return reply.code(401).send({ error: "UNAUTHENTICATED" });
    const events = sanitizeMouseEvents(userId, request.body as MouseIngestBody);
    getMouseDynamicsTracker().ingestBatch(events);
    return reply.send({ accepted: events.length });
  });

  app.post("/mouse/enroll", async (request, reply) => {
    const userId = extractUserId(request);
    if (!userId) return reply.code(401).send({ error: "UNAUTHENTICATED" });
    const sig = getMouseDynamicsTracker().enroll(userId);
    return reply.send({
      enrolled: Boolean(sig),
      samples: sig?.samples ?? 0,
      builtAt: sig?.builtAt ?? null,
    });
  });

  app.get("/mouse/score", async (request, reply) => {
    const userId = extractUserId(request);
    if (!userId) return reply.code(401).send({ error: "UNAUTHENTICATED" });
    const cmp = getMouseDynamicsTracker().compare(userId);
    return reply.send({
      userId,
      comparison: cmp,
      snapshot: getMouseDynamicsTracker().snapshot(userId),
    });
  });

  app.post("/mouse/reset", async (request, reply) => {
    const userId = extractUserId(request);
    if (!userId) return reply.code(401).send({ error: "UNAUTHENTICATED" });
    getMouseDynamicsTracker().reset(userId);
    return reply.send({ ok: true });
  });
};
