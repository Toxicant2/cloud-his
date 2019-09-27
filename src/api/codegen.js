import {
    fetch,
    post
} from './http'

// 获取数据库表
export const getDBTablePage = data => {
    return fetch(`/codegen/generator/page`, data)
}

// 生成代码
export const createCode = (data, header) => {
    return post('/codegen/generator/code', data, header)
}
