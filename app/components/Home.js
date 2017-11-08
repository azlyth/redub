import fs from 'fs';
import path from 'path';
import React, { Component } from 'react';
import { remote } from 'electron';
import ReactPlayer from 'react-player';
import { Button } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import ClipList from './ClipList';
import ProjectSelector from './ProjectSelector';
import * as u from '../utils';
import styles from './Home.css';


const DEFAULT_OUTPUT_PATH = path.join(remote.app.getPath('desktop'), 'masterpiece.mp4');
const PROGRESS_INTERVAL = 50;
const PERCENT_MESSAGE = `
FYI, if the first clip is in the middle of the video,
the progress will stay at zero for a bit.
`;

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      exporting: false,
      exportProgress: 0,
      videoPlaying: false,
      projectConfig: null,
    };

    this.playVideo = this.playVideo.bind(this);
    this.stopIfPastEnd = this.stopIfPastEnd.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.export = this.export.bind(this);
    this.projectChosen = this.projectChosen.bind(this);
    this.updateExportProgress = this.updateExportProgress.bind(this);
  }

  componentDidMount() {
    u.setupFFBinaries();
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

  updateExportProgress(progress) {
    // Format the timestamp so that timeMs knows how to parse it
    const current = u.timeMs(`${progress.timemark.replace('.', ',')}0`);

    const start = u.timeMs(this.state.exportStartTime);
    const end = u.timeMs(this.state.exportEndTime);
    const percent = (current / (end - start)) * 100;

    this.setState({ exportProgress: Math.round(Number(percent))});
  }

  export() {
    const allClips = this.clipList.state.clips;

    // Find the indices of the clips that were dubbed
    let existingClips = fs.readdirSync(this.clipList.clipDirectory).filter(f => f[0] !== '.');
    existingClips = existingClips.map(f => parseInt(f.replace('.webm', ''), 10));
    existingClips.sort((a, b) => a - b);

    // Return if there are no clips to export
    if (existingClips.length === 0) {
      alert('You haven\'t dubbed anything yet!');
      return;
    }

    // Get the actual clip that corresponds to each index
    const clips = existingClips.map(i => allClips[i]);

    // Get the first and last clips
    const exportStartTime = allClips[existingClips[0]].startTime;
    const exportEndTime = allClips[existingClips[existingClips.length - 1]].endTime;

    // Store the export info in our state
    this.setState({
      exporting: true,
      exportProgress: 0,
      exportStartTime,
      exportEndTime,
    });

    // Have the user choose where to output the video
    const outputPath = remote.dialog.showSaveDialog({ defaultPath: DEFAULT_OUTPUT_PATH });

    // Add the clips to the video
    u.mergeAudio(
      this.state.projectConfig.video,
      clips,
      exportStartTime,
      exportEndTime,
      outputPath,
      this.updateExportProgress,
    ).then(() => { this.setState({ exporting: false }); });
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
        <Button
          className={styles.exportButton}
          onClick={this.export}
        >
          EXPORT
        </Button>
      );
    }
  }

  render() {
    return (
      <div>
        {this.state.exporting &&
          <div className={styles.exportOverlay}>
            <div>
              <p>Exporting your dank video...</p>
              <br />
              <p>{this.state.exportProgress}%</p>
              <br />
              <i className="fa fa-spinner fa-spin fa-2x" />
              <br />
              <br />
              <p>
                {PERCENT_MESSAGE}
              </p>
            </div>
          </div>
        }

        <div className={styles.container} data-tid="container">

          <div className={styles.header}>
            {this.renderHeader()}
          </div>

          <div className={styles.body}>
            <Scrollbars>
              {this.renderBody()}
            </Scrollbars>
          </div>

          <div className={styles.footer}>
            {this.renderFooter()}
          </div>

        </div>
      </div>
    );
  }
}
