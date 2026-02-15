# KML Import Functionality

This implementation adds KML file import capability to the Route Survey application with comprehensive point type support.

## Features

### 1. KML Parser (`src/utils/kml_parser.js`)
- Parses KML files and extracts route data
- Supports point extraction with coordinates and metadata
- **Advanced point type mapping** with specific data structure support
- Handles different point types based on style URLs
- Extracts route path from LineString elements
- Parses HTML descriptions for additional point data
- **Intelligent data mapping** for each point type

### 2. Import Modal (`src/components/routes/KMLImportModal.vue`)
- Drag and drop file upload interface
- File validation (KML files only)
- Preview of imported data before confirmation
- Error handling and user feedback
- Responsive design for mobile devices

### 3. Integration with Routes Page (`src/views/routes/Routes.vue`)
- Added "Import KML" button in the search bar area
- Modal integration for file upload
- Automatic route list refresh after import
- Success/error message handling

## Supported Point Types with Data Mapping

### Road Points (`#roadIcon`)
- **roadAddress**: Extracted from "Road" field
- **typeOfSurface**: Mapped from "Type of Surface" (Asphalt, Concrete, Gravel, etc.)
- **numberOfLines**: Extracted from "Number of lines"
- **roadWidth**: Extracted from "Road width"
- **pointNotes**: Extracted from "Point Notes"

### Railroad Points (`#railroadIcon`)
- **roadAddress**: Extracted from "Road" field
- **approach**: Mapped from "Approach" (Zig-zag, Split, Right hand side, See notes)
- **crossingNo**: Extracted from "Crossing #"
- **carrier**: Extracted from "Carrier"
- **heightRestriction**: Extracted from "Height Restriction"
- **roadWidth**: Extracted from "Road width"
- **crossingWidth**: Extracted from "Crossing Width"
- **slope**: Extracted from "Slope"
- **contactNo**: Extracted from "Contact #"
- **pointNotes**: Extracted from "Point Notes"

### Intersection Points (`#intersectionIcon`)
- **primaryRoadAddress**: Extracted from "Road" field
- **secondaryRoad**: Extracted from "Secondary Road"
- **typeOfIntersection**: Mapped from "Type of Intersection" (T-Intersection, Y-Intersection, etc.)
- **pointNotes**: Extracted from "Point Notes"

### Bridge Points (`#bridgeIcon`)
- **roadAddress**: Extracted from "Road" field
- **bridgeType**: Mapped from "Bridge Type" (Beam Bridge, Culvert Bridge, etc.)
- **overallLength**: Extracted from "Overall length"
- **condition**: Extracted from "Condition"
- **numberOfSpans**: Extracted from "Number of Spans"
- **pointNotes**: Extracted from "Point Notes"

### Powerline Points (`#powerlineIcon`)
- **roadAddress**: Extracted from "Road" field
- **typeOfPowerline**: Mapped from "Type of Powerline" (Low Voltage Line, Medium Voltage Line, etc.)
- **voltage**: Extracted from "Voltage"
- **heightAboveGround**: Extracted from "Height Above Ground"
- **pointNotes**: Extracted from "Point Notes"

### Overhead Points (`#overheadIcon`)
- **roadAddress**: Extracted from "Road" field
- **typeOfObstruction**: Mapped from "Type of Obstruction" (Traffic Sign, Traffic Light, etc.)
- **heightAboveGround**: Extracted from "Height Above Ground"
- **dismountable**: Boolean parsed from "Dismountable"
- **pointNotes**: Extracted from "Point Notes"

### Custom Points (`#customIcon`)
- **roadAddress**: Extracted from "Road" field
- **descriptionOfObstruction**: Extracted from "Description of Obstruction"
- **heightNotes**: Extracted from "Height Notes"
- **widthNotes**: Extracted from "Width Notes"
- **lengthNotes**: Extracted from "Length Notes"
- **areaNotes**: Extracted from "Area Notes"
- **groundNotes**: Extracted from "Ground Notes"
- **restrictionNotes**: Extracted from "Restriction Notes"
- **pointNotes**: Extracted from "Point Notes"

### Route Points (Start/End)
- **pointNotes**: Basic notes extraction
- **distance**: Distance calculation from coordinates

## Data Extraction Features

### HTML Table Parsing
- Extracts data from HTML tables in KML descriptions
- Maps table headers to appropriate field names
- Handles complex nested table structures
- Supports multiple tables per point

### Type Mapping
- **Surface Types**: Asphalt, Concrete, Gravel, Dirt, Composite, Other
- **Approach Types**: Zig-zag, Split, Right hand side, See notes
- **Intersection Types**: T-Intersection, Y-Intersection, Cross-Intersection, Roundabout
- **Bridge Types**: Beam Bridge, Culvert Bridge, Slab Bridge, Girder Bridge, Truss Bridge, Arch Bridge, Suspension Bridge
- **Powerline Types**: Low Voltage Line, Medium Voltage Line, High Voltage Line, Extreme High Voltage Line, Residential Power Line, Rail Overhead Line
- **Obstruction Types**: Traffic Sign, Traffic Light, Street Light, Bridge Underpass, Tunnel, Gas Line, Bill Board

### Distance Calculation
- Extracts distance from point names (e.g., "0.03 Km")
- Calculates total route distance from LineString coordinates
- Converts distance units appropriately

## Usage

1. Navigate to the Routes page
2. Click the "Import KML" button
3. Drag and drop a KML file or click to browse
4. Review the import preview showing route details and point count
5. Click "Import Route" to confirm and add the route to your list

## Technical Details

### File Structure
```
src/
├── utils/
│   └── kml_parser.js          # Enhanced KML parsing utility
├── components/routes/
│   └── KMLImportModal.vue     # Import modal component
└── views/routes/
    └── Routes.vue             # Updated routes page
```

### Key Functions
- `KMLParser.parseKMLFile()` - Main parsing function
- `KMLParser.parsePlacemark()` - Extract point data with type-specific mapping
- `KMLParser.parseLineString()` - Extract route path
- `KMLParser.determinePointType()` - Map style URLs to point types
- `KMLParser.parseDescription()` - Extract and map data from HTML descriptions
- `KMLParser.mapDataToPointType()` - Map extracted data to point type structure
- `KMLParser.mapSurfaceType()` - Map surface types to application values
- `KMLParser.mapApproachType()` - Map approach types to application values
- `KMLParser.mapIntersectionType()` - Map intersection types to application values
- `KMLParser.mapBridgeType()` - Map bridge types to application values
- `KMLParser.mapPowerlineType()` - Map powerline types to application values
- `KMLParser.mapObstructionType()` - Map obstruction types to application values

### Error Handling
- Invalid XML format detection
- Missing Document element validation
- File type validation (.kml extension)
- Network error handling during import
- User-friendly error messages
- Graceful fallback for missing data

## Browser Compatibility

- Modern browsers with FileReader API support
- Drag and drop functionality
- XML parsing capabilities
- ES6+ features (arrow functions, template literals, etc.)

## Future Enhancements

- Support for KMZ files (compressed KML)
- Batch import functionality
- Import progress indicators
- Custom point type mapping configuration
- Export imported routes back to KML
- Support for additional KML elements (Polygons, MultiGeometry)
- Advanced coordinate transformation support 