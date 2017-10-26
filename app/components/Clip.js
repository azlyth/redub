import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import TiMediaRecord from 'react-icons/lib/ti/media-record';
import TiMediaPlay from 'react-icons/lib/ti/media-play';


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
        <div style={{ padding: '10px' }}>
          <span dangerouslySetInnerHTML={{__html: this.props.text}}></span>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span onClick={this.handleClick.bind(this)}><TiMediaPlay size={30} /></span>
          <span><TiMediaRecord size={30} color="red" /></span>
          {this.renderAudioPlayer()}
        </div>
      </div>
    );
  }
}
