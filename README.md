🚦 Smart Traffic AI
AI-powered intelligent traffic monitoring, vehicle detection, traffic analysis, and adaptive signal optimization system.

Smart Traffic AI is a full-stack intelligent traffic management platform designed to monitor road traffic in real time, detect vehicles using computer vision, analyze traffic density, and dynamically optimize traffic signals.

The system combines:

React + Vite
Node.js
Express.js
Python
YOLO
OpenCV
REST APIs
Live camera streaming
AI-based traffic analysis
Adaptive traffic signal control
GPS-based traffic intelligence
Future route optimization and predictive analytics
📌 Project Overview
Traditional traffic signals generally operate using fixed timers.

For example:

North → 30 seconds
South → 30 seconds
East  → 30 seconds
West  → 30 seconds

This creates unnecessary waiting when one road has very few vehicles.

Smart Traffic AI aims to solve this problem.

Instead of blindly using fixed signal timings, the system analyzes traffic conditions and determines which direction should receive priority.

Example:

North → 8 vehicles
South → 2 vehicles
East  → 47 vehicles
West  → 5 vehicles

The AI can prioritize:

EAST → GREEN

instead of making all directions wait equally.

🎯 Main Goals

The project aims to build an intelligent traffic control platform capable of:

Real-time vehicle detection
Live traffic monitoring
Traffic density analysis
Adaptive traffic signals
AI-based lane prioritization
Live GPS tracking
Traffic route optimization
Camera-based traffic analysis
Historical traffic analysis
Traffic prediction
Emergency vehicle priority
Intelligent congestion management
Real-time dashboard visualization
🏗️ Current Architecture
                    ┌──────────────────────┐
                    │      USER / ADMIN    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React + Vite         │
                    │ Frontend Dashboard   │
                    └──────────┬───────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express.js │
                    │ Backend API          │
                    └──────────┬───────────┘
                               │
                     Traffic Data API
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Python ML System     │
                    │ YOLO + OpenCV        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Camera / Video Feed  │
                    └──────────────────────┘
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
CSS
React Leaflet
Leaflet
Lucide React
Backend
Node.js
Express.js
REST API
CORS
dotenv
AI / Machine Learning
Python
YOLO
Ultralytics
OpenCV
NumPy
Scikit-learn
Computer Vision
OpenCV
YOLO vehicle detection
Live camera processing
Vehicle counting
Bounding-box detection
Maps & Location
Leaflet
React Leaflet
Browser Geolocation API
OpenStreetMap
📂 Project Structure
smart-traffic-ai/
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── monitoring/
│   │   │   ├── signals/
│   │   │   └── routes/
│   │   │
│   │   ├── hooks/
│   │   │   └── useTrafficData.js
│   │   │
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   │
│   ├── controllers/
│   │
│   ├── routes/
│   │   ├── dashboardRoutes.js
│   │   ├── trafficRoutes.js
│   │   ├── signalRoutes.js
│   │   └── routeRoutes.js
│   │
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── ml-model/
│   │
│   ├── app.py
│   ├── camera.py
│   ├── detect.py
│   ├── run.py
│   ├── yolov8n.pt
│   └── requirements.txt
│
├── .gitignore
└── README.md
🚦 Current Features
1. Live Traffic Monitoring

The system receives vehicle counts from the AI detection system.

Example:

{
  "north": 15,
  "south": 4,
  "east": 32,
  "west": 8
}

The backend stores the latest traffic state.

2. YOLO Vehicle Detection

The Python AI system uses YOLO to detect vehicles from a camera feed.

Currently detected vehicle classes include:

Car
Motorcycle
Bus
Truck

COCO classes:

2 → Car
3 → Motorcycle
5 → Bus
7 → Truck

Detected vehicles are displayed using bounding boxes.

3. Live Camera Stream

The Python camera service provides an MJPEG stream.

Current endpoint:

http://localhost:8001/video

The React dashboard can display this stream directly.

4. Node.js Traffic API

The Node.js backend receives traffic information from the Python detection system.

Example:

POST /api/traffic/update

Request:

{
  "north": 20,
  "south": 5,
  "east": 45,
  "west": 8
}
5. Live Traffic API

Frontend requests:

GET /api/traffic/live

The API provides:

Current vehicle count
Total vehicles
Lane analysis
Congestion level
Recommended green time
Current traffic signal
Priority lane
Last update time
Data source
6. Traffic Congestion Detection

Traffic levels are categorized as:

0 vehicles
    ↓
CLEAR

1–29
    ↓
LOW

30–59
    ↓
MEDIUM

60–79
    ↓
HIGH

80+
    ↓
CRITICAL
7. Adaptive Green Time

The system calculates green time based on traffic density.

Example:

80+ vehicles → 30 seconds
60+ vehicles → 25 seconds
40+ vehicles → 20 seconds
25+ vehicles → 15 seconds
10+ vehicles → 10 seconds
1+ vehicles  → 8 seconds
0 vehicles   → 5 seconds

This is designed to reduce unnecessary waiting.

8. AI Lane Priority

The backend compares all monitored lanes.

Example:

North → 10
South → 5
East  → 62
West  → 8

AI priority:

EAST

The signal controller can then assign green time to East.

9. Traffic Signal Phases

The signal system supports:

GREEN
   ↓
YELLOW
   ↓
GREEN

Yellow transition currently uses:

3 seconds

The dashboard can display:

NORTH
🟢 GREEN
18 seconds remaining
10. Smart Traffic Dashboard

The dashboard provides real-time information including:

Total Vehicles
Camera Status
Detection Engine
Data Stream
Traffic Density
Signal Status
Lane Priority
AI Decision
11. GPS Tracking

The frontend uses browser geolocation to obtain the user's current position.

The map can follow the user's location.

Example:

Latitude
Longitude
GPS Status

The system supports:

LIVE GPS
SEARCHING
ERROR
UNAVAILABLE
12. Interactive Traffic Map

The project uses:

Leaflet
React Leaflet
OpenStreetMap

The map can display:

📍 User Location

🚦 North Signal
🚦 South Signal
🚦 East Signal
🚦 West Signal

🛣 Traffic Route
🔌 API Endpoints
Root
GET /

Returns backend status.

Live Traffic
GET /api/traffic/live

Returns current traffic information.

Update Traffic
POST /api/traffic/update

Used by the Python YOLO system.

Example:

{
  "north": 12,
  "south": 4,
  "east": 25,
  "west": 7
}
Traffic Summary
GET /api/traffic/summary

Returns:

Total vehicles
Priority lane
Priority vehicles
Congestion
Signal state
Last update
Signal
GET /api/traffic/signal

Returns current signal information.

Camera Stream
GET /video

Python camera service.

⚙️ Environment Variables

Backend .env:

PORT=5000
ML_API_URL=http://localhost:8000

Production example:

PORT=5000
ML_API_URL=https://your-ml-service-url

Never commit .env to GitHub.

🚀 Local Installation
1. Clone Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd smart-traffic-ai
Frontend Setup
cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Frontend:

http://localhost:5173
Backend Setup

Open another terminal:

cd backend

Install dependencies:

npm install

Create:

.env

Add:

PORT=5000
ML_API_URL=http://localhost:8000

Start:

npm start

Backend:

http://localhost:5000
Python AI Setup

Open another terminal:

cd ml-model

Create virtual environment:

python -m venv venv

Activate on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run:

python run.py
📷 Camera Requirements

The current system uses:

cv2.VideoCapture(0)

This means:

0 = Default computer webcam

The camera must be available to the machine running the Python AI service.

🧠 AI Traffic Decision Flow
Camera
   ↓
OpenCV
   ↓
YOLO
   ↓
Vehicle Detection
   ↓
Vehicle Count
   ↓
Node.js API
   ↓
Traffic Analysis
   ↓
AI Priority Decision
   ↓
Green Time Calculation
   ↓
Traffic Signal
   ↓
React Dashboard
🌐 Deployment Architecture

The initial deployment will separate the cloud application from the local camera/AI system.

                    INTERNET
                       │
                       ▼
              ┌─────────────────┐
              │ Vercel          │
              │ React Frontend  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Render          │
              │ Node + Express  │
              └────────┬────────┘
                       │
                       │
             ┌─────────┴──────────┐
             │                    │
             ▼                    ▼
       Traffic APIs          Future Database
                                  │
                                  ▼
                            Analytics Data


LOCAL / EDGE AI
       │
       ▼
┌───────────────────┐
│ Camera            │
│ OpenCV            │
│ YOLO              │
└─────────┬─────────┘
          │
          ▼
      Node Backend
⚠️ Current Deployment Limitation

The current YOLO camera system uses a physical webcam:

cv2.VideoCapture(0)

A normal cloud server cannot access the webcam connected to your personal computer.

Therefore the first deployment will use:

React → Cloud
Node.js → Cloud
YOLO + Camera → Local machine

Later, the project can be upgraded to support:

IP Camera
RTSP Camera
Edge AI Device
Cloud Camera
Traffic CCTV
🔮 FUTURE ROADMAP

The following features are planned for future development.

🚗 Phase 1 — Advanced Vehicle Detection
Multi-direction detection

Instead of sending:

{
  "north": 20,
  "south": 0,
  "east": 0,
  "west": 0
}

the system will detect all directions:

{
  "north": 20,
  "south": 8,
  "east": 45,
  "west": 3
}
Vehicle Classification

Future detection:

Cars
Motorcycles
Buses
Trucks
Emergency Vehicles
Bicycles
Vehicle Tracking

Add object tracking so the same vehicle is not counted repeatedly.

Possible technologies:

YOLO
ByteTrack
DeepSORT
🚦 Phase 2 — Advanced Adaptive Traffic Signals

The signal system will become more intelligent.

Instead of simply choosing the lane with the highest count:

Highest count → GREEN

the AI will consider:

Vehicle count
Waiting time
Queue length
Traffic density
Previous green time
Arrival rate
Road capacity
Emergency vehicles
Pedestrian demand

Decision example:

North → 30 vehicles / waiting 45 sec
South → 10 vehicles / waiting 5 sec
East  → 25 vehicles / waiting 70 sec
West  → 5 vehicles / waiting 2 sec

AI may select:

EAST

even though North has more vehicles.

Reason:

High waiting time
🚑 Phase 3 — Emergency Vehicle Priority

Detect:

🚑 Ambulance
🚒 Fire Truck
🚓 Police

When detected:

Emergency Vehicle
        ↓
AI Detection
        ↓
Identify Direction
        ↓
Give Priority
        ↓
Green Signal

Example:

🚑 EAST

EAST → GREEN
NORTH → RED
SOUTH → RED
WEST → RED
🗺️ Phase 4 — Real-Time GPS Traffic

Integrate real GPS traffic information.

The system will use:

User GPS
Traffic location
Road position
Vehicle movement
Traffic congestion

The map will display:

🟢 Low traffic
🟡 Medium traffic
🔴 Heavy traffic
🛣️ Phase 5 — Intelligent Route Optimization

The routing engine will calculate the best route based on:

Distance
Travel time
Traffic
Signal delays
Congestion
Road capacity
Incidents

Instead of:

Shortest route

the system will calculate:

Fastest intelligent route
🤖 Phase 6 — Predictive Traffic AI

The system will learn from historical traffic.

Data:

Time
Day
Traffic
Weather
Events
Road conditions

Example:

Monday 9:00 AM
Expected traffic:
North → 75
South → 42
East  → 91
West  → 30

The system can prepare signal timings before congestion becomes severe.

📊 Phase 7 — Historical Analytics

Store traffic data in a database.

Future dashboard:

Daily Traffic
Weekly Traffic
Monthly Traffic
Peak Hours
Average Waiting Time
Average Vehicle Count
Congestion Trends

Charts:

Traffic vs Time

Vehicles
  │
100│              █
 80│          █   █
 60│      █   █   █
 40│  █   █   █   █
 20│  █   █   █   █
  0└──────────────────
     8AM 10AM 12PM 2PM
🧠 Phase 8 — Machine Learning Prediction

The system can eventually use machine-learning models to predict:

Future traffic
Congestion probability
Expected queue length
Expected waiting time
Signal requirements

Possible models:

Linear Regression
Random Forest
XGBoost
LSTM
Time-Series Models
🌦️ Phase 9 — Weather-Aware Traffic

Integrate weather information.

Factors:

Rain
Fog
Storm
Temperature
Visibility

Example:

Heavy Rain
     ↓
Traffic speed decreases
     ↓
Congestion probability increases
     ↓
AI adjusts signal strategy
🚧 Phase 10 — Accident & Incident Detection

Future computer vision system:

Accident
Broken vehicle
Road blockage
Wrong-way vehicle
Road obstruction

The dashboard will display:

⚠ INCIDENT DETECTED

Location:
NH-48

Type:
Accident

Severity:
HIGH
🚶 Phase 11 — Pedestrian Detection

Detect pedestrians near intersections.

The system can support:

Pedestrian crossing
Pedestrian waiting
Pedestrian density

Signal timing can be adjusted accordingly.

🚦 Phase 12 — Smart Intersection Network

Instead of controlling one intersection:

Intersection A
      ↓
Intersection B
      ↓
Intersection C
      ↓
Intersection D

multiple intersections can communicate.

Example:

Traffic approaching B
        ↓
A adjusts signal
        ↓
Vehicles move toward B
        ↓
B prepares GREEN

This creates a coordinated traffic network.

🌐 Phase 13 — Real-Time WebSocket Updates

Current system uses polling:

Frontend
   ↓
GET /api/traffic/live
   ↓
Every 1 second

Future architecture:

YOLO
  ↓
Node.js
  ↓
WebSocket
  ↓
React

Traffic updates will be pushed instantly.

🗄️ Phase 14 — Database

Future database options:

PostgreSQL
MySQL
MongoDB

Possible tables:

users
cameras
intersections
traffic_records
vehicle_records
signals
routes
incidents
emergency_events
👤 Phase 15 — Authentication

Future system will support:

Admin
Traffic Operator
Traffic Authority
Viewer

Features:

Login
Logout
Role-based access
Protected dashboard
📱 Phase 16 — Mobile Application

Future mobile application:

React Native

Features:

Live traffic
Traffic alerts
Best route
Incident alerts
GPS tracking
Signal information
🔔 Phase 17 — Real-Time Notifications

Notifications for:

🚨 Accident
🚑 Emergency vehicle
🔴 Critical congestion
🚧 Road closure
⚠ Traffic anomaly
🔐 Phase 18 — Security

Production security will include:

HTTPS
JWT Authentication
API Rate Limiting
Input Validation
Helmet
Secure CORS
Environment Variables
Database Security
API Authentication
☁️ Phase 19 — Cloud & Edge Deployment

Future production architecture:

Traffic Camera
      ↓
Edge Device
      ↓
YOLO AI
      ↓
Cloud API
      ↓
Database
      ↓
WebSocket
      ↓
React Dashboard

Possible infrastructure:

Vercel
Render
AWS
Azure
Google Cloud
Docker
Kubernetes
📈 Phase 20 — Advanced Traffic Intelligence

Long-term goal:

Build an AI traffic management system that can:

Observe
   ↓
Understand
   ↓
Predict
   ↓
Decide
   ↓
Optimize
   ↓
Learn

The system should continuously improve traffic flow rather than simply count vehicles.

🧪 Development Strategy

The project will be developed incrementally.

Current
✅ React Dashboard
✅ Node.js Backend
✅ Express.js API
✅ Python AI Service
✅ YOLO Vehicle Detection
✅ OpenCV Camera
✅ Live Camera Stream
✅ Vehicle Counting
✅ Traffic API
✅ Adaptive Signal Logic
✅ GPS Map
Next
⬜ Production Deployment
⬜ Real Camera / IP Camera
⬜ Multi-direction Detection
⬜ Vehicle Tracking
⬜ WebSockets
⬜ Database
⬜ Historical Analytics
⬜ Advanced Route Optimization
⬜ Emergency Vehicle Detection
⬜ Predictive Traffic AI
🧑‍💻 Development Workflow

For future development:

1. Build feature
      ↓
2. Test locally
      ↓
3. Fix bugs
      ↓
4. Git commit
      ↓
5. Git push
      ↓
6. Cloud deployment
      ↓
7. Production testing
🌿 Git Workflow

Recommended branches:

main
develop
feature/traffic-ai
feature/gps
feature/camera
feature/routes
feature/analytics

Example:

git checkout -b feature/traffic-ai

Commit:

git add .
git commit -m "feat: improve adaptive traffic signal"

Push:

git push origin feature/traffic-ai
📌 Current Status
Project:
Smart Traffic AI

Status:
🚧 Active Development

Frontend:
✅ React + Vite

Backend:
✅ Node.js + Express.js

AI:
✅ YOLO + OpenCV

Camera:
✅ Local camera stream

Traffic Detection:
✅ Vehicle counting

Traffic API:
✅ Live API

Adaptive Signal:
✅ Basic AI logic

GPS:
✅ Browser GPS

Map:
✅ Leaflet

Deployment:
⏳ Next Step
⚠️ Important Disclaimer

This project is currently a software engineering / AI prototype.

The traffic signal logic must not be connected to real public-road traffic infrastructure without appropriate:

Government authorization
Safety validation
Hardware certification
Redundancy
Fail-safe mechanisms
Human supervision
Regulatory compliance

The current system is intended for development, simulation, demonstration, and research.

👨‍💻 Project Development

Smart Traffic AI

Built as a full-stack AI + computer vision traffic management project.

Core technologies:

React
Node.js
Express.js
Python
YOLO
OpenCV
Leaflet
Machine Learning
REST API
⭐ Vision

The long-term vision is to create:

An intelligent traffic management platform that observes real-world traffic, predicts congestion, dynamically optimizes intersections, and helps vehicles reach their destinations faster and more efficiently.

🚀 Future

This project will be continuously improved.

The development roadmap is intentionally incremental:

DEPLOY
  ↓
MONITOR
  ↓
IMPROVE
  ↓
ADD AI
  ↓
ADD REAL-TIME DATA
  ↓
ADD PREDICTION
  ↓
ADD MULTI-INTERSECTION CONTROL
  ↓
BUILD COMPLETE SMART TRAFFIC PLATFORM
License

This project is currently intended for educational, research, and portfolio development purposes.


### One change I'd make before deployment

Your README now says **current vs future** clearly. Don't implement all those future features right now. **Deploy the working version first**, then we can add them one at a time without breaking the project.

Your immediate next milestone is:

```text
GitHub
  ↓
Node/Express → Render
  ↓
React/Vite → Vercel
  ↓
Environment variables
  ↓
Production API URL
  ↓
Test dashboard
  ↓
DEPLOYED 🚀
