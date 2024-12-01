#!/usr/bin/env python3
"""
Photo Map Demonstration
A Flask application that demonstrates how to display photos on an interactive map
using GPS coordinates from EXIF data.
"""

from flask import Flask, render_template, jsonify, send_from_directory
import os
import json
import exifread
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

app = Flask(__name__)

# Photos directory is mounted as a volume in Docker
PHOTOS_DIR = 'photos'
if not os.path.exists(PHOTOS_DIR):
    os.makedirs(PHOTOS_DIR)

# File security
ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif'}

def is_allowed_file(filename):
    """Validate file extensions for security"""
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_degrees(value):
    d = float(value.values[0].num) / float(value.values[0].den)
    m = float(value.values[1].num) / float(value.values[1].den)
    s = float(value.values[2].num) / float(value.values[2].den)
    return d + (m / 60.0) + (s / 3600.0)

def get_photo_info(photo_path):
    try:
        with open(photo_path, 'rb') as f:
            tags = exifread.process_file(f)
            
            # Get GPS coordinates
            if 'GPS GPSLatitude' in tags and 'GPS GPSLongitude' in tags:
                lat = convert_to_degrees(tags['GPS GPSLatitude'])
                lng = convert_to_degrees(tags['GPS GPSLongitude'])
                
                # Account for GPS reference directions
                if 'GPS GPSLatitudeRef' in tags and tags['GPS GPSLatitudeRef'].values[0] != 'N':
                    lat = -lat
                if 'GPS GPSLongitudeRef' in tags and tags['GPS GPSLongitudeRef'].values[0] != 'E':
                    lng = -lng
                    
                # Extract comments and other EXIF data
                comments = str(tags.get('Image ImageDescription', ''))
                date_time = str(tags.get('EXIF DateTimeOriginal', ''))
                make = str(tags.get('Image Make', ''))
                model = str(tags.get('Image Model', ''))
                
                return {
                    'lat': lat,
                    'lng': lng,
                    'comments': comments,
                    'date_time': date_time,
                    'camera': f"{make} {model}".strip()
                }
    except Exception as e:
        print(f"Error processing {photo_path}: {str(e)}")
    return None

def get_exif_data():
    """Scan photos directory and extract EXIF data"""
    photos = []
    total_lat = 0
    total_lon = 0
    count = 0

    for filename in os.listdir(PHOTOS_DIR):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            filepath = os.path.join(PHOTOS_DIR, filename)
            photo_info = get_photo_info(filepath)
            if photo_info:
                lat, lng = photo_info['lat'], photo_info['lng']
                total_lat += lat
                total_lon += lng
                count += 1
                photos.append({
                    'filename': filename,
                    'title': os.path.splitext(filename)[0],
                    'lat': lat,
                    'lng': lng,
                    'comments': photo_info['comments'],
                    'date_time': photo_info['date_time'],
                    'camera': photo_info['camera']
                })
    # Calculate average coordinates
    center = {
        'lat': total_lat / count if count > 0 else 0,  # Default to world center
        'lng': total_lon / count if count > 0 else 0
    }

    return photos, center

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/photos')
def get_photos():
    photos, center = get_exif_data()
    return jsonify({'photos': photos, 'center': center})

@app.route('/photos/<path:filename>')
def serve_photo(filename):
    if not is_allowed_file(filename):
        return "Invalid file type", 400
    if '..' in filename or filename.startswith('/'):
        return "Invalid file path", 400
    return send_from_directory(PHOTOS_DIR, filename)

if __name__ == '__main__':
    # Running in Docker container, exposed on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
