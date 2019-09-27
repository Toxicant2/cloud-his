export default {
    bind(el, binding, vnode) {
        const inputs = el.querySelectorAll('.el-input input')
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].setAttribute('keyFocusIndex', i)
            inputs[i].addEventListener('keyup', ev => {
                if (ev.keyCode === 13) {
                    // const targetTo = ev.srcElement.getAttribute('keyFocusTo')
                    // console.log(targetTo)
                    // if (targetTo) {
                    //     this.$refs[targetTo].$el.focus()
                    // } else {
                    var attrIndex = ev.srcElement.getAttribute('keyFocusIndex')
                    var ctlI = parseInt(attrIndex)
                    if (ctlI < inputs.length - 1) {
                        inputs[ctlI + 1].focus()
                    }
                    // }
                    // ev.returnValue = false
                }
            })
        }
    }
}
