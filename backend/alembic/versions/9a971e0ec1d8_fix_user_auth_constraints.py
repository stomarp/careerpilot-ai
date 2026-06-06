"""fix user auth constraints

Revision ID: 9a971e0ec1d8
Revises: a918f86399dc
Create Date: 2026-06-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9a971e0ec1d8"
down_revision: Union[str, Sequence[str], None] = "a918f86399dc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Allow users to register without requiring a name.
    op.alter_column(
        "users",
        "name",
        existing_type=sa.String(),
        nullable=True,
    )

    # Ensure email stays unique for register/login.
    op.create_index(
        "ix_users_email",
        "users",
        ["email"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_users_email", table_name="users")

    op.alter_column(
        "users",
        "name",
        existing_type=sa.String(),
        nullable=False,
    )
