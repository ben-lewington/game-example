const std = @import("std");
const meta = @import("meta.zig");

const Vec = extern struct {
    x: f32,
    y: f32,
};

const Action = extern struct {
    pos: Vec,
    vel: Vec,
};

const State = extern struct {
    cursor: Vec,
    block: Action,
};

export fn tick(dt: i32) void {
    const fdt: f32 = @floatFromInt(dt);
    globals.state.block.vel.x = (globals.state.cursor.x - globals.state.block.pos.x) / 2;
    globals.state.block.vel.y = (globals.state.cursor.y - globals.state.block.pos.y) / 2;

    globals.state.block.pos.x += fdt * globals.state.block.vel.x / 60;
    globals.state.block.pos.y += fdt * globals.state.block.vel.y / 60;
}

const globals = struct {
    export var state: State = .{
        .cursor = .{ .x = 0, .y = 0 },
        .block = .{
            .pos = .{ .x = 0, .y = 0 },
            .vel = .{ .x = 0, .y = 0 },
        },
    };

    export const state_meta = meta.FieldMeta.fromStruct(State);
    export const state_meta_len: usize = @sizeOf(@TypeOf(state_meta));
};
