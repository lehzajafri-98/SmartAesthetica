
"""
SmartAesthetica - Simulation Engine v44

Frontend strings that trigger each branch:
  "Botox"                -> botox
  "Dermal Fillers"       -> dermal fillers (cheek)
  "Lip Fillers"          -> lip fillers (new soft filler logic)
  "Jawline Fillers"      -> jawline fillers (new volume logic)
  "Microneedling"        -> microneedling
  "Chemical Peels"       -> chemical peel
  "HydraFacial"          -> hydrafacial
  "PRP Therapy"          -> prp
  "Rhinoplasty"          -> rhinoplasty / nose
  "Lip Augmentation"     -> lip augmentation (new surgical logic)
  "Chin Augmentation"    -> chin
  "Jawline Surgery"      -> jawline surgery (new aggressive logic)
  "Buccal Fat Removal"   -> buccal fat
  "Scar Revision Surgery"-> scar
"""

import numpy as np
import cv2
from PIL import Image
import io
import base64

# ?????????????????????????????????????????????????????????????
# INTENSITY MULTIPLIER
# ?????????????????????????????????????????????????????????????

def get_mult(intensity):
    t = max(0.0, min(1.0, float(intensity) / 100.0))
    return t * t * (3.0 - 2.0 * t)

# ?????????????????????????????????????????????????????????????
# LANDMARK HELPER
# ?????????????????????????????????????????????????????????????

def lm_pt(landmarks, idx, w, h):
    return np.array([landmarks[idx]['x'] * w,
                     landmarks[idx]['y'] * h], dtype=np.float64)

# ?????????????????????????????????????????????????????????????
# LOCAL GAUSSIAN WARP
# ?????????????????????????????????????????????????????????????

def local_gaussian_warp(image_np, move_pts_xy, move_dxy,
                        anchor_pts_xy, h, w,
                        sigma_move_frac=0.07,
                        sigma_anchor_frac=0.035,
                        anchor_strength=20.0):
    if not move_pts_xy:
        return image_np.copy()

    diag = np.sqrt(h * h + w * w)
    sigma_move   = diag * sigma_move_frac
    sigma_anchor = diag * sigma_anchor_frac

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    disp_x = np.zeros((h, w), dtype=np.float32)
    disp_y = np.zeros((h, w), dtype=np.float32)
    w_sum  = np.full((h, w), 0.01, dtype=np.float32)

    for (px, py), (dx, dy) in zip(move_pts_xy, move_dxy):
        dist2 = (xx - float(px))**2 + (yy - float(py))**2
        g = np.exp(-dist2 / (2.0 * sigma_move**2))
        disp_x += g * float(dx)
        disp_y += g * float(dy)
        w_sum  += g

    for (px, py) in anchor_pts_xy:
        dist2 = (xx - float(px))**2 + (yy - float(py))**2
        g = np.exp(-dist2 / (2.0 * sigma_anchor**2)) * anchor_strength
        w_sum += g

    map_x = np.clip(xx - disp_x / w_sum, 0, w - 1).astype(np.float32)
    map_y = np.clip(yy - disp_y / w_sum, 0, h - 1).astype(np.float32)

    return cv2.remap(image_np, map_x, map_y,
                     interpolation=cv2.INTER_LINEAR,
                     borderMode=cv2.BORDER_REFLECT_101)

def edge_anchor_pts(w, h, n=4):
    pts = []
    for fy in np.linspace(0, 1, n):
        for fx in np.linspace(0, 1, n):
            if fy == 0 or fy == 1 or fx == 0 or fx == 1:
                pts.append([fx * (w - 1), fy * (h - 1)])
    return pts

# ?????????????????????????????????????????????????????????????
# SKIN TREATMENT ENGINE (unchanged from v37)
# ?????????????????????????????????????????????????????????????

def detect_scar_mask(img):
    h, w = img.shape[:2]

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # 🔥 multi-scale texture extraction (better than single blur diff)
    blur1 = cv2.GaussianBlur(gray, (9, 9), 0)
    blur2 = cv2.GaussianBlur(gray, (21, 21), 0)

    diff = cv2.absdiff(blur1, blur2).astype(np.float32)

    # normalize safely
    diff = diff / (np.max(diff) + 1e-6)

    # 🔥 LOWER threshold (critical fix)
    mask = (diff > 0.18).astype(np.uint8) * 255

    # morphology cleanup
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k, iterations=1)
    mask = cv2.dilate(mask, k, iterations=2)

    # face constraint
    face_mask = np.zeros((h, w), np.uint8)
    cv2.ellipse(face_mask, (w // 2, h // 2),
                (int(w * 0.35), int(h * 0.40)), 0, 0, 360, 255, -1)

    mask = cv2.bitwise_and(mask, face_mask)

    return mask


def apply_scar_revision(img, landmarks, intensity, h, w):
    mult = get_mult(intensity)

    scar_mask = detect_scar_mask(img).astype(np.float32) / 255.0

    #  sharpen mask (IMPORTANT FIX)
    scar_mask = cv2.GaussianBlur(scar_mask, (11, 11), 0)
    scar_mask = np.clip(scar_mask * (2.5 + 2.5 * mult), 0, 1)

    alpha = scar_mask[:, :, np.newaxis]

    #  stronger “dermal regeneration look”
    base = img.astype(np.float32)

    # heavy smoothing ONLY in scar region
    smooth = cv2.bilateralFilter(img, 35, 200, 200)
    smooth = cv2.bilateralFilter(smooth, 21, 150, 150).astype(np.float32)

    #  texture flattening (KEY MISSING PIECE)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    texture = cv2.Laplacian(gray, cv2.CV_32F)
    texture = np.abs(texture)
    texture = cv2.GaussianBlur(texture, (9, 9), 0)
    texture = (texture / (texture.max() + 1e-6))[:, :, np.newaxis]

    smooth = smooth * (1.0 - texture * (0.6 + 0.6 * mult))

    #  real scar fading (not just smoothing)
    lab_base = cv2.cvtColor(base.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    lab_smooth = cv2.cvtColor(smooth.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)

    # brighten + reduce redness + even tone
    lab_smooth[:, :, 0] = lab_smooth[:, :, 0] * (1.0 + 0.25 * mult)
    lab_smooth[:, :, 1] = lab_smooth[:, :, 1] * (1.0 - 0.18 * mult)
    lab_smooth[:, :, 2] = lab_smooth[:, :, 2] * (1.0 - 0.10 * mult)

    lab_smooth = np.clip(lab_smooth, 0, 255)

    smooth = cv2.cvtColor(lab_smooth.astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)

    #  IMPORTANT: stronger blending (this was missing)
    strength = 0.25 + 0.75 * mult

    result = base * (1 - alpha * strength) + smooth * (alpha * strength)

    # final polish
    result = cv2.bilateralFilter(result.astype(np.uint8), 9, 75, 75)

    print(f"[Scar Revision FIXED] intensity={intensity} mult={mult:.3f}")

    return result.astype(np.uint8)

def apply_botox(img, landmarks, intensity, h, w):
    mult = get_mult(intensity)

    result = img.astype(np.float32)

    def make_mask(indices, blur=61):
        pts = np.array([
            [landmarks[i]['x'] * w, landmarks[i]['y'] * h]
            for i in indices if i < len(landmarks)
        ], np.int32)
        m = np.zeros((h, w), np.float32)
        if len(pts) > 2:
            cv2.fillPoly(m, [pts], 1.0)
        return cv2.GaussianBlur(m, (blur, blur), 0)

    # ONLY top face zones - no jaw, no chin, no cheeks
    forehead_mask  = make_mask([10,338,297,332,284,251,389,
                                 127,21,54,103,67,109], blur=71)
    glabella_mask  = make_mask([55,65,52,53,46,285,295,282,283,276,8,9,107,336], blur=45)
    left_crow      = make_mask([33,130,226,247,30,29,27,28,56,190], blur=35)
    right_crow     = make_mask([263,359,446,467,260,259,257,258,286,414], blur=35)

    # Strict cap - only upper face
    total_mask = np.clip(
        forehead_mask * 0.90 +
        glabella_mask * 1.00 +
        left_crow     * 0.60 +
        right_crow    * 0.60,
        0, 0.85
    )

    # HARD CUT - below eye level = zero effect
    eye_y = int((landmarks[33]['y'] + landmarks[263]['y']) / 2 * h)
    cutoff_y = eye_y + int(h * 0.04)  # just below eyes
    total_mask[cutoff_y:, :] = 0      # nothing below eyes

    total_mask = cv2.GaussianBlur(total_mask, (31, 31), 0)

    # STEP 2: Wrinkle detection - only in masked zone
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    lap1 = cv2.Laplacian(gray, cv2.CV_32F, ksize=3)
    lap2 = cv2.Laplacian(cv2.GaussianBlur(gray,(5,5),0), cv2.CV_32F, ksize=3)
    wrinkle = (np.abs(lap1)*0.6 + np.abs(lap2)*0.4) / (np.abs(lap1).max() + 1e-5)
    wrinkle_mask = np.clip(
        cv2.GaussianBlur(
            np.clip(wrinkle * (1.0 + 1.8*mult), 0, 1) * total_mask,
            (21, 21), 0
        ) * (1.6 * mult), 0, 0.88
    )[:, :, np.newaxis]

    # STEP 3: Smooth only wrinkle zones
    smooth = cv2.bilateralFilter(img, 25, 120, 120).astype(np.float32)
    alpha = np.clip(
        total_mask * (0.25 + 0.55 * mult),
        0, 0.72
    )[:, :, np.newaxis]
    result = result * (1 - alpha) + smooth * alpha

    # STEP 4: Wrinkle line removal
    ws = cv2.bilateralFilter(result.astype(np.uint8), 19, 100, 100).astype(np.float32)
    result = result * (1 - wrinkle_mask) + ws * wrinkle_mask

    # STEP 5: Brightness - forehead only
    lab = cv2.cvtColor(np.clip(result,0,255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    boost = total_mask[:,:,np.newaxis] * 0.06 * mult
    lab[:,:,0] = np.clip(lab[:,:,0] * (1.0 + boost[:,:,0]), 0, 255)
    result = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)

    # STEP 6: Light polish - targeted only
    fs = cv2.bilateralFilter(result.astype(np.uint8), 7, 40, 40).astype(np.float32)
    fa = np.clip(total_mask[:,:,np.newaxis] * (0.30 + 0.35 * mult), 0, 0.60)
    result = result * (1 - fa) + fs * fa

    print(f"[Botox v3] Intensity={intensity}")
    return np.clip(result, 0, 255).astype(np.uint8)


def apply_clinical_skin_treatment(img, mask, treatment_type, landmarks, intensity):
    try:
        t    = treatment_type.lower()
        # Rhinoplasty intensity cap
        
        h, w = img.shape[:2]
        mult = get_mult(intensity)

        if "botox" in t:
            return apply_botox(img, landmarks, intensity, h, w)
        if "scar" in t:
            return apply_scar_revision(img, landmarks, intensity, h, w)

        # Build face alpha mask
        alpha = np.zeros((h, w), np.float32)
        face_pts = np.array([
            [landmarks[i]['x'] * w, landmarks[i]['y'] * h]
            for i in [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,
                      378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,21,54,103,67,109]
        ], np.int32)
        cv2.fillPoly(alpha, [face_pts], 1.0)
        alpha = cv2.GaussianBlur(alpha, (201,201), 0)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        alpha *= np.power(np.clip(yy / (h * 0.22), 0, 1), 0.7)
        alpha  = np.clip(alpha, 0, 1)

        protect = np.ones((h, w), np.float32)
        for grp in [
            [33,133,160,159,158,157,173,153,144],
            [362,263,387,386,385,384,398,373,380],
            [61,146,91,181,84,17,314,405,321,375,291]
        ]:
            pts = np.array([[landmarks[i]['x']*w, landmarks[i]['y']*h] for i in grp], np.int32)
            m   = np.zeros((h,w), np.uint8)
            cv2.fillPoly(m, [pts], 255)
            protect *= (1.0 - (cv2.GaussianBlur(m,(31,31),0).astype(np.float32)/255.0)*0.95)
        alpha *= protect
        alpha3  = alpha[:,:,np.newaxis]
        result  = img.astype(np.float32)

        if "chemical peel" in t or "peel" in t:
            # STEP 1: Smoothing
            smooth = cv2.bilateralFilter(img, 15, 80, 80).astype(np.float32)
            smooth = cv2.bilateralFilter(smooth.astype(np.uint8), 9, 60, 60).astype(np.float32)
        
            # STEP 2: Match forehead tone to rest of face BEFORE LAB
            # Sample mid-face tone and forehead tone, then equalize
            mid_y = int(h * 0.55)
            fore_y = int(h * 0.15)
            mid_tone = np.mean(smooth[mid_y-20:mid_y+20, w//4:3*w//4], axis=(0,1))
            fore_tone = np.mean(smooth[fore_y-20:fore_y+20, w//4:3*w//4], axis=(0,1))
            tone_ratio = np.clip(mid_tone / (fore_tone + 1e-6), 0.85, 1.15)
        
            # Apply tone correction only to forehead zone
            fore_mask = np.zeros((h, w), np.float32)
            fore_top = int(h * 0.05)
            fore_bot = int(h * 0.38)
            fore_mask[fore_top:fore_bot, :] = 1.0
            fore_mask = cv2.GaussianBlur(fore_mask, (101, 101), 0)[:, :, np.newaxis]
            smooth = smooth * (1 - fore_mask) + (smooth * tone_ratio) * fore_mask
            smooth = np.clip(smooth, 0, 255)
        
            # STEP 3: LAB - even tone only, minimal brightness
            lab = cv2.cvtColor(smooth.astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
            lab[:,:,0] = np.clip(lab[:,:,0] * (1.0 + 0.06 * mult), 0, 255)
            lab[:,:,1] = np.clip(lab[:,:,1] * (1.0 - 0.05 * mult), 0, 255)
            lab[:,:,2] = np.clip(lab[:,:,2] * (1.0 - 0.03 * mult), 0, 255)
            peel = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)
        
            # STEP 4: Uniform face mask
            peel_mask = np.zeros((h, w), np.float32)
            face_pts_peel = np.array([
                [landmarks[i]['x'] * w, landmarks[i]['y'] * h]
                for i in [10,338,297,332,284,251,389,356,454,323,361,288,
                          397,365,379,378,400,377,152,148,176,149,150,
                          136,172,58,132,93,234,127,21,54,103,67,109]
            ], np.int32)
            cv2.fillPoly(peel_mask, [face_pts_peel], 1.0)
            peel_mask = cv2.GaussianBlur(peel_mask, (151, 151), 0)
            peel_mask3 = peel_mask[:,:,np.newaxis]
        
            s = 0.50 + 0.35 * mult
            result = result * (1 - peel_mask3 * s) + peel * (peel_mask3 * s)
        
            # STEP 5: Polish
            polish = cv2.bilateralFilter(result.astype(np.uint8), 7, 45, 45).astype(np.float32)
            result = result * 0.50 + polish * 0.50

        elif "hydrafacial" in t or "hydra" in t:
            smooth = cv2.bilateralFilter(img, 13, 65, 65).astype(np.float32)
            hsv    = cv2.cvtColor(smooth.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
            hsv[:,:,2] = np.clip(hsv[:,:,2]*(1.0+0.14*mult), 0, 255)
            hsv[:,:,1] = np.clip(hsv[:,:,1]*(1.0+0.06*mult), 0, 255)
            hydra  = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
            bl     = cv2.GaussianBlur(hydra,(0,0),3)
            hydra  = cv2.addWeighted(hydra,1.15,bl,-0.15,0).astype(np.float32)
            s      = 0.40+0.40*mult
            result = result*(1-alpha3*s) + hydra*(alpha3*s)

        elif "prp" in t:
            smooth = cv2.bilateralFilter(img, 15, 80, 80).astype(np.float32)
            hsv    = cv2.cvtColor(smooth.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
            hsv[:,:,1] = np.clip(hsv[:,:,1]*(1.0+0.10*mult), 0, 255)
            hsv[:,:,2] = np.clip(hsv[:,:,2]*(1.0+0.08*mult), 0, 255)
            prp    = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
            s      = 0.35+0.40*mult
            result = result*(1-alpha3*s) + prp*(alpha3*s)

        elif "microneedling" in t or "needling" in t:
            # STEP 1: Skin smoothing - collagen effect
            smooth_base = cv2.bilateralFilter(img, 20, 90, 90).astype(np.float32)
            smooth_base = cv2.bilateralFilter(smooth_base.astype(np.uint8), 12, 65, 65).astype(np.float32)

            # STEP 2: Fine line / pore tightening
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
            texture = np.abs(cv2.Laplacian(gray, cv2.CV_32F, ksize=3))
            texture = cv2.GaussianBlur(texture, (9, 9), 0)
            texture_norm = np.clip(texture / (np.mean(texture) + 1e-6), 0, 3.0)[:, :, np.newaxis]

            texture_suppress = 0.28 + 0.42 * mult
            needling = (
                img.astype(np.float32) * (1 - np.clip(texture_norm * 0.55, 0, 1) * texture_suppress)
                + smooth_base           * (    np.clip(texture_norm * 0.55, 0, 1) * texture_suppress)
            )

            # STEP 3: Under-eye brightening - ONLY L channel, no a/b touch
            left_eye_center  = np.array([landmarks[33]['x'] * w,  landmarks[33]['y'] * h])
            right_eye_center = np.array([landmarks[263]['x'] * w, landmarks[263]['y'] * h])
            yy_g, xx_g = np.mgrid[0:h, 0:w].astype(np.float32)

            under_eye_mask = np.zeros((h, w), np.float32)
            for ec in [left_eye_center, right_eye_center]:
                d = np.sqrt((xx_g - ec[0])**2 + (yy_g - (ec[1] + h * 0.045))**2)
                under_eye_mask += np.exp(-d**2 / (2 * (w * 0.055)**2))
            under_eye_mask = np.clip(under_eye_mask, 0, 1)[:, :, np.newaxis]

            # Only brighten - no color shift at all
            lab_ne = cv2.cvtColor(np.clip(needling, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
            lab_ne[:, :, 0] = np.clip(lab_ne[:, :, 0] * (1.0 + 0.15 * mult), 0, 255)  # L only
            # a and b channels UNTOUCHED - no color change
            eye_bright = cv2.cvtColor(lab_ne.astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)
            needling = needling * (1 - under_eye_mask * mult * 0.65) + eye_bright * (under_eye_mask * mult * 0.65)

            # STEP 4: Overall glow - HSV only, safe
            hsv = cv2.cvtColor(np.clip(needling, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
            hsv[:, :, 2] = np.clip(hsv[:, :, 2] * (1.0 + 0.06 * mult), 0, 255)  # brightness only
            needling = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)

            # STEP 5: Blend
            s = 0.45 + 0.40 * mult
            result = result * (1 - alpha3 * s) + needling * (alpha3 * s)

        result = np.clip(cv2.GaussianBlur(result,(3,3),0), 0, 255)
        print(f"[Treatment Applied] {treatment_type}")
        return result.astype(np.uint8)

    except Exception as e:
        print(f"[Treatment Error] {e}")
        return img


# ?????????????????????????????????????????????????????????????
# MAIN SIMULATION
# ?????????????????????????????????????????????????????????????

def simulate_procedure(original_image, mask_cv2, feature, landmarks, intensity=50):
    try:
        img = np.array(original_image)
        if img.ndim == 3 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)

        h_orig, w_orig = img.shape[:2]
        scale = 1100 / max(h_orig, w_orig)
        img   = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
        h, w  = img.shape[:2]

        fl = feature.lower()

        # HARD CAP FOR RHINOPLASTY
        if "rhino" in fl or ("nose" in fl and "augmentation" not in fl):
            intensity = min(intensity, 50)
        
        mult = get_mult(intensity)

        move_pts = []
        move_dxy = []
        anchors  = edge_anchor_pts(w, h, n=4)

        def lp(idx):
            return lm_pt(landmarks, idx, w, h)

        def mv(idx, dx, dy):
            if idx < len(landmarks):
                move_pts.append(lp(idx))
                move_dxy.append([dx, dy])

        def anc(idx):
            if idx < len(landmarks):
                anchors.append(lp(idx))

        warp_kwargs = {}

        # Shared freeze list for lip procedures
        LIP_FREEZE = [
            1,2,4,5,6,168,197,
            48,278,220,440,218,438,
            33,263,130,359,234,454,
            10,151,9,
            79,309,49,279,
            136,365,172,397,152,58,288,
            149,150,148,377,378,379,
            176,400,207,427
        ]

        # ======================================================
        # RHINOPLASTY  (v42 - frontal + profile, stable at ALL intensities)
        #
        # KEY FIXES:
        #  1. Profile detection via eye-spread: if eyes < 20% width apart -> profile
        #  2. Profile mode: hump = vertical push UP, no horizontal squeeze
        #  3. Frontal mode: symmetric narrowing + tip lift
        #  4. HARD LIP GUARD: subnase_y baked into nose_mask, lips immune at any intensity
        #  5. Comprehensive anchors for both modes
        #  6. All displacements ceiling-clamped
        # ======================================================
        if "rhino" in fl or ("nose" in fl and "augmentation" not in fl):

            # POSE DETECTION - use Z depth + eye visibility
            # MediaPipe z is relative depth: negative = closer to camera
            # In profile, one eye has very different z than the other
            left_eye_x  = lp(33)[0]
            right_eye_x = lp(263)[0]
            eye_spread  = abs(right_eye_x - left_eye_x)

            # Z-based detection: get z coords of outer eye corners
            lz = landmarks[33].get('z', 0)   if isinstance(landmarks[33], dict) else 0
            rz = landmarks[263].get('z', 0)  if isinstance(landmarks[263], dict) else 0
            z_diff = abs(lz - rz)

            # Also check nose tip vs eye center alignment (angled face)
            eye_center_x = (left_eye_x + right_eye_x) / 2.0
            nose_tip_x   = lp(1)[0]
            nose_offset  = abs(nose_tip_x - eye_center_x) / max(eye_spread, 1)

            # Profile if: eyes very close OR z-depth very different OR nose heavily offset
            is_profile = (eye_spread < (w * 0.18)) or (z_diff > 0.12) or (nose_offset > 0.30)
            print(f"[Rhinoplasty v42] DETECTION eye_spread={eye_spread:.1f} z_diff={z_diff:.3f} nose_offset={nose_offset:.3f} is_profile={is_profile}")

            # ?? CAPS ??
            MAX_LIFT   = h * 0.038
            MAX_NARROW = w * 0.020
            MAX_BRIDGE = w * 0.025
            MAX_HUMP   = h * 0.040

            nose_cx = lp(1)[0]
            yy2, xx2 = np.mgrid[0:h, 0:w].astype(np.float32)

            # ?? SHARED: tight nose mask + hard lip guard ??
            nc_x      = float(lp(1)[0])
            nc_y      = float((lp(168)[1] + lp(2)[1]) / 2.0)
            nr_x      = w * 0.060
            nr_y      = h * 0.090
            nose_mask = np.exp(
                -((xx2 - nc_x)**2 / (2*nr_x**2)) -
                 ((yy2 - nc_y)**2 / (2*nr_y**2))
            ).astype(np.float32)
            subnase_y = float(lp(2)[1]) - 2
            lip_guard = np.clip(1.0 - (yy2 - subnase_y) / (h * 0.03), 0, 1)
            nose_mask = nose_mask * lip_guard

            ny_top = float(lp(168)[1]) - 3
            ny_bot = float(lp(2)[1])
            nose_h = max(ny_bot - ny_top, 1)
            t_arr  = np.clip((yy2 - ny_top) / nose_h, 0, 1)

            # ========================================
            # PROFILE MODE
            # ========================================
            if is_profile:
                warp_kwargs = dict(sigma_move_frac=0.018,
                                   sigma_anchor_frac=0.012,
                                   anchor_strength=78)

                # Freeze: eyes, cheeks, forehead, jaw, lips
                for i in [33,133,263,362,234,454,130,359,
                          10,151,9,21,251,136,365,172,397,
                          152,58,288,149,150,148,377,378,379]:
                    anc(i)
                for i in [61,291,0,13,14,15,16,17,
                          37,267,39,269,40,270,81,311,82,312,
                          87,317,88,318,84,314,86,316,76,306,
                          185,409,191,415,180,404,164]:
                    anc(i)

                # Determine which side face is pointing
                # nose_tip_x vs image center tells us direction
                img_center_x = w / 2.0
                face_dir = 1 if nose_cx > img_center_x else -1  # 1=facing left, -1=facing right
                # push direction: inward = toward face center
                push_dir = -face_dir  # push nose bridge INWARD

                # Landmark warp: bridge landmarks pushed inward (hump reduction)
                hump_in = min(w * 0.016 * mult, MAX_NARROW)
                for i in [6, 197, 195, 5]:
                    mv(i, push_dir * hump_in * 0.85, 0)
                for i in [168]:
                    mv(i, push_dir * hump_in * 0.35, 0)

                # Tip: slight upward + slight inward rotation
                tip_up = min(h * 0.025 * mult, MAX_LIFT)
                tip_in = min(w * 0.015 * mult, MAX_NARROW * 0.4)
                for i in [1, 4]:
                    mv(i, push_dir * tip_in, -tip_up)
                for i in [2, 94, 19]:
                    mv(i, push_dir * tip_in * 0.5, -tip_up * 0.6)

                # Pixel-level: push bridge pixels inward along nose height
                hs   = np.sin(np.clip((t_arr - 0.05) / 0.55, 0, 1) * np.pi)
                dx2  = np.clip(w * 0.028 * mult * hs * push_dir,
                               -MAX_NARROW, MAX_NARROW).astype(np.float32)
                dx2 *= nose_mask

                # Tip pixel push (radial, tight)
                tip_cy = float(lp(1)[1]); tip_cx_val = float(lp(1)[0])
                tip_r  = h * 0.042
                d_tip  = np.sqrt((xx2-tip_cx_val)**2 + (yy2-tip_cy)**2)
                t_fade = (np.clip(1.0 - d_tip/tip_r, 0, 1)**2 *
                          (d_tip < tip_r).astype(np.float32))
                # Tip: small upward + inward
                dy2  = np.clip(-h*0.010*mult*t_fade, -MAX_LIFT*0.4, 0).astype(np.float32)
                dy2 *= nose_mask
                

                dx2 = cv2.GaussianBlur(dx2, (41, 41), 0)
                dy2 = cv2.GaussianBlur(dy2, (41, 41), 0)
                map_xr = np.clip(xx2 - dx2, 0, w-1).astype(np.float32)
                map_yr = np.clip(yy2 - dy2, 0, h-1).astype(np.float32)
                img = cv2.remap(img, map_xr, map_yr,
                                interpolation=cv2.INTER_LINEAR,
                                borderMode=cv2.BORDER_REFLECT_101)
                print(f"[Profile] face_dir={face_dir} push_dir={push_dir} hump_in={hump_in:.1f}px")

            # ========================================
            # FRONTAL MODE
            # ========================================
            # ========================================
            # FRONTAL MODE (FIXED NATURAL VERSION)
            # ========================================
            else:
                warp_kwargs = dict(
                    sigma_move_frac=0.014,
                    sigma_anchor_frac=0.012,
                    anchor_strength=95
                )

                # Strong anchors
                freeze_pts = [
                    33,133,160,159,158,157,173,153,144,
                    263,362,387,386,385,384,398,373,380,
                    234,454,116,345,130,359,93,323,
                    10,151,9,21,251,162,389,
                    61,291,0,13,14,15,16,17,
                    37,267,39,269,40,270,
                    81,311,82,312,87,317,
                    88,318,84,314,86,316,
                    185,409,191,415,
                    152,148,149,150,377,378,379
                ]

                for i in freeze_pts:
                    anc(i)

                # -------------------------------------------------
                # NATURAL NOSE NARROWING
                # -------------------------------------------------

                narrow = min(w * 0.020 * mult, MAX_NARROW)

                LEFT_SIDE  = [64, 98, 97, 2]
                RIGHT_SIDE = [294, 327, 326, 2]

                for i in LEFT_SIDE:
                    if i < len(landmarks):
                        mv(i, +narrow * 0.55, 0)

                for i in RIGHT_SIDE:
                    if i < len(landmarks):
                        mv(i, -narrow * 0.55, 0)

                # Bridge refinement
                bridge_narrow = min(w * 0.010 * mult, MAX_BRIDGE)

                for i in [6, 197, 195, 5]:
                    d = lp(i)[0] - nose_cx

                    mv(
                        i,
                        -np.sign(d) * bridge_narrow,
                        0
                    )

                # -------------------------------------------------
                # TIP LIFT (SOFT)
                # -------------------------------------------------

                tip_lift = min(h * 0.018 * mult, MAX_LIFT)

                for i in [1, 4]:
                    mv(i, 0, -tip_lift)

                for i in [2, 94]:
                    mv(i, 0, -tip_lift * 0.55)

                # -------------------------------------------------
                # PIXEL REMAP (SYMMETRIC)
                # -------------------------------------------------

                center_dist = (xx2 - nose_cx)

                side_falloff = np.exp(
                    -(center_dist**2) / (2 * (w * 0.035)**2)
                ).astype(np.float32)

                vertical_shape = np.sin(
                    np.clip((t_arr - 0.05) / 0.70, 0, 1) * np.pi
                ).astype(np.float32)

                inward_dir = -np.sign(center_dist)

                dx2 = (
                    inward_dir *
                    side_falloff *
                    vertical_shape *
                    (w * 0.010 * mult)
                ).astype(np.float32)

                dx2 *= nose_mask

                # Smaller tip-only lift
                tip_cx = float(lp(1)[0])
                tip_cy = float(lp(1)[1])

                d_tip = np.sqrt(
                    (xx2 - tip_cx)**2 +
                    (yy2 - tip_cy)**2
                )

                tip_mask = np.clip(
                    1.0 - d_tip / (h * 0.040),
                    0,
                    1
                ) ** 2

                dy2 = (
                    -h * 0.012 * mult *
                    tip_mask
                ).astype(np.float32)

                dy2 *= nose_mask

                # MUCH smoother
                dx2 = cv2.GaussianBlur(dx2, (31, 31), 0)
                dy2 = cv2.GaussianBlur(dy2, (31, 31), 0)

                map_xr = np.clip(xx2 - dx2, 0, w - 1).astype(np.float32)
                map_yr = np.clip(yy2 - dy2, 0, h - 1).astype(np.float32)

                img = cv2.remap(
                    img,
                    map_xr,
                    map_yr,
                    interpolation=cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT_101
                )

                print("[Rhinoplasty FIXED] Natural frontal reshape applied")

                print(f"[Rhinoplasty FIXED] effective_intensity={intensity}")
        # ======================================================
        # LIP FILLERS  - "Lip Fillers" (non-surgical)
        # Hyaluronic acid: soft, rounded, even volume. Natural pout.
        # ======================================================
        elif "lip fillers" in fl:
            warp_kwargs = dict(sigma_move_frac=0.026, sigma_anchor_frac=0.013,
                               anchor_strength=70)
            for i in LIP_FREEZE:
                anc(i)

            # UPPER: even rounded lift - all points proportional -> pillowy soft
            su = h * 0.065 * mult
            for i in [0,13]:              mv(i, 0, -su*1.00)   # center
            for i in [37,267]:            mv(i, 0, -su*0.92)   # inner arc
            for i in [39,269,40,270]:     mv(i, 0, -su*0.80)   # mid
            for i in [81,311,82,312]:     mv(i, 0, -su*0.65)   # outer
            for i in [185,409]:           mv(i, 0, -su*0.40)   # near corners
            for i in [191,415]:           mv(i, 0, -su*0.50)   # body thickness

            # LOWER: even forward puff - rounded fullness
            # lower lip damping at high intensity
            if intensity <= 50:
                lower_mult = mult
            else:
                extra = (intensity - 50) / 50.0
                lower_mult = mult * (1.0 - extra * 0.28)

            sl = h * 0.055 * lower_mult
            for i in [17,16]:             mv(i, 0, +sl*1.00)
            for i in [14,15]:             mv(i, 0, +sl*0.90)
            for i in [87,317,88,318]:     mv(i, 0, +sl*0.75)
            for i in [84,314,180,404]:    mv(i, 0, +sl*0.50)
            for i in [316,86]:            mv(i, 0, +sl*0.45)

            # Corners: very slight inward -> no duck-lip
            cin = w * 0.003 * mult
            mid_x = w / 2.0
            for i in [61,291]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, cin if px < mid_x else -cin, 0)

        # ======================================================
        # LIP AUGMENTATION - "Lip Augmentation" (surgical)
        # Cupid's bow, commissuroplasty, philtrum sharpening.
        # ======================================================
        elif "lip augmentation" in fl:
            warp_kwargs = dict(sigma_move_frac=0.022, sigma_anchor_frac=0.012,
                               anchor_strength=75)
            for i in LIP_FREEZE:
                anc(i)

            su = h * 0.075 * mult

            # UPPER: defined Cupid's bow - bow peaks = center, valley less
            for i in [0]:               mv(i, 0, -su*1.00)   # philtrum center
            for i in [13]:              mv(i, 0, -su*0.95)
            for i in [37,267]:          mv(i, 0, -su*1.00)   # bow peaks = max
            for i in [39,269]:          mv(i, 0, -su*0.50)   # valley less = bow defined
            for i in [40,270]:          mv(i, 0, -su*0.42)
            for i in [81,311,82,312]:   mv(i, 0, -su*0.28)
            for i in [185,409]:         mv(i, 0, -su*0.12)
            for i in [191,415]:         mv(i, 0, -su*0.38)

            # LOWER: surgical elongation + forward projection
            # prevent stretched surgical lower lip
            if intensity <= 50:
                lower_mult = mult
            else:
                extra = (intensity - 50) / 50.0
                lower_mult = mult * (1.0 - extra * 0.32)
            
            sl = h * 0.060 * lower_mult
            for i in [17,16]:           mv(i, 0, +sl*1.00)
            for i in [14,15]:           mv(i, 0, +sl*0.85)
            for i in [87,317,88,318]:   mv(i, 0, +sl*0.60)
            for i in [84,314,180,404]:  mv(i, 0, +sl*0.32)
            for i in [316,86]:          mv(i, 0, +sl*0.38)

            # COMMISSUROPLASTY: corners go UP + slightly outward
            cl  = h * 0.014 * mult
            co  = w * 0.007 * mult
            mid_x = w / 2.0
            for i in [61,291]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, -co if px < mid_x else co, -cl)

            # Philtrum subnasal - slight upward for column definition
            if 164 < len(landmarks):
                mv(164, 0, -su*0.28)

        # ======================================================
        # JAWLINE FILLERS - "Jawline Fillers" (non-surgical)
        # Hyaluronic acid along jawline: angular definition,
        # side projection, no aggressive slimming.
        # ======================================================
        elif "jawline fillers" in fl:
            warp_kwargs = dict(sigma_move_frac=0.055, sigma_anchor_frac=0.035,
                               anchor_strength=12.0)

            # Freeze: eyes, nose, mouth, top of face - only jaw moves
            for i in [234,454,116,345,187,411,
                      50,280,33,263,1,4,10,
                      21,251,162,389,130,359,
                      61,291,152]:
                anc(i)

            mid_x = w / 2.0

            # Filler effect: project sides outward (volume along jaw angle)
            # and very slightly downward for fuller jaw look
            proj_out  = w * 0.028 * mult   # outward projection
            proj_down = h * 0.008 * mult   # slight downward (volume, not lift)

            # Lateral jaw (volume zones - widest effect)
            for i in [172, 136, 150, 149, 176]:      # left side jaw
                if i < len(landmarks):
                    mv(i, -proj_out * 1.00, proj_down * 0.6)
            for i in [397, 365, 379, 378, 400]:      # right side jaw
                if i < len(landmarks):
                    mv(i, +proj_out * 1.00, proj_down * 0.6)

            # Mid jaw - less projection (tapers toward chin)
            for i in [148, 377]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, -proj_out*0.55 if px < mid_x else proj_out*0.55, proj_down*0.3)

            # Angle of jaw (gonion area) - most projection for angularity
            for i in [288, 58]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, -proj_out*1.20 if px < mid_x else proj_out*1.20, proj_down*0.4)

            # Chin area - minimal, just blends
            for i in [152, 32, 262]:
                mv(i, 0, proj_down * 0.2)

        # ======================================================
        # JAWLINE SURGERY - "Jawline Surgery" (surgical)
        # Bone shaving / implant simulation:
        # Aggressive V-line slimming, jaw taper, chin projection.
        # ======================================================
        elif "jawline surgery" in fl or "jaw surgery" in fl:

            # HARD CAP AFTER 50
            # SOFT CAP (continues increasing after 50 but slower)
            if intensity <= 50:
                jaw_mult = get_mult(intensity)
            else:
                extra = (intensity - 50) / 50.0
                jaw_mult = get_mult(50) * (1.0 + extra * 0.35)

            warp_kwargs = dict(
                sigma_move_frac=0.065,
                sigma_anchor_frac=0.028,
                anchor_strength=10
            )

            # Strong upper-face anchors
            for i in [
                234,454,116,345,187,411,
                50,280,33,263,1,4,10,
                21,251,162,389,130,359,
                61,291,13,14,152
            ]:
                anc(i)

            mid_x = w / 2.0

            # REDUCED aggressive slimming
            slim_in = w * 0.055 * jaw_mult
            slim_up = h * 0.016 * jaw_mult

            # Main jaw contour
            LEFT_JAW  = [172,136,150,149,176]
            RIGHT_JAW = [397,365,379,378,400]

            for i in LEFT_JAW:
                mv(i, +slim_in, -slim_up * 0.55)

            for i in RIGHT_JAW:
                mv(i, -slim_in, -slim_up * 0.55)

            # Gonial angle taper (reduced)
            for i in [58,288]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(
                        i,
                        slim_in * 1.00 if px < mid_x else -slim_in * 1.00,
                        -slim_up * 0.20
                    )

            # Mid jaw softer blend
            for i in [148,377]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(
                        i,
                        slim_in * 0.35 if px < mid_x else -slim_in * 0.35,
                        0
                    )

            # Chin projection MUCH smaller
            chin_proj = h * 0.018 * jaw_mult

            for i in [152]:
                mv(i, 0, chin_proj)

            for i in [32,262]:
                mv(i, 0, chin_proj * 0.35)

        # ======================================================
        # CHIN AUGMENTATION  (unchanged)
        # ======================================================
        elif "chin" in fl:

            # SOFT CAP (visible after 50 but stable)
            if intensity <= 50:
                chin_mult = get_mult(intensity)
            else:
                extra = (intensity - 50) / 50.0
                chin_mult = get_mult(50) * (1.0 + extra * 0.45)

            warp_kwargs = dict(
                sigma_move_frac=0.060,
                sigma_anchor_frac=0.030,
                anchor_strength=14
            )

            # Stable anchors
            for i in [
                136,365,172,397,58,288,
                61,291,1,4,33,263,10,
                234,454,93,323
            ]:
                anc(i)

            # Main chin projection
            proj = h * 0.075 * chin_mult

            # Chin center (strongest)
            mv(152, 0, +proj)

            # Surrounding chin structure
            for i in [148,149,150]:
                mv(i, 0, +proj * 0.72)

            for i in [377,378,379]:
                mv(i, 0, +proj * 0.72)

            # Jaw transition blending
            for i in [32,262]:
                mv(i, 0, +proj * 0.42)

            # VERY slight inward taper for implant realism
            taper = w * 0.010 * chin_mult

            mv(172, +taper, 0)
            mv(397, -taper, 0)

        # ======================================================
        # DERMAL FILLERS - cheek volume  (unchanged)
        # ======================================================
        elif "dermal fillers" in fl or ("dermal" in fl and "jaw" not in fl):
            warp_kwargs = dict(
                sigma_move_frac=0.075,
                sigma_anchor_frac=0.022,
                anchor_strength=65        # kam anchoring = zyada movement
            )

            for i in [33,263,133,362,159,386,
                      1,2,4,5,6,168,
                      61,291,13,14,17,
                      10,151,9,
                      152,58,288,
                      234,454,130,359]:
                anc(i)

            lift  = h * 0.032 * mult     # 0.055 -> 0.032
            out   = w * 0.028 * mult     # 0.045 -> 0.028
            

            # LEFT CHEEK
            for i in [116,117,118,119,120,121,47,126,217,174]:
                if i < len(landmarks):
                    mv(i, -out * 0.90, -lift * 1.00)

            # RIGHT CHEEK
            for i in [345,346,347,348,349,350,277,355,437,398]:
                if i < len(landmarks):
                    mv(i, +out * 0.90, -lift * 1.00)

            # LEFT mid-cheek
            for i in [205,187,123,50,203]:
                if i < len(landmarks):
                    mv(i, -out * 0.60, -lift * 0.70)

            # RIGHT mid-cheek
            for i in [425,411,352,280,423]:
                if i < len(landmarks):
                    mv(i, +out * 0.60, -lift * 0.70)

            # NASOLABIAL FOLD
            for i in [92,186,212]:
                if i < len(landmarks):
                    mv(i, -out * 0.40, -lift * 0.35)
            for i in [322,410,432]:
                if i < len(landmarks):
                    mv(i, +out * 0.40, -lift * 0.35)

            # UNDER-EYE
            for i in [110,111,112,113,114,115]:
                if i < len(landmarks):
                    mv(i, -out * 0.30, -lift * 0.50)
            for i in [339,340,341,342,343,344]:
                if i < len(landmarks):
                    mv(i, +out * 0.30, -lift * 0.50)

            # Pixel bulge - stronger
            yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
            c1 = lp(116); c2 = lp(345)
            d1 = np.sqrt((xx-c1[0])**2 + (yy-c1[1])**2)
            d2 = np.sqrt((xx-c2[0])**2 + (yy-c2[1])**2)
            cf = (np.exp(-d1**2/(2*(h*0.15)**2)) +
                  np.exp(-d2**2/(2*(h*0.15)**2)))
            cf = cf / (cf.max() + 1e-6)
            bulge = cf * (8.0 * mult)    

            img = cv2.remap(img,
                            (xx + bulge * 0.70).astype(np.float32),
                            (yy - bulge * 0.55).astype(np.float32),
                            interpolation=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_REFLECT_101)
        # ======================================================
        # BUCCAL FAT REMOVAL  (unchanged)
        # ======================================================
        elif "buccal" in fl or "fat" in fl:
            warp_kwargs = dict(sigma_move_frac=0.08, sigma_anchor_frac=0.04,
                               anchor_strength=16)
            for i in [234,454,116,345,187,411,1,4,33,263,10,130,359]:
                anc(i)
            raw_up = h*0.06*mult; raw_in = w*0.05*mult
            mid_x  = w/2.0
            for i in [152,148,149,150,377,378,379]:
                mv(i, 0, -raw_up*0.5)
            for i in [172,136,212,432,288,361,323]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, raw_in if px < mid_x else -raw_in, 0)

        # ======================================================
        # NECK (unchanged)
        # ======================================================
        elif "neck" in fl:
            warp_kwargs = dict(sigma_move_frac=0.08, sigma_anchor_frac=0.04,
                               anchor_strength=16)
            for i in [234,454,116,345,187,411,1,4,33,263,10,130,359]:
                anc(i)
            raw_up = h*0.06*mult; raw_in = w*0.05*mult
            mid_x  = w/2.0
            for i in [152,148,149,150,377,378,379]:
                mv(i, 0, -raw_up*0.5)
            for i in [172,136,212,432,288,361,323]:
                if i < len(landmarks):
                    px = lp(i)[0]
                    mv(i, raw_in if px < mid_x else -raw_in, 0)

        # ======================================================
        # APPLY WARP
        # ======================================================
        if move_pts:
            img = local_gaussian_warp(
                img, move_pts, move_dxy, anchors, h, w, **warp_kwargs)

        img = apply_clinical_skin_treatment(
            img, mask_cv2, feature, landmarks, intensity)

        buf = io.BytesIO()
        Image.fromarray(img).save(buf, format="JPEG", quality=92)
        return f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"

    except Exception as e:
        print(f"[SimEngine v39] Error: {e}")
        import traceback; traceback.print_exc()
        buf = io.BytesIO()
        original_image.save(buf, format="JPEG")
        return f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"