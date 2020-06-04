(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/******************************************************************************
 * 
 ******************************************************************************/
"use strict"
/******************************************************************************/
/******************************************************************************/

const addSceneSystem = function( app ){
    app.scenes = {};
    
    app.scenes.queue = $('#page').data('scenes');
    if(app.scenes.queue){
        app.scenes.queue = app.scenes.queue.split(',').map(Number) ;
    } else {
        app.scenes.queue = [1];
    }
    app.scenes.next =  function(){
        debugger
    }
}

const setContentFormat = function( app ){

    let _contentFormats = $('#page').data('formats');

    return {
        available : _contentFormats 

    }
}



$(document).ready(function() {

    const app = {};
    require('../common/features').mountFeatureSystem( app );
    addSceneSystem(app); 

    app.contentFormats = setContentFormat( app ); 
    require('./ui/main.js').addUiFeature( app );

    let metadata = $("#page").data("meta");
    $("#pageTitle").text( `${metadata.book.title} - ${metadata.book.page}`);

    require('./ui/jsEffects/main.js').addJsEffects(app); 
})






},{"../common/features":10,"./ui/jsEffects/main.js":6,"./ui/main.js":7}],2:[function(require,module,exports){
/*****************************************************************************/
"use strict";

/*****************************************************************************/
const sizeToViewport = require('./sizeToViewport').sizeToViewport;
/*****************************************************************************/


const _drawBorders =  function( elt, contentViewport, viewportTemplate, eltCss, rowColInfo ) {        

    let borderSpecs = elt.data('borders');
    let topBorder = rowColInfo.row > 0 ; 
    let leftBorder = true;  
    let bottomBorder =  (rowColInfo.row + rowColInfo.vertSpan) < (viewportTemplate.format.rows);
    let rightBorder = true;  

    if(borderSpecs && viewportTemplate.name in borderSpecs){
        let borderInstructions = borderSpecs[viewportTemplate.name];
        if (borderInstructions === "none"){
            leftBorder = false;
            bottomBorder = false;  
            topBorder = false; 
            rightBorder = false; 
        }
    }       
    let gutterWidth = contentViewport.width / 100; 
    if( rightBorder) {
        let odv = $([       //right border
            `<div class="gutter" style="left:${eltCss.left + eltCss.width}`,  
            `width:${gutterWidth}; top:${eltCss.top}`, 
            `height:${eltCss.height}"></div>`].join(';'));
        $("body").append(odv);
    }
    if( leftBorder ) {
        let odv = $([       //right border
            `<div class="gutter" style="left:${eltCss.left}`,  
            `width:${gutterWidth}; top:${eltCss.top}`, 
            `height:${eltCss.height}"></div>`].join(';'));
        $("body").append(odv);
    }

    if( topBorder ){
        let odh =  $([
            `<div class="gutter" style="top:${eltCss.top}`,  
                `height:${contentViewport.height/ 100}; left:${eltCss.left}`, 
                `width:${eltCss.width}"></div>`].join(';'));
            $("body").append(odh);
    } 
    
    if( bottomBorder ){
        let odh =  $([
            `<div class="gutter" style="top:${eltCss.top + eltCss.height}`,  
            `height:${contentViewport.height/ 100}; left:${eltCss.left}`, 
            `width:${eltCss.width + gutterWidth}"></div>`].join(';'));
        $("body").append(odh);
   }
}


let getRowColInfo  = function(elt, viewportTemplate){
    let pageLayoutName = viewportTemplate.name; 
    let rowColInfo = {};  
    let getValue = (info, defaultVal) => (info !== undefined && pageLayoutName in info) ? info[pageLayoutName] : defaultVal; 
    let rowInfo = elt.data('row'); 
    rowColInfo.row = getValue(rowInfo, 1) - 1; 

    let colInfo = elt.data('col'); 
    rowColInfo.col = getValue(colInfo, 1) - 1; 

    let vertSpanInfo = elt.data('vert-span');   //multiple cols? 
    rowColInfo.vertSpan = getValue(vertSpanInfo, 1)

    let horSpanInfo = elt.data('hor-span') ;
    rowColInfo.horSpan = getValue(horSpanInfo, 1); 

    return rowColInfo
}

const layoutImages = function( contentViewport , viewportTemplate, scenes){

    $('.visual-elt').each( function(){
        let eltId = $(this).attr('id');
        console.log(`placing element ${eltId}`);
        let viewportClients = $(this).data('include-in-viewport');
        let sceneInclude = $(this).data('scenes');
        let showInScene = false; 
        if( sceneInclude === undefined ) showInScene = true; 
        if( viewportClients && showInScene ){ 
            if(viewportClients.split(',').includes(viewportTemplate.name)){ //if this viewport includes this elt
                let rowColInfo =  getRowColInfo( $(this), viewportTemplate) 
                let eltCss = sizeToViewport( $(this), contentViewport, viewportTemplate ); 
                _drawBorders($(this), contentViewport, viewportTemplate, eltCss, rowColInfo)
                $( this ).show(); 
            }
            else{
                $( this ).hide();
            }
        }
    })
    
}

module.exports = {
    layoutImages
}


},{"./sizeToViewport":5}],3:[function(require,module,exports){
"use strict"; 

//return the left and top on the screen, 
//given row,col coordinates
//and the contentFrame
//row and col are indexed at 1
const rowColToTopLeft = function( rowColPos, contentViewport, contentFrame ){
 
        let row_Zero_indexed = rowColPos.row - 1; 
        let col_Zero_indexed = rowColPos.col - 1;
        let pxLeft = contentViewport.left + 
                    ((contentViewport.width / contentFrame.format.cols) * col_Zero_indexed);
        let pxTop = contentViewport.top + 
                    ((contentViewport.height / contentFrame.format.rows ) * row_Zero_indexed);  

        let pxWidth  = contentViewport.width / contentFrame.format.cols 
        let pxHeight = contentViewport.height / contentFrame.format.rows
 
        return {
            top : pxTop,
            left: pxLeft, 
            bottom: pxTop + pxHeight, 
            right: pxLeft + pxWidth
        };  
}




const placeCaption = function ( jqueryElt, contentViewport, viewportTemplate ){
    let positionDescription = jqueryElt.data('position-description')[viewportTemplate.name];
    let pxOrigin = rowColToTopLeft(positionDescription.origin, contentViewport, viewportTemplate); 
    let pxDest = rowColToTopLeft(positionDescription.destination, contentViewport, viewportTemplate); 
    let captionArea = {
        left : (pxOrigin.left < pxDest.left ? pxOrigin.left : pxDest.left), 
        top: (pxOrigin.top < pxDest.top ? pxOrigin.top : pxDest.top), 
        right: (pxOrigin.right > pxDest.right ? pxOrigin.right : pxDest.right), 
        bottom : (pxOrigin.bottom > pxDest.bottom ? pxOrigin.bottom : pxDest.bottom )
    }
    debugger
}

const layoutCaptions = function( contentViewport , viewportTemplate, scenes){
    $(".caption").each( function(){
        let eltId = $(this).attr('id');
        let showInScene = false; 
        let viewportClients = $(this).data('include-in-viewport');
        let sceneInclude = $(this).data('scenes');
 
        console.log(`placing element ${eltId}`);
        if( sceneInclude === undefined ) showInScene = true; 
        if( viewportClients && showInScene ){ 
            if(viewportClients.split(',').includes(viewportTemplate.name)){ //if this viewport includes this elt
                return placeCaption( $( this ), contentViewport, viewportTemplate);  
            }
            $( this ).hide();
        }
    })
}


module.exports = {
    layoutCaptions
}

},{}],4:[function(require,module,exports){
/*****************************************************************************/
"use strict";
/*****************************************************************************/
const cssDef         = require('../utils/cssDef').cssDef ;
const divPerimeter   = require('../utils/divPerimeter').divPerimeter ; 
const layoutImages   = require('./imgLayout').layoutImages ;
const layoutCaptions = require('./layoutCaptions').layoutCaptions ; 
const sizeToViewport = require('./sizeToViewport').sizeToViewport ; 
/*****************************************************************************/

let bottomNavCss = cssDef({ 
   width: s => s.width, 
   height: s => s.orientation === 'portrait' ? 55 : 30 
});

let topNavCss    = cssDef({
   width: s => s.width,
   height:55
});


const _configureOuterLayout = function( app ){
    let screen = divPerimeter( window ); 
    //figure out which type of viewPort fits this best 
    //let layoutType = figureOutLayout()
    //render surrounding ui 
    
    let contentViewport = {
        top: 0,
        left: 0,  
        height: screen.height, 
        width: screen.width, 
        bottom: screen.height
    };

    if(app.ui.visualElements.topNav){
        let topNav = app.ui.visualElements.topNav( screen ); 
        contentViewport.top += topNav.height; 
        contentViewport.height -= topNav.height; 
        $('#topNav').css(topNav);
    }

    return contentViewport; 
}


const _configureMargins = function(contentViewport){

    $('#marginLeft').css({
        top: contentViewport.top, 
        width: contentViewport.left, 
        height:contentViewport.height
    })
     $('#marginRight').css({
        top: contentViewport.top, 
        width: contentViewport.left, 
        height:contentViewport.height, 
        left: contentViewport.left + contentViewport.width
    })

}

const setFormat = function( maxDimensions, contentFormats ){
    let maxArea = maxDimensions.width * maxDimensions.height; 
    let area = (width, height) => width * height; 
    let wastedSpace = (width, height) => maxArea - area(width * height)

    let best = { wasted: maxArea};  //the most space that can be wasted is all of it
    Object.entries(contentFormats).forEach( format => {

        let formatDescription = format[1];
        let contentWidth = maxDimensions.width; 
        let contentHeight = (contentWidth * formatDescription.height / formatDescription.width); 
        while( contentHeight > maxDimensions.height ){ //scale the height 
                contentHeight = contentHeight * 0.95;   
                contentWidth = contentWidth * 0.95; 
         }
        let wasted = maxDimensions.area - (contentWidth * contentHeight); 
        if (wasted < best.wasted){
                best.name = format[0]; 
                best.format = format[1]; 
                best.wasted = wasted; 
                best.dimensions = {
                    width: contentWidth, 
                    height: contentHeight, 
                    area: contentWidth * contentHeight
                }; 
         }
    })
    best.screenDimensions = maxDimensions
    return best
}   
  
const fitToTemplate = function( maxDimensions ) {
    let contentFormats = $('#page').data('formats');
    return setFormat( maxDimensions, contentFormats )
}

const _configureLayout = function( app ){
    $(".gutter").remove();          //removing all gutters
    let contentViewport = _configureOuterLayout( app  );
    let maxDimensions = {
        height: contentViewport.height, 
        width: contentViewport.width,
        area: contentViewport.height * contentViewport.width
    }
    /* now we know how much real estate we have */

    let contentFrame = fitToTemplate( maxDimensions );  
    let totalMarginWidth = contentViewport.width - contentFrame.dimensions.width; 
    contentViewport.left = totalMarginWidth / 2; 
    contentViewport.width = contentFrame.dimensions.width; 
    contentViewport.height = contentFrame.dimensions.height; 

    _configureMargins(contentViewport);
    layoutImages(contentViewport, contentFrame, app.scenes); 
    layoutCaptions( contentViewport, contentFrame, app.scenes ); 
}


const uiFrameFeature = function( app ){

    app.ui.visualElements = { 
        topNav    : topNavCss, 
        bottomNav : bottomNavCss,
        resize    : _ =>  _configureLayout( app )
    };
    
    _configureLayout( app ); 
    return app; 
}

module.exports = {
   uiFrameFeature
}

},{"../utils/cssDef":8,"../utils/divPerimeter":9,"./imgLayout":2,"./layoutCaptions":3,"./sizeToViewport":5}],5:[function(require,module,exports){
"use strict";

//given a viewport and a frame description, return 
//the coordinates and dimensions


const sizeToViewport = function( elt, contentViewport, contentFrame, options ){
        let posDim = {}

        let pageLayoutName = contentFrame.name;
        let getValue = (info, defaultVal) => (info !== undefined && pageLayoutName in info) ? info[pageLayoutName] : defaultVal; 

 
        let rowInfo = elt.data('row'); 
        posDim.row = getValue(rowInfo, 1) - 1; 

        let colInfo = elt.data('col'); 
        posDim.col = getValue(colInfo, 1) - 1; 

        let vertSpanInfo = elt.data('vert-span');   //multiple cols? 
        posDim.vertSpan = getValue(vertSpanInfo, 1)

        let horSpanInfo = elt.data('hor-span') ;
        posDim.horSpan = getValue(horSpanInfo, 1); 


        let eltCss ={
            width: contentViewport.width / contentFrame.format.cols * posDim.horSpan,  
            left: contentViewport.left + (contentViewport.width / contentFrame.format.cols) * posDim.col, 
            height: contentViewport.height / contentFrame.format.rows * posDim.vertSpan, 
            top : contentViewport.top + (contentViewport.height / contentFrame.format.rows ) * posDim.row
        };  
        elt.css(eltCss);
        return eltCss; 
}


module.exports = {
    sizeToViewport
}

},{}],6:[function(require,module,exports){
"use strict"; 


const numStars = 900; 

const spaceAnimate = function(ctx, canvas, options){
  
   let stars = [];  

   let movingToStaticRatio = 'movingToStaticRatio' in options 
                             ? options.movingToStaticRatio
                             : 0.5;

   for(let i = 0; i < numStars; i++){
        stars.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              z: Math.random() * canvas.width,
              o: '0.'+Math.floor(Math.random() * 99) + 1, 
              moving: Math.random() > movingToStaticRatio ? true : false
        });
    }

    let moveStars =()=>{
         stars.forEach(star => {
            if(star.moving) {
                star.z--;
                if(star.z <= 0) star.z = canvas.width;
            }
        })
    }


    let draw = function(){
        let radius = '0.'+Math.floor(Math.random() * 9) + 1  ;
        let focalLength = canvas.width *2;
        let centerX = canvas.width / 2; 
        let centerY = canvas.height / 2; 

        ctx.fillStyle = "rgba(0,10,20,1)";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(209, 255, 255, "+radius+")";
        stars.forEach(star => { 
            let pixelX = (star.x - centerX) * (focalLength / star.z);
            pixelX += centerX;
            let pixelY = (star.y - centerY) * (focalLength / star.z);
            pixelY += centerY;
            let pixelRadius = 1 * (focalLength / star.z);
            ctx.fillStyle = "rgba(233, 255, 200, "+star.o+")";
            ctx.beginPath()
            ctx.arc(pixelX, pixelY, pixelRadius, 0, Math.PI * 2, 0);
            ctx.fill()
            ctx.stroke()
 
        })
    }
  
    let animate = ()=>{
        moveStars(); 
        draw(); 
        window.requestAnimationFrame(animate);  
    } 
    animate(); 
}

const addJsEffects = function( app ){

    let animationMap = {
        "stars 1" : (ctx, canvas) => spaceAnimate(ctx, canvas, {}), 
        "stars 2" : (ctx, canvas) => spaceAnimate(ctx, canvas, {
            movingToStaticRatio :  0
         })
    }
    let spaceCanvases = document.getElementsByClassName("animated");
    for (let canvas of spaceCanvases){
        let animation = $('#' + canvas.id).data('animation-info');
        if('type' in animation){
            let ctx = canvas.getContext("2d");
            (animationMap[animation.type])(ctx, canvas); 
        }
   }
}

module.exports = {
    addJsEffects
}

},{}],7:[function(require,module,exports){
/******************************************************************************
 * 
 ******************************************************************************/
"use strict"
/******************************************************************************/
/******************************************************************************/


const ui = function( app ){
    app.ui = {}; 
    app.ui.frame = require('./frame/main.js').uiFrameFeature( app )
}


const resizeUI = function( app ){
    app.ui.visualElements.resize();
}

const addUiFeature = app => {
    ui(app);
    $(window).resize(()=>{
        resizeUI( app ); 
    })

    return app; 
}

module.exports = {
    addUiFeature
}

},{"./frame/main.js":4}],8:[function(require,module,exports){
"use strict";

const cssDef = options => screen => {

   let assign = (value, property) => {
       if(typeof value[property] === 'function'){
           return value[property](screen)
       } else {
           return value[property]
       }
   }
   let height = 0
   let width = 0

   if(options.width) width = assign( options, 'width')
   if(options.height) height = assign( options, 'height')

   return {
       left: 0, 
       top: 0, 
       width, 
       height
   }    
}

module.exports = {
    cssDef
}

},{}],9:[function(require,module,exports){
/*****************************************************************************/
"use strict"
/*****************************************************************************/

const divPerimeter = function(divID){
    let returnObject =    {
        height: $( divID ).height(), 
        width:  $( divID ).width()
    }; 

    returnObject.orientation = returnObject.height > returnObject.width 
        ? 'portrait' 
        : 'landscape'; 

    return returnObject; 
}

module.exports = {
    divPerimeter
}

},{}],10:[function(require,module,exports){
"use strict"

const featureSystem = (function(){

    let _features       = new Map()
    let _reqMajor       = 0
    let _requirements   = new Map()

    return {

        get featureList()  {
            let list = {} 
            _features.forEach((value, key)=>{
                list[key] = value
            })
            return list
        },

        implements  : function(featureLabel){
            if(!_features.has(featureLabel)) return false
            return(_features.get(featureLabel).state === 'implemented')
        }, 

        addRequirement  : function({
            req, 
            parentReq
        }) {
            if( parentReq === undefined || parentReq === null){
                _reqMajor += 1
                _requirements.set(  _reqMajor, req)
            }
        },

        includes: featureName => {
            if(_features.has(featureName)) return _features.get(featureName)
            return false
        },

        addFeature : function({
            label, 
            description, 
            state
        }){
            if(featureSystem.includes(label)){
                throw "feature already exists"
            }
            if(description === undefined || description === null){
                description = "no description"
            }
            _features.set(label, {state, description})
        }
    }

})();

const mountFeatureSystem = function( app ){
    app.features = featureSystem;
    app.addFeature = feature => featureSystem.addFeature( feature );
    app.implements = featureLabel => featureSystem.implements(featureLabel);
}

module.exports = {
    mountFeatureSystem 
};

},{}]},{},[1]);
