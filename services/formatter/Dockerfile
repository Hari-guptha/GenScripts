FROM python:3.12-slim

# Install LaTeX for PDF compilation
RUN apt-get update && apt-get install -y \
    texlive-full \
    pandoc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
