FROM python:3.10-slim

WORKDIR /src

COPY . /src

RUN apt update && apt install -y libsm6 libxext6 ffmpeg libfontconfig1 libxrender1 libgl1-mesa-glx

RUN pip install -r requirements.txt

#RUN pip install -r requirements.txt \
#    && rm -rf /root/.cache/pip

CMD ["celery", "-A", "app.tasks", "worker", "--loglevel=INFO"]
