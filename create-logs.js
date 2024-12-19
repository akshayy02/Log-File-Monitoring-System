var fs = require('fs');
let counter = 1;
fs.appendFile("sample.log", "Log Number :" + counter, (err) => {
    if (err) throw err;
    console.log("test file initialized");
});
counter++;
setInterval(function () {
    fs.appendFile("sample.log", "\n" + "Log Number : " + counter, (err) => {
        if (err) console.log(err);
        console.log("New Logs Created");
    });
    counter++;
}, 1000);
