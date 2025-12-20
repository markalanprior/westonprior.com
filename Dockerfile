FROM python:3.11-alpine

WORKDIR /app

COPY index.html styles.css locker.jpg ./

EXPOSE 3000

CMD ["python", "-m", "http.server", "3000"]

