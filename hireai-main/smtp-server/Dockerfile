FROM python:3.10-slim

WORKDIR /src

COPY . /src

RUN pip install -r requirements.txt \
    && rm -rf /root/.cache/pip

EXPOSE 3000
EXPOSE 3025

CMD ["python", "app/main.py"]