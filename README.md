PromptDraft ⚡
Describe it. Draft it. Done.

Transform plain-text engineering descriptions into standards-compliant industrial diagrams — in seconds. No CAD expertise required.


🚀 What is PromptDraft?
PromptDraft is an AI-powered diagram generation tool built for industrial engineers. Just type what you need — PromptDraft interprets your words and generates professional, export-ready schematics, P&IDs, HMI mockups, and more.
Input:  "Draw a motor control circuit with overload protection and E-stop"
Output: IEC-compliant schematic SVG — generated in < 4 seconds ⚡

✨ Features

🧠 Natural Language to Diagram — describe in plain English, get professional output
📐 Standards Compliant — IEC 60617, ISO 10628, ISA-5.1 out of the box
🏭 Industrial-Grade Symbols — ABB product library, IEC/ISO symbols, custom libraries
🔄 Iterative Refinement — refine with follow-up prompts, version diffed automatically
📦 Multi-Format Export — SVG, PDF, DXF/DWG, PNG, JSON-LD
☁️ Cloud-Native — Kubernetes-orchestrated, 500+ concurrent users, 99.9% SLA
🌐 Multi-lingual — English, German, Swedish prompt support


🎯 Supported Diagram Types
TypeDescription⚡ Schematic / WiringCircuit schematics, relay logic, wiring diagrams🔧 P&ID / Process FlowPiping & instrumentation, process flow diagrams🖥️ HMI / UI MockupSCADA screen wireframes, operator panel layouts🔲 Block / ArchitectureSystem architecture, signal flow, functional blocks🔁 State / Sequence ChartState machines, timing diagrams, sequence of operations🎨 Illustrative Image3D-style renderings, exploded views, conceptual art

🛠️ Tech Stack
Frontend       →  React + Fabric.js canvas
NLP Service    →  FastAPI + BERT-NER (domain-tuned)
Layout Engine  →  Node.js / WASM (Sugiyama + COLA.js)
AI Rendering   →  ControlNet-guided diffusion + SVG hybrid
Backend API    →  Groq (llama-3.3-70b-versatile)
Deployment     →  Kubernetes microservices, GPU on-demand

⚙️ Getting Started
Prerequisites

Node.js v18+
npm or yarn
Groq API key (free at console.groq.com)

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Start the backend
cd src
node server.js

# Start the frontend (new terminal)
npm start

🔑 Environment Variables
envGROQ_API_KEY=your_groq_api_key_here
PORT=3001

📊 Performance Benchmarks
MetricTargetSchematic generation< 4 secondsIllustrative output< 10 secondsStandards compliance rate> 95%Engineer satisfaction (pilot)> 85% usable without editsRefinement convergence3 turns for 90% of cases

📁 Project Structure
promptdraft/
├── public/              # Static assets
├── src/
│   ├── server.js        # Express backend + Groq API
│   ├── components/      # React components
│   └── utils/           # Helper functions
├── .env                 # Environment variables
├── package.json
└── README.md

🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

Fork the repository
Create your branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request


📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

👨‍💻 Author
Lakshnya S

PromptDraft — Because engineers should describe, not draw.
⭐ Star this repo if you found it useful!
