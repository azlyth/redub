import fs from 'fs';

function saveBlob(blob, filename) {
  let reader = new FileReader();
  reader.onload = () => {
    let buffer = new Buffer(reader.result);
    fs.writeFile(filename, buffer, {}, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('var');
    });
  };
  reader.readAsArrayBuffer(blob);
}

export default {
  saveBlob,
};
