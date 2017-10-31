import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Button } from 'react-bootstrap';
import { fileExists, timeMs } from '../utils';


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

    this.state = {
      playingDub: false,
      recorded: fileExists(props.dubFile),
    };
  }

  handlePlay() {
    // Convert the start and end to seconds
    let start = timeMs(this.props.startTime) / 1000.0;
    let end = timeMs(this.props.endTime) / 1000.0;

    this.props.playVideo(start, end);
  }

  handlePlayDub() {
    this.setState({ playingDub: true });
  }

  handleRecord() {
    this.props.recordAudio(
      this.props.dubFile,
      timeMs(this.props.duration),
      () => { this.setState({ recorded: true }); }
    );
  }

  renderPlayDubButton() {
    if (this.state.recorded) {
      return (
        <span>
          <Button style={styles.button} bsSize="small" onClick={this.handlePlayDub}>
            <b>PLAY DUB</b>
          </Button>
          &nbsp;&nbsp;
        </span>
      );
    }
  }

  renderAudioPlayer() {
    if (this.state.playingDub) {
      return (
        <ReactAudioPlayer
          src={'../'.concat(this.props.dubFile)}
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

          <Button style={styles.button} bsSize="small" onClick={this.handlePlay}>
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
