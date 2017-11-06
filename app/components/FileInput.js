import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import styles from './FileInput.css';


export default class FileInput extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
  };

  static defaultProps = {
    placeholder: 'Choose file...',
    className: null,
  };

  constructor(props) {
    super(props);
    this.state = { file: null };
    this.fileChanged = this.fileChanged.bind(this);
  }

  fileChanged() {
    const file = this.fileInput.files[0];
    this.setState({ file });
    this.props.onChange(file);
  }

  render() {
    const buttonText = this.state.file === null ? this.props.placeholder : this.state.file.name;

    return (
      <span>
        <Button
          bsSize="large"
          className={this.props.className}
          onClick={() => { this.fileInput.click(); }}
        >
          {buttonText}
        </Button>
        <input
          type="file"
          className={styles.fileInput}
          onChange={this.fileChanged}
          ref={(e) => { this.fileInput = e; }}
        />
      </span>
    );
  }
}
