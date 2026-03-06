import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from src.feature_extraction.feature_extractor import extract_features
from src.preprocessing.audio_preprocessor import preprocess_audio

VALID_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}


def gather_training_samples(root_dir: Path):
    if not root_dir.exists():
        raise FileNotFoundError(f"Training directory does not exist: {root_dir}")

    entries = []
    for grade_dir in sorted(root_dir.iterdir()):
        if not grade_dir.is_dir():
            continue
        label = 1 if "abnormal" in grade_dir.name.lower() else 0
        for audio_path in sorted(grade_dir.rglob("*")):
            if not audio_path.is_file() or audio_path.suffix.lower() not in VALID_AUDIO_EXTENSIONS:
                continue
            try:
                audio, sr = preprocess_audio(str(audio_path))
                features = extract_features(audio, sr)
                entries.append((features, label, audio_path))
            except Exception as exc:
                print(f"Skipping {audio_path}: {exc}")
    return entries


def build_feature_matrix(samples):
    if not samples:
        raise RuntimeError("No training samples found. Make sure training_data/ contains labeled audio files.")

    features = [entry[0] for entry in samples]
    labels = [entry[1] for entry in samples]

    feature_df = pd.DataFrame(features)
    feature_df.fillna(0, inplace=True)

    return feature_df, np.array(labels)


def train_model(X, y):
    stratify = y if len(np.unique(y)) > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Accuracy on {len(y_test)} held-out samples: {acc:.4f}")
    print("Classification report:")
    print(classification_report(y_test, preds, digits=4, zero_division=0))

    return model


def persist_model(model, output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as handle:
        pickle.dump(model, handle)
    print(f"Saved trained model to {output_path}")


def main():
    project_root = Path(__file__).resolve().parents[2]
    training_dir = project_root / "training_data"
    samples = gather_training_samples(training_dir)

    print(f"Collected {len(samples)} samples from {training_dir}")
    feature_df, labels = build_feature_matrix(samples)
    print(f"Feature matrix: {feature_df.shape[0]} rows x {feature_df.shape[1]} features")

    trained_model = train_model(feature_df, labels)
    model_path = project_root / "models" / "adhd_model.pkl"
    persist_model(trained_model, model_path)


if __name__ == "__main__":
    # Training script that builds the dataset from training_data
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
                if not audio_file.is_file():
                    continue

                if audio_file.suffix.lower() not in ALLOWED_EXTENSIONS:
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

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

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