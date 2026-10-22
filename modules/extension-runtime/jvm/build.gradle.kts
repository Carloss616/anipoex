import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    kotlin("jvm") version "2.2.21"
    application
}

repositories {
    google()
    mavenCentral()
}

// The host classes are shared with the Android module; android/ shims cover the few Android types they name.
sourceSets.main {
    kotlin.srcDir("../android/src/main/java")
    kotlin.exclude("expo/**")
    // Android's solves the challenge in a WebView; the JVM uses CloudflareInterceptor.jvm.kt.
    kotlin.exclude("eu/kanade/tachiyomi/network/interceptor/CloudflareInterceptor.kt")
}

// Java 21 bytecode: the iOS runtime runs a newer VM, which accepts it.
java.toolchain.languageVersion = JavaLanguageVersion.of(21)
kotlin.compilerOptions.jvmTarget = JvmTarget.JVM_21

// Same libraries and versions the Android module gives extensions.
dependencies {
    implementation(platform("com.squareup.okhttp3:okhttp-bom:5.5.0"))
    implementation("com.squareup.okhttp3:okhttp")
    implementation("com.squareup.okhttp3:okhttp-brotli")
    implementation("com.squareup.okhttp3:okhttp-zstd")
    implementation("com.squareup.okhttp3:okhttp-dnsoverhttps")
    implementation("org.jsoup:jsoup:1.23.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.10.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json-okio:1.10.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-protobuf:1.10.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
    implementation("uy.kohesive.injekt:injekt-core:1.16.1")
    implementation("io.reactivex:rxjava:1.3.8")
    // Part of Android, so extensions expect it.
    implementation("org.json:json:20260814")
    // Verifies APK signatures (v1-v3) and reads the binary manifest.
    implementation("com.android.tools.build:apksig:9.4.1")
    // Turns the APK's dex into JVM bytecode.
    implementation("de.femtopedia.dex2jar:dex-translator:2.4.38")

    testImplementation(kotlin("test"))
    testImplementation("com.squareup.okhttp3:mockwebserver3")
}

tasks.test { useJUnitPlatform() }

application {
    mainClass = "anipoex.server.MainKt"
}

// java.util.logging for a runtime without java.logging; it goes on -Xbootclasspath/a, since only the boot loader may define java.* classes.
val julShim by sourceSets.creating
tasks.named<JavaCompile>(julShim.compileJavaTaskName) {
    options.compilerArgs.addAll(listOf("--patch-module", "java.logging=${julShim.java.srcDirs.first()}"))
}
val julShimJar by tasks.registering(Jar::class) {
    archiveFileName = "jul-shim.jar"
    from(julShim.output)
}
distributions.main.configure { contents.into("boot") { from(julShimJar) } }

// Runtime image for the sidecar: java.base plus the TLS curves OkHttp needs, nothing else.
val jlinkRuntime by tasks.registering(Exec::class) {
    val jlink = javaToolchains.launcherFor { languageVersion = JavaLanguageVersion.of(21) }
    val output = layout.buildDirectory.dir("jre")
    outputs.dir(output)
    // Resolved at execution, so other tasks don't provision a toolchain they don't use.
    doFirst {
        output.get().asFile.deleteRecursively()
        executable(jlink.get().metadata.installationPath.file("bin/jlink").asFile.path)
        args("--add-modules", "java.base,jdk.crypto.ec", "--strip-debug", "--no-header-files", "--no-man-pages", "--output", output.get().asFile.path)
    }
}

// Stands in for okhttp-zstd on iOS, whose JNI library can't load there; the main build keeps the real one.
val zstdStub by sourceSets.creating
val zstdStubTest by sourceSets.creating {
    compileClasspath += zstdStub.output
    runtimeClasspath += zstdStub.output
}
dependencies {
    "zstdStubCompileOnly"(platform("com.squareup.okhttp3:okhttp-bom:5.5.0"))
    "zstdStubCompileOnly"("com.squareup.okhttp3:okhttp")
    "zstdStubTestImplementation"(platform("com.squareup.okhttp3:okhttp-bom:5.5.0"))
    "zstdStubTestImplementation"("com.squareup.okhttp3:okhttp")
    "zstdStubTestImplementation"("com.squareup.okhttp3:mockwebserver3")
    "zstdStubTestImplementation"(kotlin("test-junit5"))
}
val zstdStubJar by tasks.registering(Jar::class) {
    archiveFileName = "zstd-stub.jar"
    from(zstdStub.output)
}
val zstdStubTestRun = tasks.register<Test>("zstdStubTest") {
    group = "verification"
    testClassesDirs = zstdStubTest.output.classesDirs
    classpath = zstdStubTest.runtimeClasspath
    useJUnitPlatform()
}
tasks.check { dependsOn(zstdStubTestRun) }
