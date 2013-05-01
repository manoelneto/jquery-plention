(function(window){

    var Q = utils.qwery;

    plention(
    { in : 'mouseenter', out : 'mouseleave' }
    , [{
        selectors: 'h1',
        time_start: 'now',
        duration: 700,
        easing: 'ease-in-out',
        properties: 'background-color:red;margin-top:10px;',
        callback: function( obj ) {
            console.log('ended h1');
        }
    }
    , {
        selectors: 'img',
        time_start: 700,
        duration: 300,
        properties: 'margin-top:20px;',
        callback: function( obj ) {
            console.log('ended img');
        }
    }], Q('.article'));



})(this);