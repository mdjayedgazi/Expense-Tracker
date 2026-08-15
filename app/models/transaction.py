from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.user import User


class Transaction(Base):
    """An income or expense entry owned by a user."""

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        Identity(start=1),
        primary_key=True,
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # "income" or "expense".
    type: Mapped[str] = mapped_column(
        String(7),
        nullable=False,
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    # Every transaction belongs to exactly one user.
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        "User",
        back_populates="transactions",
    )
