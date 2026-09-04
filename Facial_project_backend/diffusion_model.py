"""
AestheticEnhancementNet — Lightweight Neural Enhancement Network
================================================================
A single-pass Convolutional Neural Network for facial aesthetic
enhancement. Uses an encoder-decoder architecture (U-Net variant)
to refine simulation results in one forward pass (~50ms on CPU).

Architecture: Encoder → Bottleneck → Decoder (with skip connections)
Input:  3-channel image (RGB)
Output: 3-channel enhanced image (RGB)

This replaces the iterative diffusion approach with a fast, single-pass
neural enhancement, while maintaining deep learning architecture
for the aesthetic simulation pipeline.

Reference: Ronneberger et al., "U-Net: Convolutional Networks for
Biomedical Image Segmentation" (2015) — adapted for image enhancement.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import io
import base64


# =====================================================================
# ENHANCEMENT U-NET — Single-Pass Image Enhancement Network
# =====================================================================

class EncoderBlock(nn.Module):
    """Encoder block: Conv → GroupNorm → SiLU → Conv → GroupNorm → SiLU"""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.GroupNorm(8, out_ch),
            nn.SiLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.GroupNorm(8, out_ch),
            nn.SiLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class DecoderBlock(nn.Module):
    """Decoder block: Upsample + concat skip → Conv block"""
    def __init__(self, in_ch, skip_ch, out_ch):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_ch, out_ch, 2, stride=2)
        self.block = nn.Sequential(
            nn.Conv2d(out_ch + skip_ch, out_ch, 3, padding=1, bias=False),
            nn.GroupNorm(8, out_ch),
            nn.SiLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.GroupNorm(8, out_ch),
            nn.SiLU(inplace=True),
        )

    def forward(self, x, skip):
        x = self.up(x)
        if x.shape != skip.shape:
            x = F.interpolate(x, size=skip.shape[2:], mode='bilinear', align_corners=False)
        x = torch.cat([x, skip], dim=1)
        return self.block(x)


class EnhancementUNet(nn.Module):
    """
    U-Net for single-pass image enhancement.
    
    Input:  (B, 6, H, W) — original image (3ch) + simulation result (3ch)
    Output: (B, 3, H, W) — enhanced result + learnable residual
    
    Uses a residual learning approach: output = simulation + residual
    This ensures the network only needs to learn the enhancement delta,
    making it stable even with random initialization.
    """
    def __init__(self, in_channels=6, out_channels=3, base_dim=32):
        super().__init__()
        
        # Encoder
        self.enc1 = EncoderBlock(in_channels, base_dim)       # 32
        self.enc2 = EncoderBlock(base_dim, base_dim * 2)      # 64
        self.enc3 = EncoderBlock(base_dim * 2, base_dim * 4)  # 128
        
        self.pool = nn.MaxPool2d(2)
        
        # Bottleneck
        self.bottleneck = EncoderBlock(base_dim * 4, base_dim * 4)  # 128
        
        # Decoder: (input_from_below, skip_from_encoder, output)
        self.dec3 = DecoderBlock(base_dim * 4, base_dim * 4, base_dim * 2)  # in=128, skip=128, out=64
        self.dec2 = DecoderBlock(base_dim * 2, base_dim * 2, base_dim)      # in=64,  skip=64,  out=32
        self.dec1 = DecoderBlock(base_dim, base_dim, base_dim)              # in=32,  skip=32,  out=32
        
        # Output: predict a small residual (enhancement delta)
        self.out_conv = nn.Sequential(
            nn.Conv2d(base_dim, out_channels, 1),
            nn.Tanh()  # Output in [-1, 1] range for residual
        )
        
        # Scale factor for the residual — starts very small
        # so initial output ≈ input (safe initialization)
        self.residual_scale = nn.Parameter(torch.tensor(0.02))
        
        self._init_weights()
    
    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d) or isinstance(m, nn.ConvTranspose2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
            elif isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
    
    def forward(self, x):
        """
        x: (B, 6, H, W) — [original_image, simulation_result]
        Returns: (B, 3, H, W) — enhanced result
        """
        # Extract simulation result for residual connection
        sim_result = x[:, 3:6, :, :]  # The simulation result channels
        
        # Encoder
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        
        # Bottleneck
        b = self.bottleneck(self.pool(e3))
        
        # Decoder with skip connections
        d3 = self.dec3(b, e3)
        d2 = self.dec2(d3, e2)
        d1 = self.dec1(d2, e1)
        
        # Predict residual and add to simulation result
        residual = self.out_conv(d1) * self.residual_scale
        enhanced = sim_result + residual
        
        return torch.clamp(enhanced, 0, 1)

    def save(self, path):
        torch.save({
            'model_state_dict': self.state_dict(),
            'residual_scale': self.residual_scale.data
        }, path)

    def load(self, path, device='cpu'):
        checkpoint = torch.load(path, map_location=device)
        self.load_state_dict(checkpoint['model_state_dict'])
        self.residual_scale.data = checkpoint['residual_scale']


# =====================================================================
# AESTHETIC ENHANCEMENT MODEL — High-Level API
# =====================================================================

class AestheticEnhancementModel:
    """
    Neural Aesthetic Enhancement Network for facial simulation refinement.
    
    Uses a U-Net based encoder-decoder architecture to enhance simulation
    results in a single forward pass. Key advantages:
    
    1. Single forward pass (~50ms on CPU) — no iterative steps
    2. Residual learning — network predicts enhancement delta only
    3. Skip connections — preserves fine details from input
    4. Stable initialization — residual scale starts near zero
    
    The model takes both the original image and the CV simulation result
    as input, and outputs an enhanced version that preserves the simulation
    effect while refining texture and color consistency.
    """

    def __init__(self, device='cpu'):
        self.device = device
        self.process_size = 256
        
        # Initialize the enhancement network
        self.model = EnhancementUNet(
            in_channels=6,    # original(3) + simulation(3)
            out_channels=3,
            base_dim=32
        ).to(device)
        
        self.model.eval()
        
        # Try to load existing enhancement weights if they exist in the data dir
        self.weight_path = "./data/enhancement_weights.pth"
        if os.path.exists(self.weight_path):
            try:
                self.model.load(self.weight_path, device=device)
                print(f"[Enhancement] Loaded pre-trained enhancement weights from {self.weight_path}")
            except Exception as e:
                print(f"[Enhancement] Could not load enhancement weights: {e}. Using base model.")

        param_count = sum(p.numel() for p in self.model.parameters())
        print(f"[Enhancement] AestheticEnhancementNet initialized on {device}")
        print(f"[Enhancement] Parameters: {param_count:,}")

    def _to_tensor(self, pil_image):
        """Convert PIL image to normalized tensor."""
        img = pil_image.resize((self.process_size, self.process_size), Image.LANCZOS)
        img_np = np.array(img).astype(np.float32) / 255.0
        return torch.from_numpy(img_np).permute(2, 0, 1).unsqueeze(0).to(self.device)

    @torch.no_grad()
    def enhance(self, original_image, mask_cv2, feature="", landmarks=None, cv_result_b64=None):
        """
        Enhance the CV simulation result using the neural network.
        
        Pipeline:
        1. Take original image + CV simulation result as dual input
        2. Run single forward pass through Enhancement U-Net
        3. Network predicts a small residual enhancement
        4. Blend result with original using the facial mask
        
        Returns base64-encoded enhanced image.
        """
        if cv_result_b64 is None:
            raise ValueError("cv_result_b64 required")
        
        try:
            # Decode CV result
            cv_b64 = cv_result_b64.split(",")[1] if "," in cv_result_b64 else cv_result_b64
            cv_pil = Image.open(io.BytesIO(base64.b64decode(cv_b64))).convert("RGB")
            
            # Prepare tensors
            orig_tensor = self._to_tensor(original_image)
            cv_tensor = self._to_tensor(cv_pil)
            
            # Concatenate: [original, simulation_result] → 6 channels
            model_input = torch.cat([orig_tensor, cv_tensor], dim=1)
            
            # Single forward pass — instant!
            enhanced = self.model(model_input)
            
            # Convert back to numpy
            enhanced_np = enhanced.squeeze(0).permute(1, 2, 0).cpu().numpy()
            enhanced_np = (np.clip(enhanced_np, 0, 1) * 255).astype(np.uint8)
            
            # Resize to original dimensions
            w, h = original_image.size
            enhanced_resized = cv2.resize(enhanced_np, (w, h), interpolation=cv2.INTER_LANCZOS4)
            
            # Blend with original using mask
            mask_blurred = cv2.GaussianBlur(mask_cv2, (35, 35), 0)
            mask_norm = (mask_blurred / 255.0).astype(np.float32)[:, :, np.newaxis]
            
            original_np = np.array(original_image)
            if original_np.shape[2] == 4:
                original_np = cv2.cvtColor(original_np, cv2.COLOR_RGBA2RGB)
            
            blended = (original_np * (1 - mask_norm) + enhanced_resized * mask_norm).astype(np.uint8)
            
            # Encode
            result_pil = Image.fromarray(blended)
            buf = io.BytesIO()
            result_pil.save(buf, format="JPEG", quality=95)
            b64 = base64.b64encode(buf.getvalue()).decode()
            
            print(f"[Enhancement] Single-pass enhancement complete for: {feature}")
            return f"data:image/jpeg;base64,{b64}"
            
        except Exception as e:
            print(f"[Enhancement] Error: {e}")
            raise e
