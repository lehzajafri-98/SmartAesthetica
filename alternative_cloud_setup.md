# Alternative Cloud GPU Deployment Guide

Since AWS has restricted your GPU quota, you can use specialized "GPU-as-a-Service" providers. These platforms are significantly easier to set up, provide instant access to high-end NVIDIA GPUs (A100, H100, L40S, etc.), and do not require lengthy approval processes.

## Recommended Providers

### 1. RunPod (Highly Recommended)
- **Why:** Instant "Pods", very cheap on-demand pricing, and a simple web interface.
- **Cost:** ~$0.40/hr for an RTX 3090/4090 or ~$0.70/hr for an A100.
- **Steps:**
  1. Create account at [runpod.io](https://runpod.io).
  2. Deploy a "PyTorch" template pod.
  3. Upload `aws_gpu_worker.py` and your `data/generic_model.pkl` to the pod.
  4. Run `python aws_gpu_worker.py`.
  5. Use the "Proxy URL" provided by RunPod as your `AWS_GPU_WORKER_URL`.

### 2. Lambda Labs
- **Why:** Best-in-class performance and professional-grade infrastructure.
- **Cost:** ~$0.60/hr for an A10 or A100.
- **Steps:**
  1. Create account at [lambdalabs.com](https://lambdalabs.com).
  2. Launch a GPU Instance (Ubuntu).
  3. SSH into the instance and git clone your backend.
  4. Run the worker script.

---

## How to Connect Your Local App to the New Worker

Once your worker is running on one of the providers above, copy its Public IP or Proxy URL.

1. **Open a terminal** on your local Mac.
2. **Set the environment variable**:
   ```bash
   export AWS_GPU_WORKER_URL="http://YOUR_NEW_IP:8080"
   ```
3. **Restart your local backend**:
   ```bash
   python main.py
   ```
4. SmartAesthetica will now automatically route 3D requests to your new high-performance cloud worker!

---
**Pro-Tip**: You only pay for these servers while they are running. **Always stop/terminate your pod/instance** when you are done testing to avoid unnecessary charges.
