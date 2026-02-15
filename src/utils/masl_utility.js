import { LocalMaslUtility } from "./local_masl_utility";
import RoutesController from "@/controllers/routes/routes_controller";
import { useAuthStore } from "@/stores/auth";
import { marked } from "marked";
import route_map_screenshots_controller from "../controllers/route_map_screenshots/route_map_screenshots_controller";
import RouteUtils from "./route_utils";
import PlannedRoutesController from "@/controllers/planned_routes/planned_routes_controller";

export class MASLUtility {
  static surveyData = null;
  static plannedRouteData = null;
  static userData = null;

  /**
   * Reset all cached data variables
   * This should be called when navigating between pages to ensure fresh data
   */
  static resetData() {
    this.surveyData = null;
    this.plannedRouteData = null;
    this.userData = null;
  }

  static async parseMASL(htmlContent, id) {
    // First process all HTML content
    htmlContent = await this._processSurveyData(htmlContent, id);
    htmlContent = await this._processPlannedRouteData(htmlContent, id);
    htmlContent = await this._processUserData(htmlContent);
    htmlContent = this._parseCoverPage(htmlContent);
    htmlContent = this._parseExpressions(htmlContent);
    htmlContent = this._parseGridSystem(htmlContent);

    // // Now process any remaining Markdown content
    // const markdownRegex = /```markdown\n([\s\S]*?)\n```/g;
    // htmlContent = htmlContent.replace(
    //   markdownRegex,
    //   (match, markdownContent) => {
    //     // Configure marked for Markdown conversion
    //     marked.setOptions({
    //       breaks: true,
    //       gfm: true,
    //       headerIds: true,
    //       mangle: false,
    //       sanitize: false,
    //       smartLists: true,
    //       smartypants: true,
    //       xhtml: true,
    //     });
    //     return marked(markdownContent);
    //   }
    // );

    return htmlContent;
  }

  static async parseMASLDaily(htmlContent, id, range) {
    htmlContent = await this._processSurveyData(htmlContent, id, range);
    htmlContent = await this._processUserData(htmlContent);
    htmlContent = this._parseCoverPage(htmlContent);
    htmlContent = this._parseExpressions(htmlContent);
    htmlContent = this._parseGridSystem(htmlContent);
    return htmlContent;
  }

  static _parseReportHeader(htmlContent) {
    const startIndex = htmlContent.indexOf("@beginheader");
    const endIndex = htmlContent.indexOf("@endheader");

    if (startIndex !== -1 && endIndex !== -1) {
      const headerContent = htmlContent.substring(
        startIndex + "@beginheader".length,
        endIndex
      );

      const styledHeader = `
<style>
    div { font-family: system-ui; font-size: 8px; }
    .border-bottom { border-bottom: 1pt solid #eeeeee; }
    img { height: 40px !important; width: 40px; object-fit: fill; }
</style>
<div id='headerElement' style='padding-left: 30px; padding-bottom: 30px; width: 100%; height: 100px;'>${headerContent}</div>
`;

      const modifiedText = htmlContent.replaceRange(
        startIndex,
        endIndex + "@endheader".length,
        ""
      );

      return (
        modifiedText.substring(0, startIndex) +
        styledHeader +
        modifiedText.substring(startIndex)
      );
    } else {
      return htmlContent;
    }
  }

  static _parseReportFooter(htmlContent) {
    const startIndex = htmlContent.indexOf("@beginfooter");
    const endIndex = htmlContent.indexOf("@endfooter");

    if (startIndex !== -1 && endIndex !== -1) {
      const footerContent = htmlContent.substring(
        startIndex + "@beginfooter".length,
        endIndex
      );

      const styledFooter = `
<style>
    div { font-family: system-ui; font-size: 8px; }
    .border-bottom { border-bottom: 1pt solid #eeeeee; }
    img { height: 40px !important; width: 40px; object-fit: fill; }
</style>
<div id='footerElement' style='padding-left: 30px; padding-bottom: 30px; width: 100%; height: 100px;'>${footerContent}</div>
`;

      let modifiedText = htmlContent.replaceRange(
        startIndex,
        endIndex + "@endfooter".length,
        ""
      );

      modifiedText =
        modifiedText.substring(0, startIndex) +
        styledFooter +
        modifiedText.substring(startIndex);

      modifiedText = modifiedText.replaceAll(
        "@pagenumber",
        `
                <div>
                    Page <span class="pageNumber"></span>/<span style='padding-right: 30px;' class="totalPages"></span>
                </div>
                `
      );

      return modifiedText;
    } else {
      return htmlContent;
    }
  }

  static _parseCoverPage(htmlContent) {
    const startIndex = htmlContent.indexOf("@begincoverpage");
    const endIndex = htmlContent.indexOf("@endcoverpage");

    if (startIndex !== -1 && endIndex !== -1) {
      const coverPageContent = htmlContent.substring(
        startIndex + "@begincoverpage".length,
        endIndex
      );

      const parsedCoverPage = this._parseCoverPageHeader(coverPageContent);

      const modifiedText = htmlContent.replaceRange(
        startIndex,
        endIndex + "@endcoverpage".length,
        ""
      );

      return (
        modifiedText.substring(0, startIndex) +
        parsedCoverPage +
        modifiedText.substring(startIndex)
      );
    } else {
      return htmlContent;
    }
  }

  static _parseCoverPageHeader(htmlContent) {
    const startIndex = htmlContent.indexOf("@beginheader");
    const endIndex = htmlContent.indexOf("@endheader");

    if (startIndex !== -1 && endIndex !== -1) {
      const headerContent = htmlContent.substring(
        startIndex + "@beginheader".length,
        endIndex
      );

      const styledHeader = `
<style>
    div { font-family: system-ui; font-size: 8px; }
    .border-bottom { border-bottom: 1pt solid #eeeeee; }
    img { height: 40px !important; width: 40px; object-fit: fill; }
</style>
<div id='headerElement' style='padding-left: 30px; padding-bottom: 30px; width: 100%; height: 100px;'>${headerContent}</div>
`;

      const modifiedText = htmlContent.replaceRange(
        startIndex,
        endIndex + "@endheader".length,
        ""
      );

      return (
        modifiedText.substring(0, startIndex) +
        styledHeader +
        modifiedText.substring(startIndex)
      );
    } else {
      return htmlContent;
    }
  }

  static _parseExpressions(htmlContent) {
    htmlContent = this._parseNewLines(htmlContent);
    htmlContent = this._parseHorizontalLines(htmlContent);
    htmlContent = this._parsePageBreaks(htmlContent);
    htmlContent = this._parseDateKeywords(htmlContent);
    htmlContent = this._parseDateTimeKeywords(htmlContent);
    htmlContent = this._parseTimeKeywords(htmlContent);
    htmlContent = this._parseTOC(htmlContent);
    return htmlContent;
  }

  static _parseNewLines(htmlContent) {
    return htmlContent.replaceAll("@newline", "<br />");
  }

  static _parseHorizontalLines(htmlContent) {
    return htmlContent.replaceAll("@horizontalline", "<hr />");
  }

  static _parsePageBreaks(htmlContent) {
    return htmlContent.replaceAll(
      "@pagebreak",
      "<div style='page-break-before: always;'></div>"
    );
  }

  static _parseDateKeywords(htmlContent) {
    const now = new Date();
    return htmlContent.replaceAll("@date", now.toISOString().split("T")[0]);
  }

  static _parseDateTimeKeywords(htmlContent) {
    const now = new Date();
    return htmlContent.replaceAll(
      "@datetime",
      now.toISOString().replace("T", " ").split(".")[0]
    );
  }

  static _parseTimeKeywords(htmlContent) {
    const now = new Date();
    const time = now.toISOString().split("T")[1].split(".")[0];
    const [hours, minutes] = time.split(":");
    return htmlContent.replaceAll("@time", `${hours}:${minutes}`);
  }

  static _parseTOC(htmlContent) {
    // Extract sections metadata from HTML comment
    const sectionsCommentRegex = /<!-- @sections:(\[.*?\]) -->/;
    const sectionsMatch = htmlContent.match(sectionsCommentRegex);

    let sections = [];
    if (sectionsMatch) {
      try {
        sections = JSON.parse(sectionsMatch[1]);
      } catch (e) {
        console.error("Error parsing sections metadata:", e);
      }
    }

    // If no sections found in metadata, try to extract from section markers
    if (sections.length === 0) {
      const sectionMarkerRegex = /<!-- @section:([^:]+):([^>]+) -->/g;
      let match;
      const sectionMap = new Map();

      while ((match = sectionMarkerRegex.exec(htmlContent)) !== null) {
        const sectionId = match[1];
        const sectionTitle = match[2];
        if (!sectionMap.has(sectionId)) {
          sectionMap.set(sectionId, sectionTitle);
        }
      }

      sections = Array.from(sectionMap.entries()).map(([id, title]) => ({
        id,
        title,
      }));
    }

    // Generate TOC HTML
    const generateTOCHTML = (sections) => {
      if (!sections || sections.length === 0) {
        return '<div style="margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;"><h2 style="margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;">Table of Contents</h2><p style="margin: 0.5em 0; color: inherit; font-style: italic; text-align: center; padding: 1em; opacity: 0.7;">No sections found in document.</p></div><div style="page-break-after: always;"></div>';
      }

      const containerStyle =
        "margin: 1.5em 0; padding: 1.5em; border: none; border-radius: 8px; background: transparent; page-break-inside: avoid;";
      const titleStyle =
        "margin: 0 0 1em 0; padding-bottom: 0.75em; font-weight: 700; font-size: 1.5em; color: inherit; border-bottom: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;";
      const listStyle = "list-style: none; padding: 0; margin: 0;";
      const itemStyle =
        "display: flex; align-items: center; padding: 0.75em 0.5em; margin: 0.25em 0; border-bottom: 1px solid transparent; transition: background-color 0.2s ease; border-radius: 4px;";
      const sectionTitleStyle =
        "font-size: 1em; font-weight: 500; color: inherit; line-height: 1.5;";

      let tocHTML = `<div data-toc-marker="true" class="toc-container" style="${containerStyle}">`;
      tocHTML += `<h2 class="toc-title" style="${titleStyle}">Table of Contents</h2>`;
      tocHTML += `<ul class="toc-list" style="${listStyle}">`;

      sections.forEach((section, sectionIndex) => {
        const itemStyleWithLast =
          sectionIndex === sections.length - 1
            ? itemStyle.replace(
              "border-bottom: 1px solid #e0e0e0;",
              "border-bottom: none;"
            )
            : itemStyle;

        const escapedTitle = section.title
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        tocHTML += `<li class="toc-item" style="${itemStyleWithLast}">`;
        tocHTML += `<span class="toc-section-title" style="${sectionTitleStyle}">${escapedTitle}</span>`;
        tocHTML += "</li>";
      });

      tocHTML += "</ul></div>";
      tocHTML += '<div style="page-break-after: always;"></div>';

      return tocHTML;
    };

    // Replace @toc with generated TOC
    const tocHTML = generateTOCHTML(sections);
    htmlContent = htmlContent.replace(/@toc/g, tocHTML);

    return htmlContent;
  }

  // Helper method to replace a range in a string
  static replaceRange(str, start, end, replacement) {
    return str.substring(0, start) + replacement + str.substring(end);
  }

  static _processPointData(content, points, start, end, imperial = false) {
    let processedContent = content;
    const pointStart = "@beginforpoint";
    const pointEnd = "@endforpoint";

    let startIndex = processedContent.indexOf(pointStart);
    while (startIndex !== -1) {
      const endIndex = processedContent.indexOf(pointEnd, startIndex + 1);
      if (endIndex === -1) break;

      const textBeforeMarker = processedContent.substring(0, startIndex);
      const textAfterMarker = processedContent.substring(
        endIndex + pointEnd.length
      );
      const textToProcess = processedContent.substring(
        startIndex + pointStart.length,
        endIndex
      );

      let totalResult = "";
      for (const point of points) {
        if (point.data === "") continue;
        const data = JSON.parse(point.data);
        totalResult += this._processPointIteration(
          textToProcess,
          point,
          data,
          start,
          end,
          imperial
        );
      }

      processedContent = `${textBeforeMarker}${totalResult}${textAfterMarker}`;
      startIndex = processedContent.indexOf(pointStart, endIndex + 1);
    }

    return processedContent;
  }

  static _processPointIteration(
    textToProcess,
    point,
    data,
    start,
    end,
    imperial = false
  ) {
    // Process point variables
    const pointRegex = /@point\('([^']*)'\)/g;
    textToProcess = textToProcess.replaceAll(pointRegex, (match, word) => {
      word = word.toLowerCase();
      if (String(word).includes(",")) {
        const syls = String(word).split(",");
        const firstSyl = syls[0].trim();
        if (firstSyl === "info") {
          let fontSize = "16px";
          if (syls.length > 1) {
            const secondSyl = syls[1].replace("font-size:", "").trim();
            if (secondSyl === "small") {
              fontSize = "12px";
            } else if (secondSyl === "medium") {
              fontSize = "14px";
            } else if (secondSyl === "large") {
              fontSize = "16px";
            } else {
              fontSize = secondSyl;
            }
          }
          return this._generatePointInformation(
            point,
            data,
            imperial,
            fontSize
          );
        }
      } else if (word === "address" || word === "location") {
        if (point.type !== "start" && point.type !== "end") {
          if (point.type === "railroad") {
            return data.roadAddress || "";
          } else if (point.type === "road") {
            return data.roadAddress || "";
          } else if (point.type === "powerline") {
            return data.roadAddress || "";
          } else if (point.type === "bridge") {
            return data.bridgeAddress || "";
          } else if (point.type === "intersection") {
            return data.primaryRoadAddress || "";
          } else if (point.type === "overhead") {
            return data.roadAddress || "";
          } else if (point.type === "custom") {
            return data.roadAddress || "";
          }
        } else {
          if (point.type === "start") {
            return start || "";
          } else if (point.type === "end") {
            return end || "";
          }
        }
        return "";
      } else if (
        word === "shortaddress" ||
        word === "short_address" ||
        word === "short_addr"
      ) {
        if (point.type === "railroad") {
          return data.roadAddress?.split(",")[0] || "";
        } else if (point.type === "road") {
          return data.roadAddress?.split(",")[0] || "";
        } else if (point.type === "powerline") {
          return data.roadAddress?.split(",")[0] || "";
        } else if (point.type === "bridge") {
          return data.bridgeAddress?.split(",")[0] || "";
        } else if (point.type === "intersection") {
          return data.primaryRoadAddress?.split(",")[0] || "";
        } else if (point.type === "overhead") {
          return data.roadAddress?.split(",")[0] || "";
        } else if (point.type === "custom") {
          return data.roadAddress?.split(",")[0] || "";
        }
        return "";
      } else if (word === "notes" || word === "note") {
        return (
          String(point.type).charAt(0).toUpperCase() +
          String(point.type).slice(1) ||
          "" + "\n" + data.pointNotes ||
          ""
        );
      } else if (word === "info" || word === "information") {
        return this._generatePointInformation(point, data, imperial);
      } else if (word === "dateadded" || word === "date") {
        return (
          point.dateAdded
            ?.toString()
            .replace("T", " ")
            .split(".")[0]
            .split(" ")[0] || ""
        );
      } else if (word === "time" || word === "timeadded") {
        const time =
          point.dateAdded
            ?.toString()
            .replace("T", " ")
            .split(".")[0]
            .split(" ")[1] || "";
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`;
      } else if (word === "datetime") {
        return (
          point.dateAdded?.toString().replace("T", " ").split(".")[0] || ""
        );
      } else if (word === "location" || word === "gps") {
        const coords = point.lat + ", " + point.lng;
        const googleMapsUrl = `https://maps.google.com/?q=${point.lat},${point.lng}`;
        return `<a href="${googleMapsUrl}" target="_blank">${coords}</a>`;
      } else if (word === "location_deg") {
        const latDeg = Math.abs(point.lat);
        const latMin = (Math.abs(point.lat) % 1) * 60;
        const latDir = point.lat >= 0 ? "N" : "S";
        const lngDeg = Math.abs(point.lng);
        const lngMin = (Math.abs(point.lng) % 1) * 60;
        const lngDir = point.lng >= 0 ? "E" : "W";
        const degCoords = `${Math.floor(latDeg)}°${latMin.toFixed(
          2
        )}' ${latDir}, ${Math.floor(lngDeg)}°${lngMin.toFixed(2)}' ${lngDir}`;
        const googleMapsUrl = `https://maps.google.com/?q=${point.lat},${point.lng}`;
        return `<a href="${googleMapsUrl}" target="_blank">${degCoords}</a>`;
      } else if (word === "location_deg_gps") {
        const latDeg = Math.abs(point.lat);
        const latMin = (Math.abs(point.lat) % 1) * 60;
        const latDir = point.lat >= 0 ? "N" : "S";
        const lngDeg = Math.abs(point.lng);
        const lngMin = (Math.abs(point.lng) % 1) * 60;
        const lngDir = point.lng >= 0 ? "E" : "W";
        const degCoords = `${Math.floor(latDeg)}°${latMin.toFixed(
          2
        )}' ${latDir}, ${Math.floor(lngDeg)}°${lngMin.toFixed(2)}' ${lngDir}`;
        const decimalCoords = `${point.lat}, ${point.lng}`;
        const googleMapsUrl = `https://maps.google.com/?q=${point.lat},${point.lng}`;
        return `<a href="${googleMapsUrl}" target="_blank">${degCoords}</a> \n <a href="${googleMapsUrl}" target="_blank">${decimalCoords}</a>`;
      } else if (word === "distance") {
        const formattedDist =
          (imperial
            ? point.distance / 1609.34
            : point.distance / 1000.0
          )?.toFixed(2) || "";
        return formattedDist
          ? `${formattedDist} ${imperial ? "mi" : "km"}`
          : "";
      } else if (word === "lat" || word === "latitude") {
        return point.lat?.toString() || "";
      } else if (word === "lon" || word === "longitude") {
        return point.lng?.toString() || "";
      } else if (word === "heading") {
        return point.heading?.toString() || "";
      } else if (word === "altitude") {
        return point.altitude?.toString() || "";
      } else if (word === "type") {
        return (
          String(point.type).charAt(0).toUpperCase() +
          String(point.type).slice(1) || ""
        );
      }
      return "";
    });

    // Process point notes
    if (point.type === "start" || point.type === "end") {
      textToProcess = this._processPointNotes(textToProcess, [], imperial);
    } else {
      textToProcess = this._processPointNotes(
        textToProcess,
        data.media || [],
        imperial
      );
    }

    // Parse any remaining expressions
    textToProcess = this._parseExpressions(textToProcess);

    return textToProcess;
  }

  static _generatePointInformation(
    point,
    data,
    imperial = false,
    fontSize = "16px"
  ) {
    if (point.type !== "end" && point.type !== "start") {
      if (point.type === "railroad") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Railroad</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Railroad Crossing No</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.crossingNo}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Carrier</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.carrier}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Height Restriction</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.heightRestriction
          } ${imperial ? "feet" : "meters"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Width</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadWidth} ${imperial ? "feet" : "meters"
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Crossing Width</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.crossingWidth} ${imperial ? "feet" : "meters"
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Slope</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.slope} ${imperial ? "%" : ""
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact No</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.contactNo}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "road") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Road</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Width</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadWidth} ${imperial ? "feet" : "meters"
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "powerline") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Powerline</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type of Powerline</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.typeOfPowerline
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Voltage</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.voltage} KV</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Height Above Ground</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.heightAboveGround
          } ${imperial ? "feet" : "meters"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "bridge") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Bridge</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Bridge Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.bridgeAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Height Above Ground</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.heightAboveGround
          } ${imperial ? "feet" : "meters"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "intersection") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Intersection</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type of Intersection</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${RouteUtils.translateIntersectionType(
          data.typeOfIntersection
        )}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Primary Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.primaryRoadAddress
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Secondary Road</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.secondaryRoad}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "overhead") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Overhead</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Dismountable</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.dismountable}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Type of Obstruction</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.typeOfObstruction
          }</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Height Above Ground</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.heightAboveGround
          } ${imperial ? "feet" : "meters"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      } else if (point.type === "custom") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Custom</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Road Address</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.roadAddress}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Description of Obstruction</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.descriptionOfObstruction}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Height Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.heightNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Width Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.widthNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Length Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.lengthNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Area Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.areaNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ground Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.groundNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Restriction Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.restrictionNotes}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">${data.pointNotes}</td>
  </tr>
</table>
        `);
      }
    } else {
      if (point.type === "start") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">Start</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">This is the start point of the route.</td>
  </tr>
</table>
        `);
      } else if (point.type === "end") {
        return this._parseExpressions(`
<table class="table table-bordered table-striped" style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: ${fontSize};">
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Point Type</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">End</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Point Notes</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd;">This is the end point of the route.</td>
  </tr>
</table>
        `);
      }
    }
    return "";
  }

  static _processPointNotes(content, notes, imperial = false) {
    let processedContent = content;
    const noteStart = "@beginfornote";
    const noteEnd = "@endfornote";

    let startIndex = processedContent.indexOf(noteStart);
    while (startIndex !== -1) {
      const endIndex = processedContent.indexOf(noteEnd, startIndex + 1);
      if (endIndex === -1) break;

      const textBeforeMarker = processedContent.substring(0, startIndex);
      const textAfterMarker = processedContent.substring(
        endIndex + noteEnd.length
      );
      const textToProcess = processedContent.substring(
        startIndex + noteStart.length,
        endIndex
      );

      let totalResult = "";
      if (notes.length > 0) {
        for (const note of notes) {
          const noteResult = this._processPointNoteIteration(
            textToProcess,
            note,
            imperial
          );
          // Concatenate without adding line breaks - images should stay inline
          totalResult += noteResult;
        }
      }

      // Post-process to ensure images stay inline and flow naturally (remove any block wrappers)
      // Replace <p> tags that only contain images with inline spans that allow wrapping
      totalResult = totalResult.replace(
        /<p[^>]*>((?:<a[^>]*><img[^>]*><\/a>\s*)+)<\/p>/gi,
        '<span style="display: inline; white-space: normal;">$1</span>'
      );
      // Also handle cases where images might be wrapped in multiple <p> tags
      totalResult = totalResult.replace(/<\/p>\s*<p[^>]*>/gi, ""); // Remove <p> tags between consecutive images

      processedContent = `${textBeforeMarker}${totalResult}${textAfterMarker}`;
      startIndex = processedContent.indexOf(noteStart, endIndex + 1);
    }

    return processedContent;
  }

  static _processPointNoteIteration(textToProcess, note, imperial = false) {
    // Process note variables
    const noteRegex = /@note\('([^']*)'\)/g;
    textToProcess = textToProcess.replaceAll(noteRegex, (match, word) => {
      word = word.toLowerCase();

      if (word === "text" || word === "note") {
        return note.note || "";
      }
      return "";
    });

    // Process note images
    textToProcess = this._processPointNoteImageIteration(
      textToProcess,
      note,
      imperial
    );

    return textToProcess;
  }

  static _processPointNoteImageIteration(
    textToProcess,
    note,
    imperial = false
  ) {
    const imageRegex = /@noteimg\('([^']*)'\)/g;
    return textToProcess.replaceAll(imageRegex, (match, word) => {
      if (!word) return "";

      word = word.toLowerCase();
      let totalResult = "";
      const images = [note.url];

      const mode = word === "fit" ? "fit" : "determined";

      if (mode === "determined") {
        // Match h=30, h = 30, H=30, etc. (case-insensitive, optional spaces)
        const heightMatch = word.match(/h\s*=\s*(\d+)/i);
        const widthMatch = word.match(/w\s*=\s*(\d+)/i);

        if (heightMatch) {
          const h = parseFloat(heightMatch[1]);
          if (!isNaN(h)) {
            totalResult = this.generateImageHTML(images, { height: h });
          }
        } else if (widthMatch) {
          const w = parseFloat(widthMatch[1]);
          if (!isNaN(w)) {
            totalResult = this.generateImageHTML(images, { width: w });
          }
        } else {
          const dimensions = word.split("x");
          if (dimensions.length === 2) {
            const w = parseFloat(dimensions[0].trim());
            const h = parseFloat(dimensions[1].trim());
            if (!isNaN(w) && !isNaN(h)) {
              totalResult = this.generateImageHTML(images, {
                width: w,
                height: h,
              });
            }
          }
        }
      } else if (mode === "fit") {
        totalResult = this.generateImageHTML(images, { fit: true });
      }

      return totalResult;
    });
  }

  static _processPointNoteImageData(textToProcess, image) {
    const imageRegex = /@image\('([^']*)'\)/g;
    return textToProcess.replaceAll(imageRegex, (match, word) => {
      word = word.toLowerCase();

      if (word === "url" || word === "src" || word === "source") {
        return image.url || "";
      } else if (word === "alt" || word === "alttext") {
        return image.alt || "";
      } else if (word === "caption") {
        return image.caption || "";
      }
      return "";
    });
  }

  static async _processSurveyData(htmlContent, id, range = null) {
    try {
      if (this.surveyData === null) {
        const res = await RoutesController.getRoute(id);
        if (!res.result) {
          console.error("Failed to fetch route data");
          return htmlContent;
        }

        this.surveyData = res.data;
      }

      if (this.userData === null) {
        const authStore = useAuthStore();
        if (!authStore.user) {
          await authStore.fetchUserProfile();
        }

        if (!authStore.user) {
          console.error("Failed to fetch current user data");
          return htmlContent;
        }
        const currentUserData = authStore.user;

        this.userData = currentUserData;
      }

      const imperial = this.userData.imperial;

      const routeData = this.surveyData;
      let points = routeData.pointsData || [];
      points = RouteUtils.calculateRoutePointsDistances(points);
      let mapScreenshots = routeData.mapScreenshots || [];

      const mapScreenshotsRes =
        await route_map_screenshots_controller.getMapScreenshotsByRouteId(id);
      if (mapScreenshotsRes.result) {
        mapScreenshots = mapScreenshotsRes.data;
      }

      // Process points data
      let processedContent = htmlContent;

      // Add start and end points
      if (points.length > 0) {
        points = [
          { ...points[0], type: "start" },
          ...points.filter((point) => point.type !== "route_point"),
          { ...points[points.length - 1], type: "end" },
        ];
      }

      // Define a regular expression to match the pattern @survey('word')
      const regex = /@survey\('([^']*)'\)/g;

      // Replace occurrences of the pattern with conditional replacements
      processedContent = processedContent.replaceAll(regex, (match, word) => {
        word = word.toLowerCase();

        // Conditional replacements based on the word
        if (word === "name" || word === "title") {
          return routeData.title || "";
        } else if (
          word === "description" ||
          word === "note" ||
          word === "notes"
        ) {
          return routeData.note || "";
        } else if (word === "dateadded" || word === "date") {
          return (
            routeData.dateAdded
              ?.toString()
              .replace("T", " ")
              .split(".")[0]
              .split(" ")[0] || ""
          );
        } else if (word === "timeadded" || word === "time") {
          const time =
            routeData.dateAdded
              ?.toString()
              .replace("T", " ")
              .split(".")[0]
              .split(" ")[1] || "";
          const [hours, minutes] = time.split(":");
          return `${hours}:${minutes}`;
        } else if (word === "dateupdated" || word === "lastupdated") {
          return (
            routeData.dateUpdated
              ?.toString()
              .replace("T", " ")
              .split(".")[0]
              .split(" ")[0] || ""
          );
        } else if (
          word === "points" ||
          word === "pnts" ||
          word === "pointscount" ||
          word === "pntscount"
        ) {
          return points.length;
        } else if (word === "timeupdated" || word === "lasttimeupdated") {
          const time =
            routeData.dateUpdated
              ?.toString()
              .replace("T", " ")
              .split(".")[0]
              .split(" ")[1] || "";
          const [hours, minutes] = time.split(":");
          return `${hours}:${minutes}`;
        } else if (
          word === "start" ||
          word === "startpoint" ||
          word === "begin" ||
          word === "beginpoint"
        ) {
          return routeData.start || "";
        } else if (
          word === "end" ||
          word === "endpoint" ||
          word === "finish" ||
          word === "finishpoint"
        ) {
          return routeData.end || "";
        } else if (
          word === "distance" ||
          word === "dist" ||
          word === "km" ||
          word === "milage"
        ) {
          const distance = parseFloat(routeData.distance || 0);
          return `${(distance / 1000.0).toFixed(2)} km`;
        } else if (
          word.includes("staticmap") ||
          word.includes("static_map") ||
          word.includes("map") ||
          word.includes("map_img") ||
          word.includes("map_image")
        ) {
          const photoUrl = this.getMapboxStaticMapUrl(
            points.map((point) => ({
              lat: parseFloat(point.lat),
              lng: parseFloat(point.lng),
            })),
            import.meta.env.VITE_MAPBOX_API_KEY,
            600,
            400
          );

          if (
            word === "staticmap" ||
            word === "static_map" ||
            word === "map" ||
            word === "map_image" ||
            word === "map_img"
          ) {
            return this.generateImageHTML([photoUrl], {
              width: 600,
              height: 400,
            });
          } else {
            const parts = word.split(",");
            if (parts.length === 2) {
              const mode = parts[1] === "fit" ? "fit" : "determined";

              if (mode === "determined") {
                const dimensionPart = parts[1].trim();
                // Match h=30, h = 30, H=30, etc. (case-insensitive, optional spaces)
                const heightMatch = dimensionPart.match(/h\s*=\s*(\d+)/i);
                const widthMatch = dimensionPart.match(/w\s*=\s*(\d+)/i);

                if (heightMatch) {
                  const h = parseFloat(heightMatch[1]);
                  if (!isNaN(h)) {
                    return this.generateImageHTML([photoUrl], { height: h });
                  }
                } else if (widthMatch) {
                  const w = parseFloat(widthMatch[1]);
                  if (!isNaN(w)) {
                    return this.generateImageHTML([photoUrl], { width: w });
                  }
                } else {
                  const dimensions = dimensionPart.split("x");
                  if (dimensions.length === 2) {
                    const w = parseFloat(dimensions[0].trim());
                    const h = parseFloat(dimensions[1].trim());
                    if (!isNaN(w) && !isNaN(h)) {
                      return this.generateImageHTML([photoUrl], {
                        width: w,
                        height: h,
                      });
                    }
                  }
                }
              } else if (mode === "fit") {
                return this.generateImageHTML([photoUrl], { fit: true });
              }
            }
          }
          return "";
        }
        return "";
      });

      // Process points
      processedContent = this._processPointData(
        processedContent,
        points,
        routeData.start,
        routeData.end,
        imperial
      );

      // Process map screenshots
      processedContent = this._processMapScreenshots(
        processedContent,
        routeData.id,
        mapScreenshots
      );

      return processedContent;
    } catch (error) {
      console.error("Error processing survey data:", error);
      return htmlContent;
    }
  }

  static _processMapScreenshots(htmlContent, routeId, mapScreenshots) {
    let processedContent = htmlContent;
    const noteStart = "@beginformapscreenshot";
    const noteEnd = "@endformapscreenshot";

    console.log("Processing map screenshots. Count:", mapScreenshots.length);

    let startIndex = processedContent.indexOf(noteStart);
    while (startIndex !== -1) {
      const endIndex = processedContent.indexOf(noteEnd, startIndex + 1);
      if (endIndex === -1) break;

      const textBeforeMarker = processedContent.substring(0, startIndex);
      const textAfterMarker = processedContent.substring(
        endIndex + noteEnd.length
      );
      const textToProcess = processedContent.substring(
        startIndex + noteStart.length,
        endIndex
      );

      console.log("Found map screenshot block:", textToProcess);

      let totalResult = "";
      if (mapScreenshots.length > 0) {
        for (const mapScreenshot of mapScreenshots) {
          const screenshotText = this._processMapScreenshot(
            textToProcess,
            mapScreenshot
          );
          console.log("Processed screenshot:", screenshotText);
          totalResult += screenshotText;
        }
      } else {
        // If no map screenshots, still process the expressions to remove them
        // This prevents the @mapscreenshot expressions from appearing in the output
        totalResult = this._processMapScreenshotExpressions(textToProcess);
        console.log(
          "No map screenshots available, processed expressions:",
          totalResult
        );
      }

      processedContent = `${textBeforeMarker}${totalResult}${textAfterMarker}`;
      startIndex = processedContent.indexOf(noteStart, endIndex + 1);
    }

    return processedContent;
  }

  static _processMapScreenshot(htmlContent, mapScreenshot) {
    const mapScreenshotData = JSON.parse(mapScreenshot.screenshot);

    const photoUrl = mapScreenshotData.Url || "";
    const photoType = mapScreenshotData.Type || "photo";
    const photoNote = mapScreenshotData.Note || "";

    console.log("Processing map screenshot with URL:", photoUrl);

    if (photoUrl.length === 0) {
      console.log("No photo URL found, returning original content");
      return htmlContent;
    }

    const imageRegex = /@mapscreenshot\([''']([^'']*)[''']\)/g;

    const result = htmlContent.replaceAll(imageRegex, (match, word) => {
      if (!word) return "";

      word = word.toLowerCase();
      let totalResult = "";

      if (word.includes("url")) {
        const images = [photoUrl];

        const parts = word.split(",");
        let isUrlRequested = false;
        let width = null;
        let height = null;

        for (const part of parts) {
          const trimmedPart = part.trim();
          if (trimmedPart === "url") {
            isUrlRequested = true;
          } else if (trimmedPart.startsWith("w=")) {
            width = parseFloat(trimmedPart.substring(2));
          } else if (trimmedPart.startsWith("h=")) {
            height = parseFloat(trimmedPart.substring(2));
          } else if (trimmedPart.includes("x")) {
            const dimensions = trimmedPart.split("x");
            if (dimensions.length === 2) {
              width = parseFloat(dimensions[0]);
              height = parseFloat(dimensions[1]);
            }
          }
        }

        // If only url is requested, return the URL
        if (isUrlRequested && parts.length === 1) {
          return photoUrl;
        }

        // If url is requested with dimensions, generate image HTML
        if (isUrlRequested || width || height) {
          const options = {};
          if (width) options.width = width;
          if (height) options.height = height;
          const imageHTML = this.generateImageHTML(images, options);
          return imageHTML;
        }

        // Handle legacy fit mode
        const mode = word === "fit" ? "fit" : "determined";

        if (mode === "determined") {
          // Match h=30, h = 30, H=30, etc. (case-insensitive, optional spaces)
          const heightMatch = word.match(/h\s*=\s*(\d+)/i);
          const widthMatch = word.match(/w\s*=\s*(\d+)/i);

          if (heightMatch) {
            const h = parseFloat(heightMatch[1]);
            if (!isNaN(h)) {
              totalResult = this.generateImageHTML(images, { height: h });
            }
          } else if (widthMatch) {
            const w = parseFloat(widthMatch[1]);
            if (!isNaN(w)) {
              totalResult = this.generateImageHTML(images, { width: w });
            }
          } else {
            const dimensions = word.split("x");
            if (dimensions.length === 2) {
              const w = parseFloat(dimensions[0].trim());
              const h = parseFloat(dimensions[1].trim());
              if (!isNaN(w) && !isNaN(h)) {
                totalResult = this.generateImageHTML(images, {
                  width: w,
                  height: h,
                });
              }
            }
          }
        } else if (mode === "fit") {
          totalResult = this.generateImageHTML(images, { fit: true });
        }
      } else if (word === "note" || word === "notes" || word === "noteimg") {
        return photoNote || "";
      } else if (word === "type" || word === "typeimg") {
        return photoType || "";
      }

      return totalResult;
    });

    return result;
  }

  static _processMapScreenshotExpressions(htmlContent) {
    // This method is called when there are no map screenshots to process.
    // It will replace @mapscreenshot expressions with empty strings to remove them.
    return htmlContent.replaceAll(/@mapscreenshot\([''']([^'']*)[''']\)/g, "");
  }

  static getMapboxStaticMapUrl(
    points,
    accessToken,
    width = 600,
    height = 400,
    mapStyle = "mapbox/streets-v11",
    markerColor = "ff0000",
    padding = 50
  ) {
    if (!points || points.length === 0) {
      throw new Error("At least one point must be provided");
    }

    // Calculate bounding box
    const bbox = this._calculateBoundingBox(points);
    const center = this._calculateCenter(bbox);

    // Create markers string for all points
    const markers = points
      .map((point) => `pin-s+${markerColor}(${point.lng},${point.lat})`)
      .join(",");

    // Build the URL components
    const baseUrl = "https://api.mapbox.com/styles/v1";
    const size = `${width}x${height}`;
    const params = `access_token=${accessToken}&padding=${padding}`;

    // Full URL format:
    // https://api.mapbox.com/styles/v1/{style_id}/static/{overlay}/{bbox}/{width}x{height}?{params}
    return `${baseUrl}/${mapStyle}/static/${markers}/auto/${size}?${params}`;
  }

  static _calculateBoundingBox(points) {
    let minLat = points[0].lat;
    let maxLat = points[0].lat;
    let minLon = points[0].lng;
    let maxLon = points[0].lng;

    for (const point of points) {
      minLat = point.lat < minLat ? point.lat : minLat;
      maxLat = point.lat > maxLat ? point.lat : maxLat;
      minLon = point.lng < minLon ? point.lng : minLon;
      maxLon = point.lng > maxLon ? point.lng : maxLon;
    }

    return { west: minLon, south: minLat, east: maxLon, north: maxLat };
  }

  static _calculateCenter(bbox) {
    return {
      lat: (bbox.south + bbox.north) / 2,
      lng: (bbox.west + bbox.east) / 2,
    };
  }

  static async _processPlannedRouteData(htmlContent, id) {
    try {
      if (this.plannedRouteData === null) {
        const res = await PlannedRoutesController.getRouteData(id);
        if (!res.result) {
          console.error("Failed to fetch planned route data");
          return htmlContent;
        }

        this.plannedRouteData = res.data;
      }

      const routeData = this.plannedRouteData;
      let processedContent = htmlContent;

      // Define a regular expression to match the pattern @plannedroute('word')
      const regex = /@plannedroute\('([^']*)'\)/g;

      // Replace occurrences of the pattern with conditional replacements
      processedContent = processedContent.replaceAll(regex, (match, word) => {
        word = word.toLowerCase();

        // Conditional replacements based on the word
        if (
          word === "startpoint" ||
          word === "start_point" ||
          word === "start"
        ) {
          return (
            routeData.StartPoint?.display_name ||
            routeData.StartPoint?.address?.display_name ||
            ""
          );
        } else if (
          word === "endpoint" ||
          word === "end_point" ||
          word === "end"
        ) {
          return (
            routeData.EndPoint?.display_name ||
            routeData.EndPoint?.address?.display_name ||
            ""
          );
        } else if (word === "waypoints" || word === "waypoint_count") {
          return (routeData.Waypoints || []).length.toString();
        } else if (word === "routepath" || word === "route_path") {
          return (routeData.RoutePath || []).length.toString();
        } else if (word === "distance" || word === "total_distance") {
          if (routeData.routeInfo?.distance) {
            return `${(routeData.routeInfo.distance / 1000).toFixed(2)} km`;
          }
          return "";
        } else if (word === "duration" || word === "total_duration") {
          if (routeData.routeInfo?.duration) {
            const hours = Math.floor(routeData.routeInfo.duration / 3600);
            const minutes = Math.floor(
              (routeData.routeInfo.duration % 3600) / 60
            );
            return `${hours}h ${minutes}m`;
          }
          return "";
        } else if (word === "start_lat" || word === "start_latitude") {
          return routeData.startPoint?.lat?.toString() || "";
        } else if (word === "start_lng" || word === "start_longitude") {
          return routeData.startPoint?.lng?.toString() || "";
        } else if (word === "end_lat" || word === "end_latitude") {
          return routeData.endPoint?.lat?.toString() || "";
        } else if (word === "end_lng" || word === "end_longitude") {
          return routeData.endPoint?.lng?.toString() || "";
        } else if (word === "start_coordinates") {
          if (routeData.startPoint?.lat && routeData.startPoint?.lng) {
            const googleMapsUrl = `https://maps.google.com/?q=${routeData.startPoint.lat},${routeData.startPoint.lng}`;
            return `<a href="${googleMapsUrl}" target="_blank">${routeData.startPoint.lat}, ${routeData.startPoint.lng}</a>`;
          }
          return "";
        } else if (word === "end_coordinates") {
          if (routeData.endPoint?.lat && routeData.endPoint?.lng) {
            const googleMapsUrl = `https://maps.google.com/?q=${routeData.endPoint.lat},${routeData.endPoint.lng}`;
            return `<a href="${googleMapsUrl}" target="_blank">${routeData.endPoint.lat}, ${routeData.endPoint.lng}</a>`;
          }
          return "";
        } else if (word === "route_map" || word === "static_map") {
          if (routeData.RoutePath && routeData.RoutePath.length > 0) {
            const points = routeData.RoutePath.map((coord) => ({
              lat: coord[0],
              lng: coord[1],
            }));

            const photoUrl = this.getMapboxStaticMapUrl(
              points,
              import.meta.env.VITE_MAPBOX_API_KEY,
              600,
              400
            );

            return this.generateImageHTML([photoUrl], {
              width: 600,
              height: 400,
            });
          }
          return "";
        }
        // Survey Information
        else if (word === "survey_name" || word === "name") {
          return routeData.SurveyName || "";
        } else if (word === "survey_date" || word === "date") {
          return routeData.SurveyDate || "";
        } else if (word === "survey_start" || word === "start_location") {
          return routeData.SurveyStart || "";
        } else if (word === "survey_end" || word === "end_location") {
          return routeData.SurveyEnd || "";
        } else if (word === "survey_instructions" || word === "instructions") {
          return routeData.SurveyInstructions || "";
        }
        // Client Information
        else if (word === "client_name" || word === "client") {
          return routeData.ClientName || "";
        }
        // Cargo Information
        else if (word === "cargo_type" || word === "cargo") {
          return routeData.CargoType || "";
        } else if (word === "cargo_weight" || word === "weight") {
          return routeData.CargoWeight || "";
        } else if (word === "cargo_length" || word === "length") {
          return routeData.CargoLength || "";
        } else if (word === "cargo_width" || word === "width") {
          return routeData.CargoWidth || "";
        } else if (word === "cargo_height" || word === "height") {
          return routeData.CargoHeight || "";
        } else if (word === "cargo_notes" || word === "cargo_notes") {
          return routeData.CargoNotes || "";
        }
        // Trailer Information
        else if (word === "trailer_type" || word === "trailer") {
          return routeData.TrailerType || "";
        } else if (word === "trailer_length" || word === "trailer_length") {
          return routeData.TrailerLength || "";
        } else if (word === "trailer_notes" || word === "trailer_notes") {
          return routeData.TrailerNotes || "";
        }
        // Route Information
        else if (word === "planned_route_id" || word === "route_id") {
          return routeData.PlannedRouteId?.toString() || "";
        }
        return "";
      });

      return processedContent;
    } catch (error) {
      console.error("Error processing planned route data:", error);
      // Replace all @plannedroute keywords with empty strings when an error occurs
      return htmlContent.replaceAll(/@plannedroute\('([^']*)'\)/g, "");
    }
  }

  static async _processUserData(htmlContent) {
    try {
      if (this.userData === null) {
        const authStore = useAuthStore();
        if (!authStore.user) {
          await authStore.fetchUserProfile();
        }

        if (!authStore.user) {
          console.error("Failed to fetch current user data");
          return htmlContent;
        }
        const currentUserData = authStore.user;

        this.userData = currentUserData;
      }

      const userData = this.userData;
      let processedContent = htmlContent;

      // Define a regular expression to match the pattern @user('word')
      const regex = /@user\('([^']*)'\)/g;

      // Find all matches in the content
      const matches = [...processedContent.matchAll(regex)];

      // Process each match
      for (const match of matches) {
        const word = match[1]?.toLowerCase();
        if (!word) continue;

        let replacement = "";

        if (word === "name" || word === "username") {
          replacement = userData.name || "";
        } else if (word === "firstname" || word === "first_name") {
          replacement = userData.firstName || "";
        } else if (word === "lastname" || word === "last_name") {
          replacement = userData.lastName || "";
        } else if (word === "email") {
          replacement = userData.email || "";
        } else if (
          word === "phone" ||
          word === "phoneno" ||
          word === "phonenumber"
        ) {
          replacement = userData.phone || "";
        } else if (
          word === "officephone" ||
          word === "office_phone" ||
          word === "officephone"
        ) {
          replacement = userData.officePhone || "";
        } else if (
          word === "mobilephone" ||
          word === "mobile_phone" ||
          word === "mobilephone"
        ) {
          replacement = userData.mobilePhone || "";
        } else if (
          word === "companyname" ||
          word === "company_name" ||
          word === "companyname" ||
          word === "company"
        ) {
          replacement = userData.companyName || "";
        } else if (
          word === "companywebsite" ||
          word === "company_website" ||
          word === "companywebsite"
        ) {
          replacement = userData.companyWebsite || "";
        } else if (
          word === "companyadstreet" ||
          word === "company_ad_street" ||
          word === "companyadstreet"
        ) {
          replacement = userData.companyADStreet || "";
        } else if (
          word === "companyadcity" ||
          word === "company_ad_city" ||
          word === "companyadcity"
        ) {
          replacement = userData.companyADCity || "";
        } else if (
          word === "companyadstate" ||
          word === "company_ad_state" ||
          word === "companyadstate"
        ) {
          replacement = userData.companyADState || "";
        } else if (
          word === "companyadzip" ||
          word === "company_ad_zip" ||
          word === "companyadzip"
        ) {
          replacement = userData.companyADZip || "";
        } else if (
          word === "companyadcountry" ||
          word === "company_ad_country" ||
          word === "companyadcountry"
        ) {
          // console.log(userData);
          replacement = userData.companyADCountry || "";
        } else if (
          word === "disclaimer" ||
          word === "company_disclaimer" ||
          word === "companydisclaimer"
        ) {
          replacement = userData.disclaimer || "";
        } else if (word.includes("companylogo")) {
          if (!userData.companyLogo) {
            replacement = "";
          } else {
            const photoUrl = userData.companyLogo
              .toString()
              .replaceAll(
                "http://localhost:5005",
                "https://api.route-survey.survys.com"
              );

            if (word === "companylogo") {
              // replacement = await this._imageToBase64(photoUrl, 50, 50);
              replacement = this.generateImageHTML([photoUrl], {
                width: 50,
                height: 50,
              });
            } else {
              const parts = word.split(",");
              if (parts.length === 2) {
                const mode = parts[1].trim() === "fit" ? "fit" : "determined";

                if (mode === "determined") {
                  const dimensionPart = parts[1].trim();
                  // Match h=30, h = 30, H=30, etc. (case-insensitive, optional spaces)
                  const heightMatch = dimensionPart.match(/h\s*=\s*(\d+)/i);
                  const widthMatch = dimensionPart.match(/w\s*=\s*(\d+)/i);

                  if (heightMatch) {
                    const h = parseFloat(heightMatch[1]);
                    if (!isNaN(h)) {
                      replacement = this.generateImageHTML([photoUrl], {
                        height: h,
                      });
                    }
                  } else if (widthMatch) {
                    const w = parseFloat(widthMatch[1]);
                    if (!isNaN(w)) {
                      replacement = this.generateImageHTML([photoUrl], {
                        width: w,
                      });
                    }
                  } else {
                    // Handle dimensions like "100x50" or " 100x50" (with space)
                    const dimensions = dimensionPart.split("x");
                    if (dimensions.length === 2) {
                      const w = parseFloat(dimensions[0].trim());
                      const h = parseFloat(dimensions[1].trim());
                      if (!isNaN(w) && !isNaN(h)) {
                        replacement = this.generateImageHTML([photoUrl], {
                          width: w,
                          height: h,
                        });
                      }
                    }
                  }
                } else if (mode === "fit") {
                  replacement = this.generateImageHTML([photoUrl], {
                    fit: true,
                  });
                }
              }
            }
          }
        } else if (word.includes("logo")) {
          if (!userData.photoUrl) {
            replacement = "";
          } else {
            const photoUrl = userData.photoUrl
              .toString()
              .replaceAll(
                "http://localhost:5005",
                "https://api.route-survey.survys.com"
              );

            // console.log(photoUrl);
            //    console.log(word);

            if (word === "logo") {
              // replacement = await this._imageToBase64(photoUrl, 50, 50);
              replacement = this.generateImageHTML([photoUrl], {
                width: 50,
                height: 50,
              });
            } else {
              const parts = word.split(",");
              if (parts.length === 2) {
                const mode = parts[1].trim() === "fit" ? "fit" : "determined";

                if (mode === "determined") {
                  const dimensionPart = parts[1].trim();
                  // Match h=30, h = 30, H=30, etc. (case-insensitive, optional spaces)
                  const heightMatch = dimensionPart.match(/h\s*=\s*(\d+)/i);
                  const widthMatch = dimensionPart.match(/w\s*=\s*(\d+)/i);

                  if (heightMatch) {
                    const h = parseFloat(heightMatch[1]);
                    if (!isNaN(h)) {
                      replacement = this.generateImageHTML([photoUrl], {
                        height: h,
                      });
                    }
                  } else if (widthMatch) {
                    const w = parseFloat(widthMatch[1]);
                    if (!isNaN(w)) {
                      replacement = this.generateImageHTML([photoUrl], {
                        width: w,
                      });
                    }
                  } else {
                    // Handle dimensions like "100x50" or " 100x50" (with space)
                    const dimensions = dimensionPart.split("x");
                    if (dimensions.length === 2) {
                      const w = parseFloat(dimensions[0].trim());
                      const h = parseFloat(dimensions[1].trim());
                      if (!isNaN(w) && !isNaN(h)) {
                        replacement = this.generateImageHTML([photoUrl], {
                          width: w,
                          height: h,
                        });
                      }
                    }
                  }
                } else if (mode === "fit") {
                  // console.log("Fit ... ");
                  replacement = this.generateImageHTML([photoUrl], {
                    fit: true,
                  });
                }
              }
            }
          }
        } else if (word.includes("qrcode")) {
          // console.log("Replacing QR Code ... ");
          replacement = await this._imageToBase64(
            `https://api.qrserver.com/v1/create-qr-code/?data=${userData.email}&amp;size=1200x1200`,
            1200,
            1200
          );
        }

        // Replace the match in the original content
        processedContent = processedContent.replace(match[0], replacement);
      }

      return processedContent;
    } catch (error) {
      console.error("Error processing user data:", error);
      return htmlContent;
    }
  }

  static async _imageToBase64(url, width, height) {
    try {
      console.log("Fetching image:", url);
      const response = await fetch(url, {
        mode: "cors", // Enable CORS
        credentials: "include", // Include credentials like cookies
        headers: {
          Accept: "image/*", // Accept image content
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
        reader.readAsDataURL(blob);
        const base64String = await base64Promise;
        return `<img src='${base64String}' width='${width}' height='${height}' />`;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
    return "";
  }

  static generateImageHTML(images, { width, height, fit = false }) {
    // Generate images wrapped in table cells for better inline control
    let imagesHTML = "";
    for (const imgData of images) {
      const imgUrl = imgData.includes("https")
        ? imgData
        : imgData
          // .replaceAll("http", "https")
          .replace("10.0.2.2", "localhost")
          .replaceAll(
            "http://localhost:5005",
            "https://api.route-survey.survys.com"
          );

      let imgTag = "";
      if (fit) {
        imgTag = `<a href='${imgUrl}' target="_blank" style="display: inline-block; margin: 0; vertical-align: middle; line-height: 0;"><img width="1200" src="${imgUrl}" style='padding: 10px; display: block; max-width: 100%; height: auto;' /></a>`;
      } else {
        let sizeAttributes = "";
        let styleString = "padding: 10px; display: block;";

        if (width && height) {
          // Both dimensions specified - use exact size (fill to exact dimensions)
          sizeAttributes += ` width="${width}" height="${height}"`;
          styleString += ` width: ${width}px !important; height: ${height}px !important; object-fit: fill; max-width: none !important; max-height: none !important;`;
        } else if (width) {
          // Only width specified - maintain aspect ratio
          // Use CSS only, don't set HTML attributes to avoid conflicts
          styleString += ` width: ${width}px !important; max-width: 100% !important; height: auto !important;`;
        } else if (height) {
          // Only height specified - maintain aspect ratio
          // Use CSS only, don't set HTML attributes to avoid conflicts
          // Explicitly reset width and let it scale proportionally with height
          styleString += ` height: ${height}px !important; width: auto !important; max-width: 100% !important; max-height: ${height}px !important; min-width: unset !important;`;
        } else {
          // No dimensions - use default behavior
          styleString += " max-width: 100%; height: auto;";
        }

        imgTag = `<a href='${imgUrl}' target="_blank" style="display: inline-block; margin: 0; vertical-align: middle; line-height: 0;"><img${sizeAttributes} src="${imgUrl}" style='${styleString}' /></a>`;
      }

      // Wrap each image in a table cell for inline flow - use a single table for all images
      // We'll group them in a single table row
      imagesHTML += `<span class="inline-image-wrapper" style="display: inline-block !important; margin: 0 5px !important; vertical-align: middle !important; line-height: 0 !important;">${imgTag}</span>`;
    }

    // Return images wrapped in table cells for inline flow
    return imagesHTML;
  }

  static _parseGridSystem(htmlContent) {
    htmlContent = this._parseRows6(htmlContent);
    htmlContent = this._parseRows5(htmlContent);
    htmlContent = this._parseRows4(htmlContent);
    htmlContent = this._parseRows3(htmlContent);
    htmlContent = this._parseRows2(htmlContent);
    htmlContent = this._parseRows(htmlContent);
    return htmlContent;
  }

  static _parseRows(htmlContent) {
    const rowStart = "@beginrow";
    const rowEnd = "@endrow";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-direction: row; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols(htmlContent) {
    const colStart = "@begincol";
    const colEnd = "@endcol";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 1; display: inline-block; vertical-align: top; box-sizing: border-box; margin-bottom: 10px; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseRows2(htmlContent) {
    const rowStart = "@beginrow2";
    const rowEnd = "@endrow2";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols2(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols2(htmlContent) {
    const colStart = "@begincol2";
    const colEnd = "@endcol2";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 0 0 48%; width: 48%; display: inline-block; vertical-align: top; margin-bottom: 10px; box-sizing: border-box; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseRows3(htmlContent) {
    const rowStart = "@beginrow3";
    const rowEnd = "@endrow3";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols3(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols3(htmlContent) {
    const colStart = "@begincol3";
    const colEnd = "@endcol3";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 0 0 31%; width: 31%; display: inline-block; vertical-align: top; margin-bottom: 10px; box-sizing: border-box; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseRows4(htmlContent) {
    const rowStart = "@beginrow4";
    const rowEnd = "@endrow4";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols4(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols4(htmlContent) {
    const colStart = "@begincol4";
    const colEnd = "@endcol4";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 0 0 24%; width: 24%; display: inline-block; vertical-align: top; margin-bottom: 10px; box-sizing: border-box; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseRows5(htmlContent) {
    const rowStart = "@beginrow5";
    const rowEnd = "@endrow5";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols5(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols5(htmlContent) {
    const colStart = "@begincol5";
    const colEnd = "@endcol5";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 0 0 19%; width: 19%; display: inline-block; vertical-align: top; margin-bottom: 10px; box-sizing: border-box; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseRows6(htmlContent) {
    const rowStart = "@beginrow6";
    const rowEnd = "@endrow6";
    let result = htmlContent;
    let startIndex = result.indexOf(rowStart);

    while (startIndex !== -1) {
      const endIndex = result.indexOf(rowEnd, startIndex + 1);

      if (endIndex !== -1) {
        let textBeforeMarker = result.substring(0, startIndex);
        // Remove trailing newlines, whitespace, <br> tags, and empty paragraphs before the row marker
        // Remove multiple consecutive empty paragraphs and br tags
        while (
          textBeforeMarker.match(/(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i) ||
          textBeforeMarker.match(/(<br\s*\/?>\s*)+$/i)
        ) {
          textBeforeMarker = textBeforeMarker.replace(
            /(<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>\s*)+$/i,
            ""
          );
          textBeforeMarker = textBeforeMarker.replace(/(<br\s*\/?>\s*)+$/i, "");
        }
        textBeforeMarker = textBeforeMarker.replace(/[\n\r\s]+$/, "");
        const textAfterMarker = result.substring(endIndex + rowEnd.length);
        const textToProcess = result.substring(
          startIndex + rowStart.length,
          endIndex
        );
        const processedText = this._parseCols6(textToProcess);

        result = `${textBeforeMarker}<div style='display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box;'>${processedText}</div>${textAfterMarker}`;
        startIndex = result.indexOf(rowStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _parseCols6(htmlContent) {
    const colStart = "@begincol6";
    const colEnd = "@endcol6";
    let result = htmlContent;

    // First, count the total number of columns
    let columnCount = 0;
    let tempIndex = result.indexOf(colStart);
    while (tempIndex !== -1) {
      const tempEndIndex = result.indexOf(colEnd, tempIndex + 1);
      if (tempEndIndex !== -1) {
        columnCount++;
        tempIndex = result.indexOf(colStart, tempEndIndex + 1);
      } else {
        break;
      }
    }

    // Now process each column with appropriate alignment
    let startIndex = result.indexOf(colStart);
    let columnIndex = 0;

    while (startIndex !== -1) {
      const endIndex = result.indexOf(colEnd, startIndex + 1);

      if (endIndex !== -1) {
        const textBeforeMarker = result.substring(0, startIndex);
        const textAfterMarker = result.substring(endIndex + colEnd.length);
        const textToProcess = result.substring(
          startIndex + colStart.length,
          endIndex
        );

        // Determine alignment based on column position
        let textAlign = "center"; // Default for middle columns
        if (columnIndex === 0) {
          textAlign = "left"; // First column
        } else if (columnIndex === columnCount - 1) {
          textAlign = "right"; // Last column
        }

        result = `${textBeforeMarker}<div style='flex: 0 0 16%; width: 16%; display: inline-block; vertical-align: top; margin-bottom: 10px; box-sizing: border-box; text-align: ${textAlign};'> ${textToProcess}</div>${textAfterMarker}`;
        columnIndex++;
        startIndex = result.indexOf(colStart, endIndex + 1);
      } else {
        break;
      }
    }

    return result;
  }

  static _formatPointData(point, data) {
    const googleMapsUrl = `https://maps.google.com/?q=${point.lat},${point.lng}`;
    return `
      <div class="point-data">
        <h4>Point ${point.id}</h4>
        <p><strong>Type:</strong> ${point.type}</p>
        <p><strong>Location:</strong> <a href="${googleMapsUrl}" target="_blank">${point.lat
      }, ${point.lng}</a></p>
        <p><strong>Address:</strong> ${data.roadAddress ||
      data.primaryRoadAddress ||
      data.secondaryRoadAddress ||
      "N/A"
      }</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
      </div>
    `;
  }

  static _formatPhotoData(media) {
    return `
      <div class="photo-data">
        <img src="${media.url}" alt="${media.note || "Photo"
      }" style="max-width: 100%; height: auto;">
        ${media.note ? `<p class="photo-note">${media.note}</p>` : ""}
      </div>
    `;
  }

  static _processRouteData(content, routeData) {
    return content
      .replaceAll("@routetitle", routeData.title || "")
      .replaceAll("@routedistance", routeData.distance || "0")
      .replaceAll("@routepoints", routeData.points || "0")
      .replaceAll("@routestart", routeData.start || "")
      .replaceAll("@routeend", routeData.end || "")
      .replaceAll("@routenotes", routeData.note || "");
  }
}
