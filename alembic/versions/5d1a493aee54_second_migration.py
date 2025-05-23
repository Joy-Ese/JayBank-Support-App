"""Second migration

Revision ID: 5d1a493aee54
Revises: 1c4f0244fb4f
Create Date: 2025-04-11 11:46:56.138912

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d1a493aee54'
down_revision: Union[str, None] = '1c4f0244fb4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user_airesponses', sa.Column('query_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'user_airesponses', 'user_chats', ['query_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'user_airesponses', type_='foreignkey')
    op.drop_column('user_airesponses', 'query_id')
    # ### end Alembic commands ###
