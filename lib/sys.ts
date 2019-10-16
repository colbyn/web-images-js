import fs, { Dirent } from "fs";
import path from "path";

// @ts-ignore
import foreign from "../build/Release/web_images_napi.node";


///////////////////////////////////////////////////////////////////////////////
// IMAGE TYPES
///////////////////////////////////////////////////////////////////////////////

/**
 * A decoded dynamic image.
 */
export interface Image {
    readonly type: "Image",
    readonly ptr: any,
}

/**
 * A decoded grayscale image.
 * Primarily used in more advanced image processing pipelines.
 * Laymen users are probably looking for the 'Image' type.
 * 
 * Each pixel is a 32-bit unsigned integer,
 * primarily used for representing labeled images/regions.
 * 
 */
export interface GrayImageU32 {
    readonly type: "GrayImageU32",
    readonly ptr: any,
}

export interface Resolution {
    readonly width: Number,
    readonly height: Number,
}

export type ImageFormat = "jpeg" | "jpg" | "png" | "gif" | "webp" | "pnm" | "tiff" | "tga" | "bmp" | "ico" | "hdr";


///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - CORE
///////////////////////////////////////////////////////////////////////////////

export function open(path: string): Promise<Image> {
    return foreign.image_open(path);
}

export function open_with_format(path: string, format: ImageFormat): Promise<Image> {
    return foreign.image_open_with_format(path, format);
}

export interface NewArgs {
    width: Number,
    height: Number,
    pixel_type: "rgba" | "rgb" | "luma",
}

export function new_image(args: NewArgs): Promise<Image> {
    return foreign.image_new(args);
}

export function dimensions(image: Image): Promise<Resolution> {
    return foreign.image_dimensions(image);
}

export interface CropArgs {
    cx: Number,
    cy: Number,
    width: Number,
    height: Number,
}

export function crop(args: CropArgs): Promise<Image> {
    return foreign.image_crop(args);
}

export interface ColorInfo {
    pixel_type: String,
    bit_depth: Number,
}

export function color(image: Image): Promise<ColorInfo> {
    return foreign.image_color(image);
}

export function grayscale(image: Image): Promise<Image> {
    return foreign.image_grayscale(image);
}

export function invert(image: Image): Promise<Image> {
    return foreign.image_invert(image);
}

export interface ResizeArgs {
    width: Number,
    height: Number,
    filter_type: "Nearest" | "Triangle" | "CatmullRom" | "Gaussian" | "Lanczos3",
    resize_exact: Boolean,
}

export function resize(image: Image, args: ResizeArgs): Promise<Image> {
    return foreign.image_resize(image, args);
}

export interface ThumbnailArgs {
    width: Number,
    height: Number,
    resize_exact: Boolean,
}

export function thumbnail(image: Image, args: ThumbnailArgs): Promise<Image> {
    return foreign.image_thumbnail(image, args);
}

export function blur(image: Image, sigma: Number): Promise<Image> {
    return foreign.image_blur(image, sigma);
}

export function unsharpen(image: Image, sigma: Number, threshold: Number): Promise<Image> {
    return foreign.image_unsharpen(image, sigma, threshold);
}

export type Kernel3x3 = [Number, Number, Number, Number, Number, Number, Number, Number, Number];

export function filter3x3(image: Image, kernel: Kernel3x3): Promise<Image> {
    return foreign.image_filter3x3(image, kernel);
}

export function adjust_contrast(image: Image, contrast: Number): Promise<Image> {
    return foreign.image_adjust_contrast(image, contrast);
}

export function brighten(image: Image, value: Number): Promise<Image> {
    return foreign.image_brighten(image, value);
}

export function huerotate(image: Image, value: Number): Promise<Image> {
    return foreign.image_huerotate(image, value);
}

export function flipv(image: Image): Promise<Image> {
    return foreign.image_flipv(image);
}

export function fliph(image: Image): Promise<Image> {
    return foreign.image_fliph(image);
}

export function rotate90(image: Image): Promise<Image> {
    return foreign.image_rotate90(image);
}

export function rotate180(image: Image): Promise<Image> {
    return foreign.image_rotate180(image);
}

export function rotate270(image: Image): Promise<Image> {
    return foreign.image_rotate270(image);
}

export function save(image: Image, path: String): Promise<null> {
    return foreign.image_save(image, path);
}

export function save_with_format(image: Image, path: String, format: ImageFormat): Promise<null> {
    return foreign.image_save(image, path, format);
}

///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - TRAVERSAL
///////////////////////////////////////////////////////////////////////////////

export function map_rgba(
    image: Image,
    f: (x: number, y: number, px: Array<number>) => Array<number>
): Promise<Image> {
    return foreign.image_map_rgba(image, f);
}

export function reduce_rgba<T>(
    image: Image,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: Array<number>) => T
): Promise<T> {
    return foreign.image_reduce_rgba(image, initial_value, f);
}

export function map_luma(
    image: Image,
    f: (x: number, y: number, px: number) => number
): Promise<Image> {
    return foreign.image_map_luma(image, f);
}

export function reduce_luma<T>(
    image: Image,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: number) => T
): Promise<T> {
    return foreign.image_reduce_luma(image, initial_value, f);
}


export function grayimage_u32_map(
    image: GrayImageU32,
    f: (x: number, y: number, px: number) => number
): Promise<GrayImageU32> {
    return foreign.grayimage_u32_map(image, f);
}

export function grayimage_u32_reduce<T>(
    image: GrayImageU32,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: number) => T
): Promise<T> {
    return foreign.grayimage_u32_reduce(image, initial_value, f);
}

///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - CONVERSION
///////////////////////////////////////////////////////////////////////////////

export function grayimage_u32_to_image(image: GrayImageU32): Promise<Image> {
    return foreign.grayimage_u32_to_image(image);
}


///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - ADVANCED PROCESSING
///////////////////////////////////////////////////////////////////////////////


export function adaptive_threshold(image: Image, block_radius: Number): Promise<Image> {
    return foreign.adaptive_threshold(image, block_radius);
}

export function equalize_histogram(image: Image): Promise<Image> {
    return foreign.equalize_histogram(image, undefined);
}

export function match_histogram(image: Image, target: Image): Promise<Image> {
    return foreign.match_histogram(image, target);
}

export function otsu_level(image: Image): Promise<Image> {
    return foreign.otsu_level(image);
}

export function stretch_contrast(image: Image, lower: Number, upper: Number): Promise<Image> {
    return foreign.stretch_contrast(image, lower, upper);
}

export function threshold(image: Image, thresh: Number): Promise<Image> {
    return foreign.threshold(image, thresh);
}

export function distance_transform(image: Image, norm: "L1" | "LInf"): Promise<Image> {
    return foreign.distance_transform(image, norm);
}

export function canny(image: Image, low_threshold: Number, high_threshold: Number): Promise<Image> {
    return foreign.canny(image, low_threshold, high_threshold);
}

export function box_filter(image: Image, x_radius: Number, y_radius: Number): Promise<Image> {
    return foreign.box_filter(image, x_radius, y_radius);
}

export function gaussian_blur_f32(image: Image, sigma: Number): Promise<Image> {
    return foreign.gaussian_blur_f32(image, sigma);
}

export function horizontal_filter(image: Image, kernel: Array<Number>): Promise<Image> {
    return foreign.horizontal_filter(image, kernel);
}

export function median_filter(image: Image, x_radius: Number, y_radius: Number): Promise<Image> {
    return foreign.median_filter(image, x_radius, y_radius);
}

export function separable_filter(image: Image, h_kernel: Array<Number>, v_kernel: Array<Number>): Promise<Image> {
    return foreign.separable_filter(image, h_kernel, v_kernel);
}

export function separable_filter_equal(image: Image, kernel: Array<Number>): Promise<Image> {
    return foreign.separable_filter_equal(image, kernel);
}

export function sharpen3x3(image: Image): Promise<Image> {
    return foreign.sharpen3x3(image);
}

export function sharpen_gaussian(image: Image, sigma: Number, amount: Number): Promise<Image> {
    return foreign.sharpen_gaussian(image, sigma, amount);
}

export function vertical_filter(image: Image, kernel: Array<Number>): Promise<Image> {
    return foreign.vertical_filter(image, kernel);
}

export function morph_close(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image> {
    return foreign.morph_close(image, norm, k);
}

export function morph_dilate(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image> {
    return foreign.morph_dilate(image, norm, k);
}

export function morph_erode(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image> {
    return foreign.morph_erode(image, norm, k);
}

export function morph_open(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image> {
    return foreign.morph_open(image, norm, k);
}

export function gaussian_noise(image: Image, mean: Number, stddev: Number, seed: Number): Promise<Image> {
    return foreign.gaussian_noise(image, mean, stddev, seed);
}

export function salt_and_pepper_noise(image: Image, rate: Number, seed: Number): Promise<Image> {
    return foreign.salt_and_pepper_noise(image, rate, seed);
}

export function connected_components(image: Image, conn: "Four" | "Eight", background: Number): Promise<Image> {
    return foreign.connected_components(image, conn, background);
}

export function shrink_width(image: Image, target_width: Number): Promise<Image> {
    return foreign.shrink_width(image, target_width);
}


