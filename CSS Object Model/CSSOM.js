/*
 * Title         : Cascading Style Sheets Object Model
 * Author        : Ramzi Komati 
 * Version       : 2.0
 *                 - Added new datatype: remark
 *                 - Added an option to add many declarations to a specific selector
 *                 - Added an option to clear all the declarations from a specific selector
 *                 - Added a new object that supports HTML inline CSS style
 *                 - Added a new method to merge two CSS Object Models
 *                 - Added a new property to set a declaration as important
 *                 - Changes in parsing CSS Object Model toString()
 *                 - Changes in OOP architecture
 *                 - Get specific declaration and modify it in InlinedCss() and Selector()
 *                 - Code refactored
 *                 - Bug fixes
 *                 
 * Last Modified : May 5th, 2014
 */

var CSS_Object_Models = {};

var CssDataType = {
    'PIXELS'     : 0,
    'EM'         : 1,
    'PERCENT'    : 2,
    'NUMBER'     : 3,
    'RGB'        : 4,
    'STRING'     : 5,
    'FONT'       : 6,
    'URL'        : 7,
    'REMARK'     : 8
};

var CSSOM = function CSSOM(CSSOM_Name)
{
    // Validate parameters
    if(typeof CSSOM_Name === 'undefined')
    {
        CSSOM_Name = '';
    }

    // This variable is used to store the CSSOM object model
    var css = {};

    // This variable is used to increase performance of the script
    var cssHash = {};

    if(CSSOM_Name != '')
    {
        if(CSS_Object_Models.hasOwnProperty(CSSOM_Name))
        {
            css = CSS_Object_Models[CSSOM_Name].css;
            cssHash = CSS_Object_Models[CSSOM_Name].cssHash;
        }
        else
        {
            CSS_Object_Models[CSSOM_Name] = {
                'css'     : {},
                'cssHash' : {}
            };
        }
    }

    var Selector = function Selector(selectorName)
    {
        // Get the ID of the selector
        this.id = css[selectorName].id;

        // Get the name of the selector
        this.name = selectorName;

        // Get the class name of the selector
        this.className = null;
        if (selectorName.substr(0, 1) == '.')
        {
            this.className = selectorName.substr(1, selectorName.length - 1);
        }

        // Get the identifier name of the selector
        this.identifierName = null;
        if (selectorName.substr(0, 1) == '#')
        {
            this.identifierName = selectorName.substr(1, selectorName.length - 1);
        }
        
        // Get all the selectors declarations
        this.declarations = css[selectorName].declarations;

        // Append many declarations to the selector
        this.appendDeclarations = function(declarations)
        {
            for(var i = 0; i < declarations.length; i++)
            {
                this.appendDeclaration(declarations[i].property, declarations[i].value, declarations[i].datatype, declarations[i].important);
            }
        }

        // Append a new declaration to the selector
        this.appendDeclaration = function(property, value, datatype, important)
        {
            if(typeof css[selectorName] === 'undefined')
            {
                throw new Error('Unable to append new declarations: selector does not exist.');
            }
            else
            {
                if(typeof property === 'undefined' || typeof value === 'undefined' || typeof datatype === 'undefined')
                {
                    throw new Error('Unable to append a new declaration: Missing parameters.');
                }
                else
                {
                    if(typeof important === 'undefined')
                    {
                        important = false;
                    }

                    this.declarations.push({
                        'id'        : 'h' + (property + value + datatype).toString().hash(),
                        'property'  : property,
                        'value'     : value,
                        'datatype'  : datatype,
                        'important' : important
                    });

                    if(CSSOM_Name != '')
                    {
                        CSS_Object_Models[CSSOM_Name].css = css;
                    }
                }
            }
        };

        // Return a specific declaration
        this.getDeclaration = function(declaration_property)
        {
            for(var i = 0; i < this.declarations.length; i++)
            {
                if(this.declarations[i].property == declaration_property)
                {
                    return this.declarations[i];
                }
            }
            return -1;
        };

        // Remove all declarations from the selector
        this.clear = function()
        {
            this.declarations = new Array();
        };
    };

    // Append a selector to the CSSOM object model
    this.appendSelector = function(selector, mergeDeclarations)
    {
        if(typeof mergeDeclarations === 'undefined')
        {
            mergeDeclarations = true;
        }

        if(selector.constructor.name == 'Selector')
        {
            if(css.hasOwnProperty(selector.name))
            {
                if(mergeDeclarations)
                {
                    var currentDeclarations = css[selector.name].declarations;
                    var selectorDeclarations = selector.declarations;

                    for(var i = 0; i < selectorDeclarations.length; i++)
                    {
                        var newDeclarationFound = true;
                        for(var j = 0; j < currentDeclarations.length; j++)
                        {
                            if(selectorDeclarations[i].id == currentDeclarations[j].id)
                            {
                                newDeclarationFound = false;
                            }
                        }
                        if(newDeclarationFound)
                        {
                            css[selector.name].declarations.push(selectorDeclarations[i]);
                        }
                    }
                }

                // If mergeDeclaration is set to false, than replace the original declarations
                // of the original selector.
                else
                {
                    css[selector.name] = {
                        'id'           : selector.id,
                        'name'         : selector.name,
                        'className'    : selector.className,
                        'declarations' : selector.declarations
                    }
                }
            }
            else
            {
                css[selector.name] = {
                    'id'           : selector.id,
                    'name'         : selector.name,
                    'className'    : selector.className,
                    'declarations' : selector.declarations
                }
            }
        }
        else
        {
            throw new Error('Invalid type of argument selector. Unable to append a selector to the CSS Object Model.');
        }
    };

    // Create a new selector and append it to the CSSOM object model
    this.createSelector = function(selectorName, id)
    {
        if(typeof selectorName === 'undefined')
        {
            throw new Error('Invalid type of argument selectorName, can\'t be empty.');
        }
        if(css.hasOwnProperty(selectorName))
        {
            return -1;
        }
        else
        {
            // Create a new declaration for the css selector object
            if(typeof id === 'undefined')
            {
                id = 'h' + selectorName.toString().hash();
            }

            css[selectorName] = {
                'id'           : id,
                'name'         : selectorName,
                'className'    : selectorName.substr(0, 1) == '.' ? selectorName.substr(1, selectorName.length -1) : null,
                'declarations' : new Array()
            };

            cssHash[id] = selectorName;

            if(CSSOM_Name != '')
            {
                CSS_Object_Models[CSSOM_Name].css = css;
                CSS_Object_Models[CSSOM_Name].cssHash = cssHash;
            }

            return new Selector(selectorName);
        }
    };

    // Get a specific selector from the CSSOM object model
    this.getSelector = function(selectorName)
    {
        if(typeof selectorName === 'undefined')
        {
            throw new Error('Unable to getSelector: Missing parameters.');
        }
        else
        {
            // If the argument is numeric than retrieve the selector name from cssHash
            if(cssHash.hasOwnProperty(selectorName))
            {
                selectorName = cssHash[selectorName]
            }
           
            if(css.hasOwnProperty(selectorName))
            {
                return css[selectorName];
            }
            else
            {
                throw new Error('Unable to getSelector: Invalid selector name or selector ID.');
            }
        }
    };

    this.getSelectors = function()
    {
        var selectorsCollection = new Array();;
        for(var selector in css)
        {
            selectorsCollection.push(css[selector]);
        }
        return selectorsCollection;
    };

    // Merge two CSS Object Models
    this.merge = function(cssom)
    {
        if(typeof cssom === 'undefined')
        {
            throw new Error("Unable to merge: Invalid parameters.");
        }
        else
        {
            if(cssom.constructor.name != 'CSSOM')
            {
                throw new Error("Unable to merge: Parameter data-type must be [CSSOM Object].");
            }
            else
            {
                for(var i = 0; i < cssom.getSelectors().length; i++)
                {
                    var newSelector = cssom.getSelectors()[i];
                    if(css.hasOwnProperty(newSelector.name))
                    {
                        // If the selector name is already found in the current CSS Object Model
                        // Than throw an error. We can not merge the selector's declaration since
                        // it will change the previously defined rules of the selector.
                        throw new Error('Unable to merge: Duplicated selector names found.');
                    }
                    else
                    {
                        css[newSelector.name] = {
                            'id'           : newSelector.id,
                            'name'         : newSelector.name,
                            'className'    : newSelector.className,
                            'declarations' : newSelector.declarations
                        }
                    }
                }
            }
        }
    };

    // Render the CSSOM object model to String
    this.toString = function(minify)
    {
        const INDENT = '    '; // Indentation can be replaced by '\t'
        var str = '';

        if(typeof minify === 'undefined' || minify == false)
        {
            for(var selector in css)
            {
                str += selector + ' {\n';
                for(var i = 0; i < css[selector].declarations.length; i++)
                {
                    switch(css[selector].declarations[i].datatype)
                    {
                        case CssDataType.PIXELS:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + 'px';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                str += 'px'
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.EM:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + 'em';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                str += 'em'
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.PERCENT:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + '%';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                str += '%';
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.RGB:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            str += 'rgb('
                            str += css[selector].declarations[i].value[0] + ', ';
                            str += css[selector].declarations[i].value[1] + ', ';
                            str += css[selector].declarations[i].value[2];
                            str += ')';
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.NUMBER:
                        case CssDataType.STRING:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            str += css[selector].declarations[i].value;
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.FONT:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            str += "'" + css[selector].declarations[i].value + "'";
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.URL:

                            str += INDENT + css[selector].declarations[i].property + ': ';
                            str += "url('" + css[selector].declarations[i].value + "')";
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            str += ';\n';
                            break;

                        case CssDataType.REMARK:

                            str += INDENT + '/*' + css[selector].declarations[i].property + '*/';
                            str += ';\n';
                            break;

                        default:

                            throw new Error('Invalid data type for CSS declaration rule: <' + css[selector].declarations[i].datatype) + '>';
                    }
                }
                str += '}\n';
            }
        }

        // Minify CSS
        else
        {
            for(var selector in css)
            {
                str += selector + '{';
                for(var i = 0; i < css[selector].declarations.length; i++)
                {
                    str += css[selector].declarations[i].property + ':';

                    switch(css[selector].declarations[i].datatype)
                    {
                        case CssDataType.PIXELS:

                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + 'px';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                if(parseFloat(css[selector].declarations[i].value) != 0)
                                {
                                    str += 'px';
                                }
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.EM:

                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + 'em';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                if(parseFloat(css[selector].declarations[i].value) != 0)
                                {
                                    str += 'em';
                                }
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.PERCENT:

                            if(css[selector].declarations[i].value instanceof Array)
                            {
                                for(var j = 0; j < css[selector].declarations[i].value.length; j++)
                                {
                                    if(css[selector].declarations[i].value[j] == 0)
                                    {
                                        str += css[selector].declarations[i].value[j];
                                    }
                                    else
                                    {
                                        str += css[selector].declarations[i].value[j] + '%';
                                    }
                                    if(j != css[selector].declarations[i].value.length - 1)
                                    {
                                        str += ' ';
                                    }
                                }
                            }
                            else
                            {
                                str += css[selector].declarations[i].value;
                                if(parseFloat(css[selector].declarations[i].value) != 0)
                                {
                                    str += '%';
                                }
                            }
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.RGB:

                            str += 'rgb(';
                            str += css[selector].declarations[i].value[0] + ',';
                            str += css[selector].declarations[i].value[1] + ',';
                            str += css[selector].declarations[i].value[2];
                            str += ')';
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.NUMBER:
                        case CssDataType.STRING:

                            str += css[selector].declarations[i].value;
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.FONT:

                            str += "'" + css[selector].declarations[i].value + "'";
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.URL:

                            str += "url('" + css[selector].declarations[i].value + "')";
                            if(css[selector].declarations[i].important)
                            {
                                str += ' !important';
                            }
                            break;

                        case CssDataType.REMARK:

                            // Do not display remarks on the minified version of the CSS,
                            // Do nothing.
                            break;

                        default:

                            throw new Error('Invalid data type for CSS declaration rule: <' + css[selector].declarations[i].datatype) + '>';
                    }

                    if(i != css[selector].declarations.length - 1)
                    {
                        str += ';';
                    }
                }
                str += '}\n';
            }
        }
        return str;
    };
};

var InlinedCSS = function InlinedCSS()
{
    this.declarations = new Array();

    // Append many declarations to the selector
    this.appendDeclarations = function(declarations)
    {
        for(var i = 0; i < declarations.length; i++)
        {
            this.appendDeclaration(declarations[i].property, declarations[i].value, declarations[i].datatype, declarations[i].important);
        }
    };

    // Append a new declaration to the selector
    this.appendDeclaration = function(property, value, datatype, important)
    {
        if(typeof property === 'undefined' || typeof value === 'undefined' || typeof datatype === 'undefined')
        {
            throw new Error('Unable to append a new declaration: Missing parameters.');
        }
        else
        {
            if(typeof important === 'undefined')
            {
                important = false;
            }
            this.declarations.push({
                'id'        : 'h' + (property + value + datatype).toString().hash(),
                'property'  : property,
                'value'     : value,
                'datatype'  : datatype,
                'important' : important
            });
        }
    };

    // Return an array of declarations
    this.getDeclarations = function()
    {
        return this.declarations;
    };

    // Return a specific declaration
    this.getDeclaration = function(declaration_property)
    {
        for(var i = 0; i < this.declarations.length; i++)
        {
            if(this.declarations[i].property == declaration_property)
            {
                return this.declarations[i];
            }
        }
        return -1;
    };

    // Clear all declarations from the inlined CSS
    this.clear = function()
    {
        this.declarations = new Array();
    };

    // Render the Inlined CSS object to String
    this.toString = function()
    {
        var str = '';

        for(var i = 0; i < this.declarations.length; i++)
        {
            str += this.declarations[i].property + ':';

            switch(this.declarations[i].datatype)
            {
                case CssDataType.PIXELS:

                    if(this.declarations[i].value instanceof Array)
                    {
                        for(var j = 0; j < this.declarations[i].value.length; j++)
                        {
                            if(this.declarations[i].value[j] == 0)
                            {
                                str += this.declarations[i].value[j];
                            }
                            else
                            {
                                str += this.declarations[i].value[j] + 'px';
                            }
                            if(j != this.declarations[i].value.length - 1)
                            {
                                str += ' ';
                            }
                        }
                    }
                    else
                    {
                        str += this.declarations[i].value;
                        if(parseFloat(this.declarations[i].value) != 0)
                        {
                            str += 'px';
                        }
                    }
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.EM:

                    if(this.declarations[i].value instanceof Array)
                    {
                        for(var j = 0; j < this.declarations[i].value.length; j++)
                        {
                            if(this.declarations[i].value[j] == 0)
                            {
                                str += this.declarations[i].value[j];
                            }
                            else
                            {
                                str += this.declarations[i].value[j] + 'em';
                            }
                            if(j != this.declarations[i].value.length - 1)
                            {
                                str += ' ';
                            }
                        }
                    }
                    else
                    {
                        str += this.declarations[i].value;
                        if(parseFloat(this.declarations[i].value) != 0)
                        {
                            str += 'em';
                        }
                    }
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.PERCENT:

                    if(this.declarations[i].value instanceof Array)
                    {
                        for(var j = 0; j < this.declarations[i].value.length; j++)
                        {
                            if(this.declarations[i].value[j] == 0)
                            {
                                str += this.declarations[i].value[j];
                            }
                            else
                            {
                                str += this.declarations[i].value[j] + '%';
                            }
                            if(j != this.declarations[i].value.length - 1)
                            {
                                str += ' ';
                            }
                        }
                    }
                    else
                    {
                        str += this.declarations[i].value;
                        if(parseFloat(this.declarations[i].value) != 0)
                        {
                            str += '%';
                        }
                    }
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.RGB:

                    str += 'rgb(';
                    str += this.declarations[i].value[0] + ',';
                    str += this.declarations[i].value[1] + ',';
                    str += this.declarations[i].value[2];
                    str += ')';
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.NUMBER:
                case CssDataType.STRING:

                    str += this.declarations[i].value;
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.FONT:

                    str += "'" + this.declarations[i].value + "'";
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.URL:

                    str += "url('" + this.declarations[i].value + "')";
                    if(this.declarations[i].important)
                    {
                        str += ' !important';
                    }
                    break;

                case CssDataType.REMARK:

                    // Do not display remarks on the minified version of the CSS,
                    // Do nothing.
                    break;

                default:

                    throw new Error('Invalid data type for CSS declaration rule: <' + this.declarations[i].datatype) + '>';
            }

            if(i != this.declarations.length - 1)
            {
                str += ';';
            }
        }
        return str;
    };
};

String.prototype.hash = function()
{
    var hash = 0;
    if(this.length == 0) 
    {
        return hash;
    }
    for(var i = 0; i < this.length; i++) 
    {
        var chr = this.charCodeAt(i);
        hash = ((hash<<5) - hash) + chr;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};