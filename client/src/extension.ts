import * as path from 'path';
import { workspace, ExtensionContext, Uri, commands, window } from 'vscode';
import { MemFS } from './fileSystemProvider';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';
import FileUriHandler from './FileUriHandler';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const memFs = new MemFS();
	context.subscriptions.push(
		workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true })
	);
	let initialized = false;

	context.subscriptions.push(
		commands.registerCommand('memfs.reset', async (_) => {
			for (const [name] of (await memFs.readDirectory(Uri.parse('memfs:/')))) {
				memFs.delete(Uri.parse(`memfs:/${name}`));
			}
			initialized = false;
		})
	);

	const uriHandler = new FileUriHandler();
	context.subscriptions.push(window.registerUriHandler(uriHandler));

	context.subscriptions.push(
		commands.registerCommand('memfs.init', (_) => {
			if (initialized) {
				return;
			}
			initialized = true;

			memFs.writeFile(
				Uri.parse(`memfs://authority/testExternalLinks.js`),
				Buffer.from("require('fs');\nrequire('./foo.js');"),
				{ create: true, overwrite: true }
			);
			memFs.writeFile(
				Uri.parse(`memfs://authority/testInternalLinks.js`),
				Buffer.from("require('./foo.js');\nrequire('fs');"),
				{ create: true, overwrite: true }
			);
			memFs.writeFile(Uri.parse(`memfs://authority/foo.js`), Buffer.from('//foo.js'), {
				create: true,
				overwrite: true,
			});
		})
	);

	context.subscriptions.push(
		commands.registerCommand('memfs.workspaceInit', (_) => {
			workspace.updateWorkspaceFolders(0, 0, { uri: Uri.parse('memfs:/'), name: 'MemFS' });
		})
	);

	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'memfs', language: 'javascript' }],
	};

	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
