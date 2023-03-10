
import {Button, Col, FormControl, FormGroup, Row} from "react-bootstrap";
import React, {useState} from "react";
import api, {ApiResponse} from "../../api/api";
import ArticleForCartInputDto from "../../types/ArticleForCartInputDto";



function AddToCartInput (article:ArticleForCartInputDto){


    const[quantity,setQuantity]=useState<number>(1);
    const [ error, setError ] = useState<string>("");

    const refreshPage=()=>{
        window.location.reload();
    }

    const addToCart=()=>{
        const bodyData={
            articleId:article?.article?.articleId,
            quantity:quantity
        }

        api("api/user/cart/addToCart","POST",bodyData)
            .then((res:ApiResponse) => {
                if (res.status !== "ok") {
                    throw new Error("Could not add this item!");
                }
                window.alert("Artikl uspjesno dodan u kosaricu")
                refreshPage();
                console.log(res.data)
                return res.data;

            })
            .catch(e => {
                setError(e?.message);

                setTimeout(() => {
                    setError("");
                }, 5000);
            });
    }

    return(
                    <FormGroup>
                        <Row>
                            <Col xs="7">
                                <FormControl
                                    type="number"
                                    min="1" step="1" value={quantity}
                                    onChange={event=>setQuantity(Number(event.target.value))}
                                ></FormControl>
                            </Col>
                            <Col xs="5">
                                <Button variant="btn btn-block btn-secondary"   onClick={addToCart}>Buy</Button>
                            </Col>
                        </Row>
                    </FormGroup>
    )

}

export default AddToCartInput;
