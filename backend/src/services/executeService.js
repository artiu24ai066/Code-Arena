const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const languages = require("../docker/languages");
const { compileCode } = require("./compilerService");
const { runExecutable } = require("./executionService");

const executeCode = async (
  code,
  language,
  customInput,
  memoryLimit,
  timeLimit
) => {
  const requestId = uuidv4();
  const projectRoot = path.join(__dirname, "../..");

  try {
    const config = languages[language];

    if (!config) {
      throw {
        type: "RUNTIME_ERROR",
        message: "Unsupported language",
      };
    }

    let executable = null;

    if (config.compile) {
      executable = await compileCode(code, language, requestId);
    }

    const result = await runExecutable(
      executable,
      customInput,
      language,
      requestId,
      memoryLimit,
      timeLimit
    );

    return {
      output: result.output,
      executionTime: result.executionTime,
    };
  } catch (error) {
    throw error;
  } finally {
    fs.rmSync(path.join(projectRoot, "temp", requestId), {
      recursive: true,
      force: true,
    });
  }
};

module.exports = {
  executeCode,
};