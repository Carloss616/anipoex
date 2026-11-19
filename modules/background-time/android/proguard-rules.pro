# BackgroundTimeModule runs this callback while the screen is off.
-keepclassmembers class com.facebook.react.modules.core.ReactChoreographer {
  private android.view.Choreographer$FrameCallback frameCallback;
}
