import { ref, computed, nextTick } from "vue";
import TemplatesController from "@/controllers/templates/templates_controller";
import { MASLUtility } from "@/utils/masl_utility";
import RoutesController from "@/controllers/routes/routes_controller";
import ReportingController from "@/controllers/reporting/reporting_controller";
import FileManagementController from "@/controllers/file_management/file_management_controller";

// Route Variables (Survey/Route Info - non-planned route, excluding loops and screenshot variables)
const routeVariables = [
  {
    title: "Route Title",
    value: "@survey('name')",
    description: "Insert the name/title of the current route",
  },
  {
    title: "Route Description",
    value: "@survey('description')",
    description: "Insert the description of the current route",
  },
  {
    title: "Date Added",
    value: "@survey('dateadded')",
    description: "Insert the date when the route was created",
  },
  {
    title: "Time Added",
    value: "@survey('timeadded')",
    description: "Insert the time when the route was created",
  },
  {
    title: "Last Updated Date",
    value: "@survey('dateupdated')",
    description: "Insert the date when the route was last modified",
  },
  {
    title: "Last Updated Time",
    value: "@survey('timeupdated')",
    description: "Insert the time when the route was last modified",
  },
  {
    title: "Start Location",
    value: "@survey('start')",
    description: "Insert the starting location of the route",
  },
  {
    title: "End Location",
    value: "@survey('end')",
    description: "Insert the ending location of the route",
  },
  {
    title: "Route Distance",
    value: "@survey('distance')",
    description: "Insert the total distance of the route",
  },
  {
    title: "Route Map",
    value: "@survey('staticmap')",
    description: "Insert a static map image of the route",
  },
  {
    title: "Route Map (Custom Size)",
    value: "@survey('staticmap,600x400')",
    description: "Insert a static map image with custom dimensions",
  },
  {
    title: "Route Map (Fit)",
    value: "@survey('staticmap,fit')",
    description: "Insert a static map image with fit sizing",
  },
  {
    title: "Points Count",
    value: "@survey('points')",
    description: "Insert the total number of points in the route",
  },
  {
    title: "Route Notes",
    value: "@survey('notes')",
    description: "Insert the notes associated with the route",
  },
  // {
  //   title: "Upload Image",
  //   value: "<!-- Upload image using the Image button in toolbar -->",
  //   description:
  //     "Click the Image button in the toolbar to upload and insert an image",
  // },
];

// Planned Route Variables
const plannedRouteVariables = [
  {
    title: "Planned Route Start Point",
    value: "@plannedroute('startpoint')",
    description: "Insert the starting point of the planned route",
  },
  {
    title: "Planned Route End Point",
    value: "@plannedroute('endpoint')",
    description: "Insert the ending point of the planned route",
  },
  {
    title: "Planned Route Waypoints Count",
    value: "@plannedroute('waypoints')",
    description: "Insert the number of waypoints in the planned route",
  },
  {
    title: "Planned Route Path Points",
    value: "@plannedroute('routepath')",
    description: "Insert the number of points in the route path",
  },
  {
    title: "Planned Route Distance",
    value: "@plannedroute('distance')",
    description: "Insert the total distance of the planned route",
  },
  {
    title: "Planned Route Duration",
    value: "@plannedroute('duration')",
    description: "Insert the estimated duration of the planned route",
  },
  {
    title: "Planned Route Start Coordinates",
    value: "@plannedroute('start_coordinates')",
    description: "Insert the GPS coordinates of the start point with map link",
  },
  {
    title: "Planned Route End Coordinates",
    value: "@plannedroute('end_coordinates')",
    description: "Insert the GPS coordinates of the end point with map link",
  },
  {
    title: "Planned Route Start Latitude",
    value: "@plannedroute('start_lat')",
    description: "Insert the latitude of the start point",
  },
  {
    title: "Planned Route Start Longitude",
    value: "@plannedroute('start_lng')",
    description: "Insert the longitude of the start point",
  },
  {
    title: "Planned Route End Latitude",
    value: "@plannedroute('end_lat')",
    description: "Insert the latitude of the end point",
  },
  {
    title: "Planned Route End Longitude",
    value: "@plannedroute('end_lng')",
    description: "Insert the longitude of the end point",
  },
  {
    title: "Planned Route Map",
    value: "@plannedroute('route_map')",
    description: "Insert a static map image of the planned route",
  },
  // Survey Information
  {
    title: "Survey Name",
    value: "@plannedroute('survey_name')",
    description: "Insert the name of the planned route survey",
  },
  {
    title: "Survey Date",
    value: "@plannedroute('survey_date')",
    description: "Insert the date of the planned route survey",
  },
  {
    title: "Survey Start Location",
    value: "@plannedroute('survey_start')",
    description: "Insert the starting location of the survey",
  },
  {
    title: "Survey End Location",
    value: "@plannedroute('survey_end')",
    description: "Insert the ending location of the survey",
  },
  {
    title: "Survey Instructions",
    value: "@plannedroute('survey_instructions')",
    description: "Insert the survey instructions",
  },
  // Client Information
  {
    title: "Client Name",
    value: "@plannedroute('client_name')",
    description: "Insert the name of the client",
  },
  // Cargo Information
  {
    title: "Cargo Type",
    value: "@plannedroute('cargo_type')",
    description: "Insert the type of cargo",
  },
  {
    title: "Cargo Weight",
    value: "@plannedroute('cargo_weight')",
    description: "Insert the weight of the cargo",
  },
  {
    title: "Cargo Length",
    value: "@plannedroute('cargo_length')",
    description: "Insert the length of the cargo",
  },
  {
    title: "Cargo Width",
    value: "@plannedroute('cargo_width')",
    description: "Insert the width of the cargo",
  },
  {
    title: "Cargo Height",
    value: "@plannedroute('cargo_height')",
    description: "Insert the height of the cargo",
  },
  {
    title: "Cargo Notes",
    value: "@plannedroute('cargo_notes')",
    description: "Insert the cargo notes",
  },
  // Trailer Information
  {
    title: "Trailer Type",
    value: "@plannedroute('trailer_type')",
    description: "Insert the type of trailer",
  },
  {
    title: "Trailer Length",
    value: "@plannedroute('trailer_length')",
    description: "Insert the length of the trailer",
  },
  {
    title: "Trailer Notes",
    value: "@plannedroute('trailer_notes')",
    description: "Insert the trailer notes",
  },
  // Route Information
  {
    title: "Planned Route ID",
    value: "@plannedroute('planned_route_id')",
    description: "Insert the planned route ID",
  },
];

// Loop Variables (all loops)
const loopVariables = [
  {
    title: "Start Point Loop",
    value: `@beginforpoint
@point('info')
@point('address')
@endforpoint`,
    description: "Begin a loop to iterate through all route points",
  },
  {
    title: "Start Note Loop",
    value: `@beginforpoint
@beginfornote
@note('text')
@noteimg('fit')
@endfornote
@endforpoint`,
    description: "Begin a loop to iterate through all notes",
  },
  {
    title: "Start Map Screenshot Loop",
    value: "@beginformapscreenshot\n\n@endformapscreenshot",
    description: "Begin a loop to iterate through all map screenshots",
  },
];

// Point Variables (for use inside loop editors only - not shown in main library)
const pointVariables = [
  {
    title: "Point Address",
    value: "@point('address')",
    description: "Insert the address of the current point",
  },
  {
    title: "Point Short Address",
    value: "@point('shortaddress')",
    description: "Insert the short address (first part) of the current point",
  },
  {
    title: "Point Location",
    value: "@point('location')",
    description: "Insert the location name of the current point",
  },
  {
    title: "Point GPS Coordinates",
    value: "@point('gps')",
    description: "Insert GPS coordinates with Google Maps link",
  },
  {
    title: "Point GPS (Degrees)",
    value: "@point('location_deg')",
    description:
      "Insert GPS coordinates in degrees format with Google Maps link",
  },
  {
    title: "Point GPS (Degrees + Decimal)",
    value: "@point('location_deg_gps')",
    description: "Insert GPS coordinates in both degrees and decimal formats",
  },
  {
    title: "Point Distance",
    value: "@point('distance')",
    description:
      "Insert the distance from start to current point in kilometers",
  },
  {
    title: "Point Information",
    value: "@point('info')",
    description: "Insert additional information about the current point",
  },
  {
    title: "Point Notes",
    value: "@point('notes')",
    description: "Insert all notes for the current point",
  },
  {
    title: "Point Note",
    value: "@point('note')",
    description: "Insert a single note for the current point",
  },
  {
    title: "Point Date Added",
    value: "@point('dateadded')",
    description: "Insert the date when the current point was added",
  },
  {
    title: "Point Date",
    value: "@point('date')",
    description: "Insert the date associated with the current point",
  },
  {
    title: "Point Time Added",
    value: "@point('timeadded')",
    description: "Insert the time when the current point was added",
  },
  {
    title: "Point Time",
    value: "@point('time')",
    description: "Insert the time associated with the current point",
  },
  {
    title: "Point Date and Time",
    value: "@point('datetime')",
    description: "Insert the date and time of the current point",
  },
  {
    title: "Point Latitude",
    value: "@point('lat')",
    description: "Insert the latitude coordinate of the current point",
  },
  {
    title: "Point Latitude",
    value: "@point('latitude')",
    description: "Insert the latitude coordinate of the current point",
  },
  {
    title: "Point Longitude",
    value: "@point('lon')",
    description: "Insert the longitude coordinate of the current point",
  },
  {
    title: "Point Longitude",
    value: "@point('longitude')",
    description: "Insert the longitude coordinate of the current point",
  },
  {
    title: "Point Heading",
    value: "@point('heading')",
    description: "Insert the heading/direction of the current point",
  },
  {
    title: "Point Altitude",
    value: "@point('altitude')",
    description: "Insert the altitude/elevation of the current point",
  },
  {
    title: "Point Type",
    value: "@point('type')",
    description: "Insert the type/category of the current point",
  },
  {
    title: "Note Text",
    value: "@note('text')",
    description: "Insert the text content of the current note",
  },
  {
    title: "Note Image",
    value: "@noteimg('fit')",
    description: "Insert the image associated with the current note",
  },
  {
    title: "Note Image (Custom Size)",
    value: "@noteimg('100x200')",
    description: "Insert the note image with custom dimensions",
  },
  {
    title: "Start Note Loop",
    value: `@beginfornote
@note('text')
@noteimg('fit')
@endfornote`,
    description:
      "Begin a nested loop to iterate through all notes for the current point",
  },
];

// Screenshot Variables (for use inside screenshot loop editor only)
const screenshotVariables = [
  {
    title: "Map Screenshot Image",
    value: "@mapscreenshot('url')",
    description: "Insert the map screenshot image",
  },
  {
    title: "Map Screenshot Image (Custom Size)",
    value: "@mapscreenshot('url,600x400')",
    description: "Insert the map screenshot image with custom dimensions",
  },
  {
    title: "Map Screenshot Image (Fit)",
    value: "@mapscreenshot('url,fit')",
    description: "Insert the map screenshot image with fit sizing",
  },
  {
    title: "Map Screenshot Note",
    value: "@mapscreenshot('note')",
    description: "Insert the note associated with the map screenshot",
  },
  {
    title: "Map Screenshot Type",
    value: "@mapscreenshot('type')",
    description: "Insert the type of the map screenshot",
  },
];

// User Variables (User/Company Info)
const userVariables = [
  {
    title: "User Full Name",
    value: "@user('name')",
    description: "Insert the full name of the current user",
  },
  {
    title: "User First Name",
    value: "@user('firstname')",
    description: "Insert the first name of the current user",
  },
  {
    title: "User Last Name",
    value: "@user('lastname')",
    description: "Insert the last name of the current user",
  },
  {
    title: "User Email",
    value: "@user('email')",
    description: "Insert the email address of the current user",
  },
  {
    title: "User Phone",
    value: "@user('phone')",
    description: "Insert the phone number of the current user",
  },
  {
    title: "Office Phone",
    value: "@user('officephone')",
    description: "Insert the office phone number of the current user",
  },
  {
    title: "Mobile Phone",
    value: "@user('mobilephone')",
    description: "Insert the mobile phone number of the current user",
  },
  {
    title: "Company Name",
    value: "@user('companyname')",
    description: "Insert the name of the user's company",
  },
  {
    title: "Company Website",
    value: "@user('companywebsite')",
    description: "Insert the website URL of the user's company",
  },
  // {
  //   title: "Company Street Address",
  //   value: "@user('companyadstreet')",
  //   description: "Insert the street address of the user's company",
  // },
  // {
  //   title: "Company City",
  //   value: "@user('companyadcity')",
  //   description: "Insert the city of the user's company",
  // },
  // {
  //   title: "Company State",
  //   value: "@user('companyadstate')",
  //   description: "Insert the state/province of the user's company",
  // },
  // {
  //   title: "Company ZIP Code",
  //   value: "@user('companyadzip')",
  //   description: "Insert the ZIP/postal code of the user's company",
  // },
  // {
  //   title: "Company Country",
  //   value: "@user('companyadcountry')",
  //   description: "Insert the country of the user's company",
  // },
  {
    title: "Company Address (Formatted)",
    value:
      "@user('companyadstreet')<br>@user('companyadcity'), @user('companyadstate') @user('companyadzip')<br>@user('companyadcountry')",
    description:
      "Insert a formatted address block with street, city, state, zip, and country",
  },
  {
    title: "Company Disclaimer",
    value: "@user('disclaimer')",
    description: "Insert the disclaimer text of the user's company",
  },
  {
    title: "Company Logo (50x50)",
    value: "@user('companylogo')",
    description: "Insert the company logo at 50x50 pixels",
  },
  {
    title: "Company Logo (Fit)",
    value: "@user('companylogo,fit')",
    description: "Insert the company logo with fit sizing",
  },
  {
    title: "Company Logo (Custom Size)",
    value: "@user('companylogo,100x200')",
    description: "Insert the company logo with custom dimensions",
  },
  {
    title: "User Logo (50x50)",
    value: "@user('logo')",
    description: "Insert the user's logo at 50x50 pixels",
  },
  {
    title: "User Logo (Fit)",
    value: "@user('logo,fit')",
    description: "Insert the user's logo with fit sizing",
  },
  {
    title: "User Logo (Custom Size)",
    value: "@user('logo,100x200')",
    description: "Insert the user's logo with custom dimensions",
  },
  {
    title: "QR Code with User Email",
    value: "@user('qrcode')",
    description: "Insert a QR code containing the user's email address",
  },
];

// Date Variables
const dateVariables = [
  {
    title: "Current Date",
    value: "@date",
    description: "Insert the current date",
  },
  {
    title: "Current Time",
    value: "@time",
    description: "Insert the current time",
  },
  {
    title: "Current Date and Time",
    value: "@datetime",
    description: "Insert the current date and time",
  },
];

// Formatting Variables (Layout/Formatting)
const formattingVariables = [
  { title: "New Line", value: "@newline", description: "Insert a line break" },
  {
    title: "Horizontal Line",
    value: "@horizontalline",
    description: "Insert a horizontal divider line",
  },
  {
    title: "Page Break",
    value: "@pagebreak",
    description: "Insert a page break for printing",
  },
  {
    title: "Table of Contents",
    value: "@toc",
    description: "Generate a table of contents from report sections",
  },
  {
    title: "Start Row (1 Column)",
    value: "@beginrow\n\n@endrow",
    description: "Begin a single column row layout",
  },
  {
    title: "Start Row (2 Columns)",
    value: "@beginrow2\n\n@endrow2",
    description: "Begin a two column row layout",
  },
  {
    title: "Start Row (3 Columns)",
    value: "@beginrow3\n\n@endrow3",
    description: "Begin a three column row layout",
  },
  {
    title: "Start Row (4 Columns)",
    value: "@beginrow4\n\n@endrow4",
    description: "Begin a four column row layout",
  },
  {
    title: "Start Row (5 Columns)",
    value: "@beginrow5\n\n@endrow5",
    description: "Begin a five column row layout",
  },
  {
    title: "Start Row (6 Columns)",
    value: "@beginrow6\n\n@endrow6",
    description: "Begin a six column row layout",
  },
  {
    title: "Page Number",
    value: "@pagenumber",
    description: "Insert the current page number",
  },
];

// Editor composable
export function useReportEditor() {
  // Editor state
  const content = ref("");
  const lastSaved = ref(null);
  const showPreview = ref(false);
  const previewContent = ref("");
  const hasChanges = ref(false);
  const showVariableModal = ref(false);
  const variableSearch = ref("");

  // History for undo/redo
  const history = ref([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;
  const isHistoryAction = ref(false);

  // Template state
  const templates = ref([]);
  const loadingTemplates = ref(false);

  // Undo/redo computed
  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  // Insert text at cursor helper
  function insertAtCursor(textarea, insertText) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.value.substring(0, start);
    const after = content.value.substring(end);
    content.value = before + insertText + after;
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd =
        start + insertText.length;
      textarea.focus();
    });
    addToHistory(content.value);
    hasChanges.value = true;
  }

  // Add to history
  function addToHistory(newContent) {
    if (isHistoryAction.value) {
      isHistoryAction.value = false;
      return;
    }
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    if (history.value[history.value.length - 1] === newContent) return;
    history.value.push(newContent);
    historyIndex.value++;
    if (history.value.length > maxHistorySize) {
      history.value.shift();
      historyIndex.value--;
    }
  }

  // Undo/redo
  function undo() {
    if (canUndo.value) {
      isHistoryAction.value = true;
      historyIndex.value--;
      content.value = history.value[historyIndex.value];
    }
  }
  function redo() {
    if (canRedo.value) {
      isHistoryAction.value = true;
      historyIndex.value++;
      content.value = history.value[historyIndex.value];
    }
  }

  // Formatting methods
  function insertHeader(level) {
    insertVariableText(`<h${level}>Header ${level}</h${level}>`);
  }
  function insertBold() {
    insertVariableText("<strong>bold text</strong>");
  }
  function insertItalic() {
    insertVariableText("<em>italic text</em>");
  }
  function insertStrikethrough() {
    insertVariableText("<del>strikethrough text</del>");
  }
  function insertUnderline() {
    insertVariableText("<u>underlined text</u>");
  }
  function insertSubscript() {
    insertVariableText("<sub>subscript</sub>");
  }
  function insertSuperscript() {
    insertVariableText("<sup>superscript</sup>");
  }
  function insertList(type) {
    if (type === "ordered") {
      insertVariableText(
        "<ol>\n  <li>List item 1</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ol>"
      );
    } else {
      insertVariableText(
        "<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>"
      );
    }
  }
  function insertChecklist() {
    insertVariableText(
      '<ul>\n  <li><input type="checkbox" disabled> Task 1</li>\n  <li><input type="checkbox" disabled> Task 2</li>\n  <li><input type="checkbox" checked disabled> Completed Task</li>\n</ul>'
    );
  }
  function insertTaskList() {
    insertVariableText(
      '<ul>\n  <li><input type="checkbox" disabled> Task 1</li>\n  <li><input type="checkbox" disabled> Task 2</li>\n  <li><input type="checkbox" checked disabled> Completed Task</li>\n</ul>'
    );
  }
  function indentList() {
    // This would need more complex logic to handle HTML list indentation
    insertVariableText("  <!-- Indent list items here -->");
  }
  function outdentList() {
    // This would need more complex logic to handle HTML list outdentation
    insertVariableText("<!-- Outdent list items here -->");
  }
  function insertTable() {
    insertVariableText(`<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
  <thead>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 1</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 2</th>
      <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 5</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Cell 6</td>
    </tr>
  </tbody>
</table>`);
  }
  function insertImage() {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(
            "File size too large. Please select an image smaller than 10MB."
          );
          document.body.removeChild(input);
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file.");
          document.body.removeChild(input);
          return;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);

          // Show loading message
          const loadingMessage = `Uploading ${file.name}...`;
          insertVariableText(`<!-- ${loadingMessage} -->`);

          const res = await FileManagementController.uploadRoutePhoto(formData);

          if (res.result) {
            // Remove loading message and insert image
            const imageHtml = `<img src="${res.url}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;

            // Replace the loading comment with the actual image
            const currentContent = content.value;
            const updatedContent = currentContent.replace(
              `<!-- ${loadingMessage} -->`,
              imageHtml
            );
            content.value = updatedContent;
            addToHistory(updatedContent);
            hasChanges.value = true;
          } else {
            console.error("Failed to upload image:", res.message);
            // Remove loading message
            const currentContent = content.value;
            const updatedContent = currentContent.replace(
              `<!-- ${loadingMessage} -->`,
              ""
            );
            content.value = updatedContent;
            addToHistory(updatedContent);

            // Fallback to manual URL input
            const imageUrl = prompt("Upload failed. Enter image URL manually:");
            if (imageUrl) {
              const imageHtml = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
              insertVariableText(imageHtml);
            }
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          // Remove loading message
          const currentContent = content.value;
          const updatedContent = currentContent.replace(
            `<!-- Uploading ${file.name}... -->`,
            ""
          );
          content.value = updatedContent;
          addToHistory(updatedContent);

          // Fallback to manual URL input
          const imageUrl = prompt("Upload failed. Enter image URL manually:");
          if (imageUrl) {
            const imageHtml = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
            insertVariableText(imageHtml);
          }
        }
      }

      // Clean up
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }
  function insertLink() {
    insertVariableText('<a href="url" target="_blank">link text</a>');
  }
  function insertHorizontalRule() {
    insertVariableText("<hr>");
  }
  function insertCode() {
    insertVariableText(`<pre><code>
// Code block here
function example() {
    console.log("Hello World");
}
</code></pre>`);
  }
  function insertInlineCode() {
    insertVariableText("<code>inline code</code>");
  }
  function insertQuote() {
    insertVariableText(
      '<blockquote style="border-left: 4px solid #ccc; margin: 1rem 0; padding-left: 1rem; font-style: italic;">Quote text</blockquote>'
    );
  }
  function insertDivider() {
    insertVariableText("<hr>");
  }
  function alignText(alignment) {
    insertVariableText(
      `<div style="text-align: ${alignment};">Aligned text</div>`
    );
  }
  function insertTextColor() {
    const color = prompt("Enter color (e.g., #ff0000 or red):");
    if (color) {
      insertVariableText(`<span style="color: ${color}">colored text</span>`);
    }
  }
  function insertBackgroundColor() {
    const color = prompt("Enter background color (e.g., #ff0000 or red):");
    if (color) {
      insertVariableText(
        `<span style="background-color: ${color}">highlighted text</span>`
      );
    }
  }
  function insertHighlight() {
    insertVariableText("<mark>highlighted text</mark>");
  }
  function insertFontSize() {
    const size = prompt("Enter font size (e.g., 12px, 1.2em, 120%):");
    if (size) {
      insertVariableText(
        `<span style="font-size: ${size}">resized text</span>`
      );
    }
  }

  // Insert variable (block) at cursor
  function insertVariableText(variable) {
    const textarea = document.querySelector(".markdown-editor");
    if (textarea) {
      insertAtCursor(textarea, variable);
    } else {
      content.value += variable;
      addToHistory(content.value);
      hasChanges.value = true;
    }
  }

  // Preview logic with MASL parsing
  async function previewReport(routeId) {
    try {
      const processedContent = await MASLUtility.parseMASL(
        content.value,
        routeId
      );
      previewContent.value = processedContent.replaceAll(
        "https://localhost",
        "http://localhost"
      );
      showPreview.value = true;
    } catch (error) {
      console.error("Error previewing report:", error);
      // Fallback to raw content if parsing fails
      previewContent.value = content.value;
      showPreview.value = true;
    }
  }

  // Save logic with route report data update
  async function saveReport(routeId) {
    try {
      const processedContent = await MASLUtility.parseMASL(
        content.value,
        routeId
      );

      const res = await RoutesController.updateRouteReportData({
        RouteId: routeId,
        ReportData: JSON.stringify({
          content: processedContent,
        }),
      });

      if (res.result) {
        lastSaved.value = new Date();
        hasChanges.value = false;
        return { success: true, message: "Report saved successfully" };
      } else {
        return {
          success: false,
          message: res.message || "Failed to save report",
        };
      }
    } catch (error) {
      console.error("Error saving report:", error);
      return { success: false, message: "Error saving report" };
    }
  }

  // Generate report logic
  async function generateReport(routeId) {
    if (!content.value.trim()) {
      return { success: false, message: "Report content cannot be empty" };
    }

    try {
      const processedContent = await MASLUtility.parseMASL(
        content.value,
        routeId
      );

      const res = await ReportingController.generateReportFromTemplate(
        processedContent,
        routeId
      );

      if (res.result) {
        return { success: true, message: "Report generated successfully" };
      } else {
        return {
          success: false,
          message: res.message || "Failed to generate report",
        };
      }
    } catch (error) {
      console.error("Error generating report:", error);
      return { success: false, message: "Error generating report" };
    }
  }

  // Handle input
  function handleInput() {
    hasChanges.value = true;
    addToHistory(content.value);
  }

  // Handle tab
  function handleTab(e) {
    e.preventDefault();
    insertVariableText("    ");
  }

  // Handle keydown (shortcuts)
  function handleKeyDown(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "z":
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          break;
        case "y":
          e.preventDefault();
          redo();
          break;
        case "b":
          e.preventDefault();
          insertBold();
          break;
        case "i":
          e.preventDefault();
          insertItalic();
          break;
        case "u":
          e.preventDefault();
          insertUnderline();
          break;
        case "k":
          e.preventDefault();
          insertLink();
          break;
      }
    }
  }

  // Template methods
  const loadTemplates = async () => {
    loadingTemplates.value = true;
    try {
      const myTemplatesRes =
        await TemplatesController.getCurrentUserTemplates();
      if (myTemplatesRes.result) {
        templates.value = myTemplatesRes.data.map((t) => ({
          ...t,
          media: t.media
            ? String(JSON.parse(t.media)[0]?.url).replaceAll(
              "http://10.0.2.2",
              "http://localhost"
            )
            : null,
        }));
      }
      const res = await TemplatesController.getTemplates();
      if (res.result) {
        const allTemplates = res.data
          .filter(
            (template) =>
              !templates.value.some(
                (myTemplate) => myTemplate.templateId === template.id
              )
          )
          .map((template) => ({
            ...template,
            media: template.media
              ? String(JSON.parse(template.media)[0]?.url).replaceAll(
                "http://10.0.2.2",
                "http://localhost"
              )
              : null,
          }));

        templates.value = templates.value.map((element) => {
          const templateData = res.data.filter(
            (e) => e.id === element.templateId
          )[0];
          return {
            ...element,
            ...templateData,
            id: element.id,
            media: templateData.media
              ? String(JSON.parse(templateData.media)[0]?.url).replaceAll(
                "http://10.0.2.2",
                "http://localhost"
              )
              : null,
          };
        });
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      loadingTemplates.value = false;
    }
  };

  const insertTemplate = (template) => {
    // Insert template content into the editor
    content.value = template.content;
    addToHistory(content.value);
    hasChanges.value = true;
  };

  // Load saved report content for a route (matching RouteReport.vue logic)
  async function loadSavedReport(routeId) {
    try {
      const res = await RoutesController.getRouteReportData(routeId);

      if (res.result) {
        const data = res.data;
        let parsedReportData = null;
        try {
          if (data.reportData && data.reportData !== "undefined") {
            parsedReportData = JSON.parse(data.reportData);
          }
        } catch (e) {
          console.warn("Failed to parse report data", e);
        }

        if (!parsedReportData) {
          return { success: true, message: "No valid saved report found" };
        }

        let loadedContent = parsedReportData.content;

        // ONLY FOR DEVELOPMENT - URL replacements
        loadedContent = loadedContent
          .replaceAll("https://10.0.2.2", "http://localhost")
          .replaceAll("http://10.0.2.2", "http://localhost");

        content.value = loadedContent;
        addToHistory(content.value);
        hasChanges.value = false;
        lastSaved.value = new Date();

        return { success: true, message: "Report loaded successfully" };
      }

      return { success: true, message: "No saved report found" };
    } catch (error) {
      console.error("Error loading saved report:", error);
      return { success: false, message: "Error loading saved report" };
    }
  }

  return {
    // Variable groups
    routeVariables,
    plannedRouteVariables,
    loopVariables,
    pointVariables,
    screenshotVariables,
    userVariables,
    dateVariables,
    formattingVariables,
    // Editor state
    content,
    lastSaved,
    showPreview,
    previewContent,
    hasChanges,
    showVariableModal,
    variableSearch,
    canUndo,
    canRedo,
    // Editor methods
    undo,
    redo,
    insertHeader,
    insertBold,
    insertItalic,
    insertStrikethrough,
    insertUnderline,
    insertSubscript,
    insertSuperscript,
    insertList,
    insertChecklist,
    insertTaskList,
    indentList,
    outdentList,
    insertTable,
    insertImage,
    insertLink,
    insertHorizontalRule,
    insertCode,
    insertInlineCode,
    insertQuote,
    insertDivider,
    alignText,
    insertTextColor,
    insertBackgroundColor,
    insertHighlight,
    insertFontSize,
    insertVariableText,
    previewReport,
    saveReport,
    generateReport,
    handleInput,
    handleTab,
    handleKeyDown,
    // Template state
    templates,
    loadingTemplates,
    loadTemplates,
    insertTemplate,
    loadSavedReport,
  };
}
