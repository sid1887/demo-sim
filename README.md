# 🔌 AI-Powered Circuit Simulator

A modern, interactive circuit design and simulation tool powered by React Flow, NGSpice, and Gemini AI.

## ✨ Features

### 🎨 Modern UI
- **Glassmorphic Design**: Beautiful frosted glass effects with backdrop blur
- **Interactive Canvas**: Drag-and-drop circuit components with React Flow
- **PCB Background**: Realistic PCB-style canvas with trace patterns
- **Responsive Layout**: Adaptive sidebars and panels with smooth animations

### ⚡ Real Circuit Components
- **Component Library**: Resistors, capacitors, inductors, diodes, voltage/current sources, ground
- **Custom SVG Symbols**: Proper electronic symbols for each component
- **Connection Ports**: Visual connection points with hover effects
- **Wire Animation**: Current flow visualization with animated traces

### 🔬 Advanced Simulation
- **NGSpice Integration**: Server-side SPICE simulation with real NGSpice binary
- **Multiple Analysis Types**: DC operating point, AC analysis, transient analysis
- **Real-time Results**: Node voltages, branch currents, power calculations
- **Result Visualization**: Charts and graphs showing simulation data

### 🤖 AI Assistant
- **Gemini AI Integration**: Real-time circuit analysis and explanations
- **Context-Aware Chat**: AI understands your circuit and simulation results
- **Smart Suggestions**: Design improvements and troubleshooting help
- **Educational**: Learn electronics through interactive AI guidance

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **NGSpice** - Circuit simulator engine
   - **Windows**: Download from [ngspice.sourceforge.net](http://ngspice.sourceforge.net/download.html)
   - **macOS**: `brew install ngspice`
   - **Ubuntu/Debian**: `sudo apt-get install ngspice`
   - **CentOS/RHEL**: `sudo yum install ngspice`
3. **Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd demo-sim

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Configuration

Edit `server/.env`:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
NGSPICE_TIMEOUT=30000
```

### Running the Application

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎯 Usage Guide

### Building Circuits

1. **Add Components**:
   - Use the left sidebar component palette
   - Click components or drag to canvas
   - Each component gets a unique label (R1, C1, etc.)

2. **Connect Components**:
   - Drag from one component's connection port to another
   - Wires automatically route and animate
   - Connection points highlight on hover

3. **Set Values**:
   - Select components to edit properties
   - Use standard notation: 1k, 1M, 1u, 1m
   - Supports all SPICE units and prefixes

### Running Simulations

1. **Validate Circuit**:
   - Ensure all components are connected
   - Add at least one ground node
   - Include voltage or current sources

2. **Simulate**:
   - Click "Simulate" in the top toolbar
   - Choose analysis type (DC, AC, Transient)
   - View results in the bottom panel

3. **Analyze Results**:
   - Node voltages displayed on canvas
   - Current flow animated in wires
   - Charts show voltage/current over time

### AI Assistant

1. **Ask Questions**:
   - "Explain how this circuit works"
   - "What's the voltage at node 2?"
   - "How can I reduce power consumption?"

2. **Get Analysis**:
   - Circuit explanations with component functions
   - Simulation result interpretation
   - Design improvement suggestions

3. **Troubleshooting**:
   - "Why isn't my circuit working?"
   - "How to fix oscillations?"
   - "What's causing the high current?"

## 🔧 Development

### Project Structure

```
demo-sim/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── Canvas.jsx    # Main circuit canvas
│   │   │   ├── Sidebar.jsx   # Component palette
│   │   │   ├── ChatPanel.jsx # AI chat interface
│   │   │   └── CustomNodes/  # Circuit components
│   │   ├── utils/           # Utilities
│   │   │   └── netlistGenerator.js # SPICE netlist generation
│   │   ├── api/             # API clients
│   │   │   └── geminiClient.js # Backend API wrapper
│   │   └── styles/          # CSS and styling
│   │       └── glass.css    # Glassmorphic effects
│   └── public/              # Static assets
│       └── assets/          # Images and patterns
├── server/                  # Express backend
│   ├── routes/              # API routes
│   │   ├── simulate.js      # NGSpice simulation
│   │   └── geminiProxy.js   # AI chat proxy
│   ├── index.js             # Server entry point
│   └── package.json         # Server dependencies
└── README.md
```

### Key Technologies

- **Frontend**: React 18, Vite, React Flow, Framer Motion, Tailwind CSS
- **Backend**: Express.js, NGSpice, Gemini AI API
- **Styling**: Custom glassmorphic CSS with backdrop filters
- **Animation**: Framer Motion for smooth transitions
- **Visualization**: Custom SVG components and Chart.js

## 🛠️ Troubleshooting

### NGSpice Issues

**"NGSpice not found"**:
- Install NGSpice binary for your platform
- Ensure `ngspice` is in system PATH
- Test with `ngspice --version`

**Simulation timeout**:
- Reduce circuit complexity
- Check for floating nodes
- Verify proper ground connections

### API Issues

**"Backend server offline"**:
- Check server is running on port 3001
- Verify CORS configuration
- Check network connectivity

**"Gemini API error"**:
- Verify GEMINI_API_KEY in server/.env
- Check API quota and billing
- Test API key at [Google AI Studio](https://aistudio.google.com/)

---

**Built with ❤️ for electronics enthusiasts and educators**
