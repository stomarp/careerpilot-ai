"""add user auth fields

Revision ID: a918f86399dc
Revises: 92b8c8eeb166
Create Date: 2026-06-05 17:32:02.354399

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a918f86399dc"
down_revision: Union[str, Sequence[str], None] = "92b8c8eeb166"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Preserve existing user data by renaming full_name to name.
    op.alter_column(
        "users",
        "full_name",
        new_column_name="name",
        existing_type=sa.String(),
        existing_nullable=True,
    )

    # Add password field for email/password authentication.
    # Nullable for now because existing demo users may not have passwords.
    op.add_column(
        "users",
        sa.Column("hashed_password", sa.String(), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "hashed_password")

    op.alter_column(
        "users",
        "name",
        new_column_name="full_name",
        existing_type=sa.String(),
        existing_nullable=True,
    )
