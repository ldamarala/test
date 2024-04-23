from sqlalchemy import Column, String, Boolean, DateTime, func, Text

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    firstname = Column(String)
    lastname = Column(String)
    username = Column(String)
    email = Column(String)
    role = Column(String)
    disabled = Column(Boolean)
    hashed_password = Column(Text)
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # @classmethod
    # async def create(cls, db: AsyncSession, create_user: UserSchemaCreate,  id=None):
    #     if not id:
    #         id = uuid4().hex
    #
    #     salt = bcrypt.gensalt(rounds=15)
    #     hashed_password = bcrypt.hashpw(bytes(create_user.password, 'UTF-8'), salt)
    #     del create_user.password
    #     transaction = cls(id=id, hashed_password=hashed_password.decode("utf-8"), disabled=False, **create_user.dict())
    #     db.add(transaction)
    #     await db.commit()
    #     await db.refresh(transaction)
    #     return transaction

    # @classmethod
    # async def get(cls, db: AsyncSession, id: str):
    #     try:
    #         # transaction = await db.get(cls, id)
    #         return (await db.execute(select(cls).where(cls.id == id))).scalars().first()
    #     except NoResultFound:
    #         return None
    #
    # @classmethod
    # async def get_all(cls, db: AsyncSession):
    #     return (await db.execute(select(cls))).scalars().all()
    #
    # @classmethod
    # async def get_by_name(cls, db: AsyncSession, username: str):
    #     try:
    #         return (await db.execute(select(cls).where(cls.username == username))).scalars().first()
    #     except NoResultFound:
    #         return None
