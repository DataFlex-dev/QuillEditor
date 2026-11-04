/*
 * DataFlex language grammar for highlight.js
 * Based on the official DataFlex.lng syntax definition from Data Access Worldwide
 * Used in DataFlex Studio IDE
 */
hljs.registerLanguage('dataflex', function(hljs) {

    var KEYWORDS = [
        'a', 'Abort', 'Abort_Transaction', 'Activate_View', 'Add', 'Address', 'All',
        'AmbiguousFunctions', 'an', 'Append', 'Append_Output', 'as', 'Attach',
        'Between', 'BigInt', 'Boolean', 'Break', 'Broadcast', 'Broadcast_Focus',
        'by', 'ByRef', 'Call_Driver', 'CallStackDump', 'Case', 'Case_Begin', 'Case_End',
        'Cd_End_Object', 'channel', 'Char', 'Clear', 'Close', 'Close_Input', 'Close_Output',
        'CompilerWarnings', 'CompilerLevelWarning', 'Constrain', 'Constrained_Clear',
        'Constrained_Find', 'Constraint_Set', 'Constraint_Validate', 'Copy_db',
        'Copy_Records', 'CopyFile', 'Create_Field', 'Create_Index', 'Currency',
        'Date', 'DateTime', 'Decimal', 'Declare_Datafile', 'Decrement', 'Define',
        'Delegate', 'Delete', 'Delete_db', 'Delete_Field', 'Delete_Index', 'Do',
        'DFCreate_Menu', 'DFFont', 'DFFontSize', 'DFHeaderFrame', 'DFHeaderLineCheck',
        'DFHeaderMargin', 'DFHeaderPos', 'DFHeaderWrap', 'DFLineCheck', 'DFTopMargin',
        'DFBottomMargin', 'DFLeftMargin', 'DFRightMargin', 'DFWrite', 'DFWriteBMP',
        'DFWriteEllip', 'DFWriteLine', 'DFWriteLn', 'DFWriteLnPos', 'DFWritePos',
        'DFWriteRect', 'DFWriteXYLine', 'Direct_Input', 'Direct_Output', 'DWord', 'Diskfree',
        'Else', 'Entry_Item', 'EraseFile', 'Error', 'External_Function', 'False',
        'Field', 'Field_Map', 'File_Exist', 'File_Field', 'Fill_Field', 'Find',
        'Float', 'Flush_Output', 'for', 'Forward', 'Found', 'from', 'Function_Return',
        'General', 'Get', 'Get_Argument_Size', 'Get_Attribute', 'Get_Channel_Position',
        'Get_Channel_Size', 'Get_Current_Directory', 'Get_Current_Input_Channel',
        'Get_Current_Output_Channel', 'Get_Current_User_Count', 'Get_Date_Attribute',
        'Get_Directory', 'Get_Environment', 'Get_FieldNumber', 'Get_Field_Value',
        'Get_FileNumber', 'Get_File_Mod_Time', 'Get_File_Path', 'Get_Icon_Count',
        'Get_Licensed_Max_Users', 'Get_StrictEval', 'Get_Transaction_Retry',
        'Get_Windows_Directory', 'GetDskInfo', 'Global', 'Global_Variable', 'Goto',
        'Handle', 'If', 'IfExp', 'IfLine', 'Import_Class_Protocol', 'Include_Resource',
        'Include_Text', 'Increment', 'Index', 'Integer', 'is', 'Item', 'Load_Def',
        'Load_Driver', 'Lock', 'Login', 'Logout', 'Longptr', 'ULongptr', 'Loop',
        'Make_Directory', 'Make_File', 'Make_Temp_File', 'Move', 'NewRecord', 'Nothing',
        'Number', 'of', 'On_Item', 'On_Key', 'Open', 'Output', 'Output_Aux_File',
        'Output_Wrap', 'Overloaded', 'Playwave', 'Pointer', 'Print', 'Print_Wrap',
        'Procedure_Return', 'Property', 'Read', 'Read_Block', 'Read_Hex', 'Readln',
        'Real', 'Recursive', 'Register_Function', 'Register_Object', 'Register_Procedure',
        'Registration', 'Relate', 'Remove_Directory', 'RenameFile', 'Report_Breaks',
        'Reread', 'Returns', 'RowID', 'Runprogram', 'Save', 'SaveRecord', 'Self', 'Send',
        'SeqEof', 'SeqEol', 'Set', 'Set_Argument_Size', 'Set_Attribute',
        'Set_Channel_Position', 'Set_Date_Attribute', 'Set_Directory',
        'Set_Field_Value', 'Set_File_Mod_Time', 'Set_Relate', 'Set_StrictEval',
        'Set_Transaction_Retry', 'Short', 'Show', 'Showln', 'Sleep', 'Sort',
        'Start_UI', 'String', 'Structure_Abort', 'Structure_Copy', 'Structure_End',
        'Structure_Start', 'Subtract', 'Sysdate', 'Time', 'TimeSpan', 'to', 'True',
        'UBigInt', 'UChar', 'UInteger', 'Unicode', 'Unload_Driver', 'Unlock', 'Until',
        'Use', 'Include', 'UShort', 'Variant', 'Valid_Drive', 'Vconstrain',
        'Version_Information', 'Vfind', 'Wait', 'WebGet', 'WebPublishFunction',
        'WebPublishProcedure', 'WebSet', 'WebSetResponsive', 'WebRegisterPath', 'While',
        'Write', 'Write_Hex', 'Writeln', 'WString', 'ZeroFile', 'ZeroString',
        '#Replace', '#CHKSUB', '#IF', '#IFSUB', '#IFDEF', '#IFNDEF',
        '#ELSE', '#ENDIF', '#COMMAND', '#ENDCOMMAND', '#HEADER', '#ENDHEADER', '#Warning',
        '#Include'
    ];

    var SCOPE_KEYWORDS = [
        'Begin', 'Begin_Row', 'Begin_Transaction', 'Class', 'Deferred_View',
        'DFBeginHeader', 'Enum_List', 'Enumeration_List', 'For', 'For_All',
        'Function', 'Object', 'Composite', 'Procedure', 'Procedure_Section',
        'Repeat', 'Struct', 'While',
        'End', 'End_Class', 'End_Enum_List', 'End_Enumeration_List',
        'End_For_All', 'End_Function', 'End_Object', 'End_Composite',
        'End_Procedure', 'End_Pull_Down', 'End_Row', 'End_Struct',
        'End_Transaction', 'End_Menu', 'DFEndHeader',
        'Cd_Popup_Object', 'Cd_End_Object', 'DFCreate_Menu'
    ];

    var OPERATORS = [
        'max', 'min', 'contains', 'matches', 'not', 'and', 'or', 'iand', 'ior'
    ];

    var META_TAGS = [
        'Category', 'ClassLibrary', 'ClassType', 'CLSID', 'ColumnBased',
        'ComponentType', 'CompositeClass', 'DataAware', 'DataBindable', 'DDClass',
        'DDOHost', 'Description', 'DesignerClass', 'DesignerJSClass', 'DesignTime',
        'EnumList', 'FoldedProperty', 'HelpTopic', 'IgnoreError', 'InitialValue',
        'ItemParameter', 'MethodType', 'NoDoc', 'Obsolete', 'OverrideProperty',
        'OverrideProcedure', 'OverrideProcedureSet', 'OverrideFunction',
        'PropertyType', 'Published', 'Visibility', 'WebProperty', 'Name',
        'Navigable', 'NavigableRequiredParent'
    ];

    // Triple-quoted string (""" ... """)
    var TRIPLE_STRING = {
        className: 'string',
        begin: '"""',
        end: '"""',
        relevance: 10
    };

    // @" verbatim string
    var AT_STRING = {
        className: 'string',
        begin: '@"',
        end: '"'
    };

    // Double-quoted string
    var DOUBLE_STRING = {
        className: 'string',
        begin: '"',
        end: '"',
        contains: [{ begin: '\\\\.' }]
    };

    // Single-quoted string
    var SINGLE_STRING = {
        className: 'string',
        begin: "'",
        end: "'",
        contains: [{ begin: '\\\\.' }]
    };

    // SQL strings (@SQL"...", @SQL'..., @SQL"""...""")
    var SQL_TRIPLE_STRING = {
        className: 'string',
        begin: '@SQL"""',
        end: '"""',
        relevance: 10
    };

    var SQL_DOUBLE_STRING = {
        className: 'string',
        begin: '@SQL"',
        end: '"'
    };

    var SQL_SINGLE_STRING = {
        className: 'string',
        begin: "@SQL'",
        end: "'"
    };

    // Metadata blocks { ... }
    var METADATA = {
        className: 'meta',
        begin: /\{/,
        end: /\}/,
        contains: [
            {
                className: 'meta keyword',
                begin: '\\b(' + META_TAGS.join('|') + ')\\b'
            },
            {
                className: 'string',
                begin: '"',
                end: '"'
            },
            {
                className: 'string',
                begin: "'",
                end: "'"
            },
            hljs.C_NUMBER_MODE
        ],
        relevance: 5
    };

    return {
        name: 'DataFlex',
        aliases: ['dataflex', 'df'],
        disableAutodetect: true,
        case_insensitive: true,
        keywords: {
            keyword: SCOPE_KEYWORDS.concat(KEYWORDS).join(' '),
            built_in: OPERATORS.join(' '),
            literal: 'True False Nothing Self'
        },
        contains: [
            // Line comments
            hljs.COMMENT('//', '$'),

            // Multiline comments
            hljs.COMMENT('/\\*', '\\*/'),

            // Metadata blocks
            METADATA,

            // SQL strings (before regular strings, longer prefix wins)
            SQL_TRIPLE_STRING,
            SQL_DOUBLE_STRING,
            SQL_SINGLE_STRING,

            // Regular strings
            TRIPLE_STRING,
            AT_STRING,
            DOUBLE_STRING,
            SINGLE_STRING,

            // Numbers
            {
                className: 'number',
                begin: /-?\b\d+(\.\d*)?(e-?\d+)?\b/,
                relevance: 0
            },

            // ICode (!word)
            {
                className: 'meta',
                begin: /!\w+/
            },

            // Preprocessor directives
            {
                className: 'meta',
                begin: /#\w+/
            },

            // Field references (Table.Field)
            {
                className: 'variable',
                begin: /\b[a-zA-Z_][\w@#$]*\.[a-zA-Z_][\w@#$]*/
            },

            // Symbol operators
            {
                className: 'operator',
                begin: /[+\-*/^=<>]+|<>|<=|>=/
            }
        ]
    };
});
