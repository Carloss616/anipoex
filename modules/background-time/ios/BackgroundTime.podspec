Pod::Spec.new do |s|
  s.name           = 'BackgroundTime'
  s.version        = '1.0.0'
  s.summary        = 'Keeps the app running for a while after it leaves the screen'
  s.author         = ''
  s.homepage       = 'https://github.com/expo/expo'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }
  s.source_files = "**/*.{h,m,swift}"
end
