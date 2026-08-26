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
