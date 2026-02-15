class KMLParser {
  constructor() {
    this.parser = new DOMParser();
  }

  async parseKMLFile(file) {
    try {
      const text = await this.readFileAsText(file);
      return this.parseKMLContent(text);
    } catch (error) {
      throw new Error(`Failed to parse KML file: ${error.message}`);
    }
  }

  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  parseKMLContent(kmlText) {
    try {
      const xmlDoc = this.parser.parseFromString(kmlText, "text/xml");

      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML format");
      }

      const document = xmlDoc.getElementsByTagName("Document")[0];
      if (!document) {
        throw new Error("No Document element found in KML");
      }

      const result = {
        name: this.getTextContent(document, "name") || "Imported Route",
        description: this.getTextContent(document, "description") || "",
        points: [],
        routePath: [],
      };

      // Parse Placemarks
      const placemarks = document.getElementsByTagName("Placemark");
      for (let placemark of placemarks) {
        const point = this.parsePlacemark(placemark);
        if (point) {
          result.points.push(point);
        }
      }

      // Parse LineString for route path
      const lineStrings = document.getElementsByTagName("LineString");
      for (let lineString of lineStrings) {
        const path = this.parseLineString(lineString);
        if (path && path.length > 0) {
          result.routePath = path;
        }
      }

      // Calculate cumulative distances for points if not already set
      if (result.points.length > 0) {
        let cumulativeDistance = 0;
        for (let i = 0; i < result.points.length; i++) {
          const point = result.points[i];

          // If point doesn't have distance, calculate from previous point
          if (!point.distance || point.distance === 0) {
            if (i > 0) {
              const prevPoint = result.points[i - 1];
              const distance = this.calculateDistance(
                prevPoint.lat,
                prevPoint.lng,
                point.lat,
                point.lng
              );
              cumulativeDistance += distance;
              point.distance = cumulativeDistance;
              // console.log(
              //   `Calculated distance for point "${point.name}": ${point.distance} km`
              // );
            }
          } else {
            cumulativeDistance = point.distance;
          }
        }

        // Find the last point before the end point and use its distance as total route distance
        const endPointIndex = result.points.findIndex(
          (p) => p.name === "End Point"
        );
        if (endPointIndex > 0) {
          const lastPointBeforeEnd = result.points[endPointIndex - 1];
          if (lastPointBeforeEnd && lastPointBeforeEnd.distance) {
            // Convert to meters (multiply by 1000)
            result.totalDistance = lastPointBeforeEnd.distance * 1000;
            // console.log(
            //   `Using distance from last point before end: ${lastPointBeforeEnd.distance} km = ${result.totalDistance} meters`
            // );
          } else {
            // If no distance found, try to extract from the point name
            const nameDistanceMatch = lastPointBeforeEnd.name.match(
              /(\d+\.?\d*)\s*(Km|km|Kilometer|kilometer)/i
            );
            if (nameDistanceMatch) {
              const distance = Number(nameDistanceMatch[1]);
              result.totalDistance = distance * 1000;
              // console.log(
              //   `Extracted distance from last point name "${lastPointBeforeEnd.name}": ${distance} km = ${result.totalDistance} meters`
              // );
            }
          }
        } else {
          // If no end point found, use the last point with a distance
          const pointsWithDistance = result.points.filter(
            (p) => p.distance && p.distance > 0
          );
          if (pointsWithDistance.length > 0) {
            const lastPointWithDistance =
              pointsWithDistance[pointsWithDistance.length - 1];
            result.totalDistance = lastPointWithDistance.distance * 1000;
            // console.log(
            //   `Using distance from last point with distance: ${lastPointWithDistance.distance} km = ${result.totalDistance} meters`
            // );
          }
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to parse KML content: ${error.message}`);
    }
  }

  parsePlacemark(placemark) {
    const name = this.getTextContent(placemark, "name");
    const description = this.getTextContent(placemark, "description");
    const styleUrl = this.getTextContent(placemark, "styleUrl");

    // Parse Point coordinates
    const pointElement = placemark.getElementsByTagName("Point")[0];
    if (pointElement) {
      const coordinates = this.getTextContent(pointElement, "coordinates");
      if (coordinates) {
        const coords = this.parseCoordinates(coordinates);
        if (coords.length > 0) {
          const [lng, lat, alt] = coords[0];

          // Determine point type from style URL or name
          const pointType = this.determinePointType(styleUrl, name);

          // Parse description for additional data
          const parsedData = this.parseDescription(description, pointType);

          // Try to extract distance from point name if not found in description
          if (!parsedData.distance && name) {
            const nameDistanceMatch = name.match(
              /(\d+\.?\d*)\s*(Km|km|Kilometer|kilometer)/i
            );
            if (nameDistanceMatch) {
              parsedData.distance = Number(nameDistanceMatch[1]);
              // console.log(
              //   `Extracted distance from point name "${name}": ${parsedData.distance} km`
              // );
            }
          }

          const point = {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            alt: parseFloat(alt) || 0,
            type: pointType,
            name: name,
            description: description,
            data: JSON.stringify(parsedData),
            dateAdded: new Date().toISOString(),
            distance: Number(parsedData.distance) || 0,
          };

          // console.log(
          //   `Created point "${name}" with distance: ${point.distance} km`
          // );
          return point;
        }
      }
    }

    return null;
  }

  parseLineString(lineString) {
    const coordinates = this.getTextContent(lineString, "coordinates");
    if (coordinates) {
      return this.parseCoordinates(coordinates).map((coord) => ({
        lat: parseFloat(coord[1]),
        lng: parseFloat(coord[0]),
        alt: parseFloat(coord[2]) || 0,
      }));
    }
    return [];
  }

  parseCoordinates(coordinatesText) {
    return coordinatesText
      .trim()
      .split(/\s+/)
      .map((coord) => coord.split(",").map(Number))
      .filter((coord) => coord.length >= 2);
  }

  determinePointType(styleUrl, name) {
    if (!styleUrl) {
      // Try to determine from name
      if (name && name.toLowerCase().includes("start")) return "start_point";
      if (name && name.toLowerCase().includes("end")) return "end_point";
      return "route_point";
    }

    // Map style URLs to point types
    const styleMap = {
      "#startIcon": "route_point",
      "#endIcon": "route_point",
      "#roadIcon": "road",
      "#railroadIcon": "railroad",
      "#intersectionIcon": "intersection",
      "#bridgeIcon": "bridge",
      "#powerlineIcon": "powerline",
      "#overheadIcon": "overhead",
      "#globeIcon": "route_point",
      "#customIcon": "custom",
    };

    return styleMap[styleUrl] || "route_point";
  }

  parseDescription(description, type) {
    if (!description) return {};

    // console.log(`Parsing description for type: ${type}`);
    // console.log(`Description content: ${description.substring(0, 500)}...`);

    try {
      // Try to extract data from HTML table in description
      const parser = new DOMParser();
      const doc = parser.parseFromString(description, "text/html");

      const data = {};
      const images = [];

      // Extract table data
      const tables = doc.getElementsByTagName("table");
      // console.log(`Found ${tables.length} tables in description`);

      if (tables.length > 0) {
        for (let table of tables) {
          const rows = table.getElementsByTagName("tr");
          // console.log(`Table has ${rows.length} rows`);

          // Look for the row that contains the point-specific data
          if (rows.length >= 3) {
            // For bridge points, the data is in the second-to-last row
            // For other points, it might be in the last row
            let dataRow;
            if (type === "bridge") {
              dataRow = rows[rows.length - 2]; // Second-to-last row for bridge points
            } else {
              dataRow = rows[rows.length - 1]; // Last row for other points
            }

            const cells = dataRow.getElementsByTagName("td");

            if (cells.length > 0) {
              const dataCell = cells[0]; // First cell (should be colspan="3")

              // Extract data from <p> tags within the cell
              const paragraphs = dataCell.getElementsByTagName("p");
              // console.log(
              //   `Found ${paragraphs.length} paragraphs in data cell for ${type} point`
              // );

              for (let p of paragraphs) {
                const text = p.textContent.trim();
                // console.log(`Paragraph text: "${text}"`);

                if (text) {
                  // Parse "Field Name : Value" format with <strong> tags
                  const match = text.match(
                    /^<strong>([^:]+)\s*:\s*<\/strong>(.*)$/
                  );
                  if (match) {
                    const fieldName = match[1].trim();
                    const fieldValue = match[2].trim();
                    data[fieldName] = fieldValue;
                    // console.log(
                    //   `Extracted field: "${fieldName}" = "${fieldValue}"`
                    // );
                  } else {
                    // Try alternative format without <strong> tags
                    const colonMatch = text.match(/^([^:]+)\s*:\s*(.*)$/);
                    if (colonMatch) {
                      const fieldName = colonMatch[1].trim();
                      const fieldValue = colonMatch[2].trim();
                      data[fieldName] = fieldValue;
                      // console.log(
                      //   `Extracted field: "${fieldName}" = "${fieldValue}"`
                      // );
                    }
                  }
                }
              }

              // Also try to extract data directly from the cell text content
              const cellText = dataCell.textContent.trim();
              // console.log(`Cell text content: "${cellText}"`);

              // Parse the cell text for field-value pairs with better regex
              // Remove the problematic regex that splits field names incorrectly
              // const fieldMatches = cellText.match(/([^:]+)\s*:\s*([^:]+?)(?=\s*[A-Z][^:]*\s*:|$)/g);
              // if (fieldMatches) {
              //   for (let match of fieldMatches) {
              //     const colonIndex = match.indexOf(":");
              //     if (colonIndex > 0) {
              //       const fieldName = match.substring(0, colonIndex).trim();
              //       const fieldValue = match.substring(colonIndex + 1).trim();
              //       data[fieldName] = fieldValue;
              //       console.log(`Extracted field from cell text: "${fieldName}" = "${fieldValue}"`);
              //     }
              //   }
              // }

              // Also try to extract data from the HTML structure directly
              const strongTags = dataCell.getElementsByTagName("strong");
              // console.log(
              //   `Found ${strongTags.length} strong tags in data cell`
              // );

              for (let strong of strongTags) {
                const strongText = strong.textContent.trim();
                // console.log(`Strong tag text: "${strongText}"`);

                // Check if this strong tag contains a field name with colon
                if (strongText.includes(":")) {
                  const colonIndex = strongText.indexOf(":");
                  const fieldName = strongText.substring(0, colonIndex).trim();

                  // Get the value from the parent paragraph's text content
                  const parentParagraph = strong.closest("p");
                  if (parentParagraph) {
                    const paragraphText = parentParagraph.textContent.trim();
                    const fieldNameWithColon = strongText;
                    const valueStart =
                      paragraphText.indexOf(fieldNameWithColon) +
                      fieldNameWithColon.length;
                    if (valueStart > fieldNameWithColon.length) {
                      const value = paragraphText.substring(valueStart).trim();
                      data[fieldName] = value;
                      // console.log(
                      //   `Extracted field from paragraph: "${fieldName}" = "${value}"`
                      // );
                    }
                  }
                }
              }

              // Alternative approach: parse each paragraph individually using text content
              const paragraphElements = dataCell.getElementsByTagName("p");
              // console.log(
              //   `Found ${paragraphElements.length} paragraphs in data cell`
              // );

              for (let p of paragraphElements) {
                const paragraphText = p.textContent.trim();
                // console.log(`Paragraph text: "${paragraphText}"`);

                // Look for pattern "Field Name : Value"
                const colonIndex = paragraphText.indexOf(":");
                if (colonIndex > 0) {
                  const fieldName = paragraphText
                    .substring(0, colonIndex)
                    .trim();
                  const fieldValue = paragraphText
                    .substring(colonIndex + 1)
                    .trim();

                  // Special handling for Type of Powerline field
                  if (fieldName === "Type of Powerline" && fieldValue) {
                    // console.log(
                    //   `Found Type of Powerline with value: "${fieldValue}"`
                    // );

                    // Check if the value contains any of the defined powerline types
                    const powerlineTypes = [
                      "Low Voltage Line",
                      "Low-voltage line",
                      "Low-voltage",
                      "Low",
                      "Medium Voltage Line",
                      "Medium-voltage line",
                      "Medium-voltage",
                      "Medium",
                      "High Voltage Line",
                      "High-voltage line",
                      "High-voltage",
                      "High",
                      "Extreme High Voltage Line",
                      "Extreme-high voltage line",
                      "Extreme-high",
                      "Extreme",
                      "Residential Power Line",
                      "Residential power line",
                      "Residential",
                      "Rail Overhead Line",
                      "Rail overhead line",
                      "Rail",
                    ];

                    for (const powerlineType of powerlineTypes) {
                      if (
                        fieldValue
                          .toLowerCase()
                          .includes(powerlineType.toLowerCase())
                      ) {
                        data[fieldName] = powerlineType;
                        // console.log(
                        //   `Matched powerline type: "${fieldValue}" -> "${powerlineType}"`
                        // );
                        break;
                      }
                    }

                    // If no match found, use the original value
                    if (!data[fieldName]) {
                      data[fieldName] = fieldValue;
                      // console.log(
                      //   `Using original powerline type: "${fieldValue}"`
                      // );
                    }
                  } else {
                    data[fieldName] = fieldValue; // Always set, don't check if already set
                    // console.log(
                    //   `Extracted field from paragraph text: "${fieldName}" = "${fieldValue}"`
                    // );
                  }
                }
              }

              // Also try to extract data from the entire cell HTML as a fallback
              const cellHTML = dataCell.innerHTML;
              // console.log(`Cell HTML: "${cellHTML}"`);

              // Extract all field-value pairs from the HTML structure with better regex
              const htmlFieldMatches = cellHTML.match(
                /<strong>([^:]+)\s*:\s*<\/strong>([^<]*)/g
              );
              if (htmlFieldMatches) {
                // console.log(
                //   `Found ${htmlFieldMatches.length} field matches in HTML`
                // );
                for (let match of htmlFieldMatches) {
                  const fieldMatch = match.match(
                    /<strong>([^:]+)\s*:\s*<\/strong>([^<]*)/
                  );
                  if (fieldMatch) {
                    const fieldName = fieldMatch[1].trim();
                    const fieldValue = fieldMatch[2].trim();
                    // Only set if not already set by paragraph parsing
                    if (!data[fieldName]) {
                      data[fieldName] = fieldValue;
                      // console.log(
                      //   `Extracted field from HTML: "${fieldName}" = "${fieldValue}"`
                      // );
                    }
                  }
                }
              }

              // Also try to extract specific fields that might be missed
              const specificFields = [
                "Point Type",
                "Type of Surface",
                "Number of lines",
                "Road width",
                "Approach",
                "Crossing #",
                "Carrier",
                "Height Restriction",
                "Crossing Width",
                "Slope",
                "Contact #",
                "Point Notes",
                "Type of Intersection",
                "Secondary Road",
                "Bridge Type",
                "Number of Spans",
                "Overall length",
                "Condition",
                "Type of Powerline",
                "Type of Powerline :",
                "Voltage",
                "Height Above Ground",
                "Type of Obstruction",
                "Dismountable",
                "Description of Obstruction",
                "Height Notes",
                "Width Notes",
                "Length Notes",
                "Area Notes",
                "Ground Notes",
                "Restriction Notes",
              ];

              // Disable this extraction since paragraph parsing is working correctly
              // for (const field of specificFields) {
              //   // Use a more precise regex that stops at the next field or end of text
              //   const fieldRegex = new RegExp(`${field.replace(/\s+/g, '\\s+')}\\s*:\\s*([^<\\n]*?)(?=\\s*[A-Z][^:]*\\s*:|$)`, 'i');
              //   const fieldMatch = cellText.match(fieldRegex);
              //   if (fieldMatch && !data[field]) {
              //     data[field] = fieldMatch[1].trim();
              //     console.log(`Extracted specific field: "${field}" = "${data[field]}"`);
              //   }
              // }

              // Handle special cases for specific point types with more precise regex
              // Disable this extraction since paragraph parsing is working correctly
              // if (type === 'powerline') {
              //   // Handle "Type of Powerline :" with colon - more precise regex
              //   const powerlineTypeMatch = cellText.match(/Type of Powerline\s*:\s*([^<\n]*?)(?=\s*[A-Z][^:]*\s*:|$)/i);
              //   if (powerlineTypeMatch) {
              //     data['Type of Powerline'] = powerlineTypeMatch[1].trim();
              //     console.log(`Extracted powerline type: "${data['Type of Powerline']}"`);
              //   }

              //   // Handle voltage field even if empty - more precise regex
              //   const voltageMatch = cellText.match(/Voltage\s*:\s*([^<\n]*?)(?=\s*[A-Z][^:]*\s*:|$)/i);
              //   if (voltageMatch) {
              //     data['Voltage'] = voltageMatch[1].trim();
              //     console.log(`Extracted voltage: "${data['Voltage']}"`);
              //   }

              //   // Handle height above ground - more precise regex
              //   const heightMatch = cellText.match(/Height Above Ground\s*:\s*([^<\n]*?)(?=\s*[A-Z][^:]*\s*:|$)/i);
              //   if (heightMatch) {
              //     data['Height Above Ground'] = heightMatch[1].trim();
              //     console.log(`Extracted height above ground: "${data['Height Above Ground']}"`);
              //   }
              // }

              // Always extract point notes for all types with more precise regex
              const pointNotesMatch = cellText.match(
                /Point Notes\s*:\s*([^<\n]*?)(?=\s*[A-Z][^:]*\s*:|$)/i
              );
              if (pointNotesMatch) {
                data["Point Notes"] = pointNotesMatch[1].trim();
                // console.log(`Extracted point notes: "${data["Point Notes"]}"`);
              }

              // Extract images from all rows (except header and data rows)
              // console.log(
              //   "Extracting images from table with",
              //   rows.length,
              //   "rows"
              // );
              for (let i = 1; i < rows.length - 1; i++) {
                const row = rows[i];
                const cells = row.getElementsByTagName("td");

                if (cells.length >= 2) {
                  const noteCell = cells[0]; // First cell contains the note
                  const imgCell = cells[1]; // Second cell contains the image

                  // Check if the second cell has colspan="2" (image cell)
                  if (imgCell.getAttribute("colspan") === "2") {
                    const imgTags = imgCell.getElementsByTagName("img");

                    for (let img of imgTags) {
                      const src = img.getAttribute("src");
                      const alt = img.getAttribute("alt") || "";
                      const note = noteCell?.textContent?.trim() || "";

                      if (src) {
                        images.push({
                          url: src,
                          note: note || alt,
                          type: "photo",
                        });
                      }
                    }
                  }
                }
              }

              // Also extract distance and road from the first data row if available
              if (rows.length >= 2) {
                const distanceRow = rows[1]; // First data row (0-indexed, so row 1)
                const distanceCells = distanceRow.getElementsByTagName("td");
                // console.log(`Distance row has ${distanceCells.length} cells`);

                if (distanceCells.length >= 3) {
                  const distanceText = distanceCells[0].textContent.trim();
                  // console.log(`Distance cell text: "${distanceText}"`);

                  if (distanceText) {
                    // Try different distance formats
                    let distanceMatch = distanceText.match(/(\d+\.?\d*)\s*Km/i);
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(/(\d+\.?\d*)\s*km/i);
                    }
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(
                        /(\d+\.?\d*)\s*Kilometer/i
                      );
                    }
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(
                        /(\d+\.?\d*)\s*kilometer/i
                      );
                    }
                    if (!distanceMatch) {
                      // Try to extract just the number if no unit is specified
                      distanceMatch = distanceText.match(/(\d+\.?\d*)/);
                    }

                    if (distanceMatch) {
                      data.distance = Number(distanceMatch[1]);
                      // console.log(
                      //   `Extracted distance: ${data.distance} km from text: "${distanceText}"`
                      // );
                    } else {
                      // console.log(
                      //   `No distance pattern matched in text: "${distanceText}"`
                      // );
                    }
                  }

                  // Get road info from the third cell
                  const roadText = distanceCells[2].textContent.trim();
                  if (roadText) {
                    data.Road = roadText;
                    // console.log(`Extracted road: "${roadText}"`);
                  }
                } else if (distanceCells.length >= 2) {
                  const distanceText = distanceCells[0].textContent.trim();
                  // console.log(`Distance cell text: "${distanceText}"`);

                  if (distanceText) {
                    // Try different distance formats
                    let distanceMatch = distanceText.match(/(\d+\.?\d*)\s*Km/i);
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(/(\d+\.?\d*)\s*km/i);
                    }
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(
                        /(\d+\.?\d*)\s*Kilometer/i
                      );
                    }
                    if (!distanceMatch) {
                      distanceMatch = distanceText.match(
                        /(\d+\.?\d*)\s*kilometer/i
                      );
                    }
                    if (!distanceMatch) {
                      // Try to extract just the number if no unit is specified
                      distanceMatch = distanceText.match(/(\d+\.?\d*)/);
                    }

                    if (distanceMatch) {
                      data.distance = Number(distanceMatch[1]);
                      // console.log(
                      //   `Extracted distance: ${data.distance} km from text: "${distanceText}"`
                      // );
                    } else {
                      // console.log(
                      //   `No distance pattern matched in text: "${distanceText}"`
                      // );
                    }
                  }

                  // Try to get road info from the second cell
                  const roadText = distanceCells[1].textContent.trim();
                  if (roadText) {
                    data.Road = roadText;
                    // console.log(`Extracted road: "${roadText}"`);
                  }
                }
              } else {
                //  console.log(
                //   `Table has only ${rows.length} rows, not enough for distance extraction`
                // );
              }
            }
          }

          // Extract point type from description
          const pointTypeMatch = description.match(
            /Point Type\s*:\s*([^<\n]+)/i
          );
          if (pointTypeMatch) {
            data.type = pointTypeMatch[1].trim();
          }

          // Add images to the data
          if (images.length > 0) {
            data.media = images;
          }

          // Map the extracted data to the appropriate structure based on point type
          return this.mapDataToPointType(data, type);
        }
      } else {
        // If no table is found, try to extract data from the document's text content
        const textContent = description.trim();
        // console.log(
        //   `No table found in description, parsing text content: "${textContent}"`
        // );

        // Extract images from text content
        const imgTags = doc.getElementsByTagName("img");
        for (let img of imgTags) {
          const src = img.getAttribute("src");
          const alt = img.getAttribute("alt") || "";
          const note = img.closest("p")?.textContent?.trim() || "";

          if (src) {
            images.push({
              url: src,
              note: note || alt,
              type: "photo",
            });
          }
        }

        // Extract distance and road from text content
        const distanceMatch = textContent.match(
          /(\d+\.?\d*)\s*(Km|km|Kilometer|kilometer)/i
        );
        if (distanceMatch) {
          data.distance = Number(distanceMatch[1]);
          // console.log(
          //   `Extracted distance from text content: ${data.distance} km`
          // );
        }

        const roadMatch = textContent.match(/Road\s*:\s*([^<\n]+)/i);
        if (roadMatch) {
          data.Road = roadMatch[1].trim();
          // console.log(`Extracted road from text content: "${data.Road}"`);
        }
      }

      // Add images to the data
      if (images.length > 0) {
        data.media = images;
      }

      // Map the extracted data to the appropriate structure based on point type
      return this.mapDataToPointType(data, type);
    } catch (error) {
      console.warn("Failed to parse description:", error);
      return {};
    }
  }

  mapDataToPointType(data, type) {
    const mappedData = {};

    // console.log("Raw extracted data:", data);
    // console.log("Point type:", type);

    switch (type) {
      case "road":
        // console.log("Processing road point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.typeOfSurface = this.mapSurfaceType(
          data["Type of Surface"] || ""
        );
        mappedData.numberOfLines = data["Number of lines"] || "";
        mappedData.roadWidth = this.cleanValue(data["Road width"] || "");
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped road data:", mappedData);
        break;

      case "railroad":
        // console.log("Processing railroad point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.approach = this.mapApproachType(data.Approach || "");
        mappedData.crossingNo = data["Crossing #"] || "";
        mappedData.carrier = data.Carrier || "";
        mappedData.heightRestriction = this.cleanValue(
          data["Height Restriction"] || ""
        );
        mappedData.roadWidth = this.cleanValue(data["Road width"] || "");
        mappedData.crossingWidth = this.cleanValue(
          data["Crossing Width"] || ""
        );
        mappedData.slope = this.cleanValue(data.Slope || "");
        mappedData.contactNo = data["Contact #"] || "";
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped railroad data:", mappedData);
        break;

      case "intersection":
        // console.log("Processing intersection point data");
        mappedData.primaryRoadAddress = data.Road || "";
        mappedData.secondaryRoad = data["Secondary Road"] || "";
        mappedData.typeOfIntersection = this.mapIntersectionType(
          data["Type of Intersection"] || ""
        );
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped intersection data:", mappedData);
        break;

      case "bridge":
        // console.log("Processing bridge point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.bridgeType = this.mapBridgeType(data["Bridge Type"] || "");
        mappedData.overallLength = this.cleanValue(
          data["Overall length"] || ""
        );
        mappedData.condition = data.Condition || "";
        mappedData.numberOfSpans = data["Number of Spans"] || "";
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped bridge data:", mappedData);
        break;

      case "powerline":
        // console.log("Processing powerline point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.typeOfPowerline = this.mapPowerlineType(
          data["Type of Powerline"] || ""
        );
        mappedData.voltage = this.cleanValue(data.Voltage || "");
        mappedData.voltage = mappedData.voltage
          .replace("KV", "")
          .replace("K", "");
        mappedData.heightAboveGround = this.cleanValue(
          data["Height Above Ground"] || ""
        );
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped powerline data:", mappedData);
        break;

      case "overhead":
        // console.log("Processing overhead point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.typeOfObstruction = this.mapObstructionType(
          data["Type of Obstruction"] || ""
        );
        mappedData.heightAboveGround = this.cleanValue(
          data["Height Above Ground"] || ""
        );
        mappedData.dismountable = this.parseBoolean(data.Dismountable || "");
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped overhead data:", mappedData);
        break;

      case "custom":
        // console.log("Processing custom point data");
        mappedData.roadAddress = data.Road || "";
        mappedData.descriptionOfObstruction =
          data["Description of Obstruction"] || "";
        mappedData.heightNotes = this.cleanValue(data["Height Notes"] || "");
        mappedData.widthNotes = this.cleanValue(data["Width Notes"] || "");
        mappedData.lengthNotes = this.cleanValue(data["Length Notes"] || "");
        mappedData.areaNotes = this.cleanValue(data["Area Notes"] || "");
        mappedData.groundNotes = data["Ground Notes"] || "";
        mappedData.restrictionNotes = data["Restriction Notes"] || "";
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped custom data:", mappedData);
        break;

      default:
        // console.log("Processing default point data");
        // For route_point or unknown types, just pass through the basic data
        mappedData.pointNotes = data["Point Notes"] || "";
        mappedData.media = data.media || [];
        // console.log("Mapped default data:", mappedData);
        break;
    }

    // Add distance if available
    if (data.distance) {
      mappedData.distance = data.distance;
    }

    return mappedData;
  }

  mapSurfaceType(surfaceType) {
    const surfaceMap = {
      Asphalt: "asphalt",
      Concrete: "concrete",
      Gravel: "gravel",
      Dirt: "dirt",
      Composit: "composite",
      Composite: "composite",
      Other: "other",
    };
    return surfaceMap[surfaceType] || "other";
  }

  mapApproachType(approach) {
    const approachMap = {
      "Zig-zag": "zig_zag",
      "Zig Zag": "zig_zag",
      Zig: "zig_zag",
      Split: "split",
      "Right hand side": "right_hand_side",
      Right: "right_hand_side",
      "See notes": "see_notes",
    };
    return approachMap[approach] || "see_notes";
  }

  mapIntersectionType(intersectionType) {
    const intersectionMap = {
      "Cross-Intersection": "type_1",
      "Cross-": "type_1",
      "T-Intersection": "type_2",
      "T-": "type_2",
      Roundabout: "type_3",
      Round: "type_3",
      "Round-": "type_3",
      "Y-Intersection": "type_4",
      "Y-": "type_4",
    };
    return intersectionMap[intersectionType] || "type_1";
  }

  mapBridgeType(bridgeType) {
    // console.log("Mapping bridge type:", `"${bridgeType}"`);

    const bridgeMap = {
      "Beam Bridge": "beam_bridge",
      "Culvert Bridge": "culvert_bridge",
      "Slab Bridge": "slab_bridge",
      "Girder Bridge": "girder_bridge",
      "Truss Bridge": "truss_bridge",
      "Arch Bridge": "arch_bridge",
      "Suspension Bridge": "suspension_bridge",
      Other: "other",
      // Add single word matches
      Beam: "beam_bridge",
      Culvert: "culvert_bridge",
      Slab: "slab_bridge",
      Girder: "girder_bridge",
      Truss: "truss_bridge",
      Arch: "arch_bridge",
      Suspension: "suspension_bridge",
    };

    const mappedValue = bridgeMap[bridgeType] || "other";
    // console.log("Mapped bridge type:", `"${bridgeType}"`, "->", mappedValue);
    return mappedValue;
  }

  mapPowerlineType(powerlineType) {
    const powerlineMap = {
      "Low Voltage Line": "low_voltage_line",
      "Low-voltage line": "low_voltage_line",
      "Low-voltage": "low_voltage_line",
      Low: "low_voltage_line",
      "Medium Voltage Line": "medium_voltage_line",
      "Medium-voltage line": "medium_voltage_line",
      "Medium-voltage": "medium_voltage_line",
      Medium: "medium_voltage_line",
      "High Voltage Line": "high_voltage_line",
      "High-voltage line": "high_voltage_line",
      "High-voltage": "high_voltage_line",
      High: "high_voltage_line",
      "Extreme High Voltage Line": "extreme_high_voltage_line",
      "Extreme-high voltage line": "extreme_high_voltage_line",
      "Extreme-high": "extreme_high_voltage_line",
      Extreme: "extreme_high_voltage_line",
      "Residential Power Line": "residential_power_line",
      "Residential power line": "residential_power_line",
      Residential: "residential_power_line",
      "Rail Overhead Line": "rail_overhead_line",
      "Rail overhead line": "rail_overhead_line",
      Rail: "rail_overhead_line",
      Other: "other",
    };

    // console.log(`Mapping powerline type: "${powerlineType}"`);
    const mappedValue = powerlineMap[powerlineType] || "other";
    // console.log(
    //   `Mapped powerline type: "${powerlineType}" -> "${mappedValue}"`
    // );
    return mappedValue;
  }

  mapObstructionType(obstructionType) {
    const obstructionMap = {
      "Traffic Sign": "traffic_sign",
      Sign: "traffic_sign",
      "Traffic Light": "traffic_light",
      Light: "traffic_light",
      "Street Light": "street_light",
      Street: "street_light",
      "Bridge Underpass": "bridge_underpass",
      Underpass: "bridge_underpass",
      Tunnel: "tunnel",
      "Gas Line": "gas_line",
      Gas: "gas_line",
      "Bill Board": "bill_board",
      Bill: "bill_board",
      Other: "other",
    };
    return obstructionMap[obstructionType] || "other";
  }

  parseBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      return (
        lowerValue === "true" || lowerValue === "yes" || lowerValue === "1"
      );
    }
    return false;
  }

  cleanValue(value) {
    if (!value || typeof value !== "string") return value;

    // Remove common unit measurements
    return value
      .replace(/\s*(Meter|Meters|meter|meters)\s*/gi, "")
      .replace(/\s*(feet|Feet|foot|Foot)\s*/gi, "")
      .replace(/\s*(Km|km|Kilometer|kilometer|Kilometers|kilometers)\s*/gi, "")
      .replace(/\s*(m|M)\s*$/gi, "") // Remove trailing m or M
      .replace(/\s*(ft|FT)\s*$/gi, "") // Remove trailing ft or FT
      .trim();
  }

  getTextContent(element, tagName) {
    const tag = element.getElementsByTagName(tagName)[0];
    return tag ? tag.textContent.trim() : "";
  }

  // Helper method to calculate distance between two coordinates in kilometers
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new KMLParser();
