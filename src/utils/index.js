import moment from 'moment'
import unknownAvatar from '@/assets/icon_images/unknown-avatar.png'
import childAvatar from '@/assets/icon_images/child-avatar.png'
import maleAvatar from '@/assets/icon_images/male-avatar.png'
import femaleAvatar from '@/assets/icon_images/female-avatar.png'
import store from '../store'
import {
    Session
} from '@/utils/storage'
import {
    getCurrentDay
} from './common'

/**
 * 如果患者头像不存在，根据患者性别返回头像
 * 年纪小于3岁，统一为婴儿头像
 * @export
 * @param {*} sex 患者性别
 * @param {*} birth 患者生日
 * @returns 患者头像
 */

export function paramAvatar(sex, birth) {
    sex = Number(sex)
    if (isNaN(sex) || !sex || !birth) {
        return unknownAvatar
    }
    const tn = moment(birth).toNow(true)
    if (tn.indexOf('years') > -1) {
        if (Number(tn.split(' ')[0]) <= 3) {
            return childAvatar
        } else {
            switch (sex) {
                case 0:
                    return unknownAvatar
                case 1:
                    return maleAvatar
                case 2:
                    return femaleAvatar
                case 9:
                    return unknownAvatar
                default:
                    return ''
            }
        }
    } else {
        return childAvatar
    }
}
/**
 *将字符串做*号加密处理
 * @export
 * @param {*} target 目标字符串
 * @param {*} start 加密开始位置
 * @param {*} len 加密长度
 * @returns
 */
export function encryptStar(target, start, len) {
    if (isNaN(start) || isNaN(len)) return
    if (!target || target.constructor !== String) {
        return
    }
    const str = target.substr(start, len)
    let star = ''
    for (let i = 0; i < len; i++) {
        star += '*'
    }
    return target.replace(str, star)
}

/**
 * 格式化本地city.json
 * 根据value获取label
 * @export
 * @param {*} region 数组
 * @returns
 */
export function formatRegion(region) {
    if (region.constructor !== Array) return ''
    const cityList = require('@/common/data/city')
    let result = ''
    cityList.default.forEach(p => {
        if (p.value === region[0]) {
            result += p.label
            p.children.forEach(c => {
                if (c.value === region[1]) {
                    result += c.label
                    c.children.forEach(d => {
                        if (d.value === region[2]) {
                            result += d.label
                        }
                    })
                }
            })
        }
    })
    return result
}

/**
 * 转换日期
 * @export
 * @param {*} d
 * @returns
 */
export function formatDate(d, flag = true) {
    const date = d ? new Date(d) : new Date()
    let temp = ''
    if (!flag) {
        temp =
            ' ' +
            (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) +
            ':' +
            (date.getMinutes() > 9
                ? date.getMinutes()
                : '0' + date.getMinutes()) +
            ':' +
            (date.getSeconds() > 9
                ? date.getSeconds()
                : '0' + date.getSeconds())
    }
    return (
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : '0' + (date.getMonth() + 1)) +
        '-' +
        (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) +
        temp
    )
}

/**
 * 根据id、code得到字典表
 * @export
 * @param {*} list 字典数据
 * @param {*} value 对应id
 * @returns
 */
export function formatDictMap(list, value) {
    if (list.constructor !== Array) return ''
    if (!value) return ''
    let result = ''
    list.some(item => {
        if (item.value === value) {
            result = item.label
        }
    })
    return result
}

/**
 *
 * 转化性别
 * @export
 * @param {*} sex
 * @returns
 */
export function formatSex(sex) {
    switch (sex) {
        case '0':
            return '未知的性别'
        case '1':
            return '男'
        case '2':
            return '女'
        case '9':
            return '未说明的性别'
        default:
            return ''
    }
}

// 倒转换性别

export function formatReverseSex(sex) {
    switch (sex) {
        case '未知的性别':
            return '0'
        case '男':
            return '1'
        case '女':
            return '2'
        case '未说明的性别':
            return '9'
        default:
            return ''
    }
}
/**
 * 患者状态
 * @export
 * @param {*} status
 * @returns
 */
export function formatPatientStatus(status) {
    switch (status) {
        case 0:
            return '待分诊'
        case 1:
            return '待接诊'
        case 2:
            return '接诊中'
        case 3:
            return '已完成'
        case 4:
            return '快速收费'
        default:
            return ''
    }
}

/**
 * 收费状态
 * @export
 * @param {*} status
 * @returns
 */
export function formatChargeStatus(status) {
    switch (status) {
        case 0:
            return '未收费'
        case 1:
            return '部分收费'
        case 2:
            return '已收费'
        case 3:
            return '已退费'
        default:
            return ''
    }
}
/**
 * 退费状态
 * @export
 * @param {*} status
 * @returns
 */
export function formatRefundedStatus(status) {
    switch (status) {
        case 0:
            return ''
        case 1:
            return '已退费'
        default:
            return ''
    }
}

/**
 * 转诊状态
 * @export
 * @param {*} status
 * @returns
 */
export function formatTransferStatus(status) {
    switch (status) {
        case null:
            return ''
        case -1:
            return '转诊失败'
        case 0:
            return '暂存'
        case 1:
            return '申请待处理'
        case 2:
            return '申请通过'
        case 3:
            return '已就诊'
        case 4:
            return '未就诊'
        default:
            return ''
    }
}
/**
 * 格式化路由菜单
 * @param {Array} data
 */
export function formatRouter(data) {
    const detailRouter = {}
    const asyncRouterMap = []
    const reportMaps = []
    let hasSystem = false
    data.forEach(v => {
        // 库存
        if (v.type === '1') {
            detailRouter[v.name] = true
        }
        // 报表
        if (v.parentId === 73) {
            reportMaps.push({
                id: v.id,
                name: v.title,
                key: `${v.name || ''}${v.id}`,
                children: []
            })
        }
        if (v.parentId < 0) {
            if (v.id === 9) hasSystem = true
            asyncRouterMap.push({
                id: v.id,
                path: v.path,
                component: () => import('@/views/layout/Layout'),
                redirect: v.url ? v.url : 'noredirect',
                name: v.name,
                meta: {
                    title: v.title,
                    icon: v.icon
                },
                children: []
            })
        }
    })
    reportMaps.forEach(a => {
        data.forEach(m => {
            if (a.id === m.parentId) {
                a.children.push({
                    id: m.id,
                    name: m.title,
                    key: `${m.name || ''}${m.id}`,
                    path: m.path
                })
            }
        })
    })

    if (!hasSystem) {
        asyncRouterMap.push({
            id: 9,
            path: '/system',
            component: () => import('@/views/layout/Layout'),
            redirect: '/system/modify',
            name: 'system',
            meta: {
                title: '系统管理',
                icon: 'setting'
            },
            children: []
        })
    }
    asyncRouterMap.forEach(a => {
        // 个人中心
        if (a.id === 9) {
            a.children.push({
                path: 'modify',
                component: () =>
                    import('@/views/systems/modifyInformation/index'),
                name: 'modifyInfo',
                meta: {
                    title: '个人中心',
                    icon: 'user'
                },
                children: []
            })
        }
        data.forEach(m => {
            if (a.id === m.parentId) {
                a.children.push({
                    id: m.id,
                    path: m.path,
                    component: () => import(`@/${m.component}`),
                    name: m.name,
                    meta: {
                        title: m.title,
                        icon: m.icon
                    },
                    children: []
                })
            }
        })
        if (a.children.length > 0) {
            a.children.forEach(b => {
                data.forEach(m => {
                    if (
                        b.id === m.parentId &&
                        (m.type === '0' || m.type === '1')
                    ) {
                        b.children.push({
                            id: m.id,
                            path: m.path,
                            component: () => import(`@/${m.component}`),
                            name: m.name,
                            meta: {
                                title: m.title,
                                icon: m.icon
                            },
                            children: []
                        })
                    }
                })
                if (b.children.length > 0) {
                    b.children.forEach(c => {
                        data.forEach(m => {
                            if (c.id === m.parentId) {
                                c.children.push({
                                    id: m.id,
                                    path: m.path,
                                    component: () => import(`@/${m.component}`),
                                    name: m.name,
                                    meta: {
                                        title: m.title,
                                        icon: m.icon
                                    },
                                    children: []
                                })
                            }
                        })
                    })
                }
            })
        }
    })
    asyncRouterMap.push({
        path: '*',
        redirect: '/404',
        hidden: true
    })
    Session.set('detailRouter', detailRouter)
    Session.set('reportMaps', reportMaps)
    return asyncRouterMap
}

/**
 * 格式化诊所参数信息
 * @param {*} data 诊所信息
 * @param {*} configList 需要更新诊所的参数信息
 */
export function formatClinic(data, configList) {
    const len = arguments.length
    const configs = {}
    let list = []
    if (len > 1) {
        list = configList
    } else {
        list = data && data.configList ? data.configList : []
    }
    if (list.length > 0) {
        list.forEach(item => {
            configs[item.code] = item
        })
    }
    data.configList = configs
    return data
}

/**
 * 打印页面数据
 * @param {String} content
 * @param {*} w
 * @param {*} h
 */
export function print(content, style, w = null, h = null) {
    const dualScreenLeft =
        window.screenLeft !== undefined ? window.screenLeft : screen.left
    const dualScreenTop =
        window.screenTop !== undefined ? window.screenTop : screen.top

    const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : screen.width
    const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : screen.height
    w = +w === 0 ? width : w
    h = +h === 0 ? height : h
    const left = width / 2 - w / 2 + dualScreenLeft
    const top = height / 2 - h / 2 + dualScreenTop
    var myWindow = window.open(
        '',
        '打印',
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' +
        w +
        ', height=' +
        h +
        ', top=' +
        top +
        ', left=' +
        left
    )
    myWindow.document.write(content + style)
    myWindow.focus()
    // myWindow.close()
    myWindow.document.close() // 关闭document的输出流, 显示选定的数据
    myWindow.print() // 打印当前窗口
    return myWindow
}
/**
 * Update by sunsj on 18/05/30
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if (('' + time).length === 10) {
            time = parseInt(time) * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        if (key === 'a') {
            return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
        }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}

export function formatTime(time) {
    if (!time) {
        return ''
    }

    const date1 = new Date(time.replace(/-/g, '/').replace(/\.0/g, ''))
    const date2 = new Date()
    const s1 = date1.getTime()
    const s2 = date2.getTime()
    const diff = (s2 - s1) / 1000
    if (diff < 30) {
        return '不超过1分钟'
    } else if (diff < 3600) {
        // less 1 hour
        return Math.ceil(diff / 60) + '分钟'
    } else if (diff < 3600 * 24) {
        return Math.ceil(diff / 3600) + '小时'
    } else if (diff < 3600 * 24 * 2) {
        return '1天'
    } else {
        return '超过2天'
    }
}

// 格式化时间
export function getQueryObject(url) {
    url = url == null ? window.location.href : url
    const search = url.substring(url.lastIndexOf('?') + 1)
    const obj = {}
    const reg = /([^?&=]+)=([^?&=]*)/g
    search.replace(reg, (rs, $1, $2) => {
        const name = decodeURIComponent($1)
        let val = decodeURIComponent($2)
        val = String(val)
        obj[name] = val
        return rs
    })
    return obj
}

/**
 *get getByteLen
 * @param {Sting} val input value
 * @returns {number} output value
 */
export function getByteLen(val) {
    let len = 0
    for (let i = 0; i < val.length; i++) {
        if (val[i].match(/[^\x00-\xff]/gi) != null) {
            len += 1
        } else {
            len += 0.5
        }
    }
    return Math.floor(len)
}

/**
 * 从对象中删除指定key值
 * @export
 * @param {*} obj
 * @param {*} arr
 */
export function deleteKeys(obj, arr) {
    if (!obj || obj.constructor !== Object) {
        return
    }
    if (!arr || arr.constructor !== Array || arr.constructor !== String) {
        return
    }
    if (arr.constructor === Array) {
        arr.forEach(key => {
            if (obj[key]) {
                delete obj[key]
            }
        })
    } else {
        if (obj[arr]) {
            delete obj[arr]
        }
    }
    return obj
}

/**
 * 清空数组
 * @param {*} Arr
 */
export function cleanArray(actual) {
    const newArray = []
    for (let i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i])
        }
    }
    return newArray
}

/**
 * 对象转换成key value 编码字符串
 * @export
 * @param {*} json 传入待转换json对象
 * @returns
 */
export function param(json) {
    if (!json) return ''
    return cleanArray(
        Object.keys(json).map(key => {
            if (json[key] === undefined) return ''
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
        })
    ).join('&')
}

/**
 * 格式化参数
 * @param {String} str 待格式化的字符串
 * @param {*} type 字符串类型（type === 'url' 网址参数）
 */
export function param2Obj(str, type = 'params') {
    if (type === 'url') {
        str = str.split('?')[1]
    }
    if (!str) {
        return {}
    }
    return JSON.parse(
        '{"' +
        decodeURIComponent(str)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') +
        '"}'
    )
}

export function html2Text(val) {
    const div = document.createElement('div')
    div.innerHTML = val
    return div.textContent || div.innerText
}

export function objectMerge(target, source) {
    /* Merges two  objects,
     giving the last one precedence */

    if (typeof target !== 'object') {
        target = {}
    }
    if (Array.isArray(source)) {
        return source.slice()
    }
    Object.keys(source).forEach(property => {
        const sourceProperty = source[property]
        if (typeof sourceProperty === 'object') {
            target[property] = objectMerge(target[property], sourceProperty)
        } else {
            target[property] = sourceProperty
        }
    })
    return target
}

export function scrollTo(element, to, duration) {
    if (duration <= 0) return
    const difference = to - element.scrollTop
    const perTick = (difference / duration) * 10
    setTimeout(() => {
        element.scrollTop = element.scrollTop + perTick
        if (element.scrollTop === to) return
        scrollTo(element, to, duration - 10)
    }, 10)
}

export function toggleClass(element, className) {
    if (!element || !className) {
        return
    }
    let classString = element.className
    const nameIndex = classString.indexOf(className)
    if (nameIndex === -1) {
        classString += '' + className
    } else {
        classString =
            classString.substr(0, nameIndex) +
            classString.substr(nameIndex + className.length)
    }
    element.className = classString
}

/**
 * 日期范围
 * disabledDate 不可选范围
 * shortcuts 快捷选中
 */
export const pickerOptions = {
    // disabledDate(time) {
    //     return time.getTime() > Date.now() - 8.64e6
    // },
    disabledDate(time) {
        return time.getTime() > Date.now()
    },
    shortcuts: [{
        text: '最近一周',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
        }
    },
    {
        text: '最近一个月',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
        }
    },
    {
        text: '最近三个月',
        onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
        }
    }
    ]
}

export const disabledPickerOptsAfter = {
    disabledDate(time) {
        return time.getTime() <= Date.now() - 8.64e6 - 3600 * 1000 * 24
    }
}
export const disabledPickerOpts = {
    disabledDate(time) {
        return time.getTime() > Date.now() - 8.64e6
    }
}

// 格式化时间(只能选之前的)
export const defaultPickOpts = {
    opts: {
        disabledDate(time) {
            return time.getTime() > Date.now() - 8.64e6
        }
    },
    opts2: pickerOptions,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd 00:00:00'
}

// 格式化时间(只能选之后的)
export const defaultPickOptsAfter = {
    opts: {
        disabledDate(time) {
            return time.getTime() < Date.now() - 8.64e7
        }
    },
    opts2: pickerOptions,
    format: 'yyyy-MM-dd',
    valueFormat: 'yyyy-MM-dd 00:00:00'
}

export function getTime(type) {
    if (type === 'start') {
        return new Date().getTime() - 3600 * 1000 * 24 * 90
    } else {
        return new Date(new Date().toDateString())
    }
}

export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result

    const later = function() {
        // 据上一次触发时间间隔
        const last = +Date.now() - timestamp

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last)
        } else {
            timeout = null
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args)
                if (!timeout) {
                    context = args = null
                }
            }
        }
    }

    return function(...args) {
        context = this
        timestamp = +Date.now()
        const callNow = immediate && !timeout
        // 如果延时不存在，重新设定延时
        if (!timeout) {
            timeout = setTimeout(later, wait)
        }
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}

// 深复制
export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'shallowClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = source[keys].constructor === Array ? [] : {}
            targetObj[keys] = deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
    })
    return targetObj
}

/**
 * 格式化年龄
 * 入参 总天数 days
 * 1、小于三个月的显示几周几天，(days<3*30)
 * 2、小于1岁的显示几月龄几天，	(3*30<=days<1*365)
 * 3、大于一岁的显示几岁几月龄，(1*365<=days<6*365)
 * 4、大于六岁的只显示岁。		(days>=6*365)
 */
// export function getBabyAge(birthDay) {
//     if (!birthDay) {
//         return ''
//     }
//     const date1 = new Date(birthDay.replace(/-/g, '/').replace(/\.0/g, ''))

//     // 当前时间
//     const date2 = new Date()

//     const s1 = date1.getTime()

//     const s2 = date2.getTime()
//     const total = (s2 - s1) / 1000
//     const days = parseInt(total / (24 * 60 * 60)) // 两日期之间的差（天数）
//     let age = ''
//     if (days < 3 * 30) {
//         const week = parseInt(days / 7)
//         const day = parseInt(days % 7)
//         if (week !== 0) age += week + '周'
//         else {
//             if (day !== 0) age += day + '天'
//             else age += day + '天'
//         }
//         // age += day + '天'
//     } else if (days < 1 * 365) {
//         const month = parseInt(days / 30.4)
//         const day = parseInt(days % 30.4)
//         if (month !== 0) age += month + '月龄'
//         if (day !== 0) age += day + '天'
//     } else if (days < 6 * 365) {
//         const year = parseInt(days / 365)
//         const month = parseInt((days % 365) / 30.4)
//         if (year !== 0) age += year + '岁'
//         if (month !== 0) age += month + '月龄'
//     } else {
//         let year = parseInt(days / 365)
//         const yu = days % 365
//         year = yu > 0 ? year + 1 : year // 超过17岁都按18岁算
//         if (year !== 0) age += year + '岁'
//     }
//     return age
// }

export function getBabyAge(beginStr) {
    if (!beginStr) return ''
    var reg = new RegExp(
        /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})(\s)(\d{1,2})(:)(\d{1,2})(:{0,1})(\d{0,2})$/
    )
    var beginArr = ''
    if (beginStr.length == 10) {
        beginStr += ' 00:00:00'
    }
    beginArr = beginStr.match(reg)
    const endStr = getCurrentDay()
    var endArr = endStr.match(reg)
    var days = 0
    var month = 0
    var year = 0
    days = endArr[4] - beginArr[4]
    if (days < 0) {
        month = -1
        days = 30 + days
    }

    month = month + (endArr[3] - beginArr[3])
    if (month < 0) {
        year = -1
        month = 12 + month
    }

    year = year + (endArr[1] - beginArr[1])

    var yearString = year > 0 ? year + '岁' : ''
    var mnthString = month > 0 ? month + '月' : ''
    var dayString = days > 0 ? days + '天' : ''

    /*
     * 1 如果岁 大于等于1 那么年龄取 几岁 2 如果 岁等于0 但是月大于1 那么如果天等于0天小于3天 取小时
     * 例如出生2天 就取 48小时
     */
    var result = ''
    if (year >= 1) {
        result = yearString + mnthString
    } else {
        if (month >= 1) {
            result = days > 0 ? mnthString + dayString : mnthString
        } else {
            var begDate = new Date(
                beginArr[1],
                beginArr[3] - 1,
                beginArr[4],
                beginArr[6],
                beginArr[8],
                beginArr[10]
            )
            var endDate = new Date(
                endArr[1],
                endArr[3] - 1,
                endArr[4],
                endArr[6],
                endArr[8],
                endArr[10]
            )

            var between = (endDate.getTime() - begDate.getTime()) / 1000
            days = Math.floor(between / (24 * 3600))
            var hours = Math.floor(between / 3600 - days * 24)
            dayString = days > 0 ? days + '天' : ''
            result = days >= 3 ? dayString : days * 24 + hours + '小时'
        }
    }

    return result
}

/*
 * JSON数组去重
 * @param: [array] json Array
 * @param: [string] 唯一的key名，根据此键名进行去重
 */
export function uniqueArray(array, key) {
    var result = [array[0]]
    for (var i = 1; i < array.length; i++) {
        var item = array[i]
        var repeat = false
        for (var j = 0; j < result.length; j++) {
            if (item[key] === result[j][key]) {
                repeat = true
                break
            }
        }
        if (!repeat) {
            result.push(item)
        }
    }
    return result
}

export function isNotANumber(inputData) {
    // isNaN(inputData)不能判断空串或一个空格
    // 如果是一个空串或是一个空格，而isNaN是做为数字0进行处理的，而parseInt与parseFloat是返回一个错误消息，这个isNaN检查不严密而导致的。
    if (parseFloat(inputData).toString() === 'NaN') {
        // alert("请输入数字……");注掉，放到调用时，由调用者弹出提示。
        return false
    } else {
        return true
    }
}

/*
    json对象是否相等
 */
export function compareJson(x, y) {
    var i, l, leftChain, rightChain

    function compare2Objects(x, y) {
        var p
        if (
            isNaN(x) &&
            isNaN(y) &&
            typeof x === 'number' &&
            typeof y === 'number'
        ) {
            return true
        }
        if (x === y) {
            return true
        }

        if (
            (typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)
        ) {
            return x.toString() === y.toString()
        }

        if (!(x instanceof Object && y instanceof Object)) {
            return false
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false
        }

        if (x.constructor !== y.constructor) {
            return false
        }

        if (x.prototype !== y.prototype) {
            return false
        }

        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false
        }

        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false
            } else if (typeof y[p] !== typeof x[p]) {
                if (
                    !(
                        (x[p] === '' && y[p] == null) ||
                        (y[p] === '' && x[p] == null)
                    ) &&
                    x[p] != y[p]
                ) {
                    return false
                }
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false
            } else if (typeof y[p] !== typeof x[p]) {
                if (
                    !(
                        (x[p] === '' && y[p] == null) ||
                        (y[p] === '' && x[p] == null)
                    ) &&
                    x[p] != y[p]
                ) {
                    return false
                }
            }
            if (
                !(
                    (x[p] === '' && y[p] == null) ||
                    (y[p] === '' && x[p] == null)
                )
            ) {
                switch (typeof x[p]) {
                    case 'object':
                    case 'function':
                        leftChain.push(x)
                        rightChain.push(y)

                        if (!compare2Objects(x[p], y[p])) {
                            return false
                        }

                        leftChain.pop()
                        rightChain.pop()
                        break

                    default:
                        if (x[p] != y[p]) {
                            return false
                        }
                        break
                }
            }
        }
        return true
    }

    if (arguments.length < 1) {
        return true
    }

    for (i = 1, l = arguments.length; i < l; i++) {
        leftChain = []
        rightChain = []

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false
        }
    }

    return true
}

// 密码强度校验
export function passwdVailid(value) {
    return new Promise((resolve, reject) => {
        if (!value) {
            reject('密码不能为空！')
        } else if (value.length < 8) {
            reject('密码长度不能小于8位！')
        } else if (value.length >= 8 && value.length <= 20) {
            let num = 0
            if (value.match(/\d+/g)) {
                num++
            }
            if (value.match(/[a-z]+/g)) {
                num++
            }
            if (value.match(/[A-Z]+/g)) {
                num++
            }
            if (value.match(/[!@$%*()_+-\/,<.>?]/g)) {
                num++
            }
            if (num >= 2) {
                resolve()
            } else {
                reject('至少包含大小写字母、数字及特殊符号中的两种')
            }
            // if (value.match(/\d+/g) && value.match(/[a-z]+/g) && value.match(/[A-Z]+/g) && value.match(/[!@$%*()_+-=~\/,<.>?]/g)) {
            //     resolve()
            // } else {
            //     reject('密码必须包含大小写、数字及特殊符号！')
            // }
        } else if (value.length > 20) {
            reject('密码长度不能大于20位！')
        }
    })
}

// 根据json数组中的json属性分类
// var map = {}
// var dest = []
// for (var i = 0; i < d.collectMap[key].length; i++) {
//     var ai = d.collectMap[key][i]
//     if (!map[ai.groupSn]) {
//         dest.push({
//             groupSn: ai.groupSn,
//             data: [ai]
//         })
//         map[ai.groupSn] = ai
//     } else {
//         for (var j = 0; j < dest.length; j++) {
//             var dj = dest[j]
//             if (dj.groupSn == ai.groupSn) {
//                 dj.data.push(ai)
//                 break
//             }
//         }
//     }
// }

// 共通方法
const commonUtil = {
    // 获取字典数据
    getDictData() {
        return store.getters.dictData
    },

    // 获取文件大小
    getFileSize(fileByte) {
        var fileSizeByte = fileByte
        var fileSizeMsg = ''
        if (fileSizeByte < 1048576) {
            fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + 'KB'
        } else if (fileSizeByte == 1048576) {
            fileSizeMsg = '1MB'
        } else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) {
            fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + 'MB'
        } else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) {
            fileSizeMsg = '1GB'
        } else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) {
            fileSizeMsg =
                (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
        } else fileSizeMsg = '文件超过1TB'
        return fileSizeMsg
    },

    // 获取日期 -昨天、前天、今天（时分秒）
    isYesterday(str) {
        if (str) {
            var d = new Date(str.replace(/-/g, '/'))
            var preDate = new Date(new Date() - 24 * 60 * 60 * 1000) // 前一天
            if (d.setHours(0, 0, 0, 0) == preDate.setHours(0, 0, 0, 0)) {
                return '昨天'
            } else if (
                d.setHours(0, 0, 0, 0) ==
                new Date(new Date() - 24 * 60 * 60 * 1000 * 2).setHours(
                    0,
                    0,
                    0,
                    0
                )
            ) {
                return '前天'
            } else if (
                d.setHours(0, 0, 0, 0) ==
                new Date(new Date()).setHours(0, 0, 0, 0)
            ) {
                return str.split(' ')[1]
            } else {
                return str
            }
        } else {
            return ''
        }
    },

    getConfigValue(key) {
        const configList = store.getters.clinic.configList
        if (!configList || configList.length === 0) {
            return null
        }
        if (!configList[key]) {
            return null
        }
        return configList[key].actualValue || configList[key].defaultValue
    },
    // 获取星期几
    getWeekDay() {
        const week = new Date().getDay()
        switch (week) {
            case 0:
                return '日'
            case 1:
                return '一'
            case 2:
                return '二'
            case 3:
                return '三'
            case 4:
                return '四'
            case 5:
                return '五'
            case 6:
                return '六'
        }
    },

    // 获取两个日期差
    getDateMinus(str1, str2) {
        var date1 = new Date(str1)
        var date2 = new Date(str2)
        const day = (date2 - date1) / (60 * 60 * 24 * 1000)
        return Math.floor(day / 30)
    },

    getExplorer() {
        const explorer = window.navigator.userAgent
        const compare = function(s) {
            return explorer.indexOf(s) >= 0
        }
        const ie11 = (function() {
            return 'ActiveXObject' in window
        })()
        if (compare('MSIE') || ie11) {
            return 'ie'
        } else if (compare('Firefox') && !ie11) {
            return 'Firefox'
        } else if (compare('Chrome') && !ie11) {
            if (explorer.indexOf('Edge') > -1) {
                return 'Edge'
            } else {
                return 'Chrome'
            }
        } else if (compare('Opera') && !ie11) {
            return 'Opera'
        } else if (compare('Safari') && !ie11) {
            return 'Safari'
        }
    },

    // 数字转化为中文大写
    toChineseNum(num) {
        const changeNum = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] // changeNum[0] = "零"
        const unit = ['', '拾', '佰', '仟', '万', '亿']
        const smallUnit = ['角', '分']
        // num = parseInt(num)
        const transform1 = (temp, str = '') => {
            const tempArr = temp.toString().split('').reverse()
            for (var i = tempArr.length - 1; i >= 0; i--) {
                str += tempArr[i] == 0 ? changeNum[tempArr[i]] : changeNum[tempArr[i]] + unit[i]
            }
            return str
        }
        const transform2 = (temp, str = '') => {
            const tempArr = temp.toString()
            for (var i = 0; i < tempArr.length; i++) {
                str += tempArr[i] == 0 ? changeNum[tempArr[i]] : changeNum[tempArr[i]] + smallUnit[i]
            }
            return str
        }
        const integer = transform1(parseInt(num))
        let decimal = ''
        if (num.toString().indexOf('.') > -1) {
            decimal = transform2(parseInt(num.toString().split('.')[1]))
        }
        const str = num.toString().indexOf('.') > -1 ? integer + '圆' + decimal : integer + '圆整'
        return str
    }
}

export default commonUtil
