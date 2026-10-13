import io
import functools
from pathlib import Path

import numpy as np
from PIL import Image
import tensorflow as tf


# Paths relative to this file → workspace root
_MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "model_unquant.tflite"
_LABELS_PATH = Path(__file__).resolve().parent.parent.parent / "labels.txt"


def _load_labels() -> list[str]:
    """Parse labels.txt where each line is 'index label_text'."""
    labels: list[str] = []
    with open(_LABELS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Split on first space: "0 Tomato Yellow Leaf Curl Virus"
            parts = line.split(" ", 1)
            if len(parts) == 2:
                labels.append(parts[1].strip())
    return labels


@functools.lru_cache(maxsize=1)
def _get_interpreter():
    """Load the TFLite interpreter once and reuse."""
    interpreter = tf.lite.Interpreter(model_path=str(_MODEL_PATH))
    interpreter.allocate_tensors()
    return interpreter


# Labels loaded once at module level
_LABELS = _load_labels()


def predict(image_bytes: bytes) -> dict:
    """Run inference on raw image bytes and return disease prediction."""
    # Preprocessing — matches the original app.py pattern exactly
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0).astype(np.float32)

    # Inference
    interpreter = _get_interpreter()
    input_index = interpreter.get_input_details()[0]["index"]
    output_index = interpreter.get_output_details()[0]["index"]

    interpreter.set_tensor(input_index, img_array)
    interpreter.invoke()
    output = interpreter.get_tensor(output_index)

    predicted_index = int(np.argmax(output))
    # Softmax confidence
    exp_output = np.exp(output[0] - np.max(output[0]))
    softmax = exp_output / exp_output.sum()
    confidence = float(softmax[predicted_index])

    disease_name = _LABELS[predicted_index] if predicted_index < len(_LABELS) else "Unknown"
    is_healthy = "healthy" in disease_name.lower()

    return {
        "disease": disease_name,
        "confidence": round(confidence, 4),
        "is_healthy": is_healthy,
    }
