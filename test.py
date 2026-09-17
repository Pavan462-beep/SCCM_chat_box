import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_chat_api_exists(client):
    response = client.post(
        "/api/chat",
        json={"message": "hi"}
    )

    assert response.status_code == 200


def test_chat_requires_message(client):
    response = client.post(
        "/api/chat",
        json={}
    )

    assert response.status_code == 400


def test_chat_rejects_empty_message(client):
    response = client.post(
        "/api/chat",
        json={"message": ""}
    )

    assert response.status_code == 400


def test_chat_returns_json(client):
    response = client.post(
        "/api/chat",
        json={"message": "hi"}
    )

    assert response.is_json


def test_chat_response_contains_success(client):
    response = client.post(
        "/api/chat",
        json={"message": "hi"}
    )

    data = response.get_json()

    assert "success" in data
    assert data["success"] is True