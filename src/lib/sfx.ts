/**
 * 퀴즈 배틀 효과음. 소리 파일 없이 브라우저가 바로 만들어 냄 (Web Audio).
 * 브라우저는 사용자가 한 번 누르기 전에는 소리를 못 내서, 버튼을 누를 때 unlockAudio() 를 불러 둠.
 * 소리 끔 설정은 이 기기에 저장.
 */
const KEY = "rescene-battle-sound";
let ctx: AudioContext | null = null;

export function isMuted() {
  try {
    return localStorage.getItem(KEY) === "off";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(KEY, muted ? "off" : "on");
  } catch {}
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {}
}

/** 음 하나: freq(Hz) 를 start 초 뒤부터 dur 초 동안 */
function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.14, slideTo?: number) {
  if (!ctx || isMuted()) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  /** 매칭 성공: 올라가는 차임 */
  match() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, "triangle", 0.16));
  },
  /** 카운트다운 3·2·1 */
  tick() {
    tone(880, 0, 0.12, "square", 0.06);
  },
  /** 시작! */
  go() {
    tone(1047, 0, 0.12, "square", 0.08);
    tone(1568, 0.08, 0.3, "triangle", 0.12);
  },
  /** 정답: 짧은 상승 딩동 */
  correct() {
    tone(784, 0, 0.12, "sine", 0.18);
    tone(1175, 0.08, 0.25, "sine", 0.18);
  },
  /** 연속 정답: 한 음 더 */
  combo() {
    tone(1568, 0.16, 0.25, "sine", 0.14);
  },
  /** 오답·시간 초과: 낮게 떨어지는 소리 */
  wrong() {
    tone(220, 0, 0.35, "sawtooth", 0.07, 110);
  },
  /** 남은 시간 3초 이하 째깍 */
  hurry() {
    tone(1320, 0, 0.05, "square", 0.03);
  },
  /** 승리 팡파레 */
  win() {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.2, "triangle", 0.15));
    tone(1047, 0.36, 0.6, "triangle", 0.17);
  },
  /** 패배 */
  lose() {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.18, 0.3, "triangle", 0.12));
  },
};

/** 휴대폰 진동 (지원하는 기기만) */
export function buzz(pattern: number | number[]) {
  try {
    if (!isMuted()) navigator.vibrate?.(pattern);
  } catch {}
}
