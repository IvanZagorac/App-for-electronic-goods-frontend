import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUserPlus} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import api, {ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

function UserRegistrationPage (){
    const [email,setEmail]=useState<string>('');
    const [password,setPassword]=useState<string>('');
    const [forename,setForename]=useState<string>('');
    const [surname,setSurname]=useState<string>('');
    const [phone,setPhone]=useState<string>('');
    const [address,setAddress]=useState<string>('');
    const [message,setMessage]=useState<string>('');
    const [isRegValid,setIsRegValid]=useState<boolean>(false);

    const doRegister=()=>{
        api(
            "auth/user/register",
            "POST",
            {email,
                password,
                forename,
                surname,
                phone,
                postalAdress:address}
        )
            .then((res:ApiResponse)=>{
                console.log({address})
                if(res.status==='error'){
                    console.log(JSON.stringify(res.data))
                    setMessage("System error...Try again")
                    return;
                }
                if(res.status==='ok'){
                    if(res.data.errorCode!==undefined){
                        let messageR:any={message}
                        switch (res.data.errorCode){
                            case -6001:messageR='Account already exists';break;

                        }
                        setMessage(messageR);
                        return;
                    }
                }
                setIsRegValid(true);

            })
    }

    function renderForm(){
        return(
                <Container>
                    <Form>
                        <Row>
                            <Col lg="6" md="6" sm="12">
                                <Form.Group>
                                    <Form.Label htmlFor="email"> E-mail:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={event=>setEmail(event.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col lg="6" md="6" sm="12">
                                <Form.Group>
                                    <Form.Label htmlFor="password">Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={event=>setPassword(event.target.value)}

                                    />
                                </Form.Group>
                            </Col>

                        </Row>

                        <Row>
                            <Col md="6">
                                <Form.Group>
                                    <Form.Label htmlFor="forename">Forename</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="forename"
                                        value={forename}
                                        onChange={event=>setForename(event.target.value)}

                                    />
                                </Form.Group>
                            </Col>
                            <Col md="6">
                                <Form.Group>
                                    <Form.Label htmlFor="surname">Surname</Form.Label>
                                    <Form.Control
                                        type="text"
                                        id="surname"
                                        value={surname}
                                        onChange={event=>setSurname(event.target.value)}

                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label htmlFor="phone">Phone number</Form.Label>
                            <Form.Control
                                type="phone"
                                id="phone"
                                value={phone}
                                onChange={event=>setPhone(event.target.value)}

                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label htmlFor="address">Address</Form.Label>
                            <Form.Control
                                type="text"
                                id="address"
                                value={address}
                                onChange={event=>setAddress(event.target.value)}

                            />
                        </Form.Group>

                        <Form.Group>
                            <Button onClick={()=>doRegister()} variant="primary">Register</Button>
                        </Form.Group>

                    </Form>
                    <Alert variant="danger" className={message ? '' : 'd-none'}>{message}</Alert>
                </Container>

        )
    }

    function renderRegCompletedMessage(){
        return(
            <p>The account has been registred<br/>
                Click here to login page
                <Link to="/auth/user/login">Log in</Link>
            </p>

        )
    }


    return(
        <>

        <RoledMainMenu role="visitor"/>
        <Container>

            <Col md={{span:8,offset:2}}>
                <Card>
                    <Card.Body>
                        <Card.Title>
                            <FontAwesomeIcon icon={faUserPlus}></FontAwesomeIcon> User Registration
                        </Card.Title>

                        {(!isRegValid) ? renderForm() : renderRegCompletedMessage()}
                    </Card.Body>
                </Card>
            </Col>
        </Container>
        </>

    )

}

export default UserRegistrationPage;