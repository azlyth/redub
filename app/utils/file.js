import fs from 'fs';


function deleteFile(path) {
  return fs.unlinkSync(path);
}

function fileExists(path) {
  return fs.existsSync(path);
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
  saveBlob,
};
