import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  static propTypes = {
    dubFile: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    playVideo: PropTypes.func.isRequired,
    recordAudio: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    this.handlePlay = this.handlePlay.bind(this);
    this.handleRecord = this.handleRecord.bind(this);
    this.handlePlayDub = this.handlePlayDub.bind(this);
    this.handleRemoveDub = this.handleRemoveDub.bind(this);

    // Initialize the hacky play counter
    this.state = {
      playingDub: false,
      recorded: u.fileExists(props.dubFile),
      renderAudioCounter: 0,
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
    this.setState({
      playingDub: true,
      renderAudioCounter: this.state.renderAudioCounter + 1,
    });
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
      const audioSource = '../'.concat(this.props.dubFile, '?', this.state.renderAudioCounter);

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
