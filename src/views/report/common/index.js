import { toFixed, getFloat } from '@/utils/float'
import { getCurrentDay } from '@/utils/common'
// 获取打印合计
export function getTotalRow(columns, listData) {
    const total = []
    if (columns.length > 0) {
        columns.forEach((column, index) => {
            if (index === 0) {
                total[index] = '合计'
                return
            } else {
                if (column.count) {
                    const values = listData.map(item => Number(item[column.value]))
                    if (!values.every(value => isNaN(value))) {
                        total[index] = toFixed(values.reduce((prev, curr) => {
                            const value = Number(curr)
                            if (!isNaN(value)) {
                                return prev + curr
                            } else {
                                return prev
                            }
                        }, 0), 4)
                    } else {
                        total[index] = ''
                    }
                } else {
                    total[index] = ''
                    return
                }
            }
        })
    }
    return total
}

/**
 * 合计表格
 *
 * @export
 * @param {*} param
 * @param {*} currentColumns
 * @param {number} [disLocation=0] 错位值（针对有序号的表格，合计时需要+1）
 * @returns
 */
export function getTabTotalRow(param, currentColumns, disLocation = 0) {
    const { columns, data } = param
    const sums = []
    if (columns && columns.length > 0) {
        currentColumns.forEach((column, index) => {
            columns[index + disLocation].count = column.count || false
        })
        columns.forEach((column, index) => {
            if (index === 0) {
                sums[index] = '合计'
                return
            }
            if (column.count) {
                const values = data.map(item => Number(item[column.property]))
                if (!values.every(value => isNaN(value))) {
                    sums[index] = getFloat(values.reduce((prev, curr) => {
                        const value = Number(curr)
                        if (!isNaN(value)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0), 2) // toFixed()
                }
            } else {
                sums[index] = ''
                return
            }
        })
        return sums
    }
}

// 列合并
export function getColSpan(param, arr) {
    const { rowIndex, columnIndex } = param
    if (columnIndex === 0) {
        const _row = arr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
            rowspan: _row,
            colspan: _col
        }
    }
}

// 打印
export function handlePrint({ list, columns, data, total, orgName, title }, complex = false) {
    let tbody = ''
    if (list && list.length > 0) {
        let max = 0
        list.forEach(item => {
            if (max < item.columns.length) {
                max = item.columns.length
            }
        })
        list.forEach(item => {
            let tb = '<tr>'
            const len = item.columns.length
            const count = max - len
            const colspan = count > 0 ? count + 1 : 0
            item.columns.forEach((col, index) => {
                if (index === len - 1) {
                    tb += '<th colspan="' + colspan + '">' + col.label + '</th>'
                } else {
                    tb += '<th>' + col.label + '</th>'
                }
            })
            tb += '</tr>'
            if (item.data.length > 0) {
                item.data.forEach(data => {
                    tb += '<tr>'
                    item.columns.forEach((col, index) => {
                        const td = col.value ? data[col.value] : ''
                        if (index === len - 1) {
                            tb += '<td colspan="' + colspan + '">' + td + '</td>'
                        } else {
                            tb += '<td>' + td + '</td>'
                        }
                    })
                    tb += '</tr>'
                })
                if (!total) return false
                tb += '<tr>'
                item.total.forEach((total, index) => {
                    if (index === len - 1) {
                        tb += '<td class="total" colspan="' + colspan + '">' + total + '</td>'
                    } else {
                        tb += '<td class="total">' + total + '</td>'
                    }
                })
                tb += '</tr>'
            } else {
                tb += '<tr><td colspan="' + max + '">暂无数据</td></tr>'
            }
            tbody += tb
        })
    } else {
        const len = columns.length
        if (complex) {
            tbody += '<tr>'
            for (let i = 0; i < len; i++) {
                if (columns[i].complex) {
                    tbody += '<th colspan="2">' + columns[i].label + '</th>'
                } else {
                    tbody += '<th rowspan="2">' + columns[i].label + '</th>'
                }
            }
            tbody += '</tr><tr>'
            for (let i = 0; i < len; i++) {
                if (columns[i].complex && columns[i].list && columns[i].list.length > 0) {
                    columns[i].list.forEach(item => {
                        tbody += '<th>' + item.label + '</th>'
                    })
                }
            }
            tbody += '</tr>'
            const finalColumns = []
            columns.forEach(item => {
                if (item.complex && item.list && item.list.length > 0) {
                    item.list.forEach(c2 => {
                        finalColumns.push({
                            value: c2.value,
                            label: c2.label
                        })
                    })
                    return false
                }
                finalColumns.push({
                    value: item.value,
                    label: item.label
                })
            })
            columns = finalColumns
        } else {
            tbody += '<tr>'
            for (let i = 0; i < len; i++) {
                tbody += '<th>' + columns[i].label + '</th>'
            }
            tbody += '</tr>'
        }

        if (data && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                tbody += '<tr>'
                for (let j = 0; j < columns.length; j++) {
                    const td = columns[j].value ? data[i][columns[j].value] !== undefined && data[i][columns[j].value] !== null ? data[i][columns[j].value] : '' : ''
                    tbody += '<td>' + td + '</td>'
                }
                tbody += '</tr>'
            }
            if (!total) return false
            tbody += '<tr>'
            for (let i = 0; i < total.length; i++) {
                tbody += '<td class="total">' + total[i] + '</td>'
            }
            tbody += '</tr>'
        } else {
            tbody += '<tr><td colspan="' + len + '">暂无数据</td></tr>'
        }
    }

    const newContent = `
        <div class='printReport'>
            <p>${orgName}</p>
            <p>${title}</p>
            <table cellpadding="0" cellspacing="0">${tbody}</table>
            <div class="print-date">
                打印日期：${getCurrentDay()}
            </div>
        </div>
    `
    var style = `
            <style type='text/css'>
                body{
                    width:108% !important;
                }
            </style>`
    const oldContent = document.body.innerHTML
    document.body.innerHTML = newContent + style

    window.print()
    window.location.reload()
    document.body.innerHTML = oldContent
    return false
}
