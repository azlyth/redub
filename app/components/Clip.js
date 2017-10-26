import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Button, ButtonToolbar } from 'react-bootstrap';
import TiMediaRecord from 'react-icons/lib/ti/media-record';
import TiMediaPlayOutline from 'react-icons/lib/ti/media-play-outline';


export default class Clip extends Component {

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
        <div>
          <div style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{__html: this.props.text}}></div>
          <Button bsSize="small" onClick={this.handleClick.bind(this)}>Play</Button>
          &nbsp;&nbsp;
          <Button bsSize="small" bsStyle="danger">Record</Button>
          {this.renderAudioPlayer()}
        </div>
      </div>
    );
  }
}
