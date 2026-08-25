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



