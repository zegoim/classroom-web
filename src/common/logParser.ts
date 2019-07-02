import * as fs from "fs";
const LineByLineReader = require("line-by-line");

const key = "ljc";
const keyCharCode = key.split("").map(char => char.charCodeAt(0));
const inputFile = "./test-log.txt";
const inputFileSize = fs.statSync(inputFile).size;
const splitReadSize = 1000;

const outputFile = "./test-log-decode.txt";
let keyIndex = 0;

const getCode = (rawContent: string | number) => {
  const isChar = typeof rawContent === "string";
  const rawCode =  isChar ? (rawContent as string).charCodeAt(0) : rawContent as number;
  return rawCode;
};
const getChar = rawContent => {
  const isChar = typeof rawContent === "string";
  const rawChar =  isChar ? rawContent as string : String.fromCharCode(rawContent as number);
  return rawChar;
};

function decodeStr(content: string | Buffer, keyOffset = 0) {
  let currOffset = keyOffset;
  const contentSize = content.length;
  let decodeStr = "";
  const lines: string[] = [];
  let lineNumb = 0;

  for (let index = 0; index < contentSize; index++) {
    const rawContent = content[index];
    const rawCode = getCode(rawContent);
    const rawChar =  getChar(rawContent);
    const decodeCode = rawCode ^ keyCharCode[(index - currOffset) % keyCharCode.length];
    let decodeChar = String.fromCharCode(decodeCode);

    if (!lines[lineNumb]) {
      lines[lineNumb] = "";
    }
    const isNewLine = (
      rawCode === 13 && getCode(content[index + 1]) === 10
    ) || (
      rawCode === 10 && getCode(content[index - 1]) !== 13
    );
    if (isNewLine) {
      lineNumb += 1;
    } else if (rawCode === 10) {
    } else {
      lines[lineNumb] += rawChar;
    }

    if (rawCode === 13) {
      decodeChar = "";
    }

    // "\n"
    if (rawCode === 10) {
      currOffset = index + 1;
      decodeChar = decodeCode === 105 ? rawChar : decodeChar;
    }

    if (decodeCode === 0 || decodeChar === "\n") {
      decodeChar = rawChar;
    }

    decodeStr += decodeChar;
  }

  return {
    decodeStr,
    keyOffset: currOffset
  };
}

async function getContentBySplit() {
  let prevEnd = 0;
  const proms: Promise<any>[] = [];
  while (prevEnd < (1 ? splitReadSize : inputFileSize)) {
    let currEnd = prevEnd + splitReadSize;
    if (currEnd > inputFileSize) {
      currEnd = inputFileSize;
    }
    const prom = new Promise((resolve, reject) => {
      const rl = fs.createReadStream(inputFile, {
        flags: "r",
        encoding: null,
        start: prevEnd,
        end: currEnd
      });
      let content: Buffer = Buffer.from("");
      rl.on("data", (chunk: Buffer) => {
        content = Buffer.concat([content, chunk]);
      });
      rl.on("end", () => {
        resolve(content);
      });
    });

    proms.push(prom);
    prevEnd = prevEnd + splitReadSize;
  }

  const lines: Buffer[] = await Promise.all(proms);
  // console.log(lines[0].toString());
  console.log(decodeStr(lines[0]).decodeStr);
}

getContentBySplit();
