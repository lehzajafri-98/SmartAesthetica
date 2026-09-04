"""
SmartAesthetica — U-Net Segmentation Model Training
====================================================
Trains the custom U-Net on UTKFace (and optionally FFHQ) dataset.

Strategy:
1. Use MediaPipe to auto-generate ground-truth segmentation masks for each face image
2. Train U-Net to predict these masks from raw images
3. Save trained weights as .pth file

This allows U-Net to learn pixel-perfect segmentation without manual annotation.
"""

import os
import sys
import time
import random
import numpy as np
import cv2
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from unet_model import UNet

# MediaPipe for generating ground truth masks
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

# =========================================================================
# CONFIG
# =========================================================================
IMAGE_SIZE = 128            # Resize images to 128x128 for faster training on CPU
BATCH_SIZE = 8              # Small batch for Mac CPU
EPOCHS = 15                 # Increased for fine-tuning
LEARNING_RATE = 1e-3
NUM_WORKERS = 0             # Mac compatibility
MAX_IMAGES = 2000           # Increased for better accuracy with FFHQ

# Paths
UTKFACE_DIR = "./archive-4/UTKFace"
FFHQ_DIR = "./thumbnails128x128"      # Corrected for user upload path
MODEL_SAVE_PATH = "./data/unet_segmentation_weights.pth"
LANDMARKER_PATH = "./face_landmarker.task"

# MediaPipe Landmark indices for segmentation regions
LIPS_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]
NOSE_INDICES = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327, 294, 278, 344, 275, 45, 220, 115, 48, 64, 98]
FACE_CONTOUR = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

# =========================================================================
# MASK GENERATION using MediaPipe
# =========================================================================

def create_landmarker():
    """Creates a MediaPipe FaceLandmarker instance."""
    options = vision.FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=LANDMARKER_PATH),
        running_mode=vision.RunningMode.IMAGE,
        num_faces=1,
        min_face_detection_confidence=0.5)
    return vision.FaceLandmarker.create_from_options(options)

def generate_mask(image_bgr, landmarker):
    """
    Generates a binary segmentation mask for the face region.
    Returns a mask where:
    - Face skin = 255 (white)
    - Background = 0 (black)
    """
    h, w = image_bgr.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Convert for MediaPipe
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
    
    try:
        result = landmarker.detect(mp_image)
        if not result.face_landmarks or len(result.face_landmarks) == 0:
            return None
        
        landmarks = result.face_landmarks[0]
        
        # Draw face contour as filled polygon
        face_pts = []
        for idx in FACE_CONTOUR:
            if idx < len(landmarks):
                lm = landmarks[idx]
                face_pts.append((int(lm.x * w), int(lm.y * h)))
        
        if face_pts:
            face_pts_np = np.array(face_pts, dtype=np.int32)
            cv2.fillPoly(mask, [face_pts_np], 255)
        
        return mask
        
    except Exception as e:
        return None


# =========================================================================
# DATASET CLASS
# =========================================================================

class FaceSegmentationDataset(Dataset):
    """
    Loads face images from UTKFace/FFHQ and generates segmentation masks
    using MediaPipe at initialization time.
    """
    def __init__(self, image_dirs, max_images=MAX_IMAGES, image_size=IMAGE_SIZE):
        self.image_size = image_size
        self.samples = []  # List of (image_path) tuples
        
        # Collect image paths from all directories
        for img_dir in image_dirs:
            if not os.path.exists(img_dir):
                print(f"[Dataset] Skipping missing directory: {img_dir}")
                continue
            
            files = [f for f in os.listdir(img_dir) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            # Shuffle and take subset
            random.shuffle(files)
            for f in files[:max_images]:
                self.samples.append(os.path.join(img_dir, f))
        
        print(f"[Dataset] Loaded {len(self.samples)} image paths from {len(image_dirs)} directories")
        
        # Pre-generate masks using MediaPipe
        print("[Dataset] Generating ground-truth masks with MediaPipe...")
        landmarker = create_landmarker()
        
        self.valid_samples = []
        success = 0
        fail = 0
        
        for i, img_path in enumerate(self.samples):
            img = cv2.imread(img_path)
            if img is None:
                fail += 1
                continue
            
            mask = generate_mask(img, landmarker)
            if mask is not None:
                self.valid_samples.append((img_path, mask))
                success += 1
            else:
                fail += 1
            
            if (i + 1) % 50 == 0:
                print(f"  Processed {i+1}/{len(self.samples)} images "
                      f"(success: {success}, no face: {fail})")
        
        print(f"[Dataset] Mask generation complete: {success} valid, {fail} skipped")
        
        # Image transforms
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def __len__(self):
        return len(self.valid_samples)
    
    def __getitem__(self, idx):
        img_path, mask = self.valid_samples[idx]
        
        # Load and resize image
        img = cv2.imread(img_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (self.image_size, self.image_size))
        
        # Resize mask
        mask = cv2.resize(mask, (self.image_size, self.image_size))
        
        # Convert
        img_tensor = self.transform(img)
        mask_tensor = torch.tensor(mask, dtype=torch.float32).unsqueeze(0) / 255.0
        
        return img_tensor, mask_tensor


# =========================================================================
# TRAINING LOOP
# =========================================================================

def train():
    print("=" * 60)
    print("SmartAesthetica — U-Net Segmentation Training")
    print("=" * 60)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 
                          'mps' if torch.backends.mps.is_available() else 'cpu')
    print(f"[Training] Device: {device}")
    
    # Collect dataset directories
    dataset_dirs = []
    if os.path.exists(UTKFACE_DIR):
        dataset_dirs.append(UTKFACE_DIR)
        print(f"[Training] Found UTKFace at: {UTKFACE_DIR}")
    if os.path.exists(FFHQ_DIR):
        dataset_dirs.append(FFHQ_DIR)
        print(f"[Training] Found FFHQ at: {FFHQ_DIR}")
    
    if not dataset_dirs:
        print("[ERROR] No dataset directories found! Place images in:")
        print(f"  UTKFace: {UTKFACE_DIR}")
        print(f"  FFHQ:    {FFHQ_DIR}")
        return
    
    # Create dataset and dataloader
    dataset = FaceSegmentationDataset(dataset_dirs, max_images=MAX_IMAGES)
    
    if len(dataset) == 0:
        print("[ERROR] No valid face images found in dataset!")
        return
    
    # Split into train/val (80/20)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)
    
    print(f"[Training] Train: {train_size} images, Validation: {val_size} images")
    
    # Initialize model
    model = UNet(n_channels=3, n_classes=1).to(device)
    
    # RESUME LOGIC: Load existing weights if available
    start_epoch = 0
    if os.path.exists(MODEL_SAVE_PATH):
        try:
            checkpoint = torch.load(MODEL_SAVE_PATH, map_location=device)
            model.load_state_dict(checkpoint['model_state_dict'])
            start_epoch = checkpoint.get('epoch', 0)
            print(f"[Training] Resuming from existing weights: {MODEL_SAVE_PATH} (Epoch {start_epoch})")
        except Exception as e:
            print(f"[Training] Could not load existing weights: {e}. Starting fresh.")

    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"[Model] U-Net parameters: {total_params:,}")
    print(f"[Training] Starting {EPOCHS} epochs...")
    print("-" * 60)
    
    best_val_loss = float('inf')
    training_log = []
    
    for epoch in range(start_epoch, start_epoch + EPOCHS):
        # ---- TRAIN ----
        model.train()
        train_loss = 0.0
        start_time = time.time()
        
        for batch_idx, (images, masks) in enumerate(train_loader):
            images, masks = images.to(device), masks.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, masks)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        avg_train_loss = train_loss / len(train_loader)
        
        # ---- VALIDATE ----
        model.eval()
        val_loss = 0.0
        
        with torch.no_grad():
            for images, masks in val_loader:
                images, masks = images.to(device), masks.to(device)
                outputs = model(images)
                loss = criterion(outputs, masks)
                val_loss += loss.item()
        
        avg_val_loss = val_loss / len(val_loader)
        elapsed = time.time() - start_time
        
        # Calculate accuracy (IoU approximation)
        with torch.no_grad():
            images, masks = next(iter(val_loader))
            images, masks = images.to(device), masks.to(device)
            outputs = torch.sigmoid(model(images))
            predicted = (outputs > 0.5).float()
            intersection = (predicted * masks).sum()
            union = predicted.sum() + masks.sum() - intersection
            iou = (intersection / (union + 1e-6)).item()
        
        log_entry = {
            'epoch': epoch + 1,
            'train_loss': avg_train_loss,
            'val_loss': avg_val_loss,
            'iou': iou,
            'time': elapsed
        }
        training_log.append(log_entry)
        
        print(f"Epoch [{epoch+1}/{EPOCHS}] | "
              f"Train Loss: {avg_train_loss:.4f} | "
              f"Val Loss: {avg_val_loss:.4f} | "
              f"IoU: {iou:.4f} | "
              f"Time: {elapsed:.1f}s")
        
        # Save best model
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save({
                'epoch': epoch + 1,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'train_loss': avg_train_loss,
                'val_loss': avg_val_loss,
                'iou': iou,
                'datasets_used': [d for d in dataset_dirs],
                'image_size': IMAGE_SIZE,
                'num_training_images': train_size,
                'num_val_images': val_size,
            }, MODEL_SAVE_PATH)
            print(f"  >> Best model saved to {MODEL_SAVE_PATH}")
    
    print("-" * 60)
    print(f"[DONE] Training complete!")
    print(f"[DONE] Best validation loss: {best_val_loss:.4f}")
    print(f"[DONE] Model saved to: {MODEL_SAVE_PATH}")
    print(f"[DONE] Datasets used: {', '.join(dataset_dirs)}")
    
    # Print summary table
    print("\n" + "=" * 60)
    print("TRAINING LOG SUMMARY")
    print("=" * 60)
    print(f"{'Epoch':<8} {'Train Loss':<14} {'Val Loss':<14} {'IoU':<10} {'Time':<8}")
    print("-" * 54)
    for entry in training_log:
        print(f"{entry['epoch']:<8} {entry['train_loss']:<14.4f} {entry['val_loss']:<14.4f} "
              f"{entry['iou']:<10.4f} {entry['time']:<8.1f}s")


if __name__ == "__main__":
    train()
