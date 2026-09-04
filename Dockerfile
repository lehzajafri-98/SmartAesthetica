# SmartAesthetica 3D Engine - Production GPU Dockerfile
# Base: PyTorch with GPU + CUDA 11.7
FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python requirements
COPY Facial_project_backend/requirements_3d.txt .
RUN pip install --no-cache-dir -r requirements_3d.txt

# Install PyTorch3D (Wait: installing from pip is faster if wheel exists, else compile)
# For this runtime, we compile or use the pre-built wheels if available.
RUN pip install "git+https://github.com/facebookresearch/pytorch3d.git@v0.7.4"

# Copy 3D Engine Code
COPY Facial_project_backend/aws_gpu_worker.py .
COPY Facial_project_backend/model_3d.py .

# Create data directory for FLAME model
RUN mkdir -p data

# Expose port (FastAPI)
EXPOSE 8080

# Run the 3D Engine
CMD ["uvicorn", "aws_gpu_worker:app", "--host", "0.0.0.0", "--port", "8080"]
