$(function(){

    $.fuzzytoast({
        destination: '#twitter-panel',
        data: '/cgi-bin/twitter.cgi',
        before: insertSpinner,
        template: 'templates/twitter-panel.html',
        refresh: 10000
    });
    
    
});