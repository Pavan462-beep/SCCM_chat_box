from flask import Blueprint, request, jsonify

from services.search_service import search_sccm
from services.llm_service import generate_response


# ============================================================
# Blueprint
# ============================================================

chat_bp = Blueprint(
    "chat",
    __name__
)


# ============================================================
# Chat API
# ============================================================

@chat_bp.route(
    "/api/chat",
    methods=["POST"]
)
def chat():

    try:

        # ----------------------------------------------------
        # Read request
        # ----------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Invalid request."
            }), 400


        # ----------------------------------------------------
        # Get user message
        # ----------------------------------------------------

        user_query = data.get(
            "message",
            ""
        ).strip()


        if not user_query:

            return jsonify({
                "success": False,
                "message": "Please enter a message."
            }), 400


        # ----------------------------------------------------
        # Log query
        # ----------------------------------------------------

        print(
            "\n=============================="
        )

        print(
            "USER QUERY:"
        )

        print(
            user_query
        )


        # ----------------------------------------------------
        # FAISS search
        # ----------------------------------------------------

        results = search_sccm(
            user_query,
            top_k=5,
            threshold=0.25
        )


        print(
            "\nFAISS RESULTS:"
        )

        print(
            results
        )


        # ----------------------------------------------------
        # Gemini
        # ----------------------------------------------------

        ai_response = generate_response(
            user_query,
            results
        )


        print(
            "\nGEMINI RESPONSE:"
        )

        print(
            ai_response
        )


        # ----------------------------------------------------
        # Extract message
        # ----------------------------------------------------

        message = ai_response.get(
            "message",
            ""
        )


        software_options = ai_response.get(
            "software_options",
            []
        )


        # ----------------------------------------------------
        # Return clean JSON
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "message": message,

            "software_options":
                software_options

        })


    except Exception as e:

        print(
            "\nBACKEND ERROR:"
        )

        print(
            str(e)
        )


        return jsonify({

            "success": False,

            "message":
                "Sorry, something went wrong.",

            "software_options":
                []

        }), 500