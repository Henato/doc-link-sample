import { UriHandler, Uri, commands } from 'vscode';

export default class FileUriHandler implements UriHandler {
	async handleUri(uri: Uri): Promise<void> {
		const [, scheme, ...pathParts] = uri.path.split('/');
		const path = pathParts.join('/');
		commands.executeCommand('vscode.open', Uri.parse(`${scheme}://authority/${path}`));
	}
	
}
