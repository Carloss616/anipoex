# OpenJDK in AnipoexJDK.xcframework

`scripts/prepare-runtime.sh` builds `Frameworks/AnipoexJDK.xcframework` locally from a prebuilt OpenJDK (Zero VM, `java.base` only). Nothing from it is committed to this repository.

## Origin

Mangatan release [`embedded-openjdk-ios13-v16`](https://github.com/1Selxo/Mangatan/releases/tag/embedded-openjdk-ios13-v16):

| File | SHA-256 |
| --- | --- |
| `OpenJDK.xcframework.zip` (static `libdevice.a` and JNI headers) | `f21681caae40e508647e7f18c9082f27fa9aa67ee7f1376725eae528fa2d38cb` |
| `java_bundle-device.zip` (java.home: `lib/modules`, `conf/`, CA certificates) | `15369b9bb9dfdd400c18c56b30e2f6cf316b81d4e0bae5ddd6b1fe72355c4b0b` |

The script links `libdevice.a` into a dynamic framework for the device, and for the simulator after rewriting each object's platform (`scripts/retag-simulator.py`) and with an `mprotect` wrapper (`scripts/sim-mprotect.c`). The OpenJDK code itself is unchanged.

## License

OpenJDK is licensed under the GNU General Public License, version 2, with the Classpath Exception (https://openjdk.org/legal/gplv2+ce.html). This repository's own code stays under its MIT license; an app binary that embeds the framework carries the GPLv2 terms for that part, which is why the iOS build is for personal sideloading only.

## Corresponding source

The release's `SOURCE_MANIFEST.txt` pins the exact sources:

- OpenJDK Mobile: https://github.com/openjdk/mobile, commit `fc10224720ee1c109b1207daeba8878822bb5363`
- ios-tools: https://github.com/openjdk-mobile/ios-tools, commit `f8524c91c012040e40e7f8af34e7a0f11af0da83`
- Patches applied by Mangatan, in its repository under `tool/openjdk/`: `8378080-zero-jni-env-lifetime.patch`, `ios-libjava-global-symbols.patch`, `ios-zero-runtime.patch`
- libffi for iOS (SHA-256 `4f39fd1d53fbd69d1bdbd915413077d130daa3f6792d1b3a03a690a9cbd4dea3`), built by the same release
