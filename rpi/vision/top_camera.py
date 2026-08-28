"""Top Camera (Camera 2) hardware capture module for feeder / hunger monitoring.

Strictly interfaces with physical Camera 2 device (V4L2 on Linux, default on Windows).
Returns None when hardware camera is not connected (no fake/synthetic video fallbacks).
"""

import os
import threading
from typing import Optional
import cv2
import numpy as np

from config import TOP_CAMERA_INDEX
from utils.logger import get_logger

LOG = get_logger(__name__)


class TopCamera:
    """Manages Camera 2 top-view hardware video capture stream without synthetic fallbacks."""

    def __init__(self, index: int = TOP_CAMERA_INDEX):
        self.index = index
        self.capture: Optional[cv2.VideoCapture] = None
        self._lock = threading.Lock()
        self._failed_hw = False

    def _open_unlocked(self) -> None:
        """Open hardware camera capture device (caller must hold self._lock)."""
        if self.index is None or self._failed_hw:
            return

        if self.capture is None or not self.capture.isOpened():
            try:
                if os.name != 'nt':
                    self.capture = cv2.VideoCapture(self.index, cv2.CAP_V4L2)
                else:
                    self.capture = cv2.VideoCapture(self.index)

                if not self.capture or not self.capture.isOpened():
                    self.capture = cv2.VideoCapture(self.index)

                if not self.capture or not self.capture.isOpened():
                    LOG.warning("Top Camera (index %s) is not connected / unavailable.", self.index)
                    self._failed_hw = True
                    self.capture = None
                else:
                    LOG.info("Top Camera opened on index %s", self.index)
            except Exception as exc:
                LOG.warning("Failed to open Top Camera (index %s): %s", self.index, exc)
                self.capture = None
                self._failed_hw = True

    def open(self) -> None:
        """Open camera capture device if not already open."""
        with self._lock:
            self._open_unlocked()

    def read(self) -> Optional[np.ndarray]:
        """Read a frame from physical Top Camera 2.

        Returns BGR numpy array if physical camera is connected and readable, else None.
        """
        with self._lock:
            if not self._failed_hw:
                self._open_unlocked()
                if self.capture and self.capture.isOpened():
                    ok, frame = self.capture.read()
                    if ok and frame is not None:
                        return frame
                    else:
                        LOG.warning("Top Camera frame read failed. Device marked unavailable.")
                        self._failed_hw = True

            return None

    def close(self) -> None:
        """Release camera hardware resources."""
        with self._lock:
            if self.capture:
                try:
                    self.capture.release()
                except Exception:
                    pass
                self.capture = None
                LOG.info("Top Camera closed.")
            self._failed_hw = False

#add