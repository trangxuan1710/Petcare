import {Navigate, Outlet, useLocation} from "react-router-dom";

function getAccessToken(){
    return localStorage.getItem('access_token');
}

function getUserRole(){
    return localStorage.getItem('user_role');
}

export function RequireAuth(){
    // const location = useLocation();
    // const token = getAccessToken();
    // if(!token){
    //     return <Navigate to="/login" state={{from: location}} replace />
    // }
    return <Outlet />;
}

export function RequireRole({allowedRoles}){
    // const role = getUserRole();
    // if(!allowedRoles.includes(role)){
    //     return <Navigate to="/login" replace />
    // }
    return <Outlet />;
}