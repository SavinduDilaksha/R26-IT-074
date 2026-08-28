

import json
import os
import tempfile
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Union


_lock = threading.RLock()

#add
def _inject_timestamp(data: Any) -> Any:
    
    if isinstance(data, dict) and "timestamp" not in data:
        return {**data, "timestamp": datetime.now(timezone.utc).isoformat()}
    return data


def save_json(path: Union[Path, str], data: Any) -> None:
  
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True, mode=0o777)
    payload = _inject_timestamp(data)

    with _lock:
        try:
            fd, temp_name = tempfile.mkstemp(dir=target.parent, suffix=".tmp")
        except PermissionError:
            fd, temp_name = tempfile.mkstemp(suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2, default=str)
                handle.flush()
                os.fsync(handle.fileno())
            
            try:
                os.replace(temp_name, target)
            except OSError:
                import shutil
                try:
                    shutil.move(temp_name, target)
                except PermissionError:
                   
                    if target.exists():
                        try:
                            target.unlink()
                            shutil.move(temp_name, target)
                        except Exception:
                            
                            with open(target, "w", encoding="utf-8") as f:
                                json.dump(payload, f, indent=2, default=str)
        except Exception:
            if os.path.exists(temp_name):
                try:
                    os.unlink(temp_name)
                except OSError:
                    pass
            
            try:
                with open(target, "w", encoding="utf-8") as f:
                    json.dump(payload, f, indent=2, default=str)
            except Exception:
                raise


def load_json(path: Union[Path, str], default: Any = None) -> Any:
    
    target = Path(path)
    with _lock:
        if not target.exists():
            return default
        try:
            with target.open("r", encoding="utf-8") as handle:
                return json.load(handle)
        except (json.JSONDecodeError, OSError):
            
            backup = target.with_suffix(target.suffix + ".bak")
            if backup.exists():
                try:
                    with backup.open("r", encoding="utf-8") as handle:
                        return json.load(handle)
                except (json.JSONDecodeError, OSError):
                    pass
            return default


def append_json(path: Union[Path, str], data: Any) -> None:
    
    items = load_json(path, [])
    if not isinstance(items, list):
        items = [items]
    items.append(_inject_timestamp(data))
    save_json(path, items)


def backup_json(path: Union[Path, str]) -> Optional[Path]:
   
    source = Path(path)
    if not source.exists():
        return None
    data = load_json(source)
    if data is None:
        return None
    backup = source.with_suffix(source.suffix + ".bak")
    save_json(backup, data)
    return backup
