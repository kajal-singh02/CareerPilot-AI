import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import verify_password, get_password_hash, create_access_token

client = TestClient(app)

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "CareerPilot AI" in data["service"]

def test_security_helpers():
    pwd = "MySecretPassword123"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_auth_and_protected_routes():
    # Login with demo
    res = client.post("/api/v1/auth/login", json={
        "email": "demo@careerpilot.ai",
        "password": "CareerPilot2026!"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "demo@careerpilot.ai"

    # Test unauthorized access
    unauth = client.get("/api/v1/auth/me")
    assert unauth.status_code == 401

def test_jobs_list_and_saved():
    res = client.post("/api/v1/auth/login", json={
        "email": "demo@careerpilot.ai",
        "password": "CareerPilot2026!"
    })
    headers = {"Authorization": f"Bearer {res.json()['access_token']}"}

    jobs = client.get("/api/v1/jobs/", headers=headers)
    assert jobs.status_code == 200
    job_list = jobs.json()
    assert len(job_list) > 0
    first_job_id = job_list[0]["id"]

    # Save job
    save_res = client.post(f"/api/v1/jobs/{first_job_id}/save", headers=headers)
    assert save_res.status_code == 200

    # Check saved list
    saved_list = client.get("/api/v1/jobs/saved/all", headers=headers)
    assert saved_list.status_code == 200
    assert any(j["id"] == first_job_id for j in saved_list.json())

    # Unsave
    unsave_res = client.delete(f"/api/v1/jobs/{first_job_id}/save", headers=headers)
    assert unsave_res.status_code == 200

def test_dashboard_stats():
    res = client.post("/api/v1/auth/login", json={
        "email": "demo@careerpilot.ai",
        "password": "CareerPilot2026!"
    })
    headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
    stats = client.get("/api/v1/dashboard/stats", headers=headers)
    assert stats.status_code == 200
    data = stats.json()
    assert "readiness_score" in data
    assert "applications_count" in data

def test_clerk_sync():
    res = client.post("/api/v1/auth/clerk-sync", json={
        "clerk_id": "user_2testClerk123",
        "email": "candidate_clerk@test.com",
        "full_name": "Clerk Test Candidate"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "candidate_clerk@test.com"
    assert me.json()["full_name"] == "Clerk Test Candidate"

def test_chat_workflow():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@careerpilot.ai",
        "password": "CareerPilot2026!"
    })
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # 1. Send chat message
    chat_res = client.post("/api/v1/chat/", json={
        "content": "What are my skill gaps for a Full Stack Engineer?"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "conversation_id" in chat_data
    assert "content" in chat_data
    conv_id = chat_data["conversation_id"]

    # 2. List conversations
    convs_res = client.get("/api/v1/chat/conversations", headers=headers)
    assert convs_res.status_code == 200
    assert any(c["id"] == conv_id for c in convs_res.json())

    # 3. Get single conversation
    single_res = client.get(f"/api/v1/chat/conversations/{conv_id}", headers=headers)
    assert single_res.status_code == 200
    assert len(single_res.json()["messages"]) >= 2

    # 4. Update title
    update_res = client.patch(f"/api/v1/chat/conversations/{conv_id}", json={
        "title": "Renamed Strategy Session"
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Renamed Strategy Session"
