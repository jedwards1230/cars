import React from "react";
import ReactDOM from "react-dom/client";
import './App.css';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import App from "./App";

const reactRoot = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

reactRoot.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();