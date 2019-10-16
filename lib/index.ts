import * as sys from "./sys";
export {ImageFormat, Kernel3x3, ResizeArgs, ThumbnailArgs} from "./sys";

export class Image {
    private handle!: sys.Image;
    constructor(x: sys.Image) {
        this.handle = x;
    }

    ///////////////////////////////////////////////////////////////////////////
    // BASICS
    ///////////////////////////////////////////////////////////////////////////

    static async open(path: string): Promise<Image> {
        let img =  await sys.open(path);
        return new Image(img);
    }
    
    static async open_with_format(path: string, format: sys.ImageFormat): Promise<Image> {
        let img = await sys.open_with_format(path, format);
        return new Image(img);
    }

    static async create(width: Number, height: Number, pixel_type: "rgba" | "rgb" | "luma"): Promise<Image> {
        let img = await sys.create({width, height, pixel_type});
        return new Image(img);
    }

    async dimensions(): Promise<sys.Resolution> {
        return sys.dimensions(this.handle);
    }

    async crop(cx: Number, cy: Number, width: Number, height: Number): Promise<Image> {
        let crop_args: sys.CropArgs = {cx, cy, width, height};
        return sys
            .crop(this.handle, crop_args)
            .then(x => new Image(x));
    }

    async color(): Promise<sys.ColorInfo> {
        return sys.color(this.handle);
    }
    
    async grayscale(): Promise<Image> {
        return sys.grayscale(this.handle).then(x => new Image(x));
    }
    
    async invert(): Promise<Image> {
        return sys
            .invert(this.handle)
            .then(x => new Image(x));
    }
    
    async resize(args: sys.ResizeArgs): Promise<Image> {
        return sys
            .resize(this.handle, args)
            .then(x => new Image(x));
    }
    
    async thumbnail(args: sys.ThumbnailArgs): Promise<Image> {
        return sys
            .thumbnail(this.handle, args)
            .then(x => new Image(x));
    }
    
    async blur(sigma: Number): Promise<Image> {
        return sys
            .blur(this.handle, sigma)
            .then(x => new Image(x));
    }
    
    async unsharpen(sigma: Number, threshold: Number): Promise<Image> {
        return sys
            .unsharpen(this.handle, sigma, threshold)
            .then(x => new Image(x));
    }
    
    async filter3x3(kernel: sys.Kernel3x3): Promise<Image> {
        return sys.filter3x3(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    async adjust_contrast(contrast: Number): Promise<Image> {
        return sys.adjust_contrast(this.handle, contrast)
            .then(x => new Image(x));
    }
    
    async brighten(value: Number): Promise<Image> {
        return sys
            .brighten(this.handle, value)
            .then(x => new Image(x));
    }
    
    async huerotate(value: Number): Promise<Image> {
        return sys
            .huerotate(this.handle, value)
            .then(x => new Image(x));
    }
    
    async flipv(): Promise<Image> {
        return sys
            .flipv(this.handle)
            .then(x => new Image(x));
    }
    
    async fliph(): Promise<Image> {
        return sys
            .fliph(this.handle)
            .then(x => new Image(x));
    }
    
    async rotate90(): Promise<Image> {
        return sys
            .rotate90(this.handle)
            .then(x => new Image(x));
    }
    
    async rotate180(): Promise<Image> {
        return sys
            .rotate180(this.handle)
            .then(x => new Image(x));
    }
    
    async rotate270(): Promise<Image> {
        return sys
            .rotate270(this.handle)
            .then(x => new Image(x));
    }
    
    async save(path: String): Promise<null> {
        return sys.save(this.handle, path);
    }
    
    async save_with_format(path: String, format: sys.ImageFormat): Promise<null> {
        return sys.save_with_format(this.handle, path, format);
    }


    ///////////////////////////////////////////////////////////////////////////
    // TRAVERSAL
    ///////////////////////////////////////////////////////////////////////////

    async map_rgba(f: (x: number, y: number, px: Array<number>) => Array<number>): Promise<Image> {
        return sys
            .map_rgba(this.handle, f)
            .then(x => new Image(x));
    }

    async reduce_rgba<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: Array<number>) => T): Promise<T> {
        return sys.reduce_rgba(this.handle, initial_value, f);
    }

    async map_luma(f: (x: number, y: number, px: number) => number): Promise<Image> {
        return sys
            .map_luma(this.handle, f)
            .then(x => new Image(x));
    }

    async reduce_luma<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T> {
        return sys.reduce_luma(this.handle, initial_value, f);
    }

    
    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - CONTRAST
    ///////////////////////////////////////////////////////////////////////////

    async adaptive_threshold(block_radius: Number): Promise<Image> {
        return sys
            .adaptive_threshold(this.handle, block_radius)
            .then(x => new Image(x));
    }
    
    async equalize_histogram(): Promise<Image> {
        return sys
            .equalize_histogram(this.handle)
            .then(x => new Image(x));
    }
    
    async match_histogram(target: Image): Promise<Image> {
        return sys
            .match_histogram(this.handle, target.handle)
            .then(x => new Image(x));
    }
    
    async otsu_level(): Promise<Image> {
        return sys
            .otsu_level(this.handle)
            .then(x => new Image(x));
    }
    
    async stretch_contrast(lower: Number, upper: Number): Promise<Image> {
        return sys
            .stretch_contrast(this.handle, lower, upper)
            .then(x => new Image(x));
    }
    
    async threshold(thresh: Number): Promise<Image> {
        return sys
            .threshold(this.handle, thresh)
            .then(x => new Image(x));
    }

    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - CORNERS
    ///////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - DISTANCE-TRANSFORM
    ///////////////////////////////////////////////////////////////////////////

    async distance_transform(norm: "L1" | "LInf"): Promise<Image> {
        return sys
            .distance_transform(this.handle, norm)
            .then(x => new Image(x));
    }

    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - DRAWING
    ///////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - EDGES
    ///////////////////////////////////////////////////////////////////////////

    async canny(low_threshold: Number, high_threshold: Number): Promise<Image> {
        return sys
            .canny(this.handle, low_threshold, high_threshold)
            .then(x => new Image(x));
    }


    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - FILTER
    ///////////////////////////////////////////////////////////////////////////

    async box_filter(x_radius: Number, y_radius: Number): Promise<Image> {
        return sys
            .box_filter(this.handle, x_radius, y_radius)
            .then(x => new Image(x));
    }
    
    async gaussian_blur_f32(sigma: Number): Promise<Image> {
        return sys
            .gaussian_blur_f32(this.handle, sigma)
            .then(x => new Image(x));
    }
    
    async horizontal_filter(kernel: Array<Number>): Promise<Image> {
        return sys
            .horizontal_filter(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    async median_filter(x_radius: Number, y_radius: Number): Promise<Image> {
        return sys
            .median_filter(this.handle, x_radius, y_radius)
            .then(x => new Image(x));
    }
    
    async separable_filter(h_kernel: Array<Number>, v_kernel: Array<Number>): Promise<Image> {
        return sys
            .separable_filter(this.handle, h_kernel, v_kernel)
            .then(x => new Image(x));
    }
    
    async separable_filter_equal(kernel: Array<Number>): Promise<Image> {
        return sys
            .separable_filter_equal(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    async sharpen3x3(): Promise<Image> {
        return sys
            .sharpen3x3(this.handle)
            .then(x => new Image(x));
    }
    
    async sharpen_gaussian(sigma: Number, amount: Number): Promise<Image> {
        return sys
            .sharpen_gaussian(this.handle, sigma, amount)
            .then(x => new Image(x));
    }
    
    async vertical_filter(kernel: Array<Number>): Promise<Image> {
        return sys
            .vertical_filter(this.handle, kernel)
            .then(x => new Image(x));
    }


    ///////////////////////////////////////////////////////////////////////////
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

    async morph_close(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    async morph_dilate(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    async morph_erode(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    async morph_open(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    

    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - NOISE
    ///////////////////////////////////////////////////////////////////////////
    async gaussian_noise(mean: Number, stddev: Number, seed: Number): Promise<Image> {
        return sys
            .gaussian_noise(this.handle, mean, stddev, seed)
            .then(x => new Image(x));
    }
    
    async salt_and_pepper_noise(rate: Number, seed: Number): Promise<Image> {
        return sys
            .salt_and_pepper_noise(this.handle, rate, seed)
            .then(x => new Image(x));
    }

    ///////////////////////////////////////////////////////////////////////////
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

    async connected_components(conn: "Four" | "Eight", background: Number): Promise<GrayImageU32> {
        return sys
            .connected_components(this.handle, conn, background)
            .then(x => new GrayImageU32(x));
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - SEAM-CARVING
    ///////////////////////////////////////////////////////////////////////////////

    async shrink_width(target_width: Number): Promise<Image> {
        return sys
            .shrink_width(this.handle, target_width)
            .then(x => new Image(x));
    }

    ///////////////////////////////////////////////////////////////////////////////
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



export class GrayImageU32 {
    private handle!: sys.GrayImageU32;
    constructor(x: sys.GrayImageU32) {
        this.handle = x;
    }

    ///////////////////////////////////////////////////////////////////////////
    // TRAVERSAL
    ///////////////////////////////////////////////////////////////////////////

    async map_luma(f: (x: number, y: number, px: number) => number): Promise<GrayImageU32> {
        return sys
            .grayimage_u32_map(this.handle, f)
            .then(x => new GrayImageU32(x));
    }

    async reduce_luma<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T> {
        return sys.grayimage_u32_reduce(this.handle, initial_value, f);
    }


    ///////////////////////////////////////////////////////////////////////////
    // CONVERSION
    ///////////////////////////////////////////////////////////////////////////

    async grayimage_u32_to_image(): Promise<Image> {
        return sys
            .grayimage_u32_to_image(this.handle)
            .then(x => new Image(x));
    }
}



