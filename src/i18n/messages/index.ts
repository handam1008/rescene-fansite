import type { Locale } from "../config";
import account from "./account";
import board from "./board";
import contact from "./contact";
import fun from "./fun";
import guide from "./guide";
import home from "./home";
import pages from "./pages";
import pokedex from "./pokedex";
import shell from "./shell";
import today from "./today";

/*
 * 언어별 문구 모음. 화면 영역마다 파일을 나누고 (shell, home …) 각 파일에 ko·ja·en 을 나란히 둠.
 * ja·en 은 ko 와 같은 모양이어야 해서, 빠진 문구가 있으면 타입 검사에서 걸림.
 */
function build(l: Locale) {
  return { ...shell[l], ...home[l], ...pages[l], ...pokedex[l], ...board[l], ...account[l], ...contact[l], ...today[l], ...fun[l], ...guide[l] };
}

export const dictionaries = { ko: build("ko"), ja: build("ja"), en: build("en") };
export type Messages = ReturnType<typeof build>;
