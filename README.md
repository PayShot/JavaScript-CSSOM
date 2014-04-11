JavaScript-CSSOM
================

Create multiple Cascading Style Sheets Object Model in JavaScript.

This object can be very useful to generate your own CSS documents instead of concatenating strings.

The script adds all the indentation required and can minify the output too.

Example:
---------

```javascript
// Create CSSOM object
var style = new CSSOM('style.css');

// Create paragraph selector
var paragraph = style.setSelector('p');
paragraph.appendDeclaration('text-height', 100, style.DataType.PERCENTAGE);
paragraph.appendDeclaration('font-family', 'Arial-Bold', style.DataType.FONT);
paragraph.appendDeclaration('font-size', 1, style.DataType.EM);
paragraph.appendDeclaration('color', [255, 128, 0], style.DataType.RGB);

// Create .bold selector
var bold = style.setSelector('.bold');
bold.appendDeclaration('font-weight', 'bold', style.DataType.STRING);

// Return CSS
console.write(style.toString());
/*
 *  Output:
 *  -------
 *  p {
 *      text-height: 100%;
 *      font-family: 'Arial-Bold';
 *      font-size: 1em;
 *      color: rgb(255, 128, 0);
 *  }
 *  .bold {
 *      font-weight: bold;
 *  }
 */

// Return CSS minified
console.write(style.toString(true));
/*
 *  Output:
 *  -------
 *  p{text-height:100%;font-family:'Arial-Bold';font-size:1em;color:rgb(255,128,0)}
 *  .bold{font-weight:bold}
 */
```
