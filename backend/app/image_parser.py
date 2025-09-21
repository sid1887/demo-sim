# backend/app/image_parser.py
"""
Calls Google GenAI (Gemini) Vision to extract circuit JSON from an image.
Uses the official google-genai Python SDK. Install via: pip install google-genai

The function parse_image_via_gemini(image_path) -> dict calls Gemini's generate_content
API with inline image bytes and requests JSON output via response_mime_type.
"""
import os
import json
from typing import Any, Dict

try:
    from google import genai
    from google.genai import types
except Exception:
    genai = None
    types = None

API_KEY = os.environ.get("GEMINI_API_KEY")


def parse_image_via_gemini(image_path: str) -> Dict[str, Any]:
    """Send the image to Gemini Vision and request JSON structured output.

    Returns a parsed JSON dictionary like {"components": [...], "nets": [...]}.
    Raises RuntimeError if the google-genai SDK is not available or call fails.
    """
    # If SDK not installed or no API key, fall back to previous mock for local dev
    if not API_KEY or genai is None or types is None:
        return {
            "components": [
                {"type": "VoltageSource", "name": "V1", "value": "12V", "nodes": ["N1", "0"]},
                {"type": "Resistor", "name": "R1", "value": "10k", "nodes": ["N1", "N2"]},
                {"type": "Resistor", "name": "R2", "value": "10k", "nodes": ["N2", "0"]},
            ],
            "notes": "Mocked: No GEMINI_API_KEY or google-genai SDK available. Install google-genai and set GEMINI_API_KEY." 
        }

    # Read image bytes
    with open(image_path, 'rb') as f:
        image_bytes = f.read()

    client = genai.Client()

    # Build parts: image bytes first, then instruction text
    image_part = types.Part.from_bytes(data=image_bytes, mime_type='image/png')

    prompt = (
        "Extract all circuit components and nets from the attached schematic image. "
        "Return only valid JSON with structure: {\"components\":[{\"type\":\"Resistor\",\"name\":\"R1\",\"value\":\"10k\",\"nodes\":[\"N1\",\"N2\"]},...], \"nets\": [\"N1\", ...]}. "
        "Use node id '0' for ground if you detect ground symbol. Do not add any commentary or explanation."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, prompt],
            config={
                'response_mime_type': 'application/json'
            }
        )

        # response.text is a JSON string when response_mime_type is application/json
        text = response.text
        # Some SDK versions return bytes or already-parsed structures; handle gracefully
        if isinstance(text, (bytes, bytearray)):
            text = text.decode('utf-8')

        parsed = json.loads(text)
        return parsed
    except Exception as e:
        raise RuntimeError(f"Gemini Vision call failed: {e}")
