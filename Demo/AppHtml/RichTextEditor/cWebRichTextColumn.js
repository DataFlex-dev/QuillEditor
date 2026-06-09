function dfRichTextColumnHighlightCodeBlock(block) {
    if (typeof hljs === "undefined") {
        return;
    }

    const sLanguage = block.getAttribute("data-language");

    if (sLanguage && hljs.getLanguage(sLanguage)) {
        block.classList.add("language-" + sLanguage);
    }

    if (typeof hljs.highlightElement === "function") {
        hljs.highlightElement(block);
    } else {
        hljs.highlightBlock(block);
    }
}

df.WebRichTextColumn = class WebRichTextColumn extends df.WebColumn {
    constructor(sName, oParent) {
        super(sName, oParent);

        this.prop(df.tString, "psActiveRowId", "");
        this.prop(df.tInt, "piCollapseMode", 1);

        this.addSync("psActiveRowId");
        this.addSync("piCollapseMode");

        this.event("OnClick", df.cCallModeWait);

        this._aExpandedRows = {};
    }

    cellHtml(sRowId, tCell) {
        const hTempDom = document.createElement("div");
        hTempDom.innerHTML = tCell.sValue;

        const hEditor = hTempDom.firstElementChild;
        if (!hEditor) {
            return "";
        }

        hEditor.classList.add("ql-editor");

        if (typeof hljs !== "undefined") {
            hljs.configure({
                languages: hljs.listLanguages()
            });
        }

        hTempDom.querySelectorAll("pre").forEach((block) => {
            dfRichTextColumnHighlightCodeBlock(block);
        });

        if (this.piCollapseMode === 2) {
            this.expandRow(sRowId, hEditor);
        }

        if (this.piCollapseMode === 1) {
            if (!this.psActiveRowId) {
                this.psActiveRowId = sRowId;
            }

            if (this.psActiveRowId === sRowId) {
                this.expandRow(sRowId, hEditor);
            }
        }

        if (this.piCollapseMode === 3 && this.psActiveRowId === sRowId) {
            this.expandRow(sRowId, hEditor);
        }

        return hTempDom.innerHTML;
    }

    cellClickAfter(oEvent, sRowId, sVal) {
        let hTarget = oEvent.getTarget();

        if (oEvent.e.which !== 1 || window.getSelection().toString().length !== 0) {
            return false;
        }

        try {
            while (hTarget && !hTarget.classList.contains("ql-editor")) {
                if (hTarget.tagName === "A") {
                    this.handleURL(hTarget);
                    return false;
                }
                hTarget = hTarget.parentNode;
            }

            if (!hTarget) {
                return false;
            }
        } catch (ex) {
            return false;
        }

        if (this.pbEnabled) {
            this.fireEx({
                sEvent: "OnClick",
                aParams: [sVal, sRowId],
                fHandler: function(oEvent) {
                    if (!oEvent.bCanceled) {
                        this.afterCellClick(sRowId, hTarget);
                    }
                },
                oEnv: this
            });
        } else {
            this.afterCellClick(sRowId, hTarget);
        }

        return this.pbEnabled;
    }

    afterCellClick(sRowId, hTarget) {
        if (this.piCollapseMode === 3) {
            this.toggleAccordion(sRowId, hTarget);
        }
    }

    handleURL(hLink) {
        hLink.setAttribute("target", "_blank");
        hLink.setAttribute("rel", "noreferrer noopener");
    }

    toggleAccordion(sRowId, hTarget) {
        this.clearAll();

        if (this.psActiveRowId === sRowId) {
            this.psActiveRowId = "";
            return;
        }

        this.psActiveRowId = sRowId;
        this.expandRow(sRowId, hTarget);
    }

    expandRow(sRowId, hTarget) {
        if (!hTarget) {
            return;
        }

        const iBefore = hTarget.clientHeight;
        hTarget.classList.add("Expand");
        const iAfter = hTarget.clientHeight;
        const iExtra = Math.max(iAfter - iBefore, 0);

        this._aExpandedRows[sRowId] = iExtra;
        this.setExtraRowHeight(sRowId, iExtra);
    }

    getTable(hParent) {
        try {
            while (hParent && !(hParent.tagName === "DIV" && hParent.classList.contains("WebList_Table"))) {
                hParent = hParent.parentNode;
            }
        } catch (ex) {
            hParent = null;
        }

        return hParent;
    }

    getCell(sRowId) {
        const oBody = this._oParent?._oBody;

        if (oBody && typeof oBody.cell === "function") {
            const hCell = oBody.cell(sRowId, this._iCol);
            if (hCell) {
                return hCell;
            }
        }

        const hTable = this.getTable(this._eElem);
        return hTable?.querySelector("table[data-dfrowid='" + sRowId + "'] td[data-dfcol='" + this._iCol + "']") || null;
    }

    getEditor(sRowId) {
        const hCell = this.getCell(sRowId);
        return hCell?.querySelector(".ql-editor") || null;
    }

    setExtraRowHeight(sRowId, iExtra) {
        const oBody = this._oParent?._oBody;

        if (oBody && typeof oBody.setExtraRowHeight === "function") {
            oBody.setExtraRowHeight(sRowId, iExtra);
        }
    }

    clearAll() {
        Object.keys(this._aExpandedRows).forEach((sRowId) => {
            const hTarget = this.getEditor(sRowId);
            if (hTarget) {
                hTarget.classList.remove("Expand");
                this.setExtraRowHeight(sRowId, 0);
            }
        });

        this._aExpandedRows = {};
    }

    collapse() {
        this.psActiveRowId = "";
        this.clearAll();
        this.sizeChanged();
    }
};
