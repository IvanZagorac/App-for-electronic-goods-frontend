export default interface ArticleForOrderType{
    articleId:number;
    name:string;
    articlePrices:{
        price:number,
        createdAt:string;
    }[];
}