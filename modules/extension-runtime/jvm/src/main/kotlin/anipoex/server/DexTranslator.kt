package anipoex.server

import com.googlecode.d2j.DexConstants
import com.googlecode.d2j.Method
import com.googlecode.d2j.dex.Dex2jar
import com.googlecode.d2j.node.DexClassNode
import com.googlecode.d2j.node.DexCodeNode
import com.googlecode.d2j.node.DexFileNode
import com.googlecode.d2j.node.DexMethodNode
import com.googlecode.d2j.node.insn.MethodStmtNode
import com.googlecode.d2j.node.insn.TypeStmtNode
import com.googlecode.d2j.reader.BaseDexFileReader
import com.googlecode.d2j.reader.DexFileReader
import com.googlecode.d2j.reader.MultiDexFileReader
import com.googlecode.d2j.reader.Op
import com.googlecode.d2j.visitors.DexFileVisitor
import org.objectweb.asm.ClassReader
import org.objectweb.asm.ClassWriter
import org.objectweb.asm.commons.ClassRemapper
import org.objectweb.asm.commons.SimpleRemapper
import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.util.zip.ZipEntry
import java.util.zip.ZipFile
import java.util.zip.ZipOutputStream

/**
 * Translates every dex in the APK into one JVM jar, with the options Suwayomi's PackageTools uses.
 * @see https://github.com/Suwayomi/Suwayomi-Server/blob/master/server/src/main/kotlin/suwayomi/tachidesk/manga/impl/util/PackageTools.kt
 */
fun dexToJar(apk: File, jar: File) {
    // dex2jar writes a jar through jdk.zipfs, which the java.base-only runtime lacks; it writes a directory when given one.
    val classes = Files.createTempDirectory(jar.parentFile.toPath(), "classes")
    try {
        translate(apk, classes)
        ZipOutputStream(jar.outputStream().buffered()).use { zip ->
            Files.walk(classes).use { paths ->
                paths.filter { Files.isRegularFile(it) }.forEach { path ->
                    zip.putNextEntry(ZipEntry(classes.relativize(path).joinToString("/")))
                    zip.write(remapUtilObject(Files.readAllBytes(path)))
                    zip.closeEntry()
                }
            }
            // Android's class loader reads resources (assets/, translations) from the APK itself; the signature files would make the jar look signed.
            ZipFile(apk).use { source ->
                source.entries().asSequence()
                    .filter { !it.isDirectory && !it.name.endsWith(".dex") && !it.name.startsWith("META-INF/") }
                    .forEach { entry ->
                        zip.putNextEntry(ZipEntry(entry.name))
                        source.getInputStream(entry).use { it.copyTo(zip) }
                        zip.closeEntry()
                    }
            }
        }
    } finally {
        classes.toFile().deleteRecursively()
    }
}

private fun translate(apk: File, classes: Path) {
    val reader = MultiDexFileReader.open(apk.readBytes())
    val dex = DexFileNode()
    reader.accept(dex, DexFileReader.SKIP_DEBUG)
    fixInlinedConstructors(dex)
    translate(dex, reader.dexVersion, classes)
}

/** Writes the tree's classes under [classes], one `.class` per class. */
internal fun translate(dex: DexFileNode, version: Int, classes: Path) {
    Dex2jar.from(NodeReader(dex, version))
        .reUseReg(false)
        .topoLogicalSort()
        .skipDebug(true)
        .optimizeSynchronized(false)
        .printIR(false)
        .noCode(false)
        .skipExceptions(false)
        .dontSanitizeNames(true)
        .computeFrames(true)
        .to(classes)
}

// R8 inlines trivial constructors into `Y.<init>` calls on an X (Y above X's direct super) that ART runs and the JVM verifier rejects, so each is pointed at a constructor reaching Y.<init> through every class in between.
internal fun fixInlinedConstructors(dex: DexFileNode) {
    val classes = dex.clzs.associateBy { it.className }
    // Added after the walk: the class being fixed is often the one whose code is walked.
    val added = mutableMapOf<Method, Pair<DexClassNode, DexMethodNode>>()

    // A constructor on `owner` with superConstructor's parameters that ends in superConstructor; null when a class in between isn't in the dex.
    fun constructorOn(owner: String, superConstructor: Method): Method? {
        if (owner == superConstructor.owner) return superConstructor
        val cls = classes[owner] ?: return null
        val constructor = Method(owner, "<init>", superConstructor.parameterTypes, "V")
        if (cls.methods.orEmpty().any { it.method == constructor } || constructor in added) return constructor
        val next = constructorOn(cls.superClass ?: return null, superConstructor) ?: return null
        added[constructor] = cls to delegatingConstructor(constructor, next)
        return constructor
    }

    dex.clzs.forEach { cls ->
        cls.methods.orEmpty().forEach { method ->
            val code = method.codeNode ?: return@forEach
            // In a constructor, `this` is the first of the incoming registers, which sit at the end.
            val self = if (method.method.name == "<init>") code.totalRegister - registersOf(method.method) else -1
            // shortcut: follows a register from new-instance to its <init> call, which R8 emits back to back; moves in between aren't followed.
            val created = mutableMapOf<Int, String>()
            code.stmts.forEachIndexed { index, stmt ->
                if (stmt is TypeStmtNode && stmt.op == Op.NEW_INSTANCE) created[stmt.a] = stmt.type
                if (stmt !is MethodStmtNode || stmt.method.name != "<init>" || stmt.args.isEmpty()) return@forEachIndexed
                val receiver = stmt.args[0]
                val owner = created.remove(receiver) ?: if (receiver == self) cls.superClass else null
                if (owner == null || owner == stmt.method.owner || stmt.method.owner == cls.className) return@forEachIndexed
                val target = constructorOn(owner, stmt.method) ?: return@forEachIndexed
                code.stmts[index] = MethodStmtNode(stmt.op, stmt.args, target)
            }
        }
    }
    added.values.forEach { (target, constructor) ->
        (target.methods ?: mutableListOf<DexMethodNode>().also { target.methods = it }) += constructor
    }
}

// dex2jar 2.4.38's getCommonSuperClass answers "java/util/Object" for a class it can't load, which lands in StackMapTable frames.
internal fun remapUtilObject(classFile: ByteArray): ByteArray {
    // No ClassReader passed to the writer: copying its constant pool would keep the "java/util/Object" entry.
    val writer = ClassWriter(0)
    ClassReader(classFile).accept(ClassRemapper(writer, SimpleRemapper("java/util/Object", "java/lang/Object")), 0)
    return writer.toByteArray()
}

// Registers a method's arguments take, `this` included: long and double take two.
private fun registersOf(method: Method) = 1 + method.parameterTypes.sumOf { if (it == "J" || it == "D") 2 else 1 }

private fun delegatingConstructor(constructor: Method, superConstructor: Method) =
    DexMethodNode(DexConstants.ACC_PUBLIC or DexConstants.ACC_CONSTRUCTOR, constructor).apply {
        // Only the arguments: `this` is register 0, the parameters follow.
        val registers = registersOf(constructor)
        codeNode = DexCodeNode().apply {
            visitRegister(registers)
            visitMethodStmt(Op.INVOKE_DIRECT_RANGE, IntArray(registers) { it }, superConstructor)
            visitStmt0R(Op.RETURN_VOID)
        }
    }

/** Hands dex2jar the repaired tree instead of the APK's bytes. */
private class NodeReader(private val dex: DexFileNode, private val version: Int) : BaseDexFileReader {
    override fun getDexVersion() = version
    override fun getClassNames(): List<String> = dex.clzs.map { it.className }
    override fun accept(visitor: DexFileVisitor) = dex.accept(visitor)
    override fun accept(visitor: DexFileVisitor, config: Int) = dex.accept(visitor)
    override fun accept(visitor: DexFileVisitor, classIndex: Int, config: Int) = dex.clzs[classIndex].accept(visitor)
}
