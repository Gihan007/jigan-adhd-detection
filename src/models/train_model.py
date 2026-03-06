import pickle
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from src.feature_extraction.feature_extractor import extract_features
from src.preprocessing.audio_preprocessor import preprocess_audio


ROOT_DIR = Path(__file__).resolve().parents[2]
TRAINING_DATA_DIR = ROOT_DIR / "training_data"
MODEL_DIR = ROOT_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "adhd_model.pkl"
DATASET_CACHE = ROOT_DIR / "training_features.csv"
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}


def _label_from_folder(folder_name: str) -> int:
    return 1 if "abnormal" in folder_name.lower() else 0


def build_feature_dataset() -> Tuple[pd.DataFrame, List[str]]:
    if not TRAINING_DATA_DIR.exists():
        raise FileNotFoundError(f"training_data directory not found at {TRAINING_DATA_DIR}")

    records = []
    for grade_dir in sorted(TRAINING_DATA_DIR.iterdir()):
        if not grade_dir.is_dir():
            continue

        label = _label_from_folder(grade_dir.name)
        for audio_file in sorted(grade_dir.iterdir()):
            if not audio_file.is_file() or audio_file.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue

            try:
                audio, sr = preprocess_audio(str(audio_file))
                features = extract_features(audio, sr, text="")
                feature_row = {k: float(v) for k, v in features.items()}
                feature_row["label"] = label
                feature_row["file"] = str(audio_file)
                records.append(feature_row)
                print(f"Extracted features from {audio_file.name}")
            except Exception as err:  # pragma: no cover - best-effort extraction
                print(f"Skipping {audio_file.name}: {err}")

    if not records:
        raise ValueError("No audio files processed from training_data; ensure the folders contain supported audio files.")

    feature_keys = sorted(k for k in records[0].keys() if k not in {"label", "file"})
    ordered_rows = []
    for rec in records:
        ordered_row = {k: rec[k] for k in feature_keys}
        ordered_row["label"] = rec["label"]
        ordered_row["file"] = rec["file"]
        ordered_rows.append(ordered_row)

    df = pd.DataFrame(ordered_rows)
    df = df[["file", "label"] + feature_keys]
    df.to_csv(DATASET_CACHE, index=False)
    print(f"Cached feature dataset to {DATASET_CACHE}")

    return df, feature_keys


def load_cached_dataset() -> Tuple[pd.DataFrame, List[str]] | None:
    if not DATASET_CACHE.exists():
        return None

    df = pd.read_csv(DATASET_CACHE)
    feature_keys = sorted(col for col in df.columns if col not in {"file", "label"})
    print(f"Loaded cached dataset with {len(df)} samples from {DATASET_CACHE}")
    return df, feature_keys


def train_from_dataframe(df: pd.DataFrame, feature_keys: List[str]) -> RandomForestClassifier:
    X = df[feature_keys].astype(np.float32).to_numpy()
    y = df["label"].astype(np.int64).to_numpy()

    if len(X) < 2:
        raise ValueError("Need at least two training samples to train the model.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model accuracy on hold-out set: {accuracy:.4f}")

    with open(MODEL_PATH, "wb") as handle:
        pickle.dump(model, handle)
    print(f"Saved trained model to {MODEL_PATH}")

    return model


def main() -> None:
    cached = load_cached_dataset()
    if cached:
        df, feature_keys = cached
    else:
        df, feature_keys = build_feature_dataset()

    train_from_dataframe(df, feature_keys)


if __name__ == "__main__":
    main()
