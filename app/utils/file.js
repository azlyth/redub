import fs from 'fs';

function fileExists(path) {
  return fs.existsSync(path);
}

function saveBlob(blob, filename, successCallback) {
  let reader = new FileReader();
  reader.onload = () => {
    let buffer = new Buffer(reader.result);
    fs.writeFile(filename, buffer, {}, successCallback);
  };
  reader.readAsArrayBuffer(blob);
}

export default {
  fileExists,
  saveBlob,
};
