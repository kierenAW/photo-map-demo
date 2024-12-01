// Initialize the map with a default center (will be updated when photos load)
const map = L.map('map').setView([0, 0], 2);

// Add the OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ' OpenStreetMap contributors'
}).addTo(map);

// Create a custom red circle icon
const redCircleIcon = {
    radius: 17,
    fillColor: "#ff0000",
    color: "#fff",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
};

// Store markers globally so we can access them when clicking sidebar items
const markers = new Map();

// Function to create the photo list in the sidebar
function createPhotoList(photos) {
    const photoList = document.getElementById('photo-list');
    photoList.innerHTML = ''; // Clear existing content

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-filename', photo.filename);
        photoItem.innerHTML = `
            <img src="/photos/${photo.filename}" alt="${photo.title || 'Photo'}">
            <p>${photo.title || 'Photo'}</p>
        `;

        // Add click event to center map and open popup
        photoItem.addEventListener('click', () => {
            const marker = markers.get(photo.filename);
            if (marker) {
                handlePhotoSelection(photo, marker);
            }
        });

        photoList.appendChild(photoItem);
    });
}

// Function to highlight a photo in the list
function highlightPhotoInList(filename) {
    // Remove highlight from all photos
    document.querySelectorAll('.photo-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Find and highlight the selected photo
    const photoItem = document.querySelector(`.photo-item[data-filename="${filename}"]`);
    if (photoItem) {
        photoItem.classList.add('selected');
        // Scroll the item into view with smooth animation
        photoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Function to center map on a photo location
function centerMapOnPhoto(lat, lng) {
    map.setView([lat, lng], 19, {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.5
    });
}

// Function to handle photo selection (both from marker and list)
function handlePhotoSelection(photo, marker) {
    // Center the map first
    centerMapOnPhoto(photo.lat, photo.lng);
    
    // Then open popup and highlight
    setTimeout(() => {
        marker.openPopup();
        highlightPhotoInList(photo.filename);
    }, 100);
}

// Function to load and display photo markers
async function loadPhotoMarkers() {
    try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.photos || !Array.isArray(data.photos)) {
            throw new Error('Invalid photo data received');
        }
        
        const photos = data.photos;
        const center = data.center || { lat: 0, lng: 0 };  // Default to world center
        
        // Center the map on the average coordinates of photos
        map.setView([center.lat, center.lng], 12);
        
        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers.clear();
        
        if (photos.length === 0) {
            console.log('No photos with GPS data found');
            return;
        }
        
        photos.forEach((photo, index) => {
            if (!photo.lat || !photo.lng) {
                console.log(`Missing coordinates for photo: ${photo.filename}`);
                return;
            }
            
            const marker = L.circleMarker([photo.lat, photo.lng], redCircleIcon).addTo(map);
            
            // Create popup content with EXIF info
            const popupContent = `
                <div class="popup-content">
                    <img src="/photos/${photo.filename}" alt="${photo.title}" style="width:100%; max-width:300px;">
                    <h3>${photo.title}</h3>
                    ${photo.comments ? `<p><strong>Comments:</strong> ${photo.comments}</p>` : ''}
                    ${photo.date_time ? `<p><strong>Date:</strong> ${photo.date_time}</p>` : ''}
                    ${photo.camera ? `<p><strong>Camera:</strong> ${photo.camera}</p>` : ''}
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            // Add click event to center map and open popup
            marker.on('click', () => {
                handlePhotoSelection(photo, marker);
            });

            // Store marker reference
            markers.set(photo.filename, marker);

            // Open first photo's popup
            if (index === 0) {
                setTimeout(() => {
                    handlePhotoSelection(photo, marker);
                }, 500);
            }
        });

        // Create the photo list in the sidebar
        createPhotoList(photos);
        
    } catch (error) {
        console.error('Error loading photo data:', error);
        // Optionally show user-friendly error message
        alert('Error loading photos. Please try refreshing the page.');
    }
}

// Load markers when the page loads
document.addEventListener('DOMContentLoaded', loadPhotoMarkers);
