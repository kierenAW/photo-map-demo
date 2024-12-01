# Use Python slim image for smaller container size
FROM python:3.9-slim

# Set working directory in container
WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create photos directory for volume mount
RUN mkdir -p photos

# Container runs on port 5000
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
