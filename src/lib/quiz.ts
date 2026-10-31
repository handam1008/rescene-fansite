/**
 * 리센느 퀴즈 배틀 문제 만들기. 같은 seed 면 누구에게나 같은 문제·같은 보기 순서가 나와서
 * 1대1 대결에서 두 사람이 똑같은 문제를 풉니다 (언어만 각자 화면 언어로).
 * 문제는 멤버·노래·컴백 데이터에서 자동으로 만들어요.
 */
import { comebacks } from "@/data/comeback";
import { members, nameOf } from "@/data/members";
import { songs } from "@/data/songs";
import { INTL_LOCALE, fmt, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";
import { albumLabel } from "@/lib/album";

export const QUESTION_COUNT = 10;
export const SECONDS_PER_QUESTION = 15;

export type QuizQuestion = { id: string; text: string; options: string[]; answer: number };

/** seed 로 정해지는 난수 (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], r: () => number) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(list: T[], r: () => number) => list[Math.floor(r() * list.length)];

/** 정답 1개 + 오답 3개를 섞어서 문제로 */
function make(id: string, text: string, right: string, wrong: string[], r: () => number): QuizQuestion {
  const options = shuffle([right, ...shuffle(wrong.filter((w) => w !== right), r).slice(0, 3)], r);
  return { id, text, options, answer: options.indexOf(right) };
}

/** "(선공개)" 같은 꼬리를 뗀 앨범 이름 */
const albumBase = (album: string) => album.replace(/\s*\(.*\)\s*$/, "");

export function newSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

export function buildQuiz(seed: number, locale: Locale, m: Messages): QuizQuestion[] {
  const r = rng(seed);
  const q = m.battle;
  const allNames = members.map((x) => nameOf(x, locale));
  const monthDay = (iso: string) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: "UTC", month: "long", day: "numeric" }).format(new Date(`${iso}T12:00:00Z`));
  const byAge = [...members].sort((a, b) => a.birthday.localeCompare(b.birthday));
  const released = [...songs].filter((s) => !s.isSample).sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const albums = [...new Set(released.map((s) => albumLabel(albumBase(s.album), locale)))];
  const pulse = comebacks[0];
  const pulseTracks = (pulse?.tracklist ?? []).map((t) => t.replace(/\s*\(타이틀\)\s*$/, ""));
  const leader = members.find((x) => x.note === "리더");
  const japanese = members.find((x) => x.nationality === "일본");

  // 문제 종류마다 하나씩 만드는 함수. 섞어서 앞에서 10개를 씀
  const makers: (() => QuizQuestion | null)[] = [
    () => {
      const mem = pick([...members], r);
      return make("birthdayOf", fmt(q.qBirthdayOf, { member: nameOf(mem, locale) }), monthDay(mem.birthday), members.map((x) => monthDay(x.birthday)), r);
    },
    () => {
      const mem = pick([...members], r);
      return make("whoBirthday", fmt(q.qWhoBirthday, { date: monthDay(mem.birthday) }), nameOf(mem, locale), allNames, r);
    },
    () => (leader ? make("leader", q.qLeader, nameOf(leader, locale), allNames, r) : null),
    () => make("maknae", q.qMaknae, nameOf(byAge[byAge.length - 1], locale), allNames, r),
    () => make("oldest", q.qOldest, nameOf(byAge[0], locale), allNames, r),
    () => (japanese ? make("japanese", q.qJapanese, nameOf(japanese, locale), allNames, r) : null),
    () => {
      const s = pick(released.filter((x) => x.id !== "with"), r);
      return make("songAlbum", fmt(q.qSongAlbum, { song: s.title }), albumLabel(albumBase(s.album), locale), albums, r);
    },
    () => {
      const s = pick(released, r);
      const year = Number(s.releaseDate.slice(0, 4));
      return make("songYear", fmt(q.qSongYear, { song: s.title }), String(year), ["2023", "2024", "2025", "2026", "2027"], r);
    },
    () => {
      // 발매일이 서로 다른 곡 4개 중 가장 먼저 나온 곡
      const distinct = shuffle(released, r).filter((s, i, a) => a.findIndex((x) => x.releaseDate === s.releaseDate) === i).slice(0, 4);
      if (distinct.length < 4) return null;
      const first = [...distinct].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))[0];
      return make("earliest", q.qEarliest, first.title, distinct.map((s) => s.title), r);
    },
    () => make("debut", q.qDebut, released[0].title, released.slice(1).map((s) => s.title), r),
    () => (pulse ? make("pulseTitle", q.qPulseTitle, pulse.titleTrack, pulseTracks, r) : null),
    () => {
      if (pulseTracks.length < 3) return null;
      const other = pick(released.filter((s) => !pulseTracks.includes(s.title)), r);
      return make("notInPulse", q.qNotInPulse, other.title, shuffle(pulseTracks, r).slice(0, 3), r);
    },
    () => make("fandom", q.qFandom, "REMINE", ["RESCENT", "SCENEY", "REMIND", "ROSCENE"], r),
    () => make("count", q.qCount, fmt(q.aCount, { n: members.length }), [4, 6, 7].map((n) => fmt(q.aCount, { n })), r),
    () => make("meaning", q.qMeaning, q.aMeaning, q.aMeaningFake, r),
  ];

  const out: QuizQuestion[] = [];
  for (const mk of shuffle(makers, r)) {
    const question = mk();
    if (question && question.options.length === 4) out.push(question);
    if (out.length === QUESTION_COUNT) break;
  }
  return out;
}

/** 점수 → 칭호 (0~2, 3~4, 5~6, 7~8, 9~10) */
export function gradeIndex(score: number) {
  return Math.min(4, Math.floor(score / 2.5));
}
