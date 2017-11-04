import fs from 'fs';
import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import { Button } from 'react-bootstrap';
import ClipList from './ClipList';
import ProjectSelector from './ProjectSelector';
import * as u from '../utils';
import styles from './Home.css';


const PROGRESS_INTERVAL = 50;


export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      videoPlaying: false,

      // Project configuration should look as follows
      // projectConfig: { video: '/path/to/video', subtitles: '/path/to/subtitles' }
      projectConfig: null,
    };

    this.playVideo = this.playVideo.bind(this);
    this.stopIfPastEnd = this.stopIfPastEnd.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.export = this.export.bind(this);
    this.projectChosen = this.projectChosen.bind(this);
  }

  componentDidMount() {
    u.getFFMPEG();
  }

  projectChosen(projectConfig) {
    this.setState({ projectConfig });
  }

  workingOnProject() {
    return this.state.projectConfig !== null;
  }

  // start: integer time in seconds
  // end:   integer time in seconds
  playVideo(start, end, withSound) {
    // Seek to the right time
    this.videoPlayer.seekTo(start);

    // Start the video and schedule its stop
    const volume = withSound ? 1.0 : 0;
    this.setState({ videoPlaying: true, volume, clipEnd: end });
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
    const allClips = this.clipList.state.clips;

    // Ignore hidden files, extract sub index, and sort
    let existingClips = fs.readdirSync(this.clipList.clipDirectory).filter(f => f[0] !== '.');
    existingClips = existingClips.map(f => parseInt(f.replace('.webm', ''), 10));
    existingClips.sort((a, b) => a - b);

    // Get the corresponding subs
    const clips = existingClips.map(i => allClips[i]);

    // Get the first and last clips
    const firstClip = allClips[existingClips[0]];
    const lastClip = allClips[existingClips[existingClips.length - 1]];

    // Add the clips to the video
    console.log('Starting merge...');
    u.mergeAudio(
      clips,
      firstClip.startTime,
      lastClip.endTime,
      'final.mp4'
    ).then(() => { console.log('Done!'); });
  }

  renderHeader() {
    if (this.workingOnProject()) {
      return (
        <ReactPlayer
          url={this.state.projectConfig.video}
          height="100%"
          width="100%"
          volume={this.state.volume}
          playing={this.state.videoPlaying}
          onProgress={this.stopIfPastEnd}
          progressFrequency={PROGRESS_INTERVAL}
          ref={(videoPlayer) => { this.videoPlayer = videoPlayer; }}
        />
      );
    }
  }

  renderBody() {
    if (this.workingOnProject()) {
      return (
        <ClipList
          ref={(clipList) => { this.clipList = clipList; }}
          projectDirectory={this.state.projectConfig.projectDirectory}
          playVideo={this.playVideo}
          subtitleFile={this.state.projectConfig.subtitles}
        />
      );
    }

    return (<ProjectSelector onProjectChosen={this.projectChosen} />);
  }

  renderFooter() {
    if (this.workingOnProject()) {
      return (
        <Button className={styles.exportButton} onClick={this.export}>
          <b>EXPORT</b>
        </Button>
      );
    }
  }

  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">

          <div className={styles.header}>
            {this.renderHeader()}
          </div>

          <div className={styles.body}>
            {this.renderBody()}
          </div>

          <div className={styles.footer}>
            {this.renderFooter()}
          </div>

        </div>
      </div>
    );
  }
}
