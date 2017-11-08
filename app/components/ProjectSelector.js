import fs from 'fs-extra';
import path from 'path';
import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import * as u from '../utils';
import FileInput from './FileInput';
import styles from './ProjectSelector.css';


const ROOT_PROJECT_FOLDER = path.join(remote.app.getPath('documents'), 'redub');
const CONFIG_FILENAME = 'config.json';

function projectPath(name) {
  return path.join(ROOT_PROJECT_FOLDER, name);
}


export default class ProjectSelector extends Component {

  static propTypes = {
    onProjectChosen: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    u.makeDirectory(ROOT_PROJECT_FOLDER);
    this.getExistingProjects();

    this.state = {
      newProjectName: '',
      nameAlreadyExists: false,
      existingProjects: [],
      videoFile: null,
      subFile: null,
    };

    this.createNewProject = this.createNewProject.bind(this);
    this.chooseExistingProject = this.chooseExistingProject.bind(this);
    this.changeProjectName = this.changeProjectName.bind(this);
  }

  getExistingProjects() {
    fs.readdir(ROOT_PROJECT_FOLDER, (err, files) => {
      this.setState({ existingProjects: files });
    });
  }

  validateConfig(config) {
    // Make sure the video exists
    if (!u.fileExists(config.video)) {
      alert(`The video (${config.video}) seems to be missing.`);
      return false;
    }

    // Make sure the subtitles exist
    if (!u.fileExists(config.subtitles)) {
      alert(`The subtitles (${config.subtitles}) seem to be missing.`);
      return false;
    }

    return true;
  }

  loadProject(config) {
    if (this.validateConfig(config)) {
      this.props.onProjectChosen(config);
    }
  }

  createNewProject() {
    const projectDirectory = projectPath(this.state.newProjectName);
    const projectConfig = {
      video: this.state.videoFile.path,
      subtitles: this.state.subFile.path,
      projectDirectory,
    };

    // Create the new project directory and save the configuration
    if (this.validateConfig(projectConfig)) {
      const configPath = path.join(projectDirectory, CONFIG_FILENAME);
      u.makeDirectory(projectDirectory);
      fs.writeFileSync(configPath, JSON.stringify(projectConfig), { encoding: 'utf8' });
      this.loadProject(projectConfig);
    }
  }

  chooseExistingProject(projectName) {
    const configPath = path.join(projectPath(projectName), CONFIG_FILENAME);
    const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
    this.loadProject(config);
  }

  changeProjectName(event) {
    const newProjectName = event.target.value;

    const potentialProjectPath = projectPath(newProjectName);
    const nameAlreadyExists = newProjectName.length > 0 && u.fileExists(potentialProjectPath);

    this.setState({
      newProjectName,
      nameAlreadyExists,
    });
  }

  nameChosen() {
    return this.state.newProjectName.length > 0;
  }

  nameValid() {
    return !this.state.nameAlreadyExists;
  }

  canCreateNewProject() {
    const videoChosen = this.state.videoFile !== null;
    const subsChosen = this.state.subFile !== null;

    return this.nameChosen() && this.nameValid() && videoChosen && subsChosen;
  }

  nameClasses() {
    const classes = [styles.newProjectName];

    if (this.nameChosen()) {
      const otherClass = this.nameValid() ? styles.validName : styles.invalidName;
      classes.push(otherClass);
    }

    return classNames(classes);
  }

  deleteProject(event, projectName) {
    // The project will be selected if you don't prevent the other click event
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete "${projectName}"?`)) {
      fs.removeSync(projectPath(projectName));
      this.getExistingProjects();
    }
  }

  renderProjects() {
    return (
      <div>
        <h3>Existing projects:</h3>
        <div className={styles.projectListContainer}>
            {this.state.existingProjects.map((project, index) => {
              return (
                <div key={index} className={styles.project}>
                  <Button
                    bsSize="large"
                    className={styles.chooseProject}
                    onClick={() => { this.chooseExistingProject(project); }}
                  >
                    {project}
                  </Button>
                  <Button
                    bsSize="large"
                    className={styles.deleteProject}
                    bsStyle="danger"
                    onClick={(event) => { this.deleteProject(event, project); }}
                  >
                    <i className={classNames(['fa', 'fa-times'])} />
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className={styles.projectSelector}>
        {(this.state.existingProjects.length > 0) &&
          <span>
            {this.renderProjects()}
            <br />
            <hr />
          </span>
        }

        <br />

        <div>
          <input
            type="text"
            placeholder="Enter a new project name..."
            className={this.nameClasses()}
            value={this.state.newProjectName}
            onChange={this.changeProjectName}
          />
          {this.state.nameAlreadyExists &&
            <p className={styles.errorText}>
              A project with that name already exists!
            </p>
          }
        </div>

        <br />

        <div>
          <FileInput
            className={styles.fileInput}
            placeholder="Choose video"
            onChange={(videoFile) => { this.setState({ videoFile }); }}
          />
          &nbsp;&nbsp;&nbsp;
          <FileInput
            accept=".srt"
            className={styles.fileInput}
            placeholder="Choose subtitles (srt)"
            onChange={(subFile) => { this.setState({ subFile }); }}
          />
        </div>

        <br />

        <Button
          bsSize="large"
          bsStyle="success"
          disabled={!this.canCreateNewProject()}
          onClick={this.createNewProject}
        >
          <b>CREATE NEW PROJECT</b>
        </Button>
      </div>
    );
  }
}
