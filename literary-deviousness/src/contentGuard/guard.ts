import fs from 'fs';
import path from 'path';

const docsDirectory = path.join(__dirname, '../../docs');

function isSafeContent(content: string): boolean {
    // Implement logic to check for unsafe content
    // For example, check for executable code blocks
    return !content.includes('eval(') && !content.includes('exec(');
}

function scanMarkdownFiles(directory: string): void {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${err}`);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            if (fs.statSync(filePath).isDirectory()) {
                scanMarkdownFiles(filePath);
            } else if (file.endsWith('.md')) {
                fs.readFile(filePath, 'utf8', (err, content) => {
                    if (err) {
                        console.error(`Error reading file ${filePath}: ${err}`);
                        return;
                    }

                    if (!isSafeContent(content)) {
                        console.warn(`Unsafe content found in ${filePath}`);
                    }
                });
            }
        });
    });
}

scanMarkdownFiles(docsDirectory);