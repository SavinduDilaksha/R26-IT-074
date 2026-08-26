"""Single Main Orchestrator for the Smart Aquarium Monitoring System on Raspberry Pi 4B.

Executes all monitoring, ML inference, disease detection, hunger feeding, water quality prediction,
and cloud synchronization sequentially in a simple, clean, linear loop.
Prints clear real-time progress to the terminal and saves all state to JSON.
"""

import os
import math
import time
from datetime import datetime, timezone
from typing import Dict, Any, List

import cv2
import numpy as np
from config import (
    DATA_DIR,
    TOP_REGION_PERCENT,
    BOTTOM_REGION_PERCENT,
)
from health.watchdog import Watchdog
from storage.json_store import load_json, save_json
from utils.logger import get_logger

# Module imports
from vision.side_camera import SideCamera
from vision.top_camera import TopCamera
from vision.fish_tracker import FishTracker
from vision.fish_behavior import BehaviorAnalyzer
from vision.disease_detector import DiseaseDetector
from vision.hunger_detector import detect as detect_hunger
from ml.water_quality_predictor import WaterQualityPredictor
from ml.stress_classifier import (
    classify as classify_stress,
    classify_stress as classify_fish_stress,
    classify_tank_stress,
)
from ml.shap_explainer import explain as explain_shap
from ml.disease_fusion import fuse as fuse_disease
from nlp.symptom_input import process as process_symptoms
from firebase.fetch_user_symptoms import fetch_user_symptom
from feeding.servo import FeederServo

from firebase.upload_sensor_data import upload_latest as upload_sensor
from firebase.upload_behavior import upload_latest as upload_behavior
from firebase.upload_water_quality import upload_latest as upload_wq
from firebase.upload_disease import upload_latest as upload_disease
from firebase.upload_feeding import upload_latest as upload_feeding


from vision.fish_behavior import TrajectoryLogger, TrajectoryAnalyzer, BehaviorAnalyzer

LOG = get_logger(__name__)
WATCHDOG = Watchdog()

# Hardware & Model Component Instances
SIDE_CAMERA = SideCamera()
TOP_CAMERA = TopCamera()
FISH_TRACKER = FishTracker()
BEHAVIOR_ANALYZER = BehaviorAnalyzer()
TRAJECTORY_LOGGER = TrajectoryLogger()
TRAJECTORY_ANALYZER = TrajectoryAnalyzer()
DISEASE_DETECTOR = DiseaseDetector()
WQ_PREDICTOR = WaterQualityPredictor()
FEEDER_SERVO = FeederServo()


def print_banner():
    """Print clean startup header."""
    print("=" * 60)
    print(" Smart Aquarium Monitoring System — Master CLI")
    print("=" * 60)


FISH_STATES: Dict[int, Dict[str, Any]] = {}

def make_fish_state():
    """Create tracking state dictionary for a single fish."""
    return {
        "last": None, "cross": 0, "top": 0.0,
        "bottom": 0.0, "freeze": 0.0, "tracked": 0.0,
        "last_region": "middle", "current_bottom": 0.0,
        "longest_bottom": 0.0, "bottom_entries": 0,
        "surface_visits": 0, "last_top_visit_time": None,
        "top_visit_intervals": [], "immobility_events": 0,
        "current_immobile_seconds": 0.0
    }

def _draw_analysis_overlay(frame, tracks, remaining_secs, frame_count=0, current_fps=30.0):
    """Draw bounding boxes, region lines, fish IDs, countdown timer, FPS, and status HUD on frame."""
    vis = frame.copy()
    fh, fw = vis.shape[:2]

    top_line = int(fh * TOP_REGION_PERCENT)
    bottom_line = int(fh * (1.0 - BOTTOM_REGION_PERCENT))

    # ── Region boundary lines ──
    cv2.line(vis, (0, top_line), (fw, top_line), (255, 180, 0), 2)
    cv2.putText(vis, "TOP FEEDING REGION", (12, max(20, top_line - 8)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 180, 0), 1, cv2.LINE_AA)

    cv2.line(vis, (0, bottom_line), (fw, bottom_line), (0, 140, 255), 2)
    cv2.putText(vis, "BOTTOM DWELLING REGION", (12, min(fh - 10, bottom_line + 18)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 140, 255), 1, cv2.LINE_AA)

    # ── Draw per-fish bounding boxes & ID tags ──
    for fish in tracks:
        bbox = fish.get("bbox")
        tid = fish.get("fish_id", 1)
        conf = fish.get("confidence", 1.0)

        if bbox and len(bbox) == 4:
            x1, y1, x2, y2 = map(int, bbox)
            x1, y1 = max(0, min(x1, fw - 1)), max(0, min(y1, fh - 1))
            x2, y2 = max(0, min(x2, fw - 1)), max(0, min(y2, fh - 1))
            cy = (y1 + y2) / 2.0

            # Region tag
            if cy < top_line:
                reg_name = "Top Zone"
                box_color = (0, 255, 255)
            elif cy > bottom_line:
                reg_name = "Bottom Zone"
                box_color = (0, 165, 255)
            else:
                reg_name = "Middle Zone"
                box_color = (0, 255, 0)

            # 1. Draw colored bounding box
            cv2.rectangle(vis, (x1, y1), (x2, y2), box_color, 2)

            # 2. Draw Fish label & Region tags with auto boundary flip (without ID number)
            tag_line1 = f"Fish ({int(conf * 100)}%)"
            tag_line2 = reg_name

            text_y1 = y1 - 20 if y1 >= 45 else y2 + 18
            text_y2 = y1 - 5 if y1 >= 45 else y2 + 34

            cv2.putText(vis, tag_line1, (x1, text_y1), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 3, cv2.LINE_AA)
            cv2.putText(vis, tag_line1, (x1, text_y1), cv2.FONT_HERSHEY_SIMPLEX, 0.45, box_color, 1, cv2.LINE_AA)

            cv2.putText(vis, tag_line2, (x1, text_y2), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 0, 0), 3, cv2.LINE_AA)
            cv2.putText(vis, tag_line2, (x1, text_y2), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (230, 230, 230), 1, cv2.LINE_AA)

    # ── Header Banner HUD ──
    mins = int(remaining_secs // 60)
    secs = int(remaining_secs % 60)
    timer_text = f"Time Left: {mins:02d}:{secs:02d}"

    # Top-left Title
    cv2.putText(vis, "Live 3-Min Fish Trajectory Logging", (10, 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(vis, f"Live Video Feed | Logged Frames: {frame_count}", (10, 52),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 255, 200), 1, cv2.LINE_AA)

    # Top-right Countdown Timer & FPS readout
    cv2.putText(vis, timer_text, (fw - 220, 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.70, (0, 255, 255), 2, cv2.LINE_AA)
    cv2.putText(vis, f"FPS: {current_fps:.1f}", (fw - 220, 52),
                cv2.FONT_HERSHEY_SIMPLEX, 0.50, (200, 255, 255), 1, cv2.LINE_AA)

    return vis


def _draw_hunger_overlay(
    frame: np.ndarray,
    detections: List[Dict[str, Any]],
    current_count: int,
    avg_count: float,
    presence_ratio: float,
    remaining: float,
    fps: float,
) -> np.ndarray:
    """Draw Top Camera feeding HUD with LHS/RHS division, bounding boxes, stats, and FPS."""
    vis = frame.copy()
    fh, fw = vis.shape[:2]
    mid_x = fw // 2

    # 1. Subtle RHS Feeding Area Background Highlight
    overlay_roi = vis.copy()
    cv2.rectangle(overlay_roi, (mid_x, 0), (fw, fh), (0, 60, 0), -1)
    cv2.addWeighted(overlay_roi, 0.08, vis, 0.92, 0, vis)

    # 2. Vertical Division Line between LHS (Ignored) and RHS (Feeding Area)
    cv2.line(vis, (mid_x, 0), (mid_x, fh), (0, 220, 255), 2)

    # 3. Draw detected fish bounding boxes
    for det in detections:
        bbox = det.get("bbox")
        conf = det.get("confidence", 0.0)
        in_roi = det.get("in_feeding_roi", True)
        if bbox and len(bbox) == 4:
            x1, y1, x2, y2 = map(int, bbox)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(fw - 1, x2), min(fh - 1, y2)

            if in_roi:
                # Fish in RHS Feeding Area ROI (Actively counted for feeder)
                cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
                tag = f"Hungry Fish (ROI) {int(conf * 100)}%"
                cv2.putText(vis, tag, (x1, max(15, y1 - 6)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 0), 1, cv2.LINE_AA)
            else:
                # Fish in LHS (Ignored / Non-Feeding Area)
                cv2.rectangle(vis, (x1, y1), (x2, y2), (130, 130, 130), 1)
                tag = f"Ignored (LHS) {int(conf * 100)}%"
                cv2.putText(vis, tag, (x1, max(15, y1 - 6)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.40, (160, 160, 160), 1, cv2.LINE_AA)

    # 4. Bottom Zone Badges
    cv2.putText(vis, "LHS: NON-FEEDING ZONE (IGNORED)", (15, fh - 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (150, 150, 150), 1, cv2.LINE_AA)
    cv2.putText(vis, "RHS: FEEDING AREA (ACTIVE ROI)", (mid_x + 15, fh - 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)

    # 5. Top HUD Banner with semi-transparent background
    overlay = vis.copy()
    cv2.rectangle(overlay, (0, 0), (fw, 65), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, vis, 0.25, 0, vis)

    rem_m = int(remaining) // 60
    rem_s = int(remaining) % 60
    timer_str = f"{rem_m:02d}:{rem_s:02d}"

    # Line 1: Title & Timer & FPS
    cv2.putText(vis, "Step 3: Top Camera Hunger Monitoring (3 min)", (10, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.50, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(vis, f"Remaining: {timer_str} | {fps:.1f} FPS", (fw - 230, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1, cv2.LINE_AA)

    # Line 2: Real-Time Stats (Showing RHS Feeding ROI fish count)
    stats_str = f"Feeding ROI Fish: {current_count} (RHS only) | 3-Min Avg: {avg_count:.2f} | Surface Attendance: {presence_ratio * 100:.1f}%"
    status_color = (0, 255, 0) if presence_ratio >= 0.30 and avg_count >= 0.5 else (200, 200, 200)
    cv2.putText(vis, stats_str, (10, 48),
                cv2.FONT_HERSHEY_SIMPLEX, 0.44, status_color, 1, cv2.LINE_AA)

    return vis


def _draw_disease_overlay(
    frame: np.ndarray,
    remaining: float,
    next_snapshot_in: float,
    samples_taken: int,
    total_samples: int,
    latest_diagnosis: str,
    latest_conf: float,
    fps: float,
) -> np.ndarray:
    """Render HUD overlay for 3-minute disease observation stream with 256x256 center ROI."""
    vis = frame.copy()
    fh, fw = vis.shape[:2]

    # ── Center 256x256 ROI Bounding Box ──
    roi_size = 256
    cx, cy = fw // 2, fh // 2
    rx1 = max(0, cx - roi_size // 2)
    ry1 = max(0, cy - roi_size // 2)
    rx2 = min(fw, rx1 + roi_size)
    ry2 = min(fh, ry1 + roi_size)

    # Draw centered 256x256 ROI target box
    roi_color = (0, 255, 255)  # Cyan/Yellow target box
    cv2.rectangle(vis, (rx1, ry1), (rx2, ry2), roi_color, 2)

    # Draw high-visibility corner accents
    tick_len = 16
    cv2.line(vis, (rx1, ry1), (rx1 + tick_len, ry1), (0, 255, 255), 3)
    cv2.line(vis, (rx1, ry1), (rx1, ry1 + tick_len), (0, 255, 255), 3)
    cv2.line(vis, (rx2, ry1), (rx2 - tick_len, ry1), (0, 255, 255), 3)
    cv2.line(vis, (rx2, ry1), (rx2, ry1 + tick_len), (0, 255, 255), 3)
    cv2.line(vis, (rx1, ry2), (rx1 + tick_len, ry2), (0, 255, 255), 3)
    cv2.line(vis, (rx1, ry2), (rx1, ry2 - tick_len), (0, 255, 255), 3)
    cv2.line(vis, (rx2, ry2), (rx2 - tick_len, ry2), (0, 255, 255), 3)
    cv2.line(vis, (rx2, ry2), (rx2, ry2 - tick_len), (0, 255, 255), 3)

    # ROI Label Tag
    roi_tag = "DISEASE ROI (256x256)"
    (tw, th), _ = cv2.getTextSize(roi_tag, cv2.FONT_HERSHEY_SIMPLEX, 0.40, 1)
    tag_y = max(ry1 - 6, 80)
    cv2.rectangle(vis, (rx1, tag_y - th - 4), (rx1 + tw + 8, tag_y + 2), (20, 20, 20), -1)
    cv2.putText(vis, roi_tag, (rx1 + 4, tag_y - 2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, roi_color, 1, cv2.LINE_AA)

    # Top HUD Banner with semi-transparent background
    overlay = vis.copy()
    cv2.rectangle(overlay, (0, 0), (fw, 68), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.75, vis, 0.25, 0, vis)

    rem_m = int(remaining) // 60
    rem_s = int(remaining) % 60
    timer_str = f"{rem_m:02d}:{rem_s:02d}"

    # Line 1: Title & Timer & FPS
    cv2.putText(vis, "Step 2: Side Camera Disease Observation (3 min)", (10, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(vis, f"Remaining: {timer_str} | {fps:.1f} FPS", (fw - 230, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1, cv2.LINE_AA)

    # Line 2: Snapshot Status & Latest Diagnosis
    status_str = f"Photos: {samples_taken}/{total_samples} (Next in {max(0, int(next_snapshot_in))}s) | Latest: {latest_diagnosis} ({int(latest_conf * 100)}%)"
    status_color = (0, 255, 120) if "healthy" in latest_diagnosis.lower() else (0, 165, 255)
    cv2.putText(vis, status_str, (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, status_color, 1, cv2.LINE_AA)

    return vis


def stage_sensors_and_stress():
    """Stage 1: Read sensors, log 3-minute continuous fish movements to disk, then perform post-session stress analysis."""
    print("\n[1/5] Reading Sensors & Starting 3-Minute Visual Observation...")

    # ── 1. Read Sensors (once at the start) ──
    try:
        from sensors.arduino_reader import read as read_arduino
        arduino_readings = read_arduino()
    except Exception as exc:
        LOG.warning("Arduino serial read failed: %s", exc)
        ts = datetime.now(timezone.utc).isoformat()
        arduino_readings = {
            "temperature": {"value": None, "unit": "C", "timestamp": ts, "error": str(exc)},
            "ph":          {"value": None, "unit": "pH", "timestamp": ts, "error": str(exc)},
            "turbidity":   {"value": None, "unit": "NTU", "timestamp": ts, "error": str(exc)},
        }

    try:
        from sensors.ionconcentration_reader import read as read_ionconc
        ionconc_reading = read_ionconc()
    except Exception as exc:
        LOG.warning("Ion concentration read failed: %s", exc)
        ts = datetime.now(timezone.utc).isoformat()
        ionconc_reading = {"value": None, "unit": "us/cm", "timestamp": ts, "error": str(exc)}

    sensor_readings = {
        "temperature":      arduino_readings["temperature"],
        "ph":               arduino_readings["ph"],
        "turbidity":        arduino_readings["turbidity"],
        "ionconcentration": ionconc_reading,
    }
    save_json(DATA_DIR / "latest_sensor.json", sensor_readings)

    temp_val = sensor_readings['temperature'].get('value', 'N/A')
    ph_val = sensor_readings['ph'].get('value', 'N/A')
    turb_val = sensor_readings['turbidity'].get('value', 'N/A')
    ion_val = sensor_readings['ionconcentration'].get('value', 'N/A')
    print(f"  |-- Temp: {temp_val} C | pH: {ph_val} | Turbidity: {turb_val} NTU | Ion: {ion_val} uS/cm")

    # ── 2. Initialize Trajectory Logger ──
    log_file_path = DATA_DIR / "movement_log.jsonl"
    TRAJECTORY_LOGGER.start_session()

    # ── 3. Three-minute continuous visual observation at 30 FPS ──
    OBSERVATION_DURATION = 180   # 3 minutes
    TARGET_FPS = 30.0
    TARGET_FRAME_TIME = 1.0 / TARGET_FPS  # 33.3 ms per frame
    WINDOW_NAME = "AquaMonitor - Step 1: Live Observation (3 min @ 30 FPS)"

    # Ensure DISPLAY default for Linux desktop popups
    if os.name != "nt" and not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ["DISPLAY"] = ":0"

    can_display = os.environ.get("HEADLESS") != "1"
    if can_display:
        try:
            cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
            cv2.resizeWindow(WINDOW_NAME, 800, 500)
            cv2.waitKey(1)
        except Exception as exc:
            LOG.warning("Could not initialize desktop GUI popup window (%s): %s", WINDOW_NAME, exc)
            print(f"  |-- [NOTE] Live GUI window could not open: {exc}")
            if "not implemented" in str(exc).lower():
                print("  |   -> Fix: pip uninstall -y opencv-python-headless && pip install opencv-python")
            elif not os.environ.get("DISPLAY") or "display" in str(exc).lower():
                print("  |   -> Running via SSH? Connect an HDMI display, use VNC desktop, or run: DISPLAY=:0 python3 master.py")
            can_display = False

    start_time = time.time()
    frame_count = 0
    current_fps = 30.0
    last_frame_time = time.time()
    tracks = []
    frame_h = 480

    print(f"  |-- Logging fish movements to {log_file_path.name} for 3 minutes (press 'q' in window to finish early)...")

    try:
        while True:
            frame_start = time.time()
            elapsed = frame_start - start_time
            remaining = max(0.0, OBSERVATION_DURATION - elapsed)

            if elapsed >= OBSERVATION_DURATION:
                break

            # Capture frame
            frame = SIDE_CAMERA.read()
            if frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "CAMERA FEED UNAVAILABLE", (150, 240),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            frame_h = frame.shape[0]
            frame_w = frame.shape[1]
            frame_count += 1

            # Run YOLOv8 ONNX fish detection & tracking
            tracks = FISH_TRACKER.track(frame)

            # Append lightweight movement record to disk
            TRAJECTORY_LOGGER.log_frame(frame_start, tracks, frame_height=frame_h, frame_width=frame_w)

            # Dynamic loop timing control
            proc_duration = time.time() - frame_start
            wait_ms = max(1, int((TARGET_FRAME_TIME - proc_duration) * 1000))

            # 1. Generate annotated live preview frame
            vis_frame = _draw_analysis_overlay(
                frame, tracks, remaining, frame_count=frame_count, current_fps=current_fps
            )

            # 2. Persist latest frame for Web UI Live Model Preview
            try:
                cv2.imwrite(str(DATA_DIR / "latest_stress_frame.jpg"), vis_frame)
            except Exception:
                pass

            # 3. Display in desktop GUI window if graphical environment is available
            if can_display:
                try:
                    cv2.imshow(WINDOW_NAME, vis_frame)
                    key = cv2.waitKey(wait_ms) & 0xFF
                    if key == ord('q'):
                        print("  |-- Observation concluded by user.")
                        break
                except Exception:
                    can_display = False
                    time.sleep(wait_ms / 1000.0)
            else:
                time.sleep(wait_ms / 1000.0)

            # Compute smoothed moving average FPS
            actual_dt = time.time() - last_frame_time
            last_frame_time = time.time()
            if actual_dt > 0:
                current_fps = 0.9 * current_fps + 0.1 * (1.0 / actual_dt)

    except Exception as exc:
        LOG.warning("Visual observation loop error: %s", exc)
    finally:
        TRAJECTORY_LOGGER.close()
        if can_display:
            try:
                cv2.destroyWindow(WINDOW_NAME)
            except Exception:
                pass

    # ── 4. Post-Session Batch Analysis on Full 3-Minute Movement Log ──
    print(f"  |-- Video recording finished ({round(time.time() - start_time, 1)}s, {frame_count} frames).")
    print(f"  |-- Analyzing complete 3-minute movement timeline from {log_file_path.name}...")

    behavior_metrics = TRAJECTORY_ANALYZER.analyze_file(log_file_path, frame_height=frame_h)
    stress_results = classify_stress(behavior_metrics, sensor_readings)

    save_json(DATA_DIR / "latest_behavior.json", behavior_metrics)
    save_json(DATA_DIR / "latest_stress.json", stress_results)

    print("  |-- Behavioral analysis completed successfully")
    print(f"  |-- Bottom Ratio: {behavior_metrics.get('bottom_ratio', 0.0)*100:.0f}% | Surface Ratio: {behavior_metrics.get('surface_ratio', 0.0)*100:.0f}% | Freeze: {behavior_metrics.get('freeze_seconds', 0.0)}s")
    print(f"  +-- Tank Stress Score: {stress_results.get('tank_stress_score', 0)} ({stress_results.get('tank_stress_level', 'Healthy')}) | Fused: {stress_results.get('fused_stress_score', 0)} ({stress_results.get('fused_stress_level', 'Healthy')})")


def stage_disease():
    """Stage 2: 3-minute continuous Side Camera disease observation with snapshots every 30s & NLP symptom fusion."""
    print("\n[2/5] Disease Detection & Symptom Fusion (3-Minute Visual Monitoring)...")

    DISEASE_OBSERVATION_DURATION = 180  # 3 minutes
    SNAPSHOT_INTERVAL = 30.0            # Capture photo every 30 seconds
    TARGET_FPS = 30.0
    TARGET_FRAME_TIME = 1.0 / TARGET_FPS
    WINDOW_NAME = "AquaMonitor - Step 2: Disease Monitoring (3 min - Snapshot every 30s)"

    # Ensure snapshot output directory exists
    sample_dir = DATA_DIR / "disease_samples"
    sample_dir.mkdir(parents=True, exist_ok=True)

    # Ensure DISPLAY default for Linux desktop popups
    if os.name != "nt" and not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ["DISPLAY"] = ":0"

    can_display = os.environ.get("HEADLESS") != "1"
    if can_display:
        try:
            cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
            cv2.resizeWindow(WINDOW_NAME, 800, 500)
            cv2.waitKey(1)
        except Exception as exc:
            LOG.warning("Could not initialize disease GUI popup window (%s): %s", WINDOW_NAME, exc)
            can_display = False

    start_time = time.time()
    last_snapshot_time = -SNAPSHOT_INTERVAL  # Trigger first snapshot immediately at t=0
    sample_inferences: List[Dict[str, Any]] = []
    latest_diagnosis = "Scanning..."
    latest_conf = 0.0
    frame_count = 0
    current_fps = 30.0
    last_frame_time = time.time()
    total_planned_samples = int(DISEASE_OBSERVATION_DURATION // SNAPSHOT_INTERVAL)

    print(f"  |-- Opening Side Camera for 3 minutes (capturing photos every {int(SNAPSHOT_INTERVAL)}s)...")

    try:
        while True:
            frame_start = time.time()
            elapsed = frame_start - start_time
            remaining = max(0.0, DISEASE_OBSERVATION_DURATION - elapsed)

            if elapsed >= DISEASE_OBSERVATION_DURATION:
                break

            # Read live frame from Side Camera
            frame = SIDE_CAMERA.read()
            if frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "SIDE CAMERA FEED UNAVAILABLE", (130, 240),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv2.LINE_AA)

            frame_count += 1

            # ── Check if it's time to capture a 30-second snapshot ──
            time_since_last_snap = frame_start - last_snapshot_time
            next_snap_in = max(0.0, SNAPSHOT_INTERVAL - time_since_last_snap)

            if time_since_last_snap >= SNAPSHOT_INTERVAL and len(sample_inferences) < total_planned_samples:
                last_snapshot_time = frame_start
                snap_num = len(sample_inferences) + 1

                # ── Crop center 256x256 ROI for disease model ──
                fh, fw = frame.shape[:2]
                roi_size = 256
                cx, cy = fw // 2, fh // 2
                rx1 = max(0, cx - roi_size // 2)
                ry1 = max(0, cy - roi_size // 2)
                rx2 = min(fw, rx1 + roi_size)
                ry2 = min(fh, ry1 + roi_size)
                roi_crop = frame[ry1:ry2, rx1:rx2]

                # 1. Save sample photo and 256x256 ROI crop to disk
                snap_path = sample_dir / f"disease_sample_{snap_num}_{int(elapsed)}s.jpg"
                roi_snap_path = sample_dir / f"disease_roi_{snap_num}_{int(elapsed)}s.jpg"
                try:
                    cv2.imwrite(str(snap_path), frame)
                    cv2.imwrite(str(roi_snap_path), roi_crop)
                    cv2.imwrite(str(DATA_DIR / "latest_disease_sample.jpg"), roi_crop)
                except Exception:
                    pass

                # 2. Run ONNX disease model directly on the center 256x256 ROI crop
                det = DISEASE_DETECTOR.detect(roi_crop)

                latest_diagnosis = det.get("disease_class", "Healthy")
                latest_conf = float(det.get("confidence", 1.0))

                sample_inferences.append({
                    "sample_index": snap_num,
                    "elapsed_seconds": round(elapsed, 1),
                    "disease_class": latest_diagnosis,
                    "confidence": latest_conf,
                    "image_file": snap_path.name,
                    "roi_image_file": roi_snap_path.name,
                    "roi_bbox": [rx1, ry1, rx2, ry2],
                })

                print(f"  |-- [Photo {snap_num}/{total_planned_samples} @ {int(elapsed)}s] Center 256x256 ROI Diagnosis: {latest_diagnosis} ({int(latest_conf * 100)}%)")

            # Dynamic loop timing control
            proc_duration = time.time() - frame_start
            wait_ms = max(1, int((TARGET_FRAME_TIME - proc_duration) * 1000))

            # 1. Draw Disease HUD Preview
            vis_frame = _draw_disease_overlay(
                frame,
                remaining,
                next_snap_in,
                len(sample_inferences),
                total_planned_samples,
                latest_diagnosis,
                latest_conf,
                current_fps,
            )

            # 2. Persist latest frame for Web UI Live Model Preview
            try:
                cv2.imwrite(str(DATA_DIR / "latest_disease_frame.jpg"), vis_frame)
            except Exception:
                pass

            # 3. Desktop GUI Window
            if can_display:
                try:
                    cv2.imshow(WINDOW_NAME, vis_frame)
                    key = cv2.waitKey(wait_ms) & 0xFF
                    if key == ord('q'):
                        print("  |-- Disease observation finalized early by user.")
                        break
                except Exception:
                    can_display = False
                    time.sleep(wait_ms / 1000.0)
            else:
                time.sleep(wait_ms / 1000.0)

            actual_dt = time.time() - last_frame_time
            last_frame_time = time.time()
            if actual_dt > 0:
                current_fps = 0.9 * current_fps + 0.1 * (1.0 / actual_dt)

    except Exception as exc:
        LOG.warning("Disease observation loop error: %s", exc)
    finally:
        SIDE_CAMERA.close()
        if can_display:
            try:
                cv2.destroyWindow(WINDOW_NAME)
            except Exception:
                pass

    # ── 2. Aggregate 3-Minute Multi-Sample Visual Disease Inferences ──
    if sample_inferences:
        # Tally dominant diagnosis across the 6 snapshots
        from collections import Counter
        non_healthy_samples = [s for s in sample_inferences if "healthy" not in s["disease_class"].lower()]
        if non_healthy_samples:
            top_visual_disease = Counter(s["disease_class"] for s in non_healthy_samples).most_common(1)[0][0]
            top_conf = float(np.mean([s["confidence"] for s in non_healthy_samples if s["disease_class"] == top_visual_disease]))
        else:
            top_visual_disease = "Healthy Fish"
            top_conf = float(np.mean([s["confidence"] for s in sample_inferences]))
    else:
        top_visual_disease = "Healthy Fish"
        top_conf = 1.0

    vision_summary = {
        "disease_class": top_visual_disease,
        "confidence": round(top_conf, 3),
        "total_samples": len(sample_inferences),
        "sample_inferences": sample_inferences,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # ── 3. Fetch User Symptoms & Execute NLP Processing ──
    user_symptom_data = fetch_user_symptoms() if "fetch_user_symptoms" in globals() else fetch_user_symptom()
    symptom_text = user_symptom_data.get("text", "")
    nlp_results = process_symptoms(symptom_text)

    # ── 4. Fuse Visual Analysis + NLP Symptoms ──
    fused_result = fuse_disease(vision_summary, nlp_results)

    # ── 5. Save Vision, NLP, and Fused Outputs Separately ──
    save_json(DATA_DIR / "latest_disease_vision.json", vision_summary)
    save_json(DATA_DIR / "latest_disease_nlp.json", nlp_results)
    save_json(DATA_DIR / "latest_disease.json", fused_result)

    print(f"  |-- Visual Disease Consensus: {top_visual_disease} ({int(top_conf * 100)}% across {len(sample_inferences)} samples)")
    if symptom_text:
        print(f"  |-- User Symptoms: '{symptom_text}' -> NLP: {nlp_results.get('top_disease', 'Healthy Fish')}")
    else:
        print("  |-- User Symptoms: None reported (using pure visual diagnosis)")
    print(f"  +-- Final Fused Verdict: {fused_result.get('disease', 'Healthy Fish')} (Confidence: {int(fused_result.get('confidence', 1.0) * 100)}%)")


def stage_hunger_and_feeding():
    """Stage 3: Top view 3-minute continuous hunger monitoring, temporal averaging & automatic feeding."""
    # ── 1. Check Post-Dispense Cooldown Setting ──
    in_cooldown, remaining_secs = FEEDER_SERVO.is_in_cooldown()
    if in_cooldown:
        rem_mins = round(remaining_secs / 60.0, 1)
        print(f"\n[3/5] Top Camera Hunger Observation (Post-Feed Cooldown: {rem_mins} min remaining)...")
        print(f"  |-- Post-feeding cooldown active ({rem_mins}m / {int(remaining_secs)}s remaining).")
        print(f"  +-- Skipping feeding activity check until cooldown expires ({getattr(FEEDER_SERVO.config, 'post_feed_cooldown_minutes', 30)} min total).")
        hunger_summary = {
            "hungry_count": 0,
            "average_count": 0.0,
            "presence_ratio": 0.0,
            "is_truly_hungry": False,
            "hunger_level": "Cooldown",
            "confidence": 0.0,
            "observation_duration_seconds": 0.0,
            "frames_analyzed": 0,
            "cooldown_active": True,
            "cooldown_remaining_seconds": int(remaining_secs),
            "cooldown_total_minutes": getattr(FEEDER_SERVO.config, "post_feed_cooldown_minutes", 30),
            "source": "post_feed_cooldown_bypass",
        }
        save_json(DATA_DIR / "latest_hunger.json", hunger_summary)
        return

    print("\n[3/5] Top Camera Hunger Observation (3 min continuous monitoring)...")

    HUNGER_OBSERVATION_DURATION = 180  # 3 minutes
    TARGET_FPS = 30.0
    TARGET_FRAME_TIME = 1.0 / TARGET_FPS
    WINDOW_NAME = "AquaMonitor - Step 3: Top Camera Hunger Monitoring (3 min @ 30 FPS)"

    # Ensure DISPLAY default for Linux desktop popups
    if os.name != "nt" and not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ["DISPLAY"] = ":0"

    can_display = os.environ.get("HEADLESS") != "1"
    if can_display:
        try:
            cv2.namedWindow(WINDOW_NAME, cv2.WINDOW_NORMAL)
            cv2.resizeWindow(WINDOW_NAME, 800, 500)
            try:
                cv2.startWindowThread()
            except Exception:
                pass
        except Exception as exc:
            LOG.warning("Could not initialize desktop GUI popup window (%s): %s", WINDOW_NAME, exc)
            can_display = False

    start_time = time.time()
    sample_counts: List[int] = []
    sample_confidences: List[float] = []
    latest_detections: List[Dict[str, Any]] = []
    frame_count = 0
    current_fps = 30.0
    last_frame_time = time.time()
    actual_dt = 0.667

    print("  |-- Monitoring Top Camera for 3 minutes to evaluate sustained hunger (press 'q' in popup to skip)...")

    try:
        while True:
            frame_start = time.time()
            elapsed = frame_start - start_time
            remaining = max(0.0, HUNGER_OBSERVATION_DURATION - elapsed)

            if elapsed >= HUNGER_OBSERVATION_DURATION:
                break

            raw_frame = TOP_CAMERA.read()
            if raw_frame is None:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "TOP CAMERA FEED UNAVAILABLE", (130, 240),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2, cv2.LINE_AA)
                cv2.putText(frame, "Connect USB Camera 2 to enable feeding detection", (110, 275),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)
                latest_hunger_result = {
                    "hungry_fish_ids": [],
                    "hungry_count": 0,
                    "confidence": 0.0,
                    "hunger_level": "Normal",
                    "detections": [],
                }
            else:
                frame = raw_frame
                # Run Top Camera YOLOv8 hunger detection on real frame
                latest_hunger_result = detect_hunger(frame)

            frame_count += 1
            current_count = latest_hunger_result.get("hungry_count", 0)
            conf = latest_hunger_result.get("confidence", 0.0)
            latest_detections = latest_hunger_result.get("detections", [])

            sample_counts.append(current_count)
            if conf > 0:
                sample_confidences.append(conf)

            # Compute running stats
            running_avg = float(np.mean(sample_counts)) if sample_counts else 0.0
            presence_frames = sum(1 for c in sample_counts if c > 0)
            presence_ratio = (presence_frames / len(sample_counts)) if sample_counts else 0.0

            # Dynamic 30 FPS loop timing control
            proc_duration = time.time() - frame_start
            wait_ms = max(1, int((TARGET_FRAME_TIME - proc_duration) * 1000))

            # 1. Always generate annotated hunger inference preview frame
            vis_frame = _draw_hunger_overlay(
                frame,
                latest_detections,
                current_count,
                running_avg,
                presence_ratio,
                remaining,
                current_fps,
            )

            # 2. Persist latest frame for Web UI Live Model Preview
            try:
                cv2.imwrite(str(DATA_DIR / "latest_hunger_frame.jpg"), vis_frame)
            except Exception:
                pass

            # 3. Display in desktop GUI window if graphical environment is available
            if can_display:
                try:
                    cv2.imshow(WINDOW_NAME, vis_frame)
                    key = cv2.waitKey(wait_ms) & 0xFF
                    if key == ord('q'):
                        print("  |-- Hunger observation finalized early by user.")
                        break
                except Exception:
                    can_display = False
                    time.sleep(wait_ms / 1000.0)
            else:
                time.sleep(wait_ms / 1000.0)

            actual_dt = time.time() - last_frame_time
            last_frame_time = time.time()
            if actual_dt > 0:
                current_fps = 0.9 * current_fps + 0.1 * (1.0 / actual_dt)

    except Exception as exc:
        LOG.warning("Top Camera hunger observation loop error: %s", exc)
    finally:
        TOP_CAMERA.close()
        if can_display:
            try:
                cv2.destroyWindow(WINDOW_NAME)
            except Exception:
                pass

    # ── 2. Calculate 3-minute Temporal Average & True Hunger Classification ──
    total_samples = len(sample_counts)
    if total_samples > 0:
        avg_hungry_count = float(np.mean(sample_counts))
        presence_frames = sum(1 for c in sample_counts if c > 0)
        presence_ratio = round(presence_frames / total_samples, 3)
        mean_confidence = round(float(np.mean(sample_confidences)), 3) if sample_confidences else 0.0
    else:
        avg_hungry_count = 0.0
        presence_ratio = 0.0
        mean_confidence = 0.0

    # Sustained surface attendance criteria:
    # Fish must be present at the top feeding zone for at least 30% of the 3-minute observation
    # with an average count of at least 0.5 fish to confirm genuine hunger.
    is_truly_hungry = (presence_ratio >= 0.30) and (avg_hungry_count >= 0.5)

    if is_truly_hungry:
        final_hungry_count = max(1, min(4, int(round(avg_hungry_count))))
        hunger_level = (
            "Low" if final_hungry_count == 1
            else ("Moderate" if final_hungry_count == 2
                  else "High")
        )
    else:
        final_hungry_count = 0
        hunger_level = "Normal"

    observation_secs = round(time.time() - start_time, 1)

    # Compile 3-minute temporal hunger report
    hunger_summary = {
        "hungry_count": final_hungry_count,
        "average_count": round(avg_hungry_count, 2),
        "presence_ratio": presence_ratio,
        "is_truly_hungry": is_truly_hungry,
        "hunger_level": hunger_level,
        "confidence": mean_confidence,
        "observation_duration_seconds": observation_secs,
        "frames_analyzed": total_samples,
        "source": "top_cam_yolov8_temporal_average",
    }
    save_json(DATA_DIR / "latest_hunger.json", hunger_summary)

    # ── 3. Feeder Servo Dispense ──
    feed_result = FEEDER_SERVO.dispense(final_hungry_count)
    save_json(DATA_DIR / "latest_feed.json", feed_result)

    print(f"  |-- Observation Complete: {observation_secs}s ({total_samples} frames sampled)")
    print(f"  |-- Avg Surface Fish: {avg_hungry_count:.2f} | Surface Attendance: {presence_ratio * 100:.1f}%")
    print(f"  |-- Hunger Status: {'CONFIRMED HUNGRY' if is_truly_hungry else 'NOT HUNGRY (Transient/Normal)'} (Count: {final_hungry_count}, Level: {hunger_level})")
    if feed_result.get("dispensed", False):
        cooldown_mins = getattr(FEEDER_SERVO.config, "post_feed_cooldown_minutes", 30)
        print(f"  +-- Dispensed Portion: True (Rounds: {feed_result.get('rounds', 0)}) -> Cooldown active: no feeding activity checks for {cooldown_mins} mins.")
    else:
        print(f"  +-- Dispensed Portion: False (Rounds: 0)")


def stage_water_quality_and_shap():
    """Stage 4: ML Water Quality prediction & SHAP XAI explanation."""
    print("\n[4/5] Water Quality Prediction & SHAP Explanation...")
    sensor_data = load_json(DATA_DIR / "latest_sensor.json", default={})
    prediction = WQ_PREDICTOR.predict(sensor_data)
    save_json(DATA_DIR / "latest_water_quality.json", prediction)

    shap_result = explain_shap(prediction)
    save_json(DATA_DIR / "latest_shap.json", shap_result)

    print(f"  |-- Water Quality: {prediction.get('water_quality', 'Good')}")
    print(f"  +-- Est. Hours until Water Change: {prediction.get('estimated_hours_until_water_change', 'N/A')}")


def stage_firebase_sync():
    """Stage 5: Upload all JSON states to Firebase Realtime Database."""
    print("\n[5/5] Uploading State to Firebase Cloud...")
    sensor_data = load_json(DATA_DIR / "latest_sensor.json", default={})
    behavior_data = load_json(DATA_DIR / "latest_behavior.json", default={})
    stress_data = load_json(DATA_DIR / "latest_stress.json", default={})
    disease_data = load_json(DATA_DIR / "latest_disease.json", default={})
    wq_data = load_json(DATA_DIR / "latest_water_quality.json", default={})
    shap_data = load_json(DATA_DIR / "latest_shap.json", default={})
    hunger_data = load_json(DATA_DIR / "latest_hunger.json", default={})
    feed_data = load_json(DATA_DIR / "latest_feed.json", default={})

    if sensor_data:
        upload_sensor(sensor_data)
    if behavior_data or stress_data:
        upload_behavior({"behavior": behavior_data, "stress": stress_data})
    if disease_data:
        upload_disease(disease_data)
    if wq_data or shap_data:
        upload_wq({"water_quality": wq_data, "shap": shap_data})
    if feed_data or hunger_data:
        upload_feeding({"feed": feed_data, "hunger": hunger_data})

    print("  +-- Firebase synchronization completed.")


def run_stage(stage_name: str, func):
    """Execute a single pipeline stage inside Watchdog monitoring."""
    save_json(DATA_DIR / "latest_pipeline_stage.json", {"active_stage": stage_name, "timestamp": datetime.now(timezone.utc).isoformat()})
    with WATCHDOG.monitor(stage_name):
        func()


def main():
    """Single main loop calling all python scripts one by one."""
    import argparse
    parser = argparse.ArgumentParser(description="AquaMonitor Master Orchestrator")
    parser.add_argument("--reset-cooldown", action="store_true", help="Clear post-feed cooldown timer before starting")
    parser.add_argument("--skip-cooldown", action="store_true", help="Bypass all post-feeding cooldown checks")
    parser.add_argument("--once", action="store_true", help="Run a single monitoring cycle and exit")
    args, _ = parser.parse_known_args()

    print_banner()

    if args.reset_cooldown:
        FEEDER_SERVO.reset_cooldown()
        print("[INFO] Feeder cooldown timer has been cleared.")

    if args.skip_cooldown:
        FEEDER_SERVO.reset_cooldown()
        FEEDER_SERVO.config.post_feed_cooldown_minutes = 0
        print("[INFO] Feeder cooldown bypassed for this session.")

    LOG.info("Starting Master Sequential Pipeline...")

    stages = [
        ("sensors_and_stress", stage_sensors_and_stress),
        ("disease_detection", stage_disease),
        ("hunger_and_feeding", stage_hunger_and_feeding),
        ("water_quality_shap", stage_water_quality_and_shap),
        ("firebase_sync", stage_firebase_sync),
    ]

    cycle_count = 1
    while True:
        print(f"\n==================== Cycle #{cycle_count} ({datetime.now().strftime('%H:%M:%S')}) ====================")
        for stage_name, stage_func in stages:
            run_stage(stage_name, stage_func)
            time.sleep(0.5)
        
        WATCHDOG.check_health()

        if args.once:
            print("\n[INFO] Single cycle completed (--once specified). Exiting.")
            break

        cycle_count += 1
        time.sleep(1.0)


if __name__ == "__main__":
    main()
