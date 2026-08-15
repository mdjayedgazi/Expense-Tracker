from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionType,
    TransactionUpdate,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def get_owned_transaction(
    transaction_id: int,
    current_user: User,
    db: Session,
) -> Transaction:
    """Fetch a transaction that belongs to the current user or raise 404.

    The ownership filter means a user can never see or touch another
    user's transaction; it is treated as "not found".
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id,
    ).first()

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a transaction owned by the authenticated user."""
    # owner_id always comes from the authenticated user, never from the client.
    transaction = Transaction(
        title=transaction_data.title,
        amount=transaction_data.amount,
        type=transaction_data.type.value,
        category=transaction_data.category,
        date=transaction_data.date,
        owner_id=current_user.id,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return all transactions that belong to the authenticated user."""
    return db.query(Transaction).filter(
        Transaction.owner_id == current_user.id
    ).all()


# /filter must be declared before /{transaction_id} so "filter" is not
# matched as a transaction id.
@router.get("/filter", response_model=list[TransactionResponse])
def filter_transactions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    type: TransactionType | None = None,
    category: str | None = Query(default=None, max_length=100),
    minimum_amount: float | None = Query(default=None, gt=0),
    maximum_amount: float | None = Query(default=None, gt=0),
):
    """Filter the authenticated user's transactions.

    All query parameters are optional:
      /transactions/filter?type=expense&category=Food&minimum_amount=100&maximum_amount=5000
    """
    # The query is always scoped to the current user.
    query = db.query(Transaction).filter(
        Transaction.owner_id == current_user.id
    )

    if type is not None:
        query = query.filter(Transaction.type == type.value)
    if category is not None:
        query = query.filter(Transaction.category == category)
    if minimum_amount is not None:
        query = query.filter(Transaction.amount >= minimum_amount)
    if maximum_amount is not None:
        query = query.filter(Transaction.amount <= maximum_amount)

    return query.all()


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return one of the authenticated user's transactions."""
    return get_owned_transaction(transaction_id, current_user, db)


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update one of the authenticated user's transactions."""
    transaction = get_owned_transaction(transaction_id, current_user, db)

    # Apply only the fields the client actually sent.
    for field, value in transaction_data.model_dump(exclude_unset=True).items():
        if value is None and field != "category":
            # Skip fields set to null except category (which is nullable).
            continue
        if field == "type" and value is not None:
            value = value.value
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
def delete_transaction(
    transaction_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete one of the authenticated user's transactions."""
    transaction = get_owned_transaction(transaction_id, current_user, db)

    db.delete(transaction)
    db.commit()

    return {"message": "Transaction deleted successfully"}
