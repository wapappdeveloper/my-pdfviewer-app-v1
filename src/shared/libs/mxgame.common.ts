declare var cas:any;
declare var jQuery:any;
declare var Snap:any;
declare var mina:any;

export namespace MXGameCommon {
    var isMouseDrawn: boolean = false;
    var mouse:any = {x:null, y:null};
    var addPenObj:boolean = true;
    /** New draw pointer Obj Begins*/
    var allow = 0;
    var pointer:any = {
        x:null,
        y:null,
        prevX:null,
        prevY:null,
        clickX:null,
        clickY:null,
        firstDown:null,
        firstUp:null,
        downMove:false,
        down:false,
        move:false,
        up:false
    };
    /** New draw pointer Obj Ends*/

    export namespace Interfaces {

        export interface IUserRegistionInfo {
            firstname: string;
            middlename: string;
            lastname: string;
        }

        export interface IUser {
            UserRegistionInfo: IUserRegistionInfo
        }

        export interface IPlayer extends IUser {
            id: string
        }

        export interface IGame {
            id: string,
            name: string,
            paper: any, //game workmat
            preloadOnlineResourceUrls: Array<string>,
            preloadOfflineResourcePaths: Array<string>
        }

        export interface IGamingBase {
            paper: any;
        }

        export interface IGameService {
            preloadAllOfflineRessources(url: Array<string>, assetType: string): void;

            preloadAllOnlineRessources(url: Array<string>): void;

            saveGamingResult(): void

            HandleError(): void

            prepareGameItems(): void;

            //sendEmail():void;
        }
        
        export interface IPlayerService {
            getCurrentPlayer(): Interfaces.IPlayer;
        }

        export interface IActionResultMessage {
            key: string,
            value: string,
        }

        export interface IActionResult {
            pass: boolean,
            withWarning: boolean,
            messages: Array<IActionResultMessage>
        }


        export interface IGameBase {
            move(itemId: string, cords: Interfaces.ICoordinate, animation: Interfaces.AnimationType, timeSpan: number, callback: Function,afterAnimation?:any, arrLength?:any, currLength?:any): IActionResult
            flip(event: Event, flippedState: string, unFlippedState: string, flippedButton: string, styleClass: string): IActionResult
            delete(itemId: Array<string>): IActionResult
            select(itemId: string, styleClass: string): IActionResult
        }

        export interface ICoordinate {
            x: number,
            y: number
        }

        export interface IGameResult {

        }
        /**
         * Represents IUndoRedo interface
         * @interface IUndoRedo
         */
        export interface IUndoRedo {
            _initUR(appShortName:string, obj?:any):void;
            _disableUndo():void;
            _disableRedo():void;
            _disableClearAll():void;
            _enableUndo():void;
            _enableRedo():void;
            _enableClearAll():void;
            _copyStageView():void;
            _undoAction():void;
            _redoAction():void;
        }

        export enum AnimationType {
            linear = Object(mina).linear,
            backin = Object(mina).backin,
            backout = Object(mina).backout,
            bounce = Object(mina).bounce,
            easein = Object(mina).easein,
            easeout = Object(mina).easeout,
            easeinout = Object(mina).easeinout,
            elastic = Object(mina).elastic
        }
    }

    //detect Ie
    function detectIE():any {
        var ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        
        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        
        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    export namespace Services {
        export class GameService implements Interfaces.IGameService {
            queueUrls: Array<string>;
            successCount = 0;
            errorCount = 0;
            cache: Array<Object>;
            loadCount = 0;
            private isPreloading: boolean;
            workmatObj: any = {};
            hideItem: string;
            svgLoadingDone = false;

            constructor() {
                this.queueUrls = [];
                this.successCount = 0;
                this.errorCount = 0;
                this.cache = [];
            }
            preloadAllOfflineRessources(urls: Array<string>, assetType: string) {
                if (assetType == "svg") {
                    this.preloadSVG(urls);
                } else if (assetType == "image" || assetType == "audio") {
                    urls.forEach(url => {
                        this.saveUrls(url);
                    });
                    this.preLoadAll(() => {
                    }, assetType);
                }
            }
            private preloadSVG(svgArray: Array<string>) {
                var loopCount = 0,
                    imageCount = (svgArray !== undefined) ? ((svgArray.length !== undefined) ? svgArray.length : 0) : 0,
                    thiS = this,
                    loadCount = 0;

                thiS.isPreloading = true;

                jQuery.each(svgArray, function(index, value) {
                    jQuery.ajaxSetup({ async: true });
                    jQuery.get(value, function(data) {
                        var path = this.url;
                        var svgItem = (path) != undefined ? (path).split('assets/svgs/')[1] : "";
                        thiS.workmatObj[svgItem] = data.documentElement;
                        loadCount++;
                    }).always(function() {
                        loopCount++;
                        if (loopCount === imageCount && loadCount === imageCount) {
                            thiS.svgLoadingDone = true;
                            jQuery('body').attr('data','assetsdone');
                            jQuery(".loading-div").fadeOut(400);
                            console.log('all images loaded successfully');
                        } else if (loopCount === imageCount && loadCount < imageCount) {
                            thiS.svgLoadingDone = true;
                            jQuery('body').attr('data','assetsdone');
                            jQuery(".loading-div").fadeOut(400);
                            console.log('some images failed to load ', this.url);
                        }
                    });
                });
            }

            getWorkmatArray() {
                return this.workmatObj;
            }
            private saveUrls(path: string) {
                this.queueUrls.push(path);
            }

            private preLoadAll(downloadCallback: Function, assetType: string) {
                this.isPreloading = true;
                if (this.queueUrls.length === 0) {
                    downloadCallback();
                }
                for (var i = 0; i < this.queueUrls.length; i++) {
                    var path = this.queueUrls[i];
                    var obj: any = new Image();
                    var eventType: string = "load";
                    if (assetType == "audio") {
                        obj = new Audio();
                        eventType = "canplaythrough";
                    }

                    obj.addEventListener(eventType, () => {
                        this.successCount++;
                        if (this.isLoaded()) {
                            this.isPreloading = false;
                            downloadCallback();
                        }
                    }, false);
                    obj.addEventListener("error", () => {
                        this.errorCount++;
                        if (this.isLoaded()) {
                            downloadCallback();
                        }
                    }, false);
                    obj.src = path;
                    Object(this).cache[path] = obj;
                }
            }

            isLoaded() {
                return (this.queueUrls.length == this.successCount + this.errorCount);
            }

            getAsset(path: string) {
                return Object(this).cache[path];
            }


            preloadAllOnlineRessources(url: Array<string>) {

            }

            saveGamingResult() {

            }

            HandleError() {

            }

            prepareGameItems() {

            }
            sendEmail() {
                //send email to everyone
            }
        }
        export class PlayerService {
            getCurrentPlayer(): Interfaces.IPlayer {
                return new Types.Player();
            }
        }
    }
    
    /**
     * Represents class UndoRedo
     * @class UndoRedo
     * @extends DataPersistance
     * @implements Interfaces.IUndoRedo
     */
    export abstract class UndoRedo implements Interfaces.IUndoRedo{
        /**
         * tTo store the html element
         */
        stageElement:any;
        /**
         * To store element id
         */
        workmatId:string;
        /**
         * To assign callback function ready
         */
        readyM:any;
        /**
         * To assign the clallback which update all events to the relevent objects
         */
        updateEventsM:any;
        /**
         * To assign the clallback which deselect all required objects(ex: cards, buttons, etc)
         */
        updateOnActionM:any;
        /**
         * To assign the clallback which trigger before Undo executes
         */
        beforeUndoM:any;
        /**
         * To assign the clallback which trigger after Undo executes
         */
        afterUndoM:any;
        /**
         * To assign the clallback which trigger before Redo executes
         */
        beforeRedoM:any;
        /**
         * To assign the clallback which trigger after Redo executes
         */
        afterRedoM:any;
        /**
         * To assign the clallback which trigger after copystage executes
         */
        storeActionM:any
        /**
         * To set the status of undo execution
         */
        undoProcessed:boolean;
        /**
         * To store the undo redo actions as string in a array
         */
        undoredoactionArray:any;
        /**
         * Increment to check the count of undo execution
         */
        undoCount:number;
        /**
         * To assign revert undo limit
         */
        revertActionLimit:number;
        /**
         * To store undoButton id
         */
        undoBtnId:string;
        /**
         * To store undoText id
         */
        undoTxtId:string;
        /**
         * To store redoButton id
         */
        redoBtnId:string;
        /**
         * To store redoText id
         */
        redoTxtId:string;
        /**
         * To store clearAllButton id
         */
        clearAllBtnId:string;
        /**
         * To store clearAllText id
         */
        clearAllTxtId:string;
        /**
         * 
         */
        clearAllBtnControl:boolean;
        /**
         * isIeBrowser
         */
        isIeBrowser = detectIE();
        /* 
         *To store the button enable disable status
         */
        buttonStatus: any = { undo: false, redo: false, clearAll: false };
        /**
         * Represents constructor
         * @constructor
         */
        constructor(){
            //super();
            /**
             * Assign stage element id
             */
            this.workmatId = 'stage';
            /**
             * Assign undo execution status as false
             */
            this.undoProcessed = false;
            /**
             * Assign undoredoaction array as empty
             */
            this.undoredoactionArray = [];
            /**
             * Assign undo execution count as 0
             */
            this.undoCount = 0;
            /**
             * Set revert limit as 15(modified 6 to 15 on 05-04-2017)
             */
            this.revertActionLimit = 15;
        }
        /**
         * Represents the Initiate of UndoRedo.
         * @method _initUR.
         * @param {string} appShortName
         * @param {any} obj
         */
        _initUR(appShortName:string, lastAction:string, obj?:any){
            /**
             * Assign obj as empty if it is undefined
             */
            if(obj === undefined || obj === null){
                obj = {};
            }
            /**
             * Assign 'this' to thiS variable
             */
            let thiS = this;
            /**
             * Assign stage or workmat id
             */
            this.workmatId = jQuery('[data-ur="stage"]').attr('id');
            /**
             * Assign undo button id
             */
            this.undoBtnId = jQuery('[data-ur="undobtn"]').attr('id');
            /**
             * Assign undo text id
             */
            this.undoTxtId = jQuery('[data-ur="undotxt"]').attr('id');
            /**
             * Assign redo button id
             */
            this.redoBtnId = jQuery('[data-ur="redobtn"]').attr('id');
            /**
             * Assign redo text id
             */
            this.redoTxtId = jQuery('[data-ur="redotxt"]').attr('id');
            /**
             * Assign clearall button id
             */
            this.clearAllBtnId = jQuery('[data-ur="clearallbtn"]').attr('id');
            /**
             * Assign clearall text id
             */
            this.clearAllTxtId = jQuery('[data-ur="clearalltxt"]').attr('id');
            /**
             * If obj.workmatClean is undefined or true means, then
             */
            if(typeof obj.workmatClean==='undefined' || obj.workmatClean===true){
                /**
                 * Set the stage as empty
                 */
                jQuery('#'+this.workmatId).empty();
            }
            if(typeof obj.clearAllBtnControl==='undefined' || obj.clearAllBtnControl===true){
                this.clearAllBtnControl = true;
                /**
                 * disable clearall button
                 */
                this._disableClearAll();
            }else{
                this.clearAllBtnControl = false;
            }
            /**
             * Hardcode the id to store data in local storage
             */
            this.readyM = obj.ready;
            /**
             * Assign callback method to execute when need to update the evts to objects
             */
            this.updateEventsM = obj.updateEvents;
            /**
             * Assign callback method to execute deselection of objects whenever required
             */
            this.updateOnActionM = obj.updateOnAction;
            /**
             * Assign callback method to execute before undo execute
             */
            this.beforeUndoM = obj.beforeUndo;
            /**
             * Assign callback method to execute after undo execute
             */
            this.afterUndoM = obj.afterUndo;
            /**
             * Assign callback method to execute before redo execute
             */
            this.beforeRedoM = obj.beforeRedo;
            /**
             * Assign callback method to execute after redo execute
             */
            this.afterRedoM = obj.afterRedo;
            /**
             * Assign callback method to execute after copy of stage view
             */
            this.storeActionM = obj.storeAction;
            /**
             * disable the undo button
             */
            this._disableUndo();
            /**
             * disable the redo button
             */
            this._disableRedo();
            /**
             * Add click event to undo button to call undo function
             */
            jQuery('#'+this.undoBtnId).click(function(){
                /**
                 * If the method beforeUndoM is not undefined and null means, then
                 */
                if(thiS.beforeUndoM !== undefined){
                    thiS.beforeUndoM.call(thiS);
                }
                /**
                 * Call undo method
                 */
                thiS._undoAction();
                /**
                 * If the method afterUndoM is not undefined and null means, then
                 */
                if(thiS.afterUndoM !== undefined){
                    thiS.afterUndoM.call(thiS);
                }
            });
            jQuery('#'+this.redoBtnId).click(function(){
                /**
                 * If the method beforeRedoM is not undefined and null means, then
                 */
                if(thiS.beforeRedoM !== undefined){
                    thiS.beforeRedoM.call(thiS);
                }
                /**
                 * Call redo method
                 */
                thiS._redoAction();
                /**
                 * If the method afterRedoM is not undefined and null means, then
                 */
                if(thiS.afterRedoM !== undefined){
                    thiS.afterRedoM.call(thiS);
                }
            });
            /**
             * load the app from the previous session
             */
            this.loadPreviousSession(lastAction, this.workmatId);
        }
        /**
         * Represents the disable of Button Undo.
         * @method _disableUndo.
         */
        _disableUndo(){
            /**
             * Remove and add class to button element disable the button
             */
            jQuery('#'+this.undoBtnId).removeClass('enable-button').addClass('disable-button');
            /**
             * Remove and add class to text element to disable the text
             */
            jQuery('#' + this.undoTxtId).removeClass('enable-text').addClass('disable-text');
            /**
             * Remove the pointer
             */
            jQuery('#' + this.undoBtnId).removeClass('cursor-pointer').addClass('cursor-default');
            /**
             * disable the undo button status
             */
            this.buttonStatus.undo = false;
        }
        /**
         * Represents the dsable of Button Redo.
         * @method _disableRedo.
         */
        _disableRedo(){
            /**
             * Remove and add class to button element disable the button
             */
            jQuery('#'+this.redoBtnId).removeClass('enable-button').addClass('disable-button');
            /**
             * Remove and add class to button element disable the button
             */
            jQuery('#' + this.redoTxtId).removeClass('enable-text').addClass('disable-text');
            /**
             * Remove the pointer
             */
            jQuery('#' + this.redoBtnId).removeClass('cursor-pointer').addClass('cursor-default');
            /**
             * disable the redo button status
             */
            this.buttonStatus.redo = false;
        }
        /**
         * Represents the disable of Button Clear All.
         * @method _disableClearAll.
         */
        _disableClearAll(){
            /**
             * Remove and add class to button element disable the button
             */
            jQuery('#'+this.clearAllBtnId).removeClass('enable-button').addClass('disable-button');
            /**
             * Remove and add class to button element disable the button
             */
            jQuery('#' + this.clearAllTxtId).removeClass('enable-text').addClass('disable-text');
            /**
             * Remove the pointer
             */
            jQuery('#' + this.clearAllBtnId).removeClass('cursor-pointer').addClass('cursor-default');
            /**
             * disable the clearAll button status
             */
            this.buttonStatus.clearAll = false;
        }
        /**
         * Represents the enable of Button Undo.
         * @method _enableUndo.
         */
        _enableUndo(){
            /**
             * remove and add class to button element enable the button
             */
            jQuery('#'+this.undoBtnId).removeClass('disable-button').addClass('enable-button');
            /**
             * remove and add class to button element enable the button
             */
            jQuery('#' + this.undoTxtId).removeClass('disable-text').addClass('enable-text');
            /**
             * Add the pointer
             */
            jQuery('#' + this.undoBtnId).removeClass('cursor-default').addClass('cursor-pointer');
            /**
             * enable the undo button status
             */
            this.buttonStatus.undo = true;
        }
        /**
         * Represents the enable of Button Redo.
         * @method _enableRedo.
         */
        _enableRedo(){
            /**
             * Remove and add class to button element enable the button
             */
            jQuery('#'+this.redoBtnId).removeClass('disable-button').addClass('enable-button');
            /**
             * remove and add class to button element enable the button
             */
            jQuery('#' + this.redoTxtId).removeClass('disable-text').addClass('enable-text');
            /**
             * Add the pointer
             */
            jQuery('#' + this.redoBtnId).removeClass('cursor-default').addClass('cursor-pointer');
            /**
             * enable the redo button status
             */
            this.buttonStatus.redo = true;
        }
        /**
         * Represents the enable of Button Clear All.
         * @method _enableClearAll.
         */
        _enableClearAll(){
            /**
             * Remove and add class to button element enable the button
             */
            jQuery('#'+this.clearAllBtnId).removeClass('disable-button').addClass('enable-button');
            /**
             * Remove and add class to button element enable the button
             */
            jQuery('#' + this.clearAllTxtId).removeClass('disable-text').addClass('enable-text');
            /**
             * Add the pointer
             */
            jQuery('#' + this.clearAllBtnId).removeClass('cursor-default').addClass('cursor-pointer');
            /**
             * enable the clearAll button status
             */
            this.buttonStatus.clearAll = true;
        }
        /**
         * Represents the deselection of all objects in stage and buttons.
         * @method updateOnAction.
         */
        private updateOnAction(){
            /**
             * If call back is not undefined
             */
            if(this.updateOnActionM !== undefined){
                /**
                 * Call the callback method
                 */
                this.updateOnActionM.call(this);
            }
        }
        /**
         * Represents the updation of event listeners to workmat Objects.
         * @method loadHtmlStringToStage.
         * @param {string} htmlString
         * @param {string} stageElementId
         */
        private loadHtmlStringToStage(htmlString:string, stageElementId:string){
            /**
             * Remove unwanted space and newline.
             */
            //htmlString = htmlString.replace(/>[\n\t ]+</g, "><");
            /**
             * identify the tag of stage
             */
            var tag:string = jQuery("#" + stageElementId).prop('tagName');
            /**
             * If the stage elemenet is svg and ie browser means, then
             */
            if ((tag === 'g' || tag === 'svg') && this.isIeBrowser) {
                /**
                 * Snap the stage element
                 */
                let svgItem = Snap("#"+stageElementId);
                /**
                 * Clear the stage
                 */
                svgItem.clear();
                /**
                 * Count presence of images
                 */
                var imageTags:any = htmlString.match(/<image[^>]*>/g);
                /**
                 * Create array to store the image paths
                 */
                var imagePaths:any = [];
                /**
                 * Iterate by image presence count and catch the image urls to array
                 */
                for(var i=0;(imageTags && imageTags.length && i<imageTags.length);i++){
                    /**
                     * Parse image tag to get attribute
                     */
                    var elm = jQuery.parseHTML(imageTags[i]);
                    /**
                     * get image path
                     */
                    imagePaths[i] = String(jQuery(elm).attr('xlink:href'));
                    /**
                     * replace the image tag with g tag
                     */
                    htmlString = htmlString.replace(/<image[^>]*>/,'<g class="image-to-place-'+i+'"></g>');
                }
                /**
                 * Parse the HTML String
                 */
                var html:any = jQuery.parseHTML(htmlString);
                /**
                 * If html length greater than 0 means, then
                 */
                if(html && html.length && html.length>0){
                    /**
                     * Iterate by html element count
                     */
                    for(var i=0;(html && html.length && i<html.length);i++){
                        var currentElm = html[i];
                        var innerHtml = currentElm.innerHTML;
                        var tageName = String(jQuery(currentElm).prop('tagName'));
                        tageName = tageName.toLowerCase();
                        var tagIntoString = jQuery(currentElm).clone().wrapAll("<div/>").parent().html();
                        var currentFrag = Snap.parse(tagIntoString);
                        var currentSVG = currentFrag.select(tageName);
                        if(currentSVG!==null){
                            currentSVG.attr({style:'display:inline'});
                            svgItem.append(currentSVG);
                        }else{
                            console.error('issue with rendering of element');
                        }
                    }
                }
                /**
                 * Iterate by Image path count
                 */
                for(var i=0;(imagePaths && imagePaths.length && i<imagePaths.length);i++){
                    /**
                     * Feed all images to the required place in stage
                     */
                    let svgImgPlacer:any = svgItem.select('.image-to-place-'+i);
                    svgItem.select('.image-to-place-'+i).before(svgImgPlacer.paper.image(imagePaths[i]));
                    svgItem.select('.image-to-place-'+i).remove();
                }
            }else{
                jQuery("#"+stageElementId).html(htmlString);
            }
            /**
             * After load the html string in to stage, add all events to the objects
             */
            this.updateListenersToWorkmatObjects();
            /**
             * If stage is not empty
             */
            if(htmlString !== '' && this.clearAllBtnControl){
                /**
                 * Enable clearAll
                 */
                this._enableClearAll();
            }
        }
        /**
         * Represents the updation of event listeners to workmat Objects.
         * @method updateListenersToWorkmatObjects.
         */
        private updateListenersToWorkmatObjects(){
            /**
             * If method updateEventsM is not undefined
             */
            if(this.updateEventsM !== undefined){
                /**
                 * Call the callback method
                 */
                this.updateEventsM.call(this);
                /**
                 * Update the status of undo execution
                 */
                this.undoProcessed = true;
            }
        }
        /**
         * Represents the load of previous session.
         * @method loadPreviousSession.
         * @param {string} lastAction
         * @param {string} stageElementId
         */
        private loadPreviousSession(lastAction:string, stageElementId:string){
            /**
             * If lastAction not empty string means
             */
            if(typeof lastAction==='string' && lastAction !== ''){
                /**
                 * load the html string to the stage
                 */
                this.loadHtmlStringToStage(lastAction, stageElementId);
            }
            /**
             * Copy stage
             */
            this._copyStageView();
            /**
             * If read function is available then call it
             */
            if(this.readyM && typeof this.readyM==='function'){
                this.readyM.call(this);
            }
        }
        /**
         * Represents Copy Stage View.
         * @method _copyStageView.
         */
        _copyStageView(){
            /**
             * Set this to thiS
             */
            var thiS = this;
            /**
             * If undo executed means
             */
            if(thiS.undoProcessed){
                /**
                 * Set satus of undo executin as false
                 */
                thiS.undoProcessed = false;
                /**
                 * Set the undoredoaction array length to undocount
                 */
                thiS.undoredoactionArray.length = thiS.undoredoactionArray.length - thiS.undoCount;
                /**
                 * Revert the undo count as '0'
                 */
                thiS.undoCount = 0;
                /**
                 * Disable the redo button
                 */
                thiS._disableRedo();
            }
            /**
             * Get the innerHTML of element stage as string
             */
            var stageHtmlString:string;
            if(thiS.isIeBrowser){
                var cloneStage = jQuery('#'+thiS.workmatId).clone();
                var stageCopyString = cloneStage.wrap('<div></div>').parent().html();
                var onlyStageString = cloneStage.empty().append('<br>').wrap('<div></div>').parent().html();
                var stringSplit = onlyStageString.split('<br>');
                var leftString = stringSplit[0];
                var rightString = stringSplit[1];
                var stageInnerString = stageCopyString.slice(stringSplit[0].length,stageCopyString.length-stringSplit[1].length);
                stageHtmlString = stageInnerString;
            }else{
                stageHtmlString = jQuery('#'+thiS.workmatId).html();
            }
            /**
             * If the undoredoaction array length morethan 'revertActionLimit' means delete '0' index of array.
             */
            if(thiS.undoredoactionArray && thiS.revertActionLimit!==-1 && thiS.undoredoactionArray.length >= thiS.revertActionLimit){
                /**
                 * Delete the array's value in index '0'
                 */
                thiS.undoredoactionArray.shift();
            }
            /**
             * Add the next action to the undoredoaction array
             */
            //////if(stageHtmlString !== thiS.undoredoactionArray[thiS.undoredoactionArray.length -1 ])
            thiS.undoredoactionArray.push(stageHtmlString);
            /**
             * If the length of undoredoaction array is morethan 1 means
             */
            if(thiS.undoredoactionArray && thiS.undoredoactionArray.length > 1){
                /**
                 * Enable the undo button
                 */
                thiS._enableUndo();
                /**
                 * If stage not empty, then
                 */
                if(stageHtmlString !== '' && thiS.clearAllBtnControl){
                    /**
                     * Enable the clearall button
                     */
                    thiS._enableClearAll();
                }
            }
            /**
             * Store lastaction to storage
             */
            thiS.storeLastAction(thiS.undoredoactionArray);
        }
        /**
         * Represents to storage last action.
         * @method storeLastAction.
         * @param {Array} ActionArray
         */
        storeLastAction(actionArray:any){
            /**
             * Declare local variables
             */
            var action:any;
            /**
             * ActionArray is exist and length greater than '0' means
             */
            if(actionArray && actionArray.length && actionArray.length > 0){
                /**
                 * Assing the last action in loac variable
                 */
                action = actionArray[actionArray.length - 1];
            }
            /**
             * If store Action Function is available means, then
             */
            if(this.storeActionM && typeof this.storeActionM==='function'){
                /**
                 * call the method
                 */
                this.storeActionM.call(this, action);
            }
        }
        /**
         * Represents the getting of string value from array by index.
         * @method getStringFromArrayByIndex.
         * @param {number} getIndex
         */
        private getStringFromArrayByIndex(getIndex:number){
            /**
             * Set total value present in array
             */
            var arrayCount = this.undoredoactionArray.length;
            /**
             * Get the value from array by index and assign to variable
             */
            var htmlString = this.undoredoactionArray[((arrayCount-1)-getIndex)];
            /**
             * Return the string
             */
            return htmlString;
        }
        /**
         * Represents the stage to Undo.
         * @method _undoAction.
         */
        _undoAction(){
            /**
             * Set total value present in array
             */
            var arrayCount = this.undoredoactionArray.length;
            /**
             * Increment undo process count
             */
            this.undoCount++;
            /**
             * If undoredoactionArray is exist and greater than '1' and lesser than undo count, then
             */
            if(this.undoredoactionArray && this.undoredoactionArray.length > 1 && this.undoCount < this.undoredoactionArray.length){
                /**
                 * Set undo process status as 'true'
                 */
                this.undoProcessed = true;
                /**
                 * load the html string to the stage
                 */
                this.loadHtmlStringToStage(this.getStringFromArrayByIndex(this.undoCount),this.workmatId);
                /**
                 * Deselect required objects (ex: cards, buttons, etc)
                 */
                this.updateOnAction();
                /**
                 * If array count -1 is equal to undo processed count, then
                 */
                if(arrayCount-1 === this.undoCount){
                    /**
                     * Disable undo button
                     */
                    this._disableUndo();
                }
                /**
                 * If case fails, then
                 */
            }else{
                /**
                 * Decrement the undocount
                 */
                this.undoCount--;
            }
            /**
             * If undo process count is greater than '0'
             */
            if(this.undoCount > 0){
                /**
                 * Enable the redo button
                 */
                this._enableRedo();
                /**
                 * If case fails, then
                 */
            }else{
                /**
                 * Disable the redo button
                 */
                this._disableRedo();
            }
            /**
             * If the stage or workmat is empty, then
             */
            if(this.isIeBrowser){
                /**
                 * Convert tag to String
                 */
                var tagIntoString = jQuery('#'+this.workmatId).has( "g" ).clone().wrapAll("<div/>").parent().html() ;
                /**
                 * trim the string
                 */
                tagIntoString = jQuery.trim(tagIntoString);
                /**
                 * If tagIntoString is empty and clearAllButton is true, then
                 */
                if(tagIntoString === '' &&  this.clearAllBtnControl){
                    /**
                     * Disable the clearAll button
                     */
                    this._disableClearAll();
                }
            }else if(jQuery.trim(jQuery('#'+this.workmatId).html()) === '' && this.clearAllBtnControl){
                /**
                 * Disable the clearAll button
                 */
                this._disableClearAll();
            }
            /**
             * return button status object
             */
            return this.buttonStatus;
        }
        /**
         * Represents the stage to Redo.
         * @method _redoAction.
         */
        _redoAction(){
            /**
             * Set total value present in array
             */
            var arrayCount = this.undoredoactionArray.length;
            /**
             * Decrement undo process count
             */
            this.undoCount--;
            /**
             * If undoredoactionArray is exist and greater than '1' and undo processed count greater than or equal to '0'
             */
            if(this.undoredoactionArray && this.undoredoactionArray.length > 1 && this.undoCount >= 0){
                /**
                 * load html string to stage
                 */
                this.loadHtmlStringToStage(this.getStringFromArrayByIndex(this.undoCount),this.workmatId);
                /**
                 * Deselect required objects (ex: cards, buttons, etc)
                 */
                this.updateOnAction();
                /**
                 * Enable undo button
                 */
                this._enableUndo();
                /**
                 * If undo processed count is equal to '0'
                 */
                if(this.undoCount === 0){
                    /**
                     * Disable redo button
                     */
                    this._disableRedo();
                }
                /**
                 * If case fails, then
                 */
            }else{
                /**
                 * Increment the undo process count
                 */
                this.undoCount++;
            }
            /**
             * If the stage or workmat is empty, then
             */
            if(this.isIeBrowser){
                /**
                 * Convert tag to String
                 */
                var tagIntoString = jQuery('#'+this.workmatId).has( "g" ).clone().wrapAll("<div/>").parent().html() ;
                /**
                 * trim the string
                 */
                tagIntoString = jQuery.trim(tagIntoString);
                /**
                 * If tagIntoString is empty and clearAllButton is true, then
                 */
                if(tagIntoString === '' &&  this.clearAllBtnControl){
                    /**
                     * Disable the clearAll button
                     */
                    this._disableClearAll();
                }
            }else if(jQuery.trim(jQuery('#'+this.workmatId).html()) === '' && this.clearAllBtnControl){
                /**
                 * Disable the clearAll button
                 */
                this._disableClearAll();
            }
            /**
             * return button status object
             */
            return this.buttonStatus;
        }
    }
    export namespace Types {

        export class Player implements Interfaces.IPlayer {
            UserRegistionInfo: Interfaces.IUserRegistionInfo;
            id: string
            constructor() {

            }
        }

        export class Coordinate implements Interfaces.ICoordinate {
            public x: number;
            public y: number;

            constructor(_x: number, _y: number) {
                this.x = _x;
                this.y = _y;
            }

        }

        export class ActionResult implements Interfaces.IActionResult {
            pass: boolean;
            withWarning: boolean;
            messages: Array<Interfaces.IActionResultMessage>

            constructor() { }

        }

        export abstract class SVGGameingBase extends UndoRedo implements Interfaces.IGameBase {
            players: Array<Interfaces.IPlayer>;
            game: Interfaces.IGame;
            public selectedItems: Array<string>;
            deleteButton: Object;
            assetUrls: Array<string>;
            isPreloading: boolean;
            service: Services.GameService;
            count: number = 0;
            putTogetherEnableFlag = false;
            takeApartEnableFlag = false;
            deleteEnableFlag = false;
            public isCardMoving: boolean = false;
            public isLastCardMoving: boolean = false;
            isBrowserIE: boolean;
            eventType: any;
            hide: string;
            errorTimer: any = 0;
            groupXPosition: number;
            groupYPosition: number;
            isDragOut: boolean;
            groupIdCount: number;
            stageInstance = "#stage";
            isDecimal = false;
            isMixed = true;
            cardShadowWidth = 5;
            isDecimalWholeNumber = false;
            isDecimalWhole = false;
            isWhole = false;
            decLeft: number = 0;
            /* added for drawing tool*/
            tool: string = 'brush';
            offset: any;
            downx: any = 0;
            mousedown: boolean;
            movex: any;
            movey: any;
            depth: any;
            downy: any = 0;
            ipad: any = navigator.userAgent.match(/iPad/i);
            Isnexus = navigator.userAgent.match(/Nexus/i);
            NS: any = "http://www.w3.org/2000/svg";
            prevID:number = 2;
            drawingInstance = "#drawing-tool";
            currentSelectedDrawingBoard: string;
	        pcount:number=0;
            groupedItems:Array<string>;
            isTouchDevice  = 'ontouchstart' in window || (navigator.msMaxTouchPoints>0);
            isBrowserEdge = /Edge/.test(navigator.userAgent);
           
            constructor(private gameService: Interfaces.IGameService, private playerService: Interfaces.IPlayerService) {
                super();
                this.service = new Services.GameService();
                this.selectedItems = [];
                this.isBrowserIE = (window.navigator.userAgent.indexOf('Trident/') == -1) ? false : true;
                this.eventType = (('ontouchstart' in window) || (Object(window).DocumentTouch && document instanceof Object(window).DocumentTouch)) ? 'touchstart' : 'mousedown';
                this.isDragOut = false;
            }

             
            /**Getting co-ordinates during Zoom 
             * @retun: x,y coordinate
             */
            getZoomPanelTranform() {
                if(this.isBrowserIE || this.isBrowserEdge){
                    var tranformStr = jQuery("#" + this.currentSelectedDrawingBoard).find("g").attr("transform").split(" ");
                }else{
                    var tranformStr = jQuery("#" + this.currentSelectedDrawingBoard).find("g").attr("transform").split(",");
                }
                let x = parseFloat(tranformStr[tranformStr.length - 2]);
                let y = parseFloat(tranformStr[tranformStr.length - 1]);
                let scalex = parseFloat(tranformStr[0].split("(")[1]);
                let scaley = parseFloat(tranformStr[3]);
                
                return { "x": (x), "y": (y) };
            }
            
            
            /**
            * Creating svg elements
            * return the created svg element
            * @param1:x: x-coordinate of the element
            * @param2:y: y-coordinate of the element
            * @param3:id: id of the element
            */
            createSvg(x: any, y: any, optionalParam?:any){
                var obj: any={
                    groupClass:'drawing-group',
                    groupIdPrefix:'draw-',
                    shapeClass:'shape',
                    shapeIdPrefix:'pen',
                    shapeFill:'none',
                    shapeStroke:'#000000',
                    shapeStrokeWidth:'2px',
                    shapeLineCap:'round',
                    shapePointerEvents:'none'
                }
                if(optionalParam){
                    for(var prop in optionalParam){
                        obj[prop] = optionalParam[prop];
                    }
                }
                var group = document.createElementNS(this.NS, "g");
                group.setAttribute("class", obj.groupClass);
                group.setAttribute("id", obj.groupIdPrefix+ this.pcount);
                var shape = document.createElementNS(this.NS, "path");
                shape.setAttribute("class", obj.shapeClass+" pen draw-pen");
                shape.setAttribute("id", obj.shapeIdPrefix + this.pcount);
                shape.setAttribute("fill", obj.shapeFill);
                shape.setAttribute("stroke", obj.shapeStroke);
                shape.setAttribute("stroke-width", obj.shapeStrokeWidth);
                shape.setAttribute("strokeLinecap", obj.shapeLineCap);
                shape.setAttribute("pointer-events", obj.shapePointerEvents);
                shape.setAttribute("d", "M " + x + "," + y + " ");
                group.appendChild(shape)
                return group;
            }
            /**
             * Represents the new level of drawing
             * @method new_pmouseDown
             * @param event 
             * @param optionalParam 
             */
            new_pmouseDown(event: Event, optionalParam?:any){
                var obj:any = {};
                obj = event;
                pointer.firstDown = (pointer.firstDown===null)?true:false;
                pointer.firstUp = (pointer.firstUp===true)?false:pointer.firstUp;
                pointer.down = true;
                /**
                 * getting the x and y point using client and return it as object;
                 */
                pointer.clickX = pointer.prevX = pointer.x = (obj && typeof obj.clientX!=='undefined')?obj.clientX:null;
                pointer.clickY = pointer.prevY = pointer.y = (obj && typeof obj.clientY!=='undefined')?obj.clientY:null;

                return JSON.parse(JSON.stringify(pointer));
            }
            /**
             * Represents the new level of drawing
             * @method new_pmouseMove
             * @param event 
             * @param optionalParam 
             */
            new_pmouseMove(event: Event, optionalParam?:any){
                var currentMouse:any = {};
                var obj:any = {};
                obj = event;
                var mouseMoved = false;
                pointer.down = (pointer.down===true)?true:false;
                currentMouse.x = (obj && typeof obj.clientX!=='undefined')?obj.clientX:null;
                currentMouse.y = (obj && typeof obj.clientY!=='undefined')?obj.clientY:null;
                console.log(obj);
                if(pointer && ((pointer.prevX && pointer.prevX!==currentMouse.x) || (pointer.prevY && pointer.prevY!==currentMouse.y))){
                    mouseMoved = true;
                    pointer.move = true;
                    pointer.downMove = (pointer.down)?true:false;
                }else{
                    mouseMoved = false;
                    pointer.move = false;
                    pointer.downMove = false;
                }
                pointer.prevX = pointer.x = currentMouse.x;
                pointer.prevY = pointer.y = currentMouse.y;
                var svgLine:any = this.createSvg(pointer.x, pointer.y, optionalParam);
                
                if(!allow){
                    allow = 1;
                    jQuery("#drawingStage1").append(svgLine);
                }else if(pointer.downMove){
                    var depth = jQuery("#pen0").attr("d");
                    jQuery('#pen0').attr("d", depth + "L " + pointer.x + "," + pointer.y + " ");
                }
                return JSON.parse(JSON.stringify(pointer));
            }
            /**
             * Represents the new level of drawing
             * @method new_pmouseMove
             * @param event 
             * @param optionalParam 
             */
            new_pmouseUp(event: Event, optionalParam?:any){
                var currentMouse:any = {};
                var obj:any = {};
                obj = event;
                currentMouse.x = obj.clientX;
                currentMouse.y = obj.clientY;
                pointer.firstUp = (pointer.firstUp===null)?true:false;
                pointer.down = (pointer.down===true)?true:false;
                pointer.move = (pointer.move===true)?true:false;
                pointer.up = true;
                setTimeout(function(){
                    pointer.down = false;
                    pointer.move = false;
                    pointer.up = false;
                    pointer.firstUp = false;
                    pointer.firstDown = false;
                },1);
                return JSON.parse(JSON.stringify(pointer));
            }
            /**
             * Represents the new level of drawing
             * @method new_pmouseMove
             * @param event 
             * @param optionalParam 
             */
            new_pstopMove(event:Event, optionalParam?:any){
                console.log(pointer.down,'leave',this);
                if(pointer.down){
                    var coordinates = this.new_pmouseUp(event, optionalParam);
                    return coordinates;
                }else{
                    return JSON.parse(JSON.stringify(pointer));
                }
            }
            /**
             * Event called when mouse down while drawing svg element
             * @param {event} Event - object
             * @return {Object} pen
             */
            pmouseDown(event: Event, optionalParam?:any) {
                var obj:any = {};
                obj = event;
                let moveX = 73;
                var scroll = jQuery(window).scrollTop();
                mouse.x = (obj && obj.clientX)?obj.clientX:null;
                mouse.y = (obj && obj.clientY)?obj.clientY:null;
                if (this.tool == "brush") {
                    this.mousedown = true;
                    if (this.ipad != null || this.Isnexus != null){
                        if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0){
                            var rect = jQuery("#" + this.currentSelectedDrawingBoard)[0].getBoundingClientRect();
                            this.downx = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).x + (Object(event).targetTouches[0].clientX) - moveX;
                            this.downy = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).y + (Object(event).targetTouches[0].clientY + scroll);
                        } else {
                            /*var rect = jQuery(this.drawingInstance)[0].getBoundingClientRect();
                            console.log(Object(event).targetTouches);
                            this.downx = Object(event).targetTouches[0].clientX - rect.left;
                            this.downy = Object(event).targetTouches[0].clientY - rect.top;*/

                            if(jQuery(this.drawingInstance)[0]){
                                var rect = jQuery(this.drawingInstance)[0].getBoundingClientRect();
                                if(Object(event) && Object(event).targetTouches && Object(event).targetTouches[0] && (Object(event).targetTouches[0].clientX || Object(event).targetTouches[0].clientX===0) && (Object(event).targetTouches[0].clientY || Object(event).targetTouches[0].clientY===0)){
                                    this.downx = Object(event).targetTouches[0].clientX - rect.left;
                                    this.downy = Object(event).targetTouches[0].clientY - rect.top + scroll;
                                }
                            }
                        }
                    } else {
                        if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0) {
                            if (this.isTouchDevice) {
                                if (Object(event).targetTouches) {
                                    this.downx = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).x + (Object(event).targetTouches[0].clientX) - moveX;
                                    this.downy = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).y + (Object(event).targetTouches[0].clientY);
                                } else {
                                    this.downx = this.getLocalPoint(Object(event).clientX, Object(event).clientY).x + (Object(event).clientX) - moveX;
                                    this.downy = this.getLocalPoint(Object(event).clientX, Object(event).clientY).y + (Object(event).clientY);
                                }
                            } else {
                                this.downx = this.getLocalPoint(Object(event).clientX, Object(event).clientY).x + (Object(event).clientX) - moveX;
                                this.downy = this.getLocalPoint(Object(event).clientX, Object(event).clientY).y + (Object(event).clientY);
                            }
                        } else {
                            if (this.isTouchDevice) {
                                if (Object(event).targetTouches) {
                                    var drawingInstanceElement = jQuery(this.drawingInstance)[0].getBoundingClientRect();
                                    this.downx = Object(event).targetTouches[0].clientX - drawingInstanceElement.left;
                                    this.downy = Object(event).targetTouches[0].clientY - drawingInstanceElement.top;
                                } else {
                                    this.downx = Object(event).offsetX;
                                    this.downy = Object(event).offsetY;
                                }
                            } else {
                                this.downx = Object(event).offsetX;
                                this.downy = Object(event).offsetY;
                            }
                        }
                    }
                    var pen = this.createSvg(this.downx, this.downy, optionalParam);
                }
                return pen;
            }

            getLocalPoint(mouseOffsetX: number, mouseOffsetY: number) {
                if( this.currentSelectedDrawingBoard== "drawingStage1"){
                    var svg = document.querySelector("#drawingStage1") as SVGSVGElement;
                    var drawingGroup:any = document.querySelectorAll('#drawingStage1 g')[0];
                    drawingGroup = (!drawingGroup)?document.querySelectorAll('#drawingStage1')[0]:drawingGroup;
                    drawingGroup = drawingGroup as SVGSVGElement
                }else if( this.currentSelectedDrawingBoard== "drawingStage2") {
                    var svg = document.querySelector("#drawingStage2") as SVGSVGElement;
                    var drawingGroup:any = document.querySelectorAll('#drawingStage2 g')[0] as SVGSVGElement;
                }else if( this.currentSelectedDrawingBoard== "drawingStage3"){
                    var svg = document.querySelector("#drawingStage3") as SVGSVGElement;
                    var drawingGroup:any = document.querySelectorAll('#drawingStage3 g')[0] as SVGSVGElement;
                }else{
                    var svg = document.querySelector("#drawingStage3") as SVGSVGElement;
                    var drawingGroup:any = document.querySelectorAll('#drawingStage3')[0] as SVGSVGElement;
                }
                var svgPoint = svg.createSVGPoint();
                svgPoint.x = mouseOffsetX;
                svgPoint.y = mouseOffsetY;
                var svglevelpoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
               
                var grouplevelpoint = svgPoint.matrixTransform(drawingGroup.getScreenCTM().inverse());
                var x = grouplevelpoint.x - svglevelpoint.x;
                var y = grouplevelpoint.y - svglevelpoint.y;
                return { "x": (x), "y": (y) };
            }         
             
            /**
             * Event called when mouse move while drawing svg element
             * No return type
             * @param1 {event}  Event object                       
             */
            pmouseMove(event: Event, optionalParam?:any) {
                var currentMouse:any = {};
                var obj:any = {};
                var mouseMoved = false;
                obj = event;
                currentMouse.x = obj.clientX;
                currentMouse.y = obj.clientY;
                if(mouse && mouse.x && mouse.x>0 && mouse.y && mouse.y>0 && currentMouse && currentMouse.x && currentMouse.x>0 && currentMouse.y && currentMouse.y>0 && mouse.x===currentMouse.x && mouse.y===currentMouse.y){
                    mouseMoved = false;
                }else{
                    mouseMoved = true;
                }
                let moveX = 73;
                var scroll = jQuery(window).scrollTop();
                if (this.tool == "brush" && this.mousedown) {
                    var target = Object(event).target || Object(event).srcElement;
                    if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0){
                        var rect = jQuery("#" + this.currentSelectedDrawingBoard)[0].getBoundingClientRect();
                    }else{
                        var rect = jQuery(this.drawingInstance)[0].getBoundingClientRect();
					}
                    if (this.ipad != null || this.Isnexus != null) {
                        if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0) {
                            this.movex = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).x + (Object(event).targetTouches[0].clientX) - moveX;
                            this.movey = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).y + (Object(event).targetTouches[0].clientY + scroll);
                        } else {
                            /*this.movex = (Object(event).targetTouches[0].clientX - rect.left);
                            this.movey = (Object(event).targetTouches[0].clientY - rect.top);*/

                            if(Object(event) && Object(event).targetTouches && Object(event).targetTouches[0] && (Object(event).targetTouches[0].clientX || Object(event).targetTouches[0].clientX===0) && (Object(event).targetTouches[0].clientY || Object(event).targetTouches[0].clientY===0)){
                                this.movex = Object(event).targetTouches[0].clientX - rect.left;
                                this.movey = Object(event).targetTouches[0].clientY - rect.top + scroll;
                            }
                        }
                    } else {
                        if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0) {
                           if(this.isTouchDevice){
                                if(Object(event).targetTouches){                                    
                                    this.movex = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).x + (Object(event).targetTouches[0].clientX) - moveX;
                                    this.movey = this.getLocalPoint(Object(event).targetTouches[0].clientX, Object(event).targetTouches[0].clientY).y + (Object(event).targetTouches[0].clientY);
                                } else {
                                    this.movex = this.getLocalPoint(Object(event).clientX, Object(event).clientY).x + (Object(event).clientX) - moveX;
                                    this.movey = this.getLocalPoint(Object(event).clientX, Object(event).clientY).y + (Object(event).clientY);
                                }
                            } else {
                                this.movex = this.getLocalPoint(Object(event).clientX, Object(event).clientY).x + (Object(event).clientX) - moveX;
                                this.movey = this.getLocalPoint(Object(event).clientX, Object(event).clientY).y + (Object(event).clientY);
                            }
                        } else {
                            if (this.isTouchDevice) {
                                if (Object(event).targetTouches) {
                                    var drawingInstanceSrcElement = jQuery(this.drawingInstance)[0].getBoundingClientRect();
                                    this.movex = Object(event).targetTouches[0].clientX - drawingInstanceSrcElement.left;
                                    this.movey = Object(event).targetTouches[0].clientY - drawingInstanceSrcElement.top;
                                }else{                                     
                                    this.movex = Object(event).offsetX;
                                    this.movey = Object(event).offsetY;
                                }                                
                            }else{                                
                                this.movex = Object(event).offsetX;
                                this.movey = Object(event).offsetY;
                            }
                        }
                    }
                    var id = this.pcount;
                 
                    if (this.movex != 0 || this.movey != 0) {
                        if(mouseMoved && addPenObj){
                            addPenObj = false;
                            var pen = this.createSvg(this.downx, this.downy, optionalParam);
                            if(optionalParam && optionalParam.callback && typeof optionalParam.callback==='function'){
                                optionalParam.callback.call(this, pen);
                            }
                        }
                        var attr = jQuery("#pen" + id).attr('d');
                        if (typeof attr !== typeof undefined && mouseMoved) {
                            var depth = jQuery("#pen" + id).attr("d");
                            jQuery('#pen' + id).attr("d", depth + "L " + this.movex + "," + this.movey + " ");
                            isMouseDrawn = true;
                        }

                        if (this.movex != this.downx && this.movey != this.downy) {
                            this.enableDisableButton([".clear-disabled-group"], false);
                            this.enableDisableButton([".clear-group"], true);
                            //jQuery(".clear-tool .buttonimage").removeClass("pointer-events-none");
                            //jQuery("#clear-svg").addClass("buttonImage");
                            //jQuery("#clear-all").addClass("text-delete");
                        }
                    }
                    if (this.ipad != null || this.Isnexus != null) {
                        if(Object(event) && Object(event).targetTouches && Object(event).targetTouches[0] && (Object(event).targetTouches[0].clientX || Object(event).targetTouches[0].clientX===0) && (Object(event).targetTouches[0].clientY || Object(event).targetTouches[0].clientY===0)){
                            this.downx = Object(event).targetTouches[0].clientX - rect.left;
                            this.downy = Object(event).targetTouches[0].clientY - rect.top;
                        }
                    }
                }
           }
            /**
             * Event called when mouse up while drawing svg element
             * No return type
             * @param1:event: Event object
             */
            pmouseUp(event: Event, optionalParam?:any) {
                addPenObj = true;
                var callbackObj:any = {drawn:false};
                if (this.tool == "brush" && this.mousedown) {
                    this.mousedown = false;
                    this.downx = this.downy = this.movex = this.movey = this.depth = 0;

                    var id = this.pcount;
                    var attr = jQuery("#pen" + id).attr('d');
                   
                    if (typeof attr !== typeof undefined) {
                        if (!(jQuery("#pen" + id).attr("d").indexOf("L") > -1)) {
                            jQuery("#pen" + id).remove();
                        }else{
                            if(optionalParam && optionalParam.widthext && optionalParam.sidediff){
                                this.createGroup(id,optionalParam);
                            }else{
                                this.createGroup(id);
                            }
                             
                        }
                    }
                    if (isMouseDrawn) {
                        callbackObj.drawn = isMouseDrawn;
                        if(optionalParam && optionalParam.callback && typeof optionalParam.callback==='function'){
                            optionalParam.callback.call(this, callbackObj);
                        }
                        isMouseDrawn = false;
                    }
                }
                if(jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0){
                    var cond = this.tool!= "brush" && this.tool!= "stamp";
                }else{
                    var cond = this.tool!= "brush";
                }
              
                if (cond) {
                    let currentTargetId:any;
                    if (event.srcElement) {
                        currentTargetId = event.srcElement.id;
                    } else if (event.target) {
                        /*
                         * for firefox
                         */                      
                        currentTargetId = jQuery(event.target).attr('id'); 
                    }
                    if(currentTargetId=="drawing-tool" || currentTargetId=="drawingStage1" || currentTargetId=="drawingStage2" || currentTargetId=="drawingStage3"){
                   /*
                        if condition checks mouse is clicked outside the selection area (pointing parent element).
                    */
                        //this.panZoom[this.selectedFront].enablePan();

                        var selectedClass = jQuery(event.target).attr("class");
                        var selectedId = jQuery("#drawingStage2:visible").length;
                        var cond_highlight = selectedClass != "invisible" && selectedClass != "highlight" && selectedClass != "stampbtn";
                        if (cond_highlight) {
                            if (jQuery("#drawingStage1:visible").length > 0){
                                var selectedObj = jQuery("#drawingStage1 .selectedGroup");
                            } else if (jQuery("#drawingStage2:visible").length > 0){
                                var selectedObj = jQuery("#drawingStage2 .selectedGroup");
                            } else if (jQuery("#drawingStage3:visible").length > 0){
                                var selectedObj = jQuery("#drawingStage3 .selectedGroup");
                            } else {
                                var selectedObj = jQuery("#drawing-tool .selectedGroup");
                            }

                            selectedObj.each(function (index) {
                                if (jQuery(".selectedGroup").find('rect').hasClass("highlight")) {
                                    jQuery(".selectedGroup").find('.highlight').addClass("invisible");
                                    jQuery(".selectedGroup").find('.highlight').removeClass("highlight");
                                }
                                if (jQuery(".selectedGroup").find('rect').hasClass("rectvisible")) {
                                    jQuery(".selectedGroup").find('.rectvisible').addClass("recthide");
                                    jQuery(".selectedGroup").find('.recthide').removeClass("rectvisible");
                                }
                                selectedObj.next("g").removeClass("stampShape");
                                selectedObj.removeClass("selectedGroup");
                                jQuery(".selectedShape").addClass("displaynone");
                            });
                            jQuery('#trashButton').find('svg').addClass('pointer-events-none');
                            this.enableDisableButton(["#trash-disabled", ".trash-disabled-group"], true);
                            this.enableDisableButton(["#trash", ".trash-group"], false);
                            jQuery('#trashButton').find('#trash').addClass('display-none');
                            //for IE
                            //jQuery('.bottom-panel').removeClass('on-select');
                            //jQuery("#delete-text").removeClass("text-delete");
                            //jQuery("#delete-svg").removeClass("buttonImage");
                        }
                    }
                }
                this.pcount++;
            }
            /**
             * Event called when mouse leaves the drawing area
             * No return type
             * event: Event object
		     */
            pstopMove(event:Event){
                if(this.mousedown){
                    this.pmouseUp(event);
                }
            }
            
            /**
             * To highlight the svg element
             * No return type
             * @param1:event: event to object for respective event
             */
            getHighlighted(event: Event, callback?:Function) {
                if (this.tool && this.tool != "brush") {
                    var id = jQuery(event.target)[0].id;
                    var targetId = jQuery(event.currentTarget).attr('id');
                    let startChar = targetId.charAt(0);
                    let changeId: any;
                    var calbackObj:any = {};
                    if (startChar == 'g') {
                        let invisible = jQuery('#' + targetId).find('.invisible').attr('id');
                        let highlight = jQuery('#' + targetId).find('.highlight').attr('id');
                        if (invisible != null || invisible != undefined) {
                            changeId = jQuery('#' + targetId).find('.invisible').attr('id');
                        }
                        if(highlight !=null || highlight != undefined  ){
                             changeId = jQuery('#'+targetId).find('.highlight').attr('id'); 
                        }
                        id = changeId;
                    }
                    var gid = id.split("_")[1];
                    if (jQuery('#' + id).hasClass('highlight')) {
                        jQuery('#' + id).addClass("invisible");
                        jQuery('#' + id).removeClass("highlight");
                        jQuery('#g_' + gid).find("rect:not('#" + id + "')").addClass("recthide");
                        jQuery(".trash-button .buttonimage").removeClass("pointer-events-none");
                        jQuery('#g_' + gid).find("rect:not('#" + id + "')").removeClass("rectvisible");
                        jQuery('#pen' + gid).removeClass("selectedGroup");
                        jQuery('#g_' + gid).removeClass("selectedGroup");
                       
                        if (jQuery(".selectedGroup").length == 0) {
                            /*for IE */
                            this.enableDisableButton([".trash-group", "#trash"], false);
                            this.enableDisableButton([".trash-disabled-group", "#trash-disabled"], true);
                            
                            //jQuery("#delete-svg").removeClass("buttonImage");
                            //jQuery("#delete-text").removeClass("text-delete");
                            //jQuery('.bottom-panel').removeClass('on-select');

                            jQuery(".trash-button .buttonimage").addClass("pointer-events-none");
                        }
                        calbackObj.selected = false;
                    } else {
                        /*for IE */
                        this.enableDisableButton([".trash-disabled-group", "#trash-disabled"], false);
                        this.enableDisableButton([".trash-group", "#trash"], true);
                        jQuery(".trash-button .buttonimage").removeClass("pointer-events-none");

                        jQuery('#' + id).addClass("highlight");
                        jQuery('#g_' + gid).find("rect:not('#" + id + "')").removeClass("recthide");
                        jQuery('#g_' + gid).find("rect:not('#" + id + "')").addClass("rectvisible");
                        jQuery('#pen' + gid).addClass("selectedGroup");
                        jQuery('#g_' + gid).addClass("selectedGroup");
                        jQuery('#' + id).removeClass("invisible");

                        //jQuery("#delete-text").addClass("text-delete");
                        //jQuery("#delete-svg").addClass("buttonImage");
                        //jQuery('.bottom-panel').addClass('on-select');

                        calbackObj.selected = true;
                    }
                }
                if(callback && typeof callback==='function'){
                    callback.call(this, calbackObj);
                }
                return false;
            }



            /*  
            **created svg rectangle elements around the selected element
            ** @param1:value: id of the element
            */
            createGroup(id: any,optionalParam?:any) {
                var widthext:number,sidediff:number;
                var obj : any = {};
                if (optionalParam){
                   obj =  optionalParam;
                }
                let penID = jQuery("#pen" + id);
                if (penID.length > 0) {
                    let childPos = penID.offset(); 
                    if(obj && obj.widthext && obj.sidediff){
                        widthext = obj.widthext;
                        sidediff = obj.sidediff;
                        let diffMinus = 10;
                        let parentPos = penID.parent().parent().offset();
                        var top = penID[0].getBoundingClientRect().top - this.getZoomPanelTranform().y - diffMinus;
                        var left = (childPos.left - parentPos.left) - this.getZoomPanelTranform().x - diffMinus;
                        var width = (penID[0].getBoundingClientRect().width + widthext);
                        var height = (penID[0].getBoundingClientRect().height + sidediff);
                    } else if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0) {
                        widthext = 24;
                        sidediff = 26;
                        let diffMinus = 10;
                        let parentPos = penID.parent().parent().offset();
                        var top = penID[0].getBoundingClientRect().top - this.getZoomPanelTranform().y - diffMinus;
                        var left = (childPos.left - parentPos.left) - this.getZoomPanelTranform().x - diffMinus;
                        var width = (penID[0].getBoundingClientRect().width + widthext);
                        var height = (penID[0].getBoundingClientRect().height + sidediff);
                    } else {
                        widthext = 10;
                        sidediff = 5;
                        let parentPos = penID.parent().offset();
                        var top = penID[0].getBoundingClientRect().top - sidediff;
                        var left = (childPos.left - parentPos.left) - sidediff;
                        var width = penID[0].getBoundingClientRect().width + widthext;
                        var height = penID[0].getBoundingClientRect().height + widthext;
                    }
                    let cornerHeight = "20";
                    let cornerWidth = "20";
                    let diff: number = 10;
                    const bound=Snap("#pen" + id).getBBox()
                   var group = document.createElementNS(this.NS, 'g');
                    group.setAttribute("id", "g_" + id);
                    group.setAttribute("class", "grphide");
                    var rect = document.createElementNS(this.NS, 'rect');
                    rect.setAttribute("id", "rect_" + id);
                    rect.setAttribute("width", (width+widthext).toString());
                    rect.setAttribute("height", height.toString());
                    rect.setAttribute("x", (bound.x-widthext).toString());
                    rect.setAttribute("y", bound.y.toString());
                    rect.setAttribute("class", "invisible");
                    var cornerTop = this.getCornerRect(cornerWidth, cornerHeight, (bound.x-(widthext*2)).toString(), (bound.y-widthext).toString(), "recthide");
                    var cornerRight = this.getCornerRect(cornerWidth, cornerHeight, bound.x2.toString(), (bound.y-widthext).toString(), "recthide");
                    var cornerBottom = this.getCornerRect(cornerWidth, cornerHeight, bound.x2.toString(), bound.y2.toString(), "recthide");
                    var cornerLeft = this.getCornerRect(cornerWidth, cornerHeight, (bound.x-(widthext*2)).toString(), bound.y2.toString(), "recthide");
                    if (jQuery("#drawingStage1").length > 0 || jQuery("#drawingStage2").length > 0 || jQuery("#drawingStage3").length > 0){
                         jQuery("#pen" + id)[0].parentNode.insertBefore(group, jQuery("#pen" + id)[0]);
                    } else {
                        document.querySelector('#draw-'+this.pcount).appendChild(group);
                    }
                    group.appendChild(rect);
                    group.appendChild(cornerTop);
                    group.appendChild(cornerRight);
                    group.appendChild(cornerBottom);
                    group.appendChild(cornerLeft);
                }
            }
            /**
             * Creating rectangle appearing at corner while selecting an element
             * Return created svg element
             * @param1:width: width of the element
             * @param2:Height: height of the element
             * @param3: x: x-coordinate of the element
             * @param4:y: y-coordinate of the element
             */
            getCornerRect(width: any, height: any, x: any, y: any, clas: any) {
                var cornerRect = document.createElementNS(this.NS, 'rect');
                cornerRect.setAttribute("width", width);
                cornerRect.setAttribute("height", height);
                cornerRect.setAttribute("x", x);
                cornerRect.setAttribute("y", y);
                cornerRect.setAttribute("class", clas);
                return cornerRect;
            }
            /**
             * Enable and disable button depending upon condition
             * @param1:id-id or class of specific element
             * @param2:enable-true or false,true to enable button and false to disable
             */
            enableDisableButton(id: any, enable: boolean) {
                for (var i = 0; i < id.length; i++) {
                    enable ? jQuery(id[i]).removeClass("display-none") : jQuery(id[i]).addClass("display-none");
                }
            }
            
             
            /**
             * Enable the button after clicked 
             * @param1:value: the vale of the button
             */
            clickActive(value: string) {
                jQuery("#" + value + "-svg").removeClass("buttonimage");
                this.enableDisableButton(["." + value + "-disabled-group", "." + value + "-group"], false);
                this.enableDisableButton(["." + value + "-down-group"], true);
            }
        
          
            /**
             * Disable the button after clicked 
             * @param1:value: the vale of the button
             */
            clickInActive(value: string) {
                jQuery("#" + value + "-svg").removeClass("buttonimage");
                this.enableDisableButton(["." + value + "-down-group", "." + value + "-disabled-group"], false);
                this.enableDisableButton(["." + value + "-group"], true);
            }

            move(itemId: string, cords: Interfaces.ICoordinate, animation: Interfaces.AnimationType, timeSpan: number, callback: Function, afterAnimation?:any, arrLength?:number, currCount?:number): Interfaces.IActionResult {
                let svgItem = Snap("#" + itemId);
                jQuery("#" + itemId).data("isMoving", true);
                svgItem.animate({
                    transform: 't' + cords.x + ', ' + cords.y
                }, timeSpan || 500, animation || Object(Interfaces).AnimationType.linear, () => {
                    callback(itemId);
                    jQuery("#" + itemId).data("isMoving", false);
                    if(jQuery("#" + itemId).attr('data') !=  undefined){                       
                        var cardDetails = JSON.parse(jQuery("#" + itemId).attr('data'));
                        var cardCoordinates = this.getCoordinate(itemId);
                        cardDetails.x = cardCoordinates.x;
                        cardDetails.y = cardCoordinates.y;
                        jQuery("#" + itemId).attr('data',JSON.stringify(cardDetails));

                        if(afterAnimation && typeof afterAnimation==='function' && (arrLength || arrLength===0) && (currCount || currCount===0)){
                            (arrLength === currCount)?afterAnimation.call(this):'';
                        }else if(afterAnimation && typeof afterAnimation==='function'){
                            afterAnimation.call(this);
                        }
                    }
                });
                return new ActionResult();
            }
            /**
             * Represents to get the 'x' and 'y' position of Card by id.
             * @method getCoordinate
             * @param {string} itemId - id of the card.
             */
            getCoordinate(itemId:string){
                let svgItem = Snap("#" + itemId);
                var bb: any = svgItem.getBBox();
                let parentLeft: number = bb.x;
                let parentTop: number = bb.y;
                return {"x":parentLeft,"y":parentTop};
            }
            
            clone(itemId: string) {
                Snap("#" + itemId).clone();
            }

            delete(): Interfaces.IActionResult {
                this.selectedItems.forEach(element => {
                    Snap("#" + element).remove();
                });
                this.selectedItems = [];

                jQuery(this.deleteButton).addClass(this.hide);
                return new ActionResult();
            }
             /**
             * Represents the deleting of card by id.
             * @method deleteCardById
             * @param {string} getId - id of the card.
             */
            deleteCardById(getId:string): Interfaces.IActionResult {
                Snap("#" + getId).remove();
                return new ActionResult();
            }
            select(itemId: string, styleClass: string): Interfaces.IActionResult {
                var rect = jQuery("#" + itemId).find('rect');
                let svgItem = Snap("#" + itemId);
                svgItem = Snap(Object(svgItem));
                if (Object(svgItem).hasClass(styleClass)) {
                    Object(svgItem).removeClass(styleClass);
                } else {
                    Object(svgItem).addClass(styleClass);
                }
                this.saveSelectedItem(itemId);
                return new ActionResult();
            }
            getSelectedItemArray() {
                return this.selectedItems;
            }
            getGroupItemArray(groupItems: any) {
                let groupedItems: Array<string> = [];
                //for dropshadow
                var rectWidth = jQuery("#" + groupItems[0]).find(".card_filter").data("filtername");
                if(rectWidth === undefined){
                    rectWidth = JSON.parse(jQuery("#" + groupItems[0]).attr('data'));
                    rectWidth = rectWidth.width;
                }
                jQuery("#" + groupItems[0]).find(".card_filter").attr("width", rectWidth).attr("x", "0");
                for (var index = 0; index < groupItems.length; index++) {
                    //for dropshadow
                    jQuery("#" + groupItems[index]).find("filter").removeClass(this.hide);
                    jQuery(jQuery("#" + groupItems[index]).children()[1]).children().filter(".card_filter").removeAttr("style")

                    let tempItem: any;
                    tempItem = Snap("#" + groupItems[index]);
                    groupedItems.push(groupItems[index]);
                }
                return groupedItems;

            }

            setSelectedItemArray(selectedItems: Array<string>) {
                this.selectedItems = selectedItems;
            }

            setDeleteButtonInstance(deleteButtonId: string) {
                this.deleteButton = jQuery("#" + deleteButtonId);
            }
            
            /** This method is used to deselect all selected items 
             * @param {Array} items 
             * @param {string} styleClass
             */
            deselectAllItems(items: Array<string>, styleClass: string) {
                items.forEach(item => {
                    if (jQuery("#" + item).hasClass("selected-operations")) {
                        jQuery("#" + item).removeClass("selected-operations");
                    }
                    if (jQuery("#" + item).hasClass("selected")) {
                        jQuery("#" + item).removeClass("selected");
                    }
                });
                jQuery(this.deleteButton).addClass(this.hide);
                this.setSelectedItemArray([]);
            }
            /** This method is used to select all grouped items 
             * @param {Array} items 
             * @param {string} styleClass
             */
            selectAllGroupItems(items: Array<string>, styleClass: string) {
                items.forEach(item => {
                    jQuery("#" + item).addClass(styleClass);
                });
                jQuery(this.deleteButton).removeClass(this.hide);
                this.setSelectedItemArray(items);
            }

            public saveSelectedItem(itemId: string,selectall?:boolean) {
                var itemSavedIndex = this.selectedItems.indexOf(itemId);
                if(itemSavedIndex == -1) {
                    this.selectedItems.push(itemId);
                }else{
                    if(selectall === undefined || selectall === false){
                        this.selectedItems.splice(itemSavedIndex, 1);
                    }
                }                
            }

            flip(object: Event, flippedState: string, unFlippedState: string, flippedButton: string, styleClass: string): Interfaces.IActionResult {
                if (jQuery(object.currentTarget).hasClass(styleClass)) {
                    jQuery(object.currentTarget).parent().parent().data("isFlipped", false);
                    jQuery(object.currentTarget).removeClass(styleClass)
                    jQuery("#" + unFlippedState).append(jQuery("#" + flippedButton))
                    jQuery("#" + flippedState).addClass(this.hide);
                    jQuery("#" + unFlippedState).removeClass(this.hide);
                } else {
                    jQuery(object.currentTarget).addClass(styleClass);
                    jQuery(object.currentTarget).parent().parent().data("isFlipped", true);
                    jQuery("#" + flippedState).append(jQuery("#" + flippedButton));
                    jQuery("#" + flippedState).removeClass(this.hide);
                    jQuery("#" + unFlippedState).addClass(this.hide);
                }
                return new ActionResult();
            }

            drag(itemId: string, constaints: any, isGroup: boolean): Interfaces.IActionResult {
                var item = Object(Snap("#" + itemId));
                if (isGroup) {

                    let cardLeftPadding = item.attr("cardLeftPadding");
                    let tempDragItemFirstcardId = Object(item.select("g")).attr("id");
                    let tempDragItemFirstcard = Object(Snap("#" + tempDragItemFirstcardId));

                    let height = tempDragItemFirstcard.getBBox().height;
                    let width = item.getBBox().width;

                    let left = (tempDragItemFirstcard.matrix.invert().e);
                    let top = (tempDragItemFirstcard.matrix.invert().f) - height;


                    left = (constaints.left - tempDragItemFirstcard.matrix.e) - this.cardShadowWidth;
                    top = (constaints.top - tempDragItemFirstcard.matrix.f) - this.cardShadowWidth;

                    this.dragGroupItem({ x: 0, y: 0, minx: tempDragItemFirstcard.matrix.invert().e + this.cardShadowWidth, miny: tempDragItemFirstcard.matrix.invert().f + this.cardShadowWidth, maxx: left, maxy: top }, item, tempDragItemFirstcard, cardLeftPadding);
                } else {
                    this.dragItem({ x: 0, y: 0, minx: this.cardShadowWidth, miny: this.cardShadowWidth, maxx: constaints.left - this.cardShadowWidth, maxy: constaints.top - this.cardShadowWidth }, Object(item));
                }
                return new ActionResult();
            }

            dragItem(params: any, inst: any) {
                inst.data('minx', params.minx); inst.data('miny', params.miny);
                inst.data('maxx', params.maxx); inst.data('maxy', params.maxy);
                inst.data('x', params.x); inst.data('y', params.y);
                inst.data('ibb', inst.select('rect').getBBox());
                inst.data('ot', inst.transform().local);
                inst.drag(this.dragMove, this.dragStart, inst.stop);
                return inst;
            }

            dragGroupItem(params: any, inst: any, firstCardInst: any, cardLeftPadding: number) {
                inst.data('minx', params.minx); inst.data('miny', params.miny);
                inst.data('maxx', params.maxx); inst.data('maxy', params.maxy);
                inst.data('x', params.x); inst.data('y', params.y);
                inst.data('ibb', firstCardInst.getBBox());
                inst.data('cardLeftPadding', cardLeftPadding);
                inst.data('ot', inst.transform().local);
                inst.drag(this.dragMove, this.groupDragStart, inst.stop);
                return inst;
            };
            
            dragMove = function(dx: number, dy: number, inst: any) {
                var el = document.getElementById('stage');
                var thiS = Object(el).self;
                if(thiS.makeOnTop){
                    thiS.makeOnTop(this.node);
                }
                if(thiS.stickyPutTogether){
                    thiS.stickyPutTogether(this);
                }
                let tdx: number, tdy: number;
                var sInvMatrix = this.transform().globalMatrix.invert();
                sInvMatrix.e = sInvMatrix.f = 0;
                tdx = sInvMatrix.x(dx, dy); tdy = sInvMatrix.y(dx, dy);
                let constraintWidth = this.data('ibb').width;
                if(this.attr("id").indexOf("group") != -1) {
                    this.data('x', +this.data('ox') + dx);
                    this.data('y', +this.data('oy') + dy);
                    constraintWidth = parseInt(this.data('ibb').width) + parseInt(this.data('cardLeftPadding'));
                }else{
                    this.data('x', +this.data('ox') + dx);
                    this.data('y', +this.data('oy') + dy);
                    constraintWidth = this.data('ibb').width;
                }

                if (this.data('x') > this.data('maxx') - constraintWidth) {
                    this.data('x', this.data('maxx') - constraintWidth);
                };

                if (this.data('y') > this.data('maxy') - this.data('ibb').height) {
                    this.data('y', this.data('maxy') - this.data('ibb').height)
                };

                if (this.data('x') < this.data('minx')) { this.data('x', this.data('minx')) };
                if (this.data('y') < this.data('miny')) { this.data('y', this.data('miny')) };


                var el = document.getElementById('stage');
                var thiS = Object(el).self;
               
               if(this.attr('data') != null){  // if scc cards are decimal 
                  this.attr("data").indexOf('isDecimal":true') != -1 && this.attr("id").indexOf("group") != -1 ?
                    this.node.getBoundingClientRect().width > 240 ?  
                        this.transform("T" + [this.data('x') + 42, this.data('y')]) : 
                        this.transform("T" + [this.data('x') + 21, this.data('y')]):
                    this.transform("T" + [this.data('x'), this.data('y')]); 
               }
               else{
                    this.transform("T" + [this.data('x'), this.data('y')]);
               }
                (dx!==0 && dy!==0)?thiS.cardDragged = true:'';
            };

            dragStart = function(x: number, y: number, ev: Event, inst: any) {
                this.data('ox', this.getBBox().x); this.data('oy', this.getBBox().y);
            };

            groupDragStart = function(x: number, y: number, ev: Event) {
                let tempDragItemFirstcardId = Object(this.select("g")).attr("id");
                let tempDragItemFirstcardInst = Object(Snap("#" + tempDragItemFirstcardId));
                this.data('ox', this.getBBox().x - tempDragItemFirstcardInst.matrix.e); this.data('oy', this.getBBox().y - tempDragItemFirstcardInst.matrix.f);
            };

            displayErrorMessage(value: string, errorMessageWindow: any) {
                jQuery(errorMessageWindow).find(".error-msg").html(value)
                jQuery(errorMessageWindow).removeClass(this.hide);
                this.errorTimer = setTimeout(() => { jQuery(errorMessageWindow).addClass(this.hide); clearTimeout(this.errorTimer) }, 10000);
            }

            enableDisableControls(controlId: Array<string>, styleClass: string, flag: boolean, textClass: string) {
                this.deleteEnableFlag = false;
                if (controlId[0].indexOf("puttogether") != -1 || (controlId[0].indexOf("group") != -1 &&  controlId[0].indexOf("ungroup") === -1)) {
                    this.putTogetherEnableFlag = flag;
                }
                if (controlId[0].indexOf("ungroup") != -1) {
                    this.takeApartEnableFlag = flag;
                }
                if (controlId[0].indexOf("takeapart") != -1) {
                    this.takeApartEnableFlag = flag;
                }
                if (controlId[0].indexOf("delete") != -1) {
                    this.deleteEnableFlag = true;
                }

                if (flag == false) {
                    jQuery("#" + controlId[0]).removeClass(styleClass);
                    jQuery("#" + controlId[1]).removeClass(this.hide);
					jQuery("." + controlId[1]).removeClass(this.hide);
                    jQuery("#" + controlId[2]).addClass(this.hide);
					jQuery("." + controlId[2]).addClass(this.hide);
                    jQuery("#" + controlId[3]).addClass(textClass);
                    this.deleteEnableFlag ? jQuery(".bottom-panel").removeClass(textClass) : "";

                    if (controlId[0] === 'puttogether-svg') {
                        jQuery("#puttogether-svg-active").addClass(this.hide);
                    }
                    if (controlId[0] === 'takeapart-svg') {
                        jQuery("#takeapart-svg-active").addClass(this.hide);
                    }
                } else {
                    jQuery("#" + controlId[0]).addClass(styleClass);
                    jQuery("#" + controlId[1]).addClass(this.hide);
					jQuery("." + controlId[1]).addClass(this.hide);
                    jQuery("#" + controlId[2]).removeClass(this.hide);
					jQuery("." + controlId[2]).removeClass(this.hide);
                    jQuery("#" + controlId[3]).removeClass(textClass);
                    this.deleteEnableFlag ? jQuery(".bottom-panel").addClass(textClass) : "";

                    if (controlId[0] === 'puttogether-svg') {
                        jQuery("#puttogether-svg-active").removeClass(this.hide);
                    }
                    if (controlId[0] === 'takeapart-svg') {
                        jQuery("#takeapart-svg-active").removeClass(this.hide);
                    }

                    if (controlId[0] === 'group-svg') {
                        jQuery("#group-svg-active").removeClass(this.hide);
                    }
                    if (controlId[0] === 'ungroup-svg') {
                        jQuery("#ungroup-svg-active").removeClass(this.hide);
                    }
                }
            }

            swapDepth(container: any, card: any) {
                Snap(container).append(card);
            }

            setCordinates(itemId: string, left: number, top: number) {
                Object(Snap("#" + itemId)).transform('t' + left + ',' + top);
            }
            /** This method is used to group array elements
              * @param {Array}  itemArray   
              * @param {string}  highestItem
              * @param {string}  itemGroupId
              * @param {class}  animationType - Card amimation Class.
              * @param {number}  animationDuration
              * @param {any}  mixedCardValuesForGrouping
              * @param {any}  selectItem
              */
            groupMixedItems(itemArray: Array<any>, highestItem: string, itemGroupId: string, animationType: Interfaces.AnimationType, animationDuration: number, mixedCardValuesForGrouping: any, selectItem: any, afterAnimation?:any) {
                let highestItemInst = Snap("#" + highestItem);
                let itemGroup = Object(Snap("#" + itemGroupId));
                var bb: any = highestItemInst.getBBox();
                let left: number = bb.x;
                let top: number = bb.y;
                let highestItemBBox: any = highestItemInst.select('rect').getBBox();
                let totalLeftPadding = 0;
                let cnt = 0;
                let prevItemWidth = 0;
                let isHighestItemAppended = false;

                itemArray.forEach((item: string, i: number) => {
                    //for dropshadow
                    jQuery("#" + item).find("filter").addClass(this.hide);
                    jQuery(jQuery("#" + item).children()[1]).children().filter(".card_filter").attr("style", "display:none!important");
                    let cardValue = parseInt(jQuery(jQuery("#" + item).find("#card_smalltext tspan")[0]).text());
                    if (cardValue < 1) {
                        this.isDecimal = true;
                        isHighestItemAppended = true;
                        cnt++;
                        var tempLeft = 0;
                        this.isBrowserIE ? tempLeft = 21 : '';
                        highestItemInst.select('rect').getBBox().width == 75 ? tempLeft = 0 : '';
                        left = (mixedCardValuesForGrouping.initDecimalGroupPosition + (mixedCardValuesForGrouping.mixedCardLeftOffsets[0] * (mixedCardValuesForGrouping.decimalArLength - i)) - mixedCardValuesForGrouping.mixedCardLeftOffsets[2]) - tempLeft;

                        if (i == 0) {
                            if (mixedCardValuesForGrouping.wholeArrayLength == 0) {
                                totalLeftPadding = (Object(Snap("#" + item).getBBox()).width + (mixedCardValuesForGrouping.mixedCardLeftOffsets[0] * mixedCardValuesForGrouping.decimalArLength) - mixedCardValuesForGrouping.mixedCardLeftOffsets[2] - mixedCardValuesForGrouping.mixedCardLeftOffsets[3]);
                            } else {
                                totalLeftPadding = (Object(Snap("#" + item).getBBox()).width + (mixedCardValuesForGrouping.wholeArrayLength * mixedCardValuesForGrouping.mixedCardLeftOffsets[1]) + (mixedCardValuesForGrouping.mixedCardLeftOffsets[0] * mixedCardValuesForGrouping.decimalArLength) - mixedCardValuesForGrouping.mixedCardLeftOffsets[2]);
                            }
                        }
                    } else {
                        var marginLeft = 0;
                        this.isBrowserIE ? marginLeft = 18 : '';
                        if (this.isBrowserIE) {
                            if (Object(Snap("#" + item).getBBox()).width < 80) {
                                marginLeft = marginLeft - 20;
                            }
                        }
                        left = (bb.x + marginLeft + (highestItemBBox.width - Object(Snap("#" + item).getBBox()).width));
                    }

                    prevItemWidth = Object(Snap("#" + item).select('rect').getBBox()).width;

                    Snap("#" + item).undrag();
                    document.getElementById(item).removeEventListener(this.eventType, selectItem);
                    document.getElementById(item).removeEventListener('mousedown', selectItem);
                    
                    itemGroup.append(Snap("#" + item));
                    jQuery("#" + item).data("self", this);
                    if(itemArray.length-1===i){
                        this.move(item, new MXGameCommon.Types.Coordinate(left + (mixedCardValuesForGrouping.mixedCardLeftOffsets[1] * ((i + 1) - cnt)), top), animationType, animationDuration, () => { }, afterAnimation);
                    }else{
                        this.move(item, new MXGameCommon.Types.Coordinate(left + (mixedCardValuesForGrouping.mixedCardLeftOffsets[1] * ((i + 1) - cnt)), top), animationType, animationDuration, () => { });
                    }
                    this.setSelectedItemArray([]);
                });
                itemGroup.attr("cardLeftPadding", totalLeftPadding);
            }
            
            /** This method is used to group array elements
              * @param {Array}  itemArray   
              * @param {string}  highestItem
              * @param {string}  itemGroupId
              * @param {class}  animationType - Card amimation Class.
              * @param {number}  animationDuration
              * @param {number}  cardLeftPadding
              * @param {any}  selectItem
              */
            itemGroupArray:Array<any>;
            group(itemArray: Array<any>, highestItem: string, itemGroupId: string, animationType: Interfaces.AnimationType, animationDuration: number, cardLeftPadding: number, selectItem: any, afterAnimation?:any, arrLength?:number, currCount?:number) {
                let highestItemInst = Snap("#" + highestItem);
                let itemGroup = Object(Snap("#" + itemGroupId));
                this.itemGroupArray.push(itemGroup);
                var bb: any = highestItemInst.getBBox();
                let left: number = bb.x;
                let top: number = bb.y;
                let highestItemBBox: any = highestItemInst.select('rect').getBBox();
                let totalLeftPadding = 0;
                bb.x > jQuery(this.stageInstance).width() - bb.x ? bb.x = bb.x - bb.width + 100 : "";
                this.setCordinates(highestItem, bb.x, bb.y);
                itemArray.forEach((item: string, i: number) => {
                    //for dropshadow
                    jQuery("#" + item).find("filter").addClass(this.hide);
                    jQuery(jQuery("#" + item).children()[1]).children().filter(".card_filter").attr("style", "display:none!important");

                    if (highestItemBBox.width > Object(Snap("#" + item).select('rect').getBBox()).width) {
                        if (this.isDecimal){
                            left = bb.x;
                        } else {
                            left = bb.x + (highestItemBBox.width - Object(Snap("#" + item).select('rect').getBBox()).width);
                        }
                    }

                    Snap("#" + item).undrag();
                    document.getElementById(item).removeEventListener(this.eventType, selectItem);
                    document.getElementById(item).removeEventListener('mousedown', selectItem);
                    
                    itemGroup.append(Snap("#" + item));
                    jQuery("#" + item).data("self", this);
                    if(itemArray.length-1===i){
                        this.move(item, new MXGameCommon.Types.Coordinate(left + (cardLeftPadding * (i + 1)), top), animationType, animationDuration, () => { },afterAnimation,arrLength,currCount);
                    }else{
                        this.move(item, new MXGameCommon.Types.Coordinate(left + (cardLeftPadding * (i + 1)), top), animationType, animationDuration, () => { },arrLength,currCount);
                    }
                    if (this.isDecimal){
                        totalLeftPadding -= cardLeftPadding;
                    }else{
                        totalLeftPadding += cardLeftPadding;
                    }
                    //we stop the cleaning of selected item for creating one istance
                    //of all the items
                    this.setSelectedItemArray([]);
                });

                //for dropshadow
                let rectwidth = jQuery(jQuery("#" + itemGroupId).children()[0]).find(".card_filter").attr("width");
                this.isDecimal ? jQuery(jQuery("#" + itemGroupId).children()[0]).find(".card_filter").attr("x", "-" + totalLeftPadding) : "";
                jQuery(jQuery("#" + itemGroupId).children()[0]).find(".card_filter").data("filtername", rectwidth).attr("width", parseInt(rectwidth) + totalLeftPadding);

                itemGroup.attr("cardLeftPadding", totalLeftPadding);
                this.isDecimal ? this.setCordinates(itemGroup.attr("id"), totalLeftPadding, 0) : "";
            }

            /**
             * This method is used to ungroup selected item.
             * @param {string}  groupId
             * @param {any}  groupItems
             * @param {number}  startLeftPosition
             * @param {number}  startTopPosition
             * @param {string}  stageId
             * @param {class}  animationType - Card amimation Class.
             * @param {number}  animationDuration
             * @param {number} spacing - gap between the cards.
             */
            ungroup(groupId: string, groupItems: any, startLeftPosition: number, startTopPosition: number, stageId: string, animationType: MXGameCommon.Interfaces.AnimationType, animationDuration: number, spacing: number, afterAnimation?:any, arrLength?:number, currLength?:number) {
                let _gap = spacing;
                let _leftPos = startLeftPosition;
                let item = Snap("#" + groupId);
                let top: number;
                let isWidthExceeding: boolean = false;
                let tempWidth: number = 0;
                let iePaddingWidth: number = 0;
                let ieExtraPaddingWidth: number = 0;

                let tempSelectedItems: Array<string> = [];
                
                 let firstCardWidth= 0,secondCardWidth=0;
                //for dropshadow
                var rectWidth = jQuery("#" + groupItems[0]).find(".card_filter").data("filtername");
                if(rectWidth === undefined){
                    rectWidth = JSON.parse(jQuery("#" + groupItems[0]).attr('data'));
                    rectWidth = rectWidth.width;
                }
                jQuery("#" + groupItems[0]).find(".card_filter").attr("width", rectWidth).attr("x", "0");
                for (var index = 0; index < groupItems.length; index++) {
                    //for dropshadow
                    jQuery("#" + groupItems[index]).find("filter").removeClass(this.hide);
                    jQuery(jQuery("#" + groupItems[index]).children()[1]).children().filter(".card_filter").removeAttr("style")

                    let tempItem: any;
                    tempItem = Snap("#" + groupItems[index]);
                    tempSelectedItems.push(groupItems[index]);
                    let bb: any;
                    if(index == 5){
                        spacing += 20;
                        if(groupItems[index].indexOf("unit") !== -1)
                        startTopPosition += 40;
                    }else{
                        spacing = _gap;
                    }
                    if (index > 0) {
                        tempItem = Snap("#" + groupItems[index - 1]);
                        bb = tempItem.getBBox();
                        let cardWidth = jQuery("#" + groupItems[index - 1]).find('rect').attr("width");
                        tempWidth = tempWidth + parseInt(cardWidth) + spacing;
                    }

                    this.drag(groupItems[index], { left: jQuery("#" + stageId).width(), top: jQuery("#" + stageId).height() }, false);
                    this.setCordinates(groupItems[index], startLeftPosition, startTopPosition);


                    let tempFirstItem = Snap("#" + groupItems[0]);
                    let firstItem: any;
                    firstItem = tempFirstItem.getBBox();
                    firstItem.x < 1 ? (this.isBrowserIE ? iePaddingWidth = 80 : iePaddingWidth = 40) : iePaddingWidth = 0;
                    firstItem.x < 1 ? ieExtraPaddingWidth = 40 : ieExtraPaddingWidth = 0;
                    if(this.isMixed || this.isWhole){
                        if(index===0){
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition + iePaddingWidth + ieExtraPaddingWidth, startTopPosition), animationType, animationDuration, () => { }, arrLength, currLength);
                        }else if(groupItems.length-1===index){
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition + tempWidth + iePaddingWidth + ieExtraPaddingWidth, startTopPosition), animationType, animationDuration, () => { }, afterAnimation, arrLength, currLength);
                        }else{
                            if(index == 5 && groupItems[index].indexOf("unit") !== -1){
                                startLeftPosition = _leftPos;
                                tempWidth = 0;
                            }
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition + tempWidth + iePaddingWidth + ieExtraPaddingWidth, startTopPosition), animationType, animationDuration, () => { }, arrLength, currLength);
                        }
                    }else{
                       
                         if(index===0){
                            let cardWidth = jQuery("#" + groupItems[groupItems.length-1]).find('rect').attr("width");
                            firstCardWidth = firstCardWidth + parseInt(cardWidth) + spacing;
                            
                            if(groupItems.length == 3){
                                cardWidth = jQuery("#" + groupItems[groupItems.length-2]).find('rect').attr("width");
                                secondCardWidth = secondCardWidth + parseInt(cardWidth) + spacing;
                            }
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition + firstCardWidth + secondCardWidth + iePaddingWidth + ieExtraPaddingWidth, startTopPosition), animationType, animationDuration, () => { }, arrLength, currLength);
                         }else if(groupItems.length-1!==index){
                            let cardWidth = jQuery("#" + groupItems[index]).find('rect').attr("width");
                            secondCardWidth = secondCardWidth + parseInt(cardWidth) + spacing;
                            console.log('groupItems[index]',groupItems[index]);
                            console.log('index',index);
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition + firstCardWidth + iePaddingWidth + ieExtraPaddingWidth, startTopPosition), animationType, animationDuration, () => { }, arrLength, currLength);
                        }else{
                            console.log('top',top = jQuery("#" + stageId).width() ,'',jQuery("#" + stageId).height(),'startTopPosition',startTopPosition);
                            this.move(groupItems[index], new MXGameCommon.Types.Coordinate(startLeftPosition, startTopPosition), animationType, animationDuration, () => { }, afterAnimation,arrLength, currLength);
                           // this.drag(groupItems[index], { left: jQuery("#" + stageId).width(), top: jQuery("#" + stageId).height() }, false);
                        }
                    }
                    jQuery("#" + groupItems[index]).data("isGrouped", false);
                }
                this.setSelectedItemArray([]);
                this.deselectAllItems(this.getSelectedItemArray(), "selected");
                this.deselectAllItems(this.getSelectedItemArray(), "selected-operations");
                this.selectAllGroupItems(tempSelectedItems, "selected");
                jQuery('.group-holder').each(function(index,elem){
                    var content = jQuery.trim(jQuery('#'+elem.id).html());
                    if(content === ''){
                        jQuery('#'+elem.id).remove();
                    }
                });
            }

            /**
             * This function is used to clear selection of elements.
             * @param {Array}  tempSelectedItems - array of selected items
             */
            clearAllSelection(tempSelectedItems: any) {
               // this.setSelectedItemArray([]);
                this.deselectAllItems(this.getSelectedItemArray(), "selected");
                this.deselectAllItems(this.getSelectedItemArray(), "selected-operations");
                this.selectAllGroupItems(tempSelectedItems, "selected");
            }       
            
            /**
             * This function is used to sort array items
             * @param {any}  items
             * @param {boolean}  isAccending 
             */
            sortItem(items: any, isAccending: boolean) {
                let sorted: any;
                if (isAccending){
                    sorted = Object.keys(items).sort(function(a, b) { return items[a] - items[b] })
                }else{
                    sorted = Object.keys(items).sort(function(a, b) { return items[b] - items[a] })
		}
                return sorted;
            }
            handleError() {
            }
        }
    }
}