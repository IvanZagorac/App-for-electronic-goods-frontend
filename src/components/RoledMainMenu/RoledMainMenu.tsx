
import React from "react";
import MainMenu, {MainMenuItem} from "../MainMenu/MainMenu";

interface RoledMainMenuProperties{
    role:string;
}

interface MainMenuItems{
    text:string;
    link:string;
}

const getUserMenuItems=():MainMenuItems[]=>{
        return [
            new MainMenuItem("Home","/"),
            new MainMenuItem("Contact","/contact/"),
            new MainMenuItem("Log Out","/auth/user/logout/"),
            new MainMenuItem("Orders","/user/order/"),
        ];
}

const getAdministratorMenuItems=():MainMenuItem[]=>{
        return [
            new MainMenuItem("Dashboard","/administrator/dashboard"),
            new MainMenuItem("Log Out","/administrator/logout"),
        ];
}

const getVisitorMenuItems=():MainMenuItem[]=>{
    return [
        new MainMenuItem("Log In","/auth/user/login/"),
        new MainMenuItem("Register","/auth/user/register/"),
        new MainMenuItem("Admin Login","/administrator/login/"),
    ];
}

function RoledMainMenu (props:RoledMainMenuProperties){

    let items:MainMenuItem[]=[];

    switch(props.role){
        case 'visitor':items=getVisitorMenuItems();break;
        case 'user': items=getUserMenuItems();break;
        case 'administrator':items=getAdministratorMenuItems();break;
    }

    const token = localStorage.getItem('token');
    if (token) {
        items.push(new MainMenuItem('Log Out', '/auth/user/logout/'));
    }

    let showCart=false;

    if(props.role==='user'){
        showCart=true
    }

    return(
        <MainMenu items={items} showCart={showCart}/>
    )

}

export default RoledMainMenu;
