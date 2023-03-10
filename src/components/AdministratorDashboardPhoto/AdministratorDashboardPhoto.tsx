import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Button,
    Card,
    Col,
    Container, Form, FormControl,
    FormGroup, FormLabel, NavItem, NavLink,
    Row,
} from 'react-bootstrap'
import {Link, useNavigate, useParams} from "react-router-dom";
import api, {apiFile, ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import PhotoType from "../../types/PhotoType";
import {faBackward, faImages, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import {apiConfig} from "../../config/api.config";


function AdministratorDashboardPhoto() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const[photos,setPhotos]=useState<PhotoType[]>([])
    let { aId }=useParams();
    const navigate=useNavigate()

    const getPhotos=()=>{
        api('api/article/'+aId+ '?join=photos',"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }
                if(res.status==="error"){
                    console.log(res.data);
                    return;
                }

                setPhotos(res.data.photos)

            })
    }

    const deletePhoto=(photoId:number)=>{
        if(!window.confirm("Are you sure want delete this photo")){
            return;
        }
        api('/api/article/'+aId+'/deletePhoto/'+photoId+'/','DELETE',{},'administrator')
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }

                getPhotos();
            })
    }

    const uploadArticlePhoto=async (articleId:number,file:File)=>{
        return await apiFile('/api/article/'+articleId+'/uploadPhoto','photo',file,'administrator');
    }

    const doUpload=async()=>{
        const filePicker:any=document.getElementById('photo');

        if(filePicker?.files.length===0){
            return;
        }

        const file=filePicker.files[0];
        await uploadArticlePhoto(Number(aId),file);
        filePicker.value='';
        getPhotos()
    }

    const handleUploadPhotoClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, photoId: number) => {
        deletePhoto(photoId);
    }

    const showSinglePhoto=(photo:PhotoType)=>{
        return(
            <Col xs="12" sm="6" md="4" lg="3">
                <Card>
                    <Card.Body>
                        <img alt={"Photo"+photo.photoId}
                             src={apiConfig.PHOTO_PATH+photo.imagePath}
                             className="w-100"/>
                    </Card.Body>
                    <Card.Footer>
                        {photos.length>1 ? (
                            <Button variant="danger" onClick={(event) => handleUploadPhotoClick(event, photo.photoId)} >
                                <FontAwesomeIcon icon={faMinus}/>Delete
                            </Button>
                        ):''}
                    </Card.Footer>
                </Card>
            </Col>
        )

    }

    useEffect( () => {
        getPhotos();
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
                        <FontAwesomeIcon icon={faImages}></FontAwesomeIcon>
                        Photos
                    </Card.Title>

                    <NavLink className="mb-5">
                        <NavItem>
                            <Link to="/administrator/dashboard/article/" className="btn btn-sm btn-info">
                                <FontAwesomeIcon icon={faBackward}/>Back to articles
                            </Link>
                        </NavItem>
                    </NavLink>

                    <Row>
                        {photos.map(showSinglePhoto)}
                    </Row>

                    <Form className="mt-5">
                        <p>
                            <strong>Add a new photo to this article</strong>
                        </p>
                        <FormGroup>
                            <FormLabel htmlFor="photo">New Article photo</FormLabel>
                            <FormControl type="file" id="photo"/>
                        </FormGroup>
                        <FormGroup>
                            <Button variant="primary" onClick={doUpload}>
                                <FontAwesomeIcon icon={faPlus}/>Upload photo
                            </Button>
                        </FormGroup>
                    </Form>


                </Card.Body>
            </Card>
        </Container>
        </>
    );
}

export default AdministratorDashboardPhoto;
