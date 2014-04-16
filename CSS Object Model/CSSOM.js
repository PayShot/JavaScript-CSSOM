/*
 * Title         : Cascading Style Sheets Object Model
 * Author        : Ramzi Komati 
 * Version       : 1.2
 *                 - Create a non-static CSS Object Model
 *                 - Added hash function to assign a unique ID for each mutal property
 *                 - Append a Selector Object from a CSSOM to another
 *                 - Added the option to merge mutal declarations between two selectors
 *                 - Bug fixes
 * Last Modified : April 15th, 2014
 *
 */

var CSS_Object_Models = {};

var CSSOM = function CSSOM(CSSOM_Name)
{
    // Validate parameters
    if(typeof CSSOM_Name === 'undefined')
    {
        CSSOM_Name = '';
    }

    // These are the datatypes of value's decalarations
    this.DataType = {
        'PIXELS'     : 0,
        'EM'         : 1,
        'PERCENTAGE' : 2,
        'NUMBER'     : 3,
        'RGB'        : 4,
        'STRING'     : 5,
        'FONT'       : 6,
        'URL'        : 7
    };

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
        this.className = (selectorName.substr(0, 1) == '.' ? selectorName.substr(1, selectorName.length - 1) : '');

        // Get all the selectors declarations
        this.declarations = css[selectorName].declarations;

        // Append a new declaration to the selector
        this.appendDeclaration = function(arg1, arg2, arg3)
        {
            if(typeof css[selectorName] === 'undefined')
            {
                throw new Error('Unable to append new declarations: selector does not exist.');
            }
            else
            {
                if(typeof arg1 === 'undefined' || typeof arg2 === 'undefined' || typeof arg3 === 'undefined')
                {
                    throw new Error('Unable to append a new declaration: Missing parameters.');
                }
                else
                {
                    /*css[selectorName].declarations.push({
                        'id'       : 'h' + (arg1 + arg2 + arg3).toString().hash(),
                        'property' : arg1,
                        'value'    : arg2,
                        'datatype' : arg3
                    });*/

                    this.declarations.push({
                        'id'       : 'h' + (arg1 + arg2 + arg3).toString().hash(),
                        'property' : arg1,
                        'value'    : arg2,
                        'datatype' : arg3
                    });

                    if(CSSOM_Name != '')
                    {
                        CSS_Object_Models[CSSOM_Name].css = css;
                    }
                }
            }
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
                        'declarations' : selector.declarations
                    }
                }
            }
            else
            {
                css[selector.name] = {
                    'id'           : selector.id,
                    'declarations' : selector.declarations
                }
            }
        }
        else
        {
            throw new Error('Invalid type of argument selector. Unable to append a selector to the CSS Object Model.');
        }
    };

    // Set a new selector to the CSSOM object model
    this.setSelector = function(selectorName, id)
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
            if(isNumeric(selectorName))
            {
                if(cssHash.hasOwnProperty(selectorName))
                {
                    selectorName = cssHash[selectorName]
                }
                else
                {
                    return -1;
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
                    str += INDENT + css[selector].declarations[i].property + ': ';
                    
                    switch(css[selector].declarations[i].datatype)
                    {
                        case this.DataType.PIXELS:

                            str += css[selector].declarations[i].value;
                            str += 'px'
                            break;

                        case this.DataType.EM:

                            str += css[selector].declarations[i].value;
                            str += 'em'
                            break;

                        case this.DataType.PERCENTAGE:

                            str += css[selector].declarations[i].value;
                            str += '%';
                            break;

                        case this.DataType.RGB:

                            str += 'rgb('
                            str += css[selector].declarations[i].value[0] + ', ';
                            str += css[selector].declarations[i].value[1] + ', ';
                            str += css[selector].declarations[i].value[2];
                            str += ')';
                            break;

                        case this.DataType.NUMBER:
                        case this.DataType.STRING:

                            str += css[selector].declarations[i].value;
                            break;

                        case this.DataType.FONT:

                            str += "'" + css[selector].declarations[i].value + "'";
                            break;

                        case this.DataType.URL:

                            str += "url('" + css[selector].declarations[i].value + "')";
                            break;

                        default:

                            throw new Error('Invalid data type for CSS declaration rule: <' + css[selector].declarations[i].datatype) + '>';
                    }
                    str += ';\n';
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
                        case this.DataType.PIXELS:

                            str += css[selector].declarations[i].value;
                            if(parseFloat(css[selector].declarations[i].value) != 0)
                            {
                                str += 'px'
                            }
                            break;

                        case this.DataType.EM:

                            str += css[selector].declarations[i].value;
                            if(parseFloat(css[selector].declarations[i].value) != 0)
                            {
                                str += 'em'
                            }
                            break;

                        case this.DataType.PERCENTAGE:

                            str += css[selector].declarations[i].value;
                            if(parseFloat(css[selector].declarations[i].value) != 0)
                            {
                                str += '%';
                            }
                            break;

                        case this.DataType.RGB:

                            str += 'rgb('
                            str += css[selector].declarations[i].value[0] + ',';
                            str += css[selector].declarations[i].value[1] + ',';
                            str += css[selector].declarations[i].value[2];
                            str += ')';
                            break;

                        case this.DataType.NUMBER:
                        case this.DataType.STRING:

                            str += css[selector].declarations[i].value;
                            break;

                        case this.DataType.FONT:

                            str += "'" + css[selector].declarations[i].value + "'";
                            break;

                        case this.DataType.URL:

                            str += "url('" + css[selector].declarations[i].value + "')";
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

    String.prototype.hash = function()
    {
        var hash = 0;
        if(this.length == 0) 
        {
            return hash;
        }
        for(var i = 0; i < this.length; i++) 
        {
            var char = this.charCodeAt(i);
            hash = ((hash<<5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function isNumeric(n) 
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};