import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

function checkSVGContent(fileBuffer: Buffer) {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);
  const svgElement = fileBuffer.toString("utf8");

  const cleanedSVG = DOMPurify.sanitize(svgElement);
  return cleanedSVG
}

export default checkSVGContent;
