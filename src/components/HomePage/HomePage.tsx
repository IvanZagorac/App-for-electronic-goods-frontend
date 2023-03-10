import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { Card, Col, Container, Row} from 'react-bootstrap'
import { faHome} from '@fortawesome/free-solid-svg-icons';
import CategoryType from "../../types/CategoryType";
import {Link, useNavigate} from "react-router-dom";
import api, {ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import ApiCategoryDto from "../../dtos/ApiCategoryDto";

function HomePage() {
    const[isUserLogin,setIsUserLogin]=useState<boolean>(true);
    const[categories,setCategories]=useState<CategoryType[]>();
    const navigate=useNavigate()


    useEffect( () => {
           getCategories();

    }, []);
    if(!isUserLogin){
        navigate('auth/user/login')
    }


    const putCategoriesInState=(data:ApiCategoryDto[])=>{
        const categories:CategoryType[]=data.map(category=>{
            return{
                categoryId:category.categoryId,
                name:category.name,
                parentCategoryId:category.parentCategoryId
            };


        });
        setCategories(categories);
    }

    const getCategories=()=>{
        api('/api/category/?filter=parentCategoryId||$isnull','GET',{})
            .then((res:ApiResponse)=>{
                if(res.status==="error"||res.status==="login"){
                    setIsUserLogin(false);
                    console.log(isUserLogin)
                    return;
                }
                putCategoriesInState(res.data)

            })
    }

    const singleCategory=(category:CategoryType)=>{
        return(
            <Col md="3" sm="6" xs="12">
                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title as="p">
                            {category.name}
                        </Card.Title>
                        <Link to={`/category/${category.categoryId}`}
                              className="btn btn-primary btn-block btn-sm">
                            Open category
                        </Link>

                    </Card.Body>
                </Card>
            </Col>
            )

    }

  return (
      <>
      <RoledMainMenu role="user"/>
      <Container>
          <Card>
              <Card.Body>
                  <Card.Title>
                      <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
                      Top level categories
                  </Card.Title>
                  <Row>
                      {categories?.map(singleCategory)}
                  </Row>

              </Card.Body>
          </Card>
      </Container>
      </>
  );
}

export default HomePage;
