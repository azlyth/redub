import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { timeMs } from '../utils';


const styles = {
  dialogue: {
    fontSize: '2rem',
    marginBottom: '10px'
  },

  button: {
    fontSize: '1.3rem'
  },
}


export default class Clip extends Component {

  constructor(props) {
    super(props);
  }

  handlePlay() {
    // Convert the start and end to seconds
    let start = timeMs(this.props.startTime) / 1000.0;
    let end = timeMs(this.props.endTime) / 1000.0;

    this.props.playVideo(start, end);
  }

  handleRecord() {
  }

  render() {
    return (
      <div>
        <div>
          <b><div style={styles.dialogue} dangerouslySetInnerHTML={{__html: this.props.text}}></div></b>

          <Button style={styles.button} bsSize="small" onClick={this.handlePlay.bind(this)}>
            <b>PLAY</b>
          </Button>

          &nbsp;&nbsp;

          <Button style={styles.button} bsSize="small" bsStyle="danger" onClick={this.handleRecord.bind(this)}>
            <b>RECORD</b>
          </Button>
        </div>
        <hr/>
      </div>
    );
  }
}
