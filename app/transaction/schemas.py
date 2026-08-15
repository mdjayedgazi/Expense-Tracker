from datetime import date
from enum import StrEnum

from pydantic import BaseModel, Field


class TransactionType(StrEnum):
    REVENUE = "revenue"
    EXPENDITURE = "expenditure"

# Transaction Create Schemas

class TransactionCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Transaction title",
        examples=["Monthly salary"],
    )

    amount: float | int = Field(
        ...,
        gt=0,
        le=5_000_000,
        description="Transaction amount",
        examples=[50000],
    )

    type: TransactionType = Field(
        ...,
        description="Transaction type",
        examples=["revenue"],
    )

    category: str | None = Field(
        default=None,
        max_length=100,
        description="Transaction category",
        examples=["Food"],
    )

    date: date = Field(
        ...,
        description="Transaction date",
        examples=["2026-08-15"],
    )


# Transaction Update Schemas

class TransactionUpdate(BaseModel):
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
        examples=["revenue"],
    )

    category: str | None = Field(
        default=None,
        max_length=100,
        description="Transaction category",
        examples=["Food"],
    )

    date:  date | None = Field(
        default=None,
        description="Transaction date",
        examples=["2026-08-15"],
    )