import Turndown from "turndown";

function htmlToMarkdown(html: string) {
  return new Turndown({ headingStyle: "atx", hr: "___" }).turndown(html);
}

export default htmlToMarkdown;
