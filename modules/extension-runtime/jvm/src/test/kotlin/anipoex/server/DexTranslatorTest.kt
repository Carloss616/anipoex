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

    // `Base.make()` builds a Sub with Base's own constructor, then sets a field only Sub has: the call's owner is the class
    // whose code it's in, which must still be repaired (only a constructor's `this(...)` is left as is).
    @Test
    fun subclassBuiltInsideItsParent(@TempDir dir: Path) {
        val baseInit = Method("Lfx/Base;", "<init>", emptyArray(), "V")
        val n = Field("Lfx/Sub;", "n", "I")
        val dex = DexFileNode().apply {
            clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Base;", OBJECT, null).apply {
                methods = mutableListOf(
                    DexMethodNode(ACC_PUBLIC or ACC_CONSTRUCTOR, baseInit).apply {
                        codeNode = DexCodeNode().apply {
                            visitRegister(1)
                            visitMethodStmt(Op.INVOKE_DIRECT, intArrayOf(0), OBJECT_INIT)
                            visitStmt0R(Op.RETURN_VOID)
                        }
                    },
                    DexMethodNode(ACC_PUBLIC or ACC_STATIC, Method("Lfx/Base;", "make", emptyArray(), "Lfx/Base;")).apply {
                        codeNode = DexCodeNode().apply {
                            visitRegister(2)
                            visitTypeStmt(Op.NEW_INSTANCE, 0, 0, "Lfx/Sub;")
                            visitMethodStmt(Op.INVOKE_DIRECT, intArrayOf(0), baseInit)
                            visitConstStmt(Op.CONST_4, 1, -1)
                            visitFieldStmt(Op.IPUT, 1, 0, n)
                            visitStmt1R(Op.RETURN_OBJECT, 0)
                        }
                    },
                )
            })
            clzs.add(DexClassNode(ACC_PUBLIC, "Lfx/Sub;", "Lfx/Base;", null).apply {
                fields = mutableListOf(DexFieldNode(ACC_PUBLIC, n, null))
            })
        }
        fixInlinedConstructors(dex)
        val loader = load(dex, dir)
        val made = Class.forName("fx.Base", true, loader).getMethod("make").invoke(null)
        assertEquals(Class.forName("fx.Sub", false, loader), made.javaClass)
        assertEquals(-1, made.javaClass.getField("n").get(made))
    }

    // Documents why the repair exists: dex2jar alone turns `new Holder` into `new Object`.
    @Test
    fun withoutRepairFails(@TempDir dir: Path) {
        val loader = load(holderDex(), dir)
        assertFailsWith<VerifyError> { Class.forName("fx.Holder", true, loader) }
    }

    // dex2jar writes a static call to an interface's method as a class's: the JVM refuses it until it's marked an interface call.
    @Test
    fun staticCallOnInterface(@TempDir dir: Path) {
        val api = ClassWriter(0).apply {
            visit(Opcodes.V1_8, Opcodes.ACC_PUBLIC or Opcodes.ACC_INTERFACE or Opcodes.ACC_ABSTRACT, "fx/Api", null, "java/lang/Object", null)
            visitMethod(Opcodes.ACC_PUBLIC or Opcodes.ACC_STATIC, "answer", "()I", null, null).apply {
                visitCode()
                visitIntInsn(Opcodes.BIPUSH, 42)
                visitInsn(Opcodes.IRETURN)
                visitMaxs(1, 0)
                visitEnd()
            }
            visitEnd()
        }.toByteArray()
        val caller = ClassWriter(0).apply {
            // As dex2jar writes it: version 50, where the JVM accepts no static interface call.
            visit(Opcodes.V1_6, Opcodes.ACC_PUBLIC, "fx/Caller", null, "java/lang/Object", null)
            visitMethod(Opcodes.ACC_PUBLIC or Opcodes.ACC_STATIC, "call", "()I", null, null).apply {
                visitCode()
                visitMethodInsn(Opcodes.INVOKESTATIC, "fx/Api", "answer", "()I", false)
                visitInsn(Opcodes.IRETURN)
                visitMaxs(1, 0)
                visitEnd()
            }
            visitEnd()
        }.toByteArray()
        fun call(callerClass: ByteArray, at: Path): Any? {
            Files.createDirectories(at.resolve("fx"))
            Files.write(at.resolve("fx/Api.class"), api)
            Files.write(at.resolve("fx/Caller.class"), callerClass)
            return Class.forName("fx.Caller", true, URLClassLoader(arrayOf(at.toUri().toURL()), null)).getMethod("call").invoke(null)
        }
        val failure = assertFailsWith<java.lang.reflect.InvocationTargetException> { call(caller, dir.resolve("as-written")) }
        assertTrue(failure.cause is IncompatibleClassChangeError)
        assertEquals(42, call(repairClass(caller) { it == "fx/Api" }, dir.resolve("repaired")))
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

        val remapped = repairClass(original)
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
