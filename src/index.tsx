import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {preloadPrecursor} from "@levigo/webtoolkit-ng-client";
import '@levigo/webtoolkit-ng-client/assets/dark-theme.scss';
import '@levigo/webtoolkit-ng-client/assets/icon-font.scss';

preloadPrecursor({assetsPath: process.env.PUBLIC_URL + "/", serverURL: "http://localhost:8080"}).then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
});
