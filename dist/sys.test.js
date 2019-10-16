"use strict";

var sys = _interopRequireWildcard(require("./sys"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// test('basic', async () => {
//     expect(0).toBe(0);
// });
// test('Image.open', async () => {
//     // return Image.open("assets/test/1.jpeg");
// });
test('Image.open_with_format', async () => {
  return sys.open_with_format("../assets/test/1.jpeg", "jpeg").then(x => console.log(x)).then(_ => {
    return expect(0).toBe(0);
  });
}); // test('Image.create', async () => {
//     // return Image.create(100, 100, "rgba");
// });