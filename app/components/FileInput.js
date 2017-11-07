import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import styles from './FileInput.css';


export default class FileInput extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    forOutput: PropTypes.bool,
    accept: PropTypes.string,
  };

  static defaultProps = {
    placeholder: 'Choose file...',
    className: null,
    forOutput: false,
    accept: null,
  };

  constructor(props) {
    super(props);
    this.state = { file: undefined };
    this.fileChanged = this.fileChanged.bind(this);
  }

  buttonClasses() {
    const buttonClasses = [this.props.className, styles.button];

    // Add the fileChosen class if a file was chosen
    if (this.state.file !== undefined) {
      buttonClasses.push(styles.fileChosen);
    }

    return classNames(buttonClasses);
  }

  fileChanged() {
    const file = this.fileInput.files[0];
    this.props.onChange(file);

    // If this component is being used to choose a file for output, clear the
    // file input. If we don't, choosing the same file again will result in
    // no change (which is incorrect).
    if (this.props.forOutput) {
      this.fileInput.value = null;
    } else {
      this.setState({ file });
    }
  }

  render() {
    const buttonText = this.state.file === undefined ? this.props.placeholder : this.state.file.name;

    return (
      <span>
        <Button
          bsSize="large"
          className={this.buttonClasses()}
          onClick={() => { this.fileInput.click(); }}
        >
          { buttonText }
        </Button>
        <input
          type="file"
          accept={this.props.accept}
          className={styles.fileInput}
          onChange={this.fileChanged}
          ref={(e) => { this.fileInput = e; }}
        />
      </span>
    );
  }
}
