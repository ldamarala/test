from pydantic import BaseModel, ConfigDict


class JobSchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str | None = None
    summary: str | None = None
    responsibilities: str | None = None
    qualifications: str | None = None
    requirements: str | None = None
    key_competencies: str | None = None
    job_locations: str | None = None
    hiring_manager_id: str
    recruiter_id: str
    inactive: bool


class JobSchemaCreate(JobSchemaBase):
    pass


class JobSchemaUpdate(JobSchemaBase):
    pass


class JobSchema(JobSchemaBase):
    id: str

