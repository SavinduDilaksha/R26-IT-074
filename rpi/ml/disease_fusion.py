from typing import Dict, Any
from utils.logger import get_logger

LOG = get_logger(__name__)


def fuse(vision_data: Dict[str, Any] = None, nlp_data: Dict[str, Any] = None) -> Dict[str, Any]:
