import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import styles from './ProjectSelector.css';
import * as u from '../utils';


const PROJECT_FOLDER = remote.app.getPath('userData').concat('/projects');


export default class ProjectSelector extends Component {

  static propTypes = {
    onProjectChosen: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    //this.createProjectDirectory();

    this.createNewProject = this.createNewProject.bind(this);
    this.chooseExistingProject = this.chooseExistingProject.bind(this);

    this.state = {
      existingProjects: [
        'First',
        'Second',
        'Third',
      ],
    };
  }

  createProjectDirectory() {
    if (!u.fileExists(PROJECT_FOLDER)) {
      u.makeDirectory(PROJECT_FOLDER);
    }
  }

  createNewProject() {
    alert(PROJECT_FOLDER);
  }

  chooseExistingProject() {
    const projectConfig = {
      video: '/home/peter/projects/redub/input/movie.mkv',
      subtitles: '/home/peter/projects/redub/input/subtitles.srt',
    };

    this.props.onProjectChosen(projectConfig);
  }

  renderProjects() {
    return (
      <div>
        <h2>Choose existing project:</h2>
        <div className={styles.projectListContainer}>
          <ListGroup className={styles.projectList}>
            {this.state.existingProjects.map((project, index) => {
              return (
                <ListGroupItem
                  key={index}
                  className={styles.project}
                  onClick={this.chooseExistingProject}
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
        {this.renderProjects()}

        <br />

        <div>
          <h2>OR</h2>
        </div>

        <br />

        <Button bsSize="large" onClick={this.createNewProject}>
          <b>CREATE NEW PROJECT</b>
        </Button>
      </div>
    );
  }
}
