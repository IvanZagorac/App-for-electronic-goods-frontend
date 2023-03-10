
import React, {useEffect, useState} from "react";
import CartType from "../../types/CartType";
import api, {ApiResponse} from "../../api/api";
import {
    Alert,
    Button,
    FormControl,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    NavItem,
    NavLink,
    Table
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCartArrowDown, faMinusSquare} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";



function CartPage (){
    const [count,setCount]=useState<number>(0);
    const [cart,setCart]=useState<CartType>();
    const [cartVisible,setCartVisible]=useState<boolean>(false)
    const [message,setMessage]=useState<string>("")
    const navigate=useNavigate()

    const updateCart=()=>{
            api('api/user/cart','GET',{})
                .then((res:ApiResponse)=>{
                    if(res.status==='error'||res.status==='login'){
                        setCount(0);
                        setCart(undefined);
                        return;
                    }
                    setCart(res.data);
                    setCount(res.data.cartArticles?.length);


                });
    }

    const showCart=()=>{
        setCartVisible(true);
    }

    const hideCart=()=>{
        setCartVisible(false);
        setMessage('');
    }

    useEffect( () => {
        updateCart();
        const alreadyLoaded = localStorage.getItem('alreadyLoaded');
        if (alreadyLoaded!=="true") {
            localStorage.setItem('alreadyLoaded', "true");
            window.location.reload();
        }
    }, []);

    const calculatedSum=():number=>{
        let sum:number=0;

        if(!cart){
            return sum;
        }

            cart?.cartArticles?.forEach(item=>{
                sum+=Number(item.article.articlePrices[item.article.articlePrices.length-1].price *item.quantity);
            })



        return sum;
    }

    const sendCartUpdateFromApi=(data:any)=>{
        api('api/user/cart/','PATCH',data)
            .then((res:ApiResponse)=>{
                if(res.status==='error'||res.status==='login'){
                    setCount(0);
                    setCart(undefined);
                    return;
                }
                setCart(res.data);
                setCount(res.data.cartArticles.length);
            })

    }

    const updateQuantity=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const articleId=e.target.dataset.articleId;
        const newQuantity=Number(e.target.value);

        const data={
            articleId:Number(articleId),
            quantity:Number(newQuantity)
        }

        sendCartUpdateFromApi(data);



    }

    const makeOrder=()=>{
        api('api/user/cart/makeOrder','POST',{})
            .then((res:ApiResponse)=>{
                if(res.status==='error'||res.status==='login'){
                    setCount(0);
                    setCart(undefined);
                    return;
                }

                setMessage('Your order has successfully made')
                setCart(undefined);
                setCount(0);
                navigate("/");
            })
    }

    const removeFromCart=(articleId:number)=>{

        const data={
            articleId:Number(articleId),
            quantity:0
        }

        sendCartUpdateFromApi(data)

    }


    const sum=calculatedSum();

return(

    <>

    <NavItem className="kosara">
        <NavLink className="kosara-link" active={false} onClick={showCart}>
            <FontAwesomeIcon icon={faCartArrowDown}/>({count})
        </NavLink>
    </NavItem>
        <Modal size="lg" centered show={cartVisible} onHide={hideCart}>
            <ModalHeader closeButton>
                <ModalTitle>Your shopping cart</ModalTitle>
            </ModalHeader>
            <ModalBody>
                <Table hover size="sm">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Article</th>
                            <th  className="text-right">Quantity</th>
                            <th  className="text-right">Price</th>
                            <th  className="text-right">Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {cart?.cartArticles?.map(cartArticle=>{
                        const price=Number(cartArticle.article.articlePrices[cartArticle.article.articlePrices.length-1].price).toFixed(2);
                        const total= Number(cartArticle.quantity *  Number(price));
                        return(
                            <tr>
                                <td>{cartArticle.article.category.name}</td>
                                <td>{cartArticle.article.name}</td>
                                <td className="text-right">
                                    <FormControl type="number" step="1" min="1"
                                    value={cartArticle.quantity}
                                    data-article-id={cartArticle.article.articleId}
                                    onChange={(e)=>updateQuantity(e as any)}
                                    >

                                    </FormControl></td>
                                <td  className="text-right"> {price} EUR</td>
                                <td  className="text-right">{total} EUR</td>
                                <td> <FontAwesomeIcon onClick={(e)=>removeFromCart(cartArticle.article.articleId)} icon={faMinusSquare}/></td>
                            </tr>
                        )
                    })}
                    </tbody>
                    <tfoot>
                    <tr>

                        <td colSpan={3}></td>
                        <td  className="text-right"><strong>Total:</strong></td>
                        <td>{sum} EUR</td>
                    </tr>
                    </tfoot>
                </Table>
                <Alert variant="success" className={message ? '' : 'd-none'}>{message}</Alert>
            </ModalBody>
            <ModalFooter>
                <Button variant="primary" onClick={makeOrder}
                        disabled={cart?.cartArticles?.length===0}>
                    Make an order
                </Button>
            </ModalFooter>
        </Modal>

    </>

);

}

export default CartPage;
