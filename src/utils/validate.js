/**
 * Update by sunsj on 18/06/01.
 */

/* 合法uri*/
export function validateURL(textval) {
    const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return urlregex.test(textval)
}

/* 小写字母*/
export function validateLowerCase(str) {
    const reg = /^[a-z]+$/
    return reg.test(str)
}

/* 大写字母*/
export function validateUpperCase(str) {
    const reg = /^[A-Z]+$/
    return reg.test(str)
}

/* 大小写字母*/
export function validateAlphabets(str) {
    const reg = /^[A-Za-z]+$/
    return reg.test(str)
}

/**
 * validate email
 * @param email
 * @returns {boolean}
 */
export function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
}

/**
 * validate phone by juejin
 * @param phone
 * @returns {boolean}
 * 时间截止 2018年1月11日
 * 移动号段：134 135 136 137 138 139 147 148 150 151 152 157 158 159 172 178 182 183 184 187 188 198
 * 联通号段：130 131 132 145 146 155 156 166 171 175 176 185 186
 * 电信号段：133 149 153 173 174 177 180 181 189 199
 * 虚拟运营商：170
 */
export function validatePhone(phone) {
    const reg = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/
    return reg.test(phone)
}

/**
 * validate password
 * 密码正则，以字母开头，长度在6~18之间，只能包含字母、数字和下划线
 * @param password
 * @returns {boolean}
 */
export function validatePasswordEasy(password) {
    const reg = /^[a-zA-Z]\w{5,17}$/
    return reg.test(password)
}

/**
 * validate password
 * 强密码正则，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
 * @param password
 * @returns {boolean}
 */
export function validatePasswordHard(password) {
    const reg = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/
    return reg.test(password)
}
