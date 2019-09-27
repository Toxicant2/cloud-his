let a_idx = 0
function animate(obj, json, interval, sp, fn) {
    clearInterval(obj.timer)
    // var k = 0;
    // var j = 0;
    function getStyle(obj, arr) {
        if (obj.currentStyle) {
            return obj.currentStyle[arr] // 针对ie
        } else {
            return document.defaultView.getComputedStyle(obj, null)[arr]
        }
    }
    obj.timer = setInterval(function() {
        // j ++;
        var flag = true
        for (var arr in json) {
            var icur = 0
            // k++;
            if (arr === 'opacity') {
                icur = Math.round(parseFloat(getStyle(obj, arr)) * 100)
            } else {
                icur = parseInt(getStyle(obj, arr))
            }
            var speed = (json[arr] - icur) * sp
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
            if (icur !== json[arr]) {
                flag = false
            }
            if (arr === 'opacity') {
                obj.style.filter = "alpha(opacity : '+(icur + speed)+' )"
                obj.style.opacity = (icur + speed) / 100
            } else {
                obj.style[arr] = icur + speed + 'px'
            }
        }

        if (flag) {
            clearInterval(obj.timer)
            if (fn) {
                fn()
            }
        }
    }, interval)
}
export default {
    bind(el, binding) {
        el.addEventListener('click', e => {
            var a = [
                '❤民主❤',
                '❤富强❤',
                '❤和平❤',
                '❤友善❤',
                '❤公众号❤',
                '❤点赞❤',
                '❤打赏❤',
                '❤come on❤',
                '❤推荐一下❤',
                '❤支持一下❤',
                '❤关注我❤',
                '❤加油❤'
            ]
            var $i = document.createElement('span')
            $i.innerText = a[a_idx]
            a_idx = (a_idx + 1) % a.length
            const x = e.pageX
            const y = e.pageY
            $i.style.zIndex = 9999999999
            $i.style.top = `${y - 20}px`
            $i.style.left = `${x}px`
            $i.style.position = 'absolute'
            $i.style.fontWeight = 'bold'
            $i.style.color = 'rgb(' + ~~(255 * Math.random()) + ',' + ~~(255 * Math.random()) + ',' + ~~(255 * Math.random()) + ')'

            document.body.append($i)
            animate($i, {
                'top': y - 180,
                'opacity': 0
            }, 15, 0.01, function() {
                $i.remove()
            })
        }, false)
    }
}
