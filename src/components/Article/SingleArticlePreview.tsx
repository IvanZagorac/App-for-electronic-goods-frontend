
import { Card, Col} from "react-bootstrap";
import React from "react";
import {apiConfig} from "../../config/api.config";
import {Link} from "react-router-dom";
import ArticleType from "../../types/ArticleType";
import AddToCartInput from "../AddToCartInput/AddToCartInput";



function SingleArticlePreview (article:ArticleType){

    const refreshPage=()=>{
        window.location.reload();
    }

    return(
        <Col md="4" sm="6" xs="12">
            <Card className="mb-3">
                <Card.Header>
                    <img className="w-100" alt={article.name}
                         src={apiConfig.PHOTO_PATH+article.imageUrl}/>
                </Card.Header>
                <Card.Body>
                    <Card.Title as="p">
                        <strong>{article.name}</strong>
                    </Card.Title>
                    <Card.Text>
                        {article.excerpt}
                    </Card.Text>
                    <Card.Text>
                        Price:{Number(article.price).toFixed(2)}EUR
                    </Card.Text>
                   <AddToCartInput article={article} />
                    <button className="gumb" onClick={refreshPage}>
                        <Link to={`/article/${article.articleId}`}
                              className="btn btn-primary btn-block btn-sm">
                            Open article page
                        </Link>
                    </button>
                </Card.Body>
            </Card>
        </Col>
    )

}

export default SingleArticlePreview;
