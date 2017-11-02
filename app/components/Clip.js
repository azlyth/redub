import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import * as u from '../utils';


const styles = {
  dialogue: {
    fontSize: '2rem',
    marginBottom: '10px'
  },

  button: {
    fontSize: '1.3rem'
  },
};


export default class Clip extends Component {

  constructor(props) {
    super(props);

    this.handlePlay = this.handlePlay.bind(this);
    this.handleRecord = this.handleRecord.bind(this);
    this.handlePlayDub = this.handlePlayDub.bind(this);
    this.handleRemoveDub = this.handleRemoveDub.bind(this);

    // Initialize the hacky play counter
    this.renderAudioCounter = 0;

    this.state = {
      playingDub: false,
      recorded: u.fileExists(props.dubFile),
    };
  }

  playVideo(withSound) {
    // Convert the start and end to seconds
    const start = u.timeMs(this.props.startTime) / 1000.0;
    const end = u.timeMs(this.props.endTime) / 1000.0;
    this.props.playVideo(start, end, withSound);
  }

  handlePlay() {
    this.playVideo(true);
  }

  handlePlayDub() {
    this.setState({ playingDub: true });
    this.playVideo(false);
  }

  handleRemoveDub() {
    console.log(u);
    u.deleteFile(this.props.dubFile);
    this.setState({ recorded: false });
  }

  handleRecord() {
    this.props.recordAudio(
      this.props.dubFile,
      u.timeMs(this.props.duration),
      () => { this.setState({ recorded: true }); }
    );
    this.playVideo(false);
  }

  renderPlayDubButton() {
    if (this.state.recorded) {
      return (
        <span>
          <Button style={styles.button} bsSize="small" bsStyle="success" onClick={this.handlePlayDub}>
            <b>PLAY DUB</b>
          </Button>
          &nbsp;&nbsp;
          <Button style={styles.button} bsSize="small" bsStyle="warning" onClick={this.handleRemoveDub}>
            <b>REMOVE DUB</b>
          </Button>
          &nbsp;&nbsp;
        </span>
      );
    }
  }

  renderAudioPlayer() {
    if (this.state.playingDub) {
      // A true hack. Basically, the browser will cache the audio clip unless the 'Cache-Control'
      // header is set to 'no-cache'. So in order to get around that, set the querystring of the
      // URL to force the browser to re-download the audio clip.
      this.renderAudioCounter += 1;
      const audioSource = '../'.concat(this.props.dubFile, '?', this.renderAudioCounter);

      return (
        <audio
          src={audioSource}
          autoPlay
          onEnded={() => { this.setState({ playingDub: false }); }}
        />
      );
    }
  }

  render() {
    return (
      <div>
        <div>

          <b>
            <div
              style={styles.dialogue}
              dangerouslySetInnerHTML={{ __html: this.props.text }}
            />
          </b>

          <Button style={styles.button} bsSize="small" bsStyle="success" onClick={this.handlePlay}>
            <b>PLAY</b>
          </Button>
          &nbsp;&nbsp;

          { this.renderPlayDubButton() }

          <Button style={styles.button} bsSize="small" bsStyle="danger" onClick={this.handleRecord}>
            <b>RECORD</b>
          </Button>

        </div>

        { this.renderAudioPlayer() }

        <hr />
      </div>
    );
  }
}
