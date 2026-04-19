# 🚨 Community Based SOS Application

## 📌 Project Overview
This system enables victims to send SOS alerts, volunteers to respond in real-time, and authorities to analyze post-incident evidence such as movement tracking, images, and audio recordings.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Frontend:** React (Vite)  
- **Database:** MongoDB  
- **Realtime Communication:** Socket.IO  
- **Maps & Routing:** Leaflet + OSRM  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/syam-bukkuru/Community_Based_SOS.git
cd final_year_project
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```
Create a .env file:
```bash
MONGO_URI=your_mongodb_connection
PORT=5000
```
Run backend:
```bash
node index.js
```

✅ Expected Output:
```bash
MongoDB connected
Server running on port 5000
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Open in browser:
```bash
http://localhost:5173
```

### 🚀 How to Run the Project

#### 👤 Step 1: Create SOS (Victim)
- Open the Home Page  
- Select location (automatic or manual)  
- Click **SEND SOS**


#### 🧑‍🚒 Step 2: Volunteer Response
- Go to Volunteer Dashboard
- View nearby SOS alerts
- Click **Accept SOS**
- Redirects to tracking map

#### 📍 Step 3: Live Tracking
- Volunteer location updates every 5 seconds
- Victim & volunteer locations shown on map

### 👮 Step 4: Police Dashboard
Access:
```bash
/police
```
Features:
- View SOS list
- Check status **(PENDING / ACTIVE / RESOLVED)**
- See number of volunteers

#### 🗺️ Step 5: Evidence Map
- Displays:
  - Victim path (**red**)  
  - Volunteer paths (**different colors**)  
- Hover over paths to view **time and user details**

#### 📊 Step 6: Tracking Table
- Displays detailed logs for:
  - Victim  
  - Each volunteer  

  #### 📂 Step 7: Evidence Files
- View uploaded:
  - Images  
  - Audio recordings  

---

#### 🔄 Step 8: Resolve SOS
- Volunteer clicks **Resolve**  
- Status changes to **RESOLVED**  
- Tracking stops  

---

## 🎯 Key Features
- 🚨 Real-time SOS alerts  
- 🤝 Multi-volunteer coordination  
- 📍 Live GPS tracking  
- 🗺️ Evidence reconstruction (map replay)  
- 👮 Police investigation dashboard  

---

## ⚠️ Notes
- Works best on the same local network (WiFi)  
- Cloud storage (e.g., Cloudinary) can be added later  
- HTTPS not required for demo purposes  

---

## 🎤 Presentation Tip
> “This system bridges emergency response with post-incident investigation using real-time tracking and evidence visualization.”

---

## 🏁 Conclusion
This project demonstrates a scalable emergency response system with real-time coordination and forensic-level tracking for authorities.

---