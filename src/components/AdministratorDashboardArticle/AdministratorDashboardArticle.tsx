import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Alert,
    Button,
    Card,
    Col,
    Container,FormControl,
    FormGroup, FormLabel,
    Modal,
    ModalBody,
    ModalHeader,
    ModalTitle,
    Row,
    Table
} from 'react-bootstrap'
import {faEdit, faImages, faListAlt, faPlus} from '@fortawesome/free-solid-svg-icons';
import ArticleType from "../../types/ArticleType";
import {Link, useNavigate} from "react-router-dom";
import api, {apiFile, ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import ApiArticleDto from "../../dtos/ApiArticleDto";
import CategoryType from "../../types/CategoryType";
import ApiCategoryDto from "../../dtos/ApiCategoryDto";

interface FeatureBaseType{
    featureId:number;
    name:string;
}

interface forFeatureState{
    featureId:number;
    name:string;
    value:string;
    use:number;
}

function AdministratorDashboardArticle() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const[articles,setArticles]=useState<ArticleType[]>([])
    const[categories,setCategories]=useState<CategoryType[]>([])
    const[visible,setVisible]=useState<boolean>(false);
    const[addName,setAddName]=useState<string>("");
    const[addExcerpt,setAddExcerpt]=useState<string>("");
    const[categoryId,setCategoryId]=useState<number>(1);
    const[addDescription,setAddDescription]=useState<string>("");
    const[addPrice,setAddPrice]=useState<number>(0);
    const[addFeatures,setAddFeatures]=useState<forFeatureState[]>([]);
    const[message,setMessage]=useState<string>("");
    const[editArticleId,setEditArticleId]=useState<number |undefined>(undefined);
    const[editVisible,setEditVisible]=useState<boolean>(false);
    const[editName,setEditName]=useState<string>("");
    const[editExcerpt,setEditExcerpt]=useState<string>("");
    const[editDescription,setEditDescription]=useState<string>("");
    const[editStatus,setEditStatus]=useState<string>("");
    const[editPrice,setEditPrice]=useState<number | undefined>(0.1);
    const[editIsPromoted,setEditIsPromoted]=useState<number>(0);
    const[editFeatures,setEditFeatures]=useState<forFeatureState[]>([]);

    const navigate=useNavigate()

    const getArticles=()=>{
        api('api/article/?join=articleFeatures&join=features&join=articlePrices&join=photos&join=category',"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }
                if(res.status==="error"){
                    console.log(res.data);
                    return;
                }

                putArticlesInState(res.data)

            })
    }

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

    const getFeaturesByCategoryId=async(categoryId:number):Promise<FeatureBaseType[]>=>{

        return new Promise(resolve=>{
            api('/api/feature/?filter=categoryId||$eq||'+categoryId+'/','GET',{},'administrator')
                .then((res:ApiResponse)=>{
                    if( res.status==='login'){
                        setIsAdministratorLogin(false);
                        return;
                    }
                    if(res.status==="error"){
                        console.log(res.data);
                        return;
                    }
                    const features:FeatureBaseType[]=res.data.map((item:any)=>({
                        featureId:item.featureId,
                        name:item.name,
                    }));
                    resolve(features);
                })

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

    const showAddModal=()=>{
        setAddName("");
        setAddExcerpt("");
        setAddDescription("");
        setCategoryId(1);
        setAddPrice(0.01);
        setAddFeatures([]);
        setVisible(true);
        const filePicker:any=document.getElementById('photo');
        filePicker.value='';
    }

    const showEditModal= async (article:ArticleType)=>{
        setEditArticleId(article.articleId)
        setEditName(String(article.name));
        setEditExcerpt(String(article.excerpt))
        setEditDescription(String(article.description))
        setEditStatus(String(article.status));
        setEditIsPromoted(Number(article.isPromoted));
        setEditPrice(article.price)
        setMessage("");


        if(!article.categoryId){
            return;
        }
        const categoryId:number=article.categoryId


        const allFeatures:any[]=await getFeaturesByCategoryId(categoryId)
        for(const apiFeature of allFeatures){
            apiFeature.use=0;
            apiFeature.value="";
            if(!article.articleFeatures){
                continue;
            }
            for(const articleFeature of article.articleFeatures){
                if(articleFeature.featureId===apiFeature.featureId){
                    apiFeature.use=1;
                    apiFeature.value=articleFeature.value;
                }
            }
        }
        setEditFeatures(allFeatures)
        setEditVisible(true);
    }
    const hideCart=()=>{
        setVisible(false);
    }

    const editVisibleFalse=()=>{
        setEditVisible(false)
    }

    const doAddArticle=()=>{
        const filePicker:any=document.getElementById('photo');

        if(filePicker?.files.length===0){
            setMessage("You must select a file to uploiad");
            return;
        }

        api('/api/Article/','POST',{
            categoryId:categoryId,
            name:addName,
            excerpt:addExcerpt,
            description:addDescription,
            price:addPrice,
            features:addFeatures
                .filter(feature=>feature.use===1)
                .map(feature=>({
                featureId:feature.featureId,
                value:feature.value
            }))

        },'administrator')
            .then(async(res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }

                /*if(res.status=="error"){
                    console.log("error");
                    setMessage(JSON.stringify(res.data));
                    return;
                }*/

                const articleId=res.data.articleId;


                const file=filePicker.files[0];
                const res2=await uploadArticlePhoto(articleId,file)

                /*if(res2.status!=='ok'){
                    setMessage("Could not upload this file.Try again")
                    return;
                }*/

                setVisible(false);
                getArticles()
            })
    }

    const handleArticleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, article: ArticleType) => {
        showEditModal(article);
    }

    const doEditArticle=()=>{
        api('/api/article/'+editArticleId,'PATCH',{
            name:editName,
            excerpt:editExcerpt,
            description:editDescription,
            status:editStatus,
            isPromoted:editIsPromoted,
            price:editPrice,
            features:editFeatures
                .filter(feature=>feature.use===1)
                .map(feature=>({
                    featureId:feature.featureId,
                    value:feature.value
                }))
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
                getArticles()
            })
    }


    const putArticlesInState=(data:ApiArticleDto[])=>{
        const articles:ArticleType[]=data.map(article=>{
            return{
                articleId:article.articleId,
                name:article.name,
                excerpt:article.excerpt,
                description:article.description,
                imageUrl:article.photos[0].imagePath,
                price:article?.articlePrices[article.articlePrices.length-1].price,
                status:article.status,
                isPromoted:article.isPromoted,
                articleFeatures:article.articleFeatures,
                features:article?.features,
                articlePrices:article.articlePrices,
                photos:article.photos,
                category:article.category,
                categoryId:article.categoryId
            };


        });
        setArticles(articles);

    }

    useEffect( () => {
        getArticles();
        getCategories();
    }, []);

    if(!isAdministratorLogin){
        navigate('/administrator/login')
    }

    const uploadArticlePhoto=async(articleId:number,file:File)=>{
        return await apiFile('api/article/'+articleId+'/uploadPhoto/','photo',file,'administrator');
    }

    const addModalCategoryChanged=async (event:React.ChangeEvent<HTMLSelectElement>)=>{
        setCategoryId(Number(event.target.value))

        const features=await getFeaturesByCategoryId(Number(event.target.value));
        const stateFeatures=features.map(feature=>({
            featureId:feature.featureId,
            name:feature.name,
            value:'',
            use:0
        }));

        setAddFeatures(stateFeatures);

    }

    const setAddModalFeatureUse=(featureId:number,use:boolean)=>{
        const addingFeat:any[]=[...addFeatures];
        for(const feature of addingFeat){
            if(feature.featureId===featureId){
                feature.use=use?1:0;
                break;
            }
        }

        setAddFeatures(addingFeat);

    }

    const setAddModalFeatureValue=(featureId:number,value:string)=>{
        const addingFeat:any[]=[...addFeatures];
        for(const feature of addingFeat){
            if(feature.featureId===featureId){
                feature.value=value
                break;
            }
        }

        setAddFeatures(addingFeat);
    }

    const setEditModalFeatureUse=(featureId:number,use:boolean)=>{
        const addingFeat:any[]=[...editFeatures];
        for(const feature of addingFeat){
            if(feature.featureId===featureId){
                feature.use=use?1:0;
                break;
            }
        }

        setEditFeatures(addingFeat);

    }

    const setEditModalFeatureValue=(featureId:number,value:string)=>{
        const addingFeat:any[]=[...editFeatures];
        for(const feature of addingFeat){
            if(feature.featureId===featureId){
                feature.value=value
                break;
            }
        }

        setEditFeatures(addingFeat);
    }

    const printEditModalFeatureInput=(feature:any)=>{
        return (
            <FormGroup>
                <Row>
                    <Col xs="4" sm="2">
                        <input type="checkbox" value="1" checked={feature.use===1}
                               onChange={(e)=>setEditModalFeatureUse(feature.featureId,e.target.checked)}/>
                    </Col>

                    <Col xs="8" sm="5">
                        {feature.name}
                    </Col>

                    <Col xs="12" sm="5">
                        <FormControl type="text" value={feature.value}
                                     onChange={(e)=>setEditModalFeatureValue(feature.featureId,e.target.value)}
                        ></FormControl>
                    </Col>
                </Row>
            </FormGroup>
        )

    }

    const printAddModalFeatureInput=(feature:any)=>{
        return (
            <FormGroup>
                <Row>
                    <Col xs="4" sm="2">
                        <input type="checkbox" value="1" checked={feature.use===1}
                               onChange={(e)=>setAddModalFeatureUse(feature.featureId,e.target.checked)}/>
                    </Col>

                    <Col xs="8" sm="5">
                        {feature.name}
                    </Col>

                    <Col xs="12" sm="5">
                        <FormControl type="text" value={feature.value}
                                     onChange={(e)=>setAddModalFeatureValue(feature.featureId,e.target.value)}
                        ></FormControl>
                    </Col>
                </Row>
            </FormGroup>
        )

    }


    return (
        <>
        <RoledMainMenu role="administrator"/>
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon={faListAlt}></FontAwesomeIcon>
                        Articles
                    </Card.Title>

                    <Table hover size="sm" bordered>
                        <thead>
                        <tr>
                            <th colSpan={7}></th>
                            <th className="text-center"><Button size="sm" variant="primary" onClick={showAddModal}><FontAwesomeIcon icon={faPlus}/>Add</Button></th>
                        </tr>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Promoted</th>
                            <th className="text-right">Price</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {articles.map(article=>(
                            <tr>
                                <td className="text-right">{article.articleId}</td>
                                <td >{article.name}</td>
                                <td >{article?.category?.name}</td>
                                <td >{article.status}</td>
                                <td >{article.isPromoted ? 'Yes': 'No'}</td>
                                <td className="text-right">{article.price}</td>
                                <td className="text-center">
                                    <Link to={"/administrator/dashboard/photo/"+article.articleId}
                                          className="btn btn-sm btn-info mr-3">
                                        <FontAwesomeIcon icon={faImages}/>Photos
                                    </Link>
                                </td>
                                <td className="text-center">

                                    <Button size="sm" variant="info" onClick={(event) => handleArticleClick(event, article)}><FontAwesomeIcon icon={faEdit}/>Edit</Button>

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                </Card.Body>
            </Card>

            <Modal size="lg" centered show={visible}
                   onEntered={()=>{
                        const filePicker:any=document.getElementById('photo');
                        filePicker.value="";
                        }

                    }
                   onHide={hideCart}>
                <ModalHeader closeButton>
                    <ModalTitle>Add new Article</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormLabel htmlFor="categoryId">Category</FormLabel>
                        <FormControl as="select" id="categoryId"
                                     value={categoryId?.toString()}
                                     onChange={(e)=>addModalCategoryChanged(e as any)}>
                                {categories.map(category=>(
                                <option value={category.categoryId?.toString()}>{category.name}</option>

                            ))}
                        </FormControl>
                    </FormGroup>

                    <div>
                        {addFeatures.map(printAddModalFeatureInput)}
                    </div>

                    <FormGroup>
                        <FormLabel htmlFor="photo">Article photo</FormLabel>
                        <FormControl type="file" id="photo"/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={addName}
                                     onChange={event=>setAddName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="excerpt">Excerpt</FormLabel>
                        <FormControl id="excerpt" type="text"
                                     value={addExcerpt}
                                     onChange={event=>setAddExcerpt(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <FormControl as="textarea" id="description"
                                     value={addDescription}
                                     onChange={event=>setAddDescription(event.target.value)}>

                        </FormControl>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="price">Price</FormLabel>
                        <FormControl id="price" type="number" min={0.01} step={0.01}
                                     value={addPrice}
                                     onChange={event=>setAddPrice(Number(event.target.value))}/>
                    </FormGroup>

                    <FormGroup>
                        <Button variant="primary" onClick={doAddArticle}><FontAwesomeIcon icon={faPlus}/>Add</Button>
                    </FormGroup>
                    {message ? (
                        <Alert variant="danger">{message}</Alert>
                    ) : ''}
                </ModalBody>
            </Modal>

            <Modal size="lg" centered show={editVisible}
                   onHide={editVisibleFalse}>
                <ModalHeader closeButton>
                    <ModalTitle>Edit  Article</ModalTitle>
                </ModalHeader>
                <ModalBody>

                    <FormGroup>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <FormControl id="name" type="text"
                                     value={editName}
                                     onChange={event=>setEditName(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="excerpt">Excerpt</FormLabel>
                        <FormControl id="excerpt" type="text"
                                     value={editExcerpt}
                                     onChange={event=>setEditExcerpt(event.target.value)}/>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <FormControl as="textarea" id="description"
                                     value={editDescription}
                                     onChange={event=>setEditDescription(event.target.value)}>

                        </FormControl>
                    </FormGroup>

                    <FormGroup>

                        <FormLabel htmlFor="status">Status</FormLabel>
                        <FormControl as="select" id="status"
                                     value={editStatus}
                                     onChange={event=>setEditStatus(event.target.value)}>
                            <option value="available">Available</option>
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                        </FormControl>

                    </FormGroup>

                    <FormGroup>

                        <FormLabel htmlFor="isPromoted">Promoted</FormLabel>
                        <FormControl as="select" id="isPromoted"
                                     value={editIsPromoted?.toString()}
                                     onChange={event=>setEditIsPromoted(Number(event.target.value))}>
                            <option value="0">Not Promoted</option>
                            <option value="1">Is Promoted</option>
                        </FormControl>

                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="price">Price</FormLabel>
                        <FormControl id="price" type="number" min={0.01} step={0.01}
                                     value={editPrice}
                                     onChange={event=>setEditPrice(Number(event.target.value))}/>
                    </FormGroup>

                    <div>
                        {editFeatures.map(printEditModalFeatureInput)}
                    </div>

                    <FormGroup>
                        <Button variant="primary" onClick={doEditArticle}><FontAwesomeIcon icon={faPlus}/>Edit</Button>
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

export default AdministratorDashboardArticle;