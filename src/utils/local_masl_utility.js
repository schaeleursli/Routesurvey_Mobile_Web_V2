export class LocalMaslUtility {
  static extractAndRemoveHeaderBlock(originalText) {
    // Regular expression to extract content between @beginheader and @endheader
    const regex = /@beginheader([\s\S]*?)@endheader/;

    // Extract the content between the markers
    const match = originalText.match(regex);

    if (match) {
      // Extract the header content
      const headerContent = match[1].trim();

      // Remove the entire block including @beginheader and @endheader
      const modifiedText = originalText.replace(regex, "").trim();

      return {
        result: true,
        message: "Extracted successfully ... ",
        body: modifiedText,
        header: headerContent,
      };
    } else {
      console.log("No header block found in the text.");
      return {
        result: false,
        message: "No header block found!!",
        body: originalText,
      };
    }
  }

  static extractAndRemoveFooterBlock(originalText) {
    // Regular expression to extract content between @beginfooter and @endfooter
    const regex = /@beginfooter([\s\S]*?)@endfooter/;

    // Extract the content between the markers
    const match = originalText.match(regex);

    if (match) {
      // Extract the footer content
      const footerContent = match[1].trim();

      // Remove the entire block including @beginfooter and @endfooter
      const modifiedText = originalText.replace(regex, "").trim();

      console.log(footerContent);

      return {
        result: true,
        message: "Extracted successfully ... ",
        body: modifiedText,
        footer: footerContent,
      };
    } else {
      console.log("No footer block found in the text.");
      return {
        result: false,
        message: "No footer block found!!",
        body: originalText,
      };
    }
  }
}
