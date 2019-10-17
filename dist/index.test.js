"use strict";

var _index = require("./index");

///////////////////////////////////////////////////////////////////////////////
// IMAGE
///////////////////////////////////////////////////////////////////////////////
test('Image.open', async () => {
  return _index.Image.open("assets/test/1.jpeg");
});
test('Image.open_with_format', async () => {
  return _index.Image.open_with_format("assets/test/1.jpeg", "jpeg");
});
test('Image.create', async () => {
  return _index.Image.create(100, 100, "rgba");
});
test('Image.dimensions', async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.dimensions()).then(x => expect(x).toEqual({
    "width": 100,
    "height": 100
  }));
});
test("Image.crop", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.crop(0, 0, 50, 50));
});
test("Image.color", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.color());
});
test("Image.grayscale", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.grayscale());
});
test("Image.invert", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.invert());
});
test("Image.resize", async () => {
  let resize_args = {
    width: 50,
    height: 50,
    filter_type: "Lanczos3",
    resize_exact: true
  };
  return _index.Image.create(100, 100, "rgba").then(x => x.resize(resize_args));
});
test("Image.thumbnail", async () => {
  let thumbnail_args = {
    width: 50,
    height: 50,
    resize_exact: true
  };
  return _index.Image.create(100, 100, "rgba").then(x => x.thumbnail(thumbnail_args));
});
test("Image.blur", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.blur(1));
});
test("Image.unsharpen", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.unsharpen(1, 1));
});
test("Image.filter3x3", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.filter3x3([1, 1, 1, 1, 1, 1, 1, 1, 1]));
});
test("Image.adjust_contrast", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.adjust_contrast(1));
});
test("Image.brighten", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.brighten(1));
});
test("Image.huerotate", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.huerotate(1));
});
test("Image.flipv", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.flipv());
});
test("Image.fliph", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.fliph());
});
test("Image.rotate90", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.rotate90());
});
test("Image.rotate180", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.rotate180());
});
test("Image.rotate270", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.rotate270());
});
test("Image.save", async () => {
  let path = "assets/test-output/Image.save.jpeg";
  return _index.Image.create(100, 100, "rgba").then(x => x.save(path));
});
test("Image.save_with_format", async () => {
  let path = "assets/test-output/Image.save_with_format.jpeg";
  return _index.Image.create(100, 100, "rgba").then(x => x.save_with_format(path, "jpeg"));
});
test("Image.map_rgba", async () => {
  let f = (x, y, px) => {
    return [px[0], px[1], px[2], px[3]];
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.map_rgba(f));
});
test("Image.reduce_rgba", async () => {
  let f = (acc, x, y, px) => {
    return acc + 1;
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.reduce_rgba(0, f));
});
test("Image.map_luma", async () => {
  let f = (x, y, px) => {
    return px;
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.map_luma(f));
});
test("Image.reduce_luma", async () => {
  let f = (acc, x, y, px) => {
    return acc + 1;
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.reduce_luma(0, f));
});
test("Image.adaptive_threshold", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.adaptive_threshold(1));
});
test("Image.equalize_histogram", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.equalize_histogram());
});
test("Image.match_histogram", async () => {
  return Promise.all([_index.Image.create(100, 100, "rgba"), _index.Image.create(100, 100, "rgba")]).then(([x, y]) => x.match_histogram(y));
});
test("Image.otsu_level", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.otsu_level());
});
test("Image.stretch_contrast", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.stretch_contrast(0, 1));
});
test("Image.threshold", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.threshold(1));
});
test("Image.distance_transform", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.distance_transform("L1"));
});
test("Image.canny", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.canny(1, 2));
});
test("Image.box_filter", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.box_filter(1, 1));
});
test("Image.gaussian_blur_f32", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.gaussian_blur_f32(1));
});
test("Image.horizontal_filter", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.horizontal_filter([1]));
});
test("Image.median_filter", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.median_filter(1, 1));
});
test("Image.separable_filter", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.separable_filter([1], [1]));
});
test("Image.separable_filter_equal", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.separable_filter_equal([1]));
});
test("Image.sharpen3x3", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.sharpen3x3());
});
test("Image.sharpen_gaussian", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.sharpen_gaussian(1, 1));
});
test("Image.vertical_filter", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.vertical_filter([1]));
});
test("Image.morph_close", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.morph_close("L1", 1));
});
test("Image.morph_dilate", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.morph_dilate("L1", 1));
});
test("Image.morph_erode", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.morph_erode("L1", 1));
});
test("Image.morph_open", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.morph_open("L1", 1));
});
test("Image.gaussian_noise", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.gaussian_noise(1, 1, 1));
});
test("Image.salt_and_pepper_noise", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.salt_and_pepper_noise(1, 1));
});
test("Image.connected_components", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.connected_components("Four", 1));
});
test("Image.shrink_width", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.shrink_width(50));
}); ///////////////////////////////////////////////////////////////////////////////
// GRAY-IMAGE-U32
///////////////////////////////////////////////////////////////////////////////

test("GrayImageU32.map", async () => {
  let f = (x, y, px) => {
    return px;
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.connected_components("Four", 1)).then(x => x.map_luma(f));
});
test("GrayImageU32.reduce_luma", async () => {
  let f = (acc, x, y, px) => {
    return acc + 1;
  };

  return _index.Image.create(100, 100, "rgba").then(x => x.connected_components("Four", 1)).then(x => x.reduce_luma(0, f));
});
test("GrayImageU32.grayimage_u32_to_image", async () => {
  return _index.Image.create(100, 100, "rgba").then(x => x.connected_components("Four", 1)).then(x => x.to_image());
});