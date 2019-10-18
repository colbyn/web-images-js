# [Documentation](https://colbyn.github.io/web-images-js/)
# [GitRepo](https://github.com/colbyn/web-images-js)

# Example

```typescript
import {Image} from "web-images";
import {basename} from "path";
import * as fs from "fs";

async function load_and_save_fast(path: string): Promise<null> {
    // Assume `path` has a file extension set to “jpeg”.
    const output_path = `./output/${basename(path, "jpeg")}.png`;
    return Image
        .open(path)
        .then((x: Image) => x.thumbnail({
            width: 500,
            height: 500
        }))
        .then((x: Image) => x.save(output_path))
        .then((_) => {
            console.log("done");
            return null;
        });
}

async function load_and_save_quality(path: string): Promise<null> {
    // Assume `path` has a file extension set to “jpeg”.
    const output_path = `./output/${basename(path, "jpeg")}.png`;
    return Image
        .open(path)
        .then((x: Image) => x.resize({
            width: 500,
            height: 500
        }))
        .then((x: Image) => x.save(output_path))
        .then((_) => {
            console.log("done");
            return null;
        });
}

async function load_only(path: string): Promise<Image> {
    return Image
        .open(path)
        .then((x: Image) => x.resize({
            width: 500,
            height: 500,
            resize_exact: false,
            filter_type: "Lanczos3"
        }));
}
```


# Abstract
The bringin of the amazing `image` crate to the node.js ecosystem.

# Rationale

## 1. License
While e.g. the **Sharp** library is licensed under the Apache 2.0 License. It’s a wrapper around `libvips` which is `LGPLv3`. In contrast, Web Images is self contained and distributable under the MIT license.

Although this may, or may not be significant depending on your specific circumstances.


## 2. Performance, Safety and ease of Development
> Or “why undergo the development of Web Images when `libvips` is faster”?

First, buy into Rust and it’s advantages over C/C++ implementations. This should filter out all but native JS libraries.
Now with regards to Web Images over e.g. Jimp:

```
Jimp       : ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇ 80.55 seconds
Web Images : ▇▇ 4.77 seconds

*--------------------------------*
| processing 158 images          |
*--------------------------------*
```


# Miscellaneous

[*]: No annoying system requirements on libvips, ImageMagic and etcetera. There are rust dependencies yet everything is baked into the release binary and requires no further dependencies.

[†]: Bugs are inevitable and furthermore what bridges the JS world with the rust implementation is the low-level NAPI interface. Yet while the picture isn’t perfect, the FFI boundary is rather small in comparison. If you buy into Rust and it’s semantics, this should *at the very least* be a step in the right direction.

[‡]: See [benchmarks here](https://github.com/colbyn/web-images-js-bench-2019-10)
