import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {Provider} from "./components/Provider.tsx";

// A deploy replaces hashed chunks; an old tab asking for one gets a 404. Reload once to pick up the new build.
window.addEventListener('vite:preloadError', (event) => {
    try {
        if (sessionStorage.getItem('chatix-chunk-reload')) return;
        sessionStorage.setItem('chatix-chunk-reload', '1');
    } catch {
        return;
    }
    event.preventDefault();
    window.location.reload();
});
window.addEventListener('load', () => {
    try {
        window.setTimeout(() => sessionStorage.removeItem('chatix-chunk-reload'), 10_000);
    } catch {
        /* storage blocked */
    }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Provider>
            <App />
        </Provider>
    </React.StrictMode>
);