import React from "react";
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import Home from "./pages/home";
import Genetic from "./pages/genetic";
import Teach from "./pages/teach";
import { CssBaseline } from "@mui/material";
import { CssVarsProvider, getInitColorSchemeScript } from "@mui/joy";
import theme from "./components/theme/theme";

const App = () => {
	return (
		<BrowserRouter>
			<CssVarsProvider defaultMode="system" theme={theme}>
				<CssBaseline />
				{getInitColorSchemeScript()}
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/genetic" element={<Genetic />} />
					<Route path="/teach" element={<Teach />} />
				</Routes>
			</CssVarsProvider>
		</BrowserRouter>
	)
};

export default App;