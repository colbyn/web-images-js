"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ImageFormat", {
  enumerable: true,
  get: function () {
    return sys.ImageFormat;
  }
});
Object.defineProperty(exports, "Kernel3x3", {
  enumerable: true,
  get: function () {
    return sys.Kernel3x3;
  }
});
Object.defineProperty(exports, "ResizeArgs", {
  enumerable: true,
  get: function () {
    return sys.ResizeArgs;
  }
});
Object.defineProperty(exports, "ThumbnailArgs", {
  enumerable: true,
  get: function () {
    return sys.ThumbnailArgs;
  }
});
exports.GrayImageU32 = exports.Image = void 0;

var sys = _interopRequireWildcard(require("./sys"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Image {
  constructor(x) {
    _defineProperty(this, "handle", void 0);

    this.handle = x;
  } ///////////////////////////////////////////////////////////////////////////
  // BASICS
  ///////////////////////////////////////////////////////////////////////////


  static async open(path) {
    let img = await sys.open(path);
    return new Image(img);
  }

  static async open_with_format(path, format) {
    let img = await sys.open_with_format(path, format);
    return new Image(img);
  }

  static async create(width, height, pixel_type) {
    let img = await sys.create({
      width,
      height,
      pixel_type
    });
    return new Image(img);
  }

  async dimensions() {
    return sys.dimensions(this.handle);
  }

  async crop(cx, cy, width, height) {
    let crop_args = {
      cx,
      cy,
      width,
      height
    };
    return sys.crop(this.handle, crop_args).then(x => new Image(x));
  }

  async color() {
    return sys.color(this.handle);
  }

  async grayscale() {
    return sys.grayscale(this.handle).then(x => new Image(x));
  }

  async invert() {
    return sys.invert(this.handle).then(x => new Image(x));
  }

  async resize(args) {
    return sys.resize(this.handle, args).then(x => new Image(x));
  }

  async thumbnail(args) {
    return sys.thumbnail(this.handle, args).then(x => new Image(x));
  }

  async blur(sigma) {
    return sys.blur(this.handle, sigma).then(x => new Image(x));
  }

  async unsharpen(sigma, threshold) {
    return sys.unsharpen(this.handle, sigma, threshold).then(x => new Image(x));
  }

  async filter3x3(kernel) {
    return sys.filter3x3(this.handle, kernel).then(x => new Image(x));
  }

  async adjust_contrast(contrast) {
    return sys.adjust_contrast(this.handle, contrast).then(x => new Image(x));
  }

  async brighten(value) {
    return sys.brighten(this.handle, value).then(x => new Image(x));
  }

  async huerotate(value) {
    return sys.huerotate(this.handle, value).then(x => new Image(x));
  }

  async flipv() {
    return sys.flipv(this.handle).then(x => new Image(x));
  }

  async fliph() {
    return sys.fliph(this.handle).then(x => new Image(x));
  }

  async rotate90() {
    return sys.rotate90(this.handle).then(x => new Image(x));
  }

  async rotate180() {
    return sys.rotate180(this.handle).then(x => new Image(x));
  }

  async rotate270() {
    return sys.rotate270(this.handle).then(x => new Image(x));
  }

  async save(path) {
    return sys.save(this.handle, path);
  }

  async save_with_format(path, format) {
    return sys.save_with_format(this.handle, path, format);
  } ///////////////////////////////////////////////////////////////////////////
  // TRAVERSAL
  ///////////////////////////////////////////////////////////////////////////


  async map_rgba(f) {
    return sys.map_rgba(this.handle, f).then(x => new Image(x));
  }

  async reduce_rgba(initial_value, f) {
    return sys.reduce_rgba(this.handle, initial_value, f);
  }

  async map_luma(f) {
    return sys.map_luma(this.handle, f).then(x => new Image(x));
  }

  async reduce_luma(initial_value, f) {
    return sys.reduce_luma(this.handle, initial_value, f);
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - CONTRAST
  ///////////////////////////////////////////////////////////////////////////


  async adaptive_threshold(block_radius) {
    return sys.adaptive_threshold(this.handle, block_radius).then(x => new Image(x));
  }

  async equalize_histogram() {
    return sys.equalize_histogram(this.handle).then(x => new Image(x));
  }

  async match_histogram(target) {
    return sys.match_histogram(this.handle, target.handle).then(x => new Image(x));
  }

  async otsu_level() {
    return sys.otsu_level(this.handle).then(x => new Image(x));
  }

  async stretch_contrast(lower, upper) {
    return sys.stretch_contrast(this.handle, lower, upper).then(x => new Image(x));
  }

  async threshold(thresh) {
    return sys.threshold(this.handle, thresh).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - CORNERS
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - DISTANCE-TRANSFORM
  ///////////////////////////////////////////////////////////////////////////


  async distance_transform(norm) {
    return sys.distance_transform(this.handle, norm).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - DRAWING
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - EDGES
  ///////////////////////////////////////////////////////////////////////////


  async canny(low_threshold, high_threshold) {
    return sys.canny(this.handle, low_threshold, high_threshold).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - FILTER
  ///////////////////////////////////////////////////////////////////////////


  async box_filter(x_radius, y_radius) {
    return sys.box_filter(this.handle, x_radius, y_radius).then(x => new Image(x));
  }

  async gaussian_blur_f32(sigma) {
    return sys.gaussian_blur_f32(this.handle, sigma).then(x => new Image(x));
  }

  async horizontal_filter(kernel) {
    return sys.horizontal_filter(this.handle, kernel).then(x => new Image(x));
  }

  async median_filter(x_radius, y_radius) {
    return sys.median_filter(this.handle, x_radius, y_radius).then(x => new Image(x));
  }

  async separable_filter(h_kernel, v_kernel) {
    return sys.separable_filter(this.handle, h_kernel, v_kernel).then(x => new Image(x));
  }

  async separable_filter_equal(kernel) {
    return sys.separable_filter_equal(this.handle, kernel).then(x => new Image(x));
  }

  async sharpen3x3() {
    return sys.sharpen3x3(this.handle).then(x => new Image(x));
  }

  async sharpen_gaussian(sigma, amount) {
    return sys.sharpen_gaussian(this.handle, sigma, amount).then(x => new Image(x));
  }

  async vertical_filter(kernel) {
    return sys.vertical_filter(this.handle, kernel).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - GEOMETRIC-TRANSFORMATIONS
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - GRADIENTS
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - HAAR
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - HOG
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - HOUGH
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - INTEGRAL-IMAGE
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - LOCAL-BINARY-PATTERNS
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - MAP
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - MATH
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - MORPHOLOGY
  ///////////////////////////////////////////////////////////////////////////


  async morph_close(norm, k) {
    return sys.morph_close(this.handle, norm, k).then(x => new Image(x));
  }

  async morph_dilate(norm, k) {
    return sys.morph_close(this.handle, norm, k).then(x => new Image(x));
  }

  async morph_erode(norm, k) {
    return sys.morph_close(this.handle, norm, k).then(x => new Image(x));
  }

  async morph_open(norm, k) {
    return sys.morph_close(this.handle, norm, k).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - NOISE
  ///////////////////////////////////////////////////////////////////////////


  async gaussian_noise(mean, stddev, seed) {
    return sys.gaussian_noise(this.handle, mean, stddev, seed).then(x => new Image(x));
  }

  async salt_and_pepper_noise(rate, seed) {
    return sys.salt_and_pepper_noise(this.handle, rate, seed).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - PIXELOPS
  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - PROPERTY_TESTING
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - RECT
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - REGION-LABELLING
  ///////////////////////////////////////////////////////////////////////////////


  async connected_components(conn, background) {
    return sys.connected_components(this.handle, conn, background).then(x => new GrayImageU32(x));
  } ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - SEAM-CARVING
  ///////////////////////////////////////////////////////////////////////////////


  async shrink_width(target_width) {
    return sys.shrink_width(this.handle, target_width).then(x => new Image(x));
  } ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - STATS
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - SUPPRESS
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - TEMPLATE-MATCHING
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - UNION-FIND
  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // ADVANCED PROCESSING - UTILS
  ///////////////////////////////////////////////////////////////////////////////


}

exports.Image = Image;

class GrayImageU32 {
  constructor(x) {
    _defineProperty(this, "handle", void 0);

    this.handle = x;
  } ///////////////////////////////////////////////////////////////////////////
  // TRAVERSAL
  ///////////////////////////////////////////////////////////////////////////


  async map_luma(f) {
    return sys.grayimage_u32_map(this.handle, f).then(x => new GrayImageU32(x));
  }

  async reduce_luma(initial_value, f) {
    return sys.grayimage_u32_reduce(this.handle, initial_value, f);
  } ///////////////////////////////////////////////////////////////////////////
  // CONVERSION
  ///////////////////////////////////////////////////////////////////////////


  async to_image() {
    return sys.grayimage_u32_to_image(this.handle).then(x => new Image(x));
  }

}

exports.GrayImageU32 = GrayImageU32;