let ctx, engine;

let state;
let mem;

const cursorPosX = 0;
const cursorPosY = 4;
const blockPosX = 8;
const blockPosY = 12;
const blockVelX = 16;
const blockVelY = 20;

const wasmObjectOffsetTable = (var_name) => {
    let ret = {};
    const obj_meta_len = mem.getInt32(engine[var_name + "_meta_len"], true);

    obj_meta = new DataView(engine.memory.buffer, engine[var_name + "_meta"], obj_meta_len);
    const field_count = obj_meta.getInt32(0, true);
    for (let i = 0; i < field_count; i++) {
        const ptr = obj_meta.getInt32((1 + i + field_count * 0) * 4, true);
        const len = obj_meta.getInt32((1 + i + field_count * 1) * 4, true);
        const offset = obj_meta.getInt32((1 + i + field_count * 2) * 4, true);

        const field_name = new TextDecoder().decode(new Uint8Array(engine.memory.buffer, ptr, len));
        ret[field_name] = offset;
    }
    return ret;
}

window.onload = async () => {
    engine = await WebAssembly
        .instantiateStreaming(fetch("game.wasm"), { env: {
            logStr: (ptr, len) => {
                arr = new Uint8Array(engine.memory.buffer, ptr, len);
                const str = new TextDecoder().decode(arr);
                console.log(str);
            }
        } })
        .then((mod) => mod.instance.exports);

    mem = new DataView(engine.memory.buffer);

    state = new DataView(engine.memory.buffer, engine.state, 24);

    const canvas = document.querySelector("#canvas");
    if (canvas === null) return;

    canvas.width = 1000;
    canvas.height = (canvas.width / 16) * 9;

    ctx = canvas.getContext("2d");


    canvas.addEventListener("mousemove", (evt) => {
        // const rect = console.log(evt);
        const rect = ctx.canvas.getBoundingClientRect();
        state.setFloat32(cursorPosX, evt.clientX - rect.left, true);
        state.setFloat32(cursorPosY, evt.clientY - rect.top, true);
    });

    console.log(wasmObjectOffsetTable("state"));

    window.requestAnimationFrame(initGame);
}

const block_len = 50;

let prev;
const initGame = (t) => {
    prev = t;

    ctx.fillStyle = "green";
    ctx.fillRect(
        state.getFloat32(blockPosX, true),
        state.getFloat32(blockPosY, true),
        block_len,
        block_len,
    );

    window.requestAnimationFrame(stepGame);
}

const stepGame = (t) => {
    dt = t - prev;

    ctx.reset();

    engine.tick(dt);

    ctx.fillStyle = "green";
    ctx.fillRect(
        state.getFloat32(blockPosX, true) - block_len / 2,
        state.getFloat32(blockPosY, true) - block_len / 2,
        block_len,
        block_len,
    );

    ctx.arc(state.getFloat32(cursorPosX, true), state.getFloat32(cursorPosY, true), 5, 0, 2 * Math.PI);
    ctx.fill();

    prev = t;
    window.requestAnimationFrame(stepGame);
}
