import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { timeMs } from '../utils';


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
  }

  handlePlay() {
    // Convert the start and end to seconds
    let start = timeMs(this.props.startTime) / 1000.0;
    let end = timeMs(this.props.endTime) / 1000.0;

    this.props.playVideo(start, end);
  }

  handleRecord() {
    this.props.recordAudio(this.props.outputFile, timeMs(this.props.duration));
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

          <Button style={styles.button} bsSize="small" bsStyle="danger" onClick={this.handleRecord}>
            <b>RECORD</b>
          </Button>
        </div>
        <hr />
      </div>
    );
  }
}
