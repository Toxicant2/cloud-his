import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

function errMsg(msg) {
    Message({
        message: msg,
        type: 'warning'
    })
}

axios.defaults.timeout = 150000
axios.defaults.baseURL =
    process.env.VUE_APP_ENV_CONFIG === 'dev' ? '/api' : process.env.VUE_APP_API_ROOT
// 设置默认请求头
axios.defaults.headers = {
    'X-Requested-With': 'XMLHttpRequest'
}

// http request 拦截器
axios.interceptors.request.use(
    config => {
        // 登录Token
        if (config.url.indexOf('/auth/oauth/token') > -1) {
            config.headers['Authorization'] =
                'Basic Y3Rycy11aTpjdHJzLXVpLWNsaWVudA=='
        } else {
            config.headers['Authorization'] = `Bearer ${getToken()}`
        }
        // 上传
        if (
            config.url.indexOf('/batch/upload') > -1 ||
            (config.url === '/statement/report' && config.method === 'post')
        ) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        } else {
            config.headers['Content-Type'] = 'application/json'
            // 序列化传入参数，上传时参数不可序列化
            config.data = JSON.stringify(config.data)
        }

        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// http response 拦截器
axios.interceptors.response.use(
    response => {
        if (
            response &&
            (response.status === 200 ||
                response.status === 304 ||
                response.status === 400)
        ) {
            const data = response.data
            if (
                (response.headers['content-disposition'] &&
                    response.headers['content-disposition'].indexOf(
                        'attachment'
                    ) > -1) ||
                response.headers['content-type'].indexOf('octet-stream') > -1 ||
                response.headers['content-type'].indexOf('msexcel') > -1
            ) {
                return data
            } else {
                if (
                    data.STATUS === '1' ||
                    data.STATUS === '8' ||
                    data.STATUS === '99' ||
                    data.access_token
                ) {
                    // if (data.STATUS === '8') {
                    //     errMsg(data.MESSAGE)
                    // }
                    return data
                }
                errMsg(data.MESSAGE)
                const err = new Error(data.MESSAGE)
                err.data = data
                err.response = response
            }
        }
    },
    error => {
        if (error && error.response) {
            let errs = ''
            switch (error.response.status) {
                case 400:
                    errs = '错误请求'
                    break
                case 401:
                    errs = '未授权，请重新登录'
                    break
                case 403:
                    errs = '拒绝访问'
                    break
                case 404:
                    errs = '请求错误,未找到该资源'
                    break
                case 405:
                    errs = '请求方法未允许'
                    break
                case 408:
                    errs = '请求超时'
                    break
                case 409:
                    errs = '服务器在完成请求时发生冲突'
                    break
                case 410:
                    errs = '请求的资源已被永久删除'
                    break
                case 411:
                    errs = '需要有效长度'
                    break
                case 413:
                    errs = '请求实体过大'
                    break
                case 414:
                    errs = '请求的 URI 过长'
                    break
                case 415:
                    errs = '不支持的媒体类型'
                    break
                case 500:
                    errs = '服务器端出错'
                    break
                case 501:
                    errs = '网络未实现'
                    break
                case 502:
                    errs = '网络错误'
                    break
                case 503:
                    errs = '服务不可用'
                    break
                case 504:
                    errs = '网络超时'
                    break
                case 505:
                    errs = 'http版本不支持该请求'
                    break
                default:
                    errs = `连接错误${error.response.status}`
            }
            errMsg(errs)
            error.message = errs
        } else {
            errMsg('连接到服务器失败')
            error.message = '连接到服务器失败'
        }
        return Promise.reject(error)
    }
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function fetch(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios({
            url: encodeURI(url),
            params
        })
            .then(response => {
                resolve(response)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}, responseType) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url,
            data,
            responseType
        })
            .then(response => {
                resolve(response)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * 封装delete请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function deleteHttp(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'delete',
            url,
            data
        })
            .then(response => {
                resolve(response)
            })
            .catch(err => {
                reject(err)
            })
    })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function put(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios({
            method: 'put',
            url,
            data
        })
            .then(response => {
                resolve(response)
            })
            .catch(err => {
                reject(err)
            })
    })
}
