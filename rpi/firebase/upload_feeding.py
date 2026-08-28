

from typing import Dict, Any
from firebase.client import upload


def upload_latest(payload: Dict[str, Any]) -> bool:
   
    return upload("feeding/latest", payload)

#ssS