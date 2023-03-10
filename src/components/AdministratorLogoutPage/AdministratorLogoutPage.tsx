import React, {useEffect, useState} from "react";
import Redirect,{useNavigate} from "react-router-dom";
import {removeTokenData} from "../../api/api";


function AdministratorLogoutPage (){
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
            console.log("uslo u log")
            navigate("/administrator/login/")

        }

    }

    const doLogout=()=>{
        removeTokenData("administrator");
        finished();
    }

    return(
        <>
        {doneOrNot()}
        <p>Logging out...</p>
        </>
    )


}

export default AdministratorLogoutPage;
