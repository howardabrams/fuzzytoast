$(function(){

    $.fuzzytoast({
        destination: '#twitter-panel',
        data: '/twitter',
        template: 'templates/twitter-panel.html',
        refresh: 10000
    });
    
});