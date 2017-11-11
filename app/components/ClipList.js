import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import subParser from 'subtitles-parser';
import Clip from './Clip';
import * as u from '../utils';


const CLIP_DIRECTORY = 'recorded-clips';


export default class ClipList extends Component {

  static propTypes = {
    projectDirectory: PropTypes.string.isRequired,
    playVideo: PropTypes.func.isRequired,
    subtitleFile: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.clipDirectory = path.join(this.props.projectDirectory, CLIP_DIRECTORY);
    u.makeDirectory(this.clipDirectory);

    this.recordAudio = this.recordAudio.bind(this);

    this.state = { clips: [] };
  }

  componentDidMount() {
    this.loadSubtitles();
    this.prepareClips();
    this.prepareRecorder();
  }

  loadSubtitles() {
    const subtitleData = fs.readFileSync(this.props.subtitleFile, 'utf8');
    this.subtitles = subParser.fromSrt(subtitleData);
  }

  prepareClips() {
    // Parse all the clips
    const clipPromises = this.subtitles.map((sub, i) => {
      return new Promise((resolve) => {
        const duration = u.msTime(u.timeMs(sub.endTime) - u.timeMs(sub.startTime));
        const dubFile = path.join(this.clipDirectory, i.toString().concat('.webm'));
        resolve({ ...sub, dubFile, duration });
      });
    });

    // Show the list of subs when done downloading
    Promise.all(clipPromises).then((clips) => {
      this.setState({ clips });
    });
  }

  prepareRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.recorder = new MediaRecorder(stream);
        return 'success';
      })
      .catch(error => {
        console.error(error);
        alert('Come back when you have a mic!');
        remote.app.quit();
      });
  }

  // duration: time in milliseconds
  recordAudio(outputFile, duration, successCallback) {
    this.recorder.ondataavailable = (recordedBlob) => {
      u.saveBlob(recordedBlob.data, outputFile, successCallback);
    };

    this.recorder.start();
    setTimeout(() => { this.recorder.stop(); }, duration);
  }

  render() {
    return (
      <div>
        {this.state.clips.map((clip, index) => {
          return (
            <Clip
              key={index}
              playVideo={this.props.playVideo}
              recordAudio={this.recordAudio}
              {...clip}
            />
          );
        })}
      </div>
    );
  }

}
