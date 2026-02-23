import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export class Markdown {
  private chunks: string[] = [];
  private headings: { text: string; level: number }[] = [];
  private returnType: 'string' | 'buffer' = 'string';

  private addChunk(chunk: string, EOLCount: number = 1) {
    this.chunks.push(chunk + EOL.repeat(EOLCount));
  }

  addHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) {
    if (level < 1 || level > 6) {
      console.error('Heading level must be between 1 and 6');

      level = 1;
    }

    this.headings.push({ text, level });
    this.addChunk(`${'#'.repeat(level)} ${text}`, 2);

    return this;
  }

  addText(text: string, newLine: boolean = true) {
    this.addChunk(text, newLine ? 2 : 1);

    return this;
  }

  addQuote(text: string) {
    this.addChunk(`> ${text}`, 2);

    return this;
  }

  addDivider() {
    this.addChunk('---', 2);

    return this;
  }

  addList(items: string[], ordered: boolean = false, indent: number = 0) {
    items.forEach((item, i) => {
      const prefix = ordered ? `${i + 1}.` : '-';
      this.addChunk(`${' '.repeat(indent * 2)}${prefix} ${item}`);
    });

    this.addChunk('');

    return this;
  }

  addChecklist(items: { text: string; checked?: boolean }[], indent: number = 0) {
    items.forEach(({ text, checked }) => {
      this.addChunk(`${' '.repeat(indent * 2)}- [${checked ? 'x' : ' '}] ${text}`);
    });

    this.addChunk('');

    return this;
  }

  addInlineCode(code: string) {
    this.addChunk(`\`${code}\``, 0);

    return this;
  }

  addCodeBlock(code: string, language: string = '') {
    this.addChunk(`\`\`\`${language}${EOL}${code}${EOL}\`\`\``, 2);

    return this;
  }

  addTable(headers: string[], rows: string[][]) {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map((row) => `| ${row.join(' | ')} |`).join(EOL);

    this.addChunk(`${headerRow}${EOL}${separatorRow}${EOL}${dataRows}`, 2);

    return this;
  }

  clear() {
    this.chunks = [];
    this.returnType = 'string';

    return this;
  }

  setReturnType(type: typeof this.returnType) {
    this.returnType = type;

    return this;
  }

  output() {
    const content = this.chunks.join('');

    return this.returnType === 'buffer' ? Buffer.from(content) : content;
  }

  async writeToFile(filePath: string) {
    await writeFile(filePath, this.output(), 'utf-8');
  }

  toReadableStream() {
    const iterator =
      this.returnType === 'buffer' ? this.chunks.map((c) => Buffer.from(c)) : this.chunks;

    return Readable.from(iterator);
  }

  async pipeTo(writable: NodeJS.WritableStream) {
    return await pipeline(this.toReadableStream(), writable);
  }

  writeToFileStream(filePath: string) {
    const fileStream = createWriteStream(filePath);

    return this.pipeTo(fileStream);
  }
}

export const md = new Markdown();
