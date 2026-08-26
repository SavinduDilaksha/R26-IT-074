

from typing import Dict, Any
from firebase.client import upload


def upload_latest(payload: Dict[str, Any]) -> bool:
   
    clean_payload = {}
    for key in ["temperature", "ph", "turbidity", "ionconcentration"]:
        item = payload.get(key)
        if isinstance(item, dict):
            clean_payload[key] = item.get("value")
        elif item is not None:
            clean_payload[key] = item

    return upload("sensors/latest", clean_payload)
