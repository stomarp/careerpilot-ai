"""expand application tracker fields

Revision ID: 78ed9832b0b5
Revises: a2ddabc53c50
Create Date: 2026-06-04 23:54:33.727900

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "78ed9832b0b5"
down_revision: Union[str, Sequence[str], None] = "a2ddabc53c50"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add renamed columns as nullable first so existing rows do not break migration.
    op.add_column("applications", sa.Column("company_name", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("role_title", sa.String(), nullable=True))

    op.add_column("applications", sa.Column("job_url", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("job_location", sa.String(), nullable=True))
    op.add_column(
        "applications",
        sa.Column("priority", sa.String(), server_default="medium", nullable=False),
    )
    op.add_column("applications", sa.Column("source", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("work_type", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("employment_type", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("salary_min", sa.Integer(), nullable=True))
    op.add_column("applications", sa.Column("salary_max", sa.Integer(), nullable=True))
    op.add_column(
        "applications",
        sa.Column("salary_currency", sa.String(), server_default="USD", nullable=True),
    )
    op.add_column("applications", sa.Column("resume_id", sa.Integer(), nullable=True))
    op.add_column(
        "applications",
        sa.Column("job_description_id", sa.Integer(), nullable=True),
    )
    op.add_column("applications", sa.Column("ats_score", sa.Integer(), nullable=True))
    op.add_column("applications", sa.Column("match_score", sa.Float(), nullable=True))
    op.add_column("applications", sa.Column("recruiter_name", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("recruiter_email", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("contact_person", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("saved_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("applied_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("oa_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("interview_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("follow_up_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("decision_date", sa.Date(), nullable=True))
    op.add_column("applications", sa.Column("next_action", sa.String(), nullable=True))
    op.add_column(
        "applications",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
    )

    # Copy old data into new renamed columns.
    op.execute("UPDATE applications SET company_name = company WHERE company_name IS NULL")
    op.execute("UPDATE applications SET role_title = role WHERE role_title IS NULL")

    # Make required fields non-null after copying old data.
    op.alter_column("applications", "company_name", nullable=False)
    op.alter_column("applications", "role_title", nullable=False)

    # Normalize old status values if needed.
    op.execute("UPDATE applications SET status = 'applied' WHERE status = 'Applied'")
    op.execute("UPDATE applications SET status = 'saved' WHERE status IS NULL")

    op.alter_column(
        "applications",
        "status",
        existing_type=sa.String(),
        nullable=False,
        server_default="saved",
    )

    op.create_index(op.f("ix_applications_id"), "applications", ["id"], unique=False)

    op.create_foreign_key(
        "fk_applications_resume_id_resumes",
        "applications",
        "resumes",
        ["resume_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_applications_job_description_id_job_descriptions",
        "applications",
        "job_descriptions",
        ["job_description_id"],
        ["id"],
    )

    # Drop old renamed columns after data copy.
    op.drop_column("applications", "company")
    op.drop_column("applications", "role")


def downgrade() -> None:
    # Recreate old columns as nullable first.
    op.add_column("applications", sa.Column("company", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("role", sa.String(), nullable=True))

    # Copy data back.
    op.execute("UPDATE applications SET company = company_name WHERE company IS NULL")
    op.execute("UPDATE applications SET role = role_title WHERE role IS NULL")

    op.alter_column("applications", "company", nullable=False)
    op.alter_column("applications", "role", nullable=False)

    op.drop_constraint(
        "fk_applications_job_description_id_job_descriptions",
        "applications",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_applications_resume_id_resumes",
        "applications",
        type_="foreignkey",
    )

    op.drop_index(op.f("ix_applications_id"), table_name="applications")

    op.alter_column(
        "applications",
        "status",
        existing_type=sa.String(),
        nullable=True,
        server_default=None,
    )

    op.drop_column("applications", "updated_at")
    op.drop_column("applications", "next_action")
    op.drop_column("applications", "decision_date")
    op.drop_column("applications", "follow_up_date")
    op.drop_column("applications", "interview_date")
    op.drop_column("applications", "oa_date")
    op.drop_column("applications", "applied_date")
    op.drop_column("applications", "saved_date")
    op.drop_column("applications", "contact_person")
    op.drop_column("applications", "recruiter_email")
    op.drop_column("applications", "recruiter_name")
    op.drop_column("applications", "match_score")
    op.drop_column("applications", "ats_score")
    op.drop_column("applications", "job_description_id")
    op.drop_column("applications", "resume_id")
    op.drop_column("applications", "salary_currency")
    op.drop_column("applications", "salary_max")
    op.drop_column("applications", "salary_min")
    op.drop_column("applications", "employment_type")
    op.drop_column("applications", "work_type")
    op.drop_column("applications", "source")
    op.drop_column("applications", "priority")
    op.drop_column("applications", "job_location")
    op.drop_column("applications", "job_url")
    op.drop_column("applications", "role_title")
    op.drop_column("applications", "company_name")
