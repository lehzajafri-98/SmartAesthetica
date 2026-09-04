import os
import cv2
import torch
import random
from train_segmentation import FaceSegmentationDataset, create_landmarker

def debug_loading():
    print("--- Debugging Dataset Loading ---")
    image_dirs = ["./thumbnails128x128"]
    for d in image_dirs:
        print(f"Directory {d} exists: {os.path.exists(d)}")
        if os.path.exists(d):
            print(f"Files in {d}: {len(os.listdir(d))}")
    
    # Try loading 5 images
    try:
        dataset = FaceSegmentationDataset(image_dirs, max_images=5)
        print(f"Dataset size: {len(dataset)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_loading()
