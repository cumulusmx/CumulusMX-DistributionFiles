    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/license                           |
    * o------------------------------------------------------------------------------o
    */

    /**
    * Initialise the various objects
    */
    if (typeof(RGraph) == 'undefined') RGraph = {isRGraph:true,type:'common'};

    RGraph.Registry       = {};
    RGraph.Registry.store = [];
    RGraph.Registry.store['chart.event.handlers']       = [];
    RGraph.Registry.store['__rgraph_event_listeners__'] = []; // Used in the new system for tooltips
    RGraph.background     = {};
    RGraph.objects        = [];
    RGraph.Resizing       = {};
    RGraph.events         = [];
    RGraph.cursor         = [];
    RGraph.DOM2Events     = {};

    RGraph.ObjectRegistry                    = {};
    RGraph.ObjectRegistry.objects            = {};
    RGraph.ObjectRegistry.objects.byUID      = [];
    RGraph.ObjectRegistry.objects.byCanvasID = [];


    /**
    * Some "constants"
    */
    HALFPI  = (Math.PI / 2);
    PI      = Math.PI;
    TWOPI   = PI * 2;
    ISOPERA = navigator.userAgent.indexOf('Opera') != -1;
    //ISIE     is defined below
    //ISIE6    is defined below
    //ISIE7    is defined below
    //ISIE8    is defined below
    //ISIE9    is defined below
    //ISIE9UP  is defined below
    //ISIE10   is defined below
    //ISIE10UP is defined below
    //ISOLD    is defined below


    /**
    * Returns five values which are used as a nice scale
    * 
    * @param  max int    The maximum value of the graph
    * @param  obj object The graph object
    * @return     array   An appropriate scale
    */
    RGraph.getScale = function (max, obj)
    {
        /**
        * Special case for 0
        */
        if (max == 0) {
            return ['0.2', '0.4', '0.6', '0.8', '1.0'];
        }

        var original_max = max;

        /**
        * Manually do decimals
        */
        if (max <= 1) {
            if (max > 0.5) {
                return [0.2,0.4,0.6,0.8, Number(1).toFixed(1)];

            } else if (max >= 0.1) {
                return obj.Get('chart.scale.round') ? [0.2,0.4,0.6,0.8,1] : [0.1,0.2,0.3,0.4,0.5];

            } else {

                var tmp = max;
                var exp = 0;

                while (tmp < 1.01) {
                    exp += 1;
                    tmp *= 10;
                }

                var ret = ['2e-' + exp, '4e-' + exp, '6e-' + exp, '8e-' + exp, '10e-' + exp];


                if (max <= ('5e-' + exp)) {
                    ret = ['1e-' + exp, '2e-' + exp, '3e-' + exp, '4e-' + exp, '5e-' + exp];
                }

                return ret;
            }
        }

        // Take off any decimals
        if (String(max).indexOf('.') > 0) {
            max = String(max).replace(/\.\d+$/, '');
        }

        var interval = Math.pow(10, Number(String(Number(max)).length - 1));
        var topValue = interval;

        while (topValue < max) {
            topValue += (interval / 2);
        }

        // Handles cases where the max is (for example) 50.5
        if (Number(original_max) > Number(topValue)) {
            topValue += (interval / 2);
        }

        // Custom if the max is greater than 5 and less than 10
        if (max < 10) {
            topValue = (Number(original_max) <= 5 ? 5 : 10);
        }
        
        /**
        * Added 02/11/2010 to create "nicer" scales
        */
        if (obj && typeof(obj.Get('chart.scale.round')) == 'boolean' && obj.Get('chart.scale.round')) {
            topValue = 10 * interval;
        }

        return [topValue * 0.2, topValue * 0.4, topValue * 0.6, topValue * 0.8, topValue];
    }


    /**
    * Returns the maximum numeric value which is in an array
    * 
    * @param  array arr The array (can also be a number, in which case it's returned as-is)
    * @param  int       Whether to ignore signs (ie negative/positive)
    * @return int       The maximum value in the array
    */
    RGraph.array_max = function (arr)
    {
        var max = null;
        
        if (typeof(arr) == 'number') {
            return arr;
        }
        
        for (var i=0; i<arr.length; ++i) {
            if (typeof(arr[i]) == 'number') {

                var val = arguments[1] ? Math.abs(arr[i]) : arr[i];
                
                if (typeof(max) == 'number') {
                    max = Math.max(max, val);
                } else {
                    max = val;
                }
            }
        }
        
        return max;
    }


    /**
    * Returns the maximum value which is in an array
    * 
    * @param  array arr The array
    * @param  int   len The length to pad the array to
    * @param  mixed     The value to use to pad the array (optional)
    */
    RGraph.array_pad = function (arr, len)
    {
        if (arr.length < len) {
            var val = arguments[2] ? arguments[2] : null;
            
            for (var i=arr.length; i<len; ++i) {
                arr[i] = val;
            }
        }
        
        return arr;
    }


    /**
    * An array sum function
    * 
    * @param  array arr The  array to calculate the total of
    * @return int       The summed total of the arrays elements
    */
    RGraph.array_sum = function (arr)
    {
        // Allow integers
        if (typeof(arr) == 'number') {
            return arr;
        }

        var i, sum;
        var len = arr.length;

        for(i=0,sum=0;i<len;sum+=arr[i++]);
        return sum;
    }



    /**
    * Takes any number of arguments and adds them to one big linear array
    * which is then returned
    * 
    * @param ... mixed The data to linearise. You can strings, booleans, numbers or arrays
    */
    RGraph.array_linearize = function ()
    {
        var arr = [];

        for (var i=0; i<arguments.length; ++i) {

            if (typeof(arguments[i]) == 'object' && arguments[i]) {
                for (var j=0; j<arguments[i].length; ++j) {
                    var sub = RGraph.array_linearize(arguments[i][j]);
                    
                    for (var k=0; k<sub.length; ++k) {
                        arr.push(sub[k]);
                    }
                }
            } else {
                arr.push(arguments[i]);
            }
        }

        return arr;
    }



    /**
    * This is a useful function which is basically a shortcut for drawing left, right, top and bottom alligned text.
    * 
    * @param object context The context
    * @param string font    The font
    * @param int    size    The size of the text
    * @param int    x       The X coordinate
    * @param int    y       The Y coordinate
    * @param string text    The text to draw
    * @parm  string         The vertical alignment. Can be null. "center" gives center aligned  text, "top" gives top aligned text.
    *                       Anything else produces bottom aligned text. Default is bottom.
    * @param  string        The horizontal alignment. Can be null. "center" gives center aligned  text, "right" gives right aligned text.
    *                       Anything else produces left aligned text. Default is left.
    * @param  bool          Whether to show a bounding box around the text. Defaults not to
    * @param int            The angle that the text should be rotate at (IN DEGREES)
    * @param string         Background color for the text
    * @param bool           Whether the text is bold or not
    */
    RGraph.Text = function (context, font, size, x, y, text)
    {
        // "Cache" the args as a local variable
        var args = arguments;

        // Handle undefined - change it to an empty string
        if ((typeof(text) != 'string' && typeof(text) != 'number') || text == 'undefined') {
            return;
        }




        /**
        * This accommodates multi-line text
        */
        if (typeof(text) == 'string' && text.match(/\r\n/)) {

            var dimensions = RGraph.MeasureText('M', args[11], font, size);

            /**
            * Measure the text (width and height)
            */

            var arr = text.split('\r\n');

            /**
            * Adjust the Y position
            */
            
            // This adjusts the initial y position
            if (args[6] && args[6] == 'center') y = (y - (dimensions[1] * ((arr.length - 1) / 2)));

            for (var i=1; i<arr.length; ++i) {
    
                RGraph.Text(context,
                            font,
                            size,
                            args[9] == -90 ? (x + (size * 1.5)) : x,
                            y + (dimensions[1] * i),
                            arr[i],
                            args[6] ? args[6] : null,
                            args[7],
                            args[8],
                            args[9],
                            args[10],
                            args[11],
                            args[12]);
            }
            
            // Update text to just be the first line
            text = arr[0];
        }


        // Accommodate MSIE
        if (document.all && ISOLD) {
            y += 2;
        }


        context.font = (args[11] ? 'Bold ': '') + size + 'pt ' + font;

        var i;
        var origX = x;
        var origY = y;
        var originalFillStyle = context.fillStyle;
        var originalLineWidth = context.lineWidth;

        // Need these now the angle can be specified, ie defaults for the former two args
        if (typeof(args[6])  == 'undefined') args[6]  = 'bottom'; // Vertical alignment. Default to bottom/baseline
        if (typeof(args[7])  == 'undefined') args[7]  = 'left';   // Horizontal alignment. Default to left
        if (typeof(args[8])  == 'undefined') args[8]  = null;     // Show a bounding box. Useful for positioning during development. Defaults to false
        if (typeof(args[9])  == 'undefined') args[9]  = 0;        // Angle (IN DEGREES) that the text should be drawn at. 0 is middle right, and it goes clockwise

        // The alignment is recorded here for purposes of Opera compatibility
        if (navigator.userAgent.indexOf('Opera') != -1) {
            context.canvas.__rgraph_valign__ = args[6];
            context.canvas.__rgraph_halign__ = args[7];
        }

        // First, translate to x/y coords
        context.save();

            context.canvas.__rgraph_originalx__ = x;
            context.canvas.__rgraph_originaly__ = y;

            context.translate(x, y);
            x = 0;
            y = 0;

            // Rotate the canvas if need be
            if (args[9]) {
                context.rotate(args[9] / (180 / PI));
            }


            // Vertical alignment - defaults to bottom
            if (args[6]) {

                var vAlign = args[6];

                if (vAlign == 'center') {
                    context.textBaseline = 'middle';
                } else if (vAlign == 'top') {
                    context.textBaseline = 'top';
                }
            }


            // Hoeizontal alignment - defaults to left
            if (args[7]) {

                var hAlign = args[7];
                var width  = context.measureText(text).width;
    
                if (hAlign) {
                    if (hAlign == 'center') {
                        context.textAlign = 'center';
                    } else if (hAlign == 'right') {
                        context.textAlign = 'right';
                    }
                }
            }
            
            
            context.fillStyle = originalFillStyle;

            /**
            * Draw a bounding box if requested
            */
            context.save();
                 context.fillText(text,0,0);
                 context.lineWidth = 1;
                
                if (args[8]) {

                    var width = context.measureText(text).width;
                    var width_offset = (hAlign == 'center' ? (width / 2) : (hAlign == 'right' ? width : 0));
                    var height = size * 1.4; // !!!
                    var height_offset = (vAlign == 'center' ? (height / 2) : (vAlign == 'top' ? height : 0));
                    var ieOffset = ISOLD ? 2 : 0;


                    context.strokeRect(-3 - width_offset,
                                       0 - 3 - height - ieOffset + height_offset,
                                       width + 6,
                                       height + 6);
                    /**
                    * If requested, draw a background for the text
                    */
                    if (args[10]) {
                        context.fillStyle = args[10];
                        context.fillRect(-3 - width_offset,
                                           0 - 3 - height - ieOffset + height_offset,
                                           width + 6,
                                           height + 6);
                    }
                    
                    context.fillStyle = originalFillStyle;


                    /**
                    * Do the actual drawing of the text
                    */
                    context.fillText(text,0,0);
                }
            context.restore();
            
            // Reset the lineWidth
            context.lineWidth = originalLineWidth;

        context.restore();
    }


    /**
    * Clears the canvas by setting the width. You can specify a colour if you wish.
    * 
    * @param object canvas The canvas to clear
    */
    RGraph.Clear = function (canvas)
    {
        if (!canvas) {
            return;
        }
        
        RGraph.FireCustomEvent(canvas.__object__, 'onbeforeclear');

        var context = canvas.getContext('2d');
        var color   = arguments[1];

        if (ISIE8 && !color) {
            color = 'white';
        }

        /**
        * Can now clear the canvas back to fully transparent
        */
        if (!color || (color && color == 'rgba(0,0,0,0)' || color == 'transparent')) {

            context.clearRect(0,0,canvas.width, canvas.height);
            
            // Reset the globalCompositeOperation
            context.globalCompositeOperation = 'source-over';

        } else {

            context.fillStyle = color;
            context = canvas.getContext('2d');
            context.beginPath();

            if (ISIE8) {
                context.fillRect(0,0,canvas.width,canvas.height);
            } else {
                context.fillRect(-10,-10,canvas.width + 20,canvas.height + 20);
            }

            context.fill();
        }
        
        if (RGraph.ClearAnnotations) {
            //RGraph.ClearAnnotations(canvas.id);
        }
        
        /**
        * This removes any background image that may be present
        */
        if (RGraph.Registry.Get('chart.background.image.' + canvas.id)) {
            var img = RGraph.Registry.Get('chart.background.image.' + canvas.id);
            img.style.position = 'absolute';
            img.style.left     = '-10000px';
            img.style.top      = '-10000px';
        }
        
        /**
        * This hides the tooltip that is showing IF it has the same canvas ID as
        * that which is being cleared
        */
        if (RGraph.Registry.Get('chart.tooltip')) {
            RGraph.HideTooltip();
            //RGraph.Redraw();
        }

        /**
        * Set the cursor to default
        */
        canvas.style.cursor = 'default';

        RGraph.FireCustomEvent(canvas.__object__, 'onclear');
    }


    /**
    * Draws the title of the graph
    * 
    * @param object  canvas The canvas object
    * @param string  text   The title to write
    * @param integer gutter The size of the gutter
    * @param integer        The center X point (optional - if not given it will be generated from the canvas width)
    * @param integer        Size of the text. If not given it will be 14
    */
    RGraph.DrawTitle = function (obj, text, gutterTop)
    {
        var canvas       = obj.canvas;
        var context      = obj.context;
        var gutterLeft   = obj.Get('chart.gutter.left');
        var gutterRight  = obj.Get('chart.gutter.right');
        var gutterTop    = obj.Get('chart.gutter.top');
        var gutterBottom = obj.Get('chart.gutter.bottom');
        var size         = arguments[4] ? arguments[4] : 12;
        var bold         = obj.Get('chart.title.bold');
        var centerx      = (arguments[3] ? arguments[3] : ((obj.canvas.width - gutterLeft - gutterRight) / 2) + gutterLeft);
        var keypos       = obj.Get('chart.key.position');
        var vpos         = obj.Get('chart.title.vpos');
        var hpos         = obj.Get('chart.title.hpos');
        var bgcolor      = obj.Get('chart.title.background');
        var x            = obj.Get('chart.title.x');
        var y            = obj.Get('chart.title.y');
        var halign       = 'center';
        var valign       = 'center';

        // Account for 3D effect by faking the key position
        if (obj.type == 'bar' && obj.Get('chart.variant') == '3d') {
            keypos = 'gutter';
        }

        context.beginPath();
        context.fillStyle = obj.Get('chart.text.color') ? obj.Get('chart.text.color') : 'black';





        /**
        * Vertically center the text if the key is not present
        */
        if (keypos && keypos != 'gutter') {
            var valign = 'center';

        } else if (!keypos) {
            var valign = 'center';

        } else {
            var valign = 'bottom';
        }





        // if chart.title.vpos is a number, use that
        if (typeof(obj.Get('chart.title.vpos')) == 'number') {
            vpos = obj.Get('chart.title.vpos') * gutterTop;

            if (obj.Get('chart.xaxispos') == 'top') {
                vpos = obj.Get('chart.title.vpos') * gutterBottom + gutterTop + (obj.canvas.height - gutterTop - gutterBottom);
            }

        } else {
            vpos = gutterTop - size - 5;

            if (obj.Get('chart.xaxispos') == 'top') {
                vpos = obj.canvas.height  - gutterBottom + size + 5;
            }
        }




        // if chart.title.hpos is a number, use that. It's multiplied with the (entire) canvas width
        if (typeof(hpos) == 'number') {
            centerx = hpos * canvas.width;
        }

        /**
        * Now the chart.title.x and chart.title.y settings override (is set) the above
        */
        if (typeof(x) == 'number') {
            centerx = x;
        }

        if (typeof(y) == 'number') {
            vpos = y;
        }




        /**
        * Horizontal alignment can now (Jan 2013) be specified
        */
        if (typeof(obj.properties['chart.title.halign']) == 'string') {
            halign = obj.properties['chart.title.halign'];
        }
        
        /**
        * Vertical alignment can now (Jan 2013) be specified
        */
        if (typeof(obj.properties['chart.title.valign']) == 'string') {
            valign = obj.properties['chart.title.valign'];
        }




        
        // Set the colour
        if (typeof(obj.Get('chart.title.color') != null)) {
            var oldColor = context.fillStyle
            var newColor = obj.Get('chart.title.color')
            context.fillStyle = newColor ? newColor : 'black';
        }




        /**
        * Default font is Arial
        */
        var font = obj.Get('chart.text.font');




        /**
        * Override the default font with chart.title.font
        */
        if (typeof(obj.Get('chart.title.font')) == 'string') {
            font = obj.Get('chart.title.font');
        }




        /**
        * Draw the title
        */
        RGraph.Text(context,
                    font,
                    size,
                    centerx,
                    vpos,
                    text,
                    valign,
                    halign,
                    bgcolor != null,
                    null,
                    bgcolor,
                    bold);
        
        // Reset the fill colour
        context.fillStyle = oldColor;
    }



    /**
    * This function returns the mouse position in relation to the canvas
    * 
    * @param object e The event object.
    *
    RGraph.getMouseXY = function (e)
    {
        var el = (ISOLD ? event.srcElement : e.target);
        var x;
        var y;

        // ???
        var paddingLeft = el.style.paddingLeft ? parseInt(el.style.paddingLeft) : 0;
        var paddingTop  = el.style.paddingTop ? parseInt(el.style.paddingTop) : 0;
        var borderLeft  = el.style.borderLeftWidth ? parseInt(el.style.borderLeftWidth) : 0;
        var borderTop   = el.style.borderTopWidth  ? parseInt(el.style.borderTopWidth) : 0;
        
        if (ISIE8) e = event;

        // Browser with offsetX and offsetY
        if (typeof(e.offsetX) == 'number' && typeof(e.offsetY) == 'number') {
            x = e.offsetX;
            y = e.offsetY;

        // FF and other
        } else {
            x = 0;
            y = 0;

            while (el != document.body && el) {
                x += el.offsetLeft;
                y += el.offsetTop;

                el = el.offsetParent;
            }

            x = e.pageX - x;
            y = e.pageY - y;
        }

        return [x, y];
    }*/


    RGraph.getMouseXY = function(e)
    {
        var el      = e.target;
        var ca      = el;
        var offsetX = 0;
        var offsetY = 0;
        var x;
        var y;


        // Add padding and border style widths to offset
        var additionalX =  (parseInt(ca.style.borderLeftWidth) || 0) + (parseInt(ca.style.paddingLeft) || 0);
        var additionalY = (parseInt(ca.style.borderTopWidth) || 0) + (parseInt(ca.style.paddingTop) || 0);


        if (typeof(e.offsetX) == 'number' && typeof(e.offsetY) == 'number') {

            x = e.offsetX - additionalX;
            y = e.offsetY - additionalY;

        } else {

            if (typeof(el.offsetParent) != 'undefined') {
                do {
                    offsetX += el.offsetLeft;
                    offsetY += el.offsetTop;
                } while ((el = el.offsetParent));
            }

    
            x = e.pageX - offsetX - additionalX;
            y = e.pageY - offsetY - additionalY;
        }

        // We return a simple javascript object (a hash) with x and y defined
        return [x, y];
    }


    /**
    * This function returns a two element array of the canvas x/y position in
    * relation to the page
    * 
    * @param object canvas
    */
    RGraph.getCanvasXY = function (canvas)
    {
        var x   = 0;
        var y   = 0;
        var obj = canvas;

        do {

            x += obj.offsetLeft;
            y += obj.offsetTop;

            obj = obj.offsetParent;

        } while (obj && obj.tagName.toLowerCase() != 'body');


        var paddingLeft = canvas.style.paddingLeft ? parseInt(canvas.style.paddingLeft) : 0;
        var paddingTop  = canvas.style.paddingTop ? parseInt(canvas.style.paddingTop) : 0;
        var borderLeft  = canvas.style.borderLeftWidth ? parseInt(canvas.style.borderLeftWidth) : 0;
        var borderTop   = canvas.style.borderTopWidth  ? parseInt(canvas.style.borderTopWidth) : 0;

        return [x + paddingLeft + borderLeft, y + paddingTop + borderTop];
    }


    /**
    * Registers a graph object (used when the canvas is redrawn)
    * 
    * @param object obj The object to be registered
    */
    RGraph.Register = function (obj)
    {
        // Checking this property ensures the object is only registered once
        if (!obj.Get('chart.noregister')) {
            // As of 21st/1/2012 the object registry is now used
            RGraph.ObjectRegistry.Add(obj);
            obj.Set('chart.noregister', true);
        }
    }


    /**
    * Causes all registered objects to be redrawn
    * 
    * @param string An optional color to use to clear the canvas
    */
    RGraph.Redraw = function ()
    {
        var objectRegistry = RGraph.ObjectRegistry.objects.byCanvasID;

        // Get all of the canvas tags on the page
        var tags = document.getElementsByTagName('canvas');
        for (var i=0; i<tags.length; ++i) {
            if (tags[i].__object__ && tags[i].__object__.isRGraph) {
                
                // Only clear the canvas if it's not Trace'ing - this applies to the Line/Scatter Trace effects
                if (!tags[i].noclear) {
                    RGraph.Clear(tags[i], arguments[0] ? arguments[0] : null);
                }
            }
        }

        // Go through the object registry and redraw *all* of the canvas'es that have been registered
        for (var i=0; i<objectRegistry.length; ++i) {
            if (objectRegistry[i]) {
                var id = objectRegistry[i][0];
                objectRegistry[i][1].Draw();
            }
        }
    }



    /**
    * Causes all registered objects ON THE GIVEN CANVAS to be redrawn
    * 
    * @param canvas object The canvas object to redraw
    * @param        bool   Optional boolean which defaults to true and determines whether to clear the canvas
    */
    RGraph.RedrawCanvas = function (canvas)
    {
        var objects = RGraph.ObjectRegistry.getObjectsByCanvasID(canvas.id);

        /**
        * First clear the canvas
        */
        if (!arguments[1] || (typeof(arguments[1]) == 'boolean' && !arguments[1] == false) ) {
            RGraph.Clear(canvas);
        }

        /**
        * Now redraw all the charts associated with that canvas
        */
        for (var i=0; i<objects.length; ++i) {
            if (objects[i]) {
                if (objects[i] && objects[i].isRGraph) { // Is it an RGraph object ??
                    objects[i].Draw();
                }
            }
        }
    }


    /**
    * This function draws the background for the bar chart, line chart and scatter chart.
    * 
    * @param  object obj The graph object
    */
    RGraph.background.Draw = function (obj)
    {
        var canvas       = obj.canvas;
        var context      = obj.context;
        var height       = 0;
        var gutterLeft   = obj.Get('chart.gutter.left');
        var gutterRight  = obj.Get('chart.gutter.right');
        var gutterTop    = obj.Get('chart.gutter.top');
        var gutterBottom = obj.Get('chart.gutter.bottom');
        var variant      = obj.Get('chart.variant');
        
        context.fillStyle = obj.Get('chart.text.color');
        
        // If it's a bar and 3D variant, translate
        if (variant == '3d') {
            context.save();
            context.translate(10, -5);
        }

        // X axis title
        if (typeof(obj.Get('chart.title.xaxis')) == 'string' && obj.Get('chart.title.xaxis').length) {
        
            var size = obj.Get('chart.text.size') + 2;
            var font = obj.Get('chart.text.font');
            var bold = obj.Get('chart.title.xaxis.bold');

            if (typeof(obj.Get('chart.title.xaxis.size')) == 'number') {
                size = obj.Get('chart.title.xaxis.size');
            }

            if (typeof(obj.Get('chart.title.xaxis.font')) == 'string') {
                font = obj.Get('chart.title.xaxis.font');
            }
            
            var hpos = ((obj.canvas.width - obj.gutterLeft - obj.gutterRight) / 2) + obj.gutterLeft;
            var vpos = obj.canvas.height - obj.Get('chart.gutter.bottom') + 25;
            
            if (typeof(obj.Get('chart.title.xaxis.pos')) == 'number') {
                vpos = obj.canvas.height - (gutterBottom * obj.Get('chart.title.xaxis.pos'));
            }
        
            context.beginPath();
            RGraph.Text(context,
                        font,
                        size,
                        hpos,
                        vpos,
                        obj.Get('chart.title.xaxis'),
                        'center',
                        'center',
                        false,
                        false,
                        false,
                        bold);
            context.fill();
        }

        // Y axis title
        if (typeof(obj.Get('chart.title.yaxis')) == 'string' && obj.Get('chart.title.yaxis').length) {

            var size  = obj.Get('chart.text.size') + 2;
            var font  = obj.Get('chart.text.font');
            var angle = 270;
            var bold  = obj.Get('chart.title.yaxis.bold');
            var color = obj.Get('chart.title.yaxis.color');

            if (typeof(obj.Get('chart.title.yaxis.pos')) == 'number') {
                var yaxis_title_pos = obj.Get('chart.title.yaxis.pos') * obj.Get('chart.gutter.left');
            } else {
                var yaxis_title_pos = ((obj.Get('chart.gutter.left') - 25) / obj.Get('chart.gutter.left')) * obj.Get('chart.gutter.left');
            }

            if (typeof(obj.Get('chart.title.yaxis.size')) == 'number') {
                size = obj.Get('chart.title.yaxis.size');
            }

            if (typeof(obj.Get('chart.title.yaxis.font')) == 'string') {
                font = obj.Get('chart.title.yaxis.font');
            }

            if (obj.Get('chart.title.yaxis.align') == 'right' || obj.Get('chart.title.yaxis.position') == 'right') {
                angle = 90;
                yaxis_title_pos = obj.Get('chart.title.yaxis.pos') ? (obj.canvas.width - obj.Get('chart.gutter.right')) + (obj.Get('chart.title.yaxis.pos') * obj.Get('chart.gutter.right')) :
                                                                     obj.canvas.width - obj.Get('chart.gutter.right') + obj.Get('chart.text.size') + 5;
            } else {
                yaxis_title_pos = yaxis_title_pos;
            }
            

            context.beginPath();
            context.fillStyle = color;
            RGraph.Text(context,
                        font,
                        size,
                        yaxis_title_pos,
                        ((obj.canvas.height - obj.gutterTop - obj.gutterBottom) / 2) + obj.gutterTop,
                        obj.Get('chart.title.yaxis'),
                        'center',
                        'center',
                        false,
                        angle,
                        false,
                        bold);
            context.fill();
        }

        obj.context.beginPath();

        // Draw the horizontal bars
        context.fillStyle = obj.Get('chart.background.barcolor1');
        height = (obj.canvas.height - gutterBottom);

        for (var i=gutterTop; i < height ; i+=80) {
            obj.context.fillRect(gutterLeft, i, obj.canvas.width - gutterLeft - gutterRight, Math.min(40, obj.canvas.height - gutterBottom - i) );
        }

            context.fillStyle = obj.Get('chart.background.barcolor2');
            height = (RGraph.GetHeight(obj) - gutterBottom);
    
            for (var i= (40 + gutterTop); i < height; i+=80) {
                obj.context.fillRect(gutterLeft, i, obj.canvas.width - gutterLeft - gutterRight, i + 40 > (obj.canvas.height - gutterBottom) ? obj.canvas.height - (gutterBottom + i) : 40);
            }
            
            context.stroke();
    

        // Draw the background grid
        if (obj.Get('chart.background.grid')) {

            // If autofit is specified, use the .numhlines and .numvlines along with the width to work
            // out the hsize and vsize
            if (obj.Get('chart.background.grid.autofit')) {

                /**
                * Align the grid to the tickmarks
                */
                if (obj.Get('chart.background.grid.autofit.align')) {
                    // Align the horizontal lines
                    obj.Set('chart.background.grid.autofit.numhlines', obj.Get('chart.ylabels.count'));

                    // Align the vertical lines for the line
                    if (obj.type == 'line') {
                        if (obj.Get('chart.labels') && obj.Get('chart.labels').length) {
                            obj.Set('chart.background.grid.autofit.numvlines', obj.Get('chart.labels').length - 1);
                        } else {
                            obj.Set('chart.background.grid.autofit.numvlines', obj.data[0].length - 1);
                        }

                    // Align the vertical lines for the bar
                    } else if (obj.type == 'bar' && obj.Get('chart.labels') && obj.Get('chart.labels').length) {
                        obj.Set('chart.background.grid.autofit.numvlines', obj.Get('chart.labels').length);
                    }
                }

                var vsize = ((obj.canvas.width - gutterLeft - gutterRight)) / obj.properties['chart.background.grid.autofit.numvlines'];
                var hsize = (obj.canvas.height - gutterTop - gutterBottom) / obj.properties['chart.background.grid.autofit.numhlines'];

                obj.Set('chart.background.grid.vsize', vsize);
                obj.Set('chart.background.grid.hsize', hsize);
            }

            context.beginPath();
            context.lineWidth   = obj.Get('chart.background.grid.width') ? obj.Get('chart.background.grid.width') : 1;
            context.strokeStyle = obj.Get('chart.background.grid.color');

            // Draw the horizontal lines
            if (obj.Get('chart.background.grid.hlines')) {
                height = (RGraph.GetHeight(obj) - gutterBottom)
                for (y=gutterTop; y<height; y+=obj.Get('chart.background.grid.hsize')) {
                    context.moveTo(gutterLeft, Math.round(y));
                    context.lineTo(obj.canvas.width - gutterRight, Math.round(y));
                }
            }

            if (obj.Get('chart.background.grid.vlines')) {
                // Draw the vertical lines
                var width = (obj.canvas.width - gutterRight)
                for (x=gutterLeft; x<=width; x+=obj.Get('chart.background.grid.vsize')) {
                    context.moveTo(Math.round(x), gutterTop);
                    context.lineTo(Math.round(x), obj.canvas.height - gutterBottom);
                }
            }

            if (obj.Get('chart.background.grid.border')) {
                // Make sure a rectangle, the same colour as the grid goes around the graph
                context.strokeStyle = obj.Get('chart.background.grid.color');
                context.strokeRect(Math.round(gutterLeft), Math.round(gutterTop), obj.canvas.width - gutterLeft - gutterRight, obj.canvas.height - gutterTop - gutterBottom);
            }
        }

        context.stroke();

        // If it's a bar and 3D variant, translate
        if (variant == '3d') {
            context.restore();
        }

        // Draw the title if one is set
        if ( typeof(obj.Get('chart.title')) == 'string') {

            if (obj.type == 'gantt') {
                gutterTop -= 10;
            }

            RGraph.DrawTitle(obj,
                             obj.Get('chart.title'),
                             gutterTop,
                             null,
                             obj.Get('chart.title.size') ? obj.Get('chart.title.size') : obj.Get('chart.text.size') + 2);
        }

        context.stroke();
    }


    /**
    * Returns the day number for a particular date. Eg 1st February would be 32
    * 
    * @param   object obj A date object
    * @return  int        The day number of the given date
    */
    RGraph.GetDays = function (obj)
    {
        var year  = obj.getFullYear();
        var days  = obj.getDate();
        var month = obj.getMonth();

        if (month == 0) return days;
        if (month >= 1) days += 31; 
        if (month >= 2) days += 28;

        // Leap years. Crude, but it functions
        if (year >= 2008 && year % 4 == 0) days += 1;

        if (month >= 3) days += 31;
        if (month >= 4) days += 30;
        if (month >= 5) days += 31;
        if (month >= 6) days += 30;
        if (month >= 7) days += 31;
        if (month >= 8) days += 31;
        if (month >= 9) days += 30;
        if (month >= 10) days += 31;
        if (month >= 11) days += 30;
        
        return days;
    }


    /**
    * Makes a clone of an object
    * 
    * @param obj val The object to clone
    */
    RGraph.array_clone = function (obj)
    {
        if(obj == null || typeof(obj) != 'object') {
            return obj;
        }

        var temp = [];

        for (var i=0;i<obj.length; ++i) {

            if (typeof(obj[i]) == 'number') {
                temp[i] = (function (arg) {return Number(arg);})(obj[i]);
            } else if (typeof(obj[i]) == 'string') {
                temp[i] = (function (arg) {return String(arg);})(obj[i]);
            } else if (typeof(obj[i]) == 'function') {
                temp[i] = obj[i];
            
            } else {
                temp[i] = RGraph.array_clone(obj[i]);
            }
        }

        return temp;
    }


    /**
    * Formats a number with thousand seperators so it's easier to read
    * 
    * @param  integer obj The chart object
    * @param  integer num The number to format
    * @param  string      The (optional) string to prepend to the string
    * @param  string      The (optional) string to append to the string
    * @return string      The formatted number
    */
    RGraph.number_format = function (obj, num)
    {
        var i;
        var prepend = arguments[2] ? String(arguments[2]) : '';
        var append  = arguments[3] ? String(arguments[3]) : '';
        var output  = '';
        var decimal = '';
        var decimal_seperator  = obj.Get('chart.scale.point') ? obj.Get('chart.scale.point') : '.';
        var thousand_seperator = obj.Get('chart.scale.thousand') ? obj.Get('chart.scale.thousand') : ',';
        RegExp.$1   = '';
        var i,j;

        if (typeof(obj.Get('chart.scale.formatter')) == 'function') {
            return obj.Get('chart.scale.formatter')(obj, num);
        }

        // Ignore the preformatted version of "1e-2"
        if (String(num).indexOf('e') > 0) {
            return String(prepend + String(num) + append);
        }

        // We need then number as a string
        num = String(num);
        
        // Take off the decimal part - we re-append it later
        if (num.indexOf('.') > 0) {
            var tmp = num;
            num     = num.replace(/\.(.*)/, ''); // The front part of the number
            decimal = tmp.replace(/(.*)\.(.*)/, '$2'); // The decimal part of the number
        }

        // Thousand seperator
        //var seperator = arguments[1] ? String(arguments[1]) : ',';
        var seperator = thousand_seperator;
        
        /**
        * Work backwards adding the thousand seperators
        */
        var foundPoint;
        for (i=(num.length - 1),j=0; i>=0; j++,i--) {
            var character = num.charAt(i);
            
            if ( j % 3 == 0 && j != 0) {
                output += seperator;
            }
            
            /**
            * Build the output
            */
            output += character;
        }
        
        /**
        * Now need to reverse the string
        */
        var rev = output;
        output = '';
        for (i=(rev.length - 1); i>=0; i--) {
            output += rev.charAt(i);
        }

        // Tidy up
        //output = output.replace(/^-,/, '-');
        if (output.indexOf('-' + obj.Get('chart.scale.thousand')) == 0) {
            output = '-' + output.substr(('-' + obj.Get('chart.scale.thousand')).length);
        }

        // Reappend the decimal
        if (decimal.length) {
            output =  output + decimal_seperator + decimal;
            decimal = '';
            RegExp.$1 = '';
        }

        // Minor bugette
        if (output.charAt(0) == '-') {
            output = output.replace(/-/, '');
            prepend = '-' + prepend;
        }

        return prepend + output + append;
    }


    /**
    * Draws horizontal coloured bars on something like the bar, line or scatter
    */
    RGraph.DrawBars = function (obj)
    {
        var hbars = obj.Get('chart.background.hbars');

        /**
        * Draws a horizontal bar
        */
        obj.context.beginPath();
        
        for (i=0; i<hbars.length; ++i) {
            
            // If null is specified as the "height", set it to the upper max value
            if (hbars[i][1] == null) {
                hbars[i][1] = obj.max;
            
            // If the first index plus the second index is greater than the max value, adjust accordingly
            } else if (hbars[i][0] + hbars[i][1] > obj.max) {
                hbars[i][1] = obj.max - hbars[i][0];
            }


            // If height is negative, and the abs() value is greater than .max, use a negative max instead
            if (Math.abs(hbars[i][1]) > obj.max) {
                hbars[i][1] = -1 * obj.max;
            }


            // If start point is greater than max, change it to max
            if (Math.abs(hbars[i][0]) > obj.max) {
                hbars[i][0] = obj.max;
            }
            
            // If start point plus height is less than negative max, use the negative max plus the start point
            if (hbars[i][0] + hbars[i][1] < (-1 * obj.max) ) {
                hbars[i][1] = -1 * (obj.max + hbars[i][0]);
            }

            // If the X axis is at the bottom, and a negative max is given, warn the user
            if (obj.Get('chart.xaxispos') == 'bottom' && (hbars[i][0] < 0 || (hbars[i][1] + hbars[i][1] < 0)) ) {
                alert('[' + obj.type.toUpperCase() + ' (ID: ' + obj.id + ') BACKGROUND HBARS] You have a negative value in one of your background hbars values, whilst the X axis is in the center');
            }

            var ystart = (obj.grapharea - (((hbars[i][0] - obj.min) / (obj.max - obj.min)) * obj.grapharea));
            var height = (Math.min(hbars[i][1], obj.max - hbars[i][0]) / (obj.max - obj.min)) * obj.grapharea;

            // Account for the X axis being in the center
            if (obj.Get('chart.xaxispos') == 'center') {
                ystart /= 2;
                height /= 2;
            }
            
            ystart += obj.Get('chart.gutter.top')

            var x = obj.Get('chart.gutter.left');
            var y = ystart - height;
            var w = obj.canvas.width - obj.Get('chart.gutter.left') - obj.Get('chart.gutter.right');
            var h = height;
            
            // Accommodate Opera :-/
            if (navigator.userAgent.indexOf('Opera') != -1 && obj.Get('chart.xaxispos') == 'center' && h < 0) {
                h *= -1;
                y = y - h;
            }
            
            /**
            * Account for X axis at the top
            */
            if (obj.Get('chart.xaxispos') == 'top') {
                y  = obj.canvas.height - y;
                h *= -1;
            }

            obj.context.fillStyle = hbars[i][2];
            obj.context.fillRect(x, y, w, h);
        }

        obj.context.fill();
    }


    /**
    * Draws in-graph labels.
    * 
    * @param object obj The graph object
    */
    RGraph.DrawInGraphLabels = function (obj)
    {
        var canvas  = obj.canvas;
        var context = obj.context;
        var labels  = obj.Get('chart.labels.ingraph');
        var labels_processed = [];

        // Defaults
        var fgcolor   = 'black';
        var bgcolor   = 'white';
        var direction = 1;

        if (!labels) {
            return;
        }

        /**
        * Preprocess the labels array. Numbers are expanded
        */
        for (var i=0; i<labels.length; ++i) {
            if (typeof(labels[i]) == 'number') {
                for (var j=0; j<labels[i]; ++j) {
                    labels_processed.push(null);
                }
            } else if (typeof(labels[i]) == 'string' || typeof(labels[i]) == 'object') {
                labels_processed.push(labels[i]);
            
            } else {
                labels_processed.push('');
            }
        }

        /**
        * Turn off any shadow
        */
        RGraph.NoShadow(obj);

        if (labels_processed && labels_processed.length > 0) {

            for (var i=0; i<labels_processed.length; ++i) {
                if (labels_processed[i]) {
                    var coords = obj.coords[i];
                    
                    if (coords && coords.length > 0) {
                        var x      = (obj.type == 'bar' ? coords[0] + (coords[2] / 2) : coords[0]);
                        var y      = (obj.type == 'bar' ? coords[1] + (coords[3] / 2) : coords[1]);
                        var length = typeof(labels_processed[i][4]) == 'number' ? labels_processed[i][4] : 25;
    
                        context.beginPath();
                        context.fillStyle   = 'black';
                        context.strokeStyle = 'black';
                        
    
                        if (obj.type == 'bar') {
                        
                            /**
                            * X axis at the top
                            */
                            if (obj.Get('chart.xaxispos') == 'top') {
                                length *= -1;
                            }
    
                            if (obj.Get('chart.variant') == 'dot') {
                                context.moveTo(Math.round(x), obj.coords[i][1] - 5);
                                context.lineTo(Math.round(x), obj.coords[i][1] - 5 - length);
                                
                                var text_x = Math.round(x);
                                var text_y = obj.coords[i][1] - 5 - length;
                            
                            } else if (obj.Get('chart.variant') == 'arrow') {
                                context.moveTo(Math.round(x), obj.coords[i][1] - 5);
                                context.lineTo(Math.round(x), obj.coords[i][1] - 5 - length);
                                
                                var text_x = Math.round(x);
                                var text_y = obj.coords[i][1] - 5 - length;
                            
                            } else {
    
                                context.arc(Math.round(x), y, 2.5, 0, 6.28, 0);
                                context.moveTo(Math.round(x), y);
                                context.lineTo(Math.round(x), y - length);

                                var text_x = Math.round(x);
                                var text_y = y - length;
                            }

                            context.stroke();
                            context.fill();
                            
    
                        } else if (obj.type == 'line') {
                        
                            if (
                                typeof(labels_processed[i]) == 'object' &&
                                typeof(labels_processed[i][3]) == 'number' &&
                                labels_processed[i][3] == -1
                               ) {

                                context.moveTo(Math.round(x), y + 5);
                                context.lineTo(Math.round(x), y + 5 + length);
                                
                                context.stroke();
                                context.beginPath();                                
                                
                                // This draws the arrow
                                context.moveTo(Math.round(x), y + 5);
                                context.lineTo(Math.round(x) - 3, y + 10);
                                context.lineTo(Math.round(x) + 3, y + 10);
                                context.closePath();
                                
                                var text_x = x;
                                var text_y = y + 5 + length;
                            
                            } else {
                                
                                var text_x = x;
                                var text_y = y - 5 - length;

                                context.moveTo(Math.round(x), y - 5);
                                context.lineTo(Math.round(x), y - 5 - length);
                                
                                context.stroke();
                                context.beginPath();
                                
                                // This draws the arrow
                                context.moveTo(Math.round(x), y - 5);
                                context.lineTo(Math.round(x) - 3, y - 10);
                                context.lineTo(Math.round(x) + 3, y - 10);
                                context.closePath();
                            }
                        
                            context.fill();
                        }

                        // Taken out on the 10th Nov 2010 - unnecessary
                        //var width = context.measureText(labels[i]).width;
                        
                        context.beginPath();
                            
                            // Fore ground color
                            context.fillStyle = (typeof(labels_processed[i]) == 'object' && typeof(labels_processed[i][1]) == 'string') ? labels_processed[i][1] : 'black';

                            RGraph.Text(context,
                                        obj.Get('chart.text.font'),
                                        obj.Get('chart.text.size'),
                                        text_x,
                                        text_y,
                                        (typeof(labels_processed[i]) == 'object' && typeof(labels_processed[i][0]) == 'string') ? labels_processed[i][0] : labels_processed[i],
                                        'bottom',
                                        'center',
                                        true,
                                        null,
                                        (typeof(labels_processed[i]) == 'object' && typeof(labels_processed[i][2]) == 'string') ? labels_processed[i][2] : 'white');
                        context.fill();
                    }
                }
            }
        }
    }


    /**
    * This function "fills in" key missing properties that various implementations lack
    * 
    * @param object e The event object
    */
    RGraph.FixEventObject = function (e)
    {
        if (ISOLD) {
            var e = event;

            e.pageX  = (event.clientX + document.body.scrollLeft);
            e.pageY  = (event.clientY + document.body.scrollTop);
            e.target = event.srcElement;
            
            if (!document.body.scrollTop && document.documentElement.scrollTop) {
                e.pageX += parseInt(document.documentElement.scrollLeft);
                e.pageY += parseInt(document.documentElement.scrollTop);
            }
        }

        // This is mainly for FF which doesn't provide offsetX
        if (typeof(e.offsetX) == 'undefined' && typeof(e.offsetY) == 'undefined') {
            var coords = RGraph.getMouseXY(e);
            e.offsetX = coords[0];
            e.offsetY = coords[1];
        }
        
        // Any browser that doesn't implement stopPropagation() (MSIE)
        if (!e.stopPropagation) {
            e.stopPropagation = function () {window.event.cancelBubble = true;}
        }
        
        return e;
    }

    /**
    * Thisz function hides the crosshairs coordinates
    */
    RGraph.HideCrosshairCoords = function ()
    {
        var div = RGraph.Registry.Get('chart.coordinates.coords.div');

        if (   div
            && div.style.opacity == 1
            && div.__object__.Get('chart.crosshairs.coords.fadeout')
           ) {
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.9;}, 50);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.8;}, 100);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.7;}, 150);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.6;}, 200);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.5;}, 250);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.4;}, 300);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.3;}, 350);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.2;}, 400);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0.1;}, 450);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.opacity = 0;}, 500);
            setTimeout(function() {RGraph.Registry.Get('chart.coordinates.coords.div').style.display = 'none';}, 550);
        }
    }


    /**
    * Draws the3D axes/background
    */
    RGraph.Draw3DAxes = function (obj)
    {
        var gutterLeft    = obj.Get('chart.gutter.left');
        var gutterRight   = obj.Get('chart.gutter.right');
        var gutterTop     = obj.Get('chart.gutter.top');
        var gutterBottom  = obj.Get('chart.gutter.bottom');

        var context = obj.context;
        var canvas  = obj.canvas;

        context.strokeStyle = '#aaa';
        context.fillStyle = '#ddd';

        // Draw the vertical left side
        context.beginPath();
            context.moveTo(gutterLeft, gutterTop);
            context.lineTo(gutterLeft + 10, gutterTop - 5);
            context.lineTo(gutterLeft + 10, canvas.height - gutterBottom - 5);
            context.lineTo(gutterLeft, canvas.height - gutterBottom);
        context.closePath();
        
        context.stroke();
        context.fill();

        // Draw the bottom floor
        context.beginPath();
            context.moveTo(gutterLeft, canvas.height - gutterBottom);
            context.lineTo(gutterLeft + 10, canvas.height - gutterBottom - 5);
            context.lineTo(canvas.width - gutterRight + 10,  canvas.height - gutterBottom - 5);
            context.lineTo(canvas.width - gutterRight, canvas.height - gutterBottom);
        context.closePath();
        
        context.stroke();
        context.fill();
    }



    /**
    * This function attempts to "fill in" missing functions from the canvas
    * context object. Only two at the moment - measureText() nd fillText().
    * 
    * @param object context The canvas 2D context
    */
    RGraph.OldBrowserCompat = function (context)
    {
        if (!context) {
            return;
        }

        if (!context.measureText) {
        
            // This emulates the measureText() function
            context.measureText = function (text)
            {
                var textObj = document.createElement('DIV');
                textObj.innerHTML = text;
                textObj.style.position = 'absolute';
                textObj.style.top = '-100px';
                textObj.style.left = 0;
                document.body.appendChild(textObj);

                var width = {width: textObj.offsetWidth};
                
                textObj.style.display = 'none';
                
                return width;
            }
        }

        if (!context.fillText) {
            // This emulates the fillText() method
            context.fillText    = function (text, targetX, targetY)
            {
                return false;
            }
        }
        
        // If IE8, add addEventListener()
        if (!context.canvas.addEventListener) {
            window.addEventListener = function (ev, func, bubble)
            {
                return this.attachEvent('on' + ev, func);
            }

            context.canvas.addEventListener = function (ev, func, bubble)
            {
                return this.attachEvent('on' + ev, func);
            }
        }
    }


    /**
    * Draws a rectangle with curvy corners
    * 
    * @param context object The context
    * @param x       number The X coordinate (top left of the square)
    * @param y       number The Y coordinate (top left of the square)
    * @param w       number The width of the rectangle
    * @param h       number The height of the rectangle
    * @param         number The radius of the curved corners
    * @param         boolean Whether the top left corner is curvy
    * @param         boolean Whether the top right corner is curvy
    * @param         boolean Whether the bottom right corner is curvy
    * @param         boolean Whether the bottom left corner is curvy
    */
    RGraph.strokedCurvyRect = function (context, x, y, w, h)
    {
        // The corner radius
        var r = arguments[5] ? arguments[5] : 3;

        // The corners
        var corner_tl = (arguments[6] || arguments[6] == null) ? true : false;
        var corner_tr = (arguments[7] || arguments[7] == null) ? true : false;
        var corner_br = (arguments[8] || arguments[8] == null) ? true : false;
        var corner_bl = (arguments[9] || arguments[9] == null) ? true : false;

        context.beginPath();

            // Top left side
            context.moveTo(x + (corner_tl ? r : 0), y);
            context.lineTo(x + w - (corner_tr ? r : 0), y);
            
            // Top right corner
            if (corner_tr) {
                context.arc(x + w - r, y + r, r, PI + HALFPI, TWOPI, false);
            }

            // Top right side
            context.lineTo(x + w, y + h - (corner_br ? r : 0) );

            // Bottom right corner
            if (corner_br) {
                context.arc(x + w - r, y - r + h, r, TWOPI, HALFPI, false);
            }

            // Bottom right side
            context.lineTo(x + (corner_bl ? r : 0), y + h);

            // Bottom left corner
            if (corner_bl) {
                context.arc(x + r, y - r + h, r, HALFPI, PI, false);
            }

            // Bottom left side
            context.lineTo(x, y + (corner_tl ? r : 0) );

            // Top left corner
            if (corner_tl) {
                context.arc(x + r, y + r, r, PI, PI + HALFPI, false);
            }

        context.stroke();
    }


    /**
    * Draws a filled rectangle with curvy corners
    * 
    * @param context object The context
    * @param x       number The X coordinate (top left of the square)
    * @param y       number The Y coordinate (top left of the square)
    * @param w       number The width of the rectangle
    * @param h       number The height of the rectangle
    * @param         number The radius of the curved corners
    * @param         boolean Whether the top left corner is curvy
    * @param         boolean Whether the top right corner is curvy
    * @param         boolean Whether the bottom right corner is curvy
    * @param         boolean Whether the bottom left corner is curvy
    */
    RGraph.filledCurvyRect = function (context, x, y, w, h)
    {
        // The corner radius
        var r = arguments[5] ? arguments[5] : 3;

        // The corners
        var corner_tl = (arguments[6] || arguments[6] == null) ? true : false;
        var corner_tr = (arguments[7] || arguments[7] == null) ? true : false;
        var corner_br = (arguments[8] || arguments[8] == null) ? true : false;
        var corner_bl = (arguments[9] || arguments[9] == null) ? true : false;

        context.beginPath();

            // First draw the corners

            // Top left corner
            if (corner_tl) {
                context.moveTo(x + r, y + r);
                context.arc(x + r, y + r, r, PI, PI + HALFPI, false);
            } else {
                context.fillRect(x, y, r, r);
            }

            // Top right corner
            if (corner_tr) {
                context.moveTo(x + w - r, y + r);
                context.arc(x + w - r, y + r, r, PI + HALFPI, 0, false);
            } else {
                context.moveTo(x + w - r, y);
                context.fillRect(x + w - r, y, r, r);
            }


            // Bottom right corner
            if (corner_br) {
                context.moveTo(x + w - r, y + h - r);
                context.arc(x + w - r, y - r + h, r, 0, HALFPI, false);
            } else {
                context.moveTo(x + w - r, y + h - r);
                context.fillRect(x + w - r, y + h - r, r, r);
            }

            // Bottom left corner
            if (corner_bl) {
                context.moveTo(x + r, y + h - r);
                context.arc(x + r, y - r + h, r, HALFPI, PI, false);
            } else {
                context.moveTo(x, y + h - r);
                context.fillRect(x, y + h - r, r, r);
            }

            // Now fill it in
            context.fillRect(x + r, y, w - r - r, h);
            context.fillRect(x, y + r, r + 1, h - r - r);
            context.fillRect(x + w - r - 1, y + r, r + 1, h - r - r);

        context.fill();
    }


    /**
    * Hides the zoomed canvas
    */
    RGraph.HideZoomedCanvas = function ()
    {
        var interval = 15;
        var frames   = 10;

        if (typeof(__zoomedimage__) == 'object') {
            obj = __zoomedimage__.obj;
        } else {
            return;
        }

        if (obj.Get('chart.zoom.fade.out')) {
            for (var i=frames,j=1; i>=0; --i, ++j) {
                if (typeof(__zoomedimage__) == 'object') {
                    setTimeout("__zoomedimage__.style.opacity = " + String(i / 10), j * interval);
                }
            }

            if (typeof(__zoomedbackground__) == 'object') {
                setTimeout("__zoomedbackground__.style.opacity = " + String(i / frames), j * interval);
            }
        }

        if (typeof(__zoomedimage__) == 'object') {
            setTimeout("__zoomedimage__.style.display = 'none'", obj.Get('chart.zoom.fade.out') ? (frames * interval) + 10 : 0);
        }

        if (typeof(__zoomedbackground__) == 'object') {
            setTimeout("__zoomedbackground__.style.display = 'none'", obj.Get('chart.zoom.fade.out') ? (frames * interval) + 10 : 0);
        }
    }


    /**
    * Adds an event handler
    * 
    * @param object obj   The graph object
    * @param string event The name of the event, eg ontooltip
    * @param object func  The callback function
    */
    RGraph.AddCustomEventListener = function (obj, name, func)
    {
        if (typeof(RGraph.events[obj.uid]) == 'undefined') {
            RGraph.events[obj.uid] = [];
        }

        RGraph.events[obj.uid].push([obj, name, func]);
        
        return RGraph.events[obj.uid].length - 1;
    }


    /**
    * Used to fire one of the RGraph custom events
    * 
    * @param object obj   The graph object that fires the event
    * @param string event The name of the event to fire
    */
    RGraph.FireCustomEvent = function (obj, name)
    {
        if (obj && obj.isRGraph) {
        
            // New style of adding custom events
            if (obj[name]) {
                (obj[name])(obj);
            }
            
            var uid = obj.uid;
    
            if (   typeof(uid) == 'string'
                && typeof(RGraph.events) == 'object'
                && typeof(RGraph.events[uid]) == 'object'
                && RGraph.events[uid].length > 0) {
    
                for(var j=0; j<RGraph.events[uid].length; ++j) {
                    if (RGraph.events[uid][j] && RGraph.events[uid][j][1] == name) {
                        RGraph.events[uid][j][2](obj);
                    }
                }
            }
        }
    }


    /**
    * This function suggests a gutter size based on the widest left label. Given that the bottom
    * labels may be longer, this may be a little out.
    * 
    * @param object obj  The graph object
    * @param array  data An array of graph data
    * @return int        A suggested gutter setting
    */
    RGraph.getGutterSuggest = function (obj, data)
    {
        /**
        * Calculate the minimum value
        */
        var min = 0;
        for (var i=0; i<data.length; ++i) {
            min = Math.min(min, data[i]);
        }
        var min = Math.abs(min);

        var str = RGraph.number_format(obj, RGraph.array_max(RGraph.getScale(Math.max(min, RGraph.array_max(data)), obj)), obj.Get('chart.units.pre'), obj.Get('chart.units.post'));

        // Take into account the HBar
        if (obj.type == 'hbar') {

            var str = '';
            var len = 0;

            for (var i=0; i<obj.Get('chart.labels').length; ++i) {
                str = (obj.Get('chart.labels').length > str.length ? obj.Get('chart.labels')[i] : str);
            }
        }

        obj.context.font = obj.Get('chart.text.size') + 'pt ' + obj.Get('chart.text.font');

        len = obj.context.measureText(str).width + 5;

        return (obj.type == 'hbar' ? len / 3 : len);
    }


    /**
    * If you prefer, you can use the SetConfig() method to set the configuration information
    * for your chart. You may find that setting the configuration this way eases reuse.
    * 
    * @param object obj    The graph object
    * @param object config The graph configuration information
    */
    RGraph.SetConfig = function (obj, c)
    {
        for (i in c) {
            if (typeof(i) == 'string') {
                obj.Set(i, c[i]);
            }
        }
        
        return obj;
    }


    /**
    * Clears all the custom event listeners that have been registered
    * 
    * @param    string Limits the clearing to this object ID
    */
    RGraph.RemoveAllCustomEventListeners = function ()
    {
        var id = arguments[0];

        if (id && RGraph.events[id]) {
            RGraph.events[id] = [];
        } else {
            RGraph.events = [];
        }
    }


    /**
    * Clears a particular custom event listener
    * 
    * @param object obj The graph object
    * @param number i   This is the index that is return by .AddCustomEventListener()
    */
    RGraph.RemoveCustomEventListener = function (obj, i)
    {
        if (   typeof(RGraph.events) == 'object'
            && typeof(RGraph.events[obj.id]) == 'object'
            && typeof(RGraph.events[obj.id][i]) == 'object') {
            
            RGraph.events[obj.id][i] = null;
        }
    }



    /**
    * This draws the background
    * 
    * @param object obj The graph object
    */
    RGraph.DrawBackgroundImage = function (obj)
    {
        if (typeof(obj.Get('chart.background.image')) == 'string') {
            if (typeof(obj.canvas.__rgraph_background_image__) == 'undefined') {
                var img = new Image();
                img.__object__  = obj;
                img.__canvas__  = obj.canvas;
                img.__context__ = obj.context;
                img.src         = obj.Get('chart.background.image');
                
                obj.canvas.__rgraph_background_image__ = img;
            } else {
                img = obj.canvas.__rgraph_background_image__;
            }
            
            // When the image has loaded - redraw the canvas
            img.onload = function ()
            {
                obj.__rgraph_background_image_loaded__ = true;
                RGraph.Clear(obj.canvas);
                RGraph.RedrawCanvas(obj.canvas);
            }
                
            var gutterLeft   = obj.Get('chart.gutter.left');
            var gutterRight  = obj.Get('chart.gutter.right');
            var gutterTop    = obj.Get('chart.gutter.top');
            var gutterBottom = obj.Get('chart.gutter.bottom');
            var stretch      = obj.Get('chart.background.image.stretch');
            var align        = obj.Get('chart.background.image.align');
    
            // Handle chart.background.image.align
            if (typeof(align) == 'string') {
                if (align.indexOf('right') != -1) {
                    var x = obj.canvas.width - img.width - gutterRight;
                } else {
                    var x = gutterLeft;
                }
    
                if (align.indexOf('bottom') != -1) {
                    var y = obj.canvas.height - img.height - gutterBottom;
                } else {
                    var y = gutterTop;
                }
            } else {
                var x = gutterLeft;
                var y = gutterTop;
            }
            
            // X/Y coords take precedence over the align
            var x = typeof(obj.Get('chart.background.image.x')) == 'number' ? obj.Get('chart.background.image.x') : x;
            var y = typeof(obj.Get('chart.background.image.y')) == 'number' ? obj.Get('chart.background.image.y') : y;
            var w = stretch ? obj.canvas.width - gutterLeft - gutterRight : img.width;
            var h = stretch ? obj.canvas.height - gutterTop - gutterBottom : img.height;
            
            /**
            * You can now specify the width and height of the image
            */
            if (typeof(obj.Get('chart.background.image.w')) == 'number') w  = obj.Get('chart.background.image.w');
            if (typeof(obj.Get('chart.background.image.h')) == 'number') h = obj.Get('chart.background.image.h');
    
            obj.context.drawImage(img,x,y,w, h);
        }
    }



    /**
    * This function determines wshether an object has tooltips or not
    * 
    * @param object obj The chart object
    */
    RGraph.hasTooltips = function (obj)
    {
        if (typeof(obj.Get('chart.tooltips')) == 'object' && obj.Get('chart.tooltips')) {
            for (var i=0; i<obj.Get('chart.tooltips').length; ++i) {
                if (!RGraph.is_null(obj.Get('chart.tooltips')[i])) {
                    return true;
                }
            }
        } else if (typeof(obj.Get('chart.tooltips')) == 'function') {
            return true;
        }
        
        return false;
    }



    /**
    * This function creates a (G)UID which can be used to identify objects.
    * 
    * @return string (g)uid The (G)UID
    */
    RGraph.CreateUID = function ()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
        {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }



    /**
    * This is the new object registry, used to facilitate multiple objects per canvas.
    * 
    * @param object obj The object to register
    */
    RGraph.ObjectRegistry.Add = function (obj)
    {
        var uid      = obj.uid;
        var canvasID = obj.canvas.id;

        /**
        * Index the objects by UID
        */
        RGraph.ObjectRegistry.objects.byUID.push([uid, obj]);
        
        /**
        * Index the objects by the canvas that they're drawn on
        */
        RGraph.ObjectRegistry.objects.byCanvasID.push([canvasID, obj]);
    }



    /**
    * Remove an object from the object registry
    * 
    * @param object obj The object to remove.
    */
    RGraph.ObjectRegistry.Remove = function (obj)
    {
        var id  = obj.id;
        var uid = obj.uid;

        for (var i=0; i<RGraph.ObjectRegistry.objects.byUID.length; ++i) {
            if (RGraph.ObjectRegistry.objects.byUID[i] && RGraph.ObjectRegistry.objects.byUID[i][1].uid == uid) {
                RGraph.ObjectRegistry.objects.byUID[i] = null;
            }
        }

        // RGraph.ObjectRegistry.objects.byCanvasID.push([canvasID, obj]);

        for (var i=0; i<RGraph.ObjectRegistry.objects.byCanvasID.length; ++i) {
            if (RGraph.ObjectRegistry.objects.byCanvasID[i] && RGraph.ObjectRegistry.objects.byCanvasID[i][0] == id) {
                RGraph.ObjectRegistry.objects.byCanvasID[i] = null;
            }
        }

    }



    /**
    * Removes all objects from the ObjectRegistry. If either the ID of a canvas is supplied,
    * or the canvas itself, then only objects pertaining to that canvas are cleared.
    * 
    * @param mixed   Either a canvas object (as returned by document.getElementById()
    *                or the ID of a canvas (ie a string)
    */
    RGraph.ObjectRegistry.Clear = function ()
    {
        // If an ID is supplied restrict the learing to that
        if (arguments[0]) {

            var id      = (typeof(arguments[0]) == 'object' ? arguments[0].id : arguments[0]);
            var objects = RGraph.ObjectRegistry.getObjectsByCanvasID(id);

            for (var i=0; i<objects.length; ++i) {
                RGraph.ObjectRegistry.Remove(objects[i]);
            }

        } else {

            RGraph.ObjectRegistry.objects            = {};
            RGraph.ObjectRegistry.objects.byUID      = [];
            RGraph.ObjectRegistry.objects.byCanvasID = [];
        }
    }



    /**
    * Retrieves all objects for a given canvas id
    * 
    * @patarm id string The canvas ID to get objects for.
    */
    RGraph.ObjectRegistry.getObjectsByCanvasID = function (id)
    {
        var store = RGraph.ObjectRegistry.objects.byCanvasID;
        var ret = [];

        // Loop through all of the objects and return the appropriate ones
        for (var i=0; i<store.length; ++i) {
            if (store[i] && store[i][0] == id ) {
                ret.push(store[i][1]);
            }
        }

        return ret;
    }



    /**
    * Retrieves the relevant object based on the X/Y position.
    * 
    * @param  object e The event object
    * @return object   The applicable (if any) object
    */
    RGraph.ObjectRegistry.getFirstObjectByXY =
    RGraph.ObjectRegistry.getObjectByXY = function (e)
    {
        var canvas  = e.target;
        var ret     = null;
        var objects = RGraph.ObjectRegistry.getObjectsByCanvasID(canvas.id);

        for (var i=(objects.length - 1); i>=0; --i) {

            var obj = objects[i].getObjectByXY(e);

            if (obj) {
                return obj;
            }
        }
    }



    /**
    * Retrieves the relevant objects based on the X/Y position.
    * NOTE This function returns an array of objects
    * 
    * @param  object e The event object
    * @return          An array of pertinent objects. Note the there may be only one object
    */
    RGraph.ObjectRegistry.getObjectsByXY = function (e)
    {
        var canvas  = e.target;
        var ret     = [];
        var objects = RGraph.ObjectRegistry.getObjectsByCanvasID(canvas.id);

        // Retrieve objects "front to back"
        for (var i=(objects.length - 1); i>=0; --i) {

            var obj = objects[i].getObjectByXY(e);

            if (obj) {
                ret.push(obj);
            }
        }
        
        return ret;
    }


    /**
    * Retrieves the object with the corresponding UID
    * 
    * @param string uid The UID to get the relevant object for
    */
    RGraph.ObjectRegistry.getObjectByUID = function (uid)
    {
        var objects = RGraph.ObjectRegistry.objects.byUID;

        for (var i=0; i<objects.length; ++i) {
            if (objects[i] && objects[i][1].uid == uid) {
                return objects[i][1];
            }
        }
    }


    /**
    * Retrieves the objects that are the given type
    * 
    * @param  mixed canvas  The canvas to check. It can either be the canvas object itself or just the ID
    * @param  string type   The type to look for
    * @return array         An array of one or more objects
    */
    RGraph.ObjectRegistry.getObjectsByType = function (type)
    {
        var objects = RGraph.ObjectRegistry.objects.byUID;
        var ret     = [];

        for (var i=0; i<objects.length; ++i) {

            if (objects[i] && objects[i][1] && objects[i][1].type && objects[i][1].type && objects[i][1].type == type) {
                ret.push(objects[i][1]);
            }
        }

        return ret;
    }


    /**
    * Retrieves the FIRST object that matches the given type
    *
    * @param  string type   The type of object to look for
    * @return object        The FIRST object that matches the given type
    */
    RGraph.ObjectRegistry.getFirstObjectByType = function (type)
    {
        var objects = RGraph.ObjectRegistry.objects.byUID;
    
        for (var i=0; i<objects.length; ++i) {
            if (objects[i] && objects[i][1] && objects[i][1].type == type) {
                return objects[i][1];
            }
        }
        
        return null;
    }



    /**
    * This takes centerx, centery, x and y coordinates and returns the
    * appropriate angle relative to the canvas angle system. Remember
    * that the canvas angle system starts at the EAST axis
    * 
    * @param  number cx  The centerx coordinate
    * @param  number cy  The centery coordinate
    * @param  number x   The X coordinate (eg the mouseX if coming from a click)
    * @param  number y   The Y coordinate (eg the mouseY if coming from a click)
    * @return number     The relevant angle (measured in in RADIANS)
    */
    RGraph.getAngleByXY = function (cx, cy, x, y)
    {
        var angle = Math.atan((y - cy) / (x - cx));
            angle = Math.abs(angle)

        if (x >= cx && y >= cy) {
            angle += TWOPI;

        } else if (x >= cx && y < cy) {
            angle = (HALFPI - angle) + (PI + HALFPI);

        } else if (x < cx && y < cy) {
            angle += PI;

        } else {
            angle = PI - angle;
        }

        /**
        * Upper and lower limit checking
        */
        if (angle > TWOPI) {
            angle -= TWOPI;
        }

        return angle;
    }



    /**
    * This function returns the distance between two points. In effect the
    * radius of an imaginary circle that is centered on x1 and y1. The name
    * of this function is derived from the word "Hypoteneuse", which in
    * trigonmetry is the longest side of a triangle
    * 
    * @param number x1 The original X coordinate
    * @param number y1 The original Y coordinate
    * @param number x2 The target X coordinate
    * @param number y2 The target Y  coordinate
    */
    RGraph.getHypLength = function (x1, y1, x2, y2)
    {
        var ret = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

        return ret;
    }



    /**
    * This function gets the end point (X/Y coordinates) of a given radius.
    * You pass it the center X/Y and the radius and this function will return
    * the endpoint X/Y coordinates.
    * 
    * @param number cx The center X coord
    * @param number cy The center Y coord
    * @param number r  The lrngth of the radius
    */
    RGraph.getRadiusEndPoint = function (cx, cy, angle, radius)
    {
        var x = cx + (Math.cos(angle) * radius);
        var y = cy + (Math.sin(angle) * radius);
        
        return [x, y];
    }



    /**
    * This installs all of the event listeners
    * 
    * @param object obj The chart object
    */
    RGraph.InstallEventListeners = function (obj)
    {
        /**
        * Don't attempt to install event listeners for older versions of MSIE
        */
        if (RGraph.isOld()) {
            return;
        }

        /**
        * If this function exists, then the dynamic file has been included.
        */
        if (RGraph.InstallCanvasClickListener) {

            RGraph.InstallWindowMousedownListener(obj);
            RGraph.InstallWindowMouseupListener(obj);
            RGraph.InstallCanvasMousemoveListener(obj);
            RGraph.InstallCanvasMouseupListener(obj);
            RGraph.InstallCanvasMousedownListener(obj);
            RGraph.InstallCanvasClickListener(obj);
        
        } else if (   RGraph.hasTooltips(obj)
                   || obj.Get('chart.adjustable')
                   || obj.Get('chart.annotatable')
                   || obj.Get('chart.contextmenu')
                   || obj.Get('chart.resizable')
                   || obj.Get('chart.key.interactive')
                   || obj.Get('chart.events.click')
                   || obj.Get('chart.events.mousemove')
                  ) {
            alert('[RGRAPH] You appear to have used dynamic features but not included the file: RGraph.common.dynamic.js');
        }
    }



    /**
    * Loosly mimicks the PHP function print_r();
    */
    RGraph.pr = function (obj)
    {
        var str = '';
        var indent = (arguments[2] ? arguments[2] : '');

        switch (typeof(obj)) {
            case 'number':
                if (indent == '') {
                    str+= 'Number: '
                }
                str += String(obj);
                break;

            case 'string':
                if (indent == '') {
                    str+= 'String (' + obj.length + '):'
                }
                str += '"' + String(obj) + '"';
                break;

            case 'object':
                // In case of null
                if (obj == null) {
                    str += 'null';
                    break;
                }

                str += 'Object\n' + indent + '(\n';
                for (var i in obj) {
                    if (typeof(i) == 'string' || typeof(i) == 'number') {
                        str += indent + ' ' + i + ' => ' + RGraph.pr(obj[i], true, indent + '    ') + '\n';
                    }
                }

                var str = str + indent + ')';
                break;

            case 'function':
                str += obj;
                break;

            case 'boolean':
                str += 'Boolean: ' + (obj ? 'true' : 'false');
                break;
        }

        /**
        * Finished, now either return if we're in a recursed call, or alert()
        * if we're not.
        */
        if (arguments[1]) {
            return str;
        } else {
            alert(str);
        }
    }


    /**
    * Produces a dashed line
    * 
    * @param
    */
    RGraph.DashedLine = function(context, x1, y1, x2, y2)
    {
        /**
        * This is the size of the dashes
        */
        var size = 5;

        /**
        * The optional fifth argument can be the size of the dashes
        */
        if (typeof(arguments[5]) == 'number') {
            size = arguments[5];
        }

        var dx  = x2 - x1;
        var dy  = y2 - y1;
        var num = Math.floor(Math.sqrt((dx * dx) + (dy * dy)) / size);

        var xLen = dx / num;
        var yLen = dy / num;

        var count = 0;

        do {
            (count % 2 == 0 && count > 0) ? context.lineTo(x1, y1) : context.moveTo(x1, y1);

            x1 += xLen;
            y1 += yLen;
        } while(count++ <= num);
    }


    /**
    * Makes an AJAX call. It calls the given callback (a function) when ready
    * 
    * @param string   url      The URL to retrieve
    * @param function callback A function that is called when the response is ready, there's an example below
    *                          called "myCallback".
    */
    RGraph.AJAX = function (url, callback)
    {
        // Mozilla, Safari, ...
        if (window.XMLHttpRequest) {
            var httpRequest = new XMLHttpRequest();

        // MSIE
        } else if (window.ActiveXObject) {
            var httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        httpRequest.onreadystatechange = function ()
            {
                if (this.readyState == 4 && this.status == 200) {
                    this.__user_callback__ = callback;
                    this.__user_callback__();
                }
            }

        httpRequest.open('GET', url, true);
        httpRequest.send();
    }
    
    /**
    * Rotates the canvas
    * 
    * @param object canvas The canvas to rotate
    * @param  int   x      The X coordinate about which to rotate the canvas
    * @param  int   y      The Y coordinate about which to rotate the canvas
    * @param  int   angle  The angle(in RADIANS) to rotate the canvas by
    */
    RGraph.RotateCanvas = function (canvas, x, y, angle)
    {
        var context = canvas.getContext('2d');

        context.translate(x, y);
        context.rotate(angle);
        context.translate(0 - x, 0 - y);    
    }

        
    /**
    * This draws an extra set of Y axes
    * 
    * @param object obj   The chart object
    * @param object prop  An assoc array of options - see the API docs for a list of options
    */
    RGraph.DrawAxes =
    RGraph.DrawYAxis = function (obj, prop)
    {
        /**
        * Allow both axis.xxx and chart.xxx to prevent any confusion that may arise
        */
        for (i in prop) {
            if (typeof(i) == 'string') {
                var key = i.replace(/^chart\./, 'axis.');
                
                prop[key] = prop[i];
            }
        }


        var gutterTop       = obj.gutterTop;
        var gutterBottom    = obj.gutterBottom;
        var context         = prop['axis.context'] ? prop['axis.context'] : obj.context;
        var x               = prop['axis.x'];
        var y               = obj.properties['chart.gutter.top'];
        var min             = prop['axis.min'] ? prop['axis.min'] : 0;
        var max             = prop['axis.max'];
        var color           = prop['axis.color'] ? prop['axis.color'] : 'black';
        var title           = prop['axis.title'] ? prop['axis.title'] : '';
        var title_color     = prop['axis.title.color'] ? prop['axis.title.color'] : color;
        var label_color     = prop['axis.text.color'] ? prop['axis.color'] : color;
        var height          = obj.canvas.height - obj.gutterBottom - obj.gutterTop;
        var numticks        = typeof(prop['axis.numticks']) == 'number' ? prop['axis.numticks'] : 10;
        var numlabels       = prop['axis.numlabels'] ? prop['axis.numlabels'] : 5;
        var font            = prop['axis.font'] ? prop['axis.font'] : 'Arial';
        var size            = prop['axis.text.size'] ? prop['axis.text.size'] : 10;
        var align           = typeof(prop['axis.align']) == 'string'? prop['axis.align'] : 'left';
        var formatter       = prop['axis.scale.formatter'];
        var decimals        = prop['axis.scale.decimals'];
        var invert          = prop['axis.scale.invert'];
        var units_pre       = prop['axis.units.pre'];
        var units_post      = prop['axis.units.post'];
        var linewidth       = prop['axis.linewidth'] ? prop['axis.linewidth'] : 1;
        var notopendtick    = prop['axis.noendtick.top'];
        var nobottomendtick = prop['axis.noendtick.bottom'];
        var noyaxis         = prop['axis.noyaxis'];
        
        // This fixes missing corner pixels in Chrome
        context.lineWidth = linewidth + 0.001;


        /**
        * Set the color
        */
        context.strokeStyle = color;

        if (!noyaxis) {
            /**
            * Draw the main vertical line
            */
            context.beginPath();
                context.moveTo(Math.round(x), y);
                context.lineTo(Math.round(x), y + height);
            context.stroke();
            
            /**
            * Draw the axes tickmarks
            */
            if (numticks) {
                
                var gap = height / numticks;
    
                context.beginPath();
                    for (var i=(notopendtick ? 1 : 0); i<=(numticks - (nobottomendtick ? 1 : 0)); ++i) {
                        context.moveTo(align == 'right' ? x + 3 : x - 3, Math.round(y + (gap *i)));
                        context.lineTo(x, Math.round(y + (gap *i)));
                    }
                context.stroke();
            }
        }


        /**
        * Draw the scale for the axes
        */
        context.fillStyle = label_color;
        context.beginPath();
            var text_len = 0;
            for (var i=0; i<=numlabels; ++i) {
            
                var original = ((max - min) * ((numlabels-i) / numlabels)) + min;

                var text     = RGraph.number_format(obj, original.toFixed(decimals), units_pre, units_post);
                var text     = String(typeof(formatter) == 'function' ? formatter(obj, original) : text);
                var text_len = Math.max(text_len, context.measureText(text).width);

                if (invert) {
                    var y = gutterTop + (height - ((height / numlabels)*i));
                } else {
                    var y = gutterTop + ((height / numlabels)*i);
                }

                RGraph.Text(
                            context,
                            font,
                            size,
                            x - (align == 'right' ? -5 : 5),
                            y,
                            text,
                            'center',
                            align == 'right' ? 'left' : 'right'
                           );
            }
        context.stroke();

        /**
        * Draw the title for the axes
        */
        if (title) {
            context.beginPath();
                context.fillStyle = title_color
                RGraph.Text(context, font, size + 2,
                
                align == 'right' ? x + size + text_len + 2 : x - size - text_len - 2,
                
                height / 2 + gutterTop, title, 'center', 'center', null, align == 'right' ? 90 : -90);
            context.stroke();
        }
    }

        
    /**
    * This draws an extra set of X axes
    * 
    * @param object obj   The chart object
    * @param object prop  An assoc array of options - see the API docs for a list of options
    */
    RGraph.DrawXAxis = function (obj, prop)
    {
        /**
        * Allow both axis.xxx and chart.xxx to prevent any confusion that may arise
        */
        for (i in prop) {
            if (typeof(i) == 'string') {
                var key = i.replace(/^chart\./, 'axis.');
                
                prop[key] = prop[i];
            }
        }

        var context         = prop['axis.context'] ? prop['axis.context'] : obj.context;
        var gutterLeft      = obj.gutterLeft;
        var gutterRight     = obj.gutterRight;
        var x               = obj.properties['chart.gutter.left'];
        var y               = prop['axis.y'];
        var min             = prop['axis.min'] ? prop['axis.min'] : 0;
        var max             = prop['axis.max'] ? prop['axis.max'] : null;
        var labels          = prop['axis.labels'] ? prop['axis.labels'] : null;
        var labels_position = typeof(prop['axis.labels.position']) == 'string' ? prop['axis.labels.position'] : 'section';
        var color           = prop['axis.color'] ? prop['axis.color'] : 'black';
        var title_color     = prop['axis.title.color'] ? prop['axis.title.color'] : color;
        var label_color     = prop['axis.text.color'] ? prop['axis.text.color'] : color;
        var width           = obj.canvas.width - obj.gutterLeft - obj.gutterRight;
        var height          = obj.canvas.height - obj.gutterBottom - obj.gutterTop;
        var font            = prop['axis.text.font'] ? prop['axis.text.font'] : 'Arial';
        var size            = prop['axis.text.size'] ? prop['axis.text.size'] : 10;
        var align           = typeof(prop['axis.align']) == 'string'? prop['axis.align'] : 'bottom';
        var numlabels       = prop['axis.numlabels'] ? prop['axis.numlabels'] : 5;
        var formatter       = prop['axis.scale.formatter'];
        var decimals        = Number(prop['axis.scale.decimals']);
        var invert          = prop['axis.scale.invert'];
        var units_pre       = prop['axis.units.pre'] ? prop['axis.units.pre'] : '';
        var units_post      = prop['axis.units.post'] ? prop['axis.units.post'] : '';
        var title           = prop['axis.title'] ? prop['axis.title'] : '';
        var numticks        = typeof(prop['axis.numticks']) == 'number' ? prop['axis.numticks'] : (labels && labels.length ? labels.length : 10);
        var hmargin         = prop['axis.hmargin'] ? prop['axis.hmargin'] : 0;
        var linewidth       = prop['axis.linewidth'] ? prop['axis.linewidth'] : 1;
        var noleftendtick   = prop['axis.noendtick.left'];
        var norightendtick  = prop['axis.noendtick.right'];
        var noxaxis         = prop['axis.noxaxis'];
        
        /**
        * Set the linewidth
        */
        context.lineWidth = linewidth + 0.001;

        /**
        * Set the color
        */
        context.strokeStyle = color;

        if (!noxaxis) {
            /**
            * Draw the main horizontal line
            */
            context.beginPath();
                context.moveTo(x, Math.round(y));
                context.lineTo(x + width, Math.round(y));
            context.stroke();

            /**
            * Draw the axes tickmarks
            */
            context.beginPath();
                for (var i=(noleftendtick ? 1 : 0); i<=(numticks - (norightendtick ? 1 : 0)); ++i) {
                    context.moveTo(Math.round(x + ((width / numticks) * i)), y);
                    context.lineTo(Math.round(x + ((width / numticks) * i)), y + (align == 'bottom' ? 3 : -3));
                }
            context.stroke();
        }



        /**
        * Draw the labels
        */
        context.fillStyle = label_color;

        if (labels) {
            /**
            * Draw the labels
            */

            numlabels = labels.length;

            context.beginPath();
                for (var i=0; i<labels.length; ++i) {
                    RGraph.Text(context,
                                font,
                                size,
                                labels_position == 'edge' ? ((((width - hmargin - hmargin) / (labels.length - 1)) * i) + gutterLeft + hmargin) : ((((width - hmargin - hmargin) / labels.length) * i) + ((width / labels.length) / 2) + gutterLeft + hmargin),
                                align == 'bottom' ? y + size + 2 : y - size - 2,
                                String(labels[i]),
                                'center',
                                'center');
                }
            context.fill();
    




        /**
        * No specific labels - draw a scale
        */
        } else {

            if (!max) {
                alert('[DRAWXAXIS] If not specifying axis.labels you must specify axis.max!');
            }

            context.beginPath();
                for (var i=0; i<=numlabels; ++i) {

                    var original = (((max - min) / numlabels) * i) + min;

                    var text = String(typeof(formatter) == 'function' ? formatter(obj, original) : RGraph.number_format(obj, original.toFixed(decimals), units_pre, units_post));
                    
                    if (invert) {
                        var x = ((width - (width / numlabels) * i)) + gutterLeft;
                    } else {
                        var x = ((width / numlabels) * i) + gutterLeft;
                    }

                    RGraph.Text(context,
                                font,
                                size,
                                x,
                                align == 'bottom' ? y + size + 2 : y - size - 2,
                                text,
                                'center',
                                'center');
                }
            context.fill();
        }



        /**
        * Draw the title for the axes
        */
        if (title) {

            var dimensions = RGraph.MeasureText(title, false, font, size + 2);

            context.fillStyle = title_color
            RGraph.Text(context,
                        font,
                        size + 2,
                        width / 2 + obj.gutterLeft,
                        align == 'bottom' ? y + dimensions[1] + 10 : y - dimensions[1] - 10,
                        title,
                        'center',
                        'center');
        }
    }



    /**
    * Measures text by creating a DIV in the document and adding the relevant text to it.
    * Then checking the .offsetWidth and .offsetHeight.
    * 
    * @param  string text   The text to measure
    * @param  bool   bold   Whether the text is bold or not
    * @param  string font   The font to use
    * @param  size   number The size of the text (in pts)
    * @return array         A two element array of the width and height of the text
    */
    RGraph.MeasureText = function (text, bold, font, size)
    {
        // Add the sizes to the cache as adding DOM elements is costly and causes slow downs
        if (typeof(__rgraph_measuretext_cache__) == 'undefined') {
            __rgraph_measuretext_cache__ = [];
        }

        var str = text + ':' + bold + ':' + font + ':' + size;
        if (typeof(__rgraph_measuretext_cache__) == 'object' && __rgraph_measuretext_cache__[str]) {
            return __rgraph_measuretext_cache__[str];
        }
        
        if (!__rgraph_measuretext_cache__['text-div']) {
            var div = document.createElement('DIV');
                div.style.position = 'absolute';
                div.style.top = '-100px';
                div.style.left = '-100px';
            document.body.appendChild(div);
            
            // Now store the newly created DIV
            __rgraph_measuretext_cache__['text-div'] = div;

        } else if (__rgraph_measuretext_cache__['text-div']) {
            var div = __rgraph_measuretext_cache__['text-div'];
        }

        div.innerHTML = text.replace(/\r\n/g, '<br />');
        div.style.fontFamily = font;
        div.style.fontWeight = bold ? 'bold' : 'normal';
        div.style.fontSize = size + 'pt';
        
        var size = [div.offsetWidth, div.offsetHeight];

        //document.body.removeChild(div);
        __rgraph_measuretext_cache__[str] = size;
        
        return size;
    }
    
    
    
    /**
    * If the effects library isn't included already this prevents an unknown function error
    */
    if (!RGraph.AddEffects) {
        RGraph.AddEffects = function (obj) {}
    }



// Some other functions. Because they're rarely changed - they're hand minified
RGraph.LinearGradient=function(obj,x1,y1,x2,y2,color1,color2){var gradient=obj.context.createLinearGradient(x1,y1,x2,y2);var numColors=arguments.length-5;for (var i=5;i<arguments.length;++i){var color=arguments[i];var stop=(i-5)/(numColors-1);gradient.addColorStop(stop,color);}return gradient;}
RGraph.RadialGradient=function(obj,x1,y1,r1,x2,y2,r2,color1,color2){var gradient=obj.context.createRadialGradient(x1,y1,r1,x2,y2,r2);var numColors=arguments.length-7;for(var i=7;i<arguments.length; ++i){var color=arguments[i];var stop=(i-7)/(numColors-1);gradient.addColorStop(stop,color);}return gradient;}
RGraph.array_shift=function(arr){var ret=[];for(var i=1;i<arr.length;++i){ret.push(arr[i]);}return ret;}
RGraph.AddEventListener=function(id,e,func){var type=arguments[3]?arguments[3]:'unknown';RGraph.Registry.Get('chart.event.handlers').push([id,e,func,type]);}
RGraph.ClearEventListeners=function(id){if(id&&id=='window'){window.removeEventListener('mousedown',window.__rgraph_mousedown_event_listener_installed__,false);window.removeEventListener('mouseup',window.__rgraph_mouseup_event_listener_installed__,false);}else{var canvas = document.getElementById(id);canvas.removeEventListener('mouseup',canvas.__rgraph_mouseup_event_listener_installed__,false);canvas.removeEventListener('mousemove',canvas.__rgraph_mousemove_event_listener_installed__,false);canvas.removeEventListener('mousedown',canvas.__rgraph_mousedown_event_listener_installed__,false);canvas.removeEventListener('click',canvas.__rgraph_click_event_listener_installed__,false);}}
RGraph.HidePalette=function(){var div=RGraph.Registry.Get('palette');if(typeof(div)=='object'&&div){div.style.visibility='hidden';div.style.display='none';RGraph.Registry.Set('palette',null);}}
RGraph.random=function(min,max){var dp=arguments[2]?arguments[2]:0;var r=Math.random();return Number((((max - min) * r) + min).toFixed(dp));}
RGraph.NoShadow=function(obj){obj.context.shadowColor='rgba(0,0,0,0)';obj.context.shadowBlur=0;obj.context.shadowOffsetX=0;obj.context.shadowOffsetY=0;}
RGraph.SetShadow=function(obj,color,offsetx,offsety,blur){obj.context.shadowColor=color;obj.context.shadowOffsetX=offsetx;obj.context.shadowOffsetY=offsety;obj.context.shadowBlur=blur;}
RGraph.array_reverse=function(arr){var newarr=[];for(var i=arr.length-1;i>=0;i--){newarr.push(arr[i]);}return newarr;}
RGraph.Registry.Set=function(name,value){RGraph.Registry.store[name]=value;return value;}
RGraph.Registry.Get=function(name){return RGraph.Registry.store[name];}
RGraph.degrees2Radians=function(degrees){return degrees*(PI/180);}
RGraph.log=(function(n,base){var log=Math.log;return function(n,base){return log(n)/(base?log(base):1);};})();
RGraph.is_array=function(obj){return obj!=null&&obj.constructor.toString().indexOf('Array')!=-1;}
RGraph.trim=function(str){return RGraph.ltrim(RGraph.rtrim(str));}
RGraph.ltrim=function(str){return str.replace(/^(\s|\0)+/, '');}
RGraph.rtrim=function(str){return str.replace(/(\s|\0)+$/, '');}
RGraph.GetHeight=function(obj){return obj.canvas.height;}
RGraph.GetWidth=function(obj){return obj.canvas.width;}
RGraph.is_null=function(arg){if(arg==null||(typeof(arg))=='object'&&!arg){return true;}return false;}
RGraph.Timer=function(label){var d=new Date();console.log(label+': '+d.getSeconds()+'.'+d.getMilliseconds());}
RGraph.Async=function(func){return setTimeout(func,arguments[1]?arguments[1]:1);}
RGraph.isIE=function(){return navigator.userAgent.indexOf('MSIE')>0;};ISIE=RGraph.isIE();
RGraph.isIE6=function(){return navigator.userAgent.indexOf('MSIE 6')>0;};ISIE6=RGraph.isIE6();
RGraph.isIE7=function(){return navigator.userAgent.indexOf('MSIE 7')>0;};ISIE7=RGraph.isIE7();
RGraph.isIE8=function(){return navigator.userAgent.indexOf('MSIE 8')>0;};ISIE8=RGraph.isIE8();
RGraph.isIE9=function(){return navigator.userAgent.indexOf('MSIE 9')>0;};ISIE9=RGraph.isIE9();
RGraph.isIE10=function(){return navigator.userAgent.indexOf('MSIE 10')>0;};ISIE10=RGraph.isIE10();
RGraph.isIE9up=function(){navigator.userAgent.match(/MSIE (\d+)/);return Number(RegExp.$1)>=9;};ISIE9UP=RGraph.isIE9up();
RGraph.isIE10up=function(){navigator.userAgent.match(/MSIE (\d+)/);return Number(RegExp.$1)>=10;};ISIE10UP=RGraph.isIE10up();
RGraph.isOld=function(){return ISIE6||ISIE7||ISIE8;};ISOLD=ISIE6||ISIE7||ISIE8;
RGraph.Reset=function(canvas){canvas.width=canvas.width;RGraph.ObjectRegistry.Clear(canvas);canvas.__rgraph_aa_translated__=false;}
function pd(variable){RGraph.pr(variable);}
function p(variable){RGraph.pr(variable);}
function a(variable){alert(variable);}
function cl(variable){return console.log(variable);}