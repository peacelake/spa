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
            anchor_schema_map: {
                chat: {
                    opened: true,
                    closed: true
                }
            },
            main_html: String() + "      <div class=\"spa-shell-head\">" + "            <div class=\"spa-shell-head-logo\"><\/div>" + "            <div class=\"spa-shell-head-acct\"><\/div>" + "            <div class=\"spa-shell-head-search\"><\/div>" + "        <\/div>" + "        <div class=\"spa-shell-main\">" + "            <div class=\"spa-shell-main-nav\"><\/div>" + "            <div class=\"spa-shell-main-content\"><\/div>" + "        <\/div>" + "        <div class=\"spa-shell-foot\"><\/div>"
                // + "        <div class=\"spa-shell-chat\"><\/div>" 
                + "        <div class=\"spa-shell-modal\"><\/div>",
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extend_title: 'Click to retract',
            chat_retract_title: 'Click to extend'
        },
        stateMap = {
            anchor_map: {}
        },
        jqueryMap = {}, //Cache jQuery collections here
        copyAnchorMap, changeAnchorPart, onHashchange, setJqueryMap, setChatAnchor, initModule; //Declare all module scope variables

    copyAnchorMap = function() {
        return $.extend(true, {}, stateMap.anchor_map);
    };

    //Cache jQuery collections. This function should be in almost every shell and feature module.
    //It can greatly reduce the number of jQuery document transversals and improve performance.
    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container
        };
    };

    changeAnchorPart = function(arg_map) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;

        KEYVAL:
            for (key_name in arg_map) {
                if (arg_map.hasOwnProperty(key_name)) {
                    if (key_name.indexOf('_') === 0) {
                        continue KEYVAL;
                    }
                    anchor_map_revise[key_name] = arg_map[key_name];
                    key_name_dep = '_' + key_name;
                    if (arg_map[key_name_dep]) {
                        anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                    } else {
                        delete anchor_map_revise[key_name_dep];
                        delete anchor_map_revise['_s' + key_name_dep];
                    }
                }
            }

        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        } catch (error) {
            // replace URI with existing state
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }

        return bool_return;

    };

    onHashchange = function(event) {
        var
            _s_chat_previous, _s_chat_proposed, s_chat_proposed,
            anchor_map_proposed,
            is_ok = true,
            anchor_map_previous = copyAnchorMap();
        // attempt to parse anchor
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        // convenience vars
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        // Begin adjust chat component if changed
        if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed) {
                case 'opened':
                    is_ok = spa.chat.setSliderPosition('opened');
                    break;
                case 'closed':
                    is_ok = spa.chat.setSliderPosition('closed');
                    break;
                default:
                    spa.chat.setSliderPosition('closed');
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        if (!is_ok) {
            if (anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        // End revert anchor if slider change denied

        // End adjust chat component if changed
        return false;
    };

    setChatAnchor = function(position_type) {
        return changeAnchorPart({
            chat: position_type
        });
    };

    //initi the module
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        spa.chat.configModule({
            set_chat_anchor: setChatAnchor,
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);

        $(window)
            .bind('hashchange', onHashchange)
            .trigger('hashchange');



        //test toggle
        // setTimeout(function() {toggleChat(true);}, 3000);
        // setTimeout(function() {toggleChat(false);}, 8000);
    };

    //Export public method explicitly by returning them in a map
    return {
        initModule: initModule
    };

}());
