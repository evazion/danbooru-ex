import _ from "lodash";
import jQuery from "jquery";
import moment from "moment";

import "./danbooru-ex.css";
import EX from "./ex.js";
window.EX = EX;

jQuery(function() {
    'use strict';

    EX.UI.initialize();
    EX.UI.Artists.initialize();
    EX.UI.Comments.initialize();
    EX.UI.ForumPosts.initialize();
    EX.UI.ModeMenu.initialize();
    EX.UI.Pools.initialize();
    EX.UI.Posts.initialize();
    EX.UI.PostVersions.initialize();
    EX.UI.WikiPages.initialize();
});
