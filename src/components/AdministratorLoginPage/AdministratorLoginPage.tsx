import {useNavigate,} from "react-router-dom";
import {Alert, Button, Card, Col, Container, Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignIn} from "@fortawesome/free-solid-svg-icons";
import React,{useState} from "react";
import api, {ApiResponse, saveIdentity, saveRefreshToken, saveToken} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";




function AdministratorLoginPage (){
    const [username,setUsername]=useState<string >('');
    const [password,setPassword]=useState<string>('');
    const [errorMessage,setErrorMessage]=useState<string>('');
    const [isLoggedIn,setIsLoggedIn]=useState<boolean>(false);
    const navigate=useNavigate()

    if(isLoggedIn===true){
        navigate('/')
    }

    const doLogin=()=>{
        api(
            'auth/administrator/login',
            'POST',
            {username,password})
            .then((res:ApiResponse)=>{
                console.log(res.data)
                if(res.status==='error'){
                    setErrorMessage("Sysrem error...Try again")
                    return;
                }
                // console.log(res.data.response.data.statusCode)
                if(res.status==='ok'){
                    if(res.data.statusCode!==undefined){
                        console.log("Neka greska")
                        let message:any={errorMessage}
                        switch (res.data.errorCode){
                            case -3001:message='Bad username!';break;
                            case -3002:message='Bad password';break;

                        }
                        setErrorMessage(message);
                        return;
                    }

                    saveToken('administrator',res.data.token);
                    saveRefreshToken('administrator',res.data.refreshToken)
                    saveIdentity('administrator',res.data.identity);
                    setIsLoggedIn(true);

                    navigate("/administrator/dashboard", {
                        replace: true,
                    });
                }

            });

    }



    return(
        <>
        <RoledMainMenu role="visitor"/>
        <Container>
            <Col md={{span:6,offset:3}}>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faSignIn}></FontAwesomeIcon>
                            Administrator Login
                        </Card.Title>
                        <Form>
                            <Form.Group>
                                <Form.Label htmlFor="username"> Username</Form.Label>
                                <Form.Control
                                    type="username"
                                    id="username"
                                    value={username}
                                    onChange={event=>setUsername(event.target.value)}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label htmlFor="password">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={event=>setPassword(event.target.value)}

                                />
                            </Form.Group>
                            <Form.Group>
                                <Button onClick={()=>doLogin()} variant="primary"> Log in</Button>
                            </Form.Group>

                        </Form>
                        <Alert variant="danger" className={errorMessage ? '' : 'd-none'}>{errorMessage}</Alert>
                    </Card.Body>
                </Card>
            </Col>
        </Container>
        </>

    )


}

export default AdministratorLoginPage;
