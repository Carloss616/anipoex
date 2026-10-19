# Usage: retag-simulator.py <in.a> <out.a>; patches each object's platform from iOS (2) to simulator (7) in place, since `ar x` loses duplicate member names.
import struct, sys

LC_BUILD_VERSION, LC_VERSION_MIN_IPHONEOS, LC_SOURCE_VERSION = 0x32, 0x25, 0x2A
IOS, IOSSIM = 2, 7

src, dst = sys.argv[1], sys.argv[2]
data = bytearray(open(src, "rb").read())
assert data[:8] == b"!<arch>\n", "not an ar archive"
off, members, patched, dropped, untagged = 8, 0, 0, 0, []
while off < len(data):
    hdr = data[off:off + 60]
    name, size = hdr[:16].decode().strip(), int(hdr[48:58])
    body = off + 60
    if name.startswith("#1/"):
        n = int(name[3:])
        name, body = data[body:body + n].rstrip(b"\0").decode(), body + n
    end = off + 60 + size
    if data[body:body + 4] == b"\xcf\xfa\xed\xfe":
        members += 1
        ncmds = struct.unpack_from("<I", data, body + 16)[0]
        p, found = body + 32, False
        for _ in range(ncmds):
            cmd, cmdsize = struct.unpack_from("<II", data, p)
            if cmd == LC_BUILD_VERSION:
                platform = struct.unpack_from("<I", data, p + 8)[0]
                assert platform == IOS, (name, platform)
                struct.pack_into("<I", data, p + 8, IOSSIM)
                patched, found = patched + 1, True
            elif cmd == LC_VERSION_MIN_IPHONEOS:
                # No room for an LC_BUILD_VERSION (libffi): a same-size LC_SOURCE_VERSION drops the platform and ld assumes the target's.
                struct.pack_into("<I", data, p, LC_SOURCE_VERSION)
                struct.pack_into("<Q", data, p + 8, 0)
                dropped, found = dropped + 1, True
            p += cmdsize
        if not found:
            untagged.append(name)
    off = end + (end & 1)
assert members and not untagged, f"objects without a platform command: {untagged}"
open(dst, "wb").write(data)
print(f"retag-simulator: {members} objects, {patched} retagged, {dropped} version-min dropped")
