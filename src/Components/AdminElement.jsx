import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminElement(props) {
  const [currentUser, setCurrentUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (props.redirect && (!user || user.role !== "admin")) navigate("/");
    setCurrentUser(user ?? {});
  }, [navigate, props]);

  return currentUser.role === "admin" ? props.element : <Outlet/>;
}