//construction
df.WebRichTextViewer = class WebRichTextViewer extends df.WebHtmlBox {
    constructor(sName, oPrnt) {
        super(sName, oPrnt);

        this.prop(df.tBoolean, "pbShowImages", true),
        this.addSync("pbShowImages");
        this.HTMLLoaded = false;
    }
    
    create() {
        super.create();
    }
    openHtml(aHtml) {
        super.openHtml(aHtml);
    }
    closeHtml(aHtml) {
        super.closeHtml(aHtml);
    }
    afterRender() {
        super.afterRender();
        this._eControl.innerHTML = this.psHtml;
        this._eElem.classList.add("ql-snow");
    }
    updateHtml(sValue) {
        var hTempDom = document.createElement('div');
        hTempDom.classList.add("ql-editor");

        hTempDom.innerHTML = sValue;
        hljs.configure({
            languages: hljs.listLanguages()
        });
        hTempDom.querySelectorAll('pre').forEach((block) => {
            hljs.highlightBlock(block);
        });
        this.psHtml = hTempDom.outerHTML;

        if (this._eElem)
            this._eElem.innerHTML = this.psHtml;
    }
};