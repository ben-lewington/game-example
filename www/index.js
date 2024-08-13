let ctx, engine;

let state;

const cursorPosX = 0;
const cursorPosY = 4;
const blockPosX = 8;
const blockPosY = 12;
const blockVelX = 16;
const blockVelY = 20;

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