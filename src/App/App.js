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
import Register from "../Pages/Register";
import Profile from "../Pages/Profile";
import ForgotPassword from "../Pages/ForgotPassword";
import EditShowTimes from "../Pages/EditShowTimes";
import AdminDetails from "../Pages/AdminDetails";
import AddMovie from "../Pages/AddMovie";
import Admin from "../Components/AdminElement";

export default function App() {
  return (
    <div className="App">
      <Header/>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Admin element={<AdminHome />} />}>
          <Route path="/" element={<Home />} /></Route>
          <Route path="/browse" element={<Browse />} />
          <Route path="/details/:id" element={<Admin element={<AdminDetails />} />}>
          <Route path="/details/:id" element={<Details />} /></Route>
          <Route path="/search" element={<Search />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/forgotpassword" element={<ForgotPassword/>} />
          <Route path="/editShowTimes" element={<Admin element={<EditShowTimes/>} redirect/>} />
          <Route path="/addMovie" element={<Admin element={<AddMovie/>} redirect/>} />
        </Routes>
      </main>
    </div>
  );
}
