# The JDK framework and the jars are built locally, never committed.
unless File.directory?(File.join(__dir__, 'Frameworks/AnipoexJDK.xcframework')) && File.directory?(File.join(__dir__, 'Runtime'))
  raise "Run bun run extensions:ios-runtime first (needs JAVA_HOME >= 17 and android/gradlew or GRADLEW=...); see modules/extension-runtime/ios/README.md"
end

Pod::Spec.new do |s|
  s.name           = 'ExtensionRuntime'
  s.version        = '1.0.0'
  s.summary        = 'Runs Mihon extensions on an embedded JVM'
  s.author         = ''
  s.homepage       = 'https://github.com/expo/expo'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'WebKit', 'JavaScriptCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  s.source_files = '*.{h,m,swift}'
  s.public_header_files = 'JvmHost.h'
  s.vendored_frameworks = 'Frameworks/AnipoexJDK.xcframework'
  s.resource_bundles = { 'ExtensionRuntime' => ['Runtime/*.jar', 'challenge-banner.html'] }
end
