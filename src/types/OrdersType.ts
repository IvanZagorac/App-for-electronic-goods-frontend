import CartType from "./CartType";

export default interface OrdersType{
    orderId:number;
    createdAt:string;
    cartId:number;
    status:string;
    cart:CartType;

}

