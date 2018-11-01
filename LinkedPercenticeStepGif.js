const w = 500, h = 500
const nodes = 5
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
        }
    }
}

class PSNode {
    constructor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new PSNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        const gap = w / (nodes + 1)
        const size = gap / 3
        const r = size / 3
        context.save()
        context.translate(gap * this.i + gap, h/2)
        context.save()
        context.rotate(Math.PI/12)
        context.beginPath()
        context.moveTo(0, -size)
        context.lineTo(0, size)
        context.stroke()
        context.restore()
        for (var j = 0; j < 2; j++) {
            const sc = Math.min(0.5, Math.max(this.state.scale - 0.5 * j, 0)) * 2
            context.save()
            context.rotate(Math.PI * j)
            context.translate(size/4, size/4)
            for(var k = 0; k <= 360 * sc; k++) {
                const x = r * Math.cos(k * Math.PI/180), y = r * Math.sin(k * Math.PI/180)
                context.beginPath()
                if (k == 0) {
                    context.moveTo(x, y)
                } else {
                    context.lineTo(x, y)
                }
            }
            context.stroke()
            context.restore()
        }
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedPerecentileStep {
    constructor() {
        this.root = new PSNode(0)
        this.curr = this.root
        this.dir = 1
        this.curr.startUpdating()
    }

    draw(context) {
        this.root.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.dir == 1 && this.curr.i == 0) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }
}
