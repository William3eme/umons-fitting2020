const {spawn} = require('child_process');

let dataToSend
let python = spawn("python",["./minicole.py","r2oahoe7g"])
python.stdout.on('data', function (data) {
    // console.log('Pipe data from python script ...');
    dataToSend = data.toString();
});

python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    console.log(dataToSend)
});