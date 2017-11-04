import fs from 'fs';
import path from 'path';


function deleteFile(filename) {
  return fs.unlinkSync(filename);
}

function fileExists(filename) {
  return fs.existsSync(filename);
}

function makeDirectory(dirPath) {
  // Simulate `mkdir -p`
  try {
    fs.mkdirSync(dirPath);
  } catch(e) {
    if (e.code === 'ENOENT') {
      makeDirectory(path.dirname(dirPath));
      makeDirectory(dirPath);
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
