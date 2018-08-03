/**
 * @author indecomm
 * @license Copyright HMH
 */

/**
 * <<<<<<<<<<<>Description<>>>>>>>>>>>
 * Data Persistence Service (dp.service)
 * This namespace completely cover the data persistance.
 * Two type of data persitace are used here.
 * 1. Annotation Service as improved as Custom Annotion Service. (HMH provided api to save data in server)
 * 2. Browser Storage (Localstorage, SessionStorage) HTML5 API.
 * This service allows you to save a data to cas server and browser storage for recover the last session or level of the Web Application.
 * ver: 1.2 (last updated on 24-05-2017)
 */


/**
 * decalration of cas
 * @var cas
 */
declare var cas:any;

/**
 * Represents namespace DPService
 * @namespace DPService
 */
export namespace DPService{
    /**
     * Represents interface ICustomAnnotationService
     * @interface ICustomAnnotationService
     */
    export interface ICustomAnnotationService{
        initCAS(obj:any, callback:Function):void;
        getUserDetail(callback:Function):void;
        setUserDetail(cookieName:string, callback:Function):void;
        getAllData():void;
        retrieveDataFromCASStorage(storageId:string, callback:Function):void;
        storeDataInCASStorage(getData:string, storageId:string, callback?:Function):void;
        deleteById(id:number):void;
    }
    /**
     * Represents interface IBrowserStorageService
     * @interface IBrowserStorageService
     */
    export interface IBrowserStorageService{
        initBSS(obj:any):void;
        retrieveDatafromBrowserStorage(storageId:string, storageType:string):string;
        storeDataInBrowserStorage(storageType:string, storageId:string, objString:string, callback?:Function):void;
        deleteDataFromBrowserStorage(storageType:string, storageId:string):void;
    }
    /**
     * Represents interface IDataPersistence
     * @interface IDataPersistence
     */
    export interface IDataPersistence{
        initDP(appAbbrevName:string, obj:any):void;
        retrieveData(storageId:string, obj:any, callback:Function):void;
        storeData(obj:any):void;
        deleteData():void;
        start(obj?:any):void;
    }
    /**
     * Represents the standalone method for split object as timestamp and data.
     * @method splitDataAndTimestamp
     * @param {any} obj
     */
    function splitDataAndTimestamp(obj:any):any{
        var data:string;
        var timeStamp:string;
        if(obj && obj==='string'){
            obj = JSON.parse(obj);
            data = obj.data;
            timeStamp = obj.timeStamp;
            return {data, timeStamp};
        }else{
            console.warn('Data Invalid, Not able to split as data and timestamp');
            return null;
        }
    }
    /**
     * Represents the standalone method for join the data and timestamp to single object.
     * @method joinDataAndTimestamp
     * @param {any} data
     * @param {any} timeStamp
     */
    function joinDataAndTimestamp(data:any,timeStamp:any):any{
        var dataAndTimeStamp:any = {};
        dataAndTimeStamp.data = data;
        dataAndTimeStamp.timeStamp = timeStamp;
        return dataAndTimeStamp;
    }
    /**
     * Represents the standalone method for convertion of object to string.
     * @method convertObjectToString
     * @param {any} obj
     * @return {string} str
     */
    function convertObjectToString(obj:any):string{
        var str = JSON.stringify(obj);
        return str;
    }
    /**
     * Represents standalone method for convertion of string to object.
     * @method convertStringToObject
     * @param {string} str
     * @return {object} obj
     */
    function convertStringToObject(str:string):any{
        var isValidJsonString = validJSONString(str);
        (!isValidJsonString)?console.error('StringJson is invalid'):null;
        var obj = (isValidJsonString)?JSON.parse(str):{};
        return obj;
    }
    /**
     * Represents standalone method to take current date and parse to complete integer.
     * @method parseDate
     * @return {number} currentTime
     */
    function parseDate():number{
        var currentTime:any = new Date();
        currentTime = Date.parse(currentTime);
        return currentTime;
    }
    /**
     * Represents standalone method to delet all cookies.
     * @method deleteAllCookies
     */
    function deleteAllCookies(){
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
    /**
     * Represents standalone method to get cookie data by name.
     * @method getCookieByName
     * @param {string} name
     * @return {any}
     */
    function getCookieByName(name:string):any{
        //deleteAllCookies();
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if(parts.length === 2){
            return parts.pop().split(";").shift();
        }else{
            return null;
        }
    }
    /**
     * Represents standalone method to get the user details from the token string.
     * @method tokenToUserDetail
     * @param {string} token
     * @return {any} user detail as object
     */
    function tokenToUserDetail(token:string):any{
        var encryptedString;
        if(typeof token==='string' && token.indexOf('.')!==-1){
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            encryptedString = base64;
        }else if(typeof token==='string'){
            encryptedString = token;
        }else{
            console.error('some thing wrong with token');
        }
        var object = JSON.parse(window.atob(encryptedString));
        var userName = object['sub'].replace("=", "/");
        userName = userName.split(",")[0];
        userName = userName.split("/");
        if(userName.length>0){
            userName = userName[1];
        }else{
            console.warn('check logic of userName split from object');
        }
        userName = userName.split(' ')[0];
        var userId = object['sub'].replace("=", "/").split(",");
        if(userId.length>0){
            userId = userId[1].split("=");
            if(userId.length>0){
                userId = userId[1];
            }else{
                console.warn('check logic of userName split from object');
            }
        }else{
            console.warn('check logic of userName split from object');
        }
        var userMode = object["http://www.imsglobal.org/imspurl/lis/v1/vocab/person"][0];
        userMode = userMode.replace('[','').replace(']','');
        return {userName:userName,userId:userId,userMode:userMode}
    }
    /**
     * Represents the standalone method for identify the server environment.
     * @method identifyServer
     * @param {string} url
     */
    export function identifyServer(url:string):string{
        var server:string = 'local';
        if(url && typeof url==='string'){
            url.indexOf('lectora')!==-1?server = 'lectora':
                url.indexOf('review-cert')!==-1?server = 'review-cert':
                    url.indexOf('localhost:5555')!==-1?server = 'localhost:5555':
                        url.indexOf('localhost')!==-1?server = 'localhost':
            server = 'new';
        }else{
            console.error('url is invalid');
            server = undefined;
        }
        return server;
    }
    /**
     * Represents the validation of JSON Object
     * @method validJson
     * @param {any} json
     * @return {boolean}
     */
    export function validJSONString(jsonStr:any):boolean{
		try{
			JSON.parse(jsonStr);
			return true;
		}catch(e){
			return false;
		}
	}
    /**
     * Represents standalone method to parameters as object from the URL
     * @method getUrlParam
     * @param {string} url
     * @return {any}
     */
    export function getUrlParam(url:string, getSplitChar?:string):any{
        var splitChar:string = (getSplitChar && typeof getSplitChar==='string' && getSplitChar!=='')?getSplitChar:'#';
        var query:string = String(url);
        if(query.indexOf(splitChar)!==-1){
            query = query.substr(query.indexOf(splitChar) + 1);
            var result:any = {};
            query.split("&").forEach(function(part){
                var item:any = part.split("=");
                result[item[0]] = decodeURIComponent(item[1]);
            });
            return result;
        }else{
            return null;
        }
    }
    /**
     * Represents standalone method to identify the Browser IE with version
     * @method detectIE
     * @return {any}
     */
    export function detectIE():any {
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
    /**
     * Represents the class of Custom Annotation service
     * @class CustomAnnotationService
     */
    export class CustomAnnotationService implements ICustomAnnotationService{
        /**
         * To save the annotation identification number(id created by api)
         */
        annotationId:number = 0;
        /**
         * To save the uniqueId to identify the data.(isbn)
         */
        contentId:string = '';
        /**
         * To save the type of annotation.(gameGuid)
         */
        objectId:string = '';
        /**
         * To save the type of annotation.(4 for dr-dailyrouteine)
         */
        typeId:number = 0;
        /**
         * To save the grade.(grade-gk,g1,g2,g3,g4,g5,g6,g7)
         */
        l0:string = '';
        /**
         * To store data for CAS
         */
        casDataObj:any;
        /**
         * To store the heavydata validation boolean
         */
        hd:boolean;
        /**
         * To store the data replace option as boolean
         */
        private casDataOverWrite:boolean;
        /**
         * To store the store validation boolean
         */
        private dontAllowToSaveInCAS:boolean = false;
        /**
         * To store the casInitiation status
         */
        private casInitiated:boolean = false;
        /**
         * To store the casAvailable status
         */
        private casAvailable:boolean = false;
        /**
         * To store the casFailure status
         */
        private casFailed:boolean = false;
        /**
         * To store the cas Object
         */
        private cas:any;
        /**
         * @constructor
         */
        constructor(){}
        /**
         * Represents the initial method of CAS
         * @method initCAS
         * @param {any} obj
         * @param {Function} callback
         */
        initCAS(obj:any,callback:Function){
            /**
             * To Store this Scope to thiS variable
             */
            var thiS:any = this;
            /**
             * To store timer event
             */
            var clock:any;
            /**
             * To store count of loop happened in timer
             */
            var count:number;
            /**
             * To store data from the parameter
             */
            var data:any;
            /**
             * If the obj is not undefined and havind a property data means, then
             */
            if(obj && obj.data){
                /**
                 * store the parameter's data to data variable.
                 */
                data = JSON.parse(JSON.stringify(obj.data));
                /**
                 * If not,
                 */
            }else{
                /**
                 * assign the data as empty object.
                 */
                data = {};
            }
            /**
             * If obj is available and its prop dataOverWrite type is object means, then
             */
            if(obj && typeof obj.dataOverWrite==='boolean'){
                /**
                 * Set the object
                 */
                this.casDataOverWrite = obj.dataOverWrite;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the object as empty
                 */
                this.casDataOverWrite = obj.dataOverWrite = false;
            }
            /**
             * If obj is available and its prop contentId type is null means, then
             */
            if(obj && obj.contentId===null){
                /**
                 * Set the contentId
                 */
                this.contentId = obj.isbn;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the contentId as empty
                 */
                this.contentId = obj.contentId = '';
            }
            /**
             * If obj is available and its prop objectId type is null means, then
             */
            if(obj && obj.objectId===null){
                /**
                 * Set the objectId
                 */
                this.objectId = obj.objectId = 'gameGuid';
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the objectId
                 */
                this.objectId = obj.objectId;
            }
            /**
             * If obj is available and its prop typeId type is null means, then
             */
            if(obj && obj.typeId===null){
                /**
                 * Set the typeId is 0
                 */
                this.typeId = obj.typeId = 4;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the typeId
                 */
                this.typeId = obj.typeId;
            }
            /**
             * If obj is available and its prop l0 type is null means, then
             */
            if(obj && obj.l0===null){
                /**
                 * Set the l0 is grade
                 */
                this.l0 = obj.l0 = 'grade';
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the l0
                 */
                this.l0 = obj.l0;
            }
            /**
             * Store the data to the casDataObj
             */
            this.casDataObj = data;
            /**
             * If cas not equal to undefined
             */
            if(cas !== undefined){
                if(!thiS.casInitiated && !thiS.casAvailable && !thiS.casFailed){
                    /**
                     * derives the cas as new object
                     */
                    this.cas = new cas();
                    /**
                     * Initialise cas
                     */
                    this.cas.init({
                        success:function(res:any){
                            thiS.casAvailable = true;
                            callback.call(null, res);
                        },fail:function(res:any){
                            thiS.casFailed = true;
                            callback.call(null, res);
                        }
                    });
                    thiS.casInitiated = true;
                }else{
                    if(thiS.casAvailable){
                        callback.call(null, 'success');
                    }else if(thiS.casFailed){
                        callback.call(null, 'fail');
                    }else{
                        console.warn('You try to request new annotaion data before cas available');
                        var counter:number = 0;
                        var casAvailCheckTimer:any = setInterval(function(){
                            counter++;
                            if(thiS.casAvailable){
                                clearInterval(casAvailCheckTimer);
                                callback.call(null, 'success');
                            }else if(thiS.casFailed){
                                clearInterval(casAvailCheckTimer);
                                callback.call(null, 'fail');
                            }else if(counter>100){
                                clearInterval(casAvailCheckTimer);
                                callback.call(null, 'fail');
                            }
                        },100);
                    }
                }
            }else{
                console.warn('cas is undefined');
            }
        }
        /**
         * Represents the getting of user detail.
         * @method getUserDetail
         * @param {Function} callback
         */
        getUserDetail(callback:Function){
            /**
             * Represents the get user detail from cas.
             * @method cas.getUserInfo
             * @param {Object} data, success
             */
            this.cas.getUserInfo({
                data:{},
                success: function(res:any){
                    var tokenString = res.RESULT;
                    var userInfo:any = {};
                    userInfo = tokenToUserDetail(tokenString);
                    callback.call(null, userInfo);
                }
            });
        }
        /**
         * Represents the setting of user detail.
         * @method setUserDetail
         * @param {string} cookieName
         * @param {Function} callback
         */
        setUserDetail(cookieName:string, callback:Function){
            /**
             * Represents the set user detail for cas.
             * @method cas.setUserInfo
             * @param {Object} data, success
             */
            this.cas.setUserInfo({
                data:{cookieName:cookieName},
                success: function(res:any){
                    callback.call(null, res);
                }
            });
        }
        /**
         * Represents the fetch of all data from CAS belongs to default KEY 'MX2018'.
         * @method getAllData.
         */
        getAllData(){
            /**
             * Fetch all relevent data
             */
            this.cas.fetch({success:function(res:any){ console.log(res) }});
        }
        /**
         * Represents the submit data to CAS.
         * @method storeDataInCASStorage
         * @param {string} storageId
         * @param {string} getData 
         */
        storeDataInCASStorage(getData:string, storageId:string, callback?:Function){
            /**
             * Define 'this' in a local variable.
             */
            var thiS = this;
            /**
             * Create empty object.
             */
            var obj:any = {};
            /**
             * Store get-data to body_text property
             */
            obj.body_text = String(getData);
            /**
             * If annotation id not undefined and greater than 0 and also the dontAllowToSaveInCAS be false means, then
             */
            if(this.annotationId && this.annotationId>0 && !this.dontAllowToSaveInCAS){
                /**
                 * Set annotation id to the obj's property annotation_id
                 */
                obj.annotation_id = this.annotationId;
                /**
                 * If only dontAllowToSaveInCAS be false means, then
                 */
            }else if(!this.dontAllowToSaveInCAS){
                /**
                 * Set cs_StorageId as obj's property in data
                 */
                obj.data = storageId;
                /**
                 * Set contentId as obj's property in content_id
                 */
                //obj.content_id = this.contentId;
                /**
                 * Set objectId as obj's property in object_id
                 */
                //obj.object_id = this.objectId;
                /**
                 * Set typeId as obj's property in type_id
                 */
                obj.type_id = this.typeId;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * alert the error
                 */
                console.error('saving data to CAS is blocked due to duplicate unique id existense');
                /**
                 * call the call back with error result if callback available means, then
                 */
                if(callback){
                    callback.call(thiS,'error');
                }
                /**
                 * return from the function
                 */
                return;
            }
            if(this.hd){
                obj.fileName = storageId+'_action.json';
                obj.fileString = obj.body_text;
                obj.body_text = '';
                this.cas.upload({
                    data: obj,
                    success: function(res:any){
                        ////console.info("Stored in cas is success", res);
                        if(callback){
                            callback.call(thiS, res);
                        }
                    },
                    fail: function(res:any){
                        console.error("Stored in cas is failed", res);
                        if(callback){
                            callback.call(thiS, res);
                        }
                    }
                });
            }else{
                /**
                 * Call cas to set the data
                 * @method cas.set
                 * @param {Object} data, success, fail
                 */
                this.cas.set({
                    /**
                     * data is the parameter of annotation id or unique id
                     */
                    data: obj,
                    /**
                     * success callback
                     */
                    success: function(res:any){
                        if(res.ACTION === 'created'){
                            thiS.annotationId = res.RESULT.annotation_id;
                            ////console.info('Stored in cas = ',res.ACTION);
                        }else{
                            ////console.info('Stored in cas = ',res.ACTION);
                        }
                        if(callback){
                            callback.call(thiS, res);
                        }
                    },
                    /**
                     * fail callback
                     */
                    fail: function(res:any){
                        console.error("Stored in cas is failed", res);
                        if(callback){
                            callback.call(thiS, res);
                        }
                    }
                });
            }
        }
        private getLargeDataById(annotationId:number, callback:Function){
            var thiSSSS:any = this;
            this.cas.download({
                data:{
                    annotation_id: annotationId
                },
                success:function(res:any){
                    ////console.info('File downloaded Successfully',res);
                    callback.call(thiSSSS, res);
                },fail:function(res:any){
                    console.info('File failed to download',res);
                    callback.call(thiSSSS, res);
                }
            });
        }
        /**
         * Represents retriving of data from CAS
         * @method retrieveDataFromCASStorage
         * @param {string} storageId
         * @param {Function} callback
         */
        retrieveDataFromCASStorage(storageId:string, callback:Function){
            /**
             * Define 'this' in a local variable.
             */
            var thiSS = this;
            if(thiSS.hd){
                /**
                 * Represents the retrieve data method.
                 * @method cas.get
                 * @param {Object} data, success, fail
                 */
                this.cas.get({
                    /**
                     * Set appUniqueId in 'data'
                     */
                    data: {data: storageId},
                    /**
                     * Success callback
                     */
                    success: function(res:any):any{
                        var resultData:any = thiSS.manipulateResult(res, storageId);
                        if(resultData && typeof resultData.dataCount==='number' && (resultData.dataCount===0 || resultData.dataCount===1) && thiSS.casDataOverWrite){
                            //console.log('A');
                            var overWriteData = convertObjectToString(joinDataAndTimestamp(thiSS.casDataObj,parseDate()));
                            thiSS.storeDataInCASStorage(overWriteData, storageId, function(res:any){
                                //console.log(res);
                                //console.log(overWriteData);
                                resultData = thiSS.manipulateResult(res, storageId);
                                callback.call(thiSS, overWriteData);
                                ////This code will help to identify the data saved is correct or not.
                                /*thiSS.getLargeDataById(thiSS.annotationId, function(res){
                                    console.log(res);
                                    resultData = thiSS.manipulateResult(res, storageId);
                                    callback.call(thiSS, resultData.data);
                                    console.log(resultData.data);
                                });*/
                            });
                        }else if(resultData && typeof resultData.dataCount==='number' && resultData.dataCount===0){
                            //console.log('B');
                             thiSS.storeDataInCASStorage(resultData.data, storageId, function(res:any){
                                //console.log(res);
                                var dataToPass:string = resultData.data;
                                //console.log(resultData.data);
                                resultData = thiSS.manipulateResult(res, storageId);
                                //console.log(resultData.data);
                                callback.call(thiSS, dataToPass);
                                ////This code will help to identify the data saved is correct or not.
                                /*thiSS.getLargeDataById(thiSS.annotationId, function(res){
                                    console.log(res);
                                    resultData = thiSS.manipulateResult(res, storageId);
                                    callback.call(thiSS, resultData.data);
                                    console.log(resultData.data);
                                });*/
                            });
                        }else if(resultData && typeof resultData.dataCount==='number' && resultData.dataCount===1){
                            //console.log('C');
                            thiSS.getLargeDataById(thiSS.annotationId, function(res:any){
                                if(res && res.RESULT===null){
                                    var newData = convertObjectToString(joinDataAndTimestamp(thiSS.casDataObj,parseDate()));
                                    thiSS.storeDataInCASStorage(newData, storageId, function(res:any){
                                        //console.log(newData);
                                        resultData = thiSS.manipulateResult(res, storageId);
                                        callback.call(thiSS, newData);
                                        ////This code will help to identify the data saved is correct or not.
                                        /*thiSS.getLargeDataById(thiSS.annotationId, function(res){
                                            console.log(res);
                                            resultData = thiSS.manipulateResult(res, storageId);
                                            callback.call(thiSS, resultData.data);
                                            console.log(resultData.data);
                                        });*/
                                    });
                                }else{
                                    resultData = thiSS.manipulateResult(res, storageId);
                                    callback.call(thiSS, resultData.data);
                                }
                            });
                        }else{
                            //console.log('D');
                            callback.call(thiSS, resultData.data);
                        }
                    },
                    fail: function(res:any){
                        /**
                         * Set annotation Id is null
                         */
                        var resultData:any = thiSS.manipulateResult(res, storageId);
                        callback.call(thiSS, resultData.data);
                        console.error("retrieve data fron CAS is failure check result", '\nresult:',res);
                    }
                });
            }else{
                /**
                 * Represents the retrieve data method.
                 * @method cas.get
                 * @param {Object} data, success, fail
                 */
                this.cas.get({
                    /**
                     * Set appUniqueId in 'data'
                     */
                    data: {data: storageId},
                    /**
                     * Success callback
                     */
                    success: function(res:any){
                        var resultData:any = thiSS.manipulateResult(res, storageId);
                        if(resultData && typeof resultData.dataCount==='number' && (resultData.dataCount===0 || resultData.dataCount===1) && thiSS.casDataOverWrite){
                            //console.log('A');
                            var overWriteData = convertObjectToString(joinDataAndTimestamp(thiSS.casDataObj,parseDate()));
                            /**
                             * store the combined object string into cas
                             */
                            thiSS.storeDataInCASStorage(overWriteData, storageId, function(res:any){
                                resultData = thiSS.manipulateResult(res, storageId);
                                callback.call(thiSS, resultData.data);
                            });
                        }else if(resultData && typeof resultData.dataCount==='number' && resultData.dataCount===0){
                            //console.log('B');
                            /**
                             * store the combined object string into cas
                             */
                            thiSS.storeDataInCASStorage(resultData.data, storageId, function(res:any){
                                resultData = thiSS.manipulateResult(res, storageId);
                                callback.call(thiSS, resultData.data);
                            });
                        }else if(resultData && typeof resultData.dataCount==='number' && resultData.dataCount===1){
                            //console.log('C');
                            callback.call(thiSS, resultData.data);
                        }else{
                            //console.log('D');
                            callback.call(thiSS, resultData.data);
                        }
                        /**
                         * Fail callback
                         */
                    }, fail: function(res:any){
                        /**
                         * Set annotation Id is null
                         */
                        var resultData:any = thiSS.manipulateResult(res, storageId);
                        callback.call(thiSS, resultData.data);
                        console.error("retrieve data fron CAS is failure check result", '\nresult:',res);
                    }
                });
            }
        }
        /**
         * Represents the removal of data from cas by annotation_id
         * @method deleteById
         * @param {number} id
         */
        deleteById(id:number){
            /**
             * Represents the delete from cas method.
             * @method cas.delete
             * @param {Object} data, success, fail
             */
            this.cas.delete({
                /**
                 * Set annotation_id in 'data'
                 */
                data: {annotation_id: id},
                /**
                 * If the delete method success, then
                 */
                success: function(res:any){
                    console.log('Successfully deleted', res);
                },
                /**
                 * If the delete method fails, then
                 */
                fail: function(res:any){
                    console.log('Failed to delete', res);
                }
            });
        }
        /**
         * Represents the manipulation of result
         * @method manipulateResult
         * @param {any} result
         * @param {string} storageId
         */
        protected manipulateResult(result:any, storageId:string):any{
            /**
             * take data from casDataObj
             */
            var data:any = JSON.parse(JSON.stringify(this.casDataObj));
            /**
             * take current time
             */
            var timeStamp:any = parseDate();
            /**
             * combine data and time
             */
            var dataAndTimestampString:string = convertObjectToString(joinDataAndTimestamp(data, timeStamp));
            /**
             * If result is a object and the length attribute is number and it equals ro 0 means, then
             */
            if(result && result.ACTION && result.ACTION==='fetch' && result.RESULT && typeof result.RESULT==='object' && typeof result.RESULT.length==='number' && result.RESULT.length===0){
                ////console.warn('No data in cas');
                /**
                 * return the value as null
                 */
                return {dataCount:0, data:dataAndTimestampString};
                /**
                 * If result is a object and the length attribute is number and annotationId is number, then
                 */
            }else if(result && result.ACTION && (result.ACTION==='fetch' || result.ACTION==='created') && result.RESULT && typeof result.RESULT==='object' && result.RESULT.annotation_id && typeof result.RESULT.annotation_id==='number'){
                /**
                 * This is use to delete the immediate created annotation. it will helps in testing purpose
                 */
                ////this.deleteById(result.RESULT.annotation_id);
                /**
                 * store the annotationId in a variable.
                 */
                this.annotationId = result.RESULT.annotation_id;
                /**
                 * store the string object into the varaible
                 */
                var receivedDataAndTimestampString:string = result.RESULT.body_text;
                dataAndTimestampString = (receivedDataAndTimestampString.trim()!=='')?receivedDataAndTimestampString:dataAndTimestampString;
                /**
                 * return the string object
                 */
               return {dataCount:1, data:dataAndTimestampString};
               /**
                * If result is a object and the RESULT attribute is null means, then
                */
            }else if(result && result.ACTION && (result.ACTION==='updated' || result.ACTION==='fetch' || result.ACTION==='created') && result.RESULT && typeof result.RESULT==='object' && result.RESULT.annotation && result.RESULT.annotation.annotation_id && typeof result.RESULT.annotation.annotation_id==='number'){
                /**
                 * This is use to delete the immediate created annotation. it will helps in testing purpose
                 */
                ////this.deleteById(result.RESULT.annotation.annotation_id);
                /**
                 * store the annotationId in a variable.
                 */
                this.annotationId = result.RESULT.annotation.annotation_id;
                /**
                 * store the string object into the varaible
                 */
                var receivedDataAndTimestampString:string = result.RESULT.annotation.body_text;
                dataAndTimestampString = (receivedDataAndTimestampString.trim()!=='')?receivedDataAndTimestampString:dataAndTimestampString;
                /**
                 * return the string object
                 */
                return {dataCount:1, data:dataAndTimestampString};
                /**
                 * If result is a object and the RESULT attribute is null means, then
                 */
            }else if(result && result.ACTION && (result.ACTION==='fetch' || result.ACTION==='created') && result.RESULT && typeof result.RESULT==='object' && result.RESULT.fileString && typeof result.RESULT.fileString==='string'){
                /**
                 * store the string object into the varaible
                 */
                var receivedDataAndTimestampString:string = result.RESULT.fileString;
                dataAndTimestampString = (receivedDataAndTimestampString.trim()!=='')?receivedDataAndTimestampString:dataAndTimestampString;
                /**
                 * return the string object
                 */
                return {dataCount:1, data:dataAndTimestampString};
                /**
                 * If result is a object and the RESULT attribute is null means, then
                 */
            }else if(result && result.ACTION && (result.ACTION==='updated') && typeof result.RESULT==='object' && result.RESULT===null){
                /**
                 * return the value as null
                 */
                return {dataCount:0, data:dataAndTimestampString};
                /**
                 * If result is a object and the length attribute is number and annotationId is number, then
                 */
            }else{
                this.dontAllowToSaveInCAS = true;
                /**
                 * show error in case of issue with unique id.
                 */
                console.error('some error in CAS Data, it means multiple values stored in same unique id');
                var dataCount = 0;
                /**
                 * If result count is morethan 1, then
                 */
                if(result && result.RESULT && result.RESULT.length && result.RESULT.length>1){
                    /**
                     * Save the data count
                     */
                    dataCount = result.RESULT.length;
                    /**
                     * This is to delete all the duplicate id if exist.
                     * This is for testing purpose
                     */
                    /*for(var i=result.RESULT.length;i>1;i--){
                        console.log(result.RESULT[i-1].annotation_id);
                        this.deleteById(result.RESULT[i-1].annotation_id);
                    }*/
                    console.log('If you want to delete the duplicate data presence in same unique ID, please enable the previous for loop in case if you are developer, or else contact "/lional.arokiaraj@indecomm.net"/');
                }else{
                    console.error('Not able to delete multiple data, please check the result','\nresult :',result);
                }
                /**
                 * return data and timestamp as string object
                 */
                return {dataCount:dataCount, data:dataAndTimestampString};
            }
        }
    }
    /**
     * Represents the class of BrowserStorageService
     * @class BrowserStorageService
     * @extends CustomAnnotationService
     */
    export class BrowserStorageService extends CustomAnnotationService implements IBrowserStorageService{
        /**
         * To store the dat form browser storage
         */
        browerDataObj:any;
        /**
         * To store the data replace option as boolean
         */
        private browserDataOverWrite:boolean;
        /**
         * @constructor
         */
        constructor(){ super() }
        /**
         * Represets the Initialisation of Browser Storage Service
         * @method initBSS
         * @param {any} obj
         */
        initBSS(obj:any){
            /**
             * If obj is available and its prop dataOverWrite type is object means, then
             */
            if(obj && typeof obj.dataOverWrite==='boolean'){
                /**
                 * Set the object
                 */
                this.browserDataOverWrite = obj.dataOverWrite;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the object as empty
                 */
                this.browserDataOverWrite = obj.dataOverWrite = false;
            }
            /**
             * To store data
             */
            var data:any;
            /**
             * If data is available means, then
             */
            if(obj && obj.data){
                /**
                 * store it into loal variable.
                 */
                data = JSON.parse(JSON.stringify(obj.data));
                /**
                 * If not, then
                 */
            }else{
                /**
                 * store the empty Object in data
                 */
                data = {};
            }
            /**
             * store the browerData into browerDataObj
             */
            this.browerDataObj = JSON.parse(JSON.stringify(data));
        }
        /**
         * Represents the data retrieve from the CAS
         * @method retrieveDatafromBrowserStorage
         * @param storageId 
         * @param storageType 
         */
        retrieveDatafromBrowserStorage(storageId:string, storageType:string):string{
            /**
             * If data over-write is true means, then
             */
            if(this.browserDataOverWrite){
                /**
                 * Store browser dat to local variable
                 */
                var data = JSON.parse(JSON.stringify(this.browerDataObj));
                /**
                 * take current time
                 */
                var timeStamp = parseDate();
                /**
                 * combine time and data as String Object
                 */
                objString = convertObjectToString(joinDataAndTimestamp(data, timeStamp));
                /**
                 * Store the string object in browser Storage
                 */
                this.storeDataInBrowserStorage(storageType, storageId, objString);
            }
            /**
             * To store the data of browser storage
             */
            var objString:string;
            /**
             * If storage type is session means, then
             */
            if(storageType==='session'){
                /**
                 * get the data from browser sessionstorage
                 */
                objString = sessionStorage.getItem(storageId);
                /**
                 * Here you can clear the storage for testing purpose
                 */
                ////sessionStorage.clear();

            }else{
                /**
                 * get the data from browser localstorage
                 */
                objString = localStorage.getItem(storageId);
                /**
                 * Here you can clear the storage for testing purpose
                 */
                ////localStorage.clear();
            }
            /**
             * If the value is null means, then
             */
            if(objString===null){
                /**
                 * Store browser dat to local variable
                 */
                var data = JSON.parse(JSON.stringify(this.browerDataObj));
                /**
                 * take current time
                 */
                var timeStamp = parseDate();
                /**
                 * combine time and data as String Object
                 */
                objString = convertObjectToString(joinDataAndTimestamp(data, timeStamp));
                /**
                 * Store the string object in browser Storage
                 */
                this.storeDataInBrowserStorage(storageType, storageId, objString);
                /**
                 * return null
                 */
                return objString;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * return objectString
                 */
                return objString;
            }
        }
        /**
         * Represents the storing of data into browser storage
         * @method storeDataInBrowserStorage
         * @param {string} storageType
         * @param {string} storageId
         * @param {string} objString
         */
        storeDataInBrowserStorage(storageType:string, storageId:string, objString:string, callback?:Function){
            /**
             * If storage type is session means, then
             */
            if(storageType==='session'){
                /**
                 * store the data into session storage.
                 */
                sessionStorage.setItem(storageId, objString);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * store the data into local storage.
                 */
                localStorage.setItem(storageId, objString);
            }
            if(callback){
                callback.call(this,'browser');
            }
            ////console.info('Stored in brower\'s '+storageType+'Storage');
        }
        /**
         * Represents the deletion of data from browser storage
         * @method deleteDataFromBrowserStorage
         * @param {string} storageType 
         * @param {string} storageId 
         */
        deleteDataFromBrowserStorage(storageType:string, storageId:string){
            /**
             * If storage type is session means, then
             */
            if(storageType==='session'){
                /**
                 * empty the data in session storage.
                 */
                sessionStorage.setItem(storageId, "");
                /**
                 * If not, then
                 */
            }else{
                /**
                 * empty the data in local storage.
                 */
                localStorage.setItem(storageId, "");
            }
            ////console.info('Erased from brower\'s '+storageType+'Storage');
        }
    }
    /**
     * Represents class DataPersistence
     * @class DataPersistence
     * @extends BrowserStorageService
     */
    export class DataPersistence extends BrowserStorageService implements IDataPersistence{
        /**
         * To store the app short name
         */
        private appAbbrevName:string;
        /**
         * To store unique isbn
         */
        private isbn:string;
        /**
         * To store userId
         */
        private userId:string;
        /**
         * To store browserStorage option as boolean
         */
        private browserStorage:boolean;
        /**
         * To store casStorage option as boolean
         */
        private casStorage:boolean;
        /**
         * To store unique storage Id
         */
        private storageId:string;
        /**
         * To store browser storage type as string
         */
        private browserStorageType:string;
        /**
         * To store the data retrieved count
         */
        private dataDoneCount:number=0;
        /**
         * To store the browser's and cas's retrieved data
         */
        private browserAndCasObjString:any={};
        /**
         * To assign the callback of ready
         */
        private readyM:any;
        /**
         * To store the user is valid or not as string
         */
        private userIs:string;
        /**
         * To store the user's name
         */
        private userName:string;
        /**
         * To store the user's mode
         */
        private userMode:string;
        /**
         * To store the cas retrieved data
         */
        private casData:any;
        /**
         * To store the browser retrieved data
         */
        private browserData:any;
        /**
         * To store the updated data location
         */
        private updatedDataFrom:string;
        /**
         * To store the finalized data
         */
        private data:any;
        /**
         * To assign developer mode
         */
        private developer:boolean;
        /**
         * To default token
         */
        private token:string = 'JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJodHRwOi8vd3d3LmhtaGNvLmNvbSIsImlzcyI6Imh0dHBzOi8vbXktcmV2aWV3LWNlcnQuaHJ3LmNvbSIsIm5iZiI6MTQ3NDkwMTM4OCwiZXhwIjoxNTA2MDA1Mzg4LCJzdWIiOiJjbj1OQlNUVURFTlQyLHVpZD1OQlNUVURFTlQyLHVuaXF1ZUlkZW50aWZpZXI9TkJTVFVERU5UMixvPXVuZGVmaW5lZCxkYz11bmRlZmluZWQsc3Q9Z2EiLCJQbGF0Zm9ybUlkIjoiSE1PRiIsImh0dHA6Ly93d3cuaW1zZ2xvYmFsLm9yZy9pbXNwdXJsL2xpcy92MS92b2NhYi9wZXJzb24iOlsiW1N0dWRlbnRdIl19.3XUhyRQzQMLlIWKJTbosWDKrNzQ4qi7FV6kJDNLPcbM';
        /**
         * @constructor
         */
        constructor(){
            super();
        };
        /**
         * Represents the Initialization of the Data Persistence
         * @method initDP
         * @param {string} appAbbrevName 
         * @param {string} isbn 
         * @param {any} obj 
         */
        initDP(appAbbrevName:string, isbn:string, obj?:any){
            /**
             * If appShort name is available and its type is string means, then
             */
            if(appAbbrevName && typeof appAbbrevName==='string'){
                /**
                 * Set app abbrev name
                 */
                this.appAbbrevName = obj.appAbbrevName = appAbbrevName;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * alert in the console window
                 */
                console.error('Please provide \"appAbbrevName\" and \"isbn\" properly');
                return;
            }
            /**
             * If isbn name is available and its type is string means, then
             */
            if(isbn && typeof isbn==='string'){
                /**
                 * assign the isbn
                 */
                this.isbn = obj.isbn = isbn;
            }else{
                /**
                 * alert in the console window
                 */
                console.error('Please provide \"appAbbrevName\" and \"isbn\" properly');
                return;
            }
            /**
             * If obj is available and its prop hd or HD type is boolean means, then
             */
            if(obj && (typeof obj.hd==='boolean' || typeof obj.HD==='boolean')){
                /**
                 * Set the boolean value to hd
                 */
                this.hd = obj.hd;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * In case of undefined, set cas storage is true
                 */
                this.hd = obj.hd = false;
            }
            /**
             * If obj is available and its prop casStorage type is boolean means, then
             */
            if(obj && typeof obj.casStorage==='boolean'){
                /**
                 * Set the boolean value to casStorage
                 */
                this.casStorage = obj.casStorage;
                /**
                 * If If not, then
                 */
            }else{
                /**
                 * In case of undefined, set cas storage is true
                 */
                this.casStorage = obj.casStorage = true;
            }
            /**
             * If obj is availbale and its prop browserStorage type is boolean means, then
             */
            if(obj && typeof obj.browserStorage==='boolean'){
                /**
                 * Set boolean value to browserStorage
                 */
                this.browserStorage = obj.browserStorage;
                /**
                 * If the user is tom, then
                 */
            }else{
                /**
                 * In case of undefined, set browser storage is true
                 */
                this.browserStorage = obj.browserStorage = true;
            }
            /**
             * If obj is available and its prop browserStorageType is string means, then
             */
            if(obj && typeof obj.browserStorageType==='string'){
                /**
                 * If the string has word 'session' means, then
                 */
                if(obj.browserStorageType.indexOf('session')!==-1){
                    /**
                     * Set browser storage type is 'session'
                     */
                    this.browserStorageType = obj.browserStorageType = 'session';
                    /**
                     * If not, then
                     */
                }else{
                    /**
                     * Set browser storage type is 'local'
                     */
                    this.browserStorageType = obj.browserStorageType = 'local';
                }
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the browser storage type is 'local'
                 */
                this.browserStorageType = obj.browserStorageType = 'local';
            }
            /**
             * If obj is available and its prop ready type is function means, then
             */
            if(obj && typeof obj.ready==='function'){
                /**
                 * Set the callback
                 */
                this.readyM = obj.ready;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set call back as null
                 */
                this.readyM = obj.ready = null;
            }
            /**
             * If obj is available and its prop contentId type is string means, then
             */
            if(obj && typeof obj.contentId==='string'){
                /**
                 * Set the contentId
                 */
                this.contentId = obj.contentId;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set default value for contentId
                 */
                this.contentId = obj.contentId = null;
            }
            /**
             * If obj is available and its prop objectId type is string means, then
             */
            if(obj && typeof obj.objectId==='string'){
                /**
                 * Set the objectId
                 */
                this.objectId = obj.objectId;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set default value for objectId
                 */
                this.objectId = obj.objectId = null;
            }
            /**
             * If obj is available and its prop typeId type is number means, then
             */
            if(obj && typeof obj.typeId==='number'){
                /**
                 * Set the typeId
                 */
                this.typeId = obj.typeId;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set default value for typeId
                 */
                this.typeId = obj.typeId = null;
            }
            /**
             * If obj is available and its prop l0 type is string means, then
             */
            if(obj && typeof obj.l0==='string'){
                /**
                 * Set the l0
                 */
                this.l0 = obj.l0;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set default value for l0
                 */
                this.l0 = obj.l0 = null;
            }
            /**
             * If obj is available and its prop data available means, then
             */
            if(obj && obj.data){
                /**
                 * Set the object
                 */
                this.data = obj.data;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the object as empty
                 */
                this.data = obj.data = {};
            }
            /**
             * If obj is available and its prop developer type is boolean means, then
             */
            if(obj && obj.developer && typeof obj.developer==='boolean'){
                /**
                 * Set the object
                 */
                this.developer = obj.developer;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set the object as empty
                 */
                this.developer = obj.developer = false;
            }
            /**
             * run testto set token key for local testing
             */
            this.testRun();
            /**
             * Identify the user is valid or not
             */
            this.decideUserType();
            /**
             * If the user is valid means, then
             */
            if(this.userIs==='valid'){
                /**
                 * Create storage id
                 */
                this.storageId = this.appAbbrevName+'_'+this.isbn+'_'+this.userId;
                /**
                 * Retrieve the Data using storage id.
                 */
                this.retrieveData(this.storageId, obj, this.afterDataRetrieved);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set storage Id as null
                 */
                this.storageId = null;
                /**
                 * Start the App without data
                 */
                this.start();
            }
            console.log('storage Id =',this.storageId,'\ncas storage =',this.casStorage,'\nbrowser storage =',this.browserStorage,'\nbrowser storage type =',this.browserStorageType,'\nuserIs =',this.userIs);
        }
        /**
         * Represents the Test Environment or Testing over local
         * @method testRun
         */
        private testRun(){
            /**
             * get the url as string
             */
            var urlString = String(window.location.href);
            /**
             * check the Production Mode
             */
            var isProd = urlString.indexOf('thinkcentral')!==-1;
            /**
             * get the url parameters as object
             */
            var urlParam = getUrlParam(urlString);
            /**
             * If url param not null and have the prop mode as dr and production evn true means, then
             */
            if(urlParam && urlParam.mode && urlParam.mode==='dr' && isProd){
                console.log('app load for DR');
            /**
             * If url param not null and have the prop login as valid means, then
             */
            }else if(urlParam && urlParam.login && urlParam.login==='valid'){
                /**
                 * get user detail from default token
                 */
                var userInfo:any = {};
                userInfo = tokenToUserDetail(this.token);
                this.userId = userInfo.userId;
                this.userName = userInfo.userName;
                this.userMode = userInfo.userMode;
                console.info('app runing with user=valid mode');
                /**
                 * Set cas and browser storage true
                 */
                this.casStorage = this.browserStorage = true;
                /**
                 * If url param not null and have the prop bss and cas as true means, then
                 */
            }else if(urlParam && (urlParam.bss && (urlParam.bss==='true' || urlParam.bss===true)) && (urlParam.cas && (urlParam.cas==='true' || urlParam.cas===true))){
                /**
                 * Force the app with valid user name as tom&jerry
                 */
                this.userId = 'tomandjerry';
                /**
                 * Set cas and browser storage true
                 */
                this.casStorage = this.browserStorage = true;
                /**
                 * If url param not null and have the prop cas as true means, then
                 */
            }else if(urlParam && urlParam.bss && (urlParam.bss==='true' || urlParam.bss===true)){
                /**
                 * Force the app with valid user name as tom
                 */
                this.userId = 'tom';
                /**
                 * Set cas storage false
                 */
                this.casStorage = false;
                /**
                 * Set cas browser storage true
                 */
                this.browserStorage = true;
                /**
                 * If url param not null and have the prop cas as true means, then
                 */
            }else if(urlParam && urlParam.cas && (urlParam.cas==='true' || urlParam.cas===true)){
                /**
                 * Force the app with valid user name as jerry
                 */
                this.userId = 'jerry';
                /**
                 * Set cas storage true
                 */
                this.casStorage = true;
                /**
                 * Set cas browser storage false
                 */
                this.browserStorage = false;
                /**
                 * If url param not null and have the prop user as guest means, then
                 */
            }else if(urlParam && urlParam.login && urlParam.login==='guest'){
                /**
                 * Set cas and browser storage false
                 */
                this.casStorage = this.browserStorage = false;
                /**
                 * If not, then
                 */
            }else if(this.developer){
                /**
                 * get user detail from default token
                 */
                var userInfo:any = {};
                userInfo = tokenToUserDetail(this.token);
                this.userId = userInfo.userId;
                this.userName = userInfo.userName;
                this.userMode = userInfo.userMode;
                console.info('app runing in developer mode');
            }else{
                /**
                 * alert in console about the parameter
                 */
                console.info(   '\n\To Test with DataPersitance      pass urlParam as \"login=valid\"\n'+
                                'To Test without DataPersistance  pass urlParam as \"login=guest\"\n'+
                                'To Test with only BrowserStorage pass urlParam as \"bss=true\"\n'+
                                'To Test with only CASStorage     pass urlParam as \"cas=true\"');
            }
        }
        /**
         * Represents the Decision of User status
         * @method decideUserType
         */
        private decideUserType(){
            /**
             * get cookie by name
             */
            var cookieData:string = getCookieByName('Authn');
            /**
             * If cookie is string and not equal to empty string means, then
             */
            if(cookieData){
                /**
                 * get all userinfo from the cookie
                 */
                var userInfo:any = {};
                userInfo = tokenToUserDetail(cookieData);
                this.userId = userInfo.userId;
                this.userName = userInfo.userName;
                this.userMode = userInfo.userMode;
                /**
                 * Set the user as valid
                 */
                this.userIs = 'valid';
                /**
                 * If not, then
                 */
            }else if(this.userId){
                /**
                 * Set the user is invalid
                 */
                this.userIs = 'valid';
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set user is invalid
                 */
                this.userIs = 'invalid';
            }
        }
        /**
         * Represent sthe retrieve of data
         * @method retrieveData
         * @param {string} storageId 
         * @param {any} obj 
         * @param {Function} callback 
         */
        retrieveData(storageId:string, obj:any, callback:Function){
            /**
             * If browserStorage is true means, then
             */
            if(this.browserStorage){
                /**
                 * Initialise the Browser Storage
                 */
                this.initBSS(obj);
                /**
                 * Retrieve the browser stored data using storage id
                 */
                var browserData:any = this.retrieveDatafromBrowserStorage(storageId, obj.browserStorageType);
                /**
                 * Call the call back function
                 */
                callback.call(this, {data:browserData, givenBy:'browser'});
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Call the callback function
                 */
                callback.call(this, {data:null, givenBy:'browser'});
            }
            /**
             * If the casStorage is enabled means, then
             */
            if(this.casStorage){
                /**
                 * Set this in variable thiS
                 */
                let thiS = this;
                /**
                 * Initialize CAS
                 */
                this.initCAS(obj, function(res:any){
                    /**
                     * If respose is success means, then
                     */
                    if(res==='success'){
                        /**
                         * Get the UserDetails
                         */
                        ////thiS.getUserDetail(function(res:any){////another way to get user detail... under in progress
                            /**
                             * Set delay for 100 miliseconds
                             */
                            setTimeout(function(){
                                /**
                                 * Then Retrieve the Data from the CAS
                                 */
                                thiS.retrieveDataFromCASStorage(storageId,  function(res:any){
                                    /**
                                     * Assign the result into Cas Data
                                     */
                                    var casData:any = res;
                                    /**
                                     * Call the callback function
                                     */
                                    callback.call(thiS, {data:casData, givenBy:'cas'});
                                });
                             },100);
                        ////});
                        /**
                         * If not, then
                         */
                    }else{
                        /**
                         * Call the callback function
                         */
                        callback.call(thiS, {data:null, givenBy:'cas'});
                    }
                });
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Call the callback function
                 */
                callback.call(this, {data:null, givenBy:'cas'});
            }
        }
        /**
         * Represents the function need to call after data retrieved
         * @method afterDataRetrieved
         * @param {any} obj 
         */
        private afterDataRetrieved(obj:any){
            /**
             * Increment the data retrieved count
             */
            this.dataDoneCount++;
            /**
             * If the count is '1' and the provider is browser means, then
             */
            if(this.dataDoneCount===1 && obj.givenBy==='browser'){
                /**
                 * Store the data to the Object in brower property
                 */
                this.browserAndCasObjString.browserObjString = obj.data;
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Store the data to the Object in cAS property
                 */
                this.browserAndCasObjString.casObjString = obj.data;
                /**
                 * Start the App with Updated Data
                 */
                this.startWithUpdateData(this.browserAndCasObjString);
            }
        }
        /**
         * Represents the App start with Updated data
         * @method startWithUpdateData
         * @param {any} obj
         */
        private startWithUpdateData(obj:any){
            /**
             * declare local varibles
             */
            var browserDataAndTimestamp:any={};
            var casDataAndTimestamp:any={};
            var casTimestamp:any;
            var browserTimestamp:any;
            var casData:any;
            var browserData:any;

            /**
             * If browser data not equal to null means, then
             */
            if(obj.browserObjString!==null){
                /**
                 * Convert the string object to object and store in the variable
                 */
                browserDataAndTimestamp = convertStringToObject(obj.browserObjString);
                /**
                 * Store Browser Timestamp
                 */
                browserTimestamp = browserDataAndTimestamp.timeStamp;
                /**
                 * Store Browser Data
                 */
                browserData = browserDataAndTimestamp.data;
                /**
                 * Store Browser Data in class varible
                 */
                this.browserData = browserData;
                ////console.log('browserTimestamp =',browserTimestamp,'browserData =',browserData);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set Browser complete data and timestamp as null
                 */
                browserDataAndTimestamp = null;
            }
            /**
             * If cas data not equal to null means, then
             */
            if(obj.casObjString!==null){
                /**
                 * Convert the string object to object and store in the variable
                 */
                casDataAndTimestamp = convertStringToObject(obj.casObjString);
/**
                 * Store Cas Timestamp
                 */
                casTimestamp = casDataAndTimestamp.timeStamp;
                /**
                 * Store Cas Data
                 */
                casData = casDataAndTimestamp.data;
                /**
                 * Store Cas Data in class varible
                 */
                this.casData = casData;
                ////console.log('casTimestamp =',casTimestamp,'casData =',casData);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set Cas complete data and timestamp as null
                 */
                casDataAndTimestamp = null;
            }
            /**
             * If both browser data and cas data not equal to null means, then
             */
            if(browserDataAndTimestamp!==null && casDataAndTimestamp!==null){
                /**
                 * Get the Updated time
                 */
                var updatedTime = this.compareUpdatedTimeStamp(casDataAndTimestamp.timeStamp, browserDataAndTimestamp.timeStamp);
                console.info('updatedTime =',updatedTime);
                /**
                 * If updated time is cas means, then
                 */
                if(updatedTime==='cas'){
                    /**
                     * Start App with Cas Data
                     */
                    this.start(casData);
                    /**
                     * If updated time is browser or if the time of both cas and browser storage are same means, then
                     */
                }else if(updatedTime==='bwr' || updatedTime==='same'){
                    /**
                     * Start App with browser data
                     */
                    this.start(browserData);
                    /**
                     * If not, then 
                     */
                }else{
                    /**
                     * alert by warning!...
                     */
                    console.warn('No data found');
                }
                /**
                 * Store the updated data location
                 */
                this.updatedDataFrom = updatedTime;
                /**
                 * If only browser data not equal to null
                 */
            }else if(browserDataAndTimestamp!==null){
                /**
                 * Start the App by browser Data
                 */
                this.start(browserData);
                /**
                 * If only Cas data not equal to null
                 */
            }else if(casDataAndTimestamp!==null){
                /**
                 * Start the App by Cas Data
                 */
                this.start(casData);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Start App without Data
                 */
                this.start();
            }
        }
        /**
         * Represents the comparison of updated time.
         * @method compareUpdatedTimeStamp
         * @param {string} bwrtimeStamp
         * @param {string} casTimeStamp
         * @return {string} output
         */
        private compareUpdatedTimeStamp(casTimeStamp:any, bwrTimeStamp:any):string{
            /**
             * Assign the localstorage timestamp to lsDate
             */
            var bwrDate = new Date(bwrTimeStamp);
            /**
             * Assign the DataPersistence timestamp to dpDate
             */
            var casDate = new Date(casTimeStamp);
            /**
             * Check if the time are same
             */
            var same = bwrDate.getTime() === casDate.getTime();
            /**
             * Check if the time are not same
             */
            var notSame = bwrDate.getTime() !== casDate.getTime();
            /**
             * Check if the localstorage time stamp is greater
             */
            var bwrUpdated = bwrDate.getTime() > casDate.getTime();
            /**
             * Check if the DataPersistence time stamp is greater
             */
            var casUpdated = bwrDate.getTime() < casDate.getTime();
            /**
             * Assign out varable as empty string
             */
            var output = '';
            /**
             * If bwrtimeStamp and casTimeStamp are not equal to empty string means, then
             */
            if(bwrTimeStamp === '' && casTimeStamp !== ''){
                /**
                 * Assign output as 'dp'
                 */
                output = 'cas';
                /**
                 * If bwrtimeStamp not equal to empty string and casTimeStamp equal to empty string means, then
                 */
            }else if(bwrTimeStamp !== '' && casTimeStamp === ''){
                /**
                 * Assign output as 'ls'
                 */
                output = 'bwr';
                /**
                 * If bwrtimeStamp not equal to empty string and casTimeStamp not equal to empty string means, then
                 */
            }else if(bwrTimeStamp !== '' && casTimeStamp !== ''){
                /**
                 * Is the time stamp is same means, then
                 */
                if(same){
                    /**
                     * Assign  output as 'same'
                     */
                    output = 'same';
                    /**
                     * If the timestamp is not same
                     */
                }else if(notSame){
                    /**
                     * Check if the localstorage time is latest means, then
                     */
                    if(bwrUpdated){
                        /**
                         * Assign output as 'ls'
                         */
                        output = 'bwr';
                        /**
                         * Check if the DataPersistence time is latest means, then
                         */
                    }else if(casUpdated){
                        /**
                         * Assign output as 'dp'
                         */
                        output = 'cas';
                        /**
                         * If all above cases failed means, then
                         */
                    }else{
                        /**
                         * Assign output as 'comparison failure'
                         */
                        output = 'comparison failure';
                    }
                    /**
                     * If all above cases failed means, then
                     */
                }else{
                    console.log(bwrDate,casDate);
                }
            }else{
                /**
                 * Assign output as empty
                 */
                output = '';
            }
            /**
             * return output string
             */
            return output;
        }
        /**
         * Represents ready method
         * @method ready
         * @param {any} sendObj 
         */
        private ready(sendObj:any){
            /**
             * If ready available and type is function means, then
             */
            if(this.readyM && typeof this.readyM==='function'){
                /**
                 * call the callback ready
                 */
                this.readyM.call(this, sendObj);
                /**
                 * If not, then
                 */
            }else{
                /**
                 * Set ready as null
                 */
                this.readyM = null;
            }
        }
        /**
         * Represents the start method
         * @method start
         * @param {any} obj 
         */
        start(obj?:any){
            /**
             * If obj is available means, then
             */
            if(obj){
                /**
                 * Store the data
                 */
                this.storeData(obj);
                /**
                 * Set the data to class variable
                 */
                this.data = JSON.parse(JSON.stringify(obj));
                /**
                 * If not, then
                 */
            }else{
                /**
                 * alert as new session
                 */
                console.info('New Session');
                /**
                 * Set data as default data
                 */
                this.data = JSON.parse(JSON.stringify(this.data));
            }
            /**
             * Call method ready
             */
            this.ready(this);
        }
        /**
         * Represets the method StoreData
         * @methodstoreData
         * @param {any} obj 
         */
        storeData(obj:any, callback?:Function){
            /**
             * If cas storage is true and user is valid meanss, then
             */
            if(this.casStorage && this.userIs==='valid'){
                /**
                 * Store the data to CAS
                 */
                this.storeDataInCASStorage(convertObjectToString(joinDataAndTimestamp(obj,parseDate())), this.storageId, callback);
            }
            /**
             * If browser storage is true and user is valid means, then
             */
            if(this.browserStorage && this.userIs==='valid'){
                /**
                 * Store the data to Browser storage
                 */
                this.storeDataInBrowserStorage(this.browserStorageType,this.storageId,convertObjectToString(joinDataAndTimestamp(obj,parseDate())), callback);
            }
        }
        /**
         * Represents the method delete of data
         * @method deleteData
         */
        deleteData(){
            /**
             * If cas storage is true and user is valid meanss, then
             */
            if(this.casStorage && this.userIs==='valid'){
                /**
                 * Delete the data from CAS
                 */
                this.deleteById(this.annotationId);
            }
            /**
             * If browser storage is true and user is valid means, then
             */
            if(this.browserStorage && this.userIs==='valid'){
                /**
                 * Delete the data from Browser storage
                 */
                this.deleteDataFromBrowserStorage(this.browserStorageType,this.storageId);
            }
        }
    }
}