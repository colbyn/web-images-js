import * as sys from "./sys";
export {ImageFormat, Kernel3x3, ResizeArgs, ThumbnailArgs} from "./sys";


/**
 * A decoded dynamic image.
 */
export class Image {
    private handle!: sys.Image;

    /**
     * Treat this as private unless you’re using the lower level `sys` module.
     * For construction prefer the `Image.open` and related static methods.
     */
    constructor(x: sys.Image) {
        this.handle = x;
    }

    ///////////////////////////////////////////////////////////////////////////
    // BASICS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Open the image located at the path specified. The image's format is
     * determined from the path's file extension.
     * 
     * ```typescript
     * let image: Promise<Image> = Image
     *      .open("test.jpeg")
     *      .then(x => {
     *          console.log("loaded image");
     *          return x;
     *      });
     * ```
     */
    static async open(path: string): Promise<Image> {
        let img =  await sys.open(path);
        return new Image(img);
    }
    

    /**
     * 
     * ```typescript
     * let image: Promise<Image> = Image
     *      .open("test.jpeg")
     *      .then(x => {
     *          console.log("loaded image");
     *          return x;
     *      });
     * ```
     */
    static async open_with_format(path: string, format: sys.ImageFormat): Promise<Image> {
        let img = await sys.open_with_format(path, format);
        return new Image(img);
    }


    /**
     * 
     */
    static async create(width: Number, height: Number, pixel_type: "rgba" | "rgb" | "luma"): Promise<Image> {
        let img = await sys.create({width, height, pixel_type});
        return new Image(img);
    }

    /**
     * 
     */
    async dimensions(): Promise<sys.Resolution> {
        return sys.dimensions(this.handle);
    }

    /**
     * Return a cut out of this image delimited by the bounding rectangle.
     */
    async crop(cx: Number, cy: Number, width: Number, height: Number): Promise<Image> {
        let crop_args: sys.CropArgs = {cx, cy, width, height};
        return sys
            .crop(this.handle, crop_args)
            .then(x => new Image(x));
    }

    /**
     * Return this image's color type.
     */
    async color(): Promise<sys.ColorInfo> {
        return sys.color(this.handle);
    }
    
    /**
     * Return a grayscale version of this image.
     */
    async grayscale(): Promise<Image> {
        return sys.grayscale(this.handle).then(x => new Image(x));
    }
    
    /**
     * Invert the colors of this image.
     */
    async invert(): Promise<Image> {
        return sys
            .invert(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Resize this image using the specified filter algorithm. Returns a new image.
     */
    async resize(args: sys.ResizeArgs): Promise<Image> {
        return sys
            .resize(this.handle, args)
            .then(x => new Image(x));
    }
    
    /**
     * Scale this image down to fit within a specific size. Returns a new image.
     * This method uses a fast integer algorithm where each source pixel
     * contributes to exactly one target pixel. May give aliasing artifacts
     * if new size is close to old size.
     */
    async thumbnail(args: sys.ThumbnailArgs): Promise<Image> {
        return sys
            .thumbnail(this.handle, args)
            .then(x => new Image(x));
    }
    

    /**
     * Performs a Gaussian blur on this image. sigma is a measure of how much to blur by.
     */
    async blur(sigma: Number): Promise<Image> {
        return sys
            .blur(this.handle, sigma)
            .then(x => new Image(x));
    }
    
    /**
     * Performs an unsharpen mask on this image. sigma is the amount to blur the image by.
     * threshold is a control of how much to sharpen
     */
    async unsharpen(sigma: Number, threshold: Number): Promise<Image> {
        return sys
            .unsharpen(this.handle, sigma, threshold)
            .then(x => new Image(x));
    }
    
    /**
     * Filters this image with the specified 3x3 kernel.
     */
    async filter3x3(kernel: sys.Kernel3x3): Promise<Image> {
        return sys.filter3x3(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    /**
     * Adjust the contrast of this image. contrast is the amount to adjust the contrast by.
     * Negative values decrease the contrast and positive values increase the contrast.
     */
    async adjust_contrast(contrast: Number): Promise<Image> {
        return sys.adjust_contrast(this.handle, contrast)
            .then(x => new Image(x));
    }
    
    /**
     * Brighten the pixels of this image. value is the amount to brighten each pixel by.
     * Negative values decrease the brightness and positive values increase it.
     */
    async brighten(value: Number): Promise<Image> {
        return sys
            .brighten(this.handle, value)
            .then(x => new Image(x));
    }
    
    /**
     * Hue rotate the supplied image. value is the degrees to rotate each pixel by.
     * 0 and 360 do nothing, the rest rotates by the given degree value. just like
     * the css webkit filter hue-rotate(180)
     */
    async huerotate(value: Number): Promise<Image> {
        return sys
            .huerotate(this.handle, value)
            .then(x => new Image(x));
    }
    
    /**
     * Flip this image vertically
     */
    async flipv(): Promise<Image> {
        return sys
            .flipv(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Flip this image horizontally
     */
    async fliph(): Promise<Image> {
        return sys
            .fliph(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Rotate this image 90 degrees clockwise.
     */
    async rotate90(): Promise<Image> {
        return sys
            .rotate90(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Rotate this image 180 degrees clockwise.
     */
    async rotate180(): Promise<Image> {
        return sys
            .rotate180(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Rotate this image 270 degrees clockwise.
     */
    async rotate270(): Promise<Image> {
        return sys
            .rotate270(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Saves the supplied buffer to a file at the path specified.
     * The image format is derived from the file extension.
     */
    async save(path: String): Promise<null> {
        return sys.save(this.handle, path);
    }
    
    /**
     * Saves the supplied buffer to a file at the path specified in the specified format.
     */
    async save_with_format(path: String, format: sys.ImageFormat): Promise<null> {
        return sys.save_with_format(this.handle, path, format);
    }


    ///////////////////////////////////////////////////////////////////////////
    // TRAVERSAL
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Transforms the input image.
     */
    async map_rgba(f: (x: number, y: number, px: Array<number>) => Array<number>): Promise<Image> {
        return sys
            .map_rgba(this.handle, f)
            .then(x => new Image(x));
    }

    /**
     * Sometimes called “fold”, useful for e.g. summing specific pixel values.
     */
    async reduce_rgba<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: Array<number>) => T): Promise<T> {
        return sys.reduce_rgba(this.handle, initial_value, f);
    }

    /**
     * Transforms the input image.
     */
    async map_luma(f: (x: number, y: number, px: number) => number): Promise<Image> {
        return sys
            .map_luma(this.handle, f)
            .then(x => new Image(x));
    }

    /**
     * Sometimes called “fold”, useful for e.g. summing specific pixel values.
     */
    async reduce_luma<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T> {
        return sys.reduce_luma(this.handle, initial_value, f);
    }

    
    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - CONTRAST
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Applies an adaptive threshold to an image.
     * 
     * This algorithm compares each pixel's brightness with the average brightness
     * of the pixels in the (2 * block_radius + 1) square block centered on it. If
     * the pixel if at least as bright as the threshold then it will have a value
     * of 255 in the output image, otherwise 0.
     */
    async adaptive_threshold(block_radius: Number): Promise<Image> {
        return sys
            .adaptive_threshold(this.handle, block_radius)
            .then(x => new Image(x));
    }
    
    /**
     * Equalises the histogram of an 8bpp grayscale image See also
     * [histogram equalization (wikipedia)](https://en.wikipedia.org/wiki/Histogram_equalization).
     */
    async equalize_histogram(): Promise<Image> {
        return sys
            .equalize_histogram(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Adjusts contrast of an 8bpp grayscale image so that its
     * histogram is as close as possible to that of the target image.
     */
    async match_histogram(target: Image): Promise<Image> {
        return sys
            .match_histogram(this.handle, target.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Returns the [Otsu threshold level] of an 8bpp image.
     * [Otsu threshold level]: https://en.wikipedia.org/wiki/Otsu%27s_method
     */
    async otsu_level(): Promise<Image> {
        return sys
            .otsu_level(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Linearly stretches the contrast in an image, sending `lower` to `0` and `upper` to `2558`.
     * Is it common to choose `upper` and `lower` values using image percentiles -
     * see [`percentile`](../stats/fn.percentile.html).
     */
    async stretch_contrast(lower: Number, upper: Number): Promise<Image> {
        return sys
            .stretch_contrast(this.handle, lower, upper)
            .then(x => new Image(x));
    }
    
    /**
     * Returns a binarized image from an input 8bpp grayscale image
     * obtained by applying the given threshold. Pixels with intensity
     * equal to the threshold are assigned to the background.
     */
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

    /**
     * Returns an image showing the distance of each pixel from a foreground
     * pixel in the original image.
     */
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

    /**
     * Runs the canny edge detection algorithm.
     * 
     * Returns a binary image where edge pixels have a value of 255 and
     * non-edge pixels a value of 0.
     * 
     * @param low_threshold Low threshold for the hysteresis procedure.
     * Edges with a strength higher than the low threshold will appear
     * in the output image, if there are strong edges nearby.
     * 
     * @param high_threshold High threshold for the hysteresis procedure.
     * Edges with a strength higher than the high threshold will always
     * appear as edges in the output image.
     */
    async canny(low_threshold: Number, high_threshold: Number): Promise<Image> {
        return sys
            .canny(this.handle, low_threshold, high_threshold)
            .then(x => new Image(x));
    }


    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - FILTER
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Convolves an 8bpp grayscale image with a kernel of width (2 * `x_radius` + 1)
     * and height (2 * `y_radius` + 1) whose entries are equal and
     * sum to one. i.e. each output pixel is the unweighted mean of
     * a rectangular region surrounding its corresponding input pixel.
     * 
     * We handle locations where the kernel would extend past the image's
     * boundary by treating the image as if its boundary pixels were
     * repeated indefinitely.
     */
    async box_filter(x_radius: Number, y_radius: Number): Promise<Image> {
        return sys
            .box_filter(this.handle, x_radius, y_radius)
            .then(x => new Image(x));
    }
    
    /**
     * Blurs an image using a Gaussian of standard deviation sigma.
     * The kernel used has type f32 and all intermediate calculations
     * are performed at this type.
     */
    async gaussian_blur_f32(sigma: Number): Promise<Image> {
        return sys
            .gaussian_blur_f32(this.handle, sigma)
            .then(x => new Image(x));
    }
    
    /**
     * Returns horizontal correlations between an image and a 1d kernel.
     * Pads by continuity. Intermediate calculations are performed at
     * type K.
     */
    async horizontal_filter(kernel: Array<Number>): Promise<Image> {
        return sys
            .horizontal_filter(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    /**
     * Applies a median filter of given dimensions to an image. Each output pixel is the median
     * of the pixels in a `(2 * x_radius + 1) * (2 * y_radius + 1)` kernel of pixels in the input image.
     * 
     * Pads by continuity. Performs O(max(x_radius, y_radius)) operations per pixel.
     */
    async median_filter(x_radius: Number, y_radius: Number): Promise<Image> {
        return sys
            .median_filter(this.handle, x_radius, y_radius)
            .then(x => new Image(x));
    }
    
    /**
     * Returns 2d correlation of view with the outer product of the 1d kernels `h_kernel` and `v_kernel`.
     */
    async separable_filter(h_kernel: Array<Number>, v_kernel: Array<Number>): Promise<Image> {
        return sys
            .separable_filter(this.handle, h_kernel, v_kernel)
            .then(x => new Image(x));
    }
    
    /**
     * Returns 2d correlation of an image with the outer product of the 1d kernel filter with itself.
     */
    async separable_filter_equal(kernel: Array<Number>): Promise<Image> {
        return sys
            .separable_filter_equal(this.handle, kernel)
            .then(x => new Image(x));
    }
    
    /**
     * Sharpens a grayscale image (to converts to grayscale) by applying a 3x3 approximation to the Laplacian.
     */
    async sharpen3x3(): Promise<Image> {
        return sys
            .sharpen3x3(this.handle)
            .then(x => new Image(x));
    }
    
    /**
     * Sharpens a grayscale image using a Gaussian as a low-pass filter.
     * 
     * @param sigma is the standard deviation of the Gaussian filter used
     * @param amount controls the level of sharpening. `output = input + amount * edges`.
     */
    async sharpen_gaussian(sigma: Number, amount: Number): Promise<Image> {
        return sys
            .sharpen_gaussian(this.handle, sigma, amount)
            .then(x => new Image(x));
    }
    
    /**
     * Returns horizontal correlations between an image and a 1d kernel. Pads by continuity.
     */
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

    /**
     * Dilation followed by erosion.
     * 
     * See the `erode` and `dilate` documentation for definitions of dilation
     * and erosion.
     * 
     * [morphological operators]: http://homepages.inf.ed.ac.uk/rbf/HIPR2/morops.htm
     */
    async morph_close(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    /**
     * Sets all pixels within distance k of a foreground pixel to white.
     * 
     * A pixel is treated as belonging to the foreground if it has non-zero
     * intensity.
     * 
     * [morphological operators]: http://homepages.inf.ed.ac.uk/rbf/HIPR2/morops.htm
     */
    async morph_dilate(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    /**
     * Sets all pixels within distance k of a background pixel to black.
     * 
     * A pixel is treated as belonging to the foreground if it has non-zero intensity.
     * 
     * [morphological operators]: http://homepages.inf.ed.ac.uk/rbf/HIPR2/morops.htm
     */
    async morph_erode(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    
    /**
     * Erosion followed by dilation.
     * 
     * See the `erode` and `dilate` documentation for definitions of dilation
     * and erosion.
     * 
     * [morphological operators]: http://homepages.inf.ed.ac.uk/rbf/HIPR2/morops.htm
     */
    async morph_open(norm: "L1" | "LInf", k: Number): Promise<Image> {
        return sys
            .morph_close(this.handle, norm, k)
            .then(x => new Image(x));
    }
    

    ///////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - NOISE
    ///////////////////////////////////////////////////////////////////////////
    /**
     * Adds independent additive Gaussian noise to all channels of an image,
     * with the given mean and standard deviation.
     */
    async gaussian_noise(mean: Number, stddev: Number, seed: Number): Promise<Image> {
        return sys
            .gaussian_noise(this.handle, mean, stddev, seed)
            .then(x => new Image(x));
    }
    
    /**
     * Converts pixels to black or white at the given rate (between 0.0 and 1.0).
     * Black and white occur with equal probability.
     */
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

    /**
     * Returns an image of the same size as the input, where each pixel is labelled
     * by the connected foreground component it belongs to, or 0 if it's in the
     * background. Input pixels are treated as belonging to the background if and
     * only if they are equal to the provided background pixel.
     * 
     * Panics if the image contains 2<sup>32</sup> or more pixels. If this limitation
     * causes you problems then open an issue and we can rewrite this function to
     * support larger images.
     * 
     * Four: A pixel is connected to its N, S, E and W neighbors.
     * Eight: A pixel is connected to all of its neighbors.
     */
    async connected_components(conn: "Four" | "Eight", background: Number): Promise<GrayImageU32> {
        return sys
            .connected_components(this.handle, conn, background)
            .then(x => new GrayImageU32(x));
    }

    ///////////////////////////////////////////////////////////////////////////////
    // ADVANCED PROCESSING - SEAM-CARVING
    ///////////////////////////////////////////////////////////////////////////////

    /**
     * Reduces the width of an image using seam carving.
     * 
     * Warning: this is very slow! It implements the algorithm from
     * (here)[https://inst.eecs.berkeley.edu/~cs194-26/fa16/hw/proj4-seamcarving/imret.pdf]
     * with some extra unnecessary allocations thrown in. Rather than attempting to
     * optimise the implementation of this inherently slow algorithm, the planned
     * next step is to switch to the algorithm from
     * (here)[https://users.cs.cf.ac.uk/Paul.Rosin/resources/papers/seam-carving-ChinaF.pdf].
     * 
     * [seam carving]: https://en.wikipedia.org/wiki/Seam_carving
     */
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


/**
 * A decoded grayscale image.
 * Primarily used in more advanced image processing pipelines.
 * Laymen users are probably looking for the 'Image' type.
 * 
 * Each pixel is a 32-bit unsigned integer,
 * primarily used for representing labeled images/regions.
 * 
 */
export class GrayImageU32 {
    private handle!: sys.GrayImageU32;

    /**
     * Treat this as private unless you’re using the lower level `sys` module.
     */
    constructor(x: sys.GrayImageU32) {
        this.handle = x;
    }

    ///////////////////////////////////////////////////////////////////////////
    // TRAVERSAL
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Transforms the input image.
     */
    async map_luma(f: (x: number, y: number, px: number) => number): Promise<GrayImageU32> {
        return sys
            .grayimage_u32_map(this.handle, f)
            .then(x => new GrayImageU32(x));
    }

    /**
     * Sometimes called “fold”, useful for e.g. summing specific pixel values.
     */
    async reduce_luma<T>(initial_value: T, f: (accumulator: T, x: number, y: number, px: number) => T): Promise<T> {
        return sys.grayimage_u32_reduce(this.handle, initial_value, f);
    }


    ///////////////////////////////////////////////////////////////////////////
    // CONVERSION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Convert to the `Image` type. 
     * Labeled regions are assigned some “pretty” color value useful for debugging.
     */
    async to_image(): Promise<Image> {
        return sys
            .grayimage_u32_to_image(this.handle)
            .then(x => new Image(x));
    }
}



