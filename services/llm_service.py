import os

from dotenv import load_dotenv
from google import genai


# ============================================================
# Configuration
# ============================================================

load_dotenv()

API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

MODEL_NAME = "gemini-3.5-flash"


if not API_KEY:

    raise ValueError(
        "GEMINI_API_KEY was not found."
    )


# ============================================================
# Gemini Client
# ============================================================

client = genai.Client(
    api_key=API_KEY
)


# ============================================================
# Generate Response
# ============================================================

def generate_response(
    user_query,
    search_results
):

    # --------------------------------------------------------
    # Greeting
    # --------------------------------------------------------

    greetings = [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    ]

    if user_query.lower().strip() in greetings:

        return {
            "message": (
                "Hi! 👋\n\n"
                "I'm your SCCM Software Assistant. "
                "I can help you find software available "
                "for installation."
            ),
            "software_options": []
        }


    # --------------------------------------------------------
    # No results
    # --------------------------------------------------------

    if not search_results:

        return {
            "message": (
                "I couldn't find a suitable software match "
                "in the SCCM software catalog.\n\n"
                "Please try describing what you need, "
                "for example:\n"
                "• dashboard software\n"
                "• PDF editor\n"
                "• video conferencing software"
            ),
            "software_options": []
        }


    # --------------------------------------------------------
    # Prepare software information
    # --------------------------------------------------------

    software_information = []

    seen = set()

    for result in search_results:

        software_name = result.get(
            "software_name",
            ""
        ).strip()

        description = result.get(
            "description",
            ""
        ).strip()

        if not software_name:
            continue

        key = software_name.lower()

        if key in seen:
            continue

        seen.add(key)

        software_information.append(
            {
                "software_name": software_name,
                "description": description
            }
        )


    # --------------------------------------------------------
    # Build Gemini context
    # --------------------------------------------------------

    context = ""

    for number, software in enumerate(
        software_information,
        start=1
    ):

        context += (
            f"{number}. "
            f"Software: {software['software_name']}\n"
            f"Description: "
            f"{software['description']}\n\n"
        )


    # --------------------------------------------------------
    # Gemini Prompt
    # --------------------------------------------------------

    prompt = f"""
You are an internal SCCM Software Installation Assistant.

User request:

"{user_query}"

The SCCM search system found these applications:

{context}

Generate a short professional response.

Rules:

1. ONLY use the software supplied above.
2. Do not invent software.
3. Do not invent descriptions.
4. Explain each software in simple language.
5. Do not show AD groups.
6. Do not show collection names.
7. Do not show deployment information.
8. Do not show similarity scores.
9. Do not mention FAISS.
10. Do not mention embeddings.
11. Do not mention Gemini.
12. If multiple applications are found, explain each one.
13. Ask the user which software they want.
14. Keep the response concise.

Example:

I found a few software options that may match your requirement:

1. Tableau Desktop 2023
   Used for creating reports, dashboards and data visualizations.

2. Microsoft Power BI
   Used for creating interactive dashboards, reports and data visualizations.

3. Minitab
   Used for statistical analysis and data analysis.

Please select the software you would like to proceed with.
"""


    # --------------------------------------------------------
    # Call Gemini
    # --------------------------------------------------------

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        message = response.text.strip()


    except Exception as e:

        print(
            "Gemini request failed:",
            str(e)
        )

        message = (
            "I found matching software, "
            "but I was unable to generate "
            "the explanation right now."
        )


    # --------------------------------------------------------
    # Return structured response
    # --------------------------------------------------------

    return {

        "message": message,

        "software_options":
            software_information

    }