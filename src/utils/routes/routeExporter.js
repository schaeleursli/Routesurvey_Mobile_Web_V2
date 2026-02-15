/**
 * Route Export Utilities
 * Converts route data to KML and GPX formats for export
 */

/**
 * Convert route data to KML format (Google Earth compatible)
 * @param {Object} routeData - Route data object
 * @param {Object} options - Export options
 * @returns {string} KML XML string
 */
export function exportToKML(routeData, options = {}) {
    const {
        name = 'Route',
        description = '',
        includeWaypoints = true,
        includeMetadata = true,
        color = 'ff0000ff', // ABGR format (red)
        width = 4
    } = options;

    const points = routeData.points || routeData.routePath || [];
    const waypoints = routeData.waypoints || [];
    const metadata = routeData.routeInfo || {};

    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXML(name)}</name>
    <description>${escapeXML(description)}</description>
    
    <!-- Styles -->
    <Style id="routeStyle">
      <LineStyle>
        <color>${color}</color>
        <width>${width}</width>
      </LineStyle>
    </Style>
    
    <Style id="waypointStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="startStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="endStyle">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
`;

    // Add metadata as description if requested
    if (includeMetadata && Object.keys(metadata).length > 0) {
        kml += `    <Placemark>
      <name>Route Information</name>
      <description>
        <![CDATA[
          ${formatMetadataHTML(metadata)}
        ]]>
      </description>
    </Placemark>
`;
    }

    // Add route line
    if (points.length > 0) {
        kml += `    <Placemark>
      <name>Route Path</name>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <coordinates>
`;
        points.forEach(point => {
            const lat = Array.isArray(point) ? point[0] : point.lat;
            const lng = Array.isArray(point) ? point[1] : point.lng;
            const alt = point.alt || 0;
            kml += `          ${lng},${lat},${alt}\n`;
        });
        kml += `        </coordinates>
      </LineString>
    </Placemark>
`;
    }

    // Add start point
    if (routeData.startPoint || (points.length > 0)) {
        const start = routeData.startPoint || (Array.isArray(points[0])
            ? { lat: points[0][0], lng: points[0][1] }
            : points[0]);
        kml += createPlacemark('Start Point', start, 'startStyle', start.display_name || '');
    }

    // Add end point
    if (routeData.endPoint || (points.length > 1)) {
        const end = routeData.endPoint || (Array.isArray(points[points.length - 1])
            ? { lat: points[points.length - 1][0], lng: points[points.length - 1][1] }
            : points[points.length - 1]);
        kml += createPlacemark('End Point', end, 'endStyle', end.display_name || '');
    }

    // Add waypoints
    if (includeWaypoints && waypoints.length > 0) {
        waypoints.forEach((waypoint, index) => {
            const name = waypoint.name || `Waypoint ${index + 1}`;
            const description = waypoint.description || waypoint.display_name || '';
            kml += createPlacemark(name, waypoint, 'waypointStyle', description);
        });
    }

    // Add POIs if present
    if (routeData.pois && routeData.pois.length > 0) {
        routeData.pois.forEach((poi, index) => {
            const name = poi.name || `POI ${index + 1}`;
            const description = poi.description || '';
            kml += createPlacemark(name, poi, 'waypointStyle', description);
        });
    }

    kml += `  </Document>
</kml>`;

    return kml;
}

/**
 * Convert route data to GPX format (GPS device compatible)
 * @param {Object} routeData - Route data object
 * @param {Object} options - Export options
 * @returns {string} GPX XML string
 */
export function exportToGPX(routeData, options = {}) {
    const {
        name = 'Route',
        description = '',
        includeWaypoints = true,
        includeMetadata = true
    } = options;

    const points = routeData.points || routeData.routePath || [];
    const waypoints = routeData.waypoints || [];
    const metadata = routeData.routeInfo || {};

    const timestamp = new Date().toISOString();

    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" 
     creator="RSConsole Route Editor"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  
  <metadata>
    <name>${escapeXML(name)}</name>
    <desc>${escapeXML(description)}</desc>
    <time>${timestamp}</time>
`;

    if (includeMetadata && Object.keys(metadata).length > 0) {
        gpx += `    <extensions>
${formatMetadataGPX(metadata)}
    </extensions>
`;
    }

    gpx += `  </metadata>
`;

    // Add waypoints
    if (includeWaypoints) {
        // Start point as waypoint
        if (routeData.startPoint) {
            gpx += createWaypoint(routeData.startPoint, 'Start Point', routeData.startPoint.display_name);
        }

        // Regular waypoints
        waypoints.forEach((waypoint, index) => {
            const name = waypoint.name || `WPT${String(index + 1).padStart(3, '0')}`;
            const description = waypoint.description || waypoint.display_name || '';
            gpx += createWaypoint(waypoint, name, description);
        });

        // End point as waypoint
        if (routeData.endPoint) {
            gpx += createWaypoint(routeData.endPoint, 'End Point', routeData.endPoint.display_name);
        }

        // POIs as waypoints
        if (routeData.pois && routeData.pois.length > 0) {
            routeData.pois.forEach((poi, index) => {
                const name = poi.name || `POI${String(index + 1).padStart(3, '0')}`;
                const description = poi.description || '';
                gpx += createWaypoint(poi, name, description);
            });
        }
    }

    // Add route
    if (points.length > 0) {
        gpx += `  <rte>
    <name>${escapeXML(name)}</name>
    <desc>${escapeXML(description)}</desc>
`;
        points.forEach((point, index) => {
            const lat = Array.isArray(point) ? point[0] : point.lat;
            const lng = Array.isArray(point) ? point[1] : point.lng;
            const ele = point.ele || point.alt || 0;
            gpx += `    <rtept lat="${lat}" lon="${lng}">
      <ele>${ele}</ele>
      <name>PT${String(index + 1).padStart(3, '0')}</name>
    </rtept>
`;
        });
        gpx += `  </rte>
`;
    }

    // Add track (more detailed than route)
    if (points.length > 0) {
        gpx += `  <trk>
    <name>${escapeXML(name)} Track</name>
    <desc>${escapeXML(description)}</desc>
    <trkseg>
`;
        points.forEach(point => {
            const lat = Array.isArray(point) ? point[0] : point.lat;
            const lng = Array.isArray(point) ? point[1] : point.lng;
            const ele = point.ele || point.alt || 0;
            gpx += `      <trkpt lat="${lat}" lon="${lng}">
        <ele>${ele}</ele>
        <time>${timestamp}</time>
      </trkpt>
`;
        });
        gpx += `    </trkseg>
  </trk>
`;
    }

    gpx += `</gpx>`;

    return gpx;
}

/**
 * Download route data as a file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/xml') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export route to KML file
 * @param {Object} routeData - Route data
 * @param {string} filename - Filename (without extension)
 * @param {Object} options - Export options
 */
export function downloadAsKML(routeData, filename = 'route', options = {}) {
    const kml = exportToKML(routeData, options);
    downloadFile(kml, `${filename}.kml`, 'application/vnd.google-earth.kml+xml');
}

/**
 * Export route to GPX file
 * @param {Object} routeData - Route data
 * @param {string} filename - Filename (without extension)
 * @param {Object} options - Export options
 */
export function downloadAsGPX(routeData, filename = 'route', options = {}) {
    const gpx = exportToGPX(routeData, options);
    downloadFile(gpx, `${filename}.gpx`, 'application/gpx+xml');
}

// Helper Functions

function escapeXML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function createPlacemark(name, point, styleUrl, description = '') {
    const lat = point.lat;
    const lng = point.lng;
    const alt = point.alt || 0;

    return `    <Placemark>
      <name>${escapeXML(name)}</name>
      ${description ? `<description>${escapeXML(description)}</description>` : ''}
      <styleUrl>#${styleUrl}</styleUrl>
      <Point>
        <coordinates>${lng},${lat},${alt}</coordinates>
      </Point>
    </Placemark>
`;
}

function createWaypoint(point, name, description = '') {
    const lat = point.lat;
    const lng = point.lng;
    const ele = point.ele || point.alt || 0;

    return `  <wpt lat="${lat}" lon="${lng}">
    <ele>${ele}</ele>
    <name>${escapeXML(name)}</name>
    ${description ? `<desc>${escapeXML(description)}</desc>` : ''}
  </wpt>
`;
}

function formatMetadataHTML(metadata) {
    let html = '<table border="1" cellpadding="5">';
    for (const [key, value] of Object.entries(metadata)) {
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        html += `<tr><td><b>${label}</b></td><td>${value}</td></tr>`;
    }
    html += '</table>';
    return html;
}

function formatMetadataGPX(metadata) {
    let xml = '';
    for (const [key, value] of Object.entries(metadata)) {
        xml += `      <${key}>${escapeXML(String(value))}</${key}>\n`;
    }
    return xml;
}
