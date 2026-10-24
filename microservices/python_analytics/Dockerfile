FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY service.py server.py ./
RUN useradd --system --shell /usr/sbin/nologin app
USER app
EXPOSE 8082
CMD ["gunicorn", "--bind", "0.0.0.0:8082", "--workers", "2", "--timeout", "60", "server:app"]
