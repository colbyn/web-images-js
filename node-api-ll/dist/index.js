"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.image_open = image_open;
exports.image_dimensions = image_dimensions;
exports.image_map_rgba = image_map_rgba;
exports.image_reduce_rgba = image_reduce_rgba;

var _web_images_napi = _interopRequireDefault(require("../build/Release/web_images_napi.node"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @ts-ignore
///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - BASICS
///////////////////////////////////////////////////////////////////////////////
function image_open(path) {
  return _web_images_napi.default.image_open(path);
}

function image_dimensions(image) {
  return _web_images_napi.default.image_dimensions(image);
} ///////////////////////////////////////////////////////////////////////////////
// IMAGE METHODS - TRAVERSAL
///////////////////////////////////////////////////////////////////////////////
/// According to my current understanding of NAPI and it’s technical limitations:
///
/// Running the supplied function argument off of the main thread as an asynchronous
/// callback would perhaps severely abuse the event queue with each pixel in the
/// input image. Since I presume this will negatively impact performance this runs
/// synchronously on the current thread. 
///
/// Nevertheless this still returns a `Promise` to allow for such future optimizations
/// without breaking the public API. 


function image_map_rgba(image, f) {
  return _web_images_napi.default.image_map_rgba(image, f);
} /// According to my current understanding of NAPI and it’s technical limitations:
///
/// Running the supplied function argument off of the main thread as an asynchronous
/// callback would perhaps severely abuse the event queue with each pixel in the
/// input image. Since I presume this will negatively impact performance this runs
/// synchronously on the current thread. 
///
/// Nevertheless this still returns a `Promise` to allow for such future optimizations
/// without breaking the public API. 


function image_reduce_rgba(image, initial_value, f) {
  return _web_images_napi.default.image_reduce_rgba(image, initial_value, f);
} ///////////////////////////////////////////////////////////////////////////////
// DEV
///////////////////////////////////////////////////////////////////////////////


let root_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max";
let h1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/h1";
let h2_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/h2";
let l0_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l0";
let l1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l1";
let l2_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/l2";
let m1_path = "/Users/colbyn/Developer/stock-media/max1000x1000-10k-max/m1";

function process(image_path) {
  let f = (x, y, px) => {
    // console.log("pos: ", x, y);
    return [0, 0, 0, 0];
  };

  let g = (accumulator, x, y, px) => {
    return accumulator + 1;
  };

  image_open(image_path) // .then(x => image_map_rgba(x, f))
  .then(x => image_reduce_rgba(x, 0, g)).then(x => console.log(x));
} // function run_all(content_dir: string) {
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


process("EJR-lolXzJyeXn.jpeg"); // let result = foreign
//     .open_async("EJR-lolXzJyeXn.jpeg")
//     .catch((x: any) => {
//         console.log("done: error");
//         console.log("data: ", x);
//     })
//     .then((x: any) => {
//         console.log("done: ok");
//         console.log("data: ", x);
//     });