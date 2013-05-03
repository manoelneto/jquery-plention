(function(){

    $('.article').plention(
        { in : 'mouseenter', out : 'mouseleave' }
        , [
            {
                selectors: 'h1',
                // timeout: 0,
                duration: 700,
                easing: 'ease-in-out',
                properties: 'background-color:red;margin-top:10px;',
                callback: function( obj ) {

                    console.log('ended h1');

                }
            }
            , {
                selectors: 'img',
                timeout: 700,
                duration: 300,
                properties: 'margin-top:20px;',
                callback: function( obj ) {

                    console.log('ended img');

                }
            }
        ]);

})();