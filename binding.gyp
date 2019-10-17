{
  "targets": [{
    "target_name": "web_images_napi",
    "conditions": [
      ['OS=="linux" or OS=="solaris" or OS=="freebsd"', {"libraries": ["../target/x86_64-unknown-linux-gnu/release/libweb_images_napi.so"]}],
      ['OS=="mac"', {"libraries": ["../target/x86_64-apple-darwin/release/libweb_images_napi.dylib"]}],
      # ['OS=="win"', {"libraries": ["../target/release/libweb_images_napi.lib"]}]
    ],
  }]
}
