Use Windows.pkg
Use DFClient.pkg
Use cUserFeedbackDataDictionary.dd
Use DFEntry.pkg
Use cDbLocalWebControlHost.pkg
Use cWebRichTextEditor.pkg

Use cLocalWebResourceManager.pkg

Object oWebResourceManager is a cLocalWebResourceManager 
End_Object 

Deferred_View Activate_oFeedbackCreate for ;
Object oFeedbackCreate is a dbView
    Object oUserFeedback_DD is a cUserFeedbackDataDictionary
    End_Object

    Set Main_DD to oUserFeedback_DD
    Set Server to oUserFeedback_DD

    Set Border_Style to Border_Thick
    Set Size to 324 563
    Set Location to -2 1
    Set Label to "FeedbackCreate"
    Set pbAutoActivate to True

    Object oUserFeedback_Subject is a dbForm
        Entry_Item UserFeedback.Subject
        Set Size to 12 200
        Set Location to 4 67
        Set Label to "Subject:"
    End_Object

    Object oLocalWebControlHost1 is a cDbLocalWebControlHost
        Set Location to 16 4
        Set Size to 306 556
        Set Server to oUserFeedback_DD
        Set pbAreDevToolsEnabled to True
        Set pbAreDefaultScriptDialogsEnabled to False
        Set pbAreDefaultContextMenusEnabled to True

        Procedure OnDefineScriptIncludes String[]  ByRef aScriptHtml
            Forward Send OnDefineScriptIncludes (&aScriptHtml)
            
            Move """ 
                <!-- Quill Editor --> 
                <link href="RichTextEditor/quilljs/quill.snow.css" rel="stylesheet" type="text/css" />
                <link href="RichTextEditor/quilljs/modules/syntax/styles/vs.css" rel="stylesheet" type="text/css" />
                <link href="RichTextEditor/quilljs/modules/table-widget/hover.css" rel="stylesheet" type="text/css" />
                <link href="RichTextEditor/quilljs/modules/table-widget/widget.css" rel="stylesheet" type="text/css" />
                <link href="RichTextEditor/quilljs/modules/resize.css" rel="stylesheet" type="text/css" />
                <script src="RichTextEditor/quilljs/modules/syntax/highlight.pack.js"></script>
                <script src="RichTextEditor/quilljs/quill.min.js"></script>
                <script src="RichTextEditor/quilljs/modules/table-widget/index.js"></script>
                <script src="RichTextEditor/quilljs/modules/image-resize.min.js"></script>
                
                <script src='RichTextEditor/cWebRichTextEditor.js'></script>
                <script src="RichTextEditor/cWebRichTextViewer.js"></script> 
                """ to aScriptHtml[-1] 
        End_Procedure
        
        Object oFeedbackInput is a cWebRichTextEditor
            Set piColumnSpan to 12
            Set pbFillHeight to True
            Set Server to oUserFeedback_DD
            Entry_Item UserFeedback.Input
            
            Set pbAllowShowHtml to True
            Set pbAllowCodeSections to True
            Set pbUseHTMLEncoding to True
            Set pbFroalaTransformer to True
            Set pbAllowImages to True
            Set pbImageResizer to True
            Set pbAllowTables to True
            Set piTableColumns to 10
            Set piTableRows to 10
        End_Object
    End_Object

Cd_End_Object
