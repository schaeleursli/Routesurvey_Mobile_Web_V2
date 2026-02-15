import { ref, computed } from "vue";
import RoutesController from "@/controllers/routes/routes_controller";
import ReportingController from "@/controllers/reporting/reporting_controller";
import { MASLUtility } from "@/utils/masl_utility";

// Block types
export const BLOCK_TYPES = {
  TEXT: "text",
  HEADING: "heading",
  IMAGE: "image",
  TABLE: "table",
  DATA_BLOCK: "data_block",
  TOC: "toc",
  PAGE_BREAK: "page_break",
  DIVIDER: "divider",
};

// Data block types
export const DATA_BLOCK_TYPES = {
  ROUTE_NAME: "route_name",
  ROUTE_DESCRIPTION: "route_description",
  START_LOCATION: "start_location",
  END_LOCATION: "end_location",
  ROUTE_DISTANCE: "route_distance",
  SURVEYOR_INFO: "surveyor_info",
  DATE: "date",
  ORGANIZATION: "organization",
  OBSTRUCTIONS_TABLE: "obstructions_table",
  CLEARANCE_TABLE: "clearance_table",
  ELEVATION_PROFILE: "elevation_profile",
  ROUTE_MAP: "route_map",
  PHOTOS: "photos",
};

// Table types
export const TABLE_TYPES = {
  OBSTRUCTIONS: "obstructions",
  CLEARANCE: "clearance",
  NOTES: "notes",
  CUSTOM: "custom",
};

export function useReportBuilder() {
  // Report structure
  const reportSections = ref([]);
  const reportBlocks = ref([]);
  const appendices = ref([]);
  const selectedRoute = ref(null);
  const routeData = ref(null);
  const reportTitle = ref("");

  // Header and Footer content (section-level, not blocks)
  const reportHeader = ref("");
  const reportFooter = ref("");

  // Layout parameters (margins, etc.)
  const reportLayout = ref({
    margin: {
      top: "25mm",
      right: "8mm",
      bottom: "24mm",
      left: "8mm",
    },
    header: {
      height: "30px",
      padding: { top: "5px", right: "10px", bottom: "5px", left: "10px" },
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    },
    footer: {
      height: "40px",
      padding: { top: "15px", right: "30px", bottom: "15px", left: "30px" },
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    },
  });

  // UI state
  const selectedBlockId = ref(null);
  const draggedBlockId = ref(null);
  const draggedOverBlockId = ref(null);
  const showPreview = ref(false);
  const previewContent = ref("");
  const hasChanges = ref(false);
  const lastSaved = ref(null);
  const editorsLocked = ref(false); // Unlocked by default

  // Table configuration
  const tableConfigs = ref({});

  // History for undo/redo
  const history = ref([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;
  const isHistoryAction = ref(false);

  // Generate unique ID for blocks
  let blockIdCounter = 0;
  function generateBlockId() {
    return `block-${Date.now()}-${++blockIdCounter}`;
  }

  // Initialize default report structure
  function initializeReportStructure() {
    const sections = [
      {
        id: "section-cover",
        title: "Cover Page",
        visible: true,
        collapsed: true,
        blocks: [
          createBlock(BLOCK_TYPES.TEXT, {
            content: `<table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #ddd;">
    <tbody>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; width: 30%;">Route Name</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('name')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Route Note</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('description')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Route Distance</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('distance')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Route Start</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('start')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Route End</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('end')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Route Points</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@survey('points')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Company Info</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@user('companyname')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Contact</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@user('firstname') @user('lastname')<br>@user('email')<br>Mobile: @user('mobilephone')</td>
    </tr>
    <tr>
    <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Address</td>
    <td style="border: 1px solid #ddd; padding: 8px;">@user('companyadstreet')<br>@user('companyadcity'), @user('companyadstate') @user('companyadzip')<br>@user('companyadcountry')</td>
    </tr>
    </tbody>
    </table>`,
          }),
          createBlock(BLOCK_TYPES.PAGE_BREAK),
        ],
      },
      {
        id: "section-route-overview",
        title: "Route Overview",
        visible: true,
        collapsed: true,
        blocks: [
          createBlock(BLOCK_TYPES.TEXT, {
            content: `<h6 style="font-size:11px;margin:0 0 6px 0;"><strong>Disclaimer:</strong></h6>
<p style="font-size:10px;margin:0 0 12px 0;">
  This route survey was performed to understand the overall transport requirements for the project and is not suitable for permit application. 
  All information is provided as is and will not be updated.
</p>

<div style="page-break-before:always;"></div>

<h2>Route Overview</h2>
@beginformapscreenshot
@mapscreenshot('note')
@mapscreenshot('url,800x800')
<div style="page-break-before:always;"></div>
@endformapscreenshot`,
          }),
          createBlock(BLOCK_TYPES.PAGE_BREAK),
        ],
      },
      {
        id: "section-route-summary",
        title: "Route Summary",
        visible: true,
        collapsed: true,
        blocks: [
          createBlock(BLOCK_TYPES.TEXT, {
            content: `<h2>Route Summary</h2>
<table style="width:100%;border-collapse:collapse;margin:0;font-size:10px;">
  <tr>
    <td style="padding:4px;border:1px solid #ddd;width:15%;"><strong>Distance</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;"><strong>Route Point Notes</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:31%;"><strong>Road Name</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;"><strong>Position (Deg &amp; GPS)</strong></td>
  </tr>
</table>

@beginforpoint
<table style="width:100%;border-collapse:collapse;margin:0;font-size:10px;">
  <tr>
    <td style="padding:4px;border:1px solid #ddd;width:15%;">@point('distance')</td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;">@point('notes')</td>
    <td style="padding:4px;border:1px solid #ddd;width:31%;">@point('short_address')</td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;">@point('location_deg')</td>
  </tr>
</table>
@endforpoint`,
          }),
          createBlock(BLOCK_TYPES.PAGE_BREAK),
        ],
      },
      {
        id: "section-route-data",
        title: "Route Data",
        visible: true,
        collapsed: true,
        blocks: [
          createBlock(BLOCK_TYPES.TEXT, {
            content: `<h2>Route Data</h2>
@beginforpoint
<table style="width:100%;border-collapse:collapse;margin:0 0 6px 0;font-size:12px;">
  <tr>
    <td style="padding:4px;border:1px solid #ddd;width:15%;"><strong>Distance</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;"><strong>Route Point Notes</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:31%;"><strong>Road Name</strong></td>
    <td style="padding:4px;border:1px solid #ddd;width:22%;"><strong>Position (Deg &amp; GPS)</strong></td>
  </tr>
  <tr>
    <td style="padding:4px;border:1px solid #ddd;">@point('distance')</td>
    <td style="padding:4px;border:1px solid #ddd;">@point('notes')</td>
    <td style="padding:4px;border:1px solid #ddd;">@point('short_address')</td>
    <td style="padding:4px;border:1px solid #ddd;">@point('location_deg')</td>
  </tr>
</table>

<!-- ===== TWO-COLUMN NOTE IMAGES (uniform height, padding 4px) ===== -->
<div style="width:100%;margin-top:6px;">
  @beginfornote
  <div style="
    float:left;
    width:50%;
    padding:4px;                 /* keep 4px padding */
    box-sizing:border-box;
    page-break-inside:avoid;
    break-inside:avoid;
    -webkit-column-break-inside:avoid;
  ">
    <!-- fixed-height tile with center-crop for consistent rows -->
    <div style="
      height:260px;               /* adjust to 240–300 px as you prefer */
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:center;
      border:1px solid #ddd;
      border-radius:4px;
      background:#fff;
    ">
      @noteimg('380x380')         <!-- render directly; no wrapping <img> -->
    </div>
  </div>
  @endfornote
  <div style="clear:both;"></div>
</div>
<!-- ===== END IMAGES ===== -->

<!-- ===== STYLED POINT INFO BOX ===== -->
<div class="point-info">
  <strong>Additional Information:</strong><br/>
  @point('info, font-size: 11px')
</div>

<div style="page-break-before:always;"></div>
@endforpoint`,
          }),
          createBlock(BLOCK_TYPES.PAGE_BREAK),
        ],
      },
      // {
      //   id: "section-obstructions",
      //   title: "Obstructions",
      //   visible: true,
      //   collapsed: true,
      //   blocks: [],
      // },
      // {
      //   id: "section-photos",
      //   title: "Photos",
      //   visible: true,
      //   collapsed: true,
      //   blocks: [],
      // },
      // {
      //   id: "section-signatures",
      //   title: "Signatures",
      //   visible: true,
      //   collapsed: true,
      //   blocks: [],
      // },
    ];

    // Add default blocks to cover page: table with route information and page break
    // sections[0].blocks = [
    // ];

    // Add default text editor to all other sections
    // for (let i = 1; i < sections.length; i++) {
    //   sections[i].blocks = [
    //     createBlock(BLOCK_TYPES.TEXT, {
    //       content: "",
    //     }),
    //   ];
    // }

    reportSections.value = sections;

    // Initialize header and footer with default values if they are empty
    if (!reportHeader.value || !reportHeader.value.trim()) {
      reportHeader.value = `@beginrow
@begincol
<strong>ROUTE SURVEY</strong>
<strong>@survey('name')</strong>
@endcol
@begincol
@user('companylogo,50x50')
@endcol
@endrow`;
    }

    if (!reportFooter.value || !reportFooter.value.trim()) {
      reportFooter.value = `@beginrow
@begincol
Surveyor: @user('firstname') @user('lastname')
Date: @date
@endcol
@begincol
Company: @user('companyname')
@pagenumber
@endcol
@endrow`;
    }

    flattenBlocks();
    addToHistory();
  }

  // Create a new block
  function createBlock(type, config = {}) {
    const block = {
      id: generateBlockId(),
      type,
      sectionId: config.sectionId || null,
      order: config.order || 0,
      visible: config.visible !== undefined ? config.visible : true,
      config: {
        ...config,
        type: undefined,
        sectionId: undefined,
        order: undefined,
        visible: undefined,
      },
    };

    // Initialize table config if it's a table
    if (type === BLOCK_TYPES.TABLE && config.config) {
      tableConfigs.value[block.id] = { ...config.config };
    }

    return block;
  }

  // Flatten blocks from sections into a single array
  function flattenBlocks() {
    reportBlocks.value = [];
    reportSections.value.forEach((section) => {
      if (section.visible) {
        section.blocks.forEach((block, index) => {
          block.sectionId = section.id;
          block.order = index;
          reportBlocks.value.push(block);
        });
      }
    });
  }

  // Add block to a section
  function addBlockToSection(sectionId, block, position = null) {
    const section = reportSections.value.find((s) => s.id === sectionId);
    if (!section) return;

    if (
      position !== null &&
      position >= 0 &&
      position < section.blocks.length
    ) {
      section.blocks.splice(position, 0, block);
    } else {
      section.blocks.push(block);
    }

    block.sectionId = sectionId;
    flattenBlocks();
    addToHistory();
    hasChanges.value = true;
  }

  // Remove block
  function removeBlock(blockId) {
    // Save state BEFORE removing (so undo can restore to this state)
    addToHistory();

    reportSections.value.forEach((section) => {
      const index = section.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        section.blocks.splice(index, 1);
        if (tableConfigs.value[blockId]) {
          delete tableConfigs.value[blockId];
        }
      }
    });
    flattenBlocks();
    hasChanges.value = true;

    // Save state AFTER removing (so redo can restore to this state)
    addToHistory();
  }

  // Move block
  function moveBlock(blockId, targetSectionId, targetPosition) {
    let block = null;


    // Find and remove block from source
    reportSections.value.forEach((section) => {
      const index = section.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        block = section.blocks[index];
        section.blocks.splice(index, 1);
      }
    });

    if (!block) return;

    // Add to target
    const targetSection = reportSections.value.find(
      (s) => s.id === targetSectionId
    );
    if (!targetSection) return;

    if (
      targetPosition !== null &&
      targetPosition >= 0 &&
      targetPosition <= targetSection.blocks.length
    ) {
      targetSection.blocks.splice(targetPosition, 0, block);
    } else {
      targetSection.blocks.push(block);
    }

    block.sectionId = targetSectionId;
    flattenBlocks();
    addToHistory();
    hasChanges.value = true;
  }

  // Reorder blocks within a section
  function reorderBlocks(sectionId, blockIds) {
    const section = reportSections.value.find((s) => s.id === sectionId);
    if (!section) return;

    const blocksMap = new Map(section.blocks.map((b) => [b.id, b]));
    section.blocks = blockIds.map((id) => blocksMap.get(id)).filter(Boolean);

    flattenBlocks();
    addToHistory();
    hasChanges.value = true;
  }

  // Toggle section visibility
  function toggleSectionVisibility(sectionId) {
    const section = reportSections.value.find((s) => s.id === sectionId);
    if (section) {
      section.visible = !section.visible;
      flattenBlocks();
      addToHistory();
      hasChanges.value = true;
    }
  }

  // Toggle section collapse
  function toggleSectionCollapse(sectionId) {
    const section = reportSections.value.find((s) => s.id === sectionId);
    if (section) {
      section.collapsed = !section.collapsed;
    }
  }

  // Update section title
  function updateSectionTitle(sectionId, newTitle) {
    const section = reportSections.value.find((s) => s.id === sectionId);
    if (section && newTitle && newTitle.trim()) {
      section.title = newTitle.trim();
      flattenBlocks();
      addToHistory();
      hasChanges.value = true;
      return { success: true, message: "Section title updated successfully" };
    }
    return { success: false, message: "Invalid section or title" };
  }

  // Remove section
  function removeSection(sectionId) {
    // Don't allow removing the cover page section
    if (sectionId === "section-cover") {
      return {
        success: false,
        message: "Cannot remove the cover page section",
      };
    }

    const index = reportSections.value.findIndex((s) => s.id === sectionId);
    if (index !== -1) {
      // Remove all blocks from the section first
      const section = reportSections.value[index];
      section.blocks.forEach((block) => {
        if (tableConfigs.value[block.id]) {
          delete tableConfigs.value[block.id];
        }
      });

      reportSections.value.splice(index, 1);
      flattenBlocks();
      addToHistory();
      hasChanges.value = true;
      return { success: true, message: "Section removed successfully" };
    }
    return { success: false, message: "Section not found" };
  }

  // Get default section templates
  function getDefaultSectionTemplates() {
    return [
      { id: "section-summary", title: "Summary" },
      { id: "section-route-details", title: "Route Details" },
      { id: "section-obstructions", title: "Obstructions" },
      { id: "section-photos", title: "Photos" },
      { id: "section-signatures", title: "Signatures" },
      { id: "section-appendix", title: "Appendix" },
      { id: "section-notes", title: "Notes" },
      { id: "section-recommendations", title: "Recommendations" },
    ];
  }

  // Add section (default or custom)
  function addSection(sectionType, customTitle = null) {
    let sectionId;
    let title;

    if (sectionType === "custom") {
      // Generate unique ID for custom section
      sectionId = `section-custom-${Date.now()}`;
      title = customTitle || "New Section";
    } else {
      // Use default section template
      const template = getDefaultSectionTemplates().find(
        (t) => t.id === sectionType
      );
      if (!template) {
        return { success: false, message: "Invalid section type" };
      }

      // Check if section already exists
      const existing = reportSections.value.find((s) => s.id === template.id);
      if (existing) {
        return { success: false, message: "Section already exists" };
      }

      sectionId = template.id;
      title = template.title;
    }

    const newSection = {
      id: sectionId,
      title: title,
      visible: true,
      collapsed: true,
      blocks: [],
    };

    // Add default text editor block to the section
    const defaultTextBlock = createBlock(BLOCK_TYPES.TEXT, {
      content: "",
    });
    newSection.blocks.push(defaultTextBlock);

    // Add section at the end (before signatures if it exists, otherwise at the end)
    const signaturesIndex = reportSections.value.findIndex(
      (s) => s.id === "section-signatures"
    );
    if (signaturesIndex !== -1) {
      reportSections.value.splice(signaturesIndex, 0, newSection);
    } else {
      reportSections.value.push(newSection);
    }

    flattenBlocks();
    addToHistory();
    hasChanges.value = true;
    return {
      success: true,
      message: "Section added successfully",
      section: newSection,
    };
  }

  // Update block content
  function updateBlockContent(blockId, content) {
    reportSections.value.forEach((section) => {
      const block = section.blocks.find((b) => b.id === blockId);
      if (block) {
        if (
          block.type === BLOCK_TYPES.TEXT ||
          block.type === BLOCK_TYPES.HEADING
        ) {
          block.config.content = content;
        }
        hasChanges.value = true;
        addToHistory();
      }
    });
  }

  // Update table configuration
  function updateTableConfig(blockId, config) {
    tableConfigs.value[blockId] = { ...tableConfigs.value[blockId], ...config };
    hasChanges.value = true;
    addToHistory();
  }

  // History management
  function addToHistory() {
    if (isHistoryAction.value) {
      isHistoryAction.value = false;
      return;
    }

    // Deep clone the state to ensure we capture the current state properly
    const state = JSON.stringify({
      sections: JSON.parse(JSON.stringify(reportSections.value)),
      tableConfigs: JSON.parse(JSON.stringify(tableConfigs.value)),
      appendices: JSON.parse(JSON.stringify(appendices.value)),
    });

    // If we're in the middle of history (not at the end), truncate future history
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    // Check if this state is different from the last saved state
    // Only check if history is not empty
    if (history.value.length > 0) {
      const lastState = history.value[history.value.length - 1];
      if (lastState === state) {
        // State is the same, but ensure historyIndex is at the end
        historyIndex.value = history.value.length - 1;
        return;
      }
    }

    // Add the new state to history
    history.value.push(state);
    historyIndex.value = history.value.length - 1;

    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value.shift();
      historyIndex.value = history.value.length - 1;
    }
  }

  function undo() {
    // Can undo if we have at least 2 states (initial + at least one action)
    if (history.value.length > 1 && historyIndex.value > 0) {
      isHistoryAction.value = true;
      historyIndex.value--;
      restoreState(history.value[historyIndex.value]);
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      isHistoryAction.value = true;
      historyIndex.value++;
      restoreState(history.value[historyIndex.value]);
    }
  }

  function restoreState(stateString) {
    try {
      const state = JSON.parse(stateString);
      reportSections.value = JSON.parse(JSON.stringify(state.sections));
      tableConfigs.value = JSON.parse(JSON.stringify(state.tableConfigs || {}));
      appendices.value = JSON.parse(JSON.stringify(state.appendices || []));
      flattenBlocks();
    } catch (error) {
      console.error("Error restoring state:", error);
    }
  }

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  // Load route data
  async function loadRouteData(routeId) {
    try {
      const res = await RoutesController.getRoute(routeId);
      if (res.result) {
        routeData.value = res.data;
        return { success: true, data: res.data };
      }
      return { success: false, message: res.message };
    } catch (error) {
      console.error("Error loading route data:", error);
      return { success: false, message: "Error loading route data" };
    }
  }

  // Load saved report
  async function loadSavedReport(routeId) {
    try {
      const res = await RoutesController.getRouteReportData(routeId);
      if (res.result && res.data?.reportData) {
        const parsedData = JSON.parse(res.data.reportData);

        if (parsedData.structure) {
          // Load new structure format
          reportSections.value = parsedData.structure.sections || [];
          tableConfigs.value = parsedData.structure.tableConfigs || {};
          reportHeader.value = parsedData.structure.header || "";
          reportFooter.value = parsedData.structure.footer || "";
          // Load report title if it exists
          if (parsedData.structure.title) {
            reportTitle.value = parsedData.structure.title;
          }
          // Load layout parameters if they exist, otherwise use defaults
          if (parsedData.structure.layout) {
            reportLayout.value = {
              ...reportLayout.value,
              ...parsedData.structure.layout,
            };
          }
          if (parsedData.structure.appendices) {
            appendices.value = parsedData.structure.appendices;
          } else {
            appendices.value = [];
          }
          flattenBlocks();

          // Lock editors if no content exists (empty report)
          const hasContent =
            reportSections.value.some(
              (section) =>
                section.blocks &&
                section.blocks.length > 0 &&
                section.blocks.some(
                  (block) =>
                    block.config?.content && block.config.content.trim()
                )
            ) ||
            (reportHeader.value && reportHeader.value.trim()) ||
            (reportFooter.value && reportFooter.value.trim());

          if (!hasContent) {
            editorsLocked.value = true;
          }
        } else if (parsedData.content) {
          // Legacy format - convert to new structure
          initializeReportStructure();
          editorsLocked.value = true;
        }

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

  // Save report
  async function saveReport(routeId, reportTitleParam = null) {
    try {
      // Use provided reportTitle parameter or fallback to reportTitle.value from state
      const title = reportTitleParam || reportTitle.value || null;

      const structure = {
        sections: reportSections.value,
        tableConfigs: tableConfigs.value,
        header: reportHeader.value,
        footer: reportFooter.value,
        layout: reportLayout.value,
        title: title,
        appendices: appendices.value,
      };

      const res = await RoutesController.updateRouteReportData({
        RouteId: routeId,
        ReportData: JSON.stringify({
          structure,
          version: "2.0",
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.result) {
        lastSaved.value = new Date();
        hasChanges.value = false;
        return { success: true, message: "Report saved successfully" };
      }
      return {
        success: false,
        message: res.message || "Failed to save report",
      };
    } catch (error) {
      console.error("Error saving report:", error);
      return { success: false, message: "Error saving report" };
    }
  }

  // Generate HTML content from structure
  async function generateHTMLContent(routeId, skipHeaderFooter = false) {
    let html = "";

    // Add section metadata as a comment for TOC generation
    const sectionsMetadata = reportSections.value
      .filter((s) => s.visible)
      .map((s) => ({
        id: s.id,
        title: s.title,
      }));
    html += `<!-- @sections:${JSON.stringify(sectionsMetadata)} -->\n`;

    // Add header if configured (skip for preview)
    if (!skipHeaderFooter && reportHeader.value && reportHeader.value.trim()) {
      html += `@beginheader\n${reportHeader.value.replace(
        /\n/g,
        "<br>"
      )}\n@endheader\n`;
    }

    for (const section of reportSections.value) {
      if (!section.visible) continue;

      // Add section marker for TOC reference
      html += `<!-- @section:${section.id}:${section.title} -->\n`;

      for (const block of section.blocks) {
        if (!block.visible) continue;

        html += await renderBlock(block, routeId);
        html += "<br />";
      }

      // Add page break after cover page section
      if (section.id === "section-cover") {
        html += "\n@pagebreak\n";
      }
    }

    // Add footer if configured (skip for preview)
    if (!skipHeaderFooter && reportFooter.value && reportFooter.value.trim()) {
      html += `@beginfooter\n${reportFooter.value.replace(
        /\n/g,
        "<br>"
      )}\n@endfooter\n`;
    }

    return html;
  }

  // Process Quill HTML to convert alignment classes to inline styles
  function processQuillHTML(html) {
    if (!html || typeof html !== "string") {
      return html;
    }

    // Create a temporary DOM element to parse and process the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Find all elements with Quill alignment classes and convert to inline styles
    const alignmentMap = {
      "ql-align-center": "center",
      "ql-align-right": "right",
      "ql-align-justify": "justify",
      "ql-align-left": "left",
    };

    // Process all elements with alignment classes
    Object.keys(alignmentMap).forEach((className) => {
      const elements = tempDiv.querySelectorAll(`.${className}`);
      elements.forEach((element) => {
        const alignment = alignmentMap[className];
        // Get existing style attribute or create new one
        const existingStyle = element.getAttribute("style") || "";
        // Add or update text-align in style
        let newStyle = existingStyle;
        if (newStyle) {
          // Remove existing text-align if present to avoid duplicates
          newStyle = newStyle.replace(/text-align\s*:\s*[^;]+;?/gi, "").trim();
          if (newStyle && !newStyle.endsWith(";")) {
            newStyle += ";";
          }
        }
        newStyle += ` text-align: ${alignment};`;
        element.setAttribute("style", newStyle.trim());
        // Remove the class since we've converted it to inline style
        element.classList.remove(className);
      });
    });

    return tempDiv.innerHTML;
  }

  // Render a single block to HTML
  async function renderBlock(block, routeId) {
    switch (block.type) {
      case BLOCK_TYPES.HEADING: {
        const level = block.config.level || 2;
        return `<h${level}>${block.config.content || ""}</h${level}>`;
      }

      case BLOCK_TYPES.TEXT: {
        // Content is HTML from the rich text editor
        const textContent = block.config.content || "";
        if (textContent.trim()) {
          // If content is already HTML (contains tags), use it as-is
          // Otherwise, wrap plain text in paragraph
          if (textContent.includes("<") && textContent.includes(">")) {
            // Process HTML to convert Quill alignment classes to inline styles
            return processQuillHTML(textContent);
          } else {
            // Plain text fallback - convert newlines to breaks and wrap in paragraph
            const formattedText = textContent.replace(/\n/g, "<br>");
            return `<p style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; max-width: 100%;">${formattedText}</p>`;
          }
        }
        return "";
      }

      case BLOCK_TYPES.IMAGE:
        return `<img src="${block.config.src || ""}" alt="${block.config.alt || ""
          }" style="max-width: 100%; height: auto;" />`;

      case BLOCK_TYPES.DIVIDER:
        return "<hr>";

      case BLOCK_TYPES.PAGE_BREAK:
        return '<div style="page-break-after: always;"></div>';

      case BLOCK_TYPES.TOC:
        return "@toc";

      case BLOCK_TYPES.DATA_BLOCK:
        return renderDataBlock(block, routeId);

      case BLOCK_TYPES.TABLE:
        return renderTableBlock(block, routeId);

      default:
        return "";
    }
  }

  // Render data block
  function renderDataBlock(block) {
    const dataType = block.config.dataType;

    const mappings = {
      [DATA_BLOCK_TYPES.ROUTE_NAME]: "@survey('name')",
      [DATA_BLOCK_TYPES.ROUTE_DESCRIPTION]: "@survey('description')",
      [DATA_BLOCK_TYPES.START_LOCATION]: "@survey('start')",
      [DATA_BLOCK_TYPES.END_LOCATION]: "@survey('end')",
      [DATA_BLOCK_TYPES.ROUTE_DISTANCE]: "@survey('distance')",
      [DATA_BLOCK_TYPES.SURVEYOR_INFO]: "@user('name')",
      [DATA_BLOCK_TYPES.DATE]: "@date",
      [DATA_BLOCK_TYPES.ORGANIZATION]: "@user('companyname')",
      [DATA_BLOCK_TYPES.ROUTE_MAP]: "@survey('staticmap')",
      [DATA_BLOCK_TYPES.PHOTOS]: `
@beginforpoint
@beginfornote
@noteimg('fit')
@endfornote
@endforpoint
`,
      [DATA_BLOCK_TYPES.OBSTRUCTIONS_TABLE]: `
@beginforpoint
@point('type')
@endforpoint
`,
      [DATA_BLOCK_TYPES.ELEVATION_PROFILE]: "@survey('elevation')",
    };

    return mappings[dataType] || "";
  }

  // Render table block
  function renderTableBlock(block) {
    const tableType = block.config.type;

    // This would generate MASL template code for the table
    // For now, return a placeholder
    return `<!-- Table: ${tableType} -->`;
  }

  // Preview report
  async function previewReport(routeId) {
    try {
      // Skip header and footer in preview
      const html = await generateHTMLContent(routeId, true);
      const processedContent = await MASLUtility.parseMASL(html, routeId);
      previewContent.value = processedContent.replaceAll(
        "https://localhost",
        "http://localhost"
      );
      showPreview.value = true;
    } catch (error) {
      console.error("Error previewing report:", error);
      previewContent.value = "<p>Error generating preview</p>";
      showPreview.value = true;
    }
  }

  // Generate report
  async function generateReport(routeId, reportTitleParam = null) {
    try {
      const html = await generateHTMLContent(routeId);
      const processedContent = await MASLUtility.parseMASL(html, routeId);

      // Include layout parameters in the request
      const layoutParams = reportLayout.value || null;

      // Use provided reportTitle parameter or fallback to reportTitle.value from state
      const title = reportTitleParam || reportTitle.value || null;

      const res = await ReportingController.generateReportFromTemplate(
        processedContent,
        routeId,
        layoutParams,
        title
      );

      if (res.result) {
        return { success: true, message: "Report generated successfully" };
      }
      return {
        success: false,
        message: res.message || "Failed to generate report",
      };
    } catch (error) {
      console.error("Error generating report:", error);
      return { success: false, message: "Error generating report" };
    }
  }

  // Update header content
  function updateHeader(content) {
    reportHeader.value = content;
    hasChanges.value = true;
    addToHistory();
  }

  // Update footer content
  function updateFooter(content) {
    reportFooter.value = content;
    hasChanges.value = true;
    addToHistory();
  }

  // Clear header
  function clearHeader() {
    addToHistory(); // Save state before clearing
    reportHeader.value = "";
    hasChanges.value = true;
    addToHistory(); // Save state after clearing
  }

  // Clear footer
  function clearFooter() {
    addToHistory(); // Save state before clearing
    reportFooter.value = "";
    hasChanges.value = true;
    addToHistory(); // Save state after clearing
  }

  // Update layout parameters
  function updateLayout(layout) {
    reportLayout.value = {
      ...reportLayout.value,
      ...layout,
    };
    hasChanges.value = true;
    addToHistory();
  }

  // Reset sections to default structure
  function resetSectionsToDefault() {
    if (!selectedRoute.value) {
      return { success: false, message: "No route selected" };
    }

    // Save state before resetting
    addToHistory();

    // Clear existing table configs
    tableConfigs.value = {};

    // Clear header and footer
    reportHeader.value = `@beginrow
@begincol
<strong>ROUTE SURVEY</strong>
<strong>@survey('name')</strong>
@endcol
@begincol
@user('companylogo,50x50')
@endcol
@endrow`;
    reportFooter.value = `@beginrow
@begincol
Surveyor: @user('firstname') @user('lastname')
Date: @date
@endcol
@begincol
Company: @user('companyname')
@pagenumber
@endcol
@endrow`;

    // Reinitialize the report structure with the current route
    initializeReportStructure();

    // Reset appendices
    appendices.value = [];

    // Lock editors after reset
    editorsLocked.value = true;

    hasChanges.value = true;
    return {
      success: true,
      message: "Sections, header, and footer reset to default successfully",
    };
  }

  // Toggle editors lock state
  function toggleEditorsLock() {
    editorsLocked.value = !editorsLocked.value;
    hasChanges.value = true;
  }

  // Appendix management methods
  function addAppendix(appendix) {
    appendices.value.push(appendix);
    hasChanges.value = true;
    addToHistory();
  }

  function removeAppendix(appendixId) {
    const index = appendices.value.findIndex(a => a.id === appendixId);
    if (index !== -1) {
      appendices.value.splice(index, 1);
      hasChanges.value = true;
      addToHistory();
    }
  }

  function updateAppendix(appendixId, updates) {
    const index = appendices.value.findIndex(a => a.id === appendixId);
    if (index !== -1) {
      appendices.value[index] = { ...appendices.value[index], ...updates };
      hasChanges.value = true;
      addToHistory();
    }
  }

  function reorderAppendices(newAppendices) {
    appendices.value = newAppendices;
    hasChanges.value = true;
    addToHistory();
  }

  return {
    // State
    reportSections,
    reportBlocks,
    selectedRoute,
    routeData,
    reportTitle,
    appendices,
    selectedBlockId,
    draggedBlockId,
    draggedOverBlockId,
    showPreview,
    previewContent,
    hasChanges,
    lastSaved,
    tableConfigs,
    reportHeader,
    reportFooter,
    reportLayout,
    editorsLocked,
    canUndo,
    canRedo,

    // Methods
    initializeReportStructure,
    createBlock,
    addBlockToSection,
    removeBlock,
    moveBlock,
    reorderBlocks,
    flattenBlocks,
    toggleSectionVisibility,
    toggleSectionCollapse,
    updateSectionTitle,
    removeSection,
    addSection,
    getDefaultSectionTemplates,
    updateBlockContent,
    updateTableConfig,
    updateHeader,
    updateFooter,
    clearHeader,
    clearFooter,
    updateLayout,
    resetSectionsToDefault,
    toggleEditorsLock,
    undo,
    redo,
    loadRouteData,
    loadSavedReport,
    saveReport,
    previewReport,
    generateReport,
    generateHTMLContent,
    addAppendix,
    removeAppendix,
    updateAppendix,
    reorderAppendices,

    // Constants
    BLOCK_TYPES,
    DATA_BLOCK_TYPES,
    TABLE_TYPES,
  };
}
