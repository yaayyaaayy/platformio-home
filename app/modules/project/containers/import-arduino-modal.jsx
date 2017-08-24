/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { Checkbox, Icon, Modal, Tooltip, message } from 'antd';

import BoardSelect from '../../platform/containers/board-select';
import FileExplorer from '../../core/containers/file-explorer';
import ProjectInitCarousel from '../components/init-carousel';
import PropTypes from 'prop-types';
import React from 'react';

import { connect } from 'react-redux';
import { openUrl } from '../../core/actions';


class ProjectImportArduinoModal extends React.Component {

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,

    boards: PropTypes.array,

    loadBoards: PropTypes.func.isRequired,
    addProject: PropTypes.func.isRequired,
    openProject: PropTypes.func.isRequired,
    importArduinoProject: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      selectedBoard: null,
      useArduinoLibs: false,
      arduinoProjectDir: null,
      inProgress: false
    };
  }

  onDidBoard(board) {
    if (!board.frameworks || !board.frameworks.map(item => item.name).includes('arduino')) {
      this.setState({
        selectedBoard: null
      });
      return message.error(`Board ${board.name} is not compatible with Arduino framework`);
    }
    this.setState({
      selectedBoard: board.id
    });
  }

  onDidUseArduinoLibs(e) {
    this.setState({
      useArduinoLibs: e.target.checked
    });
  }

  onDidArduinoProjectDir(arduinoProjectDir) {
    this.setState({
      arduinoProjectDir
    });
  }

  onDidFinish() {
    if (!this.state.selectedBoard) {
      return message.error('Please select a board');
    }
    if (!this.state.arduinoProjectDir) {
      return message.error('Please select a folder with Arduino project');
    }
    this.setState({
      inProgress: true
    });
    this.props.importArduinoProject(
      this.state.selectedBoard,
      this.state.useArduinoLibs,
      this.state.arduinoProjectDir,
      (err, location) => {
        this.setState({
          inProgress: false
        });
        if (!err) {
          this.props.addProject(location);
          this.props.openProject(location);
          this.onDidCancel();
        }
      }
    );
  }

  onDidCancel() {
    this.setState({
      inProgress: false
    });
    this.props.onCancel();
  }

  render() {
    return (
      <Modal className='project-new-modal'
        visible={ this.props.visible }
        confirmLoading={ this.state.inProgress }
        width={ 600 }
        title='Import Arduino Project'
        okText={ this.state.inProgress ? 'Please wait...' : 'Import' }
        onOk={ ::this.onDidFinish }
        onCancel={ ::this.onDidCancel }>
        { this.renderBody() }
      </Modal>
      );
  }

  renderBody() {
    if (this.state.inProgress) {
      return <ProjectInitCarousel openUrl={ this.props.openUrl } />;
    }

    return (
      <div>
        <p style={{ marginBottom: '5px' }}>Please select a board to initialize a project. You can change it later in <code>platformio.ini</code> file which will be created in a project directory:</p>
        <p className='block'>
          <BoardSelect onSelect={ ::this.onDidBoard } />
        </p>
        <p className='block'>
          <Checkbox onChange={ ::this.onDidUseArduinoLibs } checked={ this.state.useArduinoLibs }>
            Use libraries installed by Arduino IDE <Tooltip title='We highly recommend to use PlatformIO Library Manager'><Icon type='question-circle' /></Tooltip>
          </Checkbox>
        </p>
        <p style={{ marginBottom: '5px' }}>Choose a directory with existing Arduino IDE project:</p>
        <FileExplorer pick='folder' onSelect={ ::this.onDidArduinoProjectDir } />
      </div> );
  }

}

// Redux

export default connect(null, {
  ...actions,
  openUrl
})(ProjectImportArduinoModal);
