# Document Link Use Case

When a document link provided by a language server uses
an external link, the Ctrl + Click do not respect it,
and also open the link as if it there isn't any links provided
by the language server.

## Testing

1. Run the command "MemFS: Setup Workspace" then "MemFS: Create Files";
2. Open the file "test1.js" and click in './example1.js'.
It should open "memfs:/example.1" and also show an error message.
3. Open the file "test2.js" and click in 'fs'.
It should open "memfs:/example2" and also the d.ts file for the "fs" module.
