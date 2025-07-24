/**
 * Tests for the Cline JupyterLab integration
 */

import { ClineCore, ClineConfig } from '../core';
import { ClineJupyterLabAdapter } from '../cline-adapter';
import { JupyterLabHostProvider } from '../host-integration';

// Mock JupyterLab API
const mockJupyterLabAPI = {
  commands: {
    addCommand: jest.fn(),
    execute: jest.fn()
  },
  shell: {
    currentWidget: null,
    add: jest.fn(),
    activateById: jest.fn()
  },
  serviceManager: {
    contents: {
      get: jest.fn().mockResolvedValue({ content: 'mock file content' }),
      save: jest.fn().mockResolvedValue(undefined)
    },
    sessions: {
      running: jest.fn().mockReturnValue([])
    }
  },
  translator: {
    load: jest.fn().mockReturnValue({
      __: (key: string) => key
    })
  }
};

describe('ClineCore', () => {
  let clineCore: ClineCore;
  const config: ClineConfig = {
    apiProvider: 'openai',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  };

  beforeEach(() => {
    clineCore = new ClineCore(config);
  });

  test('should initialize with config', () => {
    expect(clineCore).toBeDefined();
  });

  test('should start a new task', async () => {
    const task = await clineCore.startNewTask('Test task');
    
    expect(task).toBeDefined();
    expect(task.title).toBe('Test task');
    expect(task.status).toBe('active');
    expect(task.messages).toHaveLength(1);
    expect(task.messages[0].content).toBe('Test task');
    expect(task.messages[0].type).toBe('user');
  });

  test('should send messages to current task', async () => {
    await clineCore.startNewTask('Initial task');
    const response = await clineCore.sendMessage('Hello, Cline!');
    
    expect(response).toBeDefined();
    expect(response.type).toBe('assistant');
    expect(response.content).toContain('Hello, Cline!');
  });

  test('should throw error when sending message without active task', async () => {
    await expect(clineCore.sendMessage('Test message')).rejects.toThrow(
      'No active task. Start a new task first.'
    );
  });

  test('should generate appropriate task titles', async () => {
    const longMessage = 'This is a very long message that should be truncated to create a reasonable task title';
    const task = await clineCore.startNewTask(longMessage);
    
    expect(task.title).toBe('This is a very long message...');
  });
});

describe('ClineJupyterLabAdapter', () => {
  let adapter: ClineJupyterLabAdapter;
  const config: ClineConfig = {
    apiProvider: 'openai',
    model: 'gpt-4'
  };

  beforeEach(() => {
    adapter = new ClineJupyterLabAdapter(config, mockJupyterLabAPI);
  });

  test('should initialize with JupyterLab API', () => {
    expect(adapter).toBeDefined();
  });

  test('should register JupyterLab commands on initialization', async () => {
    await adapter.initialize();
    
    // Commands should be registered
    expect(mockJupyterLabAPI.commands.addCommand).toHaveBeenCalled();
  });
});

describe('JupyterLabHostProvider', () => {
  let hostProvider: JupyterLabHostProvider;

  beforeEach(() => {
    hostProvider = new JupyterLabHostProvider(mockJupyterLabAPI);
  });

  test('should read files through JupyterLab contents API', async () => {
    const content = await hostProvider.readFile('test.py');
    
    expect(mockJupyterLabAPI.serviceManager.contents.get).toHaveBeenCalledWith('test.py');
    expect(content).toBe('mock file content');
  });

  test('should write files through JupyterLab contents API', async () => {
    await hostProvider.writeFile('test.py', 'print("hello")');
    
    expect(mockJupyterLabAPI.serviceManager.contents.save).toHaveBeenCalledWith(
      'test.py',
      expect.objectContaining({
        type: 'file',
        format: 'text',
        content: 'print("hello")'
      })
    );
  });

  test('should handle file operation errors gracefully', async () => {
    mockJupyterLabAPI.serviceManager.contents.get.mockRejectedValueOnce(
      new Error('File not found')
    );

    await expect(hostProvider.readFile('nonexistent.py')).rejects.toThrow(
      'Failed to read file nonexistent.py'
    );
  });

  test('should get current workspace', async () => {
    const workspace = await hostProvider.getCurrentWorkspace();
    expect(workspace).toBeDefined();
  });

  test('should execute commands', async () => {
    const result = await hostProvider.executeCommand('echo "test"');
    
    expect(result).toHaveProperty('stdout');
    expect(result).toHaveProperty('stderr');
    expect(result).toHaveProperty('exitCode');
  });
});

describe('Integration Tests', () => {
  test('should create Cline instance for JupyterLab', () => {
    const { createClineForJupyterLab } = require('../cline-adapter');
    const config: ClineConfig = {
      apiProvider: 'openai',
      model: 'gpt-4'
    };

    const cline = createClineForJupyterLab(config, mockJupyterLabAPI);
    expect(cline).toBeInstanceOf(ClineJupyterLabAdapter);
  });

  test('should handle full workflow', async () => {
    const { createClineForJupyterLab } = require('../cline-adapter');
    const config: ClineConfig = {
      apiProvider: 'openai',
      model: 'gpt-4'
    };

    const cline = createClineForJupyterLab(config, mockJupyterLabAPI);
    
    // Initialize
    await cline.initialize();
    
    // Start task
    const task = await cline.startNewTask('Analyze this notebook');
    expect(task.status).toBe('active');
    
    // Send message
    const response = await cline.sendMessage('What does this code do?');
    expect(response.type).toBe('assistant');
    
    // Check task state
    const currentTask = cline.getCurrentTask();
    expect(currentTask?.id).toBe(task.id);
    expect(currentTask?.messages.length).toBeGreaterThan(1);
  });
});