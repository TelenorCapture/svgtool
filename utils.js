// convert a file name to a usable pascal case name
// removes spaces and quotation marks
// uses spaces and shaeshes as separators
export function toPascalCase(str) {
  return str
    .toLowerCase()
    .replaceAll('"', "")
    .split(/[\s-]+/) // spaces or dashes
    .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
