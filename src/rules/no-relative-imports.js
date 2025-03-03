import path from "path";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallows relative imports across different slices in Feature-Sliced Design.",
      recommended: true,
    },
    messages: {
      noRelativePath:
        "🚨 Relative import '{{ importPath }}' is not allowed across different slices. Use an alias instead.",
    },
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Check if the import path is a relative path
        if (!importPath.startsWith("../") && !importPath.startsWith("./")) {
          return; // Skip if it's not a relative import
        }

        const currentFilePath = context.getFilename();
        const projectRoot = path.resolve(process.cwd(), "src"); // Project root directory (src)

        // Resolve the absolute path of the imported file
        const absoluteImportPath = path.resolve(path.dirname(currentFilePath), importPath);

        if (!absoluteImportPath.startsWith(projectRoot)) {
          return; // Skip checking files outside the src directory
        }

        // Compute relative paths for the current file and the import target
        const relativePath = path.relative(projectRoot, currentFilePath);
        const relativeImportTarget = path.relative(projectRoot, absoluteImportPath);

        // Extract the first two folder names (Layer and Slice)
        const getLayerAndSlice = (filePath) => {
          const parts = filePath.split(path.sep);
          return parts.length >= 2 ? { layer: parts[0], slice: parts[1] } : null;
        };

        const currentLocation = getLayerAndSlice(relativePath);
        const importLocation = getLayerAndSlice(relativeImportTarget);

        // Ignore cases where layer and slice information cannot be determined
        if (!currentLocation || !importLocation) {
          return;
        }

        // Allow imports within the same slice
        if (currentLocation.layer === importLocation.layer && currentLocation.slice === importLocation.slice) {
          return;
        }

        // Report an error if the relative import is crossing different slices
        context.report({
          node,
          messageId: "noRelativePath",
          data: {
            importPath,
          },
        });
      },
    };
  },
};
