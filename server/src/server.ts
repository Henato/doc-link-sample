import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	TextDocumentSyncKind,
	InitializeResult,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position, DocumentLink, Range, DocumentLinkParams } from 'vscode-languageserver';

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			documentLinkProvider: {
				resolveProvider: true,
			},
		},
	};
	return result;
});

connection.onDocumentLinks(async (docLinkParams: DocumentLinkParams) => {
	let result: DocumentLink[] | null = null;
	const document = documents.get(docLinkParams.textDocument.uri);
	if (document) {
		const docText = document.getText();
		const externalLink = 'vscode://nginstack.memfs-doclink-error/memfs/foo.js';
		const internalLink = 'memfs://authority/foo.js';
		if (docText.startsWith("require('fs');\nrequire('./foo.js');")) {
			const range1 = Range.create(Position.create(0, 8), Position.create(0, 12));
			const range2 = Range.create(Position.create(1, 8), Position.create(1, 18));
			result = [
				DocumentLink.create(range1, externalLink),
				DocumentLink.create(range2, externalLink),
			];
		} else if (docText.startsWith("require('./foo.js');\nrequire('fs');")) {
			const range1 = Range.create(Position.create(0, 8), Position.create(0, 18));
			const range2 = Range.create(Position.create(1, 8), Position.create(1, 12));
			result = [
				DocumentLink.create(range1, internalLink),
				DocumentLink.create(range2, internalLink),
			];
		}
	}
	await new Promise((resolve) => setTimeout(resolve, 500));
	return result;
});

connection.onDocumentLinkResolve((docLink: DocumentLink) => {
	return docLink;
});

documents.listen(connection);
connection.listen();
