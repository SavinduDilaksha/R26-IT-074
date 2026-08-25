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
