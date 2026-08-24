"""Fish Behaviour Analysis & Trajectory Logging Module.

Features a decoupled 2-stage architecture:
1. TrajectoryLogger: Real-time, ultra-lightweight logging of tracked fish coordinates
   and bounding boxes to a disk file (movement_log.jsonl) during the 3-minute monitoring window.
2. TrajectoryAnalyzer: Comprehensive post-session time-series analysis that reconstructs
   the complete 3-minute timeline per fish, computing exact zone dwell times, surface visits,
   freezing episodes, velocity metrics, and behavioral stress indicators.
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

from config import TOP_REGION_PERCENT, BOTTOM_REGION_PERCENT, DATA_DIR
from utils.logger import get_logger

LOG = get_logger(__name__)

DEFAULT_LOG_PATH = DATA_DIR / "movement_log.jsonl"


class TrajectoryLogger:
    """Appends lightweight timestamped tracking records to disk during video observation."""

    def __init__(self, log_path: Path = DEFAULT_LOG_PATH):
        self.log_path = Path(log_path)
        self._file = None
        self.total_records = 0

    def start_session(self) -> None:
        """Create or truncate the trajectory log file for a new monitoring session."""
        self.close()
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self._file = open(self.log_path, "w", encoding="utf-8", buffering=1)  # Line-buffered
        self.total_records = 0
        LOG.info("Trajectory logging session started: %s", self.log_path.name)

    def log_frame(
        self,
        timestamp: float,
        tracks: List[Dict[str, Any]],
        frame_height: int = 480,
        frame_width: int = 640,
    ) -> None:
        """Log all detected fish in the current frame."""
        if self._file is None or self._file.closed:
            return

        top_line = frame_height * TOP_REGION_PERCENT
        bottom_line = frame_height * (1.0 - BOTTOM_REGION_PERCENT)

        for track in tracks:
            fid = track.get("fish_id", 0)
            cx, cy = track.get("center", (0.0, 0.0))
            bbox = track.get("bbox", [])
            conf = track.get("confidence", 1.0)

            # Determine region
            if cy < top_line:
                region = "top"
            elif cy > bottom_line:
                region = "bottom"
            else:
                region = "middle"

            record = {
                "t": round(timestamp, 3),
                "id": fid,
                "x": round(float(cx), 2),
                "y": round(float(cy), 2),
                "bbox": [round(float(v), 1) for v in bbox] if bbox else [],
                "conf": round(float(conf), 2),
                "reg": region,
            }
            self._file.write(json.dumps(record) + "\n")
            self.total_records += 1

    def close(self) -> None:
        """Flush and close the open trajectory log file."""
        if self._file and not self._file.closed:
            self._file.flush()
            self._file.close()
            LOG.info("Trajectory logging session closed (%d records written).", self.total_records)
        self._file = None


class TrajectoryAnalyzer:
    """Performs full post-session time-series analysis on the 3-minute movement log."""

    def __init__(self, top_ratio: float = TOP_REGION_PERCENT, bottom_ratio: float = BOTTOM_REGION_PERCENT):
        self.top_ratio = top_ratio
        self.bottom_ratio = bottom_ratio

    def analyze_file(self, log_path: Path = DEFAULT_LOG_PATH, frame_height: int = 480) -> Dict[str, Any]:
        """Read the logged trajectory file and calculate complete behavioral metrics.

        Returns standard dictionary formatted for ml/stress_classifier.py and UI dashboards.
        """
        log_path = Path(log_path)
        if not log_path.exists() or log_path.stat().st_size == 0:
            LOG.warning("Trajectory file %s is empty or missing.", log_path.name)
            return self._empty_result()

        # Group records by fish ID
        fish_trajectories: Dict[int, List[Dict[str, Any]]] = {}
        frame_timestamps = set()

        try:
            with open(log_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    rec = json.loads(line)
                    fid = rec.get("id", 1)
                    fish_trajectories.setdefault(fid, []).append(rec)
                    frame_timestamps.add(rec["t"])
        except Exception as exc:
            LOG.error("Failed to read trajectory log %s: %s", log_path.name, exc)
            return self._empty_result()

        if not fish_trajectories:
            return self._empty_result()

        # Sort chronological records per fish
        for fid in fish_trajectories:
            fish_trajectories[fid].sort(key=lambda r: r["t"])

        fish_details = []
        total_bottom_time = 0.0
        total_top_time = 0.0
        total_tracked_time = 0.0

        for fid, records in fish_trajectories.items():
            if len(records) < 2:
                continue

            metrics = self._analyze_single_fish(records)
            fish_details.append(metrics)

            total_bottom_time += metrics["bottom_seconds"]
            total_top_time += metrics["top_seconds"]
            total_tracked_time += metrics["tracked_seconds"]

        if not fish_details:
            return self._empty_result()

        fish_count = len(fish_details)
        bottom_ratio = total_bottom_time / max(total_tracked_time, 1e-6)
        surface_ratio = total_top_time / max(total_tracked_time, 1e-6)

        avg_freeze = float(np.mean([f["freeze_seconds"] for f in fish_details]))
        max_bottom_dwell = float(np.max([f["longest_bottom_seconds"] for f in fish_details]))
        avg_surface_freq = float(np.mean([f["surface_visits"] for f in fish_details]))
        total_crossings = int(np.sum([f["crossings"] for f in fish_details]))

        # Calculate shoaling cohesion from co-occurring frames
        shoaling_score = self._compute_shoaling_score(fish_trajectories, frame_height)

        return {
            "fish_count": fish_count,
            "bottom_ratio": round(float(np.clip(bottom_ratio, 0.0, 1.0)), 2),
            "surface_ratio": round(float(np.clip(surface_ratio, 0.0, 1.0)), 2),
            "freeze_seconds": round(avg_freeze, 1),
            "erratic_events": total_crossings,
            "shoaling_score": shoaling_score,
            "continuous_bottom_duration": round(max_bottom_dwell, 1),
            "surface_visit_frequency": round(avg_surface_freq, 1),
            "fish_details": fish_details,
        }

    def _analyze_single_fish(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute 9-feature behavioral profile for a single tracked fish."""
        fid = records[0]["id"]
        latest_bbox = records[-1].get("bbox", [])
        latest_conf = records[-1].get("conf", 1.0)
        latest_reg = records[-1].get("reg", "middle")

        tracked_seconds = 0.0
        top_seconds = 0.0
        bottom_seconds = 0.0
        freeze_seconds = 0.0
        total_distance = 0.0

        # Dynamic state trackers
        current_bottom_duration = 0.0
        longest_bottom_seconds = 0.0
        bottom_entries = 0

        surface_visits = 0
        last_top_visit_time = None
        top_visit_intervals: List[float] = []

        current_immobile_seconds = 0.0
        immobility_events = 0
        crossings = 0
        last_region = records[0].get("reg", "middle")

        for i in range(1, len(records)):
            prev = records[i - 1]
            curr = records[i]

            dt = max(0.01, curr["t"] - prev["t"])
            # Cap dt to 3.0s in case of tracking gaps
            if dt > 3.0:
                dt = 0.5
            tracked_seconds += dt

            # Distance & velocity
            disp = math.hypot(curr["x"] - prev["x"], curr["y"] - prev["y"])
            total_distance += disp

            # 1. Immobility & Freezing Detection (< 5.0 px displacement)
            if disp < 5.0:
                current_immobile_seconds += dt
                # Requires >= 10.0 continuous seconds of immobility
                if current_immobile_seconds >= 10.0:
                    freeze_seconds += dt
                    # Increment event count once at the 10-second crossing threshold
                    if (current_immobile_seconds - dt) < 10.0:
                        immobility_events += 1
            else:
                current_immobile_seconds = 0.0

            # 2. Region Tracking & Transitions
            reg = curr.get("reg", "middle")
            prev_reg = prev.get("reg", "middle")

            if reg == "top":
                top_seconds += dt
                current_bottom_duration = 0.0
                if prev_reg != "top":
                    surface_visits += 1
                    if last_top_visit_time is not None:
                        interval = tracked_seconds - last_top_visit_time
                        top_visit_intervals.append(interval)
                    last_top_visit_time = tracked_seconds

            elif reg == "bottom":
                bottom_seconds += dt
                current_bottom_duration += dt
                if current_bottom_duration > longest_bottom_seconds:
                    longest_bottom_seconds = current_bottom_duration
                if prev_reg != "bottom":
                    bottom_entries += 1
            else:
                current_bottom_duration = 0.0

            # 3. Crossing / Erratic Swimming Events
            if reg != prev_reg and reg != "middle" and prev_reg != "middle":
                crossings += 1

        avg_top_interval = float(np.mean(top_visit_intervals)) if top_visit_intervals else 0.0

        return {
            "fish_id": fid,
            "bbox": latest_bbox,
            "confidence": latest_conf,
            "region": latest_reg,
            "tracked_seconds": round(tracked_seconds, 1),
            "top_seconds": round(top_seconds, 1),
            "bottom_seconds": round(bottom_seconds, 1),
            "freeze_seconds": round(freeze_seconds, 1),
            "longest_bottom_seconds": round(longest_bottom_seconds, 1),
            "bottom_entries": bottom_entries,
            "surface_visits": surface_visits,
            "time_between_top_visits": round(avg_top_interval, 1),
            "immobility_events": immobility_events,
            "crossings": crossings,
            "total_distance": round(total_distance, 1),
            "mean_speed": round(total_distance / max(tracked_seconds, 1e-6), 2),
        }

    def _compute_shoaling_score(
        self,
        fish_trajectories: Dict[int, List[Dict[str, Any]]],
        frame_height: int,
    ) -> float:
        """Compute shoaling cohesion score based on proximity across co-occurring frames."""
        # Index coordinates by rounded timestamp (0.5s bins)
        time_bins: Dict[float, List[tuple]] = {}
        for fid, records in fish_trajectories.items():
            for rec in records:
                tb = round(rec["t"] * 2.0) / 2.0
                time_bins.setdefault(tb, []).append((rec["x"], rec["y"]))

        cohesion_samples = []
        for tb, pts in time_bins.items():
            if len(pts) >= 2:
                arr = np.array(pts)
                centroid = np.mean(arr, axis=0)
                mean_dist = float(np.mean(np.linalg.norm(arr - centroid, axis=1)))
                cohesion_samples.append(mean_dist)

        if cohesion_samples:
            avg_cohesion_dist = float(np.mean(cohesion_samples))
            return round(float(np.clip(1.0 - (avg_cohesion_dist / (frame_height * 1.5)), 0.0, 1.0)), 2)
        return 1.0

    def _empty_result(self) -> Dict[str, Any]:
        """Return standardized zeroed telemetry when no tracking data exists."""
        return {
            "fish_count": 0,
            "bottom_ratio": 0.0,
            "surface_ratio": 0.0,
            "freeze_seconds": 0.0,
            "erratic_events": 0,
            "shoaling_score": 1.0,
            "continuous_bottom_duration": 0.0,
            "surface_visit_frequency": 0.0,
            "fish_details": [],
        }


class BehaviorAnalyzer:
    """Legacy-compatible lightweight wrapper providing real-time live preview stats."""

    def __init__(self):
        self.logger = TrajectoryLogger()
        self.analyzer = TrajectoryAnalyzer()
        self.history: Dict[int, Dict[str, Any]] = {}

    def analyze(self, tracks: List[Dict[str, Any]], frame_height: int = 480, dt: float = 1.0) -> Dict[str, Any]:
        """Return instantaneous count and region distribution for live stream HUD."""
        count = len(tracks)
        if count == 0:
            return {
                "fish_count": 0,
                "bottom_ratio": 0.0,
                "surface_ratio": 0.0,
                "freeze_seconds": 0.0,
                "erratic_events": 0,
                "shoaling_score": 1.0,
                "continuous_bottom_duration": 0.0,
                "surface_visit_frequency": 0.0,
                "fish_details": [],
            }

        top_line = frame_height * TOP_REGION_PERCENT
        bottom_line = frame_height * (1.0 - BOTTOM_REGION_PERCENT)

        bottom_count = 0
        surface_count = 0
        for track in tracks:
            _, cy = track.get("center", (0.0, 0.0))
            if cy < top_line:
                surface_count += 1
            elif cy > bottom_line:
                bottom_count += 1

        return {
            "fish_count": count,
            "bottom_ratio": round(bottom_count / count, 2),
            "surface_ratio": round(surface_count / count, 2),
            "freeze_seconds": 0.0,
            "erratic_events": 0,
            "shoaling_score": 1.0,
            "continuous_bottom_duration": 0.0,
            "surface_visit_frequency": 0.0,
            "fish_details": [],
        }
