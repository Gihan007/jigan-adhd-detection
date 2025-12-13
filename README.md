# ADHD Speech-Based Detection System

An AI-driven, NLP-based speech screening tool for detecting Attention Deficit Hyperactivity Disorder (ADHD) in Sinhala-speaking children.

## Features

- 🎤 **Audio Recording & Upload** - Record directly in browser or upload audio files
- 📝 **Age-Appropriate Reading Tasks** - 2-minute Sinhala paragraphs for ages 6-12
- 🔊 **Audio Processing** - Automatic format conversion and noise reduction
- 🧠 **Feature Extraction** - Acoustic (MFCCs, pitch, jitter, shimmer) and linguistic features
- 📊 **ADHD Classification** - ML-based screening with probability scores
- 💡 **Recommendations** - Actionable insights based on screening results

## Prerequisites

### System Requirements
- Python 3.10 or higher
- ffmpeg (audio processing)
- Microphone (for audio recording)

### Installing ffmpeg

**Windows:**
1. Download from https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH

**Linux:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

## Installation

1. **Clone or extract the project**
```bash
cd path/to/jigan
```

2. **Create a virtual environment (recommended)**
```bash
# Windows
python -m venv jigan
jigan\Scripts\activate

# Linux/macOS
python3 -m venv jigan
source jigan/bin/activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Download SpaCy language model**
```bash
python -m spacy download en_core_web_sm
```

5. **Download NLTK data**
```python
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('punkt_tab')"
```

## Usage

1. **Start the application**
```bash
streamlit run app.py
```

2. **Access the web interface**
- Open browser and navigate to `http://localhost:8501`

3. **Using the app**
   - Select child's age (6-12 years)
   - Read the generated Sinhala paragraph aloud
   - Either:
     - **Upload Audio**: Upload a pre-recorded WAV/MP3 file
     - **Record Audio**: Click "Start Recording" and read the paragraph (recommended: 120 seconds)
   - View analysis results including ADHD probability and detailed features

## Project Structure

```
jigan/
├── app.py                          # Main Streamlit application
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── data/                          # Data storage
│   └── collect_data.py           # Data collection utilities
├── models/                        # Trained ML models
│   └── adhd_model.pkl            # Pre-trained classifier (if available)
├── src/
│   ├── preprocessing/
│   │   └── audio_preprocessor.py # Audio preprocessing functions
│   ├── feature_extraction/
│   │   └── feature_extractor.py  # Feature extraction (acoustic + linguistic)
│   ├── models/
│   │   ├── classifier.py         # ADHD classification model
│   │   └── train_model.py        # Model training script
│   └── utils/
│       └── helpers.py            # Utility functions
├── notebooks/                     # Jupyter notebooks for experiments
└── tests/                         # Unit tests
    └── test_features.py
```

## Features Extracted

### Acoustic Features
- **MFCCs** (13 coefficients) - Voice quality characteristics
- **Pitch** - Fundamental frequency
- **Jitter** - Voice stability
- **Shimmer** - Amplitude variation

### Linguistic Features
- **Lexical Diversity** - Vocabulary richness
- **Narrative Coherence** - Story structure quality
- **Filler Words** - Use of "um", "uh", etc.
- **Speech Fluency** - Hesitation patterns

## Model Training

To train a new model with your own data:

1. Collect labeled speech samples
2. Extract features using `feature_extractor.py`
3. Run training script:
```bash
python src/models/train_model.py
```

## Important Notes

⚠️ **This is a screening tool, not a diagnostic instrument**
- Results should be interpreted by healthcare professionals
- Not a substitute for clinical diagnosis
- Use as part of comprehensive ADHD assessment

## Troubleshooting

**Audio not recording:**
- Check microphone permissions in browser
- Ensure PyAudio is installed correctly

**ffmpeg not found:**
- Verify ffmpeg is in system PATH
- Restart terminal after installation

**Import errors:**
- Ensure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

**SpaCy model not found:**
- Run: `python -m spacy download en_core_web_sm`

## Contributing

To contribute to this project:
1. Report issues via issue tracker
2. Submit pull requests for improvements
3. Suggest new features or enhancements

## License

This project is for research and educational purposes.

## Support

For questions or issues, please contact the development team.

---

**Developed as part of ADHD detection research for Sinhala-speaking children in Sri Lanka**