import fs from 'fs';
import path from 'path';


function deleteFile(path) {
  return fs.unlinkSync(path);
}

function fileExists(path) {
  return fs.existsSync(path);
}

function makeDirectory(path) {
  // Simulate `mkdir -p`
  try {
    fs.mkdirSync(path);
  } catch(e) {
    if (e.errno === 34) {
      makeDirectory(path.dirname(path));
      makeDirectory(path);
    }
  }
}

function saveBlob(blob, filename, successCallback) {
  const reader = new FileReader();
  reader.onload = () => {
    const buffer = new Buffer(reader.result);
    fs.writeFile(filename, buffer, {}, successCallback);
  };
  reader.readAsArrayBuffer(blob);
}

export default {
  deleteFile,
  fileExists,
  makeDirectory,
  saveBlob,
};
