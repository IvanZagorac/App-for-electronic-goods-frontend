import {useParams} from "react-router-dom";
import {Card, Container} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faContactCard} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

function ContactPage (){

    return(
        <>
        <RoledMainMenu role="user"/>
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon={faContactCard}></FontAwesomeIcon>
                        contact
                    </Card.Title>
                    <Card.Text>
                        contact info show
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
        </>
    )

}

export default ContactPage;
