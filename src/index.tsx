import React from "react";
import ReactDOM from "react-dom/client";
import './App.css';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import App from "./App";
import { AppContext, defaultAppContextConfig } from "./context";

const reactRoot = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

reactRoot.render(
	<React.StrictMode>
		<AppContext.Provider value={defaultAppContextConfig} >
			<App />
		</AppContext.Provider>
	</React.StrictMode>
);

// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();