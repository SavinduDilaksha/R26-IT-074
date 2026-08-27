from typing import Dict, Any
from utils.logger import get_logger

LOG = get_logger(__name__)


def fuse(vision_data: Dict[str, Any] = None, nlp_data: Dict[str, Any] = None) -> Dict[str, Any]:

    vision_data = vision_data or {}
    nlp_data = nlp_data or {}

    v_class = vision_data.get("disease_class", "Healthy Fish")
    v_conf = float(vision_data.get("confidence", 0.0))

    symptom_probs = nlp_data.get("probabilities", {})



