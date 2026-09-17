import requests


URL = "http://127.0.0.1:5000/api/chat"


def test_chat(message):

    print("\n==============================")
    print("TEST MESSAGE:")
    print(message)

    try:

        response = requests.post(
            URL,
            json={
                "message": message
            },
            timeout=60
        )

        print("\nSTATUS CODE:")
        print(response.status_code)

        print("\nRESPONSE:")

        data = response.json()

        print(data)

        if response.status_code == 200:

            print("\nTEST PASSED")

        else:

            print("\nTEST FAILED")

    except Exception as e:

        print("\nTEST ERROR:")
        print(e)


# ============================================================
# Test Cases
# ============================================================

test_chat("hi")

test_chat("I need Power BI")

test_chat("I need dashboard software")