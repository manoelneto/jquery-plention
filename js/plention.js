(function(window){

    var
        // using qwery from ender js
        Q = utils.qwery
        // using bean from ender js
        , bean = utils.bean
        // using bonzo from ender js
        , bonzo = utils.bonzo
        // default animation timing
        , default_animations = {
            time_start : 'now',
            duration : 500, //ms
            easing : 'linear',
            selectors: [],
            properties: [],
        }

        , default_events = {
            in : '',
            out : ''
        }

        , _type = (function(){
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

        , _extend = function(default_obj, new_obj) {
            var aux = {};

            for ( attr in default_obj ) {
                if ( default_obj.hasOwnProperty(attr) ) {
                    aux[attr] = default_obj[attr];
                }
            }

            for ( attr in new_obj ) {
                if ( new_obj.hasOwnProperty(attr) ) {
                    aux[attr] = new_obj[attr];
                }
            }

            return aux;
        }

        , _fixAttr = function( obj ) {
            // timestart
            if ( _type( obj.time_start ) === 'string' && obj.time_start !== '' ) {
                if ( obj.time_start === 'now' ){
                    obj.time_start = 0;
                }
            }

            // selectors
            if ( _type( obj.selectors ) === 'string' && obj.selectors !== ''  ) {
                obj.selectors = [ obj.selectors ];
            }

            // properties
            if ( _type( obj.properties ) === 'string' && obj.properties !== '' ) {
                var prop = obj.properties.replace(' ', '').split(';'),
                    k, i, aux = [];

                for ( i = 0, k = prop.length; i < k; i++ ) {
                    if ( prop[i].replace(' ', '') !== '' ) {
                        var attr_value = prop[i].split(':');
                        if ( attr_value.length == 2 ) {
                            aux.push({
                                property: attr_value[0],
                                value: attr_value[1]
                            });
                        }
                    }
                }

                obj.properties = aux;
            }

            return obj;
        }

        , _bind = function() {
            bean.on.apply(this, arguments);
        }

        , _unbind = function() {
            bean.off.apply(this, arguments);
        }

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


    /* 
        this class defines a single animation
    */
    function PlentionAnimation() {

    }

    // plention obj
    function Plention(events, animations, root) {
        var that = this;
        this.animations = animations;
        this.root = root;
        this.events = events;
        this.animation_timeouts = [];

        // intern use
        this.start_time;

        // applying events
        _bind( this.root, this.events.in, function(){
            that.begin();
        });
        _bind( this.root, this.events.out, function(){
            that.end();
        });
        

        return this;
    }

    Plention.prototype = {
        begin : function() {
            var i, k, animation, that = this, timeout_animation;

            // clear animation timeouts
            for ( i = 0, k = this.animation_timeouts.length; i < k; i++ ) {
                clearTimeout( this.animation_timeouts[i] );
            }
            this.animation_timeouts = [];

            // put start time
            this.time_start = ( new Date() ).getTime();

            // loop throwght animations
            for ( i = 0, k = this.animations.length; i < k; i++ ){
                animation = this.animations[i];

                timeout_animation = (function(that, animation){
                    var t;

                    t = setTimeout(function(){
                        that.animate(animation);
                    }, animation.time_start + 1);

                    return t;
                })(that, animation);

                this.animation_timeouts.push( timeout_animation );

            }

        },
        end : function() {
            var diff = (new Date()).getTime() - this.start_time;

            // lopp throwght animations
            for ( i = 0, k = this.animations.length; i < k; i++ ){
                animation = this.animations[i];

                // check if begin now
                // if ( animation.time_start === 0 ) {
                //     this.animate(animation);
                // }

            }
        },

        _animate : (function(){
            var func;
            if ( hasTransition ) {
                func = function(obj, animation, duration) {
                    var nextTransitionProperty,
                        currentTransitionProperty = bonzo(obj).css(cssVendor + 'transition'),
                        css = {};

                    if (currentTransitionProperty === 'all 0s ease 0s') {
                        currentTransitionProperty = '';
                    }
                    
                    nextTransitionProperty = ( !!currentTransitionProperty ) ? currentTransitionProperty.split(',') : [];

                    // for each property
                    for ( var i = 0, k = animation.properties.length; i < k; i++ ) {
                        nextTransitionProperty.push([ animation.properties[i].property, duration + 'ms', animation.easing, '0s' ].join(' ') )
                        css[animation.properties[i].property] = animation.properties[i].value;
                    }

                    bonzo(obj).css(cssVendor + 'transition', nextTransitionProperty).css(css);
                }
            } else {
                func = function() {

                }
            }

            return func;
        })(),

        animate : function(animation) {
            var now = (new Date()).getTime(),
                diff = this.time_start - now,
                duration = animation.duration - diff,
                objs = Q(animation.selectors.join(','), this.root),
                obj;

            // test if has transition
            for ( var i = 0, k = objs.length; i < k; i++ ) {
                obj = objs[i];
                this._animate(obj, animation, duration);
            }

        },

        deanimate : function( animation ) {

        }
    }

    function plention(events, animations, root) {
        var 
            root = root || '',
            // loop count
            k, i,

            // roots
            roots, // array

            // plentions obj
            plentions, // array

            // child
            child;

        // extends each animations
        for ( i = 0, k = animations.length; i < k; i++ ) {
            animations[i] = _fixAttr( _extend( default_animations, animations[i] ));
        }

        // extends events
        events = _extend( default_events, events );

        // make root an array
        if ( _type(root) !== "array" ) {
            if ( _type(root) === 'string' ) {
                if ( root === '' ) {
                    root = document;
                }
                roots = Q(root);
            } else {
                roots = [ root ];
            }
        } else {
            roots = root;
        }

        // creating plention objs
        for ( i = 0, k = roots.length; i < k; i++ ) {
            new Plention( events, animations, roots[i] );
        }



        // for ( i = 0, k = roots.length; i < k; i++ ) {
        //     bind(roots[i], events.in, function(){
        //         beginAnimation(animations, this);
        //     });
        // }

        // for ( i = 0, k = roots.length; i < k; i++ ) {
        //     bind(roots[i], events.out, function(){
        //         console.log('mouse leave');
        //     });
        // }
        
    }

    window.plention = plention;

})(this);