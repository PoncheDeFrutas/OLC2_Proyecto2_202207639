const fs = require('fs');

const types = [
    `
    /**
     * @typedef {Object} Location
     * @property {Object} start
     * @property {number} start.offset
     * @property {number} start.line
     * @property {number} start.column
     * @property {Object} end
     * @property {number} end.offset
     * @property {number} end.line
     * @property {number} end.column
     */
     `
]

const configurationNodes = [
    // Configuration base node
    {
        name: 'Expression',
        base: true,
        props: [
            {
                name: 'location',
                type: 'Location|null',
                description: 'The location of the node in the source code.',
                default: 'null'
            }
        ]
    },
    {
        name: 'Literal',
        extends: 'Expression',
        props: [
            {
                name: 'value',
                type: 'any',
                description: 'The value of the literal.'
            },
            {
                name: 'type',
                type: 'string',
                description: 'The type of the literal.'
            }
        ]
    },
    {
        name: 'Group',
        extends: 'Expression',
        props: [
            {
                name: 'exp',
                type: 'Expression',
                description: 'The expression inside the group.'
            }
        ]
    },
    {
        name: 'VarValue',
        extends: 'Expression',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'The name of the variable.'
            }
        ]
    },
    {
        name: 'Unary',
        extends: 'Expression',
        props: [
            {
                name: 'op',
                type: 'string',
                description: 'The operator of the unary expression.'
            },
            {
                name: 'exp',
                type: 'Expression',
                description: 'The right expression of the unary expression.'
            }
        ]
    },
    {
        name: 'Arithmetic',
        extends: 'Expression',
        props: [
            {
                name: 'op',
                type: 'string',
                description: 'The operator of the arithmetic expression.'
            },
            {
                name: 'left',
                type: 'Expression',
                description: 'The left expression of the arithmetic expression.'
            },
            {
                name: 'right',
                type: 'Expression',
                description: 'The right expression of the arithmetic expression.'
            }
        ]
    },
    {
        name: 'Relational',
        extends: 'Expression',
        props: [
            {
                name: 'op',
                type: 'string',
                description: 'The operator of the relational expression.'
            },
            {
                name: 'left',
                type: 'Expression',
                description: 'The left expression of the relational expression.'
            },
            {
                name: 'right',
                type: 'Expression',
                description: 'The right expression of the relational expression.'
            }
        ]
    },
    {
        name: 'Logical',
        extends: 'Expression',
        props: [
            {
                name: 'op',
                type: 'string',
                description: 'The operator of the logical expression.'
            },
            {
                name: 'left',
                type: 'Expression',
                description: 'The left expression of the logical expression.'
            },
            {
                name: 'right',
                type: 'Expression',
                description: 'The right expression of the logical expression.'
            }
        ]
    },
    {
        name: 'Ternary',
        extends: 'Expression',
        props: [
            {
                name: 'cond',
                type: 'Expression',
                description: 'The condition of the ternary expression.'
            },
            {
                name: 'trueExp',
                type: 'Expression',
                description: 'The true expression of the ternary expression.'
            },
            {
                name: 'falseExp',
                type: 'Expression',
                description: 'The false expression of the ternary expression.'
            }
        ]
    },
    {
        name: 'VarAssign',
        extends: 'Expression',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'The name of the variable.'
            },
            {
                name: 'sig',
                type: 'string',
                description: 'The assignation of the variable.'
            },
            {
                name: 'assign',
                type: 'Expression',
                description: 'The expression to assign to the variable.'
            }
        ]
    },
    {
        name: 'Return',
        extends: 'Expression',
        props: [
            {
                name: 'exp',
                type: 'Expression|undefined',
                description: 'The expression to return.'
            }
        ]
    },
    {
        name: 'Continue',
        extends: 'Expression',
        props: []
    },
    {
        name: 'Break',
        extends: 'Expression',
        props: []
    },
    {
        name: 'Case',
        extends: 'Expression',
        props: [
            {
                name: 'cond',
                type: 'Expression',
                description: 'The expression of the case.'
            },
            {
                name: 'stmt',
                type: 'Expression[]',
                description: 'The instructions of the case.'
            }
        ]
    },
    {
        name: 'Switch',
        extends: 'Expression',
        props: [
            {
                name: 'cond',
                type: 'Expression',
                description: 'The expression of the switch.'
            },
            {
                name: 'cases',
                type: 'Case[]',
                description: 'The cases of the switch.'
            },
            {
                name: 'def',
                type: 'Case',
                description: 'The default case of the switch.'
            }
        ]
    },
    {
        name: 'For',
        extends: 'Expression',
        props: [
            {
                name: 'init',
                type: 'Expression',
                description: 'The initialization of the for loop.'
            },
            {
                name: 'cond',
                type: 'Expression',
                description: 'The condition of the for loop.'
            },
            {
                name: 'update',
                type: 'Expression',
                description: 'The increment of the for loop.'
            },
            {
                name: 'stmt',
                type: 'Block',
                description: 'The instructions of the for loop.'
            }
        ]
    },
    {
        name: 'ForEach',
        extends: 'Expression',
        props: [
            {
                name: 'vd',
                type: 'Expression',
                description: 'The name of the variable.'
            },
            {
                name: 'array',
                type: 'Expression',
                description: 'The expression to iterate.'
            },
            {
                name: 'stmt',
                type: 'Block',
                description: 'The instructions of the for each loop.'
            }
        ]

    },
    {
        name: 'While',
        extends: 'Expression',
        props: [
            {
                name: 'cond',
                type: 'Expression',
                description: 'The condition of the while loop.'
            },
            {
                name: 'stmt',
                type: 'Block',
                description: 'The instructions of the while loop.'
            }
        ]
    },
    {
        name: 'If',
        extends: 'Expression',
        props: [
            {
                name: 'cond',
                type: 'Expression',
                description: 'The condition of the if.'
            },
            {
                name: 'stmtThen',
                type: 'Expression',
                description: 'The instructions of the if.'
            },
            {
                name: 'stmtElse',
                type: 'Expression',
                description: 'The else of the if.'
            }
        ]
    },
    {
        name: 'Block',
        extends: 'Expression',
        props: [
            {
                name: 'stmt',
                type: 'Expression[]',
                description: 'The instructions of the block.'
            }
        ]
    },
    {
        name: 'Print',
        extends: 'Expression',
        props: [
            {
                name: 'exp',
                type: 'Expression[]',
                description: 'The expression to print.'
            }
        ]
    },
    {
        name: 'ExpressionStatement',
        extends: 'Expression',
        props: [
            {
                name: 'exp',
                type: 'Expression',
                description: 'The expression of the statement.'
            }
        ]
    },
    {
        name: 'VarDeclaration',
        extends: 'Expression',
        props: [
            {
                name: 'type',
                type: 'string',
                description: 'The type of the variable.'
            },
            {
                name: 'id',
                type: 'string',
                description: 'The name of the variable.'
            },
            {
                name: 'value',
                type: 'Expression|null',
                description: 'The expression of the variable.'
            }
        ]
    },
    {
        name: 'Callee',
        extends: 'Expression',
        props: [
            {
                name: 'callee',
                type: 'Expression',
                description: 'The name of the callee.'
            },
            {
                name: 'args',
                type: 'Expression[]',
                description: 'The arguments of the callee.'
            }
        ]
    },
    {
        name: 'FuncDeclaration',
        extends: 'Expression',
        props: [
            {
                name: 'type',
                type: 'string',
                description: 'The type of the function.'
            },
            {
                name: 'id',
                type: 'string',
                description: 'The name of the function.'
            },
            {
                name: 'params',
                type: 'Expression[]',
                description: 'The parameters of the function.'
            },
            {
                name: 'block',
                type: 'Block',
                description: 'The body of the function.'
            }
        ]
    },
    {
        name: 'StructDeclaration',
        extends: 'Expression',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'The name of the struct.'
            },
            {
                name: 'fields',
                type: 'Expression[]',
                description: 'The fields of the struct.'
            }
        ]
    },
    {
        name: 'Instance',
        extends: 'Expression',
        props: [
            {
                name: 'id',
                type: 'string',
                description: 'The class instance.'
            },
            {
                name: 'args',
                type: 'Expression[]',
                description: 'The arguments of the class instance.'
            }
        ]
    },
    {
        name: 'Get',
        extends: 'Expression',
        props: [
            {
                name: 'object',
                type: 'Expression',
                description: 'The object to get the property.'
            },
            {
                name: 'property',
                type: 'string',
                description: 'The property to get.'
            }
        ]
    },
    {
        name: 'Set',
        extends: 'Expression',
        props: [
            {
                name: 'object',
                type: 'Expression',
                description: 'The object to set the property.'
            },
            {
                name: 'property',
                type: 'string',
                description: 'The property to set.'
            },
            {
                name: 'value',
                type: 'Expression',
                description: 'The value to set.'
            },
            {
                name: 'sig',
                type: 'string',
                description: 'The assignation of the property.'
            }
        ]
    },
    {
        name: 'ArrayInstance',
        extends: 'Expression',
        props: [
            {
                name: 'args',
                type: 'Expression[]',
                description: 'The name of the array instance.'
            },
            {
                name: 'type',
                type: 'string',
                description: 'The type of the array instance.'
            },
            {
                name: 'dim',
                type: 'number[]',
                description: 'The dimension of the array instance.'
            }
        ]
    }
]

let code = '';

// Base types
types.forEach(type => {
    code += type + '\n';
});

// Visitor Types
code += `
/**
 * @typedef {import('./visitor').BaseVisitor} BaseVisitor
 */
`;

const baseClass = configurationNodes.find(node => node.base);

configurationNodes.forEach(node => {
    code += `
export class ${node.name} ${baseClass && node.extends ? `extends ${node.extends}` : ''} {

    /**
    * @param {Object} options
    * ${node.props.map(prop => `@param {${prop.type}} options.${prop.name} ${prop.description}`).join('\n * ')}
    */
    constructor(${!node.base && `{ ${node.props.map(prop => `${prop.name}`).join(', ')} }` || ''}) {
        ${baseClass && node.extends ? `super();` : ''}
        ${node.props.map(prop => `
        /**
         * ${prop.description}
         * @type {${prop.type}}
        */
        this.${prop.name} = ${prop.default || `${prop.name}`};
`).join('\n')}
    }

    /**
     * @param {BaseVisitor} visitor
     */
    accept(visitor) {
        return visitor.visit${node.name}(this);
    }
}
    `;
});

code += `
export default { ${configurationNodes.map(node => node.name).join(', ')} }
`;

fs.writeFileSync('./nodes.js', code);
console.log('File nodes.js created');

// Visitor
code = `
/**
${configurationNodes.map(node => `
 * @typedef {import('./nodes').${node.name}} ${node.name}
`).join('\n')}
 */
`;

code += `

/**
 * Base visitor class.
 * @abstract
 */
export class BaseVisitor {

    ${configurationNodes.map(node => `
    /**
     * @param {${node.name}} node
     * @returns {any}
     */
    visit${node.name}(node) {
        throw new Error('Method visit${node.name} not implemented');
    }
    `).join('\n')}
}
`;

fs.writeFileSync('./visitor.js', code);
console.log('File visitor.js created');