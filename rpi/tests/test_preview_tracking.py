


import sys
import os
import time
import argparse
from pathlib import Path
import cv2
import numpy as np


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config import SIDE_CAMERA_INDEX, FISH_CONFIDENCE, TOP_REGION_PERCENT, BOTTOM_REGION_PERCENT
from vision.fish_tracker import FishTracker


def parse_args():
    parser = argparse.ArgumentParser(description="Standalone Side Camera Fish Tracker & Preview")
    parser.add_argument("--camera", type=int, default=SIDE_CAMERA_INDEX, help="Camera device index (default: 0)")
    parser.add_argument("--conf", type=float, default=FISH_CONFIDENCE, help="YOLO confidence threshold (default: 0.20)")
    parser.add_argument("--width", type=int, default=640, help="Capture width (default: 640)")
    parser.add_argument("--height", type=int, default=480, help="Capture height (default: 480)")
    return parser.parse_args()


def open_camera(index: int, width: int, height: int) -> cv2.VideoCapture:
    """Open camera with V4L2 backend on Linux or default backend on Windows."""
    print(f"[INFO] Opening Camera device index {index}...")
    
    
    if os.name != "nt":
        cap = cv2.VideoCapture(index, cv2.CAP_V4L2)
    else:
        cap = cv2.VideoCapture(index)

    if not cap or not cap.isOpened():
        cap = cv2.VideoCapture(index)

    if not cap or not cap.isOpened():
        print(f"[ERROR] Could not open camera at index {index}.")
        print("[TIP] Check connected video devices with: ls -l /dev/video*")
        sys.exit(1)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    cap.set(cv2.CAP_PROP_FPS, 30)
    print(f"[OK] Camera {index} opened successfully ({width}x{height}).")
    return cap


def main():
    args = parse_args()

  
    if os.name != "nt" and not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ["DISPLAY"] = ":0"

    print("=" * 65)
    print("   AquaMonitor — Live YOLOv8 Fish Tracking & Preview")
    print("=" * 65)

   
    print(f"[INFO] Loading YOLOv8 ONNX Fish Detector (Confidence: {args.conf})...")
    tracker = FishTracker()

   
    cap = open_camera(args.camera, args.width, args.height)

    
    window_name = "AquaMonitor - Live Fish Tracking (Press 'q' or ESC to Exit)"
    try:
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.resizeWindow(window_name, 800, 560)
        cv2.waitKey(1)
    except Exception as exc:
        print(f"[WARN] Desktop GUI window initialization warning: {exc}")
        print("[TIP] If running over SSH, run with: DISPLAY=:0 python3 test_preview_tracking.py")

    fps = 30.0
    last_time = time.time()
    frame_count = 0

    print("\n[READY] Streaming video... Press 'q' or 'ESC' in the window to stop.\n")

    try:
        while True:
            t0 = time.time()
            ok, frame = cap.read()
            if not ok or frame is None:
                print("[WARN] Failed to read frame from camera.")
                time.sleep(0.05)
                continue

            frame_count += 1
            fh, fw = frame.shape[:2]
            vis = frame.copy()

            
            tracks = tracker.track(frame)

          
            top_line = int(fh * TOP_REGION_PERCENT)
            bottom_line = int(fh * (1.0 - BOTTOM_REGION_PERCENT))

            cv2.line(vis, (0, top_line), (fw, top_line), (255, 180, 0), 2)
            cv2.putText(vis, "TOP FEEDING REGION", (12, max(20, top_line - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 180, 0), 1, cv2.LINE_AA)

            cv2.line(vis, (0, bottom_line), (fw, bottom_line), (0, 140, 255), 2)
            cv2.putText(vis, "BOTTOM DWELLING REGION", (12, min(fh - 10, bottom_line + 18)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 140, 255), 1, cv2.LINE_AA)

           
            for fish in tracks:
                fid = fish.get("fish_id", 1)
                bbox = fish.get("bbox", [])
                conf = fish.get("confidence", 1.0)
                traj = fish.get("trajectory", [])

                if bbox and len(bbox) == 4:
                    x1, y1, x2, y2 = map(int, bbox)
                    x1, y1 = max(0, min(x1, fw - 1)), max(0, min(y1, fh - 1))
                    x2, y2 = max(0, min(x2, fw - 1)), max(0, min(y2, fh - 1))
                    cy = (y1 + y2) / 2.0

                   
                    if cy < top_line:
                        box_color = (0, 255, 255) 
                        zone_label = "Top"
                    elif cy > bottom_line:
                        box_color = (0, 165, 255)  
                        zone_label = "Bottom"
                    else:
                        box_color = (0, 255, 0)  
                        zone_label = "Middle"

                  
                    cv2.rectangle(vis, (x1, y1), (x2, y2), box_color, 2)

                 
                    tag = f"Fish ({int(conf * 100)}%) [{zone_label}]"
                    text_y = y1 - 8 if y1 >= 25 else y2 + 18
                    cv2.putText(vis, tag, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 3, cv2.LINE_AA)
                    cv2.putText(vis, tag, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, box_color, 1, cv2.LINE_AA)

               
                if len(traj) > 1:
                    for i in range(1, len(traj)):
                        pt1 = (int(traj[i - 1][0]), int(traj[i - 1][1]))
                        pt2 = (int(traj[i][0]), int(traj[i][1]))
                        cv2.line(vis, pt1, pt2, (0, 255, 255), 1, cv2.LINE_AA)

           
            hud = vis.copy()
            cv2.rectangle(hud, (0, 0), (fw, 42), (20, 20, 20), -1)
            cv2.addWeighted(hud, 0.65, vis, 0.35, 0, vis)

            cv2.putText(vis, "Live Fish Detection", (12, 26),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 0), 1, cv2.LINE_AA)
            cv2.putText(vis, f"FPS: {fps:.1f} | Frame: {frame_count}", (fw - 180, 26),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 255, 255), 1, cv2.LINE_AA)

           
            try:
                cv2.imshow(window_name, vis)
                key = cv2.waitKey(1) & 0xFF
                if key in (ord('q'), ord('Q'), 27):  # 'q' or ESC
                    print("\n[INFO] Exiting preview...")
                    break
            except Exception as exc:
                print(f"[ERROR] GUI display error: {exc}")
                break

           
            dt = time.time() - last_time
            last_time = time.time()
            if dt > 0:
                fps = 0.9 * fps + 0.1 * (1.0 / dt)

    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user (Ctrl+C).")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("[OK] Camera released and windows closed cleanly.")


if __name__ == "__main__":
    main()
