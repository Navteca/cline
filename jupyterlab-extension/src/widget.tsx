import { ReactWidget } from '@jupyterlab/apputils';

import { Signal } from '@lumino/signaling';

import React from 'react';

import { ClineInterface } from './components/ClineInterface';

import { ClineJupyterLabAdapter } from './cline-adapter';

/**
 * A widget for the Cline AI Assistant.
 */
export class ClineWidget extends ReactWidget {
  private _stateChanged = new Signal<ClineWidget, void>(this);
  private clineCore: ClineJupyterLabAdapter;

  constructor(clineCore: ClineJupyterLabAdapter) {
    super();
    this.clineCore = clineCore;
    this.addClass('cline-widget');
    this.id = 'cline-' + Date.now();
    this.title.label = 'Cline';
    this.title.closable = true;
  }

  /**
   * Signal emitted when the widget state changes.
   */
  get stateChanged(): Signal<ClineWidget, void> {
    return this._stateChanged;
  }

  /**
   * Start a new task with Cline.
   */
  async startNewTask(): Promise<void> {
    try {
      await this.clineCore.startNewTask();
      this._stateChanged.emit();
    } catch (error) {
      console.error('Failed to start new task:', error);
    }
  }

  /**
   * Render the React component.
   */
  render(): JSX.Element {
    return (
      <ClineInterface 
        clineCore={this.clineCore}
        onStateChange={() => this._stateChanged.emit()} 
      />
    );
  }
}