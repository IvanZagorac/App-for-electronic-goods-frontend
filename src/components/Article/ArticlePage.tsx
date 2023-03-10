import {useNavigate, useParams} from "react-router-dom";
import {Card, Col, Container, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBoxOpen} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import ApiArticleDto from "../../dtos/ApiArticleDto";
import api, {ApiResponse} from "../../api/api";
import {apiConfig} from "../../config/api.config";
import AddToCartInput from "../AddToCartInput/AddToCartInput";


interface FeatureData{
    name:string;
    value:string;
}

function ArticlePage (){
    let { aId }=useParams();
    const[article,setArticle]=useState<ApiArticleDto>()
    const[features,setFeatures]=useState<FeatureData[]>([]);
    const[message,setMessage]=useState<String>('')
    const[isUserLogin,setIsUserLogin]=useState<boolean>(true);
    const navigate=useNavigate();

    useEffect( () => {
        getArticleData();
    }, []);

    const getArticleData=()=>{
        api('api/article/'+aId,"GET",{})
            .then((res:ApiResponse)=>{
                if( res.status==='login'){
                    setIsUserLogin(false);
                    return;
                }
                if(res.status==="error"){
                    setArticle(undefined);
                    setFeatures([])
                    setMessage("This article does not exists");
                    return;
                }

                setArticle(res.data);
                const features:FeatureData[]=[];

                for(const articleFeatures of res.data.articleFeatures){
                    const value=articleFeatures.value;
                    let name='';
                    for(const feature of res.data.features){
                        if(feature.featureId===articleFeatures.featureId){
                            name=feature.name;
                            break;
                        }
                    }
                    features.push({name,value});
                }
                    setFeatures(features);
            });
    }

    const printOptionalMessage=()=>{
        if(message===''){
            return;
        }
        return(
            <Card.Text>
                {message}
            </Card.Text>
        )
    }
    if(!isUserLogin){
        navigate('/auth/user/login')
    }

    return(
        <>
        <RoledMainMenu role="user"/>
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon={faBoxOpen}/>
                        {article?.name}
                    </Card.Title>
                    {printOptionalMessage()}
                    <Row>
                        <Col xs="12"  lg="8">
                            <div className="excerpt">
                                {article?.excerpt}
                            </div>
                            <hr/>
                            <div className="description">
                                {article?.description}
                            </div>
                            <hr/>
                            <b>Features:</b><br/>
                            <ul>
                                {features?.map(feature=>(
                                    <li>
                                        {feature.name}:{feature.value}
                                    </li>
                                ))
                                }
                            </ul>

                        </Col>

                        <Col xs="12"  lg="4">
                            <Row>
                                <Col xs="12">
                                    <img alt={'Image -' + article?.photos[0].photoId}
                                         src={apiConfig.PHOTO_PATH + article?.photos[0].imagePath}
                                         className="w-100"/>
                                </Col>
                            </Row>

                            <Row>
                                {article?.photos.slice(1).map(photo=>(
                                    <Col xs="12">
                                        <img alt={'Image -' + photo.photoId}
                                             src={apiConfig.PHOTO_PATH + photo.imagePath}
                                             className="w-100"/>
                                    </Col>
                                ))}
                            </Row>

                            <Row>
                                <Col xs="12" className="text-center mt-3 mb-3">
                                    <b>
                                    Price:{
                                    Number(article?.articlePrices[article?.articlePrices.length-1].price).toFixed(2) + 'EUR'
                                }
                                    </b>
                                </Col>
                            </Row>

                             <Row>
                                 <Col cs="12" className="mt-5">
                                    <AddToCartInput article={article}/>
                                 </Col>
                             </Row>
                        </Col>

                    </Row>
                </Card.Body>
            </Card>
        </Container>
        </>
    )

}

export default ArticlePage;
