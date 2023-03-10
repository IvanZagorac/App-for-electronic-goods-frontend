export default interface ApiArticleDto{
    articleId?:number;
    name?:string;
    categoryId?:number;
    excerpt?:string;
    description?:string;
    isPromoted?:number;
    status?:"available"| " visible" |"hidden";
    articleFeatures?:{
        articleFeatureId:number;
        featureId:number;
        value:string;
    }[];
    features?:{
        featureId:number;
        name:string;
    }[];
    articlePrices:{
        articlePriceId:number;
        price:number;
    }[]
    photos:{
       photoId:number;
       imagePath:string;
    }[];
    category?:{
        categoryId:number;
        name:string;
    };

}