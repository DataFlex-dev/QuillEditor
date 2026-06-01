Quill.debug(false);
/*
Create a custom blot for quill which support uuid's which will be used to identify the images.
if an image is deleted then they need to be deleted on the server too.
*/
const InlineBlot = Quill.import("blots/embed");
const Delta = Quill.import("delta");
const Scope = Quill.import("parchment").Scope;
const SyntaxModule = Quill.import("modules/syntax");

const aQuillCodeLanguages = [
    { key: "dataflex", label: "DataFlex" },
    { key: "sql", label: "SQL" },
    { key: "html", label: "HTML" },
    { key: "css", label: "CSS" },
    { key: "javascript", label: "JS" },
    { key: "xml", label: "XML" },
];

if (SyntaxModule?.DEFAULTS) {
    SyntaxModule.DEFAULTS.languages = aQuillCodeLanguages;
}
class DFRichTextImage extends InlineBlot {
    static create(aData) {
        const node = super.create();
        if (Array.isArray(aData)) {
            aData.forEach((oElem) => {
                if (oElem.sName != null)
                    node.setAttribute(oElem.sName, oElem.sValue);
            });
        }
        return node;
    }

    delta() {
        return new Delta().insert({
            DFRichTextImage: {
                uuid: this.domNode.getAttribute("uuid"),
                src: this.domNode.getAttribute("src"),
            },
        });
    }

    static formatsUuid(domNode) {
        return domNode.getAttribute("uuid") || true;
    }

    static formatsSrc(domNode) {
        return domNode.getAttribute("src") || true;
    }

    formats() {
        let formats = super.formats() || [];
        formats["uuid"] = DFRichTextImage.formatsUuid(this.domNode);
        formats["src"] = DFRichTextImage.formatsSrc(this.domNode);
        return formats;
    }

    format(name, value) {
        if (name === "uuid" || name === "src") {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }

    insertAt(index, value, def) {
        if (value.uuid) {
            this.domNode.setAttribute("uuid", value.uuid);
            this.domNode.setAttribute("src", value.src);
        }

        super.insertAt(index, value, def);
    }

    findInstance() {
        try {
            let hScrollBlot = Quill.find(this.domNode);

            // Navigate up to Scroll blot
            while (hScrollBlot.parent) hScrollBlot = hScrollBlot.parent;

            return Quill.find(hScrollBlot.domNode.parentNode);
        } catch (ex) {
            return null;
        }
    }
}

DFRichTextImage.blotName = "DFRichTextImage";
DFRichTextImage.tagName = "img";

Quill.register("formats/imageBlot", DFRichTextImage);
Quill.register("modules/tableWidget", TableWidget);

class DFQuillJSToolbarButton {
    constructor(oOptions) {
        this._oOptions = oOptions;

        this._eElem = document.createElement("span");
        this._eElem.className = "ql-formats";

        this._eButton = document.createElement("button");
        this._eButton.innerHTML = this._oOptions.icon;
        this._eButton.value = this._oOptions.value;

        var that = this;
        this._eButton.onclick = function () {
            that._oOptions.onClick(that._hEditor);
        };

        if (this._oOptions.preRender) this._oOptions.preRender();

        this._eElem.appendChild(this._eButton);

        if (this._oOptions.afterRender) this._oOptions.afterRender();
    }

    attach(hEditor) {
        this._hEditor = hEditor;
        this._hToolbar = this._hEditor.getModule("toolbar");
        this._eToolbar = this._hToolbar.container;
        this._eToolbar.appendChild(this._eElem);
        return this;
    }

    detach() {
        this._eToolbar.removeChild(this._eElem);
        return this;
    }
}

if (df.pnDataFlexVersion > 25.0) {
    console.warn("Please remove the QuillWebFileUpload_Mixin and use the WebFileUpload_Mixin instead.");
}

const QuillWebFileUpload_Mixin = superclass => class extends superclass {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tBool, "pbShowDialog", true);
        this.prop(df.tBool, "pbCapture", false);
        this.prop(df.tString, "psAccept", "");

        //  Events
        this.event("OnUploadFinished", df.cCallModeWait);
    }

    /*
    Initializes an array of File objects, it seeds the internal data structure, triggers an update of 
    display and if needed it starts the upload.
    
    @param  aFiles  FileList array of File objects.
    */
    initFiles(aFiles) {
        if (this._bUploading) {
            return;
        }

        this._aFiles = [];

        //  Seed internal data structure
        for (let i = 0; i < aFiles.length && (this.pbMultiFile || this._aFiles.length < 1); i++) {
            if (this.validate(aFiles[i])) {
                this._aFiles.push({
                    bFinished: false,
                    sResourceId: null,
                    oFile: aFiles[i]
                });
            }
        }

        if (this._aFiles.length > 0) {
            this.displaySelectedFileDetails();

            //  Start processing if needed
            if (this.pbAutoStart) {
                this.startUpload();
            }
        }
    }

    /* 
    Validates the file name against psAccept if psAccept is set. It checks the extension or the mime 
    type manually.
    
    @param  oFile   HTML5 file object.
    @return True if the file is valid according to psAccept.
    */
    validate(oFile) {
        var aAllowed, sAccept, aMime, aFileMime, bExt = false;
        if (this.psAccept) {
            aAllowed = this.psAccept.toLowerCase().split(",");

            for (let i = 0; i < aAllowed.length; i++) {
                sAccept = aAllowed[i].trim();

                if (sAccept.charAt(0) === ".") { // This is an extension
                    if (oFile.name.substr(oFile.name.lastIndexOf("."), sAccept.length).toLowerCase() === sAccept) {
                        return true;
                    }

                    bExt = true;
                } else {
                    if (oFile.type) {
                        aMime = sAccept.split("/");
                        aFileMime = oFile.type.split("/");

                        if (aMime.length > 1 && aFileMime.length > 1 && (aMime[0] === aFileMime[0] || aMime[0] === "*") && (aMime[1] === aFileMime[1] || aMime[1] === "*")) {
                            return true;
                        }
                    }
                }
            }

            //  Make sure that we accept the file if only a mime type filter is set while no mime type is available
            if (!oFile.type && !bExt) {
                return true;
            }
            return false;
        }

        return true;
    }

    /*
    Starts the upload of the selected files.
    
    @client-action
    */
    startUpload() {
        var oOpts = {
            oWO: this,
            aFiles: this._aFiles,
            finished(bSuccess, aFiles) {
                //  Clear file upload control to make sure it will trigger the onchange the next time
                if (this._eInput) {
                    this._eInput.value = "";
                }
            },

            displayStartWorking: this.displayStartWorking,
            displayProgress: this.displayProgress,
            displayFinishWorking: this.displayFinishWorking,
            displayFinished: this.displayFinished
        };

        if (this.pbShowDialog) {
            df.uploadFilesProgressDialog(oOpts);
        } else {
            df.uploadFiles(oOpts);
        }
    }

    // Calls server side upload logic,
    // This is the default implementation, which can be modified to tailor specific classes needs
    // The server side function should always return an array containing the fileIndex and upload key (aka: asResults = [index][fileIndex, key])
    doStartUpload(fCallBack, aRows) {
        //  Send call to initialize upload
        this.serverAction("DoStartUpload", [], df.sys.vt.serialize(aRows), fCallBack);
    }

    /* 
    Replaced by upload logic inside closure!
    
    @client-action
    */
    processUpload() {

    }

    displaySelectedFileDetails() {

    }

    displayStartWorking() {

    }

    displayProgress(iFile, iFiles, iFileLoaded, iFileTotal, iTotalLoaded, iTotal) {

    }

    displayFinishWorking() {

    }

    displayFinished(bSuccess) {

    }

    set_psAccept(sVal) {
        if (this._eInput) {
            this._eInput.accept = sVal;
        }
    }

    set_pbCapture(bVal) {
        if (this._eInput) {
            this._eInput.capture = bVal;
        }
    }
};

class WebRichTextMixin extends QuillWebFileUpload_Mixin(df.WebBaseDEO) { }
//construction
df.WebRichTextEditor = class WebRichTextEditor extends WebRichTextMixin {
    constructor(sName, oPrnt) {
        super(sName, oPrnt);

        this.sVERSION = "1.6.0";
        this.DFERR_QUILL_EDITOR = 5122;

        this.prop(df.tString, "psPlaceholder", "");
        this.prop(df.tString, "psCSSClass", "");
        this.prop(df.tString, "psFonts", "Arial,Courier,Garamond,Tahoma,Times New Roman,Verdana,Inconsolata,Roboto,Mirza,Monospace,Calibri");
        this.prop(df.tString, "psSizes", "8px,9px,10px,11px,12px,13px,14px,16px,18px,20px,22px,24px,26px,28px,30px,32px");
        this.prop(df.tInteger, "piHeight", 150);
        this.prop(df.tBool, "pbUseHTMLEncoding", false);
        this.prop(df.tBool, "pbFroalaTransformer", false);
        this.prop(df.tBool, "pbAllowImages", false);
        this.prop(df.tBool, "pbAllowCodeSections", false);
        this.prop(df.tBool, "pbAllowShowHtml", false);
        this.prop(df.tBool, "pbImageResizer", false);
        this.prop(df.tBool, "pbInlineImages", false);

        this.prop(df.tInt, "piSelStart", 0);
        this.prop(df.tInt, "piSelEnd", 0);
        this.prop(df.tString, "psSelSelection", "");

        this.prop(df.tBool, "pbAllowTables", false);
        this.prop(df.tInt, "piTableColumns", 5);
        this.prop(df.tInt, "piTableRows", 6);

        this.prop(df.tBool, "pbPrivateChanged", false);
        this.addSync("pbPrivateChanged");

        this.event("OnFocus", df.cCallModeDefault);
        this.event("OnBlur", df.cCallModeDefault);
        this.event("OnSelectionChanged", df.cCallModeDefault);

        this._aUploadedImages = [];
    }

    // DF /////////////////////////////////////////////////////////////

    //Base Control
    create() {
        super.create();

        if (this.psVersion !== this.sVERSION)
            throw new df.Error(
                this.DFERR_QUILL_EDITOR,
                "Version number mismatch in the Quill Editor Library.\nClient: {{0}}. \nServer: {{1}}.",
                this,
                [this.sVERSION, this.psVersion]
            );

        //all possible font sizes
        this._aSizes = this.psSizes.split(",");
        this._aFonts = this.psFonts.split(",");

        //check whether the browser supports HTML5
        if (typeof document.createElement("video").canPlayType == "undefined")
            throw new df.Error(
                "Browsers with with HTML versions < 5, are not supported."
            );
    }

    openHtml(aHtml) {
        super.openHtml(aHtml);

        aHtml.push(
            "<div id='editor-container' style='" +
                (this.piHeight == -1
                    ? ""
                    : "height: " + this.piHeight + "px;") +
                "min-height: 150px; width: 100%; z-index: 0;' class='" +
                this._sControlClass +
                "' id='" +
                this._sControlName +
                "-editor' data-dropzone='yes'></div>"
        );
    }

    applyDefaultFontSize(defaultFontSize, toolbarElement) {
        // Delay to ensure Quill is fully initialized
        setTimeout(() => {
            const quillLength = this._hEditor.getLength();
            
            // Apply default font size to the editor's content
            this._hEditor.formatText(0, quillLength, {
                'size': defaultFontSize
            });
            
            // Directly set the font size on the root element
            this._hEditor.root.style.fontSize = defaultFontSize;

            // Update the toolbar dropdown value
            const sizeDropdown = toolbarElement.querySelector("select.ql-size");
            if (sizeDropdown) {
                sizeDropdown.value = defaultFontSize;
                sizeDropdown.dispatchEvent(new Event("change")); // Sync toolbar dropdown
            }

            // Force Quill to update, re-rendering with the new style
            this._hEditor.update();
        }, 0);
    }

    initEditor() {
        this.setupQuillInstance();

        if (this._hEditor) {
            this._hEditor.getModule("toolbar").container.setAttribute("tabindex", "-1");
            this.setControlValue(this.psValue);
            if (this.pbAllowImages) {
                this.fetchImages();
            }
            this.clearHistory();
        }

        this.sizeChanged();
    }

    afterRender() {
        this._eControl = this._eElem.querySelector("#editor-container");

        super.afterRender();

        df.dom.on("focus", this._eControl, this.focus, this);
        df.dom.on("keydown", this._eControl, this.keyDown, this);
    }

    afterShow() {
        super.afterShow();

        // Attach focus events to the editor container
        this.initEditor();
    }

    afterHide() {
        super.afterHide();

        this._eControlWrp.removeChild(this._hEditor?.getModule("toolbar")?.container);
	}

    /*
    Use focusin and focusout which bubble up the dom tree and pass _eElem.
    */
    attachFocusEvents() {
        df.dom.on("focusin", this._eElem, this.onFocus, this);
        df.dom.on("focusout", this._eElem, this.onBlur, this);
    }

    getControlValue() {
        let sNodeHtml = "";
        // We don't want to modify the original.
        if (this._hEditor?.getSemanticHTML().replace("\n", "").length > 0) {
            sNodeHtml = this._hEditor.getSemanticHTML();
            if (!this.pbInlineImages) {
                function removeSrcFromNode(hNode) {
                    let eHtml = document.createElement("div");
                    eHtml.innerHTML = hNode;
                    let aImages = eHtml.querySelectorAll("img[uuid]");
                    for (let i = 0; i < aImages.length; i++)
                        aImages[i].removeAttribute("src");
                    return eHtml.innerHTML;
                }
                sNodeHtml = removeSrcFromNode(sNodeHtml);
            }
            if (this.pbUseHTMLEncoding) sNodeHtml = this.encodeHtml(sNodeHtml);
        }
        return sNodeHtml;
    }

    setControlValue(sVal) {
        if (this.pbUseHTMLEncoding) sVal = this.decodeHtml(sVal);

        /*
        copy the html code into a local object to parse it into a dom object.
        using this look for all img tags and take the uuid property from them.
        add them to an array.
        */
        let hTempContainer = document.createElement("div");
        hTempContainer.innerHTML = sVal.trim();

        this.psValue = this.pbFroalaTransformer ? this.transformFroalaHtml(hTempContainer.innerHTML) : hTempContainer.innerHTML;
        if (this._hEditor) {
            const delta = this._hEditor.clipboard.convert({ html: this.psValue });
            this._hEditor.setContents(delta);
            this._sOrigValue = this.getControlValue();
            if (this.pbAllowImages) this.fetchImages();
            this.clearHistory();
        }
    }

    getServerVal(){
        return this.getControlValue();
    }

    // Augment height calculation to take toolbar into account
    getVertHeightDiff() {
        let iHeight = super.getVertHeightDiff();

        const eToolbar = this._hEditor?.getModule("toolbar")?.container;
        if (eToolbar) {
            iHeight += df.sys.gui.getVertBoxDiff(eToolbar, 3);
            iHeight += eToolbar.getBoundingClientRect().height;
        }

        return iHeight;
    }

    clear() {
        this.setControlValue("");
        this.clearHistory();
    }

    // Propperties ////////////////////////////////////////////////////

    get_pbPrivateChanged() {
        if (!this._hEditor) {
            return false;
        }
        return (
            this._hEditor.history.stack.undo.length > 0 ||
            this._hEditor.history.stack.redo.length > 0
        );
    }

    set_pbEnabled(bValue) {
        this.pbEnabled = bValue;
        this._hEditor?.enable(bValue);
    }

    // Encoding //////////////////////////////////////////////////////////

    transformFroalaHtml(sHtml) {
        let iPos = 0;

        while (true) {
            let iPosSurrounded = sHtml.indexOf("<br></p>", iPos);
            iPos = sHtml.indexOf("<br>", iPos);

            if (iPos == -1) break;

            if (iPosSurrounded === iPos) {
                iPos += 4;
                continue;
            }

            sHtml =
                sHtml.substring(0, iPos) +
                "<p><br></p>" +
                sHtml.substring(iPos + "<br>".length);
            iPos += "<p><br></p>".length;
        }

        return sHtml.replace(/<em>/g, "").replace(/<\/em>/g, "");
    }

    encodeHtml(sHtml) {
        return sHtml.replace(/./gm, (s) =>
            s.charCodeAt(0) > 127 ? "&#" + s.charCodeAt(0) + ";" : s
        );
    }

    decodeHtml(sHtml) {
        return sHtml?.replace(/(&#(\d+);)/g, (m, c, charCode) =>
            String.fromCharCode(charCode)
        );
    }

    // QuillJS ////////////////////////////////////////////////////////

    makeQuillInlineCSS() {
        // configure Quill to use inline styles so the email's format properly
        const DirectionAttribute = Quill.import(
            "attributors/attribute/direction"
        );
        Quill.register(DirectionAttribute, true);

        const AlignClass = Quill.import("attributors/class/align");
        Quill.register(AlignClass, true);

        const BackgroundClass = Quill.import("attributors/class/background");
        Quill.register(BackgroundClass, true);

        const ColorClass = Quill.import("attributors/class/color");
        Quill.register(ColorClass, true);

        const DirectionClass = Quill.import("attributors/class/direction");
        Quill.register(DirectionClass, true);

        const AlignStyle = Quill.import("attributors/style/align");
        Quill.register(AlignStyle, true);

        const BackgroundStyle = Quill.import("attributors/style/background");
        Quill.register(BackgroundStyle, true);

        const ColorStyle = Quill.import("attributors/style/color");
        Quill.register(ColorStyle, true);

        const DirectionStyle = Quill.import("attributors/style/direction");
        Quill.register(DirectionStyle, true);

        const Font = Quill.import("attributors/style/font");
        Font.whitelist = df.WebRichTextEditor._initializedFontsList;
        Quill.register(Font, true);

        const Size = Quill.import("attributors/style/size");
        Size.whitelist = df.WebRichTextEditor._initializedSizesList;
        Quill.register(Size, true);
    }

    getFontName(font) {
        return font.toLowerCase().replace(/\s/g, "-");
    }

    addQuillFonts() {
        // Initialize global collection.
        if (!df.WebRichTextEditor._initializedFonts) {
            df.WebRichTextEditor._initializedFonts = {};
            df.WebRichTextEditor._initializedFontsList = [];
        }

        // add fonts to style
        let fontStyles = "";
        this._aFonts.forEach((font) => {
            const fontName = this.getFontName(font);

            // Skip if already added.
            if (df.WebRichTextEditor._initializedFonts[fontName]) return;

            fontStyles +=
                ".ql-snow .ql-picker.ql-font .ql-picker-label[data-value=" +
                fontName +
                "]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=" +
                fontName +
                "]::before {" +
                "content: '" +
                font +
                "';" +
                "font-family: '" +
                font +
                "', sans-serif;" +
                "}" +
                ".ql-font-" +
                fontName +
                "{" +
                " font-family: '" +
                font +
                "', sans-serif;" +
                "}";

            df.WebRichTextEditor._initializedFontsList.push(fontName);
        });

        let node = document.createElement("style");
        node.innerHTML = fontStyles;
        document.body.appendChild(node);
    }

    addQuillSizes() {
        // Initialize global collection.
        if (!df.WebRichTextEditor._initializedSizes) {
            df.WebRichTextEditor._initializedSizes = {};
            df.WebRichTextEditor._initializedSizesList = [];
        }

        // add fonts to style
        let sizeStyles = "";
        this._aSizes.forEach(function (size) {
            // Skip if already added.
            if (df.WebRichTextEditor._initializedSizes[size]) return;

            sizeStyles +=
                '.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="' +
                size +
                '"]::before, .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="' +
                size +
                '"]::before {';
            sizeStyles += 'content: "' + size + '";';
            sizeStyles += "}";

            df.WebRichTextEditor._initializedSizesList.push(size);
        });

        let node = document.createElement("style");
        node.innerHTML = sizeStyles;
        document.body.appendChild(node);
    }

    // KeyDown
    keyDown(oEvent) {
        var that = this;
        if (oEvent.e.key == "V" && oEvent.e.shiftKey && oEvent.e.ctrlKey) {
            oEvent.stop();
            navigator.clipboard.readText().then((text) => {
                that.pastePlain(text);
            });
        }

        // Custom backspace behavior ONLY when editor is empty and cursor at start
        if (oEvent.e.key === "Backspace" && this._hEditor) {
            const range = this._hEditor.getSelection();
            // Quill usually has length 1 when it's empty (just "\n")
            const isEmpty = this._hEditor.getLength() <= 1;

            if (range && range.index === 0 && range.length === 0 && isEmpty) {
                oEvent.stop();  // prevent browser default
                this._eControlWrp.removeChild(this._hEditor.getModule("toolbar").container);
                this.setupQuillInstance();
                this.setControlValue("");
            }
        }
    }

    pastePlain(sText) {
        const range = this._hEditor.getSelection();
        const delta = new Delta()
            .retain(range.index)
            .delete(range.length)
            .insert(sText.replace(/^\t/gm, ""));
        const index = sText.length + range.index;
        this._hEditor.updateContents(delta, "silent");
        this._hEditor.setSelection(index, 0, "silent");
    }

    clearHistory() {
        // This function is needed with a timeout since we commonly set the text and get it using the innerHTML
        // Quill get's this as a change event which happends after.
        // As such we need to timeout this as an event too.
        const timeOut = setTimeout(() => {
            this._hEditor?.history.clear();
            clearTimeout(timeOut);
        }, 0);
    }

    setupQuillInstance() {
        this.addQuillFonts();
        this.addQuillSizes();

        // Needs to call after; uses a global whitelist.
        this.makeQuillInlineCSS();

        let additionalFeatures = [];
        let oSyntaxConfig = false;
        if (this.pbAllowImages) additionalFeatures.push("image");
        if (this.pbAllowCodeSections) {
            hljs.configure({
                languages: hljs.listLanguages(),
            });
            oSyntaxConfig = {
                hljs,
                languages: aQuillCodeLanguages,
            };
            additionalFeatures.push("code-block");
        }

        this._hEditor = new Quill(this._eControl, {
            modules: {
                // Code highlight
                syntax: oSyntaxConfig,
                resize: this.pbImageResizer ? {
                    // set embed tags to capture resize
                    embedTags: ["VIDEO", "IFRAME", "IMG"],
                    parchment: {
                        DFRichTextImage: {
                            attribute: ["width"],
                            limit: {
                                minWidth: 100
                            }
                        },
                    },
                    // custom toolbar
                    tools: [
                      "left",
                      "center",
                      "right",
                      "full",
                      "edit",
                      {
                        text: "Alt",
                        verify(activeEle) {
                          return activeEle && activeEle.tagName === "IMG";
                        },
                        handler(evt, button, activeEle) {
                          let alt = activeEle.alt || "";
                          alt = window.prompt("Alt for image", alt);
                          if (alt == null) return;
                          activeEle.setAttribute("alt", alt);
                        },
                      },
                    ],
                  } : null,
                // Office paste for list and dotted lists
                clipboard: {
                    matchers: [
                        ["p.MsoListParagraphCxSpFirst", this.MatcherMsWordList],
                        [
                            "p.MsoListParagraphCxSpMiddle",
                            this.MatcherMsWordList,
                        ],
                        ["p.MsoListParagraphCxSpLast", this.MatcherMsWordList],
                    ],
                },
                // ctrl+z functionality, etc.
                history: {
                    delay: 2000,
                    maxStack: 500,
                    userOnly: true,
                },
                table: this.pbAllowTables,
                tableWidget: this.pbAllowTables ? {
                            toolbarOffset: -1,
                            maxSize: [this.piTableColumns, this.piTableRows],
                } : null,
                toolbar: {
                    handlers: {
                        // Image upload handle
                        image: this.imageButtonHandler.bind(this),
                    },
                    container: [
                        [
                            {
                                font: this._aFonts.map((font) =>
                                    this.getFontName(font)
                                ),
                            },
                            { size: this._aSizes },
                        ],
                        [
                            "bold",
                            "italic",
                            "underline",
                            "strike",
                            { color: [] },
                            { background: [] },
                        ],

                        [
                            { list: "ordered" },
                            { list: "bullet" },
                            { indent: "-1" },
                            { indent: "+1" },
                        ],
                        [{ script: "sub" }, { script: "super" }, { align: [] }],

                        ["link", "blockquote"],

                        additionalFeatures,
                    ],
                },
                keyboard: {
                    bindings: {
                        handleEnter: {
                            key: "Enter",
                            handler: (range, context) => {
                                const lineFormats = Object.keys(context.format).reduce(
                                    (formats, format) => {
                                    if (
                                        this._hEditor.scroll.query(format, Scope.BLOCK) &&
                                        !Array.isArray(context.format[format])
                                    ) {
                                        formats[format] = context.format[format];
                                    }
                                    return formats;
                                    },
                                    {},
                                );

                                const delta = new Delta()
                                    .retain(range.index)
                                    .delete(range.length)
                                    .insert("\n", lineFormats);
                                this._hEditor.updateContents(delta, Quill.sources.USER);
                                this._hEditor.setSelection(range.index + 1, Quill.sources.SILENT);

                                // NOTE: Changed from default handler!
                                // Applies previous formats on the new line. This was dropped in
                                // https://github.com/slab/quill/commit/ba5461634caa8e24641b687f2d1a8768abfec640
                                Object.keys(context.format).forEach((name) => {
                                    if (lineFormats[name] != null) return;
                                    if (Array.isArray(context.format[name])) return;
                                    if (name === "code" || name === "link") return;
                                    this._hEditor.format(
                                    name,
                                    context.format[name],
                                    Quill.sources.USER,
                                    );
                                });
                            },
                        },
                    },
                },
            },
            placeholder: this.psPlaceholder,
            theme: "snow",
        });

        this.applyDefaultFontSize("13px", this._hEditor.getModule("toolbar").container);

        let that = this;
        this._hEditor.clipboard.addMatcher("img", function (node, delta) {
            const attribute = that.pbInlineImages ? "src" : "uuid";
            if (node.getAttribute(attribute)) {
                return delta.compose(
                    new Delta().retain(delta.length(), {
                        [attribute]: node.getAttribute(attribute)
                    })
                );
            }
            return delta;
        });

        if (this.pbAllowShowHtml) this.createHtmlEditorButton();

        this._hEditor.ref = this;
        this._hEditor.root.addEventListener(
            "paste",
            this.handlePaste.bind(this),
            false
        );

        this._hEditor.on("selection-change", (range, oldRange, source) => {
            if (!range) {
                range = {
                    index: 0,
                    length: 0,
                };
            }
            that.piSelStart = range.index;
            that.piSelEnd = range.index + range.length;
            that.addSync("piSelStart");
            that.addSync("piSelEnd");
            that.addSync("psSelection");
            that.fire("OnSelectionChanged");
        });
        
        this._hEditor.on('text-change', function (delta, old, source) {
            if (that._hEditor.getLength() > that.piMaxLength) {
                that._hEditor.deleteText(that.piMaxLength, that._hEditor.getLength());
            }

        });

        if (this.pbAllowImages) {
            this._hEditor.container.addEventListener(
                "dragover",
                {
                    handleEvent: this.dragOverEventHandler.bind(this),
                },
                true
            );

            this._hEditor.container.addEventListener(
                "drop",
                {
                    handleEvent: this.dropEventHandler.bind(this),
                },
                true
            );
        }

        this.set_pbEnabled(this.pbEnabled);
    }

    createHtmlEditorButton() {
        let hContext = this;

        hContext._htmlBtn = new DFQuillJSToolbarButton({
            icon: `<button title="Show HTML" style="margin-left: -5px; margin-top: -3px; width: 45px;">HTML</button>`,
            preRender() {
                // create  a text area taking the innerhtml of the editor.
                this._hHtmlBox = document.createElement("textarea");
                this._hHtmlBox.className = "RichTextHTMLViewer";
                this._hHtmlBox.style.cssText =
                    "resize: none;width: 100%;height: 100%;margin: 0px;box-sizing: border-box;color: black;font-size: 15px;outline: none;padding: 20px;line-height: 24px;font-family: Consolas, Menlo, Monaco, &quot;Courier New&quot;, monospace;position: absolute;top: 0;bottom: 0;border: none;display:none";
                this._hHtmlBox.style.display = "none";

                hContext._hEditor
                    .addContainer("ql-custom")
                    .appendChild(this._hHtmlBox);
                //  update the textarea's contents when a text_change occurs.
                hContext._hEditor.on(
                    "text-change",
                    () =>
                        (this._hHtmlBox.value =
                            hContext._hEditor.root.innerHTML)
                );
            },
            onClick(hEditor) {
                if (!hContext.pbEnabled) return;
                if (this.bShow == null)
                    // set default;
                    this.bShow = true;
                else this.bShow = !this.bShow;

                if (this.bShow) this._hHtmlBox.value = hEditor.root.innerHTML;
                else hEditor.root.innerHTML = this._hHtmlBox.value;
                this._hHtmlBox.style.display = this.bShow ? "" : "none";
            },
        }).attach(hContext._hEditor);
    }

    //this is a custom matcher for clipboard lists from word, it fixes the format for quill.
    MatcherMsWordList(hNode, hDelta) {
        // Clone the operations
        let aOps = [...hDelta.ops];

        // Trim \t
        aOps.forEach((hOp) => {
            hOp.insert = hOp.insert.trimLeft();
        });
        // Determine the list type
        const eListType = aOps[0].insert.match(/\S+\./) ? "ordered" : "bullet";
        // if ordered remove '*.' from ops
        if (eListType === "ordered") aOps.shift();

        // Trim the newline off the last op
        let hLastOp = aOps[aOps.length - 1];
        hLastOp.insert = hLastOp.insert.substring(0, hLastOp.insert.length - 1);

        // Determine the list indent
        const eStyle = hNode.getAttribute("style").replace(/\n+/g, "");
        const bLevelMatch = eStyle.match(/level(\d+)/);
        const iIndent = bLevelMatch ? bLevelMatch[1] - 1 : 0;

        // Add the list attribute
        aOps.push({
            insert: "\n",
            attributes: { list: eListType, indent: iIndent },
        });

        return new Delta(aOps);
    }

    // Image support ////////////////////////////////////////////////////

    fetchImages() {
        //requests all image links and adds the link to the src of each corresponding image.
        this.serverAction(
            "RequestImageLink",
            [],
            null,
            function (oEvent) {
                const aUris = oEvent.sReturnValue.split("\n").map(item => {
                    let [ sUuid, sUrl ] = item.split(";");
                    return { sUuid, sUrl };
                });

                for (let item of aUris) {
                    let eElem = this._hEditor.root.querySelector(
                        '[uuid="' + item.sUuid + '"]'
                    );
                    if (eElem) eElem.setAttribute("src", item.sUrl);
                }

                this.sizeChanged();
            },
            this
        );
    }

    // Image support - Handlers /////////////////////////////////////////
    dragOverEventHandler(oEvent) {
        if (!this.pbEnabled) return;

        if (oEvent.dataTransfer && this.getDroppedImageFiles(oEvent.dataTransfer).length > 0) {
            oEvent.preventDefault();
            oEvent.dataTransfer.dropEffect = "copy";
        }
    }

    dropEventHandler(oEvent) {
        if (!this.pbEnabled) return;

        if (typeof oEvent.clipboardData !== "undefined") return;

        const aFiles = this.getDroppedImageFiles(oEvent.dataTransfer);
        if (aFiles.length === 0) {
            this.handleDroppedHtml(oEvent.dataTransfer.items);
            return;
        }

        oEvent.preventDefault();
        oEvent.stopPropagation();
        df.dragdrop.stopDropZones(true);
        this._hEditor.focus();
        this.imageHandler(aFiles);
    }

    handleDroppedHtml(aItems) {
        for (let i = 0; aItems && i < aItems.length; i++) {
            if (aItems[i].kind === "string" && aItems[i].type.match(/^text\/html/)) {
                aItems[i].getAsString((html) => {
                    this._hEditor.clipboard.dangerouslyPasteHTML(
                        this._hEditor.getText().length,
                        html
                    );
                });
            }
        }
    }

    getDroppedImageFiles(oDataTransfer) {
        const aImages = [];

        for (let i = 0; oDataTransfer.files && i < oDataTransfer.files.length; i++) {
            if (oDataTransfer.files[i].type.split("/")[0] === "image") {
                aImages.push(oDataTransfer.files[i]);
            }
        }

        for (let i = 0; oDataTransfer.items && i < oDataTransfer.items.length; i++) {
            if (oDataTransfer.items[i].kind === "file" && oDataTransfer.items[i].type.split("/")[0] === "image") {
                const oFile = oDataTransfer.items[i].getAsFile();
                if (oFile && aImages.indexOf(oFile) === -1) aImages.push(oFile);
            }
        }

        return aImages;
    }

    // Handler for the image button in the toolbar
    imageButtonHandler() {
        //if the toolbar button is pressed.
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.onchange = () => this.imageHandler(input.files);
        input.click();
    }

    // Paste handler to add an image with an uuid via the clipboard.
    handlePaste(oEvent) {
        // When files are pasted read all the files as (class)File.
        function readFiles(aFiles) {
            let _aFiles = [];
            [].forEach.call(aFiles, (hFile) => {
                if (hFile["type"].split("/")[0] === "image") {
                    const f = hFile.getAsFile();
                    if (f) _aFiles.push(f);
                }
            });
            return _aFiles;
        }

        const aTypes = oEvent.clipboardData.types;
        if (aTypes.includes("Files")) {
            oEvent.stopPropagation();
            oEvent.preventDefault();
            if (
                oEvent.clipboardData &&
                oEvent.clipboardData.items &&
                oEvent.clipboardData.items.length
            ) {
                var aImages = readFiles(oEvent.clipboardData.items);
                if (aImages) {
                    this.imageHandler(aImages);
                }
            }
        }
    }

    imageHandler(aFiles) {
        this.initFiles(aFiles);
        this.startUpload();
    }

    displayFinished(bSuccess) {
        if (!bSuccess) return;
        let that = this;
        for (let i = 0; i < this._aFiles.length; i++) {
            const oFile = this._aFiles[i];
            if (oFile.sFinishedResult) {
                if (FileReader) {
                    const fr = new FileReader();
                    fr.onload = () => {
                        that._hEditor.insertEmbed(
                            that._hEditor.getSelection(true)?.index || that._hEditor.getLength(),
                            "DFRichTextImage",
                            [
                            { sName: "uuid", sValue: that._aUploadedImages[i] },
                            { sName: "src", sValue: fr.result },
                            ],
                            that
                    );
                    };
                    fr.readAsDataURL(oFile.oFile);
                }
            }
        }
        this.sizeChanged();
    }

    imageUploaded(sFileName) {
        this._aUploadedImages.push(sFileName);
    }

    // Selection support ///////////////////////////////////////////////

    insertPlainTextatCursor(sText) {
        this.pastePlain(sText);
    }

    get_psSelection() {
        return this._hEditor.getText(
            this.piSelStart,
            this.piSelEnd - this.piSelStart
        );
    }

    setSelection(iStartSelection, iEndSelection) {
        const selStart = parseInt(iStartSelection);
        const selEnd = parseInt(iEndSelection);
        this._hEditor.setSelection(selStart, selEnd - selStart, "user");
    }

    // Focus support ///////////////////////////////////////////////////

    onBlur(oEv) {
        // check to make sure the OnBlur is not triggered when clicking any of the child objects
        // of this._eElem
        if (!this._eElem.contains(oEv.e.relatedTarget)) {
            this._hEditor.blur();
            this.fire("OnBlur");
        }
    }

    onFocus(oEv) {
        // check to make sure the OnFocus is not triggered when clicking any of the child objects
        // of this._eElem
        if (!this._eElem.contains(oEv.e.relatedTarget)) {
            this._hEditor.focus();
            this.fire("OnFocus");
        }
    }
};
