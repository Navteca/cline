# Cline JupyterLab Extension

A JupyterLab extension that brings the power of [Cline AI Assistant](https://github.com/cline/cline) directly into your JupyterLab environment.

## Features

- 🧠 **AI-Powered Coding Assistant**: Get contextual help with your code directly in JupyterLab
- 🔧 **Multiple LLM Providers**: Support for OpenAI, Anthropic, OpenRouter, and local models
- 📝 **Interactive Chat Interface**: Clean, intuitive interface integrated into JupyterLab's sidebar
- ⚡ **Context-Aware**: Understands your notebook and code context
- 🎨 **Native JupyterLab Integration**: Follows JupyterLab's design patterns and themes
- ⌨️ **Keyboard Shortcuts**: Quick access via command palette and hotkeys

## Installation

### Prerequisites

- JupyterLab 4.x
- Python 3.8+
- Node.js 18+ (for development)

### Install from PyPI (when available)

```bash
pip install cline-jupyterlab
```

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/cline/cline.git
cd cline/jupyterlab-extension
```

2. Install the extension in development mode:
```bash
# Install Python package in development mode
pip install -e .

# Install and build the extension
jlpm install
jlpm build

# Link the extension to JupyterLab
jupyter labextension develop . --overwrite
```

3. Rebuild JupyterLab:
```bash
jupyter lab build
```

## Configuration

### Setting up API Keys

1. Open JupyterLab
2. Go to Settings → Cline Settings
3. Configure your preferred AI provider:
   - **OpenAI**: Enter your OpenAI API key
   - **Anthropic**: Enter your Anthropic API key  
   - **OpenRouter**: Enter your OpenRouter API key
   - **Local**: Configure local model endpoint

### Available Settings

- **API Provider**: Choose between OpenAI, Anthropic, OpenRouter, or local models
- **Model**: Select the specific model to use
- **Max Tokens**: Control response length
- **Temperature**: Adjust creativity/randomness
- **Auto Save**: Enable/disable conversation history saving

## Usage

### Basic Usage

1. **Open Cline**: Click the Cline icon in the left sidebar or use the command palette (`Cmd/Ctrl + Shift + P` → "Open Cline Sidebar")

2. **Start a New Task**: Click "New Task" or use the command "New Cline Task"

3. **Chat with Cline**: Type your questions or requests in the chat interface

4. **Context Integration**: Cline can see and understand your notebooks and code files

### Keyboard Shortcuts

- `Ctrl/Cmd + '` : Focus Cline chat input
- `Ctrl/Cmd + Shift + P` → "New Cline Task" : Start a new task
- `Ctrl/Cmd + Shift + P` → "Open Cline Sidebar" : Open/focus Cline

### Examples

```
Ask Cline to:
- "Explain this function in my notebook"
- "Help me debug this error"
- "Write a function to process this data"
- "Optimize this code for performance"
- "Add documentation to my code"
```

## Architecture

This extension reuses core components from the main Cline project while providing a JupyterLab-native interface:

- **Core Logic**: Reuses Cline's task management, context analysis, and LLM integration
- **UI Components**: Custom React components built for JupyterLab
- **Host Integration**: JupyterLab-specific implementations for file access, terminal integration

## Development

### Project Structure

```
jupyterlab-extension/
├── src/                    # TypeScript source code
│   ├── components/         # React components
│   ├── core.ts            # Core Cline integration
│   ├── index.ts           # Extension entry point
│   └── widget.tsx         # Main widget
├── style/                 # CSS styles
├── schema/                # Settings schema
└── cline_jupyterlab/      # Python package
```

### Building

```bash
# Install dependencies
jlpm install

# Build the extension
jlpm build

# Watch for changes during development
jlpm watch
```

### Testing

```bash
# Run tests
jlpm test

# Run linting
jlpm lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

See the main [Cline contributing guide](../CONTRIBUTING.md) for more details.

## License

Apache 2.0 © 2025 Cline Bot Inc.

## Support

- [GitHub Issues](https://github.com/cline/cline/issues)
- [Discord Community](https://discord.gg/cline)
- [Documentation](https://docs.cline.bot)