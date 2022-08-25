import React from "react";
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import Home from "./pages/home";
import Genetic from "./pages/genetic";
import Teach from "./pages/teach";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/genetic" element={<Genetic />} />
				<Route path="/teach" element={<Teach />} />
			</Routes>
		</BrowserRouter>
	)
};

export default App;