import { Injectable } from "@angular/core";

/**
 * @author indecomm
 * @license Copyright HMH
 */

/**
 * <<<<<<<<<<<>Description<>>>>>>>>>>>
 * Local Connection Service (local.connect.service)
 * This namespace completely cover the localConnect between the parant and child app in same page.
 * Post and Fire are the two type of interation is present over here.
 * For Documetation please follow the link => 
 */
export namespace LocalConnectService{

    export interface ILocalConnect{
        register(id:string):void;
        verify(id:string):boolean;
        send(id:string, obj:any):void;
        receive(id:string, callback?:Function):void;

        load(id:string, callback:Function):void;
        trigger(id:string, obj:any):void;
    }

    export class LocalConnect implements ILocalConnect{
        constructor(){}

        register(id:string){
            if(id){
                Object(window)[id] = null;
            }else{
                console.error('Send Proper Id');
            }
        }

        verify(id:string){
            var windowObj = Object(window);
            if(windowObj.parent[id]===undefined){
                return false;
            }else{
                return true;
            }
        }

        send(id:string, obj:any){
            if(id){
                Object(window)[id] = obj;
            }else{
                console.error('Send Proper Id');
            }
        }

        receive(id:string, callback?:Function){
            var obj:any;
            var windowObj = Object(window);
            var cycle:any;
            var count:number = 0;
            if(id){
                cycle = setInterval(function(){
                    count++;
                    if(windowObj && windowObj.parent && windowObj.parent[id]){
                        clearInterval(cycle);
                        obj = windowObj.parent[id];
                        callback.call(null, obj);
                    }else if(count>100){
                        clearInterval(cycle);
                        obj = null;
                        callback.call(null, obj);
                    }else{
                        obj = undefined;
                    }
                },100);
            }else{
                console.error('Send Proper Id');
            }
        }

        load(id:string, callback:Function){
            if(id){
                Object(window)[id] = callback;
            }else{
                console.error('Send Proper Id');
            }
        }

        trigger(id:string, obj:any){
            var windowObj = Object(window);
            var callback:any;
            if(id){
                if(windowObj && windowObj.parent && windowObj.parent[id]){
                    callback = windowObj.parent[id];
                }else{
                    callback = null;
                }
            }else{
                console.error('Send Proper Id');
            }
            if(callback && typeof callback==='function'){
                callback.call(null, obj);
            }
        }
    }
}