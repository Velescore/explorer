/**

 * Title: jqPlot Charts

 * 

 * Pure JavaScript plotting plugin for jQuery.

 * 

 * About: Version

 * 

 * version: 1.0.9 

 * revision: d96a669

 * 

 * About: Copyright & License

 * 

 * Copyright (c) 2009-2016 Chris Leonello

 * jqPlot is currently available for use in all personal or commercial projects 

 * under both the MIT and GPL version 2.0 licenses. This means that you can 

 * choose the license that best suits your project and use it accordingly.

 * 

 * See <GPL Version 2> and <MIT License> contained within this distribution for further information. 

 *

 * The author would appreciate an email letting him know of any substantial

 * use of jqPlot.  You can reach the author at: chris at jqplot dot com 

 * or see http://www.jqplot.com/info.php.  This is, of course, not required.

 *

 * If you are feeling kind and generous, consider supporting the project by

 * making a donation at: http://www.jqplot.com/donate.php.

 *

 * sprintf functions contained in jqplot.sprintf.js by Ash Searle:

 * 

 *     version 2007.04.27

 *     author Ash Searle

 *     http://hexmen.com/blog/2007/03/printf-sprintf/

 *     http://hexmen.com/js/sprintf.js

 *     The author (Ash Searle) has placed this code in the public domain:

 *     "This code is unrestricted: you are free to use it however you like."

 * 

 * 

 * About: Introduction

 * 

 * jqPlot requires jQuery (1.4+ required for certain features). jQuery 1.4.2 is included in the distribution.  

 * To use jqPlot include jQuery, the jqPlot jQuery plugin, the jqPlot css file and optionally 

 * the excanvas script for IE support in your web page:

 * 

 * > <!--[if lt IE 9]><script language="javascript" type="text/javascript" src="excanvas.js"></script><![endif]-->

 * > <script language="javascript" type="text/javascript" src="jquery-1.4.4.min.js"></script>

 * > <script language="javascript" type="text/javascript" src="jquery.jqplot.min.js"></script>

 * > <link rel="stylesheet" type="text/css" href="jquery.jqplot.css" />

 * 

 * jqPlot can be customized by overriding the defaults of any of the objects which make

 * up the plot. The general usage of jqplot is:

 * 

 * > chart = $.jqplot('targetElemId', [dataArray,...], {optionsObject});

 * 

 * The options available to jqplot are detailed in <jqPlot Options> in the jqPlotOptions.txt file.

 * 

 * An actual call to $.jqplot() may look like the 

 * examples below:

 * 

 * > chart = $.jqplot('chartdiv',  [[[1, 2],[3,5.12],[5,13.1],[7,33.6],[9,85.9],[11,219.9]]]);

 * 

 * or

 * 

 * > dataArray = [34,12,43,55,77];

 * > chart = $.jqplot('targetElemId', [dataArray, ...], {title:'My Plot', axes:{yaxis:{min:20, max:100}}});

 * 

 * For more inforrmation, see <jqPlot Usage>.

 * 

 * About: Usage

 * 

 * See <jqPlot Usage>

 * 

 * About: Available Options 

 * 

 * See <jqPlot Options> for a list of options available thorugh the options object (not complete yet!)

 * 

 * About: Options Usage

 * 

 * See <Options Tutorial>

 * 

 * About: Changes

 * 

 * See <Change Log>

 * 

 */



(function($) {

    // make sure undefined is undefined

    var undefined;

    

    $.fn.emptyForce = function() {

      for ( var i = 0, elem; (elem = $(this)[i]) != null; i++ ) {

        // Remove element nodes and prevent memory leaks

        if ( elem.nodeType === 1 ) {

          $.cleanData( elem.getElementsByTagName("*") );

        }

  

        // Remove any remaining nodes

        if ($.jqplot.use_excanvas) {

          elem.outerHTML = "";

        }

        else {

          while ( elem.firstChild ) {

            elem.removeChild( elem.firstChild );

          }

        }



        elem = null;

      }

  

      return $(this);

    };

  

    $.fn.removeChildForce = function(parent) {

      while ( parent.firstChild ) {

        this.removeChildForce( parent.firstChild );

        parent.removeChild( parent.firstChild );

      }

    };



    $.fn.jqplot = function() {

        var datas = [];

        var options = [];

        // see how many data arrays we have

        for (var i=0, l=arguments.length; i<l; i++) {

            if ($.isArray(arguments[i])) {

                datas.push(arguments[i]);

            }

            else if ($.isPlainObject(arguments[i])) {

                options.push(arguments[i]);

            }

        }



        return this.each(function(index) {

            var tid, 

                plot, 

                $this = $(this),

                dl = datas.length,

                ol = options.length,

                data, 

                opts;



            if (index < dl) {

                data = datas[index];

            }

            else {

                data = dl ? datas[dl-1] : null;

            }



            if (index < ol) {

                opts = options[index];

            }

            else {

                opts = ol ? options[ol-1] : null;

            }



            // does el have an id?

            // if not assign it one.

            tid = $this.attr('id');

            if (tid === undefined) {

                tid = 'jqplot_target_' + $.jqplot.targetCounter++;

                $this.attr('id', tid);

            }



            plot = $.jqplot(tid, data, opts);



            $this.data('jqplot', plot);

        });

    };





    /**

     * Namespace: $.jqplot

     * jQuery function called by the user to create a plot.

     *  

     * Parameters:

     * target - ID of target element to render the plot into.

     * data - an array of data series.

     * options - user defined options object.  See the individual classes for available options.

     * 

     * Properties:

     * config - object to hold configuration information for jqPlot plot object.

     * 

     * attributes:

     * enablePlugins - False to disable plugins by default.  Plugins must then be explicitly 

     *   enabled in the individual plot options.  Default: false.

     *   This property sets the "show" property of certain plugins to true or false.

     *   Only plugins that can be immediately active upon loading are affected.  This includes

     *   non-renderer plugins like cursor, dragable, highlighter, and trendline.

     * defaultHeight - Default height for plots where no css height specification exists.  This

     *   is a jqplot wide default.

     * defaultWidth - Default height for plots where no css height specification exists.  This

     *   is a jqplot wide default.

     */



    $.jqplot = function(target, data, options) {

        var _data = null, _options = null;



        if (arguments.length === 3) {

            _data = data;

            _options = options;

        }



        else if (arguments.length === 2) {

            if ($.isArray(data)) {

                _data = data;

            }



            else if ($.isPlainObject(data)) {

                _options = data;

            }

        }



        if (_data === null && _options !== null && _options.data) {

            _data = _options.data;

        }



        var plot = new jqPlot();

        // remove any error class that may be stuck on target.

        $('#'+target).removeClass('jqplot-error');

        

        if ($.jqplot.config.catchErrors) {

            try {

                plot.init(target, _data, _options);

                plot.draw();

                plot.themeEngine.init.call(plot);

                return plot;

            }

            catch(e) {

                var msg = $.jqplot.config.errorMessage || e.message;

                $('#'+target).append('<div class="jqplot-error-message">'+msg+'</div>');

                $('#'+target).addClass('jqplot-error');

                document.getElementById(target).style.background = $.jqplot.config.errorBackground;

                document.getElementById(target).style.border = $.jqplot.config.errorBorder;

                document.getElementById(target).style.fontFamily = $.jqplot.config.errorFontFamily;

                document.getElementById(target).style.fontSize = $.jqplot.config.errorFontSize;

                document.getElementById(target).style.fontStyle = $.jqplot.config.errorFontStyle;

                document.getElementById(target).style.fontWeight = $.jqplot.config.errorFontWeight;

            }

        }

        else {        

            plot.init(target, _data, _options);

            plot.draw();

            plot.themeEngine.init.call(plot);

            return plot;

        }

    };



    $.jqplot.version = "1.0.9";

    $.jqplot.revision = "d96a669";



    $.jqplot.targetCounter = 1;



    // canvas manager to reuse canvases on the plot.

    // Should help solve problem of canvases not being freed and

    // problem of waiting forever for firefox to decide to free memory.

    $.jqplot.CanvasManager = function() {

        // canvases are managed globally so that they can be reused

        // across plots after they have been freed

        if (typeof $.jqplot.CanvasManager.canvases == 'undefined') {

            $.jqplot.CanvasManager.canvases = [];

            $.jqplot.CanvasManager.free = [];

        }

        

        var myCanvases = [];

        

        this.getCanvas = function() {

            var canvas;

            var makeNew = true;

            

            if (!$.jqplot.use_excanvas) {

                for (var i = 0, l = $.jqplot.CanvasManager.canvases.length; i < l; i++) {

                    if ($.jqplot.CanvasManager.free[i] === true) {

                        makeNew = false;

                        canvas = $.jqplot.CanvasManager.canvases[i];

                        // $(canvas).removeClass('jqplot-canvasManager-free').addClass('jqplot-canvasManager-inuse');

                        $.jqplot.CanvasManager.free[i] = false;

                        myCanvases.push(i);

                        break;

                    }

                }

            }



            if (makeNew) {

                canvas = document.createElement('canvas');

                myCanvases.push($.jqplot.CanvasManager.canvases.length);

                $.jqplot.CanvasManager.canvases.push(canvas);

                $.jqplot.CanvasManager.free.push(false);

            }   

            

            return canvas;

        };

        

        // this method has to be used after settings the dimesions

        // on the element returned by getCanvas()

        this.initCanvas = function(canvas) {

            if ($.jqplot.use_excanvas) {

                return window.G_vmlCanvasManager.initElement(canvas);

            }



            var cctx = canvas.getContext('2d');



            var canvasBackingScale = 1;

            if (window.devicePixelRatio > 1 && (cctx.webkitBackingStorePixelRatio === undefined || 

                                                cctx.webkitBackingStorePixelRatio < 2)) {

                canvasBackingScale = window.devicePixelRatio;

            }

            var oldWidth = canvas.width;

            var oldHeight = canvas.height;



            canvas.width = canvasBackingScale * canvas.width;

            canvas.height = canvasBackingScale * canvas.height;

            canvas.style.width = oldWidth + 'px';

            canvas.style.height = oldHeight + 'px';

            cctx.save();



            cctx.scale(canvasBackingScale, canvasBackingScale);



            return canvas;

        };



        this.freeAllCanvases = function() {

            for (var i = 0, l=myCanvases.length; i < l; i++) {

                this.freeCanvas(myCanvases[i]);

            }

            myCanvases = [];

        };



        this.freeCanvas = function(idx) {

            if ($.jqplot.use_excanvas && window.G_vmlCanvasManager.uninitElement !== undefined) {

                // excanvas can't be reused, but properly unset

                window.G_vmlCanvasManager.uninitElement($.jqplot.CanvasManager.canvases[idx]);

                $.jqplot.CanvasManager.canvases[idx] = null;

            } 

            else {

                var canvas = $.jqplot.CanvasManager.canvases[idx];

                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

                $(canvas).unbind().removeAttr('class').removeAttr('style');

                // Style attributes seemed to be still hanging around.  wierd.  Some ticks

                // still retained a left: 0px attribute after reusing a canvas.

                $(canvas).css({left: '', top: '', position: ''});

                // setting size to 0 may save memory of unused canvases?

                canvas.width = 0;

                canvas.height = 0;

                $.jqplot.CanvasManager.free[idx] = true;

            }

        };

        

    };



            

    // Convienence function that won't hang IE or FF without FireBug.

    $.jqplot.log = function() {

        if (window.console) {

            window.console.log.apply(window.console, arguments);

        }

    };

        

    $.jqplot.config = {

        addDomReference: false,

        enablePlugins:false,

        defaultHeight:300,

        defaultWidth:400,

        UTCAdjust:false,

        timezoneOffset: new Date(new Date().getTimezoneOffset() * 60000),

        errorMessage: '',

        errorBackground: '',

        errorBorder: '',

        errorFontFamily: '',

        errorFontSize: '',

        errorFontStyle: '',

        errorFontWeight: '',

        catchErrors: false,

        defaultTickFormatString: "%.1f",

        defaultColors: [ "#4bb2c5", "#EAA228", "#c5b47f", "#579575", "#839557", "#958c12", "#953579", "#4b5de4", "#d8b83f", "#ff5800", "#0085cc", "#c747a3", "#cddf54", "#FBD178", "#26B4E3", "#bd70c7"],

        defaultNegativeColors: [ "#498991", "#C08840", "#9F9274", "#546D61", "#646C4A", "#6F6621", "#6E3F5F", "#4F64B0", "#A89050", "#C45923", "#187399", "#945381", "#959E5C", "#C7AF7B", "#478396", "#907294"],

        dashLength: 4,

        gapLength: 4,

        dotGapLength: 2.5,

        srcLocation: 'jqplot/src/',

        pluginLocation: 'jqplot/src/plugins/'

    };

    

    

    $.jqplot.arrayMax = function( array ){

        return Math.max.apply( Math, array );

    };

    

    $.jqplot.arrayMin = function( array ){

        return Math.min.apply( Math, array );

    };

    

    $.jqplot.enablePlugins = $.jqplot.config.enablePlugins;

    

    // canvas related tests taken from modernizer:

    // Copyright (c) 2009 - 2010 Faruk Ates.

    // http://www.modernizr.com

    

    $.jqplot.support_canvas = function() {

        if (typeof $.jqplot.support_canvas.result == 'undefined') {

            $.jqplot.support_canvas.result = !!document.createElement('canvas').getContext; 

        }

        return $.jqplot.support_canvas.result;

    };

            

    $.jqplot.support_canvas_text = function() {

        if (typeof $.jqplot.support_canvas_text.result == 'undefined') {

            if (window.G_vmlCanvasManager !== undefined && window.G_vmlCanvasManager._version > 887) {

                $.jqplot.support_canvas_text.result = true;

            }

            else {

                $.jqplot.support_canvas_text.result = !!(document.createElement('canvas').getContext && typeof document.createElement('canvas').getContext('2d').fillText == 'function');

            }

             

        }

        return $.jqplot.support_canvas_text.result;

    };

    

    $.jqplot.use_excanvas = ((!$.support.boxModel || !$.support.objectAll || !$support.leadingWhitespace) && !$.jqplot.support_canvas()) ? true : false;

    

    /**

     * 

     * Hooks: jqPlot Pugin Hooks

     * 

     * $.jqplot.preInitHooks - called before initialization.

     * $.jqplot.postInitHooks - called after initialization.

     * $.jqplot.preParseOptionsHooks - called before user options are parsed.

     * $.jqplot.postParseOptionsHooks - called after user options are parsed.

     * $.jqplot.preDrawHooks - called before plot draw.

     * $.jqplot.postDrawHooks - called after plot draw.

     * $.jqplot.preDrawSeriesHooks - called before each series is drawn.

     * $.jqplot.postDrawSeriesHooks - called after each series is drawn.

     * $.jqplot.preDrawLegendHooks - called before the legend is drawn.

     * $.jqplot.addLegendRowHooks - called at the end of legend draw, so plugins

     *     can add rows to the legend table.

     * $.jqplot.preSeriesInitHooks - called before series is initialized.

     * $.jqplot.postSeriesInitHooks - called after series is initialized.

     * $.jqplot.preParseSeriesOptionsHooks - called before series related options

     *     are parsed.

     * $.jqplot.postParseSeriesOptionsHooks - called after series related options

     *     are parsed.

     * $.jqplot.eventListenerHooks - called at the end of plot drawing, binds

     *     listeners to the event canvas which lays on top of the grid area.

     * $.jqplot.preDrawSeriesShadowHooks - called before series shadows are drawn.

     * $.jqplot.postDrawSeriesShadowHooks - called after series shadows are drawn.

     * 

     */

    

    $.jqplot.preInitHooks = [];

    $.jqplot.postInitHooks = [];

    $.jqplot.preParseOptionsHooks = [];

    $.jqplot.postParseOptionsHooks = [];

    $.jqplot.preDrawHooks = [];

    $.jqplot.postDrawHooks = [];

    $.jqplot.preDrawSeriesHooks = [];

    $.jqplot.postDrawSeriesHooks = [];

    $.jqplot.preDrawLegendHooks = [];

    $.jqplot.addLegendRowHooks = [];

    $.jqplot.preSeriesInitHooks = [];

    $.jqplot.postSeriesInitHooks = [];

    $.jqplot.preParseSeriesOptionsHooks = [];

    $.jqplot.postParseSeriesOptionsHooks = [];

    $.jqplot.eventListenerHooks = [];

    $.jqplot.preDrawSeriesShadowHooks = [];

    $.jqplot.postDrawSeriesShadowHooks = [];



    // A superclass holding some common properties and methods.

    $.jqplot.ElemContainer = function() {

        this._elem;

        this._plotWidth;

        this._plotHeight;

        this._plotDimensions = {height:null, width:null};

    };

    

    $.jqplot.ElemContainer.prototype.createElement = function(el, offsets, clss, cssopts, attrib) {

        this._offsets = offsets;

        var klass = clss || 'jqplot';

        var elem = document.createElement(el);

        this._elem = $(elem);

        this._elem.addClass(klass);

        this._elem.css(cssopts);

        this._elem.attr(attrib);

        // avoid memory leak;

        elem = null;

        return this._elem;

    };

    

    $.jqplot.ElemContainer.prototype.getWidth = function() {

        if (this._elem) {

            return this._elem.outerWidth(true);

        }

        else {

            return null;

        }

    };

    

    $.jqplot.ElemContainer.prototype.getHeight = function() {

        if (this._elem) {

            return this._elem.outerHeight(true);

        }

        else {

            return null;

        }

    };

    

    $.jqplot.ElemContainer.prototype.getPosition = function() {

        if (this._elem) {

            return this._elem.position();

        }

        else {

            return {top:null, left:null, bottom:null, right:null};

        }

    };

    

    $.jqplot.ElemContainer.prototype.getTop = function() {

        return this.getPosition().top;

    };

    

    $.jqplot.ElemContainer.prototype.getLeft = function() {

        return this.getPosition().left;

    };

    

    $.jqplot.ElemContainer.prototype.getBottom = function() {

        return this._elem.css('bottom');

    };

    

    $.jqplot.ElemContainer.prototype.getRight = function() {

        return this._elem.css('right');

    };

    



    /**

     * Class: Axis

     * An individual axis object.  Cannot be instantiated directly, but created

     * by the Plot object.  Axis properties can be set or overridden by the 

     * options passed in from the user.

     * 

     */

    function Axis(name) {

        $.jqplot.ElemContainer.call(this);

        // Group: Properties

        //

        // Axes options are specified within an axes object at the top level of the 

        // plot options like so:

        // > {

        // >    axes: {

        // >        xaxis: {min: 5},

        // >        yaxis: {min: 2, max: 8, numberTicks:4},

        // >        x2axis: {pad: 1.5},

        // >        y2axis: {ticks:[22, 44, 66, 88]}

        // >        }

        // > }

        // There are 2 x axes, 'xaxis' and 'x2axis', and 

        // 9 yaxes, 'yaxis', 'y2axis'. 'y3axis', ...  Any or all of which may be specified.

        this.name = name;

        this._series = [];

        // prop: show

        // Wether to display the axis on the graph.

        this.show = false;

        // prop: tickRenderer

        // A class of a rendering engine for creating the ticks labels displayed on the plot, 

        // See <$.jqplot.AxisTickRenderer>.

        this.tickRenderer = $.jqplot.AxisTickRenderer;

        // prop: tickOptions

        // Options that will be passed to the tickRenderer, see <$.jqplot.AxisTickRenderer> options.

        this.tickOptions = {};

        // prop: labelRenderer

        // A class of a rendering engine for creating an axis label.

        this.labelRenderer = $.jqplot.AxisLabelRenderer;

        // prop: labelOptions

        // Options passed to the label renderer.

        this.labelOptions = {};

        // prop: label

        // Label for the axis

        this.label = null;

        // prop: showLabel

        // true to show the axis label.

        this.showLabel = true;

        // prop: min

        // minimum value of the axis (in data units, not pixels).

        this.min = null;

        // prop: max

        // maximum value of the axis (in data units, not pixels).

        this.max = null;

        // prop: autoscale

        // DEPRECATED

        // the default scaling algorithm produces superior results.

        this.autoscale = false;

        // prop: pad

        // Padding to extend the range above and below the data bounds.

        // The data range is multiplied by this factor to determine minimum and maximum axis bounds.

        // A value of 0 will be interpreted to mean no padding, and pad will be set to 1.0.

        this.pad = 1.2;

        // prop: padMax

        // Padding to extend the range above data bounds.

        // The top of the data range is multiplied by this factor to determine maximum axis bounds.

        // A value of 0 will be interpreted to mean no padding, and padMax will be set to 1.0.

        this.padMax = null;

        // prop: padMin

        // Padding to extend the range below data bounds.

        // The bottom of the data range is multiplied by this factor to determine minimum axis bounds.

        // A value of 0 will be interpreted to mean no padding, and padMin will be set to 1.0.

        this.padMin = null;

        // prop: ticks

        // 1D [val, val, ...] or 2D [[val, label], [val, label], ...] array of ticks for the axis.

        // If no label is specified, the value is formatted into an appropriate label.

        this.ticks = [];

        // prop: numberTicks

        // Desired number of ticks.  Default is to compute automatically.

        this.numberTicks;

        // prop: tickInterval

        // number of units between ticks.  Mutually exclusive with numberTicks.

        this.tickInterval;

        // prop: renderer

        // A class of a rendering engine that handles tick generation, 

        // scaling input data to pixel grid units and drawing the axis element.

        this.renderer = $.jqplot.LinearAxisRenderer;

        // prop: rendererOptions

        // renderer specific options.  See <$.jqplot.LinearAxisRenderer> for options.

        this.rendererOptions = {};

        // prop: showTicks

        // Wether to show the ticks (both marks and labels) or not.

        // Will not override showMark and showLabel options if specified on the ticks themselves.

        this.showTicks = true;

        // prop: showTickMarks

        // Wether to show the tick marks (line crossing grid) or not.

        // Overridden by showTicks and showMark option of tick itself.

        this.showTickMarks = true;

        // prop: showMinorTicks

        // Wether or not to show minor ticks.  This is renderer dependent.

        this.showMinorTicks = true;

        // prop: drawMajorGridlines

        // True to draw gridlines for major axis ticks.

        this.drawMajorGridlines = true;

        // prop: drawMinorGridlines

        // True to draw gridlines for minor ticks.

        this.drawMinorGridlines = false;

        // prop: drawMajorTickMarks

        // True to draw tick marks for major axis ticks.

        this.drawMajorTickMarks = true;

        // prop: drawMinorTickMarks

        // True to draw tick marks for minor ticks.  This is renderer dependent.

        this.drawMinorTickMarks = true;

        // prop: useSeriesColor

        // Use the color of the first series associated with this axis for the

        // tick marks and line bordering this axis.

        this.useSeriesColor = false;

        // prop: borderWidth

        // width of line stroked at the border of the axis.  Defaults

        // to the width of the grid boarder.

        this.borderWidth = null;

        // prop: borderColor

        // color of the border adjacent to the axis.  Defaults to grid border color.

        this.borderColor = null;

        // prop: scaleToHiddenSeries

        // True to include hidden series when computing axes bounds and scaling.

        this.scaleToHiddenSeries = false;

        // minimum and maximum values on the axis.

        this._dataBounds = {min:null, max:null};

        // statistics (min, max, mean) as well as actual data intervals for each series attached to axis.

        // holds collection of {intervals:[], min:, max:, mean: } objects for each series on axis.

        this._intervalStats = [];

        // pixel position from the top left of the min value and max value on the axis.

        this._offsets = {min:null, max:null};

        this._ticks=[];

        this._label = null;

        // prop: syncTicks

        // true to try and synchronize tick spacing across multiple axes so that ticks and

        // grid lines line up.  This has an impact on autoscaling algorithm, however.

        // In general, autoscaling an individual axis will work better if it does not

        // have to sync ticks.

        this.syncTicks = null;

        // prop: tickSpacing

        // Approximate pixel spacing between ticks on graph.  Used during autoscaling.

        // This number will be an upper bound, actual spacing will be less.

        this.tickSpacing = 75;

        // Properties to hold the original values for min, max, ticks, tickInterval and numberTicks

        // so they can be restored if altered by plugins.

        this._min = null;

        this._max = null;

        this._tickInterval = null;

        this._numberTicks = null;

        this.__ticks = null;

        // hold original user options.

        this._options = {};

    }

    

    Axis.prototype = new $.jqplot.ElemContainer();

    Axis.prototype.constructor = Axis;

    

    Axis.prototype.init = function() {

        if ($.isFunction(this.renderer)) {

            this.renderer = new this.renderer();  

        }

        // set the axis name

        this.tickOptions.axis = this.name;

        // if showMark or showLabel tick options not specified, use value of axis option.

        // showTicks overrides showTickMarks.

        if (this.tickOptions.showMark == null) {

            this.tickOptions.showMark = this.showTicks;

        }

        if (this.tickOptions.showMark == null) {

            this.tickOptions.showMark = this.showTickMarks;

        }

        if (this.tickOptions.showLabel == null) {

            this.tickOptions.showLabel = this.showTicks;

        }

        

        if (this.label == null || this.label == '') {

            this.showLabel = false;

        }

        else {

            this.labelOptions.label = this.label;

        }

        if (this.showLabel == false) {

            this.labelOptions.show = false;

        }

        // set the default padMax, padMin if not specified

        // special check, if no padding desired, padding

        // should be set to 1.0

        if (this.pad == 0) {

            this.pad = 1.0;

        }

        if (this.padMax == 0) {

            this.padMax = 1.0;

        }

        if (this.padMin == 0) {

            this.padMin = 1.0;

        }

        if (this.padMax == null) {

            this.padMax = (this.pad-1)/2 + 1;

        }

        if (this.padMin == null) {

            this.padMin = (this.pad-1)/2 + 1;

        }

        // now that padMin and padMax are correctly set, reset pad in case user has supplied 

        // padMin and/or padMax

        this.pad = this.padMax + this.padMin - 1;

        if (this.min != null || this.max != null) {

            this.autoscale = false;

        }

        // if not set, sync ticks for y axes but not x by default.

        if (this.syncTicks == null && this.name.indexOf('y') > -1) {

            this.syncTicks = true;

        }

        else if (this.syncTicks == null){

            this.syncTicks = false;

        }

        this.renderer.init.call(this, this.rendererOptions);

        

    };

    

    Axis.prototype.draw = function(ctx, plot) {

        // Memory Leaks patch

        if (this.__ticks) {

          this.__ticks = null;

        }



        return this.renderer.draw.call(this, ctx, plot);

        

    };

    

    Axis.prototype.set = function() {

        this.renderer.set.call(this);

    };

    

    Axis.prototype.pack = function(pos, offsets) {

        if (this.show) {

            this.renderer.pack.call(this, pos, offsets);

        }

        // these properties should all be available now.

        if (this._min == null) {

            this._min = this.min;

            this._max = this.max;

            this._tickInterval = this.tickInterval;

            this._numberTicks = this.numberTicks;

            this.__ticks = this._ticks;

        }

    };

    

    // reset the axis back to original values if it has been scaled, zoomed, etc.

    Axis.prototype.reset = function() {

        this.renderer.reset.call(this);

    };

    

    Axis.prototype.resetScale = function(opts) {

        $.extend(true, this, {min: null, max: null, numberTicks: null, tickInterval: null, _ticks: [], ticks: []}, opts);

        this.resetDataBounds();

    };

    

    Axis.prototype.resetDataBounds = function() {

        // Go through all the series attached to this axis and find

        // the min/max bounds for this axis.

        var db = this._dataBounds;

        db.min = null;

        db.max = null;

        var l, s, d;

        // check for when to force min 0 on bar series plots.

        var doforce = (this.show) ? true : false;

        for (var i=0; i<this._series.length; i++) {

            s = this._series[i];

            if (s.show || this.scaleToHiddenSeries) {

                d = s._plotData;

                if (s._type === 'line' && s.renderer.bands.show && this.name.charAt(0) !== 'x') {

                    d = [[0, s.renderer.bands._min], [1, s.renderer.bands._max]];

                }



                var minyidx = 1, maxyidx = 1;



                if (s._type != null && s._type == 'ohlc') {

                    minyidx = 3;

                    maxyidx = 2;

                }

                

                for (var j=0, l=d.length; j<l; j++) { 

                    if (this.name == 'xaxis' || this.name == 'x2axis') {

                        if ((d[j][0] != null && d[j][0] < db.min) || db.min == null) {

                            db.min = d[j][0];

                        }

                        if ((d[j][0] != null && d[j][0] > db.max) || db.max == null) {

                            db.max = d[j][0];

                        }

                    }              

                    else {

                        if ((d[j][minyidx] != null && d[j][minyidx] < db.min) || db.min == null) {

                            db.min = d[j][minyidx];

                        }

                        if ((d[j][maxyidx] != null && d[j][maxyidx] > db.max) || db.max == null) {

                            db.max = d[j][maxyidx];

                        }

                    }              

                }



                // Hack to not pad out bottom of bar plots unless user has specified a padding.

                // every series will have a chance to set doforce to false.  once it is set to 

                // false, it cannot be reset to true.

                // If any series attached to axis is not a bar, wont force 0.

                if (doforce && s.renderer.constructor !== $.jqplot.BarRenderer) {

                    doforce = false;

                }



                else if (doforce && this._options.hasOwnProperty('forceTickAt0') && this._options.forceTickAt0 == false) {

                    doforce = false;

                }



                else if (doforce && s.renderer.constructor === $.jqplot.BarRenderer) {

                    if (s.barDirection == 'vertical' && this.name != 'xaxis' && this.name != 'x2axis') { 

                        if (this._options.pad != null || this._options.padMin != null) {

                            doforce = false;

                        }

                    }



                    else if (s.barDirection == 'horizontal' && (this.name == 'xaxis' || this.name == 'x2axis')) {

                        if (this._options.pad != null || this._options.padMin != null) {

                            doforce = false;

                        }

                    }



                }

            }

        }



        if (doforce && this.renderer.constructor === $.jqplot.LinearAxisRenderer && db.min >= 0) {

            this.padMin = 1.0;

            this.forceTickAt0 = true;

        }

    };



    /**

     * Class: Legend

     * Legend object.  Cannot be instantiated directly, but created

     * by the Plot object.  Legend properties can be set or overridden by the 

     * options passed in from the user.

     */

    function Legend(options) {

        $.jqplot.ElemContainer.call(this);

        // Group: Properties

        

        // prop: show

        // Wether to display the legend on the graph.

        this.show = false;

        // prop: location

        // Placement of the legend.  one of the compass directions: nw, n, ne, e, se, s, sw, w

        this.location = 'ne';

        // prop: labels

        // Array of labels to use.  By default the renderer will look for labels on the series.

        // Labels specified in this array will override labels specified on the series.

        this.labels = [];

        // prop: showLabels

        // true to show the label text on the  legend.

        this.showLabels = true;

        // prop: showSwatch

        // true to show the color swatches on the legend.

        this.showSwatches = true;

        // prop: placement

        // "insideGrid" places legend inside the grid area of the plot.

        // "outsideGrid" places the legend outside the grid but inside the plot container, 

        // shrinking the grid to accomodate the legend.

        // "inside" synonym for "insideGrid", 

        // "outside" places the legend ouside the grid area, but does not shrink the grid which

        // can cause the legend to overflow the plot container.

        this.placement = "insideGrid";

        // prop: xoffset

        // DEPRECATED.  Set the margins on the legend using the marginTop, marginLeft, etc. 

        // properties or via CSS margin styling of the .jqplot-table-legend class.

        this.xoffset = 0;

        // prop: yoffset

        // DEPRECATED.  Set the margins on the legend using the marginTop, marginLeft, etc. 

        // properties or via CSS margin styling of the .jqplot-table-legend class.

        this.yoffset = 0;

        // prop: border

        // css spec for the border around the legend box.

        this.border;

        // prop: background

        // css spec for the background of the legend box.

        this.background;

        // prop: textColor

        // css color spec for the legend text.

        this.textColor;

        // prop: fontFamily

        // css font-family spec for the legend text.

        this.fontFamily; 

        // prop: fontSize

        // css font-size spec for the legend text.

        this.fontSize ;

        // prop: rowSpacing

        // css padding-top spec for the rows in the legend.

        this.rowSpacing = '0.5em';

        // renderer

        // A class that will create a DOM object for the legend,

        // see <$.jqplot.TableLegendRenderer>.

        this.renderer = $.jqplot.TableLegendRenderer;

        // prop: rendererOptions

        // renderer specific options passed to the renderer.

        this.rendererOptions = {};

        // prop: predraw

        // Wether to draw the legend before the series or not.

        // Used with series specific legend renderers for pie, donut, mekko charts, etc.

        this.preDraw = false;

        // prop: marginTop

        // CSS margin for the legend DOM element. This will set an element 

        // CSS style for the margin which will override any style sheet setting.

        // The default will be taken from the stylesheet.

        this.marginTop = null;

        // prop: marginRight

        // CSS margin for the legend DOM element. This will set an element 

        // CSS style for the margin which will override any style sheet setting.

        // The default will be taken from the stylesheet.

        this.marginRight = null;

        // prop: marginBottom

        // CSS margin for the legend DOM element. This will set an element 

        // CSS style for the margin which will override any style sheet setting.

        // The default will be taken from the stylesheet.

        this.marginBottom = null;

        // prop: marginLeft

        // CSS margin for the legend DOM element. This will set an element 

        // CSS style for the margin which will override any style sheet setting.

        // The default will be taken from the stylesheet.

        this.marginLeft = null;

        // prop: escapeHtml

        // True to escape special characters with their html entity equivalents

        // in legend text.  "<" becomes &lt; and so on, so html tags are not rendered.

        this.escapeHtml = false;

        this._series = [];

        

        $.extend(true, this, options);

    }

    

    Legend.prototype = new $.jqplot.ElemContainer();

    Legend.prototype.constructor = Legend;

    

    Legend.prototype.setOptions = function(options) {

        $.extend(true, this, options);

        

        // Try to emulate deprecated behaviour

        // if user has specified xoffset or yoffset, copy these to

        // the margin properties.

        

        if (this.placement ==  'inside') {

            this.placement = 'insideGrid';

        }

        

        if (this.xoffset >0) {

            if (this.placement == 'insideGrid') {

                switch (this.location) {

                    case 'nw':

                    case 'w':

                    case 'sw':

                        if (this.marginLeft == null) {

                            this.marginLeft = this.xoffset + 'px';

                        }

                        this.marginRight = '0px';

                        break;

                    case 'ne':

                    case 'e':

                    case 'se':

                    default:

                        if (this.marginRight == null) {

                            this.marginRight = this.xoffset + 'px';

                        }

                        this.marginLeft = '0px';

                        break;

                }

            }

            else if (this.placement == 'outside') {

                switch (this.location) {

                    case 'nw':

                    case 'w':

                    case 'sw':

                        if (this.marginRight == null) {

                            this.marginRight = this.xoffset + 'px';

                        }

                        this.marginLeft = '0px';

                        break;

                    case 'ne':

                    case 'e':

                    case 'se':

                    default:

                        if (this.marginLeft == null) {

                            this.marginLeft = this.xoffset + 'px';

                        }

                        this.marginRight = '0px';

                        break;

                }

            }

            this.xoffset = 0;

        }

        

        if (this.yoffset >0) {

            if (this.placement == 'outside') {

                switch (this.location) {

                    case 'sw':

                    case 's':

                    case 'se':

                        if (this.marginTop == null) {

                            this.marginTop = this.yoffset + 'px';

                        }

                        this.marginBottom = '0px';

                        break;

                    case 'ne':

                    case 'n':

                    case 'nw':

                    default:

                        if (this.marginBottom == null) {

                            this.marginBottom = this.yoffset + 'px';

                        }

                        this.marginTop = '0px';

                        break;

                }

            }

            else if (this.placement == 'insideGrid') {

                switch (this.location) {

                    case 'sw':

                    case 's':

                    case 'se':

                        if (this.marginBottom == null) {

                            this.marginBottom = this.yoffset + 'px';

                        }

                        this.marginTop = '0px';

                        break;

                    case 'ne':

                    case 'n':

                    case 'nw':

                    default:

                        if (this.marginTop == null) {

                            this.marginTop = this.yoffset + 'px';

                        }

                        this.marginBottom = '0px';

                        break;

                }

            }

            this.yoffset = 0;

        }

        

        // TO-DO:

        // Handle case where offsets are < 0.

        //

    };

    

    Legend.prototype.init = function() {

        if ($.isFunction(this.renderer)) {

            this.renderer = new this.renderer();  

        }

        this.renderer.init.call(this, this.rendererOptions);

    };

    

    Legend.prototype.draw = function(offsets, plot) {

        for (var i=0; i<$.jqplot.preDrawLegendHooks.length; i++){

            $.jqplot.preDrawLegendHooks[i].call(this, offsets);

        }

        return this.renderer.draw.call(this, offsets, plot);

    };

    

    Legend.prototype.pack = function(offsets) {

        this.renderer.pack.call(this, offsets);

    };



    /**

     * Class: Title

     * Plot Title object.  Cannot be instantiated directly, but created

     * by the Plot object.  Title properties can be set or overridden by the 

     * options passed in from the user.

     * 

     * Parameters:

     * text - text of the title.

     */

    function Title(text) {

        $.jqplot.ElemContainer.call(this);

        // Group: Properties

        

        // prop: text

        // text of the title;

        this.text = text;

        // prop: show

        // whether or not to show the title

        this.show = true;

        // prop: fontFamily

        // css font-family spec for the text.

        this.fontFamily;

        // prop: fontSize

        // css font-size spec for the text.

        this.fontSize ;

        // prop: textAlign

        // css text-align spec for the text.

        this.textAlign;

        // prop: textColor

        // css color spec for the text.

        this.textColor;

        // prop: renderer

        // A class for creating a DOM element for the title,

        // see <$.jqplot.DivTitleRenderer>.

        this.renderer = $.jqplot.DivTitleRenderer;

        // prop: rendererOptions

        // renderer specific options passed to the renderer.

        this.rendererOptions = {};   

        // prop: escapeHtml

        // True to escape special characters with their html entity equivalents

        // in title text.  "<" becomes &lt; and so on, so html tags are not rendered.

        this.escapeHtml = false;

    }

    

    Title.prototype = new $.jqplot.ElemContainer();

    Title.prototype.constructor = Title;

    

    Title.prototype.init = function() {

        if ($.isFunction(this.renderer)) {

            this.renderer = new this.renderer();  

        }

        this.renderer.init.call(this, this.rendererOptions);

    };

    

    Title.prototype.draw = function(width) {

        return this.renderer.draw.call(this, width);

    };

    

    Title.prototype.pack = function() {

        this.renderer.pack.call(this);

    };





    /**

     * Class: Series

     * An individual data series object.  Cannot be instantiated directly, but created

     * by the Plot object.  Series properties can be set or overridden by the 

     * options passed in from the user.

     */

    function Series(options) {

        options = options || {};

        $.jqplot.ElemContainer.call(this);

        // Group: Properties

        // Properties will be assigned from a series array at the top level of the

        // options.  If you had two series and wanted to change the color and line

        // width of the first and set the second to use the secondary y axis with

        // no shadow and supply custom labels for each:

        // > {

        // >    series:[

        // >        {color: '#ff4466', lineWidth: 5, label:'good line'},

        // >        {yaxis: 'y2axis', shadow: false, label:'bad line'}

        // >    ]

        // > }



        // prop: show

        // whether or not to draw the series.

        this.show = true;

        // prop: xaxis

        // which x axis to use with this series, either 'xaxis' or 'x2axis'.

        this.xaxis = 'xaxis';

        this._xaxis;

        // prop: yaxis

        // which y axis to use with this series, either 'yaxis' or 'y2axis'.

        this.yaxis = 'yaxis';

        this._yaxis;

        this.gridBorderWidth = 2.0;

        // prop: renderer

        // A class of a renderer which will draw the series, 

        // see <$.jqplot.LineRenderer>.

        this.renderer = $.jqplot.LineRenderer;

        // prop: rendererOptions

        // Options to pass on to the renderer.

        this.rendererOptions = {};

        this.data = [];

        this.gridData = [];

        // prop: label

        // Line label to use in the legend.

        this.label = '';

        // prop: showLabel

        // true to show label for this series in the legend.

        this.showLabel = true;

        // prop: color

        // css color spec for the series

        this.color;

        // prop: negativeColor

        // css color spec used for filled (area) plots that are filled to zero and

        // the "useNegativeColors" option is true.

        this.negativeColor;

        // prop: lineWidth

        // width of the line in pixels.  May have different meanings depending on renderer.

        this.lineWidth = 2.5;

        // prop: lineJoin

        // Canvas lineJoin style between segments of series.

        this.lineJoin = 'round';

        // prop: lineCap

        // Canvas lineCap style at ends of line.

        this.lineCap = 'round';

        // prop: linePattern

        // line pattern 'dashed', 'dotted', 'solid', some combination

        // of '-' and '.' characters such as '.-.' or a numerical array like 

        // [draw, skip, draw, skip, ...] such as [1, 10] to draw a dotted line, 

        // [1, 10, 20, 10] to draw a dot-dash line, and so on.

        this.linePattern = 'solid';

        this.shadow = true;

        // prop: shadowAngle

        // Shadow angle in degrees

        this.shadowAngle = 45;

        // prop: shadowOffset

        // Shadow offset from line in pixels

        this.shadowOffset = 1.25;

        // prop: shadowDepth

        // Number of times shadow is stroked, each stroke offset shadowOffset from the last.

        this.shadowDepth = 3;

        // prop: shadowAlpha

        // Alpha channel transparency of shadow.  0 = transparent.

        this.shadowAlpha = '0.1';

        // prop: breakOnNull

        // Wether line segments should be be broken at null value.

        // False will join point on either side of line.

        this.breakOnNull = false;

        // prop: markerRenderer

        // A class of a renderer which will draw marker (e.g. circle, square, ...) at the data points,

        // see <$.jqplot.MarkerRenderer>.

        this.markerRenderer = $.jqplot.MarkerRenderer;

        // prop: markerOptions

        // renderer specific options to pass to the markerRenderer,

        // see <$.jqplot.MarkerRenderer>.

        this.markerOptions = {};

        // prop: showLine

        // whether to actually draw the line or not.  Series will still be renderered, even if no line is drawn.

        this.showLine = true;

        // prop: showMarker

        // whether or not to show the markers at the data points.

        this.showMarker = true;

        // prop: index

        // 0 based index of this series in the plot series array.

        this.index;

        // prop: fill

        // true or false, whether to fill under lines or in bars.

        // May not be implemented in all renderers.

        this.fill = false;

        // prop: fillColor

        // CSS color spec to use for fill under line.  Defaults to line color.

        this.fillColor;

        // prop: fillAlpha

        // Alpha transparency to apply to the fill under the line.

        // Use this to adjust alpha separate from fill color.

        this.fillAlpha;

        // prop: fillAndStroke

        // If true will stroke the line (with color this.color) as well as fill under it.

        // Applies only when fill is true.

        this.fillAndStroke = false;

        // prop: disableStack

        // true to not stack this series with other series in the plot.

        // To render properly, non-stacked series must come after any stacked series

        // in the plot's data series array.  So, the plot's data series array would look like:

        // > [stackedSeries1, stackedSeries2, ..., nonStackedSeries1, nonStackedSeries2, ...]

        // disableStack will put a gap in the stacking order of series, and subsequent

        // stacked series will not fill down through the non-stacked series and will

        // most likely not stack properly on top of the non-stacked series.

        this.disableStack = false;

        // _stack is set by the Plot if the plot is a stacked chart.

        // will stack lines or bars on top of one another to build a "mountain" style chart.

        // May not be implemented in all renderers.

        this._stack = false;

        // prop: neighborThreshold

        // how close or far (in pixels) the cursor must be from a point marker to detect the point.

        this.neighborThreshold = 4;

        // prop: fillToZero

        // true will force bar and filled series to fill toward zero on the fill Axis.

        this.fillToZero = false;

        // prop: fillToValue

        // fill a filled series to this value on the fill axis.

        // Works in conjunction with fillToZero, so that must be true.

        this.fillToValue = 0;

        // prop: fillAxis

        // Either 'x' or 'y'.  Which axis to fill the line toward if fillToZero is true.

        // 'y' means fill up/down to 0 on the y axis for this series.

        this.fillAxis = 'y';

        // prop: useNegativeColors

        // true to color negative values differently in filled and bar charts.

        this.useNegativeColors = true;

        this._stackData = [];

        // _plotData accounts for stacking.  If plots not stacked, _plotData and data are same.  If

        // stacked, _plotData is accumulation of stacking data.

        this._plotData = [];

        // _plotValues hold the individual x and y values that will be plotted for this series.

        this._plotValues = {x:[], y:[]};

        // statistics about the intervals between data points.  Used for auto scaling.

        this._intervals = {x:{}, y:{}};

        // data from the previous series, for stacked charts.

        this._prevPlotData = [];

        this._prevGridData = [];

        this._stackAxis = 'y';

        this._primaryAxis = '_xaxis';

        // give each series a canvas to draw on.  This should allow for redrawing speedups.

        this.canvas = new $.jqplot.GenericCanvas();

        this.shadowCanvas = new $.jqplot.GenericCanvas();

        this.plugins = {};

        // sum of y values in this series.

        this._sumy = 0;

        this._sumx = 0;

        this._type = '';

        this.step = false;

    }

    

    Series.prototype = new $.jqplot.ElemContainer();

    Series.prototype.constructor = Series;

    

    Series.prototype.init = function(index, gridbw, plot) {

        // weed out any null values in the data.

        this.index = index;

        this.gridBorderWidth = gridbw;

        var d = this.data;

        var temp = [], i, l;

        for (i=0, l=d.length; i<l; i++) {

            if (! this.breakOnNull) {

                if (d[i] == null || d[i][0] == null || d[i][1] == null) {

                    continue;

                }

                else {

                    temp.push(d[i]);

                }

            }

            else {

                // TODO: figure out what to do with null values

                // probably involve keeping nulls in data array

                // and then updating renderers to break line

                // when it hits null value.

                // For now, just keep value.

                temp.push(d[i]);

            }

        }

        this.data = temp;



        // parse the renderer options and apply default colors if not provided

        // Set color even if not shown, so series don't change colors when other

        // series on plot shown/hidden.

        if (!this.color) {

            this.color = plot.colorGenerator.get(this.index);

        }

        if (!this.negativeColor) {

            this.negativeColor = plot.negativeColorGenerator.get(this.index);

        }





        if (!this.fillColor) {

            this.fillColor = this.color;

        }

        if (this.fillAlpha) {

            var comp = $.jqplot.normalize2rgb(this.fillColor);

            var comp = $.jqplot.getColorComponents(comp);

            this.fillColor = 'rgba('+comp[0]+','+comp[1]+','+comp[2]+','+this.fillAlpha+')';

        }

        if ($.isFunction(this.renderer)) {

            this.renderer = new this.renderer();  

        }

        this.renderer.init.call(this, this.rendererOptions, plot);

        this.markerRenderer = new this.markerRenderer();

        if (!this.markerOptions.color) {

            this.markerOptions.color = this.color;

        }

        if (this.markerOptions.show == null) {

            this.markerOptions.show = this.showMarker;

        }

        this.showMarker = this.markerOptions.show;

        // the markerRenderer is called within its own scope, don't want to overwrite series options!!

        this.markerRenderer.init(this.markerOptions);

    };

    

    // data - optional data point array to draw using this series renderer

    // gridData - optional grid data point array to draw using this series renderer

    // stackData - array of cumulative data for stacked plots.

    Series.prototype.draw = function(sctx, opts, plot) {

        var options = (opts == undefined) ? {} : opts;

        sctx = (sctx == undefined) ? this.canvas._ctx : sctx;

        

        var j, data, gridData;

        

        // hooks get called even if series not shown

        // we don't clear canvas here, it would wipe out all other series as well.

        for (j=0; j<$.jqplot.preDrawSeriesHooks.length; j++) {

            $.jqplot.preDrawSeriesHooks[j].call(this, sctx, options);

        }

        if (this.show) {

            this.renderer.setGridData.call(this, plot);

            if (!options.preventJqPlotSeriesDrawTrigger) {

                $(sctx.canvas).trigger('jqplotSeriesDraw', [this.data, this.gridData]);

            }

            data = [];

            if (options.data) {

                data = options.data;

            }

            else if (!this._stack) {

                data = this.data;

            }

            else {

                data = this._plotData;

            }

            gridData = options.gridData || this.renderer.makeGridData.call(this, data, plot);



            if (this._type === 'line' && this.renderer.smooth && this.renderer._smoothedData.length) {

                gridData = this.renderer._smoothedData;

            }



            this.renderer.draw.call(this, sctx, gridData, options, plot);

        }

        

        for (j=0; j<$.jqplot.postDrawSeriesHooks.length; j++) {

            $.jqplot.postDrawSeriesHooks[j].call(this, sctx, options, plot);

        }

        

        sctx = opts = plot = j = data = gridData = null;

    };

    

    Series.prototype.drawShadow = function(sctx, opts, plot) {

        var options = (opts == undefined) ? {} : opts;

        sctx = (sctx == undefined) ? this.shadowCanvas._ctx : sctx;

        

        var j, data, gridData;

        

        // hooks get called even if series not shown

        // we don't clear canvas here, it would wipe out all other series as well.

        for (j=0; j<$.jqplot.preDrawSeriesShadowHooks.length; j++) {

            $.jqplot.preDrawSeriesShadowHooks[j].call(this, sctx, options);

        }

        if (this.shadow) {

            this.renderer.setGridData.call(this, plot);



            data = [];

            if (options.data) {

                data = options.data;

            }

            else if (!this._stack) {

                data = this.data;

            }

            else {

                data = this._plotData;

            }

            gridData = options.gridData || this.renderer.makeGridData.call(this, data, plot);

        

            this.renderer.drawShadow.call(this, sctx, gridData, options, plot);

        }

        

        for (j=0; j<$.jqplot.postDrawSeriesShadowHooks.length; j++) {

            $.jqplot.postDrawSeriesShadowHooks[j].call(this, sctx, options);

        }

        

        sctx = opts = plot = j = data = gridData = null;

        

    };

    

    // toggles series display on plot, e.g. show/hide series

    Series.prototype.toggleDisplay = function(ev, callback) {

        var s, speed;

        if (ev.data.series) {

            s = ev.data.series;

        }

        else {

            s = this;

        }



        if (ev.data.speed) {

            speed = ev.data.speed;

        }

        if (speed) {

            // this can be tricky because series may not have a canvas element if replotting.

            if (s.canvas._elem.is(':hidden') || !s.show) {

                s.show = true;



                s.canvas._elem.removeClass('jqplot-series-hidden');

                if (s.shadowCanvas._elem) {

                    s.shadowCanvas._elem.fadeIn(speed);

                }

                s.canvas._elem.fadeIn(speed, callback);

                s.canvas._elem.nextAll('.jqplot-point-label.jqplot-series-'+s.index).fadeIn(speed);

            }

            else {

                s.show = false;



                s.canvas._elem.addClass('jqplot-series-hidden');

                if (s.shadowCanvas._elem) {

                    s.shadowCanvas._elem.fadeOut(speed);

                }

                s.canvas._elem.fadeOut(speed, callback);

                s.canvas._elem.nextAll('.jqplot-point-label.jqplot-series-'+s.index).fadeOut(speed);

            }

        }

        else {

            // this can be tricky because series may not have a canvas element if replotting.

            if (s.canvas._elem.is(':hidden') || !s.show) {

                s.show = true;



                s.canvas._elem.removeClass('jqplot-series-hidden');

                if (s.shadowCanvas._elem) {

                    s.shadowCanvas._elem.show();

                }

                s.canvas._elem.show(0, callback);

                s.canvas._elem.nextAll('.jqplot-point-label.jqplot-series-'+s.index).show();

            }

            else {

                s.show = false;



                s.canvas._elem.addClass('jqplot-series-hidden');

                if (s.shadowCanvas._elem) {

                    s.shadowCanvas._elem.hide();

                }

                s.canvas._elem.hide(0, callback);

                s.canvas._elem.nextAll('.jqplot-point-label.jqplot-series-'+s.index).hide();

            }

        }

    };

    





    /**

     * Class: Grid

     * 

     * Object representing the grid on which the plot is drawn.  The grid in this

     * context is the area bounded by the axes, the area which will contain the series.

     * Note, the series are drawn on their own canvas.

     * The Grid object cannot be instantiated directly, but is created by the Plot object.  

     * Grid properties can be set or overridden by the options passed in from the user.

     */

    function Grid() {

        $.jqplot.ElemContainer.call(this);

        // Group: Properties

        

        // prop: drawGridlines

        // whether to draw the gridlines on the plot.

        this.drawGridlines = true;

        // prop: gridLineColor

        // color of the grid lines.

        this.gridLineColor = '#cccccc';

        // prop: gridLineWidth

        // width of the grid lines.

        this.gridLineWidth = 1.0;

        // prop: background

        // css spec for the background color.

        this.background = '#fffdf6';

        // prop: borderColor

        // css spec for the color of the grid border.

        this.borderColor = '#999999';

        // prop: borderWidth

        // width of the border in pixels.

        this.borderWidth = 2.0;

        // prop: drawBorder

        // True to draw border around grid.

        this.drawBorder = true;

        // prop: shadow

        // whether to show a shadow behind the grid.

        this.shadow = true;

        // prop: shadowAngle

        // shadow angle in degrees

        this.shadowAngle = 45;

        // prop: shadowOffset

        // Offset of each shadow stroke from the border in pixels

        this.shadowOffset = 1.5;

        // prop: shadowWidth

        // width of the stoke for the shadow

        this.shadowWidth = 3;

        // prop: shadowDepth

        // Number of times shadow is stroked, each stroke offset shadowOffset from the last.

        this.shadowDepth = 3;

        // prop: shadowColor

        // an optional css color spec for the shadow in 'rgba(n, n, n, n)' form

        this.shadowColor = null;

        // prop: shadowAlpha

        // Alpha channel transparency of shadow.  0 = transparent.

        this.shadowAlpha = '0.07';

        this._left;

        this._top;

        this._right;

        this._bottom;

        this._width;

        this._height;

        this._axes = [];

        // prop: renderer

        // Instance of a renderer which will actually render the grid,

        // see <$.jqplot.CanvasGridRenderer>.

        this.renderer = $.jqplot.CanvasGridRenderer;

        // prop: rendererOptions

        // Options to pass on to the renderer,

        // see <$.jqplot.CanvasGridRenderer>.

        this.rendererOptions = {};

        this._offsets = {top:null, bottom:null, left:null, right:null};

    }

    

    Grid.prototype = new $.jqplot.ElemContainer();

    Grid.prototype.constructor = Grid;

    

    Grid.prototype.init = function() {

        if ($.isFunction(this.renderer)) {

            this.renderer = new this.renderer();  

        }

        this.renderer.init.call(this, this.rendererOptions);

    };

    

    Grid.prototype.createElement = function(offsets,plot) {

        this._offsets = offsets;

        return this.renderer.createElement.call(this, plot);

    };

    

    Grid.prototype.draw = function() {

        this.renderer.draw.call(this);

    };

    

    $.jqplot.GenericCanvas = function() {

        $.jqplot.ElemContainer.call(this);

        this._ctx;  

    };

    

    $.jqplot.GenericCanvas.prototype = new $.jqplot.ElemContainer();

    $.jqplot.GenericCanvas.prototype.constructor = $.jqplot.GenericCanvas;

    

    $.jqplot.GenericCanvas.prototype.createElement = function(offsets, clss, plotDimensions, plot) {

        this._offsets = offsets;

        var klass = 'jqplot';

        if (clss != undefined) {

            klass = clss;

        }

        var elem;



        elem = plot.canvasManager.getCanvas();

        

        // if new plotDimensions supplied, use them.

        if (plotDimensions != null) {

            this._plotDimensions = plotDimensions;

        }

        

        elem.width = this._plotDimensions.width - this._offsets.left - this._offsets.right;

        elem.height = this._plotDimensions.height - this._offsets.top - this._offsets.bottom;

        this._elem = $(elem);

        this._elem.css({ position: 'absolute', left: this._offsets.left, top: this._offsets.top });

        

        this._elem.addClass(klass);

        

        elem = plot.canvasManager.initCanvas(elem);

        

        elem = null;

        return this._elem;

    };

    

    $.jqplot.GenericCanvas.prototype.setContext = function() {

        this._ctx = this._elem.get(0).getContext("2d");

        return this._ctx;

    };

    

    // Memory Leaks patch

    $.jqplot.GenericCanvas.prototype.resetCanvas = function() {

      if (this._elem) {

        if ($.jqplot.use_excanvas && window.G_vmlCanvasManager.uninitElement !== undefined) {

           window.G_vmlCanvasManager.uninitElement(this._elem.get(0));

        }

        

        //this._elem.remove();

        this._elem.emptyForce();

      }

      

      this._ctx = null;

    };

    

    $.jqplot.HooksManager = function () {

        this.hooks =[];

        this.args = [];

    };

    

    $.jqplot.HooksManager.prototype.addOnce = function(fn, args) {

        args = args || [];

        var havehook = false;

        for (var i=0, l=this.hooks.length; i<l; i++) {

            if (this.hooks[i] == fn) {

                havehook = true;

            }

        }

        if (!havehook) {

            this.hooks.push(fn);

            this.args.push(args);

        }

    };

    

    $.jqplot.HooksManager.prototype.add = function(fn, args) {

        args = args || [];

        this.hooks.push(fn);

        this.args.push(args);

    };

    

    $.jqplot.EventListenerManager = function () {

        this.hooks =[];

    };

    

    $.jqplot.EventListenerManager.prototype.addOnce = function(ev, fn) {

        var havehook = false, h, i;

        for (var i=0, l=this.hooks.length; i<l; i++) {

            h = this.hooks[i];

            if (h[0] == ev && h[1] == fn) {

                havehook = true;

            }

        }

        if (!havehook) {

            this.hooks.push([ev, fn]);

        }

    };

    

    $.jqplot.EventListenerManager.prototype.add = function(ev, fn) {

        this.hooks.push([ev, fn]);

    };





    var _axisNames = ['yMidAxis', 'xaxis', 'yaxis', 'x2axis', 'y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];



    /**

     * Class: jqPlot

     * Plot object returned by call to $.jqplot.  Handles parsing user options,

     * creating sub objects (Axes, legend, title, series) and rendering the plot.

     */

    function jqPlot() {

        // Group: Properties

        // These properties are specified at the top of the options object

        // like so:

        // > {

        // >     axesDefaults:{min:0},

        // >     series:[{color:'#6633dd'}],

        // >     title: 'A Plot'

        // > }

        //



        // prop: animate

        // True to animate the series on initial plot draw (renderer dependent).

        // Actual animation functionality must be supported in the renderer.

        this.animate = false;

        // prop: animateReplot

        // True to animate series after a call to the replot() method.

        // Use with caution!  Replots can happen very frequently under

        // certain circumstances (e.g. resizing, dragging points) and

        // animation in these situations can cause problems.

        this.animateReplot = false;

        // prop: axes

        // up to 4 axes are supported, each with its own options, 

        // See <Axis> for axis specific options.

        this.axes = {xaxis: new Axis('xaxis'), yaxis: new Axis('yaxis'), x2axis: new Axis('x2axis'), y2axis: new Axis('y2axis'), y3axis: new Axis('y3axis'), y4axis: new Axis('y4axis'), y5axis: new Axis('y5axis'), y6axis: new Axis('y6axis'), y7axis: new Axis('y7axis'), y8axis: new Axis('y8axis'), y9axis: new Axis('y9axis'), yMidAxis: new Axis('yMidAxis')};

        this.baseCanvas = new $.jqplot.GenericCanvas();

        // true to intercept right click events and fire a 'jqplotRightClick' event.

        // this will also block the context menu.

        this.captureRightClick = false;

        // prop: data

        // user's data.  Data should *NOT* be specified in the options object,

        // but be passed in as the second argument to the $.jqplot() function.

        // The data property is described here soley for reference. 

        // The data should be in the form of an array of 2D or 1D arrays like

        // > [ [[x1, y1], [x2, y2],...], [y1, y2, ...] ].

        this.data = [];

        // prop: dataRenderer

        // A callable which can be used to preprocess data passed into the plot.

        // Will be called with 3 arguments: the plot data, a reference to the plot,

        // and the value of dataRendererOptions.

        this.dataRenderer;

        // prop: dataRendererOptions

        // Options that will be passed to the dataRenderer.

        // Can be of any type.

        this.dataRendererOptions;

        this.defaults = {

            // prop: axesDefaults

            // default options that will be applied to all axes.

            // see <Axis> for axes options.

            axesDefaults: {},

            axes: {xaxis:{}, yaxis:{}, x2axis:{}, y2axis:{}, y3axis:{}, y4axis:{}, y5axis:{}, y6axis:{}, y7axis:{}, y8axis:{}, y9axis:{}, yMidAxis:{}},

            // prop: seriesDefaults

            // default options that will be applied to all series.

            // see <Series> for series options.

            seriesDefaults: {},

            series:[]

        };

        // prop: defaultAxisStart

        // 1-D data series are internally converted into 2-D [x,y] data point arrays

        // by jqPlot.  This is the default starting value for the missing x or y value.

        // The added data will be a monotonically increasing series (e.g. [1, 2, 3, ...])

        // starting at this value.

        this.defaultAxisStart = 1;

        // this.doCustomEventBinding = true;

        // prop: drawIfHidden

        // True to execute the draw method even if the plot target is hidden.

        // Generally, this should be false.  Most plot elements will not be sized/

        // positioned correclty if renderered into a hidden container.  To render into

        // a hidden container, call the replot method when the container is shown.

        this.drawIfHidden = false;

        this.eventCanvas = new $.jqplot.GenericCanvas();

        // prop: fillBetween

        // Fill between 2 line series in a plot.

        // Options object:

        // {

        //    series1: first index (0 based) of series in fill

        //    series2: second index (0 based) of series in fill

        //    color: color of fill [default fillColor of series1]

        //    baseSeries:  fill will be drawn below this series (0 based index)

        //    fill: false to turn off fill [default true].

        //  }

        this.fillBetween = {

            series1: null,

            series2: null,

            color: null,

            baseSeries: 0,

            fill: true

        };

        // prop; fontFamily

        // css spec for the font-family attribute.  Default for the entire plot.

        this.fontFamily;

        // prop: fontSize

        // css spec for the font-size attribute.  Default for the entire plot.

        this.fontSize;

        // prop: grid

        // See <Grid> for grid specific options.

        this.grid = new Grid();

        // prop: legend

        // see <$.jqplot.TableLegendRenderer>

        this.legend = new Legend();

        // prop: noDataIndicator

        // Options to set up a mock plot with a data loading indicator if no data is specified.

        this.noDataIndicator = {    

            show: false,

            indicator: 'Loading Data...',

            axes: {

                xaxis: {

                    min: 0,

                    max: 10,

                    tickInterval: 2,

                    show: true

                },

                yaxis: {

                    min: 0,

                    max: 12,

                    tickInterval: 3,

                    show: true

                }

            }

        };

        // prop: negativeSeriesColors 

        // colors to use for portions of the line below zero.

        this.negativeSeriesColors = $.jqplot.config.defaultNegativeColors;

        // container to hold all of the merged options.  Convienence for plugins.

        this.options = {};

        this.previousSeriesStack = [];

        // Namespace to hold plugins.  Generally non-renderer plugins add themselves to here.

        this.plugins = {};

        // prop: series

        // Array of series object options.

        // see <Series> for series specific options.

        this.series = [];

        // array of series indices. Keep track of order

        // which series canvases are displayed, lowest

        // to highest, back to front.

        this.seriesStack = [];

        // prop: seriesColors

        // Ann array of CSS color specifications that will be applied, in order,

        // to the series in the plot.  Colors will wrap around so, if their

        // are more series than colors, colors will be reused starting at the

        // beginning.  For pie charts, this specifies the colors of the slices.

        this.seriesColors = $.jqplot.config.defaultColors;

        // prop: sortData

        // false to not sort the data passed in by the user.

        // Many bar, stacked and other graphs as well as many plugins depend on

        // having sorted data.

        this.sortData = true;

        // prop: stackSeries

        // true or false, creates a stack or "mountain" plot.

        // Not all series renderers may implement this option.

        this.stackSeries = false;

        // a shortcut for axis syncTicks options.  Not implemented yet.

        this.syncXTicks = true;

        // a shortcut for axis syncTicks options.  Not implemented yet.

        this.syncYTicks = true;

        // the jquery object for the dom target.

        this.target = null; 

        // The id of the dom element to render the plot into

        this.targetId = null;

        // prop textColor

        // css spec for the css color attribute.  Default for the entire plot.

        this.textColor;

        // prop: title

        // Title object.  See <Title> for specific options.  As a shortcut, you

        // can specify the title option as just a string like: title: 'My Plot'

        // and this will create a new title object with the specified text.

        this.title = new Title();

        // Count how many times the draw method has been called while the plot is visible.

        // Mostly used to test if plot has never been dran (=0), has been successfully drawn

        // into a visible container once (=1) or draw more than once into a visible container.

        // Can use this in tests to see if plot has been visibly drawn at least one time.

        // After plot has been visibly drawn once, it generally doesn't need redrawing if its

        // container is hidden and shown.

        this._drawCount = 0;

        // sum of y values for all series in plot.

        // used in mekko chart.

        this._sumy = 0;

        this._sumx = 0;

        // array to hold the cumulative stacked series data.

        // used to ajust the individual series data, which won't have access to other

        // series data.

        this._stackData = [];

        // array that holds the data to be plotted. This will be the series data

        // merged with the the appropriate data from _stackData according to the stackAxis.

        this._plotData = [];

        this._width = null;

        this._height = null; 

        this._plotDimensions = {height:null, width:null};

        this._gridPadding = {top:null, right:null, bottom:null, left:null};

        this._defaultGridPadding = {top:10, right:10, bottom:23, left:10};



        this._addDomReference = $.jqplot.config.addDomReference;



        this.preInitHooks = new $.jqplot.HooksManager();

        this.postInitHooks = new $.jqplot.HooksManager();

        this.preParseOptionsHooks = new $.jqplot.HooksManager();

        this.postParseOptionsHooks = new $.jqplot.HooksManager();

        this.preDrawHooks = new $.jqplot.HooksManager();

        this.postDrawHooks = new $.jqplot.HooksManager();

        this.preDrawSeriesHooks = new $.jqplot.HooksManager();

        this.postDrawSeriesHooks = new $.jqplot.HooksManager();

        this.preDrawLegendHooks = new $.jqplot.HooksManager();

        this.addLegendRowHooks = new $.jqplot.HooksManager();

        this.preSeriesInitHooks = new $.jqplot.HooksManager();

        this.postSeriesInitHooks = new $.jqplot.HooksManager();

        this.preParseSeriesOptionsHooks = new $.jqplot.HooksManager();

        this.postParseSeriesOptionsHooks = new $.jqplot.HooksManager();

        this.eventListenerHooks = new $.jqplot.EventListenerManager();

        this.preDrawSeriesShadowHooks = new $.jqplot.HooksManager();

        this.postDrawSeriesShadowHooks = new $.jqplot.HooksManager();

        

        this.colorGenerator = new $.jqplot.ColorGenerator();

        this.negativeColorGenerator = new $.jqplot.ColorGenerator();



        this.canvasManager = new $.jqplot.CanvasManager();



        this.themeEngine = new $.jqplot.ThemeEngine();

        

        var seriesColorsIndex = 0;



        // Group: methods

        //

        // method: init

        // sets the plot target, checks data and applies user

        // options to plot.

        this.init = function(target, data, options) {

            options = options || {};

            for (var i=0; i<$.jqplot.preInitHooks.length; i++) {

                $.jqplot.preInitHooks[i].call(this, target, data, options);

            }



            for (var i=0; i<this.preInitHooks.hooks.length; i++) {

                this.preInitHooks.hooks[i].call(this, target, data, options);

            }

            

            this.targetId = '#'+target;

            this.target = $('#'+target);



            //////

            // Add a reference to plot

            //////

            if (this._addDomReference) {

                this.target.data('jqplot', this);

            }

            // remove any error class that may be stuck on target.

            this.target.removeClass('jqplot-error');

            if (!this.target.get(0)) {

                throw new Error("No plot target specified");

            }

            

            // make sure the target is positioned by some means and set css

            if (this.target.css('position') == 'static') {

                this.target.css('position', 'relative');

            }

            if (!this.target.hasClass('jqplot-target')) {

                this.target.addClass('jqplot-target');

            }

            

            // if no height or width specified, use a default.

            if (!this.target.height()) {

                var h;

                if (options && options.height) {

                    h = parseInt(options.height, 10);

                }

                else if (this.target.attr('data-height')) {

                    h = parseInt(this.target.attr('data-height'), 10);

                }

                else {

                    h = parseInt($.jqplot.config.defaultHeight, 10);

                }

                this._height = h;

                this.target.css('height', h+'px');

            }

            else {

                this._height = h = this.target.height();

            }

            if (!this.target.width()) {

                var w;

                if (options && options.width) {

                    w = parseInt(options.width, 10);

                }

                else if (this.target.attr('data-width')) {

                    w = parseInt(this.target.attr('data-width'), 10);

                }

                else {

                    w = parseInt($.jqplot.config.defaultWidth, 10);

                }

                this._width = w;

                this.target.css('width', w+'px');

            }

            else {

                this._width = w = this.target.width();

            }



            for (var i=0, l=_axisNames.length; i<l; i++) {

                this.axes[_axisNames[i]] = new Axis(_axisNames[i]);

            }

            

            this._plotDimensions.height = this._height;

            this._plotDimensions.width = this._width;

            this.grid._plotDimensions = this._plotDimensions;

            this.title._plotDimensions = this._plotDimensions;

            this.baseCanvas._plotDimensions = this._plotDimensions;

            this.eventCanvas._plotDimensions = this._plotDimensions;

            this.legend._plotDimensions = this._plotDimensions;

            if (this._height <=0 || this._width <=0 || !this._height || !this._width) {

                throw new Error("Canvas dimension not set");

            }

            

            if (options.dataRenderer && $.isFunction(options.dataRenderer)) {

                if (options.dataRendererOptions) {

                    this.dataRendererOptions = options.dataRendererOptions;

                }

                this.dataRenderer = options.dataRenderer;

                data = this.dataRenderer(data, this, this.dataRendererOptions);

            }

            

            if (options.noDataIndicator && $.isPlainObject(options.noDataIndicator)) {

                $.extend(true, this.noDataIndicator, options.noDataIndicator);

            }

            

            if (data == null || $.isArray(data) == false || data.length == 0 || $.isArray(data[0]) == false || data[0].length == 0) {

                

                if (this.noDataIndicator.show == false) {

                    throw new Error("No data specified");

                }

                

                else {

                    // have to be descructive here in order for plot to not try and render series.

                    // This means that $.jqplot() will have to be called again when there is data.

                    //delete options.series;

                    

                    for (var ax in this.noDataIndicator.axes) {

                        for (var prop in this.noDataIndicator.axes[ax]) {

                            this.axes[ax][prop] = this.noDataIndicator.axes[ax][prop];

                        }

                    }

                    

                    this.postDrawHooks.add(function() {

                        var eh = this.eventCanvas.getHeight();

                        var ew = this.eventCanvas.getWidth();

                        var temp = $('<div class="jqplot-noData-container" style="position:absolute;"></div>');

                        this.target.append(temp);

                        temp.height(eh);

                        temp.width(ew);

                        temp.css('top', this.eventCanvas._offsets.top);

                        temp.css('left', this.eventCanvas._offsets.left);

                        

                        var temp2 = $('<div class="jqplot-noData-contents" style="text-align:center; position:relative; margin-left:auto; margin-right:auto;"></div>');

                        temp.append(temp2);

                        temp2.html(this.noDataIndicator.indicator);

                        var th = temp2.height();

                        var tw = temp2.width();

                        temp2.height(th);

                        temp2.width(tw);

                        temp2.css('top', (eh - th)/2 + 'px');

                    });



                }

            }

            

            // make a copy of the data

            this.data = $.extend(true, [], data);

            

            this.parseOptions(options);

            

            if (this.textColor) {

                this.target.css('color', this.textColor);

            }

            if (this.fontFamily) {

                this.target.css('font-family', this.fontFamily);

            }

            if (this.fontSize) {

                this.target.css('font-size', this.fontSize);

            }

            

            this.title.init();

            this.legend.init();

            this._sumy = 0;

            this._sumx = 0;

            this.computePlotData();

            for (var i=0; i<this.series.length; i++) {

                // set default stacking order for series canvases

                this.seriesStack.push(i);

                this.previousSeriesStack.push(i);

                this.series[i].shadowCanvas._plotDimensions = this._plotDimensions;

                this.series[i].canvas._plotDimensions = this._plotDimensions;

                for (var j=0; j<$.jqplot.preSeriesInitHooks.length; j++) {

                    $.jqplot.preSeriesInitHooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                for (var j=0; j<this.preSeriesInitHooks.hooks.length; j++) {

                    this.preSeriesInitHooks.hooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                // this.populatePlotData(this.series[i], i);

                this.series[i]._plotDimensions = this._plotDimensions;

                this.series[i].init(i, this.grid.borderWidth, this);

                for (var j=0; j<$.jqplot.postSeriesInitHooks.length; j++) {

                    $.jqplot.postSeriesInitHooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                for (var j=0; j<this.postSeriesInitHooks.hooks.length; j++) {

                    this.postSeriesInitHooks.hooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                this._sumy += this.series[i]._sumy;

                this._sumx += this.series[i]._sumx;

            }



            var name,

                axis;

            for (var i=0, l=_axisNames.length; i<l; i++) {

                name = _axisNames[i];

                axis = this.axes[name];

                axis._plotDimensions = this._plotDimensions;

                axis.init();

                if (this.axes[name].borderColor == null) {

                    if (name.charAt(0) !== 'x' && axis.useSeriesColor === true && axis.show) {

                        axis.borderColor = axis._series[0].color;

                    }

                    else {

                        axis.borderColor = this.grid.borderColor;

                    }

                }

            }

            

            if (this.sortData) {

                sortData(this.series);

            }

            this.grid.init();

            this.grid._axes = this.axes;

            

            this.legend._series = this.series;



            for (var i=0; i<$.jqplot.postInitHooks.length; i++) {

                $.jqplot.postInitHooks[i].call(this, target, this.data, options);

            }



            for (var i=0; i<this.postInitHooks.hooks.length; i++) {

                this.postInitHooks.hooks[i].call(this, target, this.data, options);

            }

        };  

        

        // method: resetAxesScale

        // Reset the specified axes min, max, numberTicks and tickInterval properties to null

        // or reset these properties on all axes if no list of axes is provided.

        //

        // Parameters:

        // axes - Boolean to reset or not reset all axes or an array or object of axis names to reset.

        this.resetAxesScale = function(axes, options) {

            var opts = options || {};

            var ax = axes || this.axes;

            if (ax === true) {

                ax = this.axes;

            }

            if ($.isArray(ax)) {

                for (var i = 0; i < ax.length; i++) {

                    this.axes[ax[i]].resetScale(opts[ax[i]]);

                }

            }

            else if (typeof(ax) === 'object') {

                for (var name in ax) {

                    this.axes[name].resetScale(opts[name]);

                }

            }

        };

        // method: reInitialize

        // reinitialize plot for replotting.

        // not called directly.

        this.reInitialize = function (data, opts) {

            // Plot should be visible and have a height and width.

            // If plot doesn't have height and width for some

            // reason, set it by other means.  Plot must not have

            // a display:none attribute, however.



            var options = $.extend(true, {}, this.options, opts);



            var target = this.targetId.substr(1);

            var tdata = (data == null) ? this.data : data;



            for (var i=0; i<$.jqplot.preInitHooks.length; i++) {

                $.jqplot.preInitHooks[i].call(this, target, tdata, options);

            }



            for (var i=0; i<this.preInitHooks.hooks.length; i++) {

                this.preInitHooks.hooks[i].call(this, target, tdata, options);

            }

            

            this._height = this.target.height();

            this._width = this.target.width();

            

            if (this._height <=0 || this._width <=0 || !this._height || !this._width) {

                throw new Error("Target dimension not set");

            }

            

            this._plotDimensions.height = this._height;

            this._plotDimensions.width = this._width;

            this.grid._plotDimensions = this._plotDimensions;

            this.title._plotDimensions = this._plotDimensions;

            this.baseCanvas._plotDimensions = this._plotDimensions;

            this.eventCanvas._plotDimensions = this._plotDimensions;

            this.legend._plotDimensions = this._plotDimensions;



            var name,

                t, 

                j, 

                axis;



            for (var i=0, l=_axisNames.length; i<l; i++) {

                name = _axisNames[i];

                axis = this.axes[name];



                // Memory Leaks patch : clear ticks elements

                t = axis._ticks;

                for (var j = 0, tlen = t.length; j < tlen; j++) {

                  var el = t[j]._elem;

                  if (el) {

                    // if canvas renderer

                    if ($.jqplot.use_excanvas && window.G_vmlCanvasManager.uninitElement !== undefined) {

                      window.G_vmlCanvasManager.uninitElement(el.get(0));

                    }

                    el.emptyForce();

                    el = null;

                    t._elem = null;

                  }

                }

                t = null;



                delete axis.ticks;

                delete axis._ticks;

                this.axes[name] = new Axis(name);

                this.axes[name]._plotWidth = this._width;

                this.axes[name]._plotHeight = this._height;

            }

            

            if (data) {

                if (options.dataRenderer && $.isFunction(options.dataRenderer)) {

                    if (options.dataRendererOptions) {

                        this.dataRendererOptions = options.dataRendererOptions;

                    }

                    this.dataRenderer = options.dataRenderer;

                    data = this.dataRenderer(data, this, this.dataRendererOptions);

                }

                

                // make a copy of the data

                this.data = $.extend(true, [], data);

            }



            if (opts) {

                this.parseOptions(options);

            }

            

            this.title._plotWidth = this._width;

            

            if (this.textColor) {

                this.target.css('color', this.textColor);

            }

            if (this.fontFamily) {

                this.target.css('font-family', this.fontFamily);

            }

            if (this.fontSize) {

                this.target.css('font-size', this.fontSize);

            }



            this.title.init();

            this.legend.init();

            this._sumy = 0;

            this._sumx = 0;



            this.seriesStack = [];

            this.previousSeriesStack = [];



            this.computePlotData();

            for (var i=0, l=this.series.length; i<l; i++) {

                // set default stacking order for series canvases

                this.seriesStack.push(i);

                this.previousSeriesStack.push(i);

                this.series[i].shadowCanvas._plotDimensions = this._plotDimensions;

                this.series[i].canvas._plotDimensions = this._plotDimensions;

                for (var j=0; j<$.jqplot.preSeriesInitHooks.length; j++) {

                    $.jqplot.preSeriesInitHooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                for (var j=0; j<this.preSeriesInitHooks.hooks.length; j++) {

                    this.preSeriesInitHooks.hooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                // this.populatePlotData(this.series[i], i);

                this.series[i]._plotDimensions = this._plotDimensions;

                this.series[i].init(i, this.grid.borderWidth, this);

                for (var j=0; j<$.jqplot.postSeriesInitHooks.length; j++) {

                    $.jqplot.postSeriesInitHooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                for (var j=0; j<this.postSeriesInitHooks.hooks.length; j++) {

                    this.postSeriesInitHooks.hooks[j].call(this.series[i], target, this.data, this.options.seriesDefaults, this.options.series[i], this);

                }

                this._sumy += this.series[i]._sumy;

                this._sumx += this.series[i]._sumx;

            }



            for (var i=0, l=_axisNames.length; i<l; i++) {

                name = _axisNames[i];

                axis = this.axes[name];



                axis._plotDimensions = this._plotDimensions;

                axis.init();

                if (axis.borderColor == null) {

                    if (name.charAt(0) !== 'x' && axis.useSeriesColor === true && axis.show) {

                        axis.borderColor = axis._series[0].color;

                    }

                    else {

                        axis.borderColor = this.grid.borderColor;

                    }

                }

            }

            

            if (this.sortData) {

                sortData(this.series);

            }

            this.grid.init();

            this.grid._axes = this.axes;

            

            this.legend._series = this.series;



            for (var i=0, l=$.jqplot.postInitHooks.length; i<l; i++) {

                $.jqplot.postInitHooks[i].call(this, target, this.data, options);

            }



            for (var i=0, l=this.postInitHooks.hooks.length; i<l; i++) {

                this.postInitHooks.hooks[i].call(this, target, this.data, options);

            }

        };







        // method: quickInit

        // 

        // Quick reinitialization plot for replotting.

        // Does not parse options ore recreate axes and series.

        // not called directly.

        this.quickInit = function () {

            // Plot should be visible and have a height and width.

            // If plot doesn't have height and width for some

            // reason, set it by other means.  Plot must not have

            // a display:none attribute, however.

            

            this._height = this.target.height();

            this._width = this.target.width();

            

            if (this._height <=0 || this._width <=0 || !this._height || !this._width) {

                throw new Error("Target dimension not set");

            }

            

            this._plotDimensions.height = this._height;

            this._plotDimensions.width = this._width;

            this.grid._plotDimensions = this._plotDimensions;

            this.title._plotDimensions = this._plotDimensions;

            this.baseCanvas._plotDimensions = this._plotDimensions;

            this.eventCanvas._plotDimensions = this._plotDimensions;

            this.legend._plotDimensions = this._plotDimensions;

            

            for (var n in this.axes) {

                this.axes[n]._plotWidth = this._width;

                this.axes[n]._plotHeight = this._height;

            }

            

            this.title._plotWidth = this._width;

            

            if (this.textColor) {

                this.target.css('color', this.textColor);

            }

            if (this.fontFamily) {

                this.target.css('font-family', this.fontFamily);

            }

            if (this.fontSize) {

                this.target.css('font-size', this.fontSize);

            }

            

            this._sumy = 0;

            this._sumx = 0;

            this.computePlotData();

            for (var i=0; i<this.series.length; i++) {

                // this.populatePlotData(this.series[i], i);

                if (this.series[i]._type === 'line' && this.series[i].renderer.bands.show) {

                    this.series[i].renderer.initBands.call(this.series[i], this.series[i].renderer.options, this);

                }

                this.series[i]._plotDimensions = this._plotDimensions;

                this.series[i].canvas._plotDimensions = this._plotDimensions;

                //this.series[i].init(i, this.grid.borderWidth);

                this._sumy += this.series[i]._sumy;

                this._sumx += this.series[i]._sumx;

            }



            var name;

            

            for (var j=0; j<12; j++) {

                name = _axisNames[j];

                // Memory Leaks patch : clear ticks elements

                var t = this.axes[name]._ticks;

                for (var i = 0; i < t.length; i++) {

                  var el = t[i]._elem;

                  if (el) {

                    // if canvas renderer

                    if ($.jqplot.use_excanvas && window.G_vmlCanvasManager.uninitElement !== undefined) {

                      window.G_vmlCanvasManager.uninitElement(el.get(0));

                    }

                    el.emptyForce();

                    el = null;

                    t._elem = null;

                  }

                }

                t = null;

                

                this.axes[name]._plotDimensions = this._plotDimensions;

                this.axes[name]._ticks = [];

                // this.axes[name].renderer.init.call(this.axes[name], {});

            }

            

            if (this.sortData) {

                sortData(this.series);

            }

            

            this.grid._axes = this.axes;

            

            this.legend._series = this.series;

        };

        

        // sort the series data in increasing order.

        function sortData(series) {

            var d, sd, pd, ppd, ret;

            for (var i=0; i<series.length; i++) {

                var check;

                var bat = [series[i].data, series[i]._stackData, series[i]._plotData, series[i]._prevPlotData];

                for (var n=0; n<4; n++) {

                    check = true;

                    d = bat[n];

                    if (series[i]._stackAxis == 'x') {

                        for (var j = 0; j < d.length; j++) {

                            if (typeof(d[j][1]) != "number") {

                                check = false;

                                break;

                            }

                        }

                        if (check) {

                            d.sort(function(a,b) { return a[1] - b[1]; });

                        }

                    }

                    else {

                        for (var j = 0; j < d.length; j++) {

                            if (typeof(d[j][0]) != "number") {

                                check = false;

                                break;

                            }

                        }

                        if (check) {

                            d.sort(function(a,b) { return a[0] - b[0]; });

                        }

                    }

                }

               

            }

        }



        this.computePlotData = function() {

            this._plotData = [];

            this._stackData = [];

            var series,

                index,

                l;





            for (index=0, l=this.series.length; index<l; index++) {

                series = this.series[index];

                this._plotData.push([]);

                this._stackData.push([]);

                var cd = series.data;

                this._plotData[index] = $.extend(true, [], cd);

                this._stackData[index] = $.extend(true, [], cd);

                series._plotData = this._plotData[index];

                series._stackData = this._stackData[index];

                var plotValues = {x:[], y:[]};



                if (this.stackSeries && !series.disableStack) {

                    series._stack = true;

                    ///////////////////////////

                    // have to check for nulls

                    ///////////////////////////

                    var sidx = (series._stackAxis === 'x') ? 0 : 1;



                    for (var k=0, cdl=cd.length; k<cdl; k++) {

                        var temp = cd[k][sidx];

                        if (temp == null) {

                            temp = 0;

                        }

                        this._plotData[index][k][sidx] = temp;

                        this._stackData[index][k][sidx] = temp;



                        if (index > 0) {

                            for (var j=index; j--;) {

                                var prevval = this._plotData[j][k][sidx];

                                // only need to sum up the stack axis column of data

                                // and only sum if it is of same sign.

                                // if previous series isn't same sign, keep looking

                                // at earlier series untill we find one of same sign.

                                if (temp * prevval >= 0) {

                                    this._plotData[index][k][sidx] += prevval;

                                    this._stackData[index][k][sidx] += prevval;

                                    break;

                                } 

                            }

                        }

                    }



                }

                else {

                    for (var i=0; i<series.data.length; i++) {

                        plotValues.x.push(series.data[i][0]);

                        plotValues.y.push(series.data[i][1]);

                    }

                    this._stackData.push(series.data);

                    this.series[index]._stackData = series.data;

                    this._plotData.push(series.data);

                    series._plotData = series.data;

                    series._plotValues = plotValues;

                }

                if (index>0) {

                    series._prevPlotData = this.series[index-1]._plotData;

                }

                series._sumy = 0;

                series._sumx = 0;

                for (i=series.data.length-1; i>-1; i--) {

                    series._sumy += series.data[i][1];

                    series._sumx += series.data[i][0];

                }

            }



        };

        

        // populate the _stackData and _plotData arrays for the plot and the series.

        this.populatePlotData = function(series, index) {

            // if a stacked chart, compute the stacked data

            this._plotData = [];

            this._stackData = [];

            series._stackData = [];

            series._plotData = [];

            var plotValues = {x:[], y:[]};

            if (this.stackSeries && !series.disableStack) {

                series._stack = true;

                var sidx = (series._stackAxis === 'x') ? 0 : 1;

                // var idx = sidx ? 0 : 1;

                // push the current data into stackData

                //this._stackData.push(this.series[i].data);

                var temp = $.extend(true, [], series.data);

                // create the data that will be plotted for this series

                var plotdata = $.extend(true, [], series.data);

                var tempx, tempy, dval, stackval, comparator;

                // for first series, nothing to add to stackData.

                for (var j=0; j<index; j++) {

                    var cd = this.series[j].data;

                    for (var k=0; k<cd.length; k++) {

                        dval = cd[k];

                        tempx = (dval[0] != null) ? dval[0] : 0;

                        tempy = (dval[1] != null) ? dval[1] : 0;

                        temp[k][0] += tempx;

                        temp[k][1] += tempy;

                        stackval = (sidx) ? tempy : tempx;

                        // only need to sum up the stack axis column of data

                        // and only sum if it is of same sign.

                        if (series.data[k][sidx] * stackval >= 0) {

                            plotdata[k][sidx] += stackval;

                        }

                    }

                }

                for (var i=0; i<plotdata.length; i++) {

                    plotValues.x.push(plotdata[i][0]);

                    plotValues.y.push(plotdata[i][1]);

                }

                this._plotData.push(plotdata);

                this._stackData.push(temp);

                series._stackData = temp;

                series._plotData = plotdata;

                series._plotValues = plotValues;

            }

            else {

                for (var i=0; i<series.data.length; i++) {

                    plotValues.x.push(series.data[i][0]);

                    plotValues.y.push(series.data[i][1]);

                }

                this._stackData.push(series.data);

                this.series[index]._stackData = series.data;

                this._plotData.push(series.data);

                series._plotData = series.data;

                series._plotValues = plotValues;

            }

            if (index>0) {

                series._prevPlotData = this.series[index-1]._plotData;

            }

            series._sumy = 0;

            series._sumx = 0;

            for (i=series.data.length-1; i>-1; i--) {

                series._sumy += series.data[i][1];

                series._sumx += series.data[i][0];

            }

        };

        

        // function to safely return colors from the color array and wrap around at the end.

        this.getNextSeriesColor = (function(t) {

            var idx = 0;

            var sc = t.seriesColors;

            

            return function () { 

                if (idx < sc.length) {

                    return sc[idx++];

                }

                else {

                    idx = 0;

                    return sc[idx++];

                }

            };

        })(this);

    

        this.parseOptions = function(options){

            for (var i=0; i<this.preParseOptionsHooks.hooks.length; i++) {

                this.preParseOptionsHooks.hooks[i].call(this, options);

            }

            for (var i=0; i<$.jqplot.preParseOptionsHooks.length; i++) {

                $.jqplot.preParseOptionsHooks[i].call(this, options);

            }

            this.options = $.extend(true, {}, this.defaults, options);

            var opts = this.options;

            this.animate = opts.animate;

            this.animateReplot = opts.animateReplot;

            this.stackSeries = opts.stackSeries;

            if ($.isPlainObject(opts.fillBetween)) {



                var temp = ['series1', 'series2', 'color', 'baseSeries', 'fill'], 

                    tempi;



                for (var i=0, l=temp.length; i<l; i++) {

                    tempi = temp[i];

                    if (opts.fillBetween[tempi] != null) {

                        this.fillBetween[tempi] = opts.fillBetween[tempi];

                    }

                }

            }



            if (opts.seriesColors) {

                this.seriesColors = opts.seriesColors;

            }

            if (opts.negativeSeriesColors) {

                this.negativeSeriesColors = opts.negativeSeriesColors;

            }

            if (opts.captureRightClick) {

                this.captureRightClick = opts.captureRightClick;

            }

            this.defaultAxisStart = (options && options.defaultAxisStart != null) ? options.defaultAxisStart : this.defaultAxisStart;

            this.colorGenerator.setColors(this.seriesColors);

            this.negativeColorGenerator.setColors(this.negativeSeriesColors);

            // var cg = new this.colorGenerator(this.seriesColors);

            // var ncg = new this.colorGenerator(this.negativeSeriesColors);

            // this._gridPadding = this.options.gridPadding;

            $.extend(true, this._gridPadding, opts.gridPadding);

            this.sortData = (opts.sortData != null) ? opts.sortData : this.sortData;

            for (var i=0; i<12; i++) {

                var n = _axisNames[i];

                var axis = this.axes[n];

                axis._options = $.extend(true, {}, opts.axesDefaults, opts.axes[n]);

                $.extend(true, axis, opts.axesDefaults, opts.axes[n]);

                axis._plotWidth = this._width;

                axis._plotHeight = this._height;

            }

            // if (this.data.length == 0) {

            //     this.data = [];

            //     for (var i=0; i<this.options.series.length; i++) {

            //         this.data.push(this.options.series.data);

            //     }    

            // }

                

            var normalizeData = function(data, dir, start) {

                // return data as an array of point arrays,

                // in form [[x1,y1...], [x2,y2...], ...]

                var temp = [];

                var i, l;

                dir = dir || 'vertical';

                if (!$.isArray(data[0])) {

                    // we have a series of scalars.  One line with just y values.

                    // turn the scalar list of data into a data array of form:

                    // [[1, data[0]], [2, data[1]], ...]

                    for (i=0, l=data.length; i<l; i++) {

                        if (dir == 'vertical') {

                            temp.push([start + i, data[i]]);   

                        }

                        else {

                            temp.push([data[i], start+i]);

                        }

                    }

                }            

                else {

                    // we have a properly formatted data series, copy it.

                    $.extend(true, temp, data);

                }

                return temp;

            };



            var colorIndex = 0;

            this.series = [];

            for (var i=0; i<this.data.length; i++) {

                var sopts = $.extend(true, {index: i}, {seriesColors:this.seriesColors, negativeSeriesColors:this.negativeSeriesColors}, this.options.seriesDefaults, this.options.series[i], {rendererOptions:{animation:{show: this.animate}}});

                // pass in options in case something needs set prior to initialization.

                var temp = new Series(sopts);

                for (var j=0; j<$.jqplot.preParseSeriesOptionsHooks.length; j++) {

                    $.jqplot.preParseSeriesOptionsHooks[j].call(temp, this.options.seriesDefaults, this.options.series[i]);

                }

                for (var j=0; j<this.preParseSeriesOptionsHooks.hooks.length; j++) {

                    this.preParseSeriesOptionsHooks.hooks[j].call(temp, this.options.seriesDefaults, this.options.series[i]);

                }

                // Now go back and apply the options to the series.  Really should just do this during initializaiton, but don't want to

                // mess up preParseSeriesOptionsHooks at this point.

                $.extend(true, temp, sopts);

                var dir = 'vertical';

                if (temp.renderer === $.jqplot.BarRenderer && temp.rendererOptions && temp.rendererOptions.barDirection == 'horizontal') {

                    dir = 'horizontal';

                    temp._stackAxis = 'x';

                    temp._primaryAxis = '_yaxis';

                }

                temp.data = normalizeData(this.data[i], dir, this.defaultAxisStart);

                switch (temp.xaxis) {

                    case 'xaxis':

                        temp._xaxis = this.axes.xaxis;

                        break;

                    case 'x2axis':

                        temp._xaxis = this.axes.x2axis;

                        break;

                    default:

                        break;

                }

                temp._yaxis = this.axes[temp.yaxis];

                temp._xaxis._series.push(temp);

                temp._yaxis._series.push(temp);

                if (temp.show) {

                    temp._xaxis.show = true;

                    temp._yaxis.show = true;

                }

                else {

                    if (temp._xaxis.scaleToHiddenSeries) {

                        temp._xaxis.show = true;

                    }

                    if (temp._yaxis.scaleToHiddenSeries) {

                        temp._yaxis.show = true;

                    }

                }



                // // parse the renderer options and apply default colors if not provided

                // if (!temp.color && temp.show != false) {

                //     temp.color = cg.next();

                //     colorIndex = cg.getIndex() - 1;;

                // }

                // if (!temp.negativeColor && temp.show != false) {

                //     temp.negativeColor = ncg.get(colorIndex);

                //     ncg.setIndex(colorIndex);

                // }

                if (!temp.label) {

                    temp.label = 'Series '+ (i+1).toString();

                }

                // temp.rendererOptions.show = temp.show;

                // $.extend(true, temp.renderer, {color:this.seriesColors[i]}, this.rendererOptions);

                this.series.push(temp);  

                for (var j=0; j<$.jqplot.postParseSeriesOptionsHooks.length; j++) {

                    $.jqplot.postParseSeriesOptionsHooks[j].call(this.series[i], this.options.seriesDefaults, this.options.series[i]);

                }

                for (var j=0; j<this.postParseSeriesOptionsHooks.hooks.length; j++) {

                    this.postParseSeriesOptionsHooks.hooks[j].call(this.series[i], this.options.seriesDefaults, this.options.series[i]);

                }

            }

            

            // copy the grid and title options into this object.

            $.extend(true, this.grid, this.options.grid);

            // if axis border properties aren't set, set default.

            for (var i=0, l=_axisNames.length; i<l; i++) {

                var n = _axisNames[i];

                var axis = this.axes[n];

                if (axis.borderWidth == null) {

                    axis.borderWidth =this.grid.borderWidth;

                }

            }

            

            if (typeof this.options.title == 'string') {

                this.title.text = this.options.title;

            }

            else if (typeof this.options.title == 'object') {

                $.extend(true, this.title, this.options.title);

            }

            this.title._plotWidth = this._width;

            this.legend.setOptions(this.options.legend);

            

            for (var i=0; i<$.jqplot.postParseOptionsHooks.length; i++) {

                $.jqplot.postParseOptionsHooks[i].call(this, options);

            }

            for (var i=0; i<this.postParseOptionsHooks.hooks.length; i++) {

                this.postParseOptionsHooks.hooks[i].call(this, options);

            }

        };

        

        // method: destroy

        // Releases all resources occupied by the plot

        this.destroy = function() {

            this.canvasManager.freeAllCanvases();

            if (this.eventCanvas && this.eventCanvas._elem) {

                this.eventCanvas._elem.unbind();

            }

            // Couple of posts on Stack Overflow indicate that empty() doesn't

            // always cear up the dom and release memory.  Sometimes setting

            // innerHTML property to null is needed.  Particularly on IE, may 

            // have to directly set it to null, bypassing $.

            this.target.empty();



            this.target[0].innerHTML = '';

        };

        

        // method: replot

        // Does a reinitialization of the plot followed by

        // a redraw.  Method could be used to interactively

        // change plot characteristics and then replot.

        //

        // Parameters:

        // options - Options used for replotting.

        //

        // Properties:

        // clear - false to not clear (empty) the plot container before replotting (default: true).

        // resetAxes - true to reset all axes min, max, numberTicks and tickInterval setting so axes will rescale themselves.

        //             optionally pass in list of axes to reset (e.g. ['xaxis', 'y2axis']) (default: false).

        this.replot = function(options) {

            var opts =  options || {};

            var data = opts.data || null;

            var clear = (opts.clear === false) ? false : true;

            var resetAxes = opts.resetAxes || false;

            delete opts.data;

            delete opts.clear;

            delete opts.resetAxes;



            this.target.trigger('jqplotPreReplot');

            

            if (clear) {

                this.destroy();

            }

            // if have data or other options, full reinit.

            // otherwise, quickinit.

            if (data || !$.isEmptyObject(opts)) {

                this.reInitialize(data, opts);

            }

            else {

                this.quickInit();

            }



            if (resetAxes) {

                this.resetAxesScale(resetAxes, opts.axes);

            }

            this.draw();

            this.target.trigger('jqplotPostReplot');

        };

        

        // method: redraw

        // Empties the plot target div and redraws the plot.

        // This enables plot data and properties to be changed

        // and then to comletely clear the plot and redraw.

        // redraw *will not* reinitialize any plot elements.

        // That is, axes will not be autoscaled and defaults

        // will not be reapplied to any plot elements.  redraw

        // is used primarily with zooming. 

        //

        // Parameters:

        // clear - false to not clear (empty) the plot container before redrawing (default: true).

        this.redraw = function(clear) {

            clear = (clear != null) ? clear : true;

            this.target.trigger('jqplotPreRedraw');

            if (clear) {

                this.canvasManager.freeAllCanvases();

                this.eventCanvas._elem.unbind();

                // Dont think I bind any events to the target, this shouldn't be necessary.

                // It will remove user's events.

                // this.target.unbind();

                this.target.empty();

            }

             for (var ax in this.axes) {

                this.axes[ax]._ticks = [];

            }

            this.computePlotData();

            // for (var i=0; i<this.series.length; i++) {

            //     this.populatePlotData(this.series[i], i);

            // }

            this._sumy = 0;

            this._sumx = 0;

            for (var i=0, tsl = this.series.length; i<tsl; i++) {

                this._sumy += this.series[i]._sumy;

                this._sumx += this.series[i]._sumx;

            }

            this.draw();

            this.target.trigger('jqplotPostRedraw');

        };

        

        // method: draw

        // Draws all elements of the plot into the container.

        // Does not clear the container before drawing.

        this.draw = function(){

            if (this.drawIfHidden || this.target.is(':visible')) {

                this.target.trigger('jqplotPreDraw');

                var i,

                    j,

                    l,

                    tempseries;

                for (i=0, l=$.jqplot.preDrawHooks.length; i<l; i++) {

                    $.jqplot.preDrawHooks[i].call(this);

                }

                for (i=0, l=this.preDrawHooks.hooks.length; i<l; i++) {

                    this.preDrawHooks.hooks[i].apply(this, this.preDrawSeriesHooks.args[i]);

                }

                // create an underlying canvas to be used for special features.

                this.target.append(this.baseCanvas.createElement({left:0, right:0, top:0, bottom:0}, 'jqplot-base-canvas', null, this));

                this.baseCanvas.setContext();

                this.target.append(this.title.draw());

                this.title.pack({top:0, left:0});

                

                // make room  for the legend between the grid and the edge.

                // pass a dummy offsets object and a reference to the plot.

                var legendElem = this.legend.draw({}, this);

                

                var gridPadding = {top:0, left:0, bottom:0, right:0};

                

                if (this.legend.placement == "outsideGrid") {

                    // temporarily append the legend to get dimensions

                    this.target.append(legendElem);

                    switch (this.legend.location) {

                        case 'n':

                            gridPadding.top += this.legend.getHeight();

                            break;

                        case 's':

                            gridPadding.bottom += this.legend.getHeight();

                            break;

                        case 'ne':

                        case 'e':

                        case 'se':

                            gridPadding.right += this.legend.getWidth();

                            break;

                        case 'nw':

                        case 'w':

                        case 'sw':

                            gridPadding.left += this.legend.getWidth();

                            break;

                        default:  // same as 'ne'

                            gridPadding.right += this.legend.getWidth();

                            break;

                    }

                    legendElem = legendElem.detach();

                }

                

                var ax = this.axes;

                var name;

                // draw the yMidAxis first, so xaxis of pyramid chart can adjust itself if needed.

                for (i=0; i<12; i++) {

                    name = _axisNames[i];

                    this.target.append(ax[name].draw(this.baseCanvas._ctx, this));

                    ax[name].set();

                }

                if (ax.yaxis.show) {

                    gridPadding.left += ax.yaxis.getWidth();

                }

                var ra = ['y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];

                var rapad = [0, 0, 0, 0, 0, 0, 0, 0];

                var gpr = 0;

                var n;

                for (n=0; n<8; n++) {

                    if (ax[ra[n]].show) {

                        gpr += ax[ra[n]].getWidth();

                        rapad[n] = gpr;

                    }

                }

                gridPadding.right += gpr;

                if (ax.x2axis.show) {

                    gridPadding.top += ax.x2axis.getHeight();

                }

                if (this.title.show) {

                    gridPadding.top += this.title.getHeight();

                }

                if (ax.xaxis.show) {

                    gridPadding.bottom += ax.xaxis.getHeight();

                }

                

                // end of gridPadding adjustments.



                // if user passed in gridDimensions option, check against calculated gridPadding

                if (this.options.gridDimensions && $.isPlainObject(this.options.gridDimensions)) {

                    var gdw = parseInt(this.options.gridDimensions.width, 10) || 0;

                    var gdh = parseInt(this.options.gridDimensions.height, 10) || 0;

                    var widthAdj = (this._width - gridPadding.left - gridPadding.right - gdw)/2;

                    var heightAdj = (this._height - gridPadding.top - gridPadding.bottom - gdh)/2;



                    if (heightAdj >= 0 && widthAdj >= 0) {

                        gridPadding.top += heightAdj;

                        gridPadding.bottom += heightAdj;

                        gridPadding.left += widthAdj;

                        gridPadding.right += widthAdj;

                    }

                }

                var arr = ['top', 'bottom', 'left', 'right'];

                for (var n in arr) {

                    if (this._gridPadding[arr[n]] == null && gridPadding[arr[n]] > 0) {

                        this._gridPadding[arr[n]] = gridPadding[arr[n]];

                    }

                    else if (this._gridPadding[arr[n]] == null) {

                        this._gridPadding[arr[n]] = this._defaultGridPadding[arr[n]];

                    }

                }

                

                var legendPadding = this._gridPadding;

                

                if (this.legend.placement === 'outsideGrid') {

                    legendPadding = {top:this.title.getHeight(), left: 0, right: 0, bottom: 0};

                    if (this.legend.location === 's') {

                        legendPadding.left = this._gridPadding.left;

                        legendPadding.right = this._gridPadding.right;

                    }

                }

                

                ax.xaxis.pack({position:'absolute', bottom:this._gridPadding.bottom - ax.xaxis.getHeight(), left:0, width:this._width}, {min:this._gridPadding.left, max:this._width - this._gridPadding.right});

                ax.yaxis.pack({position:'absolute', top:0, left:this._gridPadding.left - ax.yaxis.getWidth(), height:this._height}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});

                ax.x2axis.pack({position:'absolute', top:this._gridPadding.top - ax.x2axis.getHeight(), left:0, width:this._width}, {min:this._gridPadding.left, max:this._width - this._gridPadding.right});

                for (i=8; i>0; i--) {

                    ax[ra[i-1]].pack({position:'absolute', top:0, right:this._gridPadding.right - rapad[i-1]}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});

                }

                var ltemp = (this._width - this._gridPadding.left - this._gridPadding.right)/2.0 + this._gridPadding.left - ax.yMidAxis.getWidth()/2.0;

                ax.yMidAxis.pack({position:'absolute', top:0, left:ltemp, zIndex:9, textAlign: 'center'}, {min:this._height - this._gridPadding.bottom, max: this._gridPadding.top});

            

                this.target.append(this.grid.createElement(this._gridPadding, this));

                this.grid.draw();

                

                var series = this.series;

                var seriesLength = series.length;

                // put the shadow canvases behind the series canvases so shadows don't overlap on stacked bars.

                for (i=0, l=seriesLength; i<l; i++) {

                    // draw series in order of stacking.  This affects only

                    // order in which canvases are added to dom.

                    j = this.seriesStack[i];

                    this.target.append(series[j].shadowCanvas.createElement(this._gridPadding, 'jqplot-series-shadowCanvas', null, this));

                    series[j].shadowCanvas.setContext();

                    series[j].shadowCanvas._elem.data('seriesIndex', j);

                }

                

                for (i=0, l=seriesLength; i<l; i++) {

                    // draw series in order of stacking.  This affects only

                    // order in which canvases are added to dom.

                    j = this.seriesStack[i];

                    this.target.append(series[j].canvas.createElement(this._gridPadding, 'jqplot-series-canvas', null, this));

                    series[j].canvas.setContext();

                    series[j].canvas._elem.data('seriesIndex', j);

                }

                // Need to use filled canvas to capture events in IE.

                // Also, canvas seems to block selection of other elements in document on FF.

                this.target.append(this.eventCanvas.createElement(this._gridPadding, 'jqplot-event-canvas', null, this));

                this.eventCanvas.setContext();

                this.eventCanvas._ctx.fillStyle = 'rgba(0,0,0,0)';

                this.eventCanvas._ctx.fillRect(0,0,this.eventCanvas._ctx.canvas.width, this.eventCanvas._ctx.canvas.height);

            

                // bind custom event handlers to regular events.

                this.bindCustomEvents();

            

                // draw legend before series if the series needs to know the legend dimensions.

                if (this.legend.preDraw) {  

                    this.eventCanvas._elem.before(legendElem);

                    this.legend.pack(legendPadding);

                    if (this.legend._elem) {

                        this.drawSeries({legendInfo:{location:this.legend.location, placement:this.legend.placement, width:this.legend.getWidth(), height:this.legend.getHeight(), xoffset:this.legend.xoffset, yoffset:this.legend.yoffset}});

                    }

                    else {

                        this.drawSeries();

                    }

                }

                else {  // draw series before legend

                    this.drawSeries();

                    if (seriesLength) {

                        $(series[seriesLength-1].canvas._elem).after(legendElem);

                    }

                    this.legend.pack(legendPadding);                

                }

            

                // register event listeners on the overlay canvas

                for (var i=0, l=$.jqplot.eventListenerHooks.length; i<l; i++) {

                    // in the handler, this will refer to the eventCanvas dom element.

                    // make sure there are references back into plot objects.

                    this.eventCanvas._elem.bind($.jqplot.eventListenerHooks[i][0], {plot:this}, $.jqplot.eventListenerHooks[i][1]);

                }

            

                // register event listeners on the overlay canvas

                for (var i=0, l=this.eventListenerHooks.hooks.length; i<l; i++) {

                    // in the handler, this will refer to the eventCanvas dom element.

                    // make sure there are references back into plot objects.

                    this.eventCanvas._elem.bind(this.eventListenerHooks.hooks[i][0], {plot:this}, this.eventListenerHooks.hooks[i][1]);

                }



                var fb = this.fillBetween;

                if(typeof fb.series1 == 'number'){

                    if(fb.fill&&fb.series1!==fb.series2&&fb.series1<seriesLength&&fb.series2<seriesLength&&series[fb.series1]._type==="line"&&series[fb.series2]._type==="line")

                    this.doFillBetweenLines();

                }

                else{

                    if(fb.series1 != null && fb.series2 != null){

                        var doFb = false;

                        if(fb.series1.length === fb.series2.length){

                            var tempSeries1 = 0;

                            var tempSeries2 = 0;

                            

                            for(var cnt = 0; cnt < fb.series1.length; cnt++){

                                tempSeries1 = fb.series1[cnt];

                                tempSeries2 = fb.series2[cnt];

                                if(tempSeries1!==tempSeries2&&tempSeries1<seriesLength&&tempSeries2<seriesLength&&series[tempSeries1]._type==="line"&&series[tempSeries2]._type==="line"){

                                    doFb = true;

                                }

                                else{

                                    doFb = false;

                                    break;

                                }

                            }

                        }

                        if(fb.fill && doFb){

                            this.doFillBetweenLines();

                        }

                    }

                }



                for (var i=0, l=$.jqplot.postDrawHooks.length; i<l; i++) {

                    $.jqplot.postDrawHooks[i].call(this);

                }



                for (var i=0, l=this.postDrawHooks.hooks.length; i<l; i++) {

                    this.postDrawHooks.hooks[i].apply(this, this.postDrawHooks.args[i]);

                }

            

                if (this.target.is(':visible')) {

                    this._drawCount += 1;

                }



                var temps, 

                    tempr,

                    sel,

                    _els;

                // ughh.  ideally would hide all series then show them.

                for (i=0, l=seriesLength; i<l; i++) {

                    temps = series[i];

                    tempr = temps.renderer;

                    sel = '.jqplot-point-label.jqplot-series-'+i;

                    if (tempr.animation && tempr.animation._supported && tempr.animation.show && (this._drawCount < 2 || this.animateReplot)) {

                        _els = this.target.find(sel);

                        _els.stop(true, true).hide();

                        temps.canvas._elem.stop(true, true).hide();

                        temps.shadowCanvas._elem.stop(true, true).hide();

                        temps.canvas._elem.jqplotEffect('blind', {mode: 'show', direction: tempr.animation.direction}, tempr.animation.speed);

                        temps.shadowCanvas._elem.jqplotEffect('blind', {mode: 'show', direction: tempr.animation.direction}, tempr.animation.speed);

                        _els.fadeIn(tempr.animation.speed*0.8);

                    }

                }

                _els = null;

            

                this.target.trigger('jqplotPostDraw', [this]);

            }

        };



        jqPlot.prototype.doFillBetweenLines = function () {

            var fb = this.fillBetween;

            var series = this.series;

            var sid1 = fb.series1;

            var sid2 = fb.series2;

            var id1 = 0, id2 = 0;



            function fill(id1, id2){

                var series1 = series[id1];

                var series2 = series[id2];

                if (series2.renderer.smooth)

                    var tempgd = series2.renderer._smoothedData.slice(0).reverse();

                else

                    var tempgd = series2.gridData.slice(0).reverse();

                if (series1.renderer.smooth)

                    var gd = series1.renderer._smoothedData.concat(tempgd);

                else

                    var gd = series1.gridData.concat(tempgd);

                var color = fb.color !== null ? fb.color : series[sid1].fillColor;

                var baseSeries = fb.baseSeries !== null ? fb.baseSeries : id1;

                var sr =

                    series[baseSeries].renderer.shapeRenderer;

                var opts =

                {

                    fillStyle : color,

                    fill : true,

                    closePath : true

                };

                sr.draw(series1.shadowCanvas._ctx, gd, opts)

            }



            if(typeof sid1 == 'number' && typeof sid2 == 'number'){

                id1 = sid1 < sid2 ? sid1 : sid2;

                id2 = sid2 > sid1 ? sid2 : sid1;

                fill(id1, id2);

            }

            else{

                for(var cnt = 0; cnt < sid1.length ; cnt++){

                    id1 = sid1[cnt] < sid2[cnt] ? sid1[cnt] : sid2[cnt];

                    id2 = sid2[cnt] > sid1[cnt] ? sid2[cnt] : sid1[cnt];

                    fill(id1, id2);

                }

            }

        };

        

        this.bindCustomEvents = function() {

            this.eventCanvas._elem.bind('click', {plot:this}, this.onClick);

            this.eventCanvas._elem.bind('dblclick', {plot:this}, this.onDblClick);

            this.eventCanvas._elem.bind('mousedown', {plot:this}, this.onMouseDown);

            this.eventCanvas._elem.bind('mousemove', {plot:this}, this.onMouseMove);

            this.eventCanvas._elem.bind('mouseenter', {plot:this}, this.onMouseEnter);

            this.eventCanvas._elem.bind('mouseleave', {plot:this}, this.onMouseLeave);

            if (this.captureRightClick) {

                this.eventCanvas._elem.bind('mouseup', {plot:this}, this.onRightClick);

                this.eventCanvas._elem.get(0).oncontextmenu = function() {

                    return false;

                };

            }

            else {

                this.eventCanvas._elem.bind('mouseup', {plot:this}, this.onMouseUp);

            }

        };

        

        function getEventPosition(ev) {

            var plot = ev.data.plot;

            var go = plot.eventCanvas._elem.offset();

            var gridPos = {x:ev.pageX - go.left, y:ev.pageY - go.top};

            var dataPos = {xaxis:null, yaxis:null, x2axis:null, y2axis:null, y3axis:null, y4axis:null, y5axis:null, y6axis:null, y7axis:null, y8axis:null, y9axis:null, yMidAxis:null};

            var an = ['xaxis', 'yaxis', 'x2axis', 'y2axis', 'y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis', 'yMidAxis'];

            var ax = plot.axes;

            var n, axis;

            for (n=11; n>0; n--) {

                axis = an[n-1];

                if (ax[axis].show) {

                    dataPos[axis] = ax[axis].series_p2u(gridPos[axis.charAt(0)]);

                }

            }



            return {offsets:go, gridPos:gridPos, dataPos:dataPos};

        }

        

        

        // function to check if event location is over a area area

        function checkIntersection(gridpos, plot) {

            var series = plot.series;

            var i, j, k, s, r, x, y, theta, sm, sa, minang, maxang;

            var d0, d, p, pp, points, bw, hp;

            var threshold, t;

            for (k=plot.seriesStack.length-1; k>=0; k--) {

                i = plot.seriesStack[k];

                s = series[i];

                hp = s._highlightThreshold;

                switch (s.renderer.constructor) {

                    case $.jqplot.BarRenderer:

                        x = gridpos.x;

                        y = gridpos.y;

                        for (j=0; j<s._barPoints.length; j++) {

                            points = s._barPoints[j];

                            p = s.gridData[j];

                            if (x>points[0][0] && x<points[2][0] && (y>points[2][1] && y<points[0][1] || y<points[2][1] && y>points[0][1])) {

                                return {seriesIndex:s.index, pointIndex:j, gridData:p, data:s.data[j], points:s._barPoints[j]};

                            }

                        }

                        break;

                    case $.jqplot.PyramidRenderer:

                        x = gridpos.x;

                        y = gridpos.y;

                        for (j=0; j<s._barPoints.length; j++) {

                            points = s._barPoints[j];

                            p = s.gridData[j];

                            if (x > points[0][0] + hp[0][0] && x < points[2][0] + hp[2][0] && y > points[2][1] && y < points[0][1]) {

                                return {seriesIndex:s.index, pointIndex:j, gridData:p, data:s.data[j], points:s._barPoints[j]};

                            }

                        }

                        break;

                    

                    case $.jqplot.DonutRenderer:

                        sa = s.startAngle/180*Math.PI;

                        x = gridpos.x - s._center[0];

                        y = gridpos.y - s._center[1];

                        r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

                        if (x > 0 && -y >= 0) {

                            theta = 2*Math.PI - Math.atan(-y/x);

                        }

                        else if (x > 0 && -y < 0) {

                            theta = -Math.atan(-y/x);

                        }

                        else if (x < 0) {

                            theta = Math.PI - Math.atan(-y/x);

                        }

                        else if (x == 0 && -y > 0) {

                            theta = 3*Math.PI/2;

                        }

                        else if (x == 0 && -y < 0) {

                            theta = Math.PI/2;

                        }

                        else if (x == 0 && y == 0) {

                            theta = 0;

                        }

                        if (sa) {

                            theta -= sa;

                            if (theta < 0) {

                                theta += 2*Math.PI;

                            }

                            else if (theta > 2*Math.PI) {

                                theta -= 2*Math.PI;

                            }

                        }

            

                        sm = s.sliceMargin/180*Math.PI;

                        if (r < s._radius && r > s._innerRadius) {

                            for (j=0; j<s.gridData.length; j++) {

                                minang = (j>0) ? s.gridData[j-1][1]+sm : sm;

                                maxang = s.gridData[j][1];

                                if (theta > minang && theta < maxang) {

                                    return {seriesIndex:s.index, pointIndex:j, gridData:[gridpos.x,gridpos.y], data:s.data[j]};

                                }

                            }

                        }

                        break;

                        

                    case $.jqplot.PieRenderer:

                        sa = s.startAngle/180*Math.PI;

                        x = gridpos.x - s._center[0];

                        y = gridpos.y - s._center[1];

                        r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

                        if (x > 0 && -y >= 0) {

                            theta = 2*Math.PI - Math.atan(-y/x);

                        }

                        else if (x > 0 && -y < 0) {

                            theta = -Math.atan(-y/x);

                        }

                        else if (x < 0) {

                            theta = Math.PI - Math.atan(-y/x);

                        }

                        else if (x == 0 && -y > 0) {

                            theta = 3*Math.PI/2;

                        }

                        else if (x == 0 && -y < 0) {

                            theta = Math.PI/2;

                        }

                        else if (x == 0 && y == 0) {

                            theta = 0;

                        }

                        if (sa) {

                            theta -= sa;

                            if (theta < 0) {

                                theta += 2*Math.PI;

                            }

                            else if (theta > 2*Math.PI) {

                                theta -= 2*Math.PI;

                            }

                        }

            

                        sm = s.sliceMargin/180*Math.PI;

                        if (r < s._radius) {

                            for (j=0; j<s.gridData.length; j++) {

                                minang = (j>0) ? s.gridData[j-1][1]+sm : sm;

                                maxang = s.gridData[j][1];

                                if (theta > minang && theta < maxang) {

                                    return {seriesIndex:s.index, pointIndex:j, gridData:[gridpos.x,gridpos.y], data:s.data[j]};

                                }

                            }

                        }

                        break;

                        

                    case $.jqplot.BubbleRenderer:

                        x = gridpos.x;

                        y = gridpos.y;

                        var ret = null;

                        

                        if (s.show) {

                            for (var j=0; j<s.gridData.length; j++) {

                                p = s.gridData[j];

                                d = Math.sqrt( (x-p[0]) * (x-p[0]) + (y-p[1]) * (y-p[1]) );

                                if (d <= p[2] && (d <= d0 || d0 == null)) {

                                   d0 = d;

                                   ret = {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                }

                            }

                            if (ret != null) {

                                return ret;

                            }

                        }

                        break;

                        

                    case $.jqplot.FunnelRenderer:

                        x = gridpos.x;

                        y = gridpos.y;

                        var v = s._vertices,

                            vfirst = v[0],

                            vlast = v[v.length-1],

                            lex,

                            rex,

                            cv;

    

                        // equations of right and left sides, returns x, y values given height of section (y value and 2 points)

    

                        function findedge (l, p1 , p2) {

                            var m = (p1[1] - p2[1])/(p1[0] - p2[0]);

                            var b = p1[1] - m*p1[0];

                            var y = l + p1[1];

        

                            return [(y - b)/m, y];

                        }

    

                        // check each section

                        lex = findedge(y, vfirst[0], vlast[3]);

                        rex = findedge(y, vfirst[1], vlast[2]);

                        for (j=0; j<v.length; j++) {

                            cv = v[j];

                            if (y >= cv[0][1] && y <= cv[3][1] && x >= lex[0] && x <= rex[0]) {

                                return {seriesIndex:s.index, pointIndex:j, gridData:null, data:s.data[j]};

                            }

                        }         

                        break;           

                    

                    case $.jqplot.LineRenderer:

                        x = gridpos.x;

                        y = gridpos.y;

                        r = s.renderer;

                        if (s.show) {

                            if ((s.fill || (s.renderer.bands.show && s.renderer.bands.fill)) && (!plot.plugins.highlighter || !plot.plugins.highlighter.show)) {

                                // first check if it is in bounding box

                                var inside = false;

                                if (x>s._boundingBox[0][0] && x<s._boundingBox[1][0] && y>s._boundingBox[1][1] && y<s._boundingBox[0][1]) { 

                                    // now check the crossing number   

                                    

                                    var numPoints = s._areaPoints.length;

                                    var ii;

                                    var j = numPoints-1;



                                    for(var ii=0; ii < numPoints; ii++) { 

                                        var vertex1 = [s._areaPoints[ii][0], s._areaPoints[ii][1]];

                                        var vertex2 = [s._areaPoints[j][0], s._areaPoints[j][1]];



                                        if (vertex1[1] < y && vertex2[1] >= y || vertex2[1] < y && vertex1[1] >= y)     {

                                            if (vertex1[0] + (y - vertex1[1]) / (vertex2[1] - vertex1[1]) * (vertex2[0] - vertex1[0]) < x) {

                                                inside = !inside;

                                            }

                                        }



                                        j = ii;

                                    }        

                                }

                                if (inside) {

                                    return {seriesIndex:i, pointIndex:null, gridData:s.gridData, data:s.data, points:s._areaPoints};

                                }

                                break;

                                

                            }



                            else {

                                t = s.markerRenderer.size/2+s.neighborThreshold;

                                threshold = (t > 0) ? t : 0;

                                for (var j=0; j<s.gridData.length; j++) {

                                    p = s.gridData[j];

                                    // neighbor looks different to OHLC chart.

                                    if (r.constructor == $.jqplot.OHLCRenderer) {

                                        if (r.candleStick) {

                                            var yp = s._yaxis.series_u2p;

                                            if (x >= p[0]-r._bodyWidth/2 && x <= p[0]+r._bodyWidth/2 && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {

                                                return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                            }

                                        }

                                        // if an open hi low close chart

                                        else if (!r.hlc){

                                            var yp = s._yaxis.series_u2p;

                                            if (x >= p[0]-r._tickLength && x <= p[0]+r._tickLength && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {

                                                return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                            }

                                        }

                                        // a hi low close chart

                                        else {

                                            var yp = s._yaxis.series_u2p;

                                            if (x >= p[0]-r._tickLength && x <= p[0]+r._tickLength && y >= yp(s.data[j][1]) && y <= yp(s.data[j][2])) {

                                                return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                            }

                                        }

                            

                                    }

                                    else if (p[0] != null && p[1] != null){

                                        d = Math.sqrt( (x-p[0]) * (x-p[0]) + (y-p[1]) * (y-p[1]) );

                                        if (d <= threshold && (d <= d0 || d0 == null)) {

                                           d0 = d;

                                           return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                        }

                                    }

                                } 

                            }

                        }

                        break;

                        

                    default:

                        x = gridpos.x;

                        y = gridpos.y;

                        r = s.renderer;

                        if (s.show) {

                            t = s.markerRenderer.size/2+s.neighborThreshold;

                            threshold = (t > 0) ? t : 0;

                            for (var j=0; j<s.gridData.length; j++) {

                                p = s.gridData[j];

                                // neighbor looks different to OHLC chart.

                                if (r.constructor == $.jqplot.OHLCRenderer) {

                                    if (r.candleStick) {

                                        var yp = s._yaxis.series_u2p;

                                        if (x >= p[0]-r._bodyWidth/2 && x <= p[0]+r._bodyWidth/2 && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {

                                            return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                        }

                                    }

                                    // if an open hi low close chart

                                    else if (!r.hlc){

                                        var yp = s._yaxis.series_u2p;

                                        if (x >= p[0]-r._tickLength && x <= p[0]+r._tickLength && y >= yp(s.data[j][2]) && y <= yp(s.data[j][3])) {

                                            return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                        }

                                    }

                                    // a hi low close chart

                                    else {

                                        var yp = s._yaxis.series_u2p;

                                        if (x >= p[0]-r._tickLength && x <= p[0]+r._tickLength && y >= yp(s.data[j][1]) && y <= yp(s.data[j][2])) {

                                            return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                        }

                                    }

                            

                                }

                                else {

                                    d = Math.sqrt( (x-p[0]) * (x-p[0]) + (y-p[1]) * (y-p[1]) );

                                    if (d <= threshold && (d <= d0 || d0 == null)) {

                                       d0 = d;

                                       return {seriesIndex: i, pointIndex:j, gridData:p, data:s.data[j]};

                                    }

                                }

                            } 

                        }

                        break;

                }

            }

            

            return null;

        }

        

        

        

        this.onClick = function(ev) {

            // Event passed in is normalized and will have data attribute.

            // Event passed out is unnormalized.

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var neighbor = checkIntersection(positions.gridPos, p);

            var evt = $.Event('jqplotClick');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

        };

        

        this.onDblClick = function(ev) {

            // Event passed in is normalized and will have data attribute.

            // Event passed out is unnormalized.

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var neighbor = checkIntersection(positions.gridPos, p);

            var evt = $.Event('jqplotDblClick');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

        };

        

        this.onMouseDown = function(ev) {

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var neighbor = checkIntersection(positions.gridPos, p);

            var evt = $.Event('jqplotMouseDown');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

        };

        

        this.onMouseUp = function(ev) {

            var positions = getEventPosition(ev);

            var evt = $.Event('jqplotMouseUp');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, null, ev.data.plot]);

        };

        

        this.onRightClick = function(ev) {

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var neighbor = checkIntersection(positions.gridPos, p);

            if (p.captureRightClick) {

                if (ev.which == 3) {

                var evt = $.Event('jqplotRightClick');

                evt.pageX = ev.pageX;

                evt.pageY = ev.pageY;

                    $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

                }

                else {

                var evt = $.Event('jqplotMouseUp');

                evt.pageX = ev.pageX;

                evt.pageY = ev.pageY;

                    $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

                }

            }

        };

        

        this.onMouseMove = function(ev) {

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var neighbor = checkIntersection(positions.gridPos, p);

            var evt = $.Event('jqplotMouseMove');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, neighbor, p]);

        };

        

        this.onMouseEnter = function(ev) {

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var evt = $.Event('jqplotMouseEnter');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            evt.relatedTarget = ev.relatedTarget;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, null, p]);

        };

        

        this.onMouseLeave = function(ev) {

            var positions = getEventPosition(ev);

            var p = ev.data.plot;

            var evt = $.Event('jqplotMouseLeave');

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            evt.relatedTarget = ev.relatedTarget;

            $(this).trigger(evt, [positions.gridPos, positions.dataPos, null, p]);

        };

        

        // method: drawSeries

        // Redraws all or just one series on the plot.  No axis scaling

        // is performed and no other elements on the plot are redrawn.

        // options is an options object to pass on to the series renderers.

        // It can be an empty object {}.  idx is the series index

        // to redraw if only one series is to be redrawn.

        this.drawSeries = function(options, idx){

            var i, series, ctx;

            // if only one argument passed in and it is a number, use it ad idx.

            idx = (typeof(options) === "number" && idx == null) ? options : idx;

            options = (typeof(options) === "object") ? options : {};

            // draw specified series

            if (idx != undefined) {

                series = this.series[idx];

                ctx = series.shadowCanvas._ctx;

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                series.drawShadow(ctx, options, this);

                ctx = series.canvas._ctx;

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                series.draw(ctx, options, this);

                if (series.renderer.constructor == $.jqplot.BezierCurveRenderer) {

                    if (idx < this.series.length - 1) {

                        this.drawSeries(idx+1); 

                    }

                }

            }

            

            else {

                // if call series drawShadow method first, in case all series shadows

                // should be drawn before any series.  This will ensure, like for 

                // stacked bar plots, that shadows don't overlap series.

                for (i=0; i<this.series.length; i++) {

                    // first clear the canvas

                    series = this.series[i];

                    ctx = series.shadowCanvas._ctx;

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                    series.drawShadow(ctx, options, this);

                    ctx = series.canvas._ctx;

                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                    series.draw(ctx, options, this);

                }

            }

            options = idx = i = series = ctx = null;

        };

        

        // method: moveSeriesToFront

        // This method requires jQuery 1.4+

        // Moves the specified series canvas in front of all other series canvases.

        // This effectively "draws" the specified series on top of all other series,

        // although it is performed through DOM manipulation, no redrawing is performed.

        //

        // Parameters:

        // idx - 0 based index of the series to move.  This will be the index of the series

        // as it was first passed into the jqplot function.

        this.moveSeriesToFront = function (idx) { 

            idx = parseInt(idx, 10);

            var stackIndex = $.inArray(idx, this.seriesStack);

            // if already in front, return

            if (stackIndex == -1) {

                return;

            }

            if (stackIndex == this.seriesStack.length -1) {

                this.previousSeriesStack = this.seriesStack.slice(0);

                return;

            }

            var opidx = this.seriesStack[this.seriesStack.length -1];

            var serelem = this.series[idx].canvas._elem.detach();

            var shadelem = this.series[idx].shadowCanvas._elem.detach();

            this.series[opidx].shadowCanvas._elem.after(shadelem);

            this.series[opidx].canvas._elem.after(serelem);

            this.previousSeriesStack = this.seriesStack.slice(0);

            this.seriesStack.splice(stackIndex, 1);

            this.seriesStack.push(idx);

        };

        

        // method: moveSeriesToBack

        // This method requires jQuery 1.4+

        // Moves the specified series canvas behind all other series canvases.

        //

        // Parameters:

        // idx - 0 based index of the series to move.  This will be the index of the series

        // as it was first passed into the jqplot function.

        this.moveSeriesToBack = function (idx) {

            idx = parseInt(idx, 10);

            var stackIndex = $.inArray(idx, this.seriesStack);

            // if already in back, return

            if (stackIndex == 0 || stackIndex == -1) {

                return;

            }

            var opidx = this.seriesStack[0];

            var serelem = this.series[idx].canvas._elem.detach();

            var shadelem = this.series[idx].shadowCanvas._elem.detach();

            this.series[opidx].shadowCanvas._elem.before(shadelem);

            this.series[opidx].canvas._elem.before(serelem);

            this.previousSeriesStack = this.seriesStack.slice(0);

            this.seriesStack.splice(stackIndex, 1);

            this.seriesStack.unshift(idx);

        };

        

        // method: restorePreviousSeriesOrder

        // This method requires jQuery 1.4+

        // Restore the series canvas order to its previous state.

        // Useful to put a series back where it belongs after moving

        // it to the front.

        this.restorePreviousSeriesOrder = function () {

            var i, j, serelem, shadelem, temp, move, keep;

            // if no change, return.

            if (this.seriesStack == this.previousSeriesStack) {

                return;

            }

            for (i=1; i<this.previousSeriesStack.length; i++) {

                move = this.previousSeriesStack[i];

                keep = this.previousSeriesStack[i-1];

                serelem = this.series[move].canvas._elem.detach();

                shadelem = this.series[move].shadowCanvas._elem.detach();

                this.series[keep].shadowCanvas._elem.after(shadelem);

                this.series[keep].canvas._elem.after(serelem);

            }

            temp = this.seriesStack.slice(0);

            this.seriesStack = this.previousSeriesStack.slice(0);

            this.previousSeriesStack = temp;

        };

        

        // method: restoreOriginalSeriesOrder

        // This method requires jQuery 1.4+

        // Restore the series canvas order to its original order

        // when the plot was created.

        this.restoreOriginalSeriesOrder = function () {

            var i, j, arr=[], serelem, shadelem;

            for (i=0; i<this.series.length; i++) {

                arr.push(i);

            }

            if (this.seriesStack == arr) {

                return;

            }

            this.previousSeriesStack = this.seriesStack.slice(0);

            this.seriesStack = arr;

            for (i=1; i<this.seriesStack.length; i++) {

                serelem = this.series[i].canvas._elem.detach();

                shadelem = this.series[i].shadowCanvas._elem.detach();

                this.series[i-1].shadowCanvas._elem.after(shadelem);

                this.series[i-1].canvas._elem.after(serelem);

            }

        };

        

        this.activateTheme = function (name) {

            this.themeEngine.activate(this, name);

        };

    }

    

    

    // conpute a highlight color or array of highlight colors from given colors.

    $.jqplot.computeHighlightColors  = function(colors) {

        var ret;

        if ($.isArray(colors)) {

            ret = [];

            for (var i=0; i<colors.length; i++){

                var rgba = $.jqplot.getColorComponents(colors[i]);

                var newrgb = [rgba[0], rgba[1], rgba[2]];

                var sum = newrgb[0] + newrgb[1] + newrgb[2];

                for (var j=0; j<3; j++) {

                    // when darkening, lowest color component can be is 60.

                    newrgb[j] = (sum > 660) ?  newrgb[j] * 0.85 : 0.73 * newrgb[j] + 90;

                    newrgb[j] = parseInt(newrgb[j], 10);

                    (newrgb[j] > 255) ? 255 : newrgb[j];

                }

                // newrgb[3] = (rgba[3] > 0.4) ? rgba[3] * 0.4 : rgba[3] * 1.5;

                // newrgb[3] = (rgba[3] > 0.5) ? 0.8 * rgba[3] - .1 : rgba[3] + 0.2;

                newrgb[3] = 0.3 + 0.35 * rgba[3];

                ret.push('rgba('+newrgb[0]+','+newrgb[1]+','+newrgb[2]+','+newrgb[3]+')');

            }

        }

        else {

            var rgba = $.jqplot.getColorComponents(colors);

            var newrgb = [rgba[0], rgba[1], rgba[2]];

            var sum = newrgb[0] + newrgb[1] + newrgb[2];

            for (var j=0; j<3; j++) {

                // when darkening, lowest color component can be is 60.

                // newrgb[j] = (sum > 570) ?  newrgb[j] * 0.8 : newrgb[j] + 0.3 * (255 - newrgb[j]);

                // newrgb[j] = parseInt(newrgb[j], 10);

                newrgb[j] = (sum > 660) ?  newrgb[j] * 0.85 : 0.73 * newrgb[j] + 90;

                newrgb[j] = parseInt(newrgb[j], 10);

                (newrgb[j] > 255) ? 255 : newrgb[j];

            }

            // newrgb[3] = (rgba[3] > 0.4) ? rgba[3] * 0.4 : rgba[3] * 1.5;

            // newrgb[3] = (rgba[3] > 0.5) ? 0.8 * rgba[3] - .1 : rgba[3] + 0.2;

            newrgb[3] = 0.3 + 0.35 * rgba[3];

            ret = 'rgba('+newrgb[0]+','+newrgb[1]+','+newrgb[2]+','+newrgb[3]+')';

        }

        return ret;

    };

        

   $.jqplot.ColorGenerator = function(colors) {

        colors = colors || $.jqplot.config.defaultColors;

        var idx = 0;

        

        this.next = function () { 

            if (idx < colors.length) {

                return colors[idx++];

            }

            else {

                idx = 0;

                return colors[idx++];

            }

        };

        

        this.previous = function () { 

            if (idx > 0) {

                return colors[idx--];

            }

            else {

                idx = colors.length-1;

                return colors[idx];

            }

        };

        

        // get a color by index without advancing pointer.

        this.get = function(i) {

            var idx = i - colors.length * Math.floor(i/colors.length);

            return colors[idx];

        };

        

        this.setColors = function(c) {

            colors = c;

        };

        

        this.reset = function() {

            idx = 0;

        };



        this.getIndex = function() {

            return idx;

        };



        this.setIndex = function(index) {

            idx = index;

        };

    };



    // convert a hex color string to rgb string.

    // h - 3 or 6 character hex string, with or without leading #

    // a - optional alpha

    $.jqplot.hex2rgb = function(h, a) {

        h = h.replace('#', '');

        if (h.length == 3) {

            h = h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2);

        }

        var rgb;

        rgb = 'rgba('+parseInt(h.slice(0,2), 16)+', '+parseInt(h.slice(2,4), 16)+', '+parseInt(h.slice(4,6), 16);

        if (a) {

            rgb += ', '+a;

        }

        rgb += ')';

        return rgb;

    };

    

    // convert an rgb color spec to a hex spec.  ignore any alpha specification.

    $.jqplot.rgb2hex = function(s) {

        var pat = /rgba?\( *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *(?:, *[0-9.]*)?\)/;

        var m = s.match(pat);

        var h = '#';

        for (var i=1; i<4; i++) {

            var temp;

            if (m[i].search(/%/) != -1) {

                temp = parseInt(255*m[i]/100, 10).toString(16);

                if (temp.length == 1) {

                    temp = '0'+temp;

                }

            }

            else {

                temp = parseInt(m[i], 10).toString(16);

                if (temp.length == 1) {

                    temp = '0'+temp;

                }

            }

            h += temp;

        }

        return h;

    };

    

    // given a css color spec, return an rgb css color spec

    $.jqplot.normalize2rgb = function(s, a) {

        if (s.search(/^ *rgba?\(/) != -1) {

            return s; 

        }

        else if (s.search(/^ *#?[0-9a-fA-F]?[0-9a-fA-F]/) != -1) {

            return $.jqplot.hex2rgb(s, a);

        }

        else {

            throw new Error('Invalid color spec');

        }

    };

    

    // extract the r, g, b, a color components out of a css color spec.

    $.jqplot.getColorComponents = function(s) {

        // check to see if a color keyword.

        s = $.jqplot.colorKeywordMap[s] || s;

        var rgb = $.jqplot.normalize2rgb(s);

        var pat = /rgba?\( *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *, *([0-9]{1,3}\.?[0-9]*%?) *,? *([0-9.]* *)?\)/;

        var m = rgb.match(pat);

        var ret = [];

        for (var i=1; i<4; i++) {

            if (m[i].search(/%/) != -1) {

                ret[i-1] = parseInt(255*m[i]/100, 10);

            }

            else {

                ret[i-1] = parseInt(m[i], 10);

            }

        }

        ret[3] = parseFloat(m[4]) ? parseFloat(m[4]) : 1.0;

        return ret;

    };

    

    $.jqplot.colorKeywordMap = {

        aliceblue: 'rgb(240, 248, 255)',

        antiquewhite: 'rgb(250, 235, 215)',

        aqua: 'rgb( 0, 255, 255)',

        aquamarine: 'rgb(127, 255, 212)',

        azure: 'rgb(240, 255, 255)',

        beige: 'rgb(245, 245, 220)',

        bisque: 'rgb(255, 228, 196)',

        black: 'rgb( 0, 0, 0)',

        blanchedalmond: 'rgb(255, 235, 205)',

        blue: 'rgb( 0, 0, 255)',

        blueviolet: 'rgb(138, 43, 226)',

        brown: 'rgb(165, 42, 42)',

        burlywood: 'rgb(222, 184, 135)',

        cadetblue: 'rgb( 95, 158, 160)',

        chartreuse: 'rgb(127, 255, 0)',

        chocolate: 'rgb(210, 105, 30)',

        coral: 'rgb(255, 127, 80)',

        cornflowerblue: 'rgb(100, 149, 237)',

        cornsilk: 'rgb(255, 248, 220)',

        crimson: 'rgb(220, 20, 60)',

        cyan: 'rgb( 0, 255, 255)',

        darkblue: 'rgb( 0, 0, 139)',

        darkcyan: 'rgb( 0, 139, 139)',

        darkgoldenrod: 'rgb(184, 134, 11)',

        darkgray: 'rgb(169, 169, 169)',

        darkgreen: 'rgb( 0, 100, 0)',

        darkgrey: 'rgb(169, 169, 169)',

        darkkhaki: 'rgb(189, 183, 107)',

        darkmagenta: 'rgb(139, 0, 139)',

        darkolivegreen: 'rgb( 85, 107, 47)',

        darkorange: 'rgb(255, 140, 0)',

        darkorchid: 'rgb(153, 50, 204)',

        darkred: 'rgb(139, 0, 0)',

        darksalmon: 'rgb(233, 150, 122)',

        darkseagreen: 'rgb(143, 188, 143)',

        darkslateblue: 'rgb( 72, 61, 139)',

        darkslategray: 'rgb( 47, 79, 79)',

        darkslategrey: 'rgb( 47, 79, 79)',

        darkturquoise: 'rgb( 0, 206, 209)',

        darkviolet: 'rgb(148, 0, 211)',

        deeppink: 'rgb(255, 20, 147)',

        deepskyblue: 'rgb( 0, 191, 255)',

        dimgray: 'rgb(105, 105, 105)',

        dimgrey: 'rgb(105, 105, 105)',

        dodgerblue: 'rgb( 30, 144, 255)',

        firebrick: 'rgb(178, 34, 34)',

        floralwhite: 'rgb(255, 250, 240)',

        forestgreen: 'rgb( 34, 139, 34)',

        fuchsia: 'rgb(255, 0, 255)',

        gainsboro: 'rgb(220, 220, 220)',

        ghostwhite: 'rgb(248, 248, 255)',

        gold: 'rgb(255, 215, 0)',

        goldenrod: 'rgb(218, 165, 32)',

        gray: 'rgb(128, 128, 128)',

        grey: 'rgb(128, 128, 128)',

        green: 'rgb( 0, 128, 0)',

        greenyellow: 'rgb(173, 255, 47)',

        honeydew: 'rgb(240, 255, 240)',

        hotpink: 'rgb(255, 105, 180)',

        indianred: 'rgb(205, 92, 92)',

        indigo: 'rgb( 75, 0, 130)',

        ivory: 'rgb(255, 255, 240)',

        khaki: 'rgb(240, 230, 140)',

        lavender: 'rgb(230, 230, 250)',

        lavenderblush: 'rgb(255, 240, 245)',

        lawngreen: 'rgb(124, 252, 0)',

        lemonchiffon: 'rgb(255, 250, 205)',

        lightblue: 'rgb(173, 216, 230)',

        lightcoral: 'rgb(240, 128, 128)',

        lightcyan: 'rgb(224, 255, 255)',

        lightgoldenrodyellow: 'rgb(250, 250, 210)',

        lightgray: 'rgb(211, 211, 211)',

        lightgreen: 'rgb(144, 238, 144)',

        lightgrey: 'rgb(211, 211, 211)',

        lightpink: 'rgb(255, 182, 193)',

        lightsalmon: 'rgb(255, 160, 122)',

        lightseagreen: 'rgb( 32, 178, 170)',

        lightskyblue: 'rgb(135, 206, 250)',

        lightslategray: 'rgb(119, 136, 153)',

        lightslategrey: 'rgb(119, 136, 153)',

        lightsteelblue: 'rgb(176, 196, 222)',

        lightyellow: 'rgb(255, 255, 224)',

        lime: 'rgb( 0, 255, 0)',

        limegreen: 'rgb( 50, 205, 50)',

        linen: 'rgb(250, 240, 230)',

        magenta: 'rgb(255, 0, 255)',

        maroon: 'rgb(128, 0, 0)',

        mediumaquamarine: 'rgb(102, 205, 170)',

        mediumblue: 'rgb( 0, 0, 205)',

        mediumorchid: 'rgb(186, 85, 211)',

        mediumpurple: 'rgb(147, 112, 219)',

        mediumseagreen: 'rgb( 60, 179, 113)',

        mediumslateblue: 'rgb(123, 104, 238)',

        mediumspringgreen: 'rgb( 0, 250, 154)',

        mediumturquoise: 'rgb( 72, 209, 204)',

        mediumvioletred: 'rgb(199, 21, 133)',

        midnightblue: 'rgb( 25, 25, 112)',

        mintcream: 'rgb(245, 255, 250)',

        mistyrose: 'rgb(255, 228, 225)',

        moccasin: 'rgb(255, 228, 181)',

        navajowhite: 'rgb(255, 222, 173)',

        navy: 'rgb( 0, 0, 128)',

        oldlace: 'rgb(253, 245, 230)',

        olive: 'rgb(128, 128, 0)',

        olivedrab: 'rgb(107, 142, 35)',

        orange: 'rgb(255, 165, 0)',

        orangered: 'rgb(255, 69, 0)',

        orchid: 'rgb(218, 112, 214)',

        palegoldenrod: 'rgb(238, 232, 170)',

        palegreen: 'rgb(152, 251, 152)',

        paleturquoise: 'rgb(175, 238, 238)',

        palevioletred: 'rgb(219, 112, 147)',

        papayawhip: 'rgb(255, 239, 213)',

        peachpuff: 'rgb(255, 218, 185)',

        peru: 'rgb(205, 133, 63)',

        pink: 'rgb(255, 192, 203)',

        plum: 'rgb(221, 160, 221)',

        powderblue: 'rgb(176, 224, 230)',

        purple: 'rgb(128, 0, 128)',

        red: 'rgb(255, 0, 0)',

        rosybrown: 'rgb(188, 143, 143)',

        royalblue: 'rgb( 65, 105, 225)',

        saddlebrown: 'rgb(139, 69, 19)',

        salmon: 'rgb(250, 128, 114)',

        sandybrown: 'rgb(244, 164, 96)',

        seagreen: 'rgb( 46, 139, 87)',

        seashell: 'rgb(255, 245, 238)',

        sienna: 'rgb(160, 82, 45)',

        silver: 'rgb(192, 192, 192)',

        skyblue: 'rgb(135, 206, 235)',

        slateblue: 'rgb(106, 90, 205)',

        slategray: 'rgb(112, 128, 144)',

        slategrey: 'rgb(112, 128, 144)',

        snow: 'rgb(255, 250, 250)',

        springgreen: 'rgb( 0, 255, 127)',

        steelblue: 'rgb( 70, 130, 180)',

        tan: 'rgb(210, 180, 140)',

        teal: 'rgb( 0, 128, 128)',

        thistle: 'rgb(216, 191, 216)',

        tomato: 'rgb(255, 99, 71)',

        turquoise: 'rgb( 64, 224, 208)',

        violet: 'rgb(238, 130, 238)',

        wheat: 'rgb(245, 222, 179)',

        white: 'rgb(255, 255, 255)',

        whitesmoke: 'rgb(245, 245, 245)',

        yellow: 'rgb(255, 255, 0)',

        yellowgreen: 'rgb(154, 205, 50)'

    };



    





    // class: $.jqplot.AxisLabelRenderer

    // Renderer to place labels on the axes.

    $.jqplot.AxisLabelRenderer = function(options) {

        // Group: Properties

        $.jqplot.ElemContainer.call(this);

        // name of the axis associated with this tick

        this.axis;

        // prop: show

        // whether or not to show the tick (mark and label).

        this.show = true;

        // prop: label

        // The text or html for the label.

        this.label = '';

        this.fontFamily = null;

        this.fontSize = null;

        this.textColor = null;

        this._elem;

        // prop: escapeHTML

        // true to escape HTML entities in the label.

        this.escapeHTML = false;

        

        $.extend(true, this, options);

    };

    

    $.jqplot.AxisLabelRenderer.prototype = new $.jqplot.ElemContainer();

    $.jqplot.AxisLabelRenderer.prototype.constructor = $.jqplot.AxisLabelRenderer;

    

    $.jqplot.AxisLabelRenderer.prototype.init = function(options) {

        $.extend(true, this, options);

    };

    

    $.jqplot.AxisLabelRenderer.prototype.draw = function(ctx, plot) {

        // Memory Leaks patch

        if (this._elem) {

            this._elem.emptyForce();

            this._elem = null;

        }



        this._elem = $('<div style="position:absolute;" class="jqplot-'+this.axis+'-label"></div>');

        

        if (Number(this.label)) {

            this._elem.css('white-space', 'nowrap');

        }

        

        if (!this.escapeHTML) {

            this._elem.html(this.label);

        }

        else {

            this._elem.text(this.label);

        }

        if (this.fontFamily) {

            this._elem.css('font-family', this.fontFamily);

        }

        if (this.fontSize) {

            this._elem.css('font-size', this.fontSize);

        }

        if (this.textColor) {

            this._elem.css('color', this.textColor);

        }

        

        return this._elem;

    };

    

    $.jqplot.AxisLabelRenderer.prototype.pack = function() {

    };



    // class: $.jqplot.AxisTickRenderer

    // A "tick" object showing the value of a tick/gridline on the plot.

    $.jqplot.AxisTickRenderer = function(options) {

        // Group: Properties

        $.jqplot.ElemContainer.call(this);

        // prop: mark

        // tick mark on the axis.  One of 'inside', 'outside', 'cross', '' or null.

        this.mark = 'outside';

        // name of the axis associated with this tick

        this.axis;

        // prop: showMark

        // whether or not to show the mark on the axis.

        this.showMark = true;

        // prop: showGridline

        // whether or not to draw the gridline on the grid at this tick.

        this.showGridline = true;

        // prop: isMinorTick

        // if this is a minor tick.

        this.isMinorTick = false;

        // prop: size

        // Length of the tick beyond the grid in pixels.

        // DEPRECATED: This has been superceeded by markSize

        this.size = 4;

        // prop:  markSize

        // Length of the tick marks in pixels.  For 'cross' style, length

        // will be stoked above and below axis, so total length will be twice this.

        this.markSize = 6;

        // prop: show

        // whether or not to show the tick (mark and label).

        // Setting this to false requires more testing.  It is recommended

        // to set showLabel and showMark to false instead.

        this.show = true;

        // prop: showLabel

        // whether or not to show the label.

        this.showLabel = true;

        this.label = null;

        this.value = null;

        this._styles = {};

        // prop: formatter

        // A class of a formatter for the tick text.  sprintf by default.

        this.formatter = $.jqplot.DefaultTickFormatter;

        // prop: prefix

        // String to prepend to the tick label.

        // Prefix is prepended to the formatted tick label.

        this.prefix = '';

        // prop: suffix

        // String to append to the tick label.

        // Suffix is appended to the formatted tick label.

        this.suffix = '';

        // prop: formatString

        // string passed to the formatter.

        this.formatString = '';

        // prop: fontFamily

        // css spec for the font-family css attribute.

        this.fontFamily;

        // prop: fontSize

        // css spec for the font-size css attribute.

        this.fontSize;

        // prop: textColor

        // css spec for the color attribute.

        this.textColor;

        // prop: escapeHTML

        // true to escape HTML entities in the label.

        this.escapeHTML = false;

        this._elem;

        this._breakTick = false;

        

        $.extend(true, this, options);

    };

    

    $.jqplot.AxisTickRenderer.prototype.init = function(options) {

        $.extend(true, this, options);

    };

    

    $.jqplot.AxisTickRenderer.prototype = new $.jqplot.ElemContainer();

    $.jqplot.AxisTickRenderer.prototype.constructor = $.jqplot.AxisTickRenderer;

    

    $.jqplot.AxisTickRenderer.prototype.setTick = function(value, axisName, isMinor) {

        this.value = value;

        this.axis = axisName;

        if (isMinor) {

            this.isMinorTick = true;

        }

        return this;

    };

    

    $.jqplot.AxisTickRenderer.prototype.draw = function() {

        if (this.label === null) {

            this.label = this.prefix + this.formatter(this.formatString, this.value) + this.suffix;

        }

        var style = {position: 'absolute'};

        if (Number(this.label)) {

            style['whitSpace'] = 'nowrap';

        }

        

        // Memory Leaks patch

        if (this._elem) {

            this._elem.emptyForce();

            this._elem = null;

        }



        this._elem = $(document.createElement('div'));

        this._elem.addClass("jqplot-"+this.axis+"-tick");

        

        if (!this.escapeHTML) {

            this._elem.html(this.label);

        }

        else {

            this._elem.text(this.label);

        }

        

        this._elem.css(style);



        for (var s in this._styles) {

            this._elem.css(s, this._styles[s]);

        }

        if (this.fontFamily) {

            this._elem.css('font-family', this.fontFamily);

        }

        if (this.fontSize) {

            this._elem.css('font-size', this.fontSize);

        }

        if (this.textColor) {

            this._elem.css('color', this.textColor);

        }

        if (this._breakTick) {

          this._elem.addClass('jqplot-breakTick');

        }

        

        return this._elem;

    };

        

    $.jqplot.DefaultTickFormatter = function (format, val) {

        if (typeof val == 'number') {

            if (!format) {

                format = $.jqplot.config.defaultTickFormatString;

            }

            return $.jqplot.sprintf(format, val);

        }

        else {

            return String(val);

        }

    };

        

    $.jqplot.PercentTickFormatter = function (format, val) {

        if (typeof val == 'number') {

            val = 100 * val;

            if (!format) {

                format = $.jqplot.config.defaultTickFormatString;

            }

            return $.jqplot.sprintf(format, val);

        }

        else {

            return String(val);

        }

    };

    

    $.jqplot.AxisTickRenderer.prototype.pack = function() {

    };

     

    // Class: $.jqplot.CanvasGridRenderer

    // The default jqPlot grid renderer, creating a grid on a canvas element.

    // The renderer has no additional options beyond the <Grid> class.

    $.jqplot.CanvasGridRenderer = function(){

        this.shadowRenderer = new $.jqplot.ShadowRenderer();

    };

    

    // called with context of Grid object

    $.jqplot.CanvasGridRenderer.prototype.init = function(options) {

        this._ctx;

        $.extend(true, this, options);

        // set the shadow renderer options

        var sopts = {lineJoin:'miter', lineCap:'round', fill:false, isarc:false, angle:this.shadowAngle, offset:this.shadowOffset, alpha:this.shadowAlpha, depth:this.shadowDepth, lineWidth:this.shadowWidth, closePath:false, strokeStyle:this.shadowColor};

        this.renderer.shadowRenderer.init(sopts);

    };

    

    // called with context of Grid.

    $.jqplot.CanvasGridRenderer.prototype.createElement = function(plot) {

        var elem;

        // Memory Leaks patch

        if (this._elem) {

          if ($.jqplot.use_excanvas && window.G_vmlCanvasManager.uninitElement !== undefined) {

            elem = this._elem.get(0);

            window.G_vmlCanvasManager.uninitElement(elem);

            elem = null;

          }

          

          this._elem.emptyForce();

          this._elem = null;

        }

      

        elem = plot.canvasManager.getCanvas();



        var w = this._plotDimensions.width;

        var h = this._plotDimensions.height;

        elem.width = w;

        elem.height = h;

        this._elem = $(elem);

        this._elem.addClass('jqplot-grid-canvas');

        this._elem.css({ position: 'absolute', left: 0, top: 0 });

        

        elem = plot.canvasManager.initCanvas(elem);



        this._top = this._offsets.top;

        this._bottom = h - this._offsets.bottom;

        this._left = this._offsets.left;

        this._right = w - this._offsets.right;

        this._width = this._right - this._left;

        this._height = this._bottom - this._top;

        // avoid memory leak

        elem = null;

        return this._elem;

    };

    

    $.jqplot.CanvasGridRenderer.prototype.draw = function() {

        this._ctx = this._elem.get(0).getContext("2d");

        var ctx = this._ctx;

        var axes = this._axes;

        // Add the grid onto the grid canvas.  This is the bottom most layer.

        ctx.save();

        ctx.clearRect(0, 0, this._plotDimensions.width, this._plotDimensions.height);

        ctx.fillStyle = this.backgroundColor || this.background;

        ctx.fillRect(this._left, this._top, this._width, this._height);

        

        ctx.save();

        ctx.lineJoin = 'miter';

        ctx.lineCap = 'butt';

        ctx.lineWidth = this.gridLineWidth;

        ctx.strokeStyle = this.gridLineColor;

        var b, e, s, m;

        var ax = ['xaxis', 'yaxis', 'x2axis', 'y2axis'];

        for (var i=4; i>0; i--) {

            var name = ax[i-1];

            var axis = axes[name];

            var ticks = axis._ticks;

            var numticks = ticks.length;

            if (axis.show) {

                if (axis.drawBaseline) {

                    var bopts = {};

                    if (axis.baselineWidth !== null) {

                        bopts.lineWidth = axis.baselineWidth;

                    }

                    if (axis.baselineColor !== null) {

                        bopts.strokeStyle = axis.baselineColor;

                    }

                    switch (name) {

                        case 'xaxis':

                            drawLine (this._left, this._bottom, this._right, this._bottom, bopts);

                            break;

                        case 'yaxis':

                            drawLine (this._left, this._bottom, this._left, this._top, bopts);

                            break;

                        case 'x2axis':

                            drawLine (this._left, this._bottom, this._right, this._bottom, bopts);

                            break;

                        case 'y2axis':

                            drawLine (this._right, this._bottom, this._right, this._top, bopts);

                            break;

                    }

                }

                for (var j=numticks; j>0; j--) {

                    var t = ticks[j-1];

                    if (t.show) {

                        var pos = Math.round(axis.u2p(t.value)) + 0.5;

                        switch (name) {

                            case 'xaxis':

                                // draw the grid line if we should

                                if (t.showGridline && this.drawGridlines && ((!t.isMinorTick && axis.drawMajorGridlines) || (t.isMinorTick && axis.drawMinorGridlines)) ) {

                                    drawLine(pos, this._top, pos, this._bottom);

                                }

                                // draw the mark

                                if (t.showMark && t.mark && ((!t.isMinorTick && axis.drawMajorTickMarks) || (t.isMinorTick && axis.drawMinorTickMarks)) ) {

                                    s = t.markSize;

                                    m = t.mark;

                                    var pos = Math.round(axis.u2p(t.value)) + 0.5;

                                    switch (m) {

                                        case 'outside':

                                            b = this._bottom;

                                            e = this._bottom+s;

                                            break;

                                        case 'inside':

                                            b = this._bottom-s;

                                            e = this._bottom;

                                            break;

                                        case 'cross':

                                            b = this._bottom-s;

                                            e = this._bottom+s;

                                            break;

                                        default:

                                            b = this._bottom;

                                            e = this._bottom+s;

                                            break;

                                    }

                                    // draw the shadow

                                    if (this.shadow) {

                                        this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});

                                    }

                                    // draw the line

                                    drawLine(pos, b, pos, e);

                                }

                                break;

                            case 'yaxis':

                                // draw the grid line

                                if (t.showGridline && this.drawGridlines && ((!t.isMinorTick && axis.drawMajorGridlines) || (t.isMinorTick && axis.drawMinorGridlines)) ) {

                                    drawLine(this._right, pos, this._left, pos);

                                }

                                // draw the mark

                                if (t.showMark && t.mark && ((!t.isMinorTick && axis.drawMajorTickMarks) || (t.isMinorTick && axis.drawMinorTickMarks)) ) {

                                    s = t.markSize;

                                    m = t.mark;

                                    var pos = Math.round(axis.u2p(t.value)) + 0.5;

                                    switch (m) {

                                        case 'outside':

                                            b = this._left-s;

                                            e = this._left;

                                            break;

                                        case 'inside':

                                            b = this._left;

                                            e = this._left+s;

                                            break;

                                        case 'cross':

                                            b = this._left-s;

                                            e = this._left+s;

                                            break;

                                        default:

                                            b = this._left-s;

                                            e = this._left;

                                            break;

                                            }

                                    // draw the shadow

                                    if (this.shadow) {

                                        this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});

                                    }

                                    drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});

                                }

                                break;

                            case 'x2axis':

                                // draw the grid line

                                if (t.showGridline && this.drawGridlines && ((!t.isMinorTick && axis.drawMajorGridlines) || (t.isMinorTick && axis.drawMinorGridlines)) ) {

                                    drawLine(pos, this._bottom, pos, this._top);

                                }

                                // draw the mark

                                if (t.showMark && t.mark && ((!t.isMinorTick && axis.drawMajorTickMarks) || (t.isMinorTick && axis.drawMinorTickMarks)) ) {

                                    s = t.markSize;

                                    m = t.mark;

                                    var pos = Math.round(axis.u2p(t.value)) + 0.5;

                                    switch (m) {

                                        case 'outside':

                                            b = this._top-s;

                                            e = this._top;

                                            break;

                                        case 'inside':

                                            b = this._top;

                                            e = this._top+s;

                                            break;

                                        case 'cross':

                                            b = this._top-s;

                                            e = this._top+s;

                                            break;

                                        default:

                                            b = this._top-s;

                                            e = this._top;

                                            break;

                                            }

                                    // draw the shadow

                                    if (this.shadow) {

                                        this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});

                                    }

                                    drawLine(pos, b, pos, e);

                                }

                                break;

                            case 'y2axis':

                                // draw the grid line

                                if (t.showGridline && this.drawGridlines && ((!t.isMinorTick && axis.drawMajorGridlines) || (t.isMinorTick && axis.drawMinorGridlines)) ) {

                                    drawLine(this._left, pos, this._right, pos);

                                }

                                // draw the mark

                                if (t.showMark && t.mark && ((!t.isMinorTick && axis.drawMajorTickMarks) || (t.isMinorTick && axis.drawMinorTickMarks)) ) {

                                    s = t.markSize;

                                    m = t.mark;

                                    var pos = Math.round(axis.u2p(t.value)) + 0.5;

                                    switch (m) {

                                        case 'outside':

                                            b = this._right;

                                            e = this._right+s;

                                            break;

                                        case 'inside':

                                            b = this._right-s;

                                            e = this._right;

                                            break;

                                        case 'cross':

                                            b = this._right-s;

                                            e = this._right+s;

                                            break;

                                        default:

                                            b = this._right;

                                            e = this._right+s;

                                            break;

                                            }

                                    // draw the shadow

                                    if (this.shadow) {

                                        this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});

                                    }

                                    drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});

                                }

                                break;

                            default:

                                break;

                        }

                    }

                }

                t = null;

            }

            axis = null;

            ticks = null;

        }

        // Now draw grid lines for additional y axes

        //////

        // TO DO: handle yMidAxis

        //////

        ax = ['y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis', 'yMidAxis'];

        for (var i=7; i>0; i--) {

            var axis = axes[ax[i-1]];

            var ticks = axis._ticks;

            if (axis.show) {

                var tn = ticks[axis.numberTicks-1];

                var t0 = ticks[0];

                var left = axis.getLeft();

                var points = [[left, tn.getTop() + tn.getHeight()/2], [left, t0.getTop() + t0.getHeight()/2 + 1.0]];

                // draw the shadow

                if (this.shadow) {

                    this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', fill:false, closePath:false});

                }

                // draw the line

                drawLine(points[0][0], points[0][1], points[1][0], points[1][1], {lineCap:'butt', strokeStyle:axis.borderColor, lineWidth:axis.borderWidth});

                // draw the tick marks

                for (var j=ticks.length; j>0; j--) {

                    var t = ticks[j-1];

                    s = t.markSize;

                    m = t.mark;

                    var pos = Math.round(axis.u2p(t.value)) + 0.5;

                    if (t.showMark && t.mark) {

                        switch (m) {

                            case 'outside':

                                b = left;

                                e = left+s;

                                break;

                            case 'inside':

                                b = left-s;

                                e = left;

                                break;

                            case 'cross':

                                b = left-s;

                                e = left+s;

                                break;

                            default:

                                b = left;

                                e = left+s;

                                break;

                        }

                        points = [[b,pos], [e,pos]];

                        // draw the shadow

                        if (this.shadow) {

                            this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});

                        }

                        // draw the line

                        drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});

                    }

                    t = null;

                }

                t0 = null;

            }

            axis = null;

            ticks =  null;

        }

        

        ctx.restore();

        

        function drawLine(bx, by, ex, ey, opts) {

            ctx.save();

            opts = opts || {};

            if (opts.lineWidth == null || opts.lineWidth != 0){

                $.extend(true, ctx, opts);

                ctx.beginPath();

                ctx.moveTo(bx, by);

                ctx.lineTo(ex, ey);

                ctx.stroke();

                ctx.restore();

            }

        }

        

        if (this.shadow) {

            var points = [[this._left, this._bottom], [this._right, this._bottom], [this._right, this._top]];

            this.renderer.shadowRenderer.draw(ctx, points);

        }

        // Now draw border around grid.  Use axis border definitions. start at

        // upper left and go clockwise.

        if (this.borderWidth != 0 && this.drawBorder) {

            drawLine (this._left, this._top, this._right, this._top, {lineCap:'round', strokeStyle:axes.x2axis.borderColor, lineWidth:axes.x2axis.borderWidth});

            drawLine (this._right, this._top, this._right, this._bottom, {lineCap:'round', strokeStyle:axes.y2axis.borderColor, lineWidth:axes.y2axis.borderWidth});

            drawLine (this._right, this._bottom, this._left, this._bottom, {lineCap:'round', strokeStyle:axes.xaxis.borderColor, lineWidth:axes.xaxis.borderWidth});

            drawLine (this._left, this._bottom, this._left, this._top, {lineCap:'round', strokeStyle:axes.yaxis.borderColor, lineWidth:axes.yaxis.borderWidth});

        }

        // ctx.lineWidth = this.borderWidth;

        // ctx.strokeStyle = this.borderColor;

        // ctx.strokeRect(this._left, this._top, this._width, this._height);

        

        ctx.restore();

        ctx =  null;

        axes = null;

    };

 

    // Class: $.jqplot.DivTitleRenderer

    // The default title renderer for jqPlot.  This class has no options beyond the <Title> class. 

    $.jqplot.DivTitleRenderer = function() {

    };

    

    $.jqplot.DivTitleRenderer.prototype.init = function(options) {

        $.extend(true, this, options);

    };

    

    $.jqplot.DivTitleRenderer.prototype.draw = function() {

        // Memory Leaks patch

        if (this._elem) {

            this._elem.emptyForce();

            this._elem = null;

        }



        var r = this.renderer;

        var elem = document.createElement('div');

        this._elem = $(elem);

        this._elem.addClass('jqplot-title');



        if (!this.text) {

            this.show = false;

            this._elem.height(0);

            this._elem.width(0);

        }

        else if (this.text) {

            var color;

            if (this.color) {

                color = this.color;

            }

            else if (this.textColor) {

                color = this.textColor;

            }



            // don't trust that a stylesheet is present, set the position.

            var styles = {position:'absolute', top:'0px', left:'0px'};



            if (this._plotWidth) {

                styles['width'] = this._plotWidth+'px';

            }

            if (this.fontSize) {

                styles['fontSize'] = this.fontSize;

            }

            if (typeof this.textAlign === 'string') {

                styles['textAlign'] = this.textAlign;

            }

            else {

                styles['textAlign'] = 'center';

            }

            if (color) {

                styles['color'] = color;

            }

            if (this.paddingBottom) {

                styles['paddingBottom'] = this.paddingBottom;

            }

            if (this.fontFamily) {

                styles['fontFamily'] = this.fontFamily;

            }



            this._elem.css(styles);

            if (this.escapeHtml) {

                this._elem.text(this.text);

            }

            else {

                this._elem.html(this.text);

            }





            // styletext += (this._plotWidth) ? 'width:'+this._plotWidth+'px;' : '';

            // styletext += (this.fontSize) ? 'font-size:'+this.fontSize+';' : '';

            // styletext += (this.textAlign) ? 'text-align:'+this.textAlign+';' : 'text-align:center;';

            // styletext += (color) ? 'color:'+color+';' : '';

            // styletext += (this.paddingBottom) ? 'padding-bottom:'+this.paddingBottom+';' : '';

            // this._elem = $('<div class="jqplot-title" style="'+styletext+'">'+this.text+'</div>');

            // if (this.fontFamily) {

            //     this._elem.css('font-family', this.fontFamily);

            // }

        }



        elem = null;

        

        return this._elem;

    };

    

    $.jqplot.DivTitleRenderer.prototype.pack = function() {

        // nothing to do here

    };

  



    var dotlen = 0.1;



    $.jqplot.LinePattern = function (ctx, pattern) {



        var defaultLinePatterns = {

            dotted: [ dotlen, $.jqplot.config.dotGapLength ],

            dashed: [ $.jqplot.config.dashLength, $.jqplot.config.gapLength ],

            solid: null

        };



        if (typeof pattern === 'string') {

            if (pattern[0] === '.' || pattern[0] === '-') {

                var s = pattern;

                pattern = [];

                for (var i=0, imax=s.length; i<imax; i++) {

                    if (s[i] === '.') {

                        pattern.push( dotlen );

                    }

                    else if (s[i] === '-') {

                        pattern.push( $.jqplot.config.dashLength );

                    }

                    else {

                        continue;

                    }

                    pattern.push( $.jqplot.config.gapLength );

                }

            }

            else {

                pattern = defaultLinePatterns[pattern];

            }

        }



        if (!(pattern && pattern.length)) {

            return ctx;

        }



        var patternIndex = 0;

        var patternDistance = pattern[0];

        var px = 0;

        var py = 0;

        var pathx0 = 0;

        var pathy0 = 0;



        var moveTo = function (x, y) {

            ctx.moveTo( x, y );

            px = x;

            py = y;

            pathx0 = x;

            pathy0 = y;

        };



        var lineTo = function (x, y) {

            var scale = ctx.lineWidth;

            var dx = x - px;

            var dy = y - py;

            var dist = Math.sqrt(dx*dx+dy*dy);

            if ((dist > 0) && (scale > 0)) {

                dx /= dist;

                dy /= dist;

                while (true) {

                    var dp = scale * patternDistance;

                    if (dp < dist) {

                        px += dp * dx;

                        py += dp * dy;

                        if ((patternIndex & 1) == 0) {

                            ctx.lineTo( px, py );

                        }

                        else {

                            ctx.moveTo( px, py );

                        }

                        dist -= dp;

                        patternIndex++;

                        if (patternIndex >= pattern.length) {

                            patternIndex = 0;

                        }

                        patternDistance = pattern[patternIndex];

                    }

                    else {

                        px = x;

                        py = y;

                        if ((patternIndex & 1) == 0) {

                            ctx.lineTo( px, py );

                        }

                        else {

                            ctx.moveTo( px, py );

                        }

                        patternDistance -= dist / scale;

                        break;

                    }

                }

            }

        };



        var beginPath = function () {

            ctx.beginPath();

        };



        var closePath = function () {

            lineTo( pathx0, pathy0 );

        };



        return {

            moveTo: moveTo,

            lineTo: lineTo,

            beginPath: beginPath,

            closePath: closePath

        };

    };



    // Class: $.jqplot.LineRenderer

    // The default line renderer for jqPlot, this class has no options beyond the <Series> class.

    // Draws series as a line.

    $.jqplot.LineRenderer = function(){

        this.shapeRenderer = new $.jqplot.ShapeRenderer();

        this.shadowRenderer = new $.jqplot.ShadowRenderer();

    };

    

    // called with scope of series.

    $.jqplot.LineRenderer.prototype.init = function(options, plot) {

        // Group: Properties

        //

        options = options || {};

        this._type='line';

        this.renderer.animation = {

            show: false,

            direction: 'left',

            speed: 2500,

            _supported: true

        };

        // prop: smooth

        // True to draw a smoothed (interpolated) line through the data points

        // with automatically computed number of smoothing points.

        // Set to an integer number > 2 to specify number of smoothing points

        // to use between each data point.

        this.renderer.smooth = false;  // true or a number > 2 for smoothing.

        this.renderer.tension = null; // null to auto compute or a number typically > 6.  Fewer points requires higher tension.

        // prop: constrainSmoothing

        // True to use a more accurate smoothing algorithm that will

        // not overshoot any data points.  False to allow overshoot but

        // produce a smoother looking line.

        this.renderer.constrainSmoothing = true;

        // this is smoothed data in grid coordinates, like gridData

        this.renderer._smoothedData = [];

        // this is smoothed data in plot units (plot coordinates), like plotData.

        this.renderer._smoothedPlotData = [];

        this.renderer._hiBandGridData = [];

        this.renderer._lowBandGridData = [];

        this.renderer._hiBandSmoothedData = [];

        this.renderer._lowBandSmoothedData = [];



        // prop: bandData

        // Data used to draw error bands or confidence intervals above/below a line.

        //

        // bandData can be input in 3 forms.  jqPlot will figure out which is the

        // low band line and which is the high band line for all forms:

        // 

        // A 2 dimensional array like [[yl1, yl2, ...], [yu1, yu2, ...]] where

        // [yl1, yl2, ...] are y values of the lower line and

        // [yu1, yu2, ...] are y values of the upper line.

        // In this case there must be the same number of y data points as data points

        // in the series and the bands will inherit the x values of the series.

        //

        // A 2 dimensional array like [[[xl1, yl1], [xl2, yl2], ...], [[xh1, yh1], [xh2, yh2], ...]]

        // where [xl1, yl1] are x,y data points for the lower line and

        // [xh1, yh1] are x,y data points for the high line.

        // x values do not have to correspond to the x values of the series and can

        // be of any arbitrary length.

        //

        // Can be of form [[yl1, yu1], [yl2, yu2], [yl3, yu3], ...] where

        // there must be 3 or more arrays and there must be the same number of arrays

        // as there are data points in the series.  In this case, 

        // [yl1, yu1] specifies the lower and upper y values for the 1st

        // data point and so on.  The bands will inherit the x

        // values from the series.

        this.renderer.bandData = [];



        // Group: bands

        // Banding around line, e.g error bands or confidence intervals.

        this.renderer.bands = {

            // prop: show

            // true to show the bands.  If bandData or interval is

            // suppplied, show will be set to true by default.

            show: false,

            hiData: [],

            lowData: [],

            // prop: color

            // color of lines at top and bottom of bands [default: series color].

            color: this.color,

            // prop: showLines

            // True to show lines at top and bottom of bands [default: false].

            showLines: false,

            // prop: fill

            // True to fill area between bands [default: true].

            fill: true,

            // prop: fillColor

            // css color spec for filled area.  [default: series color].

            fillColor: null,

            _min: null,

            _max: null,

            // prop: interval

            // User specified interval above and below line for bands [default: '3%''].

            // Can be a value like 3 or a string like '3%' 

            // or an upper/lower array like [1, -2] or ['2%', '-1.5%']

            interval: '3%'

        };





        var lopts = {highlightMouseOver: options.highlightMouseOver, highlightMouseDown: options.highlightMouseDown, highlightColor: options.highlightColor};

        

        delete (options.highlightMouseOver);

        delete (options.highlightMouseDown);

        delete (options.highlightColor);

        

        $.extend(true, this.renderer, options);



        this.renderer.options = options;



        // if we are given some band data, and bands aren't explicity set to false in options, turn them on.

        if (this.renderer.bandData.length > 1 && (!options.bands || options.bands.show == null)) {

            this.renderer.bands.show = true;

        }



        // if we are given an interval, and bands aren't explicity set to false in options, turn them on.

        else if (options.bands && options.bands.show == null && options.bands.interval != null) {

            this.renderer.bands.show = true;

        }



        // if plot is filled, turn off bands.

        if (this.fill) {

            this.renderer.bands.show = false;

        }



        if (this.renderer.bands.show) {

            this.renderer.initBands.call(this, this.renderer.options, plot);

        }





        // smoothing is not compatible with stacked lines, disable

        if (this._stack) {

            this.renderer.smooth = false;

        }



        // set the shape renderer options

        var opts = {lineJoin:this.lineJoin, lineCap:this.lineCap, fill:this.fill, isarc:false, strokeStyle:this.color, fillStyle:this.fillColor, lineWidth:this.lineWidth, linePattern:this.linePattern, closePath:this.fill};

        this.renderer.shapeRenderer.init(opts);



        var shadow_offset = options.shadowOffset;

        // set the shadow renderer options

        if (shadow_offset == null) {

            // scale the shadowOffset to the width of the line.

            if (this.lineWidth > 2.5) {

                shadow_offset = 1.25 * (1 + (Math.atan((this.lineWidth/2.5))/0.785398163 - 1)*0.6);

                // var shadow_offset = this.shadowOffset;

            }

            // for skinny lines, don't make such a big shadow.

            else {

                shadow_offset = 1.25 * Math.atan((this.lineWidth/2.5))/0.785398163;

            }

        }

        

        var sopts = {lineJoin:this.lineJoin, lineCap:this.lineCap, fill:this.fill, isarc:false, angle:this.shadowAngle, offset:shadow_offset, alpha:this.shadowAlpha, depth:this.shadowDepth, lineWidth:this.lineWidth, linePattern:this.linePattern, closePath:this.fill};

        this.renderer.shadowRenderer.init(sopts);

        this._areaPoints = [];

        this._boundingBox = [[],[]];

        

        if (!this.isTrendline && this.fill || this.renderer.bands.show) {

            // Group: Properties

            //        

            // prop: highlightMouseOver

            // True to highlight area on a filled plot when moused over.

            // This must be false to enable highlightMouseDown to highlight when clicking on an area on a filled plot.

            this.highlightMouseOver = true;

            // prop: highlightMouseDown

            // True to highlight when a mouse button is pressed over an area on a filled plot.

            // This will be disabled if highlightMouseOver is true.

            this.highlightMouseDown = false;

            // prop: highlightColor

            // color to use when highlighting an area on a filled plot.

            this.highlightColor = null;

            // if user has passed in highlightMouseDown option and not set highlightMouseOver, disable highlightMouseOver

            if (lopts.highlightMouseDown && lopts.highlightMouseOver == null) {

                lopts.highlightMouseOver = false;

            }

        

            $.extend(true, this, {highlightMouseOver: lopts.highlightMouseOver, highlightMouseDown: lopts.highlightMouseDown, highlightColor: lopts.highlightColor});

            

            if (!this.highlightColor) {

                var fc = (this.renderer.bands.show) ? this.renderer.bands.fillColor : this.fillColor;

                this.highlightColor = $.jqplot.computeHighlightColors(fc);

            }

            // turn off (disable) the highlighter plugin

            if (this.highlighter) {

                this.highlighter.show = false;

            }

        }

        

        if (!this.isTrendline && plot) {

            plot.plugins.lineRenderer = {};

            plot.postInitHooks.addOnce(postInit);

            plot.postDrawHooks.addOnce(postPlotDraw);

            plot.eventListenerHooks.addOnce('jqplotMouseMove', handleMove);

            plot.eventListenerHooks.addOnce('jqplotMouseDown', handleMouseDown);

            plot.eventListenerHooks.addOnce('jqplotMouseUp', handleMouseUp);

            plot.eventListenerHooks.addOnce('jqplotClick', handleClick);

            plot.eventListenerHooks.addOnce('jqplotRightClick', handleRightClick);

        }



    };



    $.jqplot.LineRenderer.prototype.initBands = function(options, plot) {

        // use bandData if no data specified in bands option

        //var bd = this.renderer.bandData;

        var bd = options.bandData || [];

        var bands = this.renderer.bands;

        bands.hiData = [];

        bands.lowData = [];

        var data = this.data;

        bands._max = null;

        bands._min = null;

        // If 2 arrays, and each array greater than 2 elements, assume it is hi and low data bands of y values.

        if (bd.length == 2) {

            // Do we have an array of x,y values?

            // like [[[1,1], [2,4], [3,3]], [[1,3], [2,6], [3,5]]]

            if ($.isArray(bd[0][0])) {

                // since an arbitrary array of points, spin through all of them to determine max and min lines.



                var p;

                var bdminidx = 0, bdmaxidx = 0;

                for (var i = 0, l = bd[0].length; i<l; i++) {

                    p = bd[0][i];

                    if ((p[1] != null && p[1] > bands._max) || bands._max == null) {

                        bands._max = p[1];

                    }

                    if ((p[1] != null && p[1] < bands._min) || bands._min == null) {

                        bands._min = p[1];

                    }

                }

                for (var i = 0, l = bd[1].length; i<l; i++) {

                    p = bd[1][i];

                    if ((p[1] != null && p[1] > bands._max) || bands._max == null) {

                        bands._max = p[1];

                        bdmaxidx = 1;

                    }

                    if ((p[1] != null && p[1] < bands._min) || bands._min == null) {

                        bands._min = p[1];

                        bdminidx = 1;

                    }

                }



                if (bdmaxidx === bdminidx) {

                    bands.show = false;

                }



                bands.hiData = bd[bdmaxidx];

                bands.lowData = bd[bdminidx];

            }

            // else data is arrays of y values

            // like [[1,4,3], [3,6,5]]

            // must have same number of band data points as points in series

            else if (bd[0].length === data.length && bd[1].length === data.length) {

                var hi = (bd[0][0] > bd[1][0]) ? 0 : 1;

                var low = (hi) ? 0 : 1;

                for (var i=0, l=data.length; i < l; i++) {

                    bands.hiData.push([data[i][0], bd[hi][i]]);

                    bands.lowData.push([data[i][0], bd[low][i]]);

                }

            }



            // we don't have proper data array, don't show bands.

            else {

                bands.show = false;

            }

        }



        // if more than 2 arrays, have arrays of [ylow, yhi] values.

        // note, can't distinguish case of [[ylow, yhi], [ylow, yhi]] from [[ylow, ylow], [yhi, yhi]]

        // this is assumed to be of the latter form.

        else if (bd.length > 2 && !$.isArray(bd[0][0])) {

            var hi = (bd[0][0] > bd[0][1]) ? 0 : 1;

            var low = (hi) ? 0 : 1;

            for (var i=0, l=bd.length; i<l; i++) {

                bands.hiData.push([data[i][0], bd[i][hi]]);

                bands.lowData.push([data[i][0], bd[i][low]]);

            }

        }



        // don't have proper data, auto calculate

        else {

            var intrv = bands.interval;

            var a = null;

            var b = null;

            var afunc = null;

            var bfunc = null;



            if ($.isArray(intrv)) {

                a = intrv[0];

                b = intrv[1];

            }

            else {

                a = intrv;

            }



            if (isNaN(a)) {

                // we have a string

                if (a.charAt(a.length - 1) === '%') {

                    afunc = 'multiply';

                    a = parseFloat(a)/100 + 1;

                }

            }



            else {

                a = parseFloat(a);

                afunc = 'add';

            }



            if (b !== null && isNaN(b)) {

                // we have a string

                if (b.charAt(b.length - 1) === '%') {

                    bfunc = 'multiply';

                    b = parseFloat(b)/100 + 1;

                }

            }



            else if (b !== null) {

                b = parseFloat(b);

                bfunc = 'add';

            }



            if (a !== null) {

                if (b === null) {

                    b = -a;

                    bfunc = afunc;

                    if (bfunc === 'multiply') {

                        b += 2;

                    }

                }



                // make sure a always applies to hi band.

                if (a < b) {

                    var temp = a;

                    a = b;

                    b = temp;

                    temp = afunc;

                    afunc = bfunc;

                    bfunc = temp;

                }



                for (var i=0, l = data.length; i < l; i++) {

                    switch (afunc) {

                        case 'add':

                            bands.hiData.push([data[i][0], data[i][1] + a]);

                            break;

                        case 'multiply':

                            bands.hiData.push([data[i][0], data[i][1] * a]);

                            break;

                    }

                    switch (bfunc) {

                        case 'add':

                            bands.lowData.push([data[i][0], data[i][1] + b]);

                            break;

                        case 'multiply':

                            bands.lowData.push([data[i][0], data[i][1] * b]);

                            break;

                    }

                }

            }



            else {

                bands.show = false;

            }

        }



        var hd = bands.hiData;

        var ld = bands.lowData;

        for (var i = 0, l = hd.length; i<l; i++) {

            if ((hd[i][1] != null && hd[i][1] > bands._max) || bands._max == null) {

                bands._max = hd[i][1];

            }

        }

        for (var i = 0, l = ld.length; i<l; i++) {

            if ((ld[i][1] != null && ld[i][1] < bands._min) || bands._min == null) {

                bands._min = ld[i][1];

            }

        }



        // one last check for proper data

        // these don't apply any more since allowing arbitrary x,y values

        // if (bands.hiData.length != bands.lowData.length) {

        //     bands.show = false;

        // }



        // if (bands.hiData.length != this.data.length) {

        //     bands.show = false;

        // }



        if (bands.fillColor === null) {

            var c = $.jqplot.getColorComponents(bands.color);

            // now adjust alpha to differentiate fill

            c[3] = c[3] * 0.5;

            bands.fillColor = 'rgba(' + c[0] +', '+ c[1] +', '+ c[2] +', '+ c[3] + ')';

        }

    };



    function getSteps (d, f) {

        return (3.4182054+f) * Math.pow(d, -0.3534992);

    }



    function computeSteps (d1, d2) {

        var s = Math.sqrt(Math.pow((d2[0]- d1[0]), 2) + Math.pow ((d2[1] - d1[1]), 2));

        return 5.7648 * Math.log(s) + 7.4456;

    }



    function tanh (x) {

        var a = (Math.exp(2*x) - 1) / (Math.exp(2*x) + 1);

        return a;

    }



    //////////

    // computeConstrainedSmoothedData

    // An implementation of the constrained cubic spline interpolation

    // method as presented in:

    //

    // Kruger, CJC, Constrained Cubic Spine Interpolation for Chemical Engineering Applications

    // http://www.korf.co.uk/spline.pdf

    //

    // The implementation below borrows heavily from the sample Visual Basic

    // implementation by CJC Kruger found in http://www.korf.co.uk/spline.xls

    //

    /////////



    // called with scope of series

    function computeConstrainedSmoothedData (gd) {

        var smooth = this.renderer.smooth;

        var dim = this.canvas.getWidth();

        var xp = this._xaxis.series_p2u;

        var yp = this._yaxis.series_p2u; 

        var steps =null;

        var _steps = null;

        var dist = gd.length/dim;

        var _smoothedData = [];

        var _smoothedPlotData = [];



        if (!isNaN(parseFloat(smooth))) {

            steps = parseFloat(smooth);

        }

        else {

            steps = getSteps(dist, 0.5);

        }



        var yy = [];

        var xx = [];



        for (var i=0, l = gd.length; i<l; i++) {

            yy.push(gd[i][1]);

            xx.push(gd[i][0]);

        }



        function dxx(x1, x0) {

            if (x1 - x0 == 0) {

                return Math.pow(10,10);

            }

            else {

                return x1 - x0;

            }

        }



        var A, B, C, D;

        // loop through each line segment.  Have # points - 1 line segments.  Nmber segments starting at 1.

        var nmax = gd.length - 1;

        for (var num = 1, gdl = gd.length; num<gdl; num++) {

            var gxx = [];

            var ggxx = [];

            // point at each end of segment.

            for (var j = 0; j < 2; j++) {

                var i = num - 1 + j; // point number, 0 to # points.



                if (i == 0 || i == nmax) {

                    gxx[j] = Math.pow(10, 10);

                }

                else if (yy[i+1] - yy[i] == 0 || yy[i] - yy[i-1] == 0) {

                    gxx[j] = 0;

                }

                else if (((xx[i+1] - xx[i]) / (yy[i+1] - yy[i]) + (xx[i] - xx[i-1]) / (yy[i] - yy[i-1])) == 0 ) {

                    gxx[j] = 0;

                }

                else if ( (yy[i+1] - yy[i]) * (yy[i] - yy[i-1]) < 0 ) {

                    gxx[j] = 0;

                }



                else {

                    gxx[j] = 2 / (dxx(xx[i + 1], xx[i]) / (yy[i + 1] - yy[i]) + dxx(xx[i], xx[i - 1]) / (yy[i] - yy[i - 1]));

                }

            }



            // Reset first derivative (slope) at first and last point

            if (num == 1) {

                // First point has 0 2nd derivative

                gxx[0] = 3 / 2 * (yy[1] - yy[0]) / dxx(xx[1], xx[0]) - gxx[1] / 2;

            }

            else if (num == nmax) {

                // Last point has 0 2nd derivative

                gxx[1] = 3 / 2 * (yy[nmax] - yy[nmax - 1]) / dxx(xx[nmax], xx[nmax - 1]) - gxx[0] / 2;

            }   



            // Calc second derivative at points

            ggxx[0] = -2 * (gxx[1] + 2 * gxx[0]) / dxx(xx[num], xx[num - 1]) + 6 * (yy[num] - yy[num - 1]) / Math.pow(dxx(xx[num], xx[num - 1]), 2);

            ggxx[1] = 2 * (2 * gxx[1] + gxx[0]) / dxx(xx[num], xx[num - 1]) - 6 * (yy[num] - yy[num - 1]) / Math.pow(dxx(xx[num], xx[num - 1]), 2);



            // Calc constants for cubic interpolation

            D = 1 / 6 * (ggxx[1] - ggxx[0]) / dxx(xx[num], xx[num - 1]);

            C = 1 / 2 * (xx[num] * ggxx[0] - xx[num - 1] * ggxx[1]) / dxx(xx[num], xx[num - 1]);

            B = (yy[num] - yy[num - 1] - C * (Math.pow(xx[num], 2) - Math.pow(xx[num - 1], 2)) - D * (Math.pow(xx[num], 3) - Math.pow(xx[num - 1], 3))) / dxx(xx[num], xx[num - 1]);

            A = yy[num - 1] - B * xx[num - 1] - C * Math.pow(xx[num - 1], 2) - D * Math.pow(xx[num - 1], 3);



            var increment = (xx[num] - xx[num - 1]) / steps;

            var temp, tempx;



            for (var j = 0, l = steps; j < l; j++) {

                temp = [];

                tempx = xx[num - 1] + j * increment;

                temp.push(tempx);

                temp.push(A + B * tempx + C * Math.pow(tempx, 2) + D * Math.pow(tempx, 3));

                _smoothedData.push(temp);

                _smoothedPlotData.push([xp(temp[0]), yp(temp[1])]);

            }

        }



        _smoothedData.push(gd[i]);

        _smoothedPlotData.push([xp(gd[i][0]), yp(gd[i][1])]);



        return [_smoothedData, _smoothedPlotData];

    }



    ///////

    // computeHermiteSmoothedData

    // A hermite spline smoothing of the plot data.

    // This implementation is derived from the one posted

    // by krypin on the jqplot-users mailing list:

    //

    // http://groups.google.com/group/jqplot-users/browse_thread/thread/748be6a445723cea?pli=1

    //

    // with a blog post:

    //

    // http://blog.statscollector.com/a-plugin-renderer-for-jqplot-to-draw-a-hermite-spline/

    //

    // and download of the original plugin:

    //

    // http://blog.statscollector.com/wp-content/uploads/2010/02/jqplot.hermiteSplineRenderer.js

    //////////



    // called with scope of series

    function computeHermiteSmoothedData (gd) {

        var smooth = this.renderer.smooth;

        var tension = this.renderer.tension;

        var dim = this.canvas.getWidth();

        var xp = this._xaxis.series_p2u;

        var yp = this._yaxis.series_p2u; 

        var steps =null;

        var _steps = null;

        var a = null;

        var a1 = null;

        var a2 = null;

        var slope = null;

        var slope2 = null;

        var temp = null;

        var t, s, h1, h2, h3, h4;

        var TiX, TiY, Ti1X, Ti1Y;

        var pX, pY, p;

        var sd = [];

        var spd = [];

        var dist = gd.length/dim;

        var min, max, stretch, scale, shift;

        var _smoothedData = [];

        var _smoothedPlotData = [];

        if (!isNaN(parseFloat(smooth))) {

            steps = parseFloat(smooth);

        }

        else {

            steps = getSteps(dist, 0.5);

        }

        if (!isNaN(parseFloat(tension))) {

            tension = parseFloat(tension);

        }



        for (var i=0, l = gd.length-1; i < l; i++) {



            if (tension === null) {

                slope = Math.abs((gd[i+1][1] - gd[i][1]) / (gd[i+1][0] - gd[i][0]));



                min = 0.3;

                max = 0.6;

                stretch = (max - min)/2.0;

                scale = 2.5;

                shift = -1.4;



                temp = slope/scale + shift;



                a1 = stretch * tanh(temp) - stretch * tanh(shift) + min;



                // if have both left and right line segments, will use  minimum tension. 

                if (i > 0) {

                    slope2 = Math.abs((gd[i][1] - gd[i-1][1]) / (gd[i][0] - gd[i-1][0]));

                }

                temp = slope2/scale + shift;



                a2 = stretch * tanh(temp) - stretch * tanh(shift) + min;



                a = (a1 + a2)/2.0;



            }

            else {

                a = tension;

            }

            for (t=0; t < steps; t++) {

                s = t / steps;

                h1 = (1 + 2*s)*Math.pow((1-s),2);

                h2 = s*Math.pow((1-s),2);

                h3 = Math.pow(s,2)*(3-2*s);

                h4 = Math.pow(s,2)*(s-1);     

                

                if (gd[i-1]) {  

                    TiX = a * (gd[i+1][0] - gd[i-1][0]); 

                    TiY = a * (gd[i+1][1] - gd[i-1][1]);

                } else {

                    TiX = a * (gd[i+1][0] - gd[i][0]); 

                    TiY = a * (gd[i+1][1] - gd[i][1]);                                  

                }

                if (gd[i+2]) {  

                    Ti1X = a * (gd[i+2][0] - gd[i][0]); 

                    Ti1Y = a * (gd[i+2][1] - gd[i][1]);

                } else {

                    Ti1X = a * (gd[i+1][0] - gd[i][0]); 

                    Ti1Y = a * (gd[i+1][1] - gd[i][1]);                                 

                }

                

                pX = h1*gd[i][0] + h3*gd[i+1][0] + h2*TiX + h4*Ti1X;

                pY = h1*gd[i][1] + h3*gd[i+1][1] + h2*TiY + h4*Ti1Y;

                p = [pX, pY];



                _smoothedData.push(p);

                _smoothedPlotData.push([xp(pX), yp(pY)]);

            }

        }

        _smoothedData.push(gd[l]);

        _smoothedPlotData.push([xp(gd[l][0]), yp(gd[l][1])]);



        return [_smoothedData, _smoothedPlotData];

    }

    

    // setGridData

    // converts the user data values to grid coordinates and stores them

    // in the gridData array.

    // Called with scope of a series.

    $.jqplot.LineRenderer.prototype.setGridData = function(plot) {

        // recalculate the grid data

        var xp = this._xaxis.series_u2p;

        var yp = this._yaxis.series_u2p;

        var data = this._plotData;

        var pdata = this._prevPlotData;

        this.gridData = [];

        this._prevGridData = [];

        this.renderer._smoothedData = [];

        this.renderer._smoothedPlotData = [];

        this.renderer._hiBandGridData = [];

        this.renderer._lowBandGridData = [];

        this.renderer._hiBandSmoothedData = [];

        this.renderer._lowBandSmoothedData = [];

        var bands = this.renderer.bands;

        var hasNull = false;

        for (var i=0, l=data.length; i < l; i++) {

            // if not a line series or if no nulls in data, push the converted point onto the array.

            if (data[i][0] != null && data[i][1] != null) {

                this.gridData.push([xp.call(this._xaxis, data[i][0]), yp.call(this._yaxis, data[i][1])]);

            }

            // else if there is a null, preserve it.

            else if (data[i][0] == null) {

                hasNull = true;

                this.gridData.push([null, yp.call(this._yaxis, data[i][1])]);

            }

            else if (data[i][1] == null) {

                hasNull = true;

                this.gridData.push([xp.call(this._xaxis, data[i][0]), null]);

            }

            // if not a line series or if no nulls in data, push the converted point onto the array.

            if (pdata[i] != null && pdata[i][0] != null && pdata[i][1] != null) {

                this._prevGridData.push([xp.call(this._xaxis, pdata[i][0]), yp.call(this._yaxis, pdata[i][1])]);

            }

            // else if there is a null, preserve it.

            else if (pdata[i] != null && pdata[i][0] == null) {

                this._prevGridData.push([null, yp.call(this._yaxis, pdata[i][1])]);

            }  

            else if (pdata[i] != null && pdata[i][0] != null && pdata[i][1] == null) {

                this._prevGridData.push([xp.call(this._xaxis, pdata[i][0]), null]);

            }

        }



        // don't do smoothing or bands on broken lines.

        if (hasNull) {

            this.renderer.smooth = false;

            if (this._type === 'line') {

                bands.show = false;

            }

        }



        if (this._type === 'line' && bands.show) {

            for (var i=0, l=bands.hiData.length; i<l; i++) {

                this.renderer._hiBandGridData.push([xp.call(this._xaxis, bands.hiData[i][0]), yp.call(this._yaxis, bands.hiData[i][1])]);

            }

            for (var i=0, l=bands.lowData.length; i<l; i++) {

                this.renderer._lowBandGridData.push([xp.call(this._xaxis, bands.lowData[i][0]), yp.call(this._yaxis, bands.lowData[i][1])]);

            }

        }



        // calculate smoothed data if enough points and no nulls

        if (this._type === 'line' && this.renderer.smooth && this.gridData.length > 2) {

            var ret;

            if (this.renderer.constrainSmoothing) {

                ret = computeConstrainedSmoothedData.call(this, this.gridData);

                this.renderer._smoothedData = ret[0];

                this.renderer._smoothedPlotData = ret[1];



                if (bands.show) {

                    ret = computeConstrainedSmoothedData.call(this, this.renderer._hiBandGridData);

                    this.renderer._hiBandSmoothedData = ret[0];

                    ret = computeConstrainedSmoothedData.call(this, this.renderer._lowBandGridData);

                    this.renderer._lowBandSmoothedData = ret[0];

                }



                ret = null;

            }

            else {

                ret = computeHermiteSmoothedData.call(this, this.gridData);

                this.renderer._smoothedData = ret[0];

                this.renderer._smoothedPlotData = ret[1];



                if (bands.show) {

                    ret = computeHermiteSmoothedData.call(this, this.renderer._hiBandGridData);

                    this.renderer._hiBandSmoothedData = ret[0];

                    ret = computeHermiteSmoothedData.call(this, this.renderer._lowBandGridData);

                    this.renderer._lowBandSmoothedData = ret[0];

                }



                ret = null;

            }

        }

    };

    

    // makeGridData

    // converts any arbitrary data values to grid coordinates and

    // returns them.  This method exists so that plugins can use a series'

    // linerenderer to generate grid data points without overwriting the

    // grid data associated with that series.

    // Called with scope of a series.

    $.jqplot.LineRenderer.prototype.makeGridData = function(data, plot) {

        // recalculate the grid data

        var xp = this._xaxis.series_u2p;

        var yp = this._yaxis.series_u2p;

        var gd = [];

        var pgd = [];

        this.renderer._smoothedData = [];

        this.renderer._smoothedPlotData = [];

        this.renderer._hiBandGridData = [];

        this.renderer._lowBandGridData = [];

        this.renderer._hiBandSmoothedData = [];

        this.renderer._lowBandSmoothedData = [];

        var bands = this.renderer.bands;

        var hasNull = false;

        for (var i=0; i<data.length; i++) {

            // if not a line series or if no nulls in data, push the converted point onto the array.

            if (data[i][0] != null && data[i][1] != null) {

                if (this.step && i>0) {

                    gd.push([xp.call(this._xaxis, data[i][0]), yp.call(this._yaxis, data[i-1][1])]);

                }

                gd.push([xp.call(this._xaxis, data[i][0]), yp.call(this._yaxis, data[i][1])]);

            }

            // else if there is a null, preserve it.

            else if (data[i][0] == null) {

                hasNull = true;

                gd.push([null, yp.call(this._yaxis, data[i][1])]);

            }

            else if (data[i][1] == null) {

                hasNull = true;

                gd.push([xp.call(this._xaxis, data[i][0]), null]);

            }

        }



        // don't do smoothing or bands on broken lines.

        if (hasNull) {

            this.renderer.smooth = false;

            if (this._type === 'line') {

                bands.show = false;

            }

        }



        if (this._type === 'line' && bands.show) {

            for (var i=0, l=bands.hiData.length; i<l; i++) {

                this.renderer._hiBandGridData.push([xp.call(this._xaxis, bands.hiData[i][0]), yp.call(this._yaxis, bands.hiData[i][1])]);

            }

            for (var i=0, l=bands.lowData.length; i<l; i++) {

                this.renderer._lowBandGridData.push([xp.call(this._xaxis, bands.lowData[i][0]), yp.call(this._yaxis, bands.lowData[i][1])]);

            }

        }



        if (this._type === 'line' && this.renderer.smooth && gd.length > 2) {

            var ret;

            if (this.renderer.constrainSmoothing) {

                ret = computeConstrainedSmoothedData.call(this, gd);

                this.renderer._smoothedData = ret[0];

                this.renderer._smoothedPlotData = ret[1];



                if (bands.show) {

                    ret = computeConstrainedSmoothedData.call(this, this.renderer._hiBandGridData);

                    this.renderer._hiBandSmoothedData = ret[0];

                    ret = computeConstrainedSmoothedData.call(this, this.renderer._lowBandGridData);

                    this.renderer._lowBandSmoothedData = ret[0];

                }



                ret = null;

            }

            else {

                ret = computeHermiteSmoothedData.call(this, gd);

                this.renderer._smoothedData = ret[0];

                this.renderer._smoothedPlotData = ret[1];



                if (bands.show) {

                    ret = computeHermiteSmoothedData.call(this, this.renderer._hiBandGridData);

                    this.renderer._hiBandSmoothedData = ret[0];

                    ret = computeHermiteSmoothedData.call(this, this.renderer._lowBandGridData);

                    this.renderer._lowBandSmoothedData = ret[0];

                }



                ret = null;

            }

        }

        return gd;

    };

    



    // called within scope of series.

    $.jqplot.LineRenderer.prototype.draw = function(ctx, gd, options, plot) {

        var i;

        // get a copy of the options, so we don't modify the original object.

        var opts = $.extend(true, {}, options);

        var shadow = (opts.shadow != undefined) ? opts.shadow : this.shadow;

        var showLine = (opts.showLine != undefined) ? opts.showLine : this.showLine;

        var fill = (opts.fill != undefined) ? opts.fill : this.fill;

        var fillAndStroke = (opts.fillAndStroke != undefined) ? opts.fillAndStroke : this.fillAndStroke;

        var xmin, ymin, xmax, ymax;

        ctx.save();

        if (gd.length) {

            if (showLine) {

                // if we fill, we'll have to add points to close the curve.

                if (fill) {

                    if (this.fillToZero) { 

                        // have to break line up into shapes at axis crossings

                        var negativeColor = this.negativeColor;

                        if (! this.useNegativeColors) {

                            negativeColor = opts.fillStyle;

                        }

                        var isnegative = false;

                        var posfs = opts.fillStyle;

                    

                        // if stoking line as well as filling, get a copy of line data.

                        if (fillAndStroke) {

                            var fasgd = gd.slice(0);

                        }

                        // if not stacked, fill down to axis

                        if (this.index == 0 || !this._stack) {

                        

                            var tempgd = [];

                            var pd = (this.renderer.smooth) ? this.renderer._smoothedPlotData : this._plotData;

                            this._areaPoints = [];

                            var pyzero = this._yaxis.series_u2p(this.fillToValue);

                            var pxzero = this._xaxis.series_u2p(this.fillToValue);



                            opts.closePath = true;

                            

                            if (this.fillAxis == 'y') {

                                tempgd.push([gd[0][0], pyzero]);

                                this._areaPoints.push([gd[0][0], pyzero]);

                                

                                for (var i=0; i<gd.length-1; i++) {

                                    tempgd.push(gd[i]);

                                    this._areaPoints.push(gd[i]);

                                    // do we have an axis crossing?

                                    if (pd[i][1] * pd[i+1][1] <= 0) {

                                        if (pd[i][1] < 0) {

                                            isnegative = true;

                                            opts.fillStyle = negativeColor;

                                        }

                                        else {

                                            isnegative = false;

                                            opts.fillStyle = posfs;

                                        }

                                        

                                        var xintercept = gd[i][0] + (gd[i+1][0] - gd[i][0]) * (pyzero-gd[i][1])/(gd[i+1][1] - gd[i][1]);

                                        tempgd.push([xintercept, pyzero]);

                                        this._areaPoints.push([xintercept, pyzero]);

                                        // now draw this shape and shadow.

                                        if (shadow) {

                                            this.renderer.shadowRenderer.draw(ctx, tempgd, opts);

                                        }

                                        this.renderer.shapeRenderer.draw(ctx, tempgd, opts);

                                        // now empty temp array and continue

                                        tempgd = [[xintercept, pyzero]];

                                        // this._areaPoints = [[xintercept, pyzero]];

                                    }   

                                }

                                if (pd[gd.length-1][1] < 0) {

                                    isnegative = true;

                                    opts.fillStyle = negativeColor;

                                }

                                else {

                                    isnegative = false;

                                    opts.fillStyle = posfs;

                                }

                                tempgd.push(gd[gd.length-1]);

                                this._areaPoints.push(gd[gd.length-1]);

                                tempgd.push([gd[gd.length-1][0], pyzero]); 

                                this._areaPoints.push([gd[gd.length-1][0], pyzero]); 

                            }

                            // now draw the last area.

                            if (shadow) {

                                this.renderer.shadowRenderer.draw(ctx, tempgd, opts);

                            }

                            this.renderer.shapeRenderer.draw(ctx, tempgd, opts);

                            

                            

                            // var gridymin = this._yaxis.series_u2p(0);

                            // // IE doesn't return new length on unshift

                            // gd.unshift([gd[0][0], gridymin]);

                            // len = gd.length;

                            // gd.push([gd[len - 1][0], gridymin]);                   

                        }

                        // if stacked, fill to line below 

                        else {

                            var prev = this._prevGridData;

                            for (var i=prev.length; i>0; i--) {

                                gd.push(prev[i-1]);

                                // this._areaPoints.push(prev[i-1]);

                            }

                            if (shadow) {

                                this.renderer.shadowRenderer.draw(ctx, gd, opts);

                            }

                            this._areaPoints = gd;

                            this.renderer.shapeRenderer.draw(ctx, gd, opts);

                        }

                    }

                    /////////////////////////

                    // Not filled to zero

                    ////////////////////////

                    else {                    

                        // if stoking line as well as filling, get a copy of line data.

                        if (fillAndStroke) {

                            var fasgd = gd.slice(0);

                        }

                        // if not stacked, fill down to axis

                        if (this.index == 0 || !this._stack) {

                            // var gridymin = this._yaxis.series_u2p(this._yaxis.min) - this.gridBorderWidth / 2;

                            var gridymin = ctx.canvas.height;

                            // IE doesn't return new length on unshift

                            gd.unshift([gd[0][0], gridymin]);

                            var len = gd.length;

                            gd.push([gd[len - 1][0], gridymin]);                   

                        }

                        // if stacked, fill to line below 

                        else {

                            var prev = this._prevGridData;

                            for (var i=prev.length; i>0; i--) {

                                gd.push(prev[i-1]);

                            }

                        }

                        this._areaPoints = gd;

                        

                        if (shadow) {

                            this.renderer.shadowRenderer.draw(ctx, gd, opts);

                        }

            

                        this.renderer.shapeRenderer.draw(ctx, gd, opts);                        

                    }

                    if (fillAndStroke) {

                        var fasopts = $.extend(true, {}, opts, {fill:false, closePath:false});

                        this.renderer.shapeRenderer.draw(ctx, fasgd, fasopts);

                        //////////

                        // TODO: figure out some way to do shadows nicely

                        // if (shadow) {

                        //     this.renderer.shadowRenderer.draw(ctx, fasgd, fasopts);

                        // }

                        // now draw the markers

                        if (this.markerRenderer.show) {

                            if (this.renderer.smooth) {

                                fasgd = this.gridData;

                            }

                            for (i=0; i<fasgd.length; i++) {

                                this.markerRenderer.draw(fasgd[i][0], fasgd[i][1], ctx, opts.markerOptions);

                            }

                        }

                    }

                }

                else {



                    if (this.renderer.bands.show) {

                        var bdat;

                        var bopts = $.extend(true, {}, opts);

                        if (this.renderer.bands.showLines) {

                            bdat = (this.renderer.smooth) ? this.renderer._hiBandSmoothedData : this.renderer._hiBandGridData;

                            this.renderer.shapeRenderer.draw(ctx, bdat, opts);

                            bdat = (this.renderer.smooth) ? this.renderer._lowBandSmoothedData : this.renderer._lowBandGridData;

                            this.renderer.shapeRenderer.draw(ctx, bdat, bopts);

                        }



                        if (this.renderer.bands.fill) {

                            if (this.renderer.smooth) {

                                bdat = this.renderer._hiBandSmoothedData.concat(this.renderer._lowBandSmoothedData.reverse());

                            }

                            else {

                                bdat = this.renderer._hiBandGridData.concat(this.renderer._lowBandGridData.reverse());

                            }

                            this._areaPoints = bdat;

                            bopts.closePath = true;

                            bopts.fill = true;

                            bopts.fillStyle = this.renderer.bands.fillColor;

                            this.renderer.shapeRenderer.draw(ctx, bdat, bopts);

                        }

                    }



                    if (shadow) {

                        this.renderer.shadowRenderer.draw(ctx, gd, opts);

                    }

    

                    this.renderer.shapeRenderer.draw(ctx, gd, opts);

                }

            }

            // calculate the bounding box

            var xmin = xmax = ymin = ymax = null;

            for (i=0; i<this._areaPoints.length; i++) {

                var p = this._areaPoints[i];

                if (xmin > p[0] || xmin == null) {

                    xmin = p[0];

                }

                if (ymax < p[1] || ymax == null) {

                    ymax = p[1];

                }

                if (xmax < p[0] || xmax == null) {

                    xmax = p[0];

                }

                if (ymin > p[1] || ymin == null) {

                    ymin = p[1];

                }

            }



            if (this.type === 'line' && this.renderer.bands.show) {

                ymax = this._yaxis.series_u2p(this.renderer.bands._min);

                ymin = this._yaxis.series_u2p(this.renderer.bands._max);

            }



            this._boundingBox = [[xmin, ymax], [xmax, ymin]];

        

            // now draw the markers

            if (this.markerRenderer.show && !fill) {

                if (this.renderer.smooth) {

                    gd = this.gridData;

                }

                for (i=0; i<gd.length; i++) {

                    if (gd[i][0] != null && gd[i][1] != null) {

                        this.markerRenderer.draw(gd[i][0], gd[i][1], ctx, opts.markerOptions);

                    }

                }

            }

        }

        

        ctx.restore();

    };  

    

    $.jqplot.LineRenderer.prototype.drawShadow = function(ctx, gd, options) {

        // This is a no-op, shadows drawn with lines.

    };

    

    // called with scope of plot.

    // make sure to not leave anything highlighted.

    function postInit(target, data, options) {

        for (var i=0; i<this.series.length; i++) {

            if (this.series[i].renderer.constructor == $.jqplot.LineRenderer) {

                // don't allow mouseover and mousedown at same time.

                if (this.series[i].highlightMouseOver) {

                    this.series[i].highlightMouseDown = false;

                }

            }

        }

    }  

    

    // called within context of plot

    // create a canvas which we can draw on.

    // insert it before the eventCanvas, so eventCanvas will still capture events.

    function postPlotDraw() {

        // Memory Leaks patch    

        if (this.plugins.lineRenderer && this.plugins.lineRenderer.highlightCanvas) {

          this.plugins.lineRenderer.highlightCanvas.resetCanvas();

          this.plugins.lineRenderer.highlightCanvas = null;

        }

        

        this.plugins.lineRenderer.highlightedSeriesIndex = null;

        this.plugins.lineRenderer.highlightCanvas = new $.jqplot.GenericCanvas();

        

        this.eventCanvas._elem.before(this.plugins.lineRenderer.highlightCanvas.createElement(this._gridPadding, 'jqplot-lineRenderer-highlight-canvas', this._plotDimensions, this));

        this.plugins.lineRenderer.highlightCanvas.setContext();

        this.eventCanvas._elem.bind('mouseleave', {plot:this}, function (ev) { unhighlight(ev.data.plot); });

    } 

    

    function highlight (plot, sidx, pidx, points) {

        var s = plot.series[sidx];

        var canvas = plot.plugins.lineRenderer.highlightCanvas;

        canvas._ctx.clearRect(0,0,canvas._ctx.canvas.width, canvas._ctx.canvas.height);

        s._highlightedPoint = pidx;

        plot.plugins.lineRenderer.highlightedSeriesIndex = sidx;

        var opts = {fillStyle: s.highlightColor};

        if (s.type === 'line' && s.renderer.bands.show) {

            opts.fill = true;

            opts.closePath = true;

        }

        s.renderer.shapeRenderer.draw(canvas._ctx, points, opts);

        canvas = null;

    }

    

    function unhighlight (plot) {

        var canvas = plot.plugins.lineRenderer.highlightCanvas;

        canvas._ctx.clearRect(0,0, canvas._ctx.canvas.width, canvas._ctx.canvas.height);

        for (var i=0; i<plot.series.length; i++) {

            plot.series[i]._highlightedPoint = null;

        }

        plot.plugins.lineRenderer.highlightedSeriesIndex = null;

        plot.target.trigger('jqplotDataUnhighlight');

        canvas = null;

    }

    

    

    function handleMove(ev, gridpos, datapos, neighbor, plot) {

        if (neighbor) {

            var ins = [neighbor.seriesIndex, neighbor.pointIndex, neighbor.data];

            var evt1 = jQuery.Event('jqplotDataMouseOver');

            evt1.pageX = ev.pageX;

            evt1.pageY = ev.pageY;

            plot.target.trigger(evt1, ins);

            if (plot.series[ins[0]].highlightMouseOver && !(ins[0] == plot.plugins.lineRenderer.highlightedSeriesIndex)) {

                var evt = jQuery.Event('jqplotDataHighlight');

                evt.which = ev.which;

                evt.pageX = ev.pageX;

                evt.pageY = ev.pageY;

                plot.target.trigger(evt, ins);

                highlight (plot, neighbor.seriesIndex, neighbor.pointIndex, neighbor.points);

            }

        }

        else if (neighbor == null) {

            unhighlight (plot);

        }

    }

    

    function handleMouseDown(ev, gridpos, datapos, neighbor, plot) {

        if (neighbor) {

            var ins = [neighbor.seriesIndex, neighbor.pointIndex, neighbor.data];

            if (plot.series[ins[0]].highlightMouseDown && !(ins[0] == plot.plugins.lineRenderer.highlightedSeriesIndex)) {

                var evt = jQuery.Event('jqplotDataHighlight');

                evt.which = ev.which;

                evt.pageX = ev.pageX;

                evt.pageY = ev.pageY;

                plot.target.trigger(evt, ins);

                highlight (plot, neighbor.seriesIndex, neighbor.pointIndex, neighbor.points);

            }

        }

        else if (neighbor == null) {

            unhighlight (plot);

        }

    }

    

    function handleMouseUp(ev, gridpos, datapos, neighbor, plot) {

        var idx = plot.plugins.lineRenderer.highlightedSeriesIndex;

        if (idx != null && plot.series[idx].highlightMouseDown) {

            unhighlight(plot);

        }

    }

    

    function handleClick(ev, gridpos, datapos, neighbor, plot) {

        if (neighbor) {

            var ins = [neighbor.seriesIndex, neighbor.pointIndex, neighbor.data];

            var evt = jQuery.Event('jqplotDataClick');

            evt.which = ev.which;

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            plot.target.trigger(evt, ins);

        }

    }

    

    function handleRightClick(ev, gridpos, datapos, neighbor, plot) {

        if (neighbor) {

            var ins = [neighbor.seriesIndex, neighbor.pointIndex, neighbor.data];

            var idx = plot.plugins.lineRenderer.highlightedSeriesIndex;

            if (idx != null && plot.series[idx].highlightMouseDown) {

                unhighlight(plot);

            }

            var evt = jQuery.Event('jqplotDataRightClick');

            evt.which = ev.which;

            evt.pageX = ev.pageX;

            evt.pageY = ev.pageY;

            plot.target.trigger(evt, ins);

        }

    }

    

    

    // class: $.jqplot.LinearAxisRenderer

    // The default jqPlot axis renderer, creating a numeric axis.

    $.jqplot.LinearAxisRenderer = function() {

    };

    

    // called with scope of axis object.

    $.jqplot.LinearAxisRenderer.prototype.init = function(options){

        // prop: breakPoints

        // EXPERIMENTAL!! Use at your own risk!

        // Works only with linear axes and the default tick renderer.

        // Array of [start, stop] points to create a broken axis.

        // Broken axes have a "jump" in them, which is an immediate 

        // transition from a smaller value to a larger value.

        // Currently, axis ticks MUST be manually assigned if using breakPoints

        // by using the axis ticks array option.

        this.breakPoints = null;

        // prop: breakTickLabel

        // Label to use at the axis break if breakPoints are specified.

        this.breakTickLabel = "&asymp;";

        // prop: drawBaseline

        // True to draw the axis baseline.

        this.drawBaseline = true;

        // prop: baselineWidth

        // width of the baseline in pixels.

        this.baselineWidth = null;

        // prop: baselineColor

        // CSS color spec for the baseline.

        this.baselineColor = null;

        // prop: forceTickAt0

        // This will ensure that there is always a tick mark at 0.

        // If data range is strictly positive or negative,

        // this will force 0 to be inside the axis bounds unless

        // the appropriate axis pad (pad, padMin or padMax) is set

        // to 0, then this will force an axis min or max value at 0.

        // This has know effect when any of the following options

        // are set:  autoscale, min, max, numberTicks or tickInterval.

        this.forceTickAt0 = false;

        // prop: forceTickAt100

        // This will ensure that there is always a tick mark at 100.

        // If data range is strictly above or below 100,

        // this will force 100 to be inside the axis bounds unless

        // the appropriate axis pad (pad, padMin or padMax) is set

        // to 0, then this will force an axis min or max value at 100.

        // This has know effect when any of the following options

        // are set:  autoscale, min, max, numberTicks or tickInterval.

        this.forceTickAt100 = false;

        // prop: tickInset

        // Controls the amount to inset the first and last ticks from 

        // the edges of the grid, in multiples of the tick interval.

        // 0 is no inset, 0.5 is one half a tick interval, 1 is a full

        // tick interval, etc.

        this.tickInset = 0;

        // prop: minorTicks

        // Number of ticks to add between "major" ticks.

        // Major ticks are ticks supplied by user or auto computed.

        // Minor ticks cannot be created by user.

        this.minorTicks = 0;

        // prop: alignTicks

        // true to align tick marks across opposed axes

        // such as from the y2axis to yaxis.

        this.alignTicks = false;

        this._autoFormatString = '';

        this._overrideFormatString = false;

        this._scalefact = 1.0;

        $.extend(true, this, options);

        if (this.breakPoints) {

            if (!$.isArray(this.breakPoints)) {

                this.breakPoints = null;

            }

            else if (this.breakPoints.length < 2 || this.breakPoints[1] <= this.breakPoints[0]) {

                this.breakPoints = null;

            }

        }

        if (this.numberTicks != null && this.numberTicks < 2) {

            this.numberTicks = 2;

        }

        this.resetDataBounds();

    };

    

    // called with scope of axis

    $.jqplot.LinearAxisRenderer.prototype.draw = function(ctx, plot) {

        if (this.show) {

            // populate the axis label and value properties.

            // createTicks is a method on the renderer, but

            // call it within the scope of the axis.

            this.renderer.createTicks.call(this, plot);

            // fill a div with axes labels in the right direction.

            // Need to pregenerate each axis to get its bounds and

            // position it and the labels correctly on the plot.

            var dim=0;

            var temp;

            // Added for theming.

            if (this._elem) {

                // Memory Leaks patch

                //this._elem.empty();

                this._elem.emptyForce();

                this._elem = null;

            }

            

            this._elem = $(document.createElement('div'));

            this._elem.addClass('jqplot-axis jqplot-'+this.name);

            this._elem.css('position', 'absolute');



            

            if (this.name == 'xaxis' || this.name == 'x2axis') {

                this._elem.width(this._plotDimensions.width);

            }

            else {

                this._elem.height(this._plotDimensions.height);

            }

            

            // create a _label object.

            this.labelOptions.axis = this.name;

            this._label = new this.labelRenderer(this.labelOptions);

            if (this._label.show) {

                var elem = this._label.draw(ctx, plot);

                elem.appendTo(this._elem);

                elem = null;

            }

    

            var t = this._ticks;

            var tick;

            for (var i=0; i<t.length; i++) {

                tick = t[i];

                if (tick.show && tick.showLabel && (!tick.isMinorTick || this.showMinorTicks)) {

                    this._elem.append(tick.draw(ctx, plot));

                }

            }

            tick = null;

            t = null;

        }

        return this._elem;

    };

    

    // called with scope of an axis

    $.jqplot.LinearAxisRenderer.prototype.reset = function() {

        this.min = this._options.min;

        this.max = this._options.max;

        this.tickInterval = this._options.tickInterval;

        this.numberTicks = this._options.numberTicks;

        this._autoFormatString = '';

        if (this._overrideFormatString && this.tickOptions && this.tickOptions.formatString) {

            this.tickOptions.formatString = '';

        }



        // this._ticks = this.__ticks;

    };

    

    // called with scope of axis

    $.jqplot.LinearAxisRenderer.prototype.set = function() { 

        var dim = 0;

        var temp;

        var w = 0;

        var h = 0;

        var lshow = (this._label == null) ? false : this._label.show;

        if (this.show) {

            var t = this._ticks;

            var tick;

            for (var i=0; i<t.length; i++) {

                tick = t[i];

                if (!tick._breakTick && tick.show && tick.showLabel && (!tick.isMinorTick || this.showMinorTicks)) {

                    if (this.name == 'xaxis' || this.name == 'x2axis') {

                        temp = tick._elem.outerHeight(true);

                    }

                    else {

                        temp = tick._elem.outerWidth(true);

                    }

                    if (temp > dim) {

                        dim = temp;

                    }

                }

            }

            tick = null;

            t = null;

            

            if (lshow) {

                w = this._label._elem.outerWidth(true);

                h = this._label._elem.outerHeight(true); 

            }

            if (this.name == 'xaxis') {

                dim = dim + h;

                this._elem.css({'height':dim+'px', left:'0px', bottom:'0px'});

            }

            else if (this.name == 'x2axis') {

                dim = dim + h;

                this._elem.css({'height':dim+'px', left:'0px', top:'0px'});

            }

            else if (this.name == 'yaxis') {

                dim = dim + w;

                this._elem.css({'width':dim+'px', left:'0px', top:'0px'});

                if (lshow && this._label.constructor == $.jqplot.AxisLabelRenderer) {

                    this._label._elem.css('width', w+'px');

                }

            }

            else {

                dim = dim + w;

                this._elem.css({'width':dim+'px', right:'0px', top:'0px'});

                if (lshow && this._label.constructor == $.jqplot.AxisLabelRenderer) {

                    this._label._elem.css('width', w+'px');

                }

            }

        }  

    };    

    

    // called with scope of axis

    $.jqplot.LinearAxisRenderer.prototype.createTicks = function(plot) {

        // we're are operating on an axis here

        var ticks = this._ticks;

        var userTicks = this.ticks;

        var name = this.name;

        // databounds were set on axis initialization.

        var db = this._dataBounds;

        var dim = (this.name.charAt(0) === 'x') ? this._plotDimensions.width : this._plotDimensions.height;

        var interval;

        var min, max;

        var pos1, pos2;

        var tt, i;

        // get a copy of user's settings for min/max.

        var userMin = this.min;

        var userMax = this.max;

        var userNT = this.numberTicks;

        var userTI = this.tickInterval;



        var threshold = 30;

        this._scalefact =  (Math.max(dim, threshold+1) - threshold)/300.0;

        

        // if we already have ticks, use them.

        // ticks must be in order of increasing value.

        

        if (userTicks.length) {

            // ticks could be 1D or 2D array of [val, val, ,,,] or [[val, label], [val, label], ...] or mixed

            for (i=0; i<userTicks.length; i++){

                var ut = userTicks[i];

                var t = new this.tickRenderer(this.tickOptions);

                if ($.isArray(ut)) {

                    t.value = ut[0];

                    if (this.breakPoints) {

                        if (ut[0] == this.breakPoints[0]) {

                            t.label = this.breakTickLabel;

                            t._breakTick = true;

                            t.showGridline = false;

                            t.showMark = false;

                        }

                        else if (ut[0] > this.breakPoints[0] && ut[0] <= this.breakPoints[1]) {

                            t.show = false;

                            t.showGridline = false;

                            t.label = ut[1];

                        }

                        else {

                            t.label = ut[1];

                        }

                    }

                    else {

                        t.label = ut[1];

                    }

                    t.setTick(ut[0], this.name);

                    this._ticks.push(t);

                }



                else if ($.isPlainObject(ut)) {

                    $.extend(true, t, ut);

                    t.axis = this.name;

                    this._ticks.push(t);

                }

                

                else {

                    t.value = ut;

                    if (this.breakPoints) {

                        if (ut == this.breakPoints[0]) {

                            t.label = this.breakTickLabel;

                            t._breakTick = true;

                            t.showGridline = false;

                            t.showMark = false;

                        }

                        else if (ut > this.breakPoints[0] && ut <= this.breakPoints[1]) {

                            t.show = false;

                            t.showGridline = false;

                        }

                    }

                    t.setTick(ut, this.name);

                    this._ticks.push(t);

                }

            }

            this.numberTicks = userTicks.length;

            this.min = this._ticks[0].value;

            this.max = this._ticks[this.numberTicks-1].value;

            this.tickInterval = (this.max - this.min) / (this.numberTicks - 1);

        }

        

        // we don't have any ticks yet, let's make some!

        else {

            if (name == 'xaxis' || name == 'x2axis') {

                dim = this._plotDimensions.width;

            }

            else {

                dim = this._plotDimensions.height;

            }



            var _numberTicks = this.numberTicks;



            // if aligning this axis, use number of ticks from previous axis.

            // Do I need to reset somehow if alignTicks is changed and then graph is replotted??

            if (this.alignTicks) {

                if (this.name === 'x2axis' && plot.axes.xaxis.show) {

                    _numberTicks = plot.axes.xaxis.numberTicks;

                }

                else if (this.name.charAt(0) === 'y' && this.name !== 'yaxis' && this.name !== 'yMidAxis' && plot.axes.yaxis.show) {

                    _numberTicks = plot.axes.yaxis.numberTicks;

                }

            }

        

            min = ((this.min != null) ? this.min : db.min);

            max = ((this.max != null) ? this.max : db.max);



            var range = max - min;

            var rmin, rmax;

            var temp;



            if (this.tickOptions == null || !this.tickOptions.formatString) {

                this._overrideFormatString = true;

            }



            // Doing complete autoscaling

            if (this.min == null || this.max == null && this.tickInterval == null && !this.autoscale) {

                // Check if user must have tick at 0 or 100 and ensure they are in range.

                // The autoscaling algorithm will always place ticks at 0 and 100 if they are in range.

                if (this.forceTickAt0) {

                    if (min > 0) {

                        min = 0;

                    }

                    if (max < 0) {

                        max = 0;

                    }

                }



                if (this.forceTickAt100) {

                    if (min > 100) {

                        min = 100;

                    }

                    if (max < 100) {

                        max = 100;

                    }

                }



                var keepMin = false,

                    keepMax = false;



                if (this.min != null) {

                    keepMin = true;

                }



                else if (this.max != null) {

                    keepMax = true;

                }



                // var threshold = 30;

                // var tdim = Math.max(dim, threshold+1);

                // this._scalefact =  (tdim-threshold)/300.0;

                var ret = $.jqplot.LinearTickGenerator(min, max, this._scalefact, _numberTicks, keepMin, keepMax); 

                // calculate a padded max and min, points should be less than these

                // so that they aren't too close to the edges of the plot.

                // User can adjust how much padding is allowed with pad, padMin and PadMax options. 

                // If min or max is set, don't pad that end of axis.

                var tumin = (this.min != null) ? min : min + range*(this.padMin - 1);

                var tumax = (this.max != null) ? max : max - range*(this.padMax - 1);



                // if they're equal, we shouldn't have to do anything, right?

                // if (min <=tumin || max >= tumax) {

                if (min <tumin || max > tumax) {

                    tumin = (this.min != null) ? min : min - range*(this.padMin - 1);

                    tumax = (this.max != null) ? max : max + range*(this.padMax - 1);

                    ret = $.jqplot.LinearTickGenerator(tumin, tumax, this._scalefact, _numberTicks, keepMin, keepMax);

                }



                this.min = ret[0];

                this.max = ret[1];

                // if numberTicks specified, it should return the same.

                this.numberTicks = ret[2];

                this._autoFormatString = ret[3];

                this.tickInterval = ret[4];

            }



            // User has specified some axis scale related option, can use auto algorithm

            else {

                

                // if min and max are same, space them out a bit

                if (min == max) {

                    var adj = 0.05;

                    if (min > 0) {

                        adj = Math.max(Math.log(min)/Math.LN10, 0.05);

                    }

                    min -= adj;

                    max += adj;

                }

                

                // autoscale.  Can't autoscale if min or max is supplied.

                // Will use numberTicks and tickInterval if supplied.  Ticks

                // across multiple axes may not line up depending on how

                // bars are to be plotted.

                if (this.autoscale && this.min == null && this.max == null) {

                    var rrange, ti, margin;

                    var forceMinZero = false;

                    var forceZeroLine = false;

                    var intervals = {min:null, max:null, average:null, stddev:null};

                    // if any series are bars, or if any are fill to zero, and if this

                    // is the axis to fill toward, check to see if we can start axis at zero.

                    for (var i=0; i<this._series.length; i++) {

                        var s = this._series[i];

                        var faname = (s.fillAxis == 'x') ? s._xaxis.name : s._yaxis.name;

                        // check to see if this is the fill axis

                        if (this.name == faname) {

                            var vals = s._plotValues[s.fillAxis];

                            var vmin = vals[0];

                            var vmax = vals[0];

                            for (var j=1; j<vals.length; j++) {

                                if (vals[j] < vmin) {

                                    vmin = vals[j];

                                }

                                else if (vals[j] > vmax) {

                                    vmax = vals[j];

                                }

                            }

                            var dp = (vmax - vmin) / vmax;

                            // is this sries a bar?

                            if (s.renderer.constructor == $.jqplot.BarRenderer) {

                                // if no negative values and could also check range.

                                if (vmin >= 0 && (s.fillToZero || dp > 0.1)) {

                                    forceMinZero = true;

                                }

                                else {

                                    forceMinZero = false;

                                    if (s.fill && s.fillToZero && vmin < 0 && vmax > 0) {

                                        forceZeroLine = true;

                                    }

                                    else {

                                        forceZeroLine = false;

                                    }

                                }

                            }

                            

                            // if not a bar and filling, use appropriate method.

                            else if (s.fill) {

                                if (vmin >= 0 && (s.fillToZero || dp > 0.1)) {

                                    forceMinZero = true;

                                }

                                else if (vmin < 0 && vmax > 0 && s.fillToZero) {

                                    forceMinZero = false;

                                    forceZeroLine = true;

                                }

                                else {

                                    forceMinZero = false;

                                    forceZeroLine = false;

                                }

                            }

                            

                            // if not a bar and not filling, only change existing state

                            // if it doesn't make sense

                            else if (vmin < 0) {

                                forceMinZero = false;

                            }

                        }

                    }

                    

                    // check if we need make axis min at 0.

                    if (forceMinZero) {

                        // compute number of ticks

                        this.numberTicks = 2 + Math.ceil((dim-(this.tickSpacing-1))/this.tickSpacing);

                        this.min = 0;

                        userMin = 0;

                        // what order is this range?

                        // what tick interval does that give us?

                        ti = max/(this.numberTicks-1);

                        temp = Math.pow(10, Math.abs(Math.floor(Math.log(ti)/Math.LN10)));

                        if (ti/temp == parseInt(ti/temp, 10)) {

                            ti += temp;

                        }

                        this.tickInterval = Math.ceil(ti/temp) * temp;

                        this.max = this.tickInterval * (this.numberTicks - 1);

                    }

                    

                    // check if we need to make sure there is a tick at 0.

                    else if (forceZeroLine) {

                        // compute number of ticks

                        this.numberTicks = 2 + Math.ceil((dim-(this.tickSpacing-1))/this.tickSpacing);

                        var ntmin = Math.ceil(Math.abs(min)/range*(this.numberTicks-1));

                        var ntmax = this.numberTicks - 1  - ntmin;

                        ti = Math.max(Math.abs(min/ntmin), Math.abs(max/ntmax));

                        temp = Math.pow(10, Math.abs(Math.floor(Math.log(ti)/Math.LN10)));

                        this.tickInterval = Math.ceil(ti/temp) * temp;

                        this.max = this.tickInterval * ntmax;

                        this.min = -this.tickInterval * ntmin;

                    }

                    

                    // if nothing else, do autoscaling which will try to line up ticks across axes.

                    else {  

                        if (this.numberTicks == null){

                            if (this.tickInterval) {

                                this.numberTicks = 3 + Math.ceil(range / this.tickInterval);

                            }

                            else {

                                this.numberTicks = 2 + Math.ceil((dim-(this.tickSpacing-1))/this.tickSpacing);

                            }

                        }

                

                        if (this.tickInterval == null) {

                            // get a tick interval

                            ti = range/(this.numberTicks - 1);



                            if (ti < 1) {

                                temp = Math.pow(10, Math.abs(Math.floor(Math.log(ti)/Math.LN10)));

                            }

                            else {

                                temp = 1;

                            }

                            this.tickInterval = Math.ceil(ti*temp*this.pad)/temp;

                        }

                        else {

                            temp = 1 / this.tickInterval;

                        }

                        

                        // try to compute a nicer, more even tick interval

                        // temp = Math.pow(10, Math.floor(Math.log(ti)/Math.LN10));

                        // this.tickInterval = Math.ceil(ti/temp) * temp;

                        rrange = this.tickInterval * (this.numberTicks - 1);

                        margin = (rrange - range)/2;

           

                        if (this.min == null) {

                            this.min = Math.floor(temp*(min-margin))/temp;

                        }

                        if (this.max == null) {

                            this.max = this.min + rrange;

                        }

                    }



                    // Compute a somewhat decent format string if it is needed.

                    // get precision of interval and determine a format string.

                    var sf = $.jqplot.getSignificantFigures(this.tickInterval);



                    var fstr;



                    // if we have only a whole number, use integer formatting

                    if (sf.digitsLeft >= sf.significantDigits) {

                        fstr = '%d';

                    }



                    else {

                        var temp = Math.max(0, 5 - sf.digitsLeft);

                        temp = Math.min(temp, sf.digitsRight);

                        fstr = '%.'+ temp + 'f';

                    }



                    this._autoFormatString = fstr;

                }

                

                // Use the default algorithm which pads each axis to make the chart

                // centered nicely on the grid.

                else {



                    rmin = (this.min != null) ? this.min : min - range*(this.padMin - 1);

                    rmax = (this.max != null) ? this.max : max + range*(this.padMax - 1);

                    range = rmax - rmin;

        

                    if (this.numberTicks == null){

                        // if tickInterval is specified by user, we will ignore computed maximum.

                        // max will be equal or greater to fit even # of ticks.

                        if (this.tickInterval != null) {

                            this.numberTicks = Math.ceil((rmax - rmin)/this.tickInterval)+1;

                        }

                        else if (dim > 100) {

                            this.numberTicks = parseInt(3+(dim-100)/75, 10);

                        }

                        else {

                            this.numberTicks = 2;

                        }

                    }

                

                    if (this.tickInterval == null) {

                        this.tickInterval = range / (this.numberTicks-1);

                    }

                    

                    if (this.max == null) {

                        rmax = rmin + this.tickInterval*(this.numberTicks - 1);

                    }        

                    if (this.min == null) {

                        rmin = rmax - this.tickInterval*(this.numberTicks - 1);

                    }



                    // get precision of interval and determine a format string.

                    var sf = $.jqplot.getSignificantFigures(this.tickInterval);



                    var fstr;



                    // if we have only a whole number, use integer formatting

                    if (sf.digitsLeft >= sf.significantDigits) {

                        fstr = '%d';

                    }



                    else {

                        var temp = Math.max(0, 5 - sf.digitsLeft);

                        temp = Math.min(temp, sf.digitsRight);

                        fstr = '%.'+ temp + 'f';

                    }





                    this._autoFormatString = fstr;



                    this.min = rmin;

                    this.max = rmax;

                }

                

                if (this.renderer.constructor == $.jqplot.LinearAxisRenderer && this._autoFormatString == '') {

                    // fix for misleading tick display with small range and low precision.

                    range = this.max - this.min;

                    // figure out precision

                    var temptick = new this.tickRenderer(this.tickOptions);

                    // use the tick formatString or, the default.

                    var fs = temptick.formatString || $.jqplot.config.defaultTickFormatString; 

                    var fs = fs.match($.jqplot.sprintf.regex)[0];

                    var precision = 0;

                    if (fs) {

                        if (fs.search(/[fFeEgGpP]/) > -1) {

                            var m = fs.match(/\%\.(\d{0,})?[eEfFgGpP]/);

                            if (m) {

                                precision = parseInt(m[1], 10);

                            }

                            else {

                                precision = 6;

                            }

                        }

                        else if (fs.search(/[di]/) > -1) {

                            precision = 0;

                        }

                        // fact will be <= 1;

                        var fact = Math.pow(10, -precision);

                        if (this.tickInterval < fact) {

                            // need to correct underrange

                            if (userNT == null && userTI == null) {

                                this.tickInterval = fact;

                                if (userMax == null && userMin == null) {

                                    // this.min = Math.floor((this._dataBounds.min - this.tickInterval)/fact) * fact;

                                    this.min = Math.floor(this._dataBounds.min/fact) * fact;

                                    if (this.min == this._dataBounds.min) {

                                        this.min = this._dataBounds.min - this.tickInterval;

                                    }

                                    // this.max = Math.ceil((this._dataBounds.max + this.tickInterval)/fact) * fact;

                                    this.max = Math.ceil(this._dataBounds.max/fact) * fact;

                                    if (this.max == this._dataBounds.max) {

                                        this.max = this._dataBounds.max + this.tickInterval;

                                    }

                                    var n = (this.max - this.min)/this.tickInterval;

                                    n = n.toFixed(11);

                                    n = Math.ceil(n);

                                    this.numberTicks = n + 1;

                                }

                                else if (userMax == null) {

                                    // add one tick for top of range.

                                    var n = (this._dataBounds.max - this.min) / this.tickInterval;

                                    n = n.toFixed(11);

                                    this.numberTicks = Math.ceil(n) + 2;

                                    this.max = this.min + this.tickInterval * (this.numberTicks-1);

                                }

                                else if (userMin == null) {

                                    // add one tick for bottom of range.

                                    var n = (this.max - this._dataBounds.min) / this.tickInterval;

                                    n = n.toFixed(11);

                                    this.numberTicks = Math.ceil(n) + 2;

                                    this.min = this.max - this.tickInterval * (this.numberTicks-1);

                                }

                                else {

                                    // calculate a number of ticks so max is within axis scale

                                    this.numberTicks = Math.ceil((userMax - userMin)/this.tickInterval) + 1;

                                    // if user's min and max don't fit evenly in ticks, adjust.

                                    // This takes care of cases such as user min set to 0, max set to 3.5 but tick

                                    // format string set to %d (integer ticks)

                                    this.min =  Math.floor(userMin*Math.pow(10, precision))/Math.pow(10, precision);

                                    this.max =  Math.ceil(userMax*Math.pow(10, precision))/Math.pow(10, precision);

                                    // this.max = this.min + this.tickInterval*(this.numberTicks-1);

                                    this.numberTicks = Math.ceil((this.max - this.min)/this.tickInterval) + 1;

                                }

                            }

                        }

                    }

                }

                

            }

            

            if (this._overrideFormatString && this._autoFormatString != '') {

                this.tickOptions = this.tickOptions || {};

                this.tickOptions.formatString = this._autoFormatString;

            }



            var t, to;

            for (var i=0; i<this.numberTicks; i++){

                tt = this.min + i * this.tickInterval;

                t = new this.tickRenderer(this.tickOptions);

                // var t = new $.jqplot.AxisTickRenderer(this.tickOptions);



                t.setTick(tt, this.name);

                this._ticks.push(t);



                if (i < this.numberTicks - 1) {

                    for (var j=0; j<this.minorTicks; j++) {

                        tt += this.tickInterval/(this.minorTicks+1);

                        to = $.extend(true, {}, this.tickOptions, {name:this.name, value:tt, label:'', isMinorTick:true});

                        t = new this.tickRenderer(to);

                        this._ticks.push(t);

                    }

                }

                t = null;

            }

        }



        if (this.tickInset) {

            this.min = this.min - this.tickInset * this.tickInterval;

            this.max = this.max + this.tickInset * this.tickInterval;

        }



        ticks = null;

    };

    

    // Used to reset just the values of the ticks and then repack, which will

    // recalculate the positioning functions.  It is assuemd that the 

    // number of ticks is the same and the values of the new array are at the

    // proper interval.

    // This method needs to be called with the scope of an axis object, like:

    //

    // > plot.axes.yaxis.renderer.resetTickValues.call(plot.axes.yaxis, yarr);

    //

    $.jqplot.LinearAxisRenderer.prototype.resetTickValues = function(opts) {

        if ($.isArray(opts) && opts.length == this._ticks.length) {

            var t;

            for (var i=0; i<opts.length; i++) {

                t = this._ticks[i];

                t.value = opts[i];

                t.label = t.formatter(t.formatString, opts[i]);

                t.label = t.prefix + t.label;

                t._elem.html(t.label);

            }

            t = null;

            this.min = $.jqplot.arrayMin(opts);

            this.max = $.jqplot.arrayMax(opts);

            this.pack();

        }

        // Not implemented yet.

        // else if ($.isPlainObject(opts)) {

        // 

        // }

    };

    

    // called with scope of axis

    $.jqplot.LinearAxisRenderer.prototype.pack = function(pos, offsets) {

        // Add defaults for repacking from resetTickValues function.

        pos = pos || {};

        offsets = offsets || this._offsets;

        

        var ticks = this._ticks;

        var max = this.max;

        var min = this.min;

        var offmax = offsets.max;

        var offmin = offsets.min;

        var lshow = (this._label == null) ? false : this._label.show;

        

        for (var p in pos) {

            this._elem.css(p, pos[p]);

        }

        

        this._offsets = offsets;

        // pixellength will be + for x axes and - for y axes becasue pixels always measured from top left.

        var pixellength = offmax - offmin;

        var unitlength = max - min;

        

        // point to unit and unit to point conversions references to Plot DOM element top left corner.

        if (this.breakPoints) {

            unitlength = unitlength - this.breakPoints[1] + this.breakPoints[0];

            

            this.p2u = function(p){

                return (p - offmin) * unitlength / pixellength + min;

            };

        

            this.u2p = function(u){

                if (u > this.breakPoints[0] && u < this.breakPoints[1]){

                    u = this.breakPoints[0];

                }

                if (u <= this.breakPoints[0]) {

                    return (u - min) * pixellength / unitlength + offmin;

                }

                else {

                    return (u - this.breakPoints[1] + this.breakPoints[0] - min) * pixellength / unitlength + offmin;

                }

            };

                

            if (this.name.charAt(0) == 'x'){

                this.series_u2p = function(u){

                    if (u > this.breakPoints[0] && u < this.breakPoints[1]){

                        u = this.breakPoints[0];

                    }

                    if (u <= this.breakPoints[0]) {

                        return (u - min) * pixellength / unitlength;

                    }

                    else {

                        return (u - this.breakPoints[1] + this.breakPoints[0] - min) * pixellength / unitlength;

                    }

                };

                this.series_p2u = function(p){

                    return p * unitlength / pixellength + min;

                };

            }

        

            else {

                this.series_u2p = function(u){

                    if (u > this.breakPoints[0] && u < this.breakPoints[1]){

                        u = this.breakPoints[0];

                    }

                    if (u >= this.breakPoints[1]) {

                        return (u - max) * pixellength / unitlength;

                    }

                    else {

                        return (u + this.breakPoints[1] - this.breakPoints[0] - max) * pixellength / unitlength;

                    }

                };

                this.series_p2u = function(p){

                    return p * unitlength / pixellength + max;

                };

            }

        }

        else {

            this.p2u = function(p){

                return (p - offmin) * unitlength / pixellength + min;

            };

        

            this.u2p = function(u){

                return (u - min) * pixellength / unitlength + offmin;

            };

                

            if (this.name == 'xaxis' || this.name == 'x2axis'){

                this.series_u2p = function(u){

                    return (u - min) * pixellength / unitlength;

                };

                this.series_p2u = function(p){

                    return p * unitlength / pixellength + min;

                };

            }

        

            else {

                this.series_u2p = function(u){

                    return (u - max) * pixellength / unitlength;

                };

                this.series_p2u = function(p){

                    return p * unitlength / pixellength + max;

                };

            }

        }

        

        if (this.show) {

            if (this.name == 'xaxis' || this.name == 'x2axis') {

                for (var i=0; i<ticks.length; i++) {

                    var t = ticks[i];

                    if (t.show && t.showLabel) {

                        var shim;

                        

                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {

                            // will need to adjust auto positioning based on which axis this is.

                            var temp = (this.name == 'xaxis') ? 1 : -1;

                            switch (t.labelPosition) {

                                case 'auto':

                                    // position at end

                                    if (temp * t.angle < 0) {

                                        shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;

                                    }

                                    // position at start

                                    else {

                                        shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;

                                    }

                                    break;

                                case 'end':

                                    shim = -t.getWidth() + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;

                                    break;

                                case 'start':

                                    shim = -t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;

                                    break;

                                case 'middle':

                                    shim = -t.getWidth()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;

                                    break;

                                default:

                                    shim = -t.getWidth()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;

                                    break;

                            }

                        }

                        else {

                            shim = -t.getWidth()/2;

                        }

                        var val = this.u2p(t.value) + shim + 'px';

                        t._elem.css('left', val);

                        t.pack();

                    }

                }

                if (lshow) {

                    var w = this._label._elem.outerWidth(true);

                    this._label._elem.css('left', offmin + pixellength/2 - w/2 + 'px');

                    if (this.name == 'xaxis') {

                        this._label._elem.css('bottom', '0px');

                    }

                    else {

                        this._label._elem.css('top', '0px');

                    }

                    this._label.pack();

                }

            }

            else {

                for (var i=0; i<ticks.length; i++) {

                    var t = ticks[i];

                    if (t.show && t.showLabel) {                        

                        var shim;

                        if (t.constructor == $.jqplot.CanvasAxisTickRenderer && t.angle) {

                            // will need to adjust auto positioning based on which axis this is.

                            var temp = (this.name == 'yaxis') ? 1 : -1;

                            switch (t.labelPosition) {

                                case 'auto':

                                    // position at end

                                case 'end':

                                    if (temp * t.angle < 0) {

                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;

                                    }

                                    else {

                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;

                                    }

                                    break;

                                case 'start':

                                    if (t.angle > 0) {

                                        shim = -t._textRenderer.height * Math.cos(-t._textRenderer.angle) / 2;

                                    }

                                    else {

                                        shim = -t.getHeight() + t._textRenderer.height * Math.cos(t._textRenderer.angle) / 2;

                                    }

                                    break;

                                case 'middle':

                                    // if (t.angle > 0) {

                                    //     shim = -t.getHeight()/2 + t._textRenderer.height * Math.sin(-t._textRenderer.angle) / 2;

                                    // }

                                    // else {

                                    //     shim = -t.getHeight()/2 - t._textRenderer.height * Math.sin(t._textRenderer.angle) / 2;

                                    // }

                                    shim = -t.getHeight()/2;

                                    break;

                                default:

                                    shim = -t.getHeight()/2;

                                    break;

                            }

                        }

                        else {

                            shim = -t.getHeight()/2;

                        }

                        

                        var val = this.u2p(t.value) + shim + 'px';

                        t._elem.css('top', val);

                        t.pack();

                    }

                }

                if (lshow) {

                    var h = this._label._elem.outerHeight(true);

                    this._label._elem.css('top', offmax - pixellength/2 - h/2 + 'px');

                    if (this.name == 'yaxis') {

                        this._label._elem.css('left', '0px');

                    }

                    else {

                        this._label._elem.css('right', '0px');

                    }   

                    this._label.pack();

                }

            }

        }



        ticks = null;

    };

