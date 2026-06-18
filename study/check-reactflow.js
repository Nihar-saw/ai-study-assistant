import fs from 'fs';

let output = '';
const log = (msg) => { output += msg + '\n'; };

const distPath = './node_modules/reactflow/dist';
try {
  log("FILES IN DIST: " + JSON.stringify(fs.readdirSync(distPath)));
} catch(err) {
  log("DIST READ ERROR: " + err.message);
  try {
    log("FILES IN ROOT: " + JSON.stringify(fs.readdirSync('./node_modules/reactflow')));
  } catch(e) {
    log("ROOT READ ERROR: " + e.message);
  }
}

fs.writeFileSync('./check.txt', output);
console.log("Check complete.");
