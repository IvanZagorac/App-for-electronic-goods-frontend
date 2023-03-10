import {useNavigate} from "react-router-dom";
import {
    Button,
    Card,
    Container,
    Modal,
    ModalBody,
    ModalHeader,
    ModalTitle,
    Table
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBox, faBoxOpen} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import OrdersType from "../../types/OrdersType";
import api, {ApiResponse} from "../../api/api";
import CartType from "../../types/CartType";
import ArticleForOrderType from "../../types/ArticleForOrderType";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";

interface OrderDto{
    orderId:number;
    userId:number
    createdAt:string;
    status:string;
    cart:{
        cartId:number;
        createdAt:string;
        cartArticles:{
            quantity:number;
            article:{
                articleId:number;
                name:string;
                excerpt:string;
                status:string;
                isPromoted:number;
                category:{
                    categoryId:number;
                    name:string;
                },

                articlePrices: {
                    createdAt:string;
                    price:number;
                }[];
                photos:{
                    imagePath:string;
                }[];
            }
        }[]
    }
}

function OrdersPage (){
    const[isLoggedIn]=useState<boolean>(true)
    const[orders,setOrders]=useState<OrdersType[]>();
    const [cart,setCart]=useState<CartType>();
    const [cartVisible,setCartVisible]=useState<boolean>(false);
    const navigate=useNavigate()



      const getOrders=()=> {
          api("api/user/cart/orders", 'GET', {})
              .then((res: ApiResponse) => {
                  const data: OrderDto[] = res.data;

                  const orders:OrdersType[] =
                      data.map(order => ({
                      orderId: order.orderId,
                      cartId:order.cart.cartId,
                      status:order.status,
                      createdAt: order.createdAt,
                      cart: {
                          user:null,
                          userId:0,
                          cartId: order.cart.cartId,
                          createdAt: order.cart.createdAt,
                          cartArticles: order.cart.cartArticles.map(ca => ({
                              cartArticleId: 0,
                              articleId: ca.article.articleId,
                              quantity: ca.quantity,
                              article: {
                                  articleId: ca.article.articleId,
                                  name: ca.article.name,
                                  category: {
                                      categoryId: ca.article.category.categoryId,
                                      name: ca.article.category.name,
                                  },
                                  articlePrices:ca.article.articlePrices.map(ap=>({
                                      articlePriceId:0,
                                      createdAt:ap.createdAt,
                                      price:ap.price,
                                  }))
                              }
                          }))
                      }
                  }))
                  setOrders(orders);
              });
      }

    const printOrderRow=(order:OrdersType)=>{
        return(
            <tr>
                <td>{order.createdAt}</td>
                <td>{order.status}</td>
                <td><Button
                    size="sm" className="btn btn-block" variant="primary"
                    onClick={()=>setAndShowCart(order.cart)}>
                    <FontAwesomeIcon icon={faBoxOpen}></FontAwesomeIcon>
                </Button></td>
            </tr>
        )

    }



    useEffect( () => {
        getOrders();

    }, []);

    const getLatestPrice=(article:ArticleForOrderType,latestDate:string)=>{

        const curTimeStamp=new Date(latestDate).getTime();

        let firstAP=article.articlePrices[0];

        for(let ap of article.articlePrices){
            const artPriceTimestamp=new Date(ap.createdAt).getTime();
            if(artPriceTimestamp< curTimeStamp){
                firstAP=ap;
            }else{
                break;
            }
        }

        return firstAP;

    }


    const calculatedSum=():number=>{
        let sum:number=0;

        if(!cart){
            return sum;
        }

        cart?.cartArticles?.forEach(item=>{
            let firstAP=getLatestPrice(item.article,cart.createdAt);

            sum+=firstAP.price *item.quantity;
        })

        return sum;
    }

    const sum=calculatedSum();


    const hideCart=()=>{
        setCartVisible(false);
    }

    const showCart=()=>{
        setCartVisible(true);
    }

    const setAndShowCart=(cart:CartType)=>{
        setCart(cart);
        showCart();
    }

    if(isLoggedIn===false) {
        navigate('/')
    }

    return(
        <>
        <RoledMainMenu role="user"/>
        <Container>

            <Card>
                <Card.Body>
                    <Card.Title>
                        <FontAwesomeIcon icon={faBox}></FontAwesomeIcon>
                        My Orders
                    </Card.Title>

                    <Table hover size="sm">
                        <thead>
                        <tr>
                            <th>Created at</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders?.map(printOrderRow)}
                        </tbody>
                        <tfoot>

                        </tfoot>
                    </Table>
                </Card.Body>
            </Card>
            <Modal size="lg" centered show={cartVisible} onHide={hideCart}>
                <ModalHeader closeButton>
                    <ModalTitle>Your order content</ModalTitle>
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
                            const articlePrice=getLatestPrice(cartArticle.article,cart.createdAt);
                            const price=Number(articlePrice.price);
                            const total= Number(cartArticle.quantity *  Number(price));


                            return(
                                <tr>
                                    <td>{cartArticle.article.category.name}</td>
                                    <td>{cartArticle.article.name}</td>
                                    <td className="text-right">{cartArticle.quantity}</td>
                                    <td  className="text-right"> {price} EUR</td>
                                    <td  className="text-right">{total} EUR</td>
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
                </ModalBody>
            </Modal>
        </Container>
        </>
    )

}

export default OrdersPage;
