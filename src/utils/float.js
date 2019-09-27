/*
 * 判断obj是否为一个整数
 */
function isInteger(obj) {
    return Math.floor(obj) === obj
}

/*
 * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
 * @param floatNum {number} 小数
 * @return {object}
 *   {times:100, num: 314}
 */
function toInteger(floatNum) {
    var ret = {
        times: 1,
        num: 0
    }
    if (isInteger(floatNum)) {
        ret.num = floatNum
        return ret
    }
    var strfi = floatNum + ''
    var dotPos = strfi.indexOf('.')
    var len = strfi.substr(dotPos + 1).length
    var times = Math.pow(10, len)
    var intNum = parseInt(floatNum * times + 0.5, 10)
    ret.times = times
    ret.num = intNum
    return ret
}

/*
 * 核心方法，实现加减乘除运算，确保不丢失精度
 * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
 *
 * @param a {number} 运算数1
 * @param b {number} 运算数2
 * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
 * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
 *
 */
function operation(a, b, digits, op) {
    var o1 = toInteger(a)
    var o2 = toInteger(b)
    var n1 = o1.num
    var n2 = o2.num
    var t1 = o1.times
    var t2 = o2.times
    var max = t1 > t2 ? t1 : t2
    var result = null
    switch (op) {
        case 'add':
            if (t1 === t2) {
                // 两个小数位数相同
                result = n1 + n2
            } else if (t1 > t2) {
                // o1 小数位 大于 o2
                result = n1 + n2 * (t1 / t2)
            } else {
                // o1 小数位 小于 o2
                result = n1 * (t2 / t1) + n2
            }
            return result / max
        case 'subtract':
            if (t1 === t2) {
                result = n1 - n2
            } else if (t1 > t2) {
                result = n1 - n2 * (t1 / t2)
            } else {
                result = n1 * (t2 / t1) - n2
            }
            return result / max
        case 'multiply':
            result = (n1 * n2) / (t1 * t2)
            return result
        case 'divide':
            result = (n1 / n2) * (t2 / t1)
            return result
    }
}

// 加减乘除的四个接口（不要用于循环）
export function add(a, b, digits) {
    return operation(a, b, digits, 'add')
}

export function subtract(a, b, digits) {
    return operation(a, b, digits, 'subtract')
}

export function multiply(a, b, digits) {
    return operation(a, b, digits, 'multiply')
}

export function divide(a, b, digits) {
    return operation(a, b, digits, 'divide')
}

// toFixed 修复
export function toFixed(num, s = 2) {
    const times = Math.pow(10, s)
    let des = num * times
    des = des > 0 ? add(des, 0.5) : subtract(des, 0.5)
    return parseInt(des, 10) / times
}

/**
 * 精度取舍规则
 * @export
 * 1. 四舍五入到角
 * 2. 直接进位到5角
 * 3. 直接抹零到元
 * 4. 四舍五入到元（直接四舍五入）
 * 5. 直接进位到元
 * 6. 直接保留到角
 * 7. 直接保留到分
 * @param {*} num 待转化数字
 * @param {*} n
 * @returns
 */
export function getFloat(num, n) {
    if (n.constructor === String) {
        n = n ? parseInt(n) : 0
        if (n <= 0) return Math.round(num)
        if (n === 1) {
            return Math.round(multiply(num, 10)) / 10
        } else if (n === 2) {
            return Math.floor(num) + 0.5
        } else if (n === 3) {
            return Math.floor(num)
        } else if (n === 4) {
            return Math.round(num)
        } else if (n === 5) {
            return Math.ceil(num)
        } else if (n === 6) {
            return isInteger(multiply(num, 10))
                ? num
                : (Math.floor(multiply(num, 10)) + 1) / 10
        } else if (n === 7) {
            return isInteger(multiply(num, 100))
                ? num
                : (Math.floor(multiply(num, 100)) + 1) / 100
        }
    } else {
        n = n ? parseInt(n) : 0
        return Math.round(multiply(num, Math.pow(10, n))) / Math.pow(10, n)
    }
}
