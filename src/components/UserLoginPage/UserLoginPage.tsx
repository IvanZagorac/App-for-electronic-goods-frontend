import {useNavigate,} from "react-router-dom";
import {Alert, Button, Card, Col, Container, Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignIn} from "@fortawesome/free-solid-svg-icons";
import React,{useState} from "react";
import api, {ApiResponse, saveRefreshToken, saveToken} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";




function UserLoginPage (){
    const [email,setEmail]=useState<string >('');
    const [password,setPassword]=useState<string>('');
    const [errorMessage,setErrorMessage]=useState<string>('');
    const [isLoggedIn,setIsLoggedIn]=useState<boolean>(false);
    const navigate=useNavigate()

    if(isLoggedIn===true){
        navigate('/')
    }

    const doLogin=()=>{
        api(
            'auth/user/login',
            'POST',
            {email,password})
            .then((res:ApiResponse)=>{
                if(res.status==='error'){
                    setErrorMessage("Sysrem error...Try again")
                    return;
                }
               // console.log(res.data.response.data.statusCode)
                if(res.status==='ok'){
                    if(res.data.errorCode!==undefined){
                        console.log("Neka greska")
                        let message:any={errorMessage}
                        switch (res.data.errorCode){
                            case -3001:message='Bad e-mail!';break;
                            case -3002:message='Bad password';break;

                        }
                        setErrorMessage(message);
                        return;
                    }

                    saveToken('user',res.data.token);
                    saveRefreshToken('user',res.data.refreshToken)

                    setIsLoggedIn(true);

                    navigate("/", {
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
                            User Login
                        </Card.Title>
                            <Form>
                                <Form.Group>
                                    <Form.Label htmlFor="email"> E-mail:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={event=>setEmail(event.target.value)}
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

export default UserLoginPage;
