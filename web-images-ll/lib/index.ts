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

type ImageFormat = "jpeg" | "jpg" | "png" | "gif" | "webp" | "pnm" | "tiff" | "tga" | "bmp" | "ico" | "hdr";


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
    return foreign.image_resize(image, args);
}

export function blur(image: Image, sigma: Number): Promise<Image> {
    return foreign.image_resize(image, sigma);
}

export function unsharpen(image: Image, sigma: Number, threshold: Number): Promise<Image> {
    return foreign.image_unsharpen(image, sigma, threshold);
}

export type Kernel3x3 = [Number, Number, Number, Number, Number, Number, Number, Number, Number];

export function filter3x3(image: Image, kernel: Kernel3x3): Promise<Image> {
    return foreign.image_filter3x3(image, kernel);
}

export function contrast(image: Image, contrast: Number): Promise<Image> {
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

export function save(image: Image, path: String): Promise<Image> {
    return foreign.image_save(image, path);
}

export function save_with_format(image: Image, path: String, format: ImageFormat): Promise<Image> {
    return foreign.image_save(image, path, format);
}

///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - TRAVERSAL
///////////////////////////////////////////////////////////////////////////////


/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function map_rgba(
    image: Image,
    f: (x: number, y: number, px: Array<number>) => Array<number>
): Promise<Image> {
    return foreign.image_map_rgba(image, f);
}


/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function reduce_rgba<T>(
    image: Image,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: Array<number>) => T
): Promise<Image> {
    return foreign.image_reduce_rgba(image, initial_value, f);
}


/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function map_luma(
    image: Image,
    f: (x: number, y: number, px: number) => number
): Promise<Image> {
    return foreign.image_map_luma(image, f);
}


/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function reduce_luma<T>(
    image: Image,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: number) => T
): Promise<Image> {
    return foreign.image_reduce_luma(image, initial_value, f);
}


/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function grayimage_u32_map(
    image: GrayImageU32,
    f: (x: number, y: number, px: number) => number
): Promise<GrayImageU32> {
    return foreign.grayimage_u32_map(image, f);
}

/**
 * According to my current understanding of NAPI and it’s technical limitations:
 * 
 * Running the supplied function argument off of the main thread as an asynchronous
 * callback would perhaps severely abuse the event queue with each pixel in the
 * input image. Since I presume this will negatively impact performance this runs
 * synchronously on the current thread. 
 * 
 * Nevertheless this still returns a 'Promise' to allow for such future optimizations
 * without breaking the public API. 
 */
export function grayimage_u32_reduce<T>(
    image: GrayImageU32,
    initial_value: T,
    f: (accumulator: T, x: number, y: number, px: number) => T
): Promise<GrayImageU32> {
    return foreign.grayimage_u32_reduce(image, initial_value, f);
}

///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - CONVERSION
///////////////////////////////////////////////////////////////////////////////

export function grayimage_u32_to_image<T>(image: GrayImageU32): Promise<Image> {
    return foreign.grayimage_u32_to_image(image);
}


///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - ADVANCED PROCESSING
///////////////////////////////////////////////////////////////////////////////

export function adaptive_threshold(image: Image): Promise<Image> {
    throw "todo";
}

export function equalize_histogram(image: Image): Promise<Image> {
    throw "todo";
}

export function match_histogram(image: Image): Promise<Image> {
    throw "todo";
}

export function otsu_level(image: Image): Promise<Image> {
    throw "todo";
}

export function stretch_contrast(image: Image): Promise<Image> {
    throw "todo";
}

export function threshold(image: Image): Promise<Image> {
    throw "todo";
}

export function distance_transform(image: Image): Promise<Image> {
    throw "todo";
}

export function canny(image: Image): Promise<Image> {
    throw "todo";
}

export function box_filter(image: Image): Promise<Image> {
    throw "todo";
}

export function gaussian_blur_f32(image: Image): Promise<Image> {
    throw "todo";
}

export function horizontal_filter(image: Image): Promise<Image> {
    throw "todo";
}

export function median_filter(image: Image): Promise<Image> {
    throw "todo";
}

export function separable_filter(image: Image): Promise<Image> {
    throw "todo";
}

export function separable_filter_equal(image: Image): Promise<Image> {
    throw "todo";
}

export function sharpen3x3(image: Image): Promise<Image> {
    throw "todo";
}

export function sharpen_gaussian(image: Image): Promise<Image> {
    throw "todo";
}

export function vertical_filter(image: Image): Promise<Image> {
    throw "todo";
}

export function morph_close(image: Image): Promise<Image> {
    throw "todo";
}

export function morph_dilate(image: Image): Promise<Image> {
    throw "todo";
}

export function morph_erode(image: Image): Promise<Image> {
    throw "todo";
}

export function morph_open(image: Image): Promise<Image> {
    throw "todo";
}

export function gaussian_noise(image: Image): Promise<Image> {
    throw "todo";
}

export function salt_and_pepper_noise(image: Image): Promise<Image> {
    throw "todo";
}

export function connected_components(image: Image): Promise<Image> {
    throw "todo";
}

export function shrink_width(image: Image): Promise<Image> {
    throw "todo";
}




///////////////////////////////////////////////////////////////////////////////
// DEV
///////////////////////////////////////////////////////////////////////////////

let root_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max";
let h1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/h1";
let h2_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/h2";
let l0_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l0";
let l1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l1";
let l2_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l2";
let m1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/m1";


function process(image_path: string) {
    let f = (x: number, y: number, px: Array<number>): Array<number> => {
        // console.log("pos: ", x, y);
        return [0, 0, 0, 0];
    };
    let g = (accumulator: number, x: number, y: number, px: Array<number>): number => {
        return accumulator + 1;
    };
    open(image_path)
        // .then(x => image_map_rgba(x, f))
        .then(x => reduce_rgba(x, 0, g))
        .then(x => console.log(x));
}

// function run_all(content_dir: string) {
//     fs  .promises
//         .readdir(content_dir, {withFileTypes: true})
//         .then(xs => {
//             let ys = xs
//                 .filter(file => file.isFile())
//                 .map(file => path.join(content_dir, file.name))
//                 .forEach(file => process(file));
//         });
// }

// run_all(l0_path);

process("EJR-lolXzJyeXn.jpeg");



// let result = foreign
//     .open_async("EJR-lolXzJyeXn.jpeg")
//     .catch((x: any) => {
//         console.log("done: error");
//         console.log("data: ", x);
//     })
//     .then((x: any) => {
//         console.log("done: ok");
//         console.log("data: ", x);
//     });

