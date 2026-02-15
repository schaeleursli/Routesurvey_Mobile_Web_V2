import * as XLSX from "xlsx";
import { normalizeRoutePoints } from "@/utils/routeDataNormalizer";

class RouteUtils {
  async downloadKML(routePoints, routeName = "Route", imperial = false) {
    if (!routePoints || routePoints.length === 0) {
      throw new Error("No route points available");
    }

    routePoints = this.calculateRoutePointsDistances(routePoints);

    // console.log(routePoints);

    const kmlContent = this.generateKMLContent(
      routePoints,
      routeName,
      imperial
    );
    this.downloadFile(
      kmlContent,
      `${routeName}.kml`,
      "application/vnd.google-earth.kml+xml"
    );
  }

  async downloadGPX(routePoints, routeName = "Route") {
    if (!routePoints || routePoints.length === 0) {
      throw new Error("No route points available");
    }

    const gpxContent = this.generateGPXContent(routePoints, routeName);
    this.downloadFile(gpxContent, `${routeName}.gpx`, "application/gpx+xml");
  }

  async downloadGeoJSON(routePoints, routeName = "Route") {
    if (!routePoints || routePoints.length === 0) {
      throw new Error("No route points available");
    }

    const geojsonContent = this.generateGeoJSONContent(routePoints, routeName);
    this.downloadFile(
      geojsonContent,
      `${routeName}.geojson`,
      "application/geo+json"
    );
  }

  async downloadCSV(routePoints, routeName = "Route", imperial = false) {
    if (!routePoints || routePoints.length === 0) {
      throw new Error("No route points available");
    }

    const csvContent = this.generateCSVContent(
      routePoints,
      routeName,
      imperial
    );
    this.downloadFile(csvContent, `${routeName}_survey_data.csv`, "text/csv");
  }

  async downloadExcel(routePoints, routeName = "Route", imperial = false) {
    if (!routePoints || routePoints.length === 0) {
      throw new Error("No route points available");
    }

    routePoints = this.calculateRoutePointsDistances(routePoints);

    const excelContent = this.generateExcelContent(
      routePoints,
      routeName,
      imperial
    );
    this.downloadFile(
      excelContent,
      `${routeName}_survey_data.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }

  generateKMLContent(routePoints, routeName, imperial = false) {
    const coordinates = routePoints
      .map((point) => `${point.lng},${point.lat},0`)
      .join(" ");

    // Helper function to get units for different fields
    const getUnits = (fieldName) => {
      if (!imperial) {
        // Metric units
        const metricUnits = {
          heightRestriction: "m",
          roadWidth: "m",
          crossingWidth: "m",
          slope: "%",
          overallLength: "m",
          heightAboveGround: "m",
          voltage: "V",
          numberOfLines: "",
          numberOfSpans: "",
          crossingNo: "",
          contactNo: "",
          approach: "",
          carrier: "",
          roadAddress: "",
          primaryRoadAddress: "",
          secondaryRoad: "",
          typeOfSurface: "",
          typeOfIntersection: "",
          bridgeType: "",
          condition: "",
          typeOfPowerline: "",
          typeOfObstruction: "",
          dismountable: "",
          descriptionOfObstruction: "",
          heightNotes: "m",
          widthNotes: "m",
          lengthNotes: "m",
          areaNotes: "m²",
          groundNotes: "",
          restrictionNotes: "",
          pointNotes: "",
          note: "",
          type: "",
        };
        return metricUnits[fieldName] || "";
      } else {
        // Imperial units
        const imperialUnits = {
          heightRestriction: "ft",
          roadWidth: "ft",
          crossingWidth: "ft",
          slope: "%",
          overallLength: "ft",
          heightAboveGround: "ft",
          voltage: "V",
          numberOfLines: "",
          numberOfSpans: "",
          crossingNo: "",
          contactNo: "",
          approach: "",
          carrier: "",
          roadAddress: "",
          primaryRoadAddress: "",
          secondaryRoad: "",
          typeOfSurface: "",
          typeOfIntersection: "",
          bridgeType: "",
          condition: "",
          typeOfPowerline: "",
          typeOfObstruction: "",
          dismountable: "",
          descriptionOfObstruction: "",
          heightNotes: "ft",
          widthNotes: "ft",
          lengthNotes: "ft",
          areaNotes: "ft²",
          groundNotes: "",
          restrictionNotes: "",
          pointNotes: "",
          note: "",
          type: "",
        };
        return imperialUnits[fieldName] || "";
      }
    };

    // Generate individual point placemarks
    const pointPlacemarks = routePoints
      .filter((point) => point.type !== "route_point")
      .map((point, index) => {
        let parsedData;
        let pointName = ``;
        let pointDescription = point.type;

        if (point.type !== "route_point") {
          try {
            parsedData = JSON.parse(point.data);
            pointName = parsedData.type || point.type || `Point ${index + 1}`;
            // Make first letter in name capitalized
            pointName = pointName.charAt(0).toUpperCase() + pointName.slice(1);
            // Show distance next to name
            pointName += ` - ${(imperial
              ? point.distance / 1609.34
              : point.distance / 1000.0
            ).toFixed(1)} ${imperial ? "mi" : "km"}`;
            pointDescription =
              point.type.charAt(0).toUpperCase() + point.type.slice(1);

            // Helper to escape only ]]> which breaks CDATA, not other characters
            const escapeForCDATA = (text) => {
              if (!text) return "";
              return String(text).replace(/]]>/g, "]]&gt;");
            };

            // Helper to convert decimal degrees to degrees/minutes/seconds
            const toDMS = (decimal, isLatitude) => {
              const absolute = Math.abs(decimal);
              const degrees = Math.floor(absolute);
              const minutesFloat = (absolute - degrees) * 60;
              const minutes = Math.floor(minutesFloat);
              const seconds = (minutesFloat - minutes) * 60;

              let direction = "";
              if (isLatitude) {
                direction = decimal >= 0 ? "N" : "S";
              } else {
                direction = decimal >= 0 ? "E" : "W";
              }

              return `${degrees}&deg;${minutes}&apos;${seconds.toFixed(
                2
              )}&quot;${direction}`;
            };

            // Format distance
            const formatDistance = (distance) => {
              return `${(imperial
                ? distance / 1609.34
                : distance / 1000.0
              ).toFixed(2)} ${imperial ? "mi" : "km"}`;
            };

            // Get road address
            const getRoadAddress = () => {
              if (parsedData) {
                if (parsedData.roadAddress) {
                  return escapeForCDATA(parsedData.roadAddress);
                }
                if (parsedData.primaryRoadAddress) {
                  return escapeForCDATA(parsedData.primaryRoadAddress);
                }
              }
              return "";
            };

            // Format coordinates with Google Maps link
            const googleMapsUrl = `https://www.google.com/maps/place/${point.lat},${point.lng}/@${point.lat},${point.lng},data=!3m1!1e3`;
            const latDMS = toDMS(point.lat, true);
            const lngDMS = toDMS(point.lng, false);
            const coordLink = `<a style="font-size:14px;color:black;text-decoration: none" href="${escapeForCDATA(
              googleMapsUrl
            )}" target="_blank">${latDMS} ${lngDMS}</a>`;

            // Build table HTML
            let tableHTML = `<table class="route_data_table" border="1" cellpadding="8" cellspacing="0" style="width:100%;margin-bottom: 20px;">
        <thead>
        <tr>
            <td style="width:30%"><strong>Distance</strong></td>
            <td style=""><strong>GPS Position</strong></td>
            <td style=""><strong>Road</strong></td>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>${formatDistance(point.distance)}</td>
            <td style="white-space: nowrap;">${coordLink}</td>
            <td>${getRoadAddress()}</td>
        </tr>`;

            // Add photos as rows
            if (parsedData.media && Array.isArray(parsedData.media)) {
              const photos = parsedData.media.filter(
                (media) => media.type === "photo"
              );
              photos.forEach((photo) => {
                if (photo.url) {
                  const photoUrl = photo.url.replace(
                    "http://10.0.2.2",
                    "http://localhost"
                  );
                  tableHTML += `
            <tr>
                <td style="text-align:left; vertical-align:top"></td>
                <td colspan="2"><img alt="" src="${escapeForCDATA(
                  photoUrl
                )}" style="width:700px;" /></td>
            </tr>`;
                }
              });
            }

            // Add point details row
            let pointDetails = [];

            // Point type (capitalize first letter)
            const pointType =
              point.type.charAt(0).toUpperCase() + point.type.slice(1);
            pointDetails.push(
              `<p><strong>Point Type : </strong>${escapeForCDATA(
                pointType
              )}</p>`
            );

            // Add properties based on point type
            if (parsedData) {
              let additionalProps = [];

              if (point.type === "railroad") {
                additionalProps = [
                  "approach",
                  "crossingNo",
                  "carrier",
                  "heightRestriction",
                  "roadWidth",
                  "crossingWidth",
                  "slope",
                  "contactNo",
                  "pointNotes",
                ];
              } else if (point.type === "road") {
                additionalProps = [
                  "typeOfSurface",
                  "numberOfLines",
                  "roadWidth",
                  "pointNotes",
                ];
              } else if (point.type === "intersection") {
                additionalProps = [
                  "typeOfIntersection",
                  "secondaryRoad",
                  "pointNotes",
                ];
              } else if (point.type === "bridge") {
                additionalProps = [
                  "bridgeType",
                  "overallLength",
                  "condition",
                  "numberOfSpans",
                  "pointNotes",
                ];
              } else if (point.type === "powerline") {
                additionalProps = [
                  "typeOfPowerline",
                  "voltage",
                  "heightAboveGround",
                  "pointNotes",
                ];
              } else if (point.type === "overhead") {
                additionalProps = [
                  "typeOfObstruction",
                  "heightAboveGround",
                  "dismountable",
                  "pointNotes",
                ];
              } else if (point.type === "custom") {
                additionalProps = [
                  "descriptionOfObstruction",
                  "heightNotes",
                  "widthNotes",
                  "lengthNotes",
                  "areaNotes",
                  "groundNotes",
                  "restrictionNotes",
                  "pointNotes",
                ];
              }

              additionalProps.forEach((prop) => {
                if (
                  parsedData[prop] !== undefined &&
                  parsedData[prop] !== null &&
                  parsedData[prop] !== ""
                ) {
                  const units = getUnits(prop);

                  // Format label
                  let label =
                    prop.charAt(0).toUpperCase() +
                    prop.slice(1).replace(/([A-Z])/g, " $1");

                  // Format value with units
                  let value = "";
                  if (units) {
                    let unitDisplay = "";
                    if (units === "m") {
                      unitDisplay = "Meter";
                    } else if (units === "ft") {
                      unitDisplay = "Feet";
                    } else {
                      unitDisplay = units;
                    }
                    // Format numeric values with 2 decimal places if they're numbers
                    const numValue = parseFloat(parsedData[prop]);
                    if (!isNaN(numValue)) {
                      value = `${numValue.toFixed(2)} ${unitDisplay}`;
                    } else {
                      value = `${parsedData[prop]} ${unitDisplay}`;
                    }
                  } else {
                    // Special formatting for boolean fields
                    if (prop === "dismountable") {
                      value =
                        parsedData[prop] === true ||
                        parsedData[prop] === "yes" ||
                        parsedData[prop] === "Yes"
                          ? "Yes"
                          : "No";
                    } else {
                      value = String(parsedData[prop]);
                    }
                  }

                  pointDetails.push(
                    `<p><strong>${escapeForCDATA(
                      label
                    )} : </strong>${escapeForCDATA(value)}</p>`
                  );
                }
              });
            }

            // Add point details row
            tableHTML += `
        <tr>
            <td colspan="3">${pointDetails.join("")}</td>
        </tr>
        </tbody>
        </table>`;

            pointDescription = tableHTML;
            // console.log(pointDescription);
          } catch (error) {
            console.error("Error parsing point data:", error);
            pointName = point.type || `Point ${index + 1}`;
            pointDescription = `Route point ${index + 1} (Error parsing data)`;
          }
        }

        // console.log(pointDescription);

        // Ensure description is clean and properly formatted for Google Earth
        // Only escape ]]> sequences that would break CDATA, preserve table structure
        let cleanDescription = pointDescription.trim();
        if (!cleanDescription) {
          cleanDescription = `${point.type || "Point"} information`;
        }

        // Only escape ]]> sequences - preserve HTML table structure as-is
        cleanDescription = String(cleanDescription).replace(/]]>/g, "]]&gt;");

        return `
      <Placemark>
        <name>${this.escapeXml(pointName)}</name>
        <description><![CDATA[${cleanDescription}]]></description>
        <Point>
          <coordinates>${point.lng},${point.lat},120</coordinates>
          <altitudeMode>relativeToGround</altitudeMode>
          <extrude>1</extrude>
        </Point>
        ${
          point.type !== "route_point"
            ? `
        <Style>
          <IconStyle>
            <Icon>
              <href>${this.getIconForPointType(point.type)}</href>
            </Icon>
            <scale>1.0</scale>
          </IconStyle>
        </Style>`
            : `
        <Style>
          <IconStyle>
            <Icon>
              <href>http://maps.google.com/mapfiles/kml/paddle/white-dot.png</href>
            </Icon>
            <scale>0.5</scale>
          </IconStyle>
        </Style>`
        }
      </Placemark>`;
      })
      .join("");

    // console.log(pointPlacemarks);

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Folder>
      <name>${this.escapeXml(routeName)}</name>
      <description>Route exported from RouteSurvey</description>
      <Placemark>
        <name>Route Path</name>
        <description>Route path</description>
        <LineString>
          <coordinates>${coordinates}</coordinates>
        </LineString>
        <Style>
          <LineStyle>
            <color>ff0000ff</color>
            <width>4</width>
          </LineStyle>
        </Style>
      </Placemark>
      <Folder>
        <name>Points</name>
        <description>Survey points along the route</description>
        ${pointPlacemarks}
      </Folder>
    </Folder>
  </Document>
</kml>`;
  }

  getIconForPointType(pointType) {
    const iconMap = {
      // railroad: "https://img.icons8.com/color/48/train.png", // Train icon
      railroad: "https://console.routesurvey.app/img/railroad_c.png", // Train icon
      // road: "https://img.icons8.com/color/48/road.png", // Road icon
      road: "https://console.routesurvey.app/img/road_c.png", // Road icon
      // intersection: "https://img.icons8.com/color/48/intersection.png", // Intersection icon
      intersection: "https://console.routesurvey.app/img/intersection_c.png", // Intersection icon
      // bridge: "https://img.icons8.com/color/48/bridge.png", // Bridge icon
      bridge: "https://console.routesurvey.app/img/bridge_c.png", // Bridge icon
      // powerline: "https://img.icons8.com/color/48/electricity.png", // Power line icon
      powerline: "https://console.routesurvey.app/img/powerline_c.png", // Power line icon
      // overhead: "https://img.icons8.com/color/48/height.png", // Overhead obstruction icon
      overhead: "https://console.routesurvey.app/img/overhead_c.png", // Overhead obstruction icon
      // custom: "https://img.icons8.com/color/48/marker.png", // Custom marker icon
      custom: "https://console.routesurvey.app/img/custom_c.png", // Custom marker icon
      //   survey_point: "https://img.icons8.com/color/48/survey.png", // Survey equipment icon
      //   inspection_point: "https://img.icons8.com/color/48/search.png", // Inspection icon
      // default: "https://img.icons8.com/color/48/marker.png", // Default marker
      default: "https://console.routesurvey.app/img/oldpoint_c.png", // Default marker
    };

    return iconMap[pointType] || iconMap["default"];
  }

  generateGPXContent(routePoints, routeName) {
    const waypoints = routePoints
      .map((point, index) => {
        let pointName = `Point ${index + 1}`;
        let pointDesc = `Route point ${index + 1}`;
        let parsedData = null;

        if (point.type !== "route_point") {
          try {
            parsedData = JSON.parse(point.data);
            pointName = parsedData.type || point.type || `Point ${index + 1}`;

            // Build description with point information and media
            let descParts = [`Route point ${index + 1}`];

            // Add point information
            descParts.push(`Type: ${point.type}`);

            if (parsedData.type) {
              descParts.push(`Data Type: ${parsedData.type}`);
            }

            if (parsedData.note) {
              descParts.push(`Note: ${parsedData.note}`);
            }

            // Add coordinates
            descParts.push(
              `Coordinates: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`
            );

            // Add additional properties based on point type
            if (parsedData) {
              let additionalProps = [];

              if (point.type === "railroad") {
                additionalProps = [
                  "approach",
                  "crossingNo",
                  "carrier",
                  "roadAddress",
                  "heightRestriction",
                  "roadWidth",
                  "crossingWidth",
                  "slope",
                  "contactNo",
                  "pointNotes",
                ];
              } else if (point.type === "road") {
                additionalProps = [
                  "roadAddress",
                  "typeOfSurface",
                  "numberOfLines",
                  "roadWidth",
                  "pointNotes",
                ];
              } else if (point.type === "intersection") {
                additionalProps = [
                  "primaryRoadAddress",
                  "typeOfIntersection",
                  "secondaryRoad",
                  "pointNotes",
                ];
              } else if (point.type === "bridge") {
                additionalProps = [
                  "roadAddress",
                  "bridgeType",
                  "overallLength",
                  "condition",
                  "numberOfSpans",
                  "pointNotes",
                ];
              } else if (point.type === "powerline") {
                additionalProps = [
                  "roadAddress",
                  "typeOfPowerline",
                  "voltage",
                  "heightAboveGround",
                  "pointNotes",
                ];
              } else if (point.type === "overhead") {
                additionalProps = [
                  "roadAddress",
                  "typeOfObstruction",
                  "heightAboveGround",
                  "dismountable",
                  "pointNotes",
                ];
              } else if (point.type === "custom") {
                additionalProps = [
                  "roadAddress",
                  "descriptionOfObstruction",
                  "heightNotes",
                  "widthNotes",
                  "lengthNotes",
                  "areaNotes",
                  "groundNotes",
                  "restrictionNotes",
                  "pointNotes",
                ];
              }

              additionalProps.forEach((prop) => {
                if (parsedData[prop]) {
                  descParts.push(
                    `${prop.charAt(0).toUpperCase() + prop.slice(1)}: ${
                      parsedData[prop]
                    }`
                  );
                }
              });
            }

            // Add media information
            if (parsedData.media && Array.isArray(parsedData.media)) {
              const photos = parsedData.media.filter(
                (media) => media.type === "photo"
              );
              if (photos.length > 0) {
                descParts.push(`Photos (${photos.length}):`);
                photos.forEach((photo, photoIndex) => {
                  if (photo.url) {
                    const photoUrl = photo.url.replace(
                      "http://10.0.2.2",
                      "http://localhost"
                    );
                    descParts.push(`Photo ${photoIndex + 1}: ${photoUrl}`);
                  }
                  if (photo.note) {
                    descParts.push(
                      `Photo ${photoIndex + 1} Note: ${photo.note}`
                    );
                  }
                });
              }
            }

            pointDesc = descParts.join(" | ");
          } catch (error) {
            console.error("Error parsing point data for GPX:", error);
            pointName = point.type || `Point ${index + 1}`;
            pointDesc = `Route point ${index + 1} (Error parsing data)`;
          }
        } else {
          // Handle route points
          pointName = `Route Point ${index + 1}`;
          pointDesc = `Route waypoint ${index + 1}`;
        }

        return `
    <wpt lat="${point.lat}" lon="${point.lng}">
      <name>${this.escapeXml(pointName)}</name>
      <desc>${this.escapeXml(pointDesc)}</desc>
      <sym>${this.getGPXSymbolForPointType(point.type)}</sym>
    </wpt>`;
      })
      .join("");

    const trackPoints = routePoints
      .map(
        (point) => `
      <trkpt lat="${point.lat}" lon="${point.lng}">
        <ele>0</ele>
      </trkpt>`
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RouteSurvey" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${this.escapeXml(routeName)}</name>
    <desc>Route exported from RouteSurvey</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${waypoints}
  <trk>
    <name>${this.escapeXml(routeName)}</name>
    <desc>Route track</desc>
    <trkseg>
      ${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
  }

  getGPXSymbolForPointType(pointType) {
    const symbolMap = {
      railroad: "Railroad Crossing",
      road: "Road",
      intersection: "Intersection",
      bridge: "Bridge",
      powerline: "Power Line",
      overhead: "Overhead",
      custom: "Custom",
      //   survey_point: "Survey",
      //   inspection_point: "Inspection",
      route_point: "Waypoint",
      default: "Marker",
    };

    return symbolMap[pointType] || symbolMap["default"];
  }

  generateGeoJSONContent(routePoints, routeName) {
    const coordinates = routePoints.map((point) => [point.lng, point.lat]);

    return JSON.stringify(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: routeName,
              description: "Route exported from RouteSurvey",
            },
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
          ...routePoints.map((point, index) => {
            let pointName = `Point ${index + 1}`;
            let pointDescription = `Route point ${index + 1}`;
            let mediaInfo = null;

            if (point.type !== "route_point") {
              try {
                const parsedData = JSON.parse(point.data);
                pointName =
                  parsedData.type || point.type || `Point ${index + 1}`;

                if (parsedData.media && Array.isArray(parsedData.media)) {
                  const photos = parsedData.media.filter(
                    (media) => media.type === "photo"
                  );
                  if (photos.length > 0) {
                    mediaInfo = {
                      photoCount: photos.length,
                      photos: photos.map((photo, photoIndex) => ({
                        index: photoIndex + 1,
                        url: photo.url,
                        note: photo.note,
                      })),
                    };
                    pointDescription = `Route point ${index + 1} - ${
                      photos.length
                    } photo(s)`;
                  }
                }
              } catch (error) {
                console.error("Error parsing point data for GeoJSON:", error);
                pointName = point.type || `Point ${index + 1}`;
                pointDescription = `Route point ${
                  index + 1
                } (Error parsing data)`;
              }
            }

            return {
              type: "Feature",
              properties: {
                name: pointName,
                description: pointDescription,
                media: mediaInfo,
              },
              geometry: {
                type: "Point",
                coordinates: [point.lng, point.lat],
              },
            };
          }),
        ],
      },
      null,
      2
    );
  }

  generateCSVContent(routePoints, routeName, imperial = false) {
    // Define CSV headers
    const headers = [
      "Point Number",
      "Type",
      "Latitude",
      "Longitude",
      "Data Type",
      "Note",
      "Road Address",
      "Additional Properties",
      "Photo Count",
      "Photo Notes",
    ];

    // Generate CSV rows
    const rows = routePoints.map((point, index) => {
      let dataType = "";
      let note = "";
      let roadAddress = "";
      let additionalProps = "";
      let photoCount = 0;
      let photoNotes = "";

      if (point.type !== "route_point") {
        try {
          const parsedData = JSON.parse(point.data);
          dataType = parsedData.type || "";
          note = parsedData.note || "";
          roadAddress = parsedData.roadAddress || "";

          // Collect additional properties based on point type
          const additionalProperties = [];
          if (point.type === "railroad") {
            [
              "approach",
              "crossingNo",
              "carrier",
              "heightRestriction",
              "roadWidth",
              "crossingWidth",
              "slope",
              "contactNo",
            ].forEach((prop) => {
              if (parsedData[prop]) {
                additionalProperties.push(`${prop}: ${parsedData[prop]}`);
              }
            });
          } else if (point.type === "road") {
            ["typeOfSurface", "numberOfLines", "roadWidth"].forEach((prop) => {
              if (parsedData[prop]) {
                additionalProperties.push(`${prop}: ${parsedData[prop]}`);
              }
            });
          } else if (point.type === "intersection") {
            ["typeOfIntersection", "secondaryRoad"].forEach((prop) => {
              if (parsedData[prop]) {
                additionalProperties.push(`${prop}: ${parsedData[prop]}`);
              }
            });
          } else if (point.type === "bridge") {
            [
              "bridgeType",
              "overallLength",
              "condition",
              "numberOfSpans",
            ].forEach((prop) => {
              if (parsedData[prop]) {
                additionalProperties.push(`${prop}: ${parsedData[prop]}`);
              }
            });
          } else if (point.type === "powerline") {
            ["typeOfPowerline", "voltage", "heightAboveGround"].forEach(
              (prop) => {
                if (parsedData[prop]) {
                  additionalProperties.push(`${prop}: ${parsedData[prop]}`);
                }
              }
            );
          } else if (point.type === "overhead") {
            ["typeOfObstruction", "heightAboveGround", "dismountable"].forEach(
              (prop) => {
                if (parsedData[prop]) {
                  additionalProperties.push(`${prop}: ${parsedData[prop]}`);
                }
              }
            );
          } else if (point.type === "custom") {
            [
              "descriptionOfObstruction",
              "heightNotes",
              "widthNotes",
              "lengthNotes",
              "areaNotes",
              "groundNotes",
              "restrictionNotes",
            ].forEach((prop) => {
              if (parsedData[prop]) {
                additionalProperties.push(`${prop}: ${parsedData[prop]}`);
              }
            });
          }

          additionalProps = additionalProperties.join("; ");

          // Handle media/photos
          if (parsedData.media && Array.isArray(parsedData.media)) {
            const photos = parsedData.media.filter(
              (media) => media.type === "photo"
            );
            photoCount = photos.length;
            photoNotes = photos
              .map((photo) => photo.note)
              .filter((note) => note)
              .join("; ");
          }
        } catch (error) {
          console.error("Error parsing point data for CSV:", error);
          dataType = "Error parsing data";
        }
      }

      return [
        index + 1,
        point.type,
        point.lat.toFixed(6),
        point.lng.toFixed(6),
        dataType,
        note,
        roadAddress,
        additionalProps,
        photoCount,
        photoNotes,
      ];
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    return csvContent;
  }

  generateExcelContent(routePoints, routeName, imperial = false) {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Helper function to calculate distance between two points
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000; // Convert to meters
    };

    // Calculate cumulative distances
    let cumulativeDistance = 0;
    const pointsWithDistance = routePoints.map((point, index) => {
      if (index > 0) {
        const prevPoint = routePoints[index - 1];
        const distance = calculateDistance(
          prevPoint.lat,
          prevPoint.lng,
          point.lat,
          point.lng
        );
        cumulativeDistance += distance;
      }
      return {
        ...point,
        distance: cumulativeDistance,
      };
    });

    // Helper function to format distance
    const formatDistance = (distance, imperial = false) => {
      if (distance < 1) {
        const meters = distance * 1000;
        return `${(imperial ? meters / 1609.34 : meters / 1000.0).toFixed(2)} ${
          imperial ? "mi" : "km"
        }`;
      }
      return `${(imperial ? distance / 1609.34 : distance / 1000.0).toFixed(
        2
      )} ${imperial ? "mi" : "km"}`;
    };

    // Helper function to format GPS coordinates
    const formatGPS = (lat, lng) => {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    };

    // Helper function to get parsed data
    const getParsedData = (point) => {
      if (point.type === "route_point") return {};
      try {
        return JSON.parse(point.data);
      } catch (error) {
        console.error("Error parsing point data:", error);
        return {};
      }
    };

    // 1. Create "Route Points" sheet with all points
    const allPointsData = pointsWithDistance.map((point, index) => {
      const parsedData = getParsedData(point);
      const roadName =
        parsedData.roadAddress || parsedData.primaryRoadAddress || "";
      const description = parsedData.type || point.type || "";
      const pointNotes = parsedData.pointNotes || parsedData.note || "";

      return {
        Distance: formatDistance(point.distance, imperial),
        GPS: formatGPS(point.lat, point.lng),
        "Road Name": roadName,
        Description: description,
        Type: point.type,
        "Point Notes": pointNotes,
      };
    });

    const routePointsSheet = XLSX.utils.json_to_sheet(allPointsData);
    routePointsSheet["!cols"] = [
      { wch: 12 }, // Distance
      { wch: 20 }, // GPS
      { wch: 25 }, // Road Name
      { wch: 20 }, // Description
      { wch: 15 }, // Type
      { wch: 30 }, // Point Notes
    ];
    XLSX.utils.book_append_sheet(workbook, routePointsSheet, "Route Points");

    // 2. Create "Bridges" sheet
    const bridgePoints = pointsWithDistance.filter(
      (point) => point.type === "bridge"
    );
    if (bridgePoints.length > 0) {
      const bridgeData = bridgePoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          "Overall Length": parsedData.overallLength || "",
          Condition: parsedData.condition || "",
          "Number of Spans": parsedData.numberOfSpans || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const bridgeSheet = XLSX.utils.json_to_sheet(bridgeData);
      bridgeSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 20 }, // Description
        { wch: 15 }, // Overall Length
        { wch: 15 }, // Condition
        { wch: 15 }, // Number of Spans
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, bridgeSheet, "Bridges");
    }

    // 3. Create "Railroad" sheet
    const railroadPoints = pointsWithDistance.filter(
      (point) => point.type === "railroad"
    );
    if (railroadPoints.length > 0) {
      const railroadData = railroadPoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          Approach: parsedData.approach || "",
          "Crossing #": parsedData.crossingNo || "",
          Carrier: parsedData.carrier || "",
          "Height Restriction": parsedData.heightRestriction || "",
          "Road Width": parsedData.roadWidth || "",
          "Crossing Width": parsedData.crossingWidth || "",
          Slope: parsedData.slope || "",
          "Contact #": parsedData.contactNo || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const railroadSheet = XLSX.utils.json_to_sheet(railroadData);
      railroadSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 12 }, // Approach
        { wch: 12 }, // Crossing #
        { wch: 20 }, // Carrier
        { wch: 15 }, // Height Restriction
        { wch: 12 }, // Road Width
        { wch: 15 }, // Crossing Width
        { wch: 10 }, // Slope
        { wch: 12 }, // Contact #
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, railroadSheet, "Railroad");
    }

    // 4. Create "Roads" sheet
    const roadPoints = pointsWithDistance.filter(
      (point) => point.type === "road"
    );
    if (roadPoints.length > 0) {
      const roadData = roadPoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          "Type of Surface": parsedData.typeOfSurface || "",
          "Number of Lines": parsedData.numberOfLines || "",
          "Road Width": parsedData.roadWidth || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const roadSheet = XLSX.utils.json_to_sheet(roadData);
      roadSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 15 }, // Type of Surface
        { wch: 15 }, // Number of Lines
        { wch: 12 }, // Road Width
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, roadSheet, "Roads");
    }

    // 5. Create "Intersections" sheet
    const intersectionPoints = pointsWithDistance.filter(
      (point) => point.type === "intersection"
    );
    if (intersectionPoints.length > 0) {
      const intersectionData = intersectionPoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.primaryRoadAddress || "",
          Description: parsedData.type || "",
          "Type of Intersection":
            this.translateIntersectionType(parsedData.typeOfIntersection) || "",
          "Secondary Road": parsedData.secondaryRoad || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const intersectionSheet = XLSX.utils.json_to_sheet(intersectionData);
      intersectionSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 18 }, // Type of Intersection
        { wch: 20 }, // Secondary Road
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(
        workbook,
        intersectionSheet,
        "Intersections"
      );
    }

    // 6. Create "Powerlines" sheet
    const powerlinePoints = pointsWithDistance.filter(
      (point) => point.type === "powerline"
    );
    if (powerlinePoints.length > 0) {
      const powerlineData = powerlinePoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          "Type of Powerline": parsedData.typeOfPowerline || "",
          Voltage: parsedData.voltage || "",
          "Height Above Ground": parsedData.heightAboveGround || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const powerlineSheet = XLSX.utils.json_to_sheet(powerlineData);
      powerlineSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 18 }, // Type of Powerline
        { wch: 12 }, // Voltage
        { wch: 18 }, // Height Above Ground
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, powerlineSheet, "Powerlines");
    }

    // 7. Create "Overhead" sheet
    const overheadPoints = pointsWithDistance.filter(
      (point) => point.type === "overhead"
    );
    if (overheadPoints.length > 0) {
      const overheadData = overheadPoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          "Type of Obstruction": parsedData.typeOfObstruction || "",
          "Height Above Ground": parsedData.heightAboveGround || "",
          Dismountable: parsedData.dismountable || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const overheadSheet = XLSX.utils.json_to_sheet(overheadData);
      overheadSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 18 }, // Type of Obstruction
        { wch: 18 }, // Height Above Ground
        { wch: 12 }, // Dismountable
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, overheadSheet, "Overhead");
    }

    // 8. Create "Custom" sheet
    const customPoints = pointsWithDistance.filter(
      (point) => point.type === "custom"
    );
    if (customPoints.length > 0) {
      const customData = customPoints.map((point) => {
        const parsedData = getParsedData(point);
        return {
          Distance: formatDistance(point.distance, imperial),
          GPS: formatGPS(point.lat, point.lng),
          "Road Name": parsedData.roadAddress || "",
          Description: parsedData.type || "",
          "Description of Obstruction":
            parsedData.descriptionOfObstruction || "",
          "Height Notes": parsedData.heightNotes || "",
          "Width Notes": parsedData.widthNotes || "",
          "Length Notes": parsedData.lengthNotes || "",
          "Area Notes": parsedData.areaNotes || "",
          "Ground Notes": parsedData.groundNotes || "",
          "Restriction Notes": parsedData.restrictionNotes || "",
          "Point Notes": parsedData.pointNotes || "",
        };
      });

      const customSheet = XLSX.utils.json_to_sheet(customData);
      customSheet["!cols"] = [
        { wch: 12 }, // Distance
        { wch: 20 }, // GPS
        { wch: 25 }, // Road Name
        { wch: 15 }, // Description
        { wch: 25 }, // Description of Obstruction
        { wch: 15 }, // Height Notes
        { wch: 15 }, // Width Notes
        { wch: 15 }, // Length Notes
        { wch: 15 }, // Area Notes
        { wch: 15 }, // Ground Notes
        { wch: 18 }, // Restriction Notes
        { wch: 30 }, // Point Notes
      ];
      XLSX.utils.book_append_sheet(workbook, customSheet, "Custom");
    }

    // Generate XLSX file as buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      bookSST: false,
    });

    return excelBuffer;
  }

  translateIntersectionType(typeCode) {
    const intersectionTypeMap = {
      type_1: "Cross-Intersection",
      type_2: "T-Intersection",
      type_3: "Roundabout",
      type_4: "Y-Intersection",
    };
    return intersectionTypeMap[typeCode] || typeCode || "";
  }

  downloadFile(content, filename, mimeType) {
    let blob;

    // Handle different content types
    if (content instanceof ArrayBuffer) {
      // For XLSX files (ArrayBuffer)
      blob = new Blob([content], { type: mimeType });
    } else {
      // For text-based files (CSV, KML, GPX, GeoJSON)
      blob = new Blob([content], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  escapeXml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  getShortAddress(address) {
    if (!address) return "";

    // Handle string format (legacy)
    if (typeof address === "string") {
      return address.split(",").slice(0, 2).join(", ");
    }

    // Handle object format with address information (new)
    if (typeof address === "object") {
      // If we have address information from the map component
      if (address.address && address.address.display_name) {
        return address.address.display_name.split(",").slice(0, 2).join(", ");
      }

      // If we have display_name directly
      if (address.display_name) {
        return address.display_name.split(",").slice(0, 2).join(", ");
      }

      // If we have a formatted_address property
      if (address.formatted_address) {
        return address.formatted_address.split(",").slice(0, 2).join(", ");
      }

      // Fallback to string representation
      return String(address);
    }

    // Fallback for any other type
    return String(address);
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatDateTime(dateString) {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateStr}<br/>${timeStr}`;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Radius of the earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  calculateRoutePointsDistances(routePoints) {
    // console.log(routePoints);
    const normalizedPoints = normalizeRoutePoints(routePoints);
    let newRoutePoints = [];
    let cumulativeDistance = 0;
    for (let i = 0; i < normalizedPoints.length; i++) {
      try {
        const point = normalizedPoints[i];
        // console.log(point);
        if (i === 0) {
          newRoutePoints.push({
            ...point,
            distance: 0,
          });
        } else {
          const distance = this.calculateDistance(
            point.lat,
            point.lng,
            normalizedPoints[i - 1].lat,
            normalizedPoints[i - 1].lng
          );
          cumulativeDistance += distance;
          newRoutePoints.push({
            ...point,
            distance: cumulativeDistance,
          });
        }
        // console.log(cumulativeDistance);
      } catch (error) {
        console.log(error);
      }
    }
    return newRoutePoints;
  }
}

export default new RouteUtils();
