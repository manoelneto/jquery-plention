(function($){

    var


        _type = (function(){
            var
                toString = Object.prototype.toString,
                class2type = {};

            class2type["[object Boolean]"] = "boolean";
            class2type["[object Number]"] = "number";
            class2type["[object String]"] = "string";
            class2type["[object Function]"] = "function";
            class2type["[object Array]"] = "array";
            class2type["[object Date]"] = "date";
            class2type["[object RegExp]"] = "regexp";
            class2type["[object Object]"] = "object";

            return function( obj ) {
                return class2type[ toString.call(obj) ];
            }
        })()

        ,  _cssProperty = function(property, returnProperty) {
            var body = document.body || document.documentElement,
                style = body.style,
                vendors;
             
            // No css support detected
            if ( typeof style === 'undefined' ) { return false; }
             
            // Tests for standard prop
            if ( typeof style[property] === 'string' ) { return returnProperty ? property : true; }
             
            // Tests for vendor specific prop
            vendors = ['Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab'],
            property = property.charAt(0).toUpperCase() + property.substr(1);
            for (var i = 0, k = vendors.length; i < k; i++) {
                if ( typeof style[vendors[i] + property] === 'string' ) { return returnProperty ? (vendors[i] + property) : true; }
            }
        }

        , _cssVendor = function() {
            var body = document.body || document.documentElement,
                style = body.style,
                vendors,
                property = 'transition';
             
            // No css support detected
            if ( typeof style === 'undefined' ) { return false; }
             
            // Tests for standard prop
            if ( typeof style[property] === 'string' ) { return ''; }
             
            // Tests for vendor specific prop
            vendors = ['Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab'],
            property = property.charAt(0).toUpperCase() + property.substr(1);
            for (var i = 0, k = vendors.length; i < k; i++) {
                if ( typeof style[vendors[i] + property] === 'string' ) { return '-' + vendors[i].toLowerCase() + '-' ; }
            } 
        }

        , hasTransition = _cssProperty('transition')

        , cssVendor = _cssVendor();


    /**
     * 
     * Define a class for a single animation
     * 
     * @param {Element} root Father object
     * @param {Object}  events Object events with in, out properties
     * @param {Object}  animation User Animation
     * @returns Returns -1 if a precedes b, 1 if a follows b
     */

    function SingleAnimation( root, events, animation, plention ) {
        // Saving
        this.plention = plention;
        this.$root = $(root);
        this.events = events;
        this.animation = animation;
        this.timeout_obj = null;

        // init
        this.init();

        return this;
    }

    SingleAnimation.prototype = {

        defaults : {
            timeout : 0,
            duration : 500, //ms
            easing : 'linear',
            selectors: [],
            properties: [],
        },

        /**
         * 
         * Init a SingleAnimation Object
         * 
         */
        init : function() {
            this.fixAttr();
            this.appendDefaultAttr();
            this.saveInitialState();
        },

        /**
         * 
         * Save Initial State
         * 
         */

        saveInitialState : function() {
            var properties = this.animation.properties,
                prop, initialState = {};

            for ( var i = 0, k = properties.length; i < k; i++ ) {
                prop = properties[ i ];
                initialState[ prop.property ] = this.$objs.css( prop.property );
            }

            this.initialState = initialState;
        },

         /**
         * 
         * Fix users atributes
         * 
         */

        fixAttr : function() {

            var animation = this.animation;

            // selector, if is string, make it array
            if ( _type( animation.selectors ) === 'string' ) {
                animation.selectors = [ animation.selectors ];
            }

            this.$objs = this.$root.find( animation.selectors.join(',') );

            // properties, like background-color:red;margin-top:10px;
            // to { "background-color": "red", "margin-top": "10px" }
            if ( _type( animation.properties ) === 'string') {
                var props = animation.properties.replace(' ', '').split(';'),
                    aux = [];

                // loop throught properties
                for ( var i = 0, k = props.length; i < k; i++ ) {
                    var prop = props[i].split(':');
                    if ( prop.length === 2 ) {
                        aux.push({
                            property: prop[0],
                            value: prop[1]
                        });
                    }
                }

                animation.properties = aux;
            }

            this.animation = animation;

        },

        /**
         * 
         * Set defaults attributes
         * 
         */
        appendDefaultAttr : function() {
            this.animation = $.extend({}, this.defaults, this.animation);
        },

        /**
         * 
         * Clear any timeout
         * 
         */

        clearTimeout : function() {
            clearTimeout(this.timeout_obj);
        },

        /**
         * 
         * Make the animation
         * 
         */

        animate : function() {
            var $objs = this.$objs,
                currentDuration = this.currentDuration,
                properties = this.animation.properties,
                joinedProperties = {},
                prop;

            // join all properties in a object
            for ( var i = 0, k = properties.length; i < k; i++ ) {
                prop = properties[ i ];
                joinedProperties[ prop.property ] = prop.value;
            }

            $objs.stop(true).animate(joinedProperties, currentDuration);
        },

        /**
         * 
         * Make the deanimation
         * 
         */

        deanimate : function() {

            var $objs = this.$objs,
                currentDuration = this.currentDuration,
                properties = this.initialState;

            $objs.stop(true).animate(properties, currentDuration);
        },

        /**
         * 
         * Starts this animation, not run
         * 
         */
        start : function() {
            this.clearTimeout();

            var currentDuration, currentTimeout,
                that = this;

            currentDuration = Math.min( this.animation.duration, this.animation.timeout + this.animation.duration - this.plention.animationOffset );


            if ( currentDuration > 0 ) {
                currentTimeout = Math.max(0, this.animation.timeout - this.plention.animationOffset);

                this.currentDuration = currentDuration;

                if ( currentTimeout > 0 ) {
                    this.timeout_obj = setTimeout(function(){ that.animate(); }, currentTimeout);
                } else {
                    that.animate();
                }
            }

        },

        /**
         * 
         * Stops this animation
         * 
         */
        stop : function() {
            this.clearTimeout();

            var currentDuration, currentTimeout,
                that = this;

            currentDuration = Math.min( this.animation.duration, this.plention.animationOffset - this.animation.timeout );

            if ( currentDuration > 0 ) {
                currentTimeout = Math.max( 0, this.plention.animationOffset - this.animation.timeout - this.animation.duration );

                this.currentDuration = currentDuration;

                if ( currentTimeout > 0 ) {
                    this.timeout_obj = setTimeout(function(){ that.deanimate(); }, currentTimeout);
                } else {
                    that.deanimate();
                }
            }

        }
    }


    // plention obj
    function Plention( root, options ) {

        var that = this,
            events = options[0],
            animations = options[1];

        this.$root = $(root);
        this.events = events;
        this.plentions = [];
        
        for ( var i = 0, k = animations.length; i < k; i++ ) {
            this.plentions[ i ] = new SingleAnimation( root, events, animations[ i ], this );
        }

        this.init();

        return this;
    }

    Plention.prototype = {
        /**
         * 
         * Init a Plention Object
         * 
         */
        init : function() {

            // time when animation or deanimation begins
            this.start_time = 0;
            // timeouts
            this.timeout_obj = null;

            this.updateMaxDuration();
            this.appendListeners();
        },

        /**
         * 
         * Loop throung all single_animation and update animationDuration
         * 
         */

        updateMaxDuration : function() {
            var that = this;

            // calculating duration of all animation togheter 
            this.animationDuration = (function(){
                var plention, max_duration = 0;

                for ( var i = 0, k = that.plentions.length; i < k; i++ ) {
                    plention = that.plentions[ i ];

                    max_duration = Math.max( plention.animation.timeout +
                        plention.animation.duration, max_duration );
                }

                return max_duration;
            }());

            this.animationOffset = 0;

        },

        /**
         * 
         * append Event Listeners in and out
         * 
         */

        appendListeners : function() {

            var events = this.events,
                $root = this.$root,
                that = this;

            // append events in
            if ( events.in ) {
                $root.on( events.in, function(e){
                    if ( e && e.preventDefault ) {
                        e.preventDefault();
                    }

                    that.callbackIn();

                    return false;
                });
            }

            // append events out
            if ( events.out ) {
                $root.on( events.out, function(e){
                    if ( e && e.preventDefault ) {
                        e.preventDefault();
                    }

                    that.callbackOut();

                    return false;
                });
            }

        },

        /**
         * 
         * event callback for in - start all plentions
         * 
         */

        callbackIn : function(e) {
            var plentions = this.plentions,
                start_time = this.start_time,
                animationDuration = this.animationDuration,
                now = (new Date()).getTime();


            this.animationOffset = Math.max(0, Math.min(animationDuration, this.animationOffset - ( now - start_time ) ));
            this.start_time = now;

            console.dir( this );

            for ( var i = 0, k = plentions.length; i < k; i++ ) {
                plentions[ i ].start();
            }
        },

        /**
         * 
         * event callback for out - stop all plentions
         * 
         */
        callbackOut : function(e) {
            var plentions = this.plentions,
                start_time = this.start_time,
                animationDuration = this.animationDuration,
                now = (new Date()).getTime();

            this.animationOffset = Math.max(0, Math.min(animationDuration, this.animationOffset + now - start_time ));
            this.start_time = now;


            for ( var i = 0, k = plentions.length; i < k; i++ ) {
                plentions[ i ].stop();
            }
        },

        /**
         * 
         * Fix users atributes
         * 
         */
    };

    var pluginName = 'plention',
        methods = {
            init : function() {

                var args = arguments;

                return this.each(function(){
                    if ( ! $(this).data( pluginName ) ) {
                        $(this).data( pluginName, new Plention(this, args)); 
                    }
                });
            },
        };

    $.fn[ pluginName ] = function( method ) {

        if ( methods[ method ] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.' + pluginName );
        } 

    }

})( window.jQuery );