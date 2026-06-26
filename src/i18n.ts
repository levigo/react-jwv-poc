import {I18N, I18NParams} from "@levigo/jadice-i18n-support";
import {BehaviorSubject, combineLatest, map, Observable, startWith} from "rxjs";

// Die Webtoolkit-Bibliothek liefert ihre Uebersetzungen als JSON mit. Wir buendeln
// sie direkt (Vite/resolveJsonModule) und loesen die i18n-Keys lokal auf. In Angular
// uebernimmt das der I18NService aus ngx-webtoolkit; ohne Angular bauen wir hier einen
// eigenen I18NProvider.
import en from "@levigo/webtoolkit-ng-client/assets/i18n/en.json";
import de from "@levigo/webtoolkit-ng-client/assets/i18n/de.json";
import fr from "@levigo/webtoolkit-ng-client/assets/i18n/fr.json";
import it from "@levigo/webtoolkit-ng-client/assets/i18n/it.json";

type Messages = Record<string, unknown>;

const FALLBACK_LANG = "en";
const MESSAGES: Record<string, Messages> = {en, de, fr, it} as Record<string, Messages>;

// Aktuelle Sprache. Exportiert, damit die App sie umschalten kann (setLanguage).
export const language$ = new BehaviorSubject<string>(FALLBACK_LANG);

// Loest einen dot-separated Key (z.B. "webtoolkitClient.action.defaultActions.print")
// gegen das verschachtelte JSON-Objekt auf.
function lookup(messages: Messages | undefined, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    messages,
  );
}

// Ersetzt {{platzhalter}} durch die uebergebenen Parameter (z.B. "Undo{{description}}").
function interpolate(template: string, params?: I18NParams): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name: string) =>
    params[name] != null ? String(params[name]) : match,
  );
}

// Reihenfolge: aktuelle Sprache -> Englisch -> Key selbst (sichtbarer Fallback,
// damit fehlende Keys auffallen statt leer zu bleiben).
function translateKey(lang: string, key: string, params?: I18NParams): string {
  const raw = lookup(MESSAGES[lang], key) ?? lookup(MESSAGES[FALLBACK_LANG], key);
  return typeof raw === "string" ? interpolate(raw, params) : key;
}

export function setupI18N(): void {
  I18N.get().setProvider({
    getCurrentLanguage$: () => language$.asObservable(),
    setLanguage: (lang: string) => language$.next(lang),
    translate: (key: string, params?: I18NParams): Observable<string> =>
      language$.pipe(map(lang => translateKey(lang, key, params))),
    translateOnce: (key: string, params?: I18NParams): string =>
      translateKey(language$.value, key, params),
    translateDynamic: (key$: Observable<string>, params$: Observable<I18NParams>): Observable<string> =>
      combineLatest([language$, key$, params$.pipe(startWith({} as I18NParams))]).pipe(
        map(([lang, key, params]) => translateKey(lang, key, params)),
      ),
  });
}
