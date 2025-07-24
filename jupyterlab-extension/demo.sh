#!/bin/bash

# Cline JupyterLab Extension Demo Script
# This script demonstrates how to install and test the Cline JupyterLab extension

set -e

echo "🚀 Cline JupyterLab Extension Demo"
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python &> /dev/null; then
    echo "❌ Python is required but not installed."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check JupyterLab
if ! command -v jupyter &> /dev/null; then
    echo "⚠️  JupyterLab not found. Installing..."
    pip install "jupyterlab>=4.0.0,<5"
else
    echo "✅ JupyterLab found: $(jupyter --version)"
fi

echo "✅ Prerequisites check complete"

# Navigate to extension directory
cd "$(dirname "$0")"
echo "📁 Working directory: $(pwd)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the extension
echo "🔨 Building extension..."
npm run build

# Install the extension in development mode
echo "🔌 Installing extension..."
pip install -e .

# Enable the extension
echo "🔄 Enabling extension..."
jupyter labextension develop . --overwrite

# Build JupyterLab
echo "🏗️  Building JupyterLab..."
jupyter lab build

echo "✅ Installation complete!"

# Create a demo notebook
echo "📝 Creating demo notebook..."
cat > demo_notebook.ipynb << 'EOF'
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Cline JupyterLab Extension Demo\n",
    "\n",
    "This notebook demonstrates the Cline AI Assistant integration with JupyterLab.\n",
    "\n",
    "## Getting Started\n",
    "\n",
    "1. Look for the Cline icon in the left sidebar\n",
    "2. Click it to open the Cline assistant\n",
    "3. Try asking Cline to help with your code!\n",
    "\n",
    "## Example Tasks\n",
    "\n",
    "You can ask Cline to:\n",
    "- Explain the code in this notebook\n",
    "- Help debug errors\n",
    "- Suggest optimizations\n",
    "- Generate new code snippets"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Example: Data analysis with pandas\n",
    "import pandas as pd\n",
    "import numpy as np\n",
    "import matplotlib.pyplot as plt\n",
    "\n",
    "# Create sample data\n",
    "np.random.seed(42)\n",
    "data = {\n",
    "    'x': np.random.randn(100),\n",
    "    'y': np.random.randn(100) * 2 + 1,\n",
    "    'category': np.random.choice(['A', 'B', 'C'], 100)\n",
    "}\n",
    "\n",
    "df = pd.DataFrame(data)\n",
    "print(\"Sample data created:\")\n",
    "print(df.head())"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Example: Basic visualization\n",
    "plt.figure(figsize=(10, 6))\n",
    "plt.scatter(df['x'], df['y'], c=df['category'].map({'A': 'red', 'B': 'blue', 'C': 'green'}), alpha=0.6)\n",
    "plt.xlabel('X values')\n",
    "plt.ylabel('Y values')\n",
    "plt.title('Sample Data Visualization')\n",
    "plt.legend(['A', 'B', 'C'])\n",
    "plt.grid(True, alpha=0.3)\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Try These Commands\n",
    "\n",
    "Open the Cline sidebar and try asking:\n",
    "\n",
    "1. **\"Explain this notebook\"** - Cline will analyze the structure and content\n",
    "2. **\"Help me optimize this visualization\"** - Get suggestions for improving the plot\n",
    "3. **\"Add error handling to the data loading\"** - Get code improvements\n",
    "4. **\"Create a function to analyze the data by category\"** - Generate new code\n",
    "\n",
    "## Keyboard Shortcuts\n",
    "\n",
    "- `Ctrl/Cmd + '` - Focus Cline chat input\n",
    "- `Ctrl/Cmd + Shift + P` → \"New Cline Task\" - Start a new conversation\n",
    "- `Ctrl/Cmd + Shift + P` → \"Open Cline Sidebar\" - Open Cline panel"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF

echo "✅ Demo notebook created: demo_notebook.ipynb"

# Launch JupyterLab
echo "🚀 Launching JupyterLab..."
echo "   Open the demo notebook and look for the Cline icon in the sidebar!"
echo "   Press Ctrl+C to stop JupyterLab when done."
echo ""

# Launch JupyterLab with the demo notebook
jupyter lab demo_notebook.ipynb --no-browser --ip=0.0.0.0 --port=8888 --allow-root