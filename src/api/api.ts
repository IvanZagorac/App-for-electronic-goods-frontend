import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {apiConfig} from "../config/api.config";
import {useNavigate} from "react-router-dom";


export interface ApiResponse{
    status:'ok'|'error'|'login';
    data:any;
}

export default function api(
    path:string,
    method:'GET'|'POST'| 'PATCH'|'DELETE' | 'PUT',
    body:any,
    role:'user' | 'administrator' = 'user',
        )
{


    return new Promise<ApiResponse>((resolve)=>{
        const requestData={
            method:method,
            baseURL: apiConfig.API_URL,
            url: path,
            data:body ? JSON.stringify(body) : undefined,
            headers:{
                'Content-Type':'application/json',
                'Authorization':getToken(role)
            },
        }
        axios(requestData)
            .then(res=> {
                return responseHandler(res, resolve);
            })
            .catch(async err=> {
                if(err.response.status===401){
                    const newRefreshToken=await refreshToken(role);
                    console.log(newRefreshToken)
                    if(newRefreshToken===null){
                        const response:ApiResponse={
                            status:'login',
                            data:err.response.data,
                        }
                        console.log(response)
                        return resolve(response);
                    }

                    saveToken(role,newRefreshToken);

                    console.log(requestData.headers)

                    requestData.headers!.Authorization=getToken(role);

                    return await repeatRequest(requestData,resolve)
                }

                const response:ApiResponse={
                    status:'error',
                    data:err
                }
                 resolve(response)


            });
    });

}

export function apiFile(
    path:string,
    name:string,
    file:File,
    role:'user' | 'administrator' = 'user',
)
{
    return new Promise<ApiResponse>((resolve)=>{
        const formData=new FormData();
        formData.append(name,file)
        const requestData:AxiosRequestConfig={
            method:'POST',
            baseURL: apiConfig.API_URL,
            url: path,
            data:formData,
            headers:{
                'Content-Type':'multipart/form-data',
                'Authorization':getToken(role)
            },
        }
        axios(requestData)
            .then(res=> {
                return responseHandler(res, resolve);
            })
            .catch(async err=> {
                if(err.response.status===401){
                    const newToken=await refreshToken(role);
                    if(!newToken){
                        console.log("neema refresha")
                        const response:ApiResponse={
                            status:'login',
                            data:err.response.data,
                        }
                        return resolve(response);
                    }

                    saveToken(role,newToken);

                    requestData.headers!.Authorization=getToken(role);

                    return await repeatRequest(requestData,resolve)
                }

                const response:ApiResponse={
                    status:'error',
                    data:err
                }
                resolve(response)


            });
    });

}


async function responseHandler(
    res: AxiosResponse<any>,
    resolve: (value: ApiResponse | PromiseLike<ApiResponse>) => void)
{
    if(res.status<200|| res.status>=300){
        console.log("status manji od 200 ili veci od 300")
        const response:ApiResponse={
            status:'error',
            data:res.data,
        }

        return resolve(response);
    }
    let response:ApiResponse;
    if(res.data.statusCode<0){
        console.log("status code manji do 0")
        response={
            status:'login',
            data:null
        }

    }else {
        response = {
            status: 'ok',
            data: res.data,
        };
    }


    return resolve(response);
}



function getToken(role:'user' |'administrator'):string{
    const token=localStorage.getItem('api_token' + role);

    return 'Bearer ' +token;
}

export function saveIdentity(role:'user' |'administrator',identity:string){
    localStorage.setItem('api_identity'+role,identity);
}

export function getIdentity(role:'user' |'administrator'){
    const adminId=localStorage.getItem('api_identity'+role);
    return adminId;
}

export function saveToken(role:'user' |'administrator',token:string){
    localStorage.setItem('api_token' + role ,token);
}


function getRefreshToken(role:'user' |'administrator'):string{
    const refreshToken=localStorage.getItem('api_refresh_token' + role);

    return refreshToken+'';
}


export function saveRefreshToken(role:'user' |'administrator',refreshToken:string){
    localStorage.setItem('api_refresh_token' + role,refreshToken);
}

export function removeTokenData(role:'user' |'administrator'){
    localStorage.removeItem('api_token' + role)
    localStorage.removeItem('api_refresh_token' + role)
    localStorage.removeItem('api_identity'+role)
    localStorage.removeItem('alreadyLoaded')
}

function refreshTokenResponseHandler(res: AxiosResponse<any>, resolve: (data: string|null) => void) {
    if (res.status !== 200) {
        return resolve(null);
    }
    console.log("bar nes")

    resolve(res.data?.token);
}


async function refreshToken(role:'user' |'administrator'):Promise<string|null>{

    return new Promise<string|null>(resolve => {
        axios({
            method: "POST",
            baseURL: apiConfig.API_URL,
            url: "/auth/" + role + "/refresh",
            data: JSON.stringify({
                refreshToken: getRefreshToken(role),
            }),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => refreshTokenResponseHandler(res, resolve))
        .catch(() => {
            resolve(null);
        });
    });

    /*const path='auth/'+role+'/refresh';
    const data={
        token:getRefreshToken(role)
    }
    const refreshTokenData:AxiosRequestConfig= {
        method: 'POST',
        url: apiConfig.API_URL + path,
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const refreshTokenResponse:{data:{token:string|undefined}}=await axios(refreshTokenData);
    console.log(refreshTokenResponse)
    if(!refreshTokenResponse.data.token){
        console.log("ne postoji token iz")
        return null;
    }


    return refreshTokenResponse.data.token*/
}


async function repeatRequest(
    requestData:AxiosRequestConfig,
    resolve:(value:ApiResponse| PromiseLike<ApiResponse>)=>void
){
    axios(requestData)
        .then(res=>{
            console.log("UsoRePEAT")
            let response:ApiResponse;
            if(res.status===401){
                response={
                    status:'login',
                    data:null,
                }
                return resolve(response);

            }else{
                response={
                    status:'ok',
                    data:res,
                }
            }

            return resolve(response)
        })
        .catch(err=>{
            const response:ApiResponse={
                status:'error',
                data:err,
            };
            return resolve(response)
        })
}