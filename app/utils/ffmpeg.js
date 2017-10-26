import fs from 'fs';
import ffbinaries from 'ffbinaries';
import ffmpeg from 'fluent-ffmpeg';


const INPUT_MOVIE = 'input/movie.mkv';


function extractClip(sceneStart, duration, filename) {
  return new Promise((resolve, reject) => {
    ffmpeg(INPUT_MOVIE)
      .inputOption('-ss ' + sceneStart)
      .inputOption('-t ' + duration)
      //.audioCodec('copy')
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

function mergeAudio(audioFile, outputFile, position) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(INPUT_MOVIE)
      .input(audioFile)
      .complexFilter([
        '[1:0] adelay=2728000|2728000 [delayed]', // put the clip at the right time
        '[0:1][delayed] amix=inputs=2', // merge the original video's audio and delayed audio
      ])
      .outputOption('-map 0:0') // use the video's video
      .audioCodec('aac')
      .videoCodec('copy')
      .save(outputFile)
      .on('end', resolve);
  });
}

export default {
  extractClip,
  getFFMPEG,
  mergeAudio,
}
