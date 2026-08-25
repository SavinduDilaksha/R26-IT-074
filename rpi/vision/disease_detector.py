import json
from typing import Dict, Any, Optional
import numpy as np
from config import (
    DISEASE_CLASSES_PATH,
    DISEASE_MODEL_ONNX_PATH,
)
from utils.logger import get_logger

LOG = get_logger(__name__)
