import { Routes, Route } from "react-router-dom";
import Header from "../Components/Header";
import "./App.css";
import "../Components/Header.css";
import Home from "../Pages/Home";
import Browse from "../Pages/Browse";

export default function App() {
  return (
    <div className="App">
      <Header />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
        </Routes>
      </main>
    </div>
  );
}
