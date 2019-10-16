/**
 * A decoded dynamic image.
 */
export interface Image {
    readonly type: "Image";
    readonly ptr: any;
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
    readonly type: "GrayImageU32";
    readonly ptr: any;
}
export interface Resolution {
    readonly width: Number;
    readonly height: Number;
}
export declare type ImageFormat = "jpeg" | "jpg" | "png" | "gif" | "webp" | "pnm" | "tiff" | "tga" | "bmp" | "ico" | "hdr";
export declare function open(path: String): Promise<Image>;
export declare function open_with_format(path: String, format: ImageFormat): Promise<Image>;
export interface NewArgs {
    width: Number;
    height: Number;
    pixel_type: "rgba" | "rgb" | "luma";
}
export declare function new_image(args: NewArgs): Promise<Image>;
export declare function dimensions(image: Image): Promise<Resolution>;
export interface CropArgs {
    cx: Number;
    cy: Number;
    width: Number;
    height: Number;
}
export declare function crop(args: CropArgs): Promise<Image>;
export interface ColorInfo {
    pixel_type: String;
    bit_depth: Number;
}
export declare function color(image: Image): Promise<ColorInfo>;
export declare function grayscale(image: Image): Promise<Image>;
export declare function invert(image: Image): Promise<Image>;
export interface ResizeArgs {
    width: Number;
    height: Number;
    filter_type: "Nearest" | "Triangle" | "CatmullRom" | "Gaussian" | "Lanczos3";
    resize_exact: Boolean;
}
export declare function resize(image: Image, args: ResizeArgs): Promise<Image>;
export interface ThumbnailArgs {
    width: Number;
    height: Number;
    resize_exact: Boolean;
}
export declare function thumbnail(image: Image, args: ThumbnailArgs): Promise<Image>;
export declare function blur(image: Image, sigma: Number): Promise<Image>;
export declare function unsharpen(image: Image, sigma: Number, threshold: Number): Promise<Image>;
export declare type Kernel3x3 = [Number, Number, Number, Number, Number, Number, Number, Number, Number];
export declare function filter3x3(image: Image, kernel: Kernel3x3): Promise<Image>;
export declare function adjust_contrast(image: Image, contrast: Number): Promise<Image>;
export declare function brighten(image: Image, value: Number): Promise<Image>;
export declare function huerotate(image: Image, value: Number): Promise<Image>;
export declare function flipv(image: Image): Promise<Image>;
export declare function fliph(image: Image): Promise<Image>;
export declare function rotate90(image: Image): Promise<Image>;
export declare function rotate180(image: Image): Promise<Image>;
export declare function rotate270(image: Image): Promise<Image>;
export declare function save(image: Image, path: String): Promise<null>;
export declare function save_with_format(image: Image, path: String, format: ImageFormat): Promise<null>;
export declare function map_rgba(image: Image, f: (x: number, y: number, px: Array<number>) => Array<number>): Promise<Image>;
export declare function reduce_rgba<T>(image: Image, initial_value: T, f: (accumulator: T, x: number, y: number, px: Array<number>) => T): Promise<T>;
export declare function map_luma(image: Image, f: (x: number, y: number, px: number) => number): Promise<Image>;
export declare function reduce_luma<T>(image: Image, initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T>;
export declare function grayimage_u32_map(image: GrayImageU32, f: (x: number, y: number, px: number) => number): Promise<GrayImageU32>;
export declare function grayimage_u32_reduce<T>(image: GrayImageU32, initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T>;
export declare function grayimage_u32_to_image(image: GrayImageU32): Promise<Image>;
export declare function adaptive_threshold(image: Image, block_radius: Number): Promise<Image>;
export declare function equalize_histogram(image: Image): Promise<Image>;
export declare function match_histogram(image: Image, target: Image): Promise<Image>;
export declare function otsu_level(image: Image): Promise<Image>;
export declare function stretch_contrast(image: Image, lower: Number, upper: Number): Promise<Image>;
export declare function threshold(image: Image, thresh: Number): Promise<Image>;
export declare function distance_transform(image: Image, norm: "L1" | "LInf"): Promise<Image>;
export declare function canny(image: Image, low_threshold: Number, high_threshold: Number): Promise<Image>;
export declare function box_filter(image: Image, x_radius: Number, y_radius: Number): Promise<Image>;
export declare function gaussian_blur_f32(image: Image, sigma: Number): Promise<Image>;
export declare function horizontal_filter(image: Image, kernel: Array<Number>): Promise<Image>;
export declare function median_filter(image: Image, x_radius: Number, y_radius: Number): Promise<Image>;
export declare function separable_filter(image: Image, h_kernel: Array<Number>, v_kernel: Array<Number>): Promise<Image>;
export declare function separable_filter_equal(image: Image, kernel: Array<Number>): Promise<Image>;
export declare function sharpen3x3(image: Image): Promise<Image>;
export declare function sharpen_gaussian(image: Image, sigma: Number, amount: Number): Promise<Image>;
export declare function vertical_filter(image: Image, kernel: Array<Number>): Promise<Image>;
export declare function morph_close(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image>;
export declare function morph_dilate(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image>;
export declare function morph_erode(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image>;
export declare function morph_open(image: Image, norm: "L1" | "LInf", k: Number): Promise<Image>;
export declare function gaussian_noise(image: Image, mean: Number, stddev: Number, seed: Number): Promise<Image>;
export declare function salt_and_pepper_noise(image: Image, rate: Number, seed: Number): Promise<Image>;
export declare function connected_components(image: Image, conn: "Four" | "Eight", background: Number): Promise<Image>;
export declare function shrink_width(image: Image, target_width: Number): Promise<Image>;
