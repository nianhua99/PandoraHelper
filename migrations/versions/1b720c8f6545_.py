"""empty message

Revision ID: 1b720c8f6545
Revises:
Create Date: 2023-12-30 15:27:33.599980

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '1b720c8f6545'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 获取当前绑定的引擎
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)

    # 检查users表是否存在
    if 'users' in inspector.get_table_names():
        # 获取users表的列名
        columns = [column['name'] for column in inspector.get_columns('users')]
        # 如果refresh_token列不存在，则添加它
        if 'refresh_token' not in columns:
            op.add_column('users', sa.Column('refresh_token', sa.Text(), nullable=True))
    else:
        # 如果users表不存在，创建它，确保包括所有字段
        op.create_table('users',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('email', sa.Text(), nullable=True),
            sa.Column('password', sa.Text(), nullable=True),
            sa.Column('session_token', sa.Text(), nullable=True),
            sa.Column('access_token', sa.Text(), nullable=True),
            sa.Column('share_list', sa.Text(), nullable=True),
            sa.Column('create_time', sa.DateTime(), nullable=True),
            sa.Column('update_time', sa.DateTime(), nullable=True),
            sa.Column('shared', sa.Integer(), nullable=True),
            sa.Column('refresh_token', sa.Text(), nullable=True)  # 新增的refresh_token字段
        )


def downgrade():
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)

    # 如果users表存在，尝试移除refresh_token列
    if 'users' in inspector.get_table_names():
        if 'refresh_token' in [column['name'] for column in inspector.get_columns('users')]:
            op.drop_column('users', 'refresh_token')