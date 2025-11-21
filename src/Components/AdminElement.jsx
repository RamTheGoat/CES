import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AdminElement(props) {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user")) ?? {});
    }, []);

    if (props.redirect && user.role !== "admin") navigate("/");
    else return user.role === "admin" ? props.element : <Outlet/>;
}