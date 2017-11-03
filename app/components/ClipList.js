import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Clip from './Clip';


export default class ClipList extends Component {

  static propTypes = {
    clips: PropTypes.arrayOf(PropTypes.object),
    playVideo: PropTypes.func.isRequired,
    recordAudio: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div>
        {this.props.clips.map((clip, index) => {
          return (
            <Clip
              key={index}
              playVideo={this.props.playVideo}
              recordAudio={this.props.recordAudio}
              {...clip}
            />
          );
        })}
      </div>
    );
  }

}
