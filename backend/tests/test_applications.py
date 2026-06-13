def test_application_status_options(client):
    response = client.get("/applications/status-options")

    assert response.status_code == 200

    statuses = response.json()
    values = {status["value"] for status in statuses}

    assert "saved" in values
    assert "applied" in values
    assert "interviewing" in values
    assert "offer" in values
    assert "rejected" in values


def test_create_list_update_dashboard_and_delete_application(client):
    create_payload = {
        "company_name": "Visa",
        "role_title": "Backend Engineer",
        "job_url": "https://example.com/backend-engineer",
        "job_location": "Seattle, WA",
        "status": "saved",
        "priority": "high",
        "source": "Company Website",
        "notes": "Strong backend fit.",
        "next_action": "Tailor resume and apply.",
        "follow_up_date": "2026-06-17",
        "ats_score": 89,
    }

    create_response = client.post("/applications", json=create_payload)

    assert create_response.status_code == 200
    created = create_response.json()
    application_id = created["id"]

    assert created["company_name"] == "Visa"
    assert created["role_title"] == "Backend Engineer"
    assert created["status"] == "saved"
    assert created["priority"] == "high"
    assert created["ats_score"] == 89

    list_response = client.get("/applications")

    assert list_response.status_code == 200
    applications = list_response.json()
    assert len(applications) == 1
    assert applications[0]["company_name"] == "Visa"

    update_response = client.patch(
        f"/applications/{application_id}",
        json={
            "status": "interviewing",
            "next_action": "Prepare project stories and backend API examples.",
        },
    )

    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["status"] == "interviewing"
    assert updated["next_action"] == "Prepare project stories and backend API examples."

    dashboard_response = client.get("/applications/dashboard")

    assert dashboard_response.status_code == 200
    dashboard = dashboard_response.json()
    assert dashboard["total_applications"] == 1
    assert dashboard["interviewing"] == 1
    assert dashboard["average_ats_score"] == 89.0

    delete_response = client.delete(f"/applications/{application_id}")

    assert delete_response.status_code == 200

    final_list_response = client.get("/applications")

    assert final_list_response.status_code == 200
    assert final_list_response.json() == []


def test_invalid_application_status_returns_400(client):
    response = client.post(
        "/applications",
        json={
            "company_name": "OpenAI",
            "role_title": "Software Engineer",
            "status": "not_a_real_status",
            "priority": "high",
        },
    )

    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]
