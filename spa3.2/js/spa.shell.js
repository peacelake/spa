/*
 * spa.shell.js
 * Shell module for SPA
 */


/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars : false,
  white  : true
*/
/*global $, spa */

spa.shell = (function() {
    var configMap = {
            main_html: String() 
            + "      <div class=\"spa-shell-head\">" 
            + "            <div class=\"spa-shell-head-logo\"><\/div>" 
            + "            <div class=\"spa-shell-head-acct\"><\/div>" 
            + "            <div class=\"spa-shell-head-search\"><\/div>" 
            + "        <\/div>" + "        <div class=\"spa-shell-main\">" 
            + "            <div class=\"spa-shell-main-nav\"><\/div>" 
            + "            <div class=\"spa-shell-main-content\"><\/div>" 
            + "        <\/div>" + "        <div class=\"spa-shell-foot\"><\/div>" 
            + "        <div class=\"spa-shell-chat\"><\/div>" 
            + "        <div class=\"spa-shell-modal\"><\/div>",
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extend_title: 'Click to retract',
            chat_retract_title: 'Click to extend'
        },
        stateMap = {
            $container: null,
            is_chat_retracted: true
        }, //Place dynamic information shared across the moduel here
        jqueryMap = {}, //Cache jQuery collections here
        setJqueryMap, initModule, toggleChat, onClickChat; //Declare all module scope variables

    //Cache jQuery collections. This function should be in almost every shell and feature module.
    //It can greatly reduce the number of jQuery document transversals and improve performance.
    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find('.spa-shell-chat')
        };
    };

    toggleChat = function (do_extend, callback) {
        var px_chat_ht = jqueryMap.$chat.height(),
        is_Open = px_chat_ht === configMap.chat_extend_height,
        is_Closed = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_Open && !is_Closed;

        if(is_sliding) { return false;}
        if(do_extend) {
            jqueryMap.$chat.animate(
                {height: configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_extend_title);
                    stateMap.is_chat_retracted = false;
                    if(callback) {callback(jqueryMap.$chat);}
                });
            return true;
        }

        jqueryMap.$chat.animate(
            {height: configMap.chat_retract_height},
            configMap.chat_retract_time,
            function() {
                jqueryMap.$chat.attr('title', configMap.chat_retract_title);
                stateMap.is_chat_retracted = true;
                if(callback) {callback(jqueryMap.$chat);}
            }
        );

        return true;
    };

    onClickChat = function (event) {
        toggleChat(stateMap.is_chat_retracted);
        return false;
    };

    //initi the module
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();
        stateMap.is_chat_retracted = true;
        jqueryMap.$chat.attr('title', configMap.chat_retract_title).click(onClickChat);

        //test toggle
        // setTimeout(function() {toggleChat(true);}, 3000);
        // setTimeout(function() {toggleChat(false);}, 8000);
    };

    //Export public method explicitly by returning them in a map
    return {
        initModule: initModule
    };

}());