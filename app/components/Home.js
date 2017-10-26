// @flow
import fs from 'fs';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import subParser from 'subtitles-parser';
import ReactPlayer from 'react-player';
import utils from '../utils';
import styles from './Home.css';
import Clip from './Clip';


const INPUT_SUBTITLE = 'input/subtitles.srt';
const SCENE_START = { hours: 0, minutes: 44, seconds: 15 };
const SCENE_END =   { hours: 0, minutes: 48, seconds: 55 };


export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      statusMessage: 'Initializing...',
      doneExtracting: false,
      videoPlaying: false,
    };

    this.extractAllClips = this.extractAllClips.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.stopIfPastEnd = this.stopIfPastEnd.bind(this);
  }

  componentDidMount() {
    this.loadSubtitles();
    utils.getFFMPEG().then(this.extractAllClips);
  }

  loadSubtitles() {
    let subtitleData = fs.readFileSync(INPUT_SUBTITLE, 'utf8');
    this.subtitles = subParser.fromSrt(subtitleData);
  }

  extractAllClips() {
    this.setState({ statusMessage: 'Extracting clips...'});

    // Extract all the clips
    let fix = (s) => s.replace(',', '.');
    let extractPromises = this.subtitles.map((sub, i) => {
        return new Promise((resolve, reject) => {
          let duration = utils.msTime(utils.timeMs(sub.endTime) - utils.timeMs(sub.startTime));
          let outputFile = 'original-clips/output-' + i + '.mp3';

          resolve({...sub, duration: duration, clipKey: i, playing: false});

          //utils.extractClip(fix(sub.startTime), fix(duration), outputFile).then(() => {
            //console.log('finishing');
            //resolve({
              //...sub,
              //file: outputFile,
              //playing: false,
            //});
          //});
        });
    });

    // Show the list of subs when done downloading
    Promise.all(extractPromises).then((clips) => {
      this.setState({ clips, doneExtracting: true });
    });
  }

  playVideo(start, end) {
    // Seek to the right time
    this.videoPlayer.seekTo(start)

    // Start the video and schedule its stop
    this.setState({ videoPlaying: true, clipEnd: end });
  }

  stopVideo() {
    this.setState({ videoPlaying: false, clipEnd: 0 });
  }

  stopIfPastEnd(data) {
    console.log('testing', data.playedSeconds, this.state.clipEnd);
    if (data.playedSeconds > this.state.clipEnd) {
      this.stopVideo();
    }
  }

  renderBody() {
    if (this.state.doneExtracting) {
      // Return a list of Clips
      return (
        <div>
          {this.state.clips.map(clip => {
            return (<Clip key={clip.clipKey} playVideo={this.playVideo} {...clip} />);
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
            <ReactPlayer url={'../input/movie.mkv'}
              height="100%"
              width="100%"
              playing={this.state.videoPlaying}
              onProgress={this.stopIfPastEnd}
              progressFrequency={100}
              ref={(videoPlayer) => { this.videoPlayer = videoPlayer }}
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
