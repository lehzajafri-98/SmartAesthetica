import cv2
import numpy as np

def warp_image(image, src_points, dst_points):
    """
    Warps an image based on source and destination control points using Moving Least Squares (MLS) or similar technique.
    For simplicity and speed, we can use Thin Plate Spline (TPS) via OpenCV's shape module if available, 
    or a grid-based deformation.
    
    A simpler robust approach for localized warping is the 'Liquify' effect (Interactive Image Warping).
    Here, we implement a localized bulge/pinch or directional warp.
    """
    # Convert image to numpy array if it's PIL
    img_arr = np.array(image)
    if img_arr.shape[2] == 4:
         img_arr = cv2.cvtColor(img_arr, cv2.COLOR_RGBA2RGB)
         
    h, w = img_arr.shape[:2]
    
    # We will use a dense grid displacement method
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    map_x = np.float32(grid_x)
    map_y = np.float32(grid_y)
    
    # Apply displacement for each point pair
    # src_points: list of (x,y)
    # dst_points: list of (x,y)
    
    for (sx, sy), (dx, dy) in zip(src_points, dst_points):
        # Calculate distance from every pixel to the source point
        dist_sq = (map_x - sx)**2 + (map_y - sy)**2
        
        # Warp radius
        radius = 50.0 # Adjust based on face size later
        
        # Calculate displacement weight (1 at center, 0 at radius)
        weight = np.exp(-dist_sq / (2 * (radius/2)**2))
        
        # Vector of displacement
        vx = dx - sx
        vy = dy - sy
        
        # Add displacement to map
        # We subtract because map_x, map_y define WHERE to pull the pixel FROM
        map_x -= weight * vx
        map_y -= weight * vy
        
    # Remap image
    warped = cv2.remap(img_arr, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    
    return warped

def smooth_skin(image, mask):
    """
    Applies bilateral filtering to smooth skin while keeping edges sharp.
    Only applies to the masked area.
    """
    img_arr = np.array(image)
    if img_arr.shape[2] == 4:
         img_arr = cv2.cvtColor(img_arr, cv2.COLOR_RGBA2RGB)
    
    # Bilateral filter is great for skin smoothing as it preserves edges
    smoothed = cv2.bilateralFilter(img_arr, d=15, sigmaColor=75, sigmaSpace=75)
    
    # Blend smoothed image with original using the mask
    # Mask should be 0-1 float
    mask_3d = np.stack([mask, mask, mask], axis=2)
    
    result = img_arr * (1 - mask_3d) + smoothed * mask_3d
    return result.astype(np.uint8)

def get_procedure_type(feature_name):
    # Determine if it's a warping procedure, smoothing procedure, or both
    feature_lower = feature_name.lower()
    
    warp_types = ["lip", "rhinoplasty", "nose", "jawline", "chin", "facelift"]
    smooth_types = ["botox", "peel", "laser", "resurfacing", "smooth", "facelift"]
    
    needs_warp = any(t in feature_lower for t in warp_types)
    needs_smooth = any(t in feature_lower for t in smooth_types)
    
    return needs_warp, needs_smooth
