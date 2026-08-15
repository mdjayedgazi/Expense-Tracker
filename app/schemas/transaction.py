from datetime import date as Date
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class TransactionType(StrEnum):
    """Allowed transaction types."""

    INCOME = "income"
    EXPENSE = "expense"


class TransactionCreate(BaseModel):
    """Request body for creating a transaction."""

    title: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Transaction title",
        examples=["Monthly salary"],
    )

    # Pydantic validates that the amount is a positive number.
    amount: float = Field(
        ...,
        gt=0,
        le=5_000_000,
        description="Transaction amount",
        examples=[50000],
    )

    # Pydantic only accepts "income" or "expense" here.
    type: TransactionType = Field(
        ...,
        description="Transaction type",
        examples=["income"],
    )

    category: str | None = Field(
        default=None,
        max_length=100,
        description="Transaction category",
        examples=["Food"],
    )

    date: Date = Field(
        ...,
        description="Transaction date",
        examples=["2026-08-15"],
    )


class TransactionUpdate(BaseModel):
    """Request body for updating a transaction. All fields are optional."""

    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Transaction title",
        examples=["Monthly salary"],
    )

    amount: float | None = Field(
        default=None,
        gt=0,
        le=5_000_000,
        description="Transaction amount",
        examples=[50000],
    )

    type: TransactionType | None = Field(
        default=None,
        description="Transaction type",
        examples=["income"],
    )

    category: str | None = Field(
        default=None,
        max_length=100,
        description="Transaction category",
        examples=["Food"],
    )

    date: Date | None = Field(
        default=None,
        description="Transaction date",
        examples=["2026-08-15"],
    )


class TransactionResponse(BaseModel):
    """Transaction returned to the client."""

    id: int
    title: str
    amount: float
    type: TransactionType
    category: str | None
    date: Date
    owner_id: int

    model_config = ConfigDict(from_attributes=True)
