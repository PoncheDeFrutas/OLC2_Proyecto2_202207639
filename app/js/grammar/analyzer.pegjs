{
    const createNode = (typeNode, props) => {
        const type = {
            'Literal': nodes.Literal,
            'Unary': nodes.Unary,
            'Arithmetic': nodes.Arithmetic,
            'Relational': nodes.Relational,
            'Logical': nodes.Logical,
            'Group': nodes.Group,
            'VarDeclaration': nodes.VarDeclaration,
            'Print': nodes.Print,
            'VarAssign': nodes.VarAssign,
            'ExpressionStatement': nodes.ExpressionStatement,
            'VarValue': nodes.VarValue,
            'Ternary': nodes.Ternary,
            'Block': nodes.Block,
            'If': nodes.If,
            'While': nodes.While,
            'For': nodes.For,
            'ForEach': nodes.ForEach,
            'Case': nodes.Case,
            'Switch': nodes.Switch,
            'Break': nodes.Break,
            'Continue': nodes.Continue,
            'Return': nodes.Return,
            'Callee': nodes.Callee,
            'Function': nodes.FuncDeclaration,
            'StructDeclaration': nodes.StructDeclaration,
            'Instance': nodes.Instance,
            'Get': nodes.Get,
            'Set': nodes.Set,
            'ArrayInstance': nodes.ArrayInstance,
        }

        const node = new type[typeNode](props)
        node.location = location()
        return node
    }
}

Program
    = _ ( Comment _)* s:Statements* _ { return s }

Statements
    = Statement
    / Comment _ { return undefined }

Statement
    = s:StructDeclaration _ ";" _ ( Comment _ )? { return s }
    / f:Function _ ( Comment _ )? { return f }
    / vd:VarDeclaration _ ";" _ ( Comment _ )? { return vd }
    / s:Sentence _ ( Comment _ )? { return s }


/* ------------------------------------------------------Declaration------------------------------------------------ */
VarDeclaration
    = type:(Types / "var" / Id) _ dim:("[" _ "]" _ {return 0})* id:Id _ exp:("=" _ exp:Expression { return exp })? {
        return createNode('VarDeclaration', { type:(type + '[]'.repeat(dim.length)), id , value: exp || null })
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Function--------------------------------------------------- */
Function
    = type:(Types / "var" / Id) _ dim:("[" _ "]" _ {return 0})* id:Id _ "(" _ params:Parameters? ")" _ block:Block {
        return createNode('Function', { type:(type + '[]'.repeat(dim.length)), id, params: params || [], block })
    }

Parameters
    = head:Param _ tail:( "," _ param:Param _ { return param })* {
        return [head, ...tail]
    }

Param
    = VarDeclaration
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Struct----------------------------------------------------- */

StructDeclaration
    = "struct" _ id:Id _ "{" _ fields:Field+ _ "}" {
        return createNode('StructDeclaration', { id, fields })
    }

Field
    = vd:VarDeclaration _ ";" _ {
        return vd
    }

/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------------Sentence--------------------------------------------------- */
Sentence
    = Print
    / Block
    / If
    / While
    / For
    / ForEach
    / Switch
    / Break
    / Continue
    / Return
    / e:Expression _ ";" {
        return createNode('ExpressionStatement', { exp: e })
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Print------------------------------------------------------ */
Print
    = "System.out.println" _ "(" _ exp:Arguments? _ ")" _ ";" {
        return createNode('Print', { exp })
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Block------------------------------------------------------- */
Block
    = "{" _ s:Statements* _ "}" {
        return createNode('Block', { stmt: s })
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* --------------------------------------------------------If-------------------------------------------------------- */
If
    = "if" _ "(" _ cond:Expression _ ")" _ stmtThen:Block
        stmtElse:( _ "else" _ stmtElse:Sentence { return stmtElse } )? {
        return createNode('If', { cond, stmtThen, stmtElse })
     }
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------------Loop------------------------------------------------------- */
While
    = "while" _ "(" _ cond:Expression _ ")" _ stmt:Block {
        return createNode('While', { cond, stmt })
    }

For
    = "for" _ "(" _ init:Statement _ cond:Ternary _ ";" _ update:Expression _ ")" _ stmt:Block {
        return createNode('For', { init, cond, update, stmt })
    }

ForEach
    = "for" _ "(" vd:VarDeclaration  ":" _ array:Expression _ ")" _ stmt:Block {
        return createNode('ForEach', { vd, array, stmt })
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/*------------------------------------------------------Switch------------------------------------------------------- */
Switch
    = "switch" _ "(" _ cond:Expression _ ")" _ "{" _ c:Case* _ def:Default? _ "}" {
        return createNode('Switch', { cond, cases: c, def })
    }

Case
    = "case" _ e:Expression _ ":" _ s:Statements* {
        return createNode('Case', { cond: e, stmt: s });
    }

Default
    = "default" _ ":" _ s:Statements* {
        return createNode('Case', { cond: null, stmt: s });
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Control----------------------------------------------------- */
Break
    = "break" _ ";" { return createNode('Break', {}) }

Continue
    = "continue" _ ";" { return createNode('Continue', {}) }

Return
    = "return" _ exp:Expression _ ";" { return createNode('Return', { exp }) }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Expression------------------------------------------------- */

Expression
    = Assignment

Arguments
    = arg:Expression _ args:( "," _ exp:Expression _ { return exp } )* {
        return [arg, ...args]
    }

Assignment
    = id:Callee _ sig:("=" / "+=" / "-=") _ assign:Assignment {
        if (id instanceof nodes.VarValue) {
            return createNode('VarAssign', { id: id.id, sig, assign })
        } else if (id instanceof nodes.Get) {
            return createNode('Set', { object: id.object, property: id.property, value: assign, sig })
        }
    }
    / Ternary

Ternary
    = cond:OR _ "?" _ trueExp:Ternary _ ":" _ falseExp:Ternary {
        return createNode('Ternary', { cond, trueExp, falseExp })
     }
    / OR
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Logical----------------------------------------------------- */
OR
    = le:AND expansion:(
        _ "||" _ ri:AND { return { type: '||', ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Logical', { op: type, left: acc, right: ri })
            },
            le
        )
    }

AND
    = le:Equality expansion:(
        _ "&&" _ ri:Equality { return { type: '&&', ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Logical', { op: type, left: acc, right: ri })
            },
            le
        )
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Relational-------------------------------------------------- */
Equality
    = le:Relational expansion:(
        _ op:("==" / "!=") _ ri:Relational { return { type: op, ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Relational', { op: type, left: acc, right: ri })
            },
            le
        )
    }

Relational
    = le:Sum expansion:(
        _ op:("<=" / ">=" / "<" / ">") _ ri:Sum { return { type: op, ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Relational', { op: type, left: acc, right: ri })
            },
            le
        )
    }
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Arithmetic-------------------------------------------------- */
Sum
    = le:Mul expansion:(
        _ op:("+" / "-") _ ri:Mul { return { type: op, ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Arithmetic', { op: type, left: acc, right: ri })
            },
            le
        )
    }

Mul
    = le:Unary expansion:(
        _ op:("*" / "/" / "%") _ ri:Unary { return { type: op, ri } }
    )* {
        return expansion.reduce(
            (acc, curr) => {
                const { type, ri } = curr
                return createNode('Arithmetic', { op: type, left: acc, right: ri })
            },
            le
        )
    }


Unary
    = "-" _ dt:Unary { return createNode('Unary', { op: '-', exp: dt }) }
    / "!" _ dt:Unary { return createNode('Unary', { op: '!', exp: dt }) }
    / ArrMethods

ArrMethods
    = Callee _ "." _ method:("indexOf"/"length"/"Join") exp:( "(" _ arg:Expression? _ ")" { return arg })? {
        return createNode('ArrMethods', { callee: Callee, method, exp })
    }
    / Callee
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Callee------------------------------------------------------ */
Callee = initial:DataType _ operations:(
        ("(" _ args:Arguments? _ ")" { return { type: 'call', args: args || [] } })
        / ("." _ id:("length"/ArrayMethods/Id/Callee) { return { type: 'access', id } })
        / ("[" _ index:Expression _ "]" { return { type: 'index', index } })
    )* {
        return operations.reduce(
            (objective, args) => {
                const { type, id, index, args: argsList } = args
                if (type === 'call') {
                    return createNode('Callee', { callee:objective , args: argsList || [] })
                } else if (type === 'index') {
                    return createNode('Get', { object:objective , property:index })
                } else if (type === 'access') {
                    return createNode('Get', { object:objective , property:id })
                }
            },
            initial
        )
    }



/* ------------------------------------------------------------------------------------------------------------------ */

/* -----------------------------------------------------DataType----------------------------------------------------- */
DataType
    = Number
    / Boolean
    / String
    / Char
    / Null
    / Group
    / ArrayInstance
    / Instance
    / typeof
    / IdValue

ArrayInstance
    = "{" _ args:Arguments _  "}" {
        return createNode('ArrayInstance', { args })
    }
    / "new" _ type:(Types / "var" / Id) _ dim:( "[" _ exp:Expression _ "]" { return exp })+ {
        return createNode('ArrayInstance', { type, dim })
    }

Instance
    = id:Id _ "{" _ args:Attributes "}" {
        return createNode('Instance', { id, args: args || [] })
    }

Attributes
    = head:Attribute _ tail:( "," _ Attr:Attribute _ { return Attr })* {
        return [head, ...tail]
    }

Attribute
    = id:Id _ ":" _ assign:Expression {
        return createNode('VarAssign', { id, sig:"=", assign })
    }

ArrayMethods
    = method:("indexOf"/"length"/"join") exp:( "(" _ arg:Expression? _ ")" { return arg })? {
        const varValue = createNode('VarValue', { id:method })
        return createNode('Callee', { callee: varValue, args: exp ? [exp] : [] })
    }

typeof
    = id:"typeof" _ exp:Expression  {
         const varValue = createNode('VarValue', { id })
         return createNode('Callee', { callee: varValue, args: [exp] || [] })
    }

IdValue
    =
    id:"Object.keys" {
        return createNode('VarValue', { id })
    }

    / id:Id {
        return createNode('VarValue', { id })
    }

Group
    = "(" _ exp:Expression _ ")" { return createNode('Group', { exp }) }

Number
    = Float
    / Integer

Integer
    = [0-9]+ {
        return createNode('Literal', { value: parseInt(text()), type: 'int' })
    }

Float
    = [0-9]+ "." [0-9]+ {
        return createNode('Literal', { value: parseFloat(text(), 10), type: 'float' })
     }

Boolean
    = ("true" / "false") {
        return createNode('Literal', { value: text() === "true" ? true : false, type: 'bool' })
     }

String
    = "\"" [^\"]* "\"" {
        return createNode('Literal', { value: text().slice(1, -1), type: 'string' })
     }

Char
    = "'" [^']* "'" {
        return createNode('Literal', { value: text().slice(1, -1), type: 'char' })
     }

Null
    = "null" {
        return createNode('Literal', { value: null, type: 'null' })
    }

/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Comment----------------------------------------------------- */
Comment
    = SimpleComment
    / BlockComment

SimpleComment
    = "//" (!EndComment .)* EndComment  { console.log("SimpleComment", text()); }

EndComment
    = "\r" / "\n" / "\r\n" / !.

BlockComment
    = "/*" (!"*/" .)* "*/"      { console.log("BlockComment", text()); }

_
    = [ \t\n\r]*
/* ------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------Keywords---------------------------------------------------- */
Types
    = ("int" / "float" / "bool" / "string" / "char" / "void") { return text(); }

Separator
    = [ \t\n\r]+ / ";" / "(" / ")" / "{" / "}"
    / "," / "." / "=" / "!" / "+" / "-" / "*"
    / "/" / "<" / ">" / "<=" / ">=" / "==" / "!="
    / "&&" / "||" / "?" / ":" / "++" / "--"
    / "[" / "]"

ReservedWord
    = "if" / "else" / "while" / "for" / "return" / "switch"
    / "case" / "default" / "break" / "continue" / "struct"
    / "var" / "true" / "false" / "null" / "System.out.println"

Id
    = !(ReservedWord Separator) id:Identifier { return id; }

Identifier
    = [a-zA-Z_][a-zA-Z0-9_]* { return text(); }

/* ------------------------------------------------------------------------------------------------------------------ */