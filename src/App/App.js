import { Routes, Route } from "react-router-dom";
import Header from "../Components/Header";
import "./App.css";
import "../Components/Header.css";
import Home from "../Pages/Home";
import Browse from "../Pages/Browse";
import Details from '../Pages/Details';
import Booking from '../Pages/Booking';
import Search from "../Pages/Search";
import AdminHome from "../Pages/AdminHome";
import Login from "../Pages/Login";

export default function App() {
  return (
    <div className="App">
      <Header/>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adminHome" element={<AdminHome />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/search" element={<Search />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </main>
    </div>
  );
}
