// @flow
import fs from 'fs';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ffbinaries from 'ffbinaries';
import ffmpeg from 'fluent-ffmpeg';
import subParser from 'subtitles-parser';
import ReactAudioPlayer from 'react-audio-player';
import styles from './Home.css';


const MOVIE_FILE = 'input/movie.mkv';
const SUBTITLE_FILE = 'input/subtitles.srt';
const SCENE_START = { hours: 0, minutes: 44, seconds: 15 };
const SCENE_END =   { hours: 0, minutes: 48, seconds: 55 };


function extractClip(sceneStart, duration, filename) {
  return new Promise((resolve, reject) => {
    ffmpeg(MOVIE_FILE)
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

// Borrowed from https://github.com/bazh/subtitles-parser
function timeMs(val) {
  var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
  var parts = regex.exec(val);

  if (parts === null) {
    return 0;
  }

  for (var i = 1; i < 5; i++) {
    parts[i] = parseInt(parts[i], 10);
    if (isNaN(parts[i])) parts[i] = 0;
  }

  // hours + minutes + seconds + ms
  return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
};

// Borrowed from https://github.com/bazh/subtitles-parser
var msTime = function(val) {
  var measures = [ 3600000, 60000, 1000 ];
  var time = [];

  for (var i in measures) {
    var res = (val / measures[i] >> 0).toString();

    if (res.length < 2) res = '0' + res;
    val %= measures[i];
    time.push(res);
  }

  var ms = val.toString();
  if (ms.length < 3) {
    for (i = 0; i <= 3 - ms.length; i++) ms = '0' + ms;
  }

  return time.join(':') + ',' + ms;
};


class Clip extends Component {

  constructor(props) {
    super(props);
    this.state = { playing: false };
  }

  handleClick() {
    this.setState({ playing: true });
  }

  renderAudioPlayer() {
    if (this.state.playing) {
      let filename = '../' + this.props.file;
      return (
        <ReactAudioPlayer src={filename}
          autoPlay
          onEnded={() => this.setState({ playing: false })}
        />
      );
    }
  }

  render() {
    return (
      <div key={this.props.file}>
        <hr/>
        <div style={{ padding: '10px' }} onClick={this.handleClick.bind(this)}>
          <div dangerouslySetInnerHTML={{__html: this.props.text}}></div>
          {this.renderAudioPlayer()}
        </div>
      </div>
    );
  }
}


export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      statusMessage: 'Initializing...',
      done: false,
    };
  }

  componentDidMount() {
    this.loadSubtitles();

    getFFMPEG().then(this.extractAllClips.bind(this));
  }

  loadSubtitles() {
    let subtitleData = fs.readFileSync(SUBTITLE_FILE, 'utf8');
    this.subtitles = subParser.fromSrt(subtitleData);
  }

  extractAllClips() {
    this.setState({ statusMessage: 'Extracting clips...'});

    // Extract all the clips
    let fix = (s) => s.replace(',', '.');
    let extractPromises = this.subtitles.map((sub, i) => {
        return new Promise((resolve, reject) => {
          let duration = msTime(timeMs(sub.endTime) - timeMs(sub.startTime));
          let outputFile = 'audio-clips/output-' + i + '.mp3';

          extractClip(fix(sub.startTime), fix(duration), outputFile).then(() => {
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
      return (
        <div>
          {this.state.clips.map(clip => {
            return (<Clip key={clip.file} {...clip} />);
          })}
        </div>
      );
    } else {
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
