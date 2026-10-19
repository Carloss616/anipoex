package anipoex.server

import com.googlecode.d2j.DexConstants.ACC_CONSTRUCTOR
import com.googlecode.d2j.DexConstants.ACC_PUBLIC
import com.googlecode.d2j.DexConstants.ACC_STATIC
import com.googlecode.d2j.Field
import com.googlecode.d2j.Method
import com.googlecode.d2j.node.DexClassNode
import com.googlecode.d2j.node.DexCodeNode
import com.googlecode.d2j.node.DexFieldNode
import com.googlecode.d2j.node.DexFileNode
import com.googlecode.d2j.node.DexMethodNode
import com.googlecode.d2j.reader.Op
import org.junit.jupiter.api.io.TempDir
import org.objectweb.asm.ClassWriter
import org.objectweb.asm.Label
import org.objectweb.asm.Opcodes
import java.net.URLClassLoader
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertTrue

private const val OBJECT = "Ljava/lang/Object;"
private val OBJECT_INIT = Method(OBJECT, "<init>", emptyArray(), "V")

class DexTranslatorTest {
    @Test
    fun newThenSuperInit(@TempDir dir: Path) {
        val dex = holderDex()
        fixInlinedConstructors(dex)
        val holder = Class.forName("fx.Holder", true, load(dex, dir))
        assertTrue(holder.isInstance(holder.getField("INSTANCE").get(null)))
    }

    @Test
    fun grandparentInit(@TempDir dir: Path) {
        val base = Method("Lfx/Base;", "<init>", arrayOf("I"), "V")
        val dex = DexFileNode().apply {
            clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Base;", OBJECT, null).apply {
                methods = mutableListOf(constructor(base) { visitMethodStmt(Op.INVOKE_DIRECT, intArrayOf(0), OBJECT_INIT) })
            })
            clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Middle;", "Lfx/Base;", null))
            clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Child;", "Lfx/Middle;", null).apply {
                val child = Method("Lfx/Child;", "<init>", arrayOf("I"), "V")
                methods = mutableListOf(constructor(child) { visitMethodStmt(Op.INVOKE_DIRECT, intArrayOf(0, 1), base) })
            })
        }
        fixInlinedConstructors(dex)
        val child = Class.forName("fx.Child", true, load(dex, dir))
        assertEquals(child, child.getConstructor(Int::class.java).newInstance(3).javaClass)
    }

    // Documents why the repair exists: dex2jar alone turns `new Holder` into `new Object`.
    @Test
    fun withoutRepairFails(@TempDir dir: Path) {
        val loader = load(holderDex(), dir)
        assertFailsWith<VerifyError> { Class.forName("fx.Holder", true, loader) }
    }

    @Test
    fun utilObjectInFrames(@TempDir dir: Path) {
        val writer = ClassWriter(ClassWriter.COMPUTE_MAXS)
        writer.visit(Opcodes.V21, Opcodes.ACC_PUBLIC, "fx/Frame", null, "java/lang/Object", null)
        writer.visitMethod(Opcodes.ACC_PUBLIC, "<init>", "()V", null, null).apply {
            visitCode()
            visitVarInsn(Opcodes.ALOAD, 0)
            visitMethodInsn(Opcodes.INVOKESPECIAL, "java/lang/Object", "<init>", "()V", false)
            visitVarInsn(Opcodes.ALOAD, 0)
            visitVarInsn(Opcodes.ASTORE, 1)
            val end = Label()
            visitJumpInsn(Opcodes.GOTO, end)
            visitLabel(end)
            // What dex2jar 2.4.38 writes when it can't load a class to find a common superclass.
            visitFrame(Opcodes.F_FULL, 2, arrayOf("fx/Frame", "java/util/Object"), 0, emptyArray())
            visitInsn(Opcodes.RETURN)
            visitMaxs(0, 0)
            visitEnd()
        }
        writer.visitEnd()
        val original = writer.toByteArray()
        assertTrue(String(original, Charsets.ISO_8859_1).contains("java/util/Object"))

        val remapped = remapUtilObject(original)
        assertFalse(String(remapped, Charsets.ISO_8859_1).contains("java/util/Object"))
        Files.createDirectories(dir.resolve("fx"))
        Files.write(dir.resolve("fx/Frame.class"), remapped)
        val frame = Class.forName("fx.Frame", true, URLClassLoader(arrayOf(dir.toUri().toURL()), null))
        assertEquals(frame, frame.getConstructor().newInstance().javaClass)
    }

    // `fx.Holder.INSTANCE = new Holder()` as R8 leaves it: the trivial constructor inlined into Object.<init>.
    private fun holderDex() = DexFileNode().apply {
        val instance = Field("Lfx/Holder;", "INSTANCE", "Lfx/Holder;")
        clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Holder;", OBJECT, null).apply {
            fields = mutableListOf(DexFieldNode(ACC_PUBLIC or ACC_STATIC, instance, null))
            methods = mutableListOf(
                DexMethodNode(ACC_STATIC or ACC_CONSTRUCTOR, Method("Lfx/Holder;", "<clinit>", emptyArray(), "V")).apply {
                    codeNode = DexCodeNode().apply {
                        visitRegister(1)
                        visitTypeStmt(Op.NEW_INSTANCE, 0, 0, "Lfx/Holder;")
                        visitMethodStmt(Op.INVOKE_DIRECT, intArrayOf(0), OBJECT_INIT)
                        visitFieldStmt(Op.SPUT_OBJECT, 0, 0, instance)
                        visitStmt0R(Op.RETURN_VOID)
                    }
                },
            )
        })
    }

    // A one-int constructor: `this` is v0 and the int v1.
    private fun constructor(method: Method, body: DexCodeNode.() -> Unit) =
        DexMethodNode(ACC_PUBLIC or ACC_CONSTRUCTOR, method).apply {
            codeNode = DexCodeNode().apply {
                visitRegister(2)
                body()
                visitStmt0R(Op.RETURN_VOID)
            }
        }

    private fun load(dex: DexFileNode, dir: Path): ClassLoader {
        translate(dex, 35, dir)
        return URLClassLoader(arrayOf(dir.toUri().toURL()), null)
    }
}
