// 获得当前日期
export function getCurrentDay() {
    const date = new Date()
    const temp = ' ' +
        (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) +
        ':' +
        (date.getMinutes() > 9
            ? date.getMinutes()
            : '0' + date.getMinutes()) +
        ':' +
        (date.getSeconds() > 9
            ? date.getSeconds()
            : '0' + date.getSeconds())
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

// 获得当前日期2
export function getCurrentDay2() {
    const date = new Date()
    const temp = ' ' +
        (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) +
        ':' +
        (date.getMinutes() > 9
            ? date.getMinutes()
            : '0' + date.getMinutes())
    return {
        date: (date.getFullYear() +
            '年' +
            (date.getMonth() + 1 > 9
                ? date.getMonth() + 1
                : '0' + (date.getMonth() + 1)) +
            '月' +
            (date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) + '日'),
        time: temp
    }
}

// 获得上一周或者下一周，flag为true时为上一周
export function getSevenDays(date, flag) {
    let dateTime = ''
    if (date.toString().split(' ').length > 1) {
        dateTime = date.split(' ')[1]
    } else {
        dateTime = ''
    }
    if (!(date instanceof Date)) {
        date = new Date(date.replace(/-/g, '/'))
    }
    var timestamp = date.getTime()
    var newDate = flag
        ? new Date(timestamp - 7 * 24 * 3600 * 1000)
        : new Date(timestamp + 7 * 24 * 3600 * 1000)
    var month = newDate.getMonth() + 1
    month = month.toString().length === 1 ? '0' + month : month
    var day =
        newDate.getDate().toString().length === 1
            ? '0' + newDate.getDate()
            : newDate.getDate()
    if (date.toString().split(' ').length > 1) {
        return [newDate.getFullYear(), month, day].join('-') + ' ' + dateTime
    } else {
        return [newDate.getFullYear(), month, day].join('-')
    }
}

// 获得90天后日期
export function getNinetyDays(date) {
    let dateTime = ''
    if (date.toString().split(' ').length > 1) {
        dateTime = date.split(' ')[1]
    } else {
        dateTime = ''
    }
    if (!(date instanceof Date)) {
        date = new Date(date.replace(/-/g, '/'))
    }
    var timestamp = date.getTime()
    var newDate = new Date(timestamp + 90 * 24 * 3600 * 1000)
    var month = newDate.getMonth() + 1
    month = month.toString().length === 1 ? '0' + month : month
    var day =
        newDate.getDate().toString().length === 1
            ? '0' + newDate.getDate()
            : newDate.getDate()
    if (date.toString().split(' ').length > 1) {
        return [newDate.getFullYear(), month, day].join('-') + ' ' + dateTime
    } else {
        return [newDate.getFullYear(), month, day].join('-')
    }
}

// 字符串转日期
export function string2Date(str) {
    if (str.match(/^\d{4}[\-\/\s+]\d{1,2}[\-\/\s+]\d{1,2}$/)) {
        return new Date(str.replace(/[\-\/\s+]/i, '/'))
    } else if (str.match(/^\d{8}$/)) {
        return new Date(
            str.substring(0, 4) +
            '/' +
            str.substring(4, 6) +
            '/' +
            str.substring(6)
        )
    } else {
        return '时间转换发生错误！'
    }
}

// 根据生日计算年龄
export function getAgeByBrithday(birth) {
    let age = -1
    const today = new Date()
    const todayYear = today.getFullYear()
    const todayMonth = today.getMonth() + 1
    const todayDay = today.getDate()
    const birthday = string2Date(birth)
    if (birthday !== '时间转换发生错误！') {
        const birthdayYear = birthday.getFullYear()
        const birthdayMonth = birthday.getMonth()
        const birthdayDay = birthday.getDate()
        if (todayYear - birthdayYear < 0) {
            this.$message.error('出生日期选择错误!')
        } else {
            if (todayMonth * 1 - birthdayMonth * 1 < 0) {
                age = todayYear * 1 - birthdayYear * 1 - 1
            } else {
                if (todayDay - birthdayDay >= 0) {
                    age = todayYear * 1 - birthdayYear * 1
                } else {
                    age = todayYear * 1 - birthdayYear * 1 - 1
                }
            }
        }
        return age * 1
    } else {
        return -1
    }
}

// 删除json中空字符串
export function deleteEmptyProperty(object) {
    for (var i in object) {
        var value = object[i]
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    delete object[i]
                    continue
                }
            }
            deleteEmptyProperty(value)
            if (isEmpty(value)) {
                delete object[i]
            }
        } else {
            if (value === '' || value === null || value === undefined) {
                delete object[i]
            }
        }
    }
}

function isEmpty(object) {
    for (var name in object) {
        return false
    }
    return true
}
