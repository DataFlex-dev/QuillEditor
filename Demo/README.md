# Quill Editor Demo

This directory contains demo DataFlex workspaces that use the Quill Editor library from the repository `Library` directory.

## Overview

The demo shows how to embed the Quill rich text editor in DataFlex web and FlexTron applications. It includes examples for editing feedback content, viewing saved rich text, enabling tables, enabling code sections, and handling image uploads.

## Workspaces

- `Editor Sample-23.0.sws`: Demo workspace for DataFlex 23.0.
- `Editor Sample-24.0.sws`: Demo workspace for DataFlex 24.0.
- `Editor Sample-25.0.sws`: Demo workspace for DataFlex 25.0.

## Structure

- `AppSrc/`: Contains the source code for the demo applications and views.
- `AppHtml/`: Contains web assets used by the demo application.
- `Data/`: Includes sample data files required for the demo.
- `DDSrc/`: Contains Data Dictionary source files.
- `Programs/`: Contains compiled executable files for the demo application.
- `Libraries/`: Contains demo dependencies, including the vendored Secure Upload library.

## Notable Examples

- `AppSrc/FeedbackCreate.vw`: FlexTron feedback editor example.
- `AppSrc/FeedbackCreateSecure.vw`: FlexTron feedback editor example using Secure Upload.
- `AppSrc/FeedbackCreate.wo`: Web feedback editor example.
- `AppSrc/AddFeedback.wo`: Web application flow for adding rich text feedback.

##### Notes

- `AppHtml/DfEngine` and `AppHtml/CssThemes` should not be included within the demo.

## Getting Started

1. Open the demo workspace that matches your DataFlex version.
2. Ensure the library workspace in `../Library` is available to the demo.
3. Compile and run the demo application.
4. Open the editor and feedback examples to test rich text, tables, code sections, and image handling.

## Requirements

- DataFlex 23.0, 24.0, or 25.0 for the matching demo workspace.
- The Quill Editor library from the repository `Library` directory.
- Secure Upload dependencies when running the secure upload example.

## Support

For library setup details, see `../Library/README.md`.
