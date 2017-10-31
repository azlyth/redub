import fs from 'fs';
import ffbinaries from 'ffbinaries';
import ffmpeg from 'fluent-ffmpeg';
import { timeMs } from './subtitles';


const INPUT_MOVIE = 'input/movie.mkv';
const FFMPEG_LOCATION = './ffmpeg';


function getFFMPEG() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(FFMPEG_LOCATION)) {
      resolve();
    } else {
      ffbinaries.downloadFiles('ffmpeg', (err, data)  => {
        resolve();
      });
    }
  }
  );
}

function mergeAudio(clipList, start, end, outputFile) {
  return new Promise((resolve, reject) => {
    // Add the video file and clips as inputs
    let command = clipList.reduce(
      (cmd, clip) => cmd.addInput(clip.dubFile),
      ffmpeg().addInput(INPUT_MOVIE)
    );

    // Prepare the delay filters
    let delayedStreams = [];
    let delayFilters = clipList.map((clip, i) => {
      let start = timeMs(clip.startTime);
      let outputStream = `[delay${i}]`;
      delayedStreams.push(outputStream);
      return `[${i + 1}:0] adelay=${start}|${start} ${outputStream}`;
    });

    // Prepare the audio merge filter
    let amixFilter = `[0:1]${delayedStreams.join('')} amix=inputs=${delayedStreams.length + 1}`;

    // Run the command
    let allFilters = delayFilters.concat([amixFilter]);
    console.log(allFilters);
    command
      .complexFilter(allFilters)
      .outputOption('-map 0:0') // use the video's video
      .outputOption(`-ss ${start.replace(',', '.')}`)
      .outputOption(`-to ${end.replace(',', '.')}`)
      .audioCodec('aac')
      .videoCodec('libx264')
      .save(outputFile)
      .on('end', resolve);
  });
}

export default {
  getFFMPEG,
  mergeAudio,
};
