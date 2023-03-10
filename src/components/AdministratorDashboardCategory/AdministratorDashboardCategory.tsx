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
import {faEdit, faListAlt, faListUl, faPlus} from '@fortawesome/free-solid-svg-icons';
import CategoryType from "../../types/CategoryType";
import {Link, useNavigate} from "react-router-dom";
import api, {ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import ApiCategoryDto from "../../dtos/ApiCategoryDto";


function AdministratorDashboardCategory() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const[categories,setCategories]=useState<CategoryType[]>([])
    const[visible,setVisible]=useState<boolean>(false);
    const[addName,setAddName]=useState<string>("");
    const[addImagePath,setAddImagePath]=useState<string>("");
    const[addParentCategoryId,setParentCategoryId]=useState<number | null>(null);
    const[message,setMessage]=useState<string>("");
    const[categoryId,setCategoryId]=useState<number |undefined>(undefined);
    const[editVis,setEditVisible]=useState<boolean>(false);
    const[editName,setEditName]=useState<string>("");
    const[editImagePath,setEditImagePath]=useState<string>("");
    const[editParentCategory,setEditParentCategory]=useState<number | null>(null);

    const navigate=useNavigate()

    const getCategories=()=>{
        api('api/category/',"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }
                if(res.status==="error"){
                    console.log(res.data);
                    return;
                }

                putCategoriesInState(res.data)
                //setCategories(res.data)

            })
    }

    const showAddModal=()=>{
        setAddName("");
        setAddImagePath("");
        setParentCategoryId(null)
        setMessage("");
        setVisible(true);
    }

    const showEditModal=(category:CategoryType)=>{
        console.log("uslo")
        setEditName(String(category.name));
        setEditImagePath(String(category.imagePath));
        setEditParentCategory(Number(category.parentCategoryId))
        setCategoryId(Number(category.categoryId));
        setMessage("");
        setEditVisible(true);
    }
    const hideCart=()=>{
        setVisible(false);
    }

    const editVisibleFalse=()=>{
        setEditVisible(false)
    }

    const doAddCategory=()=>{
        api('/api/category/','POST',{
            name:addName,
            imagePath:addImagePath,
            parentCategoryId:addParentCategoryId
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
                getCategories()
            })
    }

    const handleCategoryClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, category: CategoryType) => {
        showEditModal(category);
    }

    const doEditCategory=()=>{
        api('/api/category/'+categoryId,'PATCH',{
            name:editName,
            imagePath:editImagePath,
            parentCategoryId:editParentCategory
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
                getCategories()
            })
    }


    const putCategoriesInState=(data:ApiCategoryDto[])=>{
        const categories:CategoryType[]=data.map(category=>{
            return{
                categoryId:category.categoryId,
                name:category.name,
                imagePath:category.imagePath,
                parentCategoryId:category.parentCategoryId
            };


        });
        setCategories(categories);

    }

    useEffect( () => {
        getCategories();
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
                        <FontAwesomeIcon icon={faListAlt}></FontAwesomeIcon>
                        Categories
                    </Card.Title>

                    <Table hover size="sm" bordered>
                        <thead>
                            <tr>
                                <th colSpan={3}></th>
                                <th className="text-center"><Button size="sm" variant="primary" onClick={showAddModal}><FontAwesomeIcon icon={faPlus}/>Add</Button></th>
                            </tr>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Parent ID</th>
                            </tr>
                        </thead>
                        <tbody>
                        {categories.map(category=>(
                            <tr>
                               <td className="text-right">{category.categoryId}</td>
                                <td className="text-right">{category.name}</td>
                                <td className="text-right">{category.parentCategoryId}</td>
                                <td className="text-cenater">
                                    <Link className="btn btn-sm btn-info mr-5" to={"/administrator/dashboard/feature/"+category.categoryId}><FontAwesomeIcon icon={faListUl}/>Feature</Link>
                                    <Button size="sm" variant="info" onClick={(event) => handleCategoryClick(event, category)}><FontAwesomeIcon icon={faEdit}/>Edit</Button>

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>

            <Modal size="lg" centered show={visible} onHide={hideCart}>
                <ModalHeader closeButton>
                    <ModalTitle>Add new category</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={addName}
                                     onChange={event=>setAddName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="imagePath">Image URL</FormLabel>
                        <FormControl id="imagePath" type="text"
                                     value={addImagePath}
                                     onChange={event=>setAddImagePath(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>

                        <FormLabel htmlFor="parentCatId">Parent category</FormLabel>
                        <FormControl as="select" id="parentCatId"
                                     value={addParentCategoryId?.toString()}
                                     onChange={event=>setParentCategoryId(Number(event.target.value))}>
                                    <option value="null">No parent category</option>
                        {categories.map(category=>(
                            <option value={category.categoryId?.toString()}>{category.name}</option>

                        ))}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <Button variant="primary" onClick={doAddCategory}><FontAwesomeIcon icon={faPlus}/>Add</Button>
                    </FormGroup>
                    {message ? (
                        <Alert variant="danger">{message}</Alert>
                    ) : ''}
                </ModalBody>
            </Modal>

            <Modal size="lg" centered show={editVis} onHide={editVisibleFalse}>
                <ModalHeader closeButton>
                    <ModalTitle>Edit category</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={editName}
                                     onChange={event=>setEditName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="imagePath">Image URL</FormLabel>
                        <FormControl id="imagePath" type="text"
                                     value={editImagePath}
                                     onChange={event=>setEditImagePath(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>

                        <FormLabel htmlFor="parentCatId">Parent category</FormLabel>
                        <FormControl as="select" id="parentCatId"
                                     value={editParentCategory?.toString()}
                                     onChange={event=>setEditParentCategory(Number(event.target.value))}>
                            <option value="null">No parent category</option>
                            {categories
                                .filter(category=>category.categoryId!==categoryId)
                                .map(category=>(
                                <option value={category.categoryId?.toString()}>{category.name}</option>

                            ))}
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                        <Button variant="primary" onClick={doEditCategory}><FontAwesomeIcon icon={faEdit}/>Edit</Button>
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

export default AdministratorDashboardCategory;
