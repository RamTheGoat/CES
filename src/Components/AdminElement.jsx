import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function Admin(props) {
    const [user, setUser] = useState({});

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user")) ?? {});
    }, []);

    return user.role === "admin" ? props.element : <Outlet/>;
}