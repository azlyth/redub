import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Button, ButtonToolbar } from 'react-bootstrap';


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
    this.state = { playing: false };
  }

  handlePlay() {
    this.setState({ playing: true });
  }

  handleRecord() {
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
        <div>
          <b><div style={styles.dialogue} dangerouslySetInnerHTML={{__html: this.props.text}}></div></b>
          <Button style={styles.button} bsSize="small" onClick={this.handlePlay.bind(this)}>
            <b>PLAY</b>
          </Button>
          &nbsp;&nbsp;
          <Button style={styles.button} bsSize="small" bsStyle="danger" onClick={this.handleRecord.bind(this)}>
            <b>RECORD</b>
          </Button>
          {this.renderAudioPlayer()}
        </div>
        <hr/>
      </div>
    );
  }
}
