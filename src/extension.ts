"use strict";

import * as vscode from "vscode";
import { MemFS } from "./fileSystemProvider";

const write = async (
  fsp: vscode.FileSystemProvider,
  path: string,
  content: string
): Promise<void> => {
  await fsp.writeFile(vscode.Uri.parse(path), Buffer.from(content), {
    create: true,
    overwrite: true,
  });
};

/**
 * Fill virtual file system with some files and folders
 * @param fsp - File system provider
 */
const initFS = async (fsp: vscode.FileSystemProvider): Promise<void> => {
  await write(fsp, "fsp:/file.txt", "File on root level");
  await write(fsp, "fsp:/anotherFile.txt", "Another file on root");
  await write(fsp, "fsp:/thirdFile.txt", "File numero 3 on root");
  await fsp.createDirectory(vscode.Uri.parse("fsp:/directory"));
  await write(fsp, "fsp:/directory/fileInDir.txt", "File in directory");
  await write(fsp, "fsp:/directory/YetAnotherFile.txt", " Another file in dir");
};

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("FileSystemProvider");
  const fsp = new MemFS();

  initFS(fsp);

  // Register file system provider for scheme fsp:
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("fsp", fsp, {
      isCaseSensitive: true,
    })
  );

  /**
   * Test for vscode.workspace.fs.stat()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.stat", async (_) => {
      const name = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
        prompt: "Enter file or directory to run 'stat",
      });
      if (!name) {
        return;
      }
      const uri = vscode.Uri.parse(name);

      const result = await vscode.workspace.fs.stat(uri);

      // Output result
      output.appendLine(
        `File stat for '${uri.toString()}': ${JSON.stringify(result)}`
      );
    })
  );

  /**
   * Test for vscode.workspace.fs.readDirectory()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.readDirectory", async (_) => {
      const directory = await vscode.window.showInputBox({
        value: "fsp:/",
        prompt: "Enter directory to read, e.g. 'fsp:/' or 'fsp:/directory'",
      });
      if (!directory) {
        return;
      }
      const uri = vscode.Uri.parse(directory);

      const result = await vscode.workspace.fs.readDirectory(uri);

      // Output result
      for (const [name, type] of result) {
        output.appendLine(
          `${type === vscode.FileType.File ? "File" : "Directory"}: ${name}`
        );
      }
    })
  );

  /**
   * Test for vscode.workspace.fs.readFile()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.readFile", async (_) => {
      const file = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
      });
      if (!file) {
        return;
      }
      const uri = vscode.Uri.parse(file);

      const result = await vscode.workspace.fs.readFile(uri);

      // Output result
      output.appendLine(`File: '${uri.toString()}', content: '${result}'`);
    })
  );

  /**
   * Test for vscode.workspace.fs.createDirectory()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.createDirectory", async (_) => {
      const directory = await vscode.window.showInputBox({
        value: "fsp:/NewDirectory",
        prompt: "Enter name for new directory",
      });
      if (!directory) {
        return;
      }
      const uri = vscode.Uri.parse(directory);

      await vscode.workspace.fs.createDirectory(uri);

      // Output result
      output.appendLine(`Directory '${uri.toString()}' created`);
    })
  );

  /**
   * Test for vscode.workspace.fs.writeFile()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.writeFile", async (_) => {
      const fileName = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
        prompt: "Enter filename",
      });
      const content = await vscode.window.showInputBox({
        placeHolder: `Enter file content`,
      });
      const uri = vscode.Uri.parse(fileName || "fsp:/file.txt");

      await vscode.workspace.fs.writeFile(uri, Buffer.from(content || ""));

      // Output result
      output.appendLine(`Content '${content}' written to '${uri.toString()}'`);
    })
  );

  /**
   * Test for vscode.workspace.fs.rename()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.rename", async (_) => {
      const source = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
        prompt: "Enter file or directory to rename",
      });
      const target = await vscode.window.showInputBox({
        value: "fsp:/newFile.txt",
        prompt: "Enter new name",
      });
      if (!source || !target) {
        return;
      }
      const sourceUri = vscode.Uri.parse(source);
      const targetUri = vscode.Uri.parse(target);

      await vscode.workspace.fs.rename(sourceUri, targetUri);

      // Output result
      output.appendLine(
        `Renamed from '${sourceUri.toString()}' to '${targetUri.toString()}'`
      );
    })
  );

  /**
   * Test for vscode.workspace.fs.rename()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.copy", async (_) => {
      const source = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
        prompt: "Enter file or directory to copy",
      });
      const target = await vscode.window.showInputBox({
        value: "fsp:/copyFile.txt",
        prompt: "Enter target name",
      });
      if (!source || !target) {
        return;
      }
      const sourceUri = vscode.Uri.parse(source);
      const targetUri = vscode.Uri.parse(target);

      await vscode.workspace.fs.copy(sourceUri, targetUri);

      // Output result
      output.appendLine(
        `'${sourceUri.toString()}' copied to '${targetUri.toString()}'`
      );
    })
  );

  /**
   * Test for vscode.workspace.fs.delete()
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("fsp.delete", async (_) => {
      const name = await vscode.window.showInputBox({
        value: "fsp:/file.txt",
        prompt: "Enter filename or directory to delete",
      });
      if (!name) {
        return;
      }
      const uri = vscode.Uri.parse(name);

      await vscode.workspace.fs.delete(uri);

      // Output result
      output.appendLine(`File '${uri.toString()}' deleted`);
    })
  );

  output.show();
  output.appendLine(
    "File system provider initialized. Use commands 'FSP: Test vscode.workspace.fs.*' to use virtual file system"
  );
}
