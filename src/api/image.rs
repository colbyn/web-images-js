use std::cell::{RefCell, RefMut, Ref};
use std::rc::Rc;
use std::iter::FromIterator;
use std::path::PathBuf;
use std::convert::{From, TryFrom};
use std::collections::{HashMap, HashSet};
use std::ffi::CStr;
use std::ffi::CString;
use std::os::raw::c_char;
use std::os::raw::c_int;
use serde::{Serialize, Deserialize, de::DeserializeOwned};
use libc::size_t;
use image::{
    GenericImage,
    GenericImageView,
    Pixel,
};

use crate::utils::*;
use crate::sys::*;
use super::offload_work;



///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

pub fn parse_image_format(format: &str) -> Result<::image::ImageFormat, String> {
    match format.to_lowercase().as_ref() {
        "jpeg" => Ok(::image::ImageFormat::JPEG),
        "jpg" => Ok(::image::ImageFormat::JPEG),
        "png" => Ok(::image::ImageFormat::PNG),
        "gif" => Ok(::image::ImageFormat::GIF),
        "webp" => Ok(::image::ImageFormat::WEBP),
        "pnm" => Ok(::image::ImageFormat::PNM),
        "tiff" => Ok(::image::ImageFormat::TIFF),
        "tga" => Ok(::image::ImageFormat::TGA),
        "bmp" => Ok(::image::ImageFormat::BMP),
        "ico" => Ok(::image::ImageFormat::ICO),
        "hdr" => Ok(::image::ImageFormat::HDR),
        _ => {
            return Err(format!("invalid format: {}", format))
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// BASIC TYPES
///////////////////////////////////////////////////////////////////////////////

#[derive(Clone)]
pub struct Image(pub(crate) Rc<::image::DynamicImage>);

impl Image {
    pub fn new(x: ::image::DynamicImage) -> Self {
        Image(Rc::new(x))
    }
    pub fn to_napi_value(self, env: NapiEnv) -> Result<NapiValue, String> {
        let size = match self.0.as_ref() {
            ::image::DynamicImage::ImageLuma8(xs) => {
                let components = 1;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
            ::image::DynamicImage::ImageLumaA8(xs) => {
                let components = 2;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
            ::image::DynamicImage::ImageRgb8(xs) => {
                let components = 3;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
            ::image::DynamicImage::ImageRgba8(xs) => {
                let components = 4;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
            ::image::DynamicImage::ImageBgr8(xs) => {
                let components = 3;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
            ::image::DynamicImage::ImageBgra8(xs) => {
                let components = 4;
                let pixels = xs.width() * xs.height();
                components * pixels
            }
        };
        let js_ptr = to_external::<Self>(env, self);
        assert!(adjust_external_memory(env, size as usize).is_ok());
        let mut output = JsObject::new(env)?;
        output.insert_raw(env, "ptr", js_ptr)?;
        output.insert(env, "type", "Image")?;
        Ok(output.into_raw())
    }
    pub fn from_napi_value(env: NapiEnv, value: NapiValue) -> Result<Self, String> {
        if value.is_null() {
            return Err(String::from("value is null"));
        }
        let mut object = JsObject::from_raw(env, value)?;
        let js_ptr = object.get_raw(env, "ptr")?;
        if js_ptr.is_null() {
            return Err(String::from("value is null"));
        }
        let type_value = object.get::<_, String>(env, "type")?;
        if &type_value != "Image" {
            return Err(format!("expecting 'Image'; given: '{}'", type_value));
        }
        from_external::<Self>(env, js_ptr)
            .map(|x| x.clone())
    }
}


#[derive(Clone)]
pub struct GrayImageU32(pub(crate) Rc<imageproc::definitions::Image<::image::Luma<u32>>>);

impl GrayImageU32 {
    pub fn new(x: imageproc::definitions::Image<::image::Luma<u32>>) -> Self {
        GrayImageU32(Rc::new(x))
    }
    pub fn to_napi_value(self, env: NapiEnv) -> Result<NapiValue, String> {
        let size = {
            let components = 1;
            let pixels = self.0.width() * self.0.height();
            (components * pixels) * 4
        };
        let js_ptr = to_external::<Self>(env, self);
        assert!(adjust_external_memory(env, size as usize).is_ok());
        let mut output = JsObject::new(env)?;
        output.insert_raw(env, "ptr", js_ptr)?;
        output.insert(env, "type", "GrayImageU32")?;
        Ok(output.into_raw())
    }
    pub fn from_napi_value(env: NapiEnv, value: NapiValue) -> Result<Self, String> {
        if value.is_null() {
            return Err(String::from("value is null"));
        }
        let mut object = JsObject::from_raw(env, value)?;
        let js_ptr = object.get_raw(env, "ptr")?;
        if js_ptr.is_null() {
            return Err(String::from("value is null"));
        }
        let type_value = object.get::<_, String>(env, "type")?;
        if &type_value != "GrayImageU32" {
            return Err(format!("expecting 'GrayImageU32'; given: '{}'", type_value));
        }
        from_external::<Self>(env, js_ptr)
            .map(|x| x.clone())
    }
}



///////////////////////////////////////////////////////////////////////////////
// COMMON
///////////////////////////////////////////////////////////////////////////////

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub non_blocking: bool
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resolution {
    pub width: u32,
    pub height: u32,
}



///////////////////////////////////////////////////////////////////////////////
// API - BASICS
///////////////////////////////////////////////////////////////////////////////

pub fn open(
    env: NapiEnv,
    path: NapiValue,
) -> Result<NapiValue, String> {
    type Input = String;
    type Output = Result<Image, String>;
    let input: Input = from_napi_value::<String>(env, path)?;
    fn compute(path: Input) -> Output {
        let image = ::image::open(&path).map_err(|e| format!("{}", e))?;
        Ok(Image::new(image))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .and_then(|x| x.to_napi_value(env))
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn open_with_format(
    env: NapiEnv,
    path: NapiValue,
    format: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (String, ::image::ImageFormat);
    type Output = Result<Image, String>;
    
    let input_path = from_napi_value::<String>(env, path)?;
    let input_format = from_napi_value::<String>(env, format)?;
    let input_format = parse_image_format(&input_format)?;
    let input: Input = (input_path, input_format);

    fn compute(data: Input) -> Output {
        let file = std::fs::read(&data.0)
            .map_err(|x| format!("{}", x))?;
        let image = ::image::load_from_memory_with_format(&file, data.1)
            .map_err(|x| format!("{}", x))?;
        Ok(Image::new(image))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .and_then(|x| x.to_napi_value(env))
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewArgs {
    pub width: u32,
    pub height: u32,
    #[serde(default)]
    pub pixel_type: String,
}

pub fn create(
    env: NapiEnv, 
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = NewArgs;
    type Output = Image;
    let input: Input = from_napi_value(env, args)?;
    fn compute(data: Input) -> Output {
        let NewArgs{width, height, pixel_type} = data.clone();
            let output = match pixel_type.to_lowercase().as_str() {
            "luma" => {
                ::image::DynamicImage::new_luma8(width, height)
            }
            "rgba" => {
                ::image::DynamicImage::new_rgba8(width, height)
            }
            _ | "rgb" => {
                ::image::DynamicImage::new_rgb8(width, height)
            }
        };
        Image::new(output)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn dimensions(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Resolution;
    let input: Input = Image::from_napi_value(env, image)?;
    fn compute(data: Input) -> Output {
        let (width, height) = data.0.dimensions();
        Resolution{width, height}
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        Ok(to_napi_value(env, out))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CropArgs {
    pub cx: u32,
    pub cy: u32,
    pub width: u32,
    pub height: u32,
}
pub fn crop(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, CropArgs);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let CropArgs{cx,cy,width,height} = data.1;
        let mut image = (data.0).0.as_ref().clone();
        let output = image.crop(cx, cy, width, height);
        Image::new(output)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColorInfo {
    pixel_type: String,
    bit_depth: u8,
}
pub fn color(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = ColorInfo;
    let input: Input = Image::from_napi_value(env, image)?;
    fn compute(data: Input) -> Output {
        match data.0.color() {
            ::image::ColorType::Gray(x) => ColorInfo {
                pixel_type: String::from("gray"),
                bit_depth: x
            },
            ::image::ColorType::RGB(x) => ColorInfo {
                pixel_type: String::from("rgb"),
                bit_depth: x
            },
            ::image::ColorType::Palette(x) => ColorInfo {
                pixel_type: String::from("palette"),
                bit_depth: x
            },
            ::image::ColorType::GrayA(x) => ColorInfo {
                pixel_type: String::from("graya"),
                bit_depth: x
            },
            ::image::ColorType::RGBA(x) => ColorInfo {
                pixel_type: String::from("rgba"),
                bit_depth: x
            },
            ::image::ColorType::BGR(x) => ColorInfo {
                pixel_type: String::from("bgr"),
                bit_depth: x
            },
            ::image::ColorType::BGRA(x) => ColorInfo {
                pixel_type: String::from("bgra"),
                bit_depth: x
            },
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        Ok(to_napi_value(env, out))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn grayscale(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input: Input = Image::from_napi_value(env, image)?;
    fn compute(data: Input) -> Output {
        Image::new(data.0.grayscale())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn invert(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input: Input = Image::from_napi_value(env, image)?;
    fn compute(data: Input) -> Output {
        let mut x = data.0.as_ref().clone();
        x.invert();
        Image::new(x)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResizeArgs {
    pub width: u32,
    pub height: u32,
    #[serde(default)]
    pub filter_type: String,
    #[serde(default)]
    pub resize_exact: bool,
}
pub fn resize(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, ResizeArgs);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let ResizeArgs{width,height,filter_type,resize_exact} = data.1.clone();
        let filter_type = match filter_type.to_lowercase().as_ref() {
            "nearest" => ::image::FilterType::Nearest,
            "triangle" => ::image::FilterType::Triangle,
            "catmullrom" => ::image::FilterType::CatmullRom,
            "gaussian" => ::image::FilterType::Gaussian,
            "lanczos3" => ::image::FilterType::Lanczos3,
            _ => ::image::FilterType::Lanczos3,
        };
        let new_image = if resize_exact {
            (data.0).0.resize_exact(width, height, filter_type)
        } else {
            (data.0).0.resize(width, height, filter_type)
        };
        Image::new(new_image)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThumbnailArgs {
    width: u32,
    height: u32,
    resize_exact: bool,
}
pub fn thumbnail(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, ThumbnailArgs);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let ThumbnailArgs{width,height,resize_exact} = data.1.clone();
        let new_image = if resize_exact {
            (data.0).0.thumbnail_exact(width, height)
        } else {
            (data.0).0.thumbnail(width, height)
        };
        Image::new(new_image)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlurArgs {
    pub sigma: f32,
}
pub fn blur(
    env: NapiEnv,
    image: NapiValue,
    sigma: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<f32>(env, sigma)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        Image::new((data.0).0.blur(data.1))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


pub fn unsharpen(
    env: NapiEnv,
    image: NapiValue,
    sigma: NapiValue,
    threshold: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f32, i32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_sigma = from_napi_value::<f32>(env, sigma)?;
    let input_threshold = from_napi_value::<i32>(env, threshold)?;
    let input: Input = (input_image, input_sigma, input_threshold);
    fn compute(data: Input) -> Output {
        Image::new((data.0).0.unsharpen(data.1, data.2))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn filter3x3(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Vec<f32>);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_kernel = from_napi_value::<Vec<f32>>(env, args)?;
    if input_kernel.len() != 9 {
        return Err(String::from("filter must be 3 x 3 (9 element array)"));
    }
    let input: Input = (input_image, input_kernel);
    fn compute(data: Input) -> Output {
        Image::new((data.0).0.filter3x3(&data.1))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn adjust_contrast(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {    
    type Input = (Image, f32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<f32>(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let contrast = data.1.clone();
        Image::new((data.0).0.adjust_contrast(contrast))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn brighten(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, i32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<i32>(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let value = data.1.clone();
        Image::new((data.0).0.brighten(value))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn huerotate(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, i32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<i32>(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let value = data.1.clone();
        Image::new((data.0).0.huerotate(value))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn flipv(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = input_image;
    fn compute(data: Input) -> Output {
        Image::new(data.0.flipv())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn fliph(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = input_image;
    fn compute(data: Input) -> Output {
        Image::new(data.0.fliph())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn rotate90(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = input_image;
    fn compute(data: Input) -> Output {
        Image::new(data.0.rotate90())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn rotate180(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = input_image;
    fn compute(data: Input) -> Output {
        Image::new(data.0.rotate180())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn rotate270(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = input_image;
    fn compute(data: Input) -> Output {
        Image::new(data.0.rotate270())
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn save(
    env: NapiEnv,
    image: NapiValue,
    path: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, PathBuf);
    type Output = Result<(), String>;
    let input_image = Image::from_napi_value(env, image)?;
    let input_path = from_napi_value(env, path)?;
    let input: Input = (input_image, input_path);
    fn compute(data: Input) -> Result<(), String> {
        let path = data.1.clone();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).expect(&format!(
                "Missing base directory; unable to create base directory for path {:?}",
                path
            ));
        }
        (data.0).0
            .save(path)
            .map_err(|x| format!("{}", x))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .map(|x| to_napi_value(env, x))
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn save_with_format(
    env: NapiEnv,
    image: NapiValue,
    path: NapiValue,
    format: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, PathBuf, ::image::ImageFormat);
    type Output = Result<(), String>;
    let input_image = Image::from_napi_value(env, image)?;
    let input_path = from_napi_value(env, path)?;
    let input_format = from_napi_value::<String>(env, format)
        .and_then(|x| parse_image_format(&x))?;
    let input: Input = (input_image, input_path, input_format);
    fn compute(data: Input) -> Result<(), String> {
        let path = data.1.clone();
        let format = data.2.clone();
        (data.0).0
            .save_with_format(path, format)
            .map_err(|x| format!("{}", x))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .map(|x| to_napi_value(env, x))
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// API - TRAVERSAL
///////////////////////////////////////////////////////////////////////////////

pub fn map_rgba(
    env: NapiEnv,
    image: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = Image::from_napi_value(env, image)?;
    let mut image = image.0.as_ref().to_rgba();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    for (x, y, mut px) in image.enumerate_pixels_mut() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<[u8; 4]>(env, px.0.clone());
            let args = [arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                3,
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            if !is_undefined_or_null(env, out).unwrap_or(false) {
                let out = from_napi_value::<Vec<u8>>(env, out)?;
                if out.len() != 4 {
                    return Err(String::from("rgba array length != 4"));
                }
                let new_px = ::image::Rgba([out[0], out[1], out[2], out[3]]);
                *px = new_px;
            }
        }
    }
    // FINISH
    let output = Image::new(::image::DynamicImage::ImageRgba8(image)).to_napi_value(env)?;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}

pub fn reduce_rgba(
    env: NapiEnv,
    image: NapiValue,
    initial_value: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = Image::from_napi_value(env, image)?;
    let image = image.0.as_ref().to_rgba();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    let mut accumulator: NapiValue = initial_value;
    for (x, y, mut px) in image.enumerate_pixels() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<[u8; 4]>(env, px.0.clone());
            let args = [accumulator, arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                4,
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            accumulator = out;
        }
    }
    // FINISH
    let output = accumulator;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}


pub fn map_luma(
    env: NapiEnv,
    image: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = Image::from_napi_value(env, image)?;
    let mut image = image.0.as_ref().to_luma();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    for (x, y, mut px) in image.enumerate_pixels_mut() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<u8>(env, px.0[0]);
            let args = [arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                3,
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            if !is_undefined_or_null(env, out).unwrap_or(false) {
                let out = from_napi_value::<u8>(env, out)?;
                let new_px = ::image::Luma([out]);
                *px = new_px;
            }
        }
    }
    // FINISH
    let output = Image::new(::image::DynamicImage::ImageLuma8(image)).to_napi_value(env)?;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}

pub fn reduce_luma(
    env: NapiEnv,
    image: NapiValue,
    initial_value: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = Image::from_napi_value(env, image)?;
    let image = image.0.as_ref().to_luma();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    let mut accumulator: NapiValue = initial_value;
    for (x, y, mut px) in image.enumerate_pixels() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<u8>(env, px.0[0]);
            let args = [accumulator, arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                4,
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            accumulator = out;
        }
    }
    // FINISH
    let output = accumulator;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}

pub fn map_grayimage_u32(
    env: NapiEnv,
    image: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = GrayImageU32::from_napi_value(env, image)?;
    let mut image = image.0.as_ref().clone();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    for (x, y, mut px) in image.enumerate_pixels_mut() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<u32>(env, px.0[0]);
            let args = [arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                args.len(),
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            if !is_undefined_or_null(env, out).unwrap_or(false) {
                let out = from_napi_value::<u32>(env, out)?;
                let new_px = ::image::Luma([out]);
                *px = new_px;
            }
        }
    }
    // FINISH
    let output = GrayImageU32::new(image).to_napi_value(env)?;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}

pub fn reduce_grayimage_u32(
    env: NapiEnv,
    image: NapiValue,
    initial_value: NapiValue,
    js_function: NapiValue,
) -> Result<NapiValue, String> {
    // SETUP
    let image = GrayImageU32::from_napi_value(env, image)?;
    let image = image.0.as_ref();
    // JS PROMISE
    let (promise, deferred) = unsafe {
        let mut deferred: NapiDeferred = std::ptr::null_mut();
        let mut promise: NapiValue = std::ptr::null_mut();
        let status = napi_create_promise(
            env,
            &mut deferred,
            &mut promise,
        );
        if status != NAPI_OK {
            return Err(String::from("napi_create_promise failed"));
        }
        (promise, deferred)
    };
    // GO!
    let global = unsafe {
        let mut global: NapiValue = std::mem::uninitialized();
        if napi_get_global(env, &mut global) != NAPI_OK {
            return Err(String::from("napi_get_global failed"));
        }
        global
    };
    let mut accumulator: NapiValue = initial_value;
    for (x, y, mut px) in image.enumerate_pixels() {
        unsafe {
            let arg_cx = to_napi_value::<u32>(env, x.clone());
            let arg_cy = to_napi_value::<u32>(env, y.clone());
            let arg_px = to_napi_value::<u32>(env, px.0[0]);
            let args = [accumulator, arg_cx, arg_cy, arg_px];
            let mut out: NapiValue = std::ptr::null_mut();
            let s = napi_call_function(
                env,
                global,
                js_function,
                4,
                args.as_ptr(),
                &mut out,
            );
            if s != NAPI_OK {
                return Err(format!("napi_call_function failed: {:?}", debug_format_napi_status(s)));
            }
            accumulator = out;
        }
    }
    // FINISH
    let output = accumulator;
    let s = unsafe {
        napi_resolve_deferred(env, deferred, output)
    };
    if s != NAPI_OK {
        eprintln!("napi_resolve_deferred failed!");
    }
    // DONE
    Ok(promise)
}


///////////////////////////////////////////////////////////////////////////////
// CONVERSION
///////////////////////////////////////////////////////////////////////////////

pub fn grayimage_u32_to_image(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = GrayImageU32;
    type Output = Image;
    let input: Input = GrayImageU32::from_napi_value(env, image)?;
    fn compute(data: Input) -> Output {
        fn random_color_map(keys: HashSet<u32>) -> HashMap<u32, image::Rgb<u8>> {
            use colourado::{Color, ColorPalette, PaletteType};
            let palette = ColorPalette::new(keys.len() as u32, PaletteType::Random, false);
            let mut output: HashMap<u32, image::Rgb<u8>> = HashMap::new();
            for (key, ix) in keys.iter().zip(0 .. keys.len()) {
                let key = key.clone();
                if key == 0 {
                    output.insert(key, image::Rgb([0, 0, 0]));
                } else {
                    fn convert(x: f32) -> u8 {
                        (x * 255.0) as u8
                    }
                    let red = convert(palette.colors[ix].red);
                    let green = convert(palette.colors[ix].green);
                    let blue = convert(palette.colors[ix].blue);

                    output.insert(key, image::Rgb([red, green, blue]));
                }
            }
            output
        }
        let go = |width, height, components: &imageproc::definitions::Image<image::Luma<u32>>| {
            let pixels = components
                .pixels()
                .map(|p| p[0]).map(|x| x)
                .collect();
            let debug_colors = random_color_map(pixels);
            let new_image = image::ImageBuffer::from_fn(width, height, |x, y| {
                let px_key = components.get_pixel(x, y).channels()[0];
                let color = debug_colors.get(&px_key).expect("missing color entry");
                color.clone()
            });
            image::DynamicImage::ImageRgb8(new_image)
        };
        Image::new(go(data.0.width(), data.0.height(), data.0.as_ref()))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - COMMON
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - CONTRAST
///////////////////////////////////////////////////////////////////////////////

pub fn adaptive_threshold(
    env: NapiEnv,
    image: NapiValue,
    block_radius: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_arg = from_napi_value::<u32>(env, block_radius)?;
    let input: Input = (input_image, input_arg);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::contrast::adaptive_threshold(&source.to_luma(), data.1),
            Some(x) => imageproc::contrast::adaptive_threshold(x, data.1),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn equalize_histogram(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = (input_image);
    fn compute(data: Input) -> Output {
        let source = (data.0).as_ref();
        let result = match source.as_luma8() {
            None => imageproc::contrast::equalize_histogram(&source.to_luma()),
            Some(x) => imageproc::contrast::equalize_histogram(x),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn match_histogram(
    env: NapiEnv,
    image: NapiValue,
    target: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Image);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_arg = Image::from_napi_value(env, target)?;
    let input: Input = (input_image, input_arg);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let target = (data.0).0.as_ref();
        let result = match (source.as_luma8(), target.as_luma8()) {
            (Some(x), Some(y)) => imageproc::contrast::match_histogram(x, &y),
            _ => imageproc::contrast::match_histogram(&source.to_luma(), &target.to_luma()),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn otsu_level(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = Image;
    type Output = u8;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = (input_image);
    fn compute(data: Input) -> Output {
        let source = (data.0).as_ref();
        let result = match source.as_luma8() {
            None => imageproc::contrast::otsu_level(&source.to_luma()),
            Some(x) => imageproc::contrast::otsu_level(x),
        };
        result
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        Ok(to_napi_value(env, out))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn stretch_contrast(
    env: NapiEnv,
    image: NapiValue,
    lower: NapiValue,
    upper: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u8, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_lower = from_napi_value::<u8>(env, lower)?;
    let input_upper = from_napi_value::<u8>(env, upper)?;
    if !(input_upper > input_lower) {
        return Err(String::from("upper must be strictly greater than lower"));
    }
    let input: Input = (input_image, input_lower, input_upper);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::contrast::stretch_contrast(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::contrast::stretch_contrast(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


pub fn threshold(
    env: NapiEnv,
    image: NapiValue,
    thresh: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<u8>(env, thresh)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::contrast::threshold(&source.to_luma(), data.1),
            Some(x) => imageproc::contrast::threshold(x, data.1),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}



///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - CORNERS
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - DISTANCE-TRANSFORM
///////////////////////////////////////////////////////////////////////////////

pub fn distance_transform(
    env: NapiEnv,
    image: NapiValue,
    norm: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, ::imageproc::distance_transform::Norm);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_arg = from_napi_value::<String>(env, norm)?;
    let input_arg = match input_arg.to_lowercase().as_ref() {
        "l1" => ::imageproc::distance_transform::Norm::L1,
        "linf" => ::imageproc::distance_transform::Norm::LInf,
        _ => {
            return Err(String::from("invalid norm value"));
        }
    };
    let input: Input = (input_image, input_arg);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::distance_transform::distance_transform(&source.to_luma(), data.1),
            Some(x) => imageproc::distance_transform::distance_transform(x, data.1),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}



///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - DRAWING
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - EDGES
///////////////////////////////////////////////////////////////////////////////

pub fn canny(
    env: NapiEnv,
    image: NapiValue,
    low_threshold: NapiValue, 
    high_threshold: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f32, f32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let low_threshold = from_napi_value::<f32>(env, low_threshold)?;
    let high_threshold = from_napi_value::<f32>(env, high_threshold)?;
    let input: Input = (input_image, low_threshold, high_threshold);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::edges::canny(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::edges::canny(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - FILTER
///////////////////////////////////////////////////////////////////////////////

pub fn box_filter(
    env: NapiEnv,
    image: NapiValue,
    x_radius: NapiValue, 
    y_radius: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u32, u32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let low_threshold = from_napi_value::<u32>(env, x_radius)?;
    let high_threshold = from_napi_value::<u32>(env, y_radius)?;
    let input: Input = (input_image, low_threshold, high_threshold);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::filter::box_filter(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::filter::box_filter(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn gaussian_blur_f32(
    env: NapiEnv,
    image: NapiValue,
    sigma: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let sigma = from_napi_value::<f32>(env, sigma)?;
    let input: Input = (input_image, sigma);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::filter::gaussian_blur_f32(&source.to_luma(), data.1),
            Some(x) => imageproc::filter::gaussian_blur_f32(x, data.1),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


pub fn horizontal_filter(
    env: NapiEnv,
    image: NapiValue,
    args: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Vec<u8>);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<Vec<u8>>(env, args)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::filter::horizontal_filter(&source.to_luma(), &data.1),
                Some(x) => imageproc::filter::horizontal_filter(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::filter::horizontal_filter(&source.to_rgba(), &data.1),
                Some(x) => imageproc::filter::horizontal_filter(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn median_filter(
    env: NapiEnv,
    image: NapiValue,
    x_radius: NapiValue,
    y_radius: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u32, u32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let x_radius = from_napi_value::<u32>(env, x_radius)?;
    let y_radius = from_napi_value::<u32>(env, y_radius)?;
    let input: Input = (input_image, x_radius, y_radius);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::filter::median_filter(&source.to_luma(), data.1, data.2),
                Some(x) => imageproc::filter::median_filter(x, data.1, data.2),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::filter::median_filter(&source.to_rgba(), data.1, data.2),
                Some(x) => imageproc::filter::median_filter(x, data.1, data.2),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn separable_filter(
    env: NapiEnv,
    image: NapiValue,
    h_kernel: NapiValue,
    v_kernel: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Vec<u8>, Vec<u8>);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let x_radius = from_napi_value::<Vec<u8>>(env, h_kernel)?;
    let y_radius = from_napi_value::<Vec<u8>>(env, v_kernel)?;
    let input: Input = (input_image, x_radius, y_radius);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::filter::separable_filter(&source.to_luma(), &data.1, &data.2),
                Some(x) => imageproc::filter::separable_filter(x, &data.1, &data.2),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::filter::separable_filter(&source.to_rgba(), &data.1, &data.2),
                Some(x) => imageproc::filter::separable_filter(x, &data.1, &data.2),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn separable_filter_equal(
    env: NapiEnv,
    image: NapiValue,
    kernel: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Vec<u8>);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<Vec<u8>>(env, kernel)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::filter::separable_filter_equal(&source.to_luma(), &data.1),
                Some(x) => imageproc::filter::separable_filter_equal(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::filter::separable_filter_equal(&source.to_rgba(), &data.1),
                Some(x) => imageproc::filter::separable_filter_equal(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn sharpen3x3(
    env: NapiEnv,
    image: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input: Input = (input_image);
    fn compute(data: Input) -> Output {
        let source = (data.0).as_ref();
        let result = match source.as_luma8() {
            None => imageproc::filter::sharpen3x3(&source.to_luma()),
            Some(x) => imageproc::filter::sharpen3x3(x),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn sharpen_gaussian(
    env: NapiEnv,
    image: NapiValue,
    sigma: NapiValue,
    amount: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f32, f32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let sigma = from_napi_value::<f32>(env, sigma)?;
    let amount = from_napi_value::<f32>(env, amount)?;
    let input: Input = (input_image, sigma, amount);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::filter::sharpen_gaussian(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::filter::sharpen_gaussian(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn vertical_filter(
    env: NapiEnv,
    image: NapiValue,
    kernel: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, Vec<u8>);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_args = from_napi_value::<Vec<u8>>(env, kernel)?;
    let input: Input = (input_image, input_args);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::filter::vertical_filter(&source.to_luma(), &data.1),
                Some(x) => imageproc::filter::vertical_filter(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::filter::vertical_filter(&source.to_rgba(), &data.1),
                Some(x) => imageproc::filter::vertical_filter(x, &data.1),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}



///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - GEOMETRIC_TRANSFORMATIONS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - GRADIENTS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - HAAR
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - HOG
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - HOUGH
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - INTEGRAL_IMAGE
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - LOCAL_BINARY_PATTERNS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - MAP
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - MATH
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - MORPHOLOGY
///////////////////////////////////////////////////////////////////////////////

pub fn morph_close(
    env: NapiEnv,
    image: NapiValue,
    norm: NapiValue,
    k: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, imageproc::distance_transform::Norm, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_norm = from_napi_value::<String>(env, norm)?;
    let input_norm = match input_norm.to_lowercase().as_ref() {
        "l1" => imageproc::distance_transform::Norm::L1,
        "linf" => imageproc::distance_transform::Norm::LInf,
        _ => {
            return Err(String::from("invalid norm argument"));
        }
    };
    let input_k = from_napi_value::<u8>(env, k)?;
    let input: Input = (input_image, input_norm, input_k);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::morphology::close(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::morphology::close(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn morph_dilate(
    env: NapiEnv,
    image: NapiValue,
    norm: NapiValue,
    k: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, imageproc::distance_transform::Norm, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_norm = from_napi_value::<String>(env, norm)?;
    let input_norm = match input_norm.to_lowercase().as_ref() {
        "l1" => imageproc::distance_transform::Norm::L1,
        "linf" => imageproc::distance_transform::Norm::LInf,
        _ => {
            return Err(String::from("invalid norm argument"));
        }
    };
    let input_k = from_napi_value::<u8>(env, k)?;
    let input: Input = (input_image, input_norm, input_k);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::morphology::dilate(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::morphology::dilate(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn morph_erode(
    env: NapiEnv,
    image: NapiValue,
    norm: NapiValue,
    k: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, imageproc::distance_transform::Norm, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_norm = from_napi_value::<String>(env, norm)?;
    let input_norm = match input_norm.to_lowercase().as_ref() {
        "l1" => imageproc::distance_transform::Norm::L1,
        "linf" => imageproc::distance_transform::Norm::LInf,
        _ => {
            return Err(String::from("invalid norm argument"));
        }
    };
    let input_k = from_napi_value::<u8>(env, k)?;
    let input: Input = (input_image, input_norm, input_k);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::morphology::erode(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::morphology::erode(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn morph_open(
    env: NapiEnv,
    image: NapiValue,
    norm: NapiValue,
    k: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, imageproc::distance_transform::Norm, u8);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_norm = from_napi_value::<String>(env, norm)?;
    let input_norm = match input_norm.to_lowercase().as_ref() {
        "l1" => imageproc::distance_transform::Norm::L1,
        "linf" => imageproc::distance_transform::Norm::LInf,
        _ => {
            return Err(String::from("invalid norm argument"));
        }
    };
    let input_k = from_napi_value::<u8>(env, k)?;
    let input: Input = (input_image, input_norm, input_k);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::morphology::open(&source.to_luma(), data.1, data.2),
            Some(x) => imageproc::morphology::open(x, data.1, data.2),
        };
        Image::new(::image::DynamicImage::ImageLuma8(result))
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}



///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - NOISE
///////////////////////////////////////////////////////////////////////////////

pub fn gaussian_noise(
    env: NapiEnv,
    image: NapiValue,
    mean: NapiValue,
    stddev: NapiValue,
    seed: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f64, f64, u64);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_mean = from_napi_value::<f64>(env, mean)?;
    let input_stddev = from_napi_value::<f64>(env, stddev)?;
    let input_seed = from_napi_value::<u64>(env, seed)?;
    let input: Input = (input_image, input_mean, input_stddev, input_seed);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::noise::gaussian_noise(&source.to_luma(), data.1, data.2, data.3),
                Some(x) => imageproc::noise::gaussian_noise(x, data.1, data.2, data.3),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::noise::gaussian_noise(&source.to_rgba(), data.1, data.2, data.3),
                Some(x) => imageproc::noise::gaussian_noise(x, data.1, data.2, data.3),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}

pub fn salt_and_pepper_noise(
    env: NapiEnv,
    image: NapiValue,
    rate: NapiValue,
    seed: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, f64, u64);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let input_rate = from_napi_value::<f64>(env, rate)?;
    let input_seed = from_napi_value::<u64>(env, seed)?;
    let input: Input = (input_image, input_rate, input_seed);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::noise::salt_and_pepper_noise(&source.to_luma(), data.1, data.2),
                Some(x) => imageproc::noise::salt_and_pepper_noise(x, data.1, data.2),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::noise::salt_and_pepper_noise(&source.to_rgba(), data.1, data.2),
                Some(x) => imageproc::noise::salt_and_pepper_noise(x, data.1, data.2),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - PIXELOPS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - PROPERTY_TESTING
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - RECT
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - REGION-LABELLING
///////////////////////////////////////////////////////////////////////////////

pub fn connected_components(
    env: NapiEnv,
    image: NapiValue,
    conn: NapiValue,
    background: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, imageproc::region_labelling::Connectivity, u8);
    type Output = GrayImageU32;
    let input_image = Image::from_napi_value(env, image)?;
    let input_conn = from_napi_value::<String>(env, conn)?;
    let input_conn = match input_conn.to_lowercase().as_ref() {
        "four" => imageproc::region_labelling::Connectivity::Four,
        "eight" => imageproc::region_labelling::Connectivity::Eight,
        _ => {
            return Err(String::from("invalid connectivity argument"));
        }
    };
    let input_k = from_napi_value::<u8>(env, background)?;
    let input: Input = (input_image, input_conn, input_k);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        let result = match source.as_luma8() {
            None => imageproc::region_labelling::connected_components(&source.to_luma(), data.1, ::image::Luma([data.2])),
            Some(x) => imageproc::region_labelling::connected_components(x, data.1, ::image::Luma([data.2])),
        };
        GrayImageU32::new(result)
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - SEAM_CARVING
///////////////////////////////////////////////////////////////////////////////

pub fn shrink_width(
    env: NapiEnv,
    image: NapiValue,
    target_width: NapiValue,
) -> Result<NapiValue, String> {
    type Input = (Image, u32);
    type Output = Image;
    let input_image = Image::from_napi_value(env, image)?;
    let target_width = from_napi_value::<u32>(env, target_width)?;
    let input: Input = (input_image, target_width);
    fn compute(data: Input) -> Output {
        let source = (data.0).0.as_ref();
        if source.as_luma8().is_some() {
            let result = match source.as_luma8() {
                None => imageproc::seam_carving::shrink_width(&source.to_luma(), data.1),
                Some(x) => imageproc::seam_carving::shrink_width(x, data.1),
            };
            Image::new(::image::DynamicImage::ImageLuma8(result))
        } else {
            let result = match source.as_rgba8() {
                None => imageproc::seam_carving::shrink_width(&source.to_rgba(), data.1),
                Some(x) => imageproc::seam_carving::shrink_width(x, data.1),
            };
            Image::new(::image::DynamicImage::ImageRgba8(result))
        }
    }
    fn finalize(env: NapiEnv, out: Output) -> Result<NapiValue, NapiValue> {
        out .to_napi_value(env)
            .map_err(|x| to_napi_value(env, x))
    }
    offload_work!(env, input, Input, Output, compute, finalize)
}


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - STATS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - SUPPRESS
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - TEMPLATE_MATCHING
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - UNION_FIND
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// ADVANCED PROCESSING - UTILS
///////////////////////////////////////////////////////////////////////////////


