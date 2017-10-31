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

    // Start the clips at the right time by delaying them until their start time
    let delayedStreams = [];
    let delayFilters = clipList.map((clip, i) => {
      let clipStart = timeMs(clip.startTime);
      let outputStream = `[delay${i}]`;
      delayedStreams.push(outputStream);
      return `[${i + 1}:0] adelay=${clipStart}|${clipStart} ${outputStream}`;
    });

    // Silence the video's audio during each clip
    let silentSections = clipList.map(clip => {
      let clipStart = timeMs(clip.startTime) / 1000.0;
      let clipEnd = timeMs(clip.endTime) / 1000.0;
      return `volume=enable='between(t, ${clipStart}, ${clipEnd})':volume=0`;
    });
    let silentFilter = `[0:1] ${silentSections.join(', ')} [videoAudio]`;

    // Merge the adjusted video audio and all the audio clips
    let amixFilter = `[videoAudio]${delayedStreams.join('')} amix=inputs=${delayedStreams.length + 1}`;

    // Run the command
    let allFilters = [silentFilter].concat(delayFilters, [amixFilter]);
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
