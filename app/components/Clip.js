import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';


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
        <div style={{ padding: '10px' }} onClick={this.handleClick.bind(this)}>
          <div dangerouslySetInnerHTML={{__html: this.props.text}}></div>
          {this.renderAudioPlayer()}
        </div>
      </div>
    );
  }
}


