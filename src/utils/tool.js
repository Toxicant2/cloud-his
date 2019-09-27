/**
 * @desc 函数防抖
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
export function debounce(func, wait, immediate) {
    let timeout

    return function() {
        const that = this
        const args = arguments

        if (timeout) clearTimeout(timeout)
        if (immediate) {
            var callNow = !timeout
            timeout = setTimeout(() => {
                timeout = null
            }, wait)
            if (callNow) func.apply(that, args)
        } else {
            timeout = setTimeout(function() {
                func.apply(that, args)
            }, wait)
        }
    }
}

/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param type 1 表时间戳版，2 表定时器版
 */
export function throttle(func, wait, type) {
    let previous = 0
    let timeout
    return function() {
        const that = this
        const args = arguments
        if (type === 1) {
            const now = Date.now()

            if (now - previous > wait) {
                func.apply(that, args)
                previous = now
            }
        } else if (type === 2) {
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null
                    func.apply(that, args)
                }, wait)
            }
        }
    }
}
