import fs from 'fs';
import React, { Component } from 'react';
import subParser from 'subtitles-parser';
import ReactPlayer from 'react-player';
import utils from '../utils';
import styles from './Home.css';
import Clip from './Clip';


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
  }

  componentDidMount() {
    // Download FFMPEG if needed
    utils.getFFMPEG();

    this.loadSubtitles();
    this.prepareClips();

    this.prepareRecorder();
  }

  loadSubtitles() {
    let subtitleData = fs.readFileSync(INPUT_SUBTITLE, 'utf8');
    this.subtitles = subParser.fromSrt(subtitleData);
  }

  prepareClips() {
    this.setState({ statusMessage: 'Preparing clips...' });

    // Parse all the clips
    let fix = (s) => s.replace(',', '.');
    let clipPromises = this.subtitles.map((sub, i) => {
      return new Promise((resolve) => {
        let duration = utils.msTime(utils.timeMs(sub.endTime) - utils.timeMs(sub.startTime));
        let dubFile = 'output-clips/'.concat(i, '.webm');
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
  playVideo(start, end) {
    // Seek to the right time
    this.videoPlayer.seekTo(start);

    // Start the video and schedule its stop
    this.setState({ videoPlaying: true, clipEnd: end });
  }

  stopVideo() {
    this.setState({ videoPlaying: false, clipEnd: 0 });
  }

  stopIfPastEnd(data) {
    if (data.playedSeconds > this.state.clipEnd) {
      this.stopVideo();
    }
  }

  renderBody() {
    if (this.state.donePreparingClips) {
      // Return a list of Clips
      return (
        <div>
          {this.state.clips.map((clip, index) => {
            return (
              <Clip
                key={index}
                playVideo={this.playVideo}
                recordAudio={this.recordAudio}
                {...clip}
              />
            );
          })}
        </div>
      );
    } else {
      // Return the status message
      return (
        <p>{this.state.statusMessage}</p>
      );
    }
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
              playing={this.state.videoPlaying}
              onProgress={this.stopIfPastEnd}
              progressFrequency={PROGRESS_INTERVAL}
              ref={(videoPlayer) => { this.videoPlayer = videoPlayer; }}
            />
          </div>
          <div className={styles.clips}>
            {this.renderBody()}
          </div>
        </div>
      </div>
    );
  }
}
