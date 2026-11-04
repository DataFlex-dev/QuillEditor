# Quill Editor Library

This directory contains the DataFlex library for the Quill Editor controls and the web assets required by the client-side QuillJS integration.

## Structure

- `AppSrc/`: Contains the DataFlex package source files.
- `AppHtml/RichTextEditor/`: Contains the QuillJS JavaScript, CSS, and module assets that must be available to the web application.
- `Programs/`: Contains compiled output and workspace program files.
- `Quill Editor.sws`: DataFlex package workspace metadata, dependencies, and HTML include list.

## Main Packages

- `AppSrc/cWebRichTextEditor.pkg`: Rich text editor control.
- `AppSrc/cWebRichTextViewer.pkg`: Rich text viewer control for rendering saved HTML content.
- `AppSrc/cWebRichText_Mixin.pkg`: Shared rich text behavior used by editor and viewer controls.
- `AppSrc/cWebQuillFileUpload.pkg`: Image upload handling for Quill content.
- `AppSrc/QuillConstants.pkg`: Defaults and error constants for upload handling.

## Dependencies

The package workspace declares these dependencies:

- `DataFlex-dev/Secure Upload#1.0.0`
- `DataFlex-dev/XSS Sanitizer#1.1.0`

`Secure Upload` is used when `SecureUpload_Included` is defined. Without it, the editor can still compile, but a compiler warning is emitted because uploads are not processed through the secure upload flow.

## HTML Includes

When adding the library manually, include the Quill Editor assets in this order. This order matches `Quill Editor.sws`.

```html
<link href="RichTextEditor/quilljs/quill.snow.css" rel="stylesheet" type="text/css" />
<link href="RichTextEditor/quilljs/modules/syntax/styles/vs.css" rel="stylesheet" type="text/css" />
<link href="RichTextEditor/quilljs/modules/table-widget/hover.css" rel="stylesheet" type="text/css" />
<link href="RichTextEditor/quilljs/modules/table-widget/widget.css" rel="stylesheet" type="text/css" />
<link href="RichTextEditor/quilljs/modules/resize.css" rel="stylesheet" type="text/css" />    
<link href="RichTextEditor/quilljs/modules/syntax/styles/dataflex-studio.css" rel="stylesheet" type="text/css" />
<script src="RichTextEditor/quilljs/modules/syntax/highlight.pack.js"></script>
<script src="RichTextEditor/quilljs/modules/syntax/styles/dataflex.js"></script>
<script src="RichTextEditor/quilljs/quill.min.js"></script>
<script src="RichTextEditor/quilljs/modules/table-widget/index.js"></script>
<script src="RichTextEditor/quilljs/modules/image-resize.min.js"></script>
<script src="RichTextEditor/cWebRichTextEditor.js"></script>
<script src="RichTextEditor/cWebRichTextViewer.js"></script>
```

## Upload Defaults

The editor uses these defaults unless overridden in the application:

- Base directory: `RichTextEditor`
- Upload directory: `Uploads`
- Temporary directory: `temp`
- Maximum file size: `5242880` bytes
- Maximum file name length: `4096` characters
- Temporary upload directory enabled by default.
- Automatic commit disabled by default.

## Getting Started

1. Add this library workspace to your DataFlex application.
2. Ensure the `AppHtml/RichTextEditor` assets are copied to the consuming application's `AppHtml` folder.
3. Add the HTML includes above in the listed order if they are not injected automatically by the package workspace.
4. Use `cWebRichTextEditor.pkg` where users need to edit rich text.
5. Use `cWebRichTextViewer.pkg` where saved rich text content should be rendered.
