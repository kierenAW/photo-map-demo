# Photo Map Demonstration

An interactive web application demo that displays photos on a map based on their GPS coordinates from EXIF data. This demonstration shows how to build a photo-based mapping application using Flask and Leaflet.js.

## ⚠️ Disclaimer

**USE AT YOUR OWN RISK**: This software is provided "as is", without warranty of any kind. By using this demonstration, you assume all risks associated with its use.

This is a demonstration project intended for educational purposes only:

- **Not Production Ready**: This application is a proof-of-concept and should not be used in production without significant security enhancements.
- **Security Considerations**: Additional security measures would be needed for a production environment, including proper authentication, input validation, and rate limiting.
- **Data Privacy**: This demo processes EXIF data which may contain sensitive information. In a production environment, ensure proper data handling and privacy measures are implemented.
- **Performance**: The current implementation is optimized for demonstration purposes and may not scale well with large datasets.
- **Maintenance**: This is a demonstration project and may not receive regular or any updates and/or security patches.

## Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/tba.git
cd photo-map-demo
```

2. Create a photos directory and add your photos:
```bash
mkdir photos
# Add your photos with GPS EXIF data to the photos directory
```

3. Build and run with Docker:
```bash
# Build the container
docker build -t photo-map-demo .

# Run the container
docker run -p 5001:5000 -v $(pwd)/photos:/app/photos photo-map-demo
```

4. Open `http://localhost:5001` in your browser

## Features

- **Interactive Map Interface**
  - Displays photos as small red circle markers (17px radius)
  - Precise centering on selected poles with zoom level 19
  - Smooth animations for map transitions
  - Auto-centers on the average location of all photos on load
  - First photo popup opens automatically

- **Photo Sidebar**
  - Displays thumbnails (150px height) and titles of all photos
  - Click any photo to center the map and view it
  - Selected photos are highlighted with red border
  - Auto-scrolls to show selected photo
  - Scrollable list for handling many photos

- **Photo Information Display**
  - Shows full-size photo in popup (max width 300px)
  - Displays EXIF metadata:
    - Photo title
    - Comments/Description
    - Date and time taken
    - Camera make and model
  - Popups open automatically when selecting photos

- **Photo Management**
  - Automatically reads GPS coordinates from photo EXIF data
  - Supports JPG, JPEG, PNG, and GIF formats
  - Preserves original photo quality
  - Efficient photo serving with proper caching

## Technical Architecture

### Container Structure
- Python Flask application running in a Docker container
- Photos mounted as a volume for easy updates
- Exposed on port 5000 (container) mapped to 5001 (host)
- Built on Python 3.9-slim base image for minimal size

### Backend (Python/Flask)
- Flask web server handles routing and API endpoints
- Automatic EXIF data extraction including:
  - GPS coordinates
  - Image descriptions
  - Camera information
  - Timestamps
- Dynamic photo location calculation
- Efficient photo serving with caching

### Frontend (JavaScript/Leaflet.js)
- Interactive map powered by Leaflet.js
- Custom marker styling with circle markers
- Smooth animations for map interactions
- Responsive sidebar layout
- Real-time photo highlighting and centering

## Development with Docker

### Building the Container
```bash
docker build -t photo-map-demo .
```

### Running the Container
```bash
# Basic run
docker run -p 5001:5000 -v $(pwd)/photos:/app/photos photo-map-demo

# Run in detached mode
docker run -d -p 5001:5000 -v $(pwd)/photos:/app/photos photo-map-demo

# Run with custom port
docker run -p 8080:5000 -v $(pwd)/photos:/app/photos photo-map-demo
```

### Updating Photos
1. Add or remove photos in your local `photos` directory
2. The changes will be immediately reflected in the application
3. Photos must contain GPS EXIF data to be displayed

### Container Management
```bash
# List running containers
docker ps

# Stop the container
docker stop $(docker ps -q --filter ancestor=photo-map-demo)

# Remove old containers
docker container prune

# Rebuild after changes
docker build -t photo-map-demo .
```

## Directory Structure
```
photo-map-demo/
├── app.py              # Flask application
├── Dockerfile          # Container configuration
├── requirements.txt    # Python dependencies
├── static/            # Static assets
│   └── js/
│       └── map.js    # Frontend JavaScript
├── templates/         # HTML templates
│   └── index.html
└── photos/           # Mount point for photos (create locally)
```

## Notes

- All photos must be mounted via Docker volume
- The application runs in a containerized environment
- No local Python installation required
- Container automatically handles all dependencies
- Photos directory is mounted as a volume for persistence

## Troubleshooting

### Common Docker Issues
1. Port already in use:
   ```bash
   docker stop $(docker ps -q --filter ancestor=photo-map-demo)
   ```

2. Photos not showing up:
   - Ensure photos directory is properly mounted
   - Check photo EXIF GPS data
   - Verify file permissions

3. Container won't start:
   ```bash
   # Check logs
   docker logs $(docker ps -q --filter ancestor=photo-map-demo)
   ```

## License

MIT License - See LICENSE file for details
