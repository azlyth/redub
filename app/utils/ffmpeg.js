import path from 'path';
import { remote } from 'electron';
import ffbinaries from 'ffbinaries';
import ffmpeg from 'fluent-ffmpeg';
import { timeMs } from './subtitles';
import { fileExists, makeDirectory } from './file';


const BINARY_DIRECTORY = path.join(remote.app.getPath('appData'), 'redub', 'binaries');
const FFMPEG_PATH = path.join(BINARY_DIRECTORY, 'ffmpeg');
const FFPROBE_PATH = path.join(BINARY_DIRECTORY, 'ffprobe');


function setupFFBinaries() {
  return new Promise((resolve, reject) => {
    // Create the binary directory
    makeDirectory(BINARY_DIRECTORY);

    // Download the binaries if necessary
    if (fileExists(FFMPEG_PATH) && fileExists(FFPROBE_PATH)) {
      resolve();
    } else {
      ffbinaries.downloadFiles(
        ['ffmpeg', 'ffprobe'],
        { destination: BINARY_DIRECTORY },
        () => { resolve(); }
      );
    }
  });
}

function mergeAudio(inputMovie, clipList, start, end, outputFile, progressCallback) {
  return new Promise((resolve, reject) => {
    // Initialize the new command
    let command = ffmpeg()
      .setFfmpegPath(FFMPEG_PATH)
      .setFfprobePath(FFPROBE_PATH)
      .addInput(inputMovie)
      .on('progress', progressCallback);

    // Add the video file and clips as inputs
    command = clipList.reduce(
      (cmd, clip) => cmd.addInput(clip.dubFile),
      command
    );

    // Start the clips at the right time by delaying them until their start time
    const delayedStreams = [];
    const delayFilters = clipList.map((clip, i) => {
      const clipStart = timeMs(clip.startTime);
      const outputStream = `[delay${i}]`;
      delayedStreams.push(outputStream);
      return `[${i + 1}:0] adelay=${clipStart}|${clipStart} ${outputStream}`;
    });

    // Silence the video's audio during each clip
    const silentSections = clipList.map(clip => {
      const clipStart = timeMs(clip.startTime) / 1000.0;
      const clipEnd = timeMs(clip.endTime) / 1000.0;
      return `volume=enable='between(t, ${clipStart}, ${clipEnd})':volume=0`;
    });
    const silentFilter = `[0:1] ${silentSections.join(', ')} [videoAudio]`;

    // Merge the adjusted video audio and all the audio clips
    const amixFilter = `[videoAudio]${delayedStreams.join('')} amix=inputs=${delayedStreams.length + 1}`;

    // Run the command
    const allFilters = [silentFilter].concat(delayFilters, [amixFilter]);
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
  setupFFBinaries,
  mergeAudio,
};
