import json
from typing import Dict, Any, List
from config import DISEASE_CLASSES_PATH
from utils.logger import get_logger

LOG = get_logger(__name__)

SYMPTOM_KNOWLEDGE_BASE = {
    "Bacterial Red disease": [
        "red spot", "red spots", "red patch", "ulcer", "bleeding", "red sores", "skin reddening", "red streak", "redness"
    ],
    "Bacterial diseases - Aeromoniasis": [
        "aeromonas", "pop eye", "popeye", "swollen belly", "dropsy", "exophthalmia", "hemorrhage", "fin erosion", "bloated"
    ],
    "Bacterial gill disease": [
        "gill", "gills", "swollen gills", "pale gills", "flared operculum", "gasping", "rapid breathing", "heavy respiration", "mucus on gills"
    ],
    "Fungal diseases Saprolegniasis": [
        "fungus", "fungal", "cotton", "cotton-like", "white tufts", "fuzzy patches", "saprolegnia", "mold", "fuzzy"
    ],
    "Parasitic diseases": [
        "ich", "white spot", "white spots", "flashing", "scratching", "rubbing", "velvet", "gold dust", "clamped fins", "parasite", "dots"
    ],
    "Viral diseases White tail disease": [
        "white tail", "tail whitening", "opaque tail", "muscle opacity", "viral", "tail rot", "white tail disease"
    ],
    "Healthy Fish": [
        "active", "normal", "healthy", "good appetite", "clear eyes", "vibrant", "smooth fins"
    ],
}

def load_disease_classes() -> List[str]:
    """Dynamically load disease class names from models/disease/class_names.json."""
    if DISEASE_CLASSES_PATH.exists():
        try:
            classes = json.loads(DISEASE_CLASSES_PATH.read_text(encoding="utf-8"))
            return classes
        except Exception as exc:
            LOG.warning("Failed to load class_names.json: %s", exc)
    return list(SYMPTOM_KNOWLEDGE_BASE.keys())


def _try_ml_model_prediction(text: str, official_classes: List[str]) -> Dict[str, float]:

    ml_probs = {cls: 0.0 for cls in official_classes}

    try:
        from pathlib import Path
        import joblib
        from config import MODELS_DIR

        model_path = MODELS_DIR / "NLP" / "fish_disease_nlp_model.pkl"
        if not model_path.exists():
            return ml_probs

        bundle = joblib.load(str(model_path))
        model = bundle.get("model")
        disease_labels = bundle.get("disease_labels", {})

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba([text])[0]
            classes_in_model = model.classes_
            for idx, prob in zip(classes_in_model, probs):
                disease_name = disease_labels.get(int(idx))
                if disease_name in ml_probs:
                    ml_probs[disease_name] = round(float(prob), 4)
    except Exception as exc:
        LOG.debug("ML model prediction skipped: %s", exc)
    return ml_probs

def process(text: str) -> Dict[str, Any]:

    if not text:
        return {"input_text": "", "probabilities": {}, "detected_symptoms": [], "top_disease": "Healthy Fish"}

    lowered = text.lower().strip()
    official_classes = load_disease_classes()
    probabilities = {cls: 0.0 for cls in official_classes}
    detected_symptoms = []


    




