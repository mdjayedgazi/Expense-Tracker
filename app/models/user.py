from typing import TYPE_CHECKING

from sqlalchemy import Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction


class User(Base):
    """A user of the expense tracker."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Identity(start=101),
        primary_key=True,
    )

    username: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        unique=True,
        index=True,
    )

    # Only the password hash is stored, never the plain-text password.
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # A user can have many transactions.
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="owner",
    )
