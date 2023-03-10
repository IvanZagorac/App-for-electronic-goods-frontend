import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Alert,
    Button,
    Card,
    Container, FormControl,
    FormGroup, FormLabel,
    Modal,
    ModalBody,
    ModalHeader,
    ModalTitle,
    Table
} from 'react-bootstrap'
import {faBackward, faEdit, faListUl, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Link, useNavigate, useParams} from "react-router-dom";
import api, {ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import FeatureType from "../../types/FeatureType";
import ApiFeatureDto from "../../dtos/ApiFeatureDto";

function AdministratorDashboardFeature() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const[features,setFeatures]=useState<FeatureType[]>([])
    const[visible,setVisible]=useState<boolean>(false);
    const[addName,setAddName]=useState<string>("");
    const[message,setMessage]=useState<string>("");
    const[featureId,setFeatureId]=useState<number |undefined>(undefined);
    const[editVis,setEditVisible]=useState<boolean>(false);
    const[editName,setEditName]=useState<string>("");
    let { cId }=useParams();
    const navigate=useNavigate()

    const getFeatures=()=>{
        api('api/feature/?filter=categoryId||$eq||'+cId,"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }
                if(res.status==="error"){
                    console.log(res.data);
                    return;
                }

                putFeaturesInState(res.data)
                //setCategories(res.data)

            })
    }

    const showAddModal=()=>{
        setAddName("");
        setMessage("");
        setVisible(true);
    }

    const showEditModal=(feature:FeatureType)=>{
        setEditName(feature.name);
        setFeatureId(feature.featureId);
        setMessage("");
        setEditVisible(true);
    }
    const hideCart=()=>{
        setVisible(false);
    }

    const editVisibleFalse=()=>{
        setEditVisible(false)
    }

    const doAddFeature=()=>{
        api('/api/feature/','POST',{
            name:addName,
            categoryId:cId
        },'administrator')
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }

                /*if(res.status=="error"){
                    console.log("error");
                    setMessage(JSON.stringify(res.data));
                    return;
                }*/

                setVisible(false);
                getFeatures()
            })
    }

    const handleFeatureClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, feature: FeatureType) => {
        showEditModal(feature);
    }

    const doEditFeature=()=>{
        api('/api/feature/'+featureId,'PATCH',{
            name:editName,
        },'administrator')
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }

                /*if(res.status=="error"){
                    console.log("error");
                    setMessage(JSON.stringify(res.data));
                    return;
                }*/

                setEditVisible(false);
                getFeatures()
            })
    }


    const putFeaturesInState=(data:ApiFeatureDto[])=>{
        const features:FeatureType[]=data.map(feature=>{
            return{
                featureId:feature.featureId,
                name:feature.name,
                categoryId:feature.categoryId
            };


        });
        setFeatures(features);

    }

    useEffect( () => {
        getFeatures();
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
                        <FontAwesomeIcon icon={faListUl}></FontAwesomeIcon>
                        Features
                    </Card.Title>

                    <Table hover size="sm" bordered>
                        <thead>
                        <tr>
                            <th colSpan={3}>
                                <Link to="/administrator/dashboard/category" className="btn btn-sm btn-info"><FontAwesomeIcon icon={faBackward}/>Back to categories</Link>
                            </th>
                            <th className="text-center"><Button size="sm" variant="primary" onClick={showAddModal}><FontAwesomeIcon icon={faPlus}/>Add</Button></th>
                        </tr>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        {features.map(feature=>(
                            <tr>
                                <td className="text-right">{feature.featureId}</td>
                                <td className="text-right">{feature.name}</td>
                                <td className="text-cenater">
                                    <Button size="sm" variant="info" onClick={(event) => handleFeatureClick(event, feature)}><FontAwesomeIcon icon={faEdit}/>Edit</Button>

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>

            <Modal size="lg" centered show={visible} onHide={hideCart}>
                <ModalHeader closeButton>
                    <ModalTitle>Add new feature</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={addName}
                                     onChange={event=>setAddName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <Button variant="primary" onClick={doAddFeature}><FontAwesomeIcon icon={faPlus}/>Add</Button>
                    </FormGroup>
                    {message ? (
                        <Alert variant="danger">{message}</Alert>
                    ) : ''}
                </ModalBody>
            </Modal>

            <Modal size="lg" centered show={editVis} onHide={editVisibleFalse}>
                <ModalHeader closeButton>
                    <ModalTitle>Edit feature</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={editName}
                                     onChange={event=>setEditName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <Button variant="primary" onClick={doEditFeature}><FontAwesomeIcon icon={faEdit}/>Edit</Button>
                    </FormGroup>
                    {message ? (
                        <Alert variant="danger">{message}</Alert>
                    ) : ''}
                </ModalBody>
            </Modal>
        </Container>
        </>
    );
}

export default AdministratorDashboardFeature;
