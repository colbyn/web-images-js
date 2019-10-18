export interface Resolution {
    readonly width: Number,
    readonly height: Number,
}

export type ImageFormat = "jpeg" | "jpg" | "png" | "gif" | "webp" | "pnm" | "tiff" | "tga" | "bmp" | "ico" | "hdr";
export type FilterType = "Nearest" | "Triangle" | "CatmullRom" | "Gaussian" | "Lanczos3";

export interface NewArgs {
    width: Number,
    height: Number,
    pixel_type: "rgba" | "rgb" | "luma",
}

export interface CropArgs {
    cx: Number,
    cy: Number,
    width: Number,
    height: Number,
}

export interface ColorInfo {
    pixel_type: String,
    bit_depth: Number,
}


export interface ThumbnailArgs {
    width: Number,
    height: Number,
    /**
     * If set to true, the image's aspect ratio is NOT preserved.
     */
    resize_exact?: Boolean,
}

export interface ResizeArgs {
    width: Number,
    height: Number,
    /**
     * For best results (quality wise) use "Lanczos3".
     */
    filter_type?: FilterType,
    /**
     * If set to true, the image's aspect ratio is NOT preserved.
     */
    resize_exact?: Boolean,
}
