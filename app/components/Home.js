// @flow
import fs from 'fs';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import subParser from 'subtitles-parser';
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
      done: false,
    };

    this.extractAllClips = this.extractAllClips.bind(this);
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
          let outputFile = 'audio-clips/output-' + i + '.mp3';

          utils.extractClip(fix(sub.startTime), fix(duration), outputFile).then(() => {
            console.log('finishing');
            resolve({
              ...sub,
              file: outputFile,
              playing: false,
            });
          });
        });
    });

    // Show the list of subs when done downloading
    Promise.all(extractPromises).then((clips) => {
      this.setState({ clips, done: true });
    });
  }

  renderBody() {
    if (this.state.done) {
      // Return a list of Clips
      return (
        <div>
          {this.state.clips.map(clip => {
            return (<Clip key={clip.file} {...clip} />);
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
          <h2>Redub</h2>
          {this.renderBody()}
        </div>
      </div>
    );
  }
}
