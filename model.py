from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.Text)
    password = db.Column(db.Text)
    session_token = db.Column(db.Text)
    access_token = db.Column(db.Text)
    share_list = db.Column(db.Text)
    create_time = db.Column(db.DateTime)
    update_time = db.Column(db.DateTime)
    shared = db.Column(db.Integer)

    def __repr__(self):
        return '<User %r>' % (self.username)
