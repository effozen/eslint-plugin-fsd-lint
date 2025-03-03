export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforces ordered imports by Feature-Sliced Design (FSD) layers.",
      recommended: true,
    },
    messages: {
      incorrectGrouping:
        "🚨 '{{ currentImport }}' import is not correctly grouped. Keep imports ordered by layer.",
    },
    fixable: "code",
  },

  create(context) {
    return {
      Program(node) {
        const importNodes = node.body.filter(statement => statement.type === "ImportDeclaration");

        if (importNodes.length === 0) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const sourceText = sourceCode.getText();
        const sourceLines = sourceText.split("\n");

        // ✅ FSD Layer order (top to bottom)
        const layers = ["app", "processes", "pages", "widgets", "features", "entities", "shared"];

        // Group imports by FSD layer
        const groupedImports = layers.reduce((acc, layer) => {
          acc[layer] = [];
          return acc;
        }, {});

        // Imports that are NOT part of the FSD structure
        const nonFSDImports = [];

        // Retrieve all comments
        const allComments = sourceCode.getAllComments ?
          sourceCode.getAllComments() :
          sourceCode.getComments(node).leading.concat(sourceCode.getComments(node).trailing);

        // Store the start position of the first import and the end position of the last import
        const firstImportStart = importNodes[0].range[0];
        const lastImportEnd = importNodes[importNodes.length - 1].range[1];

        // Process each import node along with preceding comments and empty lines
        for (let i = 0; i < importNodes.length; i++) {
          const importNode = importNodes[i];
          const importPath = importNode.source.value;

          // Get the end position of the previous node (or file start if it's the first node)
          const prevNodeEnd = i > 0 ? importNodes[i-1].range[1] : 0;

          // Retrieve all text between previous node and current node (including empty lines and comments)
          let precedingText = "";
          if (i === 0) {
            // If it's the first import, get the text from the file start to the import start
            const startLine = importNode.loc.start.line;
            let relevantStart = 0;

            // Identify relevant empty lines and comments before the first import
            for (let line = startLine - 1; line >= 1; line--) {
              const lineText = sourceLines[line - 1];
              // Stop if encountering meaningful code (not an import, comment, or empty line)
              if (lineText.trim() !== "" &&
                !lineText.trim().startsWith("//") &&
                !lineText.trim().startsWith("/*") &&
                !lineText.trim().startsWith("*")) {
                break;
              }
              relevantStart = sourceLines.slice(0, line - 1).join("\n").length;
              if (line > 1) relevantStart += 1; // Consider newline character
            }

            if (relevantStart > 0) {
              precedingText = sourceText.substring(relevantStart, importNode.range[0]);
            }
          } else {
            // Otherwise, retrieve text between the previous import and the current import
            precedingText = sourceText.substring(prevNodeEnd, importNode.range[0]);
          }

          // Import text
          const importText = sourceCode.getText(importNode);

          // Combined text (including empty lines, comments, and import statement)
          const combinedText = precedingText + importText;

          // Classify imports based on FSD layers
          const layer = layers.find(l => importPath.includes(`/${l}/`));

          if (layer) {
            groupedImports[layer].push({ node: importNode, text: combinedText });
          } else {
            nonFSDImports.push({ node: importNode, text: combinedText });
          }
        }

        // Generate sorted imports by layer
        const sortedImports = layers.flatMap(layer => groupedImports[layer]);

        // Place non-FSD imports at the top
        const finalImportOrder = [...nonFSDImports, ...sortedImports];

        // Construct the final sorted import block
        let sortedImportText = "";

        finalImportOrder.forEach((item, index) => {
          if (index === 0) {
            // Remove unnecessary leading newlines for the first import block
            sortedImportText += item.text.trimStart();
          } else {
            sortedImportText += item.text;
          }
        });

        // Extract original import block text
        const originalText = sourceText.substring(firstImportStart, lastImportEnd);

        // Check if a change is needed
        if (originalText.trim() !== sortedImportText.trim()) {
          context.report({
            node: importNodes[0],
            messageId: "incorrectGrouping",
            data: {
              currentImport: importNodes[0].source.value,
            },
            fix(fixer) {
              return fixer.replaceTextRange([firstImportStart, lastImportEnd], sortedImportText);
            },
          });
        }
      },
    };
  },
};
