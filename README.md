# SmartAesthetica: Clinical-Grade Facial Simulation Engine

![SmartAesthetica Banner](https://img.shields.io/badge/Aesthetic-Technology-blueviolet?style=for-the-badge)
![Engine Version](https://img.shields.io/badge/Engine-v22.0--Balanced-success?style=for-the-badge)
![Status](https://img.shields.io/badge/Production-Ready-orange?style=for-the-badge)

**SmartAesthetica** is a high-performance medical simulation platform designed for aesthetic clinics and plastic surgeons. It utilizes advanced computer vision and anatomic warping to provide patients with realistic, surgically-plausible "After" visualizations in real-time.

## 🚀 Core Technology: The v22 "Balanced Professional" Engine

The platform is powered by a custom-built simulation engine optimized for clinical accuracy rather than generic "filters."

### Key Capabilities
- **Anatomic Rhinoplasty**: Structural narrowing and tip-rotation using Thin-Plate Spline (TPS) mesh warping.
- **Lip & Chin Augmentation**: Volumetric expansion with corner-pinning to prevent "melting" or distortion.
- **Neurotoxin (Botox) Simulation**: Targeted wrinkle shadow-erasing using frequency separation, preserving natural skin pores and texture.
- **Dermal Filler Mapping**: Landmark-aware volume injection for jawline and cheek enhancement.
- **Advanced Texture Suite**: Professional simulation for Microneedling, PRP, and Chemical Peels with "Collagen Radiance" boosting.

### Professional Guardrails
- **Internal Intensity Clamping**: Automatically caps all simulations at 65% intensity to ensure every result remains anatomically possible and medically professional.
- **Structural Anchoring**: Hard-locks the eyes, eyebrows, and mouth corners to prevent facial distortion during localized procedures.
- **HD Detail Recovery**: Injects high-pass skin grain back into processed areas to maintain the "photographic" feel.

## 🛠 Tech Stack

### Backend
- **Python 3.14+**
- **FastAPI**: High-performance asynchronous API orchestration.
- **MediaPipe**: Real-time facial landmarking (468+ points).
- **OpenCV & SciPy**: Precision TPS warping and bilateral texture filtering.
- **SQLite**: Lightweight, portable patient data management.

### Frontend
- **React / Vite**: Modern, responsive user interface.
- **Vanilla CSS**: Premium, custom-styled "Glassmorphic" UI.
- **Framer Motion**: Smooth micro-animations for enhanced UX.

## 📦 Installation & Setup

### 1. Backend Setup
```bash
cd Facial_project_backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd Facial_project_frontend
npm install
npm run dev
```

## 🔒 Security & HIPAA
Designed with a "Privacy-First" architecture, ensuring patient photos are processed with high-security standards and metadata is managed locally or via encrypted cloud workers.

---
**Developed for SmartAesthetica — Visualizing the Future of Aesthetics.**
