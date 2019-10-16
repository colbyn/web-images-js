import * as sys from "./sys";

sys
    .open("assets/test/1.jpeg")
    .then(x => console.log(x));

sys
    .open_with_format("assets/test/1.jpeg", "jpeg")
    .then(x => console.log(x));