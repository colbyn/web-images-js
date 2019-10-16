"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.open = open;
exports.open_with_format = open_with_format;
exports.new_image = new_image;
exports.dimensions = dimensions;
exports.crop = crop;
exports.color = color;
exports.grayscale = grayscale;
exports.invert = invert;
exports.resize = resize;
exports.thumbnail = thumbnail;
exports.blur = blur;
exports.unsharpen = unsharpen;
exports.filter3x3 = filter3x3;
exports.contrast = contrast;
exports.brighten = brighten;
exports.huerotate = huerotate;
exports.flipv = flipv;
exports.fliph = fliph;
exports.rotate90 = rotate90;
exports.rotate180 = rotate180;
exports.rotate270 = rotate270;
exports.save = save;
exports.save_with_format = save_with_format;
exports.map_rgba = map_rgba;
exports.reduce_rgba = reduce_rgba;
exports.map_luma = map_luma;
exports.reduce_luma = reduce_luma;
exports.grayimage_u32_map = grayimage_u32_map;
exports.grayimage_u32_reduce = grayimage_u32_reduce;
exports.grayimage_u32_to_image = grayimage_u32_to_image;
exports.adaptive_threshold = adaptive_threshold;
exports.equalize_histogram = equalize_histogram;
exports.match_histogram = match_histogram;
exports.otsu_level = otsu_level;
exports.stretch_contrast = stretch_contrast;
exports.threshold = threshold;
exports.distance_transform = distance_transform;
exports.canny = canny;
exports.box_filter = box_filter;
exports.gaussian_blur_f32 = gaussian_blur_f32;
exports.horizontal_filter = horizontal_filter;
exports.median_filter = median_filter;
exports.separable_filter = separable_filter;
exports.separable_filter_equal = separable_filter_equal;
exports.sharpen3x3 = sharpen3x3;
exports.sharpen_gaussian = sharpen_gaussian;
exports.vertical_filter = vertical_filter;
exports.morph_close = morph_close;
exports.morph_dilate = morph_dilate;
exports.morph_erode = morph_erode;
exports.morph_open = morph_open;
exports.gaussian_noise = gaussian_noise;
exports.salt_and_pepper_noise = salt_and_pepper_noise;
exports.connected_components = connected_components;
exports.shrink_width = shrink_width;

var _web_images_napi = _interopRequireDefault(require("../build/Release/web_images_napi.node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @ts-ignore
///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - CORE
///////////////////////////////////////////////////////////////////////////////
function open(path) {
  return _web_images_napi.default.image_open(path);
}

function open_with_format(path, format) {
  return _web_images_napi.default.image_open_with_format(path, format);
}

function new_image(args) {
  return _web_images_napi.default.image_new(args);
}

function dimensions(image) {
  return _web_images_napi.default.image_dimensions(image);
}

function crop(args) {
  return _web_images_napi.default.image_crop(args);
}

function color(image) {
  return _web_images_napi.default.image_color(image);
}

function grayscale(image) {
  return _web_images_napi.default.image_grayscale(image);
}

function invert(image) {
  return _web_images_napi.default.image_invert(image);
}

function resize(image, args) {
  return _web_images_napi.default.image_resize(image, args);
}

function thumbnail(image, args) {
  return _web_images_napi.default.image_resize(image, args);
}

function blur(image, sigma) {
  return _web_images_napi.default.image_resize(image, sigma);
}

function unsharpen(image, sigma, threshold) {
  return _web_images_napi.default.image_unsharpen(image, sigma, threshold);
}

function filter3x3(image, kernel) {
  return _web_images_napi.default.image_filter3x3(image, kernel);
}

function contrast(image, contrast) {
  return _web_images_napi.default.image_adjust_contrast(image, contrast);
}

function brighten(image, value) {
  return _web_images_napi.default.image_brighten(image, value);
}

function huerotate(image, value) {
  return _web_images_napi.default.image_huerotate(image, value);
}

function flipv(image) {
  return _web_images_napi.default.image_flipv(image);
}

function fliph(image) {
  return _web_images_napi.default.image_fliph(image);
}

function rotate90(image) {
  return _web_images_napi.default.image_rotate90(image);
}

function rotate180(image) {
  return _web_images_napi.default.image_rotate180(image);
}

function rotate270(image) {
  return _web_images_napi.default.image_rotate270(image);
}

function save(image, path) {
  return _web_images_napi.default.image_save(image, path);
}

function save_with_format(image, path, format) {
  return _web_images_napi.default.image_save(image, path, format);
} ///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - TRAVERSAL
///////////////////////////////////////////////////////////////////////////////


function map_rgba(image, f) {
  return _web_images_napi.default.image_map_rgba(image, f);
}

function reduce_rgba(image, initial_value, f) {
  return _web_images_napi.default.image_reduce_rgba(image, initial_value, f);
}

function map_luma(image, f) {
  return _web_images_napi.default.image_map_luma(image, f);
}

function reduce_luma(image, initial_value, f) {
  return _web_images_napi.default.image_reduce_luma(image, initial_value, f);
}

function grayimage_u32_map(image, f) {
  return _web_images_napi.default.grayimage_u32_map(image, f);
}

function grayimage_u32_reduce(image, initial_value, f) {
  return _web_images_napi.default.grayimage_u32_reduce(image, initial_value, f);
} ///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - CONVERSION
///////////////////////////////////////////////////////////////////////////////


function grayimage_u32_to_image(image) {
  return _web_images_napi.default.grayimage_u32_to_image(image);
} ///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - ADVANCED PROCESSING
///////////////////////////////////////////////////////////////////////////////


function adaptive_threshold(image, block_radius) {
  return _web_images_napi.default.adaptive_threshold(image, block_radius);
}

function equalize_histogram(image) {
  return _web_images_napi.default.equalize_histogram(image, undefined);
}

function match_histogram(image, target) {
  return _web_images_napi.default.match_histogram(image, target);
}

function otsu_level(image) {
  return _web_images_napi.default.otsu_level(image);
}

function stretch_contrast(image, lower, upper) {
  return _web_images_napi.default.stretch_contrast(image, lower, upper);
}

function threshold(image, thresh) {
  return _web_images_napi.default.threshold(image, thresh);
}

function distance_transform(image, norm) {
  return _web_images_napi.default.distance_transform(image, norm);
}

function canny(image, low_threshold, high_threshold) {
  return _web_images_napi.default.canny(image, low_threshold, high_threshold);
}

function box_filter(image, x_radius, y_radius) {
  return _web_images_napi.default.box_filter(image, x_radius, y_radius);
}

function gaussian_blur_f32(image, sigma) {
  return _web_images_napi.default.gaussian_blur_f32(image, sigma);
}

function horizontal_filter(image, kernel) {
  return _web_images_napi.default.horizontal_filter(image, kernel);
}

function median_filter(image, x_radius, y_radius) {
  return _web_images_napi.default.median_filter(image, x_radius, y_radius);
}

function separable_filter(image, h_kernel, v_kernel) {
  return _web_images_napi.default.separable_filter(image, h_kernel, v_kernel);
}

function separable_filter_equal(image, kernel) {
  return _web_images_napi.default.separable_filter_equal(image, kernel);
}

function sharpen3x3(image) {
  return _web_images_napi.default.sharpen3x3(image);
}

function sharpen_gaussian(image, sigma, amount) {
  return _web_images_napi.default.sharpen_gaussian(image, sigma, amount);
}

function vertical_filter(image, kernel) {
  return _web_images_napi.default.vertical_filter(image, undefined);
}

function morph_close(image, norm, k) {
  return _web_images_napi.default.morph_close(image, norm, k);
}

function morph_dilate(image, norm, k) {
  return _web_images_napi.default.morph_dilate(image, norm, k);
}

function morph_erode(image, norm, k) {
  return _web_images_napi.default.morph_erode(image, norm, k);
}

function morph_open(image, norm, k) {
  return _web_images_napi.default.morph_open(image, norm, k);
}

function gaussian_noise(image, mean, stddev, seed) {
  return _web_images_napi.default.gaussian_noise(image, undefined);
}

function salt_and_pepper_noise(image, rate, seed) {
  return _web_images_napi.default.salt_and_pepper_noise(image, undefined);
}

function connected_components(image, conn, background) {
  return _web_images_napi.default.connected_components(image, undefined);
}

function shrink_width(image, target_width) {
  return _web_images_napi.default.shrink_width(image, undefined);
}