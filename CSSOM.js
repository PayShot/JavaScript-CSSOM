/*
 * Title         : Cascading Style Sheets Object Model
 * Author        : Ramzi Komati 
 * Version       : 1.1
 * Last Modified : April 10th, 2014
 *
 */

var CSS_Object_Models = {};

var CSSOM = function CSSOM(CSSOM_Name)
{
    // Validate parameters
    if(typeof CSSOM_Name === 'undefined')
    {
        throw new Error('Unable to create a CSS Object Model since no name has been defined.');
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

    var Selector = function Selector(selector)
    {
        // Get the ID of the selector
        this.id = css[selector].id;

        // Get the name of the selector
        this.name = selector;

        // Get the class name of the selector
        this.className = (selector.substr(0, 1) == '.' ? selector.substr(1, selector.length - 1) : '');

        // Append a new declaration to the selector
        this.appendDeclaration = function(arg1, arg2, arg3)
        {
            // Generate an id with the following format ??????
            var id = Math.random() * 999999 +  100000;

            if(typeof css[selector] === 'undefined')
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
                    css[selector].declarations.push({
                        'id'       : id,
                        'property' : arg1,
                        'value'    : arg2,
                        'datatype' : arg3
                    });

                    CSS_Object_Models[CSSOM_Name].css = css;
                }
            }
        };

    };

    // Set a new selector to the CSSOM object model
    this.setSelector = function(selector, id)
    {
        if(css.hasOwnProperty(selector))
        {
            return -1;
        }
        else
        {
            // Create a new declaration for the css selector object
            if(typeof id === 'undefined')
            {
                // Generate a random id
                id = Math.random() * 999999 +  100000;
            }

            css[selector] = {
                'id'           : id,
                'declarations' : new Array()
            };

            cssHash[id] = selector;

            CSS_Object_Models[CSSOM_Name].css = css;
            CSS_Object_Models[CSSOM_Name].cssHash = cssHash;

            return new Selector(selector);
        }
    };

    // Get a specific selector from the CSSOM object model
    this.getSelector = function(selector)
    {
        if(typeof selector === 'undefined')
        {
            throw new Error('Unable to getSelector: Missing parameters.');
        }
        else
        {
            // If the argument is numeric than retrieve the selector name from cssHash
            if(isNumeric(selector))
            {
                if(cssHash.hasOwnProperty(selector))
                {
                    selector = cssHash[selector]
                }
                else
                {
                    return -1;
                }
            }

            // Return the Selector object
            if(css.hasOwnProperty(selector))
            {
                return new Selector(selector);
            }
            else
            {
                return -1;
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
            for(selector in css)
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
            for(selector in css)
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

    function isNumeric(n) 
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
};