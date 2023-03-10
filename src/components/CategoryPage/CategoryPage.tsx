import {Link, useNavigate, useParams} from "react-router-dom";
import {Button, Card, Col, Container, Form, FormCheck, FormGroup, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faListAlt, faSearch} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import api, {ApiResponse} from "../../api/api";
import CategoryType from "../../types/CategoryType";
import ArticleType from "../../types/ArticleType";
import SingleArticlePreview from "../Article/SingleArticlePreview";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

function CategoryPage (){

    interface CategoryDto{
        categoryId:number;
        name:string;
    }

    interface ArticleDto{
        articleId:number;
        name:string;
        excerpt:string;
        description:string;
        articlePrices:{
            price:number,
            createdAt:string;
        }[];
        photos:{
            imagePath:string;
        }[];
    }

    interface FeatureDto{
        featureId:number;
        name:string;
        values:string[],
    }

    interface SelectedFeature{
        featureId:number;
        value:string;
    }

    let { cId }=useParams();
    const[category,setCategory]=useState<CategoryType>()
    const[articles,setArticles]=useState<ArticleType[]>()
    const[subCategories,setSubCategories]=useState<CategoryType[]>()
    const[message,setMessage]=useState<String>('')
    const[isUserLogin,setIsUserLogin]=useState<boolean>(true);
    const[keywords,setKeywords]=useState<string>(" ")
    const[priceMin,setPriceMin]=useState<number>(0.01)
    const[priceMax,setPriceMax]=useState<number>(Number.MAX_SAFE_INTEGER);
    const[order,setOrder]=useState<string>("price asc")
    const[features,setFeatures]=useState<FeatureDto[]>()
    const[selectedFeatures,setSelectedFeatures]=useState<SelectedFeature[]>([])
    const navigate=useNavigate();

    useEffect( () => {
        getCategoryData();
        const alreadyLoaded = localStorage.getItem('alreadyLoaded');
        if (alreadyLoaded!=="true") {
            localStorage.setItem('alreadyLoaded', "true");
            window.location.reload();
        }

    }, []);



    const getFeatures=()=>{

        api('api/feature/values/'+cId,'GET',{})
            .then((res:ApiResponse)=>{
            if(res.status==='login'){
            return setIsUserLogin(false);
            }
            if(res.status==='error'){
                return setMessage('Došlo je do pogreške')
            }

            const featuresDto:FeatureDto[]=
                    res.data.features.map((feature:FeatureDto)=>{

                        return {
                            featureId:feature.featureId,
                            name:feature.name,
                            values:feature.values
                        }

                    });
            setFeatures(featuresDto)

        })

    }

    const getCategoryData=()=>{
        api('api/category/'+ cId,'GET',{})
            .then((res:ApiResponse)=>{
                if(res.status==='login'){
                    return setIsUserLogin(false);
                }
                if(res.status==='error'){
                    return setMessage('Došlo je do pogreške')
                }

                const categoryData:CategoryType={
                    categoryId:res.data.categoryId,
                    name:res.data.name
                };
                setCategory(categoryData);

                const subCategories:CategoryType[]=
                    res.data.categories.map((category:CategoryDto)=>{
                        return {
                            categoryId:category.categoryId,
                            name:category.name
                        }

                    });

                setSubCategories(subCategories);
            })

        const orderPart=order.split(' ')
        const orderBy = orderPart[0];
        const orderDirection=orderPart[1].toUpperCase();

        const featureFilters:any[]=selectedFeatures;

        for(const item of selectedFeatures){
            let found=false;
            let foundRef:any=null;
            for(const featureFilter of featureFilters){
                if(featureFilter.featureId===item.featureId){
                    found=true;
                    foundRef=featureFilter;
                }
                if(!found){
                    featureFilters.push({
                        featureId:item.featureId,
                        value:[item.value],
                    });
                }/*else{
                    //popraviti
                }*/
            }
        }
        console.log(featureFilters)


        api('api/article/search','POST',{
            categoryId:Number(cId),
            keywords:keywords,
            priceMin:priceMin,
            priceMax: priceMax,
            features:featureFilters,
            orderBy:orderBy,
            orderDirection:orderDirection,
        })
            .then((res:ApiResponse)=>{
                if(res.status==='login'){
                    return setIsUserLogin(false);
                }
                if(res.status==='error'){
                    return setMessage('Došlo je do pogreške')
                }


                if(res.data.errorCode===0){
                     setMessage("");
                     setArticles([]);
                     return;
                }
                if(res.data.errorCode===-100001){
                }

                const articles:ArticleType[]=
                    res.data.map((article:ArticleDto)=>{
                        const obj:ArticleType={
                    articleId:article.articleId,
                    name:article.name,
                    excerpt:article.excerpt,
                    description:article.description,
                    imageUrl:'',
                    price:0
                }
                if(article.photos !==undefined && article.photos?.length>0){
                    obj.imageUrl=article.photos[article.photos?.length-1].imagePath;
                }

                if(article.photos !==undefined && article.photos?.length>0){
                    obj.price=article.articlePrices[article.articlePrices?.length-1].price;
                   }
                return obj;

                    })

                setArticles(articles);
            })

        getFeatures();

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

    const refreshPage=()=>{
        window.location.reload();
    }



    const singleCategory=(category:CategoryType)=>{
        return(
            <Col md="3" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title as="p">
                            {category.name}
                        </Card.Title>
                        <button className="gumb" onClick={refreshPage}>
                        <Link to={`/category/${category.categoryId}`}
                              className="btn btn-primary btn-block btn-sm">
                            Open category
                        </Link>
                        </button>
                    </Card.Body>
                </Card>
            </Col>
        )

    }

    const singleArticle=(article:ArticleType)=>{
        return(<SingleArticlePreview {...article}/>);

    }

    const showSubCategories=()=>{
        if(subCategories?.length===0){
            return;
        }

        return(
            <Row>
            {subCategories?.map(singleCategory)}
            </Row>
        )

    }

    const showArticles=()=>{
        if(articles?.length===0){
            return(
                <div>
                    There are no articles to show in this categories
                </div>
            );
        }

        return(
            <Row>
                {articles?.map(singleArticle)}
            </Row>
        )
    }

    const applyFilters=()=>{
        getCategoryData();

    }
    const addFeatureFilterValue=(featureId:number,value:string)=>{

        const newSelectedFeatures=selectedFeatures;
        newSelectedFeatures?.push({
            featureId:featureId,
            value:value,
        });
        setSelectedFeatures(newSelectedFeatures)

    }

    const removeFeatureFilterValue=(featureId:number,value:string)=>{
        const newSelectedFeature=selectedFeatures?.filter(record=>{
            if(record.featureId===featureId&& record.value===value){
                return false
            }else{
                return true
            }
        });
        setSelectedFeatures(newSelectedFeature)
    }

    const featureFilterChanged=(event:React.ChangeEvent<HTMLInputElement>)=>{
        const featureId=Number(event.target.dataset.featureId);
        const value=event.target.value;

        if(event.target.checked){
            addFeatureFilterValue(featureId,value);
        }else{
            removeFeatureFilterValue(featureId,value);
        }
        console.log(selectedFeatures)
    }

    const printFeatureFilterComponent=(features:FeatureDto
    )=>{
        return(
            <FormGroup>
                <Form.Label><strong>{features.name}</strong></Form.Label><br/>
                {
                    features.values.map(value=>(
                        <>
                            <FormCheck type="checkbox"
                                       label={value}
                                       value={value}
                                       data-feature-id={features.featureId}
                                       onChange={event=>featureFilterChanged(event as any)} />
                        </>


                    ))
                }

            </FormGroup>

         );
    }

    const showFilterForm=()=>{
        return(
            <Container>
                <FormGroup>
                    <Form.Label htmlFor="keywords">Keywords:</Form.Label><br/>
                    <Form.Control type="text" id="keywords"
                                  value={keywords}
                                  onChange={event=>setKeywords(event.target.value)}
                    ></Form.Control>
                </FormGroup>
                <FormGroup>
                    <Row>
                        <Col sm="6" xs="12">
                            <Form.Label htmlFor="priceMin">Min price:</Form.Label><br/>
                            <Form.Control type="number" id="priceMin"
                                          step="0.01" min="0.01" max="99999.99"
                                          value={priceMin}
                                          onChange={event=>setPriceMin(Number(event.target.value))}/>

                        </Col>

                        <Col sm="6" xs="12">
                            <Form.Label htmlFor="priceMax">Max price:</Form.Label><br/>
                            <Form.Control type="number" id="priceMax"
                                          step="0.01" min="0.02" max="1000000"
                                          value={priceMax}
                                          onChange={event=>setPriceMax(Number(event.target.value))}/>

                        </Col>
                    </Row>
                </FormGroup>
                <FormGroup>
                    <Form.Control as="select" id="sortOrder"
                                  value={order}
                                  onChange={e=>setOrder(e.target.value)}>
                        <option value="name desc">Sort by name DESC</option>
                        <option value="name asc">Sort by name ASC</option>
                        <option value="price desc">Sort by price DESC</option>
                        <option value="price asc">Sort by price ASC</option>
                    </Form.Control>
                </FormGroup>

                {features?.map(printFeatureFilterComponent)}

                <FormGroup>
                    <Button variant="btn btn-primary btn-block" onClick={applyFilters}>
                        <FontAwesomeIcon icon={faSearch}/> Search
                    </Button>
                </FormGroup>


            </Container>


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
                <FontAwesomeIcon icon={faListAlt}></FontAwesomeIcon>
                {category?.name}
            </Card.Title>

            {showSubCategories()}
            {printOptionalMessage()}

            <Row>
                <Col xs="12" sm="12" md="3" lg="3">
                    {showFilterForm()}
                </Col>
                <Col xs="12" sm="12" md="9" lg="9">
                    {showArticles()}
                </Col>

            </Row>


        </Card.Body>
    </Card>
</Container>
        </>

)

}

export  default CategoryPage;
