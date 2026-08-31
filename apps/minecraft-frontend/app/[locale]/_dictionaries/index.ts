import "server-only";

import type { Locale } from "@/utils/i18n";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  de: () => import("./de.json").then((module) => module.default),
  es: () => import("./es.json").then((module) => module.default),
  ar: () => import("./ar.json").then((module) => module.default),
  "zh-cn": () => import("./zh-cn.json").then((module) => module.default),
  ja: () => import("./ja.json").then((module) => module.default),
  ko: () => import("./ko.json").then((module) => module.default),
  hi: () => import("./hi.json").then((module) => module.default),
  ru: () => import("./ru.json").then((module) => module.default),
  th: () => import("./th.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
