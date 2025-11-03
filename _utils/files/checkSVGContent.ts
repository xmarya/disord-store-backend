import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

function cleanSVGContent(fileBuffer: Buffer) {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const svgElement = fileBuffer.toString("utf8");

  const cleanedSVG = DOMPurify.sanitize(svgElement);
  return Buffer.from(cleanedSVG, "utf8");
}

export default cleanSVGContent;
