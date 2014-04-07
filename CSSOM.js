/*
 * Title         : Cascading Style Sheets Object Model
 * Author        : Ramzi Komati 
 * Version       : 1.0
 * Last Modified : April 4th, 2014
 *
 * Example:
 * --------
 *          1.  var css = new CSSOM();
 *          2.
 *          3.  var body = css.setSelector('body');
 *          4.  body.appendDeclaration('margin-top', 10, css.DataType.PIXEL);
 *          5.  body.appendDeclaration('margin-left', 10, css.DataType.PIXEL);
 *          6.  
 *          7.  var h1 = css.setSelector('h1');
 *          8.  h1.appendDeclaration('font-size', 2.5, css.DataType.EM);
 *          9.  h1.appendDeclaration('color', [0, 0, 0], css.DataType.RGB);
 *          10.
 *          11. css.toString();
 */

var CSSOM = function CSSOM()
{
    this.DataType = {
        'PIXELS' : 1,
        'EM'     : 2,
        'NUMBER' : 3,
        'RGB'    : 4,
        'STRING' : 5,
        'FONT'   : 6,
        'URL'    : 7
    };

    var css = {};
    
    var Declaration = function Declaration(selector)
    {
        this.appendDeclaration = function(arg1, arg2, arg3)
        {
            if(typeof css[selector] === 'undefined')
            {
                throw new Error('Unable to append new declarations: selector does not exist.');
            }
            else
            {
                if(arg1.hasOwnProperty('property') && arg1.hasOwnProperty('value') && arg1.hasOwnProperty('datatype'))
                {
                    css[selector].push(arg1);
                }
                else if(!(typeof arg1 === 'undefined' || typeof arg2 === 'undefined' || typeof arg3 === 'undefined'))
                {
                    css[selector].push({
                        property : arg1,
                        value    : arg2,
                        datatype : arg3
                    });
                }
            }
        };
    };

    

    this.setSelector = function(selector)
    {
        if(css.hasOwnProperty(selector))
        {
            return -1;
        }
        else
        {
            // Create a new declaration for the css selector object
            css[selector] = new Array();
            return new Declaration(selector);
        }
    };

    this.getSelector = function(selector)
    {
        if(css.hasOwnProperty(selector))
        {
            return new Declaration(selector);
        }
        else
        {
            return -1;
        }
    };

    this.toString = function(minify)
    {
        const INDENT = '    '; // Indentation can be replaced by '\t'
        var str = '';

        if(typeof minify === 'undefined' || minify == false)
        {
            for(selector in css)
            {
                str += selector + ' {\n';
                for(var i = 0; i < css[selector].length; i++)
                {
                    str += INDENT + css[selector][i].property + ': ';
                    
                    switch(css[selector][i].datatype)
                    {
                        case 1:
                        case this.DataType.PIXELS:
                            str += css[selector][i].value;
                            str += 'px'
                            break;

                        case this.DataType.EM:
                            str += css[selector][i].value;
                            str += 'em'
                            break;

                        case this.DataType.RGB:
                            str += 'rgb('
                            str += css[selector][i].value[0] + ', ';
                            str += css[selector][i].value[1] + ', ';
                            str += css[selector][i].value[2];
                            str += ')';
                            break;

                        case this.DataType.NUMBER:
                        case this.DataType.STRING:
                            str += css[selector][i].value;
                            break;

                        case this.DataType.FONT:
                            str += "'" + css[selector][i].value + "'";
                            break;

                        case this.DataType.URL:
                            str += "url('" + css[selector][i].value + "')";
                            break;

                        default:
                            throw new Error('Invalid data type for CSS declaration rule: <' + css[selector].datatype) + '>';
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
                for(var i = 0; i < css[selector].length; i++)
                {
                    str += css[selector][i].property + ':';
                    
                    
                    switch(css[selector][i].datatype)
                    {
                        
                        case this.DataType.PIXEL:
                        case 1:
                            str += css[selector][i].value;
                            str += 'px'
                            break;

                        case this.DataType.EM:
                            str += css[selector][i].value;
                            str += 'em'
                            break;

                        case this.DataType.RGB:
                            str += 'rgb('
                            str += css[selector][i].value[0] + ',';
                            str += css[selector][i].value[1] + ',';
                            str += css[selector][i].value[2];
                            str += ')';
                            break;

                        case this.DataType.NUMBER:
                        case this.DataType.STRING:
                            str += css[selector][i].value;
                            break;

                        case this.DataType.FONT:
                            str += "'" + css[selector][i].value + "'";
                            break;

                        case this.DataType.URL:
                            str += "url('" + css[selector][i].value + "')";
                            break;

                        default:
                            throw new Error('Invalid data type for CSS declaration rule: <' + css[selector][i].datatype) + '>';
                    }

                    if(i != css[selector].length - 1)
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