export var GLBObj:any = {}

declare var jQuery:any;

export namespace PDFService{
    export interface IDataOfPDF{
        grabData():any;
    }
    export interface IPagesOfPDF{
        getPages(data:any):any;
    }
    export class DataOfPDF implements IDataOfPDF{
        constructor(){
            jQuery.fn.hasHorizontalScrollBar = function() {
                if (this[0].clientWidth < this[0].scrollWidth) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        grabData(){
            var element:any = jQuery('#objectWindow').contents();
            var viewerContainerWidth:number  = element.find('#viewerContainer').width();
            var viewerContainerHeight:number = element.find('#viewerContainer').height();
            var viewerWidth:number  = element.find('#viewer').width();
            var viewerHeight:number = element.find('#viewer').height();
            var initialPageWidth:number = element.find('.page:first-child').width();
            var initialPageHeight:number = element.find('.page:first-child').height();
            var initialPageOffsetTop:number = element.find('.page:first-child').offset().top;
            var initialPageOffsetLeft:number = element.find('.page:first-child').offset().left;
            var scrollTop:number = element.find('#viewerContainer').scrollTop();
            var scrollLeft:number = element.find('#viewerContainer').scrollLeft();
            var offsetTop:number = element.find('#viewer').offset().top;
            var offsetLeft:number = element.find('#viewer').offset().left;
            var initialPageNumber:number = element.find('#pageNumber').val();
            var totalPageNumber:number = parseInt(element.find('#numPages').html().replace('of ',''));
            var startFromZero:boolean = false;
            var scaleValue:number = Number(element.find('#viewer').attr('scalevalue'));
            if(isNaN(totalPageNumber)){
                var totalPageNumberStr:string = element.find('#numPages').html();
                totalPageNumberStr = totalPageNumberStr.substring(totalPageNumberStr.indexOf('of'));
                totalPageNumberStr = totalPageNumberStr.replace('of ','').replace(')','');
                totalPageNumber = parseInt(totalPageNumberStr);
                startFromZero = true;
            }
            var zoomValue:string = element.find('#scaleSelect option:selected').text();

            var returnObj:any = {
                                    viewerContainerWidth:viewerContainerWidth,
                                    viewerContainerHeight:viewerContainerHeight,
                                    viewerWidth:viewerWidth,
                                    viewerHeight:viewerHeight,
                                    initialPageWidth:initialPageWidth,
                                    initialPageHeight:initialPageHeight,
                                    initialPageOffsetTop:initialPageOffsetTop,
                                    initialPageOffsetLeft:initialPageOffsetLeft,
                                    scrollTop:scrollTop,
                                    scrollLeft:scrollLeft,
                                    offsetTop:offsetTop,
                                    offsetLeft:offsetLeft,
                                    zoomValue:zoomValue,
                                    initialPageNumber:initialPageNumber,
                                    totalPageNumber:totalPageNumber,
                                    startFromZero:startFromZero,
                                    scaleValue:scaleValue
                                }
            return returnObj;
        }
        getScaleValue(){
            var element:any = jQuery('#objectWindow').contents();
            return Number(element.find('#viewer').attr('scalevalue'));
        }
        getRotateValue(){
            var element:any = jQuery('#objectWindow').contents();
            return Number(element.find('#viewer').attr('rotatevalue'));
        }
        hasScrollBar(idOrClass:string):boolean{
            var element:any = jQuery('#objectWindow').contents();
            if(element && element.find(idOrClass).hasHorizontalScrollBar()){
                return true;
            }else{
                return false;
            }
        }
    }
    export class PagesOfPDF implements IPagesOfPDF{
        constructor(){ }
        getPages(data:any):any{
            if(data && typeof data==='string'){
                if(data.indexOf('-')!==-1){
                    let start:any = parseInt(data.split('-')[0]);
                    let stop:any = parseInt(data.split('-')[1]);
                    let pages:any = [];
                    for(let i=start; (start>0 && start<stop && i<=stop);i++){
                        pages.push(i);
                    }
                    return pages;
                }else if(data.indexOf('|')!==-1){
                    let pages:any = data.split('|');
                    pages = pages.map(function(elm:any,index:any,array:any){
                        return parseInt(elm);
                    });
                    return pages;
                }else if(data.length===1){
                    let pages:any = [];
                    pages.push(parseInt(data));
                    return pages;
                }else{
                    console.error('passed param "pages='+data+'" is error');
                }
            }
        }
    }
}
