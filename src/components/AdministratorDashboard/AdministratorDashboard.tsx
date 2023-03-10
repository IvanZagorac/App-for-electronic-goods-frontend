import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Card, Container, Row} from 'react-bootstrap'
import {faHome} from '@fortawesome/free-solid-svg-icons';
import {Link, useNavigate} from "react-router-dom";
import api, {ApiResponse, getIdentity} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";


function AdministratorDashboard() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const navigate=useNavigate()

    const getLoginData=()=>{
        const username=getIdentity("administrator");
        api('api/administrator/'+username,"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if(res.status==="error"|| res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }


            })
    }

    useEffect( () => {
        getLoginData();
    }, []);

    if(!isAdministratorLogin){
        navigate('/administrator/login')
    }



    return (
        <>
        <RoledMainMenu role="administrator"/>
        <Container>

            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
                        Administrator Dashboard
                    </Card.Title>
                    <Row>
                        <ul className="ulDashboard">
                            <li className="liDashboard">
                                <Link className="linkDashboard" to="/administrator/dashboard/category">Categories</Link><br/>
                                <Link className="linkDashboard"  to="/administrator/dashboard/article">Articles</Link><br/>
                                <Link className="linkDashboard"  to="/administrator/dashboard/order">Orders</Link>
                            </li>
                        </ul>
                    </Row>

                </Card.Body>
            </Card>
        </Container>
        </>
    );
}

export default AdministratorDashboard;
