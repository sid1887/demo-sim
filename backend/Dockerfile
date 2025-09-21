FROM python:3.10-slim
WORKDIR /app
COPY ./app /app/app
RUN pip install --upgrade pip
RUN pip install -r /app/requirements.txt || true
# Note: NgSpice must be installed on host or via extra apt packages; it's non-trivial inside slim image.
EXPOSE 8000
CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
