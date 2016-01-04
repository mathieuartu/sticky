'use strict';

var Sticky = function(o){
  var that = this;
  window.addEventListener('load', function(){
    //Save options
    that.vars = {
      //Vars
      trigger: document.querySelector(o.triggerClass),
      sticker: document.querySelector(o.stickerClass),
      endTrigger: document.querySelector(o.endTriggerClass),
      header: document.querySelector('#header'),
      stickyStyles: o.stickyStyles,
      originalStickyStyles: {},
      steps: o.steps,
      relativeParent: o.relativeParent,
      windowHeightThreshold: o.windowHeightThreshold,
      stickyCondition: o.stickyCondition,

      //Methods
      startCallback: o.startCallback,
      endCallback: o.endCallback,
      onInit: o.onInit,
      initFlag: true
    };


    //Then save original sticky styles
    for(var key in that.vars.stickyStyles){
      that.vars.originalStickyStyles[key] = window.getComputedStyle(that.vars.sticker)[key];
    }
    that.vars.originalStickyStyles.top = window.getComputedStyle(that.vars.sticker).top;
    that.vars.originalStickyStyles.position = window.getComputedStyle(that.vars.sticker).position;

    //Finally init and apply events
    that.applyEvents();
  });
  
};

//Sticky methods
Sticky.prototype = {

  //Init
  applyEvents: function(){
    //Bind this.scroll to window scroll event
    window.addEventListener('scroll', this.scroll.bind(this));

    //Prepare conditions
    this.conds = {
      triggerReached: 'this.getTop(this.vars.trigger) < 0',
      endTriggerReached: 'this.getTop(this.vars.endTrigger) < 0',
      steps: []
    }

    //If steps are defined
    if(this.vars.steps){
      var copy = this.vars.steps, index = 0;
      this.vars.steps = [];

      //For each step
      for(var key in copy){
        //Store step info
        this.vars.steps.push({
          trigger: key,
          css: copy[key]
        });

        //Store condition
        this.conds.steps.push(
          'that.getTop(that.vars.steps['+index+'].trigger) < 0'
        );

        index++;
      }
    }

    //Reverse Array (we're going to test the conditions backwards)
    this.conds.steps.reverse();
    this.vars.steps.reverse();
  },


  //Gets called each time window is scrolling
  scroll: function(e){
    //Test if we're not on S or M + add a height threshold
    if(window.innerHeight > this.vars.windowHeightThreshold && eval(this.vars.stickyCondition) && !Modernizr.touch){
      
      //Test basic conditions
      if(eval(this.conds.triggerReached) && !eval(this.conds.endTriggerReached)){
        //It means we are inside the sticky scroll area
        
        //Execute onInit if present
        if(this.vars.onInit && this.vars.initFlag){
          this.vars.initFlag = false;
          this.vars.onInit();
        }

        this.setStickyStyles(this.vars.sticker);

        //Now listen for steps zones
        if(this.conds.steps){
          //For each step, test if it's true
          var that = this,
          i = imax = this.conds.steps.length-1;
          for(var a = 0; a < imax+1; a++){
            var step = this.conds.steps[i];
            if(eval(that.vars.steps[a].trigger).size() != 0 && eval(step) && eval(that.vars.steps[a].trigger).is(':visible')){
              //And if it's true, apply css styles and execute callback if defined
              that.setStyles(that.vars.sticker, that.vars.steps[a].css);
              if(that.vars.steps[a].css.callback){
                that.vars.steps[a].css.callback();
              }
              break;
            }

            i--;
          }
        }

      } else {
        //If we're out of the sticky scroll area, revert to original styles
        this.revertStickyStyles(this.vars.sticker);

        this.vars.initFlag = true;
      }
    }

  },

  //Pretty straightforward
  getHeaderHeight: function(){
    return this.vars.header.offsetHeight + parseInt(window.getComputedStyle(this.vars.header).top);
  },

  //Gets the distance between a node top and window top
  getTop: function(node){
    if(node){
      if(typeof(node) == 'string'){
        node = eval(node);
      }
      //If it's a jQuery node
      if(node.jquery !== undefined){
        node = node.get(0);
      }

      return node.getBoundingClientRect().top - this.getHeaderHeight();
    }
  },

  //Apply styles to an element, execute 
  setStyles: function(node, styles){
    for(var key in styles){
      //Change the old style to the new one
      var style = styles[key];
      if(typeof(styles[key]) == 'function' && key != 'callback'){
        style = style();
      }
      node.style[key] = style;
    }
  },

  //Apply styles to the sticky element
  setStickyStyles: function(node){

    if(this.vars.endCallback){
      this.vars.startCallback();
    }

    this.setStyles(node, this.vars.stickyStyles);
    
    //Eventually add the sticky position+top
    node.style.position = 'absolute';
    node.style.top = Math.abs(this.getTop(node.parentElement))+'px';

    //Set the parent container to relative positionning
    if(this.vars.relativeParent){
      node.parentElement.style.position = 'relative';
    }

  },

  //Revert sticky element's styles
  revertStickyStyles: function(node){

    if(this.vars.endCallback){
      this.vars.endCallback();
    }

    for(var key in this.vars.stickyStyles){
      //Change back to the old saved styles
      var style = this.vars.originalStickyStyles[key];
      node.style[key] = style;
    }

    //Remove the sticky position+top
    node.style.position = this.vars.originalStickyStyles.position;
    node.style.top = this.vars.originalStickyStyles.top;

    //Set the parent container back to static
    if(this.vars.relativeParent){
      node.parentElement.style.position = 'static';
    }

  }
};








//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------

//Sticky init example

var sticky = new Sticky({
  //-- Usage
  //'trigger' : When we reach this element by scrolling down the window, stickers starts being sticky
  //'sticker' : The element that becomes sticky
  //'endTrigger' : When we reach this element by scrolling, the sticker stops being sticky  
  triggerClass: '.article_container',
  stickerClass: '.aside_right',
  endTriggerClass: '.bloc_surfooter',

  //'relativeParent' : option to add a 'position: relative;' to the parent container of the sticky element
  relativeParent: true,

  //'windowHeightThreshold' : if window height is less than this, sticky won't execute
  windowHeightThreshold: 800,

  //'onInit' : callback called once when we enter the scroll zone
  onInit: function(){
    $(".aside_right .section_taboola_alireaussi, .aside_right .section_bizdev_l, .aside_right .section_newsletter, .aside_right .section_suscribe").fadeOut();
  },

  //stickyCondition: if false, sticky doesnt execute
  stickyCondition: '$(".groups .group").size() > 10',

  //'stickyStyles' : an object of css properties
  // They will be added to the sticker while in sticky mode, and removed in non-sticky mode
  stickyStyles: {
    'right': '0',
    'margin-top': '25px',
    'transition': 'margin-top 0.4s ease-out'
  },

  //'steps' : a list of steps comprised between 'trigger' and 'endTrigger' defined just before
  // Each step triggers when we reach the element class in the key definition
  // Each step can have a list of css properties and a callback function
  steps: {
    '$(".groups .group-1")': {
      'callback': function(){
        $(".aside_right .section_taboola_alireaussi, .aside_right .section_bizdev_l, .aside_right .section_newsletter, .aside_right .section_suscribe").fadeOut();
      }
    },

    '$(".groups .group-10")': {
      'margin-top': function(){
        return - $(".aside_right .section_taboola_alireaussi").parent().position().top +"px"        
      },
      'callback': function(){

        $('.aside_right .section_taboola_alireaussi').fadeIn();
        $(".aside_right .section_newsletter, .aside_right .section_suscribe, .aside_right .section_bizdev_l").fadeOut();
        
      }
    },

    '$(".groups .group-20")': {
      'margin-top': function(){
        return - $(".aside_right .section_bizdev_l").parent().position().top +"px"        
      },
      'callback': function(){

        $(".aside_right .section_bizdev_l, .aside_right .section_newsletter, .aside_right .section_suscribe").fadeIn();
        
      }
    },

    '$(".groups .group:visible").filter(":last").prev().prev()': {
      'margin-top': function(){
        return - $('.aside_right').outerHeight() +"px";
      }
    }
  }

});




