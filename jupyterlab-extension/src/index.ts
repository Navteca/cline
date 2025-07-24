import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { ITranslator } from '@jupyterlab/translation';

import { Menu } from '@lumino/widgets';

import { ClineWidget } from './widget';

import { createClineForJupyterLab } from './cline-adapter';

/**
 * The command IDs used by the extension.
 */
namespace CommandIDs {
  export const create = 'cline:create';
  export const newTask = 'cline:new-task';
  export const openSidebar = 'cline:open-sidebar';
}

/**
 * Initialization data for the cline-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'cline-jupyterlab:plugin',
  description: 'Cline AI Assistant for JupyterLab',
  autoStart: true,
  optional: [ICommandPalette, ILauncher, IMainMenu, ISettingRegistry],
  requires: [ITranslator],
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    palette?: ICommandPalette,
    launcher?: ILauncher,
    mainMenu?: IMainMenu,
    settingRegistry?: ISettingRegistry | null
  ) => {
    const { commands, shell } = app;
    const trans = translator.load('cline-jupyterlab');
    
    // Track Cline widgets
    const tracker = new WidgetTracker<ClineWidget>({
      namespace: 'cline'
    });

    // Initialize Cline core with JupyterLab integration
    const clineCore = createClineForJupyterLab(
      {
        apiProvider: 'openai',
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      },
      { 
        commands, 
        shell, 
        serviceManager: app.serviceManager,
        translator
      }
    );

    // Initialize Cline
    clineCore.initialize().catch(error => {
      console.error('Failed to initialize Cline:', error);
    });

    // Command to create a new Cline widget
    commands.addCommand(CommandIDs.create, {
      label: trans.__('New Cline Assistant'),
      caption: trans.__('Open a new Cline AI Assistant'),
      iconClass: 'jp-Icon jp-Icon-20 cline-icon',
      execute: () => {
        const widget = new ClineWidget(clineCore);
        widget.title.label = trans.__('Cline');
        widget.title.iconClass = 'jp-Icon jp-Icon-20 cline-icon';
        shell.add(widget, 'right', { rank: 200 });
        tracker.add(widget);
        shell.activateById(widget.id);
        return widget;
      }
    });

    // Command to start a new task
    commands.addCommand(CommandIDs.newTask, {
      label: trans.__('New Cline Task'),
      caption: trans.__('Start a new task with Cline'),
      execute: async () => {
        // Find existing Cline widget or create new one
        let widget = tracker.currentWidget;
        if (!widget) {
          widget = await commands.execute(CommandIDs.create);
        }
        
        // Focus the widget and start new task
        shell.activateById(widget.id);
        widget.startNewTask();
      }
    });

    // Command to open sidebar
    commands.addCommand(CommandIDs.openSidebar, {
      label: trans.__('Open Cline Sidebar'),
      caption: trans.__('Open Cline AI Assistant in sidebar'),
      execute: () => {
        return commands.execute(CommandIDs.create);
      }
    });

    // Add commands to palette
    if (palette) {
      palette.addItem({ command: CommandIDs.create, category: 'AI Assistant' });
      palette.addItem({ command: CommandIDs.newTask, category: 'AI Assistant' });
    }

    // Add to launcher
    if (launcher) {
      launcher.add({
        command: CommandIDs.create,
        category: 'AI Assistant',
        rank: 1
      });
    }

    // Add to main menu
    if (mainMenu) {
      const clineMenu = new Menu({ commands });
      clineMenu.title.label = trans.__('Cline');
      clineMenu.addItem({ command: CommandIDs.create });
      clineMenu.addItem({ command: CommandIDs.newTask });
      mainMenu.addMenu(clineMenu, { rank: 200 });
    }

    console.log('Cline JupyterLab extension is activated!');
  }
};

export default plugin;