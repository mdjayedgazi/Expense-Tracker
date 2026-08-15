from tests.conftest import auth_header, create_transaction, register_and_login


def test_requires_authentication(client):
    """Transaction endpoints reject requests without a valid token."""
    assert client.get("/transactions").status_code == 401
    assert client.post("/transactions", json={}).status_code == 401
    assert client.get("/transactions/1").status_code == 401
    assert client.get("/transactions/filter").status_code == 401


def test_create_transaction(client, user_token):
    """Creating a transaction returns it with the owner set to the user."""
    response = create_transaction(client, user_token)

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Monthly salary"
    assert body["amount"] == 50000
    assert body["type"] == "income"
    assert body["category"] == "Salary"
    assert body["date"] == "2026-08-15"
    assert body["owner_id"] is not None


def test_create_transaction_rejects_invalid_data(client, user_token):
    """Negative amounts and invalid types are rejected by validation."""
    negative = create_transaction(client, user_token, amount=-5)
    assert negative.status_code == 422

    bad_type = create_transaction(client, user_token, type="shopping")
    assert bad_type.status_code == 422


def test_list_transactions_returns_only_own(client, user_token):
    """A user only sees their own transactions."""
    create_transaction(client, user_token, title="Salary", category="Salary")
    create_transaction(client, user_token, title="Groceries", type="expense", amount=2500)

    other_token = register_and_login(client, "jayed2", "mdjayedgazi+mallory@gmail.com")
    create_transaction(client, other_token, title="Mallory's secret", category="Secret")

    response = client.get("/transactions", headers=auth_header(user_token))

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    titles = {transaction["title"] for transaction in body}
    assert titles == {"Salary", "Groceries"}


def test_get_transaction(client, user_token):
    """A user can retrieve one of their own transactions."""
    created = create_transaction(client, user_token)
    transaction_id = created.json()["id"]

    response = client.get(
        f"/transactions/{transaction_id}",
        headers=auth_header(user_token),
    )

    assert response.status_code == 200
    assert response.json()["id"] == transaction_id


def test_get_transaction_not_found(client, user_token):
    """Requesting a transaction that does not exist returns 404."""
    response = client.get("/transactions/99999", headers=auth_header(user_token))

    assert response.status_code == 404


def test_update_transaction(client, user_token):
    """A user can update one of their own transactions."""
    created = create_transaction(client, user_token, title="Old title")
    transaction_id = created.json()["id"]

    response = client.put(
        f"/transactions/{transaction_id}",
        json={"title": "New title", "amount": 1234.5},
        headers=auth_header(user_token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "New title"
    assert body["amount"] == 1234.5


def test_update_transaction_not_found(client, user_token):
    """Updating a transaction that does not exist returns 404."""
    response = client.put(
        "/transactions/99999",
        json={"title": "Anything"},
        headers=auth_header(user_token),
    )

    assert response.status_code == 404


def test_delete_transaction(client, user_token):
    """Deleting a transaction removes it."""
    created = create_transaction(client, user_token)
    transaction_id = created.json()["id"]

    response = client.delete(
        f"/transactions/{transaction_id}",
        headers=auth_header(user_token),
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Transaction deleted successfully"

    gone = client.get(
        f"/transactions/{transaction_id}",
        headers=auth_header(user_token),
    )
    assert gone.status_code == 404


def test_delete_transaction_not_found(client, user_token):
    """Deleting a transaction that does not exist returns 404."""
    response = client.delete(
        "/transactions/99999",
        headers=auth_header(user_token),
    )

    assert response.status_code == 404


def test_cannot_access_another_users_transaction(client, user_token):
    """Users cannot get, update or delete another user's transaction."""
    created = create_transaction(client, user_token, title="Private expense", type="expense")
    transaction_id = created.json()["id"]

    intruder_token = register_and_login(client, "jayed2", "mdjayedgazi+eve@gmail.com")

    get_response = client.get(
        f"/transactions/{transaction_id}",
        headers=auth_header(intruder_token),
    )
    assert get_response.status_code == 404

    put_response = client.put(
        f"/transactions/{transaction_id}",
        json={"title": "Hacked"},
        headers=auth_header(intruder_token),
    )
    assert put_response.status_code == 404

    delete_response = client.delete(
        f"/transactions/{transaction_id}",
        headers=auth_header(intruder_token),
    )
    assert delete_response.status_code == 404

    # The original owner's transaction is untouched.
    still_there = client.get(
        f"/transactions/{transaction_id}",
        headers=auth_header(user_token),
    )
    assert still_there.status_code == 200
    assert still_there.json()["title"] == "Private expense"


def test_filter_transactions(client, user_token):
    """Filtering combines type, category and amount ranges for the user."""
    create_transaction(client, user_token, title="Salary", category="Salary", amount=50000)
    create_transaction(
        client,
        user_token,
        title="Groceries",
        type="expense",
        category="Food",
        amount=2500,
    )
    create_transaction(
        client,
        user_token,
        title="Lunch",
        type="expense",
        category="Food",
        amount=300,
    )

    # Filter by type.
    expenses = client.get(
        "/transactions/filter?type=expense",
        headers=auth_header(user_token),
    )
    assert expenses.status_code == 200
    assert all(item["type"] == "expense" for item in expenses.json())
    assert len(expenses.json()) == 2

    # Filter by category.
    food = client.get(
        "/transactions/filter?category=Food",
        headers=auth_header(user_token),
    )
    assert food.status_code == 200
    assert len(food.json()) == 2

    # Filter by amount range.
    range_response = client.get(
        "/transactions/filter?minimum_amount=1000&maximum_amount=10000",
        headers=auth_header(user_token),
    )
    assert range_response.status_code == 200
    assert len(range_response.json()) == 1
    assert range_response.json()[0]["title"] == "Groceries"

    # Combined filters.
    combined = client.get(
        "/transactions/filter?type=expense&category=Food",
        headers=auth_header(user_token),
    )
    assert combined.status_code == 200
    assert len(combined.json()) == 2

    # No filters returns everything.
    all_transactions = client.get(
        "/transactions/filter",
        headers=auth_header(user_token),
    )
    assert all_transactions.status_code == 200
    assert len(all_transactions.json()) == 3
