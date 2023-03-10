import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {removeTokenData} from "../../api/api";


function UserLogoutPage (){
    const[done,setDone]=useState<boolean>(false);
    const navigate=useNavigate();


    const finished=()=>{
        setDone(true);
    }

    useEffect( () => {
        doLogout();
    }, []);

    const doneOrNot=()=>{
        if(done){
            navigate("/auth/user/login/")

        }

    }

    const doLogout=()=>{
        removeTokenData("user");
        finished();
    }

    return(
        <>
        {doneOrNot()}
        <p>Logging out...</p>
        </>
    )


}

export default UserLogoutPage;
