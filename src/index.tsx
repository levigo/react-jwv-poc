import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme.scss';
import App from './App';
import {preloadPrecursor} from "@levigo/webtoolkit-ng-client";
import '@levigo/jadice-web-icons/assets/icon-font.scss';
import {setupI18N} from "./i18n";

// Registriert den I18N-Provider, der die mitgelieferten Uebersetzungen aufloest.
// Ohne diesen wuerden alle translate:true-Labels (z.B. Toolbar-Aktionen) als
// Roh-Key angezeigt.
setupI18N();

preloadPrecursor({assetsPath: import.meta.env.BASE_URL + "precursor/", serverURL: "http://localhost:8080"}).then(() => {
        const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
        root.render(
          <App/>
        );
});
