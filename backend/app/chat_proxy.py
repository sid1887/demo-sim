# backend/app/chat_proxy.py
"""
Proxy to call Gemini Text model. Sends a prompt including circuit context and returns text response.
Uses google-genai SDK: pip install google-genai
"""
import os
from typing import Dict, Any

try:
    from google import genai
except Exception:
    genai = None

# Fixed security issue - use proper environment variable
API_KEY = os.environ.get("GEMINI_API_KEY")


def ask_gemini_text(question: str, context: Dict[str, Any]) -> str:
    """Ask Gemini a question with optional context (netlist or parsed JSON).

    Returns the model's textual answer.
    Falls back to a mock if GEMINI_API_KEY or SDK is missing.
    """
    if not API_KEY or genai is None:
        return f"[MOCK] I received your question: '{question}'. Context keys: {list(context.keys())[:5]}"

    client = genai.Client()

    # Build a concise prompt including the netlist or parsed JSON as context
    ctx_text = ''
    if context.get('netlist'):
        ctx_text = f"SPICE netlist:\n{context['netlist']}"
    elif context.get('parsed_json'):
        import json
        ctx_text = 'Parsed JSON: ' + json.dumps(context['parsed_json'])
    elif context.get('parsed'):
        import json
        ctx_text = 'Parsed JSON: ' + json.dumps(context['parsed'])

    full_prompt = f"You are an expert electronics engineer. Given the following circuit context:\n{ctx_text}\n\nAnswer the question clearly and concisely:\n{question}\n\nExplain your reasoning briefly and provide numeric values if simulation data is available."

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[full_prompt]
        )
        text = response.text
        if isinstance(text, (bytes, bytearray)):
            text = text.decode('utf-8')
        return text
    except Exception as e:
        raise RuntimeError(f"Gemini Text call failed: {e}")
