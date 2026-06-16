"""add application packs table

Revision ID: b7a8c9d0e1f2
Revises: 9a971e0ec1d8
Create Date: 2026-06-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b7a8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "9a971e0ec1d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_packs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=True),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=True),
        sa.Column("role_title", sa.String(length=255), nullable=False),
        sa.Column("pack_type", sa.String(length=80), nullable=False, server_default="full_pack"),
        sa.Column("ats_score", sa.Integer(), nullable=True),
        sa.Column("decision", sa.String(length=120), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content_markdown", sa.Text(), nullable=False),
        sa.Column("artifacts", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["job_descriptions.id"]),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_application_packs_id"), "application_packs", ["id"], unique=False)
    op.create_index(op.f("ix_application_packs_user_id"), "application_packs", ["user_id"], unique=False)
    op.create_index(op.f("ix_application_packs_job_id"), "application_packs", ["job_id"], unique=False)
    op.create_index(op.f("ix_application_packs_resume_id"), "application_packs", ["resume_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_application_packs_resume_id"), table_name="application_packs")
    op.drop_index(op.f("ix_application_packs_job_id"), table_name="application_packs")
    op.drop_index(op.f("ix_application_packs_user_id"), table_name="application_packs")
    op.drop_index(op.f("ix_application_packs_id"), table_name="application_packs")
    op.drop_table("application_packs")
