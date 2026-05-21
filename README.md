# Quill Editor

---

## Library Information

Quill Editor is a lightweight DataFlex wrapper around the QuillJS rich text editor. It adds rich text editing and viewing controls to DataFlex web applications, including formatted text, tables, code sections, images, and HTML output.

The library includes DataFlex controls for editing and rendering rich text, client-side Quill assets, optional image upload handling, and integration points for secure upload processing.

## Features

- Rich text editor control for DataFlex web applications.
- Rich text viewer control for rendering saved editor content.
- Optional image upload support with temporary and committed upload folders.
- Image resizing support.
- Table editing support.
- Code section support with DataFlex syntax highlighting.
- Optional secure upload integration through the Secure Upload library.
- Optional XSS sanitizing dependency for safer HTML handling.

###### External Components

| Component     | Version |
| ------------- | ------- |
| QuillJS       | 2.0.3   |
| Secure Upload | 1.0.0   |
| XSS Sanitizer | 1.1.0   |

## General Information

| Product  | Version                 |
| -------- | ----------------------- |
| DataFlex | 23.0, 24.0, 25.0, 26.0 |

## Repository Structure

- `Library/`: DataFlex library workspace, packages, and web assets.
- `Demo/`: Demo workspaces showing the editor in DataFlex web and FlexTron scenarios.
- `Help/`: Documentation and release-note location.
