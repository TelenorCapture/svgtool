import { readdir , readFileSync, writeFileSync} from "fs";
import { join, extname } from 'path';

import { transform } from "@svgr/core";
import { optimize } from "svgo";

import { toPascalCase } from "./utils.js";

const customTemplate = (
  { componentName, jsx },
  { tpl }
) => {
  return tpl`
  // generated file from component library on 24.09.2023
  import { colors } from '../../../assets/styleConstants'
  import type { IconProps } from '../iconLibrary.types'

  export const ${componentName} = (props: IconProps) => {
    const color = props.color || colors.defaultIconColor
    return ${jsx};
  }
  `;
};


export const config = {
  typescript: true,
  prettier: true,
  prettierConfig: { // copied from capweb
    bracketSpacing: true,
    bracketSameLine: true,
    tabWidth: 4,
    trailingComma: "all",
    semi: false,
    singleQuote: true,
  },
  replaceAttrValues: {
    "#000": "{color}",
  },
  svgProps: {
    fill: "{color}",
    width: "{props.size}",
    height: "{props.size}",
  },
  expandProps: false, // we dont want to spread props
  plugins: ["@svgr/plugin-jsx", "@svgr/plugin-prettier"],
  template: customTemplate,
};

const __dirname = new URL(".", import.meta.url).pathname;
const directoryPath = join(__dirname, "./svgFiles/240923"); 
const outputDirectoryPath = join(__dirname, "./out"); 


readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  files.forEach((file) => {
    if (extname(file) === ".svg") {

      const filePath = join(directoryPath, file);
      const componentName = toPascalCase(file.replace(".svg", ""));
      const outFilePath = join(outputDirectoryPath, `${componentName}Icon.tsx`);

      let svgContent = readFileSync(filePath, "utf8");

      // we could have used the plugin for svgr
      // but I didnt want to figure out the config
      let {data: optimised} = optimize(svgContent, {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      });

      const sizeBefore = Buffer.byteLength(svgContent, "utf8");
      const sizeAfter = Buffer.byteLength(optimised, "utf8");
      
      let iconToComponent = transform.sync(optimised, config, {
        componentName: componentName,
      });

      writeFileSync(outFilePath, iconToComponent);
      console.log(`Optimised ${file}: ${sizeBefore}b > ${sizeAfter}b`);
    }
  });
});
