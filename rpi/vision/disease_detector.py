import json
from typing import Dict, Any, Optional
import numpy as np
from config import (
    DISEASE_CLASSES_PATH,
    DISEASE_MODEL_ONNX_PATH,
)
from utils.logger import get_logger

LOG = get_logger(__name__)

class DiseaseDetector:
    """ONNX Runtime session manager for side-view fish disease classification."""

    def __init__(self):
        self.session = None
        self.classes = None
        self.input_name: str = ""
        self.input_shape: tuple = (224, 224)  # (H, W) — updated on load
        self._load_attempted: bool = False

    def _load(self) -> bool:
        """Lazy-load ONNX model and class label mappings."""
        if self.session is not None:
            return True
        if self._load_attempted:
            return False
        self._load_attempted = True

        if not DISEASE_MODEL_ONNX_PATH.exists():
            LOG.warning("Disease ONNX model not found: %s", DISEASE_MODEL_ONNX_PATH)
            return False
        if not DISEASE_CLASSES_PATH.exists():
            LOG.warning("Disease class_names.json not found: %s", DISEASE_CLASSES_PATH)
            return False

        try:
            import onnxruntime as ort

            self.classes = json.loads(DISEASE_CLASSES_PATH.read_text(encoding="utf-8"))

            opts = ort.SessionOptions()
            opts.intra_op_num_threads = 4
            opts.inter_op_num_threads = 1
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

            self.session = ort.InferenceSession(
                str(DISEASE_MODEL_ONNX_PATH),
                sess_options=opts,
                providers=["CPUExecutionProvider"],
            )

            meta = self.session.get_inputs()[0]
            self.input_name = meta.name
            # shape: [batch, H, W, C] or [batch, C, H, W]
            shape = meta.shape
            if len(shape) == 4:
                if shape[1] in (1, 3):   # NCHW
                    self.input_shape = (int(shape[2]), int(shape[3]))
                else:                     # NHWC
                    self.input_shape = (int(shape[1]), int(shape[2]))
            LOG.info(
                "Disease ONNX model loaded: %s  input=%s  classes=%d",
                DISEASE_MODEL_ONNX_PATH.name,
                self.input_shape,
                len(self.classes) if self.classes else 0,
            )
            return True

        except Exception as exc:
            LOG.error("Failed to initialise disease ONNX session: %s", exc)
            return False


    def detect(
        self,
        frame,
        fish_id: Optional[int] = None,
        tracks: Optional[list] = None,
        use_roi: Optional[bool] = None,
    ) -> Dict[str, Any]:
        
        if frame is None:
            return {"fish_id": fish_id, "disease_class": "Healthy", "confidence": 1.0, "per_fish_diseases": []}

        if tracks and (use_roi or use_roi is None):
            return self.detect_from_tracks(frame, tracks)

        if not self._load():
            return {
                "fish_id": fish_id,
                "disease_class": "Healthy",
                "confidence": 1.0,
                "note": "ONNX model not available",
                "per_fish_diseases": [],
            }

            



