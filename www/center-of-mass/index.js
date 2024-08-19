
var ctx;

const getRandomColor = () => {
    let randomColor = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
};


const Polygon = class {
    constructor(num_vertices) {
        this.num_vertices = num_vertices;
        this.idx = 0;
        this.vertices = [];
        this.colors = new Array(num_vertices)
        for (let i = 0; i < this.num_vertices; i++) {
            this.colors[i] = getRandomColor();
        }
    }

    pushVertex(point) {
        if (this.vertices.length < this.num_vertices) {
            this.vertices.push(point)
        } else {
            this.vertices[this.idx] = point;
        }
        this.idx = (this.idx + 1) % this.num_vertices;
    }

    getCenterOfMass() {
        let p = new Point(0, 0);
        const l = this.vertices.length;
        for (let v of this.vertices) {
            p.x += v.x / l;
            p.y += v.y / l;
        }
        return p
    }

    renderPoly() {
        for (let i = 0; i < this.vertices.length; i++) {
            const p = this.vertices[i];
            ctx.beginPath();
            ctx.fillStyle = this.colors[i];
            ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
        const com = this.getCenterOfMass();
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.arc(com.x, com.y, 2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

    }
}

let poly = new Polygon(3);
let prev;

const Point = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    asElement() {
        let el = document.createElement("li")
        el.appendChild(document.createTextNode(`Point(${this.x}, ${this.y})`));
        return el;
    }
};

window.onload = async () => {
    const canvas = document.querySelector("#canvas");
    if (canvas === null) return;
    const point_list = document.querySelector("ol");
    if (point_list === null) return;

    canvas.width = 1000;
    canvas.height = (canvas.width / 16) * 9;

    ctx = canvas.getContext("2d");

    canvas.addEventListener("click", (evt) => {
        const rect = canvas.getBoundingClientRect();
        const point = new Point(evt.clientX - rect.left, evt.clientY - rect.top);
        poly.pushVertex(point);

    });

    window.requestAnimationFrame(tick);
}

const tick = (_) => {
    ctx.reset();
    poly.renderPoly();
    window.requestAnimationFrame(tick);
}
