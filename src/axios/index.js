import axios from 'axios'

let instance = axios.create({
    method: 'post',
    withCredentials: true, //跨域请求，携带 cookie
    baseURL: HOST
});
//添加一个请求拦截器
instance.interceptors.request.use(function(config){
    config.method = 'post';
    return config;
},function(err){
    return Promise.reject(error);
});

export default instance