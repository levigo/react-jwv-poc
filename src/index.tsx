import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.scss';
import App from './App';
import {preloadPrecursor} from "@levigo/webtoolkit-ng-client";
import '@levigo/jadice-web-icons/assets/icon-font.scss';
import {I18N} from "@levigo/jadice-i18n-support";
import {BehaviorSubject, switchMap} from "rxjs";
import {of} from "rxjs";

const language$ = new BehaviorSubject<string>("en");

I18N.get().setProvider({
  getCurrentLanguage$: () => language$.asObservable(),
  setLanguage: (lang: string) => language$.next(lang),
  translate: (key: string) => of(key),
  translateOnce: (key: string) => key,
  translateDynamic: (key$) => switchMap(() => key$)(language$),
});

preloadPrecursor({assetsPath: import.meta.env.BASE_URL + "precursor/", serverURL: "http://localhost:8080"}).then(() => {
        const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
        root.render(
          <App/>
        );
});
