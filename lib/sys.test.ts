import * as sys from "./sys";

// test('basic', async () => {
//     expect(0).toBe(0);
// });

// test('Image.open', async () => {
//     // return Image.open("assets/test/1.jpeg");
// });

test('Image.open_with_format', async () => {
    return sys
        .open_with_format("../assets/test/1.jpeg", "jpeg")
        .then(x => console.log(x))
        .then((_) => {
            return expect(0).toBe(0);
        });
});

// test('Image.create', async () => {
//     // return Image.create(100, 100, "rgba");
// });
