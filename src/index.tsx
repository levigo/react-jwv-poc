import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {preloadPrecursor} from "@levigo/webtoolkit-ng-client";
import '@levigo/jadice-web-icons/assets/icon-font.scss';

preloadPrecursor({assetsPath: import.meta.env.BASE_URL + "precursor/", serverURL: "http://localhost:8080"}).then(() => {
        const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
        root.render(
          <React.StrictMode>
              <App/>
          </React.StrictMode>
        );
});
