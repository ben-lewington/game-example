const std = @import("std");

const FfiSlice = extern struct {
    ptr: [*c]const u8,
    len: usize,

    pub fn fromSlice(input: []const u8) FfiSlice {
        return .{
            .ptr = input.ptr,
            .len = input.len,
        };
    }
};

pub const FieldMeta = struct {
    pub fn Array(comptime n: comptime_int) type {
        return extern struct {
            len: usize,
            name_ptrs: [n][*c]const u8 = undefined,
            name_lens: [n]usize = undefined,
            offsets: [n]usize = undefined,
        };
    }

    pub fn fromStruct(comptime T: type) Array(countStructFields(T)) {
        const field_len = countStructFields(T);
        var idx: usize = 0;
        var ret: Array(countStructFields((T))) = .{ .len = field_len };

        visitStructFields(T, field_len, .{
            .cur = .{
                .prefix = null,
                .offset = null,
            },
            .idx = &idx,
            .collect = &ret,
        });

        return ret;
    }

    fn visitStructFields(comptime T: type, comptime field_len: usize, comptime state: struct {
        cur: struct {
            prefix: ?[]const u8,
            offset: ?usize,
        },
        idx: *usize,
        collect: *Array(field_len),
    }) void {
        const fields = @typeInfo(T).Struct.fields;

        inline for (fields) |f| {
            const f_path_name = if (state.cur.prefix) |p| std.fmt.comptimePrint(
                "{s}_{s}",
                .{ p, f.name },
            ) else f.name;

            const offset = (state.cur.offset orelse 0) + @offsetOf(T, f.name);
            switch (@typeInfo(f.type)) {
                .Struct => {
                    visitStructFields(f.type, field_len, .{
                        .cur = .{
                            .prefix = f_path_name,
                            .offset = offset,
                        },
                        .idx = state.idx,
                        .collect = state.collect,
                    });
                },
                .Int, .Float, .Pointer => {
                    state.collect.name_ptrs[state.idx.*] = f_path_name.ptr;
                    state.collect.name_lens[state.idx.*] = f_path_name.len;
                    state.collect.offsets[state.idx.*] = offset;
                    state.idx.* += 1;
                },
                else => |t| @compileError(
                    std.fmt.comptimePrint("unsupported typeclass: {s}", .{@tagName(t)}),
                ),
            }
        }
    }
};

pub fn countStructFields(comptime T: type) usize {
    const fields = @typeInfo(T).Struct.fields;

    var ret: usize = 0;
    inline for (fields) |f| {
        const f_ti = @typeInfo(f.type);
        switch (f_ti) {
            .Struct => ret += countStructFields(f.type),
            .Int, .Float, .Pointer => ret += 1,
            else => @compileError(
                std.fmt.comptimePrint("unsupported typeclass: {s}", @tagName(f_ti)),
            ),
        }
    }

    return ret;
}
