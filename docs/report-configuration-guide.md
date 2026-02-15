# Report Configuration Guide

**User Documentation for Report Section Configuration**

---

## Overview

Configure report sections to automatically filter data, apply thresholds, and customize displays based on your project requirements. Save your configurations as templates for quick reuse across reports.

---

## Quick Start

### 1. Configure a Section

1. **Open Report Editor**
   - Navigate to Reports → New Report
   - Or edit an existing report

2. **Add a Configurable Section**
   - Click "+ Add Section"
   - Select one of:
     - Bridge & Structure Register
     - Clearance Analysis
     - Transport Assumptions
     - Photo Log

3. **Open Configuration**
   - Find the section in your report
   - Click the ⚙️ (gear icon) in the section header
   - Configuration modal opens

4. **Adjust Settings**
   - Modify values as needed
   - Red asterisk (*) = required field
   - Inline help text explains each setting

5. **Save**
   - Click "Save Configuration"
   - Section updates automatically
   - Changes take effect immediately

---

## Section Configuration Options

### Bridge & Structure Register

**Purpose:** Filter and display bridge information based on clearance and capacity requirements.

**Key Settings:**

| Setting | Description | Example |
|---------|-------------|---------|
| **Min Vertical Clearance** | Minimum acceptable vertical clearance (meters) | 4.5m (standard), 5.5m (heavy transport) |
| **Max Vertical Clearance** | Maximum vertical clearance to display | 10.0m |
| **Min Horizontal Clearance** | Minimum acceptable horizontal clearance | 3.5m (standard), 4.5m (wide loads) |
| **Max Load Capacity** | Maximum load capacity to display (tonnes) | 100t (standard), 200t (heavy) |
| **Structure Types** | Which structure types to include | Bridge, Overpass, Underpass, Tunnel |
| **Show Load Ratings** | Display load capacity information | ✓ Recommended |
| **Measurement Unit** | Unit system for display | Metric / Imperial |

**What It Does:**
- Filters bridges below minimum clearance thresholds
- Highlights critical structures in red
- Shows summary statistics
- Only displays selected structure types

**Use Cases:**
- Standard inspections: 4.5m vertical, 3.5m horizontal
- Heavy transport: 5.5m vertical, 4.5m horizontal
- Extra-wide loads: 6.0m+ vertical, 5.0m+ horizontal

---

### Clearance Analysis

**Purpose:** Analyze clearance points and identify potential hazards based on configurable thresholds.

**Key Settings:**

| Setting | Description | Example |
|---------|-------------|---------|
| **Vertical Clearance Threshold** | Points below this are flagged | 4.5m (standard), 5.0m (strict) |
| **Lateral Clearance Threshold** | Horizontal clearance minimum | 3.0m (standard), 3.5m (strict) |
| **Tolerance Value** | Safety margin (meters) | 0.3m (standard), 0.5m (strict) |
| **Highlight Critical Points** | Visual warning for low clearances | ✓ Recommended |
| **Measurement Unit** | Unit system | Metric / Imperial |

**What It Does:**
- Flags points below threshold
- Applies tolerance to calculations
- Shows warning/critical status
- Calculates safety margins
- Displays summary stats

**Use Cases:**
- Standard routes: 4.5m vertical, 3.0m lateral, 0.3m tolerance
- High safety margins: 5.0m vertical, 3.5m lateral, 0.5m tolerance
- Tight routes: 4.0m vertical, 2.5m lateral, 0.2m tolerance

---

### Transport Assumptions

**Purpose:** Display vehicle dimensions and specifications for the transport.

**Key Settings:**

| Setting | Description | Example |
|---------|-------------|---------|
| **Vehicle Length** | Total length (meters) | 25.0m |
| **Vehicle Width** | Total width (meters) | 4.5m |
| **Vehicle Height** | Total height (meters) | 5.5m |
| **Axle Configuration** | Number and spacing of axles | "6x4" |
| **Maximum Speed** | Speed limit for this transport | 60 km/h |
| **Estimated Weight** | Total vehicle weight (tonnes) | 180t |

**What It Does:**
- Generates SVG diagrams (side view, front view)
- Shows dimensional overlays
- Displays specifications table
- Calculates turning radius

---

### Photo Log

**Purpose:** Configure how photos are displayed in the report.

**Key Settings:**

| Setting | Description | Options |
|---------|-------------|---------|
| **Image Size** | Thumbnail size | Small / Medium / Large |
| **Images Per Row** | Grid layout | 2 / 3 / 4 |
| **Show GPS Coordinates** | Display location data | ✓ or ✗ |
| **Show Timestamp** | Display capture time | ✓ or ✗ |

**What It Does:**
- Sets grid layout
- Controls image sizing
- Shows/hides metadata

**Use Cases:**
- Compact view: Small, 4 per row, GPS only
- Detailed view: Large, 2 per row, GPS + timestamp
- Presentation: Medium, 3 per row, hide metadata

---

## Using Templates

### What Are Templates?

Templates are saved configurations you can quickly apply to new sections. Instead of manually setting values each time, load a template with one click.

### Loading a Template

1. **Open Configuration**
   - Click ⚙️ on any configurable section

2. **Browse Templates**
   - Click the "Templates" button (bottom left)
   - Template library opens

3. **Find Your Template**
   - Use search box to filter
   - Select "Default" or "My Templates" filter
   - Browse template cards

4. **Apply Template**
   - Click the template card
   - Click "Apply Template" from dropdown
   - Configuration loads instantly

5. **Adjust & Save**
   - Modify any values if needed
   - Click "Save Configuration"

### Saving a Template

1. **Configure Section**
   - Set all your desired values
   - Ensure no validation errors

2. **Save as Template**
   - Click "Save as Template" button
   - Modal opens

3. **Name Your Template**
   - Template Name: e.g., "Heavy Transport - Bridges"
   - Description: e.g., "Conservative settings for 200t loads"
   - Tags: e.g., "heavy, bridges, conservative"

4. **Save**
   - Click "Save Template"
   - Template now available in library

### Default Templates

**6 Included Templates:**

1. **Standard Bridge Inspection**
   - 4.5m vertical, 3.5m horizontal
   - All structure types
   - 100t max load

2. **Heavy Transport - Bridges**
   - 5.5m vertical, 4.5m horizontal
   - Includes tunnels
   - 200t max load

3. **Standard Clearance Analysis**
   - 4.5m vertical threshold
   - 3.0m lateral threshold
   - 0.3m tolerance

4. **Strict Safety Margins**
   - 5.0m vertical threshold
   - 3.5m lateral threshold
   - 0.5m tolerance

5. **Compact Photo Layout**
   - Small images, 4 per row
   - GPS shown, timestamp hidden

6. **Detailed Photo Documentation**
   - Large images, 2 per row
   - GPS and timestamp shown

**Note:** Default templates cannot be edited or deleted. Duplicate them to create custom versions.

### Sharing Templates

**Export:**
1. Open template library
2. Click template → "Export"
3. Downloads JSON file
4. Share via email/drive

**Import:**
1. Receive JSON file from colleague
2. Open template library
3. Click "Import Templates"
4. Select JSON file
5. Template added to your library

---

## Validation & Error Messages

### Common Validation Errors

**"This field is required"**
- Field cannot be left empty
- Enter a value before saving

**"Value must be at least X"**
- Value is below minimum threshold
- Increase the value

**"Value must be at most X"**
- Value exceeds maximum threshold
- Decrease the value

**"Min value must be less than max value"**
- Cross-field validation failed
- Ensure min < max

**"At least one option must be selected"**
- Multi-select field is empty
- Select at least one option

### Understanding Validation

- **Red asterisk (*)** = Required field
- **Red border** = Invalid value
- **Error message below field** = What's wrong
- **Disabled save button** = Fix errors first

**Validation runs automatically as you type.** Errors appear immediately, helping you catch mistakes early.

---

## Best Practices

### Configuration

1. **Start with a Template**
   - Don't configure from scratch
   - Use defaults as starting point
   - Modify as needed

2. **Use Descriptive Names**
   - Template names should be clear
   - "Heavy Transport - Bridges" ✓
   - "Template 1" ✗

3. **Add Tags**
   - Makes templates searchable
   - Use: project type, route type, standards
   - Examples: "heavy", "urban", "rural", "standard"

4. **Test Configurations**
   - Preview the section after saving
   - Verify data filters correctly
   - Adjust if needed

### Templates

1. **Organize by Use Case**
   - Create templates for common scenarios
   - "Urban Heavy Transport"
   - "Rural Standard Inspection"
   - "Emergency Route Analysis"

2. **Keep Templates Updated**
   - Review quarterly
   - Delete unused templates
   - Update based on new requirements

3. **Share with Team**
   - Export successful configurations
   - Build a template library
   - Standardize across projects

### Performance

1. **Don't Over-Filter**
   - Too strict thresholds = empty results
   - Balance filtering with data visibility

2. **Use Appropriate Image Sizes**
   - Large images = slow loading
   - Small images = compact reports
   - Choose based on report purpose

---

## Troubleshooting

### Configuration Not Saving

**Symptoms:** Click "Save" but nothing happens

**Solutions:**
1. Check for validation errors
2. Look for red borders on fields
3. Read error messages
4. Correct invalid values
5. Try again

### Section Not Updating

**Symptoms:** Saved configuration doesn't change display

**Solutions:**
1. Refresh the page
2. Verify configuration actually saved
3. Check if section type supports this config
4. Clear browser cache

### Template Not Found

**Symptoms:** Cannot find saved template

**Solutions:**
1. Check filter settings ("All" vs "My Templates")
2. Search by name or tag
3. Verify template wasn't deleted
4. Check localStorage not cleared

### Import Fails

**Symptoms:** Error when importing template JSON

**Solutions:**
1. Verify JSON file is valid
2. Ensure file not corrupted
3. Check file encoding (UTF-8)
4. Try exporting again from source

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal |
| `Enter` | Save (when no errors) |
| `Tab` | Navigate fields |
| `Ctrl+F` / `Cmd+F` | Search templates |

---

## FAQ

**Q: Can I use the same template for different section types?**
A: No, templates are section-specific. A Bridge Register template only works for Bridge Register sections.

**Q: What happens if I delete a default template?**
A: You can't. Default templates are protected and cannot be deleted or edited.

**Q: How do I reset a configuration to defaults?**
A: Click "Reset to Defaults" button in the configuration modal.

**Q: Can I share templates with my team?**
A: Yes, use Export/Import. Export your template as JSON, share the file, and others can import it.

**Q: Do templates work across different reports?**
A: Yes! Templates are saved to your browser and work across all reports.

**Q: What if my browser clears localStorage?**
A: Templates are stored in localStorage. If cleared, they're lost. Export important templates as backup.

**Q: Can I use templates on mobile?**
A: Yes, templates work on all devices. The UI is responsive.

**Q: How many templates can I save?**
A: Limited by browser localStorage (typically 5-10MB). Hundreds of templates easily fit.

---

## Support

**Need Help?**
- Check this guide first
- Review error messages carefully
- Contact support with:
  - Screenshot of issue
  - Steps to reproduce
  - Browser/device info

**Feature Requests:**
- Submit via feedback form
- Describe use case
- Explain expected behavior

---

**Last Updated:** 2026-01-27
**Version:** 1.0.0
