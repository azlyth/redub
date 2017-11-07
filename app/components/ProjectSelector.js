import fs from 'fs';
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

  createNewProject() {
    const projectDirectory = path.join(ROOT_PROJECT_FOLDER, this.state.newProjectName);

    const projectConfig = {
      video: this.state.videoFile.path,
      subtitles: this.state.subFile.path,
      projectDirectory,
    };

    // Create the new project directory and save the configuration
    const configPath = path.join(projectDirectory, CONFIG_FILENAME);
    u.makeDirectory(projectDirectory);
    fs.writeFileSync(configPath, JSON.stringify(projectConfig), { encoding: 'utf8' });

    this.props.onProjectChosen(projectConfig);
  }

  chooseExistingProject(projectName) {
    const configPath = path.join(ROOT_PROJECT_FOLDER, projectName, CONFIG_FILENAME);
    const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
    this.props.onProjectChosen(config);
  }

  changeProjectName(event) {
    const newProjectName = event.target.value;

    const potentialProjectPath = path.join(ROOT_PROJECT_FOLDER, newProjectName);
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

  renderProjects() {
    return (
      <div>
        <h3>Choose existing project:</h3>
        <div className={styles.projectListContainer}>
          <ListGroup className={styles.projectList}>
            {this.state.existingProjects.map((project, index) => {
              return (
                <ListGroupItem
                  key={index}
                  className={styles.project}
                  onClick={() => { this.chooseExistingProject(project); }}
                >
                  {project}
                </ListGroupItem>
              );
            })}
          </ListGroup>
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
            <div>
              <h2>OR</h2>
            </div>
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
