import { cookies, headers } from "next/headers";
import { isLang, LANG_COOKIE, type Lang } from "./i18n";

export type SearchParams = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Which language to show, in order of how deliberate the choice was:
// 1. ?lang=fr in the link - so a French link can be shared with relatives;
// 2. the cookie the language toggle sets - so the choice sticks;
// 3. the browser's first-choice language.
// Only the browser's *first* choice counts: someone who lists French second
// still reads English first.
export async function resolveLang(param: string | undefined): Promise<Lang> {
  if (isLang(param)) return param;

  const cookie = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(cookie)) return cookie;

  const accept = (await headers()).get("accept-language") ?? "";
  return accept.trim().toLowerCase().startsWith("fr") ? "fr" : "en";
}

// The current page's URL with `lang` switched, keeping any other query
// parameters (such as ?preview=).
export function hrefWithLang(path: string, params: SearchParams, lang: Lang): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = firstParam(value);
    if (key !== "lang" && v !== undefined) query.set(key, v);
  }
  query.set("lang", lang);
  return `${path}?${query.toString()}`;
}
