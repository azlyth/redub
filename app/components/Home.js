import fs from 'fs';
import React, { Component } from 'react';
import subParser from 'subtitles-parser';
import ReactPlayer from 'react-player';
import { Button } from 'react-bootstrap';
import ClipList from './ClipList';
import utils from '../utils';
import styles from './Home.css';


const CLIP_DIRECTORY = 'output-clips';
const INPUT_MOVIE = '../input/movie.mkv';
const INPUT_SUBTITLE = 'input/subtitles.srt';
const PROGRESS_INTERVAL = 50;


export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      statusMessage: 'Initializing...',
      donePreparingClips: false,
      videoPlaying: false,
    };

    this.playVideo = this.playVideo.bind(this);
    this.prepareClips = this.prepareClips.bind(this);
    this.recordAudio = this.recordAudio.bind(this);
    this.stopIfPastEnd = this.stopIfPastEnd.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.export = this.export.bind(this);
  }

  componentDidMount() {
    // Download FFMPEG if needed
    utils.getFFMPEG();

    this.loadSubtitles();
    this.prepareClips();

    this.prepareRecorder();
  }

  loadSubtitles() {
    const subtitleData = fs.readFileSync(INPUT_SUBTITLE, 'utf8');
    this.subtitles = subParser.fromSrt(subtitleData);
  }

  prepareClips() {
    this.setState({ statusMessage: 'Preparing clips...' });

    // Parse all the clips
    const clipPromises = this.subtitles.map((sub, i) => {
      return new Promise((resolve) => {
        const duration = utils.msTime(utils.timeMs(sub.endTime) - utils.timeMs(sub.startTime));
        const dubFile = CLIP_DIRECTORY.concat('/', i, '.webm');
        resolve({ ...sub, dubFile, duration });
      });
    });

    // Show the list of subs when done downloading
    Promise.all(clipPromises).then((clips) => {
      this.setState({ clips, donePreparingClips: true });
    });
  }

  prepareRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.recorder = new MediaRecorder(stream);
    });
  }

  // duration: time in milliseconds
  recordAudio(outputFile, duration, successCallback) {
    this.recorder.ondataavailable = (recordedBlob) => {
      utils.saveBlob(recordedBlob.data, outputFile, successCallback);
    };

    this.recorder.start();
    setTimeout(() => { this.recorder.stop(); }, duration);
  }

  // start: integer time in seconds
  // end:   integer time in seconds
  playVideo(start, end, withSound) {
    // Seek to the right time
    this.videoPlayer.seekTo(start);

    // Start the video and schedule its stop
    const volume = withSound ? 1.0 : 0;
    this.setState({ videoPlaying: true, volume: volume, clipEnd: end });
  }

  stopVideo() {
    this.setState({ videoPlaying: false, clipEnd: 0 });
  }

  stopIfPastEnd(data) {
    if (data.playedSeconds > this.state.clipEnd) {
      this.stopVideo();
    }
  }

  export() {
    // Ignore hidden files, extract sub index, and sort
    let existingClips = fs.readdirSync(CLIP_DIRECTORY).filter(f => f[0] !== '.');
    existingClips = existingClips.map(f => parseInt(f.replace('.webm', ''), 10));
    existingClips.sort((a, b) => a - b);

    // Get the corresponding subs
    const clips = existingClips.map(i => this.state.clips[i]);

    // Get the first and last clips
    const firstClip = this.subtitles[existingClips[0]];
    const lastClip = this.subtitles[existingClips[existingClips.length - 1]];

    // Add the clips to the video
    console.log('Starting merge...');
    utils.mergeAudio(
      clips,
      firstClip.startTime,
      lastClip.endTime,
      'final.mp4'
    ).then(() => { console.log('Done!'); });
  }

  renderBody() {
    if (this.state.donePreparingClips) {
      return (
        <ClipList
          clips={this.state.clips}
          playVideo={this.playVideo}
          recordAudio={this.recordAudio}
        />
      );
    }

    // Return the status message
    return (
      <p>{this.state.statusMessage}</p>
    );
  }

  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">

          <div className={styles.video}>
            <ReactPlayer
              url={INPUT_MOVIE}
              height="100%"
              width="100%"
              volume={this.state.volume}
              playing={this.state.videoPlaying}
              onProgress={this.stopIfPastEnd}
              progressFrequency={PROGRESS_INTERVAL}
              ref={(videoPlayer) => { this.videoPlayer = videoPlayer; }}
            />
          </div>

          <div className={styles.clips}>
            {this.renderBody()}
          </div>

          <div className={styles.footer}>
            <Button className={styles.exportButton} onClick={this.export}>
              <b>EXPORT</b>
            </Button>
          </div>

        </div>
      </div>
    );
  }
}
