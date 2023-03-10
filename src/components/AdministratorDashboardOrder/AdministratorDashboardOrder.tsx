import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button, Card, Container, Modal, ModalBody, ModalHeader, ModalTitle, Tab, Table, Tabs} from 'react-bootstrap'
import {faBoxOpen, faCartArrowDown} from '@fortawesome/free-solid-svg-icons';
import { useNavigate} from "react-router-dom";
import api, {ApiResponse} from "../../api/api";
import RoledMainMenu from "../RoledMainMenu/RoledMainMenu";
import ApiOrderDto from "../../dtos/ApiOrderDto";
import ArticleForOrderType from "../../types/ArticleForOrderType";
import CartType from "../../types/CartType";
import OrdersType from "../../types/OrdersType";


function AdministratorDashboardOrder() {
    const[isAdministratorLogin,setIsAdministratorLogin]=useState<boolean>(true);
    const[orders,setOrders]=useState<ApiOrderDto[] >([]);
    const [cart,setCart]=useState<CartType>();
    const [cartVisible,setCartVisible]=useState<boolean>(false);
    const navigate=useNavigate()

    const getOrders=()=>{
        api('api/orderAdmin/',"GET",{},"administrator")
            .then((res:ApiResponse)=>{
                if(res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }
                setOrders(res.data);

            })
    }

    const changeStatus=(orderId:number,newStatus:'rejected'|'accepted'|'send'|'pending')=>{
        api('api/orderAdmin/'+orderId,"PATCH",{newStatus},"administrator")
            .then((res:ApiResponse)=>{
                if(res.status==='login'){
                    setIsAdministratorLogin(false);
                    return;
                }

                getOrders()

            })

        return;
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

    const showCart=()=>{
        setCartVisible(true);
    }

    const setAndShowCart=(cart:CartType)=>{
        setCart(cart);
        showCart();
    }


    const hideCart=()=>{
        setCartVisible(false);
    }

    const printStatusChangedButtons=(order:OrdersType)=>{
        if(order.status==='pending'){
            return(
                <>
                    <Button type="button" variant="primary" size="sm" className="mr-2" onClick={()=>changeStatus(order.orderId,'accepted')}>Accept</Button>
                    <Button type="button" variant="danger" size="sm" onClick={()=>changeStatus(order.orderId,'rejected')}>Reject</Button>
                </>
            )
        }

        if(order.status==='accepted'){
            return(
                <>
                    <Button type="button" variant="primary" size="sm" className="mr-2" onClick={()=>changeStatus(order.orderId,'send')}>Ship</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={()=>changeStatus(order.orderId,'pending')}>Pending</Button>
                </>
            )
        }

        if(order.status==='send'){
            return(
                <>

                </>
            )
        }

        if(order.status==='rejected'){
            return(
                <>
                    <Button type="button" variant="secondary" size="sm" onClick={()=>changeStatus(order.orderId,'pending')}>Pending</Button>
                </>
            )
        }

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

    const renderOrders=(withStatus:"pending"| "rejected"|"accepted"|"send")=>{

       return(
           <Table hover size="sm" bordered>
               <thead>
               <tr>
                   <th className="text-right pr-2">Order ID</th>
                   <th>Date</th>
                   <th>Status</th>
                   <th>Cart</th>
                   <th>Options</th>
               </tr>
               </thead>
               <tbody>
               {orders
                   .filter(order=>order.status===withStatus)
                   .map(order=>(
                   <tr>
                       <td>{order.orderId}</td>
                       <td>{order.createdAt}</td>
                       <td>{order.status}</td>
                       <td><Button
                           size="sm" className="btn btn-block" variant="primary"
                           onClick={()=>setAndShowCart(order.cart)}>
                           <FontAwesomeIcon icon={faBoxOpen}></FontAwesomeIcon>
                       </Button></td>
                       <td>
                           {printStatusChangedButtons(order)}
                       </td>
                   </tr>
               ))}
               </tbody>
           </Table>
       )
    }


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
                        <FontAwesomeIcon icon={faCartArrowDown}></FontAwesomeIcon>
                        Orders
                    </Card.Title>

                    <Tabs
                        defaultActiveKey="pending"
                        id="order-tabs"
                        className="mb-3 ml-0"
                    >
                        <Tab eventKey="pending" title="Pending">
                            {renderOrders("pending")}
                        </Tab>
                        <Tab eventKey="accepted" title="Accepted">
                           { renderOrders("accepted")}
                        </Tab>
                        <Tab eventKey="send" title="Send" >
                            {renderOrders("send")}
                        </Tab>

                        <Tab eventKey="rejected" title="Rejected" >
                            {renderOrders("rejected")}
                        </Tab>
                    </Tabs>

                </Card.Body>
            </Card>
            <Modal size="lg" centered show={cartVisible} onHide={hideCart}>
                <ModalHeader closeButton>
                    <ModalTitle>Order content</ModalTitle>
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
    );
}

export default AdministratorDashboardOrder;
