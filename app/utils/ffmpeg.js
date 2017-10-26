import fs from 'fs';
import ffbinaries from 'ffbinaries';
import ffmpeg from 'fluent-ffmpeg';


const INPUT_MOVIE = 'input/movie.mkv';


function extractClip(sceneStart, duration, filename) {
  return new Promise((resolve, reject) => {
    ffmpeg(INPUT_MOVIE)
      .inputOption('-ss ' + sceneStart)
      .inputOption('-t ' + duration)
      .save(filename)
      .on('end', resolve);
  });
}

function getFFMPEG() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync('./ffmpeg')) {
      resolve();
    } else {
      ffbinaries.downloadFiles('ffmpeg', (err, data)  => {
        resolve();
      });
    }
  }
  );
}

export default {
  extractClip,
  getFFMPEG,
}
