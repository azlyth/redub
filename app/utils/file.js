import fs from 'fs';

function saveBlob(blob, filename, successCallback) {
  let reader = new FileReader();
  reader.onload = () => {
    let buffer = new Buffer(reader.result);
    fs.writeFile(filename, buffer, {}, successCallback);
  };
  reader.readAsArrayBuffer(blob);
}

export default {
  saveBlob,
};
