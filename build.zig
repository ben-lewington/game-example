const std = @import("std");

pub fn buildWasmModule(
    b: *std.Build,
    name: []const u8,
    root: std.Build.LazyPath,
    options: struct {
        global_base: usize = 6560,
        import_memory: bool = false,
        stack_size: usize = std.wasm.page_size,
        initial_memory: usize = std.wasm.page_size * 2,
        max_memory: usize = std.wasm.page_size * 2,
    },
) *std.Build.Step.Compile {
    const wasm_mod = b.addExecutable(.{
        .name = name,
        .root_source_file = root,
        .target = b.resolveTargetQuery(.{
            .cpu_arch = .wasm32,
            .os_tag = .freestanding,
        }),
        .optimize = .ReleaseSmall,
    });

    wasm_mod.global_base = options.global_base;
    wasm_mod.entry = .disabled;
    wasm_mod.rdynamic = true;
    wasm_mod.import_memory = options.import_memory;
    wasm_mod.stack_size = options.stack_size;
    wasm_mod.initial_memory = options.initial_memory;
    wasm_mod.max_memory = options.max_memory;
    // wasm_mod.import_symbols = true;

    return wasm_mod;
}

pub fn build(b: *std.Build) void {
    const lib = buildWasmModule(b, "game", b.path("game/lib.zig"), .{});

    const install = b.addInstallArtifact(lib, .{
        .dest_dir = .{ .override = .{ .custom = "../www" } },
    });

    b.getInstallStep().dependOn(&install.step);
}
